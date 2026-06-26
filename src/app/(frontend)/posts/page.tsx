import configPromise from '@payload-config'
import type { Metadata } from 'next/types'
import { getPayload } from 'payload'
import { CollectionArchive } from '@/components/CollectionArchive'
import { PageRange } from '@/components/PageRange'
import { Pagination } from '@/components/Pagination'
import { RevealSection } from '@/shared/ui/reveal-section'
import PageClient from './page.client'

export const dynamic = 'force-static'
export const revalidate = 600

export default async function Page() {
  const payload = await getPayload({ config: configPromise })

  const posts = await payload.find({
    collection: 'posts',
    depth: 1,
    limit: 12,
    overrideAccess: false,
    select: {
      title: true,
      slug: true,
      categories: true,
      meta: true,
    },
  })

  return (
    <div className="pt-24 pb-24">
      <PageClient />
      <RevealSection className="container mb-16" delayMs={0}>
        <div className="prose dark:prose-invert max-w-none">
          <h1>Posts</h1>
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

      {posts.totalPages > 1 && posts.page ? (
        <RevealSection className="container" delayMs={120}>
          <Pagination page={posts.page} totalPages={posts.totalPages} />
        </RevealSection>
      ) : null}
    </div>
  )
}

export function generateMetadata(): Metadata {
  return {
    title: `Payload Website Template Posts`,
  }
}
