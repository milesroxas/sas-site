'use client'

import { useGSAP } from '@gsap/react'
import { IconChevronDown } from '@tabler/icons-react'
import gsap from 'gsap'
import { useRef, useState } from 'react'
import { Media } from '@/components/Media'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'
import type {
  DynamicAudienceBlock as DynamicAudienceBlockProps,
  Media as MediaDoc,
} from '@/payload-types'
import {
  SCROLL_REVEAL_TRIGGER_DEFAULTS,
  SCROLL_REVEAL_UNDER_MEDIA,
} from '@/shared/ui/scroll-reveal'
import { cn } from '@/utilities/ui'
import { Container } from '../shared/container'
import { Section, type SectionTheme } from '../shared/section'

gsap.registerPlugin(useGSAP)

/**
 * Audience-swap choreography speaks the under-media reveal's language — text
 * drops with a blur settle, media settles from the same zoom — so every value
 * is imported from the reveal that owns it, never restated. Swap targets
 * (`data-swap`) are distinct nodes from the shell's `data-reveal` targets, so
 * the entrance timeline and the swap tweens never write to the same element.
 */
const {
  textY: TEXT_Y,
  textBlurPx: TEXT_BLUR_PX,
  textDuration: TEXT_DURATION,
  textEase: TEXT_EASE,
  stagger: STAGGER,
  mediaDuration: MEDIA_DURATION,
  mediaEase: MEDIA_EASE,
  mediaScaleFrom: MEDIA_SCALE_FROM,
} = SCROLL_REVEAL_UNDER_MEDIA
const { exitTimeScale: EXIT_TIME_SCALE } = SCROLL_REVEAL_TRIGGER_DEFAULTS

const SWAP_TEXT = '[data-swap="text"]'
const SWAP_MEDIA = '[data-swap="media"]'

type Audience = NonNullable<DynamicAudienceBlockProps['audiences']>[number]

const valueFor = (audience: Audience, index: number) => audience.id ?? String(index)

export const DynamicAudienceBlock: React.FC<DynamicAudienceBlockProps> = ({
  heading,
  audiences,
  theme,
}) => {
  const panels = audiences ?? []
  const [active, setActive] = useState(0)
  const openedWithPointerRef = useRef(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const swapTlRef = useRef<gsap.core.Timeline | null>(null)
  const swappingRef = useRef(false)
  const targetIndexRef = useRef(0)
  const prefersReducedMotion = usePrefersReducedMotion()

  const { contextSafe } = useGSAP(
    () => {
      // Entrance half of a swap only — the shell's ScrollReveal owns the
      // first entrance, so mount and reduced-motion renders stay untouched.
      if (!swappingRef.current) return
      swappingRef.current = false
      const root = rootRef.current
      if (!root || prefersReducedMotion) return

      const texts = root.querySelectorAll<HTMLElement>(SWAP_TEXT)
      const media = root.querySelector<HTMLElement>(SWAP_MEDIA)
      const tl = gsap.timeline()
      if (texts.length) {
        tl.fromTo(
          texts,
          { autoAlpha: 0, y: -TEXT_Y, filter: `blur(${TEXT_BLUR_PX}px)` },
          {
            autoAlpha: 1,
            y: 0,
            filter: 'blur(0px)',
            duration: TEXT_DURATION,
            ease: TEXT_EASE,
            stagger: STAGGER,
          },
          0,
        )
      }
      if (media) {
        tl.fromTo(
          media,
          { autoAlpha: 0, scale: MEDIA_SCALE_FROM },
          { autoAlpha: 1, scale: 1, duration: MEDIA_DURATION, ease: MEDIA_EASE },
          0,
        )
      }
      swapTlRef.current = tl
    },
    { scope: rootRef, dependencies: [active, prefersReducedMotion] },
  )

  const selectAudience = contextSafe((index: number) => {
    if (index === targetIndexRef.current) return
    targetIndexRef.current = index
    const root = rootRef.current
    if (!root || prefersReducedMotion) {
      setActive(index)
      return
    }

    // Exit half: current content lifts out (sped up like every reveal exit),
    // then the state swap re-renders and the entrance effect above plays.
    swapTlRef.current?.kill()
    swappingRef.current = true
    const texts = root.querySelectorAll<HTMLElement>(SWAP_TEXT)
    const media = root.querySelector<HTMLElement>(SWAP_MEDIA)
    const tl = gsap.timeline({ onComplete: () => setActive(index) }).timeScale(EXIT_TIME_SCALE)
    if (texts.length) {
      tl.to(
        texts,
        {
          autoAlpha: 0,
          y: -TEXT_Y,
          filter: `blur(${TEXT_BLUR_PX}px)`,
          duration: TEXT_DURATION,
          ease: TEXT_EASE,
          stagger: STAGGER,
        },
        0,
      )
    }
    if (media) {
      tl.to(
        media,
        { autoAlpha: 0, scale: MEDIA_SCALE_FROM, duration: MEDIA_DURATION, ease: MEDIA_EASE },
        0,
      )
    }
    swapTlRef.current = tl
  })

  if (panels.length === 0) return null

  const current = panels[active] ?? panels[0]
  const media = typeof current.media === 'object' ? (current.media as MediaDoc) : null

  return (
    <Section theme={(theme as SectionTheme | null) ?? 'light'}>
      <Container width="standard" className="flex flex-col gap-8 md:gap-16 lg:gap-24" ref={rootRef}>
        <h2
          className="flex max-w-4xl flex-wrap items-center gap-x-3 gap-y-2 text-3xl font-light leading-10 text-foreground md:gap-4 md:text-4xl"
          data-reveal
        >
          <span className="text-muted-foreground">{heading}</span>
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger
              className={cn(
                'group inline-flex items-center justify-center gap-1.5 rounded-md px-2 py-1',
                'bg-muted text-3xl font-light font-mono text-foreground',
                'outline-none transition-colors hover:bg-accent',
                'focus:outline-none focus:ring-0',
                'focus-visible:ring-2 focus-visible:ring-ring/30',
                'data-[state=open]:bg-accent',
              )}
              onPointerDown={() => {
                openedWithPointerRef.current = true
              }}
              onKeyDown={() => {
                openedWithPointerRef.current = false
              }}
            >
              {current.title}
              <IconChevronDown className="size-6 shrink-0 transition-transform group-data-[state=open]:rotate-180" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              sideOffset={4}
              className={cn(
                'w-max min-w-(--radix-dropdown-menu-trigger-width) rounded-md bg-popover p-3 pr-14',
                'flex flex-col gap-6',
              )}
              onCloseAutoFocus={(event) => {
                if (openedWithPointerRef.current) {
                  event.preventDefault()
                  openedWithPointerRef.current = false
                }
              }}
            >
              {panels.map((audience, index) => {
                const selected = index === active
                return (
                  <DropdownMenuItem
                    key={valueFor(audience, index)}
                    className={cn(
                      'min-h-0 cursor-pointer rounded-none p-0 font-mono text-xl font-light whitespace-nowrap text-popover-foreground',
                      'focus:bg-transparent focus:text-popover-foreground',
                      selected && 'opacity-50',
                    )}
                    onSelect={() => selectAudience(index)}
                  >
                    {audience.title}
                  </DropdownMenuItem>
                )
              })}
            </DropdownMenuContent>
          </DropdownMenu>
          <span data-swap="text">{current.subheading}</span>
        </h2>

        <div className="flex flex-col items-stretch gap-8 md:gap-12 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex w-full max-w-xl flex-col gap-6 md:gap-8" data-reveal>
            <p className="text-xl leading-8 text-foreground md:text-2xl" data-swap="text">
              {current.intro}
            </p>
            {current.items?.length ? (
              <ul className="flex flex-col divide-y divide-border">
                {current.items.map((item, itemIndex) => (
                  <li
                    key={item.id ?? itemIndex}
                    className="py-2.5 text-base leading-6 text-muted-foreground first:pt-0 last:pb-0 md:py-3 md:text-lg md:leading-7"
                    data-swap="text"
                  >
                    {item.text}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <div
            className="relative aspect-4/5 w-full shrink-0 overflow-hidden bg-muted lg:w-118 lg:self-start"
            data-reveal="media"
          >
            <div className="absolute inset-0" data-swap="media">
              {media ? (
                <Media
                  fill
                  htmlElement={null}
                  imgClassName="object-cover"
                  resource={media}
                  size="(max-width: 1024px) 100vw, 472px"
                />
              ) : null}
            </div>
          </div>
        </div>
      </Container>
    </Section>
  )
}
