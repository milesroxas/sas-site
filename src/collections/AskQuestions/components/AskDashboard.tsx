'use client'

import { useConfig } from '@payloadcms/ui'
import { useEffect, useState } from 'react'
import { AdminCard, AdminList, AdminRow, AdminRows, AdminStats } from '@/components/admin/AdminCard'
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

/** A share of nothing is not 0%: with nothing asked there is no rate to show. */
const percent = (part: number, whole: number) =>
  whole === 0 ? '–' : `${Math.round((part / whole) * 100)}%`

/**
 * The week in Ask, beside the inbox: how much was asked, how much
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
  const [gaps, setGaps] = useState<AskQuestion[] | null>(null)

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
        // Aborted on unmount, or offline. The counts keep their placeholders.
      }
    }

    void load()
    return () => controller.abort()
  }, [api, since])

  const count = (value: (week: Week) => number) => (week ? value(week) : null)
  // The window's start is the browser's clock, so a count links only once it
  // has loaded there: a server-rendered href would never match it.
  const link = (href: string) => (week ? href : undefined)

  return (
    <AdminCard
      action="Open all questions"
      href={listUrl}
      meta={`Last ${WINDOW_DAYS} days`}
      title="Ask"
    >
      <AdminStats
        items={[
          { label: 'Asked', value: count((w) => w.asked), href: link(`${listUrl}?${since}`) },
          {
            label: 'Answered from the site',
            value: week ? percent(week.grounded, week.asked) : null,
            href: link(`${listUrl}?${since}&${GROUNDED_QUERY}`),
            quiet: !week || week.asked === 0,
          },
          {
            label: 'Content gaps',
            value: count((w) => w.gaps),
            href: link(`${listUrl}?${since}&${ASK_QUERIES.gaps}`),
          },
          {
            label: 'Thumbs down',
            value: count((w) => w.down),
            href: link(`${listUrl}?${since}&${ASK_QUERIES.thumbsDown}`),
          },
          {
            label: 'Went to a person',
            value: count((w) => w.handedOff),
            href: link(`${listUrl}?${since}&${ASK_QUERIES.handedOff}`),
          },
          {
            label: 'Inquiries from Ask',
            value: count((w) => w.leads),
            href: link(`${admin}/collections/inquiries?${since}&${FROM_ASK_QUERY}`),
          },
        ]}
        label={`Ask, last ${WINDOW_DAYS} days`}
      />

      {gaps && (
        <AdminList
          empty={
            gaps.length === 0 &&
            'None waiting. Every question the site could not answer has been looked at.'
          }
          note={gaps.length ? 'Newest first' : undefined}
          title="New content gaps"
        >
          <AdminRows>
            {gaps.map((row) => (
              <AdminRow
                details={row.pagePath ? [{ text: row.pagePath, wideOnly: true }] : []}
                href={`${listUrl}/${row.id}`}
                key={row.id}
                title={row.question}
              />
            ))}
          </AdminRows>
        </AdminList>
      )}
    </AdminCard>
  )
}
