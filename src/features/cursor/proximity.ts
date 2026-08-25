'use client'

import { type RefObject, useCallback } from 'react'

/**
 * JS side of the provider's proximity signal. CSS consumers read the
 * `--cursor-proximity` var the provider writes on targets (see variants.ts);
 * imperative consumers — WebGL scenes on a demand frameloop, anything that
 * can't watch a CSS var — subscribe here and receive the same quantized 0–1
 * value (1 = true hover) whenever it changes for their element.
 */

type ProximityListener = (t: number) => void

const channels = new WeakMap<Element, Set<ProximityListener>>()

/** Subscribe to a cursor target's proximity. Returns the unsubscribe. */
export function subscribeCursorProximity(
  element: Element,
  listener: ProximityListener,
): () => void {
  let listeners = channels.get(element)
  if (!listeners) {
    listeners = new Set()
    channels.set(element, listeners)
  }
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/** Provider-only: fan a target's proximity out to its subscribers. */
export function publishCursorProximity(element: Element, t: number): void {
  const listeners = channels.get(element)
  if (!listeners) return
  for (const listener of listeners) listener(t)
}

/**
 * Binds a cursor-target ref to a subscribe function shaped for effect props
 * (e.g. `RefractionMedia`'s `subscribeProximity`). Stable across renders;
 * consumers call it inside an effect, after the ref has attached.
 */
export function useCursorProximitySource(
  ref: RefObject<Element | null>,
): (listener: ProximityListener) => () => void {
  return useCallback(
    (listener: ProximityListener) => {
      const element = ref.current
      if (!element) return () => {}
      return subscribeCursorProximity(element, listener)
    },
    [ref],
  )
}
