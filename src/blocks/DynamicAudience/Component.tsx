'use client'

import { useRef, useState } from 'react'
import { HeadingDropdown } from '@/blocks/shared/heading-dropdown'
import { Media } from '@/components/Media'
import type {
  DynamicAudienceBlock as DynamicAudienceBlockProps,
  Media as MediaDoc,
} from '@/payload-types'
import { useRevealSwap } from '@/shared/ui/scroll-reveal'
import { Container } from '../shared/container'
import { Section, type SectionTheme } from '../shared/section'

export const DynamicAudienceBlock: React.FC<DynamicAudienceBlockProps> = ({
  heading,
  audiences,
  theme,
}) => {
  const panels = audiences ?? []
  const [active, setActive] = useState(0)
  const rootRef = useRef<HTMLDivElement>(null)
  const selectAudience = useRevealSwap({ rootRef, active, onSwap: setActive })

  if (panels.length === 0) return null

  const current = panels[active] ?? panels[0]
  const media = typeof current.media === 'object' ? (current.media as MediaDoc) : null

  return (
    <Section theme={(theme as SectionTheme | null) ?? 'light'}>
      <Container width="standard" className="flex flex-col gap-8 md:gap-16 lg:gap-24" ref={rootRef}>
        <HeadingDropdown
          activeIndex={active}
          heading={heading}
          onSelect={selectAudience}
          options={panels.map((audience) => audience.title)}
          subheading={current.subheading}
        />

        <div className="flex flex-col items-stretch gap-8 md:gap-12 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex w-full max-w-xl flex-col gap-6 md:gap-8" data-reveal>
            <p className="text-xl leading-8 text-foreground md:text-2xl" data-swap="text">
              {current.intro}
            </p>
            {current.items?.length ? (
              <ul className="flex flex-col divide-y divide-border">
                {current.items.map((item, itemIndex) => (
                  <li
                    key={item.id ?? itemIndex}
                    className="py-2.5 text-base leading-6 text-muted-foreground first:pt-0 last:pb-0 md:py-3 md:text-lg md:leading-7"
                    data-swap="text"
                  >
                    {item.text}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <div
            className="relative aspect-4/5 w-full shrink-0 overflow-hidden bg-muted lg:w-118 lg:self-start"
            data-reveal="media"
          >
            <div className="absolute inset-0" data-swap="media">
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
      </Container>
    </Section>
  )
}
