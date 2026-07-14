// Sentry Node.js runtime config, loaded via src/instrumentation.ts.
// No DSN (e.g. local dev without .env entry) leaves the SDK disabled.
import * as Sentry from '@sentry/nextjs'

const isProduction = process.env.VERCEL_ENV === 'production'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Separates preview and production streams in Sentry (issue filters,
  // alert rules, release health all key off this).
  environment: process.env.VERCEL_ENV ?? 'development',

  // Full tracing outside production; sample in production to protect quota.
  tracesSampleRate: isProduction ? 0.2 : 1.0,

  // Structured logs (Sentry.logger.*) alongside errors and traces.
  enableLogs: true,

  debug: false,
})
