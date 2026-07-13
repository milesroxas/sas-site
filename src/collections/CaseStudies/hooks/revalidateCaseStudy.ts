import { revalidatePath, revalidateTag } from 'next/cache.js'
import { APIError, type CollectionAfterChangeHook, type CollectionBeforeDeleteHook } from 'payload'
import type { CaseStudy } from '@/payload-types'

export const revalidateCaseStudyConsumers: CollectionAfterChangeHook<CaseStudy> = async ({
  doc,
  req,
}) => {
  if (req.context.disableRevalidate) return doc
  const consumers = await req.payload.find({
    collection: 'work-pages',
    depth: 0,
    limit: 100,
    pagination: false,
    where: { and: [{ caseStudy: { equals: doc.id } }, { _status: { equals: 'published' } }] },
    select: { slug: true },
    req,
  })
  for (const page of consumers.docs) revalidatePath(`/works/${page.slug}`)
  if (consumers.docs.length) {
    revalidatePath('/works')
    revalidateTag('works-sitemap', 'max')
  }
  return doc
}

export const preventDeletingUsedCaseStudy: CollectionBeforeDeleteHook = async ({ id, req }) => {
  const consumers = await req.payload.count({
    collection: 'work-pages',
    where: { caseStudy: { equals: id } },
    req,
  })
  if (consumers.totalDocs)
    throw new APIError('Delete the related Work Page before deleting its Case Study Content.', 400)
}
