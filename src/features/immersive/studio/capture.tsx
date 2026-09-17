'use client'

import { Canvas, useThree } from '@react-three/fiber'
import { useEffect, useRef, useState } from 'react'
import { createPointerInput, FieldScene } from '../ui/streak-field-scene'
import { type CaptureOptions, limitStudioTuning, type StreakSnapshot } from './recipe'

type CaptureInput = { snapshot: StreakSnapshot; capture: CaptureOptions }
declare global {
  interface Window {
    streakCapture?: (input: CaptureInput) => void
    streakCaptureResult?: string
    streakCaptureError?: string
  }
}

/** Only the isolated capture route imports this module. No website readback path. */
export function StreakCapture() {
  const [input, setInput] = useState<CaptureInput | null>(null)
  const [generation, setGeneration] = useState(0)
  const rootRef = useRef<HTMLDivElement>(null)
  const pointer = useRef(createPointerInput())
  useEffect(() => {
    window.streakCapture = (input) => {
      window.streakCaptureResult = undefined
      window.streakCaptureError = undefined
      setInput(input)
      setGeneration((n) => n + 1)
    }
    return () => {
      delete window.streakCapture
    }
  }, [])
  if (!input) return <div>Capture renderer ready</div>
  const { capture, snapshot } = input
  const tuning = limitStudioTuning(snapshot[capture.surface], 'hero')
  return (
    <div ref={rootRef} style={{ width: capture.width, height: capture.height }}>
      <Canvas
        key={generation}
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
          gl.debug.onShaderError = () => {
            window.streakCaptureError = 'Shader compilation failed'
          }
        }}
      >
        <FieldScene
          rootRef={rootRef}
          inputRef={pointer}
          tuning={{ ...tuning, pointerRadius: 0 }}
          fixedDelta={1 / 60}
          onFlowUnsupported={() => {
            window.streakCaptureError = 'Float render targets unavailable'
          }}
        />
        <CaptureFrames frames={snapshot.frame} />
      </Canvas>
    </div>
  )
}

function CaptureFrames({ frames }: { frames: number }) {
  const advance = useThree((state) => state.advance)
  const gl = useThree((state) => state.gl)
  const scene = useThree((state) => state.scene)
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
          if (frame % 20 === 19)
            await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
        }
        gl.getContext().finish()
        if (!cancelled && !window.streakCaptureError)
          window.streakCaptureResult = gl.domElement.toDataURL('image/png').split(',')[1]
      } catch (error) {
        window.streakCaptureError = String(error)
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
