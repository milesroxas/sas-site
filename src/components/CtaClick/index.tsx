'use client'

import type React from 'react'
import { type CtaLocation, captureCtaClick } from '@/utilities/analyticsClient'

/**
 * Counts a click on the call to action it wraps as `cta_clicked`. A `contents`
 * wrapper so the link keeps its own layout box, and a capture-phase listener so
 * the count lands before a route transition unmounts the link. Server callers
 * (the closing band, the CTA block, the FAQ header) wrap a `CMSLink` in it;
 * client callers capture directly.
 */
export const CtaClick: React.FC<{
  children: React.ReactNode
  href: string
  label: string
  location: CtaLocation
}> = ({ children, href, label, location }) => (
  <span
    className="contents"
    onClickCapture={() => {
      captureCtaClick({ location, label, href })
    }}
  >
    {children}
  </span>
)
