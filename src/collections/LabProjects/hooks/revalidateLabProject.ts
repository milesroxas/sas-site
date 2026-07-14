import { revalidatePath, revalidateTag } from 'next/cache.js'
import { APIError, type CollectionAfterChangeHook, type CollectionBeforeDeleteHook } from 'payload'
import type { LabProject } from '@/payload-types'

export const revalidateLabProjectConsumers: CollectionAfterChangeHook<LabProject> = async ({
  doc,
  req,
}) => {
  if (req.context.disableRevalidate) return doc
  const consumers = await req.payload.find({
    collection: 'lab-pages',
    depth: 0,
    limit: 100,
    pagination: false,
    where: { and: [{ labProject: { equals: doc.id } }, { _status: { equals: 'published' } }] },
    select: { slug: true },
    req,
  })
  for (const page of consumers.docs) revalidatePath(`/lab/${page.slug}`)
  if (consumers.docs.length) {
    revalidatePath('/lab')
    revalidateTag('lab-sitemap', 'max')
  }
  return doc
}

export const preventDeletingUsedLabProject: CollectionBeforeDeleteHook = async ({ id, req }) => {
  const consumers = await req.payload.count({
    collection: 'lab-pages',
    where: { labProject: { equals: id } },
    req,
  })
  if (consumers.totalDocs)
    throw new APIError('Delete the related Lab Page before deleting its Lab Project.', 400)
}
