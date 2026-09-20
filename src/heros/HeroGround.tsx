import type React from 'react'
import { Visual } from '@/components/Visual'
import type { EffectVisual } from '@/features/immersive/visual'

/**
 * The effect behind a hero band: a Streak Field or a light leak filling the
 * band edge to edge, under everything the hero draws.
 *
 * Stated once because every hero opening grounds the same way, whatever its
 * layout does above it (`resolveOpening`). The band owns the stacking context
 * (`relative isolate overflow-clip`), and the layer sits at `-z-10` so the
 * page's own background never paints over it.
 *
 * `handoff` marks this layer as the takeover menu's dissolve source
 * (`data-hero-media`, src/Header/Menu). A hero with a media frame marks that
 * frame instead: the menu clones the first img/video it finds, and the plate
 * is the picture a visitor is looking at.
 */
export const HeroGround: React.FC<{
  ground: EffectVisual | null
  /** Extra frame classes, for a band that tints or masks its ground. */
  className?: string
  handoff?: boolean
}> = ({ ground, className, handoff = false }) => {
  if (!ground) return null
  return (
    <div className="contents" {...(handoff ? { 'data-hero-media': '' } : {})}>
      <Visual
        fill
        frameClassName={className ? `-z-10 ${className}` : '-z-10'}
        imgClassName="-z-10 object-cover select-none"
        placement="hero"
        posterClassName="object-cover select-none"
        priority
        size="100vw"
        visual={ground}
      />
    </div>
  )
}
