'use client'

import { createContext, type ReactNode, useContext } from 'react'
import type { MenuContent } from '@/Header/getMenuContent'
import type { Header } from '@/payload-types'

/** CMS link reduced to plain data — hrefs pre-resolved by the demo layout. */
export type DemoSiteLink = {
  label: string
  href: string
  newTab: boolean
}

/**
 * Site chrome content for the demo shell sidebar. The demo routes hide the
 * fixed site header/footer bars, so the shell re-homes their content: the
 * brand wordmark with the takeover site menu, and the footer's
 * CTA/location/clock.
 */
export type DemoSiteChrome = {
  /** Header global — nav items for the takeover site menu. */
  header: Header
  /** Editorial columns + hover media for the takeover site menu. */
  menuContent: MenuContent
  /** Site footer fields (Footer global). */
  location: string
  getInTouch: DemoSiteLink | null
  /** Live-clock slot — the site footer's Clock, rendered by the demo layout. */
  clock?: ReactNode
}

const DemoSiteContext = createContext<DemoSiteChrome | null>(null)

/** Mounted by the demo route layout, which resolves the CMS globals. */
export function DemoSiteProvider({
  value,
  children,
}: {
  value: DemoSiteChrome
  children: ReactNode
}) {
  return <DemoSiteContext.Provider value={value}>{children}</DemoSiteContext.Provider>
}

/** Null outside the demo layout (stories, tests) — the shell hides site chrome then. */
export function useDemoSiteChrome() {
  return useContext(DemoSiteContext)
}
