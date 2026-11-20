import { describe, expect, it } from 'vitest'
import { layoutListsWork } from './lists-work'

describe('layoutListsWork', () => {
  it('finds a Work Poster list inside a Section', () => {
    expect(
      layoutListsWork([
        { blockType: 'section', blocks: [{ blockType: 'posterList', itemSource: 'collection' }] },
      ]),
    ).toBe(true)
  })

  it('finds one at the top level', () => {
    expect(layoutListsWork([{ blockType: 'posterList', itemSource: 'collection' }])).toBe(true)
  })

  it('ignores a Poster list of written items, and layouts without one', () => {
    expect(layoutListsWork([{ blockType: 'posterList', itemSource: 'static' }])).toBe(false)
    expect(layoutListsWork([{ blockType: 'section', blocks: [{ blockType: 'faq' }] }])).toBe(false)
    expect(layoutListsWork(null)).toBe(false)
  })
})
