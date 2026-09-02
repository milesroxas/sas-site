'use client'

import { useConfig } from '@payloadcms/ui'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { INQUIRY_OPEN_STATUSES, INQUIRY_TYPES, inquiryOptionLabel } from '@/shared/content/inquiry'
import { useInquiryCounts } from './useInquiryCounts'

type InboxRow = {
  id: number | string
  reference?: string | null
  name: string
  company?: string | null
  type: string
  status: string
  submittedAt?: string | null
}

/** How many requests the panel shows before sending you to the full list. */
const PREVIEW_LIMIT = 5

const OPEN_QUERY = INQUIRY_OPEN_STATUSES.map(
  (status, index) => `where[status][in][${index}]=${status}`,
).join('&')

const cardStyle: React.CSSProperties = {
  border: '1px solid var(--theme-elevation-150)',
  borderRadius: 8,
  marginBottom: 24,
  padding: 24,
}

const rowStyle: React.CSSProperties = {
  alignItems: 'baseline',
  borderTop: '1px solid var(--theme-elevation-100)',
  display: 'flex',
  gap: 16,
  padding: '10px 0',
  textDecoration: 'none',
}

const relativeDay = (value?: string | null) => {
  if (!value) return ''
  return new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

/**
 * The first thing on the dashboard: how much is waiting, and the few requests
 * at the top of the pile.
 *
 * Its job is to make an unanswered inquiry impossible to miss on the way to
 * anything else in the admin — so it stays quiet (a single reassuring line)
 * when the inbox is clear.
 */
export function InquiriesDashboard() {
  const {
    config: {
      routes: { admin, api },
    },
  } = useConfig()
  const { counts } = useInquiryCounts()
  const [rows, setRows] = useState<InboxRow[]>([])

  const listUrl = `${admin}/collections/inquiries`

  useEffect(() => {
    const controller = new AbortController()

    const load = async () => {
      try {
        const res = await fetch(
          `${api}/inquiries?limit=${PREVIEW_LIMIT}&depth=0&sort=-submittedAt&${OPEN_QUERY}`,
          { credentials: 'include', signal: controller.signal },
        )
        if (!res.ok) return
        const body = (await res.json()) as { docs?: InboxRow[] }
        setRows(body.docs ?? [])
      } catch {
        // Aborted on unmount, or offline. Counts still render and the list
        // stays as it was.
      }
    }

    void load()
    return () => controller.abort()
  }, [api])

  return (
    <section style={cardStyle}>
      <header style={{ alignItems: 'baseline', display: 'flex', gap: 16 }}>
        <h2 style={{ fontSize: 18, margin: 0 }}>Inbox</h2>
        <Link href={listUrl} style={{ fontSize: 12, marginLeft: 'auto' }}>
          Open all inquiries
        </Link>
      </header>

      <p style={{ fontSize: 14, margin: '8px 0 16px' }}>
        {counts.open === 0
          ? 'Nothing waiting. Every request has been answered or closed.'
          : `${counts.open} open · ${counts.new} not picked up · ${counts.mine} assigned to you`}
      </p>

      {rows.map((row) => (
        <Link href={`${listUrl}/${row.id}`} key={row.id} style={rowStyle}>
          <span style={{ fontVariantNumeric: 'tabular-nums', opacity: 0.6, width: 72 }}>
            {row.reference}
          </span>
          <span style={{ flex: 1 }}>
            {row.name}
            {row.company ? ` · ${row.company}` : ''}
          </span>
          <span style={{ fontSize: 12, opacity: 0.6 }}>
            {inquiryOptionLabel(INQUIRY_TYPES, row.type)}
          </span>
          <span style={{ fontSize: 12, opacity: 0.6, width: 56, textAlign: 'right' }}>
            {relativeDay(row.submittedAt)}
          </span>
        </Link>
      ))}
    </section>
  )
}
