import config from '@payload-config'
import { getPayload } from 'payload'

/**
 * Deletes AI instruction rows (`plugin-ai-instructions`) so the next boot
 * re-seeds them from src/plugins/ai/seeds.ts. Data only: no schema change.
 *
 *   pnpm payload run scripts/reset-ai-instructions.ts                       # all rows
 *   pnpm payload run scripts/reset-ai-instructions.ts --like work-pages.meta # by schema-path prefix
 *
 * Boot never updates existing rows, so run this after editing seeds. Edits
 * made in the AI Instructions admin collection are lost for deleted rows.
 */

const likeIndex = process.argv.indexOf('--like')
const like = likeIndex > -1 ? process.argv[likeIndex + 1] : undefined
if (likeIndex > -1 && !like) {
  console.error('--like needs a schema-path fragment, e.g. --like work-pages.meta')
  process.exit(1)
}

const payload = await getPayload({ config })

const { docs, errors } = await payload.delete({
  collection: 'plugin-ai-instructions',
  where: like ? { 'schema-path': { like } } : { id: { exists: true } },
})

if (errors.length > 0) {
  payload.logger.error({ msg: 'reset-ai-instructions: some deletes failed', errors })
  process.exit(1)
}
payload.logger.info(`Deleted ${docs.length} AI instruction row(s). Restart dev to re-seed.`)
process.exit(0)
