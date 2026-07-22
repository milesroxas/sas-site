/**
 * `pnpm migrate:status` — reports the PRODUCTION migration ledger.
 *
 * Why prod-only: `migrate:status` answers "which migration files have run on
 * this database?" That question is only meaningful for a migration-managed DB.
 * The local dev DB is built by Drizzle push and never runs migrations, so its
 * ledger is always empty (every row "No") — pure noise. This script points the
 * command at production so the output is real: "No" = committed but not yet
 * deployed, "Yes" = applied by CI.
 *
 * Read-only: `migrate:status` never mutates. `PAYLOAD_DB_PUSH=false` is set as a
 * belt-and-braces guard so nothing can push against production.
 *
 * Needs the Vercel-pulled prod env (`.env.production.pulled`). If it is missing,
 * run the dev TUI's "Pull Vercel production env" first (`pnpm dev:tui`).
 */
import { execa } from 'execa'
import { PROJECT_ROOT } from './dev-tui/constants'
import { maskPostgresUrlForDisplay, readProductionUrls } from './dev-tui/env'

async function main(): Promise<void> {
  const prod = await readProductionUrls()
  if ('error' in prod) {
    console.error(`\n✗ Cannot read production env: ${prod.error}\n`)
    process.exit(1)
  }

  console.info(
    `\n▶ migrate:status against PRODUCTION (${maskPostgresUrlForDisplay(prod.runtimeUrl)})` +
      '\n  Read-only — reports the prod migration ledger. The local (push) DB is not shown here.\n',
  )

  const r = await execa('pnpm', ['exec', 'payload', 'migrate:status'], {
    cwd: PROJECT_ROOT,
    stdio: 'inherit',
    reject: false,
    env: { ...process.env, POSTGRES_URL: prod.runtimeUrl, PAYLOAD_DB_PUSH: 'false' },
  })
  process.exit(r.exitCode ?? 1)
}

void main()
