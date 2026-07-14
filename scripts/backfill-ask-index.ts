import config from '@payload-config'
import { getPayload } from 'payload'
import { syncSurfaceDoc } from '@/features/ask/indexSync'
import { ASK_MODEL_API_KEY_VAR } from '@/features/ask/model'
import { CONTENT_SURFACES } from '@/shared/content/surfaces'

/**
 * Rebuilds the ask_embeddings index from every published document on every
 * content surface. Run after enabling embeddings, changing the embedding
 * model or chunker, or whenever hook-driven sync may have drifted:
 *
 *   pnpm payload run scripts/backfill-ask-index.ts
 *
 * (The search-plugin index has its own rebuild: the Reindex button on the
 * Search collection in the admin, under System.)
 */

if (!process.env[ASK_MODEL_API_KEY_VAR]) {
  console.error(`${ASK_MODEL_API_KEY_VAR} is not set — cannot embed. Aborting.`)
  process.exit(1)
}

const payload = await getPayload({ config })

let total = 0
for (const surface of CONTENT_SURFACES) {
  const { docs } = await payload.find({
    collection: surface.collection,
    depth: 0,
    draft: false,
    limit: 500,
    pagination: false,
    where: { _status: { equals: 'published' } },
  })

  for (const doc of docs) {
    await syncSurfaceDoc(payload, surface, doc)
    total += 1
  }
  payload.logger.info({
    msg: 'ask backfill: surface done',
    surface: surface.collection,
    docs: docs.length,
  })
}

payload.logger.info({ msg: 'ask backfill complete', docs: total })
process.exit(0)
