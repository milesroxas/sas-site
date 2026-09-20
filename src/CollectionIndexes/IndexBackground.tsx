import type React from 'react'
import {
  resolveVisual,
  type StoredVisualSlot,
  StreakVisual,
  VisualMotionToggle,
} from '@/features/immersive/visual'

/**
 * The ground of an index page: a Streak Field chosen on the index global's
 * hero runs behind the whole listing. The layer spans the page and its inner
 * frame is sticky and one screen tall, so the canvas never grows with the
 * list (placement `hero`: the document's one live field, DPR 1.5) and the
 * poster in the server HTML is what the takeover menu clones and the hero
 * handoff lands on (`data-hero-media`). Pointer-transparent throughout: the
 * filter strip, rows and cards above it stay clickable, and the field reads
 * the pointer from the window, so it answers the cursor wherever it is over
 * the page. A media upload is not painted here: the index stays copy.
 *
 * The owner is a `relative isolate` main, so `-z-10` sits above the page
 * frame's opaque ground and under the listing.
 */
export const IndexBackground: React.FC<{
  hero: StoredVisualSlot | null | undefined
  /** Stable identity a missing seed derives from: the global's slug. */
  seedKey: string
}> = ({ hero, seedKey }) => {
  const visual = resolveVisual(hero, { seedKey })
  if (visual?.kind !== 'streakField') return null
  return (
    <>
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10" data-hero-media>
        <div className="sticky top-(--header-height) h-[calc(100svh-var(--header-height)-var(--footer-height))]">
          <StreakVisual
            // The listing over this ground paints in the visitor's theme, so
            // the field always follows it (the slot offers no pin).
            descriptor={{ ...visual.descriptor, surface: null }}
            fill
            imgClassName="object-cover select-none"
            placement="hero"
            priority
            sizes="100vw"
          />
        </div>
      </div>
      {/* Above the listing and clear of the fixed footer bar, where it can be reached. */}
      <VisualMotionToggle className="fixed right-4 bottom-[calc(var(--footer-height)+1rem)] z-20 md:right-8" />
    </>
  )
}
