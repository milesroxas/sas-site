import type React from 'react'
import {
  LeakVisual,
  resolveVisual,
  type StoredVisualSlot,
  StreakVisual,
  VisualMotionToggle,
} from '@/features/immersive/visual'

/**
 * The ground of an index page: the effect chosen on the index global's hero
 * runs behind the whole listing. The layer spans the page and its inner frame
 * is sticky and one screen tall, so the canvas never grows with the list
 * (placement `hero`: the document's one live field, DPR 1.5) and the poster in
 * the server HTML is what the takeover menu clones and the hero handoff lands
 * on (`data-hero-media`). Pointer-transparent throughout: the filter strip,
 * rows and cards above it stay clickable, and the effect reads the pointer
 * from the window, so it answers the cursor wherever it is over the page. A
 * media upload is not painted here: the index stays copy.
 *
 * Both effects follow the visitor's theme (the slot offers no pin): the
 * listing over this ground paints in it, and a leak's opaque frame blends
 * against the page's own background inside its isolated frame.
 *
 * The owner is a `relative isolate` main marked `leakScope()`, so `-z-10` sits
 * above the page frame's opaque ground and under the listing, and a leak that
 * answers hover answers the whole listing rather than its sticky frame.
 */
export const IndexBackground: React.FC<{
  hero: StoredVisualSlot | null | undefined
  /** Stable identity a missing seed derives from: the global's slug. */
  seedKey: string
}> = ({ hero, seedKey }) => {
  const visual = resolveVisual(hero, { seedKey })
  if (visual === null || visual.kind === 'media') return null
  const slot = {
    fill: true,
    imgClassName: 'object-cover select-none',
    placement: 'hero' as const,
    priority: true,
    sizes: '100vw',
  }
  return (
    <>
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10" data-hero-media>
        <div className="sticky top-(--header-height) h-[calc(100svh-var(--header-height)-var(--footer-height))]">
          {visual.kind === 'streakField' ? (
            <StreakVisual {...slot} descriptor={{ ...visual.descriptor, surface: null }} />
          ) : (
            // The leak fills the sticky frame; its own frame carries the page
            // ground its blend meets. It never bleeds here: the index has no
            // block root to wash across.
            <LeakVisual
              {...slot}
              descriptor={{ ...visual.descriptor, bleed: false, surface: null }}
            />
          )}
        </div>
      </div>
      {/* Above the listing and clear of the fixed footer bar, where it can be reached. */}
      <VisualMotionToggle className="fixed right-4 bottom-[calc(var(--footer-height)+1rem)] z-20 md:right-8" />
    </>
  )
}
