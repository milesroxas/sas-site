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

/** The fields a quick action may change in one save. */
type InquiryPatch = Partial<{ status: InquiryStatus; assignedTo: number | string }>

/**
 * Sidebar panel that turns "read this request" into "answer it": open a reply
 * with the reference already in the subject, take ownership, or record what
 * happened — each one action instead of edit-then-save.
 *
 * Every button saves through the document form, so the document, its
 * timestamps (`repliedAt`), and the inbox counts all move together.
 *
 * The change rides in `submit({ overrides })` rather than through `setValue`
 * alone: `setValue` dispatches to the form reducer, but `submit` reads the
 * form's ref synchronously, so a value set in the same tick is not yet there
 * and the request would carry the old status. `overrides` is how Payload's own
 * Publish button sets `_status`, and is merged into the request body directly.
 * The fields are still set locally so the sidebar reflects the click at once.
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

  const save = useCallback(
    async (patch: InquiryPatch) => {
      if (patch.status !== undefined) setStatus(patch.status)
      if (patch.assignedTo !== undefined) setAssignedTo(patch.assignedTo)
      try {
        await submit({ overrides: patch })
        // The nav badge is on this same screen — let it drop straight away
        // rather than sitting a minute behind the thing just answered.
        void refreshCounts()
      } catch {
        toast.error('Could not save — try the Save button.')
      }
    },
    [refreshCounts, setAssignedTo, setStatus, submit],
  )

  const applyStatus = useCallback((next: InquiryStatus) => save({ status: next }), [save])

  const assignToMe = useCallback(async () => {
    if (!user?.id) return
    await save({
      assignedTo: user.id,
      ...(status === 'new' ? { status: 'in-progress' } : {}),
    })
  }, [save, status, user?.id])

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
