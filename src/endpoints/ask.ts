import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  generateId,
  streamText,
  toUIMessageStream,
  type UIMessage,
} from 'ai'
import type { Endpoint } from 'payload'
import { backfillAskIndex, isBackfillRunning, readLastIndexRebuild } from '@/features/ask/backfill'
import type { AskHandoff, AskUIMessage } from '@/features/ask/handoff'
import { askHandoffTool, resolveAskHandoff } from '@/features/ask/handoffTool'
import { messageText } from '@/features/ask/messageText'
import { ASK_MODEL_API_KEY_VAR, askModel } from '@/features/ask/model'
import { recordAskQuestion } from '@/features/ask/questions'
import { retrieveSources } from '@/features/ask/retrieve'
import {
  isUsageConfigured,
  OPENAI_ADMIN_KEY_VAR,
  OpenAIAdminError,
  readUsageReport,
  refreshUsageReport,
} from '@/features/ask/usage'
import { captureServerEvent } from '@/utilities/posthog'

/**
 * Public RAG endpoint (mounted under /api by the Payload root config).
 *
 * Speaks the AI SDK UI-message-stream protocol so the widget drives it with
 * `useChat`: embedding retrieval over the content corpus → matched documents
 * streamed back as source-url parts, followed by a grounded answer from the
 * model with those documents as the only allowed context. The model answers
 * in the studio's voice, gives partial answers when the sources only half
 * cover a question, and never invents facts. When a person is the better next
 * step it calls the `handoff` tool, and the card it shows is worded in code
 * and filled from Site Info (src/features/ask/handoffTool.ts). Token
 * discipline: a first-turn question with no matching sources gets that card
 * (`no_answer`) with no model call; only follow-up turns reach the model
 * source-less (so "thanks" or "say that again" stay conversational) and those
 * run under a tight output cap.
 */

const MIN_QUESTION_LENGTH = 3
const MAX_QUESTION_LENGTH = 500
const MAX_MESSAGES = 30
/** Cap on the combined text of the whole transcript: the history is client-supplied. */
const MAX_TOTAL_CHARS = 8_000
/** Output budget per answer; includes gpt-5 reasoning tokens, so leave headroom over the ~120-word answer. */
const MAX_ANSWER_TOKENS = 1_200
/** Source-less follow-up turns are conversational only (a thanks, a rephrase), so cap them hard. */
const MAX_CHAT_ONLY_TOKENS = 400
/** Cap on the retrieval query built from the last two user turns (embedding tokens, not model tokens). */
const MAX_RETRIEVAL_QUERY_CHARS = 700

const SYSTEM_PROMPT = `You are the Ask assistant on the Suits & Sandals website. Speak as the studio ("we") in a warm, direct, plain voice. You are talking with a prospective client or a curious visitor.

Grounding:
- Use only the sources below. Never invent facts, numbers, names, dates, or prices.
- Never mention "sources", "context", "documents", or that anything was "provided" to you. Do not cite titles inline; links are shown next to your answer.

How to answer:
- Lead with the most useful thing the sources say, in one or two sentences.
- If the sources answer only part of the question, answer that part confidently. If the rest is something only a person can settle (see Reaching a person), call the handoff tool after your answer and leave the rest to the card: do not also say what we don't publish or name a next step. Otherwise say in one short sentence what we don't publish and name the page path from the matching source's url as the next step. Never say "browse the site".
- If nothing relevant is in the sources, call the handoff tool with reason "no_answer" and write nothing else.
- Answer follow-ups in the flow of the conversation; do not restate earlier answers.
- Under 120 words. Plain text only: no markdown, no headers, no bullet lists unless the visitor asks for steps. No em dashes: use a comma, colon, or period.

Reaching a person:
- The handoff tool shows a card under your reply where the visitor can send their question to the team: their name and email go straight to our inbox, and the card says when we reply. Use it only when a person is the best next step.
- Call it when the visitor asks what their own project would cost or how long it would take, or when we could start ("estimate"); wants to start or discuss a project with us ("project"); asks for a person, or for something only a person can answer ("person"); or shares an email address, phone number, or name ("contact_details").
- When there is nothing else to answer (a question only about price, timing, or availability, a request for a person, or shared contact details), the card is the whole reply: call the tool without writing anything.
- Never describe the card, its fields, or our reply time; the card says all of that.
- Never repeat an email address, phone number, or name back. Only the card passes anything to the team; this chat cannot.`

const CHAT_ONLY_PROMPT = `You are the Ask assistant on the Suits & Sandals website, mid-conversation. Speak as the studio ("we") in a warm, direct, plain voice.

No site content matched this turn, so do not state any new facts about the studio, its work, people, or prices. Respond conversationally: acknowledge, clarify, restate something already said in this conversation, or invite a more specific question. One or two sentences, plain text, no em dashes.

If the visitor wants a person, wants to start a project, asks what their own project would cost or when we could start, or shares an email address, phone number, or name, call the handoff tool with the matching reason instead, without describing the card it shows. Never repeat contact details back.`

const json = (body: unknown, status = 200) => Response.json(body, { status })

/**
 * Fixed-window in-memory limiter. On serverless this is per warm instance, so
 * it's a cost fuse against naive abuse, not a hard guarantee; acceptable for
 * an MVP; move to a shared store if the endpoint ever draws real traffic.
 */
const RATE_LIMIT = 10
const RATE_WINDOW_MS = 60_000
const hits = new Map<string, { count: number; windowStart: number }>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = hits.get(ip)
  if (!entry || now - entry.windowStart >= RATE_WINDOW_MS) {
    hits.set(ip, { count: 1, windowStart: now })
    return false
  }
  entry.count += 1
  return entry.count > RATE_LIMIT
}

/**
 * Retrieval query for a turn. Follow-ups like "what about for nonprofits?"
 * embed badly on their own, so the previous user turn is prepended: two
 * user turns, no model rewrite (embedding tokens are the only cost).
 */
function retrievalQuery(messages: UIMessage[], question: string): string {
  const previousUser = messages
    .slice(0, -1)
    .filter((message) => message.role === 'user')
    .at(-1)
  if (!previousUser) return question
  const previous = messageText(previousUser).trim()
  return `${previous}\n${question}`.slice(-MAX_RETRIEVAL_QUERY_CHARS)
}

/** Escapes the attribute values interpolated into the source tags. */
function attr(value: string): string {
  return value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;')
}

/**
 * The transcript comes straight from the client, so before it reaches the
 * model: only user/assistant roles (a forged system message would sit above
 * our grounding rules), only text parts (file/image parts would bill vision
 * tokens; a handoff card is a tool part, not something the model said), and a
 * hard budget on total characters (only the last message has a length check
 * of its own). A turn left with no text, such as a reply that was only a
 * handoff card, is dropped rather than sent as an empty message.
 */
function sanitizeMessages(messages: UIMessage[]): UIMessage[] | null {
  let totalChars = 0
  const sanitized: UIMessage[] = []

  for (const message of messages) {
    if (message.role !== 'user' && message.role !== 'assistant') return null
    if (!Array.isArray(message.parts)) return null

    const parts = message.parts.filter(
      (part): part is Extract<typeof part, { type: 'text' }> => part.type === 'text',
    )
    for (const part of parts) totalChars += part.text.length
    if (totalChars > MAX_TOTAL_CHARS) return null

    if (parts.length > 0) sanitized.push({ id: message.id, role: message.role, parts })
  }

  return sanitized
}

/**
 * Streams a handoff card as the whole reply, without a model call: the same
 * `tool-handoff` part the model's own tool call produces, so the client has
 * one way to render it.
 */
function handoffResponse(handoff: AskHandoff): Response {
  const stream = createUIMessageStream<AskUIMessage>({
    execute: ({ writer }) => {
      const toolCallId = generateId()
      writer.write({ type: 'start' })
      writer.write({
        type: 'tool-input-available',
        toolCallId,
        toolName: 'handoff',
        input: { reason: handoff.reason },
      })
      writer.write({ type: 'tool-output-available', toolCallId, output: handoff })
      writer.write({ type: 'finish' })
    },
  })
  return createUIMessageStreamResponse({ stream })
}

const ask: Endpoint = {
  path: '/ask',
  method: 'post',
  handler: async (req) => {
    // Site Info › Ask › Hide Ask removes every surface, this one included:
    // a hidden feature must not keep answering (and billing) for stale
    // clients or direct callers.
    const siteInfo = await req.payload.findGlobal({ slug: 'site-info', depth: 0 })
    if (siteInfo.ask?.hidden) {
      return json({ error: 'Ask is turned off on this site.' }, 404)
    }

    if (!process.env[ASK_MODEL_API_KEY_VAR]) {
      req.payload.logger.error(`Ask endpoint disabled: ${ASK_MODEL_API_KEY_VAR} is not set.`)
      return json({ error: 'Ask is not configured on this site yet.' }, 503)
    }

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
    if (isRateLimited(ip)) {
      return json({ error: 'Too many questions, try again in a minute.' }, 429)
    }

    // `id` is the AI SDK chat id and `pagePath` the page the composer sits on
    // (see useAskChat); both are only kept by `recordAskQuestion` if well formed.
    const body = (await req.json?.().catch(() => null)) as {
      messages?: unknown
      id?: unknown
      pagePath?: unknown
    } | null
    const rawMessages = Array.isArray(body?.messages) ? (body.messages as UIMessage[]) : []
    const messages = rawMessages.length <= MAX_MESSAGES ? sanitizeMessages(rawMessages) : null
    const lastMessage = messages?.at(-1)

    if (!messages || lastMessage?.role !== 'user') {
      return json({ error: 'Send a conversation ending in a user question.' }, 400)
    }

    const question = messageText(lastMessage).trim()
    if (question.length < MIN_QUESTION_LENGTH || question.length > MAX_QUESTION_LENGTH) {
      return json(
        {
          error: `Question must be between ${MIN_QUESTION_LENGTH} and ${MAX_QUESTION_LENGTH} characters.`,
        },
        400,
      )
    }

    const sources = await retrieveSources(req.payload, retrievalQuery(messages, question))
    const isFollowUp = messages.length > 1

    recordAskQuestion(req, {
      question,
      answered: sources.length > 0,
      followUp: isFollowUp,
      sourceCount: sources.length,
      pagePath: body?.pagePath,
      conversation: body?.id,
    })

    // First turn with nothing to ground on: the handoff card, no tokens spent.
    // Follow-ups still reach the model source-less so the conversation can
    // carry ("thanks", "can you say that more simply?").
    if (sources.length === 0 && !isFollowUp) {
      captureServerEvent({
        headers: req.headers,
        fallbackDistinctId: `ask:${crypto.randomUUID()}`,
        event: 'ask_questioned',
        properties: {
          is_follow_up: false,
          source_count: 0,
          question_length: question.length,
          handoff_reason: 'no_answer',
        },
      })
      return handoffResponse(resolveAskHandoff(siteInfo, 'no_answer'))
    }

    const sourcesBlock = sources
      .map(
        (source, i) =>
          `<source index="${i + 1}" title="${attr(source.title)}" url="${attr(source.url)}">\n${source.text}\n</source>`,
      )
      .join('\n\n')

    const system =
      sources.length > 0
        ? `${SYSTEM_PROMPT}\n\n<sources>\n${sourcesBlock}\n</sources>`
        : CHAT_ONLY_PROMPT

    const result = streamText({
      model: askModel,
      system,
      messages: await convertToModelMessages(messages),
      tools: { handoff: askHandoffTool(siteInfo) },
      maxOutputTokens: sources.length > 0 ? MAX_ANSWER_TOKENS : MAX_CHAT_ONLY_TOKENS,
      // Extractive answers over provided sources don't need deep reasoning;
      // the default (medium) burns hidden reasoning tokens on every question.
      // `store: false`: OpenAI's Responses API otherwise keeps every exchange
      // for 30 days in the dashboard logs. Nothing here needs that: the client
      // resends the transcript each turn, and for reasoning models the SDK asks
      // for encrypted reasoning instead of server-side item references.
      providerOptions: { openai: { reasoningEffort: 'low', store: false } },
      onFinish: ({ usage, staticToolCalls }) => {
        const handoffReason =
          staticToolCalls.find((call) => call.toolName === 'handoff')?.input.reason ?? null
        req.payload.logger.info({
          msg: 'ask answered',
          questionLength: question.length,
          sourceCount: sources.length,
          handoffReason,
          usage,
        })
        captureServerEvent({
          headers: req.headers,
          fallbackDistinctId: `ask:${crypto.randomUUID()}`,
          event: 'ask_questioned',
          properties: {
            is_follow_up: isFollowUp,
            source_count: sources.length,
            question_length: question.length,
            handoff_reason: handoffReason,
          },
        })
      },
    })

    const stream = createUIMessageStream({
      execute: ({ writer }) => {
        writer.write({ type: 'start' })
        for (const source of sources) {
          writer.write({
            type: 'source-url',
            sourceId: source.url,
            url: source.url,
            title: source.title,
          })
        }
        // The Ask UI renders text, sources, and the handoff card. Reasoning
        // parts would carry the encrypted reasoning blob to the browser and
        // back on every turn.
        writer.merge(
          toUIMessageStream({ stream: result.fullStream, sendStart: false, sendReasoning: false }),
        )
      },
      onError: (err) => {
        req.payload.logger.error({ msg: 'ask model call failed', err })
        return 'Something went wrong answering that. Try again shortly.'
      },
    })

    return createUIMessageStreamResponse({ stream })
  },
}

/**
 * Team-only: rebuilds the embedding index from every published document and
 * global, the same pass as `scripts/backfill-ask-index.ts`. Wired to the
 * "Rebuild index" panel in Site Info › Ask. Runs inline (the jobs cron fires
 * once a day, too slow for a button); unchanged chunks reuse their vectors so
 * a rebuild over a corpus that has not changed costs no embedding tokens.
 */
const reindex: Endpoint = {
  path: '/ask/reindex',
  method: 'post',
  handler: async (req) => {
    // `req.user` is also set for MCP API keys; only team members may rebuild.
    if (req.user?.collection !== 'users') return json({ error: 'Unauthorized' }, 401)

    if (!process.env[ASK_MODEL_API_KEY_VAR]) {
      return json(
        { error: `${ASK_MODEL_API_KEY_VAR} is not set, so nothing can be embedded.` },
        503,
      )
    }
    if (isBackfillRunning()) {
      return json({ error: 'A rebuild is already running. Try again in a minute.' }, 409)
    }

    const summary = await backfillAskIndex(req.payload)
    req.payload.logger.info({ msg: 'ask index rebuilt from admin', user: req.user.id, ...summary })
    return json(summary)
  },
}

/**
 * Team-only: when the Ask index was last rebuilt, for the "Rebuild index"
 * panel. Reads the summary the last pass stored; nothing is recomputed.
 */
const indexStatus: Endpoint = {
  path: '/ask/reindex',
  method: 'get',
  handler: async (req) => {
    if (req.user?.collection !== 'users') return json({ error: 'Unauthorized' }, 401)
    return json({ lastRebuild: await readLastIndexRebuild(req.payload) })
  },
}

/**
 * Team-only: the last OpenAI usage report someone refreshed, for the "Usage"
 * panel in Site Info › Ask. Served from KV, so opening the panel never calls
 * OpenAI; `report` is null until the first refresh.
 */
const usage: Endpoint = {
  path: '/ask/usage',
  method: 'get',
  handler: async (req) => {
    if (req.user?.collection !== 'users') return json({ error: 'Unauthorized' }, 401)
    return json({ configured: isUsageConfigured(), report: await readUsageReport(req.payload) })
  },
}

/**
 * Team-only: fetch a fresh usage report from OpenAI and store it. Only the
 * panel's Refresh button calls this; the Admin API allows 30 requests a
 * minute and each refresh spends three of them.
 */
const usageRefresh: Endpoint = {
  path: '/ask/usage',
  method: 'post',
  handler: async (req) => {
    if (req.user?.collection !== 'users') return json({ error: 'Unauthorized' }, 401)

    if (!isUsageConfigured()) {
      return json({ error: `${OPENAI_ADMIN_KEY_VAR} is not set.`, configured: false }, 503)
    }

    try {
      return json({ configured: true, report: await refreshUsageReport(req.payload) })
    } catch (err) {
      if (err instanceof OpenAIAdminError) {
        req.payload.logger.error({ msg: 'ask usage fetch failed', err })
        const hint =
          err.status === 401
            ? `OpenAI rejected the key. ${OPENAI_ADMIN_KEY_VAR} must be an Admin key (Settings › Organization › Admin keys), not a project key.`
            : err.message
        return json({ error: hint }, 502)
      }
      throw err
    }
  },
}

export const askEndpoints: Endpoint[] = [ask, reindex, indexStatus, usage, usageRefresh]
