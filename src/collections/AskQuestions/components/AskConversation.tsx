'use client'

import { useConfig, useDocumentInfo, useField } from '@payloadcms/ui'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { listDocs } from '@/components/admin/rest'
import { ASK_HANDOFFS } from '@/features/ask/handoff'
import {
  ASK_HANDOFF_SIGNALS,
  ASK_MAX_MESSAGES,
  ASK_OUTCOMES,
  ASK_RATINGS,
} from '@/features/ask/vocabulary'
import type { AskQuestion } from '@/payload-types'
import { optionLabel } from '@/shared/content/options'

const threadStyle: React.CSSProperties = {
  border: '1px solid var(--theme-elevation-150)',
  borderRadius: 8,
  display: 'flex',
  flexDirection: 'column',
  gap: 20,
  marginBottom: 24,
  padding: 20,
}

const metaStyle: React.CSSProperties = { fontSize: 12, opacity: 0.6, margin: '6px 0 0' }

const bubble = (mine: boolean): React.CSSProperties => ({
  background: mine ? 'var(--theme-elevation-800)' : 'var(--theme-elevation-50)',
  borderRadius: 12,
  color: mine ? 'var(--theme-elevation-0)' : 'inherit',
  fontSize: 14,
  lineHeight: 1.5,
  margin: 0,
  padding: '8px 12px',
  whiteSpace: 'pre-wrap',
})

/**
 * The whole conversation a row belongs to, in order, so a question is read
 * in its context: what was asked before it, what the site said, which pages
 * it drew on and how well they matched, and what the visitor did next. Sits
 * on the row itself, and on an inquiry that came from Ask (through
 * `conversationPath`), where it tells sales what the lead asked first.
 */
export function AskConversation({
  conversationPath = 'conversation',
}: {
  conversationPath?: string
}) {
  const {
    config: {
      routes: { admin, api },
    },
  } = useConfig()
  const { id, collectionSlug } = useDocumentInfo()
  const { value: conversation } = useField<string>({ path: conversationPath })
  const [turns, setTurns] = useState<AskQuestion[]>([])
  // Only a row of the log itself is one of the turns; an inquiry never is.
  const currentId = collectionSlug === 'ask-questions' ? id : null

  useEffect(() => {
    if (!conversation) return
    const controller = new AbortController()
    listDocs<AskQuestion>(
      api,
      'ask-questions',
      `where[conversation][equals]=${encodeURIComponent(conversation)}&sort=createdAt&limit=${ASK_MAX_MESSAGES}`,
      controller.signal,
    )
      .then(setTurns)
      .catch(() => {
        // Aborted on unmount, or offline: the thread stays empty.
      })
    return () => controller.abort()
  }, [api, conversation])

  if (!conversation || turns.length === 0) return null

  return (
    <section aria-label="Conversation" style={threadStyle}>
      {turns.map((turn) => (
        <Turn
          current={turn.id === currentId}
          key={turn.id}
          listUrl={`${admin}/collections/ask-questions`}
          turn={turn}
        />
      ))}
    </section>
  )
}

function Turn({
  turn,
  current,
  listUrl,
}: {
  turn: AskQuestion
  current: boolean
  listUrl: string
}) {
  const facts = [
    optionLabel(ASK_OUTCOMES, turn.outcome),
    turn.handoffReason ? `offered: ${ASK_HANDOFFS[turn.handoffReason].offer}` : null,
    optionLabel(ASK_RATINGS, turn.rating),
    turn.ratingReason,
    optionLabel(ASK_HANDOFF_SIGNALS, turn.handoff),
    turn.latencyMs ? `${(turn.latencyMs / 1000).toFixed(1)}s` : null,
  ].filter(Boolean)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, opacity: current ? 1 : 0.85 }}>
      <div style={{ alignSelf: 'flex-end', maxWidth: '80%' }}>
        <p style={bubble(true)}>{turn.question}</p>
      </div>
      <div style={{ alignSelf: 'flex-start', maxWidth: '90%' }}>
        {turn.answer ? <p style={bubble(false)}>{turn.answer}</p> : null}
        {turn.sources?.length ? (
          <ul style={{ fontSize: 12, margin: '6px 0 0', paddingLeft: 16 }}>
            {turn.sources.map((source) => (
              <li key={source.url}>
                <a href={source.url} rel="noreferrer" target="_blank">
                  {source.title}
                </a>
                {typeof source.similarity === 'number' ? ` · ${source.similarity.toFixed(2)}` : ''}
              </li>
            ))}
          </ul>
        ) : null}
        <p style={metaStyle}>
          {facts.join(' · ')}
          {current ? (
            ' · this row'
          ) : (
            <>
              {' '}
              · <Link href={`${listUrl}/${turn.id}`}>open</Link>
            </>
          )}
        </p>
      </div>
    </div>
  )
}
