import type React from 'react'
import { BlockGrid } from '@/blocks/shared/grid'
import { ordinalLabel } from '@/blocks/shared/numbering'
import { Section } from '@/blocks/shared/section'
import { eyebrowClassName } from '@/blocks/shared/typography'
import { Container } from '@/components/Container'
import type { InsightListBlock as InsightListBlockData } from '@/payload-types'
import { getMediaUrl } from '@/utilities/getMediaUrl'
import { cn } from '@/utilities/ui'

/**
 * `bare` skips the themed band for callers that supply their own shell (a
 * Section block's band, or a renderer's reveal band).
 */
type InsightListBlockProps = Pick<
  InsightListBlockData,
  'blockType' | 'eyebrow' | 'heading' | 'items' | 'layout' | 'markSize' | 'summary' | 'theme'
> & { bare?: boolean }

type Layout = NonNullable<InsightListBlockData['layout']>
type MarkSize = NonNullable<InsightListBlockData['markSize']>
type Item = NonNullable<InsightListBlockData['items']>[number]

/**
 * Where each arrangement puts the heading cluster and how many insights share
 * a row. The list itself always takes columns 3-8 as a subgrid of the
 * composition grid, so an insight's width is a span of the same tracks the
 * heading sits on: side by side, the heading holds columns 1-2 and two
 * insights split the six; stacked, the heading runs across columns 1-4 and
 * the list drops to the next row with three insights per row.
 */
const LAYOUT: Record<Layout, { heading: string; item: string; perRow: number }> = {
  side: { heading: 'md:col-span-2', item: 'md:col-span-3', perRow: 2 },
  stacked: { heading: 'md:col-span-4', item: 'md:col-span-2', perRow: 3 },
}

/** Editor-chosen mark box; `medium` is the Paper frame's 40px slot. */
const MARK_SIZE_CLASS: Record<MarkSize, string> = {
  small: 'size-7',
  medium: 'size-10',
  large: 'size-14',
}

/**
 * The SVG mark, painted as a mask over the current text color rather than as
 * an image: the file's own fills and strokes become a silhouette in whatever
 * ink the band uses, so one upload reads correctly on a light page and on an
 * inverted band alike. Decorative beside the title, hence hidden from AT.
 *
 * The slot keeps its size when an insight has no mark, so titles stay on one
 * lane across a list where only some items carry one.
 */
const Mark: React.FC<{ media: Item['media']; size: MarkSize }> = ({ media, size }) => {
  const doc = media && typeof media === 'object' && media.url ? media : null
  return (
    <span
      aria-hidden="true"
      className={cn(
        'shrink-0',
        MARK_SIZE_CLASS[size],
        doc && 'bg-current mask-center mask-contain mask-no-repeat',
      )}
      style={doc ? { maskImage: `url("${getMediaUrl(doc.url, doc.updatedAt)}")` } : undefined}
    />
  )
}

/**
 * One insight: a rule, then the mark and its ordinal on one line, then the
 * copy. Insights in the same row share a reveal beat (`data-reveal-group`
 * folds consecutive markers), so a six-item list lands as three thoughts
 * after the heading rather than a cascade of six.
 */
const Insight: React.FC<{
  className: string
  index: number
  item: Item
  markSize: MarkSize
  row: number
}> = ({ className, index, item, markSize, row }) => (
  <li
    className={cn('flex flex-col gap-5 border-t border-border pt-5', className)}
    data-reveal
    data-reveal-group={`row-${row}`}
  >
    <div className="flex items-center justify-between">
      <Mark media={item.media} size={markSize} />
      <span className="font-mono text-xs/none tracking-widest text-muted-foreground">
        {ordinalLabel(index)}
      </span>
    </div>
    <div className="flex flex-col gap-2">
      <h3 className="text-xl/7 font-medium">{item.title}</h3>
      <p className="text-base text-muted-foreground">{item.description}</p>
    </div>
  </li>
)

export const InsightListBlock: React.FC<InsightListBlockProps> = ({
  bare,
  eyebrow,
  heading,
  items,
  layout,
  markSize,
  summary,
  theme,
}) => {
  const insights = items ?? []
  if (insights.length === 0) return null

  const arrangement = LAYOUT[layout ?? 'side']
  const size = markSize ?? 'medium'

  return (
    <Section bare={bare} theme={theme}>
      <Container>
        <BlockGrid className="md:items-start">
          <div className={cn('text-stack', arrangement.heading)}>
            {eyebrow ? (
              <p
                className={cn(eyebrowClassName, 'tracking-widest uppercase')}
                data-reveal
                data-reveal-group="heading"
              >
                {eyebrow}
              </p>
            ) : null}
            <h2 className="text-heading-3" data-reveal data-reveal-group="heading">
              {heading}
            </h2>
            {summary ? (
              <p
                className="text-base text-muted-foreground"
                data-reveal
                data-reveal-group="heading"
              >
                {summary}
              </p>
            ) : null}
          </div>
          <BlockGrid as="ol" className="md:col-span-6 md:col-start-3" subgrid>
            {insights.map((item, index) => (
              <Insight
                className={arrangement.item}
                index={index}
                item={item}
                key={item.id ?? index}
                markSize={size}
                row={Math.floor(index / arrangement.perRow)}
              />
            ))}
          </BlockGrid>
        </BlockGrid>
      </Container>
    </Section>
  )
}
