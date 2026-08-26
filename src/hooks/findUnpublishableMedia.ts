import type { PayloadRequest } from 'payload'
import type { Media } from '@/payload-types'

/**
 * Publish gate for the media a page references: loads every asset by id and
 * returns the first one `isPublishable` rejects, or undefined when they all
 * pass. Callers own the failure message, since what disqualifies an asset
 * differs per collection.
 */
export async function findUnpublishableMedia({
  ids,
  isPublishable,
  req,
}: {
  ids: (number | string)[]
  isPublishable: (asset: Media) => boolean
  req: PayloadRequest
}): Promise<Media | undefined> {
  if (!ids.length) return undefined
  const media = await req.payload.find({
    collection: 'media',
    depth: 0,
    limit: ids.length,
    pagination: false,
    where: { id: { in: ids } },
    req,
  })
  return media.docs.find((asset) => !isPublishable(asset))
}
