'use client'

import { Button, ConfirmationModal, toast, useConfig, useModal } from '@payloadcms/ui'
import { useRouter } from 'next/navigation'
import { useCallback } from 'react'
import { useListWhere, whereOf } from '@/components/admin/FilterLinks'
import { INQUIRY_QUERIES } from './queries'
import { useInquiryCounts } from './useInquiryCounts'

const MODAL_SLUG = 'inquiries-delete-all-spam'

const plural = (count: number) => (count === 1 ? '1 inquiry' : `${count} inquiries`)

/**
 * Clears the spam view in one press, shown only on that view and only when
 * there is something to clear.
 *
 * It deletes by query, not by the rows on screen, through the REST bulk
 * delete: every inquiry marked spam at the moment of the press goes, on every
 * page, with the collection's own access control and hooks. The block list is
 * a separate collection, so deleting an inquiry never lifts a block.
 */
export function EmptySpam() {
  const {
    config: {
      routes: { api },
    },
  } = useConfig()
  const { openModal } = useModal()
  const router = useRouter()
  const { counts, refresh } = useInquiryCounts()
  const onSpamView = useListWhere() === whereOf(INQUIRY_QUERIES.spam)

  const deleteAll = useCallback(async () => {
    try {
      const res = await fetch(`${api}/inquiries?${INQUIRY_QUERIES.spam}&depth=0&select[id]=true`, {
        credentials: 'include',
        method: 'DELETE',
      })
      const body = (await res.json().catch(() => ({}))) as { docs?: unknown[]; errors?: unknown[] }
      const deleted = body.docs?.length ?? 0
      const failed = body.errors?.length ?? 0
      if (failed > 0) {
        toast.error(`Deleted ${plural(deleted)}. ${plural(failed)} could not be deleted.`)
      } else if (!res.ok) {
        toast.error('Could not delete the spam. Try again.')
      } else {
        toast.success(`Deleted ${plural(deleted)} marked spam.`)
      }
    } catch {
      toast.error('Could not delete the spam. Try again.')
    }
    void refresh()
    router.refresh()
  }, [api, refresh, router])

  const confirm = useCallback(() => {
    // The count in the prompt should be the count now, not the last poll's.
    void refresh()
    openModal(MODAL_SLUG)
  }, [openModal, refresh])

  if (!onSpamView || counts.spam === 0) return null

  return (
    <div
      style={{
        alignItems: 'center',
        display: 'flex',
        flexWrap: 'wrap',
        gap: 12,
        justifyContent: 'space-between',
        marginBottom: 16,
      }}
    >
      <p style={{ fontSize: 12, margin: 0, opacity: 0.7 }}>
        Deleting spam leaves the block list as it is: blocked senders stay blocked.
      </p>
      <Button buttonStyle="secondary" margin={false} onClick={confirm} size="small">
        Delete all spam
      </Button>
      <ConfirmationModal
        body={`This permanently deletes ${plural(counts.spam)} marked spam. It cannot be undone. Blocked senders stay blocked.`}
        confirmingLabel="Deleting"
        confirmLabel="Delete all"
        heading="Delete all spam?"
        modalSlug={MODAL_SLUG}
        onConfirm={deleteAll}
      />
    </div>
  )
}
