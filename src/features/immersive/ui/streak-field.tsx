'use client'

import { Canvas } from '@react-three/fiber'
import cn from 'clsx'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useDeviceDetection } from '@/hooks/use-device-detection'
import {
  bindPointerInput,
  createPointerInput,
  FieldScene,
  isAnimated,
  isInteractive,
  type PointerInput,
  STREAK_CANVAS_STYLE,
  STREAK_RESIZE_OPTIONS,
} from './streak-field-scene'
import { resolveStreakTuning, type StreakFieldProps } from './streak-field-tuning'

/**
 * Renders in its own small WebGL canvas (classic renderer) rather than the
 * global one: GlobalCanvas prefers WebGPU, where raw GLSL ShaderMaterial is
 * unsupported (WebGPURenderer only accepts TSL node materials).
 *
 * Props, defaults and the tuning type live in `./streak-field-tuning.ts`
 * (Three-free, so the visual contract can read them) and are re-exported
 * here so the barrel's surface is unchanged.
 */
export {
  STREAK_FIELD_DEFAULTS,
  STREAK_FIELD_NOISES,
  type StreakFieldInk,
  type StreakFieldLayout,
  type StreakFieldMotion,
  type StreakFieldNoise,
  type StreakFieldProps,
  type StreakFieldShape,
  type StreakFieldSurface,
  type StreakFieldTuning,
} from './streak-field-tuning'

// Hoisted so JSX never allocates fresh objects per render (perf-avoid-inline-objects).
const GL_CONFIG = { antialias: false, powerPreference: 'high-performance' } as const

/**
 * A field of horizontal light streaks: thousands of GPU particles laid on a
 * fine row grid, each drifting along its row at its own pace, breathing in
 * and out over its own lifetime, and shimmering on its own phase. Reads as a
 * data stream, rain seen side-on, or a tape of signal, depending on how it
 * is tuned.
 *
 * A noise field (`noise`) bends the rows into flows, turns each dash to its
 * direction (`orient`) and shades the field as a height map (`relief`); on
 * the `grid` layout that reads as a tick plot or a topography. The pointer
 * pushes, swirls, drags and lifts that field wherever it goes. The whole
 * simulation is a single instanced draw whose vertex shader derives every
 * particle's state from baked hashes, one time uniform and the eased pointer.
 * Nothing is stepped on the CPU, so the cost is fill rate alone and the field
 * is deterministic for a given `seed`.
 *
 * The ground is the caller's: it fills the nearest positioned ancestor by
 * default, and `surface` says whether that ancestor is dark (the streaks are
 * light) or light (the streaks are ink). Toggling it crossfades rather than
 * pops, so `<StreakField surface={useSiteTheme()} />` rides the theme switch.
 *
 * This is the demo, story and playground owner: it renders nothing without a
 * GPU, on low-power devices, or under `prefers-reduced-motion` (see `force`).
 * Shipped pages go through the `Visual` adapter and `StreakVisual`, which
 * paint a poster first and load the runtime only once admitted.
 */
export function StreakField({ className, force = false, ...deltas }: StreakFieldProps) {
  const tuning = resolveStreakTuning(deltas)
  const { dpr } = tuning
  const interactive = isInteractive(tuning)
  const animated = isAnimated(tuning)
  const rootRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<PointerInput>(createPointerInput())
  const { hasGPU } = useDeviceDetection()
  // Off-screen fields keep their context but stop rendering, so one on a
  // section costs nothing while that section is scrolled away.
  const [inView, setInView] = useState(true)

  const dprRange = useMemo<[number, number]>(() => [1, dpr], [dpr])

  const enabled = hasGPU || force

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

  useEffect(() => {
    if (!enabled || !interactive) return
    return bindPointerInput(inputRef.current)
  }, [enabled, interactive])

  if (!enabled) return null

  return (
    <div
      ref={rootRef}
      aria-hidden
      className={cn('pointer-events-none absolute inset-0', className)}
    >
      <Canvas
        dpr={dprRange}
        gl={GL_CONFIG}
        frameloop={!inView ? 'never' : animated ? 'always' : 'demand'}
        flat
        linear
        resize={STREAK_RESIZE_OPTIONS}
        style={STREAK_CANVAS_STYLE}
      >
        <FieldScene rootRef={rootRef} inputRef={inputRef} tuning={tuning} />
      </Canvas>
    </div>
  )
}
