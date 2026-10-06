import type { Config, Endpoint, PayloadRequest } from 'payload'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { posthogInsightsPlugin, TRAFFIC_WIDGET } from './index'
import { SUMMARY_PATH } from './summary'

const existing: Endpoint = { path: '/geo', method: 'get', handler: () => new Response() }

const inbox = { slug: 'inbox', Component: '@/inbox#Inbox' }

const base = {
  admin: {
    dashboard: {
      widgets: [inbox],
      defaultLayout: [
        { widgetSlug: 'inbox', width: 'medium' },
        { widgetSlug: 'collections', width: 'full' },
      ],
    },
  },
  endpoints: [existing],
} as unknown as Config

const layoutOf = async (config: Config) => {
  const layout = config.admin?.dashboard?.defaultLayout
  const req = {} as PayloadRequest
  return (typeof layout === 'function' ? await layout({ req }) : layout)?.map(
    (instance) => instance.widgetSlug,
  )
}

const summaryOf = (config: Config) =>
  config.endpoints?.find((endpoint) => endpoint.path === SUMMARY_PATH)

const call = (user: { collection: string } | null) => {
  const endpoint = summaryOf(posthogInsightsPlugin()(base) as Config)
  if (!endpoint) throw new Error('posthogInsightsPlugin attached no endpoint')
  return endpoint.handler({ user, query: {} } as unknown as PayloadRequest)
}

afterEach(() => vi.unstubAllEnvs())

describe('posthogInsightsPlugin', () => {
  it('adds its widget after the existing ones and keeps every endpoint', () => {
    const config = posthogInsightsPlugin()(base) as Config
    expect(config.admin?.dashboard?.widgets).toEqual([inbox, TRAFFIC_WIDGET])
    expect(config.endpoints).toContain(existing)
    expect(summaryOf(config)).toBeDefined()
  })

  it('lays the widget out above the collection cards when the key is set', async () => {
    vi.stubEnv('POSTHOG_PERSONAL_API_KEY', 'phx_test')
    expect(await layoutOf(posthogInsightsPlugin()(base) as Config)).toEqual([
      'inbox',
      'site-traffic',
      'collections',
    ])
  })

  it("keeps Payload's default layout when the config sets none", async () => {
    vi.stubEnv('POSTHOG_PERSONAL_API_KEY', 'phx_test')
    const bare = { endpoints: [] } as unknown as Config
    expect(await layoutOf(posthogInsightsPlugin()(bare) as Config)).toEqual([
      'site-traffic',
      'collections',
    ])
  })

  it('leaves the layout alone without the key', async () => {
    vi.stubEnv('POSTHOG_PERSONAL_API_KEY', '')
    expect(await layoutOf(posthogInsightsPlugin()(base) as Config)).toEqual([
      'inbox',
      'collections',
    ])
  })

  it('adds nothing when disabled', () => {
    expect(posthogInsightsPlugin({ enabled: false })(base)).toBe(base)
  })
})

describe('summary endpoint', () => {
  it('refuses a visitor and an MCP API key', async () => {
    vi.stubEnv('POSTHOG_PERSONAL_API_KEY', 'phx_test')
    expect((await call(null)).status).toBe(401)
    expect((await call({ collection: 'mcp-keys' })).status).toBe(401)
  })

  it('answers 404 to the team when the key is unset', async () => {
    vi.stubEnv('POSTHOG_PERSONAL_API_KEY', '')
    expect((await call({ collection: 'users' })).status).toBe(404)
  })
})
