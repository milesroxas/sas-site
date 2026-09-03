import { draftMode } from 'next/headers'
import type { Metadata } from 'next/types'
import { insightsIndexHeroFallback, queryInsightsIndex } from '@/CollectionIndexes/queries'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { RenderHero } from '@/heros/RenderHero'
import { InsightsBrowse } from '@/sections/InsightsBrowse'
import { queryInsightsBrowseData } from '@/sections/InsightsBrowse/queries'
import { RevealSection } from '@/shared/ui/reveal-section'
import { generateMeta } from '@/utilities/generateMeta'

/** Shared by `/insights` and `/posts` so both always render the Insights Index singleton. */
export async function InsightsIndexView() {
  const { isEnabled: draft } = await draftMode()
  const insightsIndex = await queryInsightsIndex()
  const hero = insightsIndex?.hero?.title ? insightsIndex.hero : insightsIndexHeroFallback
  const { topics, posts } = await queryInsightsBrowseData()

  return (
    <div className="pb-24">
      {draft && <LivePreviewListener />}
      <RevealSection delayMs={0}>
        <RenderHero {...hero} />
      </RevealSection>

      <InsightsBrowse posts={posts} topics={topics} />
    </div>
  )
}

export async function generateInsightsIndexMetadata(pathname: string): Promise<Metadata> {
  const insightsIndex = await queryInsightsIndex()

  return generateMeta({ doc: insightsIndex, pathname })
}
