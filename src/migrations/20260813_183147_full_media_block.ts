import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_full_media_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum_pages_full_media_content_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum_pages_full_media_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___pages_v_full_media_v_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum___pages_v_full_media_v_content_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum___pages_v_full_media_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_work_pages_full_media_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum_work_pages_full_media_content_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum_work_pages_full_media_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___work_pages_v_full_media_v_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum___work_pages_v_full_media_v_content_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum___work_pages_v_full_media_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_home_full_media_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum_home_full_media_content_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum_home_full_media_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___home_v_full_media_v_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum___home_v_full_media_v_content_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum___home_v_full_media_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TABLE "pages_full_media" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"source" "enum_pages_full_media_source" DEFAULT 'custom',
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" jsonb,
  	"media_id" integer,
  	"browse_all_media" boolean DEFAULT false,
  	"content_position" "enum_pages_full_media_content_position" DEFAULT 'left',
  	"theme" "enum_pages_full_media_theme" DEFAULT 'light',
  	"block_name" varchar
  );
  
  CREATE TABLE "__pages_v_full_media_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"source" "enum___pages_v_full_media_v_source" DEFAULT 'custom',
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" jsonb,
  	"media_id" integer,
  	"browse_all_media" boolean DEFAULT false,
  	"content_position" "enum___pages_v_full_media_v_content_position" DEFAULT 'left',
  	"theme" "enum___pages_v_full_media_v_theme" DEFAULT 'light',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "work_pages_full_media" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"source" "enum_work_pages_full_media_source" DEFAULT 'custom',
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" jsonb,
  	"media_id" integer,
  	"browse_all_media" boolean DEFAULT false,
  	"content_position" "enum_work_pages_full_media_content_position" DEFAULT 'left',
  	"theme" "enum_work_pages_full_media_theme" DEFAULT 'light',
  	"block_name" varchar
  );
  
  CREATE TABLE "__work_pages_v_full_media_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"source" "enum___work_pages_v_full_media_v_source" DEFAULT 'custom',
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" jsonb,
  	"media_id" integer,
  	"browse_all_media" boolean DEFAULT false,
  	"content_position" "enum___work_pages_v_full_media_v_content_position" DEFAULT 'left',
  	"theme" "enum___work_pages_v_full_media_v_theme" DEFAULT 'light',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "home_full_media" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"source" "enum_home_full_media_source" DEFAULT 'custom',
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" jsonb,
  	"media_id" integer,
  	"browse_all_media" boolean DEFAULT false,
  	"content_position" "enum_home_full_media_content_position" DEFAULT 'left',
  	"theme" "enum_home_full_media_theme" DEFAULT 'light',
  	"block_name" varchar
  );
  
  CREATE TABLE "__home_v_full_media_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"source" "enum___home_v_full_media_v_source" DEFAULT 'custom',
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" jsonb,
  	"media_id" integer,
  	"browse_all_media" boolean DEFAULT false,
  	"content_position" "enum___home_v_full_media_v_content_position" DEFAULT 'left',
  	"theme" "enum___home_v_full_media_v_theme" DEFAULT 'light',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "pages_full_media" ADD CONSTRAINT "pages_full_media_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_full_media" ADD CONSTRAINT "pages_full_media_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__pages_v_full_media_v" ADD CONSTRAINT "__pages_v_full_media_v_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__pages_v_full_media_v" ADD CONSTRAINT "__pages_v_full_media_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "work_pages_full_media" ADD CONSTRAINT "work_pages_full_media_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "work_pages_full_media" ADD CONSTRAINT "work_pages_full_media_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."work_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__work_pages_v_full_media_v" ADD CONSTRAINT "__work_pages_v_full_media_v_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__work_pages_v_full_media_v" ADD CONSTRAINT "__work_pages_v_full_media_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_work_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_full_media" ADD CONSTRAINT "home_full_media_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_full_media" ADD CONSTRAINT "home_full_media_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__home_v_full_media_v" ADD CONSTRAINT "__home_v_full_media_v_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__home_v_full_media_v" ADD CONSTRAINT "__home_v_full_media_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_full_media_order_idx" ON "pages_full_media" USING btree ("_order");
  CREATE INDEX "pages_full_media_parent_id_idx" ON "pages_full_media" USING btree ("_parent_id");
  CREATE INDEX "pages_full_media_path_idx" ON "pages_full_media" USING btree ("_path");
  CREATE INDEX "pages_full_media_media_idx" ON "pages_full_media" USING btree ("media_id");
  CREATE INDEX "__pages_v_full_media_v_order_idx" ON "__pages_v_full_media_v" USING btree ("_order");
  CREATE INDEX "__pages_v_full_media_v_parent_id_idx" ON "__pages_v_full_media_v" USING btree ("_parent_id");
  CREATE INDEX "__pages_v_full_media_v_path_idx" ON "__pages_v_full_media_v" USING btree ("_path");
  CREATE INDEX "__pages_v_full_media_v_media_idx" ON "__pages_v_full_media_v" USING btree ("media_id");
  CREATE INDEX "work_pages_full_media_order_idx" ON "work_pages_full_media" USING btree ("_order");
  CREATE INDEX "work_pages_full_media_parent_id_idx" ON "work_pages_full_media" USING btree ("_parent_id");
  CREATE INDEX "work_pages_full_media_path_idx" ON "work_pages_full_media" USING btree ("_path");
  CREATE INDEX "work_pages_full_media_media_idx" ON "work_pages_full_media" USING btree ("media_id");
  CREATE INDEX "__work_pages_v_full_media_v_order_idx" ON "__work_pages_v_full_media_v" USING btree ("_order");
  CREATE INDEX "__work_pages_v_full_media_v_parent_id_idx" ON "__work_pages_v_full_media_v" USING btree ("_parent_id");
  CREATE INDEX "__work_pages_v_full_media_v_path_idx" ON "__work_pages_v_full_media_v" USING btree ("_path");
  CREATE INDEX "__work_pages_v_full_media_v_media_idx" ON "__work_pages_v_full_media_v" USING btree ("media_id");
  CREATE INDEX "home_full_media_order_idx" ON "home_full_media" USING btree ("_order");
  CREATE INDEX "home_full_media_parent_id_idx" ON "home_full_media" USING btree ("_parent_id");
  CREATE INDEX "home_full_media_path_idx" ON "home_full_media" USING btree ("_path");
  CREATE INDEX "home_full_media_media_idx" ON "home_full_media" USING btree ("media_id");
  CREATE INDEX "__home_v_full_media_v_order_idx" ON "__home_v_full_media_v" USING btree ("_order");
  CREATE INDEX "__home_v_full_media_v_parent_id_idx" ON "__home_v_full_media_v" USING btree ("_parent_id");
  CREATE INDEX "__home_v_full_media_v_path_idx" ON "__home_v_full_media_v" USING btree ("_path");
  CREATE INDEX "__home_v_full_media_v_media_idx" ON "__home_v_full_media_v" USING btree ("media_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_full_media" CASCADE;
  DROP TABLE "__pages_v_full_media_v" CASCADE;
  DROP TABLE "work_pages_full_media" CASCADE;
  DROP TABLE "__work_pages_v_full_media_v" CASCADE;
  DROP TABLE "home_full_media" CASCADE;
  DROP TABLE "__home_v_full_media_v" CASCADE;
  DROP TYPE "public"."enum_pages_full_media_source";
  DROP TYPE "public"."enum_pages_full_media_content_position";
  DROP TYPE "public"."enum_pages_full_media_theme";
  DROP TYPE "public"."enum___pages_v_full_media_v_source";
  DROP TYPE "public"."enum___pages_v_full_media_v_content_position";
  DROP TYPE "public"."enum___pages_v_full_media_v_theme";
  DROP TYPE "public"."enum_work_pages_full_media_source";
  DROP TYPE "public"."enum_work_pages_full_media_content_position";
  DROP TYPE "public"."enum_work_pages_full_media_theme";
  DROP TYPE "public"."enum___work_pages_v_full_media_v_source";
  DROP TYPE "public"."enum___work_pages_v_full_media_v_content_position";
  DROP TYPE "public"."enum___work_pages_v_full_media_v_theme";
  DROP TYPE "public"."enum_home_full_media_source";
  DROP TYPE "public"."enum_home_full_media_content_position";
  DROP TYPE "public"."enum_home_full_media_theme";
  DROP TYPE "public"."enum___home_v_full_media_v_source";
  DROP TYPE "public"."enum___home_v_full_media_v_content_position";
  DROP TYPE "public"."enum___home_v_full_media_v_theme";`)
}
