import type { AccessArgs, PayloadRequest } from 'payload'
import { describe, expect, it } from 'vitest'
import { authenticatedOr } from './authenticatedOr'

const publicSubset = { usageStatus: { equals: 'public-approved' } }
const read = authenticatedOr(publicSubset)
const readAs = (user: unknown) => read({ req: { user } as PayloadRequest } as AccessArgs)

describe('authenticatedOr', () => {
  it('lets team members read everything', () => {
    expect(readAs({ collection: 'users', id: 1 })).toBe(true)
  })

  it('gives MCP API keys the public subset, not team access', () => {
    expect(readAs({ collection: 'payload-mcp-api-keys', id: 1 })).toBe(publicSubset)
  })

  it('gives anonymous visitors the public subset', () => {
    expect(readAs(null)).toBe(publicSubset)
  })
})
