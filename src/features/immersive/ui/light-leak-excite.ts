/**
 * The light leak's hover contract, kept out of the `'use client'` module on
 * purpose: server components mark their own excite targets, and a helper
 * exported from a client module would reach them as a client reference rather
 * than a callable function. Mirrors the cursor feature's `cursorTarget()`.
 */

/**
 * Mark any element with this attribute and the leak flares while the pointer
 * is over it — light gathers under the cursor, the spectrum splits wider and
 * the slats tighten. Delegated from the document, so it works on elements
 * mounted long after the effect, at any depth, with no wiring.
 */
export const LIGHT_LEAK_EXCITE_ATTR = 'data-leak-excite'

/** Matches any excite target; the effect delegates with `closest()`. */
export const LIGHT_LEAK_EXCITE_SELECTOR = `[${LIGHT_LEAK_EXCITE_ATTR}]`

/**
 * Spread onto any element that should flare the leak on hover, mirroring the
 * cursor feature's `cursorTarget()` contract:
 *
 * ```tsx
 * <Card {...leakExcite()}>…</Card>
 * ```
 *
 * The effect delegates from the document, so targets need no wiring, no client
 * boundary, and may mount at any time. Where a component forwards no arbitrary
 * props, mark a `display: contents` wrapper instead — delegation walks the DOM
 * tree, not the layout tree.
 */
export function leakExcite(): Record<string, string> {
  return { [LIGHT_LEAK_EXCITE_ATTR]: '' }
}
