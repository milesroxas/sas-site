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
 *
 * Stacked below `md` (media always first regardless of `imagePosition`, with
 * the eyebrow moving between heading and body); side-by-side from `md` with a
 * fixed narrow text column; from `lg` the body pins to the media's bottom edge.
 *
 * `bare` skips the `Section` wrapper for callers that supply their own shell
 * (the work-page renderer wraps blocks in a full-viewport reveal section).
 * The `data-reveal` markers are inert unless such a shell animates them.
 */
export const SplitContentNarrow = ({
  bare = false,
  block,
  content,
  media,
}: {
  bare?: boolean
  block: SplitContentNarrowBlock
  content: DefaultTypedEditorState | null | undefined
  media: MediaDoc
}) => {
  if (!content) return null
  const imageLeft = block.imagePosition === 'left'
  const inner = (
    <div className="container">
      <div
        className={cn(
          'grid gap-8',
          imageLeft ? 'md:grid-cols-[minmax(0,1fr)_17rem]' : 'md:grid-cols-[17rem_minmax(0,1fr)]',
        )}
      >
        <div
          className={cn(
            'relative aspect-5/4 w-full self-start overflow-hidden bg-muted md:aspect-3/2',
            !imageLeft && 'md:order-2',
          )}
          data-reveal="media"
        >
          <Media
            fill
            imgClassName="object-cover"
            resource={media}
            size="(max-width: 768px) 100vw, 72vw"
          />
        </div>
        <div className="flex flex-col gap-8 md:gap-16 lg:justify-between">
          <div className="flex flex-col gap-3" data-reveal>
            {block.eyebrow && (
              <p className="hidden font-mono text-xs/none font-medium md:block">{block.eyebrow}</p>
            )}
            {block.heading && (
              <h2 className="font-heading text-4xl/10 font-normal tracking-tight text-balance md:text-2xl/8">
                {block.heading}
              </h2>
            )}
          </div>
          <div className="flex flex-col gap-8 pt-20 md:pt-0" data-reveal>
            {block.eyebrow && (
              <p className="text-base/none font-normal md:hidden">{block.eyebrow}</p>
            )}
            <RichText
              className="text-xl/7 md:text-lg/7 [&_p+p]:mt-6"
              data={content}
              enableGutter={false}
              enableProse={false}
            />
          </div>
        </div>
      </div>
    </div>
  )
  if (bare) return inner
  return <Section theme={block.theme}>{inner}</Section>
}
