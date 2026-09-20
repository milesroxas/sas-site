/**
 * Run once the main thread is free, so deferred work (an SDK download, a lazy
 * chunk) never competes with hero media during the hydration commit (audit
 * P1-7). The timeout keeps a busy page from starving the work entirely.
 * Returns the cancel.
 */
export function whenIdle(run: () => void): () => void {
  if (typeof window.requestIdleCallback !== 'function') {
    const timer = window.setTimeout(run, 1)
    return () => window.clearTimeout(timer)
  }
  const handle = window.requestIdleCallback(run, { timeout: 2000 })
  return () => window.cancelIdleCallback(handle)
}
