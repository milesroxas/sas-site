import type { Block } from 'payload'
import { featureSourceField } from '@/blocks/feature/shared'
import { proseHeadingLevelField, themeField } from '@/blocks/shared/fields'
import { BLOCK_GROUPS } from '@/blocks/shared/groups'
import { markdownInputFields } from '@/fields/markdownInput'

/**
 * Story beats: the page's canonical story as prose, set in the same reading
 * column the Rich text block uses (columns 3-6 of the composition grid).
 *
 * Only the two surfaces that present a story record offer it (Work Pages over
 * Case Study Content, Lab Pages over a Lab Project); on any other collection
 * there would be nothing for it to resolve, so it stays out of the shared
 * Section-nestable run.
 *
 * The block writes no copy of its own by default: `source` picks the canonical
 * section and the story picker `withStoryBeatSource` adds decides whether that
 * means the section's overview, one Story Beat, or the whole section composed
 * in order. `body` is the copy under `Source: Custom` and the website-only
 * override otherwise, exactly as on every other story-capable block.
 *
 * A beat's heading prints from the story record by default, one level under
 * the Section's Prose Standard heading; `heading` here is the page's override.
 * A record heading that only restates the Prose heading above it is not
 * printed: code hides an exact repeat, and Jev decides paraphrases and the
 * level at save time (`plugins/story-headings`), stored in `headingAuto`.
 * The rules: `shared/story-headings.ts`.
 *
 * `variant` is the type size and nothing else: the measure, the column, and
 * the band rhythm are the same at every size.
 */
export const StoryBeats: Block = {
  slug: 'storyBeats',
  admin: { group: BLOCK_GROUPS.text },
  // Per-parent table name: a static dbName would collapse every collection that
  // uses this block into one table whose FK points at the first parent only.
  dbName: ({ tableName }) => `${tableName}_story_beats`,
  interfaceName: 'StoryBeatsBlock',
  labels: { singular: 'Story beats', plural: 'Story beats' },
  fields: [
    featureSourceField(),
    // Not an override of canonical copy, so it stays visible at every source:
    // `withStoryBeatSource` gates only the copy fields beside `source`, and a
    // row's fields are not among them.
    {
      type: 'row',
      fields: [
        {
          name: 'heading',
          type: 'text',
          admin: {
            width: '50%',
            description:
              "Override of the beat's own heading from the story record. Leave empty to print the record's heading one level under this Section's Prose heading (hidden when it only restates it).",
          },
        },
        // A beat sits under the Prose heading of its Section, hence h3.
        proseHeadingLevelField({
          defaultValue: 'h3',
          admin: {
            condition: (_, siblingData) => Boolean(siblingData?.heading),
            description:
              'Outline level and type size of the override, on the same scale as a Prose Standard heading.',
            width: '50%',
          },
        }),
      ],
    },
    // Written by `plugins/story-headings` on every save and never taken from
    // the request: per beat key, whether its record heading prints and at what
    // level, with a hash of what was judged (`shared/story-headings.ts`).
    {
      name: 'headingAuto',
      type: 'json',
      admin: { hidden: true },
    },
    ...markdownInputFields('body'),
    {
      name: 'body',
      type: 'richText',
      admin: {
        description:
          'Shown when source is "Custom", or as a website-only override of the canonical copy.',
      },
    },
    {
      name: 'variant',
      type: 'select',
      label: 'Type size',
      defaultValue: 'default',
      options: [
        { label: 'Default', value: 'default' },
        { label: 'Small', value: 'small' },
        { label: 'Lead', value: 'lead' },
      ],
      admin: {
        description:
          'Default is article body copy, the size a post renders its main text at. Small steps below it for an aside or a footnote; Lead is the larger standfirst size.',
      },
    },
    themeField(),
  ],
}
