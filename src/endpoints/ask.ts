import { generateText } from 'ai'
import type { Endpoint } from 'payload'
import { ASK_MODEL_API_KEY_VAR, askModel } from '@/features/ask/model'
import { retrieveSources } from '@/features/ask/retrieve'

/**
 * Public RAG endpoint (mounted under /api by the Payload root config).
 *
 * MVP flow: keyword retrieval over the search-plugin index → grounded answer
 * from the model with the matched posts as the only allowed context. The model
 * is instructed to refuse when the sources don't cover the question, and we
 * skip the model call entirely when retrieval comes back empty — no tokens
 * spent inventing an answer.
 */

const MIN_QUESTION_LENGTH = 3
const MAX_QUESTION_LENGTH = 500

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

    const body = (await req.json?.().catch(() => null)) as Record<string, unknown> | null
    const question = typeof body?.question === 'string' ? body.question.trim() : ''

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
      return json({ answer: NO_SOURCES_ANSWER, sources: [] })
    }

    const sourcesBlock = sources
      .map(
        (source, i) =>
          `<source index="${i + 1}" title="${source.title}">\n${source.text}\n</source>`,
      )
      .join('\n\n')

    try {
      const { text, usage } = await generateText({
        model: askModel,
        system: SYSTEM_PROMPT,
        prompt: `<sources>\n${sourcesBlock}\n</sources>\n\nQuestion: ${question}`,
      })

      req.payload.logger.info({
        msg: 'ask answered',
        questionLength: question.length,
        sourceCount: sources.length,
        usage,
      })

      return json({
        answer: text,
        sources: sources.map(({ title, url }) => ({ title, url })),
      })
    } catch (err) {
      req.payload.logger.error({ msg: 'ask model call failed', err })
      return json({ error: 'Something went wrong answering that — try again shortly.' }, 502)
    }
  },
}

export const askPublicEndpoints: Endpoint[] = [ask]
