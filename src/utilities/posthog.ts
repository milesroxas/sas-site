import { PostHog } from 'posthog-node'
import { afterResponse } from './afterResponse'
import {
  analyticsCaptureEnabled,
  analyticsEnvironment,
  hasInternalTrafficCookie,
} from './analyticsScope'

type HeaderReader = { get(name: string): string | null }

let client: PostHog | null | undefined

/**
 * Shared Node client for short-lived route handlers. `flushAt: 1` so a capture
 * is not still queued when the isolate is torn down. A missing key is a
 * production no-op: analytics must never fail a submit or a build.
 *
 * Exception autocapture stays off. Sentry already owns errors on every runtime
 * (`sentry.server.config.ts`), and turning it on here would hook the process
 * `uncaughtException` handlers a second time and bill the same error twice.
 */
function getPostHogClient(): PostHog | null {
  if (client !== undefined) return client

  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
  if (!key || !analyticsCaptureEnabled()) {
    client = null
    return null
  }

  client = new PostHog(key, {
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com',
    flushAt: 1,
    flushInterval: 0,
  })
  return client
}

/**
 * The browser injects `X-POSTHOG-DISTINCT-ID` and `X-POSTHOG-SESSION-ID` on
 * same-origin requests (`tracing_headers` in the client provider). The distinct
 * id ties a conversion to the visitor; the session id ties it to the session,
 * which is what session funnels, channel attribution and "recordings with this
 * event" all join on. Email links and server-to-server calls carry neither.
 */
function tracingHeader(headers: HeaderReader, name: string): string | null {
  const value = headers.get(name)
  if (!value || value === 'undefined' || value === 'null') return null
  return value
}

/**
 * Record one conversion without making the visitor wait for it. The flush runs
 * after the response (see `afterResponse`), so it never lands in the request
 * path or inside an open Payload transaction. Returns void by design: no call
 * site should have a reason to await analytics.
 */
export function captureServerEvent({
  event,
  fallbackDistinctId,
  headers,
  properties,
}: {
  event: string
  fallbackDistinctId: string
  headers: HeaderReader
  properties?: Record<string, unknown>
}): void {
  const posthog = getPostHogClient()
  if (!posthog) return
  if (hasInternalTrafficCookie(headers.get('cookie'))) return

  const distinctId = tracingHeader(headers, 'x-posthog-distinct-id')
  const sessionId = tracingHeader(headers, 'x-posthog-session-id')

  const send = async () => {
    try {
      posthog.capture({
        distinctId: distinctId ?? fallbackDistinctId,
        event,
        properties: {
          ...properties,
          environment: analyticsEnvironment(),
          ...(sessionId ? { $session_id: sessionId } : {}),
          // With no client id there is no visitor to attach to, so skip the
          // person profile rather than minting a throwaway one per submission.
          // Mirrors `person_profiles: 'identified_only'` on the browser side.
          ...(distinctId ? {} : { $process_person_profile: false }),
        },
      })
      await posthog.flush()
    } catch {
      // Analytics is best-effort.
    }
  }

  afterResponse(send)
}
