import type { CheckboxField, FilterOptions, Where } from 'payload'

/** Media the public read access will actually serve; every picker filter starts here. */
export const publicApprovedMediaWhere: Where = { usageStatus: { equals: 'public-approved' } }

const relationId = (value: unknown): number | undefined => {
  if (typeof value === 'number') return value
  if (typeof value === 'object' && value !== null && 'id' in value) {
    const { id } = value as { id?: unknown }
    if (typeof id === 'number') return id
  }
  return undefined
}

// Media pickers on a Work Page default to the assets owned by the related case
// study's asset libraries. The `browseAllMedia` checkbox — sibling to the
// picker, or block-level when the picker sits inside an array row — opts back
// into the full media library, as does any state where scoping is impossible
// (no case study selected yet, or the case study has no libraries) so the
// picker never comes up empty.
export const caseStudyScopedMediaFilter: FilterOptions = async ({
  blockData,
  data,
  siblingData,
  req,
}) => {
  const optedOut =
    (siblingData as { browseAllMedia?: boolean } | undefined)?.browseAllMedia ||
    (blockData as { browseAllMedia?: boolean } | undefined)?.browseAllMedia
  if (optedOut) {
    return publicApprovedMediaWhere
  }

  const caseStudyId = relationId((data as { caseStudy?: unknown } | undefined)?.caseStudy)
  if (!caseStudyId) return publicApprovedMediaWhere

  const caseStudy = await req.payload.findByID({
    collection: 'case-studies',
    id: caseStudyId,
    depth: 0,
    draft: true,
    disableErrors: true,
    select: { assetLibraries: true },
    req,
  })

  const libraryIds = (caseStudy?.assetLibraries ?? [])
    .map(relationId)
    .filter((id): id is number => id !== undefined)
  if (libraryIds.length === 0) return publicApprovedMediaWhere

  return { and: [publicApprovedMediaWhere, { assetLibrary: { in: libraryIds } }] }
}

export const browseAllMediaField = (): CheckboxField => ({
  name: 'browseAllMedia',
  type: 'checkbox',
  defaultValue: false,
  admin: {
    description:
      "Media pickers in this section show only the case study's asset libraries. Check to browse the entire media library instead.",
  },
})
