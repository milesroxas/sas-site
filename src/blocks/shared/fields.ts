import type { Condition, Field, SelectField } from 'payload'
import { STORY_SECTIONS, STORY_SOURCE_OPTIONS } from '@/collections/story/narrative'
import { publicApprovedMediaWhere } from '@/fields/caseStudyScopedMedia'

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
 * The `source` select of a media-and-content block. Every surface stores it;
 * only pages that present a canonical story record (Work and Lab Pages) offer
 * the story picker and resolve a section into the block's copy.
 */
export const storySourceField = (condition?: Condition): SelectField => ({
  name: 'source',
  type: 'select',
  required: true,
  defaultValue: 'custom',
  options: [...STORY_SOURCE_OPTIONS],
  admin: {
    ...(condition ? { condition } : {}),
    description:
      'Choose which content feeds this block. "Custom" uses the body below; the others pull canonical story content (Work and Lab Pages only).',
  },
})

/**
 * Copy fields of a story-section block: an eyebrow plus website-only
 * overrides of the canonical heading and body, and the freeform body used
 * when the section's `source` is `custom`.
 */
const storySectionCopyFields = (): Field[] => [
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
 * Fields of the legacy Narrative "Story section" block, shared by the Work
 * (`caseStudyStorySection`) and Lab (`labStorySection`) instances: a canonical
 * section or custom copy, optional media beside it, and its arrangement.
 */
export const storySectionFields = (): Field[] => [
  {
    name: 'source',
    type: 'select',
    required: true,
    defaultValue: 'context',
    options: [...STORY_SECTIONS, 'custom'],
    admin: { description: 'Uses canonical story content unless a website override is supplied.' },
  },
  ...storySectionCopyFields(),
  {
    name: 'media',
    type: 'upload',
    relationTo: 'media',
    filterOptions: publicApprovedMediaWhere,
  },
  {
    name: 'layout',
    type: 'select',
    defaultValue: 'text-only',
    options: ['text-only', 'text-left', 'text-right', 'centered', 'sticky-media'],
  },
  themeField(),
  {
    name: 'width',
    type: 'select',
    defaultValue: 'standard',
    options: ['narrow', 'standard', 'wide'],
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
        // step (see docs/blocks-reorg-roadmap.md, Phase D). `prose` puts the
        // heading on the Story beats reading column so it can open a passage
        // of beats.
        options: [
          { label: 'Offset', value: 'offset' },
          { label: 'Left', value: 'left' },
          { label: 'Center', value: 'centered' },
          { label: 'Split', value: 'split' },
          { label: 'Statement', value: 'statement' },
          { label: 'Prose', value: 'prose' },
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
