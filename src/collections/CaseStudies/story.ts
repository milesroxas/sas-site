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

export const CASE_STUDY_STORY_SCOPES = ['overview', 'section', 'beat'] as const
export type CaseStudyStoryScope = (typeof CASE_STUDY_STORY_SCOPES)[number]

/** @deprecated Read-only: drafts saved before `storyScope` existed. */
const LEGACY_SCOPE_OVERVIEW = '__overview__'
/** @deprecated Read-only: drafts saved before `storyScope` existed. */
const LEGACY_SCOPE_SECTION = '__section__'

/** True when `storyBeatKey` addresses one reusable beat, not a legacy scope sentinel. */
export const isStoryBeatKey = (key: unknown): key is string =>
  typeof key === 'string' &&
  key.length > 0 &&
  key !== LEGACY_SCOPE_OVERVIEW &&
  key !== LEGACY_SCOPE_SECTION

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
    bodyDescription: 'The problem being solved.',
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
    bodyDescription: 'The overall result of the engagement.',
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
 * Which slice of a canonical section a presentation uses. `storyScope` is the
 * source of truth; empty `storyBeatKey` with no scope still means the complete
 * section so existing pages keep their published copy.
 */
export const resolveCaseStudyStoryScope = (
  storyScope?: CaseStudyStoryScope | null,
  storyBeatKey?: string | null,
): CaseStudyStoryScope => {
  if (storyScope && CASE_STUDY_STORY_SCOPES.includes(storyScope)) return storyScope
  if (storyBeatKey === LEGACY_SCOPE_OVERVIEW) return 'overview'
  if (storyBeatKey === LEGACY_SCOPE_SECTION) return 'section'
  if (isStoryBeatKey(storyBeatKey)) return 'beat'
  return 'section'
}

/**
 * Resolve canonical story copy for a presentation block. Overview is the
 * section summary; a beat is that beat; section is the overview followed by
 * every beat in order.
 */
export const resolveCaseStudyStoryBody = (
  study: CaseStudy,
  source: CaseStudyStorySource | null | undefined,
  storyBeatKey?: string | null,
  storyScope?: CaseStudyStoryScope | null,
) => {
  if (!source || source === 'custom') return null
  const section = getCaseStudyStorySection(study, source)
  if (!section) return null
  const scope = resolveCaseStudyStoryScope(storyScope, storyBeatKey)
  if (scope === 'overview') return section.body || null
  if (scope === 'beat') {
    return isStoryBeatKey(storyBeatKey)
      ? section.storyBeats?.find((beat) => beat.key === storyBeatKey)?.body
      : null
  }

  return composeStoryBodies([section.body, ...(section.storyBeats || []).map((beat) => beat.body)])
}

/**
 * Heading for a presentation that left its own heading empty: the beat's
 * heading/label when a beat is selected, otherwise the canonical section name.
 */
export const resolveCaseStudyStoryHeading = (
  study: CaseStudy,
  source: CaseStudyStorySource | null | undefined,
  storyBeatKey?: string | null,
  storyScope?: CaseStudyStoryScope | null,
) => {
  if (!source || source === 'custom') return undefined
  if (
    resolveCaseStudyStoryScope(storyScope, storyBeatKey) === 'beat' &&
    isStoryBeatKey(storyBeatKey)
  ) {
    const beat = findCaseStudyStoryBeat(study, source, storyBeatKey)
    return beat?.heading || beat?.label
  }
  return definitionFor(source)?.label
}

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
    isCaseStudyStorySection(record.source) && isStoryBeatKey(record.storyBeatKey)
      ? [{ section: record.source, key: record.storyBeatKey }]
      : []

  return [...own, ...Object.values(record).flatMap(storyBeatReferences)]
}
