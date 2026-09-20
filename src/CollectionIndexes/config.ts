import type { GlobalConfig, Tab } from 'payload'

import { authenticated } from '@/access/authenticated'
import { AUTOSAVE_INTERVAL_MS } from '@/collections/drafts'
import { menuPreviewFields } from '@/fields/menuPreview'
import { seoMetaTabFields } from '@/fields/seoMetaTabFields'
import { heroField } from '@/heros/config'
import { generateGlobalPreviewPath } from '@/utilities/generatePreviewPath'
import { indexBannerTab } from './banner'
import { revalidateCollectionIndex } from './hooks/revalidateCollectionIndex'

type CollectionIndexArgs = {
  slug: 'insights-index' | 'lab-index' | 'works-index'
  label: string
  /** Site-relative path the index publishes at, e.g. `/insights`. */
  path: string
  /** Extra revalidation paths, e.g. paginated routes. */
  extraPaths?: string[]
  description: string
  /** Tabs only this index carries, between Hero and SEO. */
  tabs?: Tab[]
}

/**
 * Editor-configured singleton for a collection index page (`/insights`,
 * `/works`, `/lab`).
 * Mirrors the Home global: hero + SEO, plus any tab of the index's own; the
 * listing itself stays code-owned.
 */
const collectionIndexGlobal = ({
  slug,
  label,
  path,
  extraPaths = [],
  description,
  tabs = [],
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
          fields: [
            // The index renders the hero as copy only, so the upload never
            // paints here and is not required; an effect runs behind the
            // whole page instead, and the menu previews either as its poster.
            heroField({
              visualCondition: () => true,
              mediaRequired: false,
              // Every effect: `IndexBackground` draws the slot's effect behind
              // the listing, whichever it is, and never the media.
              // The effect grounds the whole listing, which paints in the
              // visitor's theme: there is no band here for a pinned face.
              visualThemed: false,
              visualTypeDescription:
                'An effect runs behind the whole index page and previews in the menu. A media upload previews in the menu only; the page itself stays copy.',
            }),
          ],
          label: 'Hero',
          description:
            'The opening of the index page. Low Impact fits archive listings best; an effect visual runs behind the whole page whatever the type.',
        },
        ...tabs,
        {
          name: 'meta',
          label: 'SEO',
          fields: seoMetaTabFields,
        },
      ],
    },
    // The index pages render their hero as copy only, so this is the sole
    // way an editor puts media behind the menu link.
    ...menuPreviewFields({
      description:
        "Shown in the site menu while this page's link is hovered. Leave empty to use the hero media, then the Header's menu fallback.",
    }),
  ],
  hooks: {
    afterChange: [revalidateCollectionIndex({ paths: [path, ...extraPaths], slug })],
  },
  versions: {
    drafts: {
      autosave: {
        interval: AUTOSAVE_INTERVAL_MS,
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

export const LabIndex = collectionIndexGlobal({
  slug: 'lab-index',
  label: 'Lab Index',
  path: '/lab',
  description:
    'The lab index published at /lab. Hero, banner and SEO: the list is automatic, and its filter and sort strip appears once there are five entries.',
  tabs: [indexBannerTab],
})

export const WorksIndex = collectionIndexGlobal({
  slug: 'works-index',
  label: 'Works Index',
  path: '/works',
  description: 'The works index published at /works. Hero and SEO only — the list is automatic.',
})
