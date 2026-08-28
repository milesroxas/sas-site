import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'
import type { Media as MediaDoc, SplitContentNarrowBlock } from '@/payload-types'
import { cn } from '@/utilities/ui'
import { Section } from '../shared/section'
import { eyebrowClassName } from '../shared/typography'

/**
 * Presentational split layout: narrow text column beside a large image.
 * Collection-agnostic — the caller resolves `content` from whichever source
 * applies (inline body or canonical story content) and passes it in.
 *
 * Stacked below `md` (media always first regardless of `imagePosition`);
 * side-by-side from `md` with a fixed narrow text column, with heading and body
 * packed to the top.
 *
 * The copy column is a `text-stack`, so the eyebrow → heading → body rhythm and
 * the text-box trimming behind it come from the shared utility rather than gaps
 * set here. The eyebrow labels its heading at every breakpoint, in the one
 * kicker treatment the media and split family shares — it used to be rendered
 * twice, in two different styles, to sit below the heading on mobile.
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
  block: Pick<SplitContentNarrowBlock, 'eyebrow' | 'heading' | 'imagePosition' | 'theme'>
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
            htmlElement={null}
            imgClassName="object-cover"
            resource={media}
            size="(max-width: 768px) 100vw, 72vw"
          />
        </div>
        <div className="text-stack">
          {block.eyebrow && (
            <p className={eyebrowClassName} data-reveal>
              {block.eyebrow}
            </p>
          )}
          {block.heading && (
            <h2 className="text-heading-3 text-balance" data-reveal>
              {block.heading}
            </h2>
          )}
          <div data-reveal>
            <RichText
              className="text-base"
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
  return (
    <Section spacing="loose" theme={block.theme}>
      {inner}
    </Section>
  )
}
