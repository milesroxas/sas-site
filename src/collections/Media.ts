import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import type { CollectionConfig } from 'payload'

import { authenticated } from '../access/authenticated'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export const Media: CollectionConfig = {
  slug: 'media',
  folders: true,
  admin: { group: 'Assets', useAsTitle: 'title' },
  access: {
    create: authenticated,
    delete: authenticated,
    read: ({ req }) => (req.user ? true : { usageStatus: { equals: 'public-approved' } }),
    update: authenticated,
  },
  fields: [
    { name: 'title', type: 'text' },
    {
      name: 'alt',
      type: 'text',
      admin: { description: 'Required before an asset can be public-approved.' },
      validate: (value: string | null | undefined, { siblingData }: { siblingData: unknown }) => {
        const status = (siblingData as { usageStatus?: string } | undefined)?.usageStatus
        if (status === 'public-approved' && !value?.trim()) {
          return 'Alt text is required for public-approved assets.'
        }
        return true
      },
    },
    {
      name: 'caption',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [...rootFeatures, FixedToolbarFeature(), InlineToolbarFeature()]
        },
      }),
    },
    { name: 'description', type: 'textarea' },
    {
      name: 'assetLibrary',
      type: 'relationship',
      relationTo: 'asset-libraries',
      index: true,
      admin: {
        description:
          'Case-study assets belong to a durable Asset Library; folders organize the files within that library.',
      },
    },
    { name: 'organization', type: 'relationship', relationTo: 'organizations' },
    { name: 'project', type: 'relationship', relationTo: 'projects' },
    {
      name: 'purpose',
      type: 'select',
      options: [
        'overview',
        'research',
        'process',
        'strategy',
        'wireframe',
        'design-system',
        'interface',
        'environment',
        'team',
        'result',
        'before',
        'after',
        'motion',
        'other',
      ],
    },
    {
      name: 'usageStatus',
      type: 'select',
      required: true,
      defaultValue: 'internal',
      options: ['internal', 'client-review', 'public-approved'],
      admin: { description: 'Controls CMS API visibility. Blob URLs themselves remain public.' },
    },
    { name: 'credit', type: 'text' },
    { name: 'sourceUrl', type: 'text' },
    {
      name: 'approvedChannels',
      type: 'select',
      hasMany: true,
      options: ['website', 'pitch-deck', 'proposal', 'email', 'social'],
    },
    { name: 'assetDate', type: 'date' },
  ],
  upload: {
    // Upload to the public/media directory in Next.js making them publicly accessible even outside of Payload
    staticDir: path.resolve(dirname, '../../public/media'),
    adminThumbnail: 'thumbnail',
    focalPoint: true,
    imageSizes: [
      {
        name: 'thumbnail',
        width: 300,
      },
      {
        name: 'square',
        width: 500,
        height: 500,
      },
      {
        name: 'small',
        width: 600,
      },
      {
        name: 'medium',
        width: 900,
      },
      {
        name: 'large',
        width: 1400,
      },
      {
        name: 'xlarge',
        width: 1920,
      },
      {
        name: 'og',
        width: 1200,
        height: 630,
        crop: 'center',
      },
    ],
  },
}
