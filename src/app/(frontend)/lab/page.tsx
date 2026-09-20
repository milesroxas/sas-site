import { draftMode } from 'next/headers'
import type { Metadata } from 'next/types'
import { IndexBackground } from '@/CollectionIndexes/IndexBackground'
import { labIndexHeroFallback, queryLabIndex } from '@/CollectionIndexes/queries'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { LabBrowse } from '@/sections/LabBrowse'
import { queryLabBrowseData } from '@/sections/LabBrowse/queries'
import { generateMeta } from '@/utilities/generateMeta'

export const revalidate = 600

export default async function LabPage() {
  const { isEnabled: draft } = await draftMode()
  const labIndex = await queryLabIndex()
  const hero = labIndex?.hero?.title ? labIndex.hero : labIndexHeroFallback
  const { items, kinds, capabilities } = await queryLabBrowseData()

  return (
    // relative isolate: the index ground's -z-10 layer sits above the page frame's opaque bg.
    <main className="relative isolate">
      {draft && <LivePreviewListener />}
      <IndexBackground hero={labIndex?.hero} seedKey="lab-index" />
      <LabBrowse
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
