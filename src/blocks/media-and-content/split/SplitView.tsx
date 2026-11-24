import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'
import { ASPECT_RATIO_CLASS } from '@/blocks/shared/aspect-ratio'
import { eyebrowClassName } from '@/blocks/shared/typography'
import { Container } from '@/components/Container'
import RichText from '@/components/RichText'
import { Visual } from '@/components/Visual'
import type { Visual as VisualValue } from '@/features/immersive/visual'
import type { SplitBlock as SplitBlockData } from '@/payload-types'
import { cn } from '@/utilities/ui'
import { BlockGrid } from '../../shared/grid'
import { Section } from '../../shared/section'

/**
 * Presentational split on the composition grid: media in columns 1-4, the
 * content in the other half, mirrored (media 5-8, content 1-4) when `layout`
 * is `right`. The wide sibling of Split narrow. Collection-agnostic: the
 * caller resolves `content` from whichever source applies (inline body or
 * canonical story content) and passes it in.
 *
 * From `lg` the text is centered in the space between the media's edge and
 * the browser's edge, not on the page column: the content cell runs from the
 * media edge (`-ms-grid-column` takes back the column gap) out to the screen
 * (`-me-(--container-inset)`, published by the `container-bleed` wrapper,
 * which equals the gutter plus whatever margin centers the capped column),
 * and the text stack sits centered in it. `px-gutter` on both sides keeps
 * the copy off the screen edge where the space is narrower than the stack,
 * without moving the center. The media stays on the grid, so its edges still
 * line up with the blocks around it. The two cells also center on each other
 * vertically (`lg:items-center`, the media not pinned to the top), whichever
 * is taller.
 *
 * Measure: the stack is capped at `max-w-lg` at every width, which holds
 * `text-body` near 60 characters a line (55 to 63 at the cap). Side by side
 * mounts at `lg`, not `md`: between 768 and 1024 the half beside the media
 * is about 300px and set lines of 34 to 42 characters, so below `lg` the
 * block stacks, media first regardless of `layout`, and the capped stack
 * keeps the full-width column from running past 75. Both cells pin
 * `lg:row-start-1`: in the mirrored layout the media cell precedes the
 * content cell in source order but sits in later columns, and
 * auto-placement would push the content to the next row.
 *
 * `bare` skips the `Section` wrapper for callers that supply their own shell
 * (the work-page renderer and the Section block both paint the band).
 * The `data-reveal` markers are inert unless such a shell animates them.
 */
export const SplitView = ({
  bare = false,
  block,
  content,
  visual,
}: {
  bare?: boolean
  block: Pick<SplitBlockData, 'aspectRatio' | 'eyebrow' | 'heading' | 'layout' | 'theme'>
  content: DefaultTypedEditorState | null | undefined
  visual: VisualValue
}) => {
  const mediaRight = block.layout === 'right'
  const inner = (
    <div className="container-bleed">
      <Container>
        <BlockGrid className="lg:items-center">
          <div
            className={cn(
              'relative w-full overflow-hidden bg-muted md:col-span-8 lg:col-span-4 lg:row-start-1',
              ASPECT_RATIO_CLASS[block.aspectRatio ?? '16-9'],
              mediaRight && 'lg:col-start-5',
            )}
            data-reveal="media"
          >
            <Visual
              fill
              htmlElement={null}
              imgClassName="object-cover"
              placement="block"
              size="(max-width: 1024px) 100vw, 50vw"
              visual={visual}
            />
          </div>
          <div
            className={cn(
              'md:col-span-8 lg:col-span-4 lg:row-start-1 lg:px-gutter',
              mediaRight
                ? 'lg:col-start-1 lg:-ms-(--container-inset) lg:-me-grid-column'
                : 'lg:col-start-5 lg:-ms-grid-column lg:-me-(--container-inset)',
            )}
          >
            <div className="text-stack max-w-lg lg:mx-auto">
              {block.eyebrow && (
                <p className={eyebrowClassName} data-reveal>
                  {block.eyebrow}
                </p>
              )}
              {block.heading && (
                <h2 className="text-subheading text-balance" data-reveal>
                  {block.heading}
                </h2>
              )}
              {content && (
                <div data-reveal>
                  <RichText
                    className="text-body text-pretty"
                    data={content}
                    enableGutter={false}
                    enableProse={false}
                  />
                </div>
              )}
            </div>
          </div>
        </BlockGrid>
      </Container>
    </div>
  )
  if (bare) return inner
  return (
    <Section spacing="loose" theme={block.theme}>
      {inner}
    </Section>
  )
}
