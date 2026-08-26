import type React from 'react'
import { findWorkPagesById } from '@/blocks/shared/find-work-pages'
import { resolveWorkEntry } from '@/blocks/shared/resolve-work-entry'
import type {
  Industry,
  IndustryWorkBlock as IndustryWorkBlockProps,
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
      const work = page ? resolveWorkEntry(page) : null
      if (!work) return null

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
