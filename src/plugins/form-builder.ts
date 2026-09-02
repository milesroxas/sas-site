import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import { FixedToolbarFeature, HeadingFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
import type { Block, Field } from 'payload'
import { authenticated } from '@/access/authenticated'
import {
  FORM_DELIVERY,
  INQUIRY_FIELD_TARGETS,
  INQUIRY_MESSAGE_MAX_LENGTH,
} from '@/shared/content/inquiry'

/**
 * Chips sourced from the studio's own vocabulary.
 *
 * The built-in `select` covers a fixed answer set (the renderer shows six or
 * fewer as chips), but "what do you need" is answered from the Capabilities
 * taxonomy — so the service list is edited in one place and every form that
 * asks the question follows. Leaving the picker empty offers all of them.
 */
const capabilitiesField: Block = {
  slug: 'capabilities',
  labels: { singular: 'Capabilities', plural: 'Capabilities' },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'name', type: 'text', required: true, admin: { width: '50%' } },
        { name: 'label', type: 'text', admin: { width: '50%' } },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'hint',
          type: 'text',
          defaultValue: 'Select any',
          admin: { width: '50%', description: 'Trailing note on the label row.' },
        },
        {
          name: 'width',
          type: 'number',
          admin: { width: '50%', description: 'Field width, as a percentage.' },
        },
      ],
    },
    {
      name: 'options',
      type: 'relationship',
      relationTo: 'capabilities',
      hasMany: true,
      admin: {
        description: 'Offered as chips, in this order. Leave empty to offer every capability.',
      },
    },
    {
      name: 'unsureLabel',
      type: 'text',
      defaultValue: 'Not sure yet',
      admin: { description: 'Escape-hatch chip. Clear it to drop the option.' },
    },
    { name: 'required', type: 'checkbox' },
  ],
}

/**
 * Only a form that feeds the inbox needs to say where each answer lands, so
 * the mapping hides itself on an ordinary form.
 */
const mapsToField: Field = {
  name: 'mapsTo',
  type: 'select',
  options: [...INQUIRY_FIELD_TARGETS],
  admin: {
    condition: (data) => data?.delivery === 'inquiries',
    description:
      'Which part of the inquiry this answer becomes. Unmapped answers are kept as notes.',
  },
}

/** Static copy blocks have no answer, so there is nothing to map. */
const UNMAPPED_BLOCKS = new Set(['message'])

const placeholderField: Field = {
  name: 'placeholder',
  type: 'textarea',
  admin: {
    description: 'Resting hint inside the control. It disappears as soon as they type.',
  },
}

/**
 * Trailing note on the label row, set at the far end: the unit, the selection
 * rule. `USD` beside a budget question, `Select any` beside a chip set.
 */
const hintField: Field = {
  name: 'hint',
  type: 'text',
}

/**
 * Turns the label's trailing note into a live count. Also caps what the
 * control accepts, so an over-long answer is prevented rather than truncated
 * on the way to the database.
 */
const maxLengthField: Field = {
  name: 'maxLength',
  type: 'number',
  min: 1,
  admin: {
    description: `Character limit and counter. The inbox stores up to ${INQUIRY_MESSAGE_MAX_LENGTH}.`,
  },
}

/** Extra authoring controls per field type, beyond what the plugin ships. */
const EXTRA_FIELDS: Record<string, Field[]> = {
  text: [placeholderField],
  email: [placeholderField],
  number: [placeholderField],
  select: [hintField],
  textarea: [placeholderField, hintField, maxLengthField],
}

/**
 * Give every field block a `mapsTo`, in one pass rather than by hand per
 * block — the plugin owns the block list and gains new types across versions.
 */
const withFieldMapping = (fields: Field[]): Field[] =>
  fields.map((field) => {
    if (!('name' in field) || field.name !== 'fields' || field.type !== 'blocks') return field
    // The custom block joins the list *before* the pass, not after it: append
    // it afterwards and it is the one block without a `mapsTo`, so its answer
    // silently takes the unmapped path.
    return {
      ...field,
      blocks: [...field.blocks, capabilitiesField].map((block) => {
        const extras = [
          ...(EXTRA_FIELDS[block.slug] ?? []),
          ...(UNMAPPED_BLOCKS.has(block.slug) ? [] : [mapsToField]),
        ]
        return extras.length > 0 ? { ...block, fields: [...block.fields, ...extras] } : block
      }),
    }
  })

/**
 * Editor-built forms.
 *
 * Fields are authored here rather than baked into a block, so one form can be
 * composed onto any page and the contact template can point at it. `delivery`
 * decides what a submission becomes: a row in the generic log, or a triaged
 * inquiry with an owner and a status.
 */
export const formBuilder = formBuilderPlugin({
  fields: {
    payment: false,
    // A ~1000-line country list for a studio that works from two addresses.
    // Nothing has ever used it, and it rode into the bundle of every page
    // carrying a form. `state` stays: it is 50 rows and a plausible ask.
    country: false,
  },
  formOverrides: {
    // Team-only writes; MCP API keys authenticate as req.user over REST but
    // must not manage forms. Public read stays (frontend renders forms).
    access: {
      create: authenticated,
      delete: authenticated,
      update: authenticated,
    },
    admin: { group: 'Forms' },
    fields: ({ defaultFields }) =>
      withFieldMapping(
        defaultFields.map((field) => {
          if ('name' in field && field.name === 'confirmationMessage') {
            return {
              ...field,
              editor: lexicalEditor({
                features: ({ rootFeatures }) => [
                  ...rootFeatures,
                  FixedToolbarFeature(),
                  HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
                ],
              }),
            }
          }
          return field
        }),
      ).concat({
        name: 'delivery',
        type: 'select',
        required: true,
        defaultValue: 'submissions',
        options: [...FORM_DELIVERY],
        admin: {
          position: 'sidebar',
          description:
            'Where answers land. "Inquiries inbox" gives each submission a reference, an owner and a status, and asks each field above where it maps.',
        },
      }),
  },
  formSubmissionOverrides: {
    // Submissions hold visitor PII: readable/deletable by team only. Public
    // create stays (site visitors submit forms); plugin keeps update: false.
    access: {
      delete: authenticated,
      read: authenticated,
    },
    admin: { group: 'Forms' },
  },
})
