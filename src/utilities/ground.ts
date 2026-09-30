import type { Theme } from '@/providers/Theme/types'

/**
 * Elements that can set the polarity of their subtree: absolute pins
 * (`data-theme`), the always-dark panel (`data-band="dark"`) and the inverted
 * band. The same list the palette rule in globals.css paints. Use it to find
 * candidate grounds, never to decide one: `readGround` does that.
 */
export const GROUND_SCOPE_SELECTOR = '[data-theme], [data-band], .band-inverted'

/**
 * The polarity of the ground an element sits on, as the stylesheet resolved
 * it. Every palette scope declares its `color-scheme` (globals.css), and the
 * `dark` variant (src/styles/shadcn-theme.css) is the only place that decides
 * which scheme a scope takes, so script reads the result rather than
 * restating selectors. That is what makes an inverted band, whose polarity
 * depends on the visitor's theme, readable here at all.
 *
 * A style read: call it when measuring, never per frame. Anything but an
 * explicit dark reads as light, the site default.
 */
export const readGround = (element: Element): Theme =>
  getComputedStyle(element).colorScheme === 'dark' ? 'dark' : 'light'
