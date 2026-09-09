'use client'

import { Button, FieldLabel, toast, useConfig } from '@payloadcms/ui'
import { useCallback, useEffect, useState } from 'react'
import type { BackfillSummary } from '@/features/ask/backfill'
import { formatWhen } from './formatWhen'

/**
 * Site Info › Ask action panel: rebuilds the Ask embedding index from every
 * published document and global (POST /api/ask/reindex). Publishing keeps the
 * index current on its own; this is the repair for drift, or the first pass
 * after content is imported or the extractor changes. Unchanged chunks keep
 * their vectors, so pressing it on an up-to-date corpus is cheap.
 *
 * On open it reads the last completed pass (GET /api/ask/reindex, stored by
 * the pass itself, so a CLI rebuild counts too) and says when that was.
 */
export function RebuildIndexPanel() {
  const {
    config: {
      routes: { api },
    },
  } = useConfig()

  const [busy, setBusy] = useState(false)
  const [summary, setSummary] = useState<BackfillSummary | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    const load = async () => {
      try {
        const res = await fetch(`${api}/ask/reindex`, {
          credentials: 'include',
          signal: controller.signal,
        })
        if (!res.ok) return
        const body = (await res.json()) as { lastRebuild?: BackfillSummary | null }
        setSummary(body.lastRebuild ?? null)
      } catch {
        // Aborted on unmount, or offline. The button still works; only the note is missing.
      } finally {
        if (!controller.signal.aborted) setLoaded(true)
      }
    }
    void load()
    return () => controller.abort()
  }, [api])

  const rebuild = useCallback(async () => {
    setBusy(true)
    try {
      const res = await fetch(`${api}/ask/reindex`, { method: 'POST', credentials: 'include' })
      const body = (await res.json().catch(() => ({}))) as Partial<BackfillSummary> & {
        error?: string
      }
      if (!res.ok) {
        toast.error(body.error ?? 'The rebuild failed.')
        return
      }
      const result = body as BackfillSummary
      setSummary(result)
      if (result.failures.length > 0) {
        toast.warning(`Index rebuilt with ${result.failures.length} failed document(s).`)
      } else {
        toast.success('Ask index rebuilt.')
      }
    } catch {
      toast.error('Network error. Try again.')
    } finally {
      setBusy(false)
    }
  }, [api])

  return (
    <div className="field-type" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <FieldLabel label="Ask index" />
      <p style={{ margin: 0, fontSize: 12 }}>
        Ask answers from an index of published content that publishing keeps current. Rebuild it
        after importing content or if answers seem to miss pages that are live. Pages that have not
        changed are skipped, so this is safe to run any time.
      </p>
      <div>
        <Button
          buttonStyle="secondary"
          size="medium"
          disabled={busy}
          onClick={() => void rebuild()}
        >
          {busy ? 'Rebuilding…' : 'Rebuild index'}
        </Button>
      </div>
      {busy ? (
        <p style={{ margin: 0, fontSize: 12 }}>
          Working through every published page. This usually takes under a minute.
        </p>
      ) : null}
      {summary ? (
        <p style={{ margin: 0, fontSize: 12 }}>{describe(summary)}</p>
      ) : loaded && !busy ? (
        <p style={{ margin: 0, fontSize: 12, color: 'var(--theme-elevation-500)' }}>
          Never rebuilt from here.
        </p>
      ) : null}
    </div>
  )
}

function describe(summary: BackfillSummary): string {
  const seconds = Math.max(1, Math.round(summary.durationMs / 1000))
  const parts = [
    `Last rebuilt ${formatWhen(summary.finishedAt)}: ${summary.documents} document${summary.documents === 1 ? '' : 's'}`,
    `${summary.chunks} passages`,
    summary.embedded > 0 ? `${summary.embedded} newly embedded` : 'nothing had changed',
    `${seconds}s`,
  ]
  const failures =
    summary.failures.length > 0 ? ` Failed: ${summary.failures.join(', ')} (see server logs).` : ''
  return `${parts.join(', ')}.${failures}`
}
