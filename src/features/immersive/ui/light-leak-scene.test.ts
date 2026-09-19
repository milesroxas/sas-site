import { afterEach, describe, expect, it } from 'vitest'
import { leakExcite, leakScope } from './light-leak-excite'
import { bindLeakInput, createLeakInput, leakScopeOf } from './light-leak-scene'

/**
 * The leak's hover contract as the DOM delivers it: which band it listens
 * inside, and how excited one hovered element makes it. The listeners are
 * delegated, so every case here is one event on an element the leak has never
 * seen before.
 */

const html = (markup: string) => {
  document.body.innerHTML = markup
  return (selector: string) => document.querySelector<HTMLElement>(selector) as HTMLElement
}

const over = (element: Element) =>
  element.dispatchEvent(new MouseEvent('pointerover', { bubbles: true }))
const out = (element: Element, relatedTarget: Element | null) =>
  element.dispatchEvent(new MouseEvent('pointerout', { bubbles: true, relatedTarget }))

afterEach(() => {
  document.body.innerHTML = ''
})

describe('leakScopeOf', () => {
  it('takes the nearest marked band over everything above it', () => {
    const find = html(
      `<div ${Object.keys(leakScope())[0]} id="outer">
         <section ${Object.keys(leakScope())[0]} id="inner"><div id="leak"></div></section>
       </div>`,
    )
    expect(leakScopeOf(find('#leak'))).toBe(find('#inner'))
  })

  it('is the whole document when there is neither a marker nor a positioned ancestor', () => {
    const find = html('<div><div id="leak"></div></div>')
    expect(leakScopeOf(find('#leak'))).toBe(null)
    expect(leakScopeOf(null)).toBe(null)
  })
})

describe('bindLeakInput', () => {
  const band = (markup: string) =>
    html(`<section ${Object.keys(leakScope())[0]} id="band">${markup}</section>
          <a href="/elsewhere" id="outside">Another block</a>`)

  it('flares at links and buttons in its own band, and at nothing outside it', () => {
    const find = band(
      `<div id="leak"></div><p id="copy">Words</p><a href="/work" id="link">Work</a>`,
    )
    const input = createLeakInput()
    const unbind = bindLeakInput(input, {
      scope: leakScopeOf(find('#leak')),
      targets: 'interactive',
      section: 0,
    })

    over(find('#link'))
    expect(input.exciteTarget).toBe(1)
    // Copy is not a promise of anything, so the band rests with section at 0.
    over(find('#copy'))
    expect(input.exciteTarget).toBe(0)
    over(find('#outside'))
    expect(input.exciteTarget).toBe(0)

    unbind()
    over(find('#link'))
    expect(input.exciteTarget).toBe(0)
  })

  it('answers the pointer crossing the band, under a full flare', () => {
    const find = band(
      `<div id="leak"></div><p id="copy">Words</p><a href="/work" id="link">Work</a>`,
    )
    const input = createLeakInput()
    bindLeakInput(input, {
      scope: leakScopeOf(find('#leak')),
      targets: 'interactive',
      section: 0.35,
    })

    over(find('#copy'))
    expect(input.exciteTarget).toBe(0.35)
    over(find('#link'))
    expect(input.exciteTarget).toBe(1)
    // Leaving the link for the copy beside it settles back to the band, not to rest.
    out(find('#link'), find('#copy'))
    expect(input.exciteTarget).toBe(0.35)
    out(find('#band'), null)
    expect(input.exciteTarget).toBe(0)
  })

  it('narrows to marked elements, and a marker mutes a link either way', () => {
    const find = band(
      `<div id="leak"></div>
       <span id="marked" ${Object.keys(leakExcite())[0]}>Card</span>
       <a href="/fine-print" id="muted" data-leak-excite="off">Fine print</a>
       <a href="/work" id="link">Work</a>`,
    )
    const input = createLeakInput()
    bindLeakInput(input, { scope: leakScopeOf(find('#leak')), targets: 'marked', section: 0.2 })

    over(find('#marked'))
    expect(input.exciteTarget).toBe(1)
    // `marked` does not answer links on its own.
    over(find('#link'))
    expect(input.exciteTarget).toBe(0.2)
    over(find('#muted'))
    expect(input.exciteTarget).toBe(0)
  })

  it('ignores touch, which has no hover to leave', () => {
    const find = band(`<div id="leak"></div><a href="/work" id="link">Work</a>`)
    const input = createLeakInput()
    bindLeakInput(input, {
      scope: leakScopeOf(find('#leak')),
      targets: 'interactive',
      section: 0.3,
    })

    find('#link').dispatchEvent(
      new PointerEvent('pointerover', { bubbles: true, pointerType: 'touch' }),
    )
    expect(input.exciteTarget).toBe(0)
    find('#link').dispatchEvent(
      new PointerEvent('pointerover', { bubbles: true, pointerType: 'mouse' }),
    )
    expect(input.exciteTarget).toBe(1)
  })

  it('with no band, answers marked elements anywhere and never the page at large', () => {
    const find = html(
      `<div id="leak"></div><span id="marked" ${Object.keys(leakExcite())[0]}>Card</span>
       <a href="/work" id="link">Work</a>`,
    )
    const input = createLeakInput()
    bindLeakInput(input, { scope: null, targets: 'interactive', section: 0.5 })

    over(find('#marked'))
    expect(input.exciteTarget).toBe(1)
    over(find('#link'))
    expect(input.exciteTarget).toBe(0)
  })
})
