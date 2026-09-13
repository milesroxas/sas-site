import { describe, expect, it } from 'vitest'
import type { StoryBody, StoryRecord } from '@/collections/story/narrative'
import { resolveStoryBlockCopy, resolveStorySectionCopy } from './story-copy'

const copy = (text: string) =>
  ({
    root: { type: 'root', children: [{ type: 'paragraph', children: [{ type: 'text', text }] }] },
  }) as unknown as StoryBody

/** What a touched-then-cleared editor saves: truthy, but no content. */
const cleared = {
  root: { type: 'root', children: [{ type: 'paragraph', children: [] }] },
} as unknown as StoryBody

const overview = copy('Approach overview')
const beatBody = copy('Beat body')

const record: StoryRecord = {
  approach: {
    body: overview,
    storyBeats: [
      { key: 'detail', label: 'Detail label', heading: 'Detail heading', body: beatBody },
    ],
  },
}

describe('resolveStoryBlockCopy', () => {
  it('lets written copy win and falls through an empty editor to the story', () => {
    const written = copy('Written')
    const ref = { source: 'approach', storyScope: 'overview' } as const

    expect(
      resolveStoryBlockCopy(
        { blockType: 'featureHeadingOffset', ...ref, body: written, heading: 'Mine' },
        record,
      ),
    ).toMatchObject({ body: written, heading: 'Mine' })
    expect(
      resolveStoryBlockCopy({ blockType: 'richTransition', ...ref, body: cleared }, record),
    ).toMatchObject({ body: overview, heading: 'Approach' })
  })

  it('names a heading-led block after the beat, never after a stale key outside beat scope', () => {
    const beat = { source: 'approach', storyBeatKey: 'detail' } as const

    expect(
      resolveStoryBlockCopy(
        { blockType: 'caseStudyTransition', ...beat, storyScope: 'beat' },
        record,
      ),
    ).toMatchObject({ body: beatBody, heading: 'Detail heading' })
    expect(
      resolveStoryBlockCopy(
        { blockType: 'caseStudyTransition', ...beat, storyScope: 'overview' },
        record,
      ),
    ).toMatchObject({ body: overview, heading: 'Approach' })
  })

  it('gives media blocks the beat heading only, and keeps a custom body verbatim', () => {
    expect(
      resolveStoryBlockCopy(
        { blockType: 'fullMedia', source: 'approach', storyScope: 'overview', heading: null },
        record,
      ).heading,
    ).toBeUndefined()
    expect(
      resolveStoryBlockCopy(
        { blockType: 'imagePair', source: 'approach', storyScope: 'beat', storyBeatKey: 'detail' },
        record,
      ),
    ).toMatchObject({ body: beatBody, heading: 'Detail heading' })
    expect(
      resolveStoryBlockCopy(
        { blockType: 'splitContentNarrow', source: 'custom', body: cleared },
        record,
      ).body,
    ).toBe(cleared)
  })

  it('resolves each tab row and the statement and caption fields', () => {
    const ref = { source: 'approach', storyScope: 'section' } as const
    const tabs = resolveStoryBlockCopy(
      {
        blockType: 'featureTabs',
        tabs: [
          { ...ref, description: null },
          { source: 'custom', heading: 'Own', description: null },
        ],
      },
      record,
    ).tabs

    expect(tabs[0].heading).toBe('Approach')
    expect(JSON.stringify(tabs[0].description)).toContain('Beat body')
    expect(tabs[1]).toMatchObject({ description: null, heading: 'Own' })
    expect(
      resolveStoryBlockCopy({ blockType: 'featureStatementGrid', ...ref }, record).heading,
    ).toBe('Approach')
    expect(
      JSON.stringify(
        resolveStoryBlockCopy({ blockType: 'featureImageStatement', ...ref, caption: null }, record)
          .caption,
      ),
    ).toContain('Approach overview')
  })
})

describe('resolveStorySectionCopy', () => {
  it('uses custom copy, then a real override, then the story', () => {
    const own = copy('Own')

    expect(resolveStorySectionCopy({ source: 'custom', customBody: own }, record)).toEqual({
      content: own,
      heading: '',
    })
    expect(
      resolveStorySectionCopy(
        { source: 'approach', storyScope: 'overview', bodyOverride: cleared },
        record,
      ),
    ).toEqual({ content: overview, heading: 'Approach' })
    expect(
      resolveStorySectionCopy(
        {
          source: 'approach',
          storyScope: 'beat',
          storyBeatKey: 'detail',
          headingOverride: 'Override',
        },
        record,
      ),
    ).toEqual({ content: beatBody, heading: 'Override' })
  })
})
