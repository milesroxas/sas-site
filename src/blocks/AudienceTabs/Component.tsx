'use client'

import { useRef, useState } from 'react'
import { Container } from '@/components/Container'
import { Media } from '@/components/Media'
import type {
  AudienceTabsBlock as AudienceTabsBlockProps,
  Media as MediaDoc,
} from '@/payload-types'
import { useRevealSwap } from '@/shared/ui/scroll-reveal'
import { cn } from '@/utilities/ui'
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
        width="default"
        className="flex flex-col items-center gap-10 md:gap-16"
        ref={rootRef}
      >
        <h2
          className="max-w-4xl text-center text-3xl/9 font-light text-foreground/80 md:text-4xl/10"
          data-reveal
        >
          {heading}
        </h2>

        <div className="flex flex-wrap items-center justify-center gap-4 mb-12" data-reveal>
          {panels.map((tab, index) => {
            const selected = index === active
            return (
              <button
                aria-pressed={selected}
                className={cn(
                  'flex items-center gap-2 rounded-full border px-4 py-2 text-lg/none transition-colors',
                  selected
                    ? 'border-transparent bg-foreground/15 text-foreground'
                    : 'border-foreground/25 text-muted-foreground hover:text-foreground',
                )}
                key={tab.id ?? index}
                onClick={() => selectTab(index)}
                type="button"
              >
                {selected ? (
                  <span aria-hidden className="size-1.75 rounded-full bg-green-600" />
                ) : null}
                {tab.title}
              </button>
            )
          })}
        </div>

        <div className="grid w-full grid-cols-1 items-stretch gap-8 md:gap-12 lg:grid-cols-12  lg:gap-x-12">
          <div className="flex w-full max-w-xl flex-col gap-8 md:gap-16 lg:col-span-5" data-reveal>
            <p className="max-w-md text-xl/7 font-light md:text-2xl/8" data-swap="text">
              {current.intro}
            </p>
            {current.items?.length ? (
              <ul className="flex flex-col divide-y divide-foreground/20">
                {current.items.map((item, itemIndex) => (
                  <li
                    className="py-3 text-lg/6 first:pt-0 last:pb-0 md:text-lg"
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
            className="relative aspect-4/3 w-full overflow-hidden rounded-md bg-muted lg:col-span-7"
            data-reveal="media"
          >
            <div className="absolute inset-0" data-swap="media">
              {media ? (
                <Media
                  fill
                  htmlElement={null}
                  imgClassName="object-cover"
                  resource={media}
                  size="(max-width: 1024px) 100vw, 58vw"
                />
              ) : null}
            </div>
          </div>
        </div>
      </Container>
    </Section>
  )
}
