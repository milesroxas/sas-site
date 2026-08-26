import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'
import { Container } from '@/components/Container'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'
import type { FullMediaBlock, Media as MediaDoc } from '@/payload-types'
import { cn } from '@/utilities/ui'
import { Section } from '../shared/section'

/**
 * Presentational full-media layout: media above a two-column content row.
 * Collection-agnostic — the caller resolves `content` from whichever source
 * applies (inline body or canonical story content) and passes it in.
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
const containedAspectClass = {
  '16-9': 'aspect-16/9',
  '3-2': 'aspect-3/2',
  '21-9': 'aspect-21/9',
} as const

export const FullMedia = ({
  bare = false,
  block,
  content,
  media,
}: {
  bare?: boolean
  block: Pick<
    FullMediaBlock,
    'aspectRatio' | 'contentPosition' | 'eyebrow' | 'heading' | 'theme' | 'width'
  >
  content: DefaultTypedEditorState | null | undefined
  media: MediaDoc
}) => {
  if (!content) return null
  const contentRight = block.contentPosition === 'right'
  const contained = block.width === 'contained'
  const aspectClass = contained
    ? containedAspectClass[block.aspectRatio ?? '16-9']
    : 'aspect-16/9 md:aspect-21/9'
  const mediaFrame = (
    <div
      className={cn('relative w-full overflow-hidden bg-muted', aspectClass)}
      data-reveal="media"
    >
      <Media fill htmlElement={null} imgClassName="object-cover" resource={media} size="100vw" />
    </div>
  )
  const contentRow = (
    <div
      className={cn(
        'grid grid-cols-[1fr_1fr_0.5fr] gap-8 lg:max-w-3xl lg:grid-cols-2',
        contentRight && 'lg:ml-auto',
      )}
    >
      <div className="flex flex-col gap-3" data-reveal>
        {block.eyebrow && <p className="font-mono text-xs/none font-medium">{block.eyebrow}</p>}
        {block.heading && <h2 className="text-heading-3 text-balance">{block.heading}</h2>}
      </div>
      <div data-reveal>
        <RichText
          className="text-base/6 lg:text-lg/7"
          data={content}
          enableGutter={false}
          enableProse={false}
        />
      </div>
    </div>
  )
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
      <Container>{contentRow}</Container>
    </div>
  )
  if (bare) return inner
  return <Section theme={block.theme}>{inner}</Section>
}
