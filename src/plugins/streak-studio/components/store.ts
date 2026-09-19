'use client'

import { useSyncExternalStore } from 'react'
import type { StreakRecipe } from '@/features/immersive/studio/recipe'
import type { VisualPlacement } from '@/features/immersive/visual/placement'

/**
 * Studio session state that is not part of the document: how the stage is
 * showing the recipe, the kept comparison, and the undo stack. The Inspector
 * (the recipe field, in the sidebar) and the Stage (the Studio tab) are
 * rendered in different branches of Payload's form, so they share it through
 * this store instead of a context. One session per open document; it lives
 * for the page, which is as long as the undo stack should.
 */
export type StudioSession = {
  surface: 'dark' | 'light'
  placement: VisualPlacement
  paused: boolean
  /** Bumped to restart the preview from frame zero. */
  generation: number
  comparison: StreakRecipe | null
  comparisonLabel: string
  comparisonAt: number | null
  showComparison: boolean
  history: StreakRecipe[]
  future: StreakRecipe[]
}

const HISTORY_LIMIT = 50

const initial = (): StudioSession => ({
  surface: 'dark',
  placement: 'hero',
  paused: false,
  generation: 0,
  comparison: null,
  comparisonLabel: '',
  comparisonAt: null,
  showComparison: false,
  history: [],
  future: [],
})

const sessions = new Map<string, StudioSession>()
const listeners = new Set<() => void>()

const read = (key: string) => {
  let session = sessions.get(key)
  if (!session) {
    session = initial()
    sessions.set(key, session)
  }
  return session
}

const emit = () => {
  for (const listener of listeners) listener()
}

export const studioStore = {
  read,
  patch(key: string, next: Partial<StudioSession>) {
    sessions.set(key, { ...read(key), ...next })
    emit()
  },
  restart(key: string) {
    const session = read(key)
    sessions.set(key, { ...session, generation: session.generation + 1 })
    emit()
  },
  /**
   * Call with the recipe about to be replaced, before the change. Every change
   * to the draft, undo and redo included, puts the draft back on the stage:
   * an edit made while a comparison is showing would otherwise change nothing
   * the author can see.
   */
  record(key: string, previous: StreakRecipe) {
    const session = read(key)
    sessions.set(key, {
      ...session,
      showComparison: false,
      history: [...session.history.slice(-(HISTORY_LIMIT - 1)), previous],
      future: [],
    })
    emit()
  },
  undo(key: string, current: StreakRecipe): StreakRecipe | null {
    const session = read(key)
    const previous = session.history.at(-1)
    if (!previous) return null
    sessions.set(key, {
      ...session,
      showComparison: false,
      history: session.history.slice(0, -1),
      future: [...session.future, current],
    })
    emit()
    return previous
  },
  redo(key: string, current: StreakRecipe): StreakRecipe | null {
    const session = read(key)
    const next = session.future.at(-1)
    if (!next) return null
    sessions.set(key, {
      ...session,
      showComparison: false,
      future: session.future.slice(0, -1),
      history: [...session.history, current],
    })
    emit()
    return next
  },
}

const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/** The session for one document; `key` is the document id, or `new` before the first save. */
export function useStudioSession(key: string): StudioSession {
  return useSyncExternalStore(
    subscribe,
    () => read(key),
    () => read(key),
  )
}

export const sessionKey = (id: number | string | undefined) => (id == null ? 'new' : String(id))
