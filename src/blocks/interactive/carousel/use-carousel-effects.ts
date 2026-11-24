'use client'

import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import type { CarouselApi } from '@/components/ui/carousel'
import type { CaOffsets, DissolveMap } from './filters'
import { computeTweenFactor, forEachSnapDistance } from './geometry'
import { collectSlideRefs, createPlaybackController, type SlideRefs } from './playback'
import { captionOpacity, clamp, slideVisualState } from './visual-state'

gsap.registerPlugin(useGSAP)

/** Chromatic aberration: px of RGB split per unit of embla scroll velocity, and its cap. */
const CA_VELOCITY_SCALE = 0.12
const CA_MAX_PX = 1.5
/** Below this the split is invisible; snap dx to 0 so settled frames are pixel-identical. */
const CA_MIN_PX = 0.05

const identity = (signed: number): number => signed

type Options = {
  api: CarouselApi
  caId: string
  caOffsets: CaOffsets
  dissolveId: string
  dissolveMap: DissolveMap
}

/**
 * All runtime behavior for the carousel, in one GSAP context, derived from a
 * single value per slide: its signed snap distance (see ./geometry), mapped
 * through `slideVisualState` and written straight to the node. The one source
 * of truth is embla's scroll position — there is no intermediate animation
 * state, so the visuals can never lag, race, or disagree with it:
 *
 * - `scroll` fires every frame embla moves (drag follows the pointer 1:1;
 *   arrows ride embla's own spring), and each frame is a pure function of
 *   scroll position.
 * - `settle` writes the same value rounded to the whole snap embla rests on,
 *   because it can stop a hair off-snap; the active slide always ends
 *   dead-flat facing the viewer. Same source, same math — no second writer.
 *   Settle also drives playback and posters (see ./playback).
 *
 * The chromatic-aberration tear rides scroll velocity through a gsap.quickTo
 * envelope driving only the feOffset dx values. The SVG filter itself stays
 * attached to the track permanently: at dx 0 the channel split recombines to
 * the identity image, and never toggling `filter` means the compositor never
 * rebuilds the subtree's layers (toggling it flashed the slides' own
 * opacity/filter for a frame at drag start).
 */
export const useCarouselEffects = ({ api, caId, caOffsets, dissolveId, dissolveMap }: Options) => {
  useGSAP(
    (_context, contextSafe) => {
      if (!api || !contextSafe) return

      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const trackNode = api.containerNode()

      let tweenFactor = 1
      let slideRefs: (SlideRefs | null)[] = []

      const applySlide = (refs: SlideRefs, signed: number) => {
        const state = slideVisualState(signed)
        // Direct style writes: GSAP's transform cache swallows raw transform
        // strings pushed through quickSetter.
        refs.node.style.transform = state.transform
        refs.node.style.opacity = String(state.opacity)
        refs.node.style.filter = state.filter
        // Caption rides the same value on its own steeper ramp, so it is one
        // more pure write per frame rather than a second animation.
        if (refs.caption) refs.caption.style.opacity = String(captionOpacity(signed))
      }

      /** Paint every slide from the current scroll position, posing via `poseOf`. */
      const paintSlides = (poseOf: (signed: number) => number) => {
        forEachSnapDistance(
          api.internalEngine(),
          api.scrollSnapList(),
          api.scrollProgress(),
          tweenFactor,
          (slideIndex, signed) => {
            const refs = slideRefs[slideIndex]
            if (refs) applySlide(refs, poseOf(signed))
          },
        )
      }

      // --- Chromatic aberration envelope -----------------------------------
      const caProxy = { px: 0 }
      const applyCa = () => {
        const px = Math.abs(caProxy.px) < CA_MIN_PX ? 0 : caProxy.px
        caOffsets.current.red?.setAttribute('dx', String(px))
        caOffsets.current.blue?.setAttribute('dx', String(-px))
      }
      const caTo = gsap.quickTo(caProxy, 'px', {
        duration: 0.2,
        ease: 'power3.out',
        onUpdate: applyCa,
      })
      if (!reducedMotion) {
        trackNode.style.filter = `url(#${caId})`
      }

      // --- Scroll: one pure write per frame ---------------------------------
      const tween = () => {
        if (!reducedMotion) {
          const velocity = api.internalEngine().scrollBody.velocity()
          caTo(clamp(velocity * CA_VELOCITY_SCALE, -CA_MAX_PX, CA_MAX_PX))
        }
        paintSlides(identity)
      }

      // --- Playback + posters (settle-driven, see ./playback) ---------------
      const playback = createPlaybackController({
        api,
        contextSafe,
        dissolveId,
        dissolveMap,
        getSlideRefs: () => slideRefs,
        reducedMotion,
      })

      const onSettle = contextSafe(() => {
        // Embla can rest a hair off-snap; round so the active slide ends
        // dead-flat facing the viewer.
        paintSlides(Math.round)
        playback.syncVideos()
      })

      // --- Wiring -----------------------------------------------------------
      const setup = () => {
        tweenFactor = computeTweenFactor(api.scrollSnapList())
        slideRefs = api.slideNodes().map(collectSlideRefs)
        // First paint matches the server-rendered rest styles: same function,
        // same geometry.
        paintSlides(identity)
      }

      // Hidden tabs suspend muted playback and rAF; re-sync when shown again.
      const onVisibility = () => {
        if (!document.hidden) playback.syncVideos()
      }

      const onReInit = () => {
        setup()
        tween()
        onSettle()
      }

      onReInit()
      api.on('reInit', onReInit)
      api.on('scroll', tween)
      api.on('settle', onSettle)
      document.addEventListener('visibilitychange', onVisibility)

      return () => {
        document.removeEventListener('visibilitychange', onVisibility)
        api.off('reInit', onReInit)
        api.off('scroll', tween)
        api.off('settle', onSettle)
        playback.dispose()
        trackNode.style.filter = ''
      }
    },
    { dependencies: [api] },
  )
}
