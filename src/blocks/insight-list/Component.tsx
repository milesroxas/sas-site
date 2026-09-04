import type React from 'react'
import { BlockGrid } from '@/blocks/shared/grid'
import { Section } from '@/blocks/shared/section'
import { eyebrowClassName } from '@/blocks/shared/typography'
import { Container } from '@/components/Container'
import type { InsightListBlock as InsightListBlockData } from '@/payload-types'
import { cn } from '@/utilities/ui'
import { hasInsightMarks, Insight } from './Insight'

/**
 * `bare` skips the themed band for callers that supply their own shell (a
 * Section block's band, or a renderer's reveal band).
 */
type InsightListBlockProps = Pick<
  InsightListBlockData,
  'blockType' | 'eyebrow' | 'heading' | 'items' | 'layout' | 'markSize' | 'summary' | 'theme'
> & { bare?: boolean }

type Layout = NonNullable<InsightListBlockData['layout']>

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
  const compact = !hasInsightMarks(insights)

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
                compact={compact}
                group={`row-${Math.floor(index / arrangement.perRow)}`}
                index={index}
                item={item}
                key={item.id ?? index}
                markSize={size}
              />
            ))}
          </BlockGrid>
        </BlockGrid>
      </Container>
    </Section>
  )
}
