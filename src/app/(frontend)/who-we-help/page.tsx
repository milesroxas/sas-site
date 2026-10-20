import { draftMode } from 'next/headers'
import type { Metadata } from 'next/types'
import { IndexBackground } from '@/CollectionIndexes/IndexBackground'
import { audienceIndexHeroFallback, queryAudienceIndex } from '@/CollectionIndexes/queries'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { leakScope } from '@/features/immersive/visual'
import { SegmentIndex } from '@/sections/SegmentIndex'
import { generateMeta } from '@/utilities/generateMeta'

export const revalidate = 600

/** Stable identity a missing seed derives from: the global's slug. */
const SEED_KEY = 'audience-index'

/** Served until an editor fills the global's SEO tab. */
const META_FALLBACK = {
  meta: {
    title: 'Who We Help',
    description:
      'The organizations Suits & Sandals works with: technical B2B companies, healthtech and life sciences, SaaS platforms, and companies repositioning for their next stage.',
  },
}

export default async function WhoWeHelpIndexPage() {
  const { isEnabled: draft } = await draftMode()
  const index = await queryAudienceIndex()
  const hero = index?.hero?.title ? index.hero : audienceIndexHeroFallback

  return (
    // relative isolate: the index ground's -z-10 layer sits above the page frame's opaque bg.
    // leakScope: a light leak ground answers hover across the whole listing.
    <main className="relative isolate" {...leakScope()}>
      {draft && <LivePreviewListener />}
      <IndexBackground hero={index?.hero} seedKey={SEED_KEY} />
      <SegmentIndex
        basePath="/who-we-help"
        collection="audience-pages"
        eyebrow={hero.eyebrow}
        heading={hero.title ?? META_FALLBACK.meta.title}
      />
    </main>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  const index = await queryAudienceIndex()

  return generateMeta({ doc: index?.meta?.title ? index : META_FALLBACK, pathname: '/who-we-help' })
}
