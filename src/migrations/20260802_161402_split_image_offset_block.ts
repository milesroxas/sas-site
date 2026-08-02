import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_work_pages_split_offset_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum_work_pages_split_offset_caption_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum_work_pages_split_offset_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___work_pages_v_split_offset_v_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum___work_pages_v_split_offset_v_caption_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum___work_pages_v_split_offset_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TABLE "work_pages_split_offset" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"source" "enum_work_pages_split_offset_source" DEFAULT 'custom',
  	"heading" varchar,
  	"body" jsonb,
  	"large_media_id" integer,
  	"small_media_id" integer,
  	"browse_all_media" boolean DEFAULT false,
  	"caption_position" "enum_work_pages_split_offset_caption_position" DEFAULT 'right',
  	"theme" "enum_work_pages_split_offset_theme" DEFAULT 'light',
  	"block_name" varchar
  );
  
  CREATE TABLE "__work_pages_v_split_offset_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"source" "enum___work_pages_v_split_offset_v_source" DEFAULT 'custom',
  	"heading" varchar,
  	"body" jsonb,
  	"large_media_id" integer,
  	"small_media_id" integer,
  	"browse_all_media" boolean DEFAULT false,
  	"caption_position" "enum___work_pages_v_split_offset_v_caption_position" DEFAULT 'right',
  	"theme" "enum___work_pages_v_split_offset_v_theme" DEFAULT 'light',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "work_pages_split_offset" ADD CONSTRAINT "work_pages_split_offset_large_media_id_media_id_fk" FOREIGN KEY ("large_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "work_pages_split_offset" ADD CONSTRAINT "work_pages_split_offset_small_media_id_media_id_fk" FOREIGN KEY ("small_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "work_pages_split_offset" ADD CONSTRAINT "work_pages_split_offset_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."work_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__work_pages_v_split_offset_v" ADD CONSTRAINT "__work_pages_v_split_offset_v_large_media_id_media_id_fk" FOREIGN KEY ("large_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__work_pages_v_split_offset_v" ADD CONSTRAINT "__work_pages_v_split_offset_v_small_media_id_media_id_fk" FOREIGN KEY ("small_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__work_pages_v_split_offset_v" ADD CONSTRAINT "__work_pages_v_split_offset_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_work_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "work_pages_split_offset_order_idx" ON "work_pages_split_offset" USING btree ("_order");
  CREATE INDEX "work_pages_split_offset_parent_id_idx" ON "work_pages_split_offset" USING btree ("_parent_id");
  CREATE INDEX "work_pages_split_offset_path_idx" ON "work_pages_split_offset" USING btree ("_path");
  CREATE INDEX "work_pages_split_offset_large_media_idx" ON "work_pages_split_offset" USING btree ("large_media_id");
  CREATE INDEX "work_pages_split_offset_small_media_idx" ON "work_pages_split_offset" USING btree ("small_media_id");
  CREATE INDEX "__work_pages_v_split_offset_v_order_idx" ON "__work_pages_v_split_offset_v" USING btree ("_order");
  CREATE INDEX "__work_pages_v_split_offset_v_parent_id_idx" ON "__work_pages_v_split_offset_v" USING btree ("_parent_id");
  CREATE INDEX "__work_pages_v_split_offset_v_path_idx" ON "__work_pages_v_split_offset_v" USING btree ("_path");
  CREATE INDEX "__work_pages_v_split_offset_v_large_media_idx" ON "__work_pages_v_split_offset_v" USING btree ("large_media_id");
  CREATE INDEX "__work_pages_v_split_offset_v_small_media_idx" ON "__work_pages_v_split_offset_v" USING btree ("small_media_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "work_pages_split_offset" CASCADE;
  DROP TABLE "__work_pages_v_split_offset_v" CASCADE;
  DROP TYPE "public"."enum_work_pages_split_offset_source";
  DROP TYPE "public"."enum_work_pages_split_offset_caption_position";
  DROP TYPE "public"."enum_work_pages_split_offset_theme";
  DROP TYPE "public"."enum___work_pages_v_split_offset_v_source";
  DROP TYPE "public"."enum___work_pages_v_split_offset_v_caption_position";
  DROP TYPE "public"."enum___work_pages_v_split_offset_v_theme";`)
}
