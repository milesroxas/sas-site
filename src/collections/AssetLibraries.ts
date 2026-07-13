import type { Access, CollectionConfig } from 'payload'
import { slugField } from 'payload'
import { authenticated } from '@/access/authenticated'

const activeOrAuthenticated: Access = ({ req }) => {
  if (req.user) return true
  return { libraryStatus: { equals: 'active' } }
}

export const AssetLibraries: CollectionConfig<'asset-libraries'> = {
  slug: 'asset-libraries',
  labels: { singular: 'Asset Library', plural: 'Asset Libraries' },
  access: {
    create: authenticated,
    delete: authenticated,
    read: activeOrAuthenticated,
    update: authenticated,
  },
  admin: {
    group: 'Assets',
    useAsTitle: 'name',
    defaultColumns: ['name', 'project', 'organization', 'libraryStatus', 'updatedAt'],
    description:
      'Durable project-level asset ownership. Payload folders provide the browsing hierarchy inside each library.',
  },
  defaultPopulate: { name: true, slug: true, organization: true, project: true, rootFolder: true },
  fields: [
    { name: 'name', type: 'text', required: true },
    slugField({ fieldToUse: 'name' }),
    { name: 'organization', type: 'relationship', relationTo: 'organizations', required: true },
    { name: 'project', type: 'relationship', relationTo: 'projects', required: true },
    {
      name: 'rootFolder',
      type: 'relationship',
      relationTo: 'payload-folders',
      filterOptions: { folderType: { contains: 'media' } },
      admin: {
        description:
          'The root Media folder used to browse this library. Subfolders can organize research, process, results, exports, and other sets.',
      },
    },
    { name: 'description', type: 'textarea' },
    {
      name: 'libraryStatus',
      type: 'select',
      required: true,
      defaultValue: 'active',
      options: ['active', 'archived'],
    },
    {
      name: 'usageNotes',
      type: 'textarea',
      access: { read: ({ req }) => Boolean(req.user), update: ({ req }) => Boolean(req.user) },
    },
    {
      name: 'assets',
      type: 'join',
      collection: 'media',
      on: 'assetLibrary',
      admin: {
        allowCreate: true,
        defaultColumns: ['title', 'filename', 'purpose', 'usageStatus', 'updatedAt'],
      },
    },
    {
      name: 'caseStudies',
      type: 'join',
      collection: 'case-studies',
      on: 'assetLibraries',
      admin: { allowCreate: false, defaultColumns: ['title', '_status', 'updatedAt'] },
    },
  ],
}
