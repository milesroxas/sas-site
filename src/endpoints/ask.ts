import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  generateId,
  streamText,
  toUIMessageStream,
  type UIMessage,
} from 'ai'
import type { Endpoint, PayloadRequest } from 'payload'
import { backfillAskIndex, isBackfillRunning, readLastIndexRebuild } from '@/features/ask/backfill'
import {
  ASK_HANDOFF_STATES,
  type AskHandoff,
  type AskHandoffState,
  type AskUIMessage,
} from '@/features/ask/handoff'
import { askHandoffTool, resolveAskHandoff } from '@/features/ask/handoffTool'
import { askHistory } from '@/features/ask/history'
import { messageText } from '@/features/ask/messageText'
import { ASK_MODEL_API_KEY_VAR, askModel } from '@/features/ask/model'
import { askSystemPrompt, offersAskHandoff } from '@/features/ask/prompts'
import {
  type AskTurnRecord,
  askIdFrom,
  markAskTurn,
  pagePathFrom,
  recordAskQuestion,
} from '@/features/ask/questions'
import { retrieveSources } from '@/features/ask/retrieve'
import {
  isUsageConfigured,
  OPENAI_ADMIN_KEY_VAR,
  OpenAIAdminError,
  readUsageReport,
  refreshUsageReport,
} from '@/features/ask/usage'
import {
  ASK_MAX_MESSAGES,
  ASK_QUESTION_LENGTH,
  ASK_RATING_REASONS,
  ASK_RATINGS,
  type AskOutcome,
  askOutcome,
} from '@/features/ask/vocabulary'
import { isOption } from '@/shared/content/options'
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

/** Output budget per answer; includes gpt-5 reasoning tokens, so leave headroom over the ~120-word answer. */
const MAX_ANSWER_TOKENS = 1_200
/** Source-less follow-up turns are conversational only (a thanks, a rephrase), so cap them hard. */
const MAX_CHAT_ONLY_TOKENS = 400
/** Cap on the retrieval query built from the last two user turns (embedding tokens, not model tokens). */
const MAX_RETRIEVAL_QUERY_CHARS = 700

const json = (body: unknown, status = 200) => Response.json(body, { status })

/**
 * Fixed-window in-memory limiter, one budget per public route so feedback
 * taps never spend the question allowance. On serverless this is per warm
 * instance, so it's a cost fuse against naive abuse, not a hard guarantee;
 * acceptable for an MVP; move to a shared store if the endpoint ever draws
 * real traffic.
 */
const RATE_LIMIT = 10
const RATE_WINDOW_MS = 60_000
const hits = new Map<string, { count: number; windowStart: number }>()

function isRateLimited(req: PayloadRequest, route: string): boolean {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const key = `${route}:${ip}`
  const now = Date.now()
  const entry = hits.get(key)
  if (!entry || now - entry.windowStart >= RATE_WINDOW_MS) {
    hits.set(key, { count: 1, windowStart: now })
    return false
  }
  entry.count += 1
  return entry.count > RATE_LIMIT
}

const RATE_LIMITED = 'Too many questions, try again in a minute.'

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

    if (isRateLimited(req, 'ask')) return json({ error: RATE_LIMITED }, 429)

    // `id` is the AI SDK chat id and `pagePath` the page the composer sits on
    // (see useAskChat); both are kept only if well formed. `handoff` is where
    // the conversation stands with the team; an unknown value reads as none,
    // the state that changes nothing.
    const body = (await req.json?.().catch(() => null)) as {
      messages?: unknown
      id?: unknown
      pagePath?: unknown
      handoff?: unknown
    } | null
    const rawMessages = Array.isArray(body?.messages) ? (body.messages as UIMessage[]) : []
    const messages = rawMessages.length <= ASK_MAX_MESSAGES ? askHistory(rawMessages) : null
    const lastMessage = messages?.at(-1)
    const handoffState: AskHandoffState = ASK_HANDOFF_STATES.includes(
      body?.handoff as AskHandoffState,
    )
      ? (body?.handoff as AskHandoffState)
      : 'none'

    if (!messages || lastMessage?.role !== 'user') {
      return json({ error: 'Send a conversation ending in a user question.' }, 400)
    }

    const question = messageText(lastMessage).trim()
    if (question.length < ASK_QUESTION_LENGTH.min || question.length > ASK_QUESTION_LENGTH.max) {
      return json(
        {
          error: `Question must be between ${ASK_QUESTION_LENGTH.min} and ${ASK_QUESTION_LENGTH.max} characters.`,
        },
        400,
      )
    }

    const startedAt = Date.now()
    const conversation = askIdFrom(body?.id)
    const pagePath = pagePathFrom(body?.pagePath)
    const { sources, path: retrieval } = await retrieveSources(
      req.payload,
      retrievalQuery(messages, question),
    )
    const isFollowUp = messages.length > 1

    // One row and one event per turn, whichever callback closes it (a model
    // stream can end in a finish, an error, or the visitor's Stop).
    let recorded = false
    const record = (
      turn: Pick<
        AskTurnRecord,
        'answer' | 'outcome' | 'handoffReason' | 'inputTokens' | 'outputTokens'
      >,
    ) => {
      if (recorded) return
      recorded = true
      const latencyMs = Date.now() - startedAt
      recordAskQuestion(req, {
        question,
        turn: lastMessage.id,
        conversation,
        pagePath,
        followUp: isFollowUp,
        retrieval,
        sources,
        latencyMs,
        ...turn,
      })
      req.payload.logger.info({
        msg: 'ask answered',
        questionLength: question.length,
        sourceCount: sources.length,
        outcome: turn.outcome,
        handoffReason: turn.handoffReason,
        latencyMs,
      })
      captureServerEvent({
        headers: req.headers,
        fallbackDistinctId: `ask:${crypto.randomUUID()}`,
        event: 'ask_questioned',
        properties: {
          is_follow_up: isFollowUp,
          source_count: sources.length,
          question_length: question.length,
          handoff_reason: turn.handoffReason,
          outcome: turn.outcome,
          retrieval,
          latency_ms: latencyMs,
          page_path: pagePath,
        },
      })
    }

    // First turn with nothing to ground on: the handoff card, no tokens spent.
    // Follow-ups still reach the model source-less so the conversation can
    // carry ("thanks", "can you say that more simply?").
    if (sources.length === 0 && !isFollowUp) {
      record({
        answer: '',
        outcome: askOutcome({ grounded: false, handoffReason: 'no_answer' }),
        handoffReason: 'no_answer',
      })
      return handoffResponse(resolveAskHandoff(siteInfo, 'no_answer'))
    }

    const sourcesBlock = sources
      .map(
        (source, i) =>
          `<source index="${i + 1}" title="${attr(source.title)}" url="${attr(source.url)}">\n${source.text}\n</source>`,
      )
      .join('\n\n')

    // The prompt and the tool list agree: once the visitor has sent, the
    // tool is withheld and the prompt stops asking for it.
    const grounded = sources.length > 0
    const system = [
      askSystemPrompt({ grounded, handoff: handoffState }),
      grounded ? `<sources>\n${sourcesBlock}\n</sources>` : null,
    ]
      .filter(Boolean)
      .join('\n\n')

    const result = streamText({
      model: askModel,
      system,
      messages: await convertToModelMessages(messages),
      tools: offersAskHandoff(handoffState) ? { handoff: askHandoffTool(siteInfo) } : undefined,
      maxOutputTokens: sources.length > 0 ? MAX_ANSWER_TOKENS : MAX_CHAT_ONLY_TOKENS,
      // The visitor's Stop (and a dropped connection) aborts the model call,
      // so tokens stop with the reader and the turn is recorded as stopped.
      abortSignal: req.signal,
      // Extractive answers over provided sources don't need deep reasoning;
      // the default (medium) burns hidden reasoning tokens on every question.
      // `store: false`: OpenAI's Responses API otherwise keeps every exchange
      // for 30 days in the dashboard logs. Nothing here needs that: the client
      // resends the transcript each turn, and for reasoning models the SDK asks
      // for encrypted reasoning instead of server-side item references.
      providerOptions: { openai: { reasoningEffort: 'low', store: false } },
      onFinish: ({ text, totalUsage, staticToolCalls }) => {
        const handoffReason =
          staticToolCalls.find((call) => call.toolName === 'handoff')?.input.reason ?? null
        record({
          answer: text,
          outcome: askOutcome({ grounded, handoffReason }),
          handoffReason,
          inputTokens: totalUsage.inputTokens ?? null,
          outputTokens: totalUsage.outputTokens ?? null,
        })
      },
      onAbort: ({ steps }) => {
        record({
          answer: steps.map((step) => step.text).join(''),
          outcome: 'stopped',
          handoffReason: null,
        })
      },
      // Logged once, by the UI stream's onError below, which every error reaches.
      onError: () => record({ answer: '', outcome: 'error', handoffReason: null }),
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
        req.payload.logger.error({ msg: 'ask reply failed', err })
        return 'Something went wrong answering that. Try again shortly.'
      },
    })

    return createUIMessageStreamResponse({ stream })
  },
}

/**
 * Public: the visitor's word on a turn. A thumbs up or down (with a one-tap
 * reason), or the contact-page click; `inquiry_sent` is the intake's to
 * write, never a caller's. The row is found by the chat and message ids the
 * client already holds, so no row id ever reaches the browser; an unknown
 * pair is a quiet no-op. Its own limiter budget, so taps never cost questions.
 */
const feedback: Endpoint = {
  path: '/ask/feedback',
  method: 'post',
  handler: async (req) => {
    if (isRateLimited(req, 'feedback')) return json({ error: RATE_LIMITED }, 429)

    const body = (await req.json?.().catch(() => null)) as Record<string, unknown> | null
    const rating = isOption(ASK_RATINGS, body?.rating) ? body.rating : undefined
    const ratingReason =
      rating === 'down' && isOption(ASK_RATING_REASONS, body?.reason) ? body.reason : undefined
    const handoff = body?.handoff === 'clicked' ? 'clicked' : undefined
    if (!rating && !handoff) return json({ error: 'Nothing to record.' }, 400)

    const turn = await markAskTurn(
      req.payload,
      { conversation: body?.id, turn: body?.turn },
      { rating, ratingReason, handoff },
    )
    if (turn) captureAskFeedback(req, { rating, ratingReason, handoff, ...turn })
    return json({ ok: true })
  },
}

/** `ask_rated` for a rating, `ask_handoff_clicked` for the contact-page fallback; an inquiry is its own event. */
function captureAskFeedback(
  req: PayloadRequest,
  signal: {
    rating?: string
    ratingReason?: string
    handoff?: string
    outcome: AskOutcome | null
    sourceCount: number
  },
): void {
  const event = signal.rating
    ? 'ask_rated'
    : signal.handoff === 'clicked'
      ? 'ask_handoff_clicked'
      : null
  if (!event) return
  captureServerEvent({
    headers: req.headers,
    fallbackDistinctId: `ask:${crypto.randomUUID()}`,
    event,
    properties: {
      rating: signal.rating ?? null,
      reason: signal.ratingReason ?? null,
      outcome: signal.outcome,
      source_count: signal.sourceCount,
    },
  })
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

export const askEndpoints: Endpoint[] = [ask, feedback, reindex, indexStatus, usage, usageRefresh]
