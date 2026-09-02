import fs from 'node:fs/promises'
import path from 'node:path'
import {
  LOCAL_BACKUP_FILE,
  POSTGRES_DOCKER_IMAGE,
  PROJECT_ROOT,
  SNAPSHOT_FILE,
  SNAPSHOT_REL_DIR,
} from './constants'
import {
  localDropAndCreatePayloadDb,
  localRestorePayloadFromDumpFile,
  pgDumpLocalComposeToFile,
  pgDumpRemoteDockerToFile,
} from './pg-tools'

export type SyncResult = { ok: true; messages: string[] } | { ok: false; messages: string[] }

/**
 * Readable reason from a failed `execa` call: its captured stderr where there
 * is any, then its own summaries, then the raw value.
 */
const failureReason = (e: unknown): string => {
  const err = e as { stderr?: string; shortMessage?: string; message?: string }
  return err.stderr || err.shortMessage || err.message || String(e)
}

const snapshotDir = async (): Promise<string> => {
  const dir = path.join(PROJECT_ROOT, SNAPSHOT_REL_DIR)
  await fs.mkdir(dir, { recursive: true })
  return dir
}

/**
 * Dump the local Docker `payload` database to `.dev-tui/local-backup.dump`.
 *
 * Deliberately its own action rather than a step inside every production pull:
 * the pull already spends its time on the restore, and most pulls overwrite a
 * local DB that is itself a copy of production, so the backup was paying a full
 * extra dump to save nothing. Run it explicitly when local has work worth keeping.
 */
export async function backupLocalDatabase(): Promise<SyncResult> {
  const backupPath = path.join(await snapshotDir(), LOCAL_BACKUP_FILE)
  try {
    await pgDumpLocalComposeToFile(backupPath)
    return {
      ok: true,
      messages: [
        `Local DB backed up: ${path.relative(PROJECT_ROOT, backupPath)}`,
        'Restore it with: docker compose cp <file> postgres:/tmp/b.dump && docker compose exec -T postgres pg_restore -U postgres -d payload --clean /tmp/b.dump',
      ],
    }
  } catch (e) {
    return { ok: false, messages: [`pg_dump (local) failed: ${failureReason(e)}`] }
  }
}

/**
 * Dump production, replace local `payload` database (Docker on 54320).
 * Uses Docker for pg_dump/pg_restore so client versions match servers (avoids
 * Homebrew pg_dump mismatch). Local data is **not** backed up first — use
 * `backupLocalDatabase` (Database → Back up local Docker DB) when it matters.
 */
export async function syncProductionToLocal(productionUrl: string): Promise<SyncResult> {
  const messages: string[] = []
  const snapshotPath = path.join(await snapshotDir(), SNAPSHOT_FILE)

  try {
    await pgDumpRemoteDockerToFile(productionUrl, snapshotPath)
    messages.push(`Production dump: ${path.relative(PROJECT_ROOT, snapshotPath)}`)
  } catch (e) {
    return {
      ok: false,
      messages: [
        ...messages,
        `pg_dump (production) failed: ${failureReason(e)}`,
        `First run may pull Docker image ${POSTGRES_DOCKER_IMAGE}; ensure Docker can reach the internet.`,
      ],
    }
  }

  try {
    await localDropAndCreatePayloadDb()
    await localRestorePayloadFromDumpFile(snapshotPath)
  } catch (e) {
    return {
      ok: false,
      messages: [
        ...messages,
        `Restore to local failed: ${failureReason(e)}`,
        'Try: pnpm db:up — then pnpm dev to let Drizzle push rebuild the schema if the DB is empty.',
      ],
    }
  }

  messages.push('Done. Local `payload` database matches the production dump.')
  messages.push(
    'Env files are unchanged — use “Dev server — local Docker DB” to run against the imported data.',
  )
  return { ok: true, messages }
}
