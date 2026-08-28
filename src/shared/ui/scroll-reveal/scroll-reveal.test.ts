import { describe, expect, it } from 'vitest'
import { revealStaggerSlots, uppermostRevealTarget } from './scroll-reveal'

const box = (top: number) => {
  const el = document.createElement('div')
  el.getBoundingClientRect = () =>
    ({
      top,
      left: 0,
      right: 0,
      bottom: top + 40,
      width: 100,
      height: 40,
      x: 0,
      y: top,
      toJSON: () => ({}),
    }) as DOMRect
  return el
}

describe('uppermostRevealTarget', () => {
  it('returns undefined when there are no targets', () => {
    expect(uppermostRevealTarget([])).toBeUndefined()
  })

  it('returns the only target', () => {
    const heading = box(400)
    expect(uppermostRevealTarget([heading])).toBe(heading)
  })

  it('picks media above copy, even when copy is first in the node list', () => {
    const caption = box(800)
    const media = box(120)
    expect(uppermostRevealTarget([caption, media])).toBe(media)
  })

  it('keeps a copy-first heading when it sits above the media', () => {
    const heading = box(80)
    const media = box(360)
    expect(uppermostRevealTarget([heading, media])).toBe(heading)
  })
})

const target = (group?: string) => {
  const el = document.createElement('div')
  if (group) el.dataset.revealGroup = group
  return el
}

describe('revealStaggerSlots', () => {
  it('gives every ungrouped target its own beat', () => {
    expect(revealStaggerSlots([target(), target(), target()])).toEqual([0, 1, 2])
  })

  it('lands an eyebrow and its heading on one beat, body on the next', () => {
    expect(revealStaggerSlots([target('heading'), target('heading'), target()])).toEqual([0, 0, 1])
  })

  it('only collapses neighbours, so one group name per list item stays a cascade', () => {
    const targets = [target('item'), target(), target('item'), target()]
    expect(revealStaggerSlots(targets)).toEqual([0, 1, 2, 3])
  })

  it('returns nothing for no targets', () => {
    expect(revealStaggerSlots([])).toEqual([])
  })
})
