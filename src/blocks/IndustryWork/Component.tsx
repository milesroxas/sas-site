import configPromise from '@payload-config'
import { draftMode } from 'next/headers'
import { getPayload } from 'payload'
import type React from 'react'
import { resolveWorkEntry } from '@/blocks/shared/resolve-work-entry'
import type { IndustryWorkBlock as IndustryWorkBlockProps, WorkPage } from '@/payload-types'
import { IndustryWorkClient, type IndustryWorkPanel } from './Component.client'

export const IndustryWorkBlock: React.FC<IndustryWorkBlockProps> = async ({
  heading,
  industries,
  theme,
}) => {
  const rows = industries ?? []
  if (rows.length === 0) return null

  const { isEnabled: draft } = await draftMode()
  const payload = await getPayload({ config: configPromise })

  const ids = rows.map((row) => (typeof row.work === 'object' ? row.work.id : row.work))

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

  const panels = rows
    .map((row, index): IndustryWorkPanel | null => {
      const industryName = typeof row.industry === 'object' ? row.industry.name : null
      if (!industryName) return null

      const workId = typeof row.work === 'object' ? row.work.id : row.work
      const page =
        byId.get(workId) ?? (typeof row.work === 'object' ? (row.work as WorkPage) : null)
      const work = page ? resolveWorkEntry(page) : null
      if (!work) return null

      return {
        id: row.id ?? String(index),
        industry: industryName,
        subheading: row.subheading,
        secondLine: row.secondLine ?? null,
        work,
      }
    })
    .filter((panel): panel is IndustryWorkPanel => panel !== null)

  if (panels.length === 0) return null

  return <IndustryWorkClient heading={heading} panels={panels} theme={theme} />
}
