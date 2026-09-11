'use client'

import { useConsentManager } from '@c15t/nextjs'
import Script from 'next/script'
import type React from 'react'
import { useEffect, useState } from 'react'

const reb2bKey = process.env.NEXT_PUBLIC_REB2B_KEY

/**
 * Reb2b (B2B visitor identification), for US visitors only.
 *
 * Reb2b matches a visit to a company and, for US visitors, to a person, through
 * a third-party data broker. That is marketing, not measurement, so it waits
 * for the c15t `marketing` category, whose banner copy (ConsentProvider) says
 * what it does. It is also never loaded outside the US: the vendor's own geo
 * check runs only after its script has read the device, which is the step EU
 * consent law regulates, and it identifies companies for EU visitors by
 * default.
 *
 * The country comes from /api/geo, fetched only once consent is granted, so the
 * prerendered pages never read request headers and stay static. An unknown
 * country fails closed. Revoking consent takes effect on the next full page
 * load: the vendor script has no off switch once it has run.
 */
export const Reb2b: React.FC = () => {
  const { has } = useConsentManager()
  const allowed = Boolean(reb2bKey) && has('marketing')
  const [inUnitedStates, setInUnitedStates] = useState(false)

  useEffect(() => {
    if (!allowed || inUnitedStates) return

    const controller = new AbortController()
    fetch('/api/geo', { cache: 'no-store', signal: controller.signal })
      .then((response) => (response.ok ? response.json() : null))
      .then((body: { country?: unknown } | null) => {
        if (body?.country === 'US') setInUnitedStates(true)
      })
      .catch(() => undefined)

    return () => controller.abort()
  }, [allowed, inUnitedStates])

  if (!allowed || !inUnitedStates) return null

  return (
    <Script
      id="reb2b"
      src={`https://b2bjsstore.s3.us-west-2.amazonaws.com/b/${reb2bKey}/${reb2bKey}.js.gz`}
      strategy="lazyOnload"
    />
  )
}
