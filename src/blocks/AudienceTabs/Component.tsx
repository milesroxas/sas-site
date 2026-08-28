'use client'

import { useEffect, useRef, useState } from 'react'
import { Container } from '@/components/Container'
import { Media } from '@/components/Media'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'
import type {
  AudienceTabsBlock as AudienceTabsBlockProps,
  Media as MediaDoc,
} from '@/payload-types'
import { cn } from '@/utilities/ui'
import { Section, type SectionTheme } from '../shared/section'
import { useAudienceTabsMotion } from './use-audience-tabs-motion'

const MEDIA_SIZES = '(max-width: 1024px) 100vw, 58vw'

/**
 * Below `md` the tab list pans instead of wrapping. These labels are full
 * phrases, so a wrapped row turns into a four-line stack on a phone that
 * pushes the panel below the fold. The rail bleeds past the page gutter so a
 * half-cut tab — not a scrollbar — is the affordance, and `scroll-fade-x`
 * dims only the edge that still has tabs behind it (it rides the rail's own
 * scroll timeline, so the fade is gone at either end of the pan).
 *
 * `-my-5 / py-5` is layout-neutral padding, not spacing: `overflow-x-auto`
 * makes the rail clip on the block axis too, and the entrance lifts each tab
 * by the shared reveal's `textY` before dropping it in — without the room the
 * tabs would enter cropped, and the tap slop below would be clipped with them.
 */
const TAB_RAIL_MOBILE =
  'max-md:no-scrollbar max-md:scroll-fade-x max-md:scroll-fade-8 max-md:-mx-gutter max-md:-my-5 max-md:self-stretch max-md:overflow-x-auto max-md:overscroll-x-contain max-md:py-5 max-md:pe-gutter max-md:ps-gutter'

/**
 * `::after` pads the compact pill out to a 44px press target on touch-sized
 * screens without inflating how it looks — the same trick the carousel arrows
 * use. `md:after:hidden` drops the pad once the pointer is fine, so it can't
 * swallow hover on a neighbouring tab.
 */
const TAB_TOUCH_TARGET = 'relative after:absolute after:inset-x-0 after:-inset-y-2 md:after:hidden'

export const AudienceTabsBlock: React.FC<AudienceTabsBlockProps> = ({ heading, tabs, theme }) => {
  const panels = tabs ?? []
  // Selection + media swap at click; the panel copy follows once its
  // fade-out finishes, so both transitions start on the same beat.
  const [active, setActive] = useState(0)
  const [textIndex, setTextIndex] = useState(0)
  // Outgoing image kept mounted under the incoming one while a swap wipes in.
  const [prevMedia, setPrevMedia] = useState<MediaDoc | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const railRef = useRef<HTMLElement>(null)
  const prefersReducedMotion = usePrefersReducedMotion()

  const selectTab = useAudienceTabsMotion({
    rootRef,
    active,
    textIndex,
    onSelect: (index) => {
      const outgoing = panels[active]?.media
      setPrevMedia(typeof outgoing === 'object' ? (outgoing as MediaDoc) : null)
      setActive(index)
    },
    onTextSwap: setTextIndex,
    onSettled: () => setPrevMedia(null),
  })

  // Keep the selected tab inside the rail's viewport: tapping one that sits
  // half past the edge should finish the pan rather than leave the selection
  // where it can't be read. Scrolls the rail itself — `scrollIntoView` walks
  // up every ancestor scroller and would move the page under Lenis too — and
  // only by the shortfall, so a tab already fully in view never shifts. The
  // inset it scrolls to is the rail's own padding, read off the element, so
  // the gutter is never restated here. No-op above `md`, where the rail has
  // no overflow to scroll.
  useEffect(() => {
    const rail = railRef.current
    const tab = rail?.querySelectorAll<HTMLElement>('[data-entrance="tab"]')[active]
    if (!rail || !tab) return

    const style = getComputedStyle(rail)
    const railBox = rail.getBoundingClientRect()
    const tabBox = tab.getBoundingClientRect()
    const pastStart = railBox.left + Number.parseFloat(style.paddingLeft) - tabBox.left
    const pastEnd = tabBox.right - (railBox.right - Number.parseFloat(style.paddingRight))
    const left = pastStart > 0 ? -pastStart : pastEnd > 0 ? pastEnd : 0
    if (!left) return

    rail.scrollBy({ left, behavior: prefersReducedMotion ? 'auto' : 'smooth' })
  }, [active, prefersReducedMotion])

  if (panels.length === 0) return null

  const current = panels[textIndex] ?? panels[0]
  const activeMedia = panels[active]?.media
  const media = typeof activeMedia === 'object' ? (activeMedia as MediaDoc) : null

  return (
    <Section spacing="loose" theme={(theme as SectionTheme | null) ?? 'dark'}>
      <Container
        width="default"
        className="flex flex-col items-center gap-10 md:gap-16"
        ref={rootRef}
      >
        <h2
          // `self-stretch` below md so the left edge is the page gutter: the
          // column centres its children, and a short heading would otherwise
          // shrink to fit and sit centred whatever the text-align says.
          className="max-w-4xl text-heading-2 leading-normal font-light text-foreground/80 max-md:self-stretch md:text-center"
          data-entrance="heading"
        >
          {heading}
        </h2>

        {/* A labelled `section`, not a div, because a scrollable region needs a
            name — Chrome and Firefox make overflow containers keyboard-focusable
            on their own. No `tabIndex` and no `tablist` semantics: every tab is
            a real button in the DOM regardless of scroll position, so Tab order
            and screen readers already bring their own tab into view. */}
        <section
          aria-label="Choose an audience"
          className={cn(
            'flex items-center gap-2 md:mb-12 md:flex-wrap md:justify-center md:gap-3',
            TAB_RAIL_MOBILE,
          )}
          // Root Lenis runs `syncTouch`, so it preventDefaults every touchmove
          // and drives the page itself — a sideways swipe in here would never
          // reach the browser. The attribute releases only the gestures Lenis
          // reads as horizontal, so panning the rail is native (momentum,
          // rubber-band) while an up/down swipe started on a tab still
          // smooth-scrolls the page.
          data-lenis-prevent-horizontal
          ref={railRef}
        >
          {panels.map((tab, index) => {
            const selected = index === active
            return (
              <button
                aria-pressed={selected}
                className={cn(
                  'pressable flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-sm/none whitespace-nowrap md:px-4 md:text-base/none',
                  TAB_TOUCH_TARGET,
                  selected
                    ? 'border-transparent bg-foreground/15 text-foreground'
                    : 'border-foreground/25 text-muted-foreground hover:text-foreground',
                )}
                data-entrance="tab"
                key={tab.id ?? index}
                // Mouse/pen commit at press, not release; touch stays on
                // click so a scroll drag starting on a tab never selects it.
                // selectTab dedupes, so the follow-up click is a no-op.
                onClick={() => selectTab(index)}
                onPointerDown={(event) => {
                  if (event.pointerType !== 'touch') selectTab(index)
                }}
                type="button"
              >
                {tab.title}
              </button>
            )
          })}
        </section>

        <div className="grid w-full grid-cols-1 items-stretch gap-8 md:gap-12 lg:grid-cols-12  lg:gap-x-12">
          <div className="flex w-full max-w-xl flex-col gap-8 md:gap-16 lg:col-span-5">
            <div className="flex max-w-md flex-col gap-4">
              <p className="text-lead font-light" data-entrance="intro" data-swap="intro">
                {current.intro}
              </p>
              {current.description ? (
                <p className="text-sm text-muted-foreground" data-entrance="item" data-swap="text">
                  {current.description}
                </p>
              ) : null}
            </div>
            {current.items?.length ? (
              <ul className="flex flex-col divide-y divide-foreground/20">
                {current.items.map((item, itemIndex) => (
                  <li
                    className="py-3 text-sm first:pt-0 last:pb-0 md:text-sm"
                    data-entrance="item"
                    data-swap="text"
                    key={item.id ?? itemIndex}
                  >
                    {item.text}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <div
            className="relative aspect-4/3 w-full overflow-hidden rounded-md bg-muted lg:col-span-7"
            data-entrance="media"
          >
            {prevMedia ? (
              <div aria-hidden className="absolute inset-0">
                <Media
                  fill
                  htmlElement={null}
                  imgClassName="object-cover"
                  resource={prevMedia}
                  size={MEDIA_SIZES}
                />
              </div>
            ) : null}
            <div className="absolute inset-0" data-swap="media">
              {media ? (
                <Media
                  fill
                  htmlElement={null}
                  imgClassName="object-cover"
                  // Fresh element per image so the swap wipes a new node in
                  // over the underlay instead of mutating the old img's src.
                  key={media.id}
                  resource={media}
                  size={MEDIA_SIZES}
                />
              ) : null}
            </div>
          </div>
        </div>
      </Container>
    </Section>
  )
}
