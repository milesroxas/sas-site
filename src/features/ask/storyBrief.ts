import type { Payload } from 'payload'
import { STORY_SECTION_DEFINITIONS, STORY_SECTION_SELECT } from '@/collections/story/sections'
import type { CaseStudy, Project } from '@/payload-types'
import { lexicalToMarkdownString } from '@/shared/content/lexicalToMarkdown'
import { surfaceByCollection } from '@/shared/content/surfaces'
import type { RetrievedSource } from './retrieve'

/**
 * What the site can honestly say about a case study whose story is not
 * written yet. A work page may publish with little more than its images: the
 * record then holds a client, the kinds of work, a summary and maybe a list
 * of deliverables, and a question about it used to end in a vague answer or
 * "the site doesn't cover that". The brief is those facts, read as the public
 * reads them, and the measure that says the story is thin. Code owns both:
 * whether a record is thin is arithmetic, never a judgment (judge.ts decides
 * only whether the question leans on the page). Server only.
 */
export type AskStoryBrief = {
  /** The work page's path and title: the source the brief is filed under. */
  path: string
  title: string
  client: string | null
  /** The client's other names (its short name), for `namesStory`. */
  aliases: string[]
  project: string | null
  /** The case study's featured capabilities first, then the project's others. */
  capabilities: string[]
  industries: string[]
  platforms: string[]
  /** The fullest summary the record has. */
  summary: string | null
  deliverables: { title: string; description: string | null }[]
  /** Words across the six story sections, overviews and beats. */
  storyWords: number
  thin: boolean
}

/**
 * Story words below which a case study is still being written. Measured on
 * production 2026-09-21: the written ones hold 411 to 732 words across four
 * to six sections, the unwritten ones 82 to 148 in one or two, so 200 sits in
 * the gap. A number edit, like every threshold in `ASK_JUDGE_THRESHOLDS`.
 */
export const THIN_STORY_WORDS = 200

const WORK_PAGES = 'work-pages'

const words = (text: string): number => text.split(/\s+/).filter(Boolean).length

type StorySections = Pick<CaseStudy, (typeof STORY_SECTION_DEFINITIONS)[number]['field']>

/** Words a reader would find in the record's story: every section's overview and beats. */
export function storyWords(record: Partial<StorySections>): number {
  return STORY_SECTION_DEFINITIONS.reduce((total, { field }) => {
    const section = record[field]
    if (!section) return total
    const beats = (section.storyBeats ?? []).reduce(
      (sum, beat) => sum + words(beat.heading ?? '') + words(lexicalToMarkdownString(beat.body)),
      0,
    )
    return total + words(lexicalToMarkdownString(section.body)) + beats
  }, 0)
}

const named = <T extends { name?: string | null }>(items: (number | T)[] | null | undefined) =>
  (items ?? []).flatMap((item) =>
    typeof item === 'object' && item.name?.trim() ? [item.name.trim()] : [],
  )

/** Pure half, tested without a database: the populated record in, the brief out. */
export function storyBriefFrom(
  page: { path: string; title: string },
  caseStudy: Pick<CaseStudy, 'summaries' | 'featuredCapabilities'> & Partial<StorySections>,
  project: Project | null,
): AskStoryBrief {
  const organization = typeof project?.organization === 'object' ? project.organization : null
  const count = storyWords(caseStudy)
  const summaries = caseStudy.summaries
  return {
    ...page,
    client: organization?.name?.trim() || null,
    aliases: organization?.shortName?.trim() ? [organization.shortName.trim()] : [],
    project: project?.publicTitle?.trim() || null,
    capabilities: [
      ...new Set([...named(caseStudy.featuredCapabilities), ...named(project?.capabilities)]),
    ],
    industries: named(project?.industries),
    platforms: named(project?.platforms),
    summary:
      summaries?.medium?.trim() || summaries?.short?.trim() || summaries?.oneLine?.trim() || null,
    deliverables: (project?.deliverables ?? []).flatMap((item) =>
      item.title?.trim()
        ? [{ title: item.title.trim(), description: item.description?.trim() || null }]
        : [],
    ),
    storyWords: count,
    thin: count < THIN_STORY_WORDS,
  }
}

/** The brief as a source's text, in the labels the corpus already uses (shared/content/extract.ts). */
export function storyBriefText(brief: AskStoryBrief): string {
  const lines = [
    brief.client ? `Client: ${brief.client}` : '',
    brief.project ? `Project: ${brief.project}` : '',
    brief.capabilities.length ? `Capabilities: ${brief.capabilities.join(', ')}` : '',
    brief.industries.length ? `Industries: ${brief.industries.join(', ')}` : '',
    brief.platforms.length ? `Platforms: ${brief.platforms.join(', ')}` : '',
    brief.summary ?? '',
    brief.deliverables.length
      ? `Deliverables:\n${brief.deliverables
          .map(({ title, description }) => `- ${title}${description ? `: ${description}` : ''}`)
          .join('\n')}`
      : '',
  ]
  return lines.filter(Boolean).join('\n')
}

/**
 * The brief as the turn's first source. Whatever retrieval found of the same
 * page (a testimonial, an approved result) stays, under the brief, so the
 * page is one source and the kinds of work are always in it.
 */
export function withStoryBrief(
  sources: RetrievedSource[],
  brief: AskStoryBrief,
): RetrievedSource[] {
  const same = sources.find((source) => source.url === brief.path)
  const text = [storyBriefText(brief), same?.text].filter(Boolean).join('\n\n')
  return [
    { title: brief.title, url: brief.path, text, similarity: same?.similarity ?? 1 },
    ...sources.filter((source) => source !== same),
  ]
}

const normalize = (text: string): string =>
  text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()

/** Names shorter than this are words too ("Arc", "Go"), and match nothing. */
const MIN_NAME_CHARS = 4
const MIN_JOINED_NAME_CHARS = 8

/**
 * Whether the question names the brief's own subject: the page's title, the
 * client, or its short name, as whole words ("GentleBeast" and "Gentle Beast"
 * are one name). An exact lookup, so it is code's; a question that points at
 * the page without naming it ("them", "this project") is the judge's
 * `open_reference`.
 */
export function namesStory(question: string, brief: AskStoryBrief): boolean {
  const asked = ` ${normalize(question)} `
  const squashed = asked.replaceAll(' ', '')
  return [brief.title, brief.client, ...brief.aliases].some((name) => {
    const wanted = name ? normalize(name) : ''
    if (wanted.length < MIN_NAME_CHARS) return false
    if (asked.includes(` ${wanted} `)) return true
    // Spacing is not spelling: only a name long enough not to sit inside another word.
    const joined = wanted.replaceAll(' ', '')
    return joined.length >= MIN_JOINED_NAME_CHARS && squashed.includes(joined)
  })
}

/**
 * Two small reads per work page per instance per minute, not per question:
 * the index's pages are the only paths ever asked for, so the map is bounded.
 */
const BRIEF_TTL_MS = 60_000
const cached = new Map<string, { at: number; brief: Promise<AskStoryBrief | null> }>()

async function loadStoryBrief(payload: Payload, path: string): Promise<AskStoryBrief | null> {
  const prefix = `${surfaceByCollection.get(WORK_PAGES)?.urlPrefix ?? ''}/`
  const slug = path.startsWith(prefix) ? path.slice(prefix.length) : ''
  if (!slug || slug.includes('/')) return null

  // No user and `overrideAccess: false`: the brief holds only what an
  // anonymous visitor could read, as the corpus does.
  const { docs } = await payload.find({
    collection: WORK_PAGES,
    depth: 0,
    draft: false,
    overrideAccess: false,
    limit: 1,
    pagination: false,
    select: { title: true, caseStudy: true },
    where: { slug: { equals: slug } },
  })
  const page = docs[0]
  const caseStudyId = typeof page?.caseStudy === 'object' ? page.caseStudy.id : page?.caseStudy
  if (!page || caseStudyId == null) return null

  // Depth 2 reaches the project's client and taxonomy; the select keeps the
  // record's media and testimonials out of the read.
  const caseStudy = await payload.findByID({
    collection: 'case-studies',
    id: caseStudyId,
    depth: 2,
    draft: false,
    overrideAccess: false,
    disableErrors: true,
    select: { ...STORY_SECTION_SELECT, summaries: true, featuredCapabilities: true, project: true },
  })
  if (!caseStudy) return null

  const project = typeof caseStudy.project === 'object' ? caseStudy.project : null
  return storyBriefFrom({ path, title: page.title }, caseStudy, project)
}

/**
 * The brief for the work page at `path`, or null when the path is not a
 * published work page with a published case study. Never throws: no brief is
 * a turn like any before it.
 */
export async function resolveStoryBrief(
  payload: Payload,
  path: string,
): Promise<AskStoryBrief | null> {
  const entry = cached.get(path)
  if (entry && Date.now() - entry.at <= BRIEF_TTL_MS) return entry.brief

  const brief = loadStoryBrief(payload, path).catch((err: unknown) => {
    payload.logger.warn({ msg: 'ask story brief: read failed', err })
    // A failed read is not kept for the minute.
    if (cached.get(path)?.brief === brief) cached.delete(path)
    return null
  })
  cached.set(path, { at: Date.now(), brief })
  return brief
}
