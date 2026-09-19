'use client'

import './studio.css'

import { toast } from '@payloadcms/ui'
import type { UIFieldClientComponent } from 'payload'
import { Button } from '@/components/ui/button'
import { STUDIO_GROUND } from '@/features/immersive/studio/effect'
import { canonicalJSON, snapshotRecipe } from '@/features/immersive/studio/recipe'
import { useDraft } from './draft'
import { type PublishedState, useLook } from './look-store'
import { studioStore } from './store'

export const when = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })

/**
 * The History tab: every published state of the look, newest first, read
 * from Payload's own versions. Restore copies one into the draft; Compare
 * shows it on the stage beside the draft. Neither changes the site.
 */
export const History: UIFieldClientComponent = () => {
  const { id, key, effect, recipe, restore } = useDraft()
  const { history, loaded } = useLook(id)
  let draftKey = ''
  try {
    draftKey = canonicalJSON(snapshotRecipe(effect, recipe))
  } catch {
    // An invalid draft matches nothing.
  }

  const restoreState = (state: PublishedState) => {
    try {
      restore(state.recipe)
      toast.success(`The draft is back at ${when(state.at)}. Undo in Studio reverses it.`)
    } catch {
      toast.error('This state holds values the current ranges no longer accept.')
    }
  }
  const compare = (state: PublishedState) => {
    studioStore.patch(key, {
      comparison: state.recipe,
      comparisonLabel: when(state.at),
      comparisonAt: new Date(state.at).getTime(),
      showComparison: true,
    })
    toast.success('It is on the stage. Open Studio to see it.')
  }

  if (!id || (loaded && !history.length))
    return (
      <p data-streak-studio="panel" className="text-xs text-muted-foreground">
        Nothing published yet. Publish from Studio and each published state is kept here.
      </p>
    )

  return (
    <ul data-streak-studio="panel" className="flex flex-col divide-y divide-border">
      {history.map((state, index) => (
        <li key={state.id} className="flex flex-wrap items-center gap-4 py-3">
          <span
            className="block h-9 w-16 shrink-0 overflow-hidden rounded-sm border border-border"
            style={{ backgroundColor: STUDIO_GROUND.dark }}
          >
            {state.poster && (
              // biome-ignore lint/performance/noImgElement: admin-only poster thumb; next/image is not loaded in the Payload admin
              <img src={state.poster} alt="" className="size-full object-cover" loading="lazy" />
            )}
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="text-xs font-medium">{when(state.at)}</span>
            <span className="text-[11px] text-muted-foreground">
              {[index === 0 && 'On the site now', state.key === draftKey && 'matches the draft']
                .filter(Boolean)
                .join(' · ')}
            </span>
          </div>
          <div className="flex items-center gap-1">
            {state.key !== draftKey && (
              <Button type="button" variant="ghost" size="sm" onClick={() => restoreState(state)}>
                Restore as draft
              </Button>
            )}
            <Button type="button" variant="ghost" size="sm" onClick={() => compare(state)}>
              Compare on stage
            </Button>
          </div>
        </li>
      ))}
    </ul>
  )
}
