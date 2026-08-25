import { revalidatePath, revalidateTag } from 'next/cache.js'
import type { GlobalAfterChangeHook } from 'payload'

/**
 * Revalidates a collection index page when its global publishes or unpublishes.
 * Paths containing a dynamic segment (e.g. `/posts/page/[pageNumber]`) are
 * revalidated as route patterns so every rendered page number refreshes.
 */
export const revalidateCollectionIndex =
  ({ paths, slug }: { paths: string[]; slug: string }): GlobalAfterChangeHook =>
  ({ doc, previousDoc, req: { payload, context } }) => {
    if (!context.disableRevalidate) {
      const published = doc._status === 'published'
      const unpublished = previousDoc?._status === 'published' && doc._status !== 'published'

      if (published || unpublished) {
        payload.logger.info(`Revalidating ${slug} at paths: ${paths.join(', ')}`)
        for (const path of paths) {
          if (path.includes('[')) {
            revalidatePath(path, 'page')
          } else {
            revalidatePath(path)
          }
        }
        revalidateTag(`global_${slug}`, 'max')
      }
    }

    return doc
  }
