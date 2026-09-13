import { APIError, type PayloadRequest } from 'payload'
import { CANONICAL_STORY_FIELDS, type StoryPresentationCollection } from './canonical'
import {
  getStorySection,
  STORY_SECTION_DEFINITIONS,
  type StoryBeatReference,
  type StoryRecord,
  storyBeatReferences,
} from './narrative'

/** The first key that repeats within one keyed array. */
export const duplicateKey = (items: Array<{ key?: string | null }> | null | undefined) => {
  const keys = (items || []).map((item) => item.key).filter((key): key is string => Boolean(key))
  return keys.find((key, index) => keys.indexOf(key) !== index)
}

/** Presentations address a beat by section and key, so keys are unique within a section. */
export const assertUniqueStoryBeatKeys = (record: StoryRecord) => {
  for (const definition of STORY_SECTION_DEFINITIONS) {
    const key = duplicateKey(getStorySection(record, definition.source)?.storyBeats)
    if (key) {
      throw new APIError(`${definition.label} Story Beat key must be unique: ${key}`, 400)
    }
  }
}

/** The first beat a layout references that the record does not define. */
const missingStoryBeat = (record: StoryRecord, layout: unknown): StoryBeatReference | undefined =>
  storyBeatReferences(layout).find(
    (reference) =>
      !getStorySection(record, reference.section)?.storyBeats?.some(
        (beat) => beat.key === reference.key,
      ),
  )

/** Page side: publishing a page needs every beat it references on its published record. */
export const assertStoryBeatReferencesExist = (
  record: StoryRecord,
  layout: unknown,
  recordLabel: string,
) => {
  const missing = missingStoryBeat(record, layout)
  if (missing) {
    throw new APIError(
      `${missing.section} Story Beat ${missing.key} does not exist on the related ${recordLabel} record.`,
      400,
    )
  }
}

/**
 * Record side: publishing a record must not strand its presentation. Every
 * beat the page references, in its latest draft or its live version, has to
 * survive the publish.
 */
export const assertStoryBeatsKept = async ({
  presentation,
  record,
  req,
}: {
  presentation: StoryPresentationCollection
  record: StoryRecord & { id?: number | null }
  req: PayloadRequest
}) => {
  if (!record.id) return

  const query = (draft: boolean) =>
    req.payload.find({
      collection: presentation,
      depth: 0,
      draft,
      // The relationship is unique: a record has at most one presentation.
      pagination: false,
      req,
      select: { layout: true },
      where: { [CANONICAL_STORY_FIELDS[presentation].name]: { equals: record.id } },
    })
  const [latest, published] = await Promise.all([query(true), query(false)])
  const missing = [...latest.docs, ...published.docs]
    .map((page) => missingStoryBeat(record, page.layout))
    .find(Boolean)
  if (!missing) return

  const { singular } = req.payload.collections[presentation].config.labels
  throw new APIError(
    `${missing.section} Story Beat ${missing.key} is used by a ${typeof singular === 'string' ? singular : presentation}. Update that page before renaming or removing the beat.`,
    400,
  )
}
