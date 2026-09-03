'use client'

import type React from 'react'
import { createContext, type Dispatch, type SetStateAction, use, useMemo, useState } from 'react'
import type { Theme } from '@/providers/Theme/types'

/**
 * The palette each fixed chrome bar paints in: `null` follows the visitor's
 * site theme (`html[data-theme]`), a `Theme` pins the bar to that palette
 * while something underneath it (a dark hero band) asks for it.
 *
 * Header and footer are separate values because they leave a hero at
 * different scroll positions: the footer clears the band's bottom edge first,
 * the header last.
 */
export type ChromeTheme = {
  header: Theme | null
  footer: Theme | null
}

/** Both bars on the site theme: the resting state, and the value a pin releases to. */
export const CHROME_THEME_SITE: ChromeTheme = { header: null, footer: null }

export interface ChromeThemeContextType {
  chromeTheme: ChromeTheme
  setChromeTheme: Dispatch<SetStateAction<ChromeTheme>>
}

const ChromeThemeContext = createContext<ChromeThemeContextType>({
  chromeTheme: CHROME_THEME_SITE,
  setChromeTheme: () => null,
})

/**
 * One writer at a time: the mounted hero band (`src/heros/HeroBand.tsx`)
 * derives both values from its own position under the bars and releases them
 * on unmount. Pages never set this directly; a page without a band simply has
 * no writer, and the bars sit on the site theme.
 */
export const ChromeThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [chromeTheme, setChromeTheme] = useState<ChromeTheme>(CHROME_THEME_SITE)
  const value = useMemo(() => ({ chromeTheme, setChromeTheme }), [chromeTheme])
  return <ChromeThemeContext value={value}>{children}</ChromeThemeContext>
}

export const useChromeTheme = (): ChromeThemeContextType => use(ChromeThemeContext)
