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
 * it with four strictly sequential WAAPI beats, each position-only or
 * size-only (never both) — center: the media glides straight up or down at
 * the spotlight's size until it is vertically centered in the viewport, x
 * untouched (`--vt-duration-hero-center`); expand: it scales about its own
 * center until it covers the whole viewport (`--vt-duration-hero-expand`),
 * then holds there, alone, for `--vt-duration-hero-hold` — the incoming page
 * stays invisible for the whole full-screen moment; travel: still at full
 * size, it glides until its center sits on the hero rect's center
 * (`--vt-duration-hero-move`) while the page fades in beneath; shrink — the
 * very last beat, no size change happens anywhere before it — it resizes in
 * place into the hero's rect (`--vt-duration-hero-grow`).
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
  const fromW = parseFloat(from.width)
  const fromH = parseFloat(from.height)
  const toW = parseFloat(toWidth)
  const toH = parseFloat(toHeight)
  if (![fromW, fromH, toW, toH].every(Number.isFinite)) return

  const styles = getComputedStyle(root)
  const exit = rootMs(styles, '--vt-duration-exit')
  const center = rootMs(styles, '--vt-duration-hero-center')
  const expand = rootMs(styles, '--vt-duration-hero-expand')
  const hold = rootMs(styles, '--vt-duration-hero-hold')
  const move = rootMs(styles, '--vt-duration-hero-move')
  const grow = rootMs(styles, '--vt-duration-hero-grow')
  const travelEasing = styles.getPropertyValue('--vt-ease-hero-travel').trim() || 'ease-in-out'
  const easing = styles.getPropertyValue('--vt-ease-hero').trim() || 'ease'

  // The group pseudo lives in the snapshot containing block's coordinate
  // space (the full viewport, scrollbar gutters included), so its matrix
  // translation *is* the box's viewport position.
  const fromMatrix = from.transform === 'none' ? new DOMMatrix() : new DOMMatrix(from.transform)
  const viewportW = window.innerWidth
  const viewportH = window.innerHeight

  // Center target: same box, same x, vertically centered — a single-axis,
  // position-only glide.
  const centeredMatrix = DOMMatrix.fromMatrix(fromMatrix)
  centeredMatrix.m42 = (viewportH - fromH) / 2
  const centered = centeredMatrix.toString()

  // Expand target: uniform scale about the box's own center until the box
  // covers the whole viewport. The center's x is fixed by the center beat
  // (it may sit slightly off the viewport's middle), so the factor is what
  // it takes for the *farther* edge to reach the viewport on each axis —
  // the nearer edge simply overshoots offscreen.
  const centerX = fromMatrix.m41 + fromW / 2
  const factor = Math.max(
    1,
    (2 * Math.max(centerX, viewportW - centerX)) / fromW,
    viewportH / fromH,
  )
  const expandedW = fromW * factor
  const expandedH = fromH * factor
  const expandedWidth = `${expandedW}px`
  const expandedHeight = `${expandedH}px`
  const expandedMatrix = DOMMatrix.fromMatrix(centeredMatrix)
  expandedMatrix.m41 -= (expandedW - fromW) / 2
  expandedMatrix.m42 -= (expandedH - fromH) / 2
  const expanded = expandedMatrix.toString()

  // Travel target: the full-screen box re-centered on the hero rect, so the
  // final shrink happens in place instead of drifting.
  const settled = (toTransform === 'none' ? new DOMMatrix() : new DOMMatrix(toTransform))
    .translate((toW - expandedW) / 2, (toH - expandedH) / 2)
    .toString()

  const centerBeat = root.animate(
    [
      { transform: from.transform, width: from.width, height: from.height },
      { transform: centered, width: from.width, height: from.height },
    ],
    { pseudoElement, delay: exit, duration: center, easing: travelEasing, fill: 'both' },
  )
  // `forwards` (not `both`) keeps each later beat idle — not filling — while
  // the earlier ones play; every beat's start pose equals the previous beat's
  // end pose, so the handoffs are seamless.
  const expandBeat = root.animate(
    [
      { transform: centered, width: from.width, height: from.height },
      { transform: expanded, width: expandedWidth, height: expandedHeight },
    ],
    { pseudoElement, delay: exit + center, duration: expand, easing, fill: 'forwards' },
  )
  // The gap between expand and travel is the hold: the expand beat's forwards
  // fill pins the media full-screen for `--vt-duration-hero-hold`; the
  // incoming page's fade (`.work-enter`) starts only when this hold ends.
  const travel = root.animate(
    [
      { transform: expanded, width: expandedWidth, height: expandedHeight },
      { transform: settled, width: expandedWidth, height: expandedHeight },
    ],
    {
      pseudoElement,
      delay: exit + center + expand + hold,
      duration: move,
      easing: travelEasing,
      fill: 'forwards',
    },
  )
  // Final beat: the only size change in the whole sequence.
  const shrink = root.animate(
    [
      { transform: settled, width: expandedWidth, height: expandedHeight },
      { transform: toTransform, width: toWidth, height: toHeight },
    ],
    {
      pseudoElement,
      delay: exit + center + expand + hold + move,
      duration: grow,
      easing,
      fill: 'forwards',
    },
  )
  return () => {
    centerBeat.cancel()
    expandBeat.cancel()
    travel.cancel()
    shrink.cancel()
  }
}
