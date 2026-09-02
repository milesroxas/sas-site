import { Media } from '@/components/Media'
import type {
  CaseStudy,
  CaseStudyRelatedWorkBlock,
  Media as MediaDoc,
  WorkPage,
} from '@/payload-types'
import { populatedDoc } from '@/utilities/relationshipId'
import { cn } from '@/utilities/ui'
import { RevealSection } from './RevealSection.client'

const RelatedWorkCard = ({ page }: { page: WorkPage }) => {
  const cover = populatedDoc<MediaDoc>(page.coverAsset)
  const caseStudy = populatedDoc<CaseStudy>(page.caseStudy)
  return (
    <a className="group pressable pressable-subtle block" data-reveal href={`/works/${page.slug}`}>
      {cover && <Media resource={cover} imgClassName="h-auto w-full" />}
      <h3 className="mt-4 text-heading-3 group-hover:underline">
        {caseStudy ? caseStudy.title : page.title}
      </h3>
    </a>
  )
}

/**
 * The closing grid of other work. Which pages qualify — manual picks or a
 * capability match — is resolved against Payload in the renderer, so this
 * only lays out the pages it is handed.
 */
export const RelatedWorkList = ({
  block,
  pages,
}: {
  block: CaseStudyRelatedWorkBlock
  pages: WorkPage[]
}) => {
  if (!pages.length) return null
  return (
    <RevealSection variant="intro">
      <div className="container mx-auto">
        <h2 className="mb-8 text-heading-2" data-reveal>
          {block.heading || 'Related work'}
        </h2>
        <div className={cn('grid gap-8', block.layout === 'grid' && 'md:grid-cols-3')}>
          {pages.map((item) => (
            <RelatedWorkCard key={item.id} page={item} />
          ))}
        </div>
      </div>
    </RevealSection>
  )
}
