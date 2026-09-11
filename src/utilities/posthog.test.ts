import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { capture, flush } = vi.hoisted(() => ({
  capture: vi.fn(),
  flush: vi.fn(async () => {}),
}))

vi.mock('posthog-node', () => ({
  PostHog: class {
    capture = capture
    flush = flush
  },
}))

// Run the deferred send inline so each test can assert on it directly.
vi.mock('./afterResponse', () => ({
  afterResponse: (run: () => Promise<void>) => run(),
}))

/** Fresh module per test: the client (or its absence) is cached at module scope. */
async function loadCapture() {
  vi.resetModules()
  const { captureServerEvent } = await import('./posthog')
  return captureServerEvent
}

describe('captureServerEvent', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_POSTHOG_KEY', 'phc_test')
    vi.stubEnv('NEXT_PUBLIC_VERCEL_ENV', 'production')
    vi.stubEnv('VERCEL_ENV', undefined)
    vi.stubEnv('NEXT_PUBLIC_POSTHOG_CAPTURE_DEV', undefined)
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it("attaches the conversion to the browser's person and session", async () => {
    const captureServerEvent = await loadCapture()

    captureServerEvent({
      event: 'inquiry_submitted',
      fallbackDistinctId: 'inquiry:1',
      headers: new Headers({
        'x-posthog-distinct-id': 'browser-person',
        'x-posthog-session-id': 'browser-session',
      }),
      properties: { inquiry_type: 'project' },
    })

    expect(capture).toHaveBeenCalledWith({
      distinctId: 'browser-person',
      event: 'inquiry_submitted',
      properties: {
        inquiry_type: 'project',
        environment: 'production',
        $session_id: 'browser-session',
      },
    })
  })

  it('falls back to a profile-less event when the browser sent no tracing headers', async () => {
    const captureServerEvent = await loadCapture()

    captureServerEvent({
      event: 'newsletter_signup_confirmed',
      fallbackDistinctId: 'subscriber:1',
      headers: new Headers({ 'x-posthog-session-id': 'undefined' }),
    })

    expect(capture).toHaveBeenCalledWith({
      distinctId: 'subscriber:1',
      event: 'newsletter_signup_confirmed',
      properties: { environment: 'production', $process_person_profile: false },
    })
  })

  it('sends nothing for a team browser', async () => {
    const captureServerEvent = await loadCapture()

    captureServerEvent({
      event: 'ask_questioned',
      fallbackDistinctId: 'ask:1',
      headers: new Headers({ cookie: 'theme=dark; sas_internal=1' }),
    })

    expect(capture).not.toHaveBeenCalled()
  })

  it('treats only the exact team cookie as internal', async () => {
    const captureServerEvent = await loadCapture()

    captureServerEvent({
      event: 'ask_questioned',
      fallbackDistinctId: 'ask:1',
      headers: new Headers({ cookie: 'sas_internal=10; not_sas_internal=1' }),
    })

    expect(capture).toHaveBeenCalledOnce()
  })

  it('sends nothing from local development unless a developer opts in', async () => {
    vi.stubEnv('NEXT_PUBLIC_VERCEL_ENV', undefined)
    const event = { event: 'ask_questioned', fallbackDistinctId: 'ask:1', headers: new Headers() }

    ;(await loadCapture())(event)
    expect(capture).not.toHaveBeenCalled()

    vi.stubEnv('NEXT_PUBLIC_POSTHOG_CAPTURE_DEV', 'true')
    ;(await loadCapture())(event)
    expect(capture).toHaveBeenCalledWith(
      expect.objectContaining({
        properties: expect.objectContaining({ environment: 'development' }),
      }),
    )
  })
})
