import type { Block, CheckboxField, Field, FilterOptions, Tab, Where } from 'payload'

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
// study's asset libraries. The `browseAllMedia` checkbox, sibling to the
// picker, or block-level when the picker sits inside an array row, opts back
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

/**
 * A media picker the Work Page scope applies to: one that relates to `media`
 * and carries no filter beyond the public gate. A picker with its own filter
 * (the Insight list's SVG-only marks) is deliberately left alone.
 */
const isScopableMediaPicker = (field: Field) =>
  (field.type === 'upload' || field.type === 'relationship') &&
  field.relationTo === 'media' &&
  (field.filterOptions === undefined || field.filterOptions === publicApprovedMediaWhere)

type Scoped<T> = { scoped: boolean; value: T }

/**
 * Point every scopable picker at the case-study filter, descending through
 * layout and array fields. Nested `blocks` fields are skipped: the blocks
 * they offer are wrapped on their own before they are nested.
 */
const scopeField = (field: Field): Scoped<Field> => {
  if (isScopableMediaPicker(field)) {
    return { scoped: true, value: { ...field, filterOptions: caseStudyScopedMediaFilter } as Field }
  }
  if (field.type === 'tabs') {
    const tabs = field.tabs.map((tab): Scoped<Tab> => {
      const fields = scopeFields(tab.fields)
      return { scoped: fields.scoped, value: { ...tab, fields: fields.value } as Tab }
    })
    return {
      scoped: tabs.some((tab) => tab.scoped),
      value: { ...field, tabs: tabs.map((tab) => tab.value) },
    }
  }
  if (
    field.type === 'array' ||
    field.type === 'collapsible' ||
    field.type === 'group' ||
    field.type === 'row'
  ) {
    const fields = scopeFields(field.fields)
    return { scoped: fields.scoped, value: { ...field, fields: fields.value } as Field }
  }
  return { scoped: false, value: field }
}

const scopeFields = (fields: Field[]): Scoped<Field[]> => {
  const scoped = fields.map(scopeField)
  return { scoped: scoped.some((field) => field.scoped), value: scoped.map((field) => field.value) }
}

/**
 * The Work Page variant of a shared block: same slug and table, every media
 * picker scoped to the related case study's asset libraries, plus one
 * block-level `browseAllMedia` opt-out placed after the last field that
 * holds a picker. Shared block configs stay collection-agnostic (public gate
 * only), so the checkbox never appears on Pages, Posts, Home, Lab, or the
 * segment pages. Pair with `withStoryBeatSource` for blocks that also pull
 * canonical story copy.
 *
 * `interfaceName` is required because the variant's field set differs from
 * the shared block's; reusing the shared interface would silently type the
 * work variant after the first block generated under that name.
 */
export const withCaseStudyScopedMedia = (block: Block, interfaceName: string): Block => {
  const fields = block.fields.map(scopeField)
  const lastPickerIndex = fields.reduce((last, field, index) => (field.scoped ? index : last), -1)
  if (lastPickerIndex === -1) {
    throw new Error(`withCaseStudyScopedMedia: block "${block.slug}" has no media picker to scope.`)
  }

  const value = fields.map((field) => field.value)
  return {
    ...block,
    interfaceName,
    fields: [
      ...value.slice(0, lastPickerIndex + 1),
      browseAllMediaField(),
      ...value.slice(lastPickerIndex + 1),
    ],
  }
}
