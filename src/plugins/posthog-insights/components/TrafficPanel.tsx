'use client'

import { Button, ShimmerEffect, useConfig } from '@payloadcms/ui'
import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { AdminCard, AdminList } from '@/components/admin/AdminCard'
import {
  DEFAULT_WINDOW,
  formatRate,
  type InsightsSummary,
  leadRate,
  METRICS,
  type Metric,
  type MetricKey,
  metricOf,
  type Ranked,
  SUMMARY_PATH,
  WINDOWS,
  type WindowDays,
} from '../summary'
import { TrendChart } from './TrendChart'
import styles from './traffic.module.css'

const TITLE = 'Site traffic'
const POSTHOG_HOME = 'https://us.posthog.com'

/**
 * The site's traffic at a glance, under the inbox and Ask: who came, how many
 * wrote in, what they read and where they came from, each number beside its
 * change against the window before. Production only, team browsers left out.
 *
 * The first window arrives with the page (`initial`, rendered on the server);
 * the other is fetched the first time it is asked for and kept, so switching
 * back is instant.
 */
export function TrafficPanel({ initial }: { initial: InsightsSummary | null }) {
  const {
    config: {
      routes: { api },
    },
  } = useConfig()
  const [days, setDays] = useState<WindowDays>(initial?.days ?? DEFAULT_WINDOW)
  const [metricKey, setMetricKey] = useState<MetricKey>('visitors')
  const [answers, setAnswers] = useState<Partial<Record<WindowDays, InsightsSummary>>>(
    initial ? { [initial.days]: initial } : {},
  )
  const [failed, setFailed] = useState(false)
  const chartId = useId()

  const answer = answers[days]
  const loaded = answer !== undefined

  const load = useCallback(
    (windowDays: WindowDays, signal?: AbortSignal) => {
      setFailed(false)
      return fetch(`${api}${SUMMARY_PATH}?days=${windowDays}`, { credentials: 'include', signal })
        .then(async (res) => {
          if (!res.ok) throw new Error(String(res.status))
          const summary = (await res.json()) as InsightsSummary
          setAnswers((was) => ({ ...was, [windowDays]: summary }))
        })
        .catch(() => {
          // Aborted by a window change or unmount, or PostHog did not answer.
          if (!signal?.aborted) setFailed(true)
        })
    },
    [api],
  )

  useEffect(() => {
    if (loaded) return
    const controller = new AbortController()
    void load(days, controller.signal)
    return () => controller.abort()
  }, [days, loaded, load])

  const retry = () => void load(days)

  // While a window loads, the last answer holds the frame, dimmed: no
  // skeleton flash, no layout jump.
  const shown = answer ?? Object.values(answers)[0]
  const metric = metricOf(metricKey)
  const windowControl = <WindowToggle days={days} onChange={setDays} />

  if (!shown) {
    return (
      <Pair>
        <AdminCard action="Open PostHog" controls={windowControl} href={POSTHOG_HOME} title={TITLE}>
          {failed ? <Failed onRetry={retry} /> : <TrafficSkeleton />}
        </AdminCard>
        <ListsCard days={days}>{failed ? null : <ListsSkeleton />}</ListsCard>
      </Pair>
    )
  }

  const busy = !answer && !failed
  return (
    <Pair>
      <AdminCard action="Open PostHog" controls={windowControl} href={shown.url} title={TITLE}>
        <div className={styles.panel} data-busy={busy}>
          {failed && !answer && <Failed onRetry={retry} />}
          <StatTabs chartId={chartId} metric={metricKey} onSelect={setMetricKey} summary={shown} />
          <div aria-labelledby={`${chartId}-${metricKey}`} id={chartId} role="tabpanel">
            <TrendChart
              metric={metric}
              points={shown.trend ?? []}
              previousLabel={`Previous ${shown.days} days`}
            />
          </div>
          <p className={styles.caption}>
            Production only, team browsers left out. Changes compare the {shown.days} days before.
          </p>
        </div>
      </AdminCard>
      <ListsCard days={shown.days}>
        <div className={styles.lists} data-busy={busy}>
          <RankedBars rows={shown.pages} title="Top pages" unit="views" />
          <RankedBars rows={shown.sources} title="Top sources" unit="visitors" />
        </div>
      </ListsCard>
    </Pair>
  )
}

/** The two cards: side by side on a wide widget, stacked on a narrow one. */
function Pair({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.pair}>
      <div className={styles.pairRow}>{children}</div>
    </div>
  )
}

/**
 * The traffic card's other half: what was read and where readers came
 * from, for the window the traffic card is set to. Its link is the traffic
 * card's.
 */
function ListsCard({ days, children }: { days: WindowDays; children: React.ReactNode }) {
  return (
    <AdminCard meta={`Last ${days} days`} title="Pages and sources">
      {children}
    </AdminCard>
  )
}

/** 7 or 30 days: two segments and a thumb that slides between them. */
function WindowToggle({
  days,
  onChange,
}: {
  days: WindowDays
  onChange: (days: WindowDays) => void
}) {
  const index = WINDOWS.indexOf(days)
  return (
    // biome-ignore lint/a11y/useSemanticElements: a pressed-button group, not a form field.
    <div aria-label="Window" className={styles.toggle} role="group">
      <span
        aria-hidden
        className={styles.toggleThumb}
        style={{ '--count': WINDOWS.length, '--index': index } as React.CSSProperties}
      />
      {WINDOWS.map((option) => (
        <button
          aria-pressed={option === days}
          className={styles.toggleButton}
          key={option}
          onClick={() => onChange(option)}
          type="button"
        >
          {option} days
        </button>
      ))}
    </div>
  )
}

/**
 * The three counts, each a tab that puts its own days on the chart. The arrow
 * keys move between them as in any tab list. Every tile in the row is a tab,
 * so every one looks and acts like one.
 */
function StatTabs({
  summary,
  metric,
  onSelect,
  chartId,
}: {
  summary: InsightsSummary
  metric: MetricKey
  onSelect: (metric: MetricKey) => void
  chartId: string
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([])

  const onKeyDown = (event: React.KeyboardEvent, index: number) => {
    const step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -1, ArrowDown: 1 }[event.key]
    if (!step) return
    event.preventDefault()
    const next = (index + step + METRICS.length) % METRICS.length
    const target = METRICS[next]
    if (!target) return
    onSelect(target.key)
    refs.current[next]?.focus()
  }

  return (
    <div aria-label="Chart" className={styles.tiles} role="tablist">
      {METRICS.map((entry, index) => {
        const selected = entry.key === metric
        return (
          <button
            aria-controls={chartId}
            aria-selected={selected}
            className={styles.tile}
            id={`${chartId}-${entry.key}`}
            key={entry.key}
            onClick={() => onSelect(entry.key)}
            onKeyDown={(event) => onKeyDown(event, index)}
            ref={(node) => {
              refs.current[index] = node
            }}
            role="tab"
            tabIndex={selected ? 0 : -1}
            type="button"
          >
            <Tile metric={entry} summary={summary} />
          </button>
        )
      })}
    </div>
  )
}

function Tile({ metric, summary }: { metric: Metric; summary: InsightsSummary }) {
  return (
    <>
      <span className={styles.tileLabel}>{metric.label}</span>
      <span className={styles.tileReading}>
        <span className={styles.tileValue}>{metric.format(metric.value(summary.current))}</span>
        <Delta metric={metric} summary={summary} />
        {metric.key === 'leads' && <LeadRate summary={summary} />}
      </span>
    </>
  )
}

function Delta({ metric, summary }: { metric: Metric; summary: InsightsSummary }) {
  const delta = metric.delta(summary.current, summary.previous)
  const direction = delta.value > 0 ? 'up' : delta.value < 0 ? 'down' : 'flat'
  return (
    <span className={styles.delta} data-direction={direction}>
      {direction !== 'flat' && <Arrow down={direction === 'down'} />}
      {direction === 'flat' ? 'No change' : delta.text}
      <span className={styles.srOnly}> against the {summary.days} days before</span>
    </span>
  )
}

/**
 * Leads per visitor, beside the leads it explains; the window before's rate
 * is in its title and read aloud. Not a tab of its own: a daily rate swings
 * on a single lead, so it has no chart worth drawing.
 */
function LeadRate({ summary }: { summary: InsightsSummary }) {
  const now = leadRate(summary.current)
  if (now === null) return null
  const before = leadRate(summary.previous)
  const was = before === null ? '' : `, was ${formatRate(before)}`
  return (
    <span className={styles.tileNote} title={`${formatRate(now)} of visitors became leads${was}`}>
      {formatRate(now)} of visitors
      <span className={styles.srOnly}>{was}</span>
    </span>
  )
}

function Arrow({ down }: { down: boolean }) {
  return (
    <svg aria-hidden="true" fill="none" height="12" viewBox="0 0 12 12" width="12">
      <path
        d={down ? 'M6 2.5v7M3 6.5l3 3 3-3' : 'M6 9.5v-7M3 5.5l3-3 3 3'}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  )
}

/** A ranked list as bars, each scaled against the first so the lead reads at a glance. */
function RankedBars({ title, unit, rows }: { title: string; unit: string; rows: Ranked[] }) {
  const max = Math.max(1, ...rows.map((row) => row.count))
  return (
    <AdminList empty={rows.length === 0 && 'Nothing in this window yet.'} note={unit} title={title}>
      <ol className={styles.ranks}>
        {rows.map((row) => (
          <li className={styles.rank} key={row.label}>
            <span
              aria-hidden
              className={styles.rankFill}
              style={{ '--share': `${(row.count / max) * 100}%` } as React.CSSProperties}
            />
            <span className={styles.rankLabel} title={row.label}>
              {row.label}
            </span>
            <span className={styles.rankValue}>{row.count.toLocaleString('en-US')}</span>
          </li>
        ))}
      </ol>
    </AdminList>
  )
}

function Failed({ onRetry }: { onRetry: () => void }) {
  return (
    <div className={styles.notice} role="alert">
      <p>PostHog did not answer. It usually does within a minute.</p>
      <Button buttonStyle="secondary" margin={false} onClick={onRetry} size="small">
        Try again
      </Button>
    </div>
  )
}

/** The widget while the server is still asking PostHog: both cards, and their shape. */
export function TrafficFallback() {
  return (
    <Pair>
      <AdminCard action="Open PostHog" href={POSTHOG_HOME} title={TITLE}>
        <TrafficSkeleton />
      </AdminCard>
      <ListsCard days={DEFAULT_WINDOW}>
        <ListsSkeleton />
      </ListsCard>
    </Pair>
  )
}

/** The traffic card's shape while the first answer is on its way, so nothing jumps when it lands. */
function TrafficSkeleton() {
  return (
    <div aria-busy className={styles.panel}>
      <span className={styles.srOnly}>Loading site traffic.</span>
      <ShimmerEffect height={78} />
      <ShimmerEffect height={212} />
    </div>
  )
}

function ListsSkeleton() {
  return (
    <div aria-hidden className={styles.lists}>
      <ShimmerEffect height={168} />
      <ShimmerEffect height={168} />
    </div>
  )
}
