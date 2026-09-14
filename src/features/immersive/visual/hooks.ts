'use client'

import { type RefObject, useEffect, useState, useSyncExternalStore } from 'react'
import { useSiteTheme } from '@/hooks/use-site-theme'
import type { Theme } from '@/providers/Theme/types'
import { isStreakAdmitted, requestStreakLease, subscribeStreakAdmission } from './admission'
import { NO_STREAK_CAPABILITY, probeStreakCapability, type StreakCapability } from './capability'
import {
  getServerMotionPaused,
  isMotionPaused,
  setMotionPaused,
  subscribeMotionPaused,
} from './motion-preference'

/** The site-wide motion pause, reactive, with a setter. */
export function useMotionPaused(): [boolean, (next: boolean) => void] {
  const paused = useSyncExternalStore(subscribeMotionPaused, isMotionPaused, getServerMotionPaused)
  return [paused, setMotionPaused]
}

/**
 * The WebGL2 probe, run once per document and only when asked for: a slot
 * that is poster-only by policy never creates a context. `null` until probed.
 */
export function useStreakCapability(wanted: boolean): StreakCapability | null {
  const [capability, setCapability] = useState<StreakCapability | null>(null)
  useEffect(() => {
    if (!wanted || capability) return
    setCapability(probeStreakCapability())
  }, [wanted, capability])
  return wanted ? capability : NO_STREAK_CAPABILITY
}

const COARSE_POINTER_QUERY = '(any-pointer: coarse) and (hover: none)'

/**
 * Product policy, not a battery measurement: touch-first devices stay on
 * posters until real-device testing qualifies a live tier.
 */
export function useCoarsePointer(): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const query = window.matchMedia(COARSE_POINTER_QUERY)
      query.addEventListener('change', onChange)
      return () => query.removeEventListener('change', onChange)
    },
    () => window.matchMedia(COARSE_POINTER_QUERY).matches,
    () => true,
  )
}

/**
 * Whether the element is near the viewport. Starts `false`: admission waits
 * until visibility is known rather than assuming it, and without an observer
 * (jsdom) it stays a poster.
 */
export function useNearViewport(ref: RefObject<HTMLElement | null>, margin = '10%'): boolean {
  const [near, setNear] = useState(false)
  useEffect(() => {
    const node = ref.current
    if (!node || typeof IntersectionObserver !== 'function') return
    const observer = new IntersectionObserver(
      ([entry]) => setNear(entry?.isIntersecting ?? false),
      { rootMargin: margin },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [ref, margin])
  return near
}

const subscribeVisibility = (onChange: () => void) => {
  document.addEventListener('visibilitychange', onChange)
  return () => document.removeEventListener('visibilitychange', onChange)
}

/** `document.visibilityState === 'visible'`, reactive; hidden tabs draw nothing. */
export function useDocumentVisible(): boolean {
  return useSyncExternalStore(
    subscribeVisibility,
    () => document.visibilityState === 'visible',
    () => true,
  )
}

const PAGE_FRAME_SELECTOR = '[data-page-frame]'

/**
 * Whether the takeover menu covers the page: it marks the frame `inert`
 * while docked and the document `data-menu-handoff` for the flight out.
 * A covered field draws nothing and releases its admission.
 */
export function usePageCovered(): boolean {
  const [covered, setCovered] = useState(false)
  useEffect(() => {
    const frame = document.querySelector<HTMLElement>(PAGE_FRAME_SELECTOR)
    const root = document.documentElement
    const read = () =>
      setCovered(Boolean(frame?.hasAttribute('inert')) || root.hasAttribute('data-menu-handoff'))
    read()
    const observer = new MutationObserver(read)
    if (frame) observer.observe(frame, { attributes: true, attributeFilter: ['inert'] })
    observer.observe(root, { attributes: true, attributeFilter: ['data-menu-handoff'] })
    return () => observer.disconnect()
  }, [])
  return covered
}

/**
 * Hold a live lease while `wanted`, and report whether this slot is among
 * the admitted ones. Release is idempotent; the effect's cleanup is the one
 * place it happens.
 */
export function useStreakLease(id: string, wanted: boolean, priority: number): boolean {
  useEffect(() => {
    if (!wanted) return
    return requestStreakLease(id, priority)
  }, [id, wanted, priority])
  return useSyncExternalStore(
    subscribeStreakAdmission,
    () => wanted && isStreakAdmitted(id),
    () => false,
  )
}

const GROUND_SELECTOR = '[data-theme], .band-dark'

/**
 * The polarity of the ground under an element: the nearest hero band or
 * Section that pins its own palette, else the site theme. Re-read when the
 * site theme flips, since an unpinned ground follows it. Server and
 * hydration render the site default (light), matching the poster CSS.
 */
export function useGroundSurface(ref: RefObject<HTMLElement | null>): Theme {
  const siteTheme = useSiteTheme()
  const [ground, setGround] = useState<Theme>('light')
  useEffect(() => {
    const pinned = ref.current?.closest<HTMLElement>(GROUND_SELECTOR)
    if (!pinned) {
      setGround(siteTheme)
      return
    }
    setGround(
      pinned.classList.contains('band-dark') || pinned.dataset.theme === 'dark' ? 'dark' : 'light',
    )
  }, [ref, siteTheme])
  return ground
}
