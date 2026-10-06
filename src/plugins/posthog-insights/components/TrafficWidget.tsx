import type { WidgetServerProps } from 'payload'
import { Suspense } from 'react'
import { authenticated } from '@/access/authenticated'
import { AdminCard } from '@/components/admin/AdminCard'
import { cachedSummary } from '../cache'
import { type InsightsSettings, insightsSettings } from '../client'
import { DEFAULT_WINDOW } from '../summary'
import { TrafficFallback, TrafficPanel } from './TrafficPanel'

/**
 * The site traffic widget. A server component, as Payload's dashboard
 * widgets are: the first window is read here, from the same 15 minute cache
 * the endpoint uses, and streams into the page behind a skeleton, so the rest
 * of the dashboard never waits on PostHog and the browser never makes the
 * first request itself.
 */
export function TrafficWidget({ req }: WidgetServerProps) {
  if (!authenticated({ req })) return null
  const settings = insightsSettings()
  if (!settings) {
    return (
      <AdminCard action="PostHog API keys" href="https://posthog.com/docs/api" title="Site traffic">
        <p style={{ fontSize: 13, margin: 0 }}>
          Set <code>POSTHOG_PERSONAL_API_KEY</code> (query read scope) to see production traffic
          here.
        </p>
      </AdminCard>
    )
  }
  return (
    <Suspense fallback={<TrafficFallback />}>
      <FirstWindow logger={req.payload.logger} settings={settings} />
    </Suspense>
  )
}

async function FirstWindow({
  settings,
  logger,
}: {
  settings: InsightsSettings
  logger: WidgetServerProps['req']['payload']['logger']
}) {
  const initial = await cachedSummary(settings, DEFAULT_WINDOW).catch((error: unknown) => {
    // The panel asks again from the browser and offers a retry.
    logger.error({ err: error }, 'PostHog insights: the first window failed')
    return null
  })
  return <TrafficPanel initial={initial} />
}
