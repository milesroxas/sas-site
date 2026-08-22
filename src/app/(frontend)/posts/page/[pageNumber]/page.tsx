import configPromise from '@payload-config'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next/types'
import { getPayload } from 'payload'
import { PageRange } from '@/components/PageRange'
import { Pagination } from '@/components/Pagination'
import { CollectionArchive } from '@/sections/CollectionArchive'
import { RevealSection } from '@/shared/ui/reveal-section'
import PageClient from './page.client'

export const revalidate = 600

type Args = {
  params: Promise<{
    pageNumber: string
  }>
}

export default async function Page({ params: paramsPromise }: Args) {
  const { pageNumber } = await paramsPromise
  const payload = await getPayload({ config: configPromise })

  const sanitizedPageNumber = Number(pageNumber)

  if (!Number.isInteger(sanitizedPageNumber)) notFound()

  const posts = await payload.find({
    collection: 'posts',
    depth: 1,
    limit: 12,
    page: sanitizedPageNumber,
    overrideAccess: false,
  })

  return (
    <div className="pt-24 pb-24">
      <PageClient />
      <RevealSection className="container mb-16">
        <div className="prose dark:prose-invert max-w-none">
          <h1 className="mb-12 text-display">Posts</h1>
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

      {posts?.page && posts?.totalPages > 1 ? (
        <RevealSection className="container" delayMs={120}>
          <Pagination page={posts.page} totalPages={posts.totalPages} />
        </RevealSection>
      ) : null}
    </div>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { pageNumber } = await paramsPromise
  return {
    title: `Payload Website Template Posts Page ${pageNumber || ''}`,
  }
}

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const { totalDocs } = await payload.count({
    collection: 'posts',
    overrideAccess: false,
  })

  const totalPages = Math.ceil(totalDocs / 10)

  const pages: { pageNumber: string }[] = []

  for (let i = 1; i <= totalPages; i++) {
    pages.push({ pageNumber: String(i) })
  }

  return pages
}
