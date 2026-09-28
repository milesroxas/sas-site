import type { WorkEntry } from '@/blocks/shared/resolve-work-entry'
import type { Visual } from '@/features/immersive/visual'

/**
 * One entry of the pinned featured roll: exactly what the list row and the
 * media frame read. Work pages and lab pages each flatten into it, so the roll
 * never learns which collection it is showing.
 */
export type FeaturedEntry = {
  id: number
  href: string
  title: string
  /** The active row's meta line, in order: client and industry for work, kind and status for lab. */
  facts: string[]
  visual: Visual | null
}

/**
 * Entries a page closer shows when its editor picked none: the most recently
 * published pages of its own collection. Each entry adds a step of pinned
 * scroll, so the roll stays short.
 */
export const FEATURED_CLOSER_FALLBACK_LIMIT = 4

/** Keeps the facts a page actually has, in order. */
export const presentFacts = (facts: (string | null | undefined)[]): string[] =>
  facts.filter((fact): fact is string => Boolean(fact))

export const featuredWorkEntry = (entry: WorkEntry): FeaturedEntry => ({
  id: entry.id,
  href: entry.href,
  title: entry.title,
  facts: presentFacts([entry.client, entry.industry]),
  visual: entry.visual,
})
