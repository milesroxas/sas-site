import { sql } from '@payloadcms/db-vercel-postgres'
import { APIError, type CollectionConfig } from 'payload'
import { authenticated } from '@/access/authenticated'
import { emptyRecipe, validateRecipe } from '@/features/immersive/studio/recipe'
import { lookEndpoints, renderEndpoints } from './endpoints'
import { recipeHash, studioInput } from './hash'
import { lockLook, transactionDB } from './transaction'
import { releaseUsage } from './usage'

const internal = () => false
export const StreakLooks: CollectionConfig = {
  slug: 'streak-looks',
  folders: true,
  labels: { singular: 'Streak Field', plural: 'Streak Fields' },
  admin: {
    group: 'Assets',
    components: {
      edit: { PublishButton: '@/plugins/streak-studio/components/PublishButton#PublishButton' },
    },
    useAsTitle: 'title',
    defaultColumns: ['thumbnail', 'title', 'tags', '_status', 'archived', 'updatedAt'],
    description:
      'Create a look, save its draft, then publish from Studio. Published releases stay pinned on existing pages.',
  },
  access: {
    create: authenticated,
    read: authenticated,
    update: authenticated,
    delete: authenticated,
    readVersions: authenticated,
  },
  versions: { drafts: { autosave: { interval: 2000 } }, maxPerDoc: 50 },
  endpoints: lookEndpoints,
  hooks: {
    beforeChange: [
      async ({ data, req, originalDoc, operation }) => {
        if (originalDoc?.id) {
          await lockLook(req, originalDoc.id)
          if (typeof data.archived === 'boolean' && data.archived !== originalDoc.archived) {
            const db = await transactionDB(req)
            await db.execute(
              sql`UPDATE streak_looks SET archived = ${data.archived} WHERE id = ${originalDoc.id}`,
            )
          }
        }
        if (data.recipe) studioInput(() => validateRecipe(data.recipe))
        if (operation === 'create') data.createdBy = req.user?.id
        data.updatedBy = req.user?.id ?? originalDoc?.updatedBy
        if (data._status === 'published') {
          const hash = recipeHash(data.recipe ?? originalDoc?.recipe)
          const release = await req.payload.find({
            collection: 'streak-releases',
            where: {
              and: [{ look: { equals: originalDoc?.id } }, { sourceHash: { equals: hash } }],
            },
            limit: 1,
            depth: 0,
            req,
          })
          if (!release.docs.length)
            throw new APIError(
              'Use Publish in Studio to generate posters before publishing this revision.',
              400,
            )
        }
        return data
      },
    ],
    beforeDelete: [
      async ({ id, req }) => {
        const [releases, jobs] = await Promise.all([
          req.payload.count({
            collection: 'streak-releases',
            where: { look: { equals: id } },
            req,
          }),
          req.payload.count({ collection: 'streak-renders', where: { look: { equals: id } }, req }),
        ])
        if (releases.totalDocs || jobs.totalDocs)
          throw new APIError('Archive this look to preserve its releases and render history.', 400)
      },
    ],
  },
  fields: [
    { name: 'title', type: 'text', required: true, index: true },
    { name: 'description', type: 'textarea' },
    {
      name: 'thumbnail',
      type: 'upload',
      relationTo: 'media',
      admin: { readOnly: true, position: 'sidebar' },
      access: { create: internal, update: internal },
    },
    { name: 'tags', type: 'text', hasMany: true, index: true },
    {
      name: 'archived',
      type: 'checkbox',
      defaultValue: false,
      index: true,
      admin: {
        position: 'sidebar',
        description: 'Hides the look from new selections. Existing releases keep working.',
      },
    },
    {
      name: 'recipe',
      type: 'json',
      required: true,
      defaultValue: emptyRecipe(),
      admin: { components: { Field: '@/plugins/streak-studio/components/Studio#Studio' } },
      validate: (value) => {
        try {
          validateRecipe(value)
          return true
        } catch (error) {
          return (error as Error).message
        }
      },
    },
    {
      name: 'createdBy',
      type: 'relationship',
      relationTo: 'users',
      admin: { readOnly: true, position: 'sidebar' },
      access: { create: internal, update: internal },
    },
    {
      name: 'updatedBy',
      type: 'relationship',
      relationTo: 'users',
      admin: { readOnly: true, position: 'sidebar' },
      access: { create: internal, update: internal },
    },
  ],
}

export const StreakReleases: CollectionConfig = {
  slug: 'streak-releases',
  endpoints: [releaseUsage],
  admin: {
    group: 'Assets',
    useAsTitle: 'title',
    defaultColumns: ['title', 'look', 'createdAt'],
    description: 'Immutable published artwork. Edit the source look to create a new release.',
  },
  access: { read: () => true, create: internal, update: internal, delete: internal },
  hooks: {
    beforeChange: [
      ({ operation, data }) => {
        if (operation !== 'create') throw new APIError('Published releases are immutable.', 403)
        return data
      },
    ],
    beforeDelete: [
      () => {
        throw new APIError('Archive the source look. Releases are retained for page history.', 403)
      },
    ],
  },
  fields: [
    {
      name: 'usage',
      type: 'ui',
      admin: { components: { Field: '@/plugins/streak-studio/components/Usage#Usage' } },
    },
    { name: 'title', type: 'text', required: true },
    {
      name: 'look',
      type: 'relationship',
      relationTo: 'streak-looks',
      required: true,
      index: true,
      maxDepth: 0,
    },
    { name: 'sourceHash', type: 'text', required: true, index: true },
    { name: 'releaseKey', type: 'text', required: true, unique: true },
    { name: 'snapshot', type: 'json', required: true },
    { name: 'posters', type: 'json', required: true },
    {
      name: 'darkPoster',
      type: 'upload',
      relationTo: 'media',
      required: true,
      maxDepth: 0,
      index: true,
    },
    {
      name: 'lightPoster',
      type: 'upload',
      relationTo: 'media',
      required: true,
      maxDepth: 0,
      index: true,
    },
    {
      name: 'publishedBy',
      type: 'relationship',
      relationTo: 'users',
      maxDepth: 0,
      access: { read: ({ req }) => authenticated({ req }) },
    },
    { name: 'captureBuild', type: 'text', required: true },
  ],
}

export const StreakRenders: CollectionConfig = {
  slug: 'streak-renders',
  admin: {
    group: 'Assets',
    useAsTitle: 'title',
    defaultColumns: ['title', 'state', 'attempts', 'createdAt'],
    description: 'Durable poster and export jobs. Failed jobs can be retried in Studio.',
  },
  access: { read: authenticated, create: internal, update: internal, delete: internal },
  endpoints: renderEndpoints,
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      name: 'look',
      type: 'relationship',
      relationTo: 'streak-looks',
      required: true,
      maxDepth: 0,
      index: true,
    },
    { name: 'kind', type: 'select', options: ['publish', 'export'], required: true },
    {
      name: 'state',
      type: 'select',
      options: ['queued', 'rendering', 'complete', 'failed', 'cancelled'],
      defaultValue: 'queued',
      required: true,
      index: true,
    },
    { name: 'sourceHash', type: 'text', required: true },
    { name: 'snapshot', type: 'json', required: true },
    { name: 'capture', type: 'json', required: true },
    { name: 'requestedBy', type: 'relationship', relationTo: 'users', required: true, maxDepth: 0 },
    { name: 'attempts', type: 'number', defaultValue: 0 },
    { name: 'lease', type: 'text', access: { read: internal } },
    { name: 'leaseExpires', type: 'date' },
    { name: 'error', type: 'textarea' },
    { name: 'release', type: 'relationship', relationTo: 'streak-releases', maxDepth: 0 },
    { name: 'output', type: 'upload', relationTo: 'media', maxDepth: 1 },
  ],
}
