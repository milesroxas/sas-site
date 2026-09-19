/**
 * The visitor's journey: which pages of the site this tab has shown and how
 * far each was read, so a question asked from any Ask surface arrives with
 * where the visitor is and what they have been reading. Client-safe and pure:
 * the session (AskSession.tsx) keeps the visits, the endpoint reads them.
 *
 * Three rules:
 * - Memory only. The journey lives in the session's React state: nothing is
 *   written to the device, nothing carries an id, and it leaves the browser
 *   only beside a question the visitor chose to ask.
 * - The wire carries paths and numbers, never words. A client can send
 *   anything, so the endpoint resolves each path to the title the site
 *   itself published (journeyPages.ts) before a model or the judge reads it.
 * - Code does what code can. Dwell, depth, order and the cap are computed
 *   here; the judge never counts or compares times (jev-1.13 jaggedness).
 */

/** One page of the journey as the browser reports it. */
export type AskJourneyVisit = {
  path: string
  /** Seconds the page was on screen in a visible tab, across every visit to it. */
  seconds: number
  /** The deepest the page was scrolled, as a percentage of its height. */
  depth: number
}

/** How a page was taken in: the one judgment the journey makes, and code makes it. */
export type AskJourneyEngagement = 'read' | 'skimmed'

export const ASK_JOURNEY = {
  /** Visits sent with a question, the most recent kept. */
  maxVisits: 8,
  /** A page counts for this long at most, so a tab left open does not read as study. */
  maxSeconds: 600,
  /** On screen this long, a page was read, however far it was scrolled. */
  readSeconds: 20,
  /** Scrolled this deep, a page was read once it was on screen for `readDeepSeconds`. */
  readDepth: 60,
  readDeepSeconds: 8,
} as const

const PAGE_PATH = /^\/[A-Za-z0-9/_-]{0,200}$/

export function journeyEngagement(visit: AskJourneyVisit): AskJourneyEngagement {
  if (visit.seconds >= ASK_JOURNEY.readSeconds) return 'read'
  return visit.depth >= ASK_JOURNEY.readDepth && visit.seconds >= ASK_JOURNEY.readDeepSeconds
    ? 'read'
    : 'skimmed'
}

const clamp = (value: unknown, max: number): number =>
  typeof value === 'number' && Number.isFinite(value)
    ? Math.min(max, Math.max(0, Math.round(value)))
    : 0

/**
 * The journey from a request body: plain paths and clamped numbers, one entry
 * per path (the later one wins its place), the most recent `maxVisits` kept in
 * order. Anything malformed is dropped; a missing journey is an empty one.
 */
export function journeyFrom(value: unknown): AskJourneyVisit[] {
  if (!Array.isArray(value)) return []
  const visits = new Map<string, AskJourneyVisit>()
  for (const entry of value.slice(-ASK_JOURNEY.maxVisits * 4)) {
    if (!entry || typeof entry !== 'object') continue
    const { path, seconds, depth } = entry as Record<string, unknown>
    if (typeof path !== 'string' || !PAGE_PATH.test(path)) continue
    visits.delete(path)
    visits.set(path, {
      path,
      seconds: clamp(seconds, ASK_JOURNEY.maxSeconds),
      depth: clamp(depth, 100),
    })
  }
  return [...visits.values()].slice(-ASK_JOURNEY.maxVisits)
}

/** A visit in progress: `since` is when the tab last became visible on it, null while hidden. */
export type AskJourneyOpenVisit = AskJourneyVisit & { since: number | null }

/** The seconds a visit has counted so far, the open stretch included. */
export const openVisitSeconds = (visit: AskJourneyOpenVisit, now: number): number =>
  visit.seconds + (visit.since === null ? 0 : (now - visit.since) / 1000)

/**
 * The journey as it is sent: every closed visit with the open one folded in
 * at the end (the current page is always last), merged per path.
 */
export function journeyDigest(
  closed: Iterable<AskJourneyVisit>,
  open: AskJourneyOpenVisit | null,
  now: number,
): AskJourneyVisit[] {
  const visits = new Map<string, AskJourneyVisit>()
  for (const visit of closed) visits.set(visit.path, visit)
  if (open) {
    const earlier = visits.get(open.path)
    visits.delete(open.path)
    visits.set(open.path, {
      path: open.path,
      seconds: (earlier?.seconds ?? 0) + openVisitSeconds(open, now),
      depth: Math.max(earlier?.depth ?? 0, open.depth),
    })
  }
  return journeyFrom([...visits.values()])
}
