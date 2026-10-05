'use client'

import { useConfig } from '@payloadcms/ui'
import { useEffect, useState } from 'react'
import { AdminCard, adminRowStyle } from '@/components/admin/AdminCard'
import {
  change,
  DEFAULT_WINDOW,
  type InsightsSummary,
  leadRate,
  type Ranked,
  WINDOWS,
  type WindowDays,
} from '../summary'

/** `off`: the key is unset, so there is no card. `failed`: PostHog did not answer. */
type State = InsightsSummary | 'loading' | 'failed' | 'off'

const mutedStyle: React.CSSProperties = { color: 'var(--theme-elevation-500)', fontSize: 12 }

const percent = (fraction: number | null) =>
  fraction === null ? '0%' : `${(fraction * 100).toFixed(1)}%`

function Stat({ label, value, delta }: { label: string; value: string; delta: number | null }) {
  return (
    <div style={{ flex: '1 1 120px' }}>
      <div style={mutedStyle}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 600, lineHeight: 1.3 }}>{value}</div>
      <div
        style={{
          ...mutedStyle,
          ...(delta ? { color: `var(--theme-${delta > 0 ? 'success' : 'error'}-500)` } : {}),
        }}
      >
        {delta === null ? 'No earlier data' : `${delta > 0 ? '+' : ''}${delta}%`}
      </div>
    </div>
  )
}

function RankedList({ title, unit, rows }: { title: string; unit: string; rows: Ranked[] }) {
  return (
    <div style={{ flex: '1 1 240px', minWidth: 0 }}>
      <h3 style={{ fontSize: 14, margin: '0 0 8px' }}>{title}</h3>
      {rows.length === 0 ? (
        <p style={mutedStyle}>Nothing yet.</p>
      ) : (
        rows.map((row) => (
          <div key={row.label} style={{ ...adminRowStyle, fontSize: 14 }}>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {row.label}
            </span>
            <span style={{ ...mutedStyle, marginLeft: 'auto', whiteSpace: 'nowrap' }}>
              {row.count.toLocaleString()} {row.count === 1 ? unit : `${unit}s`}
            </span>
          </div>
        ))
      )}
    </div>
  )
}

/**
 * The site's week at a glance, under the inbox and Ask cards: who came, how
 * many of them wrote in, what they read and where they came from. Production
 * traffic only, team browsers left out, each number beside its change against
 * the window before. PostHog holds the detail, one link away.
 */
export function InsightsDashboard() {
  const {
    config: {
      routes: { api },
    },
  } = useConfig()
  const [days, setDays] = useState<WindowDays>(DEFAULT_WINDOW)
  const [state, setState] = useState<State>('loading')

  useEffect(() => {
    const controller = new AbortController()
    const load = async () => {
      try {
        const res = await fetch(`${api}/posthog-insights/summary?days=${days}`, {
          credentials: 'include',
          signal: controller.signal,
        })
        if (res.status === 404) setState('off')
        else if (!res.ok) setState('failed')
        else setState((await res.json()) as InsightsSummary)
      } catch {
        // Aborted on unmount or a window change, or offline.
        if (!controller.signal.aborted) setState('failed')
      }
    }
    void load()
    return () => controller.abort()
  }, [api, days])

  if (state === 'off') return null

  const summary = typeof state === 'object' ? state : null

  return (
    <AdminCard
      action="Open PostHog"
      href={summary?.url ?? 'https://posthog.com'}
      title={`Site traffic, last ${days} days`}
    >
      <div style={{ display: 'flex', gap: 12, margin: '8px 0 16px' }}>
        {WINDOWS.map((option) => (
          <button
            aria-pressed={option === days}
            key={option}
            onClick={() => setDays(option)}
            style={{
              background: 'none',
              border: 0,
              color: 'inherit',
              cursor: 'pointer',
              fontSize: 12,
              opacity: option === days ? 1 : 0.6,
              padding: 0,
              textDecoration: option === days ? 'underline' : 'none',
            }}
            type="button"
          >
            {option} days
          </button>
        ))}
      </div>
      {!summary ? (
        <p style={{ fontSize: 14, margin: 0 }}>
          {state === 'failed' ? 'PostHog did not answer. Try again in a minute.' : 'Loading.'}
        </p>
      ) : (
        <>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, marginBottom: 24 }}>
            <Stat
              delta={change(summary.current.visitors, summary.previous.visitors)}
              label="Visitors"
              value={summary.current.visitors.toLocaleString()}
            />
            <Stat
              delta={change(summary.current.pageviews, summary.previous.pageviews)}
              label="Pageviews"
              value={summary.current.pageviews.toLocaleString()}
            />
            <Stat
              delta={change(summary.current.leads, summary.previous.leads)}
              label="Leads"
              value={summary.current.leads.toLocaleString()}
            />
            <Stat
              delta={change(leadRate(summary.current) ?? 0, leadRate(summary.previous) ?? 0)}
              label="Visitor to lead"
              value={percent(leadRate(summary.current))}
            />
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32 }}>
            <RankedList rows={summary.pages} title="Top pages" unit="view" />
            <RankedList rows={summary.sources} title="Top sources" unit="visitor" />
          </div>
        </>
      )}
    </AdminCard>
  )
}
