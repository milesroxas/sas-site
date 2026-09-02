'use client'

import { Button, toast, useAuth, useDocumentInfo, useField, useForm } from '@payloadcms/ui'
import { useCallback } from 'react'
import type { InquiryStatus } from '@/shared/content/inquiry'
import { useInquiryCounts } from './useInquiryCounts'

/** Status jumps worth a single click. Anything else uses the select above. */
const QUICK_STATUSES: { label: string; value: InquiryStatus }[] = [
  { label: 'Mark replied', value: 'replied' },
  { label: 'Close', value: 'closed' },
  { label: 'Spam', value: 'spam' },
]

const panelStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 8 }
const noteStyle: React.CSSProperties = { fontSize: 12, margin: 0 }

/**
 * Sidebar panel that turns "read this request" into "answer it": open a reply
 * with the reference already in the subject, take ownership, or record what
 * happened — each one action instead of edit-then-save.
 *
 * Every button writes through form state and then saves, so the document, its
 * timestamps (`repliedAt`), and the inbox counts all move together.
 */
export function InquiryActions() {
  const { id } = useDocumentInfo()
  const { user } = useAuth()
  const { submit } = useForm()
  const { refresh: refreshCounts } = useInquiryCounts()

  const { value: status, setValue: setStatus } = useField<InquiryStatus>({ path: 'status' })
  const { value: assignedTo, setValue: setAssignedTo } = useField<number | string>({
    path: 'assignedTo',
  })
  const { value: email } = useField<string>({ path: 'email' })
  const { value: name } = useField<string>({ path: 'name' })
  const { value: reference } = useField<string>({ path: 'reference' })

  const save = useCallback(async () => {
    try {
      await submit()
      // The nav badge is on this same screen — let it drop straight away
      // rather than sitting a minute behind the thing just answered.
      void refreshCounts()
    } catch {
      toast.error('Could not save — try the Save button.')
    }
  }, [refreshCounts, submit])

  const applyStatus = useCallback(
    async (next: InquiryStatus) => {
      setStatus(next)
      await save()
    },
    [save, setStatus],
  )

  const assignToMe = useCallback(async () => {
    if (!user?.id) return
    setAssignedTo(user.id)
    if (status === 'new') setStatus('in-progress')
    await save()
  }, [save, setAssignedTo, setStatus, status, user?.id])

  if (!id) return null

  const firstName = typeof name === 'string' ? (name.split(' ')[0] ?? name) : ''
  const mailto = email
    ? `mailto:${email}?subject=${encodeURIComponent(
        `Re: your note to the studio${reference ? ` (${reference})` : ''}`,
      )}&body=${encodeURIComponent(`Hi ${firstName},\n\n`)}`
    : undefined

  const isMine = Boolean(user?.id) && String(assignedTo ?? '') === String(user?.id)

  return (
    <div className="field-type" style={panelStyle}>
      {mailto ? (
        <Button buttonStyle="primary" el="anchor" size="medium" url={mailto}>
          Reply by email
        </Button>
      ) : null}

      <Button buttonStyle="secondary" disabled={isMine} onClick={assignToMe} size="medium">
        {isMine ? 'Assigned to you' : 'Assign to me'}
      </Button>

      {QUICK_STATUSES.filter((quick) => quick.value !== status).map((quick) => (
        <Button
          buttonStyle="secondary"
          key={quick.value}
          onClick={() => void applyStatus(quick.value)}
          size="medium"
        >
          {quick.label}
        </Button>
      ))}

      <p style={noteStyle}>
        Replying opens your mail client with {reference ? `${reference} ` : ''}in the subject, so
        their answer threads back to this request.
      </p>
    </div>
  )
}
