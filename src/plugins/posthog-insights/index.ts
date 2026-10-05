import type { Plugin } from 'payload'
import { summaryEndpoint } from './endpoint'

const CARD = '@/plugins/posthog-insights/components/InsightsDashboard#InsightsDashboard'

export type PostHogInsightsPluginConfig = {
  /** `false` leaves the card and its endpoint out. There is no schema either way. */
  enabled?: boolean
}

/**
 * PostHog's headline numbers on the admin dashboard: one card, under whatever
 * the config already puts there, and the team-only endpoint it reads. The card
 * is registered whether or not `POSTHOG_PERSONAL_API_KEY` is set, so the import
 * map is the same in every environment: without the key the endpoint answers
 * 404 and the card renders nothing.
 */
export const posthogInsightsPlugin =
  (options: PostHogInsightsPluginConfig = {}): Plugin =>
  (config) => {
    if (options.enabled === false) return config
    return {
      ...config,
      admin: {
        ...config.admin,
        components: {
          ...config.admin?.components,
          beforeDashboard: [...(config.admin?.components?.beforeDashboard ?? []), CARD],
        },
      },
      endpoints: [...(config.endpoints ?? []), summaryEndpoint],
    }
  }
