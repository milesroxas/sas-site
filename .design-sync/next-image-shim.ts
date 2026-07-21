/**
 * `next/image` has no package `exports` map, so esbuild resolves its CommonJS
 * entry; because this repo is `"type": "module"`, esbuild applies Node's CJS
 * interop and a default import receives the whole namespace
 * (`{default, getImageProps}`) instead of the Image component — React then
 * throws "Element type is invalid" inside ImageMedia. This module unwraps to
 * the real component. Used only by the design-sync build, via `cfg.tsconfig`
 * → `.design-sync/tsconfig.json`; the app's tsconfig and Next's own bundler
 * are untouched.
 */
import * as NextImageNs from 'next/dist/shared/lib/image-external.js'

type Unknownish = Record<string, unknown>

// Peel `.default` until the value is something React accepts as an element
// type (a function, or an object carrying `$$typeof` — forwardRef/memo).
function unwrap(mod: unknown): unknown {
  let v = mod
  for (let i = 0; i < 5; i++) {
    if (typeof v === 'function') return v
    if (v && typeof v === 'object' && '$$typeof' in (v as Unknownish)) return v
    const next = v && typeof v === 'object' ? (v as Unknownish).default : undefined
    if (!next) return v
    v = next
  }
  return v
}

const ns = NextImageNs as unknown as Unknownish

export default unwrap(ns) as never
export const getImageProps = unwrap(ns.getImageProps ?? ns) as never
