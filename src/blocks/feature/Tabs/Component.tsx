'use client'

import { Tabs as TabsPrimitive } from 'radix-ui'
import type React from 'react'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'
import type { FeatureTabsBlock as FeatureTabsBlockData } from '@/payload-types'

type FeatureTab = Omit<NonNullable<FeatureTabsBlockData['tabs']>[number], 'source'>
type FeatureTabsBlockProps = {
  blockType?: FeatureTabsBlockData['blockType']
  tabs: FeatureTab[]
}

export const FeatureTabsBlock: React.FC<FeatureTabsBlockProps> = ({ tabs }) => {
  const panels = tabs ?? []
  if (panels.length === 0) return null

  const valueFor = (index: number) => panels[index]?.id ?? String(index)

  return (
    <section className="container">
      <TabsPrimitive.Root data-reveal defaultValue={valueFor(0)}>
        <TabsPrimitive.List
          aria-label="Feature tabs"
          className="flex flex-wrap items-center justify-center gap-8 pb-12 md:gap-24 md:pb-16"
        >
          {panels.map((tab, index) => (
            <TabsPrimitive.Trigger
              key={tab.id ?? index}
              value={valueFor(index)}
              className="font-heading text-2xl text-muted-foreground transition-colors hover:text-foreground data-[state=active]:text-primary md:text-3xl"
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
              <div className="flex flex-col gap-6">
                <h3 className="text-xl font-normal md:text-2xl md:leading-tight">{tab.heading}</h3>
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
    </section>
  )
}
