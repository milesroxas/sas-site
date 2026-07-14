import { APIError, type CollectionBeforeValidateHook } from 'payload'
import type { LabProject } from '@/payload-types'

export const validateLabProject: CollectionBeforeValidateHook<LabProject> = ({
  data,
  originalDoc,
}) => {
  const merged = { ...originalDoc, ...data } as LabProject
  if (merged._status !== 'published') return data

  if (!merged.summaries?.oneLine && !merged.summaries?.short && !merged.summaries?.medium) {
    throw new APIError('At least one summary is required before publishing.', 400)
  }

  return data
}
