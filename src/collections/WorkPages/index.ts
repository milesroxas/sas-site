import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'
import { authenticated } from '@/access/authenticated'
import { authenticatedField } from '@/access/authenticatedField'
import { authenticatedOrPublished } from '@/access/authenticatedOrPublished'
import { caseStudyBlocks } from '@/blocks/case-study/config'
import { browseAllMediaField, caseStudyScopedMediaFilter } from '@/fields/caseStudyScopedMedia'
import { overridesVisible, showOverridesField } from '@/fields/overrides'
import { seoMetaTabFields } from '@/fields/seoMetaTabFields'
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
          label: 'Opening',
          description: 'The full-screen opening of the page: hero, then the introduction band.',
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
                      filterOptions: caseStudyScopedMediaFilter,
                    },
                    browseAllMediaField(),
                    {
                      name: 'layout',
                      type: 'select',
                      defaultValue: 'centered-media',
                      options: ['centered-media', 'landscape'],
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
            {
              name: 'intro',
              type: 'group',
              interfaceName: 'WorkIntro',
              admin: {
                description:
                  'Full-screen introduction band rendered right after the hero. The body is the canonical case-study summary from the Content Hub.',
              },
              fields: [
                {
                  name: 'eyebrow',
                  type: 'text',
                  admin: {
                    description: 'Short label above the introduction copy, e.g. "Introduction".',
                  },
                },
                {
                  name: 'title',
                  type: 'text',
                  required: true,
                  admin: { description: 'Statement headline for the section.' },
                },
                showOverridesField(),
                {
                  name: 'bodyOverride',
                  type: 'richText',
                  admin: {
                    description:
                      'Website-only override for the canonical summary; canonical content is unchanged.',
                    condition: overridesVisible,
                  },
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
          fields: seoMetaTabFields,
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
