import configPromise from '@payload-config'
import { getPayload, type Where } from 'payload'
import {
  toWorksBrowseItems,
  WORKS_BROWSE_QUERY,
  type WorksBrowseItem,
} from '@/sections/WorksBrowse/queries'

/** Rows the automatic match fills on a segment page's related-work list. */
const RELATED_WORK_LIMIT = 4

/**
 * Work pages as index rows, the shape the related-work list shares with the
 * works index. Published-only and access-enforced (`WORKS_BROWSE_QUERY`), so a
 * page an editor picked but has not published never reaches a public render.
 */
const findRelatedWork = async (
  where: Where,
  limit: number,
  sort = '-featured,-publishedAt',
): Promise<WorksBrowseItem[]> => {
  const payload = await getPayload({ config: configPromise })
  const { docs } = await payload.find({ ...WORKS_BROWSE_QUERY, limit, sort, where })
  return toWorksBrowseItems(docs)
}

/** The editor's manual picks, in the order they were picked. */
export const getRelatedWorkByIds = async (ids: (number | string)[]): Promise<WorksBrowseItem[]> => {
  if (!ids.length) return []
  const rank = new Map(ids.map((id, index) => [id, index]))
  const items = await findRelatedWork({ id: { in: ids } }, ids.length)
  return items.sort((a, b) => (rank.get(a.id) ?? 0) - (rank.get(b.id) ?? 0))
}

export const getRelatedWorkByCapabilities = async (
  capabilityIds: (number | string)[],
  limit = RELATED_WORK_LIMIT,
): Promise<WorksBrowseItem[]> => {
  if (!capabilityIds.length) return []
  return findRelatedWork({ 'caseStudy.featuredCapabilities': { in: capabilityIds } }, limit)
}

export const getRelatedWorkByIndustries = async (
  industryIds: (number | string)[],
  limit = RELATED_WORK_LIMIT,
): Promise<WorksBrowseItem[]> => {
  if (!industryIds.length) return []
  const payload = await getPayload({ config: configPromise })
  const studies = await payload.find({
    collection: 'case-studies',
    draft: false,
    overrideAccess: false,
    depth: 0,
    limit: 200,
    pagination: false,
    where: { 'project.industries': { in: industryIds } },
    select: { title: true },
  })
  const studyIds = studies.docs.map((doc) => doc.id)
  if (!studyIds.length) return []
  return findRelatedWork({ caseStudy: { in: studyIds } }, limit)
}
