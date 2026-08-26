// Sentry browser config — runs on every page load, before hydration, across
// all route groups (frontend, admin, email preview). Error monitoring runs
// unconditionally as legitimate interest: sendDefaultPii stays off (no IP
// stored) and replays mask all text and media by default.
// Gating and sampling live in ../sentry.shared.
import * as Sentry from '@sentry/nextjs'
import { isSentryProduction, sentryBaseOptions } from '../sentry.shared'

// NEXT_PUBLIC_VERCEL_ENV is exposed automatically by Vercel's system env
// vars: 'production' | 'preview' | 'development'. The browser bundle cannot
// see the unprefixed VERCEL_ENV the server runtimes use.
const vercelEnv = process.env.NEXT_PUBLIC_VERCEL_ENV

Sentry.init({
  ...sentryBaseOptions(vercelEnv),

  integrations: [
    Sentry.replayIntegration(),
    // Mirror console.error/warn into Sentry logs for debugging context.
    Sentry.consoleLoggingIntegration({ levels: ['error', 'warn'] }),
  ],

  // Record every session that hits an error; ambient sessions only sampled
  // in production, where real-user browsing patterns are worth the quota.
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: isSentryProduction(vercelEnv) ? 0.1 : 0,

  enableLogs: true,
})

// Instruments App Router navigations as pageload/navigation transactions.
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
