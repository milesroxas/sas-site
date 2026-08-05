'use client'

import { IconChevronDown } from '@tabler/icons-react'
import { useRef, useState } from 'react'
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
import { Container } from '../shared/container'
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
  const openedWithPointerRef = useRef(false)

  if (panels.length === 0) return null

  const current = panels[active] ?? panels[0]
  const media = typeof current.media === 'object' ? (current.media as MediaDoc) : null

  return (
    <Section theme={(theme as SectionTheme | null) ?? 'light'}>
      <Container width="standard" className="flex flex-col gap-8 md:gap-16 lg:gap-24">
        <h2 className="flex max-w-4xl flex-wrap items-center gap-x-3 gap-y-2 text-3xl font-light leading-10 text-foreground md:gap-4 md:text-4xl">
          <span className="text-muted-foreground">{heading}</span>
          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(
                'group inline-flex items-center justify-center gap-1.5 rounded-md px-2 py-1',
                'bg-muted text-3xl font-light font-mono text-foreground',
                'outline-none transition-colors hover:bg-accent',
                'focus:outline-none focus:ring-0',
                'focus-visible:ring-2 focus-visible:ring-ring/30',
                'data-[state=open]:bg-accent',
              )}
              onPointerDown={() => {
                openedWithPointerRef.current = true
              }}
              onKeyDown={() => {
                openedWithPointerRef.current = false
              }}
            >
              {current.title}
              <IconChevronDown className="size-6 shrink-0 transition-transform group-data-[state=open]:rotate-180" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              sideOffset={4}
              className={cn(
                'w-max min-w-(--radix-dropdown-menu-trigger-width) rounded-md bg-popover p-3 pr-14',
                'flex flex-col gap-6',
              )}
              onCloseAutoFocus={(event) => {
                if (openedWithPointerRef.current) {
                  event.preventDefault()
                  openedWithPointerRef.current = false
                }
              }}
            >
              {panels.map((audience, index) => {
                const selected = index === active
                return (
                  <DropdownMenuItem
                    key={valueFor(audience, index)}
                    className={cn(
                      'min-h-0 cursor-pointer rounded-none p-0 font-mono text-xl font-light whitespace-nowrap text-popover-foreground',
                      'focus:bg-transparent focus:text-popover-foreground',
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

        <div className="flex flex-col items-stretch gap-8 md:gap-12 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex w-full max-w-xl flex-col gap-6 md:gap-8">
            <p className="text-xl leading-8 text-foreground md:text-2xl">{current.intro}</p>
            {current.items?.length ? (
              <ul className="flex flex-col divide-y divide-border">
                {current.items.map((item, itemIndex) => (
                  <li
                    key={item.id ?? itemIndex}
                    className="py-2.5 text-base leading-6 text-muted-foreground first:pt-0 last:pb-0 md:py-3 md:text-lg md:leading-7"
                  >
                    {item.text}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <div className="relative aspect-4/5 w-full shrink-0 overflow-hidden bg-muted lg:w-[472px] lg:self-start">
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
      </Container>
    </Section>
  )
}
