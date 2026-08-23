import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'
import { authenticated } from '@/access/authenticated'
import { authenticatedField } from '@/access/authenticatedField'
import { authenticatedOrPublished } from '@/access/authenticatedOrPublished'
import { Archive } from '@/blocks/ArchiveBlock/config'
import { AudienceTabs } from '@/blocks/AudienceTabs/config'
import { CallToAction } from '@/blocks/CallToAction/config'
import { Content } from '@/blocks/Content/config'
import { FormBlock } from '@/blocks/Form/config'
import { FeatureHeadingOffset } from '@/blocks/feature/HeadingOffset/config'
import { FeatureImageStatement } from '@/blocks/feature/ImageStatement/config'
import { FeatureStatementGrid } from '@/blocks/feature/StatementGrid/config'
import { FeatureTabs } from '@/blocks/feature/Tabs/config'
import { MediaBlock } from '@/blocks/MediaBlock/config'
import { SplitContentNarrow } from '@/blocks/split-content/config'
import { seoMetaTabFields } from '@/fields/seoMetaTabFields'
import { hero } from '@/heros/config'
import { populatePublishedAt } from '@/hooks/populatePublishedAt'
import { generatePreviewPath } from '@/utilities/generatePreviewPath'
import {
  revalidateExpertisePage,
  revalidateExpertisePageDelete,
} from './hooks/revalidateExpertisePage'

export const ExpertisePages: CollectionConfig<'expertise-pages'> = {
  slug: 'expertise-pages',
  labels: { singular: 'Expertise Page', plural: 'Expertise Pages' },
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  admin: {
    group: 'Website',
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'capabilities', '_status', 'updatedAt'],
    description:
      'Service offering pages published at /expertise/[slug]. Composition and SEO only; canonical service facts live in Capabilities.',
    livePreview: {
      url: ({ data, req }) =>
        generatePreviewPath({ slug: data?.slug, collection: 'expertise-pages', req }),
    },
    preview: (data, { req }) =>
      generatePreviewPath({ slug: data?.slug as string, collection: 'expertise-pages', req }),
  },
  defaultPopulate: { title: true, slug: true, capabilities: true },
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
                // Text
                Content,
                // Media
                MediaBlock,
                // Split layouts
                SplitContentNarrow,
                // Statements
                FeatureStatementGrid,
                FeatureHeadingOffset,
                FeatureImageStatement,
                // Interactive
                FeatureTabs,
                AudienceTabs,
                // Lists & grids
                Archive,
                // Forms & CTAs
                CallToAction,
                FormBlock,
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
              name: 'capabilities',
              type: 'relationship',
              relationTo: 'capabilities',
              hasMany: true,
              required: true,
              admin: {
                description:
                  'Canonical capabilities this offering bundles. Drives automatic related-work matching.',
              },
            },
            {
              name: 'relatedWorkPages',
              type: 'relationship',
              relationTo: 'work-pages',
              hasMany: true,
              admin: {
                description:
                  'Manual selection. Leave empty to match published work automatically by capability.',
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
          fields: seoMetaTabFields,
        },
      ],
    },
    { name: 'publishedAt', type: 'date', admin: { position: 'sidebar' } },
    slugField({ fieldToUse: 'title' }),
  ],
  hooks: {
    beforeChange: [populatePublishedAt],
    afterChange: [revalidateExpertisePage],
    afterDelete: [revalidateExpertisePageDelete],
  },
  versions: { drafts: { autosave: { interval: 100 }, schedulePublish: true }, maxPerDoc: 50 },
}
