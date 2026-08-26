import configPromise from '@payload-config'
import { getPayload } from 'payload'

/**
 * Pages for a "related items" block. The editor's manual selection wins; when
 * the block is set to match automatically, it is replaced by published pages
 * in the same collection that share a capability with this document. The
 * query is published-only and access-enforced, so a draft never surfaces in
 * the list, and the document never lists itself.
 */
export async function resolveRelatedPages<T>({
  automatic,
  capabilityIds,
  capabilityPath,
  collection,
  currentId,
  limit,
  manual,
}: {
  /** The block is set to `automatic-capability-match`. */
  automatic: boolean
  /** Capabilities of this document; no capabilities means no automatic match. */
  capabilityIds: (number | string)[]
  /** Dotted path to the capability relationship on the related collection. */
  capabilityPath: string
  collection: 'lab-pages' | 'work-pages'
  currentId: number
  limit: number
  manual: T[]
}): Promise<T[]> {
  if (!automatic || !capabilityIds.length) return manual.slice(0, limit)

  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection,
    overrideAccess: false,
    draft: false,
    depth: 2,
    limit,
    where: {
      and: [{ id: { not_equals: currentId } }, { [capabilityPath]: { in: capabilityIds } }],
    },
  })

  return result.docs.slice(0, limit) as T[]
}
