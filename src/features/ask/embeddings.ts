import { sql } from '@payloadcms/db-vercel-postgres'
import { embed, embedMany } from 'ai'
import type { Payload } from 'payload'
import type { MarkdownChunk } from './chunk'
import { askEmbeddingModel } from './model'

/**
 * Storage + query layer for the ask_embeddings table (schema.ts). Rows are
 * derived data — rebuilt wholesale per document by the ask-index plugin hooks
 * and the backfill script, queried by cosine distance in retrieve.ts.
 */

export type NearestChunk = {
  collection: string
  docId: number
  chunkIndex: number
  title: string
  slug: string
  headingPath: string | null
  text: string
  similarity: number
}

type DocRef = {
  collection: string
  docId: number | string
  title: string
  slug: string
}

/** Drizzle instance Payload's postgres adapters expose at runtime. */
const drizzle = (payload: Payload) =>
  (payload.db as unknown as { drizzle: { execute: (q: unknown) => Promise<{ rows: unknown[] }> } })
    .drizzle

const toVectorLiteral = (embedding: number[]): string => `[${embedding.join(',')}]`

export async function embedQuestion(question: string): Promise<number[]> {
  const { embedding } = await embed({ model: askEmbeddingModel, value: question })
  return embedding
}

/**
 * Replaces a document's rows with the given chunks. Chunk text that is
 * already in the table keeps its stored vector, so re-publishing a document
 * whose copy did not change (an SEO tweak, a media swap, a canonical record
 * re-syncing its dependents) costs no embedding tokens, and an edit to one
 * section embeds only that section. Delete + insert beats upsert: chunk
 * counts shrink when docs shrink, and stale tail chunks must not survive.
 */
export async function replaceDocEmbeddings(
  payload: Payload,
  doc: DocRef,
  chunks: MarkdownChunk[],
): Promise<{ embedded: number }> {
  const db = drizzle(payload)

  if (chunks.length === 0) {
    await deleteDocEmbeddings(payload, doc.collection, doc.docId)
    return { embedded: 0 }
  }

  const { rows: existing } = await db.execute(sql`
    SELECT chunk_index, title, slug, heading_path, text, embedding::text AS embedding
    FROM ask_embeddings
    WHERE collection = ${doc.collection} AND doc_id = ${doc.docId}
    ORDER BY chunk_index
  `)
  const stored = existing as {
    chunk_index: number
    title: string
    slug: string
    heading_path: string | null
    text: string
    embedding: string
  }[]

  const headingPath = (chunk: MarkdownChunk): string | null => chunk.headingPath.join(' > ') || null

  // Nothing changed at all: leave the rows (and their updated_at) alone.
  const unchanged =
    stored.length === chunks.length &&
    stored.every(
      (row, i) =>
        row.text === chunks[i].text &&
        row.heading_path === headingPath(chunks[i]) &&
        row.title === doc.title &&
        row.slug === doc.slug,
    )
  if (unchanged) return { embedded: 0 }

  const vectorByText = new Map(stored.map((row) => [row.text, row.embedding]))
  const missing = chunks.filter((chunk) => !vectorByText.has(chunk.text))
  if (missing.length > 0) {
    const { embeddings } = await embedMany({
      model: askEmbeddingModel,
      values: missing.map((chunk) => chunk.text),
    })
    for (const [i, chunk] of missing.entries()) {
      vectorByText.set(chunk.text, toVectorLiteral(embeddings[i]))
    }
  }

  const values = chunks.map(
    (chunk) =>
      sql`(${doc.collection}, ${doc.docId}, ${chunk.index}, ${doc.title}, ${doc.slug},
          ${headingPath(chunk)}, ${chunk.text}, ${vectorByText.get(chunk.text)}::vector)`,
  )

  await db.execute(
    sql`DELETE FROM ask_embeddings WHERE collection = ${doc.collection} AND doc_id = ${doc.docId}`,
  )
  await db.execute(sql`
    INSERT INTO ask_embeddings (collection, doc_id, chunk_index, title, slug, heading_path, text, embedding)
    VALUES ${sql.join(values, sql`, `)}
  `)

  return { embedded: missing.length }
}

export async function deleteDocEmbeddings(
  payload: Payload,
  collection: string,
  docId: number | string,
): Promise<void> {
  await drizzle(payload).execute(
    sql`DELETE FROM ask_embeddings WHERE collection = ${collection} AND doc_id = ${docId}`,
  )
}

export async function queryNearestChunks(
  payload: Payload,
  questionEmbedding: number[],
  { limit, minSimilarity }: { limit: number; minSimilarity: number },
): Promise<NearestChunk[]> {
  const vector = toVectorLiteral(questionEmbedding)
  const { rows } = await drizzle(payload).execute(sql`
    SELECT collection, doc_id, chunk_index, title, slug, heading_path, text,
           1 - (embedding <=> ${vector}::vector) AS similarity
    FROM ask_embeddings
    WHERE 1 - (embedding <=> ${vector}::vector) >= ${minSimilarity}
    ORDER BY embedding <=> ${vector}::vector
    LIMIT ${limit}
  `)

  return (rows as Record<string, unknown>[]).map((row) => ({
    collection: String(row.collection),
    docId: Number(row.doc_id),
    chunkIndex: Number(row.chunk_index),
    title: String(row.title),
    slug: String(row.slug),
    headingPath: row.heading_path === null ? null : String(row.heading_path),
    text: String(row.text),
    similarity: Number(row.similarity),
  }))
}
