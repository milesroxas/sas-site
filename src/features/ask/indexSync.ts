import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  CollectionSlug,
  GlobalAfterChangeHook,
  Payload,
} from 'payload'
import {
  extractDocMarkdown,
  extractGlobalMarkdown,
  readPublicDoc,
  readPublicGlobal,
} from '@/shared/content/extract'
import type { ContentSurface, GlobalSurface } from '@/shared/content/surfaces'
import { chunkMarkdown } from './chunk'
import { deleteDocEmbeddings, replaceDocEmbeddings } from './embeddings'
import { ASK_MODEL_API_KEY_VAR } from './model'

/**
 * Keeps ask_embeddings in step with published content. Attached to every
 * content surface (and their canonical Content Hub sources) and to the global
 * surfaces by the ask-index plugin. Sync failures are logged, never thrown —
 * a broken embedding pipeline must not block publishing; the backfill script
 * repairs drift.
 */

type SurfaceDoc = {
  id: number | string
  title?: string | null
  slug?: string | null
  _status?: string | null
}

let warnedMissingKey = false

function embeddingsConfigured(payload: Payload): boolean {
  if (process.env[ASK_MODEL_API_KEY_VAR]) return true
  if (!warnedMissingKey) {
    warnedMissingKey = true
    payload.logger.warn(
      `Ask index: ${ASK_MODEL_API_KEY_VAR} is not set — content will not be embedded until the backfill script runs with it.`,
    )
  }
  return false
}

/**
 * Re-read as the public → extract → chunk → embed → replace rows for one
 * surface doc. The hook's `doc` is the editor's view (every field, any
 * depth); the corpus must hold the anonymous visitor's view, so the document
 * is read again with access rules applied. A doc that is not public (or no
 * longer is) has its rows removed.
 */
export async function syncSurfaceDoc(
  payload: Payload,
  surface: ContentSurface,
  ref: Pick<SurfaceDoc, 'id'>,
): Promise<void> {
  const doc = (await readPublicDoc(payload, surface.collection, ref.id)) as SurfaceDoc | null
  if (doc?._status !== 'published' || !doc.slug || !doc.title) {
    await deleteDocEmbeddings(payload, surface.collection, ref.id)
    return
  }

  const markdown = await extractDocMarkdown(payload, surface, doc)
  const chunks = chunkMarkdown(markdown)
  const result = await replaceDocEmbeddings(
    payload,
    { collection: surface.collection, docId: doc.id, title: doc.title, slug: doc.slug },
    chunks,
  )
  payload.logger.info({
    msg: 'ask index synced',
    collection: surface.collection,
    id: doc.id,
    chunks: chunks.length,
    embedded: result.embedded,
  })
}

/** Same pipeline for a global surface; a never-published drafts global has no rows. */
export async function syncGlobal(payload: Payload, surface: GlobalSurface): Promise<void> {
  const doc = await readPublicGlobal(payload, surface)
  const docId = typeof doc?.id === 'number' ? doc.id : 1
  if (!doc) {
    await deleteDocEmbeddings(payload, surface.global, docId)
    return
  }

  const markdown = await extractGlobalMarkdown(payload, surface, doc)
  const chunks = chunkMarkdown(markdown)
  const title = typeof doc.title === 'string' && doc.title.trim() ? doc.title : surface.title
  const result = await replaceDocEmbeddings(
    payload,
    { collection: surface.global, docId, title, slug: surface.global },
    chunks,
  )
  payload.logger.info({
    msg: 'ask index synced',
    global: surface.global,
    chunks: chunks.length,
    embedded: result.embedded,
  })
}

export const askIndexAfterChange =
  (surface: ContentSurface): CollectionAfterChangeHook =>
  async ({ doc, previousDoc, req: { payload } }) => {
    try {
      if (!embeddingsConfigured(payload)) return doc

      if (doc._status === 'published') {
        await syncSurfaceDoc(payload, surface, doc)
        return doc
      }

      // Draft save or unpublish. Draft saves never change published output
      // (the live version's rows are already indexed), and autosave fires
      // every 100ms — so never re-embed here. A doc that was never published
      // has nothing in the index either; skip without touching the DB.
      if (previousDoc?._status !== 'published') return doc

      // Only a true unpublish (no published version left) deletes; a draft
      // on top of a still-published doc must NOT remove the live version.
      // syncSurfaceDoc re-reads the public version and removes rows when
      // there is none.
      await syncSurfaceDoc(payload, surface, doc)
    } catch (err) {
      payload.logger.error({
        msg: 'ask index sync failed',
        collection: surface.collection,
        id: doc?.id,
        err,
      })
    }
    return doc
  }

export const askIndexAfterDelete =
  (surface: ContentSurface): CollectionAfterDeleteHook =>
  async ({ doc, req: { payload } }) => {
    try {
      await deleteDocEmbeddings(payload, surface.collection, doc.id)
    } catch (err) {
      payload.logger.error({
        msg: 'ask index delete failed',
        collection: surface.collection,
        id: doc?.id,
        err,
      })
    }
    return doc
  }

/**
 * Globals publish in place: re-embed on publish (drafts globals) or on any
 * save (site-info has no drafts). Draft saves of a drafts global change
 * nothing public and autosave fires constantly, so they are skipped.
 */
export const askIndexGlobalAfterChange =
  (surface: GlobalSurface): GlobalAfterChangeHook =>
  async ({ doc, req: { payload } }) => {
    try {
      if (!embeddingsConfigured(payload)) return doc
      if (surface.drafts && doc._status !== 'published') return doc
      await syncGlobal(payload, surface)
    } catch (err) {
      payload.logger.error({ msg: 'ask index global sync failed', global: surface.global, err })
    }
    return doc
  }

/**
 * Canonical Content Hub records (case-studies, lab-projects) carry the
 * narrative their website pages render — publishing one must re-embed every
 * published page that points at it.
 */
export const askIndexCanonicalAfterChange =
  (
    surface: ContentSurface,
    canonicalField: { name: string; collection: CollectionSlug },
  ): CollectionAfterChangeHook =>
  async ({ doc, previousDoc, req: { payload } }) => {
    try {
      if (!embeddingsConfigured(payload)) return doc

      // Dependent pages extract the canonical with draft: false, so draft
      // edits here change nothing until publish — and autosave fires every
      // 100ms. Re-embed dependents only on publish, or on a true unpublish
      // (the published narrative their index rows include just went away).
      if (doc._status !== 'published') {
        if (previousDoc?._status !== 'published') return doc
        const published = (await payload.findByID({
          collection: canonicalField.collection,
          id: doc.id,
          depth: 0,
          draft: false,
          disableErrors: true,
        })) as SurfaceDoc | null
        if (published?._status === 'published') return doc
      }

      const { docs } = await payload.find({
        collection: surface.collection as CollectionSlug,
        depth: 0,
        limit: 100,
        pagination: false,
        where: {
          [canonicalField.name]: { equals: doc.id },
          _status: { equals: 'published' },
        },
      })

      for (const dependent of docs as unknown as SurfaceDoc[]) {
        await syncSurfaceDoc(payload, surface, dependent)
      }
    } catch (err) {
      payload.logger.error({
        msg: 'ask index canonical sync failed',
        collection: surface.collection,
        canonicalId: doc?.id,
        err,
      })
    }
    return doc
  }
