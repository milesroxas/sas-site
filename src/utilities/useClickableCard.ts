'use client'

import { useRouter } from 'next/navigation'
import type { RefObject } from 'react'
import { addTransitionType, startTransition, useCallback, useEffect, useRef } from 'react'

import { NAV_FORWARD } from '@/shared/lib/view-transition/constants'

type UseClickableCardType<T extends HTMLElement> = {
  card: {
    ref: RefObject<T | null>
  }
  link: {
    ref: RefObject<HTMLAnchorElement | null>
  }
}

interface Props {
  external?: boolean
  newTab?: boolean
  scroll?: boolean
  /**
   * View-transition type tagged on the card-body push, so a body click
   * animates exactly like the card's own tagged link (card -> detail is a
   * forward move). Pass `null` for an untagged (hard-cut) navigation.
   */
  transitionType?: string | null
}

/**
 * Travel, in px, that turns a press into a drag. This is embla's own
 * `dragThreshold` default, so a card and the carousel it sits in agree on what
 * a drag is: movement embla ignores still opens the entry, movement embla acts
 * on never does, and there is no band where neither responds.
 */
const DRAG_SLOP_PX = 10

/** Marks the card while a press has become a drag, so `pressable` lets go. */
const DRAGGING_ATTR = 'data-dragging'

/**
 * Makes a card body navigate to its own `<Link>`, deciding by **pointer travel**
 * rather than elapsed time: a flick across a rail is a fast gesture, and a
 * careful click is often a slow one, so time reads intent backwards.
 *
 * Navigation rides the `click` event, not `pointerup`. Embla suppresses the
 * click at the carousel root in the capture phase once a drag commits, so a
 * bubble-phase listener on the card inherits that for free; the slop below
 * covers every card outside a carousel (a drag across a title to select text
 * must not navigate either).
 */
function useClickableCard<T extends HTMLElement>({
  external = false,
  newTab = false,
  scroll = true,
  transitionType = NAV_FORWARD,
}: Props): UseClickableCardType<T> {
  const router = useRouter()
  const card = useRef<T>(null)
  const link = useRef<HTMLAnchorElement>(null)
  /** Where the live press started; null once it has travelled past the slop. */
  const pointerStart = useRef<{ x: number; y: number } | null>(null)
  const hasActiveParent = useRef<boolean>(false)
  /** Aborts the document listeners that exist only while a pointer is down. */
  const pressAbort = useRef<AbortController | null>(null)

  const endPress = useCallback(() => {
    pressAbort.current?.abort()
    pressAbort.current = null
    card.current?.removeAttribute(DRAGGING_ATTR)
  }, [])

  const handlePointerMove = useCallback((e: PointerEvent) => {
    const start = pointerStart.current
    if (!start) return
    if (Math.hypot(e.clientX - start.x, e.clientY - start.y) <= DRAG_SLOP_PX) return
    // Past the slop: this press can no longer navigate, and the surface stops
    // pretending it took a click.
    pointerStart.current = null
    card.current?.setAttribute(DRAGGING_ATTR, '')
  }, [])

  const handlePointerDown = useCallback(
    (e: PointerEvent) => {
      endPress()
      const target = e.target as Element | null
      hasActiveParent.current = Boolean(target?.closest('a'))
      pointerStart.current = e.isPrimary && e.button === 0 ? { x: e.clientX, y: e.clientY } : null
      if (!pointerStart.current) return

      // Move and up live on the document, so a drag that leaves the card still
      // ends, and only for the length of the press. Nothing here calls
      // preventDefault — embla owns that — so every listener is passive.
      const controller = new AbortController()
      pressAbort.current = controller
      const options: AddEventListenerOptions = { passive: true, signal: controller.signal }
      document.addEventListener('pointermove', handlePointerMove, options)
      document.addEventListener('pointerup', endPress, options)
      document.addEventListener('pointercancel', endPress, options)
    },
    [endPress, handlePointerMove],
  )

  const handleClick = useCallback(
    (e: MouseEvent) => {
      // Read once: a click with no live press behind it — keyboard Enter on the
      // inner link, a synthesised click — is not this handler's to answer.
      const start = pointerStart.current
      pointerStart.current = null

      const href = link.current?.href
      if (!href || !start || hasActiveParent.current) return
      // Modifier clicks belong to the browser and the real anchor, never to a
      // synthetic same-tab push.
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return

      if (external) {
        window.open(href, newTab ? '_blank' : '_self')
        return
      }

      startTransition(() => {
        if (transitionType) addTransitionType(transitionType)
        router.push(href, { scroll })
      })
    },
    [router, newTab, scroll, external, transitionType],
  )

  useEffect(() => {
    const cardNode = card.current

    const abortController = new AbortController()

    if (cardNode) {
      cardNode.addEventListener('pointerdown', handlePointerDown, {
        passive: true,
        signal: abortController.signal,
      })
      cardNode.addEventListener('click', handleClick, {
        signal: abortController.signal,
      })
    }

    return () => {
      abortController.abort()
      endPress()
    }
  }, [handlePointerDown, handleClick, endPress])

  return {
    card: {
      ref: card,
    },
    link: {
      ref: link,
    },
  }
}

export default useClickableCard
