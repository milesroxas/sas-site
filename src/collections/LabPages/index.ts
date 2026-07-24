import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'
import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'
import { authenticated } from '@/access/authenticated'
import { authenticatedField } from '@/access/authenticatedField'
import { authenticatedOrPublished } from '@/access/authenticatedOrPublished'
import { labBlocks } from '@/blocks/lab/config'
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
          label: 'Presentation',
          fields: [
            {
              name: 'hero',
              type: 'group',
              fields: [
                { name: 'eyebrow', type: 'text' },
                {
                  name: 'titleOverride',
                  type: 'text',
                  admin: { description: 'Website-only. Leave empty to use the canonical title.' },
                },
                {
                  name: 'summaryOverride',
                  type: 'textarea',
                  admin: { description: 'Website-only. Leave empty to use the canonical summary.' },
                },
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
            {
              name: 'layout',
              type: 'blocks',
              blocks: labBlocks,
              admin: {
                initCollapsed: true,
                description:
                  'Website composition only. Canonical narrative remains in the related Lab Project record.',
              },
            },
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
          fields: [
            OverviewField({
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
              imagePath: 'meta.image',
            }),
            MetaTitleField({ hasGenerateFn: true }),
            MetaImageField({ relationTo: 'media' }),
            MetaDescriptionField({}),
            PreviewField({
              hasGenerateFn: true,
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
            }),
          ],
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
