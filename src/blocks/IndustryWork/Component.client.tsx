'use client'

import Link from 'next/link'
import { useRef, useState, ViewTransition } from 'react'
import { HeadingDropdown } from '@/blocks/shared/heading-dropdown'
import type { WorkEntry } from '@/blocks/shared/resolve-work-entry'
import {
  fullViewportSectionClassName,
  type SectionTheme,
  themeClasses,
} from '@/blocks/shared/section'
import { Container } from '@/components/Container'
import { Media } from '@/components/Media'
import {
  sequenceWorkImageMorph,
  WORK_OPEN,
  workImageVtName,
  workOpenTransitionTypes,
} from '@/shared/lib/view-transition'
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
      <Container width="default" className="flex flex-col gap-12 md:gap-16 lg:gap-32" ref={rootRef}>
        <HeadingDropdown
          activeIndex={active}
          continuationFor={(index) => panels[index] ?? current}
          heading={heading}
          lowercase
          onSelect={selectIndustry}
          options={panels.map((panel) => panel.industry)}
          secondLine={current.secondLine}
          subheading={current.subheading}
        />

        <div className="grid grid-cols-1 gap-8 md:gap-10 lg:grid-cols-12 lg:gap-x-8 lg:gap-y-0">
          {/* Title column overlaps the media's left edge; the top padding is
              the design's hanging offset from the media's top. */}
          <div
            className="relative z-10 flex flex-col items-start gap-6 lg:col-start-1 lg:col-end-6 lg:row-start-1 lg:gap-10 lg:pt-20"
            data-reveal
          >
            <h3 className="text-heading-3 font-light text-foreground" data-swap="text">
              {work.title}
            </h3>
            <Link
              className="text-sm font-medium text-foreground underline-offset-4 hover:underline"
              data-swap="text"
              href={work.href}
              // Tags the navigation `work-open`: the root fades, the media
              // below centers vertically, expands to full screen, and holds alone,
              // then the new route fades in as the media travels to the
              // case-study hero and, last, shrinks into it
              // (see `view-transition.css` `.morph-hero`).
              transitionTypes={[...workOpenTransitionTypes]}
            >
              View case study
            </Link>
          </div>

          {/* Shared element: on "View case study" this box centers
              vertically, expands to full screen, holds there alone through
              the route swap, then travels to the case-study hero media's
              rect and shrinks into it as the final beat
              (`sequenceWorkImageMorph`; React fires `onShare` on this,
              the unmounting, side). Matching `name` in `CaseStudyHero*`. */}
          <ViewTransition
            default="none"
            name={workImageVtName(work.slug)}
            onShare={(_instance, types) =>
              types.includes(WORK_OPEN)
                ? sequenceWorkImageMorph(workImageVtName(work.slug))
                : undefined
            }
            share="morph-hero"
          >
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
                    // Full-width source on purpose: the work-open transition
                    // scales this exact raster to full screen and holds it.
                    size="100vw"
                  />
                ) : null}
              </div>
            </div>
          </ViewTransition>

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
