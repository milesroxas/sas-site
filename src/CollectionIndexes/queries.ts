import configPromise from '@payload-config'
import { draftMode } from 'next/headers'
import { getPayload } from 'payload'
import { cache } from 'react'
import type { Page } from '@/payload-types'

/** Rendered until an editor publishes the Insights Index global. */
export const insightsIndexHeroFallback: Page['hero'] = {
  type: 'lowImpact',
  eyebrow: 'Insights',
  title: 'News & Insights',
}

/** Rendered until an editor publishes the Works Index global. */
export const worksIndexHeroFallback: Page['hero'] = {
  type: 'lowImpact',
  eyebrow: 'Work',
  title: 'Selected work',
}

const queryIndexGlobal = async (slug: 'insights-index' | 'works-index') => {
  const { isEnabled: draft } = await draftMode()
  const payload = await getPayload({ config: configPromise })

  return payload.findGlobal({
    slug,
    depth: 1,
    draft,
    overrideAccess: draft,
  })
}

export const queryInsightsIndex = cache(() => queryIndexGlobal('insights-index'))

export const queryWorksIndex = cache(() => queryIndexGlobal('works-index'))
