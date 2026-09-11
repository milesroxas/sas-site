import { after } from 'next/server'
import { PostHog } from 'posthog-node'

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
  if (!key) {
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
 * The browser injects `X-POSTHOG-DISTINCT-ID` on same-origin requests
 * (`tracing_headers` in the client provider), which is what ties a conversion
 * back to the session that produced it. Email links and server-to-server calls
 * carry no such header.
 */
function clientDistinctId(headers: HeaderReader): string | null {
  const value = headers.get('x-posthog-distinct-id')
  if (!value || value === 'undefined' || value === 'null') return null
  return value
}

const environment = () =>
  process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.VERCEL_ENV ?? 'development'

/**
 * Record one conversion without making the visitor wait for it.
 *
 * `after()` extends the function lifetime past the response on Vercel, so the
 * flush never lands in the request path or, worse, inside an open Payload
 * transaction. Outside a Next request scope (CLI, jobs, tests) it throws and
 * the send runs inline, un-awaited. Returns void by design: no call site
 * should have a reason to await analytics.
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

  const distinctId = clientDistinctId(headers)

  const send = async () => {
    try {
      posthog.capture({
        distinctId: distinctId ?? fallbackDistinctId,
        event,
        properties: {
          ...properties,
          environment: environment(),
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

  try {
    after(send)
  } catch {
    void send()
  }
}
