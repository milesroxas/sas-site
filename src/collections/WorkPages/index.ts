import type { CollectionConfig } from 'payload'
import { authenticated } from '@/access/authenticated'
import { authenticatedOrPublished } from '@/access/authenticatedOrPublished'
import { caseStudyBlocks } from '@/blocks/case-study/config'
import { AUTOSAVE_INTERVAL_MS } from '@/collections/drafts'
import { browseAllMediaField, caseStudyScopedMediaFilter } from '@/fields/caseStudyScopedMedia'
import { closingTab } from '@/fields/closing'
import { menuPreviewFields } from '@/fields/menuPreview'
import {
  contentsButtonField,
  editorialNotesField,
  pagePublishingFields,
  relatedPagesField,
} from '@/fields/pageFields'
import { heroContentCollapsible, heroPresentationFields, pageIntroField } from '@/fields/pageHero'
import { seoMetaTab } from '@/fields/seoMetaTabFields'
import { slugField } from '@/fields/slug'
import { heroVisualSlotFields } from '@/fields/visual'
import { populatePublishedAt } from '@/hooks/populatePublishedAt'
import { collectionPreview } from '@/utilities/generatePreviewPath'
import { revalidateWorkPage, revalidateWorkPageDelete } from './hooks/revalidateWorkPage'
import { validateWorkPage } from './hooks/validateWorkPage'

export const WorkPages: CollectionConfig<'work-pages'> = {
  slug: 'work-pages',
  labels: { singular: 'Work Page', plural: 'Work' },
  orderable: true,
  defaultSort: '_order',
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  admin: {
    group: 'Website: Pages',
    useAsTitle: 'title',
    defaultColumns: ['title', 'caseStudy', 'slug', 'featured', '_status', 'updatedAt'],
    description:
      'Website-specific case-study presentation, composition, SEO, preview, and publishing.',
    ...collectionPreview('work-pages'),
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
                heroContentCollapsible(),
                {
                  type: 'collapsible',
                  label: 'Media & layout',
                  fields: [
                    ...heroVisualSlotFields(
                      {
                        name: 'media',
                        type: 'upload',
                        relationTo: 'media',
                        filterOptions: caseStudyScopedMediaFilter,
                      },
                      { posterFilterOptions: caseStudyScopedMediaFilter },
                    ),
                    browseAllMediaField(),
                    {
                      name: 'layout',
                      type: 'select',
                      defaultValue: 'centered-media',
                      options: ['centered-media', 'landscape'],
                    },
                    ...heroPresentationFields(),
                  ],
                },
              ],
            },
            pageIntroField(),
          ],
        },
        {
          label: 'Composition',
          fields: [
            contentsButtonField(),
            {
              name: 'layout',
              type: 'blocks',
              label: 'Composition',
              // The add button reads "Add Section": editors reach for a Section
              // first and nest content blocks inside it.
              labels: { singular: 'Section', plural: 'Sections' },
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
              ...relatedPagesField('relatedWorkPages', 'work-pages'),
              admin: {
                description:
                  'Shown in the featured-work list at the end of this page, in this order. Unpublished picks are skipped. Leave empty to show the four most recently published work pages (excluding this one).',
              },
            },
            editorialNotesField(),
          ],
        },
        closingTab(),
        seoMetaTab(),
      ],
    },
    ...pagePublishingFields(),
    // Scoped like every other picker on the page; the Assets tab's
    // `browseAllMedia` is a root-level sibling, so it opts this one out too.
    ...menuPreviewFields({
      filterOptions: caseStudyScopedMediaFilter,
      description:
        "Shown in the site menu while this page's link is hovered, and by the Industry work block when it features this page. Leave empty to use the hero media, then the cover asset, then the Header's menu fallback (the block falls back to the cover asset, then hero media).",
    }),
    slugField({ fieldToUse: 'title' }),
  ],
  hooks: {
    beforeValidate: [validateWorkPage],
    beforeChange: [populatePublishedAt],
    afterChange: [revalidateWorkPage],
    afterDelete: [revalidateWorkPageDelete],
  },
  versions: {
    drafts: { autosave: { interval: AUTOSAVE_INTERVAL_MS }, schedulePublish: true },
    maxPerDoc: 50,
  },
}
