import type { Block, Field, SelectField, TextField } from 'payload'
import { CASE_STUDY_STORY_SECTIONS } from '@/collections/CaseStudies/story'

const optionValue = (option: SelectField['options'][number]) =>
  typeof option === 'string' ? option : option.value

const storyBeatKeyField = (): TextField => ({
  name: 'storyBeatKey',
  type: 'text',
  label: 'Story beat (optional)',
  admin: {
    condition: (_, siblingData) =>
      CASE_STUDY_STORY_SECTIONS.some((source) => source === siblingData?.source),
    description:
      'Leave empty to use the complete section, or choose one reusable beat from that section.',
    components: {
      Field: '@/components/StoryBeatSelect#StoryBeatSelect',
    },
  },
})

const isStorySource = (field: SelectField) =>
  field.name === 'source' &&
  CASE_STUDY_STORY_SECTIONS.every((source) =>
    field.options.some((option) => optionValue(option) === source),
  )

const withStoryBeatFields = (fields: Field[]): Field[] =>
  fields.flatMap((field): Field[] => {
    let next = field

    if (
      field.type === 'array' ||
      field.type === 'collapsible' ||
      field.type === 'group' ||
      field.type === 'row'
    ) {
      next = { ...field, fields: withStoryBeatFields(field.fields) } as Field
    }

    if (next.type !== 'select' || !isStorySource(next)) return [next]

    const source: SelectField = {
      ...next,
      admin: {
        ...next.admin,
        description:
          'Choose custom copy or one canonical narrative section. Then optionally narrow it to a Story Beat.',
      },
    }

    return [source, storyBeatKeyField()]
  })

/**
 * Case Study presentation blocks get a Work Page-specific interface and an
 * optional section-scoped Story Beat selector. Shared block configs remain
 * collection-agnostic everywhere else.
 */
export const withStoryBeatSource = (block: Block, interfaceName: string): Block => ({
  ...block,
  interfaceName,
  fields: withStoryBeatFields(block.fields),
})
