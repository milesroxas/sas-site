import configPromise from '@payload-config'
import type { Metadata } from 'next'
import { getPayload } from 'payload'

export default async function ExpertiseIndexPage() {
  const payload = await getPayload({ config: configPromise })
  const { docs } = await payload.find({
    collection: 'expertise-pages',
    draft: false,
    overrideAccess: false,
    depth: 0,
    limit: 100,
    pagination: false,
    sort: 'title',
    select: { title: true, slug: true, meta: true },
  })
  return (
    <main className="container mx-auto py-24">
      <h1 className="mb-12 text-display">Expertise</h1>
      <div className="grid gap-12 md:grid-cols-2">
        {docs.map((page) => (
          <a
            className="group pressable pressable-subtle block"
            href={`/expertise/${page.slug}`}
            key={page.id}
          >
            <h2 className="text-heading-3 group-hover:underline">{page.title}</h2>
            {page.meta?.description && <p className="mt-2 opacity-75">{page.meta.description}</p>}
          </a>
        ))}
      </div>
    </main>
  )
}

export function generateMetadata(): Metadata {
  return { title: 'Expertise | Suits & Sandals' }
}
