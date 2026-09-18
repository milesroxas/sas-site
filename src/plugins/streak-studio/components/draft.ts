'use client'

import { useDocumentInfo, useField } from '@payloadcms/ui'
import {
  emptyRecipe,
  recipeFromSnapshot,
  type StreakRecipe,
  type StreakSnapshot,
} from '@/features/immersive/studio/recipe'
import type { StreakRelease } from '@/payload-types'
import { RECIPE_FIELD } from './paths'
import { sessionKey, studioStore } from './store'

/**
 * The look's draft: the recipe field of the open document, which Payload
 * autosaves. Every piece of the Studio that changes it goes through `update`,
 * so each change is one undo step and puts the draft back on the stage.
 */
export function useDraft(path: string = RECIPE_FIELD) {
  const { value, setValue, errorMessage } = useField<StreakRecipe>({ path })
  const { id } = useDocumentInfo()
  const key = sessionKey(id)
  const recipe = value ?? emptyRecipe()

  const update = (next: StreakRecipe, restart = false) => {
    studioStore.record(key, recipe)
    setValue(next)
    if (restart) studioStore.restart(key)
  }

  return {
    id,
    key,
    recipe,
    errorMessage,
    setValue,
    update,
    /**
     * Make a release's settings the draft. The release itself never changes;
     * publishing the restored draft unedited points the look back at it.
     * Throws for a release whose values today's ranges no longer accept.
     */
    restore: (release: StreakRelease) =>
      update(recipeFromSnapshot(release.snapshot as StreakSnapshot), true),
  }
}
