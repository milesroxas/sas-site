import fs from 'node:fs/promises'
import path from 'node:path'
import { PROJECT_ROOT, VERCEL_PULL_ENV_FILE } from './constants'

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

/**
 * Read the production connection URLs from the Vercel-pulled env file.
 * `runtimeUrl` is the pooled URL (what production itself uses); `dumpUrl`
 * prefers the non-pooling URL because PgBouncer breaks pg_dump's session-level
 * features. `payloadSecret` is production's PAYLOAD_SECRET — encrypted fields
 * in the production DB only decrypt with the secret that wrote them.
 */
export async function readProductionUrls(): Promise<
  { runtimeUrl: string; dumpUrl: string; payloadSecret?: string } | { error: string }
> {
  const resolved = path.join(PROJECT_ROOT, VERCEL_PULL_ENV_FILE)
  let text: string
  try {
    text = await fs.readFile(resolved, 'utf8')
  } catch {
    return {
      error: `${VERCEL_PULL_ENV_FILE} not found. Run “Pull Vercel production env” first (needs the vercel CLI).`,
    }
  }
  const runtimeUrl = parseEnvValue(text, 'POSTGRES_URL')?.trim()
  if (!runtimeUrl) {
    return {
      error: `No POSTGRES_URL in ${VERCEL_PULL_ENV_FILE}. Re-run “Pull Vercel production env”.`,
    }
  }
  const dumpUrl = parseEnvValue(text, 'POSTGRES_URL_NON_POOLING')?.trim() || runtimeUrl
  const payloadSecret = parseEnvValue(text, 'PAYLOAD_SECRET')?.trim() || undefined
  return { runtimeUrl, dumpUrl, payloadSecret }
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
  '.env.local',
  '.env.development.local',
] as const

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
