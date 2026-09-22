/**
 * `pnpm ci` runs `payload migrate` before every Vercel build. Preview deploys
 * are supposed to receive a Neon branch (`preview/<git-branch>`) through the
 * Neon deployment action on the Vercel store connection, but the stored
 * connection variables still point at production. If that action is skipped
 * (CLI deploy, action disabled, integration hiccup) the build would migrate
 * production instead of the branch.
 *
 * This refuses to continue when a non-production Vercel build sees the
 * production endpoint. `PRODUCTION_DB_ENDPOINT` is the Neon endpoint id of the
 * production branch (`ep-...`), set as a plain Vercel env var for every
 * environment. Outside Vercel (local `pnpm ci`, CI without VERCEL_ENV) it is a
 * no-op.
 */

const vercelEnv = process.env.VERCEL_ENV
const productionEndpoint = process.env.PRODUCTION_DB_ENDPOINT
const url = process.env.POSTGRES_URL

if (!vercelEnv || vercelEnv === 'production') {
  process.exit(0)
}

if (!productionEndpoint) {
  console.error(
    `guard-preview-db: PRODUCTION_DB_ENDPOINT is not set for VERCEL_ENV=${vercelEnv}. Refusing to migrate an unknown database.`,
  )
  process.exit(1)
}

let host = ''
try {
  host = url ? new URL(url).hostname : ''
} catch {
  host = ''
}

if (!host) {
  console.error(
    `guard-preview-db: POSTGRES_URL is missing or malformed for VERCEL_ENV=${vercelEnv}. The Neon deployment action did not inject a branch connection.`,
  )
  process.exit(1)
}

if (host.startsWith(`${productionEndpoint}.`) || host.startsWith(`${productionEndpoint}-`)) {
  console.error(
    `guard-preview-db: VERCEL_ENV=${vercelEnv} is pointed at the production Neon endpoint (${productionEndpoint}). ` +
      'The Neon deployment action for preview did not run, so this build would migrate production. Aborting. ' +
      'Create preview deployments from the `preview` git branch (Vercel dashboard, Create Deployment) and confirm the Neon action is enabled for Preview on the store connection.',
  )
  process.exit(1)
}

console.log(`guard-preview-db: VERCEL_ENV=${vercelEnv} is using ${host}, not production.`)
