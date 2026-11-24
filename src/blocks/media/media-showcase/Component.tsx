import { MediaShowcaseGrid, publicApprovedMedia } from '@/blocks/shared/media-showcase-grid'
import { RevealSection } from '@/blocks/shared/RevealSection.client'
import RichText from '@/components/RichText'
import type { WorkMediaShowcaseBlock } from '@/payload-types'

export const MediaShowcaseBlock = ({ block }: { block: WorkMediaShowcaseBlock }) => {
  const media = publicApprovedMedia(block.media)
  if (!media.length) return null
  return (
    <RevealSection spacing="loose" theme={block.theme} variant="underMedia">
      <div className="container mx-auto">
        {block.heading && (
          <h2 className="mb-6 text-heading" data-reveal>
            {block.heading}
          </h2>
        )}
        {block.introduction && (
          <div data-reveal>
            <RichText className="mb-10 max-w-3xl" data={block.introduction} enableGutter={false} />
          </div>
        )}
        <MediaShowcaseGrid
          layout={block.layout}
          media={media}
          reveal
          showCaptions={block.showCaptions}
          showCredits={block.showCredits}
        />
      </div>
    </RevealSection>
  )
}
