import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'
import { ASPECT_RATIO_CLASS } from '@/blocks/shared/aspect-ratio'
import { eyebrowClassName } from '@/blocks/shared/typography'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'
import type {
  MediaContentSplitBlock as MediaContentSplitBlockData,
  Media as MediaDoc,
} from '@/payload-types'
import { cn } from '@/utilities/ui'
import { Section } from '../shared/section'

/**
 * Presentational even split: media fills one column, the content stack the
 * other (the wide sibling of Split narrow). Collection-agnostic: the caller
 * resolves `content` from whichever source applies (inline body or canonical
 * story content) and passes it in.
 *
 * Stacked below `md` (media always first regardless of `layout`); side by
 * side from `md`, with `layout` choosing which column the media takes.
 *
 * `bare` skips the `Section` wrapper for callers that supply their own shell
 * (the work-page renderer and the Section block both paint the band).
 * The `data-reveal` markers are inert unless such a shell animates them.
 */
export const MediaContentSplit = ({
  bare = false,
  block,
  content,
  media,
}: {
  bare?: boolean
  block: Pick<
    MediaContentSplitBlockData,
    'aspectRatio' | 'eyebrow' | 'heading' | 'layout' | 'theme'
  >
  content: DefaultTypedEditorState | null | undefined
  media: MediaDoc
}) => {
  const mediaRight = block.layout === 'right'
  const inner = (
    <div className="container">
      <div className="grid items-center gap-8 md:grid-cols-2 md:gap-12">
        <div
          className={cn(
            'relative w-full self-start overflow-hidden bg-muted',
            ASPECT_RATIO_CLASS[block.aspectRatio ?? '16-9'],
            mediaRight && 'md:order-2',
          )}
          data-reveal="media"
        >
          <Media
            fill
            htmlElement={null}
            imgClassName="object-cover"
            resource={media}
            size="(max-width: 768px) 100vw, 50vw"
          />
        </div>
        <div className="text-stack max-w-xl">
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
