import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'
import { ASPECT_RATIO_CLASS } from '@/blocks/shared/aspect-ratio'
import { eyebrowClassName } from '@/blocks/shared/typography'
import { Container } from '@/components/Container'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'
import type { FullMediaBlock, Media as MediaDoc } from '@/payload-types'
import { cn } from '@/utilities/ui'
import { Section } from '../shared/section'

/**
 * Presentational full-media layout: media above an optional two-column content
 * row. Collection-agnostic — the caller resolves `content` from whichever source
 * applies (inline body or canonical story content) and passes it in.
 *
 * Media is the only requirement: with `showContent` off, or with no eyebrow,
 * heading or body authored, the block renders the media on its own.
 *
 * Full-width media is 16:9 below `md` and 21:9 from `md` up, edge to edge.
 * Contained media sits in the page column at the editor-chosen aspect ratio.
 * From `lg` the content row caps at `max-w-3xl` and follows `contentPosition`;
 * below `lg` it always sits left on a `1fr 1fr 0.5fr` grid, the trailing half
 * column leaving the offset from the design.
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
      className={cn('relative w-full overflow-hidden bg-muted', aspectClass)}
      data-reveal="media"
    >
      <Media fill htmlElement={null} imgClassName="object-cover" resource={media} size="100vw" />
    </div>
  )
  const contentRow = showContent ? (
    <div
      className={cn(
        'grid grid-cols-[1fr_1fr_0.5fr] gap-8 lg:max-w-3xl lg:grid-cols-2',
        contentRight && 'lg:ml-auto',
      )}
    >
      <div className="text-stack" data-reveal>
        {block.eyebrow && <p className={eyebrowClassName}>{block.eyebrow}</p>}
        {block.heading && <h2 className="text-heading-3 text-balance">{block.heading}</h2>}
      </div>
      {content && (
        <div data-reveal>
          <RichText
            className="text-base/6 lg:text-lg/7"
            data={content}
            enableGutter={false}
            enableProse={false}
          />
        </div>
      )}
    </div>
  ) : null
  const inner = contained ? (
    <Container>
      <div className="flex flex-col gap-8">
        {mediaFrame}
        {contentRow}
      </div>
    </Container>
  ) : (
    <div className="flex flex-col gap-8">
      {mediaFrame}
      {contentRow && <Container>{contentRow}</Container>}
    </div>
  )
  if (bare) return inner
  return (
    <Section spacing="loose" theme={block.theme}>
      {inner}
    </Section>
  )
}
