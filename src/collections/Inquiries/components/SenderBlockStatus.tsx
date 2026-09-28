'use client'

import { useConfig } from '@payloadcms/ui'
import Link from 'next/link'
import { useEffect, useState } from 'react'

type BlockMatch = { id: number | string; kind?: 'address' | 'domain' | null; value: string }

/**
 * Whether this inquiry's sender is on the block list, with a way to the
 * entry. Asks the same lookup the intake runs, so a domain block or an
 * address spelled another way shows here too. The parent remounts it after
 * each save, which is when marking spam or not spam can change the answer.
 */
export function SenderBlockStatus({ email, style }: { email: string; style: React.CSSProperties }) {
  const {
    config: {
      routes: { admin, api },
    },
  } = useConfig()
  const [entry, setEntry] = useState<BlockMatch | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    fetch(`${api}/blocked-senders/match?email=${encodeURIComponent(email)}`, {
      credentials: 'include',
      signal: controller.signal,
    })
      .then((res) => (res.ok ? (res.json() as Promise<{ entry: BlockMatch | null }>) : null))
      .then((body) => setEntry(body?.entry ?? null))
      .catch(() => {
        // Aborted on unmount, or offline: say nothing rather than something wrong.
      })
    return () => controller.abort()
  }, [api, email])

  if (!entry) return null

  return (
    <p style={style}>
      {entry.kind === 'domain' ? `Everyone at ${entry.value} is blocked` : 'This sender is blocked'}
      : anything else they send is discarded.{' '}
      <Link href={`${admin}/collections/blocked-senders/${entry.id}`}>Manage the block</Link>
    </p>
  )
}
