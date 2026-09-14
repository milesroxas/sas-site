'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import {
  Component,
  type ReactNode,
  type RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react'
import type { WebGLRenderer } from 'three'
import { ContextGuard } from '@/lib/webgl/components/context-guard'
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
import type { StreakFieldTuning } from './streak-field-tuning'

/**
 * The production owner of a live Streak Field: one classic WebGL2 canvas
 * for one admitted slot, loaded on demand by `StreakVisual` after the poster
 * has painted and the slot is eligible. It reports readiness per generation
 * and every failure it can observe, and never retries on its own.
 *
 * Failure signals, all routed to `onFailure`:
 * - context creation refused (`failIfMajorPerformanceCaveat` rejects known
 *   software paths; the renderer constructor throws into the boundary),
 * - a shader that fails to compile or link (`gl.debug.onShaderError`),
 * - `webglcontextlost`,
 * - a `flow` look on a context with no renderable float target,
 * - sustained long frames after one quality step down.
 */

export type StreakFailureReason =
  | 'context'
  | 'shader'
  | 'context-lost'
  | 'flow-unsupported'
  | 'performance'

export type StreakFieldRuntimeProps = {
  tuning: StreakFieldTuning
  /** Device-pixel-ratio cap from the placement policy. */
  dpr: number
  /** Whether frames may run. Off: zero simulation steps and zero draws. */
  active: boolean
  /**
   * Identity of the descriptor, slot and tier this canvas is drawing. A
   * readiness callback carries it, so a late frame from a previous identity
   * cannot reveal the wrong buffer.
   */
  generation: number
  onReady: (generation: number) => void
  onFailure: (reason: StreakFailureReason) => void
  /** Sustained long frames: the owner steps quality down, then gives up. */
  onSlow?: () => void
  rootRef: RefObject<HTMLElement | null>
}

// Hoisted so JSX never allocates a fresh object per render (perf-avoid-inline-objects).
const GL_CONFIG = {
  antialias: false,
  powerPreference: 'high-performance',
  failIfMajorPerformanceCaveat: true,
  alpha: true,
  premultipliedAlpha: true,
  preserveDrawingBuffer: false,
} as const

/** Frames averaged for the performance watchdog, and the interval that trips it. */
const WATCH_WINDOW = 90
const SLOW_FRAME_SECONDS = 1 / 40
/** How many consecutive slow windows before the owner is told. */
const SLOW_WINDOWS = 2

/**
 * Frame watchdog: averages intervals over a window and reports when two
 * windows in a row run slow. Reads `delta` only, no GPU readback, and lives
 * in its own subscriber so the scene stays a pure draw.
 */
function FrameWatch({ onSlow }: { onSlow: () => void }) {
  const sum = useRef(0)
  const frames = useRef(0)
  const slowWindows = useRef(0)
  useFrame((_, delta) => {
    // Tab switches and resumes deliver one huge delta; not a frame-rate signal.
    if (delta > 0.25) return
    sum.current += delta
    frames.current += 1
    if (frames.current < WATCH_WINDOW) return
    const mean = sum.current / frames.current
    sum.current = 0
    frames.current = 0
    slowWindows.current = mean > SLOW_FRAME_SECONDS ? slowWindows.current + 1 : 0
    if (slowWindows.current >= SLOW_WINDOWS) {
      slowWindows.current = 0
      onSlow()
    }
  })
  return null
}

type BoundaryProps = { onError: () => void; children: ReactNode }

/** Catches the renderer constructor and any render-time throw into `onFailure`. */
class RuntimeBoundary extends Component<BoundaryProps, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch() {
    this.props.onError()
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}

export function StreakFieldRuntime({
  tuning,
  dpr,
  active,
  generation,
  onReady,
  onFailure,
  onSlow,
  rootRef,
}: StreakFieldRuntimeProps) {
  const inputRef = useRef<PointerInput>(createPointerInput())
  const failed = useRef(false)
  const interactive = isInteractive(tuning)
  const animated = isAnimated(tuning)
  const dprRange = useMemo<[number, number]>(() => [1, dpr], [dpr])

  const fail = useCallback(
    (reason: StreakFailureReason) => {
      if (failed.current) return
      failed.current = true
      onFailure(reason)
    },
    [onFailure],
  )

  useEffect(() => {
    if (!active || !interactive) return
    return bindPointerInput(inputRef.current)
  }, [active, interactive])

  const handleCreated = useCallback(
    ({ gl }: { gl: WebGLRenderer }) => {
      // Three reports compile and link failures here instead of throwing;
      // without this hook a broken program draws nothing and looks "ready".
      gl.debug.onShaderError = () => fail('shader')
    },
    [fail],
  )

  const handleContextLost = useCallback(() => fail('context-lost'), [fail])

  const handleFirstFrame = useCallback(() => {
    if (!failed.current) onReady(generation)
  }, [generation, onReady])

  const handleFlowUnsupported = useCallback(() => fail('flow-unsupported'), [fail])
  const handleError = useCallback(() => fail('context'), [fail])

  return (
    <RuntimeBoundary onError={handleError}>
      <Canvas
        dpr={dprRange}
        gl={GL_CONFIG}
        frameloop={!active ? 'never' : animated ? 'always' : 'demand'}
        flat
        linear
        onCreated={handleCreated}
        resize={STREAK_RESIZE_OPTIONS}
        style={STREAK_CANVAS_STYLE}
      >
        <FieldScene
          key={generation}
          inputRef={inputRef}
          onFirstFrame={handleFirstFrame}
          onFlowUnsupported={handleFlowUnsupported}
          rootRef={rootRef}
          tuning={tuning}
        />
        {/* Census entry plus real loss; R3F's teardown loss never reaches it. */}
        <ContextGuard kind="streak" onLost={handleContextLost} />
        {onSlow && active && animated && <FrameWatch onSlow={onSlow} />}
      </Canvas>
    </RuntimeBoundary>
  )
}

export default StreakFieldRuntime
