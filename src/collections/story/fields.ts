import type { GroupField, Tab } from 'payload'
import { markdownInputFields } from '@/fields/markdownInput'
import { STORY_SECTION_DEFINITIONS, type StorySectionSource } from './sections'

/**
 * The story record fields: one Narrative tab with a group per story role,
 * identical on Case Study Content and Lab Projects. Field config only; the
 * resolvers that read these records live in `./narrative`.
 */

const storyBeatFields = (): GroupField['fields'] => [
  {
    name: 'key',
    type: 'text',
    required: true,
    validate: (value: null | string | undefined) =>
      !value || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)
        ? true
        : 'Use lowercase letters, numbers, and single hyphens only.',
    admin: {
      description:
        'Stable reference inside this section (e.g. consequential-art-direction). Do not rename after a presentation uses it.',
    },
  },
  {
    name: 'label',
    type: 'text',
    required: true,
    admin: { description: 'Internal name shown in presentation selectors.' },
  },
  {
    name: 'heading',
    type: 'text',
    admin: {
      description: 'Optional channel-neutral public heading. A presentation can override it.',
    },
  },
  ...markdownInputFields('body'),
  {
    name: 'body',
    type: 'richText',
    required: true,
    admin: {
      description: 'Self-contained canonical copy for this reusable narrative beat.',
    },
  },
]

const storySectionField = (
  definition: (typeof STORY_SECTION_DEFINITIONS)[number],
  description: string,
): GroupField => ({
  name: definition.field,
  type: 'group',
  label: definition.label,
  // One interface for every section on every record: the resolvers read any
  // story record through it. The fields below are identical wherever the group
  // appears; only the group's own description differs per section.
  interfaceName: 'NarrativeSection',
  admin: {
    description: `${description} The overview and beats are composed in order for whole-section consumers.`,
  },
  fields: [
    ...markdownInputFields('body'),
    {
      name: 'body',
      type: 'richText',
      label: 'Overview',
      admin: {
        description:
          'Standalone summary of this section, reused on its own as a section intro or quick overview. When beats exist, it renders before them and should not repeat their copy.',
      },
    },
    {
      name: 'storyBeats',
      type: 'array',
      labels: { singular: 'Story beat', plural: 'Story beats' },
      admin: {
        className: 'story-section-beats',
        initCollapsed: true,
        description:
          'Ordered, independently reusable ideas within this section. Use these when a presentation should pair individual passages with different media or layouts.',
      },
      fields: storyBeatFields(),
    },
  ],
})

/**
 * The Narrative tab of a story record. Each record describes the sections in
 * its own terms (a client engagement, an internal experiment); the fields are
 * the same everywhere. `fields` appends record-specific fields after the story.
 */
export const narrativeTab = (
  descriptions: Record<StorySectionSource, string>,
  fields: Tab['fields'] = [],
): Tab => ({
  label: 'Narrative',
  description:
    'Channel-neutral prose, organized by story role. Each section can stay continuous or be split into reusable Story Beats.',
  fields: [
    ...STORY_SECTION_DEFINITIONS.map((definition) =>
      storySectionField(definition, descriptions[definition.source]),
    ),
    ...fields,
  ],
})
