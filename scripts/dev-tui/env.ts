import fs from 'node:fs/promises'
import path from 'node:path'
import { DEFAULT_SYNC_ENV_FILE, PROJECT_ROOT, VERCEL_PULL_ENV_FILE } from './constants'

/** Order for resolving POSTGRES_URL when importing remote data (Vercel pull first, then local overrides, then `.env`). */
export const REMOTE_IMPORT_POSTGRES_URL_CHAIN = [
  VERCEL_PULL_ENV_FILE,
  DEFAULT_SYNC_ENV_FILE,
  '.env',
] as const

/**
 * Walk env files in order: skip missing files; use the first file that contains `POSTGRES_URL`.
 */
export async function readPostgresUrlFromEnvChain(
  relativePaths: readonly string[],
): Promise<{ path: string; url: string } | { error: string }> {
  const notes: string[] = []
  for (const rel of relativePaths) {
    const resolved = path.join(PROJECT_ROOT, rel)
    try {
      const text = await fs.readFile(resolved, 'utf8')
      const url = parseEnvValue(text, 'POSTGRES_URL')
      if (url?.trim()) {
        return { path: resolved, url: url.trim() }
      }
      notes.push(`${rel}: no POSTGRES_URL`)
    } catch (e) {
      const err = e as { code?: string }
      if (err.code === 'ENOENT') {
        notes.push(`${rel}: missing`)
        continue
      }
      const msg = e instanceof Error ? e.message : String(e)
      return { error: `Cannot read file: ${resolved} (${msg})` }
    }
  }
  return {
    error: `No POSTGRES_URL found. Tried in order: ${relativePaths.join(' → ')}. (${notes.join('; ')})`,
  }
}

/**
 * Parse a KEY=value line from dotenv-style content (handles optional quotes).
 */
export function parseEnvValue(content: string, key: string): string | undefined {
  for (const raw of content.split(/\r?\n/)) {
    const line = raw.trim()
    if (!line || line.startsWith('#')) continue
    const eq = line.indexOf('=')
    if (eq === -1) continue
    const k = line.slice(0, eq).trim()
    if (k !== key) continue
    let v = line.slice(eq + 1).trim()
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1)
    }
    return v
  }
  return undefined
}

export async function readPostgresUrlFromFile(
  relativeOrAbsolute: string,
): Promise<{ path: string; url: string } | { error: string }> {
  const resolved = path.isAbsolute(relativeOrAbsolute)
    ? relativeOrAbsolute
    : path.join(PROJECT_ROOT, relativeOrAbsolute)

  let text: string
  try {
    text = await fs.readFile(resolved, 'utf8')
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    return { error: `Cannot read file: ${resolved} (${msg})` }
  }

  const url = parseEnvValue(text, 'POSTGRES_URL')
  if (!url?.trim()) {
    return { error: `No POSTGRES_URL in ${resolved}` }
  }

  return { path: resolved, url: url.trim() }
}

export function assertPostgresUrl(url: string): string | undefined {
  const u = url.trim()
  if (!u.startsWith('postgres')) {
    return 'URL must start with postgres:// or postgresql://'
  }
  return undefined
}

/**
 * Same merge order as `next dev` (later files override earlier for each key).
 * @see https://nextjs.org/docs/app/building-your-application/configuring/environment-variables
 */
const NEXT_DEV_POSTGRES_URL_FILES = [
  '.env',
  '.env.development',
  DEFAULT_SYNC_ENV_FILE,
  '.env.development.local',
] as const

/**
 * Update or append POSTGRES_URL in a dotenv file (first `=` separates key from value).
 */
export async function upsertPostgresUrlInFile(
  relativeToProjectRoot: string,
  postgresUrl: string,
): Promise<{ path: string }> {
  const absolutePath = path.join(PROJECT_ROOT, relativeToProjectRoot)
  let text = ''
  try {
    text = await fs.readFile(absolutePath, 'utf8')
  } catch (e) {
    const err = e as { code?: string }
    if (err.code !== 'ENOENT') throw e
  }

  const lines = text.split(/\r?\n/)
  let found = false
  const out: string[] = []
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) {
      out.push(line)
      continue
    }
    const eq = line.indexOf('=')
    if (eq === -1) {
      out.push(line)
      continue
    }
    const k = line.slice(0, eq).trim()
    if (k === 'POSTGRES_URL') {
      out.push(`POSTGRES_URL=${postgresUrl}`)
      found = true
    } else {
      out.push(line)
    }
  }
  if (!found) {
    if (out.length && out[out.length - 1] !== '') out.push('')
    out.push(`POSTGRES_URL=${postgresUrl}`)
  }
  await fs.writeFile(absolutePath, out.join('\n'), 'utf8')
  return { path: absolutePath }
}

/**
 * Resolves `POSTGRES_URL` the same way `next dev` does (last file in the list wins).
 */
export async function readAppPostgresUrl(): Promise<
  { url: string; source: string } | { error: string }
> {
  let url: string | undefined
  let source: string | undefined
  for (const rel of NEXT_DEV_POSTGRES_URL_FILES) {
    const resolved = path.join(PROJECT_ROOT, rel)
    try {
      const text = await fs.readFile(resolved, 'utf8')
      const v = parseEnvValue(text, 'POSTGRES_URL')?.trim()
      if (v) {
        url = v
        source = rel
      }
    } catch (e) {
      const err = e as { code?: string }
      if (err.code !== 'ENOENT') throw e
    }
  }
  if (url && source) {
    return { url, source }
  }
  return { error: `No POSTGRES_URL in ${NEXT_DEV_POSTGRES_URL_FILES.join(', ')}` }
}

export function maskPostgresUrlForDisplay(url: string): string {
  try {
    const u = new URL(url)
    if (u.password) u.password = '***'
    return u.href
  } catch {
    return '(invalid URL)'
  }
}
