import type React from 'react'
import { Media } from '@/components/Media'
import type { Props as MediaProps } from '@/components/Media/types'
import {
  LeakVisual,
  StreakVisual,
  type VisualPlacement,
  type VisualSurface,
  type Visual as VisualValue,
} from '@/features/immersive/visual'

export type VisualProps = {
  visual: VisualValue
  /** Which ceiling and admission priority a live effect gets here. */
  placement: VisualPlacement
  /** Ground polarity for an effect; `auto` follows the site theme. */
  surface?: VisualSurface
  /** Hold a live effect until the owner's motion (a hero intro) has settled. */
  active?: boolean
  /** Frame classes for an effect's slot; `className` goes to the media wrapper. */
  frameClassName?: string
  /** Poster image classes for an effect's slot; defaults to `imgClassName`. */
  posterClassName?: string
} & Pick<
  MediaProps,
  | 'className'
  | 'fill'
  | 'htmlElement'
  | 'imgClassName'
  | 'loading'
  | 'pictureClassName'
  | 'priority'
  | 'size'
  | 'videoClassName'
>

/**
 * Renders a resolved `Visual`: the existing `Media` element for uploads, the
 * effect's own poster-first slot otherwise. Media branches keep their loading
 * contract untouched (priority heroes, viewport-gated loops); an effect never
 * mounts a retained upload behind its poster, except a light leak whose editor
 * asked for the media under it.
 */
export const Visual: React.FC<VisualProps> = ({
  visual,
  placement,
  surface = 'auto',
  active = true,
  frameClassName,
  posterClassName,
  ...media
}) => {
  if (visual.kind === 'media') return <Media {...media} resource={visual.media} />
  const slot = {
    active,
    className: frameClassName,
    fill: media.fill,
    imgClassName: posterClassName ?? media.imgClassName,
    placement,
    priority: media.priority,
    sizes: media.size,
    surface,
  }
  if (visual.kind === 'streakField')
    return <StreakVisual {...slot} descriptor={visual.descriptor} />
  return (
    <LeakVisual
      {...slot}
      descriptor={visual.descriptor}
      media={visual.descriptor.media && <Media {...media} resource={visual.descriptor.media} />}
    />
  )
}
