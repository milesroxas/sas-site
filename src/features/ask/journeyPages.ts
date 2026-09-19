import type { Payload } from 'payload'
import {
  globalSurfaceBySlug,
  indexedSourcePath,
  surfaceByCollection,
} from '@/shared/content/surfaces'
import { listIndexedDocs } from './embeddings'
import { type AskJourneyEngagement, type AskJourneyVisit, journeyEngagement } from './journey'

/**
 * The journey as the judge and the writing model may read it. The browser
 * sends paths and numbers (journey.ts); the words come from here: each path
 * is matched to a document in the Ask index, so a title is always one the
 * site published and a path the index does not know (the /ask page, a 404, a
 * made-up path) is dropped. Server only.
 */
export type AskJourneyPage = {
  path: string
  title: string
  /** The section of the site the page sits in, from the surface registry: "Work", "Expertise", "Insights". */
  section: string
  /**
   * The page is about one thing a question can lean on: a client, a service,
   * an audience, an article. The homepage, the index pages, contact and the
   * legal pages are about everything or nothing, and "it" never means them.
   */
  subject: boolean
  engagement: AskJourneyEngagement
}

export type AskJourneyContext = {
  /** The page the question was asked on, when the index knows it. */
  current: AskJourneyPage | null
  /** Pages read before it, oldest first. Skimmed pages say little, so they are left out. */
  read: AskJourneyPage[]
}

export const EMPTY_JOURNEY: AskJourneyContext = { current: null, read: [] }

type IndexedPage = Pick<AskJourneyPage, 'title' | 'section' | 'subject'>

const SUBJECT_COLLECTIONS: ReadonlySet<string> = new Set([
  'work-pages',
  'lab-pages',
  'expertise-pages',
  'audience-pages',
  'posts',
])

/**
 * The index changes on publish, a visitor's question does not wait on it:
 * one small DISTINCT per instance per minute, not one per question.
 */
const PAGES_TTL_MS = 60_000
let cached: { at: number; pages: Promise<Map<string, IndexedPage>> } | null = null

async function loadIndexedPages(payload: Payload): Promise<Map<string, IndexedPage>> {
  const pages = new Map<string, IndexedPage>()
  for (const doc of await listIndexedDocs(payload)) {
    const path = indexedSourcePath(doc.collection, doc.slug)
    if (!path) continue
    const surface = surfaceByCollection.get(doc.collection)
    // A collection document wins a path it shares with a global (/contact is
    // the contact page before it is Site Info).
    if (!surface && pages.has(path)) continue
    pages.set(path, {
      title: doc.title,
      section: surface?.title ?? globalSurfaceBySlug.get(doc.collection)?.title ?? 'Pages',
      subject: SUBJECT_COLLECTIONS.has(doc.collection),
    })
  }
  return pages
}

function indexedPages(payload: Payload): Promise<Map<string, IndexedPage>> {
  if (!cached || Date.now() - cached.at > PAGES_TTL_MS) {
    const pages = loadIndexedPages(payload)
    cached = { at: Date.now(), pages }
    // A failed read is not kept for the minute.
    pages.catch(() => {
      if (cached?.pages === pages) cached = null
    })
  }
  return cached.pages
}

/** Pure half, tested without a database: visits in, the readable journey out. */
export function journeyContext(
  visits: AskJourneyVisit[],
  pagePath: string | null,
  pages: ReadonlyMap<string, IndexedPage>,
): AskJourneyContext {
  const known = visits.flatMap((visit): AskJourneyPage[] => {
    const page = pages.get(visit.path)
    return page ? [{ path: visit.path, ...page, engagement: journeyEngagement(visit) }] : []
  })
  const asked = pagePath ? pages.get(pagePath) : undefined
  const current =
    known.find((page) => page.path === pagePath) ??
    // A question sent before the page's first visit was counted still has a page.
    (asked && pagePath ? { path: pagePath, ...asked, engagement: 'skimmed' as const } : null)
  return {
    current,
    read: known.filter((page) => page.path !== pagePath && page.engagement === 'read'),
  }
}

/** The visitor's journey for this turn. Never throws: no journey is a turn like any before it. */
export async function resolveJourney(
  payload: Payload,
  visits: AskJourneyVisit[],
  pagePath: string | null,
): Promise<AskJourneyContext> {
  if (visits.length === 0 && !pagePath) return EMPTY_JOURNEY
  try {
    return journeyContext(visits, pagePath, await indexedPages(payload))
  } catch (err) {
    payload.logger.warn({ msg: 'ask journey: index read failed', err })
    return EMPTY_JOURNEY
  }
}
