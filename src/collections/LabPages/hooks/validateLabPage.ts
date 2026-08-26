import { APIError, type CollectionBeforeValidateHook } from 'payload'
import { findUnpublishableMedia } from '@/hooks/findUnpublishableMedia'
import type { LabPage, LabProject } from '@/payload-types'
import { relationshipId, relationshipIds } from '@/utilities/relationshipId'

const blockMedia = (layout: LabPage['layout']) =>
  (layout || []).flatMap((block) => {
    if ('slides' in block && Array.isArray(block.slides)) {
      return block.slides.flatMap((slide) => (slide.media ? [slide.media] : []))
    }
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

  const labProjectID = relationshipId(merged.labProject)
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

  const mediaIDs = relationshipIds([
    merged.coverAsset,
    merged.hero?.media,
    ...blockMedia(merged.layout),
  ])

  const invalid = await findUnpublishableMedia({
    ids: mediaIDs,
    isPublishable: (asset) => asset.usageStatus === 'public-approved',
    req,
  })
  if (invalid) {
    throw new APIError(
      `Asset ${invalid.filename || invalid.id} must be public-approved before this Lab Page can publish.`,
      400,
    )
  }

  return data
}
