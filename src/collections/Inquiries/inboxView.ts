import { INQUIRY_QUERIES } from './components/queries'

/**
 * The inquiries list. Fixed by the admin's route folder
 * (`src/app/(payload)/admin`) and the collection slug.
 */
export const INQUIRIES_LIST_PATH = '/admin/collections/inquiries'

/**
 * Where a request for the inquiries list goes instead, or null to let it through.
 *
 * The list opens on the inbox, with spam left out unless a filter asks for it.
 * Payload has no default filter for a list view, and `admin.baseFilter` is not
 * one: it narrows the rows on screen, but "Select all" builds its bulk query
 * from the URL alone, so a bulk edit or delete from the unfiltered list would
 * reach the spam it never showed. Putting the inbox filter in the URL makes
 * the rows, the count, the filter builder and every bulk action read one query.
 *
 * Any `where` in the URL is a filter someone chose and passes untouched.
 * Clearing every condition lands back here, on the inbox.
 */
export function inboxRedirect(url: URL): URL | null {
  if (url.pathname.replace(/\/$/, '') !== INQUIRIES_LIST_PATH) return null
  for (const key of url.searchParams.keys()) {
    if (key.startsWith('where')) return null
  }
  const next = new URL(url)
  for (const [key, value] of new URLSearchParams(INQUIRY_QUERIES.inbox)) {
    next.searchParams.append(key, value)
  }
  return next
}
