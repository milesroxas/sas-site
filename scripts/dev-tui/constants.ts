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
/** Custom-format archives (`pg_dump -Fc`) — see scripts/dev-tui/pg-tools.ts. */
export const SNAPSHOT_FILE = 'snapshot.dump'
export const LOCAL_BACKUP_FILE = 'local-backup.dump'

/**
 * Where the snapshot lands inside the Postgres container. `pg_restore -j` needs
 * a seekable archive, so the dump is copied in rather than piped over stdin.
 */
export const CONTAINER_RESTORE_PATH = '/tmp/sas-dev-tui-restore.dump'

/**
 * Parallel `pg_restore` jobs. The restore is dominated by index and foreign-key
 * builds, so this is the main lever on wall-clock; 4 keeps it well inside the
 * container's default connection limit.
 */
export const RESTORE_JOBS = 4
