'use client'

import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { type RefObject, useRef } from 'react'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'
import {
  SCROLL_REVEAL_EXIT_TIME_SCALE as EXIT_TIME_SCALE,
  observeRevealGate,
  SCROLL_REVEAL_INTRO,
  SCROLL_REVEAL_TRIGGER_DEFAULTS,
  SCROLL_REVEAL_UNDER_MEDIA,
} from '@/shared/ui/scroll-reveal'

gsap.registerPlugin(useGSAP)

/**
 * Bespoke motion for the audience-tabs block, speaking the site's reveal
 * language — every value a shared reveal already owns is imported from it,
 * never restated. The heading leads with the intro reveal's drop; buttons and
 * list items cascade with the under-media text values; the media wipe is the
 * under-media wipe, placed last.
 */
const {
  textY: HEADING_Y,
  textBlurPx: HEADING_BLUR_PX,
  textDuration: HEADING_DURATION,
  textEase: HEADING_EASE,
} = SCROLL_REVEAL_INTRO
const {
  textY: TEXT_Y,
  textBlurPx: TEXT_BLUR_PX,
  textDuration: TEXT_DURATION,
  textEase: TEXT_EASE,
  stagger: TEXT_STAGGER,
  mediaDuration: MEDIA_DURATION,
  mediaEase: MEDIA_EASE,
  mediaScaleFrom: MEDIA_SCALE_FROM,
} = SCROLL_REVEAL_UNDER_MEDIA
const { enterOffset: ENTER_OFFSET } = SCROLL_REVEAL_TRIGGER_DEFAULTS

/**
 * What only this choreography owns: the phase offsets and per-phase staggers
 * of the entrance. Each value lives here once — tune here, nowhere else.
 */
export const AUDIENCE_TABS_MOTION = {
  /** Tab buttons start while the heading is still settling. */
  tabsAt: 0.25,
  tabStagger: 0.06,
  /** Left-column elements start as the last buttons are landing. */
  itemsAt: 0.45,
  itemStagger: 0.08,
  /** Media wipe starts this long after the last list item begins. */
  mediaLag: 0.1,
  /**
   * Latest the media wipe may start, however many items editors add — the
   * biggest element on the page never waits on an unbounded item cascade.
   */
  mediaAtMax: 0.7,
} as const

const ENTRANCE_HEADING = '[data-entrance="heading"]'
const ENTRANCE_TAB = '[data-entrance="tab"]'
const ENTRANCE_INTRO = '[data-entrance="intro"]'
const ENTRANCE_ITEM = '[data-entrance="item"]'
const ENTRANCE_MEDIA = '[data-entrance="media"]'
const SWAP_INTRO = '[data-swap="intro"]'
const SWAP_TEXT = '[data-swap="text"]'
const SWAP_MEDIA = '[data-swap="media"]'

/**
 * The intro copy leads its column sharp — no blur — while the list items
 * below it settle from a progressively deeper blur: each starts blurrier
 * than the one before, reaching the under-media reveal's full blur on the
 * last item. Depth builds down the list without a second tuning value.
 */
const itemBlurFrom = (index: number, _target: unknown, targets: unknown[]) =>
  `blur(${(((index + 1) / targets.length) * TEXT_BLUR_PX).toFixed(2)}px)`

const addHeadingDrop = (tl: gsap.core.Timeline, heading: HTMLElement, at: number) => {
  tl.fromTo(
    heading,
    { autoAlpha: 0, y: -HEADING_Y, filter: `blur(${HEADING_BLUR_PX}px)` },
    {
      autoAlpha: 1,
      y: 0,
      filter: 'blur(0px)',
      duration: HEADING_DURATION,
      ease: HEADING_EASE,
    },
    at,
  )
}

const addTabsCascade = (tl: gsap.core.Timeline, tabs: NodeListOf<HTMLElement>, at: number) => {
  tl.fromTo(
    tabs,
    { autoAlpha: 0, y: -TEXT_Y, filter: `blur(${TEXT_BLUR_PX}px)` },
    {
      autoAlpha: 1,
      y: 0,
      filter: 'blur(0px)',
      duration: TEXT_DURATION,
      ease: TEXT_EASE,
      stagger: AUDIENCE_TABS_MOTION.tabStagger,
    },
    at,
  )
}

const addIntroDrop = (tl: gsap.core.Timeline, intro: HTMLElement, at: number) => {
  // Intro copy opens the column sharp — drop and fade only, no blur.
  tl.fromTo(
    intro,
    { autoAlpha: 0, y: -TEXT_Y },
    { autoAlpha: 1, y: 0, duration: TEXT_DURATION, ease: TEXT_EASE },
    at,
  )
}

/**
 * The list's staggered drop, shared by the entrance and the tab swap: the two
 * differ only in when the cascade starts and how tightly it stacks, so one
 * adder keeps a change to the motion from landing in just one of them.
 */
const addItemCascade = (
  tl: gsap.core.Timeline,
  items: NodeListOf<HTMLElement>,
  at: number,
  stagger: number,
) => {
  tl.fromTo(
    items,
    { autoAlpha: 0, y: -TEXT_Y, filter: itemBlurFrom },
    {
      autoAlpha: 1,
      y: 0,
      filter: 'blur(0px)',
      duration: TEXT_DURATION,
      ease: TEXT_EASE,
      stagger,
    },
    at,
  )
}

/**
 * The top-origin mask wipe and the zoom settle of the content behind it — one
 * beat over two layers, shared by the entrance and the tab swap so the wipe a
 * click plays can never drift from the one scrolling into view plays.
 */
const addMediaWipe = (
  tl: gsap.core.Timeline,
  mask: HTMLElement,
  content: Element | null,
  at: number,
) => {
  tl.fromTo(
    mask,
    { clipPath: 'inset(0% 0% 100% 0%)' },
    { clipPath: 'inset(0% 0% 0% 0%)', duration: MEDIA_DURATION, ease: MEDIA_EASE },
    at,
  )
  if (content) {
    tl.fromTo(
      content,
      { scale: MEDIA_SCALE_FROM },
      { scale: 1, duration: MEDIA_DURATION, ease: MEDIA_EASE },
      at,
    )
  }
}

/**
 * Entrance + tab-swap choreography for the audience-tabs block.
 *
 * Entrance sequence: heading → tab buttons (staggered, overlapping) → left
 * column elements (staggered, overlapping) → media mask-wipes open last, its
 * start computed from the item count so it always trails the column.
 *
 * Swap: the text transition and the image change start on the same click.
 * The incoming image immediately wipes down over the outgoing one (which
 * stays put underneath, so the container background never shows) while the
 * outgoing text fades out in place (sped up like every swap exit); the
 * incoming text then cascades in with the shared swap-entrance values. Selection and
 * media key on `active` (swapped at click); panel copy keys on `textIndex`
 * (swapped once the fade-out finishes).
 *
 * Unlike the shared shell contract, entrance targets here overlap swap
 * targets (individual list items both stagger in and swap). That's safe
 * because the entrance is play-once and a swap snaps it to its end state
 * before animating, so the two never own a node at the same time.
 */
export function useAudienceTabsMotion({
  rootRef,
  active,
  textIndex,
  onSelect,
  onTextSwap,
  onSettled,
}: {
  rootRef: RefObject<HTMLElement | null>
  /** Selected panel index — swapped at click; media wipe keys on its change. */
  active: number
  /** Rendered copy index — swapped after fade-out; text entrance keys on its change. */
  textIndex: number
  /** Swaps selection + media at click (and stashes the outgoing media). */
  onSelect: (index: number) => void
  /** Swaps the panel copy once the outgoing text has faded out. */
  onTextSwap: (index: number) => void
  /** Fires when the media wipe finishes so the outgoing underlay can unmount. */
  onSettled: () => void
}) {
  const entranceTlRef = useRef<gsap.core.Timeline | null>(null)
  const textTlRef = useRef<gsap.core.Timeline | null>(null)
  const mediaTlRef = useRef<gsap.core.Timeline | null>(null)
  const swappingTextRef = useRef(false)
  const swappingMediaRef = useRef(false)
  const targetIndexRef = useRef(active)
  const prefersReducedMotion = usePrefersReducedMotion()

  // Entrance: built at mount (hiding targets pre-paint), gated by the shared
  // viewport observer, played once — scrolling back never replays it.
  useGSAP(
    () => {
      const root = rootRef.current
      if (!root) return
      const markers = root.querySelectorAll<HTMLElement>('[data-entrance]')
      if (!markers.length) return

      if (prefersReducedMotion) {
        gsap.set(markers, { clearProps: 'all' })
        return
      }

      const build = () => {
        const heading = root.querySelector<HTMLElement>(ENTRANCE_HEADING)
        const tabs = root.querySelectorAll<HTMLElement>(ENTRANCE_TAB)
        const intro = root.querySelector<HTMLElement>(ENTRANCE_INTRO)
        const items = root.querySelectorAll<HTMLElement>(ENTRANCE_ITEM)
        const media = root.querySelector<HTMLElement>(ENTRANCE_MEDIA)
        // The clipped window's content — stable across swaps, unlike a
        // transient outgoing-media underlay that may sit first in the DOM.
        const mediaContent = root.querySelector<HTMLElement>(SWAP_MEDIA)

        const tl = gsap.timeline({ paused: true })
        if (heading) addHeadingDrop(tl, heading, 0)
        if (tabs.length) addTabsCascade(tl, tabs, AUDIENCE_TABS_MOTION.tabsAt)
        if (intro) addIntroDrop(tl, intro, AUDIENCE_TABS_MOTION.itemsAt)
        if (items.length) {
          addItemCascade(
            tl,
            items,
            // Items take the beat after the intro when one leads the column.
            AUDIENCE_TABS_MOTION.itemsAt + (intro ? AUDIENCE_TABS_MOTION.itemStagger : 0),
            AUDIENCE_TABS_MOTION.itemStagger,
          )
        }
        if (media) {
          // Media closes the sequence: it starts a beat after the last
          // column element begins (intro + items), capped so long panels
          // never push it past mediaAtMax.
          const cascadeCount = items.length + (intro ? 1 : 0)
          const mediaAt = Math.min(
            AUDIENCE_TABS_MOTION.itemsAt +
              Math.max(cascadeCount - 1, 0) * AUDIENCE_TABS_MOTION.itemStagger +
              AUDIENCE_TABS_MOTION.mediaLag,
            AUDIENCE_TABS_MOTION.mediaAtMax,
          )
          addMediaWipe(tl, media, mediaContent, mediaAt)
        }
        return tl
      }

      const entrance = build()
      entranceTlRef.current = entrance

      // Play-once, on the shared gate: the heading leads the entrance, so its
      // position is what the gate measures. Later swaps own the nodes from there.
      const gate = root.querySelector<HTMLElement>(ENTRANCE_HEADING) ?? root
      const stopGate = observeRevealGate(gate, ENTER_OFFSET, () => entrance.play())
      return () => {
        stopGate()
        entranceTlRef.current = null
      }
    },
    { scope: rootRef, dependencies: [prefersReducedMotion], revertOnUpdate: true },
  )

  // Media wipe: runs over the freshly rendered image at click time, pre-paint,
  // so the incoming layer starts fully clipped — the wipe and the text
  // transition share the same starting beat.
  useGSAP(
    () => {
      if (!swappingMediaRef.current) return
      swappingMediaRef.current = false
      const root = rootRef.current
      if (!root || prefersReducedMotion) return

      const mediaLayer = root.querySelector<HTMLElement>(SWAP_MEDIA)
      if (!mediaLayer) return
      const mediaContent = mediaLayer.firstElementChild

      // The incoming image wipes down over the outgoing underlay — same
      // top-origin mask and zoom settle as every media entrance, no reverse
      // motion, and the container background never shows.
      const tl = gsap.timeline({ onComplete: onSettled })
      addMediaWipe(tl, mediaLayer, mediaContent, 0)
      mediaTlRef.current = tl
    },
    { scope: rootRef, dependencies: [active, prefersReducedMotion] },
  )

  // Text entrance half: runs over the freshly rendered copy, pre-paint, so
  // the incoming text starts hidden — no flash of the unanimated state.
  const { contextSafe } = useGSAP(
    () => {
      if (!swappingTextRef.current) return
      swappingTextRef.current = false
      const root = rootRef.current
      if (!root || prefersReducedMotion) return

      const intro = root.querySelector<HTMLElement>(SWAP_INTRO)
      const texts = root.querySelectorAll<HTMLElement>(SWAP_TEXT)
      if (!intro && !texts.length) return

      // Incoming copy cascades in with the site's swap-entrance language —
      // the under-media drop and stagger, intro sharp, items settling from
      // the progressive blur — compressed to the same swap tempo as the
      // exit half: click-driven motion runs faster than the scroll entrance
      // it borrows its values from.
      const tl = gsap.timeline().timeScale(EXIT_TIME_SCALE)
      if (intro) addIntroDrop(tl, intro, 0)
      if (texts.length) addItemCascade(tl, texts, intro ? TEXT_STAGGER : 0, TEXT_STAGGER)
      textTlRef.current = tl
    },
    { scope: rootRef, dependencies: [textIndex, prefersReducedMotion] },
  )

  return contextSafe((index: number) => {
    if (index === targetIndexRef.current) return
    targetIndexRef.current = index
    const root = rootRef.current

    if (!root || prefersReducedMotion) {
      onSelect(index)
      onTextSwap(index)
      // Same batch as onSelect's underlay stash, so no underlay ever mounts.
      onSettled()
      return
    }

    // A click mid-entrance would leave the entrance fighting the swap over
    // the media clip + scale — snap it to its end state and release the nodes.
    if (entranceTlRef.current) {
      entranceTlRef.current.progress(1).kill()
      entranceTlRef.current = null
    }
    textTlRef.current?.kill()
    mediaTlRef.current?.kill()

    // Image change starts now: selection + media swap at click, and the media
    // effect above wipes the incoming image in.
    swappingMediaRef.current = true
    onSelect(index)

    // Text transition starts on the same beat: the outgoing copy fades out in
    // place (sped up like every swap exit), then the copy swap re-renders
    // and the text entrance half above plays.
    const texts = root.querySelectorAll<HTMLElement>(`${SWAP_INTRO}, ${SWAP_TEXT}`)
    if (!texts.length) {
      onTextSwap(index)
      return
    }
    textTlRef.current = gsap
      .timeline({
        onComplete: () => {
          swappingTextRef.current = true
          onTextSwap(index)
        },
      })
      .timeScale(EXIT_TIME_SCALE)
      .to(texts, { autoAlpha: 0, duration: TEXT_DURATION, ease: TEXT_EASE }, 0)
  })
}
