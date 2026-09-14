import { APIError, type CollectionBeforeValidateHook } from 'payload'
import { assertStoryBeatReferencesExist } from '@/collections/story/validate'
import { collectVisualMediaRefs } from '@/fields/visual-refs'
import { findUnpublishableMedia } from '@/hooks/findUnpublishableMedia'
import type { CaseStudy, WorkPage } from '@/payload-types'
import { relationshipId, relationshipIds } from '@/utilities/relationshipId'

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

  assertStoryBeatReferencesExist(caseStudy, merged.layout, 'Case Study Content')

  const libraryIDs = (caseStudy.assetLibraries || []).map(relationshipId).filter(Boolean)
  if (!libraryIDs.length) {
    throw new APIError(
      'The related Case Study Content needs at least one Asset Library before its Work Page can publish.',
      400,
    )
  }

  // Every media reference the page holds, retained or not: cover, hero,
  // downloads, shader posters, and every `…media` field on every block,
  // including blocks nested inside Sections. The hover-only `menuPreview`
  // upload stays outside the gate, as before.
  const mediaIDs = relationshipIds([
    merged.coverAsset,
    merged.hero?.media,
    merged.hero?.shader?.posterMedia,
    merged.menuPreviewShader?.posterMedia,
    ...(merged.downloadableAssets || []),
    ...collectVisualMediaRefs(merged.layout),
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
