import configPromise from '@payload-config'
import { getPayload } from 'payload'

export const getPublishedWorkPageCards = async ({ limit = 100 }: { limit?: number } = {}) => {
  const payload = await getPayload({ config: configPromise })
  return payload.find({
    collection: 'work-pages',
    draft: false,
    overrideAccess: false,
    depth: 2,
    limit,
    sort: '-featured,-publishedAt',
    select: { title: true, slug: true, caseStudy: true, coverAsset: true, featured: true },
  })
}
