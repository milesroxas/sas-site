import type { Field } from 'payload'
import { themeField } from '@/blocks/shared/fields'
import type { FigureWidth } from '@/features/figures/ui/figure-frame'

/**
 * How much of the composition grid a figure spans. Stored in the DB: relabel
 * freely, never re-value without a migration. `satisfies` ties the values to
 * the widths the frame can place, so the select and the renderer cannot drift.
 */
const FIGURE_WIDTH_OPTIONS = [
  { label: 'Text column', value: 'text' },
  { label: 'Wide', value: 'wide' },
  { label: 'Full', value: 'full' },
] as const satisfies readonly { label: string; value: FigureWidth }[]

const httpsOnly = (value: null | string | undefined): string | true => {
  if (!value) return true
  try {
    return new URL(value).protocol === 'https:' ? true : 'Use an https:// link.'
  } catch {
    return 'Use a full https:// link.'
  }
}

/**
 * The frame every figure kind shares, stated once. `title`, `caption` and
 * `textAlternative` are TEXT_KEYS names (`shared/content/extract.ts`), so a
 * figure reaches RAG and llms.txt through its words even though its marks
 * cannot.
 *
 * The attribution group is `dataSource`, not `source`: on this site `source`
 * is the story-copy select of a story-capable block, and the MCP authoring
 * rules teach agents that meaning.
 */
export const figureFrameFields = (): Field[] => {
  const theme = themeField()
  return [
    {
      name: 'title',
      type: 'text',
      maxLength: 120,
      admin: { description: 'Says what the figure shows. Shown above it and used as its heading.' },
    },
    {
      name: 'textAlternative',
      type: 'textarea',
      required: true,
      maxLength: 1000,
      admin: {
        description:
          'What the figure shows and the takeaway, in plain sentences. Read aloud by screen readers and indexed for search and Ask, so write it for someone who cannot see the figure.',
      },
    },
    {
      name: 'caption',
      type: 'textarea',
      maxLength: 300,
      admin: { description: 'Optional line under the figure: context, method, a caveat.' },
    },
    {
      name: 'dataSource',
      type: 'group',
      label: 'Source',
      admin: { description: 'Optional attribution under the caption.' },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'label', type: 'text', maxLength: 120, admin: { width: '50%' } },
            {
              name: 'href',
              type: 'text',
              label: 'Link',
              maxLength: 500,
              validate: httpsOnly,
              admin: { width: '50%' },
            },
          ],
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'width',
          type: 'select',
          defaultValue: 'wide',
          options: [...FIGURE_WIDTH_OPTIONS],
          admin: {
            width: '50%',
            description:
              'How wide the drawing runs: the reading column, that column plus one each side, or all eight. Wide keeps the title, caption and description on the reading column.',
          },
        },
        { ...theme, admin: { ...theme.admin, width: '50%' } },
      ],
    },
  ]
}
