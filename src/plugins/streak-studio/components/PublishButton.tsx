'use client'

import { Button, toast, useDocumentInfo, useForm } from '@payloadcms/ui'
import { useState } from 'react'
import type { StreakRecipe } from '@/features/immersive/studio/recipe'
import { saveAndQueue } from './publish'

export function PublishButton() {
  const { id } = useDocumentInfo()
  const { submit, getData } = useForm()
  const [busy, setBusy] = useState(false)
  return (
    <Button
      disabled={busy}
      onClick={async () => {
        setBusy(true)
        try {
          if (!id) {
            await submit({ overrides: { _status: 'draft' } })
            return
          }
          await saveAndQueue(submit, id, getData().recipe as StreakRecipe, 'publish-release')
          toast.success('Release queued. Studio will show the finished posters automatically.')
        } catch (error) {
          toast.error((error as Error).message)
        } finally {
          setBusy(false)
        }
      }}
    >
      {busy ? 'Saving…' : id ? 'Publish release' : 'Create look'}
    </Button>
  )
}
