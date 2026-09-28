import { describe, expect, it } from 'vitest'
import { lexicalWords, readingMinutes, readingTimeMinutes } from './reading-time'

const node = (type: string, children: unknown[], extra: Record<string, unknown> = {}) => ({
  type,
  ...extra,
  children,
})
const text = (value: string) => ({ type: 'text', text: value })
const body = (...children: unknown[]) => ({ root: { children } })

describe('lexicalWords', () => {
  it('counts the words of a paragraph', () => {
    expect(lexicalWords(body(node('paragraph', [text('one two three four')])))).toBe(4)
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
    expect(lexicalWords(doc)).toBe(8)
  })

  it('reads a link as its label and never as its destination', () => {
    const link = node('link', [text('the label')], { fields: { url: 'https://example.com/a/b' } })
    expect(lexicalWords(body(node('paragraph', [link])))).toBe(2)
  })

  it('keeps an emphasized or inline-code word whole', () => {
    const doc = body(
      node('paragraph', [
        text('bold'),
        { type: 'text', text: 'strong', format: 1 },
        { type: 'text', text: 'snake_case_name', format: 16 },
      ]),
    )
    expect(lexicalWords(doc)).toBe(1)
  })

  it('leaves a code listing out: it is a figure, not prose', () => {
    const code = ['const a = 1', '', 'const b = a + 1'].join('\n')
    const doc = body(node('paragraph', [text('two words')]), {
      type: 'block',
      fields: { code, language: 'ts' },
    })
    expect(lexicalWords(doc)).toBe(2)
  })
})

describe('readingMinutes', () => {
  it('floors at one minute and rounds once', () => {
    expect(readingMinutes(0)).toBe(1)
    expect(readingMinutes(3)).toBe(1)
    expect(readingMinutes(600)).toBe(3)
    expect(readingMinutes(1900)).toBe(10)
  })
})

describe('readingTimeMinutes', () => {
  it('answers one minute for an empty body', () => {
    expect(readingTimeMinutes(null)).toBe(1)
  })
})
