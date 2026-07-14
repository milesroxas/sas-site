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

export const LOCAL_POSTGRES_BASE = 'postgresql://postgres@127.0.0.1:54320/postgres'
export const LOCAL_POSTGRES_DB = 'postgresql://postgres@127.0.0.1:54320/payload'

/** Env file the sync flow reads by default (must contain POSTGRES_URL). */
export const DEFAULT_SYNC_ENV_FILE = '.env.local'

/** File written by “Pull Vercel production env” (kept separate so pull does not replace all of .env.local). */
export const VERCEL_PULL_ENV_FILE = '.env.production.local'
export const SNAPSHOT_REL_DIR = '.dev-tui'
export const SNAPSHOT_FILE = 'snapshot.sql'
export const LOCAL_BACKUP_FILE = 'local-backup.sql'
