import { APIError, type CollectionBeforeValidateHook } from 'payload'
import type { CaseStudy } from '@/payload-types'

const duplicateKey = (items: Array<{ key?: string | null }> | null | undefined) => {
  const keys = (items || []).map((item) => item.key).filter((key): key is string => Boolean(key))
  return keys.find((key, index) => keys.indexOf(key) !== index)
}

export const validateCaseStudy: CollectionBeforeValidateHook<CaseStudy> = ({
  data,
  originalDoc,
}) => {
  const merged = { ...originalDoc, ...data } as CaseStudy
  const decisionKey = duplicateKey(merged.keyDecisions)
  if (decisionKey) throw new APIError(`Key decision key must be unique: ${decisionKey}`, 400)

  const metricKey = duplicateKey(merged.metrics)
  if (metricKey) throw new APIError(`Metric key must be unique: ${metricKey}`, 400)

  if (merged._status !== 'published') return data

  if (!merged.summaries?.oneLine && !merged.summaries?.short && !merged.summaries?.medium) {
    throw new APIError('At least one summary is required before publishing.', 400)
  }
  if (!merged.challenge) throw new APIError('Challenge is required before publishing.', 400)
  if (!merged.outcomeSummary)
    throw new APIError('Outcome summary is required before publishing.', 400)
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
