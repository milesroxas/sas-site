import configPromise from '@payload-config'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next/types'
import { getPayload } from 'payload'
import { InsightsBrowse } from '@/sections/InsightsBrowse'
import { queryInsightsBrowseData } from '@/sections/InsightsBrowse/queries'
import { queryInsightsIndexHero } from '../InsightsIndexView'

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

  const [hero, { topics, posts }] = await Promise.all([
    queryInsightsIndexHero(),
    queryInsightsBrowseData(),
  ])

  // The same index as /insights with the topic filter set: the strip filters
  // in place, so the page keeps the index's own heading rather than the topic's.
  return (
    <main>
      <InsightsBrowse
        eyebrow={hero.eyebrow}
        initialTopicSlug={category.slug}
        posts={posts}
        title={hero.title}
        topics={topics}
      />
    </main>
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
