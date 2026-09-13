import { APIError, type CollectionBeforeValidateHook } from 'payload'
import {
  assertStoryBeatsKept,
  assertUniqueStoryBeatKeys,
  duplicateKey,
} from '@/collections/story/validate'
import type { CaseStudy } from '@/payload-types'

export const validateCaseStudy: CollectionBeforeValidateHook<CaseStudy> = async ({
  data,
  originalDoc,
  req,
}) => {
  const merged = { ...originalDoc, ...data } as CaseStudy
  const decisionKey = duplicateKey(merged.keyDecisions)
  if (decisionKey) throw new APIError(`Key decision key must be unique: ${decisionKey}`, 400)

  assertUniqueStoryBeatKeys(merged)

  const metricKey = duplicateKey(merged.metrics)
  if (metricKey) throw new APIError(`Metric key must be unique: ${metricKey}`, 400)

  if (merged._status !== 'published') return data

  if (!merged.summaries?.oneLine && !merged.summaries?.short && !merged.summaries?.medium) {
    throw new APIError('At least one summary is required before publishing.', 400)
  }

  await assertStoryBeatsKept({ presentation: 'work-pages', record: merged, req })

  const invalidMetric = merged.metrics?.find(
    (metric) =>
      metric.approvedForPublic &&
      (!metric.label || !metric.value || (!metric.source && !metric.qualifier)),
  )
  if (invalidMetric) {
    throw new APIError(
      'Public metrics require a label, value, and either a source or qualifier.',
      400,
    )
  }

  return data
}
