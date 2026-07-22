import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_image_statement_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum_pages_image_statement_text_position" AS ENUM('right', 'left');
  CREATE TYPE "public"."enum_pages_image_statement_text_size" AS ENUM('default', 'small');
  CREATE TYPE "public"."enum_pages_image_statement_image_width" AS ENUM('contained', 'full');
  CREATE TYPE "public"."enum_pages_split_narrow_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum_pages_split_narrow_image_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum_pages_split_narrow_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___pages_v_image_statement_v_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum___pages_v_image_statement_v_text_position" AS ENUM('right', 'left');
  CREATE TYPE "public"."enum___pages_v_image_statement_v_text_size" AS ENUM('default', 'small');
  CREATE TYPE "public"."enum___pages_v_image_statement_v_image_width" AS ENUM('contained', 'full');
  CREATE TYPE "public"."enum___pages_v_split_narrow_v_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum___pages_v_split_narrow_v_image_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum___pages_v_split_narrow_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_work_pages_split_narrow_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum_work_pages_split_narrow_image_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum_work_pages_split_narrow_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_work_pages_image_statement_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum_work_pages_image_statement_text_position" AS ENUM('right', 'left');
  CREATE TYPE "public"."enum_work_pages_image_statement_text_size" AS ENUM('default', 'small');
  CREATE TYPE "public"."enum_work_pages_image_statement_image_width" AS ENUM('contained', 'full');
  CREATE TYPE "public"."enum___work_pages_v_split_narrow_v_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum___work_pages_v_split_narrow_v_image_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum___work_pages_v_split_narrow_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___work_pages_v_image_statement_v_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum___work_pages_v_image_statement_v_text_position" AS ENUM('right', 'left');
  CREATE TYPE "public"."enum___work_pages_v_image_statement_v_text_size" AS ENUM('default', 'small');
  CREATE TYPE "public"."enum___work_pages_v_image_statement_v_image_width" AS ENUM('contained', 'full');
  CREATE TYPE "public"."enum_expertise_pages_image_statement_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum_expertise_pages_image_statement_text_position" AS ENUM('right', 'left');
  CREATE TYPE "public"."enum_expertise_pages_image_statement_text_size" AS ENUM('default', 'small');
  CREATE TYPE "public"."enum_expertise_pages_image_statement_image_width" AS ENUM('contained', 'full');
  CREATE TYPE "public"."enum___expertise_pages_v_image_statement_v_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum___expertise_pages_v_image_statement_v_text_position" AS ENUM('right', 'left');
  CREATE TYPE "public"."enum___expertise_pages_v_image_statement_v_text_size" AS ENUM('default', 'small');
  CREATE TYPE "public"."enum___expertise_pages_v_image_statement_v_image_width" AS ENUM('contained', 'full');
  CREATE TYPE "public"."enum_audience_pages_image_statement_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum_audience_pages_image_statement_text_position" AS ENUM('right', 'left');
  CREATE TYPE "public"."enum_audience_pages_image_statement_text_size" AS ENUM('default', 'small');
  CREATE TYPE "public"."enum_audience_pages_image_statement_image_width" AS ENUM('contained', 'full');
  CREATE TYPE "public"."enum___audience_pages_v_image_statement_v_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum___audience_pages_v_image_statement_v_text_position" AS ENUM('right', 'left');
  CREATE TYPE "public"."enum___audience_pages_v_image_statement_v_text_size" AS ENUM('default', 'small');
  CREATE TYPE "public"."enum___audience_pages_v_image_statement_v_image_width" AS ENUM('contained', 'full');
  CREATE TABLE "pages_image_statement" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"source" "enum_pages_image_statement_source" DEFAULT 'custom',
  	"caption" jsonb,
  	"text_position" "enum_pages_image_statement_text_position" DEFAULT 'right',
  	"text_size" "enum_pages_image_statement_text_size" DEFAULT 'default',
  	"image_width" "enum_pages_image_statement_image_width" DEFAULT 'contained',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_split_narrow" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"source" "enum_pages_split_narrow_source" DEFAULT 'custom',
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" jsonb,
  	"media_id" integer,
  	"browse_all_media" boolean DEFAULT false,
  	"image_position" "enum_pages_split_narrow_image_position" DEFAULT 'right',
  	"theme" "enum_pages_split_narrow_theme" DEFAULT 'light',
  	"block_name" varchar
  );
  
  CREATE TABLE "__pages_v_image_statement_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"source" "enum___pages_v_image_statement_v_source" DEFAULT 'custom',
  	"caption" jsonb,
  	"text_position" "enum___pages_v_image_statement_v_text_position" DEFAULT 'right',
  	"text_size" "enum___pages_v_image_statement_v_text_size" DEFAULT 'default',
  	"image_width" "enum___pages_v_image_statement_v_image_width" DEFAULT 'contained',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "__pages_v_split_narrow_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"source" "enum___pages_v_split_narrow_v_source" DEFAULT 'custom',
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" jsonb,
  	"media_id" integer,
  	"browse_all_media" boolean DEFAULT false,
  	"image_position" "enum___pages_v_split_narrow_v_image_position" DEFAULT 'right',
  	"theme" "enum___pages_v_split_narrow_v_theme" DEFAULT 'light',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "work_pages_split_narrow" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"source" "enum_work_pages_split_narrow_source" DEFAULT 'custom',
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" jsonb,
  	"media_id" integer,
  	"browse_all_media" boolean DEFAULT false,
  	"image_position" "enum_work_pages_split_narrow_image_position" DEFAULT 'right',
  	"theme" "enum_work_pages_split_narrow_theme" DEFAULT 'light',
  	"block_name" varchar
  );
  
  CREATE TABLE "work_pages_image_statement" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"source" "enum_work_pages_image_statement_source" DEFAULT 'custom',
  	"caption" jsonb,
  	"text_position" "enum_work_pages_image_statement_text_position" DEFAULT 'right',
  	"text_size" "enum_work_pages_image_statement_text_size" DEFAULT 'default',
  	"image_width" "enum_work_pages_image_statement_image_width" DEFAULT 'contained',
  	"block_name" varchar
  );
  
  CREATE TABLE "__work_pages_v_split_narrow_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"source" "enum___work_pages_v_split_narrow_v_source" DEFAULT 'custom',
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" jsonb,
  	"media_id" integer,
  	"browse_all_media" boolean DEFAULT false,
  	"image_position" "enum___work_pages_v_split_narrow_v_image_position" DEFAULT 'right',
  	"theme" "enum___work_pages_v_split_narrow_v_theme" DEFAULT 'light',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "__work_pages_v_image_statement_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"source" "enum___work_pages_v_image_statement_v_source" DEFAULT 'custom',
  	"caption" jsonb,
  	"text_position" "enum___work_pages_v_image_statement_v_text_position" DEFAULT 'right',
  	"text_size" "enum___work_pages_v_image_statement_v_text_size" DEFAULT 'default',
  	"image_width" "enum___work_pages_v_image_statement_v_image_width" DEFAULT 'contained',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "expertise_pages_image_statement" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"source" "enum_expertise_pages_image_statement_source" DEFAULT 'custom',
  	"caption" jsonb,
  	"text_position" "enum_expertise_pages_image_statement_text_position" DEFAULT 'right',
  	"text_size" "enum_expertise_pages_image_statement_text_size" DEFAULT 'default',
  	"image_width" "enum_expertise_pages_image_statement_image_width" DEFAULT 'contained',
  	"block_name" varchar
  );
  
  CREATE TABLE "__expertise_pages_v_image_statement_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"source" "enum___expertise_pages_v_image_statement_v_source" DEFAULT 'custom',
  	"caption" jsonb,
  	"text_position" "enum___expertise_pages_v_image_statement_v_text_position" DEFAULT 'right',
  	"text_size" "enum___expertise_pages_v_image_statement_v_text_size" DEFAULT 'default',
  	"image_width" "enum___expertise_pages_v_image_statement_v_image_width" DEFAULT 'contained',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "audience_pages_image_statement" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"source" "enum_audience_pages_image_statement_source" DEFAULT 'custom',
  	"caption" jsonb,
  	"text_position" "enum_audience_pages_image_statement_text_position" DEFAULT 'right',
  	"text_size" "enum_audience_pages_image_statement_text_size" DEFAULT 'default',
  	"image_width" "enum_audience_pages_image_statement_image_width" DEFAULT 'contained',
  	"block_name" varchar
  );
  
  CREATE TABLE "__audience_pages_v_image_statement_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"source" "enum___audience_pages_v_image_statement_v_source" DEFAULT 'custom',
  	"caption" jsonb,
  	"text_position" "enum___audience_pages_v_image_statement_v_text_position" DEFAULT 'right',
  	"text_size" "enum___audience_pages_v_image_statement_v_text_size" DEFAULT 'default',
  	"image_width" "enum___audience_pages_v_image_statement_v_image_width" DEFAULT 'contained',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  DROP TABLE "image_statement" CASCADE;
  DROP TABLE "split_narrow" CASCADE;
  DROP TABLE "_image_statement_v" CASCADE;
  DROP TABLE "_split_narrow_v" CASCADE;
  ALTER TABLE "pages_image_statement" ADD CONSTRAINT "pages_image_statement_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_image_statement" ADD CONSTRAINT "pages_image_statement_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_split_narrow" ADD CONSTRAINT "pages_split_narrow_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_split_narrow" ADD CONSTRAINT "pages_split_narrow_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__pages_v_image_statement_v" ADD CONSTRAINT "__pages_v_image_statement_v_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__pages_v_image_statement_v" ADD CONSTRAINT "__pages_v_image_statement_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__pages_v_split_narrow_v" ADD CONSTRAINT "__pages_v_split_narrow_v_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__pages_v_split_narrow_v" ADD CONSTRAINT "__pages_v_split_narrow_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "work_pages_split_narrow" ADD CONSTRAINT "work_pages_split_narrow_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "work_pages_split_narrow" ADD CONSTRAINT "work_pages_split_narrow_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."work_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "work_pages_image_statement" ADD CONSTRAINT "work_pages_image_statement_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "work_pages_image_statement" ADD CONSTRAINT "work_pages_image_statement_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."work_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__work_pages_v_split_narrow_v" ADD CONSTRAINT "__work_pages_v_split_narrow_v_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__work_pages_v_split_narrow_v" ADD CONSTRAINT "__work_pages_v_split_narrow_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_work_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__work_pages_v_image_statement_v" ADD CONSTRAINT "__work_pages_v_image_statement_v_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__work_pages_v_image_statement_v" ADD CONSTRAINT "__work_pages_v_image_statement_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_work_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "expertise_pages_image_statement" ADD CONSTRAINT "expertise_pages_image_statement_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "expertise_pages_image_statement" ADD CONSTRAINT "expertise_pages_image_statement_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."expertise_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__expertise_pages_v_image_statement_v" ADD CONSTRAINT "__expertise_pages_v_image_statement_v_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__expertise_pages_v_image_statement_v" ADD CONSTRAINT "__expertise_pages_v_image_statement_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_expertise_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "audience_pages_image_statement" ADD CONSTRAINT "audience_pages_image_statement_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "audience_pages_image_statement" ADD CONSTRAINT "audience_pages_image_statement_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."audience_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__audience_pages_v_image_statement_v" ADD CONSTRAINT "__audience_pages_v_image_statement_v_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__audience_pages_v_image_statement_v" ADD CONSTRAINT "__audience_pages_v_image_statement_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_audience_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_image_statement_order_idx" ON "pages_image_statement" USING btree ("_order");
  CREATE INDEX "pages_image_statement_parent_id_idx" ON "pages_image_statement" USING btree ("_parent_id");
  CREATE INDEX "pages_image_statement_path_idx" ON "pages_image_statement" USING btree ("_path");
  CREATE INDEX "pages_image_statement_media_idx" ON "pages_image_statement" USING btree ("media_id");
  CREATE INDEX "pages_split_narrow_order_idx" ON "pages_split_narrow" USING btree ("_order");
  CREATE INDEX "pages_split_narrow_parent_id_idx" ON "pages_split_narrow" USING btree ("_parent_id");
  CREATE INDEX "pages_split_narrow_path_idx" ON "pages_split_narrow" USING btree ("_path");
  CREATE INDEX "pages_split_narrow_media_idx" ON "pages_split_narrow" USING btree ("media_id");
  CREATE INDEX "__pages_v_image_statement_v_order_idx" ON "__pages_v_image_statement_v" USING btree ("_order");
  CREATE INDEX "__pages_v_image_statement_v_parent_id_idx" ON "__pages_v_image_statement_v" USING btree ("_parent_id");
  CREATE INDEX "__pages_v_image_statement_v_path_idx" ON "__pages_v_image_statement_v" USING btree ("_path");
  CREATE INDEX "__pages_v_image_statement_v_media_idx" ON "__pages_v_image_statement_v" USING btree ("media_id");
  CREATE INDEX "__pages_v_split_narrow_v_order_idx" ON "__pages_v_split_narrow_v" USING btree ("_order");
  CREATE INDEX "__pages_v_split_narrow_v_parent_id_idx" ON "__pages_v_split_narrow_v" USING btree ("_parent_id");
  CREATE INDEX "__pages_v_split_narrow_v_path_idx" ON "__pages_v_split_narrow_v" USING btree ("_path");
  CREATE INDEX "__pages_v_split_narrow_v_media_idx" ON "__pages_v_split_narrow_v" USING btree ("media_id");
  CREATE INDEX "work_pages_split_narrow_order_idx" ON "work_pages_split_narrow" USING btree ("_order");
  CREATE INDEX "work_pages_split_narrow_parent_id_idx" ON "work_pages_split_narrow" USING btree ("_parent_id");
  CREATE INDEX "work_pages_split_narrow_path_idx" ON "work_pages_split_narrow" USING btree ("_path");
  CREATE INDEX "work_pages_split_narrow_media_idx" ON "work_pages_split_narrow" USING btree ("media_id");
  CREATE INDEX "work_pages_image_statement_order_idx" ON "work_pages_image_statement" USING btree ("_order");
  CREATE INDEX "work_pages_image_statement_parent_id_idx" ON "work_pages_image_statement" USING btree ("_parent_id");
  CREATE INDEX "work_pages_image_statement_path_idx" ON "work_pages_image_statement" USING btree ("_path");
  CREATE INDEX "work_pages_image_statement_media_idx" ON "work_pages_image_statement" USING btree ("media_id");
  CREATE INDEX "__work_pages_v_split_narrow_v_order_idx" ON "__work_pages_v_split_narrow_v" USING btree ("_order");
  CREATE INDEX "__work_pages_v_split_narrow_v_parent_id_idx" ON "__work_pages_v_split_narrow_v" USING btree ("_parent_id");
  CREATE INDEX "__work_pages_v_split_narrow_v_path_idx" ON "__work_pages_v_split_narrow_v" USING btree ("_path");
  CREATE INDEX "__work_pages_v_split_narrow_v_media_idx" ON "__work_pages_v_split_narrow_v" USING btree ("media_id");
  CREATE INDEX "__work_pages_v_image_statement_v_order_idx" ON "__work_pages_v_image_statement_v" USING btree ("_order");
  CREATE INDEX "__work_pages_v_image_statement_v_parent_id_idx" ON "__work_pages_v_image_statement_v" USING btree ("_parent_id");
  CREATE INDEX "__work_pages_v_image_statement_v_path_idx" ON "__work_pages_v_image_statement_v" USING btree ("_path");
  CREATE INDEX "__work_pages_v_image_statement_v_media_idx" ON "__work_pages_v_image_statement_v" USING btree ("media_id");
  CREATE INDEX "expertise_pages_image_statement_order_idx" ON "expertise_pages_image_statement" USING btree ("_order");
  CREATE INDEX "expertise_pages_image_statement_parent_id_idx" ON "expertise_pages_image_statement" USING btree ("_parent_id");
  CREATE INDEX "expertise_pages_image_statement_path_idx" ON "expertise_pages_image_statement" USING btree ("_path");
  CREATE INDEX "expertise_pages_image_statement_media_idx" ON "expertise_pages_image_statement" USING btree ("media_id");
  CREATE INDEX "__expertise_pages_v_image_statement_v_order_idx" ON "__expertise_pages_v_image_statement_v" USING btree ("_order");
  CREATE INDEX "__expertise_pages_v_image_statement_v_parent_id_idx" ON "__expertise_pages_v_image_statement_v" USING btree ("_parent_id");
  CREATE INDEX "__expertise_pages_v_image_statement_v_path_idx" ON "__expertise_pages_v_image_statement_v" USING btree ("_path");
  CREATE INDEX "__expertise_pages_v_image_statement_v_media_idx" ON "__expertise_pages_v_image_statement_v" USING btree ("media_id");
  CREATE INDEX "audience_pages_image_statement_order_idx" ON "audience_pages_image_statement" USING btree ("_order");
  CREATE INDEX "audience_pages_image_statement_parent_id_idx" ON "audience_pages_image_statement" USING btree ("_parent_id");
  CREATE INDEX "audience_pages_image_statement_path_idx" ON "audience_pages_image_statement" USING btree ("_path");
  CREATE INDEX "audience_pages_image_statement_media_idx" ON "audience_pages_image_statement" USING btree ("media_id");
  CREATE INDEX "__audience_pages_v_image_statement_v_order_idx" ON "__audience_pages_v_image_statement_v" USING btree ("_order");
  CREATE INDEX "__audience_pages_v_image_statement_v_parent_id_idx" ON "__audience_pages_v_image_statement_v" USING btree ("_parent_id");
  CREATE INDEX "__audience_pages_v_image_statement_v_path_idx" ON "__audience_pages_v_image_statement_v" USING btree ("_path");
  CREATE INDEX "__audience_pages_v_image_statement_v_media_idx" ON "__audience_pages_v_image_statement_v" USING btree ("media_id");
  DROP TYPE "public"."enum_image_statement_source";
  DROP TYPE "public"."enum_image_statement_text_position";
  DROP TYPE "public"."enum_image_statement_text_size";
  DROP TYPE "public"."enum_image_statement_image_width";
  DROP TYPE "public"."enum_split_narrow_source";
  DROP TYPE "public"."enum_split_narrow_image_position";
  DROP TYPE "public"."enum_split_narrow_theme";
  DROP TYPE "public"."enum__image_statement_v_source";
  DROP TYPE "public"."enum__image_statement_v_text_position";
  DROP TYPE "public"."enum__image_statement_v_text_size";
  DROP TYPE "public"."enum__image_statement_v_image_width";
  DROP TYPE "public"."enum__split_narrow_v_source";
  DROP TYPE "public"."enum__split_narrow_v_image_position";
  DROP TYPE "public"."enum__split_narrow_v_theme";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_image_statement_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum_image_statement_text_position" AS ENUM('right', 'left');
  CREATE TYPE "public"."enum_image_statement_text_size" AS ENUM('default', 'small');
  CREATE TYPE "public"."enum_image_statement_image_width" AS ENUM('contained', 'full');
  CREATE TYPE "public"."enum_split_narrow_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum_split_narrow_image_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum_split_narrow_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum__image_statement_v_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum__image_statement_v_text_position" AS ENUM('right', 'left');
  CREATE TYPE "public"."enum__image_statement_v_text_size" AS ENUM('default', 'small');
  CREATE TYPE "public"."enum__image_statement_v_image_width" AS ENUM('contained', 'full');
  CREATE TYPE "public"."enum__split_narrow_v_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum__split_narrow_v_image_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum__split_narrow_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TABLE "image_statement" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"source" "enum_image_statement_source" DEFAULT 'custom',
  	"caption" jsonb,
  	"text_position" "enum_image_statement_text_position" DEFAULT 'right',
  	"text_size" "enum_image_statement_text_size" DEFAULT 'default',
  	"image_width" "enum_image_statement_image_width" DEFAULT 'contained',
  	"block_name" varchar
  );
  
  CREATE TABLE "split_narrow" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"source" "enum_split_narrow_source" DEFAULT 'custom',
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" jsonb,
  	"media_id" integer,
  	"browse_all_media" boolean DEFAULT false,
  	"image_position" "enum_split_narrow_image_position" DEFAULT 'right',
  	"theme" "enum_split_narrow_theme" DEFAULT 'light',
  	"block_name" varchar
  );
  
  CREATE TABLE "_image_statement_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"source" "enum__image_statement_v_source" DEFAULT 'custom',
  	"caption" jsonb,
  	"text_position" "enum__image_statement_v_text_position" DEFAULT 'right',
  	"text_size" "enum__image_statement_v_text_size" DEFAULT 'default',
  	"image_width" "enum__image_statement_v_image_width" DEFAULT 'contained',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_split_narrow_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"source" "enum__split_narrow_v_source" DEFAULT 'custom',
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" jsonb,
  	"media_id" integer,
  	"browse_all_media" boolean DEFAULT false,
  	"image_position" "enum__split_narrow_v_image_position" DEFAULT 'right',
  	"theme" "enum__split_narrow_v_theme" DEFAULT 'light',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  DROP TABLE "pages_image_statement" CASCADE;
  DROP TABLE "pages_split_narrow" CASCADE;
  DROP TABLE "__pages_v_image_statement_v" CASCADE;
  DROP TABLE "__pages_v_split_narrow_v" CASCADE;
  DROP TABLE "work_pages_split_narrow" CASCADE;
  DROP TABLE "work_pages_image_statement" CASCADE;
  DROP TABLE "__work_pages_v_split_narrow_v" CASCADE;
  DROP TABLE "__work_pages_v_image_statement_v" CASCADE;
  DROP TABLE "expertise_pages_image_statement" CASCADE;
  DROP TABLE "__expertise_pages_v_image_statement_v" CASCADE;
  DROP TABLE "audience_pages_image_statement" CASCADE;
  DROP TABLE "__audience_pages_v_image_statement_v" CASCADE;
  ALTER TABLE "image_statement" ADD CONSTRAINT "image_statement_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "image_statement" ADD CONSTRAINT "image_statement_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "split_narrow" ADD CONSTRAINT "split_narrow_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "split_narrow" ADD CONSTRAINT "split_narrow_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_image_statement_v" ADD CONSTRAINT "_image_statement_v_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_image_statement_v" ADD CONSTRAINT "_image_statement_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_split_narrow_v" ADD CONSTRAINT "_split_narrow_v_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_split_narrow_v" ADD CONSTRAINT "_split_narrow_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "image_statement_order_idx" ON "image_statement" USING btree ("_order");
  CREATE INDEX "image_statement_parent_id_idx" ON "image_statement" USING btree ("_parent_id");
  CREATE INDEX "image_statement_path_idx" ON "image_statement" USING btree ("_path");
  CREATE INDEX "image_statement_media_idx" ON "image_statement" USING btree ("media_id");
  CREATE INDEX "split_narrow_order_idx" ON "split_narrow" USING btree ("_order");
  CREATE INDEX "split_narrow_parent_id_idx" ON "split_narrow" USING btree ("_parent_id");
  CREATE INDEX "split_narrow_path_idx" ON "split_narrow" USING btree ("_path");
  CREATE INDEX "split_narrow_media_idx" ON "split_narrow" USING btree ("media_id");
  CREATE INDEX "_image_statement_v_order_idx" ON "_image_statement_v" USING btree ("_order");
  CREATE INDEX "_image_statement_v_parent_id_idx" ON "_image_statement_v" USING btree ("_parent_id");
  CREATE INDEX "_image_statement_v_path_idx" ON "_image_statement_v" USING btree ("_path");
  CREATE INDEX "_image_statement_v_media_idx" ON "_image_statement_v" USING btree ("media_id");
  CREATE INDEX "_split_narrow_v_order_idx" ON "_split_narrow_v" USING btree ("_order");
  CREATE INDEX "_split_narrow_v_parent_id_idx" ON "_split_narrow_v" USING btree ("_parent_id");
  CREATE INDEX "_split_narrow_v_path_idx" ON "_split_narrow_v" USING btree ("_path");
  CREATE INDEX "_split_narrow_v_media_idx" ON "_split_narrow_v" USING btree ("media_id");
  DROP TYPE "public"."enum_pages_image_statement_source";
  DROP TYPE "public"."enum_pages_image_statement_text_position";
  DROP TYPE "public"."enum_pages_image_statement_text_size";
  DROP TYPE "public"."enum_pages_image_statement_image_width";
  DROP TYPE "public"."enum_pages_split_narrow_source";
  DROP TYPE "public"."enum_pages_split_narrow_image_position";
  DROP TYPE "public"."enum_pages_split_narrow_theme";
  DROP TYPE "public"."enum___pages_v_image_statement_v_source";
  DROP TYPE "public"."enum___pages_v_image_statement_v_text_position";
  DROP TYPE "public"."enum___pages_v_image_statement_v_text_size";
  DROP TYPE "public"."enum___pages_v_image_statement_v_image_width";
  DROP TYPE "public"."enum___pages_v_split_narrow_v_source";
  DROP TYPE "public"."enum___pages_v_split_narrow_v_image_position";
  DROP TYPE "public"."enum___pages_v_split_narrow_v_theme";
  DROP TYPE "public"."enum_work_pages_split_narrow_source";
  DROP TYPE "public"."enum_work_pages_split_narrow_image_position";
  DROP TYPE "public"."enum_work_pages_split_narrow_theme";
  DROP TYPE "public"."enum_work_pages_image_statement_source";
  DROP TYPE "public"."enum_work_pages_image_statement_text_position";
  DROP TYPE "public"."enum_work_pages_image_statement_text_size";
  DROP TYPE "public"."enum_work_pages_image_statement_image_width";
  DROP TYPE "public"."enum___work_pages_v_split_narrow_v_source";
  DROP TYPE "public"."enum___work_pages_v_split_narrow_v_image_position";
  DROP TYPE "public"."enum___work_pages_v_split_narrow_v_theme";
  DROP TYPE "public"."enum___work_pages_v_image_statement_v_source";
  DROP TYPE "public"."enum___work_pages_v_image_statement_v_text_position";
  DROP TYPE "public"."enum___work_pages_v_image_statement_v_text_size";
  DROP TYPE "public"."enum___work_pages_v_image_statement_v_image_width";
  DROP TYPE "public"."enum_expertise_pages_image_statement_source";
  DROP TYPE "public"."enum_expertise_pages_image_statement_text_position";
  DROP TYPE "public"."enum_expertise_pages_image_statement_text_size";
  DROP TYPE "public"."enum_expertise_pages_image_statement_image_width";
  DROP TYPE "public"."enum___expertise_pages_v_image_statement_v_source";
  DROP TYPE "public"."enum___expertise_pages_v_image_statement_v_text_position";
  DROP TYPE "public"."enum___expertise_pages_v_image_statement_v_text_size";
  DROP TYPE "public"."enum___expertise_pages_v_image_statement_v_image_width";
  DROP TYPE "public"."enum_audience_pages_image_statement_source";
  DROP TYPE "public"."enum_audience_pages_image_statement_text_position";
  DROP TYPE "public"."enum_audience_pages_image_statement_text_size";
  DROP TYPE "public"."enum_audience_pages_image_statement_image_width";
  DROP TYPE "public"."enum___audience_pages_v_image_statement_v_source";
  DROP TYPE "public"."enum___audience_pages_v_image_statement_v_text_position";
  DROP TYPE "public"."enum___audience_pages_v_image_statement_v_text_size";
  DROP TYPE "public"."enum___audience_pages_v_image_statement_v_image_width";`)
}
