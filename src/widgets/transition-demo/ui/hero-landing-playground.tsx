'use client'

import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { useRef, useState } from 'react'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'
import {
  useDemoAction,
  useDemoControls,
  useDemoMediaSource,
  useDemoSnippet,
} from '@/shared/ui/demo-kit'
import {
  HERO_LANDING,
  type HeroLandingPlan,
  planHeroLanding,
  runHeroLanding,
} from '@/shared/ui/hero-landing'
import { cn } from '@/utilities/ui'
import { TrackDiagram } from './reveal-track-diagram'
import { useEaseControl } from './use-ease-control'

gsap.registerPlugin(useGSAP)

/**
 * Where the destination's media sits on the mock page — enough shapes to see
 * every branch of the plan: a full-width band closes one axis, an inset card
 * closes both, a full-bleed hero closes neither and goes straight to the
 * dissolve.
 */
const DESTINATIONS: Record<string, string> = {
  'hero band': 'inset-x-0 top-0 h-3/5',
  'inset card': 'left-1/4 top-1/4 h-1/2 w-1/2',
  'full bleed': 'inset-0',
}

/** The Collapse folder: the hold and the per-axis mask close. */
function useCollapseControls() {
  const { hold, axisDuration, minAxisTravel } = useDemoControls('Collapse', {
    hold: { value: HERO_LANDING.hold, min: 0, max: 1.5, step: 0.05, label: 'hold (s)' },
    axisDuration: {
      value: HERO_LANDING.axisDuration,
      min: 0.1,
      max: 1.5,
      step: 0.05,
      label: 'per axis (s)',
    },
    minAxisTravel: {
      value: HERO_LANDING.minAxisTravel,
      min: 0,
      max: 24,
      step: 1,
      label: 'min travel (px)',
    },
  })
  const collapseEase = useEaseControl('Collapse', HERO_LANDING.collapseEase)
  return { hold, axisDuration, minAxisTravel, collapseEase }
}

/** The Settle folder: the dissolve into the destination's own media. */
function useSettleControls() {
  const { settleDuration } = useDemoControls('Settle', {
    settleDuration: {
      value: HERO_LANDING.settleDuration,
      min: 0.1,
      max: 1.5,
      step: 0.05,
      label: 'dissolve (s)',
    },
  })
  const settleEase = useEaseControl('Settle', HERO_LANDING.settleEase)
  return { settleDuration, settleEase }
}

/** One placeholder line of the mock destination page the mask uncovers. */
const PageLine = ({ className }: { className?: string }) => (
  <div className={cn('h-2 rounded-full bg-muted', className)} />
)

/**
 * Demo content: the shared hero landing — the closing half of every
 * full-screen media takeover — played on a mock viewport. The media starts
 * where a takeover leaves it (full-bleed, holding the screen), then the plan
 * runs: the mask closes one axis at a time onto the destination's media,
 * uncovering the page around it, and the destination's own copy of the media
 * dissolves in.
 *
 * The stage plays the plan with GSAP, exactly as the menu's hero handoff does
 * on its traveler; the work-open view transition feeds the same plan to WAAPI
 * on its group pseudo. Copy replaces `HERO_LANDING` wholesale, so both move
 * together. Demo-only.
 */
export function HeroLandingPlayground() {
  const [replayKey, setReplayKey] = useState(0)
  const [plan, setPlan] = useState<HeroLandingPlan | null>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const travelerRef = useRef<HTMLDivElement>(null)
  const destinationRef = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = usePrefersReducedMotion()

  const { hold, axisDuration, minAxisTravel, collapseEase } = useCollapseControls()
  const { settleDuration, settleEase } = useSettleControls()
  const { destination, radius } = useDemoControls('Preview', {
    destination: { value: 'hero band', options: Object.keys(DESTINATIONS), label: 'destination' },
    radius: { value: 0, min: 0, max: 48, step: 1, label: 'corner (px)' },
  })
  const { src, isVideo } = useDemoMediaSource()

  useDemoAction('replay landing', () => setReplayKey((n) => n + 1))

  // Copy replaces HERO_LANDING wholesale — the radius and the destination
  // shape are preview-only (production reads the destination element's own).
  useDemoSnippet({
    hold,
    axisDuration,
    collapseEase,
    minAxisTravel,
    settleDuration,
    settleEase,
  })

  useGSAP(
    () => {
      const stage = stageRef.current
      const traveler = travelerRef.current
      const target = destinationRef.current
      if (!stage || !traveler || !target) return

      const stageRect = stage.getBoundingClientRect()
      const targetRect = target.getBoundingClientRect()
      // The stage stands in for the viewport, and the traveler covers it — the
      // same full-bleed box the production surfaces hand the planner.
      const next = planHeroLanding(
        {
          box: { left: 0, top: 0, width: stageRect.width, height: stageRect.height },
          viewport: { width: stageRect.width, height: stageRect.height },
          target: {
            left: targetRect.left - stageRect.left,
            top: targetRect.top - stageRect.top,
            width: targetRect.width,
            height: targetRect.height,
          },
          radius,
        },
        { hold, axisDuration, collapseEase, minAxisTravel, settleDuration, settleEase },
      )
      setPlan(next)

      if (prefersReducedMotion) {
        gsap.set(traveler, { autoAlpha: 0 })
        return
      }
      gsap.set(traveler, { autoAlpha: 1, clipPath: next.from })
      runHeroLanding(traveler, next).to(
        traveler,
        { autoAlpha: 0, duration: next.settle.duration, ease: next.settle.ease },
        next.settle.at,
      )
    },
    {
      scope: stageRef,
      dependencies: [
        hold,
        axisDuration,
        collapseEase,
        minAxisTravel,
        settleDuration,
        settleEase,
        destination,
        radius,
        src,
        isVideo,
        prefersReducedMotion,
        replayKey,
      ],
    },
  )

  const media = isVideo ? (
    <video autoPlay className="size-full object-cover" loop muted playsInline src={src} />
  ) : (
    // biome-ignore lint/performance/noImgElement: blob: upload URLs are not valid next/image sources
    <img alt="" className="size-full object-cover" src={src} />
  )

  return (
    <>
      <div
        className="relative aspect-video w-full overflow-hidden rounded-md bg-background"
        ref={stageRef}
      >
        {/* The destination page, uncovered as the mask closes. */}
        <div className="absolute inset-0 flex flex-col justify-end gap-3 p-5 sm:p-8">
          <PageLine className="w-1/3" />
          <PageLine className="w-3/4" />
          <PageLine className="w-2/3" />
        </div>
        {/* Its own media — what the traveler dissolves into. */}
        <div
          className={cn('absolute overflow-hidden bg-muted', DESTINATIONS[destination])}
          ref={destinationRef}
          style={{ borderRadius: radius }}
        >
          {media}
        </div>
        {/* The takeover, parked full-bleed exactly where the approach leaves it. */}
        <div className="absolute inset-0" ref={travelerRef}>
          {media}
        </div>
      </div>

      {plan ? (
        <TrackDiagram
          bars={[
            ...plan.steps.map((step) => ({
              label: step.axis,
              kind: 'media' as const,
              start: step.at,
              duration: step.duration,
            })),
            {
              label: 'dissolve',
              kind: 'text' as const,
              start: plan.settle.at,
              duration: plan.settle.duration,
            },
          ]}
          summary={
            plan.steps.length === 0
              ? 'both axes already home — hold, then dissolve'
              : `${plan.steps.length === 1 ? 'one axis' : 'one axis at a time'} — never diagonal`
          }
        />
      ) : null}
    </>
  )
}
