// Sentry browser config — runs on every page load, before hydration, across
// all route groups (frontend, admin, email preview). Error monitoring runs
// unconditionally as legitimate interest: sendDefaultPii stays off (no IP
// stored) and replays mask all text and media by default.
// No DSN leaves the SDK disabled.
import * as Sentry from '@sentry/nextjs'

const isProduction = process.env.NEXT_PUBLIC_VERCEL_ENV === 'production'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // NEXT_PUBLIC_VERCEL_ENV is exposed automatically by Vercel's system env
  // vars: 'production' | 'preview' | 'development'.
  environment: process.env.NEXT_PUBLIC_VERCEL_ENV ?? 'development',

  tracesSampleRate: isProduction ? 0.2 : 1.0,

  integrations: [
    Sentry.replayIntegration(),
    // Mirror console.error/warn into Sentry logs for debugging context.
    Sentry.consoleLoggingIntegration({ levels: ['error', 'warn'] }),
  ],

  // Record every session that hits an error; ambient sessions only sampled
  // in production, where real-user browsing patterns are worth the quota.
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: isProduction ? 0.1 : 0,

  enableLogs: true,

  debug: false,
})

// Instruments App Router navigations as pageload/navigation transactions.
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
