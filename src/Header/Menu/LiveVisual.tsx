'use client'

import { StreakVisual } from '@/features/immersive/visual'
import { type HeroStreakSource, MENU_MEDIA_GROUND_ATTR } from './motion'

/**
 * The docked window running the current page's own Streak Field.
 *
 * The window's resting media is a clone of the page's hero poster (the
 * dissolve layer's base, `mountHeroMedia` in ./index). When that hero is a
 * Streak Field, this mounts the same field above the clone, in a host the
 * menu sizes to the window's visible crop, so the window shows the visual
 * the page shows and not a still of it: what a video hero already gets.
 *
 * It arrives invisible. The host paints the poster's ground and the slot
 * starts on the same poster rendition the clone holds (`sizes` is the
 * hero's), so mounting changes no pixel; the field then reveals on its
 * first drawn frame with the slot's own crossfade. `active` is the menu's
 * verdict on whether frames may run at all: only a settled, resting window
 * (no hover preview over it, no Ask transcript, no close or navigation in
 * flight). Everything else the slot gates itself: reduced motion, coarse
 * pointers, the WebGL2 probe and the one-field ceiling, which the page's
 * hero releases while the menu covers it.
 */
export const MenuLiveVisual = ({
  source,
  active,
}: {
  source: HeroStreakSource
  active: boolean
}) => (
  <div
    className="absolute inset-0"
    data-theme={source.ground}
    {...{ [MENU_MEDIA_GROUND_ATTR]: '' }}
  >
    <StreakVisual
      active={active}
      descriptor={source.descriptor}
      fill
      placement="menu"
      sizes={source.sizes}
      surface={source.ground}
    />
  </div>
)
