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
import { backfillAskIndex, isBackfillRunning } from '@/features/ask/backfill'
import { ASK_MODEL_API_KEY_VAR, askModel } from '@/features/ask/model'
import { retrieveSources } from '@/features/ask/retrieve'

/**
 * Public RAG endpoint (mounted under /api by the Payload root config).
 *
 * Speaks the AI SDK UI-message-stream protocol so the widget drives it with
 * `useChat`: embedding retrieval over the content corpus → matched documents
 * streamed back as source-url parts, followed by a grounded answer from the
 * model with those documents as the only allowed context. The model answers
 * in the studio's voice, gives partial answers when the sources only half
 * cover a question, and never invents facts. Token discipline: a first-turn
 * question with no matching sources gets a canned answer with no model call;
 * only follow-up turns reach the model source-less (so "thanks" or "say that
 * again" stay conversational) and those run under a tight output cap.
 */

const MIN_QUESTION_LENGTH = 3
const MAX_QUESTION_LENGTH = 500
const MAX_MESSAGES = 30
/** Cap on the combined text of the whole transcript — the history is client-supplied. */
const MAX_TOTAL_CHARS = 8_000
/** Output budget per answer; includes gpt-5 reasoning tokens, so leave headroom over the ~120-word answer. */
const MAX_ANSWER_TOKENS = 1_200
/** Source-less follow-up turns are conversational only (a thanks, a rephrase), so cap them hard. */
const MAX_CHAT_ONLY_TOKENS = 400
/** Cap on the retrieval query built from the last two user turns (embedding tokens, not model tokens). */
const MAX_RETRIEVAL_QUERY_CHARS = 700

const NO_SOURCES_ANSWER =
  "I couldn't find anything on this site that answers that. Try the search page, or browse the latest posts."

const SYSTEM_PROMPT = `You are the Ask assistant on the Suits & Sandals website. Speak as the studio ("we") in a warm, direct, plain voice. You are talking with a prospective client or a curious visitor.

Grounding:
- Use only the sources below. Never invent facts, numbers, names, dates, or prices.
- Never mention "sources", "context", "documents", or that anything was "provided" to you. Do not cite titles inline; links are shown next to your answer.

How to answer:
- Lead with the most useful thing the sources say, in one or two sentences.
- If the sources answer only part of the question, give that part confidently, then say in one short sentence what we don't publish and the single best next step, naming the page path from the matching source's url. Never say "browse the site".
- If nothing relevant is in the sources, say so in one sentence and offer one next step. No apologies.
- Answer follow-ups in the flow of the conversation; do not restate earlier answers.
- Under 120 words. Plain text only: no markdown, no headers, no bullet lists unless the visitor asks for steps.`

const CHAT_ONLY_PROMPT = `You are the Ask assistant on the Suits & Sandals website, mid-conversation. Speak as the studio ("we") in a warm, direct, plain voice.

No site content matched this turn, so do not state any new facts about the studio, its work, people, or prices. Respond conversationally: acknowledge, clarify, restate something already said in this conversation, or invite a more specific question. One or two sentences, plain text.`

const json = (body: unknown, status = 200) => Response.json(body, { status })

/**
 * Fixed-window in-memory limiter. On serverless this is per warm instance, so
 * it's a cost fuse against naive abuse, not a hard guarantee — acceptable for
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

function messageText(message: UIMessage): string {
  return message.parts
    .filter((part): part is Extract<typeof part, { type: 'text' }> => part.type === 'text')
    .map((part) => part.text)
    .join('')
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
 * tokens), and a hard budget on total characters (only the last message has a
 * length check of its own).
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

    sanitized.push({ id: message.id, role: message.role, parts })
  }

  return sanitized
}

/** Streams a fixed answer through the UI-message protocol without a model call. */
function staticAnswerResponse(text: string): Response {
  const stream = createUIMessageStream({
    execute: ({ writer }) => {
      const id = generateId()
      writer.write({ type: 'start' })
      writer.write({ type: 'text-start', id })
      writer.write({ type: 'text-delta', id, delta: text })
      writer.write({ type: 'text-end', id })
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
      return json({ error: 'Too many questions — try again in a minute.' }, 429)
    }

    const body = (await req.json?.().catch(() => null)) as { messages?: unknown } | null
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

    // First turn with nothing to ground on: canned answer, no tokens spent.
    // Follow-ups still reach the model source-less so the conversation can
    // carry ("thanks", "can you say that more simply?").
    if (sources.length === 0 && !isFollowUp) {
      return staticAnswerResponse(NO_SOURCES_ANSWER)
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
      maxOutputTokens: sources.length > 0 ? MAX_ANSWER_TOKENS : MAX_CHAT_ONLY_TOKENS,
      // Extractive answers over provided sources don't need deep reasoning;
      // the default (medium) burns hidden reasoning tokens on every question.
      providerOptions: { openai: { reasoningEffort: 'low' } },
      onFinish: ({ usage }) => {
        req.payload.logger.info({
          msg: 'ask answered',
          questionLength: question.length,
          sourceCount: sources.length,
          usage,
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
        writer.merge(toUIMessageStream({ stream: result.fullStream, sendStart: false }))
      },
      onError: (err) => {
        req.payload.logger.error({ msg: 'ask model call failed', err })
        return 'Something went wrong answering that — try again shortly.'
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

export const askEndpoints: Endpoint[] = [ask, reindex]
