import {
  FEATURED_ENTRY_ACTIONS,
  type FeaturedEntry,
  featuredLabEntry,
  featuredPostEntry,
  featuredWorkEntry,
} from '@/blocks/featured-work/entry'
import { resolveWorkEntry } from '@/blocks/shared/resolve-work-entry'
import type { Home, LabPage, Post, WorkPage } from '@/payload-types'
import { toLabBrowseItem } from '@/sections/LabBrowse/item'
import { surfaceByCollection } from '@/shared/content/surfaces'
import { populatedDoc } from '@/utilities/relationshipId'

type FeaturedPageRef = NonNullable<Home['hero']['featuredPage']>

/** What the hero card reads: the page, its label, and what opening it does. */
export type HeroFeature = {
  entry: FeaturedEntry
  label: string
  action: string
}

/**
 * The featured page as an entry, through the same flattener every other
 * featured surface uses for its collection. Null while the value is a bare
 * id (the page is unpublished, so the public read could not populate it) or
 * the page has no route.
 */
const featuredEntry = (ref: FeaturedPageRef): FeaturedEntry | null => {
  switch (ref.relationTo) {
    case 'posts': {
      const post = populatedDoc<Post>(ref.value)
      return post && featuredPostEntry(post)
    }
    case 'work-pages': {
      const page = populatedDoc<WorkPage>(ref.value)
      const work = page && resolveWorkEntry(page)
      return work && featuredWorkEntry(work)
    }
    case 'lab-pages': {
      const page = populatedDoc<LabPage>(ref.value)
      const item = page && toLabBrowseItem(page)
      return item && featuredLabEntry(item)
    }
  }
}

/**
 * The home hero's featured card, or null when there is nothing to show. An
 * empty label falls back to the section the page sits in (the content-surface
 * title: Insights, Work, Lab), so switching the card to another collection
 * never leaves the old section's name on it.
 */
export const resolveHeroFeature = ({
  featuredLabel,
  featuredPage,
}: Pick<Home['hero'], 'featuredLabel' | 'featuredPage'>): HeroFeature | null => {
  const entry = featuredPage ? featuredEntry(featuredPage) : null
  if (!featuredPage || !entry) return null

  return {
    entry,
    label: featuredLabel || surfaceByCollection.get(featuredPage.relationTo)?.title || '',
    action: FEATURED_ENTRY_ACTIONS[featuredPage.relationTo],
  }
}
