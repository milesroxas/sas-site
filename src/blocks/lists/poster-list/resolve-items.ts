import { presentFacts } from '@/blocks/lists/featured-work/entry'
import { findRecentWorkPages, findWorkPagesById } from '@/blocks/shared/find-work-pages'
import { resolveWorkEntry, type WorkEntry } from '@/blocks/shared/resolve-work-entry'
import { resolveCmsLinkHref } from '@/components/Link/resolve-href'
import type { Media, PosterListBlock, WorkPage } from '@/payload-types'
import { populatedDoc, relationshipIds } from '@/utilities/relationshipId'
import type { PosterItem } from './item'

/** Work pages a collection list shows when the editor picked none. */
const RECENT_WORK_LIMIT = 8

const workPoster = (entry: WorkEntry): PosterItem => ({
  id: `work-${entry.id}`,
  title: entry.title,
  facts: presentFacts([entry.client, entry.industry]),
  description: entry.summary ?? '',
  visual: entry.visual,
  href: entry.href,
})

/**
 * Picked Work pages in the editor's order, published only outside draft mode
 * (`findWorkPagesById`); none picked, or none of them public, falls back to
 * the most recently published.
 */
async function workPosters(selected: NonNullable<PosterListBlock['workPages']>) {
  const ids = relationshipIds(selected)
  if (ids.length) {
    const byId = await findWorkPagesById(ids)
    const picked = ids
      .map((id) => byId.get(id))
      .filter((page): page is WorkPage => Boolean(page))
      .map(resolveWorkEntry)
      .filter((entry): entry is WorkEntry => entry !== null)
    if (picked.length) return picked.map(workPoster)
  }
  const recent = await findRecentWorkPages({ limit: RECENT_WORK_LIMIT })
  return recent
    .map(resolveWorkEntry)
    .filter((entry): entry is WorkEntry => entry !== null)
    .map(workPoster)
}

/** Presentation-ready posters for either source. */
export async function resolvePosterItems(
  block: Pick<PosterListBlock, 'items' | 'itemSource' | 'workPages'>,
): Promise<PosterItem[]> {
  if (block.itemSource === 'collection') return workPosters(block.workPages ?? [])
  return (block.items ?? []).map((item, i) => {
    const media = populatedDoc<Media>(item.media)
    return {
      id: item.id ?? `item-${i}`,
      title: item.title,
      facts: [],
      description: item.description,
      visual: media ? { kind: 'media', media } : null,
      href: item.enableLink && item.link ? resolveCmsLinkHref(item.link) : null,
    }
  })
}
