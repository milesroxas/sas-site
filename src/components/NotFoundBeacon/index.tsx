'use client'

import { useEffect } from 'react'
import { capturePageNotFound } from '@/utilities/analyticsClient'

/**
 * Renders nothing; reports the 404 once per mount so broken inbound links
 * (old Webflow paths, typos in a partner's post) show up by path and referrer.
 */
export const NotFoundBeacon = () => {
  useEffect(() => {
    capturePageNotFound()
  }, [])
  return null
}
