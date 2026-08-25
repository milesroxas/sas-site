'use client'

import Link from 'next/link'
import { useEffect, useRef, useState, ViewTransition } from 'react'
import { HeadingDropdown } from '@/blocks/shared/heading-dropdown'
import type { WorkEntry } from '@/blocks/shared/resolve-work-entry'
import {
  fullViewportSectionClassName,
  type SectionTheme,
  themeClasses,
} from '@/blocks/shared/section'
import { Container } from '@/components/Container'
import { Media } from '@/components/Media'
import { cursorTarget, useCursorProximitySource } from '@/features/cursor'
import {
  INDUSTRY_WORK_MEDIA,
  RefractionMedia,
  type RefractionMediaProps,
  useWebglMediaLayer,
} from '@/features/immersive'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'
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
import { webglMediaSrc } from '@/utilities/webglMediaSrc'

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

/**
 * Main media with the shipped hover effect: the DOM `Media` paints first and
 * stays mounted as the fallback (reduced motion, absent GPUs, lost contexts)
 * and as the only layer during the shell's clip-path / scale entrance. A
 * WebGL canvas then loads the same URL and cross-fades in on top with the
 * `INDUSTRY_WORK_MEDIA` refraction lens + cursor Y tilt — but only after that
 * motion has settled, so shader compile never shares a frame with the wipe.
 * The DOM layer (and the `bg-muted` loading placeholder, which lives on it
 * rather than the panel box) stays fully visible until the canvas has faded
 * in over it, then hides so the tilt's perspective inset reveals the section
 * background, not a gray box or a static copy of the same media.
 */
const SHADER_FADE_MS = 500

const IndustryWorkMedia = ({
  media,
  proximity,
  canvasMounted,
  canvasHot,
}: {
  media: WorkEntry['media']
  /** Cursor-target proximity source; pre-activates the effects on approach. */
  proximity?: RefractionMediaProps['subscribeProximity']
  /** Mount the canvas once — never during a clip-path / scale tween. */
  canvasMounted: boolean
  /**
   * Visible hover layer. False during swap so the DOM track owns the scale;
   * the canvas stays mounted (no shader recompile) and sits outside `data-swap`.
   */
  canvasHot: boolean
}) => {
  const src = media ? webglMediaSrc(media) || undefined : undefined
  const isVideo = Boolean(media?.mimeType?.includes('video'))
  const { enabled, ready, handleReady } = useWebglMediaLayer(src, canvasMounted)
  const prefersReducedMotion = usePrefersReducedMotion()
  const showShader = ready && canvasHot
  const [fadeStarted, setFadeStarted] = useState(false)
  const [fadeDone, setFadeDone] = useState(false)

  useEffect(() => {
    if (!showShader) {
      setFadeStarted(false)
      setFadeDone(false)
      return
    }
    if (prefersReducedMotion) {
      setFadeStarted(true)
      setFadeDone(true)
      return
    }
    // One painted frame at opacity-0 with the enter duration applied, then
    // lift it — otherwise adding the transition in the same commit as opacity
    // 1 skips the fade and the shader pops on.
    const start = requestAnimationFrame(() => setFadeStarted(true))
    const done = window.setTimeout(() => setFadeDone(true), SHADER_FADE_MS)
    return () => {
      cancelAnimationFrame(start)
      window.clearTimeout(done)
    }
  }, [showShader, prefersReducedMotion])

  if (!media) return null

  const shaderVisible = showShader && fadeStarted
  // Keep the DOM image up until the canvas has faded in over it. A simultaneous
  // crossfade stacks two copies of the same pixels (a brightness flash) and,
  // with a still-clear WebGL buffer, punches through to the section background.
  const hideDom = showShader && fadeDone

  return (
    <>
      {/* Swap scale/fade targets this wrapper only — never the canvas. */}
      <div className="absolute inset-0" data-swap="media">
        <div className={cn('absolute inset-0 bg-muted', hideDom && 'opacity-0')}>
          <Media
            fill
            htmlElement={null}
            imgClassName="object-cover"
            resource={media}
            // Matches the layout: full width below lg, ~half the 96rem
            // container (cols 4–10) above. The work-open morph doesn't need a
            // bigger source — view-transition snapshots rasterize at painted
            // size, and the fullscreen hold is painted by the case-study
            // hero's own 100vw image on the destination page.
            size="(max-width: 1024px) 100vw, 50vw"
          />
        </div>
      </div>
      {enabled && src ? (
        <div
          aria-hidden
          className={cn(
            'pointer-events-none absolute inset-0 transition-opacity ease-out',
            !shaderVisible && 'opacity-0',
          )}
          style={{ transitionDuration: showShader ? `${SHADER_FADE_MS}ms` : '0ms' }}
        >
          <RefractionMedia
            className="size-full"
            onReady={handleReady}
            src={src}
            subscribeProximity={proximity}
            video={isVideo}
            {...INDUSTRY_WORK_MEDIA}
          />
        </div>
      ) : null}
    </>
  )
}

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
  // Canvas stays unmounted until the first entrance has cleared its clip-path
  // / scale. After that it stays mounted across industry swaps (no shader
  // recompile) and is only hidden while the DOM track owns the swap motion.
  const [canvasMounted, setCanvasMounted] = useState(false)
  const [canvasHot, setCanvasHot] = useState(false)
  const swapLockRef = useRef(false)
  const armCanvas = () => {
    if (swapLockRef.current) return
    setCanvasMounted(true)
    setCanvasHot(true)
  }
  const rootRef = useRef<HTMLDivElement>(null)
  const selectIndustry = useRevealSwap({
    rootRef,
    active,
    onSwapStart: () => {
      swapLockRef.current = true
      setCanvasHot(false)
    },
    onSwap: setActive,
    onSettled: () => {
      swapLockRef.current = false
      setCanvasMounted(true)
      setCanvasHot(true)
    },
  })

  // The media link is the cursor target; its proximity (0–1, shared with the
  // ring overlay) pre-activates the WebGL hover effects on approach.
  const mediaLinkRef = useRef<HTMLAnchorElement>(null)
  const mediaProximity = useCursorProximitySource(mediaLinkRef)

  const current = panels[active] ?? panels[0]
  const { work } = current

  return (
    <ScrollReveal
      enterThreshold={SCROLL_REVEAL_FULLSCREEN_ENTER_THRESHOLD}
      mediaOffset={INDUSTRY_WORK_MEDIA_OFFSET}
      variant="underMedia"
      onComplete={armCanvas}
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
              the design's hanging offset from the media's top. At lg its
              transparent empty area sits above the media link, which would
              swallow its clicks and release the custom cursor (the provider
              hit-tests targets for cover) — so the column itself passes
              pointer events through and only its content takes them. */}
          <div
            className="relative z-10 flex flex-col items-start gap-6 lg:pointer-events-none lg:col-start-1 lg:col-end-6 lg:row-start-1 lg:gap-10 lg:pt-20"
            data-reveal
          >
            <h3
              className="text-heading-3 font-light text-foreground lg:pointer-events-auto"
              data-swap="text"
            >
              {work.title}
            </h3>
            <Link
              className="text-sm font-medium text-foreground underline-offset-4 hover:underline lg:pointer-events-auto"
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
            {/* No bg on the box itself: the loading placeholder rides the DOM
                media layer inside, so the WebGL tilt's perspective inset shows
                the section background instead of a muted box. No
                overflow-hidden either — the WebGL canvas bleeds past the box
                (the preset's `bleed`) so the warp can melt the media's edges
                outward. The canvas mounts only after the reveal's clip-path
                is cleared, so the wipe never composites a live shader. */}
            <div
              className="relative -order-1 aspect-8/5 w-full lg:order-0 lg:col-start-4 lg:col-end-10 lg:row-start-1"
              data-reveal="media"
            >
              {/* The whole panel is the click surface into the work entry —
                  same navigation (and work-open morph) as the text link. The
                  `view` cursor ring materializes on approach, and the media
                  effects pre-activate off the same proximity signal. */}
              <Link
                aria-label={`View case study: ${work.title}`}
                className="absolute inset-0 block"
                href={work.href}
                ref={mediaLinkRef}
                transitionTypes={[...workOpenTransitionTypes]}
                {...cursorTarget({ variant: 'view' })}
              >
                <div className="absolute inset-0">
                  <IndustryWorkMedia
                    canvasHot={canvasHot}
                    canvasMounted={canvasMounted}
                    media={work.media}
                    proximity={mediaProximity}
                  />
                </div>
              </Link>
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
