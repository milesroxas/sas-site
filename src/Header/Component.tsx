import type { Header as HeaderData } from '@/payload-types'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { HeaderClient } from './Component.client'
import { getCachedMenuContent } from './getMenuContent'

export async function Header() {
  const [headerData, menuContent, siteInfo] = await Promise.all([
    getCachedGlobal('header', 1)() as Promise<HeaderData>,
    getCachedMenuContent(),
    // Site Info › Ask › Hide Ask decides whether the menu carries the composer.
    getCachedGlobal('site-info', 1)(),
  ])

  return (
    <HeaderClient
      askHidden={Boolean(siteInfo?.ask?.hidden)}
      data={headerData}
      menuContent={menuContent}
    />
  )
}
