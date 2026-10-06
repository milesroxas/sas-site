'use client'

import { useAuth, useConfig } from '@payloadcms/ui'
import { useEffect, useState } from 'react'
import { AdminCard, AdminList, AdminRow, AdminRows, AdminStats } from '@/components/admin/AdminCard'
import { listDocs } from '@/components/admin/rest'
import { INQUIRY_TYPES, inquiryOptionLabel } from '@/shared/content/inquiry'
import { assignedToQuery, INQUIRY_QUERIES } from './queries'
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

const shortDay = (value?: string | null) => {
  if (!value) return ''
  return new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

/**
 * The first widget on the dashboard, beside Ask: how much is waiting, and the
 * few requests at the top of the pile.
 *
 * Its job is to make an unanswered inquiry impossible to miss on the way to
 * anything else in the admin. A request nobody has picked up is the one count
 * that carries a flag; when the inbox is clear the counts step back and a
 * single line says so.
 */
export function InquiriesDashboard() {
  const {
    config: {
      routes: { admin, api },
    },
  } = useConfig()
  const { user } = useAuth()
  const { counts, loaded } = useInquiryCounts()
  const [rows, setRows] = useState<InboxRow[] | null>(null)

  const listUrl = `${admin}/collections/inquiries`

  useEffect(() => {
    const controller = new AbortController()
    listDocs<InboxRow>(
      api,
      'inquiries',
      `limit=${PREVIEW_LIMIT}&sort=-submittedAt&${INQUIRY_QUERIES.open}`,
      controller.signal,
    )
      .then(setRows)
      .catch(() => {
        // Aborted on unmount, or offline. Counts still render and the list
        // stays as it was.
      })
    return () => controller.abort()
  }, [api])

  const value = (count: number) => (loaded ? count : null)

  return (
    <AdminCard
      action="Open all inquiries"
      href={`${listUrl}?${INQUIRY_QUERIES.inbox}`}
      title="Inbox"
    >
      <AdminStats
        items={[
          { label: 'Open', value: value(counts.open), href: `${listUrl}?${INQUIRY_QUERIES.open}` },
          {
            label: 'Not picked up',
            value: value(counts.new),
            href: `${listUrl}?${INQUIRY_QUERIES.new}`,
            flag: counts.new > 0,
          },
          {
            label: 'Assigned to you',
            value: value(counts.mine),
            href: user ? `${listUrl}?${assignedToQuery(user.id)}` : undefined,
          },
        ]}
        label="Inbox counts"
      />

      {rows && (
        <AdminList
          empty={rows.length === 0 && 'Nothing waiting. Every request has been answered or closed.'}
          note={rows.length ? 'Newest first' : undefined}
          title="Open requests"
        >
          <AdminRows>
            {rows.map((row) => (
              <AdminRow
                details={[
                  { text: inquiryOptionLabel(INQUIRY_TYPES, row.type) ?? row.type, wideOnly: true },
                  { text: shortDay(row.submittedAt) },
                ]}
                href={`${listUrl}/${row.id}`}
                key={row.id}
                lead={row.reference}
                title={row.company ? `${row.name} · ${row.company}` : row.name}
              />
            ))}
          </AdminRows>
        </AdminList>
      )}
    </AdminCard>
  )
}
