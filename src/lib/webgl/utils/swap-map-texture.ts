import type { ShaderMaterial, Texture } from 'three'
import { LinearFilter } from 'three'

/**
 * Point a material's `uMap` uniform at a newly loaded texture and dispose the
 * one it replaces — textures held in uniforms are not disposed for us, so an
 * unswapped previous texture leaks GPU memory on every source change.
 *
 * `cancelled` guards the async load: if the effect that started it has already
 * torn down, the arriving texture is disposed instead of applied.
 */
export function swapMapTexture(
  material: ShaderMaterial,
  texture: Texture,
  { cancelled }: { cancelled: boolean },
): boolean {
  if (cancelled) {
    texture.dispose()
    return false
  }
  texture.minFilter = LinearFilter
  texture.magFilter = LinearFilter
  texture.generateMipmaps = false
  const previous = material.uniforms.uMap?.value as Texture | null
  material.uniforms.uMap.value = texture
  previous?.dispose()
  return true
}
