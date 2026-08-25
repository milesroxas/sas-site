import { draftMode } from 'next/headers'
import type { Metadata } from 'next/types'
import { queryWorksIndex, worksIndexHeroFallback } from '@/CollectionIndexes/queries'
import { getPublishedWorkPageCards } from '@/collections/WorkPages/queries'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { WorkPageCard } from '@/components/WorkPageCard'
import { RenderHero } from '@/heros/RenderHero'
import { generateMeta } from '@/utilities/generateMeta'

export const revalidate = 600

export default async function WorksPage() {
  const { isEnabled: draft } = await draftMode()
  const worksIndex = await queryWorksIndex()
  const hero = worksIndex?.hero?.title ? worksIndex.hero : worksIndexHeroFallback
  const { docs } = await getPublishedWorkPageCards()

  return (
    <main className="pb-24">
      {draft && <LivePreviewListener />}
      <RenderHero {...hero} />
      <div className="container grid gap-12 md:grid-cols-2">
        {docs.map((page) => (
          <WorkPageCard key={page.id} page={page} />
        ))}
      </div>
    </main>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  const worksIndex = await queryWorksIndex()

  return generateMeta({ doc: worksIndex, pathname: '/works' })
}
