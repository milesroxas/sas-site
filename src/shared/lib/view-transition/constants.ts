/**
 * Single source for view-transition identifiers.
 *
 * Each navigation tags itself with a transition *type* (via `next/link`
 * `transitionTypes` or `addTransitionType`). `DirectionalTransition` maps each
 * type to a CSS *class*; the CSS lives in `../../ui/view-transition/view-transition.css`.
 * The default is a mask reveal — the old page holds static while the new one
 * clips open over it; direction only picks the reveal's origin edge
 * (docs/route-transitions-roadmap.md §4).
 *
 *   nav-forward  list -> detail, next page  (reveal from the right, deeper)
 *   nav-back     detail -> list, prev page  (reveal from the left, shallower)
 *   nav-lateral  logo / search / sibling    (reveal top-down, no spatial depth)
 *   work-open    work spotlight -> case study (media takeover; root fades
 *                under the `morph-hero` shared element)
 */

export const NAV_FORWARD = 'nav-forward' as const
export const NAV_BACK = 'nav-back' as const
export const NAV_LATERAL = 'nav-lateral' as const
export const WORK_OPEN = 'work-open' as const

/** Going deeper: list -> detail, next page. */
export const forwardNavTransitionTypes = [NAV_FORWARD] as const satisfies readonly string[]
/** Going back: detail -> list, previous page. */
export const backNavTransitionTypes = [NAV_BACK] as const satisfies readonly string[]
/** Lateral / sibling moves with no depth (home logo, search, footer links). */
export const lateralNavTransitionTypes = [NAV_LATERAL] as const satisfies readonly string[]
/** Work spotlight -> case study: media expands, page fades under it. */
export const workOpenTransitionTypes = [WORK_OPEN] as const satisfies readonly string[]

/**
 * Shared-element name bridging a post's list-card image and its detail hero image.
 * Used by both `Card` and `PostHero` so the morph pair always matches.
 *
 * `view-transition-name` must be a valid CSS custom-ident, so any character
 * outside [a-zA-Z0-9_-] in the slug (e.g. `@` or `.`) is replaced.
 */
export const postImageVtName = (slug: string) =>
  `post-image-${slug.replace(/[^a-zA-Z0-9_-]/g, '_')}`

/**
 * Shared-element name bridging a work entry's featured media (IndustryWork
 * spotlight) and its case-study hero media. Both sides pair via `morph-hero`
 * (see `view-transition.css`): the old page fades, the media centers
 * vertically, expands to full screen, and holds there alone, then the new
 * page fades in as the media travels to the hero and, last, shrinks into it.
 */
export const workImageVtName = (slug: string) =>
  `work-image-${slug.replace(/[^a-zA-Z0-9_-]/g, '_')}`

/**
 * Type-gated `share` maps for the shared-element pairs. A plain-string
 * `share` activates on ANY transition where a name pair forms — including
 * navigations something else owns (a menu hero-handoff push, browser
 * back/forward), where the CSS morph would paint a full-size ghost over that
 * navigation's motion. The maps let a pair participate only under the
 * navigation types it was designed for; `default: 'none'` keeps every other
 * pairing silent.
 */
export const postImageShare = {
  [NAV_FORWARD]: 'morph',
  [NAV_BACK]: 'morph',
  default: 'none',
}

export const workImageShare = {
  [WORK_OPEN]: 'morph-hero',
  default: 'none',
}
