import { draftMode } from 'next/headers'
import type { Metadata } from 'next/types'
import { IndexBackground } from '@/CollectionIndexes/IndexBackground'
import { queryWorksIndex, worksIndexHeroFallback } from '@/CollectionIndexes/queries'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { leakScope } from '@/features/immersive/visual'
import { WorksBrowse } from '@/sections/WorksBrowse'
import { queryWorksBrowseData } from '@/sections/WorksBrowse/queries'
import { generateMeta } from '@/utilities/generateMeta'

// Time fallback only: the collection hooks purge this page on publish, so a
// short window only let crawlers regenerate it (and wake the database) all night.
export const revalidate = 86400

export default async function WorksPage() {
  const { isEnabled: draft } = await draftMode()
  const worksIndex = await queryWorksIndex()
  const hero = worksIndex?.hero?.title ? worksIndex.hero : worksIndexHeroFallback
  const { items, industries, capabilities } = await queryWorksBrowseData()

  return (
    // relative isolate: the index ground's -z-10 layer sits above the page frame's opaque bg.
    // leakScope: a light leak ground answers hover across the whole listing, not its sticky frame.
    <main className="relative isolate" {...leakScope()}>
      {draft && <LivePreviewListener />}
      <IndexBackground hero={worksIndex?.hero} seedKey="works-index" />
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
