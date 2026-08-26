import configPromise from '@payload-config'
import { draftMode } from 'next/headers'
import type { Metadata } from 'next/types'
import { getPayload } from 'payload'
import { insightsIndexHeroFallback, queryInsightsIndex } from '@/CollectionIndexes/queries'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { PageRange } from '@/components/PageRange'
import { Pagination } from '@/components/Pagination'
import { FooterClosingSection } from '@/Footer/Closing/Component'
import { RenderHero } from '@/heros/RenderHero'
import { CollectionArchive } from '@/sections/CollectionArchive'
import { RevealSection } from '@/shared/ui/reveal-section'
import { generateMeta } from '@/utilities/generateMeta'
import PageClient from './page.client'

export const revalidate = 600

// fallow-ignore-next-line complexity -- CRAP flags coverage gap; straightforward RSC page
export default async function Page() {
  const { isEnabled: draft } = await draftMode()
  const payload = await getPayload({ config: configPromise })
  const postsIndex = await queryInsightsIndex()
  const hero = postsIndex?.hero?.title ? postsIndex.hero : insightsIndexHeroFallback

  const posts = await payload.find({
    collection: 'posts',
    depth: 1,
    limit: 12,
    overrideAccess: false,
    select: {
      title: true,
      slug: true,
      categories: true,
      meta: true,
    },
  })

  return (
    <>
      {/* Opaque and above the closing band: the band is a sticky curtain the
          page uncovers by scrolling this off it (src/Footer/Closing/curtain). */}
      <div className="relative z-10 bg-background pb-24">
        <PageClient />
        {draft && <LivePreviewListener />}
        <RevealSection delayMs={0}>
          <RenderHero {...hero} />
        </RevealSection>

        <RevealSection className="container mb-8" delayMs={60}>
          <PageRange
            collection="posts"
            currentPage={posts.page}
            limit={12}
            totalDocs={posts.totalDocs}
          />
        </RevealSection>

        <CollectionArchive posts={posts.docs} />

        {posts.totalPages > 1 && posts.page ? (
          <RevealSection className="container" delayMs={120}>
            <Pagination page={posts.page} totalPages={posts.totalPages} />
          </RevealSection>
        ) : null}
      </div>

      <FooterClosingSection />
    </>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  const postsIndex = await queryInsightsIndex()

  return generateMeta({ doc: postsIndex, pathname: '/posts' })
}
