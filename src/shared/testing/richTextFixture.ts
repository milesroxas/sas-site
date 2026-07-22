import type { FeatureHeadingOffsetBlock } from '@/payload-types'

/** Lexical rich-text field shape shared by the feature blocks. */
type RichTextValue = NonNullable<FeatureHeadingOffsetBlock['body']>

/**
 * Build a valid Lexical rich-text value from plain copy for stories and tests.
 * Blank lines split paragraphs, matching how the source textareas used to read.
 */
export const richTextFixture = (copy: string): RichTextValue => ({
  root: {
    type: 'root',
    format: '',
    indent: 0,
    version: 1,
    direction: 'ltr',
    children: copy.split(/\n\n+/).map((paragraph) => ({
      type: 'paragraph',
      format: '',
      indent: 0,
      version: 1,
      direction: 'ltr',
      children: [
        {
          type: 'text',
          text: paragraph,
          detail: 0,
          format: 0,
          mode: 'normal',
          style: '',
          version: 1,
        },
      ],
    })),
  },
})
