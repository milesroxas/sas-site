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
import { caseStudyBlocks } from '@/blocks/case-study/config'
import { browseAllMediaField, caseStudyScopedMediaFilter } from '@/fields/caseStudyScopedMedia'
import { populatePublishedAt } from '@/hooks/populatePublishedAt'
import { generatePreviewPath } from '@/utilities/generatePreviewPath'
import { revalidateWorkPage, revalidateWorkPageDelete } from './hooks/revalidateWorkPage'
import { validateWorkPage } from './hooks/validateWorkPage'

export const WorkPages: CollectionConfig<'work-pages'> = {
  slug: 'work-pages',
  labels: { singular: 'Work Page', plural: 'Work Pages' },
  orderable: true,
  defaultSort: '_order',
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  admin: {
    group: 'Website',
    useAsTitle: 'title',
    defaultColumns: ['title', 'caseStudy', 'slug', 'featured', '_status', 'updatedAt'],
    description:
      'Website-specific case-study presentation, composition, SEO, preview, and publishing.',
    livePreview: {
      url: ({ data, req }) =>
        generatePreviewPath({ slug: data?.slug, collection: 'work-pages', req }),
    },
    preview: (data, { req }) =>
      generatePreviewPath({ slug: data?.slug as string, collection: 'work-pages', req }),
  },
  defaultPopulate: { title: true, slug: true, caseStudy: true, coverAsset: true, featured: true },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description:
          'Editorial label for this website entry; canonical case-study title remains in Content Hub.',
      },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content Source',
          fields: [
            {
              name: 'caseStudy',
              type: 'relationship',
              relationTo: 'case-studies',
              required: true,
              unique: true,
              admin: {
                description: 'The canonical Case Study Content record rendered by this page.',
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
                  filterOptions: caseStudyScopedMediaFilter,
                },
                browseAllMediaField(),
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
              blocks: caseStudyBlocks,
              admin: {
                initCollapsed: true,
                description:
                  'Website composition only. Canonical narrative remains in the related Case Study Content record.',
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
              filterOptions: caseStudyScopedMediaFilter,
            },
            {
              name: 'downloadableAssets',
              type: 'relationship',
              relationTo: 'media',
              hasMany: true,
              filterOptions: caseStudyScopedMediaFilter,
            },
            browseAllMediaField(),
          ],
        },
        {
          label: 'Related Work',
          fields: [
            {
              name: 'relatedWorkPages',
              type: 'relationship',
              relationTo: 'work-pages',
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
    slugField({ fieldToUse: 'title' }),
  ],
  hooks: {
    beforeValidate: [validateWorkPage],
    beforeChange: [populatePublishedAt],
    afterChange: [revalidateWorkPage],
    afterDelete: [revalidateWorkPageDelete],
  },
  versions: { drafts: { autosave: { interval: 100 }, schedulePublish: true }, maxPerDoc: 50 },
}
