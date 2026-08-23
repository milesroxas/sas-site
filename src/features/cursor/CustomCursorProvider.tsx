'use client'

import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import type React from 'react'
import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'
import {
  CHAR_PRESETS,
  createScrambleTween,
  SCRAMBLE_TEXT_DEFAULTS,
  type ScrambleTweenOptions,
} from '@/shared/ui/scramble-text'
import {
  CURSOR_ACTIVE_ATTR,
  CURSOR_DEFAULTS,
  CURSOR_LABEL_ATTR,
  CURSOR_NATIVE_HIDDEN_ATTR,
  CURSOR_PROXIMITY_VAR,
  CURSOR_TARGET_SELECTOR,
  resolveCursorTargetVariant,
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

// Environments like Storybook docs mount one provider per story on a single
// page. Overlays must not stack: each tracks the same pointer, and layered
// mix-blend-difference rings visually cancel. The first enabled provider owns
// the single overlay; the rest render children only.
let overlayClaims = 0

function useOwnsOverlay(enabled: boolean): boolean {
  const [owns, setOwns] = useState(false)
  useEffect(() => {
    if (!enabled) return
    overlayClaims += 1
    setOwns(overlayClaims === 1)
    return () => {
      overlayClaims -= 1
      setOwns(false)
    }
  }, [enabled])
  return owns
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
  const ownsOverlay = useOwnsOverlay(finePointer && !prefersReducedMotion)

  return (
    <>
      {children}
      {ownsOverlay && <CursorOverlay />}
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
  labelTeaseOpacity,
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
      const fadeOuterRing = gsap.quickTo(outerRing, 'opacity', {
        duration: fadeIn,
        ease: 'power2.out',
      })
      const fadeInnerRing = gsap.quickTo(innerRing, 'opacity', {
        duration: fadeIn,
        ease: 'power2.out',
      })
      const fadeRings = (opacity: number, showInnerRing = true) => {
        fadeOuterRing(opacity)
        fadeInnerRing(showInnerRing ? opacity : 0)
      }
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
      let labelEl: HTMLElement | null = null
      let labelText = ''
      let labelSettled = false
      let presentationKey = ''

      const setPresentation = (
        variantName: string | undefined,
        variant: ReturnType<typeof resolveCursorVariant>,
      ) => {
        const key = `${variantName ?? ''}:${variant.outerSize}:${variant.labelPlacement}`
        if (key === presentationKey) return
        presentationKey = key
        const root = rootRef.current
        if (root) {
          if (variantName) root.setAttribute('data-cursor-variant', variantName)
          else root.removeAttribute('data-cursor-variant')
        }
        gsap.to(outerRing, {
          width: variant.outerSize,
          height: variant.outerSize,
          marginLeft: -variant.outerSize / 2,
          marginTop: -variant.outerSize / 2,
          duration: fadeIn,
          ease: 'power2.out',
          overwrite: 'auto',
        })
        gsap.to(label, {
          top: variant.labelPlacement === 'center' ? 0 : variant.outerSize / 2 + variant.labelOffset,
          yPercent: variant.labelPlacement === 'center' ? -50 : 0,
          duration: fadeIn,
          ease: 'power2.out',
          overwrite: 'auto',
        })
      }

      const setNativeCursorHidden = (hidden: boolean) => {
        document.documentElement.toggleAttribute(CURSOR_NATIVE_HIDDEN_ATTR, hidden)
      }

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

      // Label: proximity-activated targets churn glyphs at a reduced opacity
      // until true hover, then the shared scramble-text tween settles the copy.
      // Hover-activated labels scramble-in once at full opacity.
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

      const killScramble = () => {
        labelScramble?.kill()
        labelScramble = null
      }

      const popInLabel = () => {
        gsap.set(label, { scale: 0.92 })
        gsap.to(label, { scale: 1, duration: labelScrambleDuration, ease: 'power2.inOut' })
      }

      const fadeLabel = (opacity: number, duration: number) => {
        gsap.to(label, {
          opacity,
          y: opacity === 0 ? 6 : 0,
          duration,
          ease: 'power2.out',
          overwrite: 'auto',
        })
      }

      // Same refresh cadence as scramble-text (`75 / speed` ms); local because
      // only this overlay needs an unresolved churn that never settles.
      const startChurn = (length: number) => {
        killScramble()
        const pool = scrambleOptions.charPool
        const refresh = 75 / Math.max(labelScrambleSpeed, 0.05) / 1000
        const churn = () => {
          let out = ''
          for (let i = 0; i < length; i++) {
            out += pool.charAt(Math.floor(Math.random() * pool.length))
          }
          label.textContent = out
        }
        churn()
        labelScramble = gsap.to(
          {},
          { duration: refresh, repeat: -1, ease: 'none', onRepeat: churn },
        )
      }

      const hideLabel = () => {
        fadeLabel(0, fadeOut)
      }

      const setActive = (
        el: HTMLElement | null,
        netHoverScale: number = CURSOR_DEFAULTS.hoverOuterScale,
      ) => {
        if (el === activeEl) return
        activeEl = el
        popRing(el !== null, netHoverScale)
      }

      const setLabelTarget = (el: HTMLElement | null, text: string, settled: boolean) => {
        if (el === labelEl && text === labelText && settled === labelSettled) return
        const appearing = !labelEl || !labelText
        labelEl = el
        labelText = text
        labelSettled = settled
        if (!el || !text) {
          killScramble()
          hideLabel()
          return
        }
        if (settled) {
          const from = appearing ? '' : (label.textContent ?? '')
          killScramble()
          labelScramble = createScrambleTween(label, from, text, scrambleOptions)
          if (appearing) popInLabel()
          fadeLabel(1, appearing ? labelScrambleDuration * 0.6 : fadeIn)
          return
        }
        startChurn(text.length)
        if (appearing) popInLabel()
        fadeLabel(labelTeaseOpacity, fadeIn)
      }

      // Live query + rect reads per move, like the targets' own hover CSS
      // would cost: target counts stay small (a handful per page).
      const scanTargets = () => {
        let bestT = 0
        let bestEl: HTMLElement | null = null
        let bestVariantName: string | undefined
        let bestVariant = resolveCursorVariant(undefined)
        for (const el of document.querySelectorAll<HTMLElement>(CURSOR_TARGET_SELECTOR)) {
          // Targets inside an inert subtree can't be interacted with — e.g. the
          // page frame docked behind the open takeover menu. They must neither
          // pull the rings nor keep a stale proximity var.
          if (el.closest('[inert]')) {
            writeProximity(el, 0)
            continue
          }
          const variantName = resolveCursorTargetVariant(el)
          const variant = resolveCursorVariant(variantName)
          const rect = el.getBoundingClientRect()
          const dx = Math.max(rect.left - lastX, 0, lastX - rect.right)
          const dy = Math.max(rect.top - lastY, 0, lastY - rect.bottom)
          const t = Math.max(0, 1 - Math.hypot(dx, dy) / variant.proximityRadius)
          writeProximity(el, t)
          if (t > bestT) {
            bestT = t
            bestEl = el
            bestVariantName = variantName
            bestVariant = variant
          }
        }
        return { bestT, bestEl, bestVariantName, bestVariant }
      }

      const updateTease = (hovering: boolean, bestT: number) => {
        if (hovering || bestT > lastBestT + T_EPSILON) teaseSuppressed = false
        else if (bestT < lastBestT - T_EPSILON) teaseSuppressed = true
        lastBestT = bestT
      }

      const update = () => {
        if (!hasPosition) return
        const { bestT, bestEl, bestVariantName, bestVariant } = scanTargets()
        const hovering = bestT >= 1
        setPresentation(bestT > 0 ? bestVariantName : undefined, bestVariant)
        setActive(hovering ? bestEl : null, bestVariant.hoverOuterScale)
        setActiveTarget(hovering ? bestEl : null)
        updateTease(hovering, bestT)
        const showApproachLabel =
          bestEl && bestVariant.labelActivation === 'proximity' && !teaseSuppressed
        const nextLabelEl = hovering || showApproachLabel ? bestEl : null
        const nextLabel = nextLabelEl
          ? (nextLabelEl.getAttribute(CURSOR_LABEL_ATTR) ?? bestVariant.label ?? '')
          : ''
        setLabelTarget(nextLabelEl, nextLabel, hovering)
        setNativeCursorHidden(Boolean(nextLabelEl && bestVariant.hideNativeCursor))
        // Approach only teases the rings (0 → proximityMaxOpacity); the ease-out
        // jump to full opacity is reserved for actually being on the target.
        fadeRings(
          hovering ? 1 : teaseSuppressed ? 0 : bestT * bestVariant.proximityMaxOpacity,
          bestVariant.showInnerRing,
        )
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
            setLabelTarget(null, '', false)
            setNativeCursorHidden(false)
          }
        }, idleDelay * 1000)
        update()
      }

      const onScroll = () => update()

      const hide = () => {
        fadeRings(0)
        setActive(null)
        setLabelTarget(null, '', false)
        setNativeCursorHidden(false)
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
        setNativeCursorHidden(false)
        setActiveTarget(null)
        clearProximity()
        killScramble()
      }
    },
    { scope: rootRef },
  )

  // Portal to <body>: `position: fixed` resolves against the nearest
  // transformed ancestor, so rendering inline inside a transformed container
  // (Storybook docs zoom wrapper, any future transformed layout) would pin the
  // rings to that box instead of the viewport the pointer coords live in.
  return createPortal(
    <div aria-hidden className="pointer-events-none" ref={rootRef}>
      <style>{`
        html[${CURSOR_NATIVE_HIDDEN_ATTR}], html[${CURSOR_NATIVE_HIDDEN_ATTR}] * { cursor: none !important; }
        /* Drag is a viewfinder: one white hairline + tracked mono, inverted
           through mix-blend-difference. No knockout — a black stroke is what
           made the caption vanish on dark surfaces. */
        [data-cursor-variant="drag"] [data-cursor-part="label"] {
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.22em;
          padding-left: 0.22em;
        }
      `}</style>
      {/* mix-blend lives on these wraps — not a full-viewport overlay — so
          difference composites against the page rather than an isolated layer.
          Opacity stays on the ring/label leaves so it cannot isolate blending. */}
      <div
        className="fixed top-0 left-0 mix-blend-difference will-change-transform"
        ref={outerWrapRef}
        style={{ zIndex: CURSOR_DEFAULTS.zIndex }}
      >
        {/* Zero-size wrapper: its transform-origin is the pointer point, so
            proximity scaling grows the ring around the cursor. */}
        <div className="absolute top-0 left-0" ref={outerScaleRef}>
          <div
            className="absolute rounded-full border-white opacity-0"
            data-cursor-part="outer"
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
          className="absolute left-0 font-mono text-sm leading-none font-normal whitespace-nowrap text-white uppercase opacity-0 select-none"
          data-cursor-part="label"
          ref={labelRef}
          style={{ top: outerSize / 2 + labelOffset }}
        />
      </div>
      <div
        className="fixed top-0 left-0 mix-blend-difference will-change-transform"
        ref={innerWrapRef}
        style={{ zIndex: CURSOR_DEFAULTS.zIndex }}
      >
        <div
          className="absolute rounded-full border-white opacity-0"
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
    </div>,
    document.body,
  )
}
