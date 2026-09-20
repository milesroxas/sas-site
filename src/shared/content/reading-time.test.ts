import { describe, expect, it } from 'vitest'
import { readingCost, readingMinutes, readingTimeMinutes } from './reading-time'

const node = (type: string, children: unknown[], extra: Record<string, unknown> = {}) => ({
  type,
  ...extra,
  children,
})
const text = (value: string) => ({ type: 'text', text: value })
const body = (...children: unknown[]) => ({ root: { children } })

describe('readingCost', () => {
  it('counts the words of a paragraph', () => {
    expect(readingCost(body(node('paragraph', [text('one two three four')])))).toEqual({
      codeLines: 0,
      words: 4,
    })
  })

  it('does not charge the reader for markdown furniture', () => {
    const list = node(
      'list',
      [
        node('listitem', [text('alpha')]),
        node('listitem', [text('beta')]),
        node('listitem', [text('gamma')]),
      ],
      { listType: 'bullet' },
    )
    const doc = body(
      node('heading', [text('A heading here')], { tag: 'h2' }),
      list,
      { type: 'horizontalrule' },
      node('quote', [text('quoted line')]),
    )
    // 3 heading + 3 list + 2 quote: no `##`, no bullets, no `---`.
    expect(readingCost(doc)).toEqual({ codeLines: 0, words: 8 })
  })

  it('reads a link as its label and never as its destination', () => {
    const link = node('link', [text('the label')], { fields: { url: 'https://example.com/a/b' } })
    expect(readingCost(body(node('paragraph', [link])))).toEqual({ codeLines: 0, words: 2 })
  })

  it('keeps an emphasized or inline-code word whole', () => {
    const doc = body(
      node('paragraph', [
        text('bold'),
        { type: 'text', text: 'strong', format: 1 },
        { type: 'text', text: 'snake_case_name', format: 16 },
      ]),
    )
    expect(readingCost(doc)).toEqual({ codeLines: 0, words: 1 })
  })

  it('charges a fenced listing by the line, not by the token', () => {
    const code = ['const a = 1', '', 'const b = a + 1'].join('\n')
    const doc = body(node('paragraph', [text('two words')]), {
      type: 'block',
      fields: { code, language: 'ts' },
    })
    expect(readingCost(doc)).toEqual({ codeLines: 2, words: 2 })
  })
})

describe('readingMinutes', () => {
  it('floors at one minute and rounds prose and code together, once', () => {
    expect(readingMinutes({ codeLines: 0, words: 0 })).toBe(1)
    expect(readingMinutes({ codeLines: 0, words: 3 })).toBe(1)
    // 600 words is 3 minutes; 40 lines of code is 2 more.
    expect(readingMinutes({ codeLines: 40, words: 600 })).toBe(5)
    // Neither half rounds to a minute on its own, but together they make one.
    expect(readingMinutes({ codeLines: 6, words: 60 })).toBe(1)
  })
})

describe('readingTimeMinutes', () => {
  it('answers one minute for an empty body', () => {
    expect(readingTimeMinutes(null)).toBe(1)
  })
})
