import type { NarrativeSection } from '@/payload-types'

/**
 * The story vocabulary: the section roles every Content Hub record carries,
 * and the types that read them.
 *
 * Its own module, free of Payload field factories, so a renderer that only
 * needs the roles (a hero's read figure, the RAG walk) never pulls the Lexical
 * editor config into its bundle. `./narrative` builds the record fields from
 * the same list and re-exports it, so every existing import keeps working and
 * there is still one source for the roles.
 */

export const STORY_SECTIONS = [
  'context',
  'challenge',
  'strategy',
  'approach',
  'outcome-summary',
  'learnings',
] as const

export type StorySectionSource = (typeof STORY_SECTIONS)[number]
export type StorySource = StorySectionSource | 'custom'

/**
 * Options for a block `source` select that writes its own copy by default.
 * The order is the stored Postgres enum order: never reorder.
 */
export const STORY_SOURCE_OPTIONS = ['custom', ...STORY_SECTIONS] as const

export const STORY_SCOPES = ['overview', 'section', 'beat'] as const
export type StoryScope = (typeof STORY_SCOPES)[number]

/** @deprecated Read-only: drafts saved before `storyScope` existed. */
export const LEGACY_SCOPE_OVERVIEW = '__overview__'
/** @deprecated Read-only: drafts saved before `storyScope` existed. */
export const LEGACY_SCOPE_SECTION = '__section__'

/** True when `storyBeatKey` addresses one reusable beat, not a legacy scope sentinel. */
export const isStoryBeatKey = (key: unknown): key is string =>
  typeof key === 'string' &&
  key.length > 0 &&
  key !== LEGACY_SCOPE_OVERVIEW &&
  key !== LEGACY_SCOPE_SECTION

type StorySectionDefinition = {
  field: string
  label: string
  source: StorySectionSource
}

export const STORY_SECTION_DEFINITIONS = [
  { source: 'context', field: 'context', label: 'Context' },
  { source: 'challenge', field: 'challenge', label: 'Challenge' },
  { source: 'strategy', field: 'strategy', label: 'Strategy' },
  { source: 'approach', field: 'approach', label: 'Approach' },
  { source: 'outcome-summary', field: 'outcomeSummary', label: 'Outcomes' },
  { source: 'learnings', field: 'learnings', label: 'Learnings' },
] as const satisfies readonly StorySectionDefinition[]

export type StoryField = (typeof STORY_SECTION_DEFINITIONS)[number]['field']

/** Any Content Hub record that carries the story sections. */
export type StoryRecord = Partial<Record<StoryField, NarrativeSection | null>>

export type StoryBody = NonNullable<NarrativeSection['body']>

/** Select/populate entry for every story section, for reads that render a record's story. */
export const STORY_SECTION_SELECT = Object.fromEntries(
  STORY_SECTION_DEFINITIONS.map(({ field }) => [field, true]),
) as Record<StoryField, true>
