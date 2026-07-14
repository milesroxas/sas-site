import { revalidateTag } from 'next/cache.js'
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, Config, Plugin } from 'payload'
import { AEO_CONTENT_SECTIONS } from './sections'
import { SiteInfo } from './siteInfo'
import type { AeoPluginConfig } from './types'

const revalidateLlms: CollectionAfterChangeHook = ({ doc, previousDoc, req: { context } }) => {
  if (!context.disableRevalidate) {
    const wasOrIsPublished = doc._status === 'published' || previousDoc?._status === 'published'
    if (wasOrIsPublished) revalidateTag('llms-txt', 'max')
  }
  return doc
}

const revalidateLlmsDelete: CollectionAfterDeleteHook = ({ doc, req: { context } }) => {
  if (!context.disableRevalidate) {
    revalidateTag('llms-txt', 'max')
  }
  return doc
}

/**
 * Agentic/answer engine optimization plugin.
 *
 * - Adds the `site-info` global: editable company identity powering JSON-LD
 *   (Organization/WebSite), llms.txt, and default metadata.
 * - Injects cache-revalidation hooks into the public content collections so
 *   /llms.txt and /llms-full.txt stay fresh on publish/unpublish/delete.
 *
 * The documents themselves are served by route handlers in
 * src/app/(frontend)/(ai)/, which call the builders in ./buildLlms.ts.
 */
export const aeoPlugin =
  (pluginConfig: AeoPluginConfig = {}): Plugin =>
  (config: Config): Config => {
    const sections = pluginConfig.content ?? AEO_CONTENT_SECTIONS
    const contentSlugs = new Set<string>(sections.map((section) => section.collection))

    // Always register the global so the database schema stays consistent
    // whether or not the plugin is enabled.
    const withGlobal: Config = {
      ...config,
      globals: [...(config.globals ?? []), SiteInfo],
    }

    if (pluginConfig.disabled) return withGlobal

    return {
      ...withGlobal,
      collections: (withGlobal.collections ?? []).map((collection) => {
        if (!contentSlugs.has(collection.slug)) return collection

        return {
          ...collection,
          hooks: {
            ...collection.hooks,
            afterChange: [...(collection.hooks?.afterChange ?? []), revalidateLlms],
            afterDelete: [...(collection.hooks?.afterDelete ?? []), revalidateLlmsDelete],
          },
        }
      }),
    }
  }

export type { AeoContentSection, AeoPluginConfig } from './types'
