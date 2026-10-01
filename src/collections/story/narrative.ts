import {
  isStoryBeatKey,
  LEGACY_SCOPE_OVERVIEW,
  LEGACY_SCOPE_SECTION,
  STORY_SCOPES,
  STORY_SECTION_DEFINITIONS,
  STORY_SECTIONS,
  type StoryBody,
  type StoryRecord,
  type StoryScope,
  type StorySectionSource,
  type StorySource,
} from './sections'

export * from './sections'

/**
 * The canonical story model shared by every Content Hub record a website page
 * presents: Case Study Content (Work Pages) and Lab Projects (Lab Pages). Both
 * records carry the same story roles, so one vocabulary drives the record
 * fields, the `source` select on every story-capable block, the Story Beat
 * picker, validation, rendering, and the RAG walk.
 *
 * This module reads story records and stays free of Payload runtime imports, so
 * a renderer (and its Storybook story) can resolve copy without bundling the
 * CMS. The record fields live in `./fields`.
 */

const definitionFor = (source: StorySectionSource) =>
  STORY_SECTION_DEFINITIONS.find((definition) => definition.source === source)

export const getStorySection = (record: StoryRecord, source: StorySectionSource) => {
  const definition = definitionFor(source)
  return definition ? record[definition.field] : undefined
}

const findStoryBeat = (record: StoryRecord, source: StorySectionSource, key?: string | null) =>
  key ? getStorySection(record, source)?.storyBeats?.find((beat) => beat.key === key) : undefined

const composeStoryBodies = (bodies: Array<StoryBody | null | undefined>) => {
  const populated = bodies.filter((body): body is StoryBody => Boolean(body?.root))
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
const resolveStoryScope = (
  storyScope?: StoryScope | null,
  storyBeatKey?: string | null,
): StoryScope => {
  if (storyScope && STORY_SCOPES.includes(storyScope)) return storyScope
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
export const resolveStoryBody = (
  record: StoryRecord,
  source: StorySource | null | undefined,
  storyBeatKey?: string | null,
  storyScope?: StoryScope | null,
) => {
  if (!source || source === 'custom') return null
  const section = getStorySection(record, source)
  if (!section) return null
  const scope = resolveStoryScope(storyScope, storyBeatKey)
  if (scope === 'overview') return section.body || null
  if (scope === 'beat') {
    return isStoryBeatKey(storyBeatKey)
      ? section.storyBeats?.find((beat) => beat.key === storyBeatKey)?.body
      : null
  }

  return composeStoryBodies([section.body, ...(section.storyBeats || []).map((beat) => beat.body)])
}

/**
 * The heading a selected Story Beat carries (its public heading, else its
 * label). Undefined unless the presentation is scoped to one beat, so a stale
 * key left behind after switching to the overview never names the copy.
 */
export const resolveStoryBeatHeading = (
  record: StoryRecord,
  source: StorySource | null | undefined,
  storyBeatKey?: string | null,
  storyScope?: StoryScope | null,
) => {
  if (!source || source === 'custom') return undefined
  if (resolveStoryScope(storyScope, storyBeatKey) !== 'beat') return undefined
  const beat = findStoryBeat(record, source, storyBeatKey)
  return beat?.heading || beat?.label || undefined
}

/**
 * Heading for a presentation that left its own heading empty: the beat's
 * heading when a beat is selected, otherwise the canonical section name.
 */
export const resolveStoryHeading = (
  record: StoryRecord,
  source: StorySource | null | undefined,
  storyBeatKey?: string | null,
  storyScope?: StoryScope | null,
) => {
  if (!source || source === 'custom') return undefined
  return (
    resolveStoryBeatHeading(record, source, storyBeatKey, storyScope) ||
    definitionFor(source)?.label
  )
}

export type StoryBeatReference = {
  key: string
  section: StorySectionSource
}

const isStorySectionSource = (value: unknown): value is StorySectionSource =>
  typeof value === 'string' && STORY_SECTIONS.some((source) => source === value)

const isStoryScope = (value: unknown): value is StoryScope =>
  typeof value === 'string' && STORY_SCOPES.some((scope) => scope === value)

/**
 * Find Story Beat references at any depth, including Section children and Tabs
 * rows. Only rows scoped to a beat reference one: a key left behind after the
 * editor switched to the overview or the entire section renders nothing.
 */
export const storyBeatReferences = (value: unknown): StoryBeatReference[] => {
  if (Array.isArray(value)) return value.flatMap(storyBeatReferences)
  if (!value || typeof value !== 'object') return []

  const record = value as Record<string, unknown>
  const scope = resolveStoryScope(
    isStoryScope(record.storyScope) ? record.storyScope : null,
    typeof record.storyBeatKey === 'string' ? record.storyBeatKey : null,
  )
  const own =
    isStorySectionSource(record.source) && isStoryBeatKey(record.storyBeatKey) && scope === 'beat'
      ? [{ section: record.source, key: record.storyBeatKey }]
      : []

  return [...own, ...Object.values(record).flatMap(storyBeatReferences)]
}
