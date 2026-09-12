import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_ask_questions_status" AS ENUM('new', 'reviewed', 'content_planned', 'ignored');
  CREATE TYPE "public"."enum_ask_questions_outcome" AS ENUM('answered', 'partial', 'no_sources', 'chat_only', 'stopped', 'error');
  CREATE TYPE "public"."enum_ask_questions_rating" AS ENUM('up', 'down');
  CREATE TYPE "public"."enum_ask_questions_rating_reason" AS ENUM('wrong', 'incomplete', 'off_topic');
  CREATE TYPE "public"."enum_ask_questions_handoff" AS ENUM('clicked', 'inquiry_sent');
  CREATE TYPE "public"."enum_ask_questions_handoff_reason" AS ENUM('estimate', 'project', 'person', 'contact_details', 'no_answer');
  CREATE TYPE "public"."enum_ask_questions_retrieval" AS ENUM('embedding', 'keyword', 'none');
  CREATE TABLE "ask_questions_sources" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"url" varchar NOT NULL,
  	"similarity" numeric
  );
  
  CREATE TABLE "ask_questions_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"posts_id" integer,
  	"pages_id" integer
  );
  
  ALTER TABLE "inquiries" ADD COLUMN "ask_conversation" varchar;
  ALTER TABLE "ask_questions" ADD COLUMN "answer" varchar;
  ALTER TABLE "ask_questions" ADD COLUMN "note" varchar;
  ALTER TABLE "ask_questions" ADD COLUMN "status" "enum_ask_questions_status" DEFAULT 'new' NOT NULL;
  ALTER TABLE "ask_questions" ADD COLUMN "topic_id" integer;
  ALTER TABLE "ask_questions" ADD COLUMN "outcome" "enum_ask_questions_outcome";
  ALTER TABLE "ask_questions" ADD COLUMN "rating" "enum_ask_questions_rating";
  ALTER TABLE "ask_questions" ADD COLUMN "rating_reason" "enum_ask_questions_rating_reason";
  ALTER TABLE "ask_questions" ADD COLUMN "handoff" "enum_ask_questions_handoff";
  ALTER TABLE "ask_questions" ADD COLUMN "handoff_reason" "enum_ask_questions_handoff_reason";
  ALTER TABLE "ask_questions" ADD COLUMN "retrieval" "enum_ask_questions_retrieval";
  ALTER TABLE "ask_questions" ADD COLUMN "latency_ms" numeric;
  ALTER TABLE "ask_questions" ADD COLUMN "input_tokens" numeric;
  ALTER TABLE "ask_questions" ADD COLUMN "output_tokens" numeric;
  ALTER TABLE "ask_questions" ADD COLUMN "turn" varchar;
  UPDATE "ask_questions" SET "outcome" = (CASE WHEN "answered" THEN 'answered' ELSE 'no_sources' END)::"public"."enum_ask_questions_outcome";
  ALTER TABLE "ask_questions_sources" ADD CONSTRAINT "ask_questions_sources_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."ask_questions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "ask_questions_rels" ADD CONSTRAINT "ask_questions_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."ask_questions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "ask_questions_rels" ADD CONSTRAINT "ask_questions_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "ask_questions_rels" ADD CONSTRAINT "ask_questions_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "ask_questions_sources_order_idx" ON "ask_questions_sources" USING btree ("_order");
  CREATE INDEX "ask_questions_sources_parent_id_idx" ON "ask_questions_sources" USING btree ("_parent_id");
  CREATE INDEX "ask_questions_rels_order_idx" ON "ask_questions_rels" USING btree ("order");
  CREATE INDEX "ask_questions_rels_parent_idx" ON "ask_questions_rels" USING btree ("parent_id");
  CREATE INDEX "ask_questions_rels_path_idx" ON "ask_questions_rels" USING btree ("path");
  CREATE INDEX "ask_questions_rels_posts_id_idx" ON "ask_questions_rels" USING btree ("posts_id");
  CREATE INDEX "ask_questions_rels_pages_id_idx" ON "ask_questions_rels" USING btree ("pages_id");
  ALTER TABLE "ask_questions" ADD CONSTRAINT "ask_questions_topic_id_categories_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "inquiries_ask_conversation_idx" ON "inquiries" USING btree ("ask_conversation");
  CREATE INDEX "ask_questions_status_idx" ON "ask_questions" USING btree ("status");
  CREATE INDEX "ask_questions_topic_idx" ON "ask_questions" USING btree ("topic_id");
  CREATE INDEX "ask_questions_outcome_idx" ON "ask_questions" USING btree ("outcome");
  CREATE INDEX "ask_questions_rating_idx" ON "ask_questions" USING btree ("rating");
  CREATE INDEX "ask_questions_handoff_idx" ON "ask_questions" USING btree ("handoff");
  CREATE INDEX "ask_questions_turn_idx" ON "ask_questions" USING btree ("turn");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "ask_questions_sources" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "ask_questions_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "ask_questions_sources" CASCADE;
  DROP TABLE "ask_questions_rels" CASCADE;
  ALTER TABLE "ask_questions" DROP CONSTRAINT "ask_questions_topic_id_categories_id_fk";
  
  DROP INDEX "inquiries_ask_conversation_idx";
  DROP INDEX "ask_questions_status_idx";
  DROP INDEX "ask_questions_topic_idx";
  DROP INDEX "ask_questions_outcome_idx";
  DROP INDEX "ask_questions_rating_idx";
  DROP INDEX "ask_questions_handoff_idx";
  DROP INDEX "ask_questions_turn_idx";
  ALTER TABLE "inquiries" DROP COLUMN "ask_conversation";
  ALTER TABLE "ask_questions" DROP COLUMN "answer";
  ALTER TABLE "ask_questions" DROP COLUMN "note";
  ALTER TABLE "ask_questions" DROP COLUMN "status";
  ALTER TABLE "ask_questions" DROP COLUMN "topic_id";
  ALTER TABLE "ask_questions" DROP COLUMN "outcome";
  ALTER TABLE "ask_questions" DROP COLUMN "rating";
  ALTER TABLE "ask_questions" DROP COLUMN "rating_reason";
  ALTER TABLE "ask_questions" DROP COLUMN "handoff";
  ALTER TABLE "ask_questions" DROP COLUMN "handoff_reason";
  ALTER TABLE "ask_questions" DROP COLUMN "retrieval";
  ALTER TABLE "ask_questions" DROP COLUMN "latency_ms";
  ALTER TABLE "ask_questions" DROP COLUMN "input_tokens";
  ALTER TABLE "ask_questions" DROP COLUMN "output_tokens";
  ALTER TABLE "ask_questions" DROP COLUMN "turn";
  DROP TYPE "public"."enum_ask_questions_status";
  DROP TYPE "public"."enum_ask_questions_outcome";
  DROP TYPE "public"."enum_ask_questions_rating";
  DROP TYPE "public"."enum_ask_questions_rating_reason";
  DROP TYPE "public"."enum_ask_questions_handoff";
  DROP TYPE "public"."enum_ask_questions_handoff_reason";
  DROP TYPE "public"."enum_ask_questions_retrieval";`)
}
