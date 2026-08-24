import type React from 'react'
import { ViewTransition } from 'react'
import { workImageVtName } from '@/shared/lib/view-transition/constants'

/**
 * Shared element: target of the work-media takeover — the block's media
 * lands on the wrapped rect. Pairs with the matching `name` in
 * `IndustryWork`, which also re-sequences the glide into center → expand →
 * hold → travel → shrink beats (`sequenceWorkImageMorph` — React fires `onShare` on the unmounting
 * side, so the handler lives there, not here). Renders children unwrapped
 * when the page has no slug (no source element to morph from).
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
    <ViewTransition default="none" name={workImageVtName(slug)} share="morph-hero">
      {children}
    </ViewTransition>
  )
}
