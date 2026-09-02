import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_feature_heading_offset_body_size" AS ENUM('small', 'medium', 'large');
  CREATE TYPE "public"."enum_pages_media_split_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum_pages_media_split_layout" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum_pages_media_split_aspect_ratio" AS ENUM('16-9', '3-2', '21-9');
  CREATE TYPE "public"."enum_pages_media_split_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_pages_section_theme" AS ENUM('inherit', 'secondary', 'accent', 'inverted');
  CREATE TYPE "public"."enum_pages_section_spacing" AS ENUM('default', 'tight', 'loose', 'none');
  CREATE TYPE "public"."enum__pages_v_blocks_feature_heading_offset_body_size" AS ENUM('small', 'medium', 'large');
  CREATE TYPE "public"."enum___pages_v_media_split_v_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum___pages_v_media_split_v_layout" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum___pages_v_media_split_v_aspect_ratio" AS ENUM('16-9', '3-2', '21-9');
  CREATE TYPE "public"."enum___pages_v_media_split_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___pages_v_section_v_theme" AS ENUM('inherit', 'secondary', 'accent', 'inverted');
  CREATE TYPE "public"."enum___pages_v_section_v_spacing" AS ENUM('default', 'tight', 'loose', 'none');
  CREATE TYPE "public"."enum_work_pages_blocks_feature_heading_offset_body_size" AS ENUM('small', 'medium', 'large');
  CREATE TYPE "public"."enum_work_pages_media_split_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum_work_pages_media_split_story_scope" AS ENUM('overview', 'section', 'beat');
  CREATE TYPE "public"."enum_work_pages_media_split_layout" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum_work_pages_media_split_aspect_ratio" AS ENUM('16-9', '3-2', '21-9');
  CREATE TYPE "public"."enum_work_pages_media_split_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_work_pages_section_theme" AS ENUM('inherit', 'secondary', 'accent', 'inverted');
  CREATE TYPE "public"."enum_work_pages_section_spacing" AS ENUM('default', 'tight', 'loose', 'none');
  CREATE TYPE "public"."enum__work_pages_v_blocks_feature_heading_offset_body_size" AS ENUM('small', 'medium', 'large');
  CREATE TYPE "public"."enum___work_pages_v_media_split_v_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum___work_pages_v_media_split_v_story_scope" AS ENUM('overview', 'section', 'beat');
  CREATE TYPE "public"."enum___work_pages_v_media_split_v_layout" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum___work_pages_v_media_split_v_aspect_ratio" AS ENUM('16-9', '3-2', '21-9');
  CREATE TYPE "public"."enum___work_pages_v_media_split_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___work_pages_v_section_v_theme" AS ENUM('inherit', 'secondary', 'accent', 'inverted');
  CREATE TYPE "public"."enum___work_pages_v_section_v_spacing" AS ENUM('default', 'tight', 'loose', 'none');
  CREATE TYPE "public"."enum_lab_pages_section_theme" AS ENUM('inherit', 'secondary', 'accent', 'inverted');
  CREATE TYPE "public"."enum_lab_pages_section_spacing" AS ENUM('default', 'tight', 'loose', 'none');
  CREATE TYPE "public"."enum___lab_pages_v_section_v_theme" AS ENUM('inherit', 'secondary', 'accent', 'inverted');
  CREATE TYPE "public"."enum___lab_pages_v_section_v_spacing" AS ENUM('default', 'tight', 'loose', 'none');
  CREATE TYPE "public"."enum_expertise_pages_blocks_feature_heading_offset_body_size" AS ENUM('small', 'medium', 'large');
  CREATE TYPE "public"."enum_expertise_pages_section_theme" AS ENUM('inherit', 'secondary', 'accent', 'inverted');
  CREATE TYPE "public"."enum_expertise_pages_section_spacing" AS ENUM('default', 'tight', 'loose', 'none');
  CREATE TYPE "public"."enum__expertise_pages_v_blocks_feature_heading_offset_body_size" AS ENUM('small', 'medium', 'large');
  CREATE TYPE "public"."enum___expertise_pages_v_section_v_theme" AS ENUM('inherit', 'secondary', 'accent', 'inverted');
  CREATE TYPE "public"."enum___expertise_pages_v_section_v_spacing" AS ENUM('default', 'tight', 'loose', 'none');
  CREATE TYPE "public"."enum_audience_pages_blocks_feature_heading_offset_body_size" AS ENUM('small', 'medium', 'large');
  CREATE TYPE "public"."enum_audience_pages_section_theme" AS ENUM('inherit', 'secondary', 'accent', 'inverted');
  CREATE TYPE "public"."enum_audience_pages_section_spacing" AS ENUM('default', 'tight', 'loose', 'none');
  CREATE TYPE "public"."enum__audience_pages_v_blocks_feature_heading_offset_body_size" AS ENUM('small', 'medium', 'large');
  CREATE TYPE "public"."enum___audience_pages_v_section_v_theme" AS ENUM('inherit', 'secondary', 'accent', 'inverted');
  CREATE TYPE "public"."enum___audience_pages_v_section_v_spacing" AS ENUM('default', 'tight', 'loose', 'none');
  CREATE TYPE "public"."enum_home_blocks_feature_heading_offset_body_size" AS ENUM('small', 'medium', 'large');
  CREATE TYPE "public"."enum_home_media_split_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum_home_media_split_layout" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum_home_media_split_aspect_ratio" AS ENUM('16-9', '3-2', '21-9');
  CREATE TYPE "public"."enum_home_media_split_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum__home_v_blocks_feature_heading_offset_body_size" AS ENUM('small', 'medium', 'large');
  CREATE TYPE "public"."enum___home_v_media_split_v_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum___home_v_media_split_v_layout" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum___home_v_media_split_v_aspect_ratio" AS ENUM('16-9', '3-2', '21-9');
  CREATE TYPE "public"."enum___home_v_media_split_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TABLE "pages_media_split" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"source" "enum_pages_media_split_source" DEFAULT 'custom',
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" jsonb,
  	"media_id" integer,
  	"browse_all_media" boolean DEFAULT false,
  	"layout" "enum_pages_media_split_layout" DEFAULT 'left',
  	"aspect_ratio" "enum_pages_media_split_aspect_ratio" DEFAULT '16-9',
  	"theme" "enum_pages_media_split_theme" DEFAULT 'light',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_section" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"customize" boolean DEFAULT false,
  	"theme" "enum_pages_section_theme" DEFAULT 'inherit',
  	"spacing" "enum_pages_section_spacing" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "__pages_v_media_split_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"source" "enum___pages_v_media_split_v_source" DEFAULT 'custom',
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" jsonb,
  	"media_id" integer,
  	"browse_all_media" boolean DEFAULT false,
  	"layout" "enum___pages_v_media_split_v_layout" DEFAULT 'left',
  	"aspect_ratio" "enum___pages_v_media_split_v_aspect_ratio" DEFAULT '16-9',
  	"theme" "enum___pages_v_media_split_v_theme" DEFAULT 'light',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "__pages_v_section_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"customize" boolean DEFAULT false,
  	"theme" "enum___pages_v_section_v_theme" DEFAULT 'inherit',
  	"spacing" "enum___pages_v_section_v_spacing" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "work_pages_media_split" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"source" "enum_work_pages_media_split_source" DEFAULT 'custom',
  	"story_scope" "enum_work_pages_media_split_story_scope" DEFAULT 'overview',
  	"story_beat_key" varchar,
  	"show_overrides" boolean DEFAULT false,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" jsonb,
  	"media_id" integer,
  	"browse_all_media" boolean DEFAULT false,
  	"layout" "enum_work_pages_media_split_layout" DEFAULT 'left',
  	"aspect_ratio" "enum_work_pages_media_split_aspect_ratio" DEFAULT '16-9',
  	"theme" "enum_work_pages_media_split_theme" DEFAULT 'light',
  	"block_name" varchar
  );
  
  CREATE TABLE "work_pages_section" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"customize" boolean DEFAULT false,
  	"theme" "enum_work_pages_section_theme" DEFAULT 'inherit',
  	"spacing" "enum_work_pages_section_spacing" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "__work_pages_v_media_split_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"source" "enum___work_pages_v_media_split_v_source" DEFAULT 'custom',
  	"story_scope" "enum___work_pages_v_media_split_v_story_scope" DEFAULT 'overview',
  	"story_beat_key" varchar,
  	"show_overrides" boolean DEFAULT false,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" jsonb,
  	"media_id" integer,
  	"browse_all_media" boolean DEFAULT false,
  	"layout" "enum___work_pages_v_media_split_v_layout" DEFAULT 'left',
  	"aspect_ratio" "enum___work_pages_v_media_split_v_aspect_ratio" DEFAULT '16-9',
  	"theme" "enum___work_pages_v_media_split_v_theme" DEFAULT 'light',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "__work_pages_v_section_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"customize" boolean DEFAULT false,
  	"theme" "enum___work_pages_v_section_v_theme" DEFAULT 'inherit',
  	"spacing" "enum___work_pages_v_section_v_spacing" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "lab_pages_section" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"customize" boolean DEFAULT false,
  	"theme" "enum_lab_pages_section_theme" DEFAULT 'inherit',
  	"spacing" "enum_lab_pages_section_spacing" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "__lab_pages_v_section_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"customize" boolean DEFAULT false,
  	"theme" "enum___lab_pages_v_section_v_theme" DEFAULT 'inherit',
  	"spacing" "enum___lab_pages_v_section_v_spacing" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "expertise_pages_section" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"customize" boolean DEFAULT false,
  	"theme" "enum_expertise_pages_section_theme" DEFAULT 'inherit',
  	"spacing" "enum_expertise_pages_section_spacing" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "__expertise_pages_v_section_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"customize" boolean DEFAULT false,
  	"theme" "enum___expertise_pages_v_section_v_theme" DEFAULT 'inherit',
  	"spacing" "enum___expertise_pages_v_section_v_spacing" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "audience_pages_section" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"customize" boolean DEFAULT false,
  	"theme" "enum_audience_pages_section_theme" DEFAULT 'inherit',
  	"spacing" "enum_audience_pages_section_spacing" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "__audience_pages_v_section_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"customize" boolean DEFAULT false,
  	"theme" "enum___audience_pages_v_section_v_theme" DEFAULT 'inherit',
  	"spacing" "enum___audience_pages_v_section_v_spacing" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "home_media_split" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"source" "enum_home_media_split_source" DEFAULT 'custom',
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" jsonb,
  	"media_id" integer,
  	"browse_all_media" boolean DEFAULT false,
  	"layout" "enum_home_media_split_layout" DEFAULT 'left',
  	"aspect_ratio" "enum_home_media_split_aspect_ratio" DEFAULT '16-9',
  	"theme" "enum_home_media_split_theme" DEFAULT 'light',
  	"block_name" varchar
  );
  
  CREATE TABLE "__home_v_media_split_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"source" "enum___home_v_media_split_v_source" DEFAULT 'custom',
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" jsonb,
  	"media_id" integer,
  	"browse_all_media" boolean DEFAULT false,
  	"layout" "enum___home_v_media_split_v_layout" DEFAULT 'left',
  	"aspect_ratio" "enum___home_v_media_split_v_aspect_ratio" DEFAULT '16-9',
  	"theme" "enum___home_v_media_split_v_theme" DEFAULT 'light',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "pages_image_statement" ALTER COLUMN "text_position" SET DATA TYPE text;
  ALTER TABLE "pages_image_statement" ALTER COLUMN "text_position" SET DEFAULT 'left'::text;
  DROP TYPE "public"."enum_pages_image_statement_text_position";
  CREATE TYPE "public"."enum_pages_image_statement_text_position" AS ENUM('left', 'right');
  ALTER TABLE "pages_image_statement" ALTER COLUMN "text_position" SET DEFAULT 'left'::"public"."enum_pages_image_statement_text_position";
  UPDATE "pages_image_statement" SET "text_position" = lower(btrim("text_position"));
  UPDATE "pages_image_statement" SET "text_position" = NULL WHERE "text_position" NOT IN ('left', 'right');
  ALTER TABLE "pages_image_statement" ALTER COLUMN "text_position" SET DATA TYPE "public"."enum_pages_image_statement_text_position" USING "text_position"::"public"."enum_pages_image_statement_text_position";
  ALTER TABLE "__pages_v_image_statement_v" ALTER COLUMN "text_position" SET DATA TYPE text;
  ALTER TABLE "__pages_v_image_statement_v" ALTER COLUMN "text_position" SET DEFAULT 'left'::text;
  DROP TYPE "public"."enum___pages_v_image_statement_v_text_position";
  CREATE TYPE "public"."enum___pages_v_image_statement_v_text_position" AS ENUM('left', 'right');
  ALTER TABLE "__pages_v_image_statement_v" ALTER COLUMN "text_position" SET DEFAULT 'left'::"public"."enum___pages_v_image_statement_v_text_position";
  UPDATE "__pages_v_image_statement_v" SET "text_position" = lower(btrim("text_position"));
  UPDATE "__pages_v_image_statement_v" SET "text_position" = NULL WHERE "text_position" NOT IN ('left', 'right');
  ALTER TABLE "__pages_v_image_statement_v" ALTER COLUMN "text_position" SET DATA TYPE "public"."enum___pages_v_image_statement_v_text_position" USING "text_position"::"public"."enum___pages_v_image_statement_v_text_position";
  ALTER TABLE "work_pages_image_statement" ALTER COLUMN "text_position" SET DATA TYPE text;
  ALTER TABLE "work_pages_image_statement" ALTER COLUMN "text_position" SET DEFAULT 'left'::text;
  DROP TYPE "public"."enum_work_pages_image_statement_text_position";
  CREATE TYPE "public"."enum_work_pages_image_statement_text_position" AS ENUM('left', 'right');
  ALTER TABLE "work_pages_image_statement" ALTER COLUMN "text_position" SET DEFAULT 'left'::"public"."enum_work_pages_image_statement_text_position";
  UPDATE "work_pages_image_statement" SET "text_position" = lower(btrim("text_position"));
  UPDATE "work_pages_image_statement" SET "text_position" = NULL WHERE "text_position" NOT IN ('left', 'right');
  ALTER TABLE "work_pages_image_statement" ALTER COLUMN "text_position" SET DATA TYPE "public"."enum_work_pages_image_statement_text_position" USING "text_position"::"public"."enum_work_pages_image_statement_text_position";
  ALTER TABLE "__work_pages_v_image_statement_v" ALTER COLUMN "text_position" SET DATA TYPE text;
  ALTER TABLE "__work_pages_v_image_statement_v" ALTER COLUMN "text_position" SET DEFAULT 'left'::text;
  DROP TYPE "public"."enum___work_pages_v_image_statement_v_text_position";
  CREATE TYPE "public"."enum___work_pages_v_image_statement_v_text_position" AS ENUM('left', 'right');
  ALTER TABLE "__work_pages_v_image_statement_v" ALTER COLUMN "text_position" SET DEFAULT 'left'::"public"."enum___work_pages_v_image_statement_v_text_position";
  UPDATE "__work_pages_v_image_statement_v" SET "text_position" = lower(btrim("text_position"));
  UPDATE "__work_pages_v_image_statement_v" SET "text_position" = NULL WHERE "text_position" NOT IN ('left', 'right');
  ALTER TABLE "__work_pages_v_image_statement_v" ALTER COLUMN "text_position" SET DATA TYPE "public"."enum___work_pages_v_image_statement_v_text_position" USING "text_position"::"public"."enum___work_pages_v_image_statement_v_text_position";
  ALTER TABLE "expertise_pages_image_statement" ALTER COLUMN "text_position" SET DATA TYPE text;
  ALTER TABLE "expertise_pages_image_statement" ALTER COLUMN "text_position" SET DEFAULT 'left'::text;
  DROP TYPE "public"."enum_expertise_pages_image_statement_text_position";
  CREATE TYPE "public"."enum_expertise_pages_image_statement_text_position" AS ENUM('left', 'right');
  ALTER TABLE "expertise_pages_image_statement" ALTER COLUMN "text_position" SET DEFAULT 'left'::"public"."enum_expertise_pages_image_statement_text_position";
  UPDATE "expertise_pages_image_statement" SET "text_position" = lower(btrim("text_position"));
  UPDATE "expertise_pages_image_statement" SET "text_position" = NULL WHERE "text_position" NOT IN ('left', 'right');
  ALTER TABLE "expertise_pages_image_statement" ALTER COLUMN "text_position" SET DATA TYPE "public"."enum_expertise_pages_image_statement_text_position" USING "text_position"::"public"."enum_expertise_pages_image_statement_text_position";
  ALTER TABLE "__expertise_pages_v_image_statement_v" ALTER COLUMN "text_position" SET DATA TYPE text;
  ALTER TABLE "__expertise_pages_v_image_statement_v" ALTER COLUMN "text_position" SET DEFAULT 'left'::text;
  DROP TYPE "public"."enum___expertise_pages_v_image_statement_v_text_position";
  CREATE TYPE "public"."enum___expertise_pages_v_image_statement_v_text_position" AS ENUM('left', 'right');
  ALTER TABLE "__expertise_pages_v_image_statement_v" ALTER COLUMN "text_position" SET DEFAULT 'left'::"public"."enum___expertise_pages_v_image_statement_v_text_position";
  UPDATE "__expertise_pages_v_image_statement_v" SET "text_position" = lower(btrim("text_position"));
  UPDATE "__expertise_pages_v_image_statement_v" SET "text_position" = NULL WHERE "text_position" NOT IN ('left', 'right');
  ALTER TABLE "__expertise_pages_v_image_statement_v" ALTER COLUMN "text_position" SET DATA TYPE "public"."enum___expertise_pages_v_image_statement_v_text_position" USING "text_position"::"public"."enum___expertise_pages_v_image_statement_v_text_position";
  ALTER TABLE "audience_pages_image_statement" ALTER COLUMN "text_position" SET DATA TYPE text;
  ALTER TABLE "audience_pages_image_statement" ALTER COLUMN "text_position" SET DEFAULT 'left'::text;
  DROP TYPE "public"."enum_audience_pages_image_statement_text_position";
  CREATE TYPE "public"."enum_audience_pages_image_statement_text_position" AS ENUM('left', 'right');
  ALTER TABLE "audience_pages_image_statement" ALTER COLUMN "text_position" SET DEFAULT 'left'::"public"."enum_audience_pages_image_statement_text_position";
  UPDATE "audience_pages_image_statement" SET "text_position" = lower(btrim("text_position"));
  UPDATE "audience_pages_image_statement" SET "text_position" = NULL WHERE "text_position" NOT IN ('left', 'right');
  ALTER TABLE "audience_pages_image_statement" ALTER COLUMN "text_position" SET DATA TYPE "public"."enum_audience_pages_image_statement_text_position" USING "text_position"::"public"."enum_audience_pages_image_statement_text_position";
  ALTER TABLE "__audience_pages_v_image_statement_v" ALTER COLUMN "text_position" SET DATA TYPE text;
  ALTER TABLE "__audience_pages_v_image_statement_v" ALTER COLUMN "text_position" SET DEFAULT 'left'::text;
  DROP TYPE "public"."enum___audience_pages_v_image_statement_v_text_position";
  CREATE TYPE "public"."enum___audience_pages_v_image_statement_v_text_position" AS ENUM('left', 'right');
  ALTER TABLE "__audience_pages_v_image_statement_v" ALTER COLUMN "text_position" SET DEFAULT 'left'::"public"."enum___audience_pages_v_image_statement_v_text_position";
  UPDATE "__audience_pages_v_image_statement_v" SET "text_position" = lower(btrim("text_position"));
  UPDATE "__audience_pages_v_image_statement_v" SET "text_position" = NULL WHERE "text_position" NOT IN ('left', 'right');
  ALTER TABLE "__audience_pages_v_image_statement_v" ALTER COLUMN "text_position" SET DATA TYPE "public"."enum___audience_pages_v_image_statement_v_text_position" USING "text_position"::"public"."enum___audience_pages_v_image_statement_v_text_position";
  ALTER TABLE "home_image_statement" ALTER COLUMN "text_position" SET DATA TYPE text;
  ALTER TABLE "home_image_statement" ALTER COLUMN "text_position" SET DEFAULT 'left'::text;
  DROP TYPE "public"."enum_home_image_statement_text_position";
  CREATE TYPE "public"."enum_home_image_statement_text_position" AS ENUM('left', 'right');
  ALTER TABLE "home_image_statement" ALTER COLUMN "text_position" SET DEFAULT 'left'::"public"."enum_home_image_statement_text_position";
  UPDATE "home_image_statement" SET "text_position" = lower(btrim("text_position"));
  UPDATE "home_image_statement" SET "text_position" = NULL WHERE "text_position" NOT IN ('left', 'right');
  ALTER TABLE "home_image_statement" ALTER COLUMN "text_position" SET DATA TYPE "public"."enum_home_image_statement_text_position" USING "text_position"::"public"."enum_home_image_statement_text_position";
  ALTER TABLE "__home_v_image_statement_v" ALTER COLUMN "text_position" SET DATA TYPE text;
  ALTER TABLE "__home_v_image_statement_v" ALTER COLUMN "text_position" SET DEFAULT 'left'::text;
  DROP TYPE "public"."enum___home_v_image_statement_v_text_position";
  CREATE TYPE "public"."enum___home_v_image_statement_v_text_position" AS ENUM('left', 'right');
  ALTER TABLE "__home_v_image_statement_v" ALTER COLUMN "text_position" SET DEFAULT 'left'::"public"."enum___home_v_image_statement_v_text_position";
  UPDATE "__home_v_image_statement_v" SET "text_position" = lower(btrim("text_position"));
  UPDATE "__home_v_image_statement_v" SET "text_position" = NULL WHERE "text_position" NOT IN ('left', 'right');
  ALTER TABLE "__home_v_image_statement_v" ALTER COLUMN "text_position" SET DATA TYPE "public"."enum___home_v_image_statement_v_text_position" USING "text_position"::"public"."enum___home_v_image_statement_v_text_position";
  ALTER TABLE "pages_split_narrow" ALTER COLUMN "image_position" SET DEFAULT 'left';
  ALTER TABLE "__pages_v_split_narrow_v" ALTER COLUMN "image_position" SET DEFAULT 'left';
  ALTER TABLE "wp_transition" ALTER COLUMN "layout" SET DEFAULT 'left';
  ALTER TABLE "work_pages_split_offset" ALTER COLUMN "caption_position" SET DEFAULT 'left';
  ALTER TABLE "work_pages_split_narrow" ALTER COLUMN "image_position" SET DEFAULT 'left';
  ALTER TABLE "_wp_transition_v" ALTER COLUMN "layout" SET DEFAULT 'left';
  ALTER TABLE "__work_pages_v_split_offset_v" ALTER COLUMN "caption_position" SET DEFAULT 'left';
  ALTER TABLE "__work_pages_v_split_narrow_v" ALTER COLUMN "image_position" SET DEFAULT 'left';
  ALTER TABLE "lp_transition" ALTER COLUMN "layout" SET DEFAULT 'left';
  ALTER TABLE "lab_pages_split_narrow" ALTER COLUMN "image_position" SET DEFAULT 'left';
  ALTER TABLE "_lp_transition_v" ALTER COLUMN "layout" SET DEFAULT 'left';
  ALTER TABLE "__lab_pages_v_split_narrow_v" ALTER COLUMN "image_position" SET DEFAULT 'left';
  ALTER TABLE "expertise_pages_split_narrow" ALTER COLUMN "image_position" SET DEFAULT 'left';
  ALTER TABLE "__expertise_pages_v_split_narrow_v" ALTER COLUMN "image_position" SET DEFAULT 'left';
  ALTER TABLE "audience_pages_split_narrow" ALTER COLUMN "image_position" SET DEFAULT 'left';
  ALTER TABLE "__audience_pages_v_split_narrow_v" ALTER COLUMN "image_position" SET DEFAULT 'left';
  ALTER TABLE "home_split_narrow" ALTER COLUMN "image_position" SET DEFAULT 'left';
  ALTER TABLE "__home_v_split_narrow_v" ALTER COLUMN "image_position" SET DEFAULT 'left';
  ALTER TABLE "pages_blocks_feature_heading_offset" ADD COLUMN "body_size" "enum_pages_blocks_feature_heading_offset_body_size" DEFAULT 'medium';
  ALTER TABLE "_pages_v_blocks_feature_heading_offset" ADD COLUMN "body_size" "enum__pages_v_blocks_feature_heading_offset_body_size" DEFAULT 'medium';
  ALTER TABLE "work_pages_blocks_feature_heading_offset" ADD COLUMN "body_size" "enum_work_pages_blocks_feature_heading_offset_body_size" DEFAULT 'medium';
  ALTER TABLE "_work_pages_v_blocks_feature_heading_offset" ADD COLUMN "body_size" "enum__work_pages_v_blocks_feature_heading_offset_body_size" DEFAULT 'medium';
  ALTER TABLE "expertise_pages_blocks_feature_heading_offset" ADD COLUMN "body_size" "enum_expertise_pages_blocks_feature_heading_offset_body_size" DEFAULT 'medium';
  ALTER TABLE "_expertise_pages_v_blocks_feature_heading_offset" ADD COLUMN "body_size" "enum__expertise_pages_v_blocks_feature_heading_offset_body_size" DEFAULT 'medium';
  ALTER TABLE "audience_pages_blocks_feature_heading_offset" ADD COLUMN "body_size" "enum_audience_pages_blocks_feature_heading_offset_body_size" DEFAULT 'medium';
  ALTER TABLE "_audience_pages_v_blocks_feature_heading_offset" ADD COLUMN "body_size" "enum__audience_pages_v_blocks_feature_heading_offset_body_size" DEFAULT 'medium';
  ALTER TABLE "home_blocks_feature_heading_offset" ADD COLUMN "body_size" "enum_home_blocks_feature_heading_offset_body_size" DEFAULT 'medium';
  ALTER TABLE "_home_v_blocks_feature_heading_offset" ADD COLUMN "body_size" "enum__home_v_blocks_feature_heading_offset_body_size" DEFAULT 'medium';
  ALTER TABLE "pages_media_split" ADD CONSTRAINT "pages_media_split_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_media_split" ADD CONSTRAINT "pages_media_split_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_section" ADD CONSTRAINT "pages_section_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__pages_v_media_split_v" ADD CONSTRAINT "__pages_v_media_split_v_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__pages_v_media_split_v" ADD CONSTRAINT "__pages_v_media_split_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__pages_v_section_v" ADD CONSTRAINT "__pages_v_section_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "work_pages_media_split" ADD CONSTRAINT "work_pages_media_split_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "work_pages_media_split" ADD CONSTRAINT "work_pages_media_split_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."work_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "work_pages_section" ADD CONSTRAINT "work_pages_section_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."work_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__work_pages_v_media_split_v" ADD CONSTRAINT "__work_pages_v_media_split_v_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__work_pages_v_media_split_v" ADD CONSTRAINT "__work_pages_v_media_split_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_work_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__work_pages_v_section_v" ADD CONSTRAINT "__work_pages_v_section_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_work_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lab_pages_section" ADD CONSTRAINT "lab_pages_section_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lab_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__lab_pages_v_section_v" ADD CONSTRAINT "__lab_pages_v_section_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_lab_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "expertise_pages_section" ADD CONSTRAINT "expertise_pages_section_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."expertise_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__expertise_pages_v_section_v" ADD CONSTRAINT "__expertise_pages_v_section_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_expertise_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "audience_pages_section" ADD CONSTRAINT "audience_pages_section_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."audience_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__audience_pages_v_section_v" ADD CONSTRAINT "__audience_pages_v_section_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_audience_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_media_split" ADD CONSTRAINT "home_media_split_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_media_split" ADD CONSTRAINT "home_media_split_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__home_v_media_split_v" ADD CONSTRAINT "__home_v_media_split_v_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__home_v_media_split_v" ADD CONSTRAINT "__home_v_media_split_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_media_split_order_idx" ON "pages_media_split" USING btree ("_order");
  CREATE INDEX "pages_media_split_parent_id_idx" ON "pages_media_split" USING btree ("_parent_id");
  CREATE INDEX "pages_media_split_path_idx" ON "pages_media_split" USING btree ("_path");
  CREATE INDEX "pages_media_split_media_idx" ON "pages_media_split" USING btree ("media_id");
  CREATE INDEX "pages_section_order_idx" ON "pages_section" USING btree ("_order");
  CREATE INDEX "pages_section_parent_id_idx" ON "pages_section" USING btree ("_parent_id");
  CREATE INDEX "pages_section_path_idx" ON "pages_section" USING btree ("_path");
  CREATE INDEX "__pages_v_media_split_v_order_idx" ON "__pages_v_media_split_v" USING btree ("_order");
  CREATE INDEX "__pages_v_media_split_v_parent_id_idx" ON "__pages_v_media_split_v" USING btree ("_parent_id");
  CREATE INDEX "__pages_v_media_split_v_path_idx" ON "__pages_v_media_split_v" USING btree ("_path");
  CREATE INDEX "__pages_v_media_split_v_media_idx" ON "__pages_v_media_split_v" USING btree ("media_id");
  CREATE INDEX "__pages_v_section_v_order_idx" ON "__pages_v_section_v" USING btree ("_order");
  CREATE INDEX "__pages_v_section_v_parent_id_idx" ON "__pages_v_section_v" USING btree ("_parent_id");
  CREATE INDEX "__pages_v_section_v_path_idx" ON "__pages_v_section_v" USING btree ("_path");
  CREATE INDEX "work_pages_media_split_order_idx" ON "work_pages_media_split" USING btree ("_order");
  CREATE INDEX "work_pages_media_split_parent_id_idx" ON "work_pages_media_split" USING btree ("_parent_id");
  CREATE INDEX "work_pages_media_split_path_idx" ON "work_pages_media_split" USING btree ("_path");
  CREATE INDEX "work_pages_media_split_media_idx" ON "work_pages_media_split" USING btree ("media_id");
  CREATE INDEX "work_pages_section_order_idx" ON "work_pages_section" USING btree ("_order");
  CREATE INDEX "work_pages_section_parent_id_idx" ON "work_pages_section" USING btree ("_parent_id");
  CREATE INDEX "work_pages_section_path_idx" ON "work_pages_section" USING btree ("_path");
  CREATE INDEX "__work_pages_v_media_split_v_order_idx" ON "__work_pages_v_media_split_v" USING btree ("_order");
  CREATE INDEX "__work_pages_v_media_split_v_parent_id_idx" ON "__work_pages_v_media_split_v" USING btree ("_parent_id");
  CREATE INDEX "__work_pages_v_media_split_v_path_idx" ON "__work_pages_v_media_split_v" USING btree ("_path");
  CREATE INDEX "__work_pages_v_media_split_v_media_idx" ON "__work_pages_v_media_split_v" USING btree ("media_id");
  CREATE INDEX "__work_pages_v_section_v_order_idx" ON "__work_pages_v_section_v" USING btree ("_order");
  CREATE INDEX "__work_pages_v_section_v_parent_id_idx" ON "__work_pages_v_section_v" USING btree ("_parent_id");
  CREATE INDEX "__work_pages_v_section_v_path_idx" ON "__work_pages_v_section_v" USING btree ("_path");
  CREATE INDEX "lab_pages_section_order_idx" ON "lab_pages_section" USING btree ("_order");
  CREATE INDEX "lab_pages_section_parent_id_idx" ON "lab_pages_section" USING btree ("_parent_id");
  CREATE INDEX "lab_pages_section_path_idx" ON "lab_pages_section" USING btree ("_path");
  CREATE INDEX "__lab_pages_v_section_v_order_idx" ON "__lab_pages_v_section_v" USING btree ("_order");
  CREATE INDEX "__lab_pages_v_section_v_parent_id_idx" ON "__lab_pages_v_section_v" USING btree ("_parent_id");
  CREATE INDEX "__lab_pages_v_section_v_path_idx" ON "__lab_pages_v_section_v" USING btree ("_path");
  CREATE INDEX "expertise_pages_section_order_idx" ON "expertise_pages_section" USING btree ("_order");
  CREATE INDEX "expertise_pages_section_parent_id_idx" ON "expertise_pages_section" USING btree ("_parent_id");
  CREATE INDEX "expertise_pages_section_path_idx" ON "expertise_pages_section" USING btree ("_path");
  CREATE INDEX "__expertise_pages_v_section_v_order_idx" ON "__expertise_pages_v_section_v" USING btree ("_order");
  CREATE INDEX "__expertise_pages_v_section_v_parent_id_idx" ON "__expertise_pages_v_section_v" USING btree ("_parent_id");
  CREATE INDEX "__expertise_pages_v_section_v_path_idx" ON "__expertise_pages_v_section_v" USING btree ("_path");
  CREATE INDEX "audience_pages_section_order_idx" ON "audience_pages_section" USING btree ("_order");
  CREATE INDEX "audience_pages_section_parent_id_idx" ON "audience_pages_section" USING btree ("_parent_id");
  CREATE INDEX "audience_pages_section_path_idx" ON "audience_pages_section" USING btree ("_path");
  CREATE INDEX "__audience_pages_v_section_v_order_idx" ON "__audience_pages_v_section_v" USING btree ("_order");
  CREATE INDEX "__audience_pages_v_section_v_parent_id_idx" ON "__audience_pages_v_section_v" USING btree ("_parent_id");
  CREATE INDEX "__audience_pages_v_section_v_path_idx" ON "__audience_pages_v_section_v" USING btree ("_path");
  CREATE INDEX "home_media_split_order_idx" ON "home_media_split" USING btree ("_order");
  CREATE INDEX "home_media_split_parent_id_idx" ON "home_media_split" USING btree ("_parent_id");
  CREATE INDEX "home_media_split_path_idx" ON "home_media_split" USING btree ("_path");
  CREATE INDEX "home_media_split_media_idx" ON "home_media_split" USING btree ("media_id");
  CREATE INDEX "__home_v_media_split_v_order_idx" ON "__home_v_media_split_v" USING btree ("_order");
  CREATE INDEX "__home_v_media_split_v_parent_id_idx" ON "__home_v_media_split_v" USING btree ("_parent_id");
  CREATE INDEX "__home_v_media_split_v_path_idx" ON "__home_v_media_split_v" USING btree ("_path");
  CREATE INDEX "__home_v_media_split_v_media_idx" ON "__home_v_media_split_v" USING btree ("media_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_media_split" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_section" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__pages_v_media_split_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__pages_v_section_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "work_pages_media_split" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "work_pages_section" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__work_pages_v_media_split_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__work_pages_v_section_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "lab_pages_section" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__lab_pages_v_section_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "expertise_pages_section" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__expertise_pages_v_section_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "audience_pages_section" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__audience_pages_v_section_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_media_split" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__home_v_media_split_v" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "pages_media_split" CASCADE;
  DROP TABLE "pages_section" CASCADE;
  DROP TABLE "__pages_v_media_split_v" CASCADE;
  DROP TABLE "__pages_v_section_v" CASCADE;
  DROP TABLE "work_pages_media_split" CASCADE;
  DROP TABLE "work_pages_section" CASCADE;
  DROP TABLE "__work_pages_v_media_split_v" CASCADE;
  DROP TABLE "__work_pages_v_section_v" CASCADE;
  DROP TABLE "lab_pages_section" CASCADE;
  DROP TABLE "__lab_pages_v_section_v" CASCADE;
  DROP TABLE "expertise_pages_section" CASCADE;
  DROP TABLE "__expertise_pages_v_section_v" CASCADE;
  DROP TABLE "audience_pages_section" CASCADE;
  DROP TABLE "__audience_pages_v_section_v" CASCADE;
  DROP TABLE "home_media_split" CASCADE;
  DROP TABLE "__home_v_media_split_v" CASCADE;
  ALTER TABLE "pages_image_statement" ALTER COLUMN "text_position" SET DATA TYPE text;
  ALTER TABLE "pages_image_statement" ALTER COLUMN "text_position" SET DEFAULT 'right'::text;
  DROP TYPE "public"."enum_pages_image_statement_text_position";
  CREATE TYPE "public"."enum_pages_image_statement_text_position" AS ENUM('right', 'left');
  ALTER TABLE "pages_image_statement" ALTER COLUMN "text_position" SET DEFAULT 'right'::"public"."enum_pages_image_statement_text_position";
  UPDATE "pages_image_statement" SET "text_position" = lower(btrim("text_position"));
  UPDATE "pages_image_statement" SET "text_position" = NULL WHERE "text_position" NOT IN ('left', 'right');
  ALTER TABLE "pages_image_statement" ALTER COLUMN "text_position" SET DATA TYPE "public"."enum_pages_image_statement_text_position" USING "text_position"::"public"."enum_pages_image_statement_text_position";
  ALTER TABLE "__pages_v_image_statement_v" ALTER COLUMN "text_position" SET DATA TYPE text;
  ALTER TABLE "__pages_v_image_statement_v" ALTER COLUMN "text_position" SET DEFAULT 'right'::text;
  DROP TYPE "public"."enum___pages_v_image_statement_v_text_position";
  CREATE TYPE "public"."enum___pages_v_image_statement_v_text_position" AS ENUM('right', 'left');
  ALTER TABLE "__pages_v_image_statement_v" ALTER COLUMN "text_position" SET DEFAULT 'right'::"public"."enum___pages_v_image_statement_v_text_position";
  UPDATE "__pages_v_image_statement_v" SET "text_position" = lower(btrim("text_position"));
  UPDATE "__pages_v_image_statement_v" SET "text_position" = NULL WHERE "text_position" NOT IN ('left', 'right');
  ALTER TABLE "__pages_v_image_statement_v" ALTER COLUMN "text_position" SET DATA TYPE "public"."enum___pages_v_image_statement_v_text_position" USING "text_position"::"public"."enum___pages_v_image_statement_v_text_position";
  ALTER TABLE "work_pages_image_statement" ALTER COLUMN "text_position" SET DATA TYPE text;
  ALTER TABLE "work_pages_image_statement" ALTER COLUMN "text_position" SET DEFAULT 'right'::text;
  DROP TYPE "public"."enum_work_pages_image_statement_text_position";
  CREATE TYPE "public"."enum_work_pages_image_statement_text_position" AS ENUM('right', 'left');
  ALTER TABLE "work_pages_image_statement" ALTER COLUMN "text_position" SET DEFAULT 'right'::"public"."enum_work_pages_image_statement_text_position";
  UPDATE "work_pages_image_statement" SET "text_position" = lower(btrim("text_position"));
  UPDATE "work_pages_image_statement" SET "text_position" = NULL WHERE "text_position" NOT IN ('left', 'right');
  ALTER TABLE "work_pages_image_statement" ALTER COLUMN "text_position" SET DATA TYPE "public"."enum_work_pages_image_statement_text_position" USING "text_position"::"public"."enum_work_pages_image_statement_text_position";
  ALTER TABLE "__work_pages_v_image_statement_v" ALTER COLUMN "text_position" SET DATA TYPE text;
  ALTER TABLE "__work_pages_v_image_statement_v" ALTER COLUMN "text_position" SET DEFAULT 'right'::text;
  DROP TYPE "public"."enum___work_pages_v_image_statement_v_text_position";
  CREATE TYPE "public"."enum___work_pages_v_image_statement_v_text_position" AS ENUM('right', 'left');
  ALTER TABLE "__work_pages_v_image_statement_v" ALTER COLUMN "text_position" SET DEFAULT 'right'::"public"."enum___work_pages_v_image_statement_v_text_position";
  UPDATE "__work_pages_v_image_statement_v" SET "text_position" = lower(btrim("text_position"));
  UPDATE "__work_pages_v_image_statement_v" SET "text_position" = NULL WHERE "text_position" NOT IN ('left', 'right');
  ALTER TABLE "__work_pages_v_image_statement_v" ALTER COLUMN "text_position" SET DATA TYPE "public"."enum___work_pages_v_image_statement_v_text_position" USING "text_position"::"public"."enum___work_pages_v_image_statement_v_text_position";
  ALTER TABLE "expertise_pages_image_statement" ALTER COLUMN "text_position" SET DATA TYPE text;
  ALTER TABLE "expertise_pages_image_statement" ALTER COLUMN "text_position" SET DEFAULT 'right'::text;
  DROP TYPE "public"."enum_expertise_pages_image_statement_text_position";
  CREATE TYPE "public"."enum_expertise_pages_image_statement_text_position" AS ENUM('right', 'left');
  ALTER TABLE "expertise_pages_image_statement" ALTER COLUMN "text_position" SET DEFAULT 'right'::"public"."enum_expertise_pages_image_statement_text_position";
  UPDATE "expertise_pages_image_statement" SET "text_position" = lower(btrim("text_position"));
  UPDATE "expertise_pages_image_statement" SET "text_position" = NULL WHERE "text_position" NOT IN ('left', 'right');
  ALTER TABLE "expertise_pages_image_statement" ALTER COLUMN "text_position" SET DATA TYPE "public"."enum_expertise_pages_image_statement_text_position" USING "text_position"::"public"."enum_expertise_pages_image_statement_text_position";
  ALTER TABLE "__expertise_pages_v_image_statement_v" ALTER COLUMN "text_position" SET DATA TYPE text;
  ALTER TABLE "__expertise_pages_v_image_statement_v" ALTER COLUMN "text_position" SET DEFAULT 'right'::text;
  DROP TYPE "public"."enum___expertise_pages_v_image_statement_v_text_position";
  CREATE TYPE "public"."enum___expertise_pages_v_image_statement_v_text_position" AS ENUM('right', 'left');
  ALTER TABLE "__expertise_pages_v_image_statement_v" ALTER COLUMN "text_position" SET DEFAULT 'right'::"public"."enum___expertise_pages_v_image_statement_v_text_position";
  UPDATE "__expertise_pages_v_image_statement_v" SET "text_position" = lower(btrim("text_position"));
  UPDATE "__expertise_pages_v_image_statement_v" SET "text_position" = NULL WHERE "text_position" NOT IN ('left', 'right');
  ALTER TABLE "__expertise_pages_v_image_statement_v" ALTER COLUMN "text_position" SET DATA TYPE "public"."enum___expertise_pages_v_image_statement_v_text_position" USING "text_position"::"public"."enum___expertise_pages_v_image_statement_v_text_position";
  ALTER TABLE "audience_pages_image_statement" ALTER COLUMN "text_position" SET DATA TYPE text;
  ALTER TABLE "audience_pages_image_statement" ALTER COLUMN "text_position" SET DEFAULT 'right'::text;
  DROP TYPE "public"."enum_audience_pages_image_statement_text_position";
  CREATE TYPE "public"."enum_audience_pages_image_statement_text_position" AS ENUM('right', 'left');
  ALTER TABLE "audience_pages_image_statement" ALTER COLUMN "text_position" SET DEFAULT 'right'::"public"."enum_audience_pages_image_statement_text_position";
  UPDATE "audience_pages_image_statement" SET "text_position" = lower(btrim("text_position"));
  UPDATE "audience_pages_image_statement" SET "text_position" = NULL WHERE "text_position" NOT IN ('left', 'right');
  ALTER TABLE "audience_pages_image_statement" ALTER COLUMN "text_position" SET DATA TYPE "public"."enum_audience_pages_image_statement_text_position" USING "text_position"::"public"."enum_audience_pages_image_statement_text_position";
  ALTER TABLE "__audience_pages_v_image_statement_v" ALTER COLUMN "text_position" SET DATA TYPE text;
  ALTER TABLE "__audience_pages_v_image_statement_v" ALTER COLUMN "text_position" SET DEFAULT 'right'::text;
  DROP TYPE "public"."enum___audience_pages_v_image_statement_v_text_position";
  CREATE TYPE "public"."enum___audience_pages_v_image_statement_v_text_position" AS ENUM('right', 'left');
  ALTER TABLE "__audience_pages_v_image_statement_v" ALTER COLUMN "text_position" SET DEFAULT 'right'::"public"."enum___audience_pages_v_image_statement_v_text_position";
  UPDATE "__audience_pages_v_image_statement_v" SET "text_position" = lower(btrim("text_position"));
  UPDATE "__audience_pages_v_image_statement_v" SET "text_position" = NULL WHERE "text_position" NOT IN ('left', 'right');
  ALTER TABLE "__audience_pages_v_image_statement_v" ALTER COLUMN "text_position" SET DATA TYPE "public"."enum___audience_pages_v_image_statement_v_text_position" USING "text_position"::"public"."enum___audience_pages_v_image_statement_v_text_position";
  ALTER TABLE "home_image_statement" ALTER COLUMN "text_position" SET DATA TYPE text;
  ALTER TABLE "home_image_statement" ALTER COLUMN "text_position" SET DEFAULT 'right'::text;
  DROP TYPE "public"."enum_home_image_statement_text_position";
  CREATE TYPE "public"."enum_home_image_statement_text_position" AS ENUM('right', 'left');
  ALTER TABLE "home_image_statement" ALTER COLUMN "text_position" SET DEFAULT 'right'::"public"."enum_home_image_statement_text_position";
  UPDATE "home_image_statement" SET "text_position" = lower(btrim("text_position"));
  UPDATE "home_image_statement" SET "text_position" = NULL WHERE "text_position" NOT IN ('left', 'right');
  ALTER TABLE "home_image_statement" ALTER COLUMN "text_position" SET DATA TYPE "public"."enum_home_image_statement_text_position" USING "text_position"::"public"."enum_home_image_statement_text_position";
  ALTER TABLE "__home_v_image_statement_v" ALTER COLUMN "text_position" SET DATA TYPE text;
  ALTER TABLE "__home_v_image_statement_v" ALTER COLUMN "text_position" SET DEFAULT 'right'::text;
  DROP TYPE "public"."enum___home_v_image_statement_v_text_position";
  CREATE TYPE "public"."enum___home_v_image_statement_v_text_position" AS ENUM('right', 'left');
  ALTER TABLE "__home_v_image_statement_v" ALTER COLUMN "text_position" SET DEFAULT 'right'::"public"."enum___home_v_image_statement_v_text_position";
  UPDATE "__home_v_image_statement_v" SET "text_position" = lower(btrim("text_position"));
  UPDATE "__home_v_image_statement_v" SET "text_position" = NULL WHERE "text_position" NOT IN ('left', 'right');
  ALTER TABLE "__home_v_image_statement_v" ALTER COLUMN "text_position" SET DATA TYPE "public"."enum___home_v_image_statement_v_text_position" USING "text_position"::"public"."enum___home_v_image_statement_v_text_position";
  ALTER TABLE "pages_split_narrow" ALTER COLUMN "image_position" SET DEFAULT 'right';
  ALTER TABLE "__pages_v_split_narrow_v" ALTER COLUMN "image_position" SET DEFAULT 'right';
  ALTER TABLE "wp_transition" ALTER COLUMN "layout" SET DEFAULT 'centered';
  ALTER TABLE "work_pages_split_narrow" ALTER COLUMN "image_position" SET DEFAULT 'right';
  ALTER TABLE "work_pages_split_offset" ALTER COLUMN "caption_position" SET DEFAULT 'right';
  ALTER TABLE "_wp_transition_v" ALTER COLUMN "layout" SET DEFAULT 'centered';
  ALTER TABLE "__work_pages_v_split_narrow_v" ALTER COLUMN "image_position" SET DEFAULT 'right';
  ALTER TABLE "__work_pages_v_split_offset_v" ALTER COLUMN "caption_position" SET DEFAULT 'right';
  ALTER TABLE "lp_transition" ALTER COLUMN "layout" SET DEFAULT 'centered';
  ALTER TABLE "lab_pages_split_narrow" ALTER COLUMN "image_position" SET DEFAULT 'right';
  ALTER TABLE "_lp_transition_v" ALTER COLUMN "layout" SET DEFAULT 'centered';
  ALTER TABLE "__lab_pages_v_split_narrow_v" ALTER COLUMN "image_position" SET DEFAULT 'right';
  ALTER TABLE "expertise_pages_split_narrow" ALTER COLUMN "image_position" SET DEFAULT 'right';
  ALTER TABLE "__expertise_pages_v_split_narrow_v" ALTER COLUMN "image_position" SET DEFAULT 'right';
  ALTER TABLE "audience_pages_split_narrow" ALTER COLUMN "image_position" SET DEFAULT 'right';
  ALTER TABLE "__audience_pages_v_split_narrow_v" ALTER COLUMN "image_position" SET DEFAULT 'right';
  ALTER TABLE "home_split_narrow" ALTER COLUMN "image_position" SET DEFAULT 'right';
  ALTER TABLE "__home_v_split_narrow_v" ALTER COLUMN "image_position" SET DEFAULT 'right';
  ALTER TABLE "pages_blocks_feature_heading_offset" DROP COLUMN "body_size";
  ALTER TABLE "_pages_v_blocks_feature_heading_offset" DROP COLUMN "body_size";
  ALTER TABLE "work_pages_blocks_feature_heading_offset" DROP COLUMN "body_size";
  ALTER TABLE "_work_pages_v_blocks_feature_heading_offset" DROP COLUMN "body_size";
  ALTER TABLE "expertise_pages_blocks_feature_heading_offset" DROP COLUMN "body_size";
  ALTER TABLE "_expertise_pages_v_blocks_feature_heading_offset" DROP COLUMN "body_size";
  ALTER TABLE "audience_pages_blocks_feature_heading_offset" DROP COLUMN "body_size";
  ALTER TABLE "_audience_pages_v_blocks_feature_heading_offset" DROP COLUMN "body_size";
  ALTER TABLE "home_blocks_feature_heading_offset" DROP COLUMN "body_size";
  ALTER TABLE "_home_v_blocks_feature_heading_offset" DROP COLUMN "body_size";
  DROP TYPE "public"."enum_pages_blocks_feature_heading_offset_body_size";
  DROP TYPE "public"."enum_pages_media_split_source";
  DROP TYPE "public"."enum_pages_media_split_layout";
  DROP TYPE "public"."enum_pages_media_split_aspect_ratio";
  DROP TYPE "public"."enum_pages_media_split_theme";
  DROP TYPE "public"."enum_pages_section_theme";
  DROP TYPE "public"."enum_pages_section_spacing";
  DROP TYPE "public"."enum__pages_v_blocks_feature_heading_offset_body_size";
  DROP TYPE "public"."enum___pages_v_media_split_v_source";
  DROP TYPE "public"."enum___pages_v_media_split_v_layout";
  DROP TYPE "public"."enum___pages_v_media_split_v_aspect_ratio";
  DROP TYPE "public"."enum___pages_v_media_split_v_theme";
  DROP TYPE "public"."enum___pages_v_section_v_theme";
  DROP TYPE "public"."enum___pages_v_section_v_spacing";
  DROP TYPE "public"."enum_work_pages_blocks_feature_heading_offset_body_size";
  DROP TYPE "public"."enum_work_pages_media_split_source";
  DROP TYPE "public"."enum_work_pages_media_split_story_scope";
  DROP TYPE "public"."enum_work_pages_media_split_layout";
  DROP TYPE "public"."enum_work_pages_media_split_aspect_ratio";
  DROP TYPE "public"."enum_work_pages_media_split_theme";
  DROP TYPE "public"."enum_work_pages_section_theme";
  DROP TYPE "public"."enum_work_pages_section_spacing";
  DROP TYPE "public"."enum__work_pages_v_blocks_feature_heading_offset_body_size";
  DROP TYPE "public"."enum___work_pages_v_media_split_v_source";
  DROP TYPE "public"."enum___work_pages_v_media_split_v_story_scope";
  DROP TYPE "public"."enum___work_pages_v_media_split_v_layout";
  DROP TYPE "public"."enum___work_pages_v_media_split_v_aspect_ratio";
  DROP TYPE "public"."enum___work_pages_v_media_split_v_theme";
  DROP TYPE "public"."enum___work_pages_v_section_v_theme";
  DROP TYPE "public"."enum___work_pages_v_section_v_spacing";
  DROP TYPE "public"."enum_lab_pages_section_theme";
  DROP TYPE "public"."enum_lab_pages_section_spacing";
  DROP TYPE "public"."enum___lab_pages_v_section_v_theme";
  DROP TYPE "public"."enum___lab_pages_v_section_v_spacing";
  DROP TYPE "public"."enum_expertise_pages_blocks_feature_heading_offset_body_size";
  DROP TYPE "public"."enum_expertise_pages_section_theme";
  DROP TYPE "public"."enum_expertise_pages_section_spacing";
  DROP TYPE "public"."enum__expertise_pages_v_blocks_feature_heading_offset_body_size";
  DROP TYPE "public"."enum___expertise_pages_v_section_v_theme";
  DROP TYPE "public"."enum___expertise_pages_v_section_v_spacing";
  DROP TYPE "public"."enum_audience_pages_blocks_feature_heading_offset_body_size";
  DROP TYPE "public"."enum_audience_pages_section_theme";
  DROP TYPE "public"."enum_audience_pages_section_spacing";
  DROP TYPE "public"."enum__audience_pages_v_blocks_feature_heading_offset_body_size";
  DROP TYPE "public"."enum___audience_pages_v_section_v_theme";
  DROP TYPE "public"."enum___audience_pages_v_section_v_spacing";
  DROP TYPE "public"."enum_home_blocks_feature_heading_offset_body_size";
  DROP TYPE "public"."enum_home_media_split_source";
  DROP TYPE "public"."enum_home_media_split_layout";
  DROP TYPE "public"."enum_home_media_split_aspect_ratio";
  DROP TYPE "public"."enum_home_media_split_theme";
  DROP TYPE "public"."enum__home_v_blocks_feature_heading_offset_body_size";
  DROP TYPE "public"."enum___home_v_media_split_v_source";
  DROP TYPE "public"."enum___home_v_media_split_v_layout";
  DROP TYPE "public"."enum___home_v_media_split_v_aspect_ratio";
  DROP TYPE "public"."enum___home_v_media_split_v_theme";`)
}
