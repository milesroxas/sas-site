import configPromise from '@payload-config'
import type { Metadata } from 'next/types'
import { getPayload } from 'payload'
import type { CardPostData } from '@/components/Card'
import { Search } from '@/search/Component'
import { CollectionArchive } from '@/sections/CollectionArchive'
import { surfaceByCollection, surfaceDocPath } from '@/shared/content/surfaces'
import { RevealSection } from '@/shared/ui/reveal-section'
import PageClient from './page.client'

type Args = {
  searchParams: Promise<{
    q: string
  }>
}
export default async function Page({ searchParams: searchParamsPromise }: Args) {
  const { q: query } = await searchParamsPromise
  const payload = await getPayload({ config: configPromise })

  const results = await payload.find({
    collection: 'search',
    depth: 1,
    limit: 12,
    select: {
      title: true,
      slug: true,
      categories: true,
      meta: true,
      doc: true,
    },
    // pagination: false reduces overhead if you don't need totalDocs
    pagination: false,
    ...(query
      ? {
          where: {
            or: [
              {
                title: {
                  like: query,
                },
              },
              {
                'meta.description': {
                  like: query,
                },
              },
              {
                'meta.title': {
                  like: query,
                },
              },
              {
                slug: {
                  like: query,
                },
              },
            ],
          },
        }
      : {}),
  })

  const cards: CardPostData[] = results.docs.map((result) => {
    const surface = surfaceByCollection.get(result.doc.relationTo)
    return {
      ...(result as unknown as CardPostData),
      url: surface && result.slug ? surfaceDocPath(surface, result.slug) : undefined,
    }
  })

  return (
    <div className="pt-24 pb-24">
      <PageClient />
      <RevealSection className="container mb-16" delayMs={0}>
        <div className="prose dark:prose-invert max-w-none text-center">
          <h1 className="mb-8 lg:mb-16">Search</h1>

          <div className="max-w-[50rem] mx-auto">
            <Search />
          </div>
        </div>
      </RevealSection>

      {results.totalDocs > 0 ? (
        <CollectionArchive posts={cards} />
      ) : (
        <RevealSection className="container">
          <p>No results found.</p>
        </RevealSection>
      )}
    </div>
  )
}

export function generateMetadata(): Metadata {
  return {
    title: `Payload Website Template Search`,
  }
}
