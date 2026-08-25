import configPromise from '@payload-config'
import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import { getPayload } from 'payload'
import { cache } from 'react'
import { RenderBlocks } from '@/blocks/RenderBlocks'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { homeStatic } from '@/endpoints/seed/home-static'
import { FooterClosingSection } from '@/Footer/Closing/Component'
import { RenderHomeHero } from '@/Home/hero'
import { HomeStatement } from '@/Home/statement'
import { generateMeta } from '@/utilities/generateMeta'
import PageClient from './[slug]/page.client'

export default async function HomePage() {
  const { isEnabled: draft } = await draftMode()
  const home = (await queryHome()) ?? homeStatic

  const { hero, layout, statement } = home

  return (
    <>
      <article className="pb-24">
        <PageClient />
        {draft && <LivePreviewListener />}
        <RenderHomeHero {...hero} />
        {statement && !statement.hidden ? <HomeStatement {...statement} /> : null}
        <RenderBlocks blocks={layout} />
      </article>
      <FooterClosingSection />
    </>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  const home = await queryHome()

  return generateMeta({
    doc: home,
    pathname: '/',
  })
}

const queryHome = cache(async () => {
  const { isEnabled: draft } = await draftMode()
  const payload = await getPayload({ config: configPromise })

  const home = await payload.findGlobal({
    slug: 'home',
    depth: 2,
    draft,
    overrideAccess: draft,
  })

  const hasContent = Boolean(home?.layout?.length) || Boolean(home?.hero?.title)
  if (!hasContent) return null

  return home
})
