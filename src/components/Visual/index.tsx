import type React from 'react'
import { Media } from '@/components/Media'
import type { Props as MediaProps } from '@/components/Media/types'
import {
  StreakVisual,
  type StreakVisualSurface,
  type VisualPlacement,
  type Visual as VisualValue,
} from '@/features/immersive/visual'

export type VisualProps = {
  visual: VisualValue
  /** Which ceiling and admission priority a live field gets here. */
  placement: VisualPlacement
  /** Ground polarity for a Streak Field; `auto` follows the site theme. */
  surface?: StreakVisualSurface
  /** Hold a live field until the owner's motion (a hero intro) has settled. */
  active?: boolean
  /** Frame classes for the Streak Field slot; `className` goes to the media wrapper. */
  frameClassName?: string
  /** Poster image classes for the Streak Field slot; defaults to `imgClassName`. */
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
 * poster-first `StreakVisual` slot for a Streak Field. Media branches keep
 * their loading contract untouched (priority heroes, viewport-gated loops);
 * shader branches never mount a retained upload behind the poster.
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
  return (
    <StreakVisual
      active={active}
      className={frameClassName}
      descriptor={visual.descriptor}
      fill={media.fill}
      imgClassName={posterClassName ?? media.imgClassName}
      placement={placement}
      priority={media.priority}
      sizes={media.size}
      surface={surface}
    />
  )
}
