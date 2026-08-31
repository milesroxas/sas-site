import { describe, expect, it } from 'vitest'
import { hasRichTextContent } from './hasRichTextContent'

const paragraph = (children: unknown[]) => ({ type: 'paragraph', children })
const state = (children: Array<{ type?: unknown; children?: unknown }>) => ({
  root: { children },
})

describe('hasRichTextContent', () => {
  it('treats missing state as empty', () => {
    expect(hasRichTextContent(null)).toBe(false)
    expect(hasRichTextContent(undefined)).toBe(false)
    expect(hasRichTextContent({})).toBe(false)
    expect(hasRichTextContent({ root: {} })).toBe(false)
  })

  it('treats the touched-then-cleared editor state (one empty paragraph) as empty', () => {
    expect(hasRichTextContent(state([paragraph([])]))).toBe(false)
    expect(hasRichTextContent(state([paragraph([]), paragraph([])]))).toBe(false)
  })

  it('sees a paragraph with a text node as content', () => {
    expect(hasRichTextContent(state([paragraph([{ type: 'text', text: 'hi' }])]))).toBe(true)
    expect(
      hasRichTextContent(state([paragraph([]), paragraph([{ type: 'text', text: 'hi' }])])),
    ).toBe(true)
  })

  it('sees any non-paragraph node as content', () => {
    expect(hasRichTextContent(state([{ type: 'heading' }]))).toBe(true)
    expect(hasRichTextContent(state([{ type: 'upload' }]))).toBe(true)
  })
})
