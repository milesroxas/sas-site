import type { GlobalConfig } from 'payload'

import { authenticated } from '@/access/authenticated'
import { seoMetaTabFields } from '@/fields/seoMetaTabFields'
import { hero } from '@/heros/config'
import { generateGlobalPreviewPath } from '@/utilities/generatePreviewPath'
import { revalidateCollectionIndex } from './hooks/revalidateCollectionIndex'

type CollectionIndexArgs = {
  slug: 'insights-index' | 'works-index'
  label: string
  /** Site-relative path the index publishes at, e.g. `/insights`. */
  path: string
  /** Extra revalidation paths, e.g. paginated routes. */
  extraPaths?: string[]
  description: string
}

/**
 * Editor-configured singleton for a collection index page (`/insights`, `/works`).
 * Mirrors the Home global: hero + SEO only — the listing itself stays
 * code-owned.
 */
const collectionIndexGlobal = ({
  slug,
  label,
  path,
  extraPaths = [],
  description,
}: CollectionIndexArgs): GlobalConfig => ({
  slug,
  label,
  admin: {
    group: 'Website: Landing',
    description,
    livePreview: {
      url: () => generateGlobalPreviewPath({ global: slug, path }),
    },
    preview: () => generateGlobalPreviewPath({ global: slug, path }),
  },
  access: {
    read: () => true,
    update: authenticated,
    readVersions: authenticated,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      defaultValue: label,
    },
    {
      type: 'tabs',
      tabs: [
        {
          fields: [hero],
          label: 'Hero',
          description: 'The opening of the index page. Low Impact fits archive listings best.',
        },
        {
          name: 'meta',
          label: 'SEO',
          fields: seoMetaTabFields,
        },
      ],
    },
  ],
  hooks: {
    afterChange: [revalidateCollectionIndex({ paths: [path, ...extraPaths], slug })],
  },
  versions: {
    drafts: {
      autosave: {
        interval: 100,
      },
      schedulePublish: true,
    },
    max: 50,
  },
})

export const InsightsIndex = collectionIndexGlobal({
  slug: 'insights-index',
  label: 'Insights Index',
  path: '/insights',
  extraPaths: ['/posts', '/post'],
  description:
    'The insights hub published at /insights (also at /posts). Hero and SEO only — the lists are automatic.',
})

export const WorksIndex = collectionIndexGlobal({
  slug: 'works-index',
  label: 'Works Index',
  path: '/works',
  description: 'The works index published at /works. Hero and SEO only — the list is automatic.',
})
