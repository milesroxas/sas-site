'use client'

import { useConsentManager } from '@c15t/nextjs'
import type React from 'react'
import { useEffect, useRef } from 'react'
import {
  analyticsCaptureEnabled,
  analyticsEnvironment,
  hasInternalTrafficCookie,
  INTERNAL_TRAFFIC_COOKIE,
  INTERNAL_TRAFFIC_PARAM,
} from '@/utilities/analyticsScope'

const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
const ingestHost = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com'

const MISSING_KEY_MESSAGE =
  'NEXT_PUBLIC_POSTHOG_KEY variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once NEXT_PUBLIC_POSTHOG_KEY is configured'

/**
 * Run once the main thread is free, so the SDK download never competes with
 * hero media during the hydration commit (audit P1-7). The timeout keeps a
 * busy page from starving analytics entirely.
 */
function whenIdle(run: () => void): () => void {
  if (typeof window.requestIdleCallback !== 'function') {
    const timer = window.setTimeout(run, 1)
    return () => window.clearTimeout(timer)
  }
  const handle = window.requestIdleCallback(run, { timeout: 2000 })
  return () => window.cancelIdleCallback(handle)
}

const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000

/**
 * Whether this browser is the team's. `?internal=on` marks it for a year and
 * `?internal=off` clears it. The flag is a cookie rather than PostHog's own
 * opt-out so server capture sees it too, and so a consent change can't opt the
 * browser back in. The param is stripped so a shared link never opts out
 * whoever opens it.
 *
 * The answer comes from the param itself on the page that carries it, because
 * the cookie write is async and init must not race it.
 */
function isInternalTraffic(): boolean {
  const url = new URL(window.location.href)
  const value = url.searchParams.get(INTERNAL_TRAFFIC_PARAM)
  if (value !== 'on' && value !== 'off') {
    return hasInternalTrafficCookie(document.cookie)
  }

  if ('cookieStore' in window) {
    const write =
      value === 'on'
        ? window.cookieStore.set({
            name: INTERNAL_TRAFFIC_COOKIE,
            value: '1',
            path: '/',
            sameSite: 'lax',
            expires: Date.now() + ONE_YEAR_MS,
          })
        : window.cookieStore.delete({ name: INTERNAL_TRAFFIC_COOKIE, path: '/' })
    // Best-effort, like the rest of analytics: a failed write leaves the
    // browser captured, which is the pre-existing behavior.
    write.catch(() => {})
  }

  url.searchParams.delete(INTERNAL_TRAFFIC_PARAM)
  window.history.replaceState(null, '', url)
  return value === 'on'
}

/**
 * Consent-gated PostHog: product analytics, session replay and the conversion
 * funnel. The SDK is imported only after the c15t `measurement` category is
 * granted, so the bytes never join the initial page graph (see
 * docs/performance-audit-work-pages.md P0-2). Nothing initializes pre-consent,
 * and a later revocation opts the client out without a reload.
 *
 * Errors are deliberately not captured here. Sentry owns them on every runtime
 * (instrumentation-client.ts, sentry.server.config.ts); enabling
 * `capture_exceptions` would load a second autocapture script and bill the same
 * exception to two vendors.
 */
export const PostHogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { has } = useConsentManager()
  const measurementAllowed = has('measurement')
  const initialized = useRef(false)
  const missingKeyWarned = useRef(false)
  // Decided once per page load: the param is gone after the first read, and a
  // re-run (consent change, Strict Mode) must not re-read a pending cookie.
  const internalTraffic = useRef<boolean | null>(null)

  useEffect(() => {
    if (!key) {
      if (process.env.NODE_ENV !== 'production' && !missingKeyWarned.current) {
        missingKeyWarned.current = true
        console.error(new Error(MISSING_KEY_MESSAGE))
      }
      return
    }

    // Checked before consent so the team flag is honored (and the param
    // stripped) even on a visit that never grants measurement.
    if (!analyticsCaptureEnabled()) return
    internalTraffic.current ??= isInternalTraffic()
    if (internalTraffic.current) return

    // Do not download the SDK until measurement is granted. Returning visitors
    // who already consented still load it after hydration, not in the first
    // 30-script graph.
    if (!initialized.current && !measurementAllowed) {
      return
    }

    let cancelled = false

    const load = () => {
      void import('posthog-js').then(({ default: posthog }) => {
        if (cancelled) return

        if (!initialized.current) {
          if (!measurementAllowed) return

          initialized.current = true
          posthog.init(key, {
            // First-party proxy (see next.config.ts rewrites) so events and the
            // toolbar assets aren't eaten by ad blockers.
            api_host: '/ingest',
            ui_host: ingestHost.replace('.i.posthog.com', '.posthog.com'),
            defaults: '2026-05-30',
            // Fires $pageleave for accurate bounce rate and time-on-page.
            capture_pageleave: true,
            // Anonymous visitors stay cheap; person profiles are only created
            // once posthog.identify() is called. This site has no public login.
            person_profiles: 'identified_only',
            // Replay is the UX team's tool. Sentry's own replay masks all text
            // and blocks all media, so it answers "what broke", not "where did
            // this confuse someone". Sampling lives in PostHog project settings
            // so the rate can change without a deploy.
            session_recording: {
              // Heroes tunnel a WebGL scene into a persistent canvas. Canvas
              // recording re-encodes those frames several times a second and
              // uploads them, which would undo the media budget the work-page
              // audit exists to defend. `captureCanvas` is the local override
              // that wins over the project-level remote config.
              captureCanvas: { recordCanvas: false },
            },
            // Lets /api handlers attach a conversion to the same anonymous
            // person (see src/utilities/posthog.ts).
            tracing_headers: [window.location.hostname],
          })
          posthog.register({ environment: analyticsEnvironment() })
          return
        }

        if (measurementAllowed && posthog.has_opted_out_capturing()) {
          posthog.opt_in_capturing()
        } else if (!measurementAllowed && !posthog.has_opted_out_capturing()) {
          posthog.opt_out_capturing()
        }
      })
    }

    // A consent change after init must reconcile promptly, and by then the
    // module is already cached. Only the first download waits for idle time.
    if (initialized.current) {
      load()
      return () => {
        cancelled = true
      }
    }

    const cancelIdle = whenIdle(load)
    return () => {
      cancelled = true
      cancelIdle()
    }
  }, [measurementAllowed])

  return children
}
