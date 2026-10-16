'use client'

import { Button } from '@payloadcms/ui'
import { useCallback } from 'react'
import { useInquiryCounts } from './useInquiryCounts'

const timeOf = (date: Date) =>
  date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })

/**
 * The one way the inbox numbers move without an edit: a press. Shows when
 * they were last counted so a stale screen reads as stale. `onRefresh` lets
 * the screen reload whatever else it shows (the dashboard's open requests,
 * the list's rows) in the same press.
 */
export function RefreshCounts({ onRefresh }: { onRefresh?: () => void }) {
  const { refresh, refreshing, refreshedAt } = useInquiryCounts()

  const press = useCallback(() => {
    void refresh()
    onRefresh?.()
  }, [onRefresh, refresh])

  return (
    <div style={{ alignItems: 'center', display: 'flex', gap: 8 }}>
      {refreshedAt && (
        <span aria-live="polite" style={{ fontSize: 12, opacity: 0.7, whiteSpace: 'nowrap' }}>
          as of {timeOf(refreshedAt)}
        </span>
      )}
      <Button
        buttonStyle="secondary"
        disabled={refreshing}
        margin={false}
        onClick={press}
        size="small"
      >
        {refreshing ? 'Refreshing' : 'Refresh'}
      </Button>
    </div>
  )
}
