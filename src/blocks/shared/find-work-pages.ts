import configPromise from '@payload-config'
import { draftMode } from 'next/headers'
import { getPayload } from 'payload'
import type { WorkPage } from '@/payload-types'

/**
 * Batch-load the work pages a block's editor selected, keyed by id.
 *
 * Outside draft mode the query is restricted to published documents and runs
 * with access control on, so a page the editor picked but has not published
 * never reaches a public render. Blocks fall back to the (already populated)
 * selection for anything missing from the result.
 */
export async function findWorkPagesById(
  ids: (number | string)[],
): Promise<Map<number | string, WorkPage>> {
  if (!ids.length) return new Map()

  const { isEnabled: draft } = await draftMode()
  const payload = await getPayload({ config: configPromise })

  const { docs } = await payload.find({
    collection: 'work-pages',
    depth: 3,
    draft,
    limit: ids.length,
    overrideAccess: draft,
    pagination: false,
    where: {
      id: { in: ids },
      ...(draft ? {} : { _status: { equals: 'published' } }),
    },
  })

  return new Map(docs.map((doc) => [doc.id, doc]))
}
