'use client'

import { Button, toast, useDocumentInfo, useForm } from '@payloadcms/ui'
import { useState } from 'react'
import type { StreakRecipe } from '@/features/immersive/studio/recipe'
import { refreshStudio } from './polling'
import { saveAndQueue } from './publish'

export function PublishButton() {
  const { id, setHasPublishedDoc, setUnpublishedVersionCount } = useDocumentInfo()
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
          const job = await saveAndQueue(
            submit,
            id,
            getData().recipe as StreakRecipe,
            'publish-release',
          )
          refreshStudio()
          if (job.state === 'complete') {
            // Nothing to render: the look was pointed at the release it already has.
            setHasPublishedDoc(true)
            setUnpublishedVersionCount(0)
            toast.success(`${job.title} already has these settings. The look is published at it.`)
          } else {
            toast.success('Release queued. Studio shows the posters when they finish rendering.')
          }
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
