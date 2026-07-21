import type { Block } from 'payload'

export const FeatureImageStatement: Block = {
  slug: 'featureImageStatement',
  dbName: 'image_statement',
  interfaceName: 'FeatureImageStatementBlock',
  labels: { singular: 'Feature: image statement', plural: 'Feature: image statements' },
  fields: [
    { name: 'media', type: 'upload', relationTo: 'media', required: true },
    {
      name: 'caption',
      type: 'textarea',
      required: true,
      admin: { description: 'Large statement set beneath the image.' },
    },
    {
      name: 'textPosition',
      type: 'select',
      defaultValue: 'right',
      options: ['right', 'left'],
      admin: { description: 'Which edge the statement aligns to beneath the image.' },
    },
    {
      name: 'textSize',
      type: 'select',
      defaultValue: 'default',
      options: ['default', 'small'],
      admin: { description: 'Small steps the statement down one type size.' },
    },
    {
      name: 'imageWidth',
      type: 'select',
      defaultValue: 'contained',
      options: ['contained', 'full'],
      admin: {
        description: 'Contained keeps the image in the site container; full bleeds edge to edge.',
      },
    },
  ],
}
