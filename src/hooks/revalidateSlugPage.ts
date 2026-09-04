import { revalidatePath, revalidateTag } from 'next/cache.js'
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, TypeWithID } from 'payload'
import { MENU_CONTENT_TAG } from '@/Header/menuCache'

/** Shape every slug-addressed, draft-enabled website document shares. */
type SlugPageDoc = TypeWithID & {
  slug?: string | null
  _status?: ('draft' | 'published') | null
}

/**
 * The publish/unpublish revalidation pair every slug-addressed page collection
 * needs: purge the document's own path (and, where one exists, the index that
 * lists it), plus the sitemap tag. The previous path is purged too whenever a
 * published document is unpublished *or* its slug moves, so the old URL never
 * keeps serving a stale render.
 *
 * `req.context.disableRevalidate` opts a write out entirely — set by scripts
 * and seeds, which run outside a request where `revalidatePath` throws.
 */
export function slugPageRevalidation<T extends SlugPageDoc>({
  basePath,
  label,
  revalidateIndex = false,
  revalidateMenu = false,
  sitemapTag,
}: {
  /** URL prefix for one document of this collection; `''` for root-level pages. */
  basePath: string
  /** Human-readable collection name, used in the log line. */
  label: string
  /** Also purge `basePath` itself — set when an index page lists these documents. */
  revalidateIndex?: boolean
  /** Also purge the takeover menu, which lists these documents in `_order`. */
  revalidateMenu?: boolean
  /** Cache tag the sitemap route reads. */
  sitemapTag: string
}) {
  const purge = (slug: string | null | undefined) => {
    revalidatePath(`${basePath}/${slug}`)
    if (revalidateIndex) revalidatePath(basePath)
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
