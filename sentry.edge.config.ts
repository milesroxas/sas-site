// Sentry Edge runtime config (middleware, edge routes), loaded via
// src/instrumentation.ts. No DSN leaves the SDK disabled. Development
// (local / vercel dev) never reports — even when a DSN is set.
import * as Sentry from '@sentry/nextjs'

const environment = process.env.VERCEL_ENV ?? 'development'
const isProduction = environment === 'production'
const enabled = Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN) && environment !== 'development'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled,
  environment,
  tracesSampleRate: isProduction ? 0.2 : 1.0,
  debug: false,
})
