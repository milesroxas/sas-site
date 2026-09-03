import { draftMode } from 'next/headers'
import type { Metadata } from 'next/types'
import { queryWorksIndex, worksIndexHeroFallback } from '@/CollectionIndexes/queries'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { WorksBrowse } from '@/sections/WorksBrowse'
import { queryWorksBrowseData } from '@/sections/WorksBrowse/queries'
import { generateMeta } from '@/utilities/generateMeta'

export const revalidate = 600

export default async function WorksPage() {
  const { isEnabled: draft } = await draftMode()
  const worksIndex = await queryWorksIndex()
  const hero = worksIndex?.hero?.title ? worksIndex.hero : worksIndexHeroFallback
  const { items, industries, capabilities } = await queryWorksBrowseData()

  return (
    <main>
      {draft && <LivePreviewListener />}
      <WorksBrowse
        capabilities={capabilities}
        eyebrow={hero.eyebrow}
        industries={industries}
        items={items}
        title={hero.title}
      />
    </main>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  const worksIndex = await queryWorksIndex()

  return generateMeta({ doc: worksIndex, pathname: '/works' })
}
