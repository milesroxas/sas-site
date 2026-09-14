import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import type { Condition, Field } from 'payload'

import { linkGroup } from '@/fields/linkGroup'
import { visualSlotFields } from '@/fields/visual'

const mediaHeroTypes: Condition = (_, { type } = {}) =>
  ['highImpact', 'mediumImpact'].includes(type)

export type HeroFieldArgs = {
  /**
   * When the visual slot (upload, kind, shader) shows. Defaults to the hero
   * types that render media; a page that paints the visual somewhere other
   * than the hero band (the index globals) shows it for every type.
   */
  visualCondition?: Condition
  /** Whether the upload is required (unless the shader is chosen). Off where the band never paints it. */
  mediaRequired?: boolean
  visualTypeDescription?: string
}

/**
 * The generic page hero: type, copy, links and a visual slot. A factory,
 * not a literal: Payload mutates field configs while sanitizing them, and
 * the index globals need a different visual gate from Pages.
 */
export const heroField = ({
  visualCondition = mediaHeroTypes,
  mediaRequired = true,
  visualTypeDescription,
}: HeroFieldArgs = {}): Field => ({
  name: 'hero',
  type: 'group',
  fields: [
    {
      name: 'type',
      type: 'select',
      defaultValue: 'lowImpact',
      label: 'Type',
      options: [
        {
          label: 'None',
          value: 'none',
        },
        {
          label: 'High Impact',
          value: 'highImpact',
        },
        {
          label: 'Medium Impact',
          value: 'mediumImpact',
        },
        {
          label: 'Low Impact',
          value: 'lowImpact',
        },
      ],
      required: true,
    },
    {
      name: 'eyebrow',
      type: 'text',
      admin: {
        condition: (_, { type } = {}) => ['lowImpact', 'mediumImpact'].includes(type),
        description: 'Small label above the title, e.g. an area of expertise.',
      },
    },
    {
      name: 'title',
      type: 'text',
      admin: {
        condition: (_, { type } = {}) => ['highImpact', 'lowImpact', 'mediumImpact'].includes(type),
      },
    },
    {
      name: 'richText',
      type: 'richText',
      admin: {
        condition: (_, { type } = {}) => type === 'lowImpact',
      },
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [
            ...rootFeatures,
            HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
            FixedToolbarFeature(),
            InlineToolbarFeature(),
          ]
        },
      }),
      label: false,
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        condition: (_, { type } = {}) => ['highImpact', 'mediumImpact'].includes(type),
        description: 'Short supporting paragraph anchored to the bottom of the hero.',
      },
    },
    linkGroup({
      overrides: {
        maxRows: 2,
      },
    }),
    ...visualSlotFields(
      {
        name: 'media',
        type: 'upload',
        relationTo: 'media',
        required: mediaRequired,
      },
      { condition: visualCondition, visualTypeDescription },
    ),
  ],
  label: false,
})

export const hero: Field = heroField()
