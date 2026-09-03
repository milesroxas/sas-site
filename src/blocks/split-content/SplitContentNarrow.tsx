import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'
import { Container } from '@/components/Container'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'
import type { Media as MediaDoc, SplitContentNarrowBlock } from '@/payload-types'
import { cn } from '@/utilities/ui'
import { BlockGrid } from '../shared/grid'
import { Section } from '../shared/section'
import { eyebrowClassName } from '../shared/typography'

/**
 * Presentational split on the composition grid: narrow text column beside a
 * large image. Collection-agnostic, the caller resolves `content` from
 * whichever source applies (inline body or canonical story content) and passes
 * it in.
 *
 * Media spans 5 columns at `md` and 6 from `lg`; the text column takes the
 * rest (3, then 2). The `lg` narrowing matches the old fixed 17rem column at
 * the design width; holding 3 columns at `md` keeps the copy readable where a
 * 2-column cell would be too tight. Mirrored when `imagePosition` is right.
 *
 * Stacked below `md` (media always first regardless of `imagePosition`), with
 * heading and body packed to the top. Both cells pin `md:row-start-1`: with
 * the image on the right the media cell precedes the text cell in source order
 * but sits in later columns, and auto-placement would push the text to the
 * next row.
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
    <Container>
      <BlockGrid>
        <div
          className={cn(
            'relative aspect-5/4 w-full self-start overflow-hidden bg-muted md:aspect-3/2',
            'md:col-span-5 md:row-start-1 lg:col-span-6',
            !imageLeft && 'md:col-start-4 lg:col-start-3',
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
        <div
          className={cn(
            'text-stack md:col-span-3 md:row-start-1 lg:col-span-2',
            imageLeft && 'md:col-start-6 lg:col-start-7',
          )}
        >
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
      </BlockGrid>
    </Container>
  )
  if (bare) return inner
  return (
    <Section spacing="loose" theme={block.theme}>
      {inner}
    </Section>
  )
}
