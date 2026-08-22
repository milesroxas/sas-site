import type { Header as HeaderData } from '@/payload-types'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { HeaderClient } from './Component.client'
import { getCachedMenuContent } from './getMenuContent'

export async function Header() {
  const [headerData, menuContent] = await Promise.all([
    getCachedGlobal('header', 1)() as Promise<HeaderData>,
    getCachedMenuContent(),
  ])

  return <HeaderClient data={headerData} menuContent={menuContent} />
}
