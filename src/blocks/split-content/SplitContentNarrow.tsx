import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'
import type { Media as MediaDoc, SplitContentNarrowBlock } from '@/payload-types'
import { cn } from '@/utilities/ui'
import { Section } from '../shared/section'

/**
 * Presentational split layout: narrow text column beside a large image.
 * Collection-agnostic — the caller resolves `content` from whichever source
 * applies (inline body or canonical story content) and passes it in.
 */
export const SplitContentNarrow = ({
  block,
  content,
  media,
}: {
  block: SplitContentNarrowBlock
  content: DefaultTypedEditorState | null | undefined
  media: MediaDoc
}) => {
  if (!content) return null
  return (
    <Section theme={block.theme}>
      <div className="container mx-auto grid items-end gap-6 md:grid-cols-[1fr_3fr]">
        <div
          className={cn(
            'flex flex-col justify-end',
            block.imagePosition === 'left' && 'md:order-2',
          )}
        >
          {block.eyebrow && (
            <p className="mb-3 text-sm uppercase tracking-[0.2em]">{block.eyebrow}</p>
          )}
          {block.heading && <h2 className="mb-6 text-3xl md:text-5xl">{block.heading}</h2>}
          <RichText className="text-xl" data={content} enableGutter={false} />
        </div>
        <Media resource={media} imgClassName="h-auto w-full" />
      </div>
    </Section>
  )
}
