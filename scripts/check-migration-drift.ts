/**
 * `pnpm check:migrations:drift` — does the newest migration snapshot match the
 * current Payload schema?
 *
 * `payload migrate:create` diffs the CURRENT config against the newest
 * `src/migrations/*.json` snapshot — never against a database. Two failure
 * modes hide in that:
 *
 * 1. A field added after the branch's migration was generated: local drizzle
 *    push syncs the column, the migration never carries it, prod prerender
 *    dies on `column does not exist`.
 * 2. Parallel workspaces (Conductor): branches A and B each generate a
 *    migration from the same base snapshot. After both merge, the newest
 *    snapshot lacks the other branch's changes, so the next `migrate:create`
 *    re-emits them and CI's `payload migrate` fails on `already exists`.
 *
 * Both surface as "migrate:create would emit statements". This runs the exact
 * same diff (drizzle-kit `generateMigration` against the newest snapshot) with
 * no database connection and no file writes, and fails if anything would be
 * emitted.
 *
 * Fix: if the branch owns the change, ask, then `pnpm migrate:create <name>`.
 * If main gained a migration after yours was generated: rebase, delete your
 * migration (`.ts` + `.json`), regenerate so its snapshot includes main's.
 * See docs/conductor.md → "Schema changes across workspaces".
 *
 * If drizzle prompts (create vs rename) the answer does not matter here — a
 * prompt already means the snapshot and the config disagree.
 *
 * Usage:
 *   pnpm check:migrations:drift
 */
import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import type { VercelPostgresAdapter } from '@payloadcms/db-vercel-postgres'
import { getPayload } from 'payload'
import config from '../src/payload.config'

async function main(): Promise<void> {
  // No DB connection, no onInit hooks — only the adapter's schema build runs.
  const payload = await getPayload({ config, disableDBConnect: true, disableOnInit: true })
  const db = payload.db as unknown as VercelPostgresAdapter
  const { generateDrizzleJson, generateMigration, upSnapshot } = db.requireDrizzleKit()
  type Snapshot = Awaited<ReturnType<typeof generateDrizzleJson>>

  const current = await generateDrizzleJson(db.schema)

  const snapshots = (await readdir(db.migrationDir)).filter((f) => f.endsWith('.json')).sort()
  const latest = snapshots.at(-1)
  let previous = db.defaultDrizzleSnapshot as Snapshot
  if (latest) {
    previous = JSON.parse(await readFile(path.join(db.migrationDir, latest), 'utf8')) as Snapshot
    if (upSnapshot && previous.version < current.version) {
      previous = upSnapshot(previous)
    }
  }

  const statements = await generateMigration(previous, current)
  const label = latest ?? '(no snapshot — empty baseline)'

  if (statements.length === 0) {
    console.info(`✓ Migration drift check passed — schema matches ${label}`)
    return
  }

  console.error(`✖ Migration drift: the Payload schema differs from the newest snapshot ${label}.`)
  console.error('  `pnpm migrate:create` would emit:\n')
  for (const statement of statements) console.error(`    ${statement}`)
  console.error(
    '\n  Branch owns the change → ask, then `pnpm migrate:create <name>`.' +
      '\n  Main gained a migration after yours → rebase, delete your .ts + .json, regenerate.' +
      '\n  See docs/conductor.md → "Schema changes across workspaces".\n',
  )
  process.exit(1)
}

main().catch((err: unknown) => {
  console.error(err)
  process.exit(2)
})
