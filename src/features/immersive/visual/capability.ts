/**
 * Streak Field admission probe. Distinct from `detectGPUCapability`: that
 * accepts WebGL1 or the mere presence of `navigator.gpu`, and folds device
 * policy into one boolean. The live field needs an actual WebGL2 context
 * that is not a known software rasterizer, and `flow` looks need a
 * renderable floating-point target. Probed once per document, on demand,
 * on a throwaway canvas whose context is released straight after.
 *
 * Renderer-name heuristics are conservative, not authoritative: SwiftShader
 * and llvmpipe are software; other Mesa strings can be hardware, so they
 * pass, and the runtime's frame watchdog covers what the name hides.
 */
export type StreakCapability = {
  /** A WebGL2 context was created without a major performance caveat. */
  webgl2: boolean
  /** Float or half-float color buffers are renderable (flow simulation). */
  floatTarget: boolean
  /** Renderer identified as a software rasterizer. */
  software: boolean
  /** Unmasked renderer string when the browser exposes it, for reports. */
  renderer: string | null
}

const SOFTWARE_RENDERERS =
  /swiftshader|llvmpipe|softpipe|software rasterizer|microsoft basic render/i

let cached: StreakCapability | null = null

export const NO_STREAK_CAPABILITY: StreakCapability = {
  webgl2: false,
  floatTarget: false,
  software: false,
  renderer: null,
}

export function probeStreakCapability(): StreakCapability {
  if (cached) return cached
  if (typeof document === 'undefined') return NO_STREAK_CAPABILITY
  let result = NO_STREAK_CAPABILITY
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2', {
      failIfMajorPerformanceCaveat: true,
      powerPreference: 'high-performance',
    })
    if (gl) {
      const debug = gl.getExtension('WEBGL_debug_renderer_info')
      const renderer = debug
        ? String(gl.getParameter(debug.UNMASKED_RENDERER_WEBGL) ?? '')
        : String(gl.getParameter(gl.RENDERER) ?? '')
      const floatTarget =
        Boolean(gl.getExtension('EXT_color_buffer_float')) ||
        Boolean(gl.getExtension('EXT_color_buffer_half_float'))
      result = {
        webgl2: true,
        floatTarget,
        software: SOFTWARE_RENDERERS.test(renderer),
        renderer: renderer || null,
      }
      gl.getExtension('WEBGL_lose_context')?.loseContext()
    }
  } catch {
    result = NO_STREAK_CAPABILITY
  }
  cached = result
  return result
}

/** Test seam: forget the cached probe. */
export function resetStreakCapabilityForTests() {
  cached = null
}
