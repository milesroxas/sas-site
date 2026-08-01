import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'
import type { ImagePairBlock, Media as MediaDoc } from '@/payload-types'
import { cn } from '@/utilities/ui'
import { Section } from '../shared/section'

export const ImagePair = ({
  bare = false,
  block,
  content,
  landscape,
  portrait,
}: {
  bare?: boolean
  block: ImagePairBlock
  content: DefaultTypedEditorState | null | undefined
  landscape: MediaDoc
  portrait: MediaDoc
}) => {
  if (!content) return null
  const portraitRight = block.portraitPosition === 'right'
  const textUnderLandscape = block.textPosition === 'under-landscape'
  // 1:2 column split keeps the 4:5 portrait and 16:10 landscape the same
  // rendered height. Text lands in row 2 of whichever column it belongs to;
  // on small screens the grid collapses and text always stacks last.
  const contentInLeftColumn = textUnderLandscape === portraitRight
  const portraitFigure = (
    <div
      className={cn(
        'relative aspect-4/5 w-full overflow-hidden bg-muted md:row-start-1',
        portraitRight ? 'md:col-start-2' : 'md:col-start-1',
      )}
      data-reveal="media"
    >
      <Media
        fill
        imgClassName="object-cover"
        resource={portrait}
        size="(max-width: 768px) 100vw, 33vw"
      />
    </div>
  )
  const landscapeFigure = (
    <div
      className={cn(
        'relative aspect-16/10 w-full overflow-hidden bg-muted md:row-start-1',
        portraitRight ? 'md:col-start-1' : 'md:col-start-2',
      )}
      data-reveal="media"
    >
      <Media
        fill
        imgClassName="object-cover"
        resource={landscape}
        size="(max-width: 768px) 100vw, 66vw"
      />
    </div>
  )
  const inner = (
    <div className="container">
      <div
        className={cn(
          'grid grid-cols-1 gap-6 md:gap-x-8',
          portraitRight ? 'md:grid-cols-[2fr_1fr]' : 'md:grid-cols-[1fr_2fr]',
        )}
      >
        {portraitRight ? landscapeFigure : portraitFigure}
        {portraitRight ? portraitFigure : landscapeFigure}
        <div
          className={cn(
            'flex flex-col gap-6 md:row-start-2',
            contentInLeftColumn ? 'md:col-start-1' : 'md:col-start-2',
            textUnderLandscape ? 'max-w-80 md:max-w-lg' : 'md:max-w-80',
          )}
          data-reveal
        >
          {block.heading && (
            <h2
              className={cn(
                'pr-8 font-heading text-4xl/10 font-normal tracking-tight text-balance',
                !textUnderLandscape && 'md:pr-24 md:text-2xl/8',
              )}
            >
              {block.heading}
            </h2>
          )}
          <RichText
            className="text-lg/7 [&_p+p]:mt-6"
            data={content}
            enableGutter={false}
            enableProse={false}
          />
        </div>
      </div>
    </div>
  )
  if (bare) return inner
  return <Section theme={block.theme}>{inner}</Section>
}
