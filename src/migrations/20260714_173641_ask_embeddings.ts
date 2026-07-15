import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  // pgvector ships with Neon and the pgvector/pgvector docker image, but the
  // extension still has to be enabled per-database.
  await db.execute(sql`CREATE EXTENSION IF NOT EXISTS vector;`)
  await db.execute(sql`
   CREATE TABLE "ask_embeddings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"collection" varchar NOT NULL,
  	"doc_id" integer NOT NULL,
  	"chunk_index" integer NOT NULL,
  	"title" text NOT NULL,
  	"slug" varchar NOT NULL,
  	"heading_path" text,
  	"text" text NOT NULL,
  	"embedding" vector(1536) NOT NULL,
  	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
  );
  
  CREATE UNIQUE INDEX "ask_embeddings_doc_chunk_idx" ON "ask_embeddings" USING btree ("collection","doc_id","chunk_index");
  CREATE INDEX "ask_embeddings_doc_idx" ON "ask_embeddings" USING btree ("collection","doc_id");
  CREATE INDEX "ask_embeddings_embedding_idx" ON "ask_embeddings" USING hnsw ("embedding" vector_cosine_ops);`)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "ask_embeddings" CASCADE;`)
}
