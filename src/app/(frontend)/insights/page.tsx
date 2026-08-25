import { draftMode } from 'next/headers'
import type { Metadata } from 'next/types'
import { insightsIndexHeroFallback, queryInsightsIndex } from '@/CollectionIndexes/queries'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { RenderHero } from '@/heros/RenderHero'
import { InsightsBrowse } from '@/sections/InsightsBrowse'
import { queryInsightsBrowseData } from '@/sections/InsightsBrowse/queries'
import { RevealSection } from '@/shared/ui/reveal-section'
import { generateMeta } from '@/utilities/generateMeta'
import PageClient from './page.client'

export const revalidate = 600

export default async function InsightsPage() {
  const { isEnabled: draft } = await draftMode()
  const insightsIndex = await queryInsightsIndex()
  const hero = insightsIndex?.hero?.title ? insightsIndex.hero : insightsIndexHeroFallback
  const { topics, posts } = await queryInsightsBrowseData()

  return (
    <div className="pb-24">
      <PageClient />
      {draft && <LivePreviewListener />}
      <RevealSection delayMs={0}>
        <RenderHero {...hero} />
      </RevealSection>

      <InsightsBrowse posts={posts} topics={topics} />
    </div>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  const insightsIndex = await queryInsightsIndex()

  return generateMeta({ doc: insightsIndex, pathname: '/insights' })
}
