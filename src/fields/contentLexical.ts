import {
  BlocksFeature,
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
  TextStateFeature,
  UnorderedListFeature,
} from '@payloadcms/richtext-lexical'
import { RichTextActions } from '@/blocks/rich-text/actions/config'
import { TEXT_STYLE_STATE_KEY, textStyleState } from '@/components/RichText/text-styles'

/**
 * The content-column editor: the body beside media in the Split family
 * (Split, Split narrow). The root features (paragraph, bold, italic,
 * underline, link) plus what a column of copy needs, and nothing a column
 * cannot hold:
 *
 * - `h4`, the one heading level below the block's own heading, muted.
 * - Bulleted lists, rendered as the ruled list (Paper "list").
 * - Text styles (Eyebrow, Small) in one toolbar dropdown, stored as node
 *   state rather than inline CSS so the site's classes stay the source of
 *   truth (`components/RichText/text-styles.ts`).
 * - Actions: one or two links set as buttons, a Lexical block in the body
 *   JSON (`blocks/rich-text/actions`), so no table and no migration.
 * - Fixed and inline toolbars.
 *
 * Every node's treatment lives in `RichText` and the bare rich text rules in
 * `globals.css`; blocks pass the state through and set no styles of their
 * own. Extend the toolbar here, never per block, so every column reads the
 * same.
 */
export const contentLexical = lexicalEditor({
  features: ({ rootFeatures }) => [
    ...rootFeatures,
    HeadingFeature({ enabledHeadingSizes: ['h4'] }),
    UnorderedListFeature(),
    TextStateFeature({ state: { [TEXT_STYLE_STATE_KEY]: textStyleState() } }),
    BlocksFeature({ blocks: [RichTextActions] }),
    FixedToolbarFeature(),
    InlineToolbarFeature(),
  ],
})
