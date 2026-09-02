'use client'

import { useConfig } from '@payloadcms/ui'
import Link from 'next/link'
import { useInquiryCounts } from './useInquiryCounts'

/**
 * Standing count of unanswered requests, pinned above the admin nav so it is
 * on screen no matter which document someone is in. Renders nothing when the
 * inbox is clear — a badge that is always there stops being read.
 */
export function InboxNavBadge() {
  const {
    config: {
      routes: { admin },
    },
  } = useConfig()
  const { counts } = useInquiryCounts()

  if (counts.new === 0) return null

  return (
    <Link
      href={`${admin}/collections/inquiries?where[status][equals]=new`}
      style={{
        alignItems: 'center',
        background: 'var(--theme-success-500, var(--theme-elevation-800))',
        borderRadius: 4,
        color: 'var(--theme-elevation-0)',
        display: 'flex',
        fontSize: 12,
        gap: 8,
        justifyContent: 'space-between',
        margin: '0 0 16px',
        padding: '8px 12px',
        textDecoration: 'none',
      }}
    >
      <span>{counts.new === 1 ? 'New inquiry' : `${counts.new} new inquiries`}</span>
      <span aria-hidden="true">→</span>
    </Link>
  )
}
