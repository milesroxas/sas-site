import { describe, expect, it } from 'vitest'
import type { StoryRecord } from '@/collections/story/narrative'
import { narrativeProof } from './narrative'

const body = (text: string) => ({
  root: { type: 'root', children: [{ type: 'paragraph', children: [{ type: 'text', text }] }] },
})
const record = {
  context: {
    body: body('Overview'),
    storyBeats: [
      {
        key: 'first',
        label: 'First',
        heading: 'First decision',
        body: body('The original reason.'),
      },
      {
        key: 'second',
        label: 'Second',
        heading: 'Second decision',
        body: body('The consequence.'),
      },
    ],
  },
} as unknown as StoryRecord
const beat = (key: string) => ({
  blockType: 'storyBeats',
  source: 'context',
  storyScope: 'beat',
  storyBeatKey: key,
})
const section = (...blocks: unknown[]) => ({
  blockType: 'section',
  blocks: [
    { blockType: 'richTransition', source: 'custom', layout: 'prose', heading: 'First decision' },
    ...blocks,
  ],
})

describe('narrative reading proof', () => {
  it('reads page order, respects copy overrides and suppresses a repeated opener', () => {
    const proof = narrativeProof(
      { layout: [section(beat('second'), { ...beat('first'), body: body('Page override.') })] },
      record,
    )
    expect(proof.markdown.indexOf('The consequence.')).toBeLessThan(
      proof.markdown.indexOf('Page override.'),
    )
    expect(proof.markdown).not.toContain('The original reason.')
    expect(proof.markdown.match(/### First decision/g)).toHaveLength(1)
  })

  it('resolves whole-section scope without duplicating the composed body', () => {
    const proof = narrativeProof(
      { layout: [section({ ...beat('first'), storyScope: 'section' })] },
      record,
    )
    expect(proof.markdown.match(/The original reason\./g)).toHaveLength(1)
    expect(proof.markdown).toContain('Overview')
  })

  it('flags long prose runs across headings and code, but resets at a visual', () => {
    const paragraph = { blockType: 'richText', body: body('word '.repeat(140)) }
    const code = { blockType: 'code', code: 'private implementation text' }
    const crowded = narrativeProof({ layout: [section(paragraph, code, paragraph)] }, record)
    expect(crowded.longRuns).toHaveLength(1)
    expect(crowded.markdown).not.toContain('private implementation text')
    const visual = {
      blockType: 'diagram',
      title: 'Evidence',
      textAlternative: 'alternative '.repeat(300),
    }
    const paced = narrativeProof({ layout: [section(paragraph, visual, paragraph)] }, record)
    expect(paced.longRuns).toHaveLength(0)
    expect(paced.sections[0]?.visuals).toBe(1)
    expect(paced.sections[0]?.paragraphs).toHaveLength(2)
  })

  it('changes the fingerprint for copy, order and figure evidence changes', () => {
    const a = narrativeProof({ layout: [section(beat('first'), beat('second'))] }, record)
    const b = narrativeProof({ layout: [section(beat('second'), beat('first'))] }, record)
    const c = narrativeProof(
      { layout: [section({ ...beat('first'), body: body('Changed.') }, beat('second'))] },
      record,
    )
    expect(a.fingerprint).not.toBe(b.fingerprint)
    expect(a.fingerprint).not.toBe(c.fingerprint)
    const chart = { blockType: 'chart', spec: { rows: [{ value: 1 }] } }
    const d = narrativeProof({ layout: [section(chart)] }, record)
    const e = narrativeProof(
      { layout: [section({ ...chart, spec: { rows: [{ value: 2 }] } })] },
      record,
    )
    expect(d.fingerprint).not.toBe(e.fingerprint)
  })
})
