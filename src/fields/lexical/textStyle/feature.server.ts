import { createServerFeature } from '@payloadcms/richtext-lexical'

/**
 * Text styles (Eyebrow, Small) for the content-column editor, as items of
 * the block-format dropdown beside Normal, Heading 4 and the list, where an
 * editor looks for them. Each applies to the whole paragraph the selection
 * touches (a heading or list item becomes a paragraph first) and toggles off
 * when picked again.
 *
 * Built on Lexical node state, like Payload's own TextStateFeature: the text
 * node carries the style's name under one key, never CSS, and the site's
 * classes stay the source of truth (`components/RichText/text-styles.ts`).
 * That feature's dropdown is a separate icon with no home in the format
 * menu, which is why this one exists. The client half lives beside this file.
 */
export const TextStyleFeature = createServerFeature({
  key: 'textStyle',
  feature: {
    ClientFeature: '@/fields/lexical/textStyle/feature.client#TextStyleFeatureClient',
  },
})
