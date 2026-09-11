// Sentry browser config: runs on every page load, before hydration, across all
// route groups (frontend, admin, email preview). Error monitoring only, run as
// a legitimate interest: sendDefaultPii stays off, so no IP is stored.
//
// No session replay here, deliberately. Replay records what a visitor does,
// which EU regulators treat as needing consent even when it is used for
// debugging (CNIL draft recommendation on session replay, February 2026), and
// this file runs before any consent. Replay lives in PostHog instead, behind the
// c15t `measurement` category. Leaving it out also keeps the replay bundle and
// its compression worker off every page (docs/performance-audit-work-pages.md
// P0-2). Gating and sampling live in ../sentry.shared.
import * as Sentry from '@sentry/nextjs'
import { sentryBaseOptions } from '../sentry.shared'

// NEXT_PUBLIC_VERCEL_ENV is exposed automatically by Vercel's system env
// vars: 'production' | 'preview' | 'development'. The browser bundle cannot
// see the unprefixed VERCEL_ENV the server runtimes use.
const vercelEnv = process.env.NEXT_PUBLIC_VERCEL_ENV

Sentry.init({
  ...sentryBaseOptions(vercelEnv),

  integrations: [
    // Mirror console.error/warn into Sentry logs for debugging context.
    Sentry.consoleLoggingIntegration({ levels: ['error', 'warn'] }),
  ],

  enableLogs: true,
})

// Instruments App Router navigations as pageload/navigation transactions.
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
