import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'
import { authenticated } from '@/access/authenticated'
import { authenticatedField } from '@/access/authenticatedField'
import { authenticatedOrPublished } from '@/access/authenticatedOrPublished'
import { labBlocks } from '@/blocks/lab/config'
import { overridesVisible, showOverridesField } from '@/fields/overrides'
import { seoMetaTabFields } from '@/fields/seoMetaTabFields'
import { populatePublishedAt } from '@/hooks/populatePublishedAt'
import { generatePreviewPath } from '@/utilities/generatePreviewPath'
import { revalidateLabPage, revalidateLabPageDelete } from './hooks/revalidateLabPage'
import { validateLabPage } from './hooks/validateLabPage'

export const LabPages: CollectionConfig<'lab-pages'> = {
  slug: 'lab-pages',
  labels: { singular: 'Lab Page', plural: 'Lab Pages' },
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  admin: {
    group: 'Website',
    useAsTitle: 'title',
    defaultColumns: ['title', 'labProject', 'slug', 'featured', '_status', 'updatedAt'],
    description:
      'Website-specific lab-project presentation, composition, SEO, preview, and publishing.',
    livePreview: {
      url: ({ data, req }) =>
        generatePreviewPath({ slug: data?.slug, collection: 'lab-pages', req }),
    },
    preview: (data, { req }) =>
      generatePreviewPath({ slug: data?.slug as string, collection: 'lab-pages', req }),
  },
  defaultPopulate: {
    title: true,
    slug: true,
    labProject: true,
    coverAsset: true,
    featured: true,
    // The newsletter block renders lab pages with their SEO image and description.
    meta: { image: true, description: true },
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description:
          'Editorial label for this website entry; canonical lab-project title remains in Content Hub.',
      },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content Source',
          fields: [
            {
              name: 'labProject',
              type: 'relationship',
              relationTo: 'lab-projects',
              required: true,
              unique: true,
              admin: {
                description: 'The canonical Lab Project record rendered by this page.',
              },
            },
          ],
        },
        {
          label: 'Opening',
          description: 'The full-screen opening of the page: the hero.',
          fields: [
            {
              name: 'hero',
              type: 'group',
              fields: [
                {
                  type: 'collapsible',
                  label: 'Content',
                  fields: [
                    { name: 'eyebrow', type: 'text' },
                    showOverridesField(),
                    {
                      name: 'titleOverride',
                      type: 'text',
                      admin: {
                        description: 'Website-only. Leave empty to use the canonical title.',
                        condition: overridesVisible,
                      },
                    },
                    {
                      name: 'summaryOverride',
                      type: 'textarea',
                      admin: {
                        description: 'Website-only. Leave empty to use the canonical summary.',
                        condition: overridesVisible,
                      },
                    },
                  ],
                },
                {
                  type: 'collapsible',
                  label: 'Media & layout',
                  fields: [
                    {
                      name: 'media',
                      type: 'upload',
                      relationTo: 'media',
                      filterOptions: { usageStatus: { equals: 'public-approved' } },
                    },
                    {
                      name: 'layout',
                      type: 'select',
                      defaultValue: 'editorial-split',
                      options: ['editorial-split', 'centered', 'immersive', 'media-led'],
                    },
                    {
                      name: 'theme',
                      type: 'select',
                      defaultValue: 'light',
                      options: ['light', 'dark', 'neutral', 'brand'],
                      admin: {
                        description:
                          'Section surface within the visitor\'s site theme. Does not force light/dark mode — "dark" is a contrasted band in whichever theme the visitor chose.',
                      },
                    },
                    {
                      name: 'mediaTreatment',
                      type: 'select',
                      defaultValue: 'contained',
                      options: ['contained', 'full-bleed', 'floating', 'background'],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Composition',
          fields: [
            {
              name: 'layout',
              type: 'blocks',
              label: 'Composition',
              blocks: labBlocks,
              admin: {
                initCollapsed: true,
                description:
                  'Website composition only. Canonical narrative remains in the related Lab Project record.',
              },
            },
          ],
        },
        {
          label: 'Assets',
          fields: [
            {
              name: 'coverAsset',
              type: 'upload',
              relationTo: 'media',
              filterOptions: { usageStatus: { equals: 'public-approved' } },
              admin: { description: 'Used on cards, indexes, and as the hero fallback.' },
            },
          ],
        },
        {
          label: 'Related Work',
          fields: [
            {
              name: 'relatedLabPages',
              type: 'relationship',
              relationTo: 'lab-pages',
              hasMany: true,
              filterOptions: ({ id }) => ({ id: { not_in: id ? [id] : [] } }),
            },
            {
              name: 'editorialNotes',
              type: 'textarea',
              access: {
                read: authenticatedField,
                update: authenticatedField,
              },
            },
          ],
        },
        {
          name: 'meta',
          label: 'SEO',
          fields: seoMetaTabFields,
        },
      ],
    },
    { name: 'featured', type: 'checkbox', defaultValue: false, admin: { position: 'sidebar' } },
    { name: 'publishedAt', type: 'date', admin: { position: 'sidebar' } },
    slugField({ useAsSlug: 'title' }),
  ],
  hooks: {
    beforeValidate: [validateLabPage],
    beforeChange: [populatePublishedAt],
    afterChange: [revalidateLabPage],
    afterDelete: [revalidateLabPageDelete],
  },
  versions: { drafts: { autosave: { interval: 100 }, schedulePublish: true }, maxPerDoc: 50 },
}
