'use client'

import { useConsentManager } from '@c15t/nextjs'
import Script from 'next/script'

const reb2bKey = process.env.NEXT_PUBLIC_REB2B_KEY

/**
 * Consent-gated Reb2b (B2B visitor identification). The vendor snippet
 * injects on parse; this waits for the c15t `measurement` category, then
 * loads via `lazyOnload` so it runs after the page is idle.
 */
export const Reb2b: React.FC = () => {
  const { has } = useConsentManager()
  const measurementAllowed = has('measurement')

  if (!reb2bKey || !measurementAllowed) {
    return null
  }

  return (
    <Script
      id="reb2b"
      src={`https://b2bjsstore.s3.us-west-2.amazonaws.com/b/${reb2bKey}/${reb2bKey}.js.gz`}
      strategy="lazyOnload"
    />
  )
}
