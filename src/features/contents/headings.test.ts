import { afterEach, describe, expect, it } from 'vitest'
import { collectContentsEntries } from './headings'

const article = (html: string) => {
  document.body.innerHTML = `<article>${html}</article>`
  return document.querySelector('article') as HTMLElement
}

describe('collectContentsEntries', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('lists section headings in order and makes each a jump target', () => {
    const { entries } = collectContentsEntries(
      article('<h1>Title</h1><h2>Why</h2><h3>Detail</h3><h2>The brand’s story</h2>'),
    )
    expect(entries.map(({ id, label }) => [id, label])).toEqual([
      ['why', 'Why'],
      ['the-brands-story', 'The brand’s story'],
    ])
    const [first] = entries
    expect(first?.element.tabIndex).toBe(-1)
    expect(first?.element.style.scrollMarginTop).not.toBe('')
  })

  it('keeps an authored id and de-duplicates repeated headings', () => {
    const { entries } = collectContentsEntries(
      article('<h2 id="custom">Results</h2><h2>Results</h2><h2>Results</h2>'),
    )
    expect(entries.map((entry) => entry.id)).toEqual(['custom', 'results', 'results-2'])
  })

  it('reads a split heading from its aria-label', () => {
    const { entries } = collectContentsEntries(
      article('<h2 aria-label="How it works"><span>H</span><span>ow</span></h2>'),
    )
    expect(entries[0]?.label).toBe('How it works')
  })

  it('skips headings that are not sections of the page', () => {
    const { entries } = collectContentsEntries(
      article(
        '<form><h2>Step one</h2></form><div data-contents-skip><h2>Card</h2></div><h2 class="sr-only">Hidden</h2><h2> </h2><h2>Kept</h2>',
      ),
    )
    expect(entries.map((entry) => entry.label)).toEqual(['Kept'])
  })

  it('restores only what it added', () => {
    const root = article('<h2 id="custom" tabindex="0">One</h2><h2>Two</h2>')
    const { restore } = collectContentsEntries(root)
    restore()
    const [one, two] = root.querySelectorAll('h2')
    expect(one?.id).toBe('custom')
    expect(one?.getAttribute('tabindex')).toBe('0')
    expect(two?.hasAttribute('id')).toBe(false)
    expect(two?.hasAttribute('tabindex')).toBe(false)
    expect(two?.style.scrollMarginTop).toBe('')
  })
})
