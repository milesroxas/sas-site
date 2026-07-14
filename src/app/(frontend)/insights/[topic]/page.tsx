import configPromise from '@payload-config'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next/types'
import { getPayload } from 'payload'
import { CollectionArchive } from '@/components/CollectionArchive'
import { PageRange } from '@/components/PageRange'
import { RevealSection } from '@/shared/ui/reveal-section'
import PageClient from './page.client'

export const dynamic = 'force-static'
export const revalidate = 600

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const categories = await payload.find({
    collection: 'categories',
    limit: 100,
    pagination: false,
    select: { slug: true },
  })
  return categories.docs.filter(({ slug }) => slug).map(({ slug }) => ({ topic: slug }))
}

type Args = { params: Promise<{ topic: string }> }

const queryTopicBySlug = async (slug: string) => {
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'categories',
    overrideAccess: false,
    limit: 1,
    pagination: false,
    where: { slug: { equals: slug } },
  })
  return result.docs[0] || null
}

export default async function InsightsTopicPage({ params }: Args) {
  const { topic } = await params
  const decodedTopic = decodeURIComponent(topic)
  const category = await queryTopicBySlug(decodedTopic)
  if (!category) notFound()

  const payload = await getPayload({ config: configPromise })
  const posts = await payload.find({
    collection: 'posts',
    depth: 1,
    limit: 12,
    overrideAccess: false,
    where: { categories: { in: [category.id] } },
    select: { title: true, slug: true, categories: true, meta: true },
  })

  return (
    <div className="pt-24 pb-24">
      <PageClient />
      <RevealSection className="container mb-16" delayMs={0}>
        <div className="prose dark:prose-invert max-w-none">
          <h1>{category.title}</h1>
          {category.description && <p>{category.description}</p>}
        </div>
      </RevealSection>

      <RevealSection className="container mb-8" delayMs={60}>
        <PageRange
          collection="posts"
          currentPage={posts.page}
          limit={12}
          totalDocs={posts.totalDocs}
        />
      </RevealSection>

      <CollectionArchive posts={posts.docs} />
    </div>
  )
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { topic } = await params
  const category = await queryTopicBySlug(decodeURIComponent(topic))
  return {
    title: `${category?.title ?? 'Insights'} | Suits & Sandals`,
    description: category?.description ?? undefined,
  }
}
