import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'
import { ASPECT_RATIO_CLASS } from '@/blocks/shared/aspect-ratio'
import { eyebrowClassName } from '@/blocks/shared/typography'
import { Container } from '@/components/Container'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'
import type { FullMediaBlock, Media as MediaDoc } from '@/payload-types'
import { cn } from '@/utilities/ui'
import { BlockGrid } from '../shared/grid'
import { Section } from '../shared/section'

/**
 * Presentational full-media layout: media above an optional content row on the
 * composition grid. Collection-agnostic, the caller resolves `content` from
 * whichever source applies (inline body or canonical story content) and passes
 * it in.
 *
 * Media is the only requirement: with `showContent` off, or with no eyebrow,
 * heading or body authored, the block renders the media on its own.
 *
 * Full-width media is 16:9 below `md` and 21:9 from `md` up, edge to edge,
 * with the content row re-entering the page column. Contained media shares the
 * grid and spans all eight columns at the editor-chosen aspect ratio.
 *
 * Content row placement: heading cluster in columns 1-3 and body in columns
 * 4-6; columns 3-5 and 6-8 when `contentPosition` is `right`. Below `md` the
 * cells stack in one column.
 *
 * `bare` skips the `Section` wrapper for callers that supply their own shell
 * (the work-page renderer wraps blocks in a full-viewport reveal section).
 * The `data-reveal` markers are inert unless such a shell animates them.
 */
export const FullMedia = ({
  bare = false,
  block,
  content,
  media,
}: {
  bare?: boolean
  block: Pick<
    FullMediaBlock,
    'aspectRatio' | 'contentPosition' | 'eyebrow' | 'heading' | 'showContent' | 'theme' | 'width'
  >
  content: DefaultTypedEditorState | null | undefined
  media: MediaDoc
}) => {
  const showContent =
    block.showContent !== false && Boolean(block.eyebrow || block.heading || content)
  const contentRight = block.contentPosition === 'right'
  const contained = block.width === 'contained'
  const aspectClass = contained
    ? ASPECT_RATIO_CLASS[block.aspectRatio ?? '16-9']
    : 'aspect-16/9 md:aspect-21/9'
  const mediaFrame = (
    <div
      className={cn(
        'relative w-full overflow-hidden bg-muted',
        aspectClass,
        contained && 'md:col-span-8',
      )}
      data-reveal="media"
    >
      <Media fill htmlElement={null} imgClassName="object-cover" resource={media} size="100vw" />
    </div>
  )
  const contentCells = showContent ? (
    <>
      <div className={cn('text-stack md:col-span-3', contentRight && 'md:col-start-3')} data-reveal>
        {block.eyebrow && <p className={eyebrowClassName}>{block.eyebrow}</p>}
        {block.heading && <h2 className="text-heading-3 text-balance">{block.heading}</h2>}
      </div>
      {content && (
        <div
          className={cn('md:col-span-3', contentRight ? 'md:col-start-6' : 'md:col-start-4')}
          data-reveal
        >
          <RichText
            className="text-base/6 lg:text-lg/7"
            data={content}
            enableGutter={false}
            enableProse={false}
          />
        </div>
      )}
    </>
  ) : null
  const inner = contained ? (
    <Container>
      <BlockGrid>
        {mediaFrame}
        {contentCells}
      </BlockGrid>
    </Container>
  ) : (
    <div className="flex flex-col gap-grid">
      {mediaFrame}
      {contentCells && (
        <Container>
          <BlockGrid>{contentCells}</BlockGrid>
        </Container>
      )}
    </div>
  )
  if (bare) return inner
  return (
    <Section spacing="loose" theme={block.theme}>
      {inner}
    </Section>
  )
}
