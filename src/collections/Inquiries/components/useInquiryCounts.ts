'use client'

import { useAuth, useConfig } from '@payloadcms/ui'
import { useCallback, useEffect, useSyncExternalStore } from 'react'
import { countDocs } from '@/components/admin/rest'
import { assignedToQuery, INQUIRY_QUERIES } from './queries'

export type InquiryCounts = {
  /** Nobody has picked these up yet. */
  new: number
  /** New or in progress — everything still owed an answer. */
  open: number
  /** Open and assigned to the person looking at the screen. */
  mine: number
  /** Marked spam and waiting to be deleted. */
  spam: number
}

const EMPTY: InquiryCounts = { new: 0, open: 0, mine: 0, spam: 0 }

/** Refresh cadence while any admin screen is open. */
const POLL_INTERVAL_MS = 60_000

/**
 * One poller, however many readers.
 *
 * The dashboard renders the inbox panel and the nav badge side by side, and
 * both want the same numbers — a hook that polled per component would
 * fire six identical requests a minute and answer them at different moments,
 * so the badge and the panel could disagree on screen. The store below keeps a
 * single interval alive while at least one component is mounted, and hands
 * every reader the same snapshot.
 */
const listeners = new Set<() => void>()
let snapshot: InquiryCounts = EMPTY
let timer: ReturnType<typeof setInterval> | undefined
let inFlight: Promise<void> | undefined
/**
 * What the shared interval should ask for. Held outside the closure because
 * the interval outlives any one component: whoever mounted first would
 * otherwise pin the poll to their `userId` for the rest of the session, and
 * "assigned to me" would keep counting the previous user's work after a
 * re-login.
 */
let pollArgs: { api: string; userId: number | string | undefined } | undefined

const emit = (next: InquiryCounts) => {
  // Same numbers, same object: `useSyncExternalStore` compares by identity, so
  // a fresh object every minute would re-render every reader for nothing.
  if (
    next.new === snapshot.new &&
    next.open === snapshot.open &&
    next.mine === snapshot.mine &&
    next.spam === snapshot.spam
  ) {
    return
  }
  snapshot = next
  for (const listener of listeners) listener()
}

async function fetchCounts(api: string, userId: number | string | undefined) {
  const count = (query: string) => countDocs(api, 'inquiries', query)

  const [newCount, openCount, mineCount, spamCount] = await Promise.all([
    count(INQUIRY_QUERIES.new),
    count(INQUIRY_QUERIES.open),
    userId ? count(assignedToQuery(userId)) : Promise.resolve(0),
    count(INQUIRY_QUERIES.spam),
  ])

  emit({ new: newCount, open: openCount, mine: mineCount, spam: spamCount })
}

/** Concurrent callers share one round of requests rather than racing a round each. */
function refreshCounts(api: string, userId: number | string | undefined) {
  inFlight ??= fetchCounts(api, userId)
    .catch(() => {
      // Leave the last known counts in place; the next tick retries.
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
    if (listeners.size === 0 && timer) {
      clearInterval(timer)
      timer = undefined
    }
  }
}

const getSnapshot = () => snapshot

/**
 * The numbers the inbox is judged by.
 *
 * Returns `refresh` for the callers that have just changed something and
 * should not wait out the interval to see it.
 */
export function useInquiryCounts() {
  const {
    config: {
      routes: { api },
    },
  } = useConfig()
  const { user } = useAuth()
  const userId = user?.id

  const counts = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
  const refresh = useCallback(() => refreshCounts(api, userId), [api, userId])

  useEffect(() => {
    pollArgs = { api, userId }
    void refreshCounts(api, userId)
    timer ??= setInterval(() => {
      if (pollArgs) void refreshCounts(pollArgs.api, pollArgs.userId)
    }, POLL_INTERVAL_MS)
  }, [api, userId])

  return { counts, refresh }
}
