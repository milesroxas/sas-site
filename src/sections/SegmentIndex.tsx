import configPromise from '@payload-config'
import Link from 'next/link'
import { getPayload } from 'payload'

import { forwardNavTransitionTypes } from '@/shared/lib/view-transition'

/**
 * Index listing for a segment collection (Expertise, Who We Help): every
 * published page in the collection as a titled card with its SEO description.
 * Published-only and access-enforced — these routes are static and public.
 */
export async function SegmentIndex({
  basePath,
  collection,
  heading,
}: {
  /** URL prefix each card links under. */
  basePath: string
  collection: 'audience-pages' | 'expertise-pages'
  heading: string
}) {
  const payload = await getPayload({ config: configPromise })
  const { docs } = await payload.find({
    collection,
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
      <h1 className="mb-12 text-display">{heading}</h1>
      <div className="grid gap-12 md:grid-cols-2">
        {docs.map((page) => (
          <Link
            className="group pressable pressable-subtle block"
            href={`${basePath}/${page.slug}`}
            key={page.id}
            transitionTypes={[...forwardNavTransitionTypes]}
          >
            <h2 className="text-heading-3 group-hover:underline">{page.title}</h2>
            {page.meta?.description && <p className="mt-2 opacity-75">{page.meta.description}</p>}
          </Link>
        ))}
      </div>
    </main>
  )
}
