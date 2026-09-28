import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_blocked_senders_kind" AS ENUM('address', 'domain');
  CREATE TABLE "blocked_senders" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar NOT NULL,
  	"match_key" varchar,
  	"note" varchar,
  	"kind" "enum_blocked_senders_kind",
  	"expires_at" timestamp(3) with time zone,
  	"inquiry_id" integer,
  	"added_by_id" integer,
  	"hits" numeric DEFAULT 0,
  	"last_hit_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "blocked_senders_id" integer;
  ALTER TABLE "blocked_senders" ADD CONSTRAINT "blocked_senders_inquiry_id_inquiries_id_fk" FOREIGN KEY ("inquiry_id") REFERENCES "public"."inquiries"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "blocked_senders" ADD CONSTRAINT "blocked_senders_added_by_id_users_id_fk" FOREIGN KEY ("added_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  CREATE UNIQUE INDEX "blocked_senders_match_key_idx" ON "blocked_senders" USING btree ("match_key");
  CREATE INDEX "blocked_senders_expires_at_idx" ON "blocked_senders" USING btree ("expires_at");
  CREATE INDEX "blocked_senders_inquiry_idx" ON "blocked_senders" USING btree ("inquiry_id");
  CREATE INDEX "blocked_senders_added_by_idx" ON "blocked_senders" USING btree ("added_by_id");
  CREATE INDEX "blocked_senders_updated_at_idx" ON "blocked_senders" USING btree ("updated_at");
  CREATE INDEX "blocked_senders_created_at_idx" ON "blocked_senders" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_blocked_senders_fk" FOREIGN KEY ("blocked_senders_id") REFERENCES "public"."blocked_senders"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_blocked_senders_id_idx" ON "payload_locked_documents_rels" USING btree ("blocked_senders_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "blocked_senders" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "blocked_senders" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_blocked_senders_fk";
  
  DROP INDEX "payload_locked_documents_rels_blocked_senders_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "blocked_senders_id";
  DROP TYPE "public"."enum_blocked_senders_kind";`)
}
