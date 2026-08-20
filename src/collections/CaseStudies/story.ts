import type { GroupField } from 'payload'
import type { CaseStudy } from '@/payload-types'

export const CASE_STUDY_STORY_SECTIONS = [
  'context',
  'challenge',
  'strategy',
  'approach',
  'outcome-summary',
  'learnings',
] as const

export type CaseStudyStorySection = (typeof CASE_STUDY_STORY_SECTIONS)[number]
export type CaseStudyStorySource = CaseStudyStorySection | 'custom'

type CaseStudyStoryField =
  | 'approach'
  | 'challenge'
  | 'context'
  | 'learnings'
  | 'outcomeSummary'
  | 'strategy'

type StorySectionDefinition = {
  bodyDescription: string
  field: CaseStudyStoryField
  label: string
  source: CaseStudyStorySection
}

export const CASE_STUDY_STORY_SECTION_DEFINITIONS = [
  {
    source: 'context',
    field: 'context',
    label: 'Context',
    bodyDescription: 'Background and the client situation before the engagement.',
  },
  {
    source: 'challenge',
    field: 'challenge',
    label: 'Challenge',
    bodyDescription: 'The problem being solved. Required to publish.',
  },
  {
    source: 'strategy',
    field: 'strategy',
    label: 'Strategy',
    bodyDescription: 'The high-level strategic direction taken.',
  },
  {
    source: 'approach',
    field: 'approach',
    label: 'Approach',
    bodyDescription: 'How the work was carried out.',
  },
  {
    source: 'outcome-summary',
    field: 'outcomeSummary',
    label: 'Outcomes',
    bodyDescription: 'The overall result of the engagement. Required to publish.',
  },
  {
    source: 'learnings',
    field: 'learnings',
    label: 'Learnings',
    bodyDescription: 'What the team took away from the work.',
  },
] as const satisfies readonly StorySectionDefinition[]

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
  {
    name: 'body',
    type: 'richText',
    required: true,
    admin: {
      description: 'Self-contained canonical copy for this reusable narrative beat.',
    },
  },
]

export const caseStudyStorySectionField = (definition: StorySectionDefinition): GroupField => ({
  name: definition.field,
  type: 'group',
  label: definition.label,
  admin: {
    description:
      'Canonical narrative for this part of the case study. The overview and beats are composed in order for whole-section consumers.',
  },
  fields: [
    {
      name: 'body',
      type: 'richText',
      label: 'Overview',
      admin: {
        description: `${definition.bodyDescription} Standalone summary of this section — reused on its own as a section intro or quick overview. When beats exist, it renders before them and should not repeat their copy.`,
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

const definitionFor = (source: CaseStudyStorySection) =>
  CASE_STUDY_STORY_SECTION_DEFINITIONS.find((definition) => definition.source === source)

export const getCaseStudyStorySection = (study: CaseStudy, source: CaseStudyStorySection) => {
  const definition = definitionFor(source)
  return definition ? study[definition.field] : undefined
}

export const findCaseStudyStoryBeat = (
  study: CaseStudy,
  source: CaseStudyStorySection,
  key?: string | null,
) =>
  key
    ? getCaseStudyStorySection(study, source)?.storyBeats?.find((beat) => beat.key === key)
    : undefined

export type CaseStudyStoryBody = NonNullable<NonNullable<CaseStudy['approach']>['body']>

const composeStoryBodies = (bodies: Array<CaseStudyStoryBody | null | undefined>) => {
  const populated = bodies.filter((body): body is CaseStudyStoryBody => Boolean(body?.root))
  const first = populated[0]
  if (!first?.root) return null

  return {
    root: {
      ...first.root,
      children: populated.flatMap((body) => body.root.children || []),
    },
  }
}

/**
 * Resolve either one stable beat or a complete canonical section. A complete
 * section is its optional body followed by its ordered beats.
 */
export const resolveCaseStudyStoryBody = (
  study: CaseStudy,
  source: CaseStudyStorySource | null | undefined,
  storyBeatKey?: string | null,
) => {
  if (!source || source === 'custom') return null
  const section = getCaseStudyStorySection(study, source)
  if (!section) return null
  if (storyBeatKey) return section.storyBeats?.find((beat) => beat.key === storyBeatKey)?.body

  return composeStoryBodies([section.body, ...(section.storyBeats || []).map((beat) => beat.body)])
}

export const hasCaseStudyStorySection = (study: CaseStudy, section: CaseStudyStorySection) =>
  Boolean(resolveCaseStudyStoryBody(study, section))

export type StoryBeatReference = {
  key: string
  section: CaseStudyStorySection
}

const isCaseStudyStorySection = (value: unknown): value is CaseStudyStorySection =>
  typeof value === 'string' && CASE_STUDY_STORY_SECTIONS.some((source) => source === value)

/** Find section-scoped Story Beat references at any depth, including Feature Tabs rows. */
export const storyBeatReferences = (value: unknown): StoryBeatReference[] => {
  if (Array.isArray(value)) return value.flatMap(storyBeatReferences)
  if (!value || typeof value !== 'object') return []

  const record = value as Record<string, unknown>
  const own =
    isCaseStudyStorySection(record.source) && typeof record.storyBeatKey === 'string'
      ? [{ section: record.source, key: record.storyBeatKey }]
      : []

  return [...own, ...Object.values(record).flatMap(storyBeatReferences)]
}
