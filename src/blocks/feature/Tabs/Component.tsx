'use client'

import { Tabs as TabsPrimitive } from 'radix-ui'
import type React from 'react'
import { BlockGrid } from '@/blocks/shared/grid'
import { Section } from '@/blocks/shared/section'
import { Container } from '@/components/Container'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'
import type { FeatureTabsBlock as FeatureTabsBlockData } from '@/payload-types'

type FeatureTab = Omit<NonNullable<FeatureTabsBlockData['tabs']>[number], 'source'>

/**
 * `bare` skips the themed band for callers that supply their own shell (a
 * Section block's band, or the work-page reveal band).
 */
type FeatureTabsBlockProps = {
  bare?: boolean
  blockType?: FeatureTabsBlockData['blockType']
  tabs: FeatureTab[]
  theme?: FeatureTabsBlockData['theme']
}

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
        <div className="text-stack">
          {tab.subheading ? <h4 className="text-lg font-normal">{tab.subheading}</h4> : null}
          <ul className="text-base/relaxed">
            {tab.items.map((item, itemIndex) => (
              <li key={item.id ?? itemIndex}>{item.text}</li>
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
 * The tab strip is a centered row of heading-sized triggers; each panel is
 * its own `BlockGrid` below it (one grid per tab, only the active one
 * painted). The strip and the panels stack on a scale `space-y-*` (grid doc,
 * G6): the panels sit in one wrapper so only the strip carries the step.
 */
export const FeatureTabsBlock: React.FC<FeatureTabsBlockProps> = ({ bare, tabs, theme }) => {
  const panels = tabs ?? []
  if (panels.length === 0) return null

  const valueFor = (index: number) => panels[index]?.id ?? String(index)

  return (
    <Section bare={bare} theme={theme}>
      <Container>
        <TabsPrimitive.Root
          className="space-y-12 md:space-y-16"
          data-reveal
          defaultValue={valueFor(0)}
        >
          <TabsPrimitive.List
            aria-label="Feature tabs"
            className="flex flex-wrap items-center justify-center gap-8 md:gap-24"
          >
            {panels.map((tab, index) => (
              <TabsPrimitive.Trigger
                key={tab.id ?? index}
                value={valueFor(index)}
                className="text-heading-3 text-muted-foreground transition-colors hover:text-foreground data-[state=active]:text-primary"
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
