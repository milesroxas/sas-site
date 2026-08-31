'use client'

import type React from 'react'
import { ViewTransition } from 'react'

import './view-transition.css'

/**
 * Page-level transition wrapper. Rendered from `(frontend)/template.tsx` so it
 * unmounts/remounts on every navigation — that is what lets `enter`/`exit` fire
 * (a layout would persist and never animate route changes).
 *
 * Each navigation tags itself with a transition type (see
 * `shared/lib/view-transition/constants.ts`); this maps the type to a CSS class.
 * `default: 'none'` keeps unrelated transitions (Suspense reveals,
 * revalidations) silent — only tagged navigations animate.
 */
export function DirectionalTransition({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition
      // The default is a mask reveal (brand grammar — no page crossfades,
      // docs/route-transitions-roadmap.md §4): the old page holds static
      // (`reveal-hold`) while the new page's snapshot clips open over it.
      // Direction picks the reveal's origin edge — forward from the right,
      // back from the left, lateral top-down.
      enter={{
        'nav-forward': 'reveal-right',
        'nav-back': 'reveal-left',
        'nav-lateral': 'reveal-down',
        // Case-study open: the incoming page holds invisible while the
        // `morph-hero` media glides into the hero rect, then fades in —
        // only the media (over the persistent chrome/canvas) is on stage
        // during the move.
        'work-open': 'work-enter',
        default: 'none',
      }}
      exit={{
        'nav-forward': 'reveal-hold',
        'nav-back': 'reveal-hold',
        'nav-lateral': 'reveal-hold',
        'work-open': 'work-exit',
        default: 'none',
      }}
      default="none"
    >
      {/* Avoid display:contents — it breaks view-transition snapshots in Chromium. */}
      <div className="relative w-full min-h-0">{children}</div>
    </ViewTransition>
  )
}
