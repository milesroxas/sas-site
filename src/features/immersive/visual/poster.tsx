import Image from 'next/image'
import { cn } from '@/utilities/ui'
import type { BlendMode, Surface } from '../studio/effect'
import type { VisualSurface } from './descriptor'
import type { PosterImage, VisualPosters } from './posters'

/** The poster/canvas crossfade, as the class both layers carry and the time the release waits out. */
export const CROSSFADE_MS = 500
export const crossfadeClass = (shown: boolean) =>
  cn('absolute inset-0 transition-opacity duration-500', shown ? 'opacity-100' : 'opacity-0')

type Face = {
  poster: PosterImage
  /**
   * Which ground this still is for. `any` always shows; `light` and `dark`
   * twins are gated by globals.css ("Visual posters") on the nearest
   * `[data-theme]` or `.band-dark` ancestor, so only one paints at a time.
   */
  ground: 'any' | Surface
  blend?: BlendMode
  priority: boolean
}

/**
 * The still a visual slot shows before its effect runs, and wherever it cannot.
 * Server HTML carries it as a real `<img>`, so the slot is complete without
 * JavaScript or a GPU.
 *
 * Each still sits in its own layer, and that layer carries the fade and the
 * blend together: an element that fades is its own stacking context, so a
 * blend on anything inside it would stop at that element and never reach the
 * ground.
 */
export function VisualPosterStack({
  posters,
  surface,
  shown,
  priority,
  sizes,
  imgClassName,
  blend,
}: {
  posters: VisualPosters
  surface: VisualSurface
  /** Off once the live effect has drawn; the stills fade under it. */
  shown: boolean
  priority: boolean
  sizes: string
  imgClassName?: string
  /** How each ground's still composites, for an effect that draws an opaque frame. */
  blend?: Record<Surface, BlendMode>
}) {
  // One upload serves both grounds, but a blended still composites differently
  // on each, so it still ships as a gated pair while the ground is unknown.
  const faces: Face[] =
    surface !== 'auto' || (posters.single && !blend)
      ? [
          {
            poster: posters[surface === 'dark' ? 'dark' : 'light'],
            ground: 'any',
            blend: blend?.[surface === 'dark' ? 'dark' : 'light'],
            priority,
          },
        ]
      : // The site default (light) first, so a query for the first visible
        // image finds it. The hidden twin is `display: none`, so its lazy load
        // waits for the theme.
        [
          { poster: posters.light, ground: 'light', blend: blend?.light, priority },
          { poster: posters.dark, ground: 'dark', blend: blend?.dark, priority: false },
        ]
  return faces.map((face) => (
    <div
      key={face.ground}
      className={crossfadeClass(shown)}
      style={face.blend ? { mixBlendMode: face.blend } : undefined}
    >
      <Image
        alt=""
        className={cn('absolute inset-0 size-full object-cover select-none', imgClassName)}
        data-visual-poster={face.ground}
        draggable={false}
        height={face.poster.height}
        priority={face.priority}
        sizes={sizes}
        src={face.poster.src}
        width={face.poster.width}
      />
    </div>
  ))
}
