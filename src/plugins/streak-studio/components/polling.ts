'use client'

import { useCallback, useEffect, useState } from 'react'
import type { StreakRelease, StreakRender } from '@/payload-types'
import { RELEASES_SLUG, RENDERS_SLUG } from './paths'

/** Runs `load` now and every `ms` while the page is on screen. */
export function useVisiblePoll(load: () => Promise<void>, ms: number) {
  useEffect(() => {
    void load().catch(() => {})
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') void load().catch(() => {})
    }, ms)
    return () => clearInterval(timer)
  }, [load, ms])
}

function useLookDocs<T>(slug: string, id: number | string | undefined, ms: number) {
  const [docs, setDocs] = useState<T[]>([])
  const load = useCallback(async () => {
    if (!id) return
    const params = new URLSearchParams({
      'where[look][equals]': String(id),
      sort: '-createdAt',
      limit: '20',
      depth: '1',
    })
    const response = await fetch(`/api/${slug}?${params}`)
    if (response.ok) setDocs((await response.json()).docs)
  }, [slug, id])
  useVisiblePoll(load, ms)
  return { docs, refresh: load }
}

/** The releases published from a look, newest first. */
export const useReleases = (id: number | string | undefined) =>
  useLookDocs<StreakRelease>(RELEASES_SLUG, id, 15000).docs

/** The render jobs of a look, newest first, with a refresh for after an action. */
export const useRenders = (id: number | string | undefined) =>
  useLookDocs<StreakRender>(RENDERS_SLUG, id, 5000)
