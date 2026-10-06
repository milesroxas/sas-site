import type { DashboardConfig, Plugin, Widget, WidgetInstance } from 'payload'
import { insightsSettings } from './client'
import { summaryEndpoint } from './endpoint'

export const TRAFFIC_WIDGET: Widget = {
  slug: 'site-traffic',
  Component: '@/plugins/posthog-insights/components/TrafficWidget#TrafficWidget',
  label: 'Site traffic',
  minWidth: 'medium',
}

/** Payload's own layout when a config sets none: every collection, full width. */
const PAYLOAD_DEFAULT_LAYOUT: WidgetInstance[] = [{ widgetSlug: 'collections', width: 'full' }]

/**
 * The config's default layout with site traffic in it, full width, just above
 * the collection cards (or last, without them). Left out while the key is
 * unset, so a fresh dashboard never opens on a widget with nothing to show.
 */
const withTraffic =
  (layout: DashboardConfig['defaultLayout']): NonNullable<DashboardConfig['defaultLayout']> =>
  async ({ req }) => {
    const base =
      (typeof layout === 'function' ? await layout({ req }) : layout) ?? PAYLOAD_DEFAULT_LAYOUT
    if (!insightsSettings()) return base
    const traffic = { widgetSlug: TRAFFIC_WIDGET.slug, width: 'full' } as WidgetInstance
    const at = base.findIndex((instance) => instance.widgetSlug === 'collections')
    return at === -1 ? [...base, traffic] : [...base.slice(0, at), traffic, ...base.slice(at)]
  }

export type PostHogInsightsPluginConfig = {
  /** `false` leaves the widget and its endpoint out. There is no schema either way. */
  enabled?: boolean
}

/**
 * PostHog's headline numbers as a dashboard widget, and the team-only
 * endpoint it reads for a window it did not render with. The widget is
 * registered whether or not `POSTHOG_PERSONAL_API_KEY` is set, so the import
 * map is the same in every environment; without the key it stays out of the
 * default layout, and if added by hand it says what is missing.
 */
export const posthogInsightsPlugin =
  (options: PostHogInsightsPluginConfig = {}): Plugin =>
  (config) => {
    if (options.enabled === false) return config
    const dashboard = config.admin?.dashboard
    return {
      ...config,
      admin: {
        ...config.admin,
        dashboard: {
          ...dashboard,
          widgets: [...(dashboard?.widgets ?? []), TRAFFIC_WIDGET],
          defaultLayout: withTraffic(dashboard?.defaultLayout),
        },
      },
      endpoints: [...(config.endpoints ?? []), summaryEndpoint],
    }
  }
