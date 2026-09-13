import { Section } from '@/blocks/shared/section'
import type { StoryBody } from '@/collections/story/narrative'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'
import type { LabStorySectionBlock, Media as MediaDoc } from '@/payload-types'
import { populatedDoc } from '@/utilities/relationshipId'
import { cn } from '@/utilities/ui'

const storyWidths: Record<NonNullable<LabStorySectionBlock['width']>, string> = {
  narrow: 'max-w-3xl',
  standard: 'max-w-5xl',
  wide: 'max-w-7xl',
}

/**
 * A narrative beat, optionally beside its media. Which copy this renders (the
 * block's own fields or the Lab Project behind it) is decided by the renderer,
 * so the section only lays out the heading and body it is handed.
 */
export const StorySection = ({
  block,
  content,
  heading,
}: {
  block: LabStorySectionBlock
  content: StoryBody | null | undefined
  heading: string
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
          <h2 className="text-heading-2">{heading}</h2>
          <RichText data={content} enableGutter={false} />
        </div>
        {media && <Media resource={media} imgClassName="h-auto w-full" />}
      </div>
    </Section>
  )
}
