import configPromise from '@payload-config'
import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import { getPayload } from 'payload'
import { cache } from 'react'
import { RelatedPosts } from '@/blocks/RelatedPosts/Component'
import { RenderBlocks } from '@/blocks/RenderBlocks'
import { JsonLd } from '@/components/JsonLd'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { PayloadRedirects } from '@/components/PayloadRedirects'
import RichText from '@/components/RichText'
import { FooterClosingSection } from '@/Footer/Closing/Component'
import { FOOTER_CLOSING_ARTICLE_CLASS } from '@/Footer/Closing/curtain'

import { PostHero } from '@/heros/PostHero'
import { RevealSection } from '@/shared/ui/reveal-section'
import { generateMeta } from '@/utilities/generateMeta'
import { blogPostingSchema, breadcrumbSchema } from '@/utilities/schema'
import PageClient from './page.client'

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const posts = await payload.find({
    collection: 'posts',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: {
      slug: true,
    },
  })

  const params = posts.docs.map(({ slug }) => {
    return { slug }
  })

  return params
}

type Args = {
  params: Promise<{
    slug?: string
  }>
}

export default async function Post({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { slug = '' } = await paramsPromise
  // Decode to support slugs with special characters
  const decodedSlug = decodeURIComponent(slug)
  const url = `/posts/${decodedSlug}`
  const post = await queryPostBySlug({ slug: decodedSlug })

  if (!post) return <PayloadRedirects url={url} />

  return (
    // PostHero pulls itself under the fixed header (-mt-(--header-height)),
    // so the article must not add top padding above it.
    <>
      <article className={`${FOOTER_CLOSING_ARTICLE_CLASS} pb-16`}>
        <PageClient />
        <JsonLd
          data={[
            blogPostingSchema(post),
            breadcrumbSchema([
              { name: 'Insights', path: '/posts' },
              { name: post.title, path: url },
            ]),
          ]}
        />

        {/* Allows redirects for valid pages too */}
        <PayloadRedirects disableNotFound url={url} />

        {draft && <LivePreviewListener />}

        <PostHero post={post} />

        <div className="flex flex-col items-center gap-4 pt-8">
          {/* No entrance wrap on the body: embedded blocks (e.g. statement links)
            mount their own GSAP reveal, and a CSS reveal here would stack a
            second entrance on top of it. */}
          <div className="container w-full">
            {post.heroStyle === 'banner' ? (
              <div className="grid grid-cols-1 gap-8 py-12 lg:grid-cols-[1fr_3fr] lg:gap-20">
                <aside className="hidden lg:block">
                  <div className="sticky top-(--header-height) border-t border-foreground py-3">
                    <p className="font-mono text-xs leading-normal">{post.title}</p>
                  </div>
                </aside>
                <div className="max-w-(--max-width-content-narrow) border-t border-foreground py-3">
                  <RichText className="mx-0" data={post.content} enableGutter={false} />
                </div>
              </div>
            ) : (
              <RichText
                className="max-w-(--max-width-content-narrow) mx-auto"
                data={post.content}
                enableGutter={false}
              />
            )}
          </div>
          {post.layout && post.layout.length > 0 && (
            <div className="w-full">
              <RenderBlocks blocks={post.layout} />
            </div>
          )}
          {post.relatedPosts && post.relatedPosts.length > 0 && (
            <RevealSection className="container w-full mt-12">
              <RelatedPosts
                className="max-w-208 lg:grid lg:grid-cols-subgrid col-start-1 col-span-3 grid-rows-[2fr]"
                docs={post.relatedPosts.filter((post) => typeof post === 'object')}
              />
            </RevealSection>
          )}
        </div>
      </article>
      <FooterClosingSection closing={post.closing} />
    </>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = '' } = await paramsPromise
  // Decode to support slugs with special characters
  const decodedSlug = decodeURIComponent(slug)
  const post = await queryPostBySlug({ slug: decodedSlug })

  return generateMeta({ doc: post, pathname: `/posts/${decodedSlug}` })
}

const queryPostBySlug = cache(async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'posts',
    // Populate Lexical mediaBlock uploads + nested video posters.
    depth: 2,
    draft,
    limit: 1,
    overrideAccess: draft,
    pagination: false,
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  return result.docs?.[0] || null
})
