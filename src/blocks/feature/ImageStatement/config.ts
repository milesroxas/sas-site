import type { Block } from 'payload'

export const FeatureImageCaption: Block = {
  slug: 'featureImageCaption',
  interfaceName: 'FeatureImageCaptionBlock',
  labels: { singular: 'Feature: image caption', plural: 'Feature: image captions' },
  fields: [
    { name: 'media', type: 'upload', relationTo: 'media', required: true },
    {
      name: 'caption',
      type: 'textarea',
      required: true,
      admin: { description: 'Large statement set beneath the image, aligned to the right edge.' },
    },
  ],
}
