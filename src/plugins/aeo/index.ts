import { revalidateTag } from 'next/cache.js'
import { after } from 'next/server'
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, Config, Plugin } from 'payload'
import { getServerSideURL } from '@/utilities/getURL'
import { indexNowEnabled, submitToIndexNow } from './indexNow'
import { AEO_CONTENT_SECTIONS, sectionDocUrl } from './sections'
import { SiteInfo } from './siteInfo'
import type { AeoContentSection, AeoPluginConfig } from './types'

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
 * Runs an IndexNow submission without delaying the editor's publish response
 * when a request scope exists; awaits it otherwise (scripts, jobs).
 */
const submitDeferred = async (run: () => Promise<void>): Promise<void> => {
  try {
    after(run)
  } catch {
    await run()
  }
}

/**
 * Ping IndexNow on the publish events that change what engines should fetch:
 * publish, unpublish, and slug change (old URL submitted so engines drop it).
 * Draft saves and autosaves never reach the submit call.
 */
const indexNowAfterChange =
  (section: AeoContentSection): CollectionAfterChangeHook =>
  async ({ doc, previousDoc, req: { payload, context } }) => {
    if (context.disableRevalidate || !indexNowEnabled()) return doc

    const siteUrl = getServerSideURL()
    const urls: string[] = []

    if (doc._status === 'published' && doc.slug) {
      urls.push(sectionDocUrl(section, doc.slug, siteUrl))
    }

    const unpublishedOrMoved =
      previousDoc?._status === 'published' &&
      previousDoc.slug &&
      (doc._status !== 'published' || previousDoc.slug !== doc.slug)
    if (unpublishedOrMoved) {
      urls.push(sectionDocUrl(section, previousDoc.slug, siteUrl))
    }

    if (urls.length) await submitDeferred(() => submitToIndexNow(payload, urls))
    return doc
  }

const indexNowAfterDelete =
  (section: AeoContentSection): CollectionAfterDeleteHook =>
  async ({ doc, req: { payload, context } }) => {
    if (context.disableRevalidate || !indexNowEnabled() || !doc?.slug) return doc

    const url = sectionDocUrl(section, doc.slug, getServerSideURL())
    await submitDeferred(() => submitToIndexNow(payload, [url]))
    return doc
  }

/**
 * Agentic/answer engine optimization plugin.
 *
 * - Adds the `site-info` global: editable company identity powering JSON-LD
 *   (Organization/WebSite), llms.txt, and default metadata.
 * - Injects cache-revalidation hooks into the public content collections so
 *   /llms.txt and /llms-full.txt stay fresh on publish/unpublish/delete.
 * - Pings IndexNow (Bing/Copilot, Yandex, Naver, …) on publish events in
 *   production, so index-gated AI engines see changes fast. Requires
 *   INDEXNOW_KEY; the key is served at /indexnow.txt.
 *
 * The documents themselves are served by route handlers in
 * src/app/(frontend)/(ai)/, which call the builders in ./buildLlms.ts.
 */
export const aeoPlugin =
  (pluginConfig: AeoPluginConfig = {}): Plugin =>
  (config: Config): Config => {
    const sections = pluginConfig.content ?? AEO_CONTENT_SECTIONS
    const sectionBySlug = new Map<string, AeoContentSection>(
      sections.map((section) => [section.collection, section]),
    )

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
        const section = sectionBySlug.get(collection.slug)
        if (!section) return collection

        return {
          ...collection,
          hooks: {
            ...collection.hooks,
            afterChange: [
              ...(collection.hooks?.afterChange ?? []),
              revalidateLlms,
              indexNowAfterChange(section),
            ],
            afterDelete: [
              ...(collection.hooks?.afterDelete ?? []),
              revalidateLlmsDelete,
              indexNowAfterDelete(section),
            ],
          },
        }
      }),
    }
  }

export type { AeoContentSection, AeoPluginConfig } from './types'
