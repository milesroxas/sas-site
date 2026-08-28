'use client'

import { Tabs as TabsPrimitive } from 'radix-ui'
import type React from 'react'
import { Section } from '@/blocks/shared/section'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'
import type { FeatureTabsBlock as FeatureTabsBlockData } from '@/payload-types'

type FeatureTab = Omit<NonNullable<FeatureTabsBlockData['tabs']>[number], 'source'>
/**
 * `bare` skips the themed band for callers that supply their own themed shell
 * (the work-page renderer wraps blocks in a full-viewport reveal section).
 */
type FeatureTabsBlockProps = {
  /** Renderer supplies its own themed shell. */
  bare?: boolean
  blockType?: FeatureTabsBlockData['blockType']
  tabs: FeatureTab[]
  theme?: FeatureTabsBlockData['theme']
}

export const FeatureTabsBlock: React.FC<FeatureTabsBlockProps> = ({ bare, tabs, theme }) => {
  const panels = tabs ?? []
  if (panels.length === 0) return null

  const valueFor = (index: number) => panels[index]?.id ?? String(index)

  return (
    <Section bare={bare} theme={theme}>
      <div className="container">
        <TabsPrimitive.Root data-reveal defaultValue={valueFor(0)}>
          <TabsPrimitive.List
            aria-label="Feature tabs"
            className="flex flex-wrap items-center justify-center gap-8 pb-12 md:gap-24 md:pb-16"
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
          {panels.map((tab, index) => (
            <TabsPrimitive.Content
              key={tab.id ?? index}
              value={valueFor(index)}
              className="grid gap-12 lg:grid-cols-3 lg:gap-8"
            >
              <div className="flex flex-col justify-between gap-12">
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
                    {tab.subheading ? (
                      <h4 className="text-lg font-normal">{tab.subheading}</h4>
                    ) : null}
                    <ul className="text-base/relaxed">
                      {tab.items.map((item, itemIndex) => (
                        <li key={item.id ?? itemIndex}>{item.text}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
              <div className="relative min-h-80 bg-muted lg:col-span-2 lg:min-h-[390px]">
                {tab.media ? (
                  <Media fill imgClassName="object-cover" resource={tab.media} size="66vw" />
                ) : null}
                {tab.caption ? (
                  <div className="absolute right-4 bottom-4 max-w-[283px] rounded-md bg-card p-4 md:right-8 md:bottom-9">
                    <p className="text-sm text-muted-foreground">{tab.caption}</p>
                  </div>
                ) : null}
              </div>
            </TabsPrimitive.Content>
          ))}
        </TabsPrimitive.Root>
      </div>
    </Section>
  )
}
