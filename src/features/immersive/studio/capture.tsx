'use client'

import { Canvas, useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import { createRoot } from 'react-dom/client'
import { createPointerInput, FieldScene } from '../ui/streak-field-scene'
import { type CaptureOptions, limitStudioTuning, type StreakSnapshot } from './recipe'

export type CaptureInput = { snapshot: StreakSnapshot; capture: CaptureOptions }

/**
 * One exact still, rendered in this browser: the shared `FieldScene` stepped
 * a fixed number of 1/60 s frames with a neutral pointer, then read back as
 * base64 PNG. It mounts its own offscreen canvas and takes it down again, so
 * the caller needs no element and the website has no readback path. Studio
 * calls it on Publish (the two posters) and on Export.
 */
export function captureStill(input: CaptureInput): Promise<string> {
  return new Promise((resolve, reject) => {
    const host = document.createElement('div')
    // Offscreen, not `display: none`: the canvas sizes itself from layout.
    host.style.cssText =
      'position:fixed;left:-100000px;top:0;pointer-events:none;contain:strict;' +
      `width:${input.capture.width}px;height:${input.capture.height}px`
    document.body.append(host)
    const root = createRoot(host)
    let settled = false
    const settle =
      <T,>(finish: (value: T) => void) =>
      (value: T) => {
        if (settled) return
        settled = true
        // An error can arrive from inside a React effect, where a root cannot
        // be unmounted synchronously.
        setTimeout(() => {
          root.unmount()
          host.remove()
        })
        finish(value)
      }
    root.render(
      <CaptureScene
        input={input}
        onResult={settle(resolve)}
        onError={settle((message: string) => reject(new Error(message)))}
      />,
    )
  })
}

function CaptureScene({
  input: { capture, snapshot },
  onResult,
  onError,
}: {
  input: CaptureInput
  onResult: (image: string) => void
  onError: (message: string) => void
}) {
  const rootRef = useRef<HTMLDivElement>(null)
  const pointer = useRef(createPointerInput())
  const tuning = limitStudioTuning(snapshot[capture.surface], 'hero')
  return (
    <div ref={rootRef} style={{ width: capture.width, height: capture.height }}>
      <Canvas
        flat
        linear
        dpr={capture.scale}
        frameloop="never"
        gl={{
          alpha: true,
          antialias: false,
          preserveDrawingBuffer: true,
          powerPreference: 'high-performance',
        }}
        onCreated={({ gl }) => {
          gl.debug.onShaderError = () => onError('Shader compilation failed.')
        }}
      >
        <FieldScene
          rootRef={rootRef}
          inputRef={pointer}
          tuning={{ ...tuning, pointerRadius: 0 }}
          fixedDelta={1 / 60}
          onFlowUnsupported={() => onError('This browser has no float render targets.')}
        />
        <CaptureFrames frames={snapshot.frame} onResult={onResult} onError={onError} />
      </Canvas>
    </div>
  )
}

function CaptureFrames({
  frames,
  onResult,
  onError,
}: {
  frames: number
  onResult: (image: string) => void
  onError: (message: string) => void
}) {
  const advance = useThree((state) => state.advance)
  const gl = useThree((state) => state.gl)
  const scene = useThree((state) => state.scene)
  const callbacks = useRef({ onResult, onError })
  callbacks.current = { onResult, onError }
  useEffect(() => {
    let cancelled = false
    // Effects, material attachment and canvas size settle before the first fixed step.
    const raf = requestAnimationFrame(async () => {
      const render = gl.render.bind(gl)
      let finalFrame = false
      gl.render = (target, camera) => {
        if (target !== scene || finalFrame) render(target, camera)
      }
      try {
        for (let frame = 0; frame < frames; frame++) {
          if (cancelled) return
          finalFrame = frame === frames - 1
          advance(frame / 60)
          // Hand the thread back now and then. A timer, not a frame callback:
          // frame callbacks stop in a tab that loses the screen mid-capture.
          if (frame % 20 === 19) await new Promise<void>((resolve) => setTimeout(resolve))
        }
        gl.getContext().finish()
        if (!cancelled)
          callbacks.current.onResult(gl.domElement.toDataURL('image/png').split(',')[1])
      } catch (error) {
        if (!cancelled) callbacks.current.onError(String(error))
      } finally {
        gl.render = render
      }
    })
    return () => {
      cancelled = true
      cancelAnimationFrame(raf)
    }
  }, [advance, frames, gl, scene])
  return null
}
