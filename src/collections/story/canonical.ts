import type { CollectionSlug } from 'payload'
import type { LabPage, WorkPage } from '@/payload-types'

export type CanonicalStoryField = { name: string; collection: CollectionSlug }

/**
 * Which relationship on a website page names the Content Hub record whose
 * story it presents. Stated once for everything that follows that link: the
 * Story Beat picker, story validation on both sides, and the RAG corpus
 * (`CONTENT_SURFACES` hydrates the record so its narrative is embedded with
 * the page).
 */
export const CANONICAL_STORY_FIELDS = {
  'work-pages': {
    name: 'caseStudy' satisfies keyof WorkPage,
    collection: 'case-studies',
  },
  'lab-pages': {
    name: 'labProject' satisfies keyof LabPage,
    collection: 'lab-projects',
  },
} as const satisfies Partial<Record<CollectionSlug, CanonicalStoryField>>

/** A website collection that presents a canonical story record. */
export type StoryPresentationCollection = keyof typeof CANONICAL_STORY_FIELDS
