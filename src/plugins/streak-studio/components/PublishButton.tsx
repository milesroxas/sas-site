'use client'

import { Button, toast, useDocumentInfo, useForm, useFormFields } from '@payloadcms/ui'
import { useState } from 'react'
import {
  canonicalJSON,
  type StreakRecipe,
  snapshotRecipe,
} from '@/features/immersive/studio/recipe'
import { refreshStudio, useLook } from './look-store'
import { RECIPE_FIELD } from './paths'
import { publishLook } from './publish'

/**
 * Publish, for a field used like a media file: the two posters render in this
 * browser and the look is published with them in one request, so it is done
 * when the button says so. Every place that uses the field shows the result.
 */
export function PublishButton() {
  const {
    id,
    incrementVersionCount,
    setHasPublishedDoc,
    setMostRecentVersionIsAutosaved,
    setUnpublishedVersionCount,
  } = useDocumentInfo()
  const { submit, getData, reset } = useForm()
  const recipe = useFormFields(([fields]) => fields[RECIPE_FIELD]?.value) as
    | StreakRecipe
    | undefined
  const { live, uses } = useLook(id)
  const [busy, setBusy] = useState(false)

  let unchanged = false
  try {
    unchanged = Boolean(live && recipe && canonicalJSON(snapshotRecipe(recipe)) === live.key)
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
          const doc = await publishLook(submit, id, getData().recipe as StreakRecipe)
          await reset(doc)
          setHasPublishedDoc(true)
          setUnpublishedVersionCount(0)
          setMostRecentVersionIsAutosaved(false)
          incrementVersionCount()
          refreshStudio()
          toast.success(
            places > 1 ? `Published. ${places} places now show this field.` : 'Published.',
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
          ? 'Create field'
          : unchanged
            ? 'Published'
            : places > 1
              ? `Publish to ${places} places`
              : 'Publish'}
    </Button>
  )
}
