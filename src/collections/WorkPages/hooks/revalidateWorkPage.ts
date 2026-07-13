import { revalidatePath, revalidateTag } from 'next/cache.js'
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'
import type { WorkPage } from '@/payload-types'

export const revalidateWorkPage: CollectionAfterChangeHook<WorkPage> = ({
  doc,
  previousDoc,
  req,
}) => {
  if (req.context.disableRevalidate) return doc
  if (doc._status === 'published') {
    revalidatePath(`/works/${doc.slug}`)
    revalidatePath('/works')
    revalidateTag('works-sitemap', 'max')
    req.payload.logger.info(`Revalidated Work Page at /works/${doc.slug}`)
  }
  if (
    previousDoc?._status === 'published' &&
    (doc._status !== 'published' || previousDoc.slug !== doc.slug)
  ) {
    revalidatePath(`/works/${previousDoc.slug}`)
    revalidatePath('/works')
    revalidateTag('works-sitemap', 'max')
  }
  return doc
}

export const revalidateWorkPageDelete: CollectionAfterDeleteHook<WorkPage> = ({ doc, req }) => {
  if (!req.context.disableRevalidate) {
    revalidatePath(`/works/${doc.slug}`)
    revalidatePath('/works')
    revalidateTag('works-sitemap', 'max')
  }
  return doc
}
