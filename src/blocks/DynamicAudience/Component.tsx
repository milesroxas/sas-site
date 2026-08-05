'use client'

import { IconChevronDown } from '@tabler/icons-react'
import { useState } from 'react'
import { Media } from '@/components/Media'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type {
  DynamicAudienceBlock as DynamicAudienceBlockProps,
  Media as MediaDoc,
} from '@/payload-types'
import { cn } from '@/utilities/ui'
import { Section, type SectionTheme } from '../shared/section'

type Audience = NonNullable<DynamicAudienceBlockProps['audiences']>[number]

const valueFor = (audience: Audience, index: number) => audience.id ?? String(index)

export const DynamicAudienceBlock: React.FC<DynamicAudienceBlockProps> = ({
  heading,
  audiences,
  theme,
}) => {
  const panels = audiences ?? []
  const [active, setActive] = useState(0)

  if (panels.length === 0) return null

  const current = panels[active] ?? panels[0]
  const media = typeof current.media === 'object' ? (current.media as MediaDoc) : null

  return (
    <Section theme={(theme as SectionTheme | null) ?? 'dark'}>
      <div className="container flex flex-col gap-8">
        <h2 className="flex max-w-4xl flex-wrap items-center gap-4 text-3xl font-light leading-10 text-foreground md:text-4xl">
          <span className="text-muted-foreground">{heading}</span>
          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(
                'group inline-flex items-center justify-center gap-1.5 rounded-md px-3 py-3',
                'bg-foreground/45 text-3xl font-light font-mono text-foreground backdrop-blur-sm',
                'outline-none transition-colors hover:bg-muted/70',
                'focus-visible:ring-2 focus-visible:ring-ring',
                'data-[state=open]:bg-foreground/15',
              )}
            >
              {current.title}
              <IconChevronDown className="size-6 shrink-0 transition-transform group-data-[state=open]:rotate-180" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              sideOffset={4}
              className={cn(
                'min-w-0 rounded-md border-0 bg-background/35 p-3 pr-14 shadow-none ring-0 backdrop-blur-xl',
                'flex flex-col gap-6',
              )}
            >
              {panels.map((audience, index) => {
                const selected = index === active
                return (
                  <DropdownMenuItem
                    key={valueFor(audience, index)}
                    className={cn(
                      'min-h-0 cursor-pointer rounded-none p-0 font-mono text-xl font-light text-foreground',
                      'focus:bg-transparent focus:text-foreground',
                      selected && 'opacity-50',
                    )}
                    onSelect={() => setActive(index)}
                  >
                    {audience.title}
                  </DropdownMenuItem>
                )
              })}
            </DropdownMenuContent>
          </DropdownMenu>
          <span>{current.subheading}</span>
        </h2>

        <div className="flex flex-col items-stretch justify-between gap-12 lg:flex-row lg:items-center">
          <div className="flex w-full max-w-xl flex-col justify-center gap-16">
            <p className="text-xl leading-8 text-foreground md:text-2xl">{current.intro}</p>
            {current.items?.length ? (
              <ul className="flex flex-col divide-y divide-border">
                {current.items.map((item, itemIndex) => (
                  <li
                    key={item.id ?? itemIndex}
                    className="py-6 text-lg leading-7 text-muted-foreground first:pt-0 last:pb-0 md:text-xl md:leading-7"
                  >
                    {item.text}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <div className="relative aspect-4/5 w-full max-w-md shrink-0 overflow-hidden bg-muted lg:w-[472px] lg:max-w-none">
            {media ? (
              <Media
                fill
                htmlElement={null}
                imgClassName="object-cover"
                resource={media}
                size="(max-width: 1024px) 100vw, 472px"
              />
            ) : null}
          </div>
        </div>
      </div>
    </Section>
  )
}
