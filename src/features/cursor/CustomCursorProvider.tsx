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
import { publishCursorProximity } from './proximity'
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
  outerOpacity,
  outerScaleMax,
  outerScaleMin,
  outerSize,
  pressDuration,
  pressReleaseDuration,
  strokeWidth,
} = CURSOR_DEFAULTS

/** Minimum best-proximity change that counts as approaching/receding. */
const T_EPSILON = 0.001

/** Re-scan cadence while any target is engaged: the DOM can change under a
 *  stationary pointer (a menu or dialog opens/closes) with no pointer event
 *  to notice it, and stale rings must release. */
const REVALIDATE_MS = 250

const CursorOverlay: React.FC = () => {
  const rootRef = useRef<HTMLDivElement>(null)
  const outerWrapRef = useRef<HTMLDivElement>(null)
  const outerScaleRef = useRef<HTMLDivElement>(null)
  const innerWrapRef = useRef<HTMLDivElement>(null)
  const outerRingRef = useRef<HTMLDivElement>(null)
  const innerRingRef = useRef<HTMLDivElement>(null)
  const labelWrapRef = useRef<HTMLDivElement>(null)
  const labelRef = useRef<HTMLSpanElement>(null)

  const getEls = () => {
    const outerWrap = outerWrapRef.current
    const outerScale = outerScaleRef.current
    const innerWrap = innerWrapRef.current
    const outerRing = outerRingRef.current
    const innerRing = innerRingRef.current
    const labelWrap = labelWrapRef.current
    const label = labelRef.current
    if (!outerWrap || !outerScale || !innerWrap || !outerRing || !innerRing || !labelWrap || !label)
      return null
    return { outerWrap, outerScale, innerWrap, outerRing, innerRing, labelWrap, label }
  }

  useGSAP(
    () => {
      const els = getEls()
      if (!els) return
      const { outerWrap, outerScale, innerWrap, outerRing, innerRing, labelWrap, label } = els

      gsap.set(label, { xPercent: -50, y: 6, opacity: 0, scale: 0.92 })
      gsap.set(outerScale, { scale: outerScaleMin })

      const xOuter = gsap.quickTo(outerWrap, 'x', { duration: outerLag, ease: 'power3.out' })
      const yOuter = gsap.quickTo(outerWrap, 'y', { duration: outerLag, ease: 'power3.out' })
      // Label lag matches the outer ring's so the chip stays glued to it.
      const xLabel = gsap.quickTo(labelWrap, 'x', { duration: outerLag, ease: 'power3.out' })
      const yLabel = gsap.quickTo(labelWrap, 'y', { duration: outerLag, ease: 'power3.out' })
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
        fadeOuterRing(opacity * outerOpacity)
        fadeInnerRing(showInnerRing ? opacity : 0)
      }
      // Two scale layers so continuous growth and the discrete hover pop never
      // fight over one property: the wrapper tracks proximity (quickTo), the
      // ring itself carries the eased lock-on pop (tween).
      // quickTo drives values through `tween.resetTo()`, which can't handle
      // the compound `scale` alias — split into scaleX/scaleY.
      const scaleOuterX = gsap.quickTo(outerScale, 'scaleX', {
        duration: outerGrowLag,
        ease: 'power3.out',
      })
      const scaleOuterY = gsap.quickTo(outerScale, 'scaleY', {
        duration: outerGrowLag,
        ease: 'power3.out',
      })
      const scaleOuter = (value: number) => {
        scaleOuterX(value)
        scaleOuterY(value)
      }

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
          // Placement is what the label's presentation keys off (see the plate
          // rules below), so it publishes even for the unnamed default variant.
          root.setAttribute('data-cursor-label-placement', variant.labelPlacement)
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
          top:
            variant.labelPlacement === 'center' ? 0 : variant.outerSize / 2 + variant.labelOffset,
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
        // Same signal for imperative consumers (WebGL scenes) that can't
        // watch the CSS var — behind the dedupe, so subscribers only hear
        // actual changes.
        publishCursorProximity(el, q)
      }

      const clearProximity = () => {
        for (const el of hot) {
          prevT.set(el, 0)
          el.style.removeProperty(CURSOR_PROXIMITY_VAR)
          publishCursorProximity(el, 0)
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

      // Lock-on + press: the wrapper sits at outerScaleMax while hovering, so
      // the ring's own scale makes up the difference to the variant's net
      // target. Hover pop and press share this one tween on `outerRing.scale`
      // — two tweens on the same property would overwrite each other, and a
      // third scale layer would just move the fight up a level.
      let hoverScale: number = CURSOR_DEFAULTS.hoverOuterScale
      let pressScale: number = CURSOR_DEFAULTS.pressScale
      let pressed = false

      const writeRingScale = (duration: number) => {
        gsap.to(outerRing, {
          scale: activeEl ? (hoverScale * (pressed ? pressScale : 1)) / outerScaleMax : 1,
          duration,
          ease: 'power3.out',
          overwrite: 'auto',
        })
      }

      // Press reads as grabbing the target, so it only bites while locked on.
      // The flag is tracked even off-target: pressing on empty page and then
      // dragging onto a carousel arrives already grabbed.
      const setPressed = (next: boolean) => {
        if (next === pressed) return
        pressed = next
        if (activeEl) writeRingScale(next ? pressDuration : pressReleaseDuration)
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
        netPressScale: number = CURSOR_DEFAULTS.pressScale,
      ) => {
        // Off-target the variant scales are meaningless; normalize so a
        // variant swap under a resting ring can't retrigger the tween.
        const nextHover = el ? netHoverScale : CURSOR_DEFAULTS.hoverOuterScale
        const nextPress = el ? netPressScale : CURSOR_DEFAULTS.pressScale
        if (el === activeEl && nextHover === hoverScale && nextPress === pressScale) return
        activeEl = el
        hoverScale = nextHover
        pressScale = nextPress
        writeRingScale(el ? hoverPopDuration : 0.3)
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

      // Hidden targets keep their layout geometry: the closed takeover menu is
      // visibility:hidden yet laid out at its open-state positions, so rect
      // math alone would ring its items from a blank page. checkVisibility
      // ignores the visibility property unless asked; absent the API (older
      // engines, jsdom) → computed style.
      const isVisible = (el: HTMLElement) =>
        el.checkVisibility
          ? el.checkVisibility({ visibilityProperty: true })
          : getComputedStyle(el).visibility === 'visible'

      // A target only counts when the pointer would actually reach it: hit-test
      // the point of the target nearest the pointer. Under a dialog, scrim, or
      // any overlay — or scrolled off-screen — something else wins the hit test
      // and the target must not pull the cursor.
      const isHittable = (el: HTMLElement, rect: DOMRect, onTarget: boolean) => {
        if (typeof document.elementFromPoint !== 'function') return true
        const hit = document.elementFromPoint(
          Math.min(Math.max(lastX, rect.left), rect.right),
          Math.min(Math.max(lastY, rect.top), rect.bottom),
        )
        if (hit && (hit === el || el.contains(hit))) return true
        // Pointer on the target and something else won: it is covered.
        if (onTarget) return false
        // Approaching: the nearest edge point can land on a rounded corner or
        // an overlapping neighbor — let the target's center decide.
        const center = document.elementFromPoint(
          rect.left + rect.width / 2,
          rect.top + rect.height / 2,
        )
        return center !== null && (center === el || el.contains(center))
      }

      // Live query + rect reads per move, like the targets' own hover CSS
      // would cost: target counts stay small (a handful per page).
      const scanTargets = () => {
        const targets = document.querySelectorAll<HTMLElement>(CURSOR_TARGET_SELECTOR)
        // A removed target is never revisited by the loop below; a stale hot
        // entry would pin the revalidation interval and retain the detached
        // element until blur or unmount.
        if (hot.size) {
          const live = new Set<HTMLElement>(targets)
          for (const el of [...hot]) {
            if (!live.has(el)) writeProximity(el, 0)
          }
        }
        // Hit-test the pointer itself (not the target's nearest edge): a
        // nearby media panel's 180px view radius must not steal the cursor
        // or pre-activate its shader while the pointer is on a dropdown.
        const pointerHit =
          typeof document.elementFromPoint === 'function'
            ? document.elementFromPoint(lastX, lastY)
            : null
        const pointerOnDropdown = pointerHit?.closest('[data-slot^="dropdown-menu"]')
        let bestT = 0
        let bestEl: HTMLElement | null = null
        let bestVariantName: string | undefined
        let bestVariant = resolveCursorVariant(undefined)
        for (const el of targets) {
          // Targets inside an inert subtree (the page frame docked behind the
          // open takeover menu) or hidden ones can't be interacted with. They
          // must neither pull the rings nor keep a stale proximity var.
          if (el.closest('[inert]') || !isVisible(el)) {
            writeProximity(el, 0)
            continue
          }
          if (
            pointerOnDropdown &&
            !el.contains(pointerOnDropdown) &&
            !pointerOnDropdown.contains(el)
          ) {
            writeProximity(el, 0)
            continue
          }
          const variantName = resolveCursorTargetVariant(el)
          const variant = resolveCursorVariant(variantName)
          const rect = el.getBoundingClientRect()
          const dx = Math.max(rect.left - lastX, 0, lastX - rect.right)
          const dy = Math.max(rect.top - lastY, 0, lastY - rect.bottom)
          const distance = Math.hypot(dx, dy)
          const raw = Math.max(0, 1 - distance / variant.proximityRadius)
          const t = raw > 0 && isHittable(el, rect, distance === 0) ? raw : 0
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

      // Pointer events only fire on movement, so an engaged target that the
      // DOM hides, covers, or removes under a still pointer would strand the
      // rings. While engaged, a low-frequency re-scan releases them.
      let revalidateTimer = 0
      const syncRevalidation = () => {
        const engaged = hot.size > 0 || activeEl !== null
        if (engaged && !revalidateTimer) {
          revalidateTimer = window.setInterval(() => update(), REVALIDATE_MS)
        } else if (!engaged && revalidateTimer) {
          window.clearInterval(revalidateTimer)
          revalidateTimer = 0
        }
      }

      const update = () => {
        if (!hasPosition) return
        const { bestT, bestEl, bestVariantName, bestVariant } = scanTargets()
        const hovering = bestT >= 1
        setPresentation(bestT > 0 ? bestVariantName : undefined, bestVariant)
        setActive(hovering ? bestEl : null, bestVariant.hoverOuterScale, bestVariant.pressScale)
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
        syncRevalidation()
      }

      const onMove = (event: PointerEvent) => {
        lastX = event.clientX
        lastY = event.clientY
        if (!hasPosition) {
          hasPosition = true
          gsap.set([outerWrap, innerWrap, labelWrap], { x: lastX, y: lastY })
        }
        xOuter(lastX)
        yOuter(lastY)
        xLabel(lastX)
        yLabel(lastY)
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

      // Primary button only: a right-click opens a context menu rather than
      // dragging, so the ring must not read as grabbed.
      const onPointerDown = (event: PointerEvent) => {
        if (event.button === 0) setPressed(true)
      }
      const onPointerRelease = () => setPressed(false)

      const hide = () => {
        fadeRings(0)
        setPressed(false)
        setActive(null)
        setLabelTarget(null, '', false)
        setNativeCursorHidden(false)
        setActiveTarget(null)
        clearProximity()
        lastBestT = 0
        syncRevalidation()
      }

      const onPointerOut = (event: PointerEvent) => {
        if (!event.relatedTarget) hide()
      }

      window.addEventListener('pointermove', onMove, { passive: true })
      window.addEventListener('pointerdown', onPointerDown, { passive: true })
      // `pointerup` misses a release outside the window and a drag the browser
      // takes over (scroll chaining, back-swipe); cancel and blur close both.
      window.addEventListener('pointerup', onPointerRelease, { passive: true })
      window.addEventListener('pointercancel', onPointerRelease, { passive: true })
      window.addEventListener('scroll', onScroll, { passive: true, capture: true })
      window.addEventListener('pointerout', onPointerOut)
      window.addEventListener('blur', hide)
      return () => {
        window.removeEventListener('pointermove', onMove)
        window.removeEventListener('pointerdown', onPointerDown)
        window.removeEventListener('pointerup', onPointerRelease)
        window.removeEventListener('pointercancel', onPointerRelease)
        window.removeEventListener('scroll', onScroll, { capture: true })
        window.removeEventListener('pointerout', onPointerOut)
        window.removeEventListener('blur', hide)
        window.clearTimeout(idleTimer)
        window.clearInterval(revalidateTimer)
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
        /* ── Cursor overlay: color + size map ─────────────────────────────
           Rings (every variant)
             color → ring divs below: className border-white
                     (wraps use mix-blend-difference; stroke inverts vs the page)
             size  → CURSOR_DEFAULTS.outerSize / innerSize / strokeWidth
                     per-variant outerSize in CURSOR_VARIANTS:
                       default + view = 64 · emphasize = 40 · drag = 50
             press → CURSOR_DEFAULTS.pressScale, per-variant in CURSOR_VARIANTS
                     (drag only); a transform, nothing to style here

           Label — default + emphasize  (data-cursor-label-placement="below")
             color → this block, "below": type --background, plate --foreground
             size  → span className text-xs; padding in the "below" rule

           Label — drag + view  (data-cursor-label-placement="center")
             color → span className text-white; halo in the "center" rule
             size  → this block, "drag + view": font-size / tracking
           ──────────────────────────────────────────────────────────────── */

        html[${CURSOR_NATIVE_HIDDEN_ATTR}], html[${CURSOR_NATIVE_HIDDEN_ATTR}] * { cursor: none !important; }

        /* SIZE — drag + view label. Default/emphasize keep text-xs. */
        [data-cursor-variant="drag"] [data-cursor-part="label"],
        [data-cursor-variant="view"] [data-cursor-part="label"] {
          font-size: 10px;
          font-weight: 400;
          letter-spacing: 0.22em;
          padding-left: 0.22em;
        }

        /* COLOR — center label (drag, view). Type is text-white on the span.
           Halo is occlusion (keep dark in both themes), not a fill — a plate
           here would bisect the ring. */
        [data-cursor-label-placement="center"] [data-cursor-part="label"] {
          filter: drop-shadow(0 1px 1px rgb(0 0 0 / 0.2)) drop-shadow(0 0 3px rgb(0 0 0 / 0.3));
        }

        /* COLOR + SIZE — below label (default, emphasize). Inverse of the
           site theme: plate --foreground, type --background. */
        [data-cursor-label-placement="below"] [data-cursor-part="label"] {
          padding: 0.25rem 0.5rem;
          color: var(--background);
          background-color: color-mix(in oklab, var(--foreground) 20%, transparent);
          box-shadow: 0 1px 3px color-mix(in oklab, var(--background) 5%, transparent);
        }
        /* Stronger glass plate when backdrop-filter is available. */
        @supports ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
          [data-cursor-label-placement="below"] [data-cursor-part="label"] {
            background-color: color-mix(in oklab, var(--foreground) 40%, transparent);
            -webkit-backdrop-filter: blur(10px) saturate(1.5);
            backdrop-filter: blur(10px) saturate(1.5);
          }
        }
      `}</style>
      {/* RING COLOR: mix-blend-difference on the wrap + border-white on the leaf.
          RING SIZE: inline width/height from CURSOR_DEFAULTS; variants tween outerSize.
          Blend stays on the wrap (not a full-viewport overlay) so difference
          composites against the page. Opacity stays on the leaf so it cannot
          isolate blending. */}
      <div
        className="fixed top-0 left-0 mix-blend-difference will-change-transform"
        ref={outerWrapRef}
        style={{ zIndex: CURSOR_DEFAULTS.zIndex }}
      >
        {/* Zero-size wrapper: transform-origin is the pointer, so proximity
            scaling grows the ring around the cursor. */}
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
      </div>
      {/* LABEL sits outside the blend group so the color knobs in <style> stay
          literal (a glass plate and a dark halo would both invert under
          difference). Default: text-white + text-xs; placement rules override. */}
      <div
        className="fixed top-0 left-0 will-change-transform"
        ref={labelWrapRef}
        style={{ zIndex: CURSOR_DEFAULTS.zIndex }}
      >
        <span
          className="absolute left-0 rounded-full font-mono text-xs leading-none font-normal whitespace-nowrap text-white uppercase opacity-0 select-none"
          data-cursor-part="label"
          ref={labelRef}
          style={{ top: outerSize / 2 + labelOffset }}
        />
      </div>
      {/* Inner ring: same color as outer (border-white). Size: CURSOR_DEFAULTS.innerSize. */}
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
