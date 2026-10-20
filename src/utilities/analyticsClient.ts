/**
 * Browser-side capture for the few events that never reach the server (a 404
 * render, a CTA click). Call sites never import `posthog-js`: the consent-gated
 * provider (`src/providers/Analytics/PostHog.tsx`) attaches the SDK's capture
 * here once it has loaded, and anything captured before then waits in a short
 * queue. With no consent, an internal browser, or no key, nothing is ever
 * attached and the queue simply caps: that is the same silence the provider
 * already keeps for pageviews.
 *
 * Properties follow the server helper's rule (see the posthog-analytics
 * skill): metadata only, never free text a visitor typed. The provider
 * registers `environment` as a super property, so it is not set here.
 */

type Properties = Record<string, unknown>
type Capture = (event: string, properties?: Properties) => void
type Queued = { event: string; properties?: Properties }

/** Enough for one page's worth of clicks before the SDK is idle-loaded. */
const QUEUE_LIMIT = 20

let sink: Capture | null = null
const queue: Queued[] = []

export function captureClientEvent(event: string, properties?: Properties): void {
  if (sink) {
    sink(event, properties)
    return
  }
  if (queue.length >= QUEUE_LIMIT) queue.shift()
  queue.push({ event, properties })
}

/** The provider hands over the live SDK; queued events drain in order. */
export function attachClientCapture(capture: Capture): void {
  sink = capture
  for (const { event, properties } of queue.splice(0)) capture(event, properties)
}

/** Tests only: forget the sink and anything waiting on it. */
export function resetClientCapture(): void {
  sink = null
  queue.length = 0
}

/** Where a call to action sits on the page. Extend here, not at a call site. */
export type CtaLocation = 'header' | 'closing' | 'cta_block' | 'faq'

/**
 * One event for every primary call to action, keyed by slot rather than by
 * component, so a funnel can compare the header button against the closing
 * band on the same page. The label is the editor's copy, not visitor input.
 */
export function captureCtaClick(args: { location: CtaLocation; label: string; href: string }) {
  captureClientEvent('cta_clicked', {
    ...args,
    page_path: window.location.pathname,
  })
}

/** Fired once by the 404 page. `page_path` is the missing path itself. */
export function capturePageNotFound() {
  captureClientEvent('page_not_found', {
    page_path: window.location.pathname,
    referrer: document.referrer || null,
  })
}
