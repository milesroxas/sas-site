import configPromise from '@payload-config'
import Link from 'next/link'
import { getPayload } from 'payload'

import { eyebrowClassName } from '@/blocks/shared/typography'
import { forwardNavTransitionTypes } from '@/shared/lib/view-transition'

/**
 * Index listing for a segment collection (Expertise, Who We Help): every
 * published page in the collection as a titled card with its SEO description.
 * Published-only and access-enforced — these routes are static and public.
 * The heading copy comes from the index global's hero; the route owns the
 * `main` and the ground behind it.
 */
export async function SegmentIndex({
  basePath,
  collection,
  eyebrow,
  heading,
}: {
  /** URL prefix each card links under. */
  basePath: string
  collection: 'audience-pages' | 'expertise-pages'
  eyebrow?: string | null
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
    <div className="container mx-auto py-24">
      <div className="mb-12 text-stack">
        {eyebrow && eyebrow !== heading ? <p className={eyebrowClassName}>{eyebrow}</p> : null}
        <h1 className="text-display">{heading}</h1>
      </div>
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
    </div>
  )
}
