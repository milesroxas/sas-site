/**
 * Single source for view-transition identifiers: CSS classes and Link transition types.
 * CSS selectors in `../../ui/view-transition/view-transition.css` use PAGE_VIEW_TRANSITION_CLASS.
 */

/** Applied via `<ViewTransition update={...}>`; matches `::view-transition-*(.${PAGE_VIEW_TRANSITION_CLASS})` in CSS. */
export const PAGE_VIEW_TRANSITION_CLASS = 'sas-page-vt' as const

/** Semantic type for `next/link` `transitionTypes`; matched in `ViewTransitionBoundary` update map. */
export const NAV_TRANSITION_TYPE = 'nav' as const

/** Use on internal `<Link>` navigations so transitions align with the boundary. */
export const linkNavTransitionTypes = [NAV_TRANSITION_TYPE] as const satisfies readonly string[]
