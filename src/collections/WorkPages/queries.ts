import configPromise from '@payload-config'
import { getPayload, type Where } from 'payload'
import type { WorkPageCardData } from '@/components/WorkPageCard'

const workPageCardArgs = {
  collection: 'work-pages',
  draft: false,
  overrideAccess: false,
  depth: 2,
  sort: '-featured,-publishedAt',
  select: { title: true, slug: true, caseStudy: true, coverAsset: true, featured: true },
} as const

const findWorkPageCards = async (where: Where, limit: number): Promise<WorkPageCardData[]> => {
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({ ...workPageCardArgs, limit, where })
  return result.docs
}

export const getWorkPageCardsByCapabilities = async (
  capabilityIds: number[],
  limit = 4,
): Promise<WorkPageCardData[]> => {
  if (!capabilityIds.length) return []
  return findWorkPageCards({ 'caseStudy.featuredCapabilities': { in: capabilityIds } }, limit)
}

export const getWorkPageCardsByIndustries = async (
  industryIds: number[],
  limit = 4,
): Promise<WorkPageCardData[]> => {
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
  return findWorkPageCards({ caseStudy: { in: studyIds } }, limit)
}
