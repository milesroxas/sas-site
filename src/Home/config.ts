import type { GlobalConfig } from 'payload'

import { authenticated } from '@/access/authenticated'
import { pageLayoutBlocks } from '@/fields/pageLayoutBlocks'
import { seoMetaTab } from '@/fields/seoMetaTabFields'
import { generateHomePreviewPath } from '@/utilities/generatePreviewPath'
import { HomeFeaturedWork } from './featured-work/config'
import { homeHero } from './hero/config'
import { revalidateHome } from './hooks/revalidateHome'
import { homeStatement } from './statement/config'

export const Home: GlobalConfig = {
  slug: 'home',
  label: 'Home',
  admin: {
    group: 'Website',
    description: 'The site homepage published at /. Composition and SEO only.',
    livePreview: {
      url: ({ req }) => generateHomePreviewPath({ req }),
    },
    preview: (_data, { req }) => generateHomePreviewPath({ req }),
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
      defaultValue: 'Home',
    },
    {
      type: 'tabs',
      tabs: [
        {
          fields: [homeHero, homeStatement],
          label: 'Opening',
          description: 'The full-screen opening of the page: hero, then the statement band.',
        },
        {
          fields: [
            {
              name: 'layout',
              type: 'blocks',
              label: 'Composition',
              blocks: [...pageLayoutBlocks, HomeFeaturedWork],
              required: true,
              admin: {
                initCollapsed: true,
              },
            },
          ],
          label: 'Composition',
        },
        seoMetaTab(),
      ],
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, req }) => {
        if (req.data && !req.data.publishedAt) {
          return {
            ...data,
            publishedAt: new Date(),
          }
        }
        return data
      },
    ],
    afterChange: [revalidateHome],
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
}
