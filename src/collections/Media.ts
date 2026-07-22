import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import type { CollectionConfig } from 'payload'

import { authenticated } from '../access/authenticated'
import { populateFolderFromAssetLibrary } from '../hooks/assetLibraryFolders'

const APPROVED_CHANNELS = ['website', 'pitch-deck', 'proposal', 'email', 'social'] as const

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
  hooks: {
    beforeChange: [
      populateFolderFromAssetLibrary,
      ({ data }) => {
        if (data?.allChannels) {
          data.approvedChannels = [...APPROVED_CHANNELS]
        }
        return data
      },
    ],
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
      name: 'allChannels',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Approve for every channel. Overrides the manual list below.',
      },
    },
    {
      name: 'approvedChannels',
      type: 'select',
      hasMany: true,
      options: [...APPROVED_CHANNELS],
      admin: {
        condition: (data) => !data?.allChannels,
      },
    },
    { name: 'assetDate', type: 'date' },
    {
      name: 'poster',
      type: 'upload',
      relationTo: 'media',
      filterOptions: { mimeType: { contains: 'image' } },
      admin: {
        description:
          'Still frame shown before a video loads and as its admin thumbnail. Required before a video can be public-approved.',
        condition: (data) => Boolean(data?.mimeType?.startsWith('video')),
      },
      validate: (value: unknown, { siblingData }: { siblingData: unknown }) => {
        const sibling = siblingData as { mimeType?: string; usageStatus?: string } | undefined
        if (
          sibling?.mimeType?.startsWith('video') &&
          sibling?.usageStatus === 'public-approved' &&
          !value
        ) {
          return 'A poster image is required before a video can be public-approved.'
        }
        return true
      },
    },
  ],
  upload: {
    // Images optimize through Next; videos serve directly from the R2 custom
    // domain (see VideoMedia). No local staticDir — objects live in R2.
    mimeTypes: ['image/*', 'video/mp4', 'video/webm'],
    adminThumbnail: ({ doc }) =>
      typeof doc?.mimeType === 'string' && doc.mimeType.startsWith('video')
        ? null
        : (doc?.sizes as { thumbnail?: { url?: string } } | undefined)?.thumbnail?.url || null,
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
