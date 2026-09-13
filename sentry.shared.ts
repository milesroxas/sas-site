/**
 * Environment gate shared by the three Sentry entry points (browser, Node,
 * edge). The SDK only runs on the production deployment: no DSN, local dev,
 * `vercel dev`, and preview deployments all leave it disabled so a free-tier
 * quota is spent on real traffic only. Production traces are sampled.
 *
 * Server and edge read `VERCEL_ENV`; the browser bundle can only see the
 * `NEXT_PUBLIC_` copy, so each entry point passes in the one it has.
 */
export const sentryBaseOptions = (vercelEnv: string | undefined) => {
  const environment = vercelEnv ?? 'development'

  return {
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    enabled: Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN) && isSentryProduction(vercelEnv),
    environment,
    tracesSampleRate: 0.2,
    debug: false,
  }
}

/** Whether this runtime is the production deployment, not a preview or local run. */
export const isSentryProduction = (vercelEnv: string | undefined) => vercelEnv === 'production'
