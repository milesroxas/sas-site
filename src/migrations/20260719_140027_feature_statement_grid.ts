import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "pages_blocks_feature_statement_grid_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"title" varchar,
  	"description" varchar
  );
  
  CREATE TABLE "pages_blocks_feature_statement_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"statement" varchar,
  	"footnote" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_feature_statement_grid_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"title" varchar,
  	"description" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_feature_statement_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"statement" varchar,
  	"footnote" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "payload_mcp_api_keys" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"user_id" integer NOT NULL,
  	"label" varchar,
  	"description" varchar,
  	"pages_find" boolean DEFAULT false,
  	"expertise_pages_find" boolean DEFAULT false,
  	"audience_pages_find" boolean DEFAULT false,
  	"work_pages_find" boolean DEFAULT false,
  	"lab_pages_find" boolean DEFAULT false,
  	"posts_find" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"enable_a_p_i_key" boolean,
  	"api_key" varchar,
  	"api_key_index" varchar
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "payload_mcp_api_keys_id" integer;
  ALTER TABLE "payload_preferences_rels" ADD COLUMN "payload_mcp_api_keys_id" integer;
  ALTER TABLE "pages_blocks_feature_statement_grid_cards" ADD CONSTRAINT "pages_blocks_feature_statement_grid_cards_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_feature_statement_grid_cards" ADD CONSTRAINT "pages_blocks_feature_statement_grid_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_feature_statement_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_feature_statement_grid" ADD CONSTRAINT "pages_blocks_feature_statement_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_feature_statement_grid_cards" ADD CONSTRAINT "_pages_v_blocks_feature_statement_grid_cards_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_feature_statement_grid_cards" ADD CONSTRAINT "_pages_v_blocks_feature_statement_grid_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_feature_statement_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_feature_statement_grid" ADD CONSTRAINT "_pages_v_blocks_feature_statement_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_mcp_api_keys" ADD CONSTRAINT "payload_mcp_api_keys_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "pages_blocks_feature_statement_grid_cards_order_idx" ON "pages_blocks_feature_statement_grid_cards" USING btree ("_order");
  CREATE INDEX "pages_blocks_feature_statement_grid_cards_parent_id_idx" ON "pages_blocks_feature_statement_grid_cards" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_feature_statement_grid_cards_media_idx" ON "pages_blocks_feature_statement_grid_cards" USING btree ("media_id");
  CREATE INDEX "pages_blocks_feature_statement_grid_order_idx" ON "pages_blocks_feature_statement_grid" USING btree ("_order");
  CREATE INDEX "pages_blocks_feature_statement_grid_parent_id_idx" ON "pages_blocks_feature_statement_grid" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_feature_statement_grid_path_idx" ON "pages_blocks_feature_statement_grid" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_feature_statement_grid_cards_order_idx" ON "_pages_v_blocks_feature_statement_grid_cards" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_feature_statement_grid_cards_parent_id_idx" ON "_pages_v_blocks_feature_statement_grid_cards" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_feature_statement_grid_cards_media_idx" ON "_pages_v_blocks_feature_statement_grid_cards" USING btree ("media_id");
  CREATE INDEX "_pages_v_blocks_feature_statement_grid_order_idx" ON "_pages_v_blocks_feature_statement_grid" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_feature_statement_grid_parent_id_idx" ON "_pages_v_blocks_feature_statement_grid" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_feature_statement_grid_path_idx" ON "_pages_v_blocks_feature_statement_grid" USING btree ("_path");
  CREATE INDEX "payload_mcp_api_keys_user_idx" ON "payload_mcp_api_keys" USING btree ("user_id");
  CREATE INDEX "payload_mcp_api_keys_updated_at_idx" ON "payload_mcp_api_keys" USING btree ("updated_at");
  CREATE INDEX "payload_mcp_api_keys_created_at_idx" ON "payload_mcp_api_keys" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_payload_mcp_api_keys_fk" FOREIGN KEY ("payload_mcp_api_keys_id") REFERENCES "public"."payload_mcp_api_keys"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_payload_mcp_api_keys_fk" FOREIGN KEY ("payload_mcp_api_keys_id") REFERENCES "public"."payload_mcp_api_keys"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_payload_mcp_api_keys_id_idx" ON "payload_locked_documents_rels" USING btree ("payload_mcp_api_keys_id");
  CREATE INDEX "payload_preferences_rels_payload_mcp_api_keys_id_idx" ON "payload_preferences_rels" USING btree ("payload_mcp_api_keys_id");`)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_feature_statement_grid_cards" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_feature_statement_grid" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_feature_statement_grid_cards" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_feature_statement_grid" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload_mcp_api_keys" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "pages_blocks_feature_statement_grid_cards" CASCADE;
  DROP TABLE "pages_blocks_feature_statement_grid" CASCADE;
  DROP TABLE "_pages_v_blocks_feature_statement_grid_cards" CASCADE;
  DROP TABLE "_pages_v_blocks_feature_statement_grid" CASCADE;
  DROP TABLE "payload_mcp_api_keys" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_payload_mcp_api_keys_fk";
  
  ALTER TABLE "payload_preferences_rels" DROP CONSTRAINT "payload_preferences_rels_payload_mcp_api_keys_fk";
  
  DROP INDEX "payload_locked_documents_rels_payload_mcp_api_keys_id_idx";
  DROP INDEX "payload_preferences_rels_payload_mcp_api_keys_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "payload_mcp_api_keys_id";
  ALTER TABLE "payload_preferences_rels" DROP COLUMN "payload_mcp_api_keys_id";`)
}
