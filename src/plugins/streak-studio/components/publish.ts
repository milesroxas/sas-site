import type { useForm } from '@payloadcms/ui'
import {
  type CaptureOptions,
  type StreakRecipe,
  validateRecipe,
} from '@/features/immersive/studio/recipe'

export async function saveAndQueue(
  submit: ReturnType<typeof useForm>['submit'],
  id: number | string,
  recipe: StreakRecipe,
  kind: 'publish-release' | 'export',
  capture?: CaptureOptions,
) {
  validateRecipe(recipe)
  const saved = await submit({
    action: `/api/streak-looks/${id}?draft=true`,
    method: 'PATCH',
    overrides: { _status: 'draft' },
  })
  if (!saved?.res.ok) throw new Error('Save the draft successfully before publishing.')
  const response = await fetch(`/api/streak-looks/${id}/${kind}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ recipe, capture }),
  })
  const result = await response.json()
  if (!response.ok)
    throw new Error(result.errors?.[0]?.message ?? result.error ?? 'Could not queue the render.')
  return result
}
