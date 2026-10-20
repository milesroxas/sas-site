import configPromise from '@payload-config'
import { draftMode } from 'next/headers'
import { getPayload } from 'payload'
import { cache } from 'react'
import type { Page } from '@/payload-types'
import type { CollectionIndexSlug } from './config'

/** Rendered until an editor publishes the Insights Index global. */
export const insightsIndexHeroFallback: Page['hero'] = {
  type: 'lowImpact',
  eyebrow: 'Insights',
  title: 'News & Insights',
}

/** Rendered until an editor publishes the Lab Index global. */
export const labIndexHeroFallback: Page['hero'] = {
  type: 'lowImpact',
  eyebrow: 'Lab',
  title: 'The lab',
}

/** Rendered until an editor publishes the Works Index global. */
export const worksIndexHeroFallback: Page['hero'] = {
  type: 'lowImpact',
  eyebrow: 'Work',
  title: 'Selected work',
}

/** Rendered until an editor publishes the Expertise Index global. */
export const expertiseIndexHeroFallback: Page['hero'] = {
  type: 'lowImpact',
  eyebrow: 'Expertise',
  title: 'Expertise',
}

/** Rendered until an editor publishes the Who We Help Index global. */
export const audienceIndexHeroFallback: Page['hero'] = {
  type: 'lowImpact',
  eyebrow: 'Who we help',
  title: 'Who we help',
}

/** Generic over the slug, so each index reads as its own type (the lab index carries a banner). */
const queryIndexGlobal = async <Slug extends CollectionIndexSlug>(slug: Slug) => {
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

export const queryLabIndex = cache(() => queryIndexGlobal('lab-index'))

export const queryWorksIndex = cache(() => queryIndexGlobal('works-index'))

export const queryExpertiseIndex = cache(() => queryIndexGlobal('expertise-index'))

export const queryAudienceIndex = cache(() => queryIndexGlobal('audience-index'))
