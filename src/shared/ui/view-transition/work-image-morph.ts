/**
 * Reads a `--vt-*` time variable off `:root` as milliseconds; 0 when
 * unset/invalid. The CSS minifier may reserialize `150ms` as `.15s`, so the
 * unit must be honored, not assumed.
 */
const rootMs = (styles: CSSStyleDeclaration, name: string) => {
  const raw = styles.getPropertyValue(name).trim()
  const value = parseFloat(raw)
  if (!Number.isFinite(value)) return 0
  return raw.endsWith('ms') ? value : value * 1000
}

/**
 * Work-media takeover beat split. The browser's group animation tweens the
 * shared element's position and size in one rect interpolation; this replaces
 * it with two WAAPI beats — travel: the media glides at the spotlight's size
 * until it rests centered on the hero rect (`--vt-duration-hero-move`), then
 * grow: it expands in place into the hero's size (`--vt-duration-hero-grow`).
 *
 * Call from `onShare` on the *unmounting* side of the pair (React fires the
 * share event on the deleted `<ViewTransition>`), gated to the `work-open`
 * type. The spotlight rect comes from the UA group animation's first
 * keyframe; bails — leaving the CSS single-glide fallback from
 * `view-transition.css` intact — whenever that shape isn't available.
 * Returns the cleanup for `onShare` to hand back to React.
 */
export function sequenceWorkImageMorph(name: string): (() => void) | undefined {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const root = document.documentElement
  const pseudoElement = `::view-transition-group(${name})`
  const groupAnimation = document
    .getAnimations()
    .find(
      (animation) =>
        animation.effect instanceof KeyframeEffect &&
        animation.effect.pseudoElement === pseudoElement,
    )
  const effect = groupAnimation?.effect
  if (!groupAnimation || !(effect instanceof KeyframeEffect)) return
  const [from] = effect.getKeyframes()
  if (
    typeof from?.transform !== 'string' ||
    typeof from?.width !== 'string' ||
    typeof from?.height !== 'string'
  )
    return

  // With the browser's tween out of the way, the group's computed style is
  // the hero's final rect. Snapshot the strings before animating — computed
  // style is live and would start reflecting our own keyframes.
  groupAnimation.cancel()
  const computed = getComputedStyle(root, pseudoElement)
  const toTransform = computed.transform
  const toWidth = computed.width
  const toHeight = computed.height
  const dw = parseFloat(toWidth) - parseFloat(from.width)
  const dh = parseFloat(toHeight) - parseFloat(from.height)
  if (!Number.isFinite(dw) || !Number.isFinite(dh)) return
  // Travel target: the spotlight-size box centered on the hero rect, so the
  // grow beat expands in place instead of drifting.
  const settled = (toTransform === 'none' ? new DOMMatrix() : new DOMMatrix(toTransform))
    .translate(dw / 2, dh / 2)
    .toString()

  const styles = getComputedStyle(root)
  const exit = rootMs(styles, '--vt-duration-exit')
  const move = rootMs(styles, '--vt-duration-hero-move')
  const grow = rootMs(styles, '--vt-duration-hero-grow')
  const easing = styles.getPropertyValue('--vt-ease-hero').trim() || 'ease'

  const travel = root.animate(
    [
      { transform: from.transform, width: from.width, height: from.height },
      { transform: settled, width: from.width, height: from.height },
    ],
    { pseudoElement, delay: exit, duration: move, easing, fill: 'both' },
  )
  // `forwards` (not `both`) keeps this idle — not filling — during travel.
  const scale = root.animate(
    [
      { transform: settled, width: from.width, height: from.height },
      { transform: toTransform, width: toWidth, height: toHeight },
    ],
    { pseudoElement, delay: exit + move, duration: grow, easing, fill: 'forwards' },
  )
  return () => {
    travel.cancel()
    scale.cancel()
  }
}
