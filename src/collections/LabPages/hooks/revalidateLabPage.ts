import { revalidatePath, revalidateTag } from 'next/cache.js'
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'
import type { LabPage } from '@/payload-types'

export const revalidateLabPage: CollectionAfterChangeHook<LabPage> = ({
  doc,
  previousDoc,
  req,
}) => {
  if (req.context.disableRevalidate) return doc
  if (doc._status === 'published') {
    revalidatePath(`/lab/${doc.slug}`)
    revalidatePath('/lab')
    revalidateTag('lab-sitemap', 'max')
    req.payload.logger.info(`Revalidated Lab Page at /lab/${doc.slug}`)
  }
  if (
    previousDoc?._status === 'published' &&
    (doc._status !== 'published' || previousDoc.slug !== doc.slug)
  ) {
    revalidatePath(`/lab/${previousDoc.slug}`)
    revalidatePath('/lab')
    revalidateTag('lab-sitemap', 'max')
  }
  return doc
}

export const revalidateLabPageDelete: CollectionAfterDeleteHook<LabPage> = ({ doc, req }) => {
  if (!req.context.disableRevalidate) {
    revalidatePath(`/lab/${doc.slug}`)
    revalidatePath('/lab')
    revalidateTag('lab-sitemap', 'max')
  }
  return doc
}
