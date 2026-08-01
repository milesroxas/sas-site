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
import { Archive } from '@/blocks/ArchiveBlock/config'
import { CallToAction } from '@/blocks/CallToAction/config'
import { Content } from '@/blocks/Content/config'
import { FormBlock } from '@/blocks/Form/config'
import { FeatureHeadingOffset } from '@/blocks/feature/HeadingOffset/config'
import { FeatureImageStatement } from '@/blocks/feature/ImageStatement/config'
import { FeatureStatementGrid } from '@/blocks/feature/StatementGrid/config'
import { FeatureTabs } from '@/blocks/feature/Tabs/config'
import { MediaBlock } from '@/blocks/MediaBlock/config'
import { SplitContentNarrow } from '@/blocks/split-content/config'
import { hero } from '@/heros/config'
import { populatePublishedAt } from '@/hooks/populatePublishedAt'
import { generatePreviewPath } from '@/utilities/generatePreviewPath'
import {
  revalidateAudiencePage,
  revalidateAudiencePageDelete,
} from './hooks/revalidateAudiencePage'

export const AudiencePages: CollectionConfig<'audience-pages'> = {
  slug: 'audience-pages',
  labels: { singular: 'Audience Page', plural: 'Audience Pages' },
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  admin: {
    group: 'Website',
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'industries', '_status', 'updatedAt'],
    description:
      'Who We Help segment pages published at /who-we-help/[slug]. The page defines the audience segment; industries drive automatic related-work matching.',
    livePreview: {
      url: ({ data, req }) =>
        generatePreviewPath({ slug: data?.slug, collection: 'audience-pages', req }),
    },
    preview: (data, { req }) =>
      generatePreviewPath({ slug: data?.slug as string, collection: 'audience-pages', req }),
  },
  defaultPopulate: { title: true, slug: true, industries: true },
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      type: 'tabs',
      tabs: [
        { label: 'Opening', fields: [hero] },
        {
          label: 'Composition',
          fields: [
            {
              name: 'layout',
              type: 'blocks',
              label: 'Composition',
              blocks: [
                CallToAction,
                Content,
                MediaBlock,
                Archive,
                FormBlock,
                FeatureStatementGrid,
                FeatureHeadingOffset,
                FeatureTabs,
                FeatureImageStatement,
                SplitContentNarrow,
              ],
              required: true,
              admin: { initCollapsed: true },
            },
          ],
        },
        {
          label: 'Positioning',
          fields: [
            {
              name: 'industries',
              type: 'relationship',
              relationTo: 'industries',
              hasMany: true,
              required: true,
              admin: {
                description:
                  'Industries this segment spans. Drives automatic related-work matching.',
              },
            },
            {
              name: 'relatedWorkPages',
              type: 'relationship',
              relationTo: 'work-pages',
              hasMany: true,
              admin: {
                description:
                  'Manual selection. Leave empty to match published work automatically by industry.',
              },
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
    { name: 'publishedAt', type: 'date', admin: { position: 'sidebar' } },
    slugField({ fieldToUse: 'title' }),
  ],
  hooks: {
    beforeChange: [populatePublishedAt],
    afterChange: [revalidateAudiencePage],
    afterDelete: [revalidateAudiencePageDelete],
  },
  versions: { drafts: { autosave: { interval: 100 }, schedulePublish: true }, maxPerDoc: 50 },
}
