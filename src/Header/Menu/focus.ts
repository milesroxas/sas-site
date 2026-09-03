/**
 * Focus moves that only keyboard users get.
 *
 * The menu moves focus by script: into the first row on open, onto the back
 * row of a phone sub-view, back onto the row that opened it, and onto the
 * header button on close. Those moves are for keyboard and screen-reader
 * users, who need to land where they can act. After a tap or click they are
 * noise, and on iOS Safari worse than noise: WebKit treats a script focus
 * that runs outside the pointer event itself (ours fire from a GSAP
 * onComplete or a React effect, a frame later) as keyboard-style focus, so
 * `:focus-visible` matches and the ring paints on a row nobody focused.
 * Chromium and desktop WebKit remember that the last input was a pointer and
 * suppress it, which is why the ring only shows on the phone.
 *
 * So the last input modality is tracked once, at the window (capture phase,
 * so nothing inside can stop the signal), and every scripted focus move asks
 * before it goes. Pointer users keep whatever focus they had: on open that
 * is the header button (still outside the inert frame, so Tab enters the
 * menu next), and inside the menu the tapped row, until its panel goes
 * inert and drops it.
 */

type Modality = 'keyboard' | 'pointer'

let modality: Modality = 'keyboard'
let tracking = 0

const onKeyDown = (event: KeyboardEvent) => {
  // Modifier-only presses (cmd-tab back to the window) say nothing about
  // how the user is driving the page.
  if (
    event.key === 'Meta' ||
    event.key === 'Control' ||
    event.key === 'Alt' ||
    event.key === 'Shift'
  )
    return
  modality = 'keyboard'
}
const onPointerDown = () => {
  modality = 'pointer'
}

/** Start tracking; returns the stop function. Reference-counted, so several menus share one pair of listeners. */
export const trackInputModality = () => {
  if (tracking++ === 0) {
    window.addEventListener('keydown', onKeyDown, { capture: true })
    window.addEventListener('pointerdown', onPointerDown, { capture: true })
  }
  return () => {
    if (--tracking === 0) {
      window.removeEventListener('keydown', onKeyDown, { capture: true })
      window.removeEventListener('pointerdown', onPointerDown, { capture: true })
    }
  }
}

export const lastInputWasKeyboard = () => modality === 'keyboard'

/** Move focus to `el` only when the user is driving by keyboard. */
export const focusForKeyboard = (el: HTMLElement | null | undefined, options?: FocusOptions) => {
  if (!el || !lastInputWasKeyboard()) return false
  el.focus(options)
  return true
}
