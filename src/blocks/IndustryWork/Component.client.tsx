'use client'

import Link from 'next/link'
import { useRef, useState } from 'react'
import { Container } from '@/blocks/shared/container'
import { HeadingDropdown } from '@/blocks/shared/heading-dropdown'
import type { WorkEntry } from '@/blocks/shared/resolve-work-entry'
import {
  fullViewportSectionClassName,
  type SectionTheme,
  themeClasses,
} from '@/blocks/shared/section'
import { Media } from '@/components/Media'
import { forwardNavTransitionTypes } from '@/shared/lib/view-transition'
import {
  SCROLL_REVEAL_FULLSCREEN_ENTER_THRESHOLD,
  ScrollReveal,
  useRevealSwap,
} from '@/shared/ui/scroll-reveal'
import { cn } from '@/utilities/ui'

export type IndustryWorkPanel = {
  id: string
  industry: string
  subheading: string
  secondLine: string | null
  work: WorkEntry
}

/**
 * Media-track start against the text track (s). The under-media reveal leads
 * with the wipe (`mediaOffset: -0.5`); here the headline sits above the media,
 * so the wipe trails the text instead and the entrance reads top to bottom:
 * heading → title column → media → details.
 */
const INDUSTRY_WORK_MEDIA_OFFSET = 0.2

const MetaGroup = ({ label, values }: { label: string; values: string[] }) => (
  <div className="flex flex-col gap-2">
    <dt className="font-mono text-xs/none font-medium text-muted-foreground">{label}</dt>
    <dd className="flex flex-col gap-1 text-sm text-foreground lg:text-base" data-swap="text">
      {values.map((value) => (
        <span key={value}>{value}</span>
      ))}
    </dd>
  </div>
)

/**
 * Full-viewport spotlight: the case-study title column overlaps the media's
 * left edge and hangs from its top offset, while the CMS-sourced details
 * (client, capabilities) sit right of the media, centered on it. Entrance is
 * the shared under-media reveal in a self-owned full-screen shell; the
 * industry swap replays it through `useRevealSwap`.
 */
export const IndustryWorkClient = ({
  heading,
  panels,
  theme,
}: {
  heading: string
  panels: IndustryWorkPanel[]
  theme?: string | null
}) => {
  const [active, setActive] = useState(0)
  const rootRef = useRef<HTMLDivElement>(null)
  const selectIndustry = useRevealSwap({ rootRef, active, onSwap: setActive })

  const current = panels[active] ?? panels[0]
  const { work } = current

  return (
    <ScrollReveal
      enterThreshold={SCROLL_REVEAL_FULLSCREEN_ENTER_THRESHOLD}
      mediaOffset={INDUSTRY_WORK_MEDIA_OFFSET}
      variant="underMedia"
      className={cn(
        fullViewportSectionClassName,
        themeClasses[(theme as SectionTheme | null) || 'dark'],
        // Deeper vertical rhythm than the shared full-viewport band: extra
        // breathing room so neighboring sections don't crowd the spotlight.
        'py-32 md:py-48',
      )}
    >
      <Container
        width="standard"
        className="flex flex-col gap-12 md:gap-16 lg:gap-24"
        ref={rootRef}
      >
        <HeadingDropdown
          activeIndex={active}
          heading={heading}
          lowercase
          onSelect={selectIndustry}
          options={panels.map((panel) => panel.industry)}
          secondLine={current.secondLine}
          subheading={current.subheading}
          subheadingClassName="text-muted-foreground"
        />

        <div className="grid grid-cols-1 gap-8 md:gap-10 lg:grid-cols-12 lg:gap-x-8 lg:gap-y-0">
          {/* Title column overlaps the media's left edge; the top padding is
              the design's hanging offset from the media's top. */}
          <div
            className="relative z-10 flex flex-col items-start gap-6 lg:col-start-1 lg:col-end-6 lg:row-start-1 lg:gap-10 lg:pt-20"
            data-reveal
          >
            <h3 className="text-3xl/10 font-light text-foreground md:text-4xl/12" data-swap="text">
              {work.title}
            </h3>
            <Link
              className="text-sm font-medium text-foreground underline-offset-4 hover:underline"
              data-swap="text"
              href={work.href}
              transitionTypes={[...forwardNavTransitionTypes]}
            >
              View case study
            </Link>
          </div>

          <div
            className="relative -order-1 aspect-8/5 w-full overflow-hidden bg-muted lg:order-0 lg:col-start-4 lg:col-end-10 lg:row-start-1"
            data-reveal="media"
          >
            <div className="absolute inset-0" data-swap="media">
              {work.media ? (
                <Media
                  fill
                  htmlElement={null}
                  imgClassName="object-cover"
                  resource={work.media}
                  size="(max-width: 1024px) 100vw, 640px"
                />
              ) : null}
            </div>
          </div>

          {(work.client || work.capabilities.length > 0) && (
            <dl
              className="flex flex-row gap-12 lg:col-start-11 lg:col-end-13 lg:row-start-1 lg:flex-col lg:gap-8 lg:self-center"
              data-reveal
            >
              {work.client ? <MetaGroup label="Client" values={[work.client]} /> : null}
              {work.capabilities.length > 0 && (
                <MetaGroup
                  label={work.capabilities.length > 1 ? 'Capabilities' : 'Capability'}
                  values={work.capabilities}
                />
              )}
            </dl>
          )}
        </div>
      </Container>
    </ScrollReveal>
  )
}
