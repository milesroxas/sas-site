import configPromise from '@payload-config'
import { getPayload } from 'payload'

export const getPublishedLabPageCards = async ({ limit = 100 }: { limit?: number } = {}) => {
  const payload = await getPayload({ config: configPromise })
  return payload.find({
    collection: 'lab-pages',
    draft: false,
    overrideAccess: false,
    depth: 2,
    sort: '-featured,-publishedAt',
    limit,
    select: { title: true, slug: true, labProject: true, coverAsset: true, featured: true },
  })
}
