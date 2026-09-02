import fs from 'node:fs/promises'
import path from 'node:path'
import { execa } from 'execa'
import {
  CONTAINER_RESTORE_PATH,
  DUMP_JOBS,
  POSTGRES_DOCKER_IMAGE,
  PROJECT_ROOT,
  RESTORE_JOBS,
} from './constants'

/**
 * Dumps are binary archives rather than plain SQL: the production dump uses the
 * directory format so `pg_dump -j` can run, the restore uses `pg_restore -j`,
 * and neither streams through a JS string. Binary format also sidesteps the
 * `\restrict` / `SET transaction_timeout` lines a PG 18 client writes into plain
 * SQL for an older server (production is PG 17, this image is PG 18).
 *
 * See `DUMP_JOBS` in ./constants for what the parallelism does and does not buy.
 */

/**
 * Dump local Docker `payload` DB using the **container’s** pg_dump (matches server
 * version). Single-file custom format — the local dump is ~0.7s, so the
 * directory format's extra moving parts would buy nothing.
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

/**
 * Dump a remote DB using the same official image as `POSTGRES_DOCKER_IMAGE`
 * (bundled pg_dump). The output directory's parent is bind-mounted so pg_dump's
 * parallel workers write straight to the host — `-Fd` cannot write to stdout.
 */
export async function pgDumpRemoteDockerToDir(
  connectionUri: string,
  outDir: string,
): Promise<void> {
  // pg_dump -Fd refuses a non-empty target directory.
  await fs.rm(outDir, { recursive: true, force: true })

  const parent = path.dirname(outDir)
  const name = path.basename(outDir)
  await execa(
    'docker',
    [
      'run',
      '--rm',
      '-v',
      `${parent}:/dump`,
      POSTGRES_DOCKER_IMAGE,
      'pg_dump',
      connectionUri,
      '-Fd',
      '-j',
      String(DUMP_JOBS),
      '--no-owner',
      '--no-acl',
      '-f',
      `/dump/${name}`,
    ],
    {
      cwd: PROJECT_ROOT,
      timeout: 900_000,
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
 * Restore a directory-format dump into the local `payload` database.
 *
 * Parallel restore needs a seekable archive, so the dump is copied into the
 * container rather than piped over stdin. `--exit-on-error` keeps the strictness
 * `ON_ERROR_STOP=1` gave the old plain-SQL path.
 */
export async function localRestorePayloadFromDumpDir(dumpDir: string): Promise<void> {
  await execa(
    'docker',
    ['compose', 'exec', '-T', 'postgres', 'rm', '-rf', CONTAINER_RESTORE_PATH],
    { cwd: PROJECT_ROOT, reject: false, timeout: 60_000 },
  )
  await execa('docker', ['compose', 'cp', dumpDir, `postgres:${CONTAINER_RESTORE_PATH}`], {
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
      ['compose', 'exec', '-T', 'postgres', 'rm', '-rf', CONTAINER_RESTORE_PATH],
      { cwd: PROJECT_ROOT, reject: false, timeout: 60_000 },
    )
  }
}
