import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'
import { Container } from '@/components/Container'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'
import type { ImagePairBlock, Media as MediaDoc } from '@/payload-types'
import { cn } from '@/utilities/ui'
import { BlockGrid } from '../shared/grid'
import { Section } from '../shared/section'

/**
 * Two figures side by side on the composition grid: the 16:10 landscape spans
 * 5 columns, the 4:5 portrait 3 (the grid's 2:1 approximation; the figures no
 * longer resolve to exactly equal heights, the portrait runs a little taller).
 * `portraitPosition` picks the side. Text lands in row 2 spanning 3 columns
 * from the start of whichever figure `textPosition` names; below `md` the grid
 * collapses and text always stacks last.
 */
export const ImagePair = ({
  bare = false,
  block,
  content,
  landscape,
  portrait,
}: {
  bare?: boolean
  block: Pick<ImagePairBlock, 'heading' | 'portraitPosition' | 'textPosition' | 'theme'>
  content: DefaultTypedEditorState | null | undefined
  landscape: MediaDoc
  portrait: MediaDoc
}) => {
  if (!content) return null
  const portraitRight = block.portraitPosition === 'right'
  const textUnderLandscape = block.textPosition === 'under-landscape'
  const landscapeStart = portraitRight ? 'md:col-start-1' : 'md:col-start-4'
  const portraitStart = portraitRight ? 'md:col-start-6' : 'md:col-start-1'
  const portraitFigure = (
    <div
      className={cn(
        'relative aspect-4/5 w-full overflow-hidden bg-muted md:col-span-3 md:row-start-1',
        portraitStart,
      )}
      data-reveal="media"
    >
      <Media
        fill
        htmlElement={null}
        imgClassName="object-cover"
        resource={portrait}
        size="(max-width: 768px) 100vw, 33vw"
      />
    </div>
  )
  const landscapeFigure = (
    <div
      className={cn(
        'relative aspect-16/10 w-full overflow-hidden bg-muted md:col-span-5 md:row-start-1',
        landscapeStart,
      )}
      data-reveal="media"
    >
      <Media
        fill
        htmlElement={null}
        imgClassName="object-cover"
        resource={landscape}
        size="(max-width: 768px) 100vw, 66vw"
      />
    </div>
  )
  const inner = (
    <Container>
      <BlockGrid>
        {portraitRight ? landscapeFigure : portraitFigure}
        {portraitRight ? portraitFigure : landscapeFigure}
        <div
          className={cn(
            'text-stack md:col-span-3 md:row-start-2',
            textUnderLandscape ? landscapeStart : portraitStart,
          )}
          data-reveal
        >
          {block.heading && <h2 className="text-heading-3 text-balance">{block.heading}</h2>}
          <RichText className="text-lg/7" data={content} enableGutter={false} enableProse={false} />
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
