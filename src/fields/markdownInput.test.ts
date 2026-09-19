import type { FieldHook, RichTextField, TextareaField } from 'payload'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const convertMarkdownToLexical = vi.fn(({ markdown }: { markdown: string }) => ({
  converted: markdown,
}))

vi.mock('@payloadcms/richtext-lexical', () => ({
  convertMarkdownToLexical: (args: { markdown: string }) => convertMarkdownToLexical(args),
  editorConfigFactory: {
    fromField: ({ field }: { field: { features: Map<string, unknown> } }) => ({
      resolvedFeatureMap: field.features,
    }),
  },
}))

const { markdownInputFields } = await import('./markdownInput')

const [markdown] = markdownInputFields('body') as [TextareaField]
const [convert] = markdown.hooks?.beforeValidate as [FieldHook]

/** A rich text sibling whose editor enables the given Lexical features. */
const body = (features: Record<string, unknown>) =>
  ({
    name: 'body',
    type: 'richText',
    features: new Map(Object.entries(features)),
  }) as unknown as RichTextField

const article = body({
  heading: { sanitizedServerFeatureProps: { enabledHeadingSizes: ['h2', 'h3'] } },
  inlineCode: {},
  orderedList: {},
  unorderedList: {},
})
const plain = body({})

const filled = {
  root: {
    children: [{ type: 'paragraph', children: [{ type: 'text', text: 'Edited by a person.' }] }],
  },
}

const run = (
  value: unknown,
  siblingData: Record<string, unknown> = {},
  options: { field?: RichTextField; previous?: unknown } = {},
) =>
  convert({
    previousSiblingDoc: { body: options.previous },
    siblingData,
    siblingFields: [markdown, options.field ?? article],
    value,
  } as unknown as Parameters<FieldHook>[0])

describe('markdownInputFields', () => {
  // Braces matter: a function returned from `beforeEach` is run as its teardown.
  beforeEach(() => {
    convertMarkdownToLexical.mockClear()
  })

  it('converts Markdown into the rich text sibling and stores none of it', () => {
    const siblingData: Record<string, unknown> = {}
    expect(
      run('## Heading\n\nA paragraph with `code` and a list:\n\n- one', siblingData),
    ).toBeNull()
    expect(siblingData.body).toEqual({ converted: expect.stringContaining('## Heading') })
  })

  it('leaves the rich text alone when no Markdown is sent', () => {
    const siblingData: Record<string, unknown> = {}
    expect(run(undefined, siblingData)).toBeNull()
    expect(run('   ', siblingData)).toBeNull()
    expect(siblingData).toEqual({})
    expect(convertMarkdownToLexical).not.toHaveBeenCalled()
  })

  it('will not overwrite existing content without replace', () => {
    expect(() => run('New copy.', {}, { previous: filled })).toThrow(
      /already has content.*"replace": true/,
    )
    const siblingData: Record<string, unknown> = { replace: true }
    run('New copy.', siblingData, { previous: filled })
    expect(siblingData.body).toEqual({ converted: 'New copy.' })
  })

  it.each([
    ['fenced code', '```ts\nconst a = 1\n```', /Put code in a `code` block/],
    ['a table', '| a | b |\n| --- | --- |\n| 1 | 2 |', /Tables are not converted/],
    ['an image', '![alt](https://example.com/a.png)', /Images are not converted/],
    ['raw HTML', 'A <span>styled</span> word.', /Raw HTML is not converted/],
    [
      'a heading level the editor lacks',
      '# Title',
      /level 1 heading is not available here\. Use ## or ###/,
    ],
  ])('refuses %s with the fix, rather than storing it as literal text', (_, value, message) => {
    expect(() => run(value)).toThrow(message)
    expect(convertMarkdownToLexical).not.toHaveBeenCalled()
  })

  it('follows the target editor: what one field converts, another refuses', () => {
    expect(() => run('- a list item', {}, { field: plain })).toThrow(
      /Bulleted lists are not available/,
    )
    expect(() => run('Call `render()` here.', {}, { field: plain })).toThrow(
      /Inline code is not available/,
    )
    expect(() => run('## Heading', {}, { field: plain })).toThrow(/Headings are not available/)
    expect(run('- a list item', {})).toBeNull()
  })
})
