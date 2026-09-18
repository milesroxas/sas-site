'use client'

import { useCallback, useEffect, useState } from 'react'
import type { StreakRelease, StreakRender } from '@/payload-types'
import { RELEASES_SLUG, RENDERS_SLUG } from './paths'

const loaders = new Set<() => Promise<void>>()

/**
 * Reload every list on the page now. The Studio's pieces sit in separate
 * branches of Payload's form, so the one that queued a render, or saw one
 * finish, says so here and the rest catch up without waiting out their timer.
 */
export const refreshStudio = () => {
  for (const load of loaders) void load().catch(() => {})
}

/** Runs `load` now and every `ms` while the page is on screen. */
export function useVisiblePoll(load: () => Promise<void>, ms: number) {
  useEffect(() => {
    loaders.add(load)
    void load().catch(() => {})
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') void load().catch(() => {})
    }, ms)
    return () => {
      loaders.delete(load)
      clearInterval(timer)
    }
  }, [load, ms])
}

function useLookDocs<T>(slug: string, id: number | string | undefined, ms: number) {
  const [docs, setDocs] = useState<T[]>([])
  const [loaded, setLoaded] = useState(false)
  const load = useCallback(async () => {
    if (!id) return
    const params = new URLSearchParams({
      'where[look][equals]': String(id),
      sort: '-createdAt',
      limit: '20',
      depth: '1',
    })
    const response = await fetch(`/api/${slug}?${params}`)
    if (!response.ok) return
    setDocs((await response.json()).docs)
    setLoaded(true)
  }, [slug, id])
  useVisiblePoll(load, ms)
  return { docs, loaded, refresh: load }
}

/** The releases published from a look, newest first. `loaded` is false until the first answer. */
export const useReleases = (id: number | string | undefined) =>
  useLookDocs<StreakRelease>(RELEASES_SLUG, id, 15000)

/** The render jobs of a look, newest first, with a refresh for after an action. */
export const useRenders = (id: number | string | undefined) =>
  useLookDocs<StreakRender>(RENDERS_SLUG, id, 5000)
