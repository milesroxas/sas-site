import { APIError, type CollectionBeforeValidateHook } from 'payload'
import type { LabPage, LabProject } from '@/payload-types'

const idOf = (value: unknown): number | string | null => {
  if (typeof value === 'number' || typeof value === 'string') return value
  if (value && typeof value === 'object' && 'id' in value)
    return (value as { id: number | string }).id
  return null
}

const blockMedia = (layout: LabPage['layout']) =>
  (layout || []).flatMap((block) => {
    if (!('media' in block) || !block.media) return []
    return Array.isArray(block.media) ? block.media : [block.media]
  })

export const validateLabPage: CollectionBeforeValidateHook<LabPage> = async ({
  data,
  originalDoc,
  req,
}) => {
  const merged = { ...originalDoc, ...data } as LabPage
  if (merged._status !== 'published') return data
  if (!merged.layout?.length)
    throw new APIError('Website layout is required before publishing.', 400)

  const labProjectID = idOf(merged.labProject)
  if (!labProjectID) throw new APIError('A Lab Project is required before publishing.', 400)

  const labProject = (await req.payload.findByID({
    collection: 'lab-projects',
    id: labProjectID,
    depth: 0,
    draft: false,
    req,
  })) as LabProject

  if (labProject._status !== 'published') {
    throw new APIError('The related Lab Project must be published first.', 400)
  }

  const mediaIDs = [merged.coverAsset, merged.hero?.media, ...blockMedia(merged.layout)]
    .map(idOf)
    .filter((id): id is number | string => id !== null)

  if (mediaIDs.length) {
    const media = await req.payload.find({
      collection: 'media',
      depth: 0,
      limit: mediaIDs.length,
      pagination: false,
      where: { id: { in: mediaIDs } },
      req,
    })
    const invalid = media.docs.find((asset) => asset.usageStatus !== 'public-approved')
    if (invalid) {
      throw new APIError(
        `Asset ${invalid.filename || invalid.id} must be public-approved before this Lab Page can publish.`,
        400,
      )
    }
  }

  return data
}
