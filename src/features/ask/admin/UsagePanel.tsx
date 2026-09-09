'use client'

import { Button, FieldLabel, useConfig } from '@payloadcms/ui'
import { useCallback, useEffect, useState } from 'react'
import type { UsageReport } from '@/features/ask/usage'
import { formatWhen } from './formatWhen'

/**
 * Site Info › Ask usage panel: what the Ask feature is costing at OpenAI.
 *
 * Opening the panel reads the last stored report (GET /api/ask/usage, team-
 * only) and never touches OpenAI. Only the Refresh button does (POST), because
 * the OpenAI Admin API allows 30 requests a minute and each refresh spends
 * three. The note beside the button says when the figures were last fetched.
 *
 * Spend is the figure OpenAI bills; tokens are split by model so answer
 * traffic (gpt-5-mini) and index rebuilds (text-embedding-3-small) stay
 * distinguishable. OpenAI has no API for the remaining prepaid balance, so the
 * panel links to Billing for that.
 */

const BILLING_URL = 'https://platform.openai.com/settings/organization/billing/overview'
const ADMIN_KEYS_URL = 'https://platform.openai.com/settings/organization/admin-keys'

type State =
  | { kind: 'loading' }
  | { kind: 'unconfigured' }
  /** Configured; `report` is null until the first refresh. */
  | { kind: 'ready'; report: UsageReport | null; error: string | null }

type UsageResponse = { configured?: boolean; report?: UsageReport | null; error?: string }

const noteStyle: React.CSSProperties = { margin: 0, fontSize: 12 }

const tilesStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
  gap: 12,
}

const tileStyle: React.CSSProperties = {
  border: '1px solid var(--theme-elevation-150)',
  borderRadius: 6,
  padding: '10px 12px',
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
}

const tileLabelStyle: React.CSSProperties = {
  fontSize: 11,
  color: 'var(--theme-elevation-500)',
}

const tileValueStyle: React.CSSProperties = {
  fontSize: 20,
  fontWeight: 600,
  lineHeight: 1.2,
}

const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: 12,
}

const cellStyle: React.CSSProperties = {
  padding: '6px 0',
  borderTop: '1px solid var(--theme-elevation-100)',
  textAlign: 'left',
}

const numCellStyle: React.CSSProperties = {
  ...cellStyle,
  textAlign: 'right',
  fontVariantNumeric: 'tabular-nums',
}

const headCellStyle: React.CSSProperties = {
  ...cellStyle,
  borderTop: 'none',
  color: 'var(--theme-elevation-500)',
  fontWeight: 400,
}

const headNumCellStyle: React.CSSProperties = { ...headCellStyle, textAlign: 'right' }

const tokens = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 })

const formatMoney = (amount: number, currency: string) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
    maximumFractionDigits: amount < 1 ? 4 : 2,
  }).format(amount)

export function UsagePanel() {
  const {
    config: {
      routes: { api },
    },
  } = useConfig()

  const [state, setState] = useState<State>({ kind: 'loading' })
  const [refreshing, setRefreshing] = useState(false)

  // The stored snapshot: one DB read, no OpenAI call.
  useEffect(() => {
    const controller = new AbortController()
    const load = async () => {
      try {
        const res = await fetch(`${api}/ask/usage`, {
          credentials: 'include',
          signal: controller.signal,
        })
        const body = (await res.json().catch(() => ({}))) as UsageResponse
        if (!res.ok) {
          setState({ kind: 'ready', report: null, error: body.error ?? 'Could not load usage.' })
        } else if (body.configured === false) {
          setState({ kind: 'unconfigured' })
        } else {
          setState({ kind: 'ready', report: body.report ?? null, error: null })
        }
      } catch {
        if (controller.signal.aborted) return
        setState({ kind: 'ready', report: null, error: 'Network error. Try again.' })
      }
    }
    void load()
    return () => controller.abort()
  }, [api])

  // The only path that reaches OpenAI. A failed refresh keeps the last report on screen.
  const refresh = useCallback(async () => {
    setRefreshing(true)
    try {
      const res = await fetch(`${api}/ask/usage`, { method: 'POST', credentials: 'include' })
      const body = (await res.json().catch(() => ({}))) as UsageResponse
      if (res.status === 503 && body.configured === false) {
        setState({ kind: 'unconfigured' })
      } else if (!res.ok || !body.report) {
        setState((prev) => ({
          kind: 'ready',
          report: prev.kind === 'ready' ? prev.report : null,
          error: body.error ?? 'The usage request failed.',
        }))
      } else {
        setState({ kind: 'ready', report: body.report, error: null })
      }
    } catch {
      setState((prev) => ({
        kind: 'ready',
        report: prev.kind === 'ready' ? prev.report : null,
        error: 'Network error. Try again.',
      }))
    } finally {
      setRefreshing(false)
    }
  }, [api])

  return (
    <div className="field-type" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <FieldLabel label="OpenAI usage" />
      {state.kind === 'loading' ? <p style={noteStyle}>Loading the last report…</p> : null}
      {state.kind === 'unconfigured' ? <Unconfigured /> : null}
      {state.kind === 'ready' ? (
        <>
          {state.error ? (
            <p style={{ ...noteStyle, color: 'var(--theme-error-500)' }}>{state.error}</p>
          ) : null}
          {state.report ? (
            <Report report={state.report} />
          ) : (
            <p style={noteStyle}>
              No figures fetched yet. Refresh pulls the latest spend and tokens from OpenAI.
            </p>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Button
              buttonStyle="secondary"
              size="small"
              disabled={refreshing}
              onClick={() => void refresh()}
            >
              {refreshing ? 'Refreshing…' : 'Refresh'}
            </Button>
            <span style={{ ...noteStyle, color: 'var(--theme-elevation-500)' }}>
              {state.report
                ? `Last refreshed ${formatWhen(state.report.fetchedAt)}. Figures only update when you refresh, and lag OpenAI by a few minutes.`
                : 'Figures only update when you refresh.'}
            </span>
          </div>
        </>
      ) : null}
    </div>
  )
}

function Unconfigured() {
  return (
    <p style={noteStyle}>
      Not connected. Create an Admin key under{' '}
      <a href={ADMIN_KEYS_URL} target="_blank" rel="noreferrer">
        Organization › Admin keys
      </a>{' '}
      at OpenAI and set it as <code>OPENAI_ADMIN_API_KEY</code> (a project key cannot read usage).
      Optionally set <code>OPENAI_PROJECT_ID</code> to scope the figures to this site&apos;s
      project.
    </p>
  )
}

function Report({ report }: { report: UsageReport }) {
  const { spend, completions, embeddings, currency } = report
  const scope = report.projectId ? 'this project' : 'the whole organization'

  return (
    <>
      <div style={tilesStyle}>
        <Tile label="Spent this month" value={formatMoney(spend.monthToDate, currency)} />
        <Tile label="Spent, last 30 days" value={formatMoney(spend.last30Days, currency)} />
        <Tile
          label="Answers, 30 days"
          value={tokens.format(completions.requests)}
          detail={`${tokens.format(completions.inputTokens)} in · ${tokens.format(completions.outputTokens)} out`}
        />
        <Tile
          label="Embeddings, 30 days"
          value={tokens.format(embeddings.requests)}
          detail={`${tokens.format(embeddings.inputTokens)} tokens`}
        />
      </div>

      {spend.byLineItem.length > 0 ? (
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={headCellStyle}>Cost by line item, 30 days</th>
              <th style={headNumCellStyle}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {spend.byLineItem.map((row) => (
              <tr key={row.lineItem}>
                <td style={cellStyle}>{row.lineItem}</td>
                <td style={numCellStyle}>{formatMoney(row.amount, currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}

      {completions.byModel.length > 0 || embeddings.byModel.length > 0 ? (
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={headCellStyle}>Tokens by model, 30 days</th>
              <th style={headNumCellStyle}>Requests</th>
              <th style={headNumCellStyle}>Input</th>
              <th style={headNumCellStyle}>Cached</th>
              <th style={headNumCellStyle}>Output</th>
            </tr>
          </thead>
          <tbody>
            {completions.byModel.map((row) => (
              <tr key={`c-${row.model}`}>
                <td style={cellStyle}>{row.model}</td>
                <td style={numCellStyle}>{tokens.format(row.requests)}</td>
                <td style={numCellStyle}>{tokens.format(row.inputTokens)}</td>
                <td style={numCellStyle}>{tokens.format(row.cachedInputTokens)}</td>
                <td style={numCellStyle}>{tokens.format(row.outputTokens)}</td>
              </tr>
            ))}
            {embeddings.byModel.map((row) => (
              <tr key={`e-${row.model}`}>
                <td style={cellStyle}>{row.model}</td>
                <td style={numCellStyle}>{tokens.format(row.requests)}</td>
                <td style={numCellStyle}>{tokens.format(row.inputTokens)}</td>
                <td style={numCellStyle}>–</td>
                <td style={numCellStyle}>–</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}

      <p style={{ ...noteStyle, color: 'var(--theme-elevation-500)' }}>
        Covers {scope}, {report.window.start} to {report.window.end} (UTC days). OpenAI does not
        expose the remaining prepaid balance over its API; check{' '}
        <a href={BILLING_URL} target="_blank" rel="noreferrer">
          Billing
        </a>{' '}
        for credits left.
      </p>
    </>
  )
}

function Tile({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return (
    <div style={tileStyle}>
      <span style={tileLabelStyle}>{label}</span>
      <span style={tileValueStyle}>{value}</span>
      {detail ? <span style={tileLabelStyle}>{detail}</span> : null}
    </div>
  )
}
