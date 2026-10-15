'use client'

import { usePathname } from 'next/navigation'
import type React from 'react'
import { useEffect, useState, ViewTransition } from 'react'
import { clearShallowPath, isShallowPath } from '@/shared/lib/view-transition/shallow-path'

import './view-transition.css'

/**
 * Page-level transition wrapper, rendered from `(frontend)/template.tsx`.
 *
 * The boundary has to be placed anew on every navigation: that is what lets
 * `enter`/`exit` fire, and what makes React start the platform transition at
 * all (a persisting boundary is a hard cut, see
 * `shared/lib/view-transition/suppress.ts`). A template only remounts when the
 * segment directly below it changes (`works` -> `insights`); a navigation that
 * changes a deeper segment, `/works/a` -> `/works/b`, keeps the template's
 * instance mounted. So the boundary is keyed on the pathname instead: every
 * pathname change is a fresh `<ViewTransition>`. Search-param and hash changes
 * keep the pathname and animate nothing, by design (URL sync is not
 * navigation). A path written by `replacePathShallow` (the insights topic
 * filter) is URL sync too: the key holds, so the page keeps its state.
 *
 * Each navigation tags itself with a transition type (see
 * `shared/lib/view-transition/constants.ts`); this maps the type to a CSS class.
 * `default: 'none'` keeps unrelated transitions (Suspense reveals,
 * revalidations) silent: only tagged navigations animate.
 */
export function DirectionalTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const shallow = isShallowPath(pathname)
  // One key per real navigation. Derived during render (React's "adjust state
  // on prop change" pattern), so the new boundary mounts in the same commit as
  // the new page. A shallow path only moves `path`: leaving it again, even
  // back to the path the boundary mounted on, is a real navigation and counts.
  const [boundary, setBoundary] = useState({ path: pathname, count: 0 })
  if (pathname !== boundary.path) {
    setBoundary({ path: pathname, count: shallow ? boundary.count : boundary.count + 1 })
  }

  useEffect(() => {
    if (!shallow) clearShallowPath()
  }, [shallow])

  return (
    <ViewTransition
      key={boundary.count}
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
