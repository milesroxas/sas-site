import type { Payload } from 'payload'
import { CONTENT_SURFACES, GLOBAL_SURFACES } from '@/shared/content/surfaces'
import { syncGlobal, syncSurfaceDoc } from './indexSync'

/**
 * One full pass over the corpus: every published document on every content
 * surface, then every global surface. Shared by the CLI script and the
 * team-only reindex endpoint behind the Site Info › Ask panel. Per-document
 * failures are collected, not thrown, so one bad document cannot leave the
 * rest of the index stale.
 */

export type BackfillSummary = {
  /** Documents (and globals) that are public and now have rows. */
  documents: number
  /** Rows written across those documents. */
  chunks: number
  /** Chunks that needed a fresh embedding (the rest reused stored vectors). */
  embedded: number
  /** Documents whose sync threw, as `collection:id` labels. */
  failures: string[]
  durationMs: number
}

let running: Promise<BackfillSummary> | null = null

/** True while a pass is in flight on this instance. */
export const isBackfillRunning = (): boolean => running !== null

export async function backfillAskIndex(payload: Payload): Promise<BackfillSummary> {
  if (running) return running
  running = run(payload).finally(() => {
    running = null
  })
  return running
}

async function run(payload: Payload): Promise<BackfillSummary> {
  const startedAt = Date.now()
  const summary: BackfillSummary = {
    documents: 0,
    chunks: 0,
    embedded: 0,
    failures: [],
    durationMs: 0,
  }

  const record = (label: string, result: { chunks: number; embedded: number } | null) => {
    if (!result) return
    summary.documents += 1
    summary.chunks += result.chunks
    summary.embedded += result.embedded
    payload.logger.debug({ msg: 'ask backfill: synced', label, ...result })
  }

  for (const surface of CONTENT_SURFACES) {
    const { docs } = await payload.find({
      collection: surface.collection,
      depth: 0,
      draft: false,
      limit: 500,
      pagination: false,
      where: { _status: { equals: 'published' } },
    })

    for (const doc of docs) {
      const label = `${surface.collection}:${doc.id}`
      try {
        record(label, await syncSurfaceDoc(payload, surface, doc))
      } catch (err) {
        summary.failures.push(label)
        payload.logger.error({ msg: 'ask backfill: document failed', label, err })
      }
    }
    payload.logger.info({
      msg: 'ask backfill: surface done',
      surface: surface.collection,
      docs: docs.length,
    })
  }

  for (const surface of GLOBAL_SURFACES) {
    try {
      record(surface.global, await syncGlobal(payload, surface))
    } catch (err) {
      summary.failures.push(surface.global)
      payload.logger.error({ msg: 'ask backfill: global failed', global: surface.global, err })
    }
  }

  summary.durationMs = Date.now() - startedAt
  payload.logger.info({ msg: 'ask backfill complete', ...summary })
  return summary
}
