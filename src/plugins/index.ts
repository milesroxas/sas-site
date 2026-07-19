import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import { mcpPlugin } from '@payloadcms/plugin-mcp'
import { nestedDocsPlugin } from '@payloadcms/plugin-nested-docs'
import { redirectsPlugin } from '@payloadcms/plugin-redirects'
import { searchPlugin } from '@payloadcms/plugin-search'
import { sentryPlugin } from '@payloadcms/plugin-sentry'
import { seoPlugin } from '@payloadcms/plugin-seo'
import type { GenerateTitle, GenerateURL } from '@payloadcms/plugin-seo/types'
import { FixedToolbarFeature, HeadingFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
import * as Sentry from '@sentry/nextjs'
import type { Plugin } from 'payload'
import { revalidateRedirects } from '@/hooks/revalidateRedirects'
import type { AudiencePage, ExpertisePage, LabPage, Page, Post, WorkPage } from '@/payload-types'
import { aeoPlugin } from '@/plugins/aeo'
import { askIndexPlugin } from '@/plugins/ask-index'
import { beforeSyncWithSearch } from '@/search/beforeSync'
import { searchFields } from '@/search/fieldOverrides'
import {
  CONTENT_SURFACES,
  SEARCH_COLLECTIONS,
  surfaceByCollection,
  surfaceDocPath,
} from '@/shared/content/surfaces'
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
  formBuilderPlugin({
    fields: {
      payment: false,
    },
    formOverrides: {
      admin: { group: 'Forms' },
      fields: ({ defaultFields }) => {
        return defaultFields.map((field) => {
          if ('name' in field && field.name === 'confirmationMessage') {
            return {
              ...field,
              editor: lexicalEditor({
                features: ({ rootFeatures }) => {
                  return [
                    ...rootFeatures,
                    FixedToolbarFeature(),
                    HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
                  ]
                },
              }),
            }
          }
          return field
        })
      },
    },
    formSubmissionOverrides: {
      admin: { group: 'Forms' },
    },
  }),
  searchPlugin({
    collections: SEARCH_COLLECTIONS,
    beforeSync: beforeSyncWithSearch,
    searchOverrides: {
      admin: { group: 'System' },
      fields: ({ defaultFields }) => {
        return [...defaultFields, ...searchFields]
      },
    },
  }),
  aeoPlugin(),
  askIndexPlugin(),
  // Exposes public content surfaces to MCP clients (e.g. the OpenAI Responses
  // API's remote-MCP tool) as read-only resources at /api/mcp. API keys are
  // created in admin under MCP → API Keys; each key's capabilities can be
  // narrowed further there.
  mcpPlugin({
    collections: Object.fromEntries(
      CONTENT_SURFACES.map((surface) => [
        surface.collection,
        {
          description: `${surface.title} — public site content published under ${surface.urlPrefix || '/'}`,
          enabled: { find: true },
        },
      ]),
    ),
    overrideApiKeyCollection: (collection) => ({
      ...collection,
      admin: { ...collection.admin, group: 'System' },
    }),
  }),
  // Captures Payload REST/GraphQL/Local API errors (5xx by default) with
  // user context, and wraps the admin UI in a Sentry error boundary. Must
  // receive the app's own Sentry module so events reach the SDK instance
  // initialized in instrumentation.ts.
  sentryPlugin({ Sentry }),
]
