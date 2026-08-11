import configPromise from '@payload-config'
import { draftMode } from 'next/headers'
import { getPayload } from 'payload'
import type React from 'react'
import { resolveWorkEntry, type WorkEntry } from '@/blocks/shared/resolve-work-entry'
import { Section, type SectionTheme } from '@/blocks/shared/section'
import type { HomeFeaturedWorkBlock as HomeFeaturedWorkBlockProps, WorkPage } from '@/payload-types'
import { FeaturedWorkList } from './FeaturedWorkList.client'

export const HomeFeaturedWorkBlock: React.FC<
  HomeFeaturedWorkBlockProps & {
    id?: string
  }
> = async ({ eyebrow, entries, theme, id }) => {
  const selected = entries ?? []
  if (selected.length === 0) return null

  const { isEnabled: draft } = await draftMode()
  const payload = await getPayload({ config: configPromise })

  const ids = selected.map((entry) => (typeof entry === 'object' ? entry.id : entry))

  const { docs } = await payload.find({
    collection: 'work-pages',
    depth: 3,
    draft,
    limit: ids.length,
    overrideAccess: draft,
    pagination: false,
    where: {
      id: { in: ids },
      ...(draft ? {} : { _status: { equals: 'published' } }),
    },
  })

  const byId = new Map(docs.map((doc) => [doc.id, doc]))

  const resolved: WorkEntry[] = ids
    .map((entryId) => {
      const fromQuery = byId.get(entryId)
      if (fromQuery) return resolveWorkEntry(fromQuery)

      const fromSelection = selected.find(
        (entry): entry is WorkPage => typeof entry === 'object' && entry.id === entryId,
      )
      return fromSelection ? resolveWorkEntry(fromSelection) : null
    })
    .filter((entry): entry is WorkEntry => entry !== null)

  if (resolved.length === 0) return null

  return (
    // The pinned client shell owns viewport sizing and its own containers, so
    // the section band carries no vertical padding of its own.
    <Section className="my-0 py-0 md:py-0" theme={(theme as SectionTheme | null) ?? 'dark'}>
      <div id={id ? `block-${id}` : undefined}>
        <FeaturedWorkList eyebrow={eyebrow} entries={resolved} />
      </div>
    </Section>
  )
}
