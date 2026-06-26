import fs from 'node:fs/promises'
import { execa } from 'execa'
import { POSTGRES_DOCKER_IMAGE, PROJECT_ROOT } from './constants'

const maxBuffer = 1024 * 1024 * 500

/**
 * Dump local Docker `payload` DB using the **container’s** pg_dump (matches server version).
 */
export async function pgDumpLocalComposeToFile(outPath: string): Promise<void> {
  const { stdout } = await execa(
    'docker',
    [
      'compose',
      'exec',
      '-T',
      'postgres',
      'pg_dump',
      '-U',
      'postgres',
      '--no-owner',
      '--no-acl',
      'payload',
    ],
    {
      cwd: PROJECT_ROOT,
      timeout: 600_000,
      maxBuffer,
    },
  )
  await fs.writeFile(outPath, stdout, 'utf8')
}

/** Dump a remote DB using the same official image as `POSTGRES_DOCKER_IMAGE` (bundled pg_dump). */
export async function pgDumpRemoteDockerToFile(
  connectionUri: string,
  outPath: string,
): Promise<void> {
  const { stdout } = await execa(
    'docker',
    ['run', '--rm', POSTGRES_DOCKER_IMAGE, 'pg_dump', connectionUri, '--no-owner', '--no-acl'],
    {
      cwd: PROJECT_ROOT,
      timeout: 600_000,
      maxBuffer,
    },
  )
  await fs.writeFile(outPath, stdout, 'utf8')
}

async function psqlComposeExec(psqlArgs: string[], input?: string | Uint8Array): Promise<void> {
  const flags = input !== undefined ? '-i' : '-T'
  const r = await execa(
    'docker',
    ['compose', 'exec', flags, 'postgres', 'psql', '-U', 'postgres', ...psqlArgs],
    {
      cwd: PROJECT_ROOT,
      input,
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
 * pg_dump from PG 17+ emits `SET transaction_timeout = ...`, which older servers reject on restore.
 * Stripping it is safe here (dump uses 0 = no timeout; omitting matches default restore behavior).
 */
function sanitizePgDumpPlainSqlForLocalRestore(sql: string): string {
  const dropLine = (line: string) => (/^\s*SET\s+transaction_timeout\s*=/i.test(line) ? '' : line)
  return sql.split('\n').map(dropLine).join('\n')
}

export async function localRestorePayloadFromSqlFile(sqlPath: string): Promise<void> {
  const raw = await fs.readFile(sqlPath, 'utf8')
  const body = sanitizePgDumpPlainSqlForLocalRestore(raw)
  await psqlComposeExec(['-d', 'payload', '-v', 'ON_ERROR_STOP=1', '-f', '-'], body)
}
