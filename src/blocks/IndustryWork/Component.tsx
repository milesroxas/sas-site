import type React from 'react'
import { findWorkPagesById } from '@/blocks/shared/find-work-pages'
import { resolveWorkEntry } from '@/blocks/shared/resolve-work-entry'
import type {
  Industry,
  IndustryWorkBlock as IndustryWorkBlockProps,
  Media as MediaDoc,
  WorkPage,
} from '@/payload-types'
import { populatedDoc, relationshipId, relationshipIds } from '@/utilities/relationshipId'
import { IndustryWorkClient, type IndustryWorkPanel } from './Component.client'

export const IndustryWorkBlock: React.FC<IndustryWorkBlockProps> = async ({
  heading,
  industries,
  theme,
}) => {
  const rows = industries ?? []
  if (rows.length === 0) return null

  const ids = relationshipIds(rows.map((row) => row.work))

  const byId = await findWorkPagesById(ids)

  const panels = rows
    .map((row, index): IndustryWorkPanel | null => {
      const industry = populatedDoc<Industry>(row.industry)?.name
      const workId = relationshipId(row.work)
      if (!industry || workId === null) return null

      const page = byId.get(workId) ?? populatedDoc<WorkPage>(row.work)
      const entry = page ? resolveWorkEntry(page) : null
      if (!page || !entry) return null

      // Same precedence as the takeover menu: the page's preview pick wins
      // over its featured media (cover, else hero) when one is filled in.
      const preview = populatedDoc<MediaDoc>(page.menuPreview)
      const work = preview ? { ...entry, media: preview } : entry

      return {
        id: row.id ?? String(index),
        industry,
        subheading: row.subheading,
        secondLine: row.secondLine ?? null,
        work,
      }
    })
    .filter((panel): panel is IndustryWorkPanel => panel !== null)

  if (panels.length === 0) return null

  return <IndustryWorkClient heading={heading} panels={panels} theme={theme} />
}
