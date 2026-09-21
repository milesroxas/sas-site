import { describe, expect, it } from 'vitest'
import {
  assistantTexts,
  cleanPromptText,
  formatEntry,
  type JournalMeta,
  mergeUsage,
  parseEntries,
  promptsFromTranscript,
  resolveActive,
  sumUsage,
} from './lib'

const lines = (...rows: unknown[]) => rows.map((row) => JSON.stringify(row)).join('\n')

const assistant = (id: string, model: string, text: string, usage: Record<string, number>) => ({
  type: 'assistant',
  sessionId: 's1',
  timestamp: '2026-09-21T16:00:00.000Z',
  message: { id, model, usage, content: [{ type: 'text', text }] },
})

const usage = {
  input_tokens: 2,
  output_tokens: 10,
  cache_creation_input_tokens: 5,
  cache_read_input_tokens: 100,
}

describe('sumUsage', () => {
  it('counts an API message once however many lines repeat it', () => {
    const jsonl = lines(
      assistant('m1', 'claude-fable-5-1', 'a', usage),
      assistant('m1', 'claude-fable-5-1', 'b', usage),
      assistant('m2', 'claude-fable-5-1', 'c', usage),
    )
    expect(sumUsage(jsonl)).toEqual({
      'claude-fable-5-1': { input: 4, output: 20, cacheWrite: 10, cacheRead: 200, messages: 2 },
    })
  })

  it('keys a subagent on another model apart, and shares what it has seen across files', () => {
    const seen = new Set<string>()
    const main = sumUsage(lines(assistant('m1', 'claude-fable-5-1', 'a', usage)), seen)
    const sub = sumUsage(
      lines(
        assistant('m1', 'claude-fable-5-1', 'a', usage),
        assistant('m9', 'claude-haiku-4-5', 'x', usage),
      ),
      seen,
    )
    expect(Object.keys(mergeUsage(main, sub)).sort()).toEqual([
      'claude-fable-5-1',
      'claude-haiku-4-5',
    ])
    expect(main['claude-fable-5-1']?.messages).toBe(1)
  })

  it('skips synthetic messages and lines that are not JSON', () => {
    const jsonl = `${lines(assistant('m1', '<synthetic>', 'a', usage))}\nnot json`
    expect(sumUsage(jsonl)).toEqual({})
  })
})

describe('cleanPromptText', () => {
  it('reads a slash command back as it was typed', () => {
    const raw =
      '<command-message>typesafe:typesafe-ai</command-message>\n<command-name>/typesafe:typesafe-ai</command-name>\n<command-args>review my mcp</command-args>'
    expect(cleanPromptText(raw)).toBe('/typesafe:typesafe-ai review my mcp')
  })

  it('drops harness text that rides in user rows', () => {
    expect(cleanPromptText('<local-command-stdout>ok</local-command-stdout>')).toBeNull()
    expect(cleanPromptText('<system-reminder>x</system-reminder>')).toBeNull()
    expect(cleanPromptText('[Request interrupted by user]')).toBeNull()
    expect(cleanPromptText('   ')).toBeNull()
  })
})

describe('promptsFromTranscript', () => {
  const user = (extra: Record<string, unknown>, content: unknown) => ({
    type: 'user',
    sessionId: 's1',
    timestamp: '2026-09-21T16:00:00.000Z',
    promptId: 'p1',
    gitBranch: 'main',
    message: { content },
    ...extra,
  })

  it('keeps typed prompts, redacted, and nothing else', () => {
    const rows = promptsFromTranscript(
      lines(
        user({}, 'mail me at miles@example.com'),
        user({ isMeta: true, promptId: 'p2' }, [{ type: 'text', text: 'skill body' }]),
        user({ promptId: 'p3' }, [{ type: 'tool_result', content: 'output' }]),
        user({ isSidechain: true, promptId: 'p4' }, 'a subagent task'),
      ),
    )
    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({ id: 'p1', session: 's1', branch: 'main' })
    expect(rows[0]?.text).not.toContain('miles@example.com')
  })
})

describe('assistantTexts', () => {
  it('joins the text blocks of one message and leaves tool calls out', () => {
    const texts = assistantTexts(
      lines(
        assistant('m1', 'claude-fable-5-1', 'first', usage),
        {
          ...assistant('m1', 'claude-fable-5-1', '', usage),
          message: { id: 'm1', content: [{ type: 'tool_use' }] },
        },
        assistant('m1', 'claude-fable-5-1', 'second', usage),
      ),
    )
    expect(texts).toEqual([
      { id: 'm1', session: 's1', at: '2026-09-21T16:00:00.000Z', text: 'first\n\nsecond' },
    ])
  })
})

describe('resolveActive', () => {
  const meta = (slug: string, extra: Partial<JournalMeta>): JournalMeta => ({
    slug,
    title: slug,
    status: 'active',
    branches: ['main'],
    startedAt: '2026-09-01T00:00:00.000Z',
    ...extra,
  })

  it('is live only on its own branches, and only while active', () => {
    const metas = [meta('a', { branches: ['feature'] }), meta('b', { status: 'paused' })]
    expect(resolveActive(metas, 'main')).toBeNull()
    expect(resolveActive(metas, 'feature')?.slug).toBe('a')
    expect(resolveActive(metas, null)).toBeNull()
  })

  it('takes the newest when a branch has two', () => {
    const metas = [meta('old', {}), meta('new', { startedAt: '2026-09-20T00:00:00.000Z' })]
    expect(resolveActive(metas, 'main')?.slug).toBe('new')
  })
})

describe('entries', () => {
  it('round-trips through the journal format', () => {
    const journal = `# Lab journal: Demo\n\nIntro.\n${formatEntry({
      kind: 'decision',
      title: 'Prompts stay outside the repository',
      body: 'The repository is public.\n\nSo prompts go to the home directory.',
      at: new Date('2026-09-21T17:05:00.000Z'),
      session: 'abc',
      branch: 'main',
    })}${formatEntry({
      kind: 'measurement',
      title: 'tsx start | 164 ms',
      body: 'Native node was 52 ms.',
      at: new Date('2026-09-21T17:06:00.000Z'),
      session: null,
      branch: null,
    })}`
    expect(parseEntries(journal)).toEqual([
      {
        at: '2026-09-21 17:05 UTC',
        kind: 'decision',
        title: 'Prompts stay outside the repository',
        body: 'The repository is public.\n\nSo prompts go to the home directory.',
      },
      {
        at: '2026-09-21 17:06 UTC',
        kind: 'measurement',
        title: 'tsx start | 164 ms',
        body: 'Native node was 52 ms.',
      },
    ])
  })
})
