/**
 * Fails when a migration uses `ALTER TYPE ... ADD VALUE 'x'` and then uses that
 * new enum value in the same `up()` SQL (SET DEFAULT / USING / etc.).
 *
 * Payload wraps each migration `up()` in a transaction. Postgres forbids using a
 * newly added enum value until the adding transaction commits
 * ("unsafe use of new value").
 *
 * Safe alternatives in one migration:
 * - Recreate the enum (text → drop type → create type with full value list → cast back)
 * - Or split into two migrations (ADD VALUE commits first; next migration uses it)
 *
 * Usage:
 *   pnpm check:migrations
 *   pnpm exec tsx scripts/check-migration-enum-safety.ts [file...]
 */
import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const MIGRATIONS_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../src/migrations',
)

const ADD_VALUE_RE = /ADD\s+VALUE(?:\s+IF\s+NOT\s+EXISTS)?\s+'((?:\\'|[^'])*)'/gi
/** Uses of a literal that become unsafe once that literal was ADD VALUE'd. */
const USE_PATTERNS = [
  /SET\s+DEFAULT\s+'((?:\\'|[^'])*)'/gi,
  /USING\s+[^;]*'((?:\\'|[^'])*)'/gi,
  /\bVALUES\s*\([^;]*'((?:\\'|[^'])*)'/gi,
  /\bSET\s+"?[\w]+"?\s*=\s*'((?:\\'|[^'])*)'/gi,
]

function extractUpSql(source: string): string {
  const upStart = source.search(/export\s+async\s+function\s+up\s*\(/)
  if (upStart < 0) return source
  const afterUp = source.slice(upStart)
  const downStart = afterUp.search(/export\s+async\s+function\s+down\s*\(/)
  const upFn = downStart >= 0 ? afterUp.slice(0, downStart) : afterUp
  return [...upFn.matchAll(/sql`([\s\S]*?)`/g)].map((m) => m[1] ?? '').join('\n')
}

function collectMatches(sql: string, re: RegExp): string[] {
  const values: string[] = []
  for (const match of sql.matchAll(re)) {
    if (match[1] !== undefined) values.push(match[1])
  }
  return values
}

function checkFile(filePath: string, source: string): string[] {
  const sql = extractUpSql(source)
  const added = new Set(collectMatches(sql, ADD_VALUE_RE))
  if (added.size === 0) return []

  const used = new Set<string>()
  for (const re of USE_PATTERNS) {
    for (const value of collectMatches(sql, re)) used.add(value)
  }

  const conflicts = [...added].filter((value) => used.has(value))
  if (conflicts.length === 0) return []

  return [
    `${path.relative(process.cwd(), filePath)}: ADD VALUE then use in same migration (Postgres + Payload transaction): ${conflicts
      .map((v) => JSON.stringify(v))
      .join(', ')}. Recreate the enum in one migration, or split ADD VALUE and use across two migrations.`,
  ]
}

async function resolveTargets(argv: string[]): Promise<string[]> {
  if (argv.length > 0) {
    return argv.map((f) => path.resolve(f))
  }
  const entries = await readdir(MIGRATIONS_DIR)
  return entries
    .filter((name) => /^\d.+\.ts$/.test(name))
    .map((name) => path.join(MIGRATIONS_DIR, name))
}

async function main(): Promise<void> {
  const files = await resolveTargets(process.argv.slice(2))
  const errors: string[] = []

  for (const file of files) {
    const source = await readFile(file, 'utf8')
    errors.push(...checkFile(file, source))
  }

  if (errors.length > 0) {
    console.error('✖ Migration enum safety check failed:\n')
    for (const error of errors) console.error(`  ${error}\n`)
    console.error(
      'See README “Database & migrations” → Postgres enum ADD VALUE, or .cursor/rules/database-migrations.mdc.\n',
    )
    process.exit(1)
  }

  console.info(
    `✓ Migration enum safety check passed (${files.length} file${files.length === 1 ? '' : 's'})`,
  )
}

main().catch((err: unknown) => {
  console.error(err)
  process.exit(1)
})
