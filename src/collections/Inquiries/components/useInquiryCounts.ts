'use client'

import { useAuth, useConfig } from '@payloadcms/ui'
import { useCallback, useEffect, useSyncExternalStore } from 'react'
import { countDocs } from '@/components/admin/rest'
import { assignedToQuery, INQUIRY_QUERIES } from './queries'

export type InquiryCounts = {
  /** Nobody has picked these up yet. */
  new: number
  /** New or in progress: everything still owed an answer. */
  open: number
  /** Open and assigned to the person looking at the screen. */
  mine: number
  /** Marked spam and waiting to be deleted. */
  spam: number
}

const EMPTY: InquiryCounts = { new: 0, open: 0, mine: 0, spam: 0 }

type CountsState = {
  counts: InquiryCounts
  /** False until the first answer, so a reader can tell zero from not yet. */
  loaded: boolean
  /** A round of requests is in the air. */
  refreshing: boolean
  /** When the numbers on screen were counted. */
  refreshedAt: Date | null
}

const INITIAL: CountsState = { counts: EMPTY, loaded: false, refreshing: false, refreshedAt: null }

/**
 * One store, however many readers, and no clock.
 *
 * The dashboard renders the inbox panel and the nav badge side by side, and
 * both want the same numbers, so every reader shares one snapshot. The counts
 * are taken once per page load (and again when a different user signs in);
 * after that they move only when someone presses Refresh or changes an
 * inquiry. A poller used to run every minute on every admin screen, which
 * was four function invocations a minute per open tab for numbers nobody was
 * watching.
 */
const listeners = new Set<() => void>()
let state: CountsState = INITIAL
/** `api` and user the current numbers were counted for. */
let countedFor: string | undefined
let inFlight: Promise<void> | undefined

const setState = (next: CountsState) => {
  state = next
  for (const listener of listeners) listener()
}

const sameCounts = (a: InquiryCounts, b: InquiryCounts) =>
  a.new === b.new && a.open === b.open && a.mine === b.mine && a.spam === b.spam

async function fetchCounts(api: string, userId: number | string | undefined) {
  const count = (query: string) => countDocs(api, 'inquiries', query)

  const [newCount, openCount, mineCount, spamCount] = await Promise.all([
    count(INQUIRY_QUERIES.new),
    count(INQUIRY_QUERIES.open),
    userId ? count(assignedToQuery(userId)) : Promise.resolve(0),
    count(INQUIRY_QUERIES.spam),
  ])

  const next = { new: newCount, open: openCount, mine: mineCount, spam: spamCount }
  // Same numbers, same object: `useSyncExternalStore` readers that only look
  // at `counts` can compare by identity.
  const counts = state.loaded && sameCounts(state.counts, next) ? state.counts : next
  setState({ counts, loaded: true, refreshing: false, refreshedAt: new Date() })
}

/** Concurrent callers share one round of requests rather than racing a round each. */
function refreshCounts(api: string, userId: number | string | undefined) {
  if (inFlight) return inFlight
  countedFor = `${api}\u0000${userId ?? ''}`
  setState({ ...state, refreshing: true })
  inFlight = fetchCounts(api, userId)
    .catch(() => {
      // Leave the last known counts in place; the next press retries.
      setState({ ...state, refreshing: false })
    })
    .finally(() => {
      inFlight = undefined
    })
  return inFlight
}

const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

const getSnapshot = () => state

/**
 * The numbers the inbox is judged by.
 *
 * Returns `refresh` for the Refresh button and for the callers that have just
 * changed something, `refreshing` while a round is in the air, `refreshedAt`
 * for the "as of" beside the button, and `loaded`, false until the first
 * answer, so a reader can hold a place rather than show a zero it has not
 * counted.
 */
export function useInquiryCounts() {
  const {
    config: {
      routes: { api },
    },
  } = useConfig()
  const { user } = useAuth()
  const userId = user?.id

  const { counts, loaded, refreshing, refreshedAt } = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getSnapshot,
  )
  const refresh = useCallback(() => refreshCounts(api, userId), [api, userId])

  // First reader on a page load counts once; a reader mounting later, or on
  // the next admin screen, reads what is there. A different user signing in
  // counts again, so "assigned to me" is theirs.
  useEffect(() => {
    if (countedFor !== `${api}\u0000${userId ?? ''}`) void refreshCounts(api, userId)
  }, [api, userId])

  return { counts, loaded, refresh, refreshing, refreshedAt }
}
