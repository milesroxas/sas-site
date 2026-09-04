'use client'

import type React from 'react'
import { createContext, use, useState, useSyncExternalStore } from 'react'
import type { Theme } from '@/providers/Theme/types'

/**
 * The palette each fixed chrome bar paints in: `null` follows the visitor's
 * site theme (`html[data-theme]`), a `Theme` pins the bar to that palette
 * while something underneath it (a dark hero band) asks for it.
 *
 * Header and footer are separate values because they leave a hero at
 * different scroll positions: the footer clears the band first, the header
 * last.
 */
export type ChromeTheme = {
  header: Theme | null
  footer: Theme | null
}

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

/** The palette one bar is pinned to, or `null` for the site theme. Re-renders only when that bar's value changes. */
export function useChromeBarTheme(bar: ChromeBar): Theme | null {
  const store = useChromeThemeStore()
  return useSyncExternalStore(store.subscribe, () => store.read()[bar], getServerSnapshot)
}
