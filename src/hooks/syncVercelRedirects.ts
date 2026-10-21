import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, PayloadRequest } from 'payload'
import type { Redirect } from '@/payload-types'
import { surfaceByCollection, surfaceDocPath } from '@/shared/content/surfaces'

/**
 * The `redirects` collection is the team's list; Vercel Bulk Redirects serve
 * it. Every save or delete pushes the whole list as a new version and
 * promotes it, so a rule answers at the CDN before the request that saved it
 * returns: no function, no Postgres, no deploy. The list is project-level
 * (one list for every deployment), so only production may write it, or a
 * preview branch's table would replace production's rules. docs/redirects.md.
 */

const VERCEL_API = 'https://api.vercel.com'

/** One rule in Vercel's bulk redirect shape: 308 keeps the method, the query string passes through. */
export type BulkRedirect = {
  source: string
  destination: string
  permanent: true
  preserveQueryParams: true
}

type BulkRedirectVersion = { id: string; redirectCount?: number }

/**
 * VERCEL_ENV (not NODE_ENV, which is 'production' in preview builds too)
 * identifies the production deployment. VERCEL_PROJECT_ID is a Vercel system
 * variable; the token and team id are set by hand, production only.
 */
export const redirectSyncEnabled = (): boolean =>
  process.env.VERCEL_ENV === 'production' &&
  Boolean(process.env.VERCEL_TOKEN && process.env.VERCEL_TEAM_ID && process.env.VERCEL_PROJECT_ID)

const isPathOrUrl = (value: string): boolean => value.startsWith('/') || /^https?:\/\//.test(value)

/** The destination a stored redirect points at, or null when it does not resolve. */
export const redirectDestination = (doc: Redirect): string | null => {
  const to = doc.to
  if (!to) return null
  if (to.type === 'custom') {
    const url = to.url?.trim()
    return url && isPathOrUrl(url) ? url : null
  }
  const reference = to.reference
  if (!reference) return null
  const value = reference.value
  // Depth 0 leaves an id here; the sync reads at depth 1 so the slug is present.
  if (typeof value !== 'object') return null
  const surface = surfaceByCollection.get(reference.relationTo)
  return surface && value.slug ? surfaceDocPath(surface, value.slug) : null
}

/**
 * Maps the stored redirects to Vercel rules, dropping any that cannot be
 * served. Vercel matches the source exactly and `skipTrailingSlashRedirect`
 * (next.config.ts) means `/blog/` is never normalised to `/blog`, so every
 * rule gets a trailing-slash twin. A rule the team wrote with the slash wins
 * over a twin.
 */
export const toBulkRedirects = (
  docs: Redirect[],
  warn: (message: string) => void,
): BulkRedirect[] => {
  const rules: BulkRedirect[] = []
  const seen = new Set<string>()
  for (const doc of docs) {
    const source = doc.from.trim()
    const destination = redirectDestination(doc)
    if (!source.startsWith('/')) {
      warn(`Redirects: skipped "${doc.from}", the from path must start with /`)
    } else if (!destination) {
      warn(`Redirects: skipped "${doc.from}", its destination does not resolve`)
    } else if (destination === source) {
      warn(`Redirects: skipped "${doc.from}", it points at itself`)
    } else if (seen.has(source)) {
      warn(`Redirects: skipped a second rule for "${doc.from}"`)
    } else {
      seen.add(source)
      rules.push({ source, destination, permanent: true, preserveQueryParams: true })
    }
  }
  for (const rule of [...rules]) {
    const twin = `${rule.source}/`
    if (rule.source.endsWith('/') || seen.has(twin)) continue
    seen.add(twin)
    rules.push({ ...rule, source: twin })
  }
  return rules
}

const vercelRequest = async <T>(
  path: string,
  method: 'POST' | 'PUT',
  body: unknown,
): Promise<T> => {
  const url = new URL(path, VERCEL_API)
  url.searchParams.set('teamId', process.env.VERCEL_TEAM_ID ?? '')
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(10_000),
  })
  if (!res.ok) {
    const detail = (await res.text()).slice(0, 300)
    throw new Error(`${method} ${url.pathname} answered ${res.status}: ${detail}`)
  }
  return (await res.json()) as T
}

/** Stages the full list as a new version, then promotes it. Returns the live version. */
export const pushBulkRedirects = async (rules: BulkRedirect[]): Promise<BulkRedirectVersion> => {
  const projectId = process.env.VERCEL_PROJECT_ID
  const staged = await vercelRequest<{ version: BulkRedirectVersion }>(
    '/v1/bulk-redirects',
    'PUT',
    {
      projectId,
      teamId: process.env.VERCEL_TEAM_ID,
      overwrite: true,
      name: `cms ${new Date().toISOString()}`,
      redirects: rules,
    },
  )
  const promoted = await vercelRequest<{ version: BulkRedirectVersion }>(
    `/v1/bulk-redirects/versions?projectId=${projectId}`,
    'POST',
    { id: staged.version.id, action: 'promote' },
  )
  return promoted.version
}

/** Reads every redirect through `req` (the saving transaction's view) and pushes the list. */
export const syncVercelRedirects = async (req: PayloadRequest): Promise<void> => {
  const { payload } = req
  if (!redirectSyncEnabled()) {
    payload.logger.info(
      'Redirects: Vercel sync is off outside production, or VERCEL_TOKEN / VERCEL_TEAM_ID is unset',
    )
    return
  }
  const { docs } = await payload.find({
    collection: 'redirects',
    depth: 1,
    limit: 0,
    pagination: false,
    req,
  })
  const rules = toBulkRedirects(docs, (message) => payload.logger.warn(message))
  try {
    const version = await pushBulkRedirects(rules)
    payload.logger.info(
      `Redirects: ${docs.length} rules (${rules.length} with trailing-slash twins) live on Vercel, version ${version.id}`,
    )
  } catch (err) {
    // The save stands; the next save pushes the full list again.
    payload.logger.error({
      msg: 'Redirects: Vercel sync failed, re-save any redirect to retry',
      err,
    })
  }
}

export const syncRedirectsAfterChange: CollectionAfterChangeHook<Redirect> = async ({
  doc,
  req,
}) => {
  await syncVercelRedirects(req)
  return doc
}

export const syncRedirectsAfterDelete: CollectionAfterDeleteHook<Redirect> = async ({
  doc,
  req,
}) => {
  await syncVercelRedirects(req)
  return doc
}
