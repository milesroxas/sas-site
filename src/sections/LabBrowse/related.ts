import configPromise from '@payload-config'
import { draftMode } from 'next/headers'
import type { Where } from 'payload'
import { getPayload } from 'payload'
import {
  FEATURED_CLOSER_FALLBACK_LIMIT,
  type FeaturedEntry,
  presentFacts,
} from '@/blocks/featured-work/entry'
import type { LabPage } from '@/payload-types'
import { relationshipIds } from '@/utilities/relationshipId'
import { LAB_BROWSE_QUERY, type LabBrowseItem, toLabBrowseItems } from './queries'

/** A lab index row as a featured roll entry: kind and status on the meta line, as on the row. */
const featuredLabEntry = (item: LabBrowseItem): FeaturedEntry => ({
  id: item.id,
  href: `/lab/${item.slug}`,
  title: item.title,
  facts: presentFacts([item.kind?.label, item.status]),
  visual: item.visual,
})

/**
 * Lab pages matching `where`, flattened into index rows. The index query with
 * the work closer's draft rules: outside draft mode it is published-only and
 * access-enforced, so an unpublished pick never reaches a public render; a
 * draft preview can still show drafts.
 */
async function findLabItems(where: Where, options: { limit: number; sort?: string }) {
  const { isEnabled: draft } = await draftMode()
  const payload = await getPayload({ config: configPromise })

  const { docs } = await payload.find({
    ...LAB_BROWSE_QUERY,
    ...options,
    draft,
    overrideAccess: draft,
    pagination: false,
    where: draft ? where : { and: [where, { _status: { equals: 'published' } }] },
  })

  return toLabBrowseItems(docs)
}

/**
 * Lab-page closer: the Related Work tab's picks in the editor's order, with
 * unpublished ones skipped. If nothing is selected, or nothing selected is
 * public, the most recently published lab pages, excluding this one.
 *
 * Mirrors `resolveRelatedWorkEntries` (blocks/featured-work/resolve-entries),
 * the same contract on the work side.
 */
export async function resolveRelatedLabEntries(page: LabPage): Promise<FeaturedEntry[]> {
  const ids = relationshipIds(page.relatedLabPages ?? [])
  if (ids.length) {
    const items = await findLabItems({ id: { in: ids } }, { limit: ids.length })
    const byId = new Map<number | string, LabBrowseItem>(items.map((item) => [item.id, item]))
    const picks = ids.flatMap((id) => {
      const item = byId.get(id)
      return item ? [featuredLabEntry(item)] : []
    })
    if (picks.length) return picks
  }

  const recent = await findLabItems(
    { id: { not_equals: page.id } },
    { limit: FEATURED_CLOSER_FALLBACK_LIMIT, sort: '-publishedAt' },
  )
  return recent.map(featuredLabEntry)
}
