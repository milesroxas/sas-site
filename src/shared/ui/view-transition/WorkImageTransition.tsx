import type React from 'react'
import { ViewTransition } from 'react'
import { workImageShare, workImageVtName } from '@/shared/lib/view-transition/constants'

/**
 * Shared element: target of the work-media takeover — the block's media
 * lands on the wrapped rect. Pairs with the matching `name` in
 * `IndustryWork`, which also re-sequences the glide into center → expand →
 * hold → travel → shrink beats (`sequenceWorkImageMorph` — React fires `onShare` on the unmounting
 * side, so the handler lives there, not here). Renders children unwrapped
 * when the page has no slug (no source element to morph from).
 *
 * `share` is type-gated to `work-open`: the pair also forms on navigations
 * that are NOT the takeover (menu hero-handoff push, browser back/forward)
 * whenever the source spotlight and this hero coexist across the swap —
 * ungated, the CSS fallback glide would paint a full-size media ghost over
 * whatever owns that navigation's motion (e.g. the handoff traveler).
 */
export function WorkImageTransition({
  slug,
  children,
}: {
  slug: string | null | undefined
  children: React.ReactNode
}) {
  if (!slug) return children
  return (
    <ViewTransition default="none" name={workImageVtName(slug)} share={workImageShare}>
      {children}
    </ViewTransition>
  )
}
