/**
 * Immersive stack (FSD: **feature**): composes shared WebGL + interaction primitives for product UI.
 * Infrastructure remains under `@/lib/webgl` and `@/lib/interactions`.
 */
export { ImmersiveShell, type ImmersiveShellProps } from '@/lib/interactions/immersive-shell'
export { DOMTunnel, WebGLTunnel } from '@/lib/webgl/components/tunnel'
export { WebGlBackdropScene } from './ui/webgl-backdrop-scene'
