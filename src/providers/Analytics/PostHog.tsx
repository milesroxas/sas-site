'use client'

import { useConsentManager } from '@c15t/nextjs'
import posthog from 'posthog-js'
import { PostHogProvider as PostHogReactProvider } from 'posthog-js/react'
import type React from 'react'
import { useEffect, useRef } from 'react'

const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
const ingestHost = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com'

/**
 * Consent-gated PostHog. Nothing initializes until the c15t `measurement`
 * category is granted, so no identifiers or events exist pre-consent. Once
 * granted, `defaults: '2025-05-24'` captures the current page plus SPA
 * navigations via the History API. Later revocations opt the client out
 * without a reload (and the opt-out persists across sessions).
 */
export const PostHogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { has } = useConsentManager()
  const measurementAllowed = has('measurement')
  const initialized = useRef(false)

  useEffect(() => {
    if (!key) {
      return
    }

    if (!initialized.current) {
      if (!measurementAllowed) {
        return
      }

      initialized.current = true
      posthog.init(key, {
        // First-party proxy (see next.config.ts rewrites) so events and the
        // toolbar assets aren't eaten by ad blockers.
        api_host: '/ingest',
        ui_host: ingestHost.replace('.i.posthog.com', '.posthog.com'),
        defaults: '2025-05-24',
        // Fires $pageleave for accurate bounce rate and time-on-page.
        capture_pageleave: true,
        // Anonymous visitors stay cheap; person profiles are only created
        // once posthog.identify() is called.
        person_profiles: 'identified_only',
      })
      // Filter any insight by environment (production/preview) in PostHog.
      posthog.register({
        environment: process.env.NEXT_PUBLIC_VERCEL_ENV ?? 'development',
      })
    }

    // Reconcile opt-in state on every consent change, including a persisted
    // opt-out from a previous session surviving into a freshly granted one.
    if (measurementAllowed && posthog.has_opted_out_capturing()) {
      posthog.opt_in_capturing()
    } else if (!measurementAllowed && !posthog.has_opted_out_capturing()) {
      posthog.opt_out_capturing()
    }
  }, [measurementAllowed])

  return <PostHogReactProvider client={posthog}>{children}</PostHogReactProvider>
}
