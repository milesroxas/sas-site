'use client'

import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import type React from 'react'
import { useRef, useSyncExternalStore } from 'react'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'
import {
  CHAR_PRESETS,
  createScrambleTween,
  SCRAMBLE_TEXT_DEFAULTS,
  type ScrambleTweenOptions,
} from '@/shared/ui/scramble-text'
import {
  CURSOR_ACTIVE_ATTR,
  CURSOR_ATTR,
  CURSOR_DEFAULTS,
  CURSOR_LABEL_ATTR,
  CURSOR_PROXIMITY_VAR,
  resolveCursorVariant,
} from './variants'

gsap.registerPlugin(useGSAP)

const FINE_POINTER_QUERY = '(pointer: fine)'

function subscribeFinePointer(onStoreChange: () => void): () => void {
  const mq = window.matchMedia(FINE_POINTER_QUERY)
  mq.addEventListener('change', onStoreChange)
  return () => mq.removeEventListener('change', onStoreChange)
}

/** SSR-safe `(pointer: fine)` — `false` on the server so the overlay never SSRs. */
function useFinePointer(): boolean {
  return useSyncExternalStore(
    subscribeFinePointer,
    () => window.matchMedia(FINE_POINTER_QUERY).matches,
    () => false,
  )
}

/**
 * Proximity-driven custom cursor: a lagging thin outer ring, a tighter inner
 * ring, and a mono label revealed on true hover. Targets opt in by spreading
 * `cursorTarget(...)` (data attributes), so server components stay server.
 *
 * Rings materialize continuously as the pointer nears a target (distance to
 * the target's nearest edge, not its center) and dissolve past the variant's
 * `proximityRadius`. The native cursor stays visible — the rings frame it.
 */
export const CustomCursorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const finePointer = useFinePointer()
  const prefersReducedMotion = usePrefersReducedMotion()
  const enabled = finePointer && !prefersReducedMotion

  return (
    <>
      {children}
      {enabled && <CursorOverlay />}
    </>
  )
}

const {
  fadeIn,
  fadeOut,
  hoverPopDuration,
  idleDelay,
  innerLag,
  innerSize,
  labelOffset,
  labelScrambleDuration,
  labelScrambleSpeed,
  outerGrowLag,
  outerLag,
  outerScaleMax,
  outerScaleMin,
  outerSize,
  strokeWidth,
} = CURSOR_DEFAULTS

/** Minimum best-proximity change that counts as approaching/receding. */
const T_EPSILON = 0.001

const CursorOverlay: React.FC = () => {
  const rootRef = useRef<HTMLDivElement>(null)
  const outerWrapRef = useRef<HTMLDivElement>(null)
  const outerScaleRef = useRef<HTMLDivElement>(null)
  const innerWrapRef = useRef<HTMLDivElement>(null)
  const outerRingRef = useRef<HTMLDivElement>(null)
  const innerRingRef = useRef<HTMLDivElement>(null)
  const labelRef = useRef<HTMLSpanElement>(null)

  const getEls = () => {
    const outerWrap = outerWrapRef.current
    const outerScale = outerScaleRef.current
    const innerWrap = innerWrapRef.current
    const outerRing = outerRingRef.current
    const innerRing = innerRingRef.current
    const label = labelRef.current
    if (!outerWrap || !outerScale || !innerWrap || !outerRing || !innerRing || !label) return null
    return { outerWrap, outerScale, innerWrap, outerRing, innerRing, label }
  }

  useGSAP(
    () => {
      const els = getEls()
      if (!els) return
      const { outerWrap, outerScale, innerWrap, outerRing, innerRing, label } = els

      gsap.set(label, { xPercent: -50, y: 6, opacity: 0, scale: 0.92 })
      gsap.set(outerScale, { scale: outerScaleMin })

      const xOuter = gsap.quickTo(outerWrap, 'x', { duration: outerLag, ease: 'power3.out' })
      const yOuter = gsap.quickTo(outerWrap, 'y', { duration: outerLag, ease: 'power3.out' })
      const xInner = gsap.quickTo(innerWrap, 'x', { duration: innerLag, ease: 'power3.out' })
      const yInner = gsap.quickTo(innerWrap, 'y', { duration: innerLag, ease: 'power3.out' })
      // Opacity lives on the ring leaves: an ancestor with opacity < 1 would
      // isolate the stacking context and break mix-blend-difference.
      const fadeRings = gsap.quickTo([outerRing, innerRing], 'opacity', {
        duration: fadeIn,
        ease: 'power2.out',
      })
      // Two scale layers so continuous growth and the discrete hover pop never
      // fight over one property: the wrapper tracks proximity (quickTo), the
      // ring itself carries the eased lock-on pop (tween).
      const scaleOuter = gsap.quickTo(outerScale, 'scale', {
        duration: outerGrowLag,
        ease: 'power3.out',
      })

      let lastX = 0
      let lastY = 0
      let hasPosition = false
      let activeEl: HTMLElement | null = null

      // Targets style themselves off this var (see variants.ts contract);
      // the provider only publishes proximity, never target visuals.
      const prevT = new WeakMap<HTMLElement, number>()
      const hot = new Set<HTMLElement>()

      const writeProximity = (el: HTMLElement, t: number) => {
        const q = Math.round(t * 1000) / 1000
        if (prevT.get(el) === q) return
        prevT.set(el, q)
        if (q > 0) {
          el.style.setProperty(CURSOR_PROXIMITY_VAR, String(q))
          hot.add(el)
        } else {
          el.style.removeProperty(CURSOR_PROXIMITY_VAR)
          hot.delete(el)
        }
      }

      const clearProximity = () => {
        for (const el of hot) {
          prevT.set(el, 0)
          el.style.removeProperty(CURSOR_PROXIMITY_VAR)
        }
        hot.clear()
      }

      let activeTargetEl: HTMLElement | null = null
      const setActiveTarget = (el: HTMLElement | null) => {
        if (el === activeTargetEl) return
        activeTargetEl?.removeAttribute(CURSOR_ACTIVE_ATTR)
        el?.setAttribute(CURSOR_ACTIVE_ATTR, '')
        activeTargetEl = el
      }

      // The proximity tease shows only while closing in: receding (including
      // leaving the target) or idling suppresses it until the pointer
      // approaches again. True hover always shows the rings.
      let lastBestT = 0
      let teaseSuppressed = false
      let idleTimer = 0

      // Label scrambles in with the shared scramble-text tween (SSOT for the
      // glyph churn) while a concurrent tween fades it up.
      const scrambleNotify: ScrambleTweenOptions['notify'] = { current: undefined }
      const scrambleOptions: ScrambleTweenOptions = {
        duration: labelScrambleDuration,
        ease: SCRAMBLE_TEXT_DEFAULTS.ease,
        charPool: CHAR_PRESETS[SCRAMBLE_TEXT_DEFAULTS.chars] ?? '',
        speed: labelScrambleSpeed,
        revealDelay: SCRAMBLE_TEXT_DEFAULTS.revealDelay,
        tweenLength: SCRAMBLE_TEXT_DEFAULTS.tweenLength,
        order: SCRAMBLE_TEXT_DEFAULTS.order,
        notify: scrambleNotify,
      }
      let labelScramble: gsap.core.Tween | null = null

      // Lock-on: wrapper sits at outerScaleMax while hovering, so the ring's
      // own scale makes up the difference to the variant's net hoverOuterScale.
      const popRing = (locked: boolean, netHoverScale: number) => {
        gsap.to(outerRing, {
          scale: locked ? netHoverScale / outerScaleMax : 1,
          duration: locked ? hoverPopDuration : 0.3,
          ease: 'power3.out',
          overwrite: 'auto',
        })
      }

      const showLabel = (text: string) => {
        label.textContent = ''
        labelScramble = createScrambleTween(label, '', text, scrambleOptions)
        gsap.set(label, { scale: 0.92 })
        gsap.to(label, {
          opacity: 1,
          y: 0,
          duration: labelScrambleDuration * 0.6,
          ease: 'power2.out',
          overwrite: 'auto',
        })
        gsap.to(label, { scale: 1, duration: labelScrambleDuration, ease: 'power2.inOut' })
      }

      const resetLabel = () => {
        label.textContent = ''
        gsap.set(label, { opacity: 0, y: 6, scale: 0.92 })
      }

      const hideLabel = () => {
        gsap.to(label, {
          opacity: 0,
          y: 6,
          duration: fadeOut,
          ease: 'power2.out',
          overwrite: 'auto',
        })
      }

      const setActive = (
        el: HTMLElement | null,
        netHoverScale: number = CURSOR_DEFAULTS.hoverOuterScale,
      ) => {
        if (el === activeEl) return
        activeEl = el
        labelScramble?.kill()
        labelScramble = null
        popRing(el !== null, netHoverScale)
        if (!el) {
          hideLabel()
          return
        }
        const text = el.getAttribute(CURSOR_LABEL_ATTR) ?? ''
        if (text) showLabel(text)
        else resetLabel()
      }

      // Live query + rect reads per move, like the targets' own hover CSS
      // would cost: target counts stay small (a handful per page).
      const scanTargets = () => {
        let bestT = 0
        let bestEl: HTMLElement | null = null
        let bestVariant = resolveCursorVariant(undefined)
        for (const el of document.querySelectorAll<HTMLElement>(`[${CURSOR_ATTR}]`)) {
          const variant = resolveCursorVariant(el.getAttribute(CURSOR_ATTR) ?? undefined)
          const rect = el.getBoundingClientRect()
          const dx = Math.max(rect.left - lastX, 0, lastX - rect.right)
          const dy = Math.max(rect.top - lastY, 0, lastY - rect.bottom)
          const t = Math.max(0, 1 - Math.hypot(dx, dy) / variant.proximityRadius)
          writeProximity(el, t)
          if (t > bestT) {
            bestT = t
            bestEl = el
            bestVariant = variant
          }
        }
        return { bestT, bestEl, bestVariant }
      }

      const updateTease = (hovering: boolean, bestT: number) => {
        if (hovering || bestT > lastBestT + T_EPSILON) teaseSuppressed = false
        else if (bestT < lastBestT - T_EPSILON) teaseSuppressed = true
        lastBestT = bestT
      }

      const update = () => {
        if (!hasPosition) return
        const { bestT, bestEl, bestVariant } = scanTargets()
        const hovering = bestT >= 1
        setActive(hovering ? bestEl : null, bestVariant.hoverOuterScale)
        setActiveTarget(hovering ? bestEl : null)
        updateTease(hovering, bestT)
        // Approach only teases the rings (0 → proximityMaxOpacity); the ease-out
        // jump to full opacity is reserved for actually being on the target.
        fadeRings(hovering ? 1 : teaseSuppressed ? 0 : bestT * bestVariant.proximityMaxOpacity)
        // Ring size tracks proximity: seed at rest, grown at the target's edge.
        scaleOuter(outerScaleMin + (outerScaleMax - outerScaleMin) * bestT)
      }

      const onMove = (event: PointerEvent) => {
        lastX = event.clientX
        lastY = event.clientY
        if (!hasPosition) {
          hasPosition = true
          gsap.set([outerWrap, innerWrap], { x: lastX, y: lastY })
        }
        xOuter(lastX)
        yOuter(lastY)
        xInner(lastX)
        yInner(lastY)
        window.clearTimeout(idleTimer)
        idleTimer = window.setTimeout(() => {
          // A still pointer in the proximity zone loses the tease; the next
          // approaching move brings it back.
          if (!activeEl) {
            teaseSuppressed = true
            fadeRings(0)
          }
        }, idleDelay * 1000)
        update()
      }

      const onScroll = () => update()

      const hide = () => {
        fadeRings(0)
        setActive(null)
        setActiveTarget(null)
        clearProximity()
        lastBestT = 0
      }

      const onPointerOut = (event: PointerEvent) => {
        if (!event.relatedTarget) hide()
      }

      window.addEventListener('pointermove', onMove, { passive: true })
      window.addEventListener('scroll', onScroll, { passive: true, capture: true })
      window.addEventListener('pointerout', onPointerOut)
      window.addEventListener('blur', hide)
      return () => {
        window.removeEventListener('pointermove', onMove)
        window.removeEventListener('scroll', onScroll, { capture: true })
        window.removeEventListener('pointerout', onPointerOut)
        window.removeEventListener('blur', hide)
        window.clearTimeout(idleTimer)
        setActiveTarget(null)
        clearProximity()
      }
    },
    { scope: rootRef },
  )

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0"
      ref={rootRef}
      style={{ zIndex: CURSOR_DEFAULTS.zIndex }}
    >
      <div className="absolute top-0 left-0 will-change-transform" ref={outerWrapRef}>
        {/* Zero-size wrapper: its transform-origin is the pointer point, so
            proximity scaling grows the ring around the cursor. */}
        <div className="absolute top-0 left-0" ref={outerScaleRef}>
          <div
            className="absolute rounded-full border-white opacity-0 mix-blend-difference"
            ref={outerRingRef}
            style={{
              width: outerSize,
              height: outerSize,
              marginLeft: -outerSize / 2,
              marginTop: -outerSize / 2,
              borderWidth: strokeWidth,
            }}
          />
        </div>
        <span
          className="absolute left-0 font-mono text-sm leading-none whitespace-nowrap text-white opacity-0 mix-blend-difference select-none"
          ref={labelRef}
          style={{ top: outerSize / 2 + labelOffset }}
        />
      </div>
      <div className="absolute top-0 left-0 will-change-transform" ref={innerWrapRef}>
        <div
          className="absolute rounded-full border-white opacity-0 mix-blend-difference"
          ref={innerRingRef}
          style={{
            width: innerSize,
            height: innerSize,
            marginLeft: -innerSize / 2,
            marginTop: -innerSize / 2,
            borderWidth: strokeWidth,
          }}
        />
      </div>
    </div>
  )
}
