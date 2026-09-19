'use client'

import { Button, toast, useDocumentInfo, useForm } from '@payloadcms/ui'
import { useState } from 'react'
import { canonicalJSON, snapshotRecipe } from '@/features/immersive/studio/recipe'
import { useDraft } from './draft'
import { refreshStudio, useLook } from './look-store'
import { publishLook } from './publish'

/**
 * Publish, for a look used like a media file: the two posters render in this
 * browser and the look is published with them in one request, so it is done
 * when the button says so. Every place that uses the look shows the result.
 */
export function PublishButton() {
  const {
    id,
    incrementVersionCount,
    setHasPublishedDoc,
    setMostRecentVersionIsAutosaved,
    setUnpublishedVersionCount,
  } = useDocumentInfo()
  const { submit, reset } = useForm()
  const { effect, effectId, recipe } = useDraft()
  const { live, uses } = useLook(id)
  const [busy, setBusy] = useState(false)

  let unchanged = false
  try {
    unchanged = Boolean(live && canonicalJSON(snapshotRecipe(effect, recipe)) === live.key)
  } catch {
    // An invalid draft is not what is published; the Inspector says what is wrong.
  }
  const places = uses.filter((use) => !use.historical).length

  return (
    <Button
      disabled={busy || unchanged}
      onClick={async () => {
        setBusy(true)
        try {
          if (!id) {
            await submit({ overrides: { _status: 'draft' } })
            return
          }
          const doc = await publishLook(submit, { id, effect: effectId, recipe })
          await reset(doc)
          setHasPublishedDoc(true)
          setUnpublishedVersionCount(0)
          setMostRecentVersionIsAutosaved(false)
          incrementVersionCount()
          refreshStudio()
          toast.success(
            places > 1 ? `Published. ${places} places now show this look.` : 'Published.',
          )
        } catch (error) {
          toast.error((error as Error).message)
        } finally {
          setBusy(false)
        }
      }}
    >
      {busy
        ? 'Rendering…'
        : !id
          ? 'Create look'
          : unchanged
            ? 'Published'
            : places > 1
              ? `Publish to ${places} places`
              : 'Publish'}
    </Button>
  )
}
