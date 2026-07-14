import { getPayload, type Payload, type PayloadRequest } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { askPublicEndpoints } from '@/endpoints/ask'
import { extractTerms, retrieveSources } from '@/features/ask/retrieve'
import config from '@/payload.config'

let payload: Payload
const originalApiKey = process.env.OPENAI_API_KEY

const askHandler = askPublicEndpoints[0].handler

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
      const sources = await retrieveSources(payload, 'zxqvbn flurbish grommetized')
      expect(sources).toEqual([])
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

    it('streams the canned no-sources answer without calling the model', async () => {
      // A fake key proves no model call happens: an OpenAI request would 401.
      process.env.OPENAI_API_KEY = 'sk-int-test-not-real'
      const res = await askHandler(
        makeReq({ messages: [userMessage('zxqvbn flurbish grommetized')] }),
      )
      expect(res.status).toBe(200)
      expect(res.headers.get('content-type')).toContain('text/event-stream')

      const streamText = await res.text()
      expect(streamText).toContain("couldn't find anything")
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
})
