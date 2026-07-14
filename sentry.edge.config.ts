// Sentry Edge runtime config (middleware, edge routes), loaded via
// src/instrumentation.ts. No DSN leaves the SDK disabled.
import * as Sentry from '@sentry/nextjs'

const isProduction = process.env.VERCEL_ENV === 'production'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.VERCEL_ENV ?? 'development',
  tracesSampleRate: isProduction ? 0.2 : 1.0,
  debug: false,
})
