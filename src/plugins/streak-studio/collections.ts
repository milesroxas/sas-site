import { sql } from '@payloadcms/db-vercel-postgres'
import { APIError, type CollectionConfig } from 'payload'
import { authenticated } from '@/access/authenticated'
import { emptyRecipe, validateRecipe } from '@/features/immersive/studio/recipe'
import { LOOKS_SLUG, RECIPE_FIELD, RELEASES_SLUG, RENDERS_SLUG } from './components/paths'
import { lookEndpoints, renderEndpoints } from './endpoints'
import { recipeHash, storedRecipeHash, studioInput } from './hash'
import { PROMOTION, releaseOf } from './releases'
import { lockLook, transactionDB } from './transaction'
import { releaseUsage } from './usage'

const internal = () => false
export const StreakLooks: CollectionConfig = {
  slug: LOOKS_SLUG,
  folders: true,
  labels: { singular: 'Streak Field', plural: 'Streak Fields' },
  admin: {
    group: 'Assets',
    components: {
      edit: { PublishButton: '@/plugins/streak-studio/components/PublishButton#PublishButton' },
    },
    useAsTitle: 'title',
    defaultColumns: ['title', 'thumbnail', 'tags', '_status', 'archived', 'updatedAt'],
    description:
      'Tune the recipe in the Inspector, watch it on the stage, then publish. Published releases stay pinned on existing pages.',
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
      async ({ data, req, originalDoc, operation, context }) => {
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
        // A look is only ever published at a release: either this output has
        // one, or it is what is already published (Payload's Revert to
        // published, which has to keep working after a defaults change moves
        // every hash). Anything else goes through Publish in Studio.
        if (data._status === 'published' && !context[PROMOTION]) {
          const hash = recipeHash(data.recipe ?? originalDoc?.recipe)
          const id: number | undefined = originalDoc?.id
          const published = id
            ? await req.payload.findByID({
                collection: LOOKS_SLUG,
                id,
                draft: false,
                depth: 0,
                disableErrors: true,
                req,
              })
            : null
          const unchanged =
            published?._status === 'published' && storedRecipeHash(published.recipe) === hash
          if (!unchanged && !(id && (await releaseOf(req, id, hash))))
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
    // The stage and the meta live on tabs in the main column; the Inspector
    // (the recipe field) sits in the sidebar so it stays beside the stage on
    // every tab. Tabs are unnamed, so the schema is flat and the labels can
    // change without a migration.
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Studio',
          fields: [
            {
              name: 'stage',
              type: 'ui',
              admin: { components: { Field: '@/plugins/streak-studio/components/Stage#Stage' } },
            },
          ],
        },
        {
          label: 'Details',
          fields: [
            { name: 'title', type: 'text', required: true, index: true },
            { name: 'description', type: 'textarea' },
            { name: 'tags', type: 'text', hasMany: true, index: true },
            {
              type: 'row',
              fields: [
                {
                  name: 'thumbnail',
                  type: 'upload',
                  relationTo: 'media',
                  admin: {
                    readOnly: true,
                    components: {
                      Cell: '@/plugins/streak-studio/components/Thumbnail#Thumbnail',
                    },
                    description: 'The dark poster of the published release.',
                  },
                  access: { create: internal, update: internal },
                },
                {
                  name: 'archived',
                  type: 'checkbox',
                  defaultValue: false,
                  index: true,
                  admin: {
                    description:
                      'Hides the look from new selections. Existing releases keep working.',
                  },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'createdBy',
                  type: 'relationship',
                  relationTo: 'users',
                  admin: { readOnly: true },
                  access: { create: internal, update: internal },
                },
                {
                  name: 'updatedBy',
                  type: 'relationship',
                  relationTo: 'users',
                  admin: { readOnly: true },
                  access: { create: internal, update: internal },
                },
              ],
            },
          ],
        },
        {
          label: 'Releases',
          description: 'Immutable published artwork. Existing pages keep the release they chose.',
          fields: [
            {
              name: 'releases',
              type: 'ui',
              admin: {
                components: { Field: '@/plugins/streak-studio/components/Releases#Releases' },
              },
            },
          ],
        },
        {
          label: 'Renders',
          description: 'Poster and export jobs. Failed jobs can be retried here.',
          fields: [
            {
              name: 'renders',
              type: 'ui',
              admin: {
                components: { Field: '@/plugins/streak-studio/components/Renders#Renders' },
              },
            },
          ],
        },
      ],
    },
    {
      name: RECIPE_FIELD,
      type: 'json',
      required: true,
      defaultValue: emptyRecipe(),
      admin: {
        position: 'sidebar',
        components: { Field: '@/plugins/streak-studio/components/Inspector#Inspector' },
      },
      validate: (value) => {
        try {
          validateRecipe(value)
          return true
        } catch (error) {
          return (error as Error).message
        }
      },
    },
  ],
}

export const StreakReleases: CollectionConfig = {
  slug: RELEASES_SLUG,
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
  slug: RENDERS_SLUG,
  admin: {
    // The job queue is machinery, not a library: every row, with retry and
    // cancel, is on the look's Renders tab. Nothing links to a render
    // document, so it stays out of the nav.
    hidden: true,
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
