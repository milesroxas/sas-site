import { describe, expect, it } from 'vitest'
import { uppermostRevealTarget } from './scroll-reveal'

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
