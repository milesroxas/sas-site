import config from '@payload-config'
import { getPayload } from 'payload'
import { backfillAskIndex } from '@/features/ask/backfill'
import { ASK_MODEL_API_KEY_VAR } from '@/features/ask/model'

/**
 * Rebuilds the ask_embeddings index from every published document on every
 * content surface plus the global surfaces (home, index heroes, site info).
 * Chunks whose text is already stored keep their vectors, so a re-run after
 * an extractor change only embeds what actually changed. Run after enabling
 * embeddings, changing the embedding model or chunker, or whenever
 * hook-driven sync may have drifted:
 *
 *   pnpm exec tsx --env-file=.env scripts/backfill-ask-index.ts
 *
 * Against production, override POSTGRES_URL from the pulled prod env and
 * keep schema push off (see src/features/ask/README.md). The same pass runs
 * from the admin: Site Info › Ask › Rebuild index.
 *
 * (The search-plugin index has its own rebuild: the Reindex button on the
 * Search collection in the admin, under System.)
 */

if (!process.env[ASK_MODEL_API_KEY_VAR]) {
  console.error(`${ASK_MODEL_API_KEY_VAR} is not set — cannot embed. Aborting.`)
  process.exit(1)
}

const payload = await getPayload({ config })
const summary = await backfillAskIndex(payload)
process.exit(summary.failures.length > 0 ? 1 : 0)
