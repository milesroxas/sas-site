'use client'

import { useDemoControls } from '@/shared/ui/demo-kit'
import { SCROLL_REVEAL_TRIGGER_DEFAULTS } from '@/shared/ui/scroll-reveal'

/**
 * The viewport gate every scroll-reveal playground exposes: how far the
 * block's copy has to clear the fold, as a fraction of the screen, before the
 * reveal runs. Deliberately outside the copied snippet — the gate is its own
 * const (`SCROLL_REVEAL_TRIGGER_DEFAULTS`), not part of a reveal's tuning.
 */
export function useTriggerControl() {
  const { enterOffset } = useDemoControls('Trigger', {
    enterOffset: {
      value: SCROLL_REVEAL_TRIGGER_DEFAULTS.enterOffset,
      min: 0,
      max: 0.9,
      step: 0.05,
      label: 'past the fold',
    },
  })
  return enterOffset
}
