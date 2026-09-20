import { draftMode } from 'next/headers'
import type { Metadata } from 'next/types'
import { IndexBackground } from '@/CollectionIndexes/IndexBackground'
import { labIndexHeroFallback, queryLabIndex } from '@/CollectionIndexes/queries'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { leakScope, resolveVisual } from '@/features/immersive/visual'
import { resolveIndexBanner } from '@/sections/IndexBanner/resolve'
import { LabBrowse } from '@/sections/LabBrowse'
import { queryLabBrowseData } from '@/sections/LabBrowse/queries'
import { generateMeta } from '@/utilities/generateMeta'

export const revalidate = 600

/** Stable identity a missing seed derives from: the global's slug. */
const LAB_INDEX_SEED_KEY = 'lab-index'

export default async function LabPage() {
  const { isEnabled: draft } = await draftMode()
  const labIndex = await queryLabIndex()
  const hero = labIndex?.hero?.title ? labIndex.hero : labIndexHeroFallback
  const { items, kinds, capabilities } = await queryLabBrowseData()
  const banner = resolveIndexBanner(labIndex?.banner, LAB_INDEX_SEED_KEY)
  // An effect ground already carries the document's pause control.
  const ground = resolveVisual(labIndex?.hero, { seedKey: LAB_INDEX_SEED_KEY })
  const groundPauses = ground !== null && ground.kind !== 'media'

  return (
    // relative isolate: the index ground's -z-10 layer sits above the page frame's opaque bg.
    // leakScope: a light leak ground answers hover across the whole listing, not its sticky frame.
    <main className="relative isolate" {...leakScope()}>
      {draft && <LivePreviewListener />}
      <IndexBackground hero={labIndex?.hero} seedKey={LAB_INDEX_SEED_KEY} />
      <LabBrowse
        banner={banner && { ...banner, motionToggle: !groundPauses }}
        capabilities={capabilities}
        eyebrow={hero.eyebrow}
        items={items}
        kinds={kinds}
        title={hero.title}
      />
    </main>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  const labIndex = await queryLabIndex()

  return generateMeta({ doc: labIndex, pathname: '/lab' })
}
