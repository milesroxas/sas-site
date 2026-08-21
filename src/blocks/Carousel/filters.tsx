'use client'

import type React from 'react'

export type CaOffsets = React.RefObject<{
  red: SVGFEOffsetElement | null
  blue: SVGFEOffsetElement | null
}>

export type DissolveMap = React.RefObject<SVGFEDisplacementMapElement | null>

/**
 * Shared SVG filter definitions for the carousel — the DOM analogue of the
 * fragment-shader passes these effects would be in WebGL:
 *
 * - `ca`: red/blue channel split (chromatic aberration). Green passes through
 *   untouched; the offset red/blue copies screen-blend back over it. feOffset
 *   dx values are driven per frame by the tween.
 * - `dissolve`: fractal-noise displacement. The displacement scale is animated
 *   by GSAP to melt a video's poster away as playback starts.
 */
export const CarouselFilters: React.FC<{
  caId: string
  caOffsets: CaOffsets
  dissolveId: string
  dissolveMap: DissolveMap
}> = ({ caId, caOffsets, dissolveId, dissolveMap }) => (
  <svg aria-hidden="true" className="absolute h-0 w-0" focusable="false" role="presentation">
    <filter colorInterpolationFilters="sRGB" height="110%" id={caId} width="110%" x="-5%" y="-5%">
      <feColorMatrix
        in="SourceGraphic"
        result="red"
        type="matrix"
        values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"
      />
      <feColorMatrix
        in="SourceGraphic"
        result="green"
        type="matrix"
        values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0"
      />
      <feColorMatrix
        in="SourceGraphic"
        result="blue"
        type="matrix"
        values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0"
      />
      <feOffset
        dx="0"
        dy="0"
        in="red"
        ref={(el) => {
          caOffsets.current.red = el
        }}
        result="redShift"
      />
      <feOffset
        dx="0"
        dy="0"
        in="blue"
        ref={(el) => {
          caOffsets.current.blue = el
        }}
        result="blueShift"
      />
      <feBlend in="redShift" in2="green" mode="screen" result="redGreen" />
      <feBlend in="redGreen" in2="blueShift" mode="screen" />
    </filter>
    <filter
      colorInterpolationFilters="sRGB"
      height="120%"
      id={dissolveId}
      width="120%"
      x="-10%"
      y="-10%"
    >
      <feTurbulence
        baseFrequency="0.02 0.06"
        numOctaves="2"
        result="noise"
        seed="7"
        type="fractalNoise"
      />
      <feDisplacementMap
        in="SourceGraphic"
        in2="noise"
        ref={(el) => {
          dissolveMap.current = el
        }}
        scale="0"
        xChannelSelector="R"
        yChannelSelector="G"
      />
    </filter>
  </svg>
)
