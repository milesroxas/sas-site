/**
 * Immersive stack (FSD: **feature**): composes shared WebGL + interaction primitives for product UI.
 * Infrastructure remains under `@/lib/webgl` and `@/lib/interactions`.
 */
export { ImmersiveShell, type ImmersiveShellProps } from '@/lib/interactions/immersive-shell'
export { DOMTunnel, WebGLTunnel } from '@/lib/webgl/components/tunnel'
export { ChromaSplitText, type ChromaSplitTextProps } from './ui/chroma-split-text'
export { RefractionImage, type RefractionImageProps } from './ui/refraction-image'
export { WebGlBackdropScene } from './ui/webgl-backdrop-scene'
