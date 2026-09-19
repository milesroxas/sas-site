import { sql } from '@payloadcms/db-vercel-postgres'
import { APIError, type CollectionConfig, type Field } from 'payload'
import { authenticated } from '@/access/authenticated'
import { DEFAULT_EFFECT, EFFECT_OPTIONS, effectOf } from '@/features/immersive/studio/effects'
import { emptyRecipe, validateRecipe } from '@/features/immersive/studio/recipe'
import {
  EFFECT_FIELD,
  LOOKS_SLUG,
  RECIPE_FIELD,
  RELEASES_SLUG,
  RENDERS_SLUG,
} from './components/paths'
import { lookEndpoints } from './endpoints'
import { recipeHash, storedRecipeHash, studioInput } from './hash'
import { lockLook, PUBLISH, transactionDB } from './transaction'
import { lookUsage } from './usage'

const internal = () => false

/**
 * What the website reads, written only by Publish: the resolved snapshot, the
 * poster manifest and the hash of the published recipe. They ride on the look
 * the way image sizes ride on a media document.
 */
const published = (field: Field): Field =>
  ({
    ...field,
    admin: { hidden: true },
    access: { create: internal, update: internal },
  }) as Field

/**
 * A look is one effect (`@/features/immersive/studio/effects`), authored. It is
 * used like a media file: a page slot references the document, and the site
 * shows whatever is published. The draft is the working
 * copy (autosaved); Publish renders the two posters in the editor's browser
 * and publishes the look with them in one write. History is Payload's own
 * versions, so there is no second version system beside it.
 */
export const StreakLooks: CollectionConfig = {
  slug: LOOKS_SLUG,
  folders: true,
  // The slug predates the second effect. Slugs are never renamed: the table,
  // its versions and every slot's foreign key carry it.
  labels: { singular: 'Studio Look', plural: 'Studio Looks' },
  admin: {
    group: 'Assets',
    components: {
      edit: { PublishButton: '@/plugins/streak-studio/components/PublishButton#PublishButton' },
    },
    useAsTitle: 'title',
    defaultColumns: ['title', 'thumbnail', EFFECT_FIELD, 'tags', '_status', 'updatedAt'],
    description:
      'Tune the recipe in the Inspector, watch it on the stage, then publish. Every place that uses the look shows what is published.',
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
        // The effect is open until the look is first published, then fixed:
        // every published state, poster and slot that uses the look was made
        // for that effect. The stage changes it together with the recipe.
        if (originalDoc?.snapshot) data[EFFECT_FIELD] = originalDoc[EFFECT_FIELD]
        const effect = effectOf(data[EFFECT_FIELD] ?? originalDoc?.[EFFECT_FIELD])
        if (data.recipe) studioInput(() => validateRecipe(effect, data.recipe))
        if (operation === 'create') data.createdBy = req.user?.id
        data.updatedBy = req.user?.id ?? originalDoc?.updatedBy
        // A published look always has its posters: Publish in Studio is the
        // one way to publish new output. Publishing what is already published
        // (Payload's Revert to published) changes nothing the site shows.
        if (data._status === 'published' && !context[PUBLISH]) {
          const id: number | undefined = originalDoc?.id
          const live = id
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
            live?._status === 'published' &&
            storedRecipeHash(effect.id, live.recipe) ===
              recipeHash(effect.id, data.recipe ?? originalDoc?.recipe)
          if (!unchanged)
            throw new APIError('Use Publish in Studio: it renders the posters the site needs.', 400)
        }
        return data
      },
    ],
    beforeDelete: [
      async ({ id, req }) => {
        const uses = (await lookUsage(req, Number(id))).filter((use) => !use.historical)
        if (uses.length)
          throw new APIError(
            `This look is in use on ${uses.length === 1 ? uses[0].title : `${uses.length} places`}. Remove it there first.`,
            400,
          )
        // Rows from the earlier release model still point here until their tables are dropped.
        const legacy = await req.payload.count({
          collection: RELEASES_SLUG,
          where: { look: { equals: id } },
          req,
        })
        if (legacy.totalDocs)
          throw new APIError('Archive this look: its earlier releases are still on record.', 400)
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
            {
              name: EFFECT_FIELD,
              type: 'select',
              required: true,
              index: true,
              defaultValue: DEFAULT_EFFECT,
              options: EFFECT_OPTIONS,
              // Chosen on the stage, with the recipe it invalidates, and fixed
              // once the look is published (the `beforeChange` hook holds it).
              admin: {
                readOnly: true,
                description: 'What this look draws. Chosen in Studio before the first publish.',
              },
            },
            { name: 'description', type: 'textarea' },
            { name: 'tags', type: 'text', hasMany: true, index: true },
            {
              type: 'row',
              fields: [
                {
                  name: 'thumbnail',
                  type: 'upload',
                  relationTo: 'media',
                  label: 'Dark poster',
                  admin: {
                    readOnly: true,
                    components: {
                      Cell: '@/plugins/streak-studio/components/Thumbnail#Thumbnail',
                    },
                    description: 'Rendered on Publish. Also the library thumbnail.',
                  },
                  access: { create: internal, update: internal },
                },
                {
                  name: 'lightPoster',
                  type: 'upload',
                  relationTo: 'media',
                  admin: { readOnly: true, description: 'Rendered on Publish.' },
                  access: { create: internal, update: internal },
                },
              ],
            },
            {
              name: 'archived',
              type: 'checkbox',
              defaultValue: false,
              index: true,
              admin: {
                description: 'Hides the look from the picker. Places that use it keep working.',
              },
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
            {
              name: 'usage',
              type: 'ui',
              admin: { components: { Field: '@/plugins/streak-studio/components/Usage#Usage' } },
            },
          ],
        },
        {
          label: 'History',
          description:
            'Every published state of this look. Restore copies one into the draft; nothing changes on the site until you publish.',
          fields: [
            {
              name: 'history',
              type: 'ui',
              admin: {
                components: { Field: '@/plugins/streak-studio/components/History#History' },
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
      defaultValue: emptyRecipe(effectOf(DEFAULT_EFFECT)),
      admin: {
        position: 'sidebar',
        components: { Field: '@/plugins/streak-studio/components/Inspector#Inspector' },
      },
      validate: (value, { siblingData }) => {
        try {
          validateRecipe(effectOf((siblingData as Record<string, unknown>)[EFFECT_FIELD]), value)
          return true
        } catch (error) {
          return (error as Error).message
        }
      },
    },
    published({ name: 'snapshot', type: 'json' }),
    published({ name: 'posters', type: 'json' }),
    published({ name: 'sourceHash', type: 'text' }),
  ],
}

/**
 * The earlier release model, kept as bare schema so its tables and the
 * `release` columns on every visual slot survive until the follow-up migration
 * drops them. Nothing reads or writes these any more.
 */
export const StreakReleases: CollectionConfig = {
  slug: RELEASES_SLUG,
  admin: { hidden: true },
  access: { read: authenticated, create: internal, update: internal, delete: internal },
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      name: 'look',
      type: 'relationship',
      relationTo: LOOKS_SLUG,
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
    { name: 'publishedBy', type: 'relationship', relationTo: 'users', maxDepth: 0 },
    { name: 'captureBuild', type: 'text', required: true },
  ],
}

/** The earlier render queue. Bare schema, for the same reason as the releases. */
export const StreakRenders: CollectionConfig = {
  slug: RENDERS_SLUG,
  admin: { hidden: true },
  access: { read: authenticated, create: internal, update: internal, delete: internal },
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      name: 'look',
      type: 'relationship',
      relationTo: LOOKS_SLUG,
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
    { name: 'release', type: 'relationship', relationTo: RELEASES_SLUG, maxDepth: 0 },
    { name: 'output', type: 'upload', relationTo: 'media', maxDepth: 1 },
  ],
}
