import { APIError, type CollectionBeforeValidateHook } from 'payload'
import { getCaseStudyStorySection, storyBeatReferences } from '@/collections/CaseStudies/story'
import { findUnpublishableMedia } from '@/hooks/findUnpublishableMedia'
import type { CaseStudy, WorkPage } from '@/payload-types'
import { relationshipId, relationshipIds } from '@/utilities/relationshipId'

// Every upload field on a layout block ends in "media" (media, portraitMedia,
// largeMedia, …); non-upload matches like browseAllMedia are booleans and fall
// out of the later relationshipId() pass.
const blockMedia = (layout: WorkPage['layout']) =>
  (layout || []).flatMap((block) => {
    const fromFields = Object.entries(block).flatMap(([key, value]) => {
      if (!/media$/i.test(key) || !value) return []
      return Array.isArray(value) ? value : [value]
    })
    if (!('slides' in block) || !Array.isArray(block.slides)) return fromFields
    return [...fromFields, ...block.slides.flatMap((slide) => (slide.media ? [slide.media] : []))]
  })

export const validateWorkPage: CollectionBeforeValidateHook<WorkPage> = async ({
  data,
  originalDoc,
  req,
}) => {
  const merged = { ...originalDoc, ...data } as WorkPage
  if (merged._status !== 'published') return data
  if (!merged.layout?.length)
    throw new APIError('Website layout is required before publishing.', 400)

  const caseStudyID = relationshipId(merged.caseStudy)
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

  const beatReferences = storyBeatReferences(merged.layout)
  const missingBeat = beatReferences.find((reference) => {
    const beats = getCaseStudyStorySection(caseStudy, reference.section)?.storyBeats || []
    return !beats.some((beat) => beat.key === reference.key)
  })
  if (missingBeat) {
    throw new APIError(
      `${missingBeat.section} Story Beat ${missingBeat.key} does not exist on the related Case Study Content record.`,
      400,
    )
  }

  const libraryIDs = (caseStudy.assetLibraries || []).map(relationshipId).filter(Boolean)
  if (!libraryIDs.length) {
    throw new APIError(
      'The related Case Study Content needs at least one Asset Library before its Work Page can publish.',
      400,
    )
  }

  const mediaIDs = relationshipIds([
    merged.coverAsset,
    merged.hero?.media,
    ...(merged.downloadableAssets || []),
    ...blockMedia(merged.layout),
  ])

  const invalid = await findUnpublishableMedia({
    ids: mediaIDs,
    isPublishable: (asset) =>
      asset.usageStatus === 'public-approved' &&
      libraryIDs.includes(relationshipId(asset.assetLibrary)),
    req,
  })
  if (invalid) {
    throw new APIError(
      `Asset ${invalid.filename || invalid.id} must be public-approved and belong to one of the Case Study's Asset Libraries.`,
      400,
    )
  }

  return data
}
