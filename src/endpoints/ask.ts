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
import { ASK_MODEL_API_KEY_VAR, askModel } from '@/features/ask/model'
import { retrieveSources } from '@/features/ask/retrieve'

/**
 * Public RAG endpoint (mounted under /api by the Payload root config).
 *
 * Speaks the AI SDK UI-message-stream protocol so the widget drives it with
 * `useChat`: keyword retrieval over the search-plugin index → matched posts
 * streamed back as source-url parts, followed by a grounded answer from the
 * model with those posts as the only allowed context. The model is instructed
 * to refuse when the sources don't cover the question, and we skip the model
 * call entirely when retrieval comes back empty — no tokens spent inventing
 * an answer.
 */

const MIN_QUESTION_LENGTH = 3
const MAX_QUESTION_LENGTH = 500
const MAX_MESSAGES = 30

const NO_SOURCES_ANSWER =
  "I couldn't find anything on this site that answers that. Try the search page, or browse the latest posts."

const SYSTEM_PROMPT = `You answer questions for visitors of the Suits & Sandals website.
Rules:
- Answer ONLY from the provided sources. Never use outside knowledge.
- If the sources don't answer the question, say so plainly and suggest browsing the site.
- Be concise: a short paragraph, 150 words max.
- Mention which source(s) the answer came from by title.`

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
    if (!process.env[ASK_MODEL_API_KEY_VAR]) {
      req.payload.logger.error(`Ask endpoint disabled: ${ASK_MODEL_API_KEY_VAR} is not set.`)
      return json({ error: 'Ask is not configured on this site yet.' }, 503)
    }

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
    if (isRateLimited(ip)) {
      return json({ error: 'Too many questions — try again in a minute.' }, 429)
    }

    const body = (await req.json?.().catch(() => null)) as { messages?: unknown } | null
    const messages = Array.isArray(body?.messages) ? (body.messages as UIMessage[]) : []
    const lastMessage = messages.at(-1)

    if (messages.length > MAX_MESSAGES || lastMessage?.role !== 'user') {
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

    const sources = await retrieveSources(req.payload, question)

    if (sources.length === 0) {
      return staticAnswerResponse(NO_SOURCES_ANSWER)
    }

    const sourcesBlock = sources
      .map(
        (source, i) =>
          `<source index="${i + 1}" title="${source.title}">\n${source.text}\n</source>`,
      )
      .join('\n\n')

    const result = streamText({
      model: askModel,
      system: `${SYSTEM_PROMPT}\n\n<sources>\n${sourcesBlock}\n</sources>`,
      messages: await convertToModelMessages(messages),
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

export const askPublicEndpoints: Endpoint[] = [ask]
