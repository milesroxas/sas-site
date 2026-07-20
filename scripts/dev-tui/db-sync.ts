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
  localRestorePayloadFromSqlFile,
  pgDumpLocalComposeToFile,
  pgDumpRemoteDockerToFile,
} from './pg-tools'

export type SyncResult = { ok: true; messages: string[] } | { ok: false; messages: string[] }

/**
 * Dump production, replace local `payload` database (Docker on 54320).
 * Uses Docker for pg_dump/psql so client versions match servers (avoids Homebrew pg_dump mismatch).
 */
export async function syncProductionToLocal(productionUrl: string): Promise<SyncResult> {
  const messages: string[] = []

  const dir = path.join(PROJECT_ROOT, SNAPSHOT_REL_DIR)
  await fs.mkdir(dir, { recursive: true })
  const snapshotPath = path.join(dir, SNAPSHOT_FILE)
  const backupPath = path.join(dir, LOCAL_BACKUP_FILE)

  try {
    await pgDumpLocalComposeToFile(backupPath)
    messages.push(`Local DB backed up: ${path.relative(PROJECT_ROOT, backupPath)}`)
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    messages.push(`Local backup skipped: ${msg}`)
  }

  try {
    await pgDumpRemoteDockerToFile(productionUrl, snapshotPath)
    messages.push(`Production dump: ${path.relative(PROJECT_ROOT, snapshotPath)}`)
  } catch (e) {
    const err = e as { stderr?: string; shortMessage?: string; message?: string }
    return {
      ok: false,
      messages: [
        ...messages,
        `pg_dump (production) failed: ${err.stderr || err.shortMessage || err.message || String(e)}`,
        `First run may pull Docker image ${POSTGRES_DOCKER_IMAGE}; ensure Docker can reach the internet.`,
      ],
    }
  }

  try {
    await localDropAndCreatePayloadDb()
    await localRestorePayloadFromSqlFile(snapshotPath)
  } catch (e) {
    const err = e as { stderr?: string; shortMessage?: string; message?: string }
    return {
      ok: false,
      messages: [
        ...messages,
        `Restore to local failed: ${err.stderr || err.shortMessage || err.message || String(e)}`,
        'Try: pnpm db:up — then pnpm payload migrate if the DB is empty.',
      ],
    }
  }

  messages.push('Done. Local `payload` database matches the production dump.')
  messages.push(
    'Env files are unchanged — use “Dev server — local Docker DB” to run against the imported data.',
  )
  return { ok: true, messages }
}
