'use client'

import { useSyncExternalStore } from 'react'

const subscribe = () => () => {}
const getSnapshot = () => true
const getServerSnapshot = () => false

/**
 * `false` for the server render and the hydration render, `true` on every
 * client render after that. `useSyncExternalStore` re-renders with the
 * client snapshot once hydration has committed, so server and client markup
 * still match and the flip lands in the same paint as the first effects.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
