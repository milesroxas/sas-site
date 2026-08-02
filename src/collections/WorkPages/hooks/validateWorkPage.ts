import { APIError, type CollectionBeforeValidateHook } from 'payload'
import type { CaseStudy, WorkPage } from '@/payload-types'

const idOf = (value: unknown): number | string | null => {
  if (typeof value === 'number' || typeof value === 'string') return value
  if (value && typeof value === 'object' && 'id' in value)
    return (value as { id: number | string }).id
  return null
}

// Every upload field on a layout block ends in "media" (media, portraitMedia,
// largeMedia, …); non-upload matches like browseAllMedia are booleans and fall
// out of the later idOf() pass.
const blockMedia = (layout: WorkPage['layout']) =>
  (layout || []).flatMap((block) =>
    Object.entries(block).flatMap(([key, value]) => {
      if (!/media$/i.test(key) || !value) return []
      return Array.isArray(value) ? value : [value]
    }),
  )

export const validateWorkPage: CollectionBeforeValidateHook<WorkPage> = async ({
  data,
  originalDoc,
  req,
}) => {
  const merged = { ...originalDoc, ...data } as WorkPage
  if (merged._status !== 'published') return data
  if (!merged.layout?.length)
    throw new APIError('Website layout is required before publishing.', 400)

  const caseStudyID = idOf(merged.caseStudy)
  if (!caseStudyID) throw new APIError('Case Study Content is required before publishing.', 400)

  const caseStudy = (await req.payload.findByID({
    collection: 'case-studies',
    id: caseStudyID,
    depth: 0,
    draft: false,
    req,
  })) as CaseStudy

  if (caseStudy._status !== 'published') {
    throw new APIError('The related Case Study Content must be published first.', 400)
  }

  const libraryIDs = (caseStudy.assetLibraries || []).map(idOf).filter(Boolean)
  if (!libraryIDs.length) {
    throw new APIError(
      'The related Case Study Content needs at least one Asset Library before its Work Page can publish.',
      400,
    )
  }

  const mediaIDs = [
    merged.coverAsset,
    merged.hero?.media,
    ...(merged.downloadableAssets || []),
    ...blockMedia(merged.layout),
  ]
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
    const invalid = media.docs.find(
      (asset) =>
        asset.usageStatus !== 'public-approved' || !libraryIDs.includes(idOf(asset.assetLibrary)),
    )
    if (invalid) {
      throw new APIError(
        `Asset ${invalid.filename || invalid.id} must be public-approved and belong to one of the Case Study's Asset Libraries.`,
        400,
      )
    }
  }

  return data
}
