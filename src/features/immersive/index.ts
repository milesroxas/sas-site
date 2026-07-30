/**
 * Immersive stack (FSD: **feature**): composes shared WebGL + interaction primitives for product UI.
 * Infrastructure remains under `@/lib/webgl` and `@/lib/interactions`.
 */
export { ImmersiveShell, type ImmersiveShellProps } from '@/lib/interactions/immersive-shell'
export { WebGLTunnel } from '@/lib/webgl/components/tunnel'
export { HERO_LENS } from './presets'
export {
  CHROMA_SPLIT_TEXT_DEFAULTS,
  ChromaSplitText,
  type ChromaSplitTextProps,
} from './ui/chroma-split-text'
export {
  DISPERSION_MEDIA_DEFAULTS,
  DispersionMedia,
  type DispersionMediaProps,
  type DispersionShape,
  type DispersionSource,
} from './ui/dispersion-media'
export {
  FLOATING_CARDS_DEFAULTS,
  type FloatingCardDef,
  FloatingCards,
  type FloatingCardsEase,
  type FloatingCardsProps,
} from './ui/floating-cards'
export {
  REFRACTION_MEDIA_DEFAULTS,
  RefractionMedia,
  type RefractionMediaProps,
  type RefractionSource,
} from './ui/refraction-media'
export { TEXT_LOAD_IN_DEFAULTS, TextLoadIn, type TextLoadInProps } from './ui/text-load-in'
export {
  TEXT_LOAD_IN_RAYMARCHED_DEFAULTS,
  TextLoadInRaymarched,
  type TextLoadInRaymarchedProps,
} from './ui/text-load-in-raymarched'
export { WebGlBackdropScene } from './ui/webgl-backdrop-scene'
