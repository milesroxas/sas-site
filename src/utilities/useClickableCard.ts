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

function useClickableCard<T extends HTMLElement>({
  external = false,
  newTab = false,
  scroll = true,
  transitionType = NAV_FORWARD,
}: Props): UseClickableCardType<T> {
  const router = useRouter()
  const card = useRef<T>(null)
  const link = useRef<HTMLAnchorElement>(null)
  const timeDown = useRef<number>(0)
  const hasActiveParent = useRef<boolean>(false)
  const pressedButton = useRef<number>(0)

  const handleMouseDown = useCallback((e: MouseEvent) => {
    if (e.target) {
      const target = e.target as Element

      const timeNow = Date.now()
      const parent = target?.closest('a')

      pressedButton.current = e.button

      if (!parent) {
        hasActiveParent.current = false
        timeDown.current = timeNow
      } else {
        hasActiveParent.current = true
      }
    }
  }, [])

  const handleMouseUp = useCallback(
    (e: MouseEvent) => {
      if (link.current?.href) {
        const timeNow = Date.now()
        const difference = timeNow - timeDown.current

        if (link.current?.href && difference <= 250) {
          if (!hasActiveParent.current && pressedButton.current === 0 && !e.ctrlKey) {
            if (external) {
              const target = newTab ? '_blank' : '_self'
              window.open(link.current.href, target)
            } else {
              const href = link.current.href
              startTransition(() => {
                if (transitionType) addTransitionType(transitionType)
                router.push(href, { scroll })
              })
            }
          }
        }
      }
    },
    [router, newTab, scroll, external, transitionType],
  )

  useEffect(() => {
    const cardNode = card.current

    const abortController = new AbortController()

    if (cardNode) {
      cardNode.addEventListener('mousedown', handleMouseDown, {
        signal: abortController.signal,
      })
      cardNode.addEventListener('mouseup', handleMouseUp, {
        signal: abortController.signal,
      })
    }

    return () => {
      abortController.abort()
    }
  }, [handleMouseDown, handleMouseUp])

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
