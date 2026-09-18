/**
 * Every public write that Vercel BotID guards. The browser SDK
 * (`src/instrumentation-client.ts`) attaches its challenge headers only to
 * requests matching this list, and `isBlockedBot` (./server) classifies a
 * request without those headers as a bot. So a handler that calls
 * `isBlockedBot` MUST have its path here, or it rejects every real visitor.
 *
 * Writes only, on purpose. Pages, /llms.txt, the markdown alternates, the
 * sitemaps and /api/mcp are never listed: crawlers and answer engines read
 * those without running JavaScript, and must keep doing so (docs/aeo.md).
 *
 * No server imports in this file: it ships in the browser bundle.
 */
export const BOT_PROTECTED_ROUTES = [
  { path: '/api/inquiries/submit', method: 'POST' },
  { path: '/api/form-submissions', method: 'POST' },
  { path: '/api/newsletter/subscribe', method: 'POST' },
]

/** Shown when a submission is refused, so a misjudged human still has a way in. */
export const BOT_BLOCKED_MESSAGE =
  'We could not verify this submission. Reload the page and try again, or email us instead.'
