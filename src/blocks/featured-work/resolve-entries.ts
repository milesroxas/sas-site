import { findRecentWorkPages, findWorkPagesById } from '@/blocks/shared/find-work-pages'
import { resolveWorkEntry, type WorkEntry } from '@/blocks/shared/resolve-work-entry'
import type { WorkPage } from '@/payload-types'
import { populatedDoc, relationshipIds } from '@/utilities/relationshipId'

/**
 * Presentation-ready entries for a featured-work list, in the editor's
 * selected order. Unpublished picks are dropped outside draft mode; the
 * already-populated selection stands in only when the batch query missed a
 * doc that the parent already loaded (live preview).
 */
export async function resolveFeaturedWorkEntries(
  selected: (number | WorkPage)[],
): Promise<WorkEntry[]> {
  if (selected.length === 0) return []

  const ids = relationshipIds(selected)
  const byId = await findWorkPagesById(ids)

  return ids
    .map((entryId) => {
      const fromQuery = byId.get(entryId)
      if (fromQuery) return resolveWorkEntry(fromQuery)

      const fromSelection = selected.find(
        (entry): entry is WorkPage => populatedDoc<WorkPage>(entry)?.id === entryId,
      )
      return fromSelection ? resolveWorkEntry(fromSelection) : null
    })
    .filter((entry): entry is WorkEntry => entry !== null)
}

/**
 * Work-page closer: Related Work tab picks in order. Unpublished picks are
 * skipped (query-only — parent-populated drafts must not leak onto public
 * pages). If nothing is selected or nothing selected is public, the four
 * most recently published work pages (excluding this page).
 */
export async function resolveRelatedWorkEntries(page: WorkPage): Promise<WorkEntry[]> {
  const ids = relationshipIds(page.relatedWorkPages ?? [])
  if (ids.length) {
    const byId = await findWorkPagesById(ids)
    const entries = ids
      .map((id) => {
        const doc = byId.get(id)
        return doc ? resolveWorkEntry(doc) : null
      })
      .filter((entry): entry is WorkEntry => entry !== null)
    if (entries.length) return entries
  }

  const recent = await findRecentWorkPages({ excludeId: page.id })
  return recent.map(resolveWorkEntry).filter((entry): entry is WorkEntry => entry !== null)
}
