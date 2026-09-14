import { describe, expect, it } from 'vitest'
import { collectVisualMediaRefs } from './visual-refs'

describe('collectVisualMediaRefs', () => {
  it('collects every media-suffixed field, shader posters, slides and nested sections', () => {
    const refs = collectVisualMediaRefs([
      { blockType: 'fullMedia', media: 1, shader: { posterMedia: 2 }, browseAllMedia: true },
      { blockType: 'imagePair', portraitMedia: 3, landscapeMedia: { id: 4 } },
      { blockType: 'carousel', slides: [{ media: 5 }, { media: null }] },
      {
        blockType: 'section',
        blocks: [{ blockType: 'splitContentNarrow', media: 6, shader: { posterMedia: 7 } }],
      },
    ])
    expect(refs).toEqual([1, true, 2, 3, { id: 4 }, 5, 6, 7])
  })

  it('tolerates empty and malformed layouts', () => {
    expect(collectVisualMediaRefs(null)).toEqual([])
    expect(collectVisualMediaRefs([null, 'x', { blocks: 'nope' }])).toEqual([])
  })
})
