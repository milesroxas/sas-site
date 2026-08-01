import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_work_pages_image_pair_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum_work_pages_image_pair_portrait_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum_work_pages_image_pair_text_position" AS ENUM('under-portrait', 'under-landscape');
  CREATE TYPE "public"."enum_work_pages_image_pair_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___work_pages_v_image_pair_v_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum___work_pages_v_image_pair_v_portrait_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum___work_pages_v_image_pair_v_text_position" AS ENUM('under-portrait', 'under-landscape');
  CREATE TYPE "public"."enum___work_pages_v_image_pair_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TABLE "work_pages_image_pair" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"source" "enum_work_pages_image_pair_source" DEFAULT 'custom',
  	"heading" varchar,
  	"body" jsonb,
  	"portrait_media_id" integer,
  	"landscape_media_id" integer,
  	"browse_all_media" boolean DEFAULT false,
  	"portrait_position" "enum_work_pages_image_pair_portrait_position" DEFAULT 'left',
  	"text_position" "enum_work_pages_image_pair_text_position" DEFAULT 'under-portrait',
  	"theme" "enum_work_pages_image_pair_theme" DEFAULT 'light',
  	"block_name" varchar
  );
  
  CREATE TABLE "__work_pages_v_image_pair_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"source" "enum___work_pages_v_image_pair_v_source" DEFAULT 'custom',
  	"heading" varchar,
  	"body" jsonb,
  	"portrait_media_id" integer,
  	"landscape_media_id" integer,
  	"browse_all_media" boolean DEFAULT false,
  	"portrait_position" "enum___work_pages_v_image_pair_v_portrait_position" DEFAULT 'left',
  	"text_position" "enum___work_pages_v_image_pair_v_text_position" DEFAULT 'under-portrait',
  	"theme" "enum___work_pages_v_image_pair_v_theme" DEFAULT 'light',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "work_pages_image_pair" ADD CONSTRAINT "work_pages_image_pair_portrait_media_id_media_id_fk" FOREIGN KEY ("portrait_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "work_pages_image_pair" ADD CONSTRAINT "work_pages_image_pair_landscape_media_id_media_id_fk" FOREIGN KEY ("landscape_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "work_pages_image_pair" ADD CONSTRAINT "work_pages_image_pair_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."work_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__work_pages_v_image_pair_v" ADD CONSTRAINT "__work_pages_v_image_pair_v_portrait_media_id_media_id_fk" FOREIGN KEY ("portrait_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__work_pages_v_image_pair_v" ADD CONSTRAINT "__work_pages_v_image_pair_v_landscape_media_id_media_id_fk" FOREIGN KEY ("landscape_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__work_pages_v_image_pair_v" ADD CONSTRAINT "__work_pages_v_image_pair_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_work_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "work_pages_image_pair_order_idx" ON "work_pages_image_pair" USING btree ("_order");
  CREATE INDEX "work_pages_image_pair_parent_id_idx" ON "work_pages_image_pair" USING btree ("_parent_id");
  CREATE INDEX "work_pages_image_pair_path_idx" ON "work_pages_image_pair" USING btree ("_path");
  CREATE INDEX "work_pages_image_pair_portrait_media_idx" ON "work_pages_image_pair" USING btree ("portrait_media_id");
  CREATE INDEX "work_pages_image_pair_landscape_media_idx" ON "work_pages_image_pair" USING btree ("landscape_media_id");
  CREATE INDEX "__work_pages_v_image_pair_v_order_idx" ON "__work_pages_v_image_pair_v" USING btree ("_order");
  CREATE INDEX "__work_pages_v_image_pair_v_parent_id_idx" ON "__work_pages_v_image_pair_v" USING btree ("_parent_id");
  CREATE INDEX "__work_pages_v_image_pair_v_path_idx" ON "__work_pages_v_image_pair_v" USING btree ("_path");
  CREATE INDEX "__work_pages_v_image_pair_v_portrait_media_idx" ON "__work_pages_v_image_pair_v" USING btree ("portrait_media_id");
  CREATE INDEX "__work_pages_v_image_pair_v_landscape_media_idx" ON "__work_pages_v_image_pair_v" USING btree ("landscape_media_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "work_pages_image_pair" CASCADE;
  DROP TABLE "__work_pages_v_image_pair_v" CASCADE;
  DROP TYPE "public"."enum_work_pages_image_pair_source";
  DROP TYPE "public"."enum_work_pages_image_pair_portrait_position";
  DROP TYPE "public"."enum_work_pages_image_pair_text_position";
  DROP TYPE "public"."enum_work_pages_image_pair_theme";
  DROP TYPE "public"."enum___work_pages_v_image_pair_v_source";
  DROP TYPE "public"."enum___work_pages_v_image_pair_v_portrait_position";
  DROP TYPE "public"."enum___work_pages_v_image_pair_v_text_position";
  DROP TYPE "public"."enum___work_pages_v_image_pair_v_theme";`)
}
