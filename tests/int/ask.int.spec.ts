import { getPayload, type Payload, type PayloadRequest } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { askEndpoints } from '@/endpoints/ask'
import { markAskTurn } from '@/features/ask/questions'
import { extractTerms, retrieveSources } from '@/features/ask/retrieve'
import config from '@/payload.config'

let payload: Payload
const originalApiKey = process.env.OPENAI_API_KEY

const handler = (path: string, method = 'post') => {
  const endpoint = askEndpoints.find((e) => e.path === path && e.method === method)
  if (!endpoint) throw new Error(`No ${method} ${path} endpoint`)
  return endpoint.handler
}
const askHandler = handler('/ask')
const feedbackHandler = handler('/ask/feedback')
const reindexHandler = handler('/ask/reindex')

type UserTurn = { id: string; role: string; parts: { type: string; text: string }[] }

const userMessage = (text: string, role = 'user'): UserTurn => ({
  id: `msg-${Math.random().toString(36).slice(2)}`,
  role,
  parts: [{ type: 'text', text }],
})

/** Minimal PayloadRequest stand-in — just what the ask handler touches. */
function makeReq(body: unknown, ip = `ask-int-${Math.random().toString(36).slice(2)}`) {
  return {
    payload,
    headers: new Headers({ 'x-forwarded-for': ip }),
    json: async () => body,
  } as unknown as PayloadRequest
}

describe('Ask (RAG)', () => {
  beforeAll(async () => {
    payload = await getPayload({ config: await config })
  })

  afterAll(() => {
    if (originalApiKey === undefined) {
      delete process.env.OPENAI_API_KEY
    } else {
      process.env.OPENAI_API_KEY = originalApiKey
    }
  })

  describe('extractTerms', () => {
    it('drops stopwords and short words, dedupes, caps at 8 terms', () => {
      expect(extractTerms('What is the meaning of branding?')).toEqual(['meaning', 'branding'])
      expect(extractTerms('brand brand BRAND')).toEqual(['brand'])
      expect(extractTerms('an it of to')).toEqual([])
      expect(
        extractTerms('alpha bravo charlie delta echo foxtrot golf hotel india juliett'),
      ).toHaveLength(8)
    })
  })

  describe('retrieveSources', () => {
    it('returns no sources for terms that match nothing in the index', async () => {
      const retrieval = await retrieveSources(payload, 'zxqvbn flurbish grommetized')
      expect(retrieval).toEqual({ sources: [], path: 'none' })
    })
  })

  describe('POST /api/ask handler', () => {
    it('returns 503 when the model API key is not configured', async () => {
      delete process.env.OPENAI_API_KEY
      const res = await askHandler(makeReq({ messages: [userMessage('What do you do?')] }))
      expect(res.status).toBe(503)
    })

    it('rejects a conversation that does not end in a user message', async () => {
      process.env.OPENAI_API_KEY = 'sk-int-test-not-real'
      const res = await askHandler(makeReq({ messages: [userMessage('An answer.', 'assistant')] }))
      expect(res.status).toBe(400)
    })

    it('rejects questions outside the 3–500 char bounds', async () => {
      process.env.OPENAI_API_KEY = 'sk-int-test-not-real'
      const tooShort = await askHandler(makeReq({ messages: [userMessage('hi')] }))
      expect(tooShort.status).toBe(400)

      const tooLong = await askHandler(makeReq({ messages: [userMessage('x'.repeat(501))] }))
      expect(tooLong.status).toBe(400)
    })

    it('streams the no-answer handoff card without calling the model', async () => {
      // A fake key proves no model call happens: an OpenAI request would 401.
      process.env.OPENAI_API_KEY = 'sk-int-test-not-real'
      const res = await askHandler(
        makeReq({ messages: [userMessage('zxqvbn flurbish grommetized')] }),
      )
      expect(res.status).toBe(200)
      expect(res.headers.get('content-type')).toContain('text/event-stream')

      // The same `tool-handoff` part a model tool call produces: input first,
      // then the resolved card, and no text or sources around it.
      const streamText = await res.text()
      expect(streamText).toContain('"type":"tool-input-available"')
      expect(streamText).toContain('"toolName":"handoff"')
      expect(streamText).toContain('"type":"tool-output-available"')
      expect(streamText).toContain('"reason":"no_answer"')
      expect(streamText).toContain('"responseTime":')
      expect(streamText).not.toContain('text-delta')
      expect(streamText).not.toContain('source-url')
    })

    it('rate limits the 11th request in a minute from one IP', async () => {
      process.env.OPENAI_API_KEY = 'sk-int-test-not-real'
      const ip = 'ask-int-rate-limit-ip'
      let lastStatus = 0
      for (let i = 0; i < 11; i++) {
        const res = await askHandler(
          makeReq({ messages: [userMessage('zxqvbn flurbish grommetized')] }, ip),
        )
        lastStatus = res.status
      }
      expect(lastStatus).toBe(429)
    })
  })

  describe('POST /api/ask/feedback handler', () => {
    const ids = { id: 'chat-int-feedback', turn: 'msg-int-feedback' }

    it('rejects a body with nothing to record', async () => {
      const res = await feedbackHandler(makeReq({ ...ids, rating: 'sideways' }))
      expect(res.status).toBe(400)
    })

    it('is a quiet no-op for ids that match no row', async () => {
      const res = await feedbackHandler(makeReq({ id: 'nope', turn: '../etc', rating: 'up' }))
      expect(res.status).toBe(200)
    })

    it('keeps the first rating, takes its reason once, and only the intake can file a sent inquiry', async () => {
      const row = await payload.create({
        collection: 'ask-questions',
        overrideAccess: true,
        data: {
          question: 'Integration feedback question',
          status: 'new',
          outcome: 'answered',
          conversation: ids.id,
          turn: ids.turn,
        },
      })
      try {
        // The thumb posts before the reason is picked, as Rating.tsx does.
        await feedbackHandler(makeReq({ ...ids, rating: 'down' }))
        await feedbackHandler(makeReq({ ...ids, rating: 'down', reason: 'incomplete' }))
        await feedbackHandler(makeReq({ ...ids, rating: 'up', reason: 'wrong' }))
        await feedbackHandler(makeReq({ ...ids, handoff: 'inquiry_sent' }))
        const forged = await payload.findByID({ collection: 'ask-questions', id: row.id })
        expect(forged.handoff).toBeNull()
        await markAskTurn(
          payload,
          { conversation: ids.id, turn: ids.turn },
          { handoff: 'inquiry_sent' },
        )
        await feedbackHandler(makeReq({ ...ids, handoff: 'clicked' }))
        const after = await payload.findByID({ collection: 'ask-questions', id: row.id })
        expect(after.rating).toBe('down')
        expect(after.ratingReason).toBe('incomplete')
        expect(after.handoff).toBe('inquiry_sent')
      } finally {
        await payload.delete({ collection: 'ask-questions', id: row.id })
      }
    })

    it('has its own limiter budget, so taps never cost questions', async () => {
      process.env.OPENAI_API_KEY = 'sk-int-test-not-real'
      const ip = 'ask-int-feedback-rate-limit-ip'
      let lastStatus = 0
      for (let i = 0; i < 11; i++) {
        const res = await feedbackHandler(makeReq({ ...ids, rating: 'up' }, ip))
        lastStatus = res.status
      }
      expect(lastStatus).toBe(429)
      const question = await askHandler(makeReq({ messages: [userMessage('x'.repeat(501))] }, ip))
      expect(question.status).toBe(400)
    })
  })

  describe('POST /api/ask/reindex handler', () => {
    const withUser = (user: unknown) => ({ ...makeReq({}), user }) as unknown as PayloadRequest

    it('rejects anonymous callers', async () => {
      process.env.OPENAI_API_KEY = 'sk-int-test-not-real'
      const res = await reindexHandler(withUser(undefined))
      expect(res.status).toBe(401)
    })

    it('rejects MCP API-key users, which also arrive as req.user', async () => {
      process.env.OPENAI_API_KEY = 'sk-int-test-not-real'
      const res = await reindexHandler(withUser({ id: 1, collection: 'mcp-api-keys' }))
      expect(res.status).toBe(401)
    })

    it('returns 503 for a team member when the API key is not configured', async () => {
      delete process.env.OPENAI_API_KEY
      const res = await reindexHandler(withUser({ id: 1, collection: 'users' }))
      expect(res.status).toBe(503)
    })
  })
})
