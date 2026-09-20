'use client'

import type React from 'react'
import { createContext, use, useState, useSyncExternalStore } from 'react'
import type { Theme } from '@/providers/Theme/types'

/**
 * What a hero band pins a bar to: a fixed palette, or `site` for a band that
 * paints in the visitor's own theme. Either way the bar lifts its plate so
 * the band runs under it; only a fixed palette restates the bar's ink.
 */
export type ChromePin = Theme | 'site'

/**
 * The palette each fixed chrome bar paints in: `null` is the resting state
 * (the visitor's site theme, `html[data-theme]`, on a solid plate), a
 * `ChromePin` holds the bar over a hero band while the band is under it.
 *
 * Header and footer are separate values because they leave a hero at
 * different scroll positions: the footer clears the band first, the header
 * last.
 */
export type ChromeTheme = {
  header: ChromePin | null
  footer: ChromePin | null
}

/** The `data-theme` a pinned bar stamps: none for `site`, which inherits `html[data-theme]`. */
export const chromePinPalette = (pin: ChromePin | null): Theme | undefined =>
  pin === null || pin === 'site' ? undefined : pin

export type ChromeBar = keyof ChromeTheme

/** Both bars on the site theme: the resting state, and the value a pin releases to. */
export const CHROME_THEME_SITE: ChromeTheme = { header: null, footer: null }

/**
 * Scroll-derived state lives outside React's render cycle: the writer (the
 * hero band's scroll subscription) sets it directly, and each bar subscribes
 * to its own value with `useSyncExternalStore`, so a flip re-renders exactly
 * one bar shell and a scroll that changes nothing renders nothing.
 */
export interface ChromeThemeStore {
  read(): ChromeTheme
  /** No-op when neither bar changes, so scroll-time callers can write unconditionally. */
  write(next: ChromeTheme): void
  subscribe(listener: () => void): () => void
}

export function createChromeThemeStore(): ChromeThemeStore {
  let current = CHROME_THEME_SITE
  const listeners = new Set<() => void>()
  return {
    read: () => current,
    write(next) {
      if (next.header === current.header && next.footer === current.footer) return
      current = next
      for (const listener of listeners) listener()
    },
    subscribe(listener) {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
  }
}

const ChromeThemeContext = createContext<ChromeThemeStore | null>(null)

/** Bars and bands rendered without a provider (tests, isolated stories) share one store. */
let fallbackStore: ChromeThemeStore | null = null
const getFallbackStore = () => {
  fallbackStore ??= createChromeThemeStore()
  return fallbackStore
}

/**
 * One writer at a time: the mounted hero band (`src/heros/HeroBand.tsx`)
 * derives both values from its own position under the bars and releases them
 * on unmount. Pages never set this directly; a page without a band simply has
 * no writer, and the bars sit on the site theme.
 */
export const ChromeThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [store] = useState(createChromeThemeStore)
  return <ChromeThemeContext value={store}>{children}</ChromeThemeContext>
}

/** The store itself, for the writer. Bars read through `useChromeBarTheme`. */
export const useChromeThemeStore = (): ChromeThemeStore =>
  use(ChromeThemeContext) ?? getFallbackStore()

const getServerSnapshot = () => null

/** What one bar is pinned to, or `null` at rest. Re-renders only when that bar's value changes. */
export function useChromeBarTheme(bar: ChromeBar): ChromePin | null {
  const store = useChromeThemeStore()
  return useSyncExternalStore(store.subscribe, () => store.read()[bar], getServerSnapshot)
}
