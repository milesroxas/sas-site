import { cookies } from 'next/headers'
import type React from 'react'
import { Clock } from '@/Footer/Clock'
import { getCachedMenuContent } from '@/Header/getMenuContent'
import type { Footer, Header } from '@/payload-types'
import { DemoSiteProvider, toSiteLink } from '@/shared/ui/demo-kit'
import { getCachedGlobal } from '@/utilities/getGlobals'

/**
 * Demo routes hide the fixed site chrome (components/SiteChrome), so this
 * layout resolves its content — the takeover site menu's data, footer
 * fields — for the demo shell's sidebar to re-home.
 */
export default async function DemoLayout({ children }: { children: React.ReactNode }) {
  const [header, footer, menuContent, cookieStore] = await Promise.all([
    getCachedGlobal('header', 1)() as Promise<Header>,
    getCachedGlobal('footer', 1)() as Promise<Footer>,
    getCachedMenuContent(),
    cookies(),
  ])
  // Read-back half of shadcn's sidebar persistence: SidebarProvider writes
  // `sidebar_state`; the server layout seeds defaultOpen from it.
  const sidebarState = cookieStore.get('sidebar_state')?.value

  return (
    <DemoSiteProvider
      value={{
        header,
        menuContent,
        location: footer.location,
        getInTouch: toSiteLink(footer.getInTouch),
        clock: <Clock className="text-[0.625rem] text-sidebar-foreground/60" />,
        sidebarDefaultOpen: sidebarState ? sidebarState === 'true' : true,
      }}
    >
      {children}
    </DemoSiteProvider>
  )
}
