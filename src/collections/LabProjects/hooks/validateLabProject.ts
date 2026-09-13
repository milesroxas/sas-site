import { APIError, type CollectionBeforeValidateHook } from 'payload'
import { assertStoryBeatsKept, assertUniqueStoryBeatKeys } from '@/collections/story/validate'
import type { LabProject } from '@/payload-types'

export const validateLabProject: CollectionBeforeValidateHook<LabProject> = async ({
  data,
  originalDoc,
  req,
}) => {
  const merged = { ...originalDoc, ...data } as LabProject
  assertUniqueStoryBeatKeys(merged)

  if (merged._status !== 'published') return data

  if (!merged.summaries?.oneLine && !merged.summaries?.short && !merged.summaries?.medium) {
    throw new APIError('At least one summary is required before publishing.', 400)
  }

  await assertStoryBeatsKept({ presentation: 'lab-pages', record: merged, req })

  return data
}
