import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'
import { authenticated } from '@/access/authenticated'
import { authenticatedOrPublished } from '@/access/authenticatedOrPublished'
import { labBlocks } from '@/blocks/lab/config'
import { editorialNotesField, pagePublishingFields, relatedPagesField } from '@/fields/pageFields'
import { heroContentCollapsible, heroPresentationFields } from '@/fields/pageHero'
import { seoMetaTab } from '@/fields/seoMetaTabFields'
import { populatePublishedAt } from '@/hooks/populatePublishedAt'
import { collectionPreview } from '@/utilities/generatePreviewPath'
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
    ...collectionPreview('lab-pages'),
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
                heroContentCollapsible(),
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
                    ...heroPresentationFields(),
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
          fields: [relatedPagesField('relatedLabPages', 'lab-pages'), editorialNotesField()],
        },
        seoMetaTab(),
      ],
    },
    ...pagePublishingFields(),
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
