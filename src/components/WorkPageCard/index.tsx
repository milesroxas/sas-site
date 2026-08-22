import type React from 'react'
import { Media } from '@/components/Media'
import type { WorkPage } from '@/payload-types'

export type WorkPageCardData = Pick<
  WorkPage,
  'id' | 'title' | 'slug' | 'caseStudy' | 'coverAsset' | 'featured'
>

type Props = {
  page: WorkPageCardData
  titleAs?: 'h2' | 'h3'
}

export const WorkPageCard: React.FC<Props> = ({ page, titleAs: TitleTag = 'h2' }) => {
  const study = typeof page.caseStudy === 'object' ? page.caseStudy : null
  return (
    <a className="group" href={`/works/${page.slug}`}>
      {page.coverAsset && typeof page.coverAsset === 'object' && (
        <Media resource={page.coverAsset} imgClassName="h-auto w-full" />
      )}
      <TitleTag className="mt-5 text-heading-3 group-hover:underline">
        {study?.title || page.title}
      </TitleTag>
      {study && (
        <p className="mt-2 opacity-75">{study.summaries?.oneLine || study.summaries?.short}</p>
      )}
    </a>
  )
}
