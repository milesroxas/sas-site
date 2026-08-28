import type React from 'react'
import { findWorkPagesById } from '@/blocks/shared/find-work-pages'
import { resolveWorkEntry, type WorkEntry } from '@/blocks/shared/resolve-work-entry'
import { Section, type SectionTheme } from '@/blocks/shared/section'
import type { FeaturedWorkBlock as FeaturedWorkBlockProps, WorkPage } from '@/payload-types'
import { populatedDoc, relationshipIds } from '@/utilities/relationshipId'
import { FeaturedWorkList } from './FeaturedWorkList.client'

export const FeaturedWorkBlock: React.FC<FeaturedWorkBlockProps> = async ({
  eyebrow,
  entries,
  theme,
  id,
}) => {
  const selected = entries ?? []
  if (selected.length === 0) return null

  const ids = relationshipIds(selected)

  const byId = await findWorkPagesById(ids)

  const resolved: WorkEntry[] = ids
    .map((entryId) => {
      const fromQuery = byId.get(entryId)
      if (fromQuery) return resolveWorkEntry(fromQuery)

      const fromSelection = selected.find(
        (entry): entry is WorkPage => populatedDoc<WorkPage>(entry)?.id === entryId,
      )
      return fromSelection ? resolveWorkEntry(fromSelection) : null
    })
    .filter((entry): entry is WorkEntry => entry !== null)

  if (resolved.length === 0) return null

  return (
    // The pinned client shell owns viewport sizing and its own containers, so
    // the section band carries no vertical padding of its own.
    <Section spacing="none" theme={(theme as SectionTheme | null) ?? 'dark'}>
      <div id={id ? `block-${id}` : undefined}>
        <FeaturedWorkList eyebrow={eyebrow} entries={resolved} />
      </div>
    </Section>
  )
}
