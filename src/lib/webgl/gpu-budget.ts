/**
 * The document's GPU budget: one registry for every effect that owns a
 * canvas (Streak Field, hero and work lenses, the footer light leak, the
 * scroll gallery, the global backdrop). Each holds a lease while it wants a
 * live context; the registry admits the highest-priority leases up to
 * `GPU_LIVE_CEILING` in total and `GPU_KIND_CEILINGS` per kind, ranking by
 * priority and then arrival. An effect that is not admitted keeps its DOM
 * fallback (poster, media element, nothing) and re-mounts once a slot frees.
 *
 * Alongside the leases it keeps a census of contexts that actually exist:
 * every Canvas mounts a `ContextGuard`, which reports its renderer for as
 * long as it lives. Leases say who wants to draw; the census says how many
 * contexts the page holds, including ones parked through a short suspension.
 * Both are mirrored onto `<html>` as `data-gpu-*` attributes so devtools and
 * the resource-plateau probe read real numbers, not visible canvas elements.
 *
 * Registration is idempotent and reference-counted per id, so a
 * double-invoked effect or a stale cleanup never turns another slot off. A
 * plain module store with a subscription, not React state: slots read it
 * with `useSyncExternalStore` and no frame loop re-renders on it.
 *
 * The ceilings are starting policy from the Streak Field plan ("Budgets and
 * preparation"), not measured capacity.
 */

export type GpuLeaseKind = 'streak' | 'lens' | 'leak' | 'gallery' | 'backdrop'

/** Live contexts admitted across the whole document. */
export const GPU_LIVE_CEILING = 3

/** One animated Streak Field across the document is the starting ceiling. */
export const STREAK_KIND_CEILING = 1

/** Per-kind caps; a kind without one is bounded only by the total. */
export const GPU_KIND_CEILINGS: Partial<Record<GpuLeaseKind, number>> = {
  streak: STREAK_KIND_CEILING,
}

/**
 * One priority scale for every effect, by the role it plays on the page:
 * the page's own media first, decoration last. Equal priorities keep
 * arrival order. `idle` is a context kept warm for a later route (the
 * global backdrop while no route draws on it): first to go under pressure.
 */
export const GPU_PRIORITY = {
  hero: 3,
  block: 2,
  backdrop: 1,
  overlay: 0,
  idle: -1,
} as const

type Lease = { id: string; kind: GpuLeaseKind; priority: number; order: number }
type TrackedContext = { id: string; kind: GpuLeaseKind }

const wanting = new Map<string, Lease>()
const contexts = new Map<string, TrackedContext>()
const listeners = new Set<() => void>()
let order = 0
let admitted: ReadonlySet<string> = new Set()

const mirror = () => {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  root.dataset.gpuLeases = String(wanting.size)
  root.dataset.gpuAdmitted = String(admitted.size)
  root.dataset.gpuContexts = String(contexts.size)
}

const recompute = () => {
  const ranked = [...wanting.values()].sort((a, b) => b.priority - a.priority || a.order - b.order)
  const next = new Set<string>()
  const perKind = new Map<GpuLeaseKind, number>()
  for (const lease of ranked) {
    if (next.size >= GPU_LIVE_CEILING) break
    const kindCount = perKind.get(lease.kind) ?? 0
    const kindCeiling = GPU_KIND_CEILINGS[lease.kind]
    if (kindCeiling !== undefined && kindCount >= kindCeiling) continue
    next.add(lease.id)
    perKind.set(lease.kind, kindCount + 1)
  }
  const changed = next.size !== admitted.size || [...next].some((id) => !admitted.has(id))
  mirror()
  if (!changed) return
  admitted = next
  mirror()
  for (const listener of listeners) listener()
}

/**
 * Ask for a lease. Returns a release that is safe to call more than once.
 * Calling `request` again for the same id updates its priority and keeps
 * its place in line.
 */
export function requestGpuLease(id: string, kind: GpuLeaseKind, priority: number): () => void {
  const existing = wanting.get(id)
  if (existing) {
    if (existing.priority !== priority || existing.kind !== kind) {
      existing.priority = priority
      existing.kind = kind
      recompute()
    }
  } else {
    wanting.set(id, { id, kind, priority, order: order++ })
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

export const isGpuAdmitted = (id: string): boolean => admitted.has(id)

export function subscribeGpuAdmission(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/**
 * Census entry for a context that exists right now. Called by `ContextGuard`
 * when its renderer is up; the returned function retires it. Idempotent.
 */
export function trackGpuContext(id: string, kind: GpuLeaseKind): () => void {
  contexts.set(id, { id, kind })
  mirror()
  let retired = false
  return () => {
    if (retired) return
    retired = true
    contexts.delete(id)
    mirror()
  }
}

/** Snapshot for instrumentation, probes and tests. */
export const gpuBudgetState = () => ({
  wanting: [...wanting.values()].map(({ id, kind, priority }) => ({ id, kind, priority })),
  admitted: [...admitted],
  contexts: [...contexts.values()],
})

/** Test seam: drop every lease and census entry. */
export function resetGpuBudgetForTests() {
  wanting.clear()
  contexts.clear()
  admitted = new Set()
  order = 0
  mirror()
}
