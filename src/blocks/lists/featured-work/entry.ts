import type { CollectionSlug } from 'payload'
import type { WorkEntry } from '@/blocks/shared/resolve-work-entry'
import type { Visual } from '@/features/immersive/visual'
import type { Category, Media, Post } from '@/payload-types'
import type { LabBrowseItem } from '@/sections/LabBrowse/item'
import { populatedDoc } from '@/utilities/relationshipId'

/**
 * One featured page, exactly what the pinned featured roll and the home hero
 * card read. Work pages, lab pages and posts each flatten into it, so neither
 * surface learns which collection it is showing.
 */
export type FeaturedEntry = {
  id: number
  href: string
  title: string
  /** The active row's meta line, in order: client and industry for work, kind and status for lab, categories for a post. */
  facts: string[]
  visual: Visual | null
}

/**
 * What opening an entry does, per collection: the roll's media frame names
 * it and the hero card's cursor says it.
 */
export const FEATURED_ENTRY_ACTIONS = {
  'lab-pages': 'View lab project',
  posts: 'Read post',
  'work-pages': 'View case study',
} as const satisfies Partial<Record<CollectionSlug, string>>

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

/** A lab index row as a featured entry: kind and status on the meta line, as on the row. */
export const featuredLabEntry = (item: LabBrowseItem): FeaturedEntry => ({
  id: item.id,
  href: `/lab/${item.slug}`,
  title: item.title,
  facts: presentFacts([item.kind?.label, item.status]),
  visual: item.visual,
})

/**
 * A post as a featured entry. The picture is the SEO image, the asset the
 * insights cards show, else the hero portrait. Null for a post with no slug,
 * which has no route to link to.
 */
export const featuredPostEntry = (post: Post): FeaturedEntry | null => {
  if (!post.slug) return null
  const media = populatedDoc<Media>(post.meta?.image) ?? populatedDoc<Media>(post.heroImage)
  return {
    id: post.id,
    href: `/posts/${post.slug}`,
    title: post.title,
    facts: presentFacts(
      (post.categories ?? []).map((category) => populatedDoc<Category>(category)?.title),
    ),
    visual: media ? { kind: 'media', media } : null,
  }
}
