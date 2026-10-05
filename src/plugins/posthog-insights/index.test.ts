import type { Config, Endpoint, PayloadRequest } from 'payload'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { SUMMARY_PATH } from './endpoint'
import { posthogInsightsPlugin } from './index'

const existing: Endpoint = { path: '/geo', method: 'get', handler: () => new Response() }

const base = {
  admin: { components: { beforeDashboard: ['@/first#First'] } },
  endpoints: [existing],
} as unknown as Config

const summaryOf = (config: Config) =>
  config.endpoints?.find((endpoint) => endpoint.path === SUMMARY_PATH)

const call = (user: { collection: string } | null) => {
  const endpoint = summaryOf(posthogInsightsPlugin()(base) as Config)
  if (!endpoint) throw new Error('posthogInsightsPlugin attached no endpoint')
  return endpoint.handler({ user, query: {} } as unknown as PayloadRequest)
}

afterEach(() => vi.unstubAllEnvs())

describe('posthogInsightsPlugin', () => {
  it('adds its card after the existing ones and keeps every endpoint', () => {
    const config = posthogInsightsPlugin()(base) as Config
    expect(config.admin?.components?.beforeDashboard).toEqual([
      '@/first#First',
      '@/plugins/posthog-insights/components/InsightsDashboard#InsightsDashboard',
    ])
    expect(config.endpoints).toContain(existing)
    expect(summaryOf(config)).toBeDefined()
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
