import { cssEasing, planHeroLanding } from '@/shared/ui/hero-landing'

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
 * it with strictly sequential beats — an approach and then the shared hero
 * landing, the same one the takeover menu's hero handoff plays:
 *
 *   center  the media glides straight up or down at the spotlight's size
 *           until it is vertically centered in the viewport, x untouched
 *           (`--vt-duration-hero-center`);
 *   expand  it scales about its own center until it covers the whole viewport
 *           (`--vt-duration-hero-expand`) and holds there — the beat's
 *           forwards fill pins the group full-screen for the rest of the
 *           transition, so nothing moves or resizes ever again;
 *   landing `@/shared/ui/hero-landing`: after its hold, the group's CLIP-PATH
 *           closes one axis at a time (horizontal, then vertical) onto the
 *           hero's rect, uncovering the page around it, and the hero snapshot
 *           dissolves in over the spotlight's.
 *
 * The dissolving hero snapshot is laid out at the hero's own rect inside the
 * still-full-screen group, not stretched across it: it is exactly what the
 * page keeps once the pseudo tree is dropped, so the last transition frame
 * and the first live frame are the same pixels.
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
  // The landing's curves reach WAAPI as sampled `linear()` easings (Chrome
  // 113+). An engine with view transitions but without it would throw on the
  // keyframe, so it keeps the CSS fallback glide instead.
  if (!CSS.supports('animation-timing-function', 'linear(0, 1)')) return
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
  const travelEasing = styles.getPropertyValue('--vt-ease-hero-travel').trim() || 'ease-in-out'
  const easing = styles.getPropertyValue('--vt-ease-hero').trim() || 'ease'

  // The group pseudo lives in the snapshot containing block's coordinate
  // space (the full viewport, scrollbar gutters included), so its matrix
  // translation *is* the box's viewport position.
  const fromMatrix = from.transform === 'none' ? new DOMMatrix() : new DOMMatrix(from.transform)
  const toMatrix = toTransform === 'none' ? new DOMMatrix() : new DOMMatrix(toTransform)
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

  const centerBeat = root.animate(
    [
      { transform: from.transform, width: from.width, height: from.height },
      { transform: centered, width: from.width, height: from.height },
    ],
    { pseudoElement, delay: exit, duration: center, easing: travelEasing, fill: 'both' },
  )
  // `forwards` (not `both`) keeps each later beat idle — not filling — while
  // the earlier ones play; every beat's start pose equals the previous beat's
  // end pose, so the handoffs are seamless. This one holds its pose for the
  // whole landing: the group stays full-screen and only its mask closes.
  const expandBeat = root.animate(
    [
      { transform: centered, width: from.width, height: from.height },
      { transform: expanded, width: expandedWidth, height: expandedHeight },
    ],
    { pseudoElement, delay: exit + center, duration: expand, easing, fill: 'forwards' },
  )

  // The landing, in the group's own coordinates: the expanded box overshoots
  // the viewport on one axis, so the plan starts the mask at that box's
  // visible crop and closes it onto the hero's rect.
  const landingStart = exit + center + expand
  const landing = planHeroLanding({
    box: { left: expandedMatrix.m41, top: expandedMatrix.m42, width: expandedW, height: expandedH },
    viewport: { width: viewportW, height: viewportH },
    target: { left: toMatrix.m41, top: toMatrix.m42, width: toW, height: toH },
    // The group carries no corner treatment of its own — the hero's rounding,
    // if it has any, is already painted into the snapshot the dissolve raises.
    radius: 0,
  })
  const clipBeats: Animation[] = []
  let mask = landing.from
  for (const step of landing.steps) {
    clipBeats.push(
      root.animate([{ clipPath: mask }, { clipPath: step.clipPath }], {
        pseudoElement,
        delay: landingStart + step.at * 1000,
        duration: step.duration * 1000,
        easing: cssEasing(step.ease),
        fill: 'forwards',
      }),
    )
    mask = step.clipPath
  }

  // The settle. The hero snapshot is what the live page replaces frame for
  // frame when the transition ends, so it is laid out at the hero's rect
  // (group-local, hence the offset from the expanded box) rather than left to
  // cover the full-screen group — a stretched crop would pop the moment the
  // pseudo tree is dropped. `both` fill also keeps it hidden for the whole
  // flight, so the spotlight's snapshot is the only thing on screen until
  // the mask is home.
  const heroBox = {
    transform: `translate(${toMatrix.m41 - expandedMatrix.m41}px, ${toMatrix.m42 - expandedMatrix.m42}px)`,
    width: toWidth,
    height: toHeight,
  }
  const settle = root.animate(
    [
      { ...heroBox, opacity: 0 },
      { ...heroBox, opacity: 1 },
    ],
    {
      pseudoElement: `::view-transition-new(${name})`,
      delay: landingStart + landing.settle.at * 1000,
      duration: landing.settle.duration * 1000,
      easing: cssEasing(landing.settle.ease),
      fill: 'both',
    },
  )

  return () => {
    centerBeat.cancel()
    expandBeat.cancel()
    for (const beat of clipBeats) beat.cancel()
    settle.cancel()
  }
}
