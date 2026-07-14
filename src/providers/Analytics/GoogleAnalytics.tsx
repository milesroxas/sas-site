'use client'

import { useConsentManager } from '@c15t/nextjs'
import { GoogleAnalytics as GoogleAnalyticsScript } from '@next/third-parties/google'
import { useEffect, useState } from 'react'

const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

type DataLayerWindow = Window & { dataLayer?: unknown[] }

// gtag.js only routes commands pushed as IArguments objects — a plain array
// is silently ignored — hence the classic function/arguments form.
function gtag(..._args: unknown[]) {
  const w = window as DataLayerWindow
  w.dataLayer = w.dataLayer ?? []
  // biome-ignore lint/complexity/noArguments: gtag.js requires the IArguments object itself; arrays are not processed
  w.dataLayer.push(arguments)
}

/**
 * Consent-gated GA4 (basic Google Consent Mode v2). gtag.js is not loaded at
 * all until the c15t `measurement` category is granted; consent-mode defaults
 * enter the dataLayer before the config command, and later revocations flip
 * `analytics_storage` to denied without a reload.
 */
export const GoogleAnalytics: React.FC = () => {
  const { has } = useConsentManager()
  const measurementAllowed = has('measurement')
  const [scriptLoaded, setScriptLoaded] = useState(false)

  useEffect(() => {
    if (!gaId) {
      return
    }

    if (measurementAllowed && !scriptLoaded) {
      // Ads signals stay denied — this site only does measurement.
      gtag('consent', 'default', {
        ad_personalization: 'denied',
        ad_storage: 'denied',
        ad_user_data: 'denied',
        analytics_storage: 'granted',
      })
      setScriptLoaded(true)
    } else if (scriptLoaded) {
      gtag('consent', 'update', {
        analytics_storage: measurementAllowed ? 'granted' : 'denied',
      })
    }
  }, [measurementAllowed, scriptLoaded])

  if (!gaId || !scriptLoaded) {
    return null
  }

  return <GoogleAnalyticsScript gaId={gaId} />
}
