import { revalidatePath, revalidateTag } from 'next/cache.js'
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, TypeWithID } from 'payload'
import { MENU_CONTENT_TAG } from '@/Header/menuCache'

/** Shape every slug-addressed, draft-enabled website document shares. */
type SlugPageDoc = TypeWithID & {
  slug?: string | null
  _status?: ('draft' | 'published') | null
}

/**
 * Purges one path. A route pattern (`/posts/[slug]`) purges every page the
 * route rendered; a literal path purges that page.
 */
const purgePath = (path: string) => {
  if (path.includes('[')) {
    revalidatePath(path, 'page')
  } else {
    revalidatePath(path)
  }
}

/**
 * The publish/unpublish revalidation pair every slug-addressed page collection
 * needs: purge the document's own path (and, where one exists, the index that
 * lists it), plus the sitemap tag. The previous path is purged too whenever a
 * published document is unpublished *or* its slug moves, so the old URL never
 * keeps serving a stale render.
 *
 * `consumerPaths` are the routes that show this collection's documents as
 * cards (closers on sibling pages, list blocks on pages, the home page). They
 * are purged on the same transitions, so an unpublished document drops off
 * every card list at once instead of lingering until those pages next
 * revalidate on their own. Purges are lazy (the page re-renders on its next
 * visit), so a route pattern here costs nothing until someone opens a page.
 *
 * `req.context.disableRevalidate` opts a write out entirely: set by scripts
 * and seeds, which run outside a request where `revalidatePath` throws.
 */
export function slugPageRevalidation<T extends SlugPageDoc>({
  basePath,
  consumerPaths = [],
  label,
  revalidateIndex = false,
  revalidateMenu = false,
  sitemapTag,
}: {
  /** URL prefix for one document of this collection; `''` for root-level pages. */
  basePath: string
  /**
   * Routes that render these documents as cards: literal paths (`/`) or route
   * patterns (`/[slug]`, `/works/[slug]`), each purged with the document.
   */
  consumerPaths?: string[]
  /** Human-readable collection name, used in the log line. */
  label: string
  /** Also purge `basePath` itself, set when an index page lists these documents. */
  revalidateIndex?: boolean
  /** Also purge the takeover menu, which lists these documents in `_order`. */
  revalidateMenu?: boolean
  /** Cache tag the sitemap route reads. */
  sitemapTag: string
}) {
  const purge = (slug: string | null | undefined) => {
    revalidatePath(`${basePath}/${slug}`)
    if (revalidateIndex) revalidatePath(basePath)
    for (const path of consumerPaths) purgePath(path)
    if (revalidateMenu) revalidateTag(MENU_CONTENT_TAG, 'max')
    revalidateTag(sitemapTag, 'max')
  }

  const afterChange: CollectionAfterChangeHook<T> = ({ doc, previousDoc, req }) => {
    if (req.context.disableRevalidate) return doc
    if (doc._status === 'published') {
      purge(doc.slug)
      req.payload.logger.info(`Revalidated ${label} at ${basePath}/${doc.slug}`)
    }
    if (
      previousDoc?._status === 'published' &&
      (doc._status !== 'published' || previousDoc.slug !== doc.slug)
    ) {
      purge(previousDoc.slug)
    }
    return doc
  }

  const afterDelete: CollectionAfterDeleteHook<T> = ({ doc, req }) => {
    if (!req.context.disableRevalidate) purge(doc?.slug)
    return doc
  }

  return { afterChange, afterDelete }
}
