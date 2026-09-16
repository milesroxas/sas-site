import type { Step } from 'webreel'

/**
 * `#site-menu` stays mounted while closed (`invisible` / `opacity-0`), so a
 * `wait` for menu copy resolves immediately. Wait for the header control to
 * flip, then hold through the dock (0.8s + 0.1s clip lag) so a later nav
 * click can start the hero handoff (`timelineProgress === 1`).
 */
export const openMenu: Step[] = [
  { action: 'pause', ms: 800 },
  { action: 'click', selector: 'button[aria-label="Open menu"]' },
  { action: 'wait', selector: 'button[aria-label="Close menu"]' },
  { action: 'pause', ms: 1400 },
]
