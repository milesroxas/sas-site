import type { useForm } from '@payloadcms/ui'
import { SURFACES } from '@/features/immersive/studio/effect'
import { type EffectId, effectOf } from '@/features/immersive/studio/effects'
import {
  type CaptureOptions,
  POSTER_CAPTURE,
  type Recipe,
  STILL_UPLOAD_BUDGET,
  snapshotRecipe,
  validateRecipe,
} from '@/features/immersive/studio/recipe'
import type { Media, StreakLook } from '@/payload-types'
import { LOOKS_SLUG } from './paths'
import { sessionKey, studioStore } from './store'

type Submit = ReturnType<typeof useForm>['submit']

/** The saved look a still is rendered from. */
export type Draft = { id: number | string; effect: EffectId; recipe: Recipe }

/**
 * The stills of a recipe, rendered in this browser one after another (one
 * extra WebGL context at a time) with the live preview paused for the moment
 * it takes, so the capture has the GPU to itself.
 */
async function stills({ id, effect, recipe }: Draft, captures: CaptureOptions[]) {
  const key = sessionKey(id)
  const { captureStill } = await import('@/features/immersive')
  const snapshot = snapshotRecipe(effectOf(effect), recipe)
  const wasPaused = studioStore.read(key).paused
  studioStore.patch(key, { paused: true })
  try {
    const images: Blob[] = []
    for (const capture of captures) images.push(await captureStill({ effect, snapshot, capture }))
    return images
  } finally {
    studioStore.patch(key, { paused: wasPaused })
  }
}

/**
 * One multipart request: the stills travel as the files they are, beside the
 * JSON fields. A still over the budget is stopped here, where the reason can be
 * said, since the platform refuses it with a body that is not JSON.
 */
async function send<T>(
  id: number | string,
  action: string,
  fields: Record<string, unknown>,
  images: Record<string, Blob>,
): Promise<T> {
  const weight = Object.values(images).reduce((sum, image) => sum + image.size, 0)
  if (weight > STILL_UPLOAD_BUDGET)
    throw new Error(
      `The rendered stills weigh ${(weight / 1024 / 1024).toFixed(1)} MB, over the 4 MB one upload can carry. Choose JPEG or a smaller size.`,
    )
  const form = new FormData()
  for (const [name, value] of Object.entries(fields)) form.set(name, JSON.stringify(value))
  for (const [name, image] of Object.entries(images)) form.set(name, image)
  const response = await fetch(`/api/${LOOKS_SLUG}/${id}/${action}`, { method: 'POST', body: form })
  const result = await response.json().catch(() => null)
  if (!response.ok)
    throw new Error(
      result?.errors?.[0]?.message ?? result?.error ?? `The request failed (${response.status}).`,
    )
  return result.doc
}

/** The server publishes the saved draft, so the draft is saved before anything is rendered from it. */
async function saveDraft(submit: Submit, { id, effect, recipe }: Draft) {
  validateRecipe(effectOf(effect), recipe)
  const saved = await submit({
    action: `/api/${LOOKS_SLUG}/${id}?draft=true`,
    method: 'PATCH',
    overrides: { _status: 'draft' },
    disableSuccessStatus: true,
  })
  if (!saved?.res.ok) throw new Error('The draft could not be saved, so nothing was published.')
}

/** Publish: save, render the dark and light posters here, and publish the look with them in one request. */
export async function publishLook(submit: Submit, draft: Draft) {
  await saveDraft(submit, draft)
  const images = await stills(
    draft,
    SURFACES.map((surface) => ({ ...POSTER_CAPTURE, surface })),
  )
  return send<StreakLook>(
    draft.id,
    'publish',
    { recipe: draft.recipe },
    Object.fromEntries(SURFACES.map((surface, index) => [surface, images[index]])),
  )
}

/** Export: one still at the chosen size, filed in Media. */
export async function exportStill(submit: Submit, draft: Draft, capture: CaptureOptions) {
  await saveDraft(submit, draft)
  const [image] = await stills(draft, [capture])
  return send<Media>(draft.id, 'export', { recipe: draft.recipe, capture }, { image })
}
