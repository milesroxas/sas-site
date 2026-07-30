// Sentry Node.js runtime config, loaded via src/instrumentation.ts.
// No DSN (e.g. local .env without an entry) leaves the SDK disabled.
// Development (local / vercel dev) never reports — even when a DSN is set.
import * as Sentry from '@sentry/nextjs'

const environment = process.env.VERCEL_ENV ?? 'development'
const isProduction = environment === 'production'
const enabled = Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN) && environment !== 'development'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled,

  // Separates preview and production streams in Sentry (issue filters,
  // alert rules, release health all key off this).
  environment,

  // Full tracing outside production; sample in production to protect quota.
  tracesSampleRate: isProduction ? 0.2 : 1.0,

  // Structured logs (Sentry.logger.*) alongside errors and traces.
  enableLogs: true,

  debug: false,
})
