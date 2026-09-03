import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'
import { ASPECT_RATIO_CLASS } from '@/blocks/shared/aspect-ratio'
import { eyebrowClassName } from '@/blocks/shared/typography'
import { Container } from '@/components/Container'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'
import type {
  MediaContentSplitBlock as MediaContentSplitBlockData,
  Media as MediaDoc,
} from '@/payload-types'
import { cn } from '@/utilities/ui'
import { BlockGrid } from '../shared/grid'
import { Section } from '../shared/section'

/**
 * Presentational split on the composition grid: media in columns 1-4 with the
 * content stack in columns 5-7, mirrored (media 5-8, content 2-4) when
 * `layout` is `right`. The wide sibling of Split narrow. Collection-agnostic:
 * the caller resolves `content` from whichever source applies (inline body or
 * canonical story content) and passes it in.
 *
 * Stacked below `md` (media always first regardless of `layout`). Both cells
 * pin `md:row-start-1`: in the mirrored layout the media cell precedes the
 * content cell in source order but sits in later columns, and auto-placement
 * would push the content to the next row.
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
    <Container>
      <BlockGrid className="items-center">
        <div
          className={cn(
            'relative w-full self-start overflow-hidden bg-muted md:col-span-4 md:row-start-1',
            ASPECT_RATIO_CLASS[block.aspectRatio ?? '16-9'],
            mediaRight && 'md:col-start-5',
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
        <div
          className={cn(
            'text-stack md:col-span-3 md:row-start-1',
            mediaRight ? 'md:col-start-2' : 'md:col-start-5',
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
