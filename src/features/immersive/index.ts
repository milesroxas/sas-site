/**
 * Immersive stack (FSD: **feature**): composes shared WebGL + interaction primitives for product UI.
 * Infrastructure remains under `@/lib/webgl` and `@/lib/interactions`.
 */
export { ImmersiveShell, type ImmersiveShellProps } from '@/lib/interactions/immersive-shell'
export { WebGLTunnel } from '@/lib/webgl/components/tunnel'
export { HERO_LENS, INDUSTRY_WORK_MEDIA, LIGHT_LEAK_AMBER, LIGHT_LEAK_PAPER } from './presets'
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
  LIGHT_LEAK_DEFAULTS,
  LightLeak,
  type LightLeakBlendMode,
  type LightLeakProps,
  type LightLeakTint,
} from './ui/light-leak'
export {
  LIGHT_LEAK_EXCITE_ATTR,
  leakExcite,
} from './ui/light-leak-excite'
export {
  REFRACTION_MEDIA_DEFAULTS,
  RefractionMedia,
  type RefractionMediaProps,
  type RefractionSource,
} from './ui/refraction-media'
export {
  SCROLL_GALLERY_DEFAULTS,
  ScrollGallery,
  type ScrollGalleryItem,
  type ScrollGalleryMood,
  type ScrollGalleryProps,
} from './ui/scroll-gallery'
export { TEXT_LOAD_IN_DEFAULTS, TextLoadIn, type TextLoadInProps } from './ui/text-load-in'
export {
  TEXT_LOAD_IN_RAYMARCHED_DEFAULTS,
  TextLoadInRaymarched,
  type TextLoadInRaymarchedProps,
} from './ui/text-load-in-raymarched'
export { WebGlBackdropScene } from './ui/webgl-backdrop-scene'
export { useWebglMediaLayer } from './use-webgl-media-layer'
