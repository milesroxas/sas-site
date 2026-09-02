import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** Repository root (parent of `scripts/`) */
export const PROJECT_ROOT = path.resolve(__dirname, '../..')

/**
 * Pinned Postgres image (server + bundled client tools). The pgvector build of
 * Postgres 18 — the Ask RAG embeddings need CREATE EXTENSION vector.
 * Bump the tag when you intentionally move to a newer minor/patch; keep in sync with `docker-compose.yml`.
 */
export const POSTGRES_DOCKER_IMAGE = 'pgvector/pgvector:pg18'

export const LOCAL_POSTGRES_DB = 'postgresql://postgres@127.0.0.1:54320/payload'

/**
 * File written by “Pull Vercel production env”. Deliberately NOT a name Next.js
 * auto-loads (`.env.production.local` would be picked up by `next build`/`start`
 * and point local prod-style runs at the production DB). Only the TUI reads it.
 */
export const VERCEL_PULL_ENV_FILE = '.env.production.pulled'
export const SNAPSHOT_REL_DIR = '.dev-tui'
/** Directory-format archive (`pg_dump -Fd -j`) — see scripts/dev-tui/pg-tools.ts. */
export const SNAPSHOT_DIR = 'snapshot.pgdir'
/** Custom-format archive (`pg_dump -Fc`); the local backup is small enough to stay one file. */
export const LOCAL_BACKUP_FILE = 'local-backup.dump'

/**
 * Where the snapshot lands inside the Postgres container. `pg_restore -j` needs
 * a seekable archive, so the dump is copied in rather than piped over stdin.
 */
export const CONTAINER_RESTORE_PATH = '/tmp/sas-dev-tui-restore'

/**
 * Parallel `pg_dump` / `pg_restore` jobs.
 *
 * Measured against production (2026-09-01): a serial `-Fc` dump took 112.5s, of
 * which 90.3s was schema-only — pg_dump's per-object catalog round-trips over
 * the WAN for ~470 tables / ~1700 indexes / ~800 foreign keys. Parallel jobs
 * hide the data phase entirely behind that floor (`-Fd -j 4` = 90.1s), so this
 * buys ~20% and the rest is object count, not bytes. Restore of the same
 * archive is ~2s serial, ~1.2s parallel — never the bottleneck.
 */
export const DUMP_JOBS = 4
export const RESTORE_JOBS = 4
