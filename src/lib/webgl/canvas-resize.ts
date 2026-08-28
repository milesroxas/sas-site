/**
 * R3F canvas sizing under a CSS-transformed ancestor.
 *
 * `<Canvas>` measures its container with react-use-measure, which reads
 * `getBoundingClientRect()` — a *transformed* box. The takeover menu docks the
 * page frame under a `scale(...)` while the route commits underneath (see
 * `Header/Menu`, `heroHandoff.ts`), so a canvas that mounts during the dock is
 * created at the scaled size — the home hero's lens came up at 0.6978x, ending
 * ~70% of the way across its section with a hard edge. Undocking only clears
 * the transform, which fires no ResizeObserver: nothing re-measures, and the
 * effect stays undersized for the rest of that page's life.
 *
 * `offsetSize` swaps width/height for `offsetWidth`/`offsetHeight` — layout-box
 * values, so they are transform-independent and correct whether or not the
 * frame happens to be docked. Pointer math improves for the same reason: R3F
 * derives NDC from `event.offsetX / size.width`, and `offsetX` is likewise
 * untransformed.
 *
 * Every `<Canvas>` in the app applies this. Sites with their own scroll or
 * debounce tuning spread it into their own hoisted `RESIZE_OPTIONS`.
 */
export const CANVAS_RESIZE = { offsetSize: true } as const
