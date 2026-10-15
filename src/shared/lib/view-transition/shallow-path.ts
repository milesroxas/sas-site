/**
 * A path written into the address bar to mirror on-page state, not to
 * navigate: the insights index writes `/insights/<topic>` as its topic filter
 * changes, so the filtered view is shareable and lands on its static route.
 *
 * Next's router syncs to that path, so `usePathname` reports it, and the page
 * transition boundary (`DirectionalTransition`) keys on the pathname. Without
 * this record that key change remounted the whole page and threw the filter's
 * state away the moment it was applied. The boundary keeps its key for the
 * recorded path; the next real navigation clears the record, so a link to the
 * same path later remounts and animates like any other.
 */
let shallowPath: string | null = null

/** Write `href` to the address bar as a sync of on-page state, not a navigation. */
export function replacePathShallow(href: string) {
  shallowPath = new URL(href, window.location.href).pathname
  // Null state lets Next's patched replaceState wrap its own internals and
  // sync the router's canonical URL. Reusing window.history.state carries
  // Next's __NA flag, which skips that sync: the router then restores the
  // stale tree on back/forward and snaps the address bar back.
  window.history.replaceState(null, '', href)
}

/** Whether `pathname` is the last path written by `replacePathShallow`. */
export const isShallowPath = (pathname: string) => pathname === shallowPath

/** A real navigation happened: later arrivals at the shallow path remount as usual. */
export function clearShallowPath() {
  shallowPath = null
}
