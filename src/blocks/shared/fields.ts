import type { Field, SelectField } from 'payload'

/**
 * Block surface select shared by every block family. Values map to
 * `themeClasses` in `./section.tsx` — keep the two in sync.
 */
export const themeField = (name = 'theme'): SelectField => ({
  name,
  type: 'select',
  defaultValue: 'light',
  options: ['light', 'dark', 'neutral', 'brand'],
  admin: {
    description:
      'Section surface within the visitor\'s site theme. Does not force light/dark mode — "dark" is a contrasted band in whichever theme the visitor chose.',
  },
})

/**
 * Copy fields of a story-section block: an eyebrow plus website-only
 * overrides of the canonical heading and body, and the freeform body used
 * when the section's `source` is `custom`.
 */
export const storySectionCopyFields = (): Field[] => [
  { name: 'eyebrow', type: 'text' },
  { name: 'headingOverride', type: 'text' },
  {
    name: 'bodyOverride',
    type: 'richText',
    admin: { description: 'Website-only override; canonical content is unchanged.' },
  },
  {
    name: 'customBody',
    type: 'richText',
    admin: { condition: (_, siblingData) => siblingData?.source === 'custom' },
  },
]

/**
 * Fields of a rich-transition block: a short band of copy between story
 * sections, laid out one of four ways on a themed surface. Layout and theme
 * sit above the body so they stay reachable without scrolling past the editor.
 */
export const transitionFields = (): Field[] => [
  { name: 'eyebrow', type: 'text' },
  { name: 'heading', type: 'text', required: true },
  {
    type: 'row',
    fields: [
      {
        name: 'layout',
        type: 'select',
        label: 'Layout',
        defaultValue: 'offset',
        // `offset` is the arrangement that shipped as `left` (heading one
        // column in); `left` now starts on column 1. Existing rows migrate
        // `left` -> `offset` so their rendering does not change. `centered` is
        // labelled "Center"; retiring `split`/`statement` is a later contract
        // step (see docs/blocks-reorg-roadmap.md, Phase D).
        options: [
          { label: 'Offset', value: 'offset' },
          { label: 'Left', value: 'left' },
          { label: 'Center', value: 'centered' },
          { label: 'Split', value: 'split' },
          { label: 'Statement', value: 'statement' },
        ],
        admin: {
          width: '50%',
          description: 'How the copy sits on the band.',
        },
      },
      {
        ...themeField(),
        admin: {
          ...themeField().admin,
          width: '50%',
        },
      },
    ],
  },
  { name: 'body', type: 'richText' },
]

/**
 * Selection fields of a "related items" block: where the list comes from, how
 * long it is, and how it is laid out. The heading differs per family, so each
 * block declares its own.
 */
export const relatedSelectionFields = (): Field[] => [
  {
    name: 'selectionMode',
    type: 'select',
    defaultValue: 'document-settings',
    options: ['document-settings', 'automatic-capability-match'],
  },
  { name: 'limit', type: 'number', min: 1, max: 12, defaultValue: 3 },
  { name: 'layout', type: 'select', defaultValue: 'grid', options: ['grid', 'list', 'feature'] },
]
