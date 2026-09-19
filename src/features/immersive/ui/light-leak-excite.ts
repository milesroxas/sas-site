/**
 * The light leak's hover contract, kept out of the `'use client'` module on
 * purpose: server components mark their own excite targets and scopes, and a
 * helper exported from a client module would reach them as a client reference
 * rather than a callable function. Mirrors the cursor feature's
 * `cursorTarget()`.
 *
 * Nothing here touches the DOM: these are attribute names and selectors, so
 * the light visual entry and Payload-side code can read them too.
 */

/**
 * Mark any element with this attribute and the leak flares while the pointer
 * is over it — light gathers under the cursor, the spectrum splits wider and
 * the slats tighten. Delegated from the leak's scope, so it works on elements
 * mounted long after the effect, at any depth, with no wiring.
 *
 * Set it to `"off"` to mute a subtree the leak would otherwise answer: a
 * decorative link inside a block whose leak reacts to links and buttons.
 */
export const LIGHT_LEAK_EXCITE_ATTR = 'data-leak-excite'

/** Matches any excite marker, on or off; the effect delegates with `closest()`. */
export const LIGHT_LEAK_EXCITE_SELECTOR = `[${LIGHT_LEAK_EXCITE_ATTR}]`

/** The value that mutes a subtree rather than exciting it. */
export const LIGHT_LEAK_EXCITE_OFF = 'off'

/**
 * What `exciteTargets: 'interactive'` answers on its own: the things a visitor
 * can actually press. Deliberately narrow — every element here promises an
 * interaction, so the flare never fires on plain copy the pointer crosses.
 */
export const LIGHT_LEAK_INTERACTIVE_SELECTOR =
  'a[href], button, summary, [role="link"], [role="button"]'

/**
 * The band a leak listens inside: its section, its hero, its footer. Hovering
 * a link in one block never flares the leak of another, and the scope is also
 * what "hovering across the section" means (`sectionExcite`).
 *
 * A leak with no marked scope falls back to its own offset parent, which is
 * the positioned ancestor it was placed to fill — the right band in every
 * shipped placement. `VISUAL_HOST` carries this marker, so every `Section` is
 * a scope already.
 */
export const LIGHT_LEAK_SCOPE_ATTR = 'data-leak-scope'

export const LIGHT_LEAK_SCOPE_SELECTOR = `[${LIGHT_LEAK_SCOPE_ATTR}]`

/**
 * Spread onto any element that should flare the leak on hover, mirroring the
 * cursor feature's `cursorTarget()` contract:
 *
 * ```tsx
 * <Card {...leakExcite()}>…</Card>
 * <figure {...leakExcite(false)}>…</figure>
 * ```
 *
 * The effect delegates from its scope, so targets need no wiring, no client
 * boundary, and may mount at any time. Where a component forwards no arbitrary
 * props, mark a `display: contents` wrapper instead — delegation walks the DOM
 * tree, not the layout tree.
 *
 * Links and buttons need no marker where the leak's own `exciteTargets` is
 * `interactive`; pass `false` to mute one that should not flare.
 */
export function leakExcite(on = true): Record<string, string> {
  return { [LIGHT_LEAK_EXCITE_ATTR]: on ? '' : LIGHT_LEAK_EXCITE_OFF }
}

/**
 * Spread onto the band a leak should listen inside. Only needed where the
 * leak's positioned ancestor is not the band itself (a hero, whose visual
 * fills an inner shell) — a `Section` already carries it through `VISUAL_HOST`.
 */
export function leakScope(): Record<string, string> {
  return { [LIGHT_LEAK_SCOPE_ATTR]: '' }
}
