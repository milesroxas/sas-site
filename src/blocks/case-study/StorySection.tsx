import type { CaseStudyStoryBody } from '@/collections/CaseStudies/story'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'
import type { Media as MediaDoc, WorkCaseStudyStorySectionBlock } from '@/payload-types'
import { populatedDoc } from '@/utilities/relationshipId'
import { cn } from '@/utilities/ui'
import { RevealSection } from './RevealSection.client'

const storySectionWidths: Record<NonNullable<WorkCaseStudyStorySectionBlock['width']>, string> = {
  narrow: 'max-w-3xl',
  standard: 'max-w-5xl',
  wide: 'max-w-7xl',
}

/**
 * A narrative beat, optionally beside its media. Which copy this renders —
 * the block's own fields or the canonical case study behind it — is decided
 * by the renderer, so the section only lays out the heading and body it is
 * handed.
 */
export const StorySection = ({
  block,
  content,
  heading,
}: {
  block: WorkCaseStudyStorySectionBlock
  content: CaseStudyStoryBody | null | undefined
  heading: string
}) => {
  if (!content) return null
  const media = populatedDoc<MediaDoc>(block.media)
  return (
    <RevealSection theme={block.theme} variant={media ? 'underMedia' : 'intro'}>
      <div
        className={cn(
          'container mx-auto grid gap-10',
          storySectionWidths[block.width ?? 'standard'],
          block.media && block.layout !== 'text-only' && 'md:grid-cols-2',
        )}
      >
        <div className={cn('text-stack', block.layout === 'text-right' && 'md:order-2')}>
          {block.eyebrow && (
            <p className="text-sm uppercase tracking-[0.2em]" data-reveal>
              {block.eyebrow}
            </p>
          )}
          <h2 className="text-heading-2" data-reveal>
            {heading}
          </h2>
          <div data-reveal>
            <RichText data={content} enableGutter={false} />
          </div>
        </div>
        {media && (
          <div data-reveal="media">
            <Media resource={media} imgClassName="h-auto w-full" />
          </div>
        )}
      </div>
    </RevealSection>
  )
}
