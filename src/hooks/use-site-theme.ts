'use client'

import { useSyncExternalStore } from 'react'
import type { Theme } from '@/providers/Theme/types'

/**
 * The live site theme, read from `<html data-theme>` rather than from
 * `ThemeProvider`'s context.
 *
 * The attribute is the actual source of truth — `InitTheme` stamps it during
 * head parsing and `ThemeProvider` writes it on every toggle — so reading it
 * directly also works where the provider is absent: Storybook drives the same
 * attribute from its theme switcher, so stories and Chromatic snapshots get the
 * right palette without a provider decorator.
 *
 * For components that need to *change* the theme, use `useTheme()` from
 * `@/providers/Theme`; this hook only observes.
 *
 * Document level only: a section that pins its own `data-theme` (the heroes do)
 * is not resolved here.
 */
export function useSiteTheme(): Theme {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

function subscribe(onStoreChange: () => void): () => void {
  const observer = new MutationObserver(onStoreChange)
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  })
  return () => observer.disconnect()
}

/**
 * Anything but an explicit `dark` is light: that matches the stylesheet, where
 * the light palette lives on bare `:root` and `[data-theme="dark"]` is the
 * override — so an unstamped document paints light and must be read as light.
 */
function getSnapshot(): Theme {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'
}

function getServerSnapshot(): Theme {
  return 'light'
}
