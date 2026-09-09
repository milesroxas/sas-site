import { draftMode } from 'next/headers'
import type { Metadata } from 'next/types'
import { insightsIndexHeroFallback, queryInsightsIndex } from '@/CollectionIndexes/queries'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { InsightsBrowse } from '@/sections/InsightsBrowse'
import { queryInsightsBrowseData } from '@/sections/InsightsBrowse/queries'
import { generateMeta } from '@/utilities/generateMeta'

/** The Insights Index singleton's kicker and title, or the fallback until one is published. */
export const queryInsightsIndexHero = async () => {
  const insightsIndex = await queryInsightsIndex()
  return insightsIndex?.hero?.title ? insightsIndex.hero : insightsIndexHeroFallback
}

/** Shared by `/insights` and `/posts` so both always render the Insights Index singleton. */
export async function InsightsIndexView() {
  const { isEnabled: draft } = await draftMode()
  const [hero, { topics, posts }] = await Promise.all([
    queryInsightsIndexHero(),
    queryInsightsBrowseData(),
  ])

  return (
    <main>
      {draft && <LivePreviewListener />}
      <InsightsBrowse eyebrow={hero.eyebrow} posts={posts} title={hero.title} topics={topics} />
    </main>
  )
}

export async function generateInsightsIndexMetadata(pathname: string): Promise<Metadata> {
  const insightsIndex = await queryInsightsIndex()

  return generateMeta({ doc: insightsIndex, pathname })
}
