import { nestedDocsPlugin } from '@payloadcms/plugin-nested-docs'
import { redirectsPlugin } from '@payloadcms/plugin-redirects'
import { searchPlugin } from '@payloadcms/plugin-search'
import { sentryPlugin } from '@payloadcms/plugin-sentry'
import { seoPlugin } from '@payloadcms/plugin-seo'
import type { GenerateTitle, GenerateURL } from '@payloadcms/plugin-seo/types'
import * as Sentry from '@sentry/nextjs'
import { mediaGalleryPlugin } from '@sitebytom/payload-media-gallery'
import type { Plugin } from 'payload'
import { authenticated } from '@/access/authenticated'
import { revalidateRedirects } from '@/hooks/revalidateRedirects'
import type { AudiencePage, ExpertisePage, LabPage, Page, Post, WorkPage } from '@/payload-types'
import { aeoPlugin } from '@/plugins/aeo'
import { aiPlugin } from '@/plugins/ai'
import { askIndexPlugin } from '@/plugins/ask-index'
import { formBuilder } from '@/plugins/form-builder'
import { mcp } from '@/plugins/mcp'
import { beforeSyncWithSearch } from '@/search/beforeSync'
import { searchFields } from '@/search/fieldOverrides'
import { SEARCH_COLLECTIONS, surfaceByCollection, surfaceDocPath } from '@/shared/content/surfaces'
import { getServerSideURL } from '@/utilities/getURL'

type SeoDoc = Post | Page | WorkPage | LabPage | ExpertisePage | AudiencePage

const generateTitle: GenerateTitle<SeoDoc> = ({ doc }) => {
  return doc?.title ? `${doc.title} | Suits & Sandals` : 'Suits & Sandals'
}

const generateURL: GenerateURL<SeoDoc> = ({ collectionConfig, doc }) => {
  const url = getServerSideURL()
  if (!doc?.slug) return url

  const surface = surfaceByCollection.get(collectionConfig?.slug ?? '')
  return surface ? `${url}${surfaceDocPath(surface, doc.slug)}` : `${url}/${doc.slug}`
}

export const plugins: Plugin[] = [
  redirectsPlugin({
    collections: ['pages', 'posts', 'work-pages', 'lab-pages', 'expertise-pages', 'audience-pages'],
    overrides: {
      // Plugin default leaves write ops at Payload's `Boolean(req.user)` —
      // which an MCP API key satisfies over REST. Restrict writes to team.
      access: {
        create: authenticated,
        delete: authenticated,
        update: authenticated,
      },
      admin: { group: 'System' },
      // @ts-expect-error - This is a valid override, mapped fields don't resolve to the same type
      fields: ({ defaultFields }) => {
        return defaultFields.map((field) => {
          if ('name' in field && field.name === 'from') {
            return {
              ...field,
              admin: {
                description: 'You will need to rebuild the website when changing this field.',
              },
            }
          }
          return field
        })
      },
      hooks: {
        afterChange: [revalidateRedirects],
      },
    },
  }),
  nestedDocsPlugin({
    collections: ['categories'],
    generateURL: (docs) => docs.reduce((url, doc) => `${url}/${doc.slug}`, ''),
  }),
  seoPlugin({
    generateTitle,
    generateURL,
  }),
  formBuilder,
  searchPlugin({
    collections: SEARCH_COLLECTIONS,
    beforeSync: beforeSyncWithSearch,
    searchOverrides: {
      // Derived index: writable by the sync hooks (Local API) and team only.
      access: {
        delete: authenticated,
        update: authenticated,
      },
      admin: { group: 'System' },
      fields: ({ defaultFields }) => {
        return [...defaultFields, ...searchFields]
      },
    },
  }),
  // Gallery views (justified/grid/list), lightbox, and quick-edit drawer for
  // the admin media list. Admin-UI only; works in "All Media" (not Folders).
  mediaGalleryPlugin({
    collections: { media: true },
    defaultView: 'justified',
    lightbox: true,
    edit: true,
  }),
  // AI compose/rephrase/etc. in the admin editor. Full config (voice, per-field
  // prompt seeds, context getters, action prompts) lives in ./ai.
  aiPlugin,
  aeoPlugin(),
  askIndexPlugin(),
  // Internal-team MCP server at /api/mcp for agent-driven content authoring.
  // Full config (collections, globals, capability policy) lives in ./mcp.
  mcp,
  // Captures Payload REST/GraphQL/Local API errors (5xx by default) with
  // user context, and wraps the admin UI in a Sentry error boundary. Must
  // receive the app's own Sentry module so events reach the SDK instance
  // initialized in instrumentation.ts.
  sentryPlugin({ Sentry }),
]
