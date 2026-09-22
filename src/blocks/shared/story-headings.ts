import { createHash } from 'node:crypto'
import {
  getStorySection,
  isStoryBeatKey,
  resolveStoryHeading,
  type StoryBody,
  type StoryRecord,
  type StoryScope,
  type StorySource,
} from '@/collections/story/narrative'
import type { ProseHeadingLevel } from './typography'

/**
 * Beat headings on the reading column. A Story beats block prints the heading
 * a beat carries on its story record; the page's own `heading` field is an
 * override, never the only source (Miles, 2026-09-22). Two things keep that
 * from wrecking the outline the article-authoring skill describes:
 *
 * - **The Section's Prose heading stays the opener.** A beat heading sits one
 *   level under it (`h2` opener, `h3` beat), or two for a short passage, and
 *   never at the opener's level or above. `sectionOpener` finds the opener in
 *   the Section's children; the renderer passes it in.
 * - **A heading that only restates the opener is not printed.** The first
 *   beat of a Section is usually opened by a Prose heading written from that
 *   beat's own heading, so a second copy would repeat it. Code hides an exact
 *   repeat; Jev decides the paraphrases and the level (`plugins/story-headings`),
 *   and its answers are stored on the block as `headingAuto`, keyed by beat and
 *   by a hash of what it read, so a changed heading falls back to the rule
 *   here until the page is saved again.
 *
 * Everything here is pure and runs at render time; nothing calls a model.
 */

export type StoryOpener = { heading: string; level: ProseHeadingLevel }

/** What Jev decided for one beat, stored on the block by the save-time plugin. */
export type BeatHeadingAuto = { hash: string; level: ProseHeadingLevel; show: boolean }

export type HeadingAuto = Record<string, BeatHeadingAuto>

export type StoryPassage = {
  body: StoryBody | null | undefined
  heading?: string
  headingLevel?: ProseHeadingLevel
  key: string
}

type StoryRef = {
  source?: StorySource | null
  storyBeatKey?: string | null
  storyScope?: StoryScope | null
}

type StoryBeatsLike = StoryRef & {
  body?: StoryBody | null
  heading?: string | null
  headingAuto?: unknown
  headingLevel?: ProseHeadingLevel | null
}

const LEVELS: readonly ProseHeadingLevel[] = ['h2', 'h3', 'h4']

/** One or two levels under the opener, never past the prose scale's last level. */
export const stepDown = (level: ProseHeadingLevel, steps: 1 | 2): ProseHeadingLevel =>
  LEVELS[Math.min(LEVELS.indexOf(level) + steps, LEVELS.length - 1)] as ProseHeadingLevel

const normalize = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()

/** An exact repeat of the opener, allowing for case and punctuation. Paraphrases are Jev's. */
export const restatesOpener = (opener: string | undefined, heading: string): boolean =>
  Boolean(opener) && normalize(opener as string) === normalize(heading)

const plainText = (body: StoryBody | null | undefined): string => {
  const walk = (node: unknown): string => {
    if (!node || typeof node !== 'object') return ''
    const { text, children } = node as { text?: unknown; children?: unknown }
    if (typeof text === 'string') return text
    return Array.isArray(children) ? children.map(walk).join(' ') : ''
  }
  return walk(body?.root).replace(/\s+/g, ' ').trim()
}

/** The opening of a beat, enough for a judgment about what the heading opens. */
export const beatOpening = (body: StoryBody | null | undefined, chars = 240): string =>
  plainText(body).slice(0, chars)

/** What a judgment read. Stored beside it, so a changed heading or opening is judged again. */
export const headingInputsHash = (
  opener: string | undefined,
  heading: string,
  opening: string,
): string =>
  createHash('sha1')
    .update(JSON.stringify([opener ?? '', heading, opening]))
    .digest('hex')
    .slice(0, 16)

const isAuto = (value: unknown): value is BeatHeadingAuto =>
  Boolean(value) &&
  typeof value === 'object' &&
  typeof (value as BeatHeadingAuto).hash === 'string' &&
  typeof (value as BeatHeadingAuto).show === 'boolean' &&
  LEVELS.includes((value as BeatHeadingAuto).level)

/** The stored judgments on a block, or none. */
export const readHeadingAuto = (value: unknown): HeadingAuto => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).filter(([, auto]) => isAuto(auto)),
  ) as HeadingAuto
}

/**
 * The Section's opener: its first Prose Standard heading, with the heading it
 * prints (written, or resolved from the story) and its level. `null` when the
 * Section has none, or for a block outside any Section.
 */
export const sectionOpener = (
  children: ReadonlyArray<{
    blockType?: string | null
    heading?: string | null
    headingLevel?: string | null
    layout?: string | null
    source?: StorySource | null
    storyBeatKey?: string | null
    storyScope?: StoryScope | null
  }>,
  record: StoryRecord,
): StoryOpener | null => {
  const opener = children.find(
    (child) => child.blockType === 'richTransition' && child.layout === 'prose',
  )
  if (!opener) return null
  const heading =
    opener.heading ||
    resolveStoryHeading(record, opener.source, opener.storyBeatKey, opener.storyScope) ||
    ''
  const level = LEVELS.includes(opener.headingLevel as ProseHeadingLevel)
    ? (opener.headingLevel as ProseHeadingLevel)
    : 'h2'
  return { heading, level }
}

/** The beats a block presents, with their record headings: one under beat scope, all under section scope. */
export const presentedBeats = (
  block: StoryRef,
  record: StoryRecord,
): Array<{ body: StoryBody | null | undefined; heading: string; key: string }> => {
  if (!block.source || block.source === 'custom') return []
  const section = getStorySection(record, block.source)
  if (!section) return []
  const beats = (section.storyBeats ?? []).map((beat) => ({
    body: beat.body,
    heading: beat.heading?.trim() ?? '',
    key: beat.key,
  }))
  if (block.storyScope === 'beat')
    return beats.filter(
      (beat) => isStoryBeatKey(block.storyBeatKey) && beat.key === block.storyBeatKey,
    )
  if (block.storyScope === 'section') return beats
  return []
}

/**
 * How one beat's heading prints under an opener: the stored judgment when it
 * still matches what it read, else the rule. A beat with no heading on the
 * record prints none.
 */
export const beatHeading = (
  beat: { body: StoryBody | null | undefined; heading: string },
  opener: StoryOpener | null,
  auto: BeatHeadingAuto | undefined,
): { heading?: string; headingLevel: ProseHeadingLevel } => {
  const fallbackLevel = opener ? stepDown(opener.level, 1) : 'h2'
  if (!beat.heading) return { headingLevel: fallbackLevel }
  const hash = headingInputsHash(opener?.heading, beat.heading, beatOpening(beat.body))
  if (auto && auto.hash === hash)
    return auto.show
      ? { heading: beat.heading, headingLevel: auto.level }
      : { headingLevel: auto.level }
  if (restatesOpener(opener?.heading, beat.heading)) return { headingLevel: fallbackLevel }
  return { heading: beat.heading, headingLevel: fallbackLevel }
}

/**
 * The passages a Story beats block renders, in order, each with the heading
 * it prints. The page's `heading` is the override: under beat scope it
 * replaces the beat's heading and level; under section scope it opens the
 * run and the beats keep their own. `custom` and `overview` print no heading
 * of their own beyond that override.
 */
export const storyBeatPassages = (
  block: StoryBeatsLike,
  record: StoryRecord,
  opener: StoryOpener | null,
): StoryPassage[] => {
  const override = block.heading?.trim()
  const overrideLevel = block.headingLevel ?? (opener ? stepDown(opener.level, 1) : 'h2')
  const auto = readHeadingAuto(block.headingAuto)
  const scope = block.storyScope ?? 'section'
  if (!block.source || block.source === 'custom' || scope === 'overview') {
    return [
      {
        body: block.body,
        heading: override || undefined,
        headingLevel: overrideLevel,
        key: scope === 'overview' ? 'overview' : 'custom',
      },
    ]
  }
  const section = getStorySection(record, block.source)
  const beats = presentedBeats(block, record).map((beat) => ({
    body: beat.body,
    key: beat.key,
    ...(override && scope === 'beat'
      ? { heading: override, headingLevel: overrideLevel }
      : beatHeading(beat, opener, auto[beat.key])),
  }))
  if (scope === 'beat') return beats
  return [
    {
      body: section?.body,
      heading: override || undefined,
      headingLevel: overrideLevel,
      key: 'overview',
    },
    ...beats,
  ]
}
