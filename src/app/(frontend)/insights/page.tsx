import configPromise from '@payload-config'
import type { Metadata } from 'next/types'
import { getPayload } from 'payload'
import { CollectionArchive } from '@/sections/CollectionArchive'
import { RevealSection } from '@/shared/ui/reveal-section'
import PageClient from './page.client'

export const dynamic = 'force-static'
export const revalidate = 600

export default async function InsightsPage() {
  const payload = await getPayload({ config: configPromise })

  const [topics, posts] = await Promise.all([
    payload.find({
      collection: 'categories',
      overrideAccess: false,
      limit: 100,
      pagination: false,
      sort: 'title',
      select: { title: true, slug: true, description: true },
    }),
    payload.find({
      collection: 'posts',
      depth: 1,
      limit: 6,
      overrideAccess: false,
      select: { title: true, slug: true, categories: true, meta: true },
    }),
  ])

  return (
    <div className="pt-24 pb-24">
      <PageClient />
      <RevealSection className="container mb-16" delayMs={0}>
        <div className="prose dark:prose-invert max-w-none">
          <h1 className="mb-12 text-display">Insights</h1>
        </div>
      </RevealSection>

      <RevealSection className="container mb-16" delayMs={60}>
        <div className="grid gap-8 md:grid-cols-2">
          {topics.docs
            .filter((topic) => topic.slug)
            .map((topic) => (
              <a
                className="group pressable pressable-subtle block"
                href={`/insights/${topic.slug}`}
                key={topic.id}
              >
                <h2 className="text-heading-3 group-hover:underline">{topic.title}</h2>
                {topic.description && <p className="mt-2 opacity-75">{topic.description}</p>}
              </a>
            ))}
        </div>
      </RevealSection>

      <RevealSection className="container mb-8" delayMs={120}>
        <h2 className="text-heading-3">Latest insights</h2>
      </RevealSection>

      <CollectionArchive posts={posts.docs} />
    </div>
  )
}

export function generateMetadata(): Metadata {
  return { title: 'Insights | Suits & Sandals' }
}
