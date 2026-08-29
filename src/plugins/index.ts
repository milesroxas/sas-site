import { payloadAiPlugin } from '@ai-stack/payloadcms'
import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import { nestedDocsPlugin } from '@payloadcms/plugin-nested-docs'
import { redirectsPlugin } from '@payloadcms/plugin-redirects'
import { searchPlugin } from '@payloadcms/plugin-search'
import { sentryPlugin } from '@payloadcms/plugin-sentry'
import { seoPlugin } from '@payloadcms/plugin-seo'
import type { GenerateTitle, GenerateURL } from '@payloadcms/plugin-seo/types'
import { FixedToolbarFeature, HeadingFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
import * as Sentry from '@sentry/nextjs'
import { mediaGalleryPlugin } from '@sitebytom/payload-media-gallery'
import type { Plugin } from 'payload'
import { authenticated } from '@/access/authenticated'
import { revalidateRedirects } from '@/hooks/revalidateRedirects'
import type { AudiencePage, ExpertisePage, LabPage, Page, Post, WorkPage } from '@/payload-types'
import { aeoPlugin } from '@/plugins/aeo'
import { askIndexPlugin } from '@/plugins/ask-index'
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
  formBuilderPlugin({
    fields: {
      payment: false,
    },
    formOverrides: {
      // Team-only writes; MCP API keys authenticate as req.user over REST but
      // must not manage forms. Public read stays (frontend renders forms).
      access: {
        create: authenticated,
        delete: authenticated,
        update: authenticated,
      },
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
      // Submissions hold visitor PII: readable/deletable by team only. Public
      // create stays (site visitors submit forms); plugin keeps update: false.
      access: {
        delete: authenticated,
        read: authenticated,
      },
      admin: { group: 'Forms' },
    },
  }),
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
  // AI compose/rephrase/etc. in the admin editor (OPENAI_API_KEY from env).
  // Adds the hidden `plugin-ai-instructions` collection (per-field prompts).
  payloadAiPlugin({
    collections: {
      // Website — publishing surfaces
      pages: true,
      posts: true,
      'work-pages': true,
      'lab-pages': true,
      'expertise-pages': true,
      'audience-pages': true,
      // Content Hub — canonical source material
      organizations: true,
      projects: true,
      'case-studies': true,
      'lab-projects': true,
      testimonials: true,
    },
    // Plugin defaults gate generation/settings on Boolean(req.user), which an
    // MCP API key satisfies over REST. Restrict to team.
    access: {
      generate: authenticated,
      settings: authenticated,
    },
    overrideInstructions: {
      access: {
        create: authenticated,
        delete: authenticated,
        read: authenticated,
        update: authenticated,
      },
    },
    debugging: false,
    disableSponsorMessage: true,
    uploadCollectionSlug: 'media',
  }),
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
