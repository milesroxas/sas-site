'use client'

import { Canvas } from '@react-three/fiber'
import type { ReactNode, RefObject } from 'react'
import { useEffect, useMemo, useRef } from 'react'
import { CANVAS_RESIZE } from '@/lib/webgl/canvas-resize'

/**
 * Shared shell for the GL heading reveals. Both variants mirror a real DOM
 * heading into a WebGL overlay: the DOM `<h3>` (`data-heading-final`) stays
 * the accessible, selectable text, and the overlay (`data-heading-gl`) draws
 * the effect until the parent's timeline crossfades back. Only the scene
 * inside the canvas — and how far it spills past the heading box — differs
 * between them.
 */

/** Refs the shell hands to a scene: the heading to sample, and its redraw flag. */
export type GlHeadingStage = {
  headingRef: RefObject<HTMLHeadingElement | null>
  /** Raised whenever the DOM heading must be re-sampled into the GL texture. */
  dirtyRef: RefObject<boolean>
}

export type GlHeadingProps = {
  className?: string
  /** R3F device-pixel-ratio clamp for the overlay canvas. */
  dpr: [number, number]
  /** Horizontal overflow in px so the effect isn't clipped at the heading box. */
  padX: number
  /** Vertical overflow in px so the effect isn't clipped at the heading box. */
  padY: number
  /** Renders the R3F scene that draws this heading's reveal. */
  scene: (stage: GlHeadingStage) => ReactNode
  text: string
  /**
   * Also redraw when `[data-theme]` flips on `<html>` — needed by scenes that
   * bake the heading's computed color into their texture.
   */
  watchTheme?: boolean
}

export function GlHeading({
  className,
  dpr,
  padX,
  padY,
  scene,
  text,
  watchTheme = false,
}: GlHeadingProps) {
  const headingRef = useRef<HTMLHeadingElement>(null)
  const dirtyRef = useRef(true)

  const chars = useMemo(() => Array.from(text), [text])

  useEffect(() => {
    void text
    dirtyRef.current = true
  }, [text])

  useEffect(() => {
    const el = headingRef.current
    if (!el) return
    const observer = new ResizeObserver(() => {
      dirtyRef.current = true
    })
    observer.observe(el)

    // Theme toggles flip [data-theme] on <html>; rebuild so the shader picks
    // up the heading's new computed color.
    const themeObserver = watchTheme
      ? new MutationObserver(() => {
          dirtyRef.current = true
        })
      : undefined
    themeObserver?.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    })

    let cancelled = false
    document.fonts?.ready.then(() => {
      if (!cancelled) dirtyRef.current = true
    })
    return () => {
      cancelled = true
      observer.disconnect()
      themeObserver?.disconnect()
    }
  }, [watchTheme])

  return (
    // w-fit: the GL overlay is sized off this box via inset, so it must
    // shrink-wrap the heading exactly or the texture stretches to fill.
    <div className="relative w-fit">
      <h3 ref={headingRef} data-heading-final className={className}>
        {chars.map((ch, i) =>
          ch === ' ' ? (
            ' '
          ) : (
            <span key={i} data-char className="inline-block">
              {ch}
            </span>
          ),
        )}
      </h3>
      <div
        data-heading-gl
        aria-hidden
        className="pointer-events-none absolute"
        style={{ inset: `${-padY}px ${-padX}px` }}
      >
        <Canvas dpr={dpr} flat linear resize={CANVAS_RESIZE}>
          {scene({ headingRef, dirtyRef })}
        </Canvas>
      </div>
    </div>
  )
}
