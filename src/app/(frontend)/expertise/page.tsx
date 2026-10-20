import { draftMode } from 'next/headers'
import type { Metadata } from 'next/types'
import { IndexBackground } from '@/CollectionIndexes/IndexBackground'
import { expertiseIndexHeroFallback, queryExpertiseIndex } from '@/CollectionIndexes/queries'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { leakScope } from '@/features/immersive/visual'
import { SegmentIndex } from '@/sections/SegmentIndex'
import { generateMeta } from '@/utilities/generateMeta'

export const revalidate = 600

/** Stable identity a missing seed derives from: the global's slug. */
const SEED_KEY = 'expertise-index'

/** Served until an editor fills the global's SEO tab. */
const META_FALLBACK = {
  meta: {
    title: 'Expertise',
    description:
      'What Suits & Sandals does: brand positioning and messaging, website strategy and UX, product design systems, sales and investor communications, and embedded creative support.',
  },
}

export default async function ExpertiseIndexPage() {
  const { isEnabled: draft } = await draftMode()
  const index = await queryExpertiseIndex()
  const hero = index?.hero?.title ? index.hero : expertiseIndexHeroFallback

  return (
    // relative isolate: the index ground's -z-10 layer sits above the page frame's opaque bg.
    // leakScope: a light leak ground answers hover across the whole listing.
    <main className="relative isolate" {...leakScope()}>
      {draft && <LivePreviewListener />}
      <IndexBackground hero={index?.hero} seedKey={SEED_KEY} />
      <SegmentIndex
        basePath="/expertise"
        collection="expertise-pages"
        eyebrow={hero.eyebrow}
        heading={hero.title ?? META_FALLBACK.meta.title}
      />
    </main>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  const index = await queryExpertiseIndex()

  return generateMeta({ doc: index?.meta?.title ? index : META_FALLBACK, pathname: '/expertise' })
}
