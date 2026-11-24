import { findRecentWorkPages, findWorkPagesById } from '@/blocks/shared/find-work-pages'
import { resolveWorkEntry, type WorkEntry } from '@/blocks/shared/resolve-work-entry'
import type { WorkPage } from '@/payload-types'
import { relationshipIds } from '@/utilities/relationshipId'
import { type FeaturedEntry, featuredWorkEntry } from './entry'

/**
 * Work-page closer: Related Work tab picks in order. Unpublished picks are
 * skipped (query-only — parent-populated drafts must not leak onto public
 * pages). If nothing is selected or nothing selected is public, the four
 * most recently published work pages (excluding this page).
 */
export async function resolveRelatedWorkEntries(page: WorkPage): Promise<FeaturedEntry[]> {
  const ids = relationshipIds(page.relatedWorkPages ?? [])
  if (ids.length) {
    const byId = await findWorkPagesById(ids)
    const entries = ids
      .map((id) => {
        const doc = byId.get(id)
        return doc ? resolveWorkEntry(doc) : null
      })
      .filter((entry): entry is WorkEntry => entry !== null)
    if (entries.length) return entries.map(featuredWorkEntry)
  }

  const recent = await findRecentWorkPages({ excludeId: page.id })
  return recent
    .map(resolveWorkEntry)
    .filter((entry): entry is WorkEntry => entry !== null)
    .map(featuredWorkEntry)
}
