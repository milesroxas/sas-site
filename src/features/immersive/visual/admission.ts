import { STREAK_LIVE_CEILING } from './placement'

/**
 * Admission for live Streak Fields: at most `STREAK_LIVE_CEILING` animated
 * fields per document, highest priority first. Slots hold a lease while they
 * want to draw and release it when hidden, covered, paused or unmounted.
 * Registration is idempotent and reference-counted per slot id, so a
 * double-invoked effect or a stale cleanup never turns off another slot.
 *
 * A plain module store with a subscription, not React state: slots read it
 * with `useSyncExternalStore` and the runtime never re-renders on it.
 */

type Lease = { id: string; priority: number; order: number }

const wanting = new Map<string, Lease>()
const listeners = new Set<() => void>()
let order = 0
let admitted: ReadonlySet<string> = new Set()

const recompute = () => {
  const ranked = [...wanting.values()].sort((a, b) => b.priority - a.priority || a.order - b.order)
  const next = new Set(ranked.slice(0, STREAK_LIVE_CEILING).map((lease) => lease.id))
  const changed = next.size !== admitted.size || [...next].some((id) => !admitted.has(id))
  if (!changed) return
  admitted = next
  for (const listener of listeners) listener()
}

/**
 * Ask for a lease. Returns a release that is safe to call more than once.
 * Calling `request` again for the same id updates its priority and keeps
 * its place in line.
 */
export function requestStreakLease(id: string, priority: number): () => void {
  const existing = wanting.get(id)
  if (existing) {
    if (existing.priority !== priority) {
      existing.priority = priority
      recompute()
    }
  } else {
    wanting.set(id, { id, priority, order: order++ })
    recompute()
  }
  let released = false
  return () => {
    if (released) return
    released = true
    if (wanting.get(id) === undefined) return
    wanting.delete(id)
    recompute()
  }
}

export const isStreakAdmitted = (id: string): boolean => admitted.has(id)

export function subscribeStreakAdmission(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/** Snapshot for instrumentation and tests. */
export const streakAdmissionState = () => ({
  wanting: [...wanting.keys()],
  admitted: [...admitted],
})

/** Test seam: drop every lease. */
export function resetStreakAdmissionForTests() {
  wanting.clear()
  admitted = new Set()
  order = 0
}
