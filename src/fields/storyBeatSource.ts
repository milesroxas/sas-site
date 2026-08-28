import type { Block, CheckboxField, Field, SelectField, TextField } from 'payload'
import { CASE_STUDY_STORY_SECTIONS, isStoryBeatKey } from '@/collections/CaseStudies/story'
import { overridesVisible, showOverridesField } from '@/fields/overrides'

const COPY_FIELD_NAMES = new Set([
  'body',
  'bodyOverride',
  'caption',
  'customBody',
  'description',
  'eyebrow',
  'heading',
  'headingOverride',
  'statement',
])

const optionValue = (option: SelectField['options'][number]) =>
  typeof option === 'string' ? option : option.value

type FieldCondition = NonNullable<NonNullable<SelectField['admin']>['condition']>

const andConditions =
  (...conditions: Array<FieldCondition | undefined>): FieldCondition =>
  (data, siblingData, ctx) =>
    conditions.every((condition) => !condition || Boolean(condition(data, siblingData, ctx)))

const whenCanonicalSource =
  (sourceCondition?: FieldCondition): FieldCondition =>
  (data, siblingData, ctx) =>
    (!sourceCondition || Boolean(sourceCondition(data, siblingData, ctx))) &&
    CASE_STUDY_STORY_SECTIONS.some((source) => source === siblingData?.source)

/** Custom copy is always visible; canonical copy is behind `showOverrides`. */
const storyCopyVisible =
  (fieldName: string): FieldCondition =>
  (data, siblingData, ctx) => {
    if (fieldName === 'customBody') return siblingData?.source === 'custom'
    if (fieldName === 'bodyOverride') {
      return siblingData?.source !== 'custom' && overridesVisible(data, siblingData, ctx)
    }
    return siblingData?.source === 'custom' || overridesVisible(data, siblingData, ctx)
  }

const isCopyField = (
  field: Field,
): field is Field & { name: string; type: 'richText' | 'text' | 'textarea' } =>
  'name' in field &&
  COPY_FIELD_NAMES.has(field.name) &&
  (field.type === 'richText' || field.type === 'text' || field.type === 'textarea')

const withCopyVisibility = (field: Field, sourceCondition?: FieldCondition): Field => {
  if (!isCopyField(field)) return field

  const condition = andConditions(
    sourceCondition,
    field.admin?.condition,
    storyCopyVisible(field.name),
  )

  if (field.type === 'textarea') {
    return { ...field, admin: { ...field.admin, condition } }
  }

  if (field.type === 'richText') {
    return { ...field, admin: { ...field.admin, condition } }
  }

  const next: TextField = {
    ...field,
    admin: { ...field.admin, condition },
  }

  if (field.required !== true) return next

  next.required = false
  next.validate = (
    value: string | null | undefined,
    { siblingData }: { siblingData: { source?: unknown } },
  ) => {
    if (siblingData?.source === 'custom' && (value == null || value === '')) {
      return 'Required when Source is Custom.'
    }
    return true
  }
  return next
}

const storyScopeField = (sourceCondition?: FieldCondition): SelectField => ({
  name: 'storyScope',
  type: 'select',
  defaultValue: 'overview',
  label: 'Story content',
  options: [
    { label: 'Overview', value: 'overview' },
    { label: 'Entire section', value: 'section' },
    { label: 'Story beat', value: 'beat' },
  ],
  admin: {
    condition: whenCanonicalSource(sourceCondition),
    description:
      "Overview is this section's summary. Entire section includes the overview and every beat in order. A beat uses one reusable passage.",
  },
})

/**
 * The beat selector shadows its `source` field: it only shows for a canonical
 * story section in beat scope, and never when the block hides `source` behind
 * its own condition (e.g. Full media's "Show content" toggle).
 */
const storyBeatKeyField = (sourceCondition?: FieldCondition): TextField => ({
  name: 'storyBeatKey',
  type: 'text',
  label: 'Story beat',
  admin: {
    condition: (data, siblingData, ctx) =>
      Boolean(whenCanonicalSource(sourceCondition)(data, siblingData, ctx)) &&
      siblingData?.storyScope === 'beat',
    description: 'Choose one reusable beat from the selected section.',
    components: {
      Field: '@/components/StoryBeatSelect#StoryBeatSelect',
    },
  },
  validate: (
    value: string | null | undefined,
    { siblingData }: { siblingData: { storyScope?: unknown } },
  ) => {
    if (siblingData?.storyScope === 'beat' && !isStoryBeatKey(value)) {
      return 'Choose a Story Beat.'
    }
    return true
  },
})

const storyShowOverridesField = (sourceCondition?: FieldCondition): CheckboxField => ({
  ...showOverridesField(),
  admin: {
    ...showOverridesField().admin,
    condition: whenCanonicalSource(sourceCondition),
  },
})

const isStorySource = (field: SelectField) =>
  field.name === 'source' &&
  CASE_STUDY_STORY_SECTIONS.every((source) =>
    field.options.some((option) => optionValue(option) === source),
  )

const withStoryBeatFields = (fields: Field[]): Field[] => {
  const sourceField = fields.find(
    (field): field is SelectField => field.type === 'select' && isStorySource(field),
  )
  const sourceCondition = sourceField?.admin?.condition

  return fields.flatMap((field): Field[] => {
    let next = field

    if (
      field.type === 'array' ||
      field.type === 'collapsible' ||
      field.type === 'group' ||
      field.type === 'row'
    ) {
      next = { ...field, fields: withStoryBeatFields(field.fields) } as Field
    }

    if (next.type !== 'select' || !isStorySource(next)) {
      return sourceField ? [withCopyVisibility(next, sourceCondition)] : [next]
    }

    const source: SelectField = {
      ...next,
      admin: {
        ...next.admin,
        description:
          'Choose custom copy or one canonical narrative section. Then choose the overview, the entire section, or one Story Beat.',
      },
    }

    return [
      source,
      storyScopeField(next.admin?.condition),
      storyBeatKeyField(next.admin?.condition),
      storyShowOverridesField(next.admin?.condition),
    ]
  })
}

/**
 * Case Study presentation blocks get a Work Page-specific interface, a native
 * story-content select, and an optional section-scoped Story Beat selector.
 * Shared block configs remain collection-agnostic everywhere else.
 */
export const withStoryBeatSource = (block: Block, interfaceName: string): Block => ({
  ...block,
  interfaceName,
  fields: withStoryBeatFields(block.fields),
})
