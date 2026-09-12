'use client'

import { useConfig } from '@payloadcms/ui'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { AdminCard, adminRowStyle } from '@/components/admin/AdminCard'
import { countDocs, listDocs, whereIn } from '@/components/admin/rest'
import { ASK_GROUNDED_OUTCOMES } from '@/features/ask/vocabulary'
import type { AskQuestion } from '@/payload-types'
import { ASK_QUERIES, sinceQuery } from './queries'

const WINDOW_DAYS = 7
const PREVIEW_LIMIT = 5

const GROUNDED_QUERY = whereIn('outcome', ASK_GROUNDED_OUTCOMES)
const FROM_ASK_QUERY = 'where[askConversation][exists]=true'

type Week = {
  asked: number
  grounded: number
  gaps: number
  down: number
  handedOff: number
  leads: number
}

const percent = (part: number, whole: number) =>
  whole === 0 ? '0%' : `${Math.round((part / whole) * 100)}%`

/**
 * The week in Ask, under the inquiries card: how much was asked, how much
 * of it the site could answer, how the visitors rated it, how many went on
 * to a person, and the newest gaps nobody has looked at. Every number is a
 * count over the same window, and every one links to the list it was
 * counted from.
 */
export function AskDashboard() {
  const {
    config: {
      routes: { admin, api },
    },
  } = useConfig()
  const [week, setWeek] = useState<Week | null>(null)
  const [gaps, setGaps] = useState<AskQuestion[]>([])

  const listUrl = `${admin}/collections/ask-questions`
  // Fixed at mount: a window that moved every render would refetch forever.
  const [since] = useState(() => sinceQuery(WINDOW_DAYS))

  useEffect(() => {
    const controller = new AbortController()
    const count = (collection: string, query: string) =>
      countDocs(api, collection, `${since}&${query}`, controller.signal)

    const load = async () => {
      try {
        const [asked, grounded, gapCount, down, handedOff, leads, list] = await Promise.all([
          count('ask-questions', ''),
          count('ask-questions', GROUNDED_QUERY),
          count('ask-questions', ASK_QUERIES.gaps),
          count('ask-questions', ASK_QUERIES.thumbsDown),
          count('ask-questions', ASK_QUERIES.handedOff),
          count('inquiries', FROM_ASK_QUERY),
          listDocs<AskQuestion>(
            api,
            'ask-questions',
            `limit=${PREVIEW_LIMIT}&sort=-createdAt&${ASK_QUERIES.newGaps}`,
            controller.signal,
          ),
        ])
        setWeek({ asked, grounded, gaps: gapCount, down, handedOff, leads })
        setGaps(list)
      } catch {
        // Aborted on unmount, or offline. The card keeps its quiet line.
      }
    }

    void load()
    return () => controller.abort()
  }, [api, since])

  return (
    <AdminCard action="Open all questions" href={listUrl} title={`Ask, last ${WINDOW_DAYS} days`}>
      <p style={{ fontSize: 14, margin: '8px 0 16px' }}>
        {!week || week.asked === 0 ? (
          'Nothing asked this week.'
        ) : (
          <>
            <Link href={`${listUrl}?${since}`}>{week.asked} asked</Link>
            {' · '}
            <Link href={`${listUrl}?${since}&${GROUNDED_QUERY}`}>
              {percent(week.grounded, week.asked)} answered from the site
            </Link>
            {' · '}
            <Link href={`${listUrl}?${since}&${ASK_QUERIES.gaps}`}>{week.gaps} content gaps</Link>
            {' · '}
            <Link href={`${listUrl}?${since}&${ASK_QUERIES.thumbsDown}`}>
              {week.down} thumbs down
            </Link>
            {' · '}
            <Link href={`${listUrl}?${since}&${ASK_QUERIES.handedOff}`}>
              {week.handedOff} went to a person
            </Link>
            {' · '}
            <Link href={`${admin}/collections/inquiries?${since}&${FROM_ASK_QUERY}`}>
              {week.leads} inquiries from Ask
            </Link>
          </>
        )}
      </p>

      {gaps.map((row) => (
        <Link href={`${listUrl}/${row.id}`} key={row.id} style={adminRowStyle}>
          <span style={{ flex: 1 }}>{row.question}</span>
          <span style={{ fontSize: 12, opacity: 0.6 }}>{row.pagePath}</span>
        </Link>
      ))}
    </AdminCard>
  )
}
