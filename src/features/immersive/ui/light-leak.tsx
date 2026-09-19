'use client'

import cn from 'clsx'
import type { CSSProperties } from 'react'
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import { useDeviceDetection } from '@/hooks/use-device-detection'
import { GPU_PRIORITY } from '@/lib/webgl/gpu-budget'
import { useGpuLease } from '@/lib/webgl/use-gpu-lease'
import { LightLeakRuntime } from './light-leak-runtime'
import { type LightLeakProps, resolveLeakTuning } from './light-leak-tuning'

export {
  LEAK_EXCITE_TARGETS,
  type LeakExciteTargets,
  LIGHT_LEAK_DEFAULTS,
  type LightLeakBlendMode,
  type LightLeakProps,
  type LightLeakTint,
} from './light-leak-tuning'

/**
 * A film light-leak overlay: a single GLSL pass of spectral dispersion sampled
 * in six wavelengths, warped by fbm noise and composited over whatever sits
 * beneath it with a screen-like blend.
 *
 * Scrolling agitates it: velocity drives brightness, spectral split and a
 * domain-warp morph, and slides the field along.
 *
 * Hovering gathers light under the pointer, inside the leak's own band and
 * nowhere else: the nearest `leakScope()` (every `Section` and `HeroBand`
 * carries one), else the positioned ancestor the overlay fills. Elements
 * marked `leakExcite()` flare it, every link and button in the band does too
 * while `exciteTargets` is `interactive`, and `sectionExcite` is how far the
 * pointer merely crossing the band carries. `excite: false` binds no listeners
 * at all.
 *
 * The ground decides the polarity. Over a dark surface the default screen-like
 * blend reads as light striking the film; over a pale one that same frame is
 * invisible, so an absorptive blend (`multiply` / `darken`) prints the leak as
 * dye on paper instead: see `LIGHT_LEAK_PAPER` in `../presets.ts` for the
 * shipped light-theme look, and `blendMode` for how the two stay in step.
 *
 * Placement is the caller's: it fills the nearest positioned ancestor by
 * default, so a section overlay is `<section className="relative isolate">`
 * with the leak inside, and a page overlay is `className="fixed inset-0 z-10"`.
 * `isolate` matters: without it the blend reaches past the intended backdrop.
 *
 * Renders nothing without a GPU, on low-power devices, or under
 * `prefers-reduced-motion` (see `force`). It is decoration, so it holds the
 * lowest rank on the document GPU budget: when the page's own media fills
 * the ceiling the leak yields its canvas and returns once a slot frees. A
 * lost context (a real GPU reset, never R3F's teardown) drops the canvas
 * for good; the ground beneath is the fallback.
 */
export function LightLeak({ className, force = false, scrollSource, ...deltas }: LightLeakProps) {
  const tuning = resolveLeakTuning(deltas)
  const { blendMode } = tuning
  const rootRef = useRef<HTMLDivElement>(null)
  const { hasGPU } = useDeviceDetection()
  // Off-screen overlays keep their context but stop rendering, so a leak on a
  // section costs nothing while that section is scrolled away.
  const [inView, setInView] = useState(true)
  const [lost, setLost] = useState(false)
  const handleFailure = useCallback(() => setLost(true), [])

  const blendStyle = useMemo<CSSProperties>(() => ({ mixBlendMode: blendMode }), [blendMode])

  const wanted = (hasGPU || force) && !lost
  // The lease is held while mounted, in view or not: a parked context is
  // cheap, and the leak must not pop in on every scroll past its section.
  const id = useId()
  const enabled = useGpuLease(id, wanted, 'leak', GPU_PRIORITY.overlay)

  useEffect(() => {
    const root = rootRef.current
    if (!enabled || !root) return
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry?.isIntersecting ?? true),
      // Start rendering just before it scrolls in, so it is never caught mid-fade.
      { rootMargin: '10%' },
    )
    observer.observe(root)
    return () => observer.disconnect()
  }, [enabled])

  if (!enabled) return null

  return (
    <div
      ref={rootRef}
      aria-hidden
      className={cn('pointer-events-none absolute inset-0', className)}
      style={blendStyle}
    >
      <LightLeakRuntime
        active={inView}
        onFailure={handleFailure}
        rootRef={rootRef}
        scrollSource={scrollSource}
        tuning={tuning}
      />
    </div>
  )
}
