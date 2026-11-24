'use client'

import { useEffect } from 'react'

/**
 * Defines the `lite-youtube` custom element in the browser, once per page
 * (an ES module evaluates once however many embeds import it).
 *
 * The element's markup is server-rendered and its poster is an inline
 * background, so the embed paints — and its play button links straight to
 * YouTube — before this module arrives, and with no JavaScript at all. All
 * the upgrade adds is playing in place instead of navigating away, which is
 * why it is loaded on mount rather than blocking anything.
 */
export const RegisterLiteYouTube = () => {
  useEffect(() => {
    void import('lite-youtube-embed')
  }, [])
  return null
}
