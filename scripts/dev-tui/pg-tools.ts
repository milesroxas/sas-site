import { execa } from 'execa'
import {
  CONTAINER_RESTORE_PATH,
  POSTGRES_DOCKER_IMAGE,
  PROJECT_ROOT,
  RESTORE_JOBS,
} from './constants'

/**
 * Dumps use the custom format (`-Fc`) so the restore can run `pg_restore -j`:
 * this schema is ~470 tables / ~1700 indexes / ~800 foreign keys for only a few
 * thousand rows, so restore wall-clock is index and constraint builds, not data
 * volume, and those are what parallel restore overlaps. Custom format is also
 * binary — every dump streams straight to a file rather than through a JS
 * string, and it sidesteps the `\restrict` / `SET transaction_timeout` lines a
 * PG 18 client emits into plain SQL for an older server.
 */

/**
 * Dump local Docker `payload` DB using the **container’s** pg_dump (matches server version).
 */
export async function pgDumpLocalComposeToFile(outPath: string): Promise<void> {
  await execa(
    'docker',
    [
      'compose',
      'exec',
      '-T',
      'postgres',
      'pg_dump',
      '-U',
      'postgres',
      '-Fc',
      '--no-owner',
      '--no-acl',
      'payload',
    ],
    {
      cwd: PROJECT_ROOT,
      timeout: 600_000,
      stdout: { file: outPath },
    },
  )
}

/** Dump a remote DB using the same official image as `POSTGRES_DOCKER_IMAGE` (bundled pg_dump). */
export async function pgDumpRemoteDockerToFile(
  connectionUri: string,
  outPath: string,
): Promise<void> {
  await execa(
    'docker',
    [
      'run',
      '--rm',
      POSTGRES_DOCKER_IMAGE,
      'pg_dump',
      connectionUri,
      '-Fc',
      '--no-owner',
      '--no-acl',
    ],
    {
      cwd: PROJECT_ROOT,
      timeout: 600_000,
      stdout: { file: outPath },
    },
  )
}

async function psqlComposeExec(psqlArgs: string[]): Promise<void> {
  const r = await execa(
    'docker',
    ['compose', 'exec', '-T', 'postgres', 'psql', '-U', 'postgres', ...psqlArgs],
    {
      cwd: PROJECT_ROOT,
      timeout: 600_000,
      reject: false,
    },
  )
  if (r.exitCode !== 0) {
    const err = r.stderr || r.stdout
    throw new Error(err || `psql exited with ${r.exitCode}`)
  }
}

export async function localDropAndCreatePayloadDb(): Promise<void> {
  await psqlComposeExec([
    '-d',
    'postgres',
    '-v',
    'ON_ERROR_STOP=1',
    '-c',
    'DROP DATABASE IF EXISTS payload WITH (FORCE);',
  ])
  await psqlComposeExec([
    '-d',
    'postgres',
    '-v',
    'ON_ERROR_STOP=1',
    '-c',
    'CREATE DATABASE payload;',
  ])
}

/**
 * Restore a custom-format dump into the local `payload` database.
 *
 * Parallel restore needs a seekable archive, so the dump is copied into the
 * container rather than piped over stdin. `--exit-on-error` keeps the strictness
 * `ON_ERROR_STOP=1` gave the old plain-SQL path.
 */
export async function localRestorePayloadFromDumpFile(dumpPath: string): Promise<void> {
  await execa('docker', ['compose', 'cp', dumpPath, `postgres:${CONTAINER_RESTORE_PATH}`], {
    cwd: PROJECT_ROOT,
    timeout: 600_000,
  })

  try {
    const r = await execa(
      'docker',
      [
        'compose',
        'exec',
        '-T',
        'postgres',
        'pg_restore',
        '-U',
        'postgres',
        '-d',
        'payload',
        '--no-owner',
        '--no-acl',
        '--exit-on-error',
        '-j',
        String(RESTORE_JOBS),
        CONTAINER_RESTORE_PATH,
      ],
      {
        cwd: PROJECT_ROOT,
        timeout: 600_000,
        reject: false,
      },
    )
    if (r.exitCode !== 0) {
      throw new Error(r.stderr || r.stdout || `pg_restore exited with ${r.exitCode}`)
    }
  } finally {
    await execa(
      'docker',
      ['compose', 'exec', '-T', 'postgres', 'rm', '-f', CONTAINER_RESTORE_PATH],
      { cwd: PROJECT_ROOT, reject: false, timeout: 60_000 },
    )
  }
}
