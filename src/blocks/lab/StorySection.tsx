import { Section } from '@/blocks/shared/section'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'
import type { LabProject, LabStorySectionBlock, Media as MediaDoc } from '@/payload-types'
import { populatedDoc } from '@/utilities/relationshipId'
import { cn } from '@/utilities/ui'

const defaultHeading = (source: LabStorySectionBlock['source']) =>
  ({
    context: 'Context',
    approach: 'Approach',
    outcome: 'Outcome',
    learnings: 'Learnings',
    custom: '',
  })[source]

const storyWidths: Record<NonNullable<LabStorySectionBlock['width']>, string> = {
  narrow: 'max-w-3xl',
  standard: 'max-w-5xl',
  wide: 'max-w-7xl',
}

/**
 * A narrative beat, optionally beside its media. Which copy this renders —
 * the block's own body or the project's canonical section — is decided by the
 * renderer; the heading still falls back to the name of the section the block
 * points at, which the block alone knows.
 */
export const StorySection = ({
  block,
  content,
}: {
  block: LabStorySectionBlock
  content: NonNullable<LabProject['context']> | null | undefined
}) => {
  if (!content) return null
  const media = populatedDoc<MediaDoc>(block.media)
  const width = storyWidths[block.width ?? 'standard']
  return (
    <Section theme={block.theme}>
      <div
        className={cn(
          'container mx-auto grid gap-10',
          width,
          block.media && block.layout !== 'text-only' && 'md:grid-cols-2',
        )}
      >
        <div className={cn('text-stack', block.layout === 'text-right' && 'md:order-2')}>
          {block.eyebrow && <p className="text-sm uppercase tracking-[0.2em]">{block.eyebrow}</p>}
          <h2 className="text-heading-2">
            {block.headingOverride || defaultHeading(block.source)}
          </h2>
          <RichText data={content} enableGutter={false} />
        </div>
        {media && <Media resource={media} imgClassName="h-auto w-full" />}
      </div>
    </Section>
  )
}
