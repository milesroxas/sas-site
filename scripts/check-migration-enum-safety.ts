/**
 * Check 1 — ADD VALUE then use:
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
 * Check 2 — unguarded text→enum cast:
 * Fails when `up()` casts an existing column to an enum type
 * (`SET DATA TYPE ... USING "col"::enum`) without an UPDATE on that column
 * earlier in the same `up()`. Drizzle generates the cast blind to data; any
 * production row outside the enum — including empty string '' — aborts
 * `payload migrate` in CI and every statement after it in the transaction.
 * Normalize first (e.g. lower/trim, then NULL anything not in the enum).
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

/** `ALTER TABLE "t" ALTER COLUMN "c" SET DATA TYPE ... USING "c"::enum` */
const ENUM_CAST_RE =
  /ALTER\s+TABLE\s+"([\w]+)"\s+ALTER\s+COLUMN\s+"([\w]+)"\s+SET\s+DATA\s+TYPE\s+[^;]*USING\s+[^;]*::/gi

/**
 * Migrations up to this timestamp are already applied to production (ledger
 * batch 28, 2026-08-12); check 2 only guards migrations created after it.
 */
const ENUM_CAST_CHECK_SINCE = '20260812_191458'

function checkAddValueThenUse(filePath: string, sql: string): string[] {
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
      .join(
        ', ',
      )}. Recreate the enum in one migration, or split ADD VALUE and use across two migrations.`,
  ]
}

function checkUnguardedEnumCast(filePath: string, sql: string): string[] {
  const errors: string[] = []
  for (const match of sql.matchAll(ENUM_CAST_RE)) {
    const [, table, column] = match
    if (!table || !column || match.index === undefined) continue
    const before = sql.slice(0, match.index)
    const guardRe = new RegExp(`UPDATE\\s+"${table}"\\s+SET\\s+"${column}"`, 'i')
    if (guardRe.test(before)) continue
    errors.push(
      `${path.relative(process.cwd(), filePath)}: "${table}"."${column}" is cast to an enum without a normalizing UPDATE first. Legacy production values outside the enum (including '') abort payload migrate in CI. Add before the cast: UPDATE "${table}" SET "${column}" = lower(btrim("${column}")); UPDATE "${table}" SET "${column}" = NULL WHERE "${column}" NOT IN (...enum values...); — and check real production values first.`,
    )
  }
  return errors
}

function isAfterEnumCastBaseline(filePath: string): boolean {
  const stamp = path.basename(filePath).match(/^(\d{8}_\d{6})/)?.[1]
  return stamp !== undefined && stamp > ENUM_CAST_CHECK_SINCE
}

function checkFile(filePath: string, source: string): string[] {
  const sql = extractUpSql(source)
  const errors = checkAddValueThenUse(filePath, sql)
  if (isAfterEnumCastBaseline(filePath)) {
    errors.push(...checkUnguardedEnumCast(filePath, sql))
  }
  return errors
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
