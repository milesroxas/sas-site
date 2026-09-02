import { Section } from '@/blocks/shared/section'
import { Media } from '@/components/Media'
import type {
  LabPage,
  LabProject,
  LabRelatedProjectsBlock,
  Media as MediaDoc,
} from '@/payload-types'
import { populatedDoc } from '@/utilities/relationshipId'
import { cn } from '@/utilities/ui'

const RelatedProjectCard = ({ item }: { item: LabPage }) => {
  const coverAsset = populatedDoc<MediaDoc>(item.coverAsset)
  const labProject = populatedDoc<LabProject>(item.labProject)
  return (
    <a className="group pressable pressable-subtle block" href={`/lab/${item.slug}`}>
      {coverAsset && <Media resource={coverAsset} imgClassName="h-auto w-full" />}
      <h3 className="mt-4 text-heading-3 group-hover:underline">
        {labProject ? labProject.title : item.title}
      </h3>
    </a>
  )
}

/**
 * The closing grid of other lab work. Which pages qualify — manual picks or a
 * capability match — is resolved against Payload in the renderer, so this only
 * lays out the pages it is handed.
 */
export const RelatedProjectsList = ({
  block,
  pages,
}: {
  block: LabRelatedProjectsBlock
  pages: LabPage[]
}) => {
  if (!pages.length) return null
  return (
    <Section>
      <div className="container mx-auto">
        <h2 className="mb-8 text-heading-2">{block.heading || 'More from the lab'}</h2>
        <div className={cn('grid gap-8', block.layout === 'grid' && 'md:grid-cols-3')}>
          {pages.map((item) => (
            <RelatedProjectCard item={item} key={item.id} />
          ))}
        </div>
      </div>
    </Section>
  )
}
