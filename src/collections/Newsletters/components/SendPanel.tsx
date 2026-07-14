'use client'

import { Button, toast, useConfig, useDocumentInfo } from '@payloadcms/ui'
import { useCallback, useEffect, useState } from 'react'
import type { Newsletter } from '@/payload-types'

type DeliveryState = Pick<Newsletter, 'deliveryStatus' | 'sentAt' | 'recipientCount' | 'sendError'>

/**
 * Sidebar panel with "Send test" and "Send" actions. Delivery state is fetched from the
 * *published* document rather than read from form state: the form shows the latest draft, which
 * can lag behind what the send job has written.
 */
export function SendPanel() {
  const { id, hasPublishedDoc } = useDocumentInfo()
  const {
    config: {
      routes: { api },
    },
  } = useConfig()

  const [delivery, setDelivery] = useState<DeliveryState | null>(null)
  const [busy, setBusy] = useState(false)
  const [armed, setArmed] = useState(false)

  const refreshDelivery = useCallback(async () => {
    if (!id) return
    try {
      // Select only the delivery fields — this polls every 5s during a send, and the full
      // document would drag the entire content blocks JSON along each time.
      const select =
        'select[deliveryStatus]=true&select[sentAt]=true&select[recipientCount]=true&select[sendError]=true'
      const res = await fetch(`${api}/newsletters/${id}?depth=0&${select}`, {
        credentials: 'include',
      })
      if (res.ok) setDelivery((await res.json()) as DeliveryState)
    } catch {
      // Leave the last known state in place; the next poll or action retries.
    }
  }, [api, id])

  useEffect(() => {
    void refreshDelivery()
  }, [refreshDelivery])

  const status = delivery?.deliveryStatus ?? 'unsent'

  // While a send is running, poll so the panel flips to "sent" without a manual refresh.
  useEffect(() => {
    if (status !== 'sending') return
    const interval = setInterval(() => void refreshDelivery(), 5000)
    return () => clearInterval(interval)
  }, [status, refreshDelivery])

  const post = useCallback(
    async (path: string) => {
      setBusy(true)
      try {
        const res = await fetch(`${api}/newsletters/${id}${path}`, {
          method: 'POST',
          credentials: 'include',
        })
        const body = (await res.json().catch(() => ({}))) as { message?: string; error?: string }
        if (res.ok) {
          toast.success(body.message ?? 'Done')
        } else {
          toast.error(body.error ?? 'Something went wrong')
        }
      } catch {
        toast.error('Network error — try again')
      } finally {
        setBusy(false)
        setArmed(false)
        void refreshDelivery()
      }
    },
    [api, id, refreshDelivery],
  )

  if (!id) return null

  const sentSummary =
    status === 'sent' && delivery
      ? `Sent${delivery.sentAt ? ` ${new Date(delivery.sentAt).toLocaleString()}` : ''}${
          typeof delivery.recipientCount === 'number'
            ? ` to ${delivery.recipientCount} recipient${delivery.recipientCount === 1 ? '' : 's'}`
            : ''
        }.`
      : null

  return (
    <div className="field-type" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Button
        buttonStyle="secondary"
        size="medium"
        disabled={busy}
        onClick={() => void post('/send-test')}
      >
        Send test to me
      </Button>

      {status === 'sent' ? (
        <p style={{ margin: 0, fontSize: 12 }}>{sentSummary}</p>
      ) : status === 'sending' ? (
        <p style={{ margin: 0, fontSize: 12 }}>
          Sending… this panel updates automatically. If a send ever stalls, it unlocks for retry
          after 15 minutes.
        </p>
      ) : (
        <>
          {status === 'failed' && delivery?.sendError ? (
            <p style={{ margin: 0, fontSize: 12 }}>
              Send failed: {delivery.sendError} Retrying resumes where it stopped.
            </p>
          ) : null}
          {armed ? (
            <>
              <Button
                buttonStyle="primary"
                size="medium"
                disabled={busy}
                onClick={() => void post('/send')}
              >
                {status === 'failed' ? 'Confirm retry' : 'Confirm send'}
              </Button>
              <Button buttonStyle="secondary" size="medium" onClick={() => setArmed(false)}>
                Cancel
              </Button>
            </>
          ) : (
            <Button
              buttonStyle="primary"
              size="medium"
              disabled={busy || !hasPublishedDoc}
              onClick={() => setArmed(true)}
            >
              {status === 'failed' ? 'Retry send' : 'Send to audiences'}
            </Button>
          )}
          <p style={{ margin: 0, fontSize: 12 }}>
            {hasPublishedDoc
              ? 'Sends the published version to every subscribed member of the selected audiences.'
              : 'Publish before sending. Test sends use the current draft.'}
          </p>
        </>
      )}
    </div>
  )
}
