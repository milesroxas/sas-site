/**
 * Environment gate shared by the three Sentry entry points (browser, Node,
 * edge). No DSN leaves the SDK disabled, and development — local or
 * `vercel dev` — never reports even when a DSN is set. Traces are sampled in
 * production to protect quota and captured fully everywhere else.
 *
 * Server and edge read `VERCEL_ENV`; the browser bundle can only see the
 * `NEXT_PUBLIC_` copy, so each entry point passes in the one it has.
 */
export const sentryBaseOptions = (vercelEnv: string | undefined) => {
  const environment = vercelEnv ?? 'development'

  return {
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    enabled: Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN) && environment !== 'development',
    // Separates preview and production streams in Sentry (issue filters,
    // alert rules, release health all key off this).
    environment,
    tracesSampleRate: isSentryProduction(vercelEnv) ? 0.2 : 1.0,
    debug: false,
  }
}

/** Whether this runtime is the production deployment, not a preview or local run. */
export const isSentryProduction = (vercelEnv: string | undefined) => vercelEnv === 'production'
