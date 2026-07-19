import type { Block } from 'payload'
import { featureHeaderFields } from '../shared'

export const FeatureHeadingOffset: Block = {
  slug: 'featureHeadingOffset',
  interfaceName: 'FeatureHeadingOffsetBlock',
  labels: { singular: 'Feature: heading offset', plural: 'Feature: heading offsets' },
  fields: [
    ...featureHeaderFields,
    {
      name: 'body',
      type: 'textarea',
      required: true,
      admin: {
        description: 'Supporting copy in the offset right column. Blank lines create paragraphs.',
      },
    },
  ],
}
