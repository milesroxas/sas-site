import { revalidatePath, revalidateTag } from 'next/cache.js'
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'
import type { ExpertisePage } from '@/payload-types'

export const revalidateExpertisePage: CollectionAfterChangeHook<ExpertisePage> = ({
  doc,
  previousDoc,
  req,
}) => {
  if (req.context.disableRevalidate) return doc
  if (doc._status === 'published') {
    revalidatePath(`/expertise/${doc.slug}`)
    revalidatePath('/expertise')
    revalidateTag('expertise-sitemap', 'max')
    req.payload.logger.info(`Revalidated Expertise Page at /expertise/${doc.slug}`)
  }
  if (
    previousDoc?._status === 'published' &&
    (doc._status !== 'published' || previousDoc.slug !== doc.slug)
  ) {
    revalidatePath(`/expertise/${previousDoc.slug}`)
    revalidatePath('/expertise')
    revalidateTag('expertise-sitemap', 'max')
  }
  return doc
}

export const revalidateExpertisePageDelete: CollectionAfterDeleteHook<ExpertisePage> = ({
  doc,
  req,
}) => {
  if (!req.context.disableRevalidate) {
    revalidatePath(`/expertise/${doc.slug}`)
    revalidatePath('/expertise')
    revalidateTag('expertise-sitemap', 'max')
  }
  return doc
}
