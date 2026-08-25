import configPromise from '@payload-config'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next/types'
import { getPayload } from 'payload'
import { InsightsBrowse } from '@/sections/InsightsBrowse'
import { queryInsightsBrowseData } from '@/sections/InsightsBrowse/queries'
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

  const { topics, posts } = await queryInsightsBrowseData()

  return (
    <div className="pt-24 pb-24">
      <PageClient />
      {/* The sidebar filters in place (no page heading there); keep an h1 for
          document semantics on this deep-linked topic route. */}
      <h1 className="sr-only">{category.title}</h1>
      <InsightsBrowse initialTopicSlug={category.slug} posts={posts} topics={topics} />
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
