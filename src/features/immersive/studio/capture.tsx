'use client'

import { Canvas, useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import { createRoot } from 'react-dom/client'
import { STUDIO_GROUND } from './effect'
import { type EffectId, effectOf } from './effects'
import { type CaptureOptions, type Snapshot, STILL_QUALITY } from './recipe'
import { EFFECT_SCENES } from './scenes'

export type CaptureInput = { effect: EffectId; snapshot: Snapshot; capture: CaptureOptions }

/**
 * One exact still, rendered in this browser: the effect's own scene stepped a
 * fixed number of 1/60 s frames with neutral input, then encoded as the
 * capture's own file. It mounts its own offscreen canvas and takes it down
 * again, so the caller needs no element and the website has no readback path.
 * Studio calls it on Publish (the two posters) and on Export.
 */
export function captureStill(input: CaptureInput): Promise<Blob> {
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
  input: { effect, capture, snapshot },
  onResult,
  onError,
}: {
  input: CaptureInput
  onResult: (image: Blob) => void
  onError: (message: string) => void
}) {
  const rootRef = useRef<HTMLDivElement>(null)
  const Scene = EFFECT_SCENES[effect].Capture
  const tuning = effectOf(effect).limit(snapshot[capture.surface], 'hero')
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
        <Scene rootRef={rootRef} tuning={tuning} onError={onError} />
        <CaptureFrames
          frames={snapshot.frame}
          capture={capture}
          onResult={onResult}
          onError={onError}
        />
      </Canvas>
    </div>
  )
}

/**
 * The finished file, encoded here: a lossless PNG of a full frame is several
 * megabytes, more than a request to the server can carry. A filled capture is
 * laid over its surface's ground first. A browser that cannot encode the
 * format answers with PNG, which the server converts.
 */
function encodeStill(source: HTMLCanvasElement, capture: CaptureOptions): Promise<Blob> {
  let canvas = source
  if (!capture.transparent) {
    canvas = document.createElement('canvas')
    canvas.width = source.width
    canvas.height = source.height
    const context = canvas.getContext('2d')
    if (!context) throw new Error('The still could not be encoded.')
    context.fillStyle = STUDIO_GROUND[capture.surface]
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.drawImage(source, 0, 0)
  }
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('The still could not be encoded.'))),
      `image/${capture.format}`,
      STILL_QUALITY / 100,
    ),
  )
}

function CaptureFrames({
  frames,
  capture,
  onResult,
  onError,
}: {
  frames: number
  capture: CaptureOptions
  onResult: (image: Blob) => void
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
        const image = await encodeStill(gl.domElement, capture)
        if (!cancelled) callbacks.current.onResult(image)
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
  }, [advance, capture, frames, gl, scene])
  return null
}
