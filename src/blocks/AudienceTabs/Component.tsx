'use client'

import { useRef, useState } from 'react'
import { Media } from '@/components/Media'
import type {
  AudienceTabsBlock as AudienceTabsBlockProps,
  Media as MediaDoc,
} from '@/payload-types'
import { useRevealSwap } from '@/shared/ui/scroll-reveal'
import { cn } from '@/utilities/ui'
import { Container } from '../shared/container'
import { Section, type SectionTheme } from '../shared/section'

export const AudienceTabsBlock: React.FC<AudienceTabsBlockProps> = ({ heading, tabs, theme }) => {
  const panels = tabs ?? []
  const [active, setActive] = useState(0)
  const rootRef = useRef<HTMLDivElement>(null)
  const selectTab = useRevealSwap({ rootRef, active, onSwap: setActive })

  if (panels.length === 0) return null

  const current = panels[active] ?? panels[0]
  const media = typeof current.media === 'object' ? (current.media as MediaDoc) : null

  return (
    <Section theme={(theme as SectionTheme | null) ?? 'dark'}>
      <Container
        width="standard"
        className="flex flex-col items-center gap-10 md:gap-16"
        ref={rootRef}
      >
        <h2
          className="max-w-3xl text-center text-3xl/9 font-light text-foreground/80 md:text-4xl/10"
          data-reveal
        >
          {heading}
        </h2>

        <div className="flex flex-wrap items-center justify-center gap-3" data-reveal>
          {panels.map((tab, index) => {
            const selected = index === active
            return (
              <button
                aria-pressed={selected}
                className={cn(
                  'flex items-center gap-2.5 rounded-full border px-8 py-2.5 text-base/none transition-colors',
                  selected
                    ? 'border-transparent bg-foreground/15 text-foreground'
                    : 'border-foreground/25 text-muted-foreground hover:text-foreground',
                )}
                key={tab.id ?? index}
                onClick={() => selectTab(index)}
                type="button"
              >
                {selected ? <span aria-hidden className="size-1.5 rounded-full bg-brand" /> : null}
                {tab.title}
              </button>
            )
          })}
        </div>

        <div className="flex w-full flex-col items-stretch gap-8 md:gap-12 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex w-full max-w-xl flex-col gap-8 md:gap-16" data-reveal>
            <p className="max-w-md text-xl/7 font-light md:text-2xl/8" data-swap="text">
              {current.intro}
            </p>
            {current.items?.length ? (
              <ul className="flex flex-col divide-y divide-foreground/20">
                {current.items.map((item, itemIndex) => (
                  <li
                    className="py-3 text-lg/6 first:pt-0 last:pb-0 md:text-xl/7"
                    data-swap="text"
                    key={item.id ?? itemIndex}
                  >
                    {item.text}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <div
            className="relative aspect-4/3 w-full shrink-0 overflow-hidden rounded-md bg-muted lg:w-160"
            data-reveal="media"
          >
            <div className="absolute inset-0" data-swap="media">
              {media ? (
                <Media
                  fill
                  htmlElement={null}
                  imgClassName="object-cover"
                  resource={media}
                  size="(max-width: 1024px) 100vw, 640px"
                />
              ) : null}
            </div>
          </div>
        </div>
      </Container>
    </Section>
  )
}
