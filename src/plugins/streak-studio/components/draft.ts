'use client'

import { useDocumentInfo, useField } from '@payloadcms/ui'
import { emptyRecipe, type StreakRecipe, validateRecipe } from '@/features/immersive/studio/recipe'
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
     * Make a published state the draft. Nothing on the site changes until the
     * draft is published. Throws for a recipe today's ranges no longer accept.
     */
    restore: (published: StreakRecipe) => update(validateRecipe(published), true),
  }
}
