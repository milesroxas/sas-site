'use client'

import { Tabs as TabsPrimitive } from 'radix-ui'
import type React from 'react'
import { BlockGrid } from '@/blocks/shared/grid'
import { Section } from '@/blocks/shared/section'
import { Container } from '@/components/Container'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'
import type { FeatureTabsBlock as FeatureTabsBlockData } from '@/payload-types'
import { cn } from '@/utilities/ui'

type FeatureTab = Omit<NonNullable<FeatureTabsBlockData['tabs']>[number], 'source'>

/**
 * `bare` skips the themed band for callers that supply their own shell (a
 * Section block's band, or the work-page reveal band).
 */
type FeatureTabsBlockProps = {
  bare?: boolean
  blockType?: FeatureTabsBlockData['blockType']
  tabs: FeatureTab[]
  tabSize?: FeatureTabsBlockData['tabSize']
  theme?: FeatureTabsBlockData['theme']
}

/**
 * Default strip: heading-sized triggers that wrap onto a second row once the
 * labels outgrow the container (fine up to four tabs).
 *
 * Small strip: one type step down (`text-lead`, the same step Image statement
 * takes) and never wraps. Past the container it pans instead, the same rail
 * AudienceTabs uses below `md`: the strip bleeds to the page gutter so a
 * half-cut tab, not a scrollbar, is the affordance, and `scroll-fade-x` dims
 * only the edge with tabs still behind it. `justify-center-safe` keeps the
 * row centered while it fits and falls back to start alignment once it
 * overflows, so the first tab can never be scrolled out of reach.
 *
 * `-my-1 / py-1` is layout-neutral padding, not spacing: `overflow-x-auto`
 * clips on the block axis too, and without the room the triggers' focus ring
 * would be cropped.
 */
const TAB_STRIP = {
  default: 'flex flex-wrap items-center justify-center gap-8 md:gap-24',
  small:
    'no-scrollbar scroll-fade-x scroll-fade-8 -mx-gutter -my-1 flex items-center justify-center-safe gap-6 overflow-x-auto overscroll-x-contain py-1 pe-gutter ps-gutter md:gap-12',
} as const

const TAB_TRIGGER = {
  default: 'text-heading-3',
  small: 'shrink-0 text-lead whitespace-nowrap',
} as const

/**
 * One tab's panel on the composition grid. From `lg` the copy column (lead
 * statement, body, included list) takes columns 1-3 and the media plate
 * columns 4-8 at 16:9; grid cells stretch to the row, so the copy column's
 * `justify-between` pins the statement to the plate's top edge and the list
 * to its bottom. At `md` both cells span the full eight columns and stack on
 * the grid's gap, the plate at 3:2: three columns of a 768px page cannot hold
 * a heading, and a 16:9 plate there is shallower than its caption card.
 */
const TabPanel: React.FC<{ tab: FeatureTab }> = ({ tab }) => (
  <BlockGrid>
    <div className="flex flex-col justify-between gap-12 md:col-span-8 lg:col-span-3">
      <div className="text-stack">
        <h3 className="text-heading-3">{tab.heading}</h3>
        {tab.description ? (
          <RichText
            className="text-sm md:text-base"
            data={tab.description}
            enableGutter={false}
            enableProse={false}
          />
        ) : null}
      </div>
      {tab.items?.length ? (
        <div className="flex flex-col gap-3">
          {tab.subheading ? (
            <h4 className="font-mono text-sm font-normal text-muted-foreground">
              {tab.subheading}
            </h4>
          ) : null}
          <ul className="flex flex-col divide-y divide-border text-sm">
            {tab.items.map((item, itemIndex) => (
              <li key={item.id ?? itemIndex} className="py-1 last:pb-0">
                {item.text}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
    <div className="relative aspect-3/2 overflow-hidden bg-muted md:col-span-8 lg:col-span-5 lg:aspect-16/9">
      {tab.media ? (
        <Media
          fill
          htmlElement={null}
          imgClassName="object-cover"
          resource={tab.media}
          size="(max-width: 1024px) 100vw, 62vw"
        />
      ) : null}
      {tab.caption ? (
        <div className="absolute right-4 bottom-4 max-w-72 rounded-md bg-card p-4 md:right-8 md:bottom-9">
          <p className="text-sm text-muted-foreground">{tab.caption}</p>
        </div>
      ) : null}
    </div>
  </BlockGrid>
)

/**
 * The tab strip is a centered row of triggers; each panel is its own
 * `BlockGrid` below it (one grid per tab, only the active one painted). The
 * strip and the panels stack on a scale step (grid doc, G6) carried by a flex
 * column `gap` rather than `space-y-*`: `space-y` is a margin on the strip,
 * which the small rail's layout-neutral `-my-1` would override. The panels
 * sit in one wrapper so the step is taken once.
 */
export const FeatureTabsBlock: React.FC<FeatureTabsBlockProps> = ({
  bare,
  tabs,
  tabSize,
  theme,
}) => {
  const panels = tabs ?? []
  if (panels.length === 0) return null

  const size = tabSize === 'small' ? 'small' : 'default'
  const valueFor = (index: number) => panels[index]?.id ?? String(index)

  return (
    <Section bare={bare} theme={theme}>
      <Container>
        <TabsPrimitive.Root
          className="flex flex-col gap-12 md:gap-16"
          data-reveal
          defaultValue={valueFor(0)}
        >
          <TabsPrimitive.List aria-label="Feature tabs" className={TAB_STRIP[size]}>
            {panels.map((tab, index) => (
              <TabsPrimitive.Trigger
                key={tab.id ?? index}
                value={valueFor(index)}
                className={cn(
                  'text-muted-foreground transition-colors hover:text-foreground data-[state=active]:text-primary',
                  TAB_TRIGGER[size],
                )}
              >
                {tab.title}
              </TabsPrimitive.Trigger>
            ))}
          </TabsPrimitive.List>
          <div>
            {panels.map((tab, index) => (
              <TabsPrimitive.Content key={tab.id ?? index} value={valueFor(index)}>
                <TabPanel tab={tab} />
              </TabsPrimitive.Content>
            ))}
          </div>
        </TabsPrimitive.Root>
      </Container>
    </Section>
  )
}
