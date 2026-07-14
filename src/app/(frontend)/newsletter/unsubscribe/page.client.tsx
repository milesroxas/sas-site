'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

type Status = 'idle' | 'loading' | 'done' | 'error'

/**
 * The unsubscribe action lives behind a button (POST) so link-prefetching mail scanners can
 * never unsubscribe someone by following the footer link.
 */
export function UnsubscribeForm({ token }: { token: string }) {
  const [status, setStatus] = useState<Status>('idle')

  const unsubscribe = async () => {
    setStatus('loading')
    try {
      const res = await fetch(`/api/newsletter/unsubscribe?token=${encodeURIComponent(token)}`, {
        method: 'POST',
      })
      setStatus(res.ok ? 'done' : 'error')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'done') {
    return (
      <p className="mt-4 text-muted-foreground" role="status">
        You&apos;re unsubscribed. You won&apos;t hear from the newsletter again — though you can
        always sign back up.
      </p>
    )
  }

  return (
    <div className="mt-6">
      <Button size="lg" onClick={() => void unsubscribe()} disabled={status === 'loading'}>
        {status === 'loading' ? 'Unsubscribing…' : 'Unsubscribe'}
      </Button>
      {status === 'error' ? (
        <p className="mt-3 text-sm text-destructive" role="alert">
          Something went wrong. Please try again.
        </p>
      ) : null}
    </div>
  )
}
