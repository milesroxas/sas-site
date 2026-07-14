import {
  index,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  varchar,
  vector,
} from '@payloadcms/db-vercel-postgres/drizzle/pg-core'

/**
 * Embedding index for the Ask RAG feature — one row per content chunk.
 * Registered with Payload's drizzle schema via `beforeSchemaInit` in
 * payload.config.ts so migrations and dev push both know about it; it is not
 * a Payload collection (no admin UI, no access control — rows are derived
 * data, rebuilt from published documents by hooks and the backfill script).
 *
 * Dimensions match text-embedding-3-small (see features/ask/model.ts).
 */
export const EMBEDDING_DIMENSIONS = 1536

export const askEmbeddingsTable = pgTable(
  'ask_embeddings',
  {
    id: serial('id').primaryKey(),
    collection: varchar('collection').notNull(),
    docId: integer('doc_id').notNull(),
    chunkIndex: integer('chunk_index').notNull(),
    title: text('title').notNull(),
    slug: varchar('slug').notNull(),
    /** Heading trail into the doc, ' > '-joined — prompt context for the model. */
    headingPath: text('heading_path'),
    text: text('text').notNull(),
    embedding: vector('embedding', { dimensions: EMBEDDING_DIMENSIONS }).notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('ask_embeddings_doc_chunk_idx').on(table.collection, table.docId, table.chunkIndex),
    index('ask_embeddings_doc_idx').on(table.collection, table.docId),
    index('ask_embeddings_embedding_idx').using('hnsw', table.embedding.op('vector_cosine_ops')),
  ],
)
