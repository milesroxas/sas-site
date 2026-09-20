import { describe, expect, it } from 'vitest'
import type { StoryBody, StoryRecord } from '@/collections/story/narrative'
import { composedReadingMinutes } from './reading-time'

const prose = (count: number) => Array.from({ length: count }, (_, i) => `word${i}`).join(' ')

const copy = (text: string) =>
  ({
    root: { type: 'root', children: [{ type: 'paragraph', children: [{ type: 'text', text }] }] },
  }) as unknown as StoryBody

const record: StoryRecord = {
  approach: {
    body: copy(prose(200)),
    storyBeats: [{ key: 'detail', label: 'Detail', body: copy(prose(400)) }],
  },
  learnings: { body: copy(prose(2000)) },
}

const beatBlock = {
  blockType: 'storyBeats',
  id: 'a',
  source: 'approach',
  storyScope: 'beat',
  storyBeatKey: 'detail',
  body: null,
}

describe('composedReadingMinutes', () => {
  it('reads the slice of the story a block points at, and nothing the page skips', () => {
    // 400 words of one beat: the 2,000-word Learnings section is not on the page.
    expect(composedReadingMinutes([[beatBlock]], record)).toBe(2)
  })

  it('reads a whole section as overview plus every beat when the block asks for it', () => {
    const section = { ...beatBlock, storyScope: 'section', storyBeatKey: null }
    expect(composedReadingMinutes([[section]], record)).toBe(3)
  })

  it('reads copy written on the block instead of the story it points at', () => {
    const written = { ...beatBlock, body: copy(prose(1000)) }
    expect(composedReadingMinutes([[written]], record)).toBe(5)
  })

  it('resolves blocks nested inside a Section band', () => {
    const band = { blockType: 'section', id: 'band', blocks: [beatBlock] }
    expect(composedReadingMinutes([[band]], record)).toBe(2)
  })

  it('charges a figure for its caption, never for its alternative text or its spec', () => {
    const figure = {
      blockType: 'diagram',
      id: 'f',
      title: 'A title',
      caption: prose(200),
      textAlternative: prose(2000),
      spec: { kind: 'flow', nodes: [{ id: 'n', label: prose(400) }] },
      geometry: { nodes: [{ lines: [prose(400)] }] },
    }
    expect(composedReadingMinutes([[figure]], record)).toBe(1)
  })

  it('charges a composition Code block by its lines', () => {
    const code = {
      blockType: 'code',
      id: 'c',
      language: 'ts',
      code: Array.from({ length: 40 }, (_, i) => `const a${i} = ${i}`).join('\n'),
    }
    expect(composedReadingMinutes([[code]], record)).toBe(2)
  })

  it('counts a page intro alongside its layout', () => {
    const intro = { title: 'Intro', bodyOverride: copy(prose(400)) }
    expect(composedReadingMinutes([intro, [beatBlock]], record)).toBe(4)
  })
})
