/**
 * The visitor's pause for sustained automatic motion (WCAG 2.2.2 Pause, Stop,
 * Hide). One document-wide switch, kept for the session so a pause survives
 * client navigations; `prefers-reduced-motion` takes precedence and never
 * needs this. Runtime pause stops work: slots release their lease and their
 * loop, they do not just slow to zero.
 */
const STORAGE_KEY = 'sas:motion-paused'

let paused: boolean | null = null
const listeners = new Set<() => void>()

const read = (): boolean => {
  if (paused !== null) return paused
  try {
    paused = typeof sessionStorage !== 'undefined' && sessionStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    paused = false
  }
  return paused
}

export const isMotionPaused = (): boolean => read()

export function setMotionPaused(next: boolean) {
  if (read() === next) return
  paused = next
  try {
    if (next) sessionStorage.setItem(STORAGE_KEY, '1')
    else sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    // Storage blocked: the in-memory value still applies for this document.
  }
  for (const listener of listeners) listener()
}

export function subscribeMotionPaused(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export const getServerMotionPaused = () => false

/** Test seam. */
export function resetMotionPausedForTests() {
  paused = null
  try {
    sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}
