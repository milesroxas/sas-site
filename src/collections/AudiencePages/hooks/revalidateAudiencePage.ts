import { revalidatePath, revalidateTag } from 'next/cache.js'
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'
import type { AudiencePage } from '@/payload-types'

export const revalidateAudiencePage: CollectionAfterChangeHook<AudiencePage> = ({
  doc,
  previousDoc,
  req,
}) => {
  if (req.context.disableRevalidate) return doc
  if (doc._status === 'published') {
    revalidatePath(`/who-we-help/${doc.slug}`)
    revalidatePath('/who-we-help')
    revalidateTag('who-we-help-sitemap', 'max')
    req.payload.logger.info(`Revalidated Audience Page at /who-we-help/${doc.slug}`)
  }
  if (
    previousDoc?._status === 'published' &&
    (doc._status !== 'published' || previousDoc.slug !== doc.slug)
  ) {
    revalidatePath(`/who-we-help/${previousDoc.slug}`)
    revalidatePath('/who-we-help')
    revalidateTag('who-we-help-sitemap', 'max')
  }
  return doc
}

export const revalidateAudiencePageDelete: CollectionAfterDeleteHook<AudiencePage> = ({
  doc,
  req,
}) => {
  if (!req.context.disableRevalidate) {
    revalidatePath(`/who-we-help/${doc.slug}`)
    revalidatePath('/who-we-help')
    revalidateTag('who-we-help-sitemap', 'max')
  }
  return doc
}
