/**
 * Which traffic reaches PostHog. Shared by the browser provider
 * (`src/providers/Analytics/PostHog.tsx`) and server capture
 * (`src/utilities/posthog.ts`) so both sides always agree. Safe to import from
 * client code: it reads only `NEXT_PUBLIC_*` values and a cookie string.
 */

/** Stamped on every event as `environment`; dashboards filter on it. */
export const analyticsEnvironment = () =>
  process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.VERCEL_ENV ?? 'development'

/**
 * Local `next dev` sends nothing unless a developer opts in with
 * `NEXT_PUBLIC_POSTHOG_CAPTURE_DEV=true`: it was most of the project's event
 * volume and every localhost recording, all of it billed. Preview keeps
 * capturing so analytics changes can be checked before they reach production.
 */
export const analyticsCaptureEnabled = () =>
  analyticsEnvironment() !== 'development' || process.env.NEXT_PUBLIC_POSTHOG_CAPTURE_DEV === 'true'

/**
 * A team browser carries this cookie (set by visiting any page with
 * `?internal=on`) and is never captured, on the client or the server. PostHog's
 * internal-user filter only hides traffic at query time, so without this the
 * team's own visits and recordings still count against the allowance.
 */
export const INTERNAL_TRAFFIC_COOKIE = 'sas_internal'

export const INTERNAL_TRAFFIC_PARAM = 'internal'

export function hasInternalTrafficCookie(cookieHeader: string | null | undefined): boolean {
  if (!cookieHeader) return false
  return cookieHeader.split(';').some((pair) => pair.trim() === `${INTERNAL_TRAFFIC_COOKIE}=1`)
}
