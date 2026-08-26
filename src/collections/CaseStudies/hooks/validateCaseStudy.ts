import { APIError, type CollectionBeforeValidateHook } from 'payload'
import type { CaseStudy } from '@/payload-types'
import {
  CASE_STUDY_STORY_SECTION_DEFINITIONS,
  getCaseStudyStorySection,
  storyBeatReferences,
} from '../story'

const duplicateKey = (items: Array<{ key?: string | null }> | null | undefined) => {
  const keys = (items || []).map((item) => item.key).filter((key): key is string => Boolean(key))
  return keys.find((key, index) => keys.indexOf(key) !== index)
}

export const validateCaseStudy: CollectionBeforeValidateHook<CaseStudy> = async ({
  data,
  originalDoc,
  req,
}) => {
  const merged = { ...originalDoc, ...data } as CaseStudy
  const decisionKey = duplicateKey(merged.keyDecisions)
  if (decisionKey) throw new APIError(`Key decision key must be unique: ${decisionKey}`, 400)

  for (const definition of CASE_STUDY_STORY_SECTION_DEFINITIONS) {
    const storyBeatKey = duplicateKey(
      getCaseStudyStorySection(merged, definition.source)?.storyBeats,
    )
    if (storyBeatKey) {
      throw new APIError(`${definition.label} Story Beat key must be unique: ${storyBeatKey}`, 400)
    }
  }

  const metricKey = duplicateKey(merged.metrics)
  if (metricKey) throw new APIError(`Metric key must be unique: ${metricKey}`, 400)

  if (merged._status !== 'published') return data

  if (!merged.summaries?.oneLine && !merged.summaries?.short && !merged.summaries?.medium) {
    throw new APIError('At least one summary is required before publishing.', 400)
  }

  if (merged.id) {
    const [latestPages, publishedPages] = await Promise.all([
      req.payload.find({
        collection: 'work-pages',
        depth: 0,
        draft: true,
        limit: 2,
        pagination: false,
        req,
        where: { caseStudy: { equals: merged.id } },
      }),
      req.payload.find({
        collection: 'work-pages',
        depth: 0,
        draft: false,
        limit: 2,
        pagination: false,
        req,
        where: { caseStudy: { equals: merged.id } },
      }),
    ])
    const availableReferences = new Set(
      CASE_STUDY_STORY_SECTION_DEFINITIONS.flatMap((definition) =>
        (getCaseStudyStorySection(merged, definition.source)?.storyBeats || []).map(
          (beat) => `${definition.source}:${beat.key}`,
        ),
      ),
    )
    const missingReference = [...latestPages.docs, ...publishedPages.docs]
      .flatMap((page) => storyBeatReferences(page.layout))
      .find((reference) => !availableReferences.has(`${reference.section}:${reference.key}`))

    if (missingReference) {
      throw new APIError(
        `${missingReference.section} Story Beat ${missingReference.key} is used by a Work Page. Update that page before renaming or removing the beat.`,
        400,
      )
    }
  }

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
