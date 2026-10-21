import configPromise from '@payload-config'
import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import { getPayload, type RequiredDataFromCollectionSlug } from 'payload'
import { cache } from 'react'
import { RenderBlocks } from '@/blocks/RenderBlocks'
import { JsonLd } from '@/components/JsonLd'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { FooterClosingSection } from '@/Footer/Closing/Component'
import { FOOTER_CLOSING_ARTICLE_CLASS } from '@/Footer/Closing/curtain'
import { RenderHero } from '@/heros/RenderHero'
import { generateMeta } from '@/utilities/generateMeta'
import { isPublishedSlug } from '@/utilities/publishedSlugs'
import { faqPageSchema } from '@/utilities/schema'
import { cn } from '@/utilities/ui'

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const pages = await payload.find({
    collection: 'pages',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: {
      slug: true,
    },
  })

  return pages.docs
    ?.filter((doc) => Boolean(doc.slug))
    .map(({ slug }) => {
      return { slug }
    })
}

type Args = {
  params: Promise<{
    slug?: string
  }>
}

export default async function Page({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { slug = '' } = await paramsPromise
  // Decode to support slugs with special characters
  const decodedSlug = decodeURIComponent(slug)
  const page: RequiredDataFromCollectionSlug<'pages'> | null = await queryPageBySlug({
    slug: decodedSlug,
  })

  if (!page) {
    notFound()
  }

  const { hero, layout } = page
  const faqSchema = faqPageSchema(layout)

  return (
    // The high-impact hero pulls itself under the fixed header
    // (-mt-(--header-height)), so top padding would leave a bare strip
    // behind the header; padded starts are for the in-flow hero types.
    <>
      {/* Opaque and above the closing band: the band is a sticky curtain the
          page uncovers by scrolling this off it (src/Footer/Closing/curtain). */}
      <article
        className={cn(
          FOOTER_CLOSING_ARTICLE_CLASS,
          'pb-24',
          hero?.type !== 'highImpact' && 'pt-16',
        )}
      >
        {faqSchema ? <JsonLd data={faqSchema} /> : null}

        {draft && <LivePreviewListener />}

        <RenderHero {...hero} />
        <RenderBlocks blocks={layout} />
      </article>
      <FooterClosingSection closing={page.closing} />
    </>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = '' } = await paramsPromise
  // Decode to support slugs with special characters
  const decodedSlug = decodeURIComponent(slug)
  const page = await queryPageBySlug({
    slug: decodedSlug,
  })

  return generateMeta({
    doc: page,
    pathname: `/${decodedSlug}`,
  })
}

const queryPageBySlug = cache(async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode()
  // A slug no published page owns never reaches Postgres (publishedSlugs).
  if (!draft && !(await isPublishedSlug('pages', slug))) return null

  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'pages',
    draft,
    limit: 1,
    pagination: false,
    overrideAccess: draft,
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  return result.docs?.[0] || null
})
