/**
 * Immersive stack (FSD: **feature**): composes shared WebGL + interaction primitives for product UI.
 * Infrastructure remains under `@/lib/webgl` and `@/lib/interactions`.
 */
export { ImmersiveShell, type ImmersiveShellProps } from '@/lib/interactions/immersive-shell'
export { WebGLTunnel } from '@/lib/webgl/components/tunnel'
export { ChromaSplitText, type ChromaSplitTextProps } from './ui/chroma-split-text'
export {
  DispersionMedia,
  type DispersionMediaProps,
  type DispersionShape,
  type DispersionSource,
} from './ui/dispersion-media'
export {
  type FloatingCardDef,
  FloatingCards,
  type FloatingCardsEase,
  type FloatingCardsProps,
} from './ui/floating-cards'
export {
  RefractionMedia,
  type RefractionMediaProps,
  type RefractionSource,
} from './ui/refraction-media'
export { TextLoadIn, type TextLoadInProps } from './ui/text-load-in'
export { WebGlBackdropScene } from './ui/webgl-backdrop-scene'
