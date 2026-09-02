/**
 * Opt a navigation out of the platform view transition entirely.
 *
 * `default: 'none'` does NOT stop a view transition from running — it only
 * stops React from animating one. React flags a transition in its
 * before-mutation pass for any newly placed subtree that *contains* a
 * `<ViewTransition>` (`trackEnterViewTransitions`), which every App Router
 * navigation produces here: `(frontend)/template.tsx` remounts the page-level
 * transition on every route change. The classes are resolved later, so a
 * fully `'none'` map still ends in `document.startViewTransition()`.
 *
 * A started transition suppresses the document's rendering — and with it
 * `requestAnimationFrame` — from the capture until React's update callback
 * resolves. React deliberately holds that callback for up to 500ms waiting on
 * the incoming page's above-the-fold images and fonts. Any imperative
 * animation playing across the route commit therefore stalls for that window,
 * and because GSAP's ticker only smooths gaps *longer* than 500ms, the next
 * frame snaps the tween straight to its time-correct progress: the menu hero
 * handoff's traveler freezes mid-expansion and jumps.
 *
 * So navigations whose motion is owned imperatively — the takeover menu's
 * hero handoff and its plain undock close — remove the API for their flight.
 * React then takes its own no-view-transition commit path, the same one every
 * browser without view transitions takes (the call site is already wrapped in
 * a try/catch for exactly that case). The `view-transition.css` docked/handoff
 * guards stay as belt: they cover any transition this does not intercept.
 *
 * Ref-counted — the menu can hold a token while a handoff holds another — and
 * each release is idempotent, so double-teardown cannot restore the API early.
 */
let holders = 0
/** The own descriptor we shadowed, so the restore is exact. `undefined` means
 *  the API was inherited from `Document.prototype` — drop the shadow instead. */
let shadowed: PropertyDescriptor | undefined

export const suppressViewTransitions = (): (() => void) => {
  if (typeof document === 'undefined' || !('startViewTransition' in document)) return () => {}
  if (holders === 0) {
    shadowed = Object.getOwnPropertyDescriptor(document, 'startViewTransition')
    Object.defineProperty(document, 'startViewTransition', {
      configurable: true,
      writable: true,
      value: undefined,
    })
  }
  holders += 1
  let released = false
  return () => {
    if (released) return
    released = true
    holders -= 1
    if (holders > 0) return
    if (shadowed) Object.defineProperty(document, 'startViewTransition', shadowed)
    else Reflect.deleteProperty(document, 'startViewTransition')
    shadowed = undefined
  }
}
