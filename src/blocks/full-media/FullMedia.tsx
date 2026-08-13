import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'
import { Container } from '@/components/Container'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'
import type { FullMediaBlock, Media as MediaDoc } from '@/payload-types'
import { cn } from '@/utilities/ui'
import { Section } from '../shared/section'

/**
 * Presentational full-media layout: viewport-wide media above a two-column
 * content row in the default page column. Collection-agnostic — the caller
 * resolves `content` from whichever source applies (inline body or canonical
 * story content) and passes it in.
 *
 * Media is 16:9 below `md` and 21:9 from `md` up. From `lg` the content row
 * caps at `max-w-3xl` and follows `contentPosition`; below `lg` it always
 * sits left on a `1fr 1fr 0.5fr` grid, the trailing half column leaving the
 * offset from the design.
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
  block: FullMediaBlock
  content: DefaultTypedEditorState | null | undefined
  media: MediaDoc
}) => {
  if (!content) return null
  const contentRight = block.contentPosition === 'right'
  const inner = (
    <div className="flex flex-col gap-8">
      <div
        className="relative aspect-16/9 w-full overflow-hidden bg-muted md:aspect-21/9"
        data-reveal="media"
      >
        <Media
          fill
          htmlElement={null}
          imgClassName="object-cover"
          resource={media}
          size="100vw"
        />
      </div>
      <Container>
        <div
          className={cn(
            'grid grid-cols-[1fr_1fr_0.5fr] gap-8 lg:max-w-3xl lg:grid-cols-2',
            contentRight && 'lg:ml-auto',
          )}
        >
          <div className="flex flex-col gap-3" data-reveal>
            {block.eyebrow && <p className="font-mono text-xs/none font-medium">{block.eyebrow}</p>}
            {block.heading && (
              <h2 className="font-heading text-2xl/8 font-normal tracking-tight text-balance">
                {block.heading}
              </h2>
            )}
          </div>
          <div data-reveal>
            <RichText
              className="text-base/6 lg:text-lg/7 [&_p+p]:mt-6"
              data={content}
              enableGutter={false}
              enableProse={false}
            />
          </div>
        </div>
      </Container>
    </div>
  )
  if (bare) return inner
  return <Section theme={block.theme}>{inner}</Section>
}
