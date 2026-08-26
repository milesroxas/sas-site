import { revalidatePath, revalidateTag } from 'next/cache.js'
import type {
  CollectionAfterChangeHook,
  CollectionBeforeDeleteHook,
  CollectionSlug,
  TypeWithID,
} from 'payload'
import { APIError } from 'payload'

/**
 * Hooks for a Content Hub record that a website page renders but does not own
 * (a case study behind a work page, a lab project behind a lab page). Editing
 * the record has to purge the pages that display it, and deleting it while a
 * page still points at it would strand that page — so deletion is refused
 * until the page goes first.
 */
export function consumerPageHooks<T extends TypeWithID>({
  basePath,
  blockedDeleteMessage,
  collection,
  relationField,
  sitemapTag,
}: {
  /** URL prefix of the consuming pages. */
  basePath: string
  /** Admin-facing reason shown when a delete is refused. */
  blockedDeleteMessage: string
  /** Collection of the pages that render this record. */
  collection: CollectionSlug
  /** Field on that collection holding the relationship back to this record. */
  relationField: string
  /** Cache tag the consuming collection's sitemap route reads. */
  sitemapTag: string
}) {
  const afterChange: CollectionAfterChangeHook<T> = async ({ doc, req }) => {
    if (req.context.disableRevalidate) return doc
    const consumers = await req.payload.find({
      collection,
      depth: 0,
      limit: 100,
      pagination: false,
      where: {
        and: [{ [relationField]: { equals: doc.id } }, { _status: { equals: 'published' } }],
      },
      select: { slug: true },
      req,
    })
    for (const page of consumers.docs) {
      revalidatePath(`${basePath}/${(page as { slug?: string | null }).slug}`)
    }
    if (consumers.docs.length) {
      revalidatePath(basePath)
      revalidateTag(sitemapTag, 'max')
    }
    return doc
  }

  const beforeDelete: CollectionBeforeDeleteHook = async ({ id, req }) => {
    const consumers = await req.payload.count({
      collection,
      where: { [relationField]: { equals: id } },
      req,
    })
    if (consumers.totalDocs) throw new APIError(blockedDeleteMessage, 400)
  }

  return { afterChange, beforeDelete }
}
