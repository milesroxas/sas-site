import { describe, expect, it } from 'vitest'
import { MCP_INSTRUCTIONS, MCP_INSTRUCTIONS_LIMIT } from './mcp-instructions'

describe('MCP_INSTRUCTIONS', () => {
  it('fits in what Claude Code keeps, so no rule is cut off', () => {
    expect(MCP_INSTRUCTIONS.length).toBeLessThanOrEqual(MCP_INSTRUCTIONS_LIMIT)
  })

  it('keeps to the house style it asks for', () => {
    expect(MCP_INSTRUCTIONS).not.toContain('\u2014')
  })
})
