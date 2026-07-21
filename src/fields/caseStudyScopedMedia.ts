import type { CheckboxField, FilterOptions, Where } from 'payload'

const publicApproved: Where = { usageStatus: { equals: 'public-approved' } }

const relationId = (value: unknown): number | undefined => {
  if (typeof value === 'number') return value
  if (typeof value === 'object' && value !== null && 'id' in value) {
    const { id } = value as { id?: unknown }
    if (typeof id === 'number') return id
  }
  return undefined
}

// Media pickers on a Work Page default to the assets owned by the related case
// study's asset libraries. The sibling `browseAllMedia` checkbox opts back into
// the full media library, as does any state where scoping is impossible (no
// case study selected yet, or the case study has no libraries) so the picker
// never comes up empty.
export const caseStudyScopedMediaFilter: FilterOptions = async ({ data, siblingData, req }) => {
  if ((siblingData as { browseAllMedia?: boolean } | undefined)?.browseAllMedia) {
    return publicApproved
  }

  const caseStudyId = relationId((data as { caseStudy?: unknown } | undefined)?.caseStudy)
  if (!caseStudyId) return publicApproved

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
  if (libraryIds.length === 0) return publicApproved

  return { and: [publicApproved, { assetLibrary: { in: libraryIds } }] }
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
