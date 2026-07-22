import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_feature_statement_grid_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum_pages_blocks_feature_heading_offset_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum_pages_blocks_feature_tabs_tabs_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum_image_statement_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum_split_narrow_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum_split_narrow_image_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum_split_narrow_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum__pages_v_blocks_feature_statement_grid_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum__pages_v_blocks_feature_heading_offset_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum__pages_v_blocks_feature_tabs_tabs_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum__image_statement_v_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum__split_narrow_v_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum__split_narrow_v_image_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum__split_narrow_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_work_pages_blocks_feature_heading_offset_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum_work_pages_blocks_feature_statement_grid_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum_work_pages_blocks_feature_tabs_tabs_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum__work_pages_v_blocks_feature_heading_offset_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum__work_pages_v_blocks_feature_statement_grid_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum__work_pages_v_blocks_feature_tabs_tabs_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum_expertise_pages_blocks_feature_statement_grid_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum_expertise_pages_blocks_feature_heading_offset_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum_expertise_pages_blocks_feature_tabs_tabs_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum__expertise_pages_v_blocks_feature_statement_grid_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum__expertise_pages_v_blocks_feature_heading_offset_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum__expertise_pages_v_blocks_feature_tabs_tabs_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum_audience_pages_blocks_feature_statement_grid_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum_audience_pages_blocks_feature_heading_offset_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum_audience_pages_blocks_feature_tabs_tabs_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum__audience_pages_v_blocks_feature_statement_grid_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum__audience_pages_v_blocks_feature_heading_offset_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum__audience_pages_v_blocks_feature_tabs_tabs_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
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
  
  CREATE TABLE "work_pages_blocks_feature_heading_offset" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"source" "enum_work_pages_blocks_feature_heading_offset_source" DEFAULT 'custom',
  	"body" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "work_pages_blocks_feature_statement_grid_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"title" varchar,
  	"description" varchar
  );
  
  CREATE TABLE "work_pages_blocks_feature_statement_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"source" "enum_work_pages_blocks_feature_statement_grid_source" DEFAULT 'custom',
  	"statement" jsonb,
  	"footnote" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "work_pages_blocks_feature_tabs_tabs_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "work_pages_blocks_feature_tabs_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"heading" varchar,
  	"source" "enum_work_pages_blocks_feature_tabs_tabs_source" DEFAULT 'custom',
  	"description" jsonb,
  	"subheading" varchar DEFAULT 'Included',
  	"media_id" integer,
  	"caption" varchar
  );
  
  CREATE TABLE "work_pages_blocks_feature_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "_work_pages_v_blocks_feature_heading_offset" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"source" "enum__work_pages_v_blocks_feature_heading_offset_source" DEFAULT 'custom',
  	"body" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_work_pages_v_blocks_feature_statement_grid_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"title" varchar,
  	"description" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_work_pages_v_blocks_feature_statement_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"source" "enum__work_pages_v_blocks_feature_statement_grid_source" DEFAULT 'custom',
  	"statement" jsonb,
  	"footnote" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_work_pages_v_blocks_feature_tabs_tabs_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_work_pages_v_blocks_feature_tabs_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"heading" varchar,
  	"source" "enum__work_pages_v_blocks_feature_tabs_tabs_source" DEFAULT 'custom',
  	"description" jsonb,
  	"subheading" varchar DEFAULT 'Included',
  	"media_id" integer,
  	"caption" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_work_pages_v_blocks_feature_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE OR REPLACE FUNCTION pg_temp.__sas_text_to_lexical(t text) RETURNS jsonb AS $$
    SELECT CASE
      WHEN t IS NULL OR btrim(t) = '' THEN NULL
      ELSE jsonb_build_object(
        'root', jsonb_build_object(
          'type', 'root', 'format', '', 'indent', 0, 'version', 1, 'direction', 'ltr',
          'children', jsonb_build_array(
            jsonb_build_object(
              'type', 'paragraph', 'format', '', 'indent', 0, 'version', 1, 'direction', 'ltr',
              'children', jsonb_build_array(
                jsonb_build_object(
                  'type', 'text', 'text', t, 'detail', 0, 'format', 0,
                  'mode', 'normal', 'style', '', 'version', 1
                )
              )
            )
          )
        )
      )
    END;
  $$ LANGUAGE sql IMMUTABLE;

  ALTER TABLE "pages_blocks_feature_statement_grid" ALTER COLUMN "statement" SET DATA TYPE jsonb USING pg_temp.__sas_text_to_lexical("statement");
  ALTER TABLE "pages_blocks_feature_heading_offset" ALTER COLUMN "body" SET DATA TYPE jsonb USING pg_temp.__sas_text_to_lexical("body");
  ALTER TABLE "pages_blocks_feature_tabs_tabs" ALTER COLUMN "description" SET DATA TYPE jsonb USING pg_temp.__sas_text_to_lexical("description");
  ALTER TABLE "image_statement" ALTER COLUMN "caption" SET DATA TYPE jsonb USING pg_temp.__sas_text_to_lexical("caption");
  ALTER TABLE "_pages_v_blocks_feature_statement_grid" ALTER COLUMN "statement" SET DATA TYPE jsonb USING pg_temp.__sas_text_to_lexical("statement");
  ALTER TABLE "_pages_v_blocks_feature_heading_offset" ALTER COLUMN "body" SET DATA TYPE jsonb USING pg_temp.__sas_text_to_lexical("body");
  ALTER TABLE "_pages_v_blocks_feature_tabs_tabs" ALTER COLUMN "description" SET DATA TYPE jsonb USING pg_temp.__sas_text_to_lexical("description");
  ALTER TABLE "_image_statement_v" ALTER COLUMN "caption" SET DATA TYPE jsonb USING pg_temp.__sas_text_to_lexical("caption");
  ALTER TABLE "expertise_pages_blocks_feature_statement_grid" ALTER COLUMN "statement" SET DATA TYPE jsonb USING pg_temp.__sas_text_to_lexical("statement");
  ALTER TABLE "expertise_pages_blocks_feature_heading_offset" ALTER COLUMN "body" SET DATA TYPE jsonb USING pg_temp.__sas_text_to_lexical("body");
  ALTER TABLE "expertise_pages_blocks_feature_tabs_tabs" ALTER COLUMN "description" SET DATA TYPE jsonb USING pg_temp.__sas_text_to_lexical("description");
  ALTER TABLE "_expertise_pages_v_blocks_feature_statement_grid" ALTER COLUMN "statement" SET DATA TYPE jsonb USING pg_temp.__sas_text_to_lexical("statement");
  ALTER TABLE "_expertise_pages_v_blocks_feature_heading_offset" ALTER COLUMN "body" SET DATA TYPE jsonb USING pg_temp.__sas_text_to_lexical("body");
  ALTER TABLE "_expertise_pages_v_blocks_feature_tabs_tabs" ALTER COLUMN "description" SET DATA TYPE jsonb USING pg_temp.__sas_text_to_lexical("description");
  ALTER TABLE "audience_pages_blocks_feature_statement_grid" ALTER COLUMN "statement" SET DATA TYPE jsonb USING pg_temp.__sas_text_to_lexical("statement");
  ALTER TABLE "audience_pages_blocks_feature_heading_offset" ALTER COLUMN "body" SET DATA TYPE jsonb USING pg_temp.__sas_text_to_lexical("body");
  ALTER TABLE "audience_pages_blocks_feature_tabs_tabs" ALTER COLUMN "description" SET DATA TYPE jsonb USING pg_temp.__sas_text_to_lexical("description");
  ALTER TABLE "_audience_pages_v_blocks_feature_statement_grid" ALTER COLUMN "statement" SET DATA TYPE jsonb USING pg_temp.__sas_text_to_lexical("statement");
  ALTER TABLE "_audience_pages_v_blocks_feature_heading_offset" ALTER COLUMN "body" SET DATA TYPE jsonb USING pg_temp.__sas_text_to_lexical("body");
  ALTER TABLE "_audience_pages_v_blocks_feature_tabs_tabs" ALTER COLUMN "description" SET DATA TYPE jsonb USING pg_temp.__sas_text_to_lexical("description");
  ALTER TABLE "pages_blocks_feature_statement_grid" ADD COLUMN "source" "enum_pages_blocks_feature_statement_grid_source" DEFAULT 'custom';
  ALTER TABLE "pages_blocks_feature_heading_offset" ADD COLUMN "source" "enum_pages_blocks_feature_heading_offset_source" DEFAULT 'custom';
  ALTER TABLE "pages_blocks_feature_tabs_tabs" ADD COLUMN "source" "enum_pages_blocks_feature_tabs_tabs_source" DEFAULT 'custom';
  ALTER TABLE "image_statement" ADD COLUMN "source" "enum_image_statement_source" DEFAULT 'custom';
  ALTER TABLE "_pages_v_blocks_feature_statement_grid" ADD COLUMN "source" "enum__pages_v_blocks_feature_statement_grid_source" DEFAULT 'custom';
  ALTER TABLE "_pages_v_blocks_feature_heading_offset" ADD COLUMN "source" "enum__pages_v_blocks_feature_heading_offset_source" DEFAULT 'custom';
  ALTER TABLE "_pages_v_blocks_feature_tabs_tabs" ADD COLUMN "source" "enum__pages_v_blocks_feature_tabs_tabs_source" DEFAULT 'custom';
  ALTER TABLE "_image_statement_v" ADD COLUMN "source" "enum__image_statement_v_source" DEFAULT 'custom';
  ALTER TABLE "expertise_pages_blocks_feature_statement_grid" ADD COLUMN "source" "enum_expertise_pages_blocks_feature_statement_grid_source" DEFAULT 'custom';
  ALTER TABLE "expertise_pages_blocks_feature_heading_offset" ADD COLUMN "source" "enum_expertise_pages_blocks_feature_heading_offset_source" DEFAULT 'custom';
  ALTER TABLE "expertise_pages_blocks_feature_tabs_tabs" ADD COLUMN "source" "enum_expertise_pages_blocks_feature_tabs_tabs_source" DEFAULT 'custom';
  ALTER TABLE "_expertise_pages_v_blocks_feature_statement_grid" ADD COLUMN "source" "enum__expertise_pages_v_blocks_feature_statement_grid_source" DEFAULT 'custom';
  ALTER TABLE "_expertise_pages_v_blocks_feature_heading_offset" ADD COLUMN "source" "enum__expertise_pages_v_blocks_feature_heading_offset_source" DEFAULT 'custom';
  ALTER TABLE "_expertise_pages_v_blocks_feature_tabs_tabs" ADD COLUMN "source" "enum__expertise_pages_v_blocks_feature_tabs_tabs_source" DEFAULT 'custom';
  ALTER TABLE "audience_pages_blocks_feature_statement_grid" ADD COLUMN "source" "enum_audience_pages_blocks_feature_statement_grid_source" DEFAULT 'custom';
  ALTER TABLE "audience_pages_blocks_feature_heading_offset" ADD COLUMN "source" "enum_audience_pages_blocks_feature_heading_offset_source" DEFAULT 'custom';
  ALTER TABLE "audience_pages_blocks_feature_tabs_tabs" ADD COLUMN "source" "enum_audience_pages_blocks_feature_tabs_tabs_source" DEFAULT 'custom';
  ALTER TABLE "_audience_pages_v_blocks_feature_statement_grid" ADD COLUMN "source" "enum__audience_pages_v_blocks_feature_statement_grid_source" DEFAULT 'custom';
  ALTER TABLE "_audience_pages_v_blocks_feature_heading_offset" ADD COLUMN "source" "enum__audience_pages_v_blocks_feature_heading_offset_source" DEFAULT 'custom';
  ALTER TABLE "_audience_pages_v_blocks_feature_tabs_tabs" ADD COLUMN "source" "enum__audience_pages_v_blocks_feature_tabs_tabs_source" DEFAULT 'custom';
  ALTER TABLE "media" ADD COLUMN "all_channels" boolean DEFAULT false;
  ALTER TABLE "split_narrow" ADD CONSTRAINT "split_narrow_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "split_narrow" ADD CONSTRAINT "split_narrow_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_split_narrow_v" ADD CONSTRAINT "_split_narrow_v_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_split_narrow_v" ADD CONSTRAINT "_split_narrow_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "work_pages_blocks_feature_heading_offset" ADD CONSTRAINT "work_pages_blocks_feature_heading_offset_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."work_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "work_pages_blocks_feature_statement_grid_cards" ADD CONSTRAINT "work_pages_blocks_feature_statement_grid_cards_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "work_pages_blocks_feature_statement_grid_cards" ADD CONSTRAINT "work_pages_blocks_feature_statement_grid_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."work_pages_blocks_feature_statement_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "work_pages_blocks_feature_statement_grid" ADD CONSTRAINT "work_pages_blocks_feature_statement_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."work_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "work_pages_blocks_feature_tabs_tabs_items" ADD CONSTRAINT "work_pages_blocks_feature_tabs_tabs_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."work_pages_blocks_feature_tabs_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "work_pages_blocks_feature_tabs_tabs" ADD CONSTRAINT "work_pages_blocks_feature_tabs_tabs_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "work_pages_blocks_feature_tabs_tabs" ADD CONSTRAINT "work_pages_blocks_feature_tabs_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."work_pages_blocks_feature_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "work_pages_blocks_feature_tabs" ADD CONSTRAINT "work_pages_blocks_feature_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."work_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_work_pages_v_blocks_feature_heading_offset" ADD CONSTRAINT "_work_pages_v_blocks_feature_heading_offset_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_work_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_work_pages_v_blocks_feature_statement_grid_cards" ADD CONSTRAINT "_work_pages_v_blocks_feature_statement_grid_cards_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_work_pages_v_blocks_feature_statement_grid_cards" ADD CONSTRAINT "_work_pages_v_blocks_feature_statement_grid_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_work_pages_v_blocks_feature_statement_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_work_pages_v_blocks_feature_statement_grid" ADD CONSTRAINT "_work_pages_v_blocks_feature_statement_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_work_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_work_pages_v_blocks_feature_tabs_tabs_items" ADD CONSTRAINT "_work_pages_v_blocks_feature_tabs_tabs_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_work_pages_v_blocks_feature_tabs_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_work_pages_v_blocks_feature_tabs_tabs" ADD CONSTRAINT "_work_pages_v_blocks_feature_tabs_tabs_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_work_pages_v_blocks_feature_tabs_tabs" ADD CONSTRAINT "_work_pages_v_blocks_feature_tabs_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_work_pages_v_blocks_feature_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_work_pages_v_blocks_feature_tabs" ADD CONSTRAINT "_work_pages_v_blocks_feature_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_work_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "split_narrow_order_idx" ON "split_narrow" USING btree ("_order");
  CREATE INDEX "split_narrow_parent_id_idx" ON "split_narrow" USING btree ("_parent_id");
  CREATE INDEX "split_narrow_path_idx" ON "split_narrow" USING btree ("_path");
  CREATE INDEX "split_narrow_media_idx" ON "split_narrow" USING btree ("media_id");
  CREATE INDEX "_split_narrow_v_order_idx" ON "_split_narrow_v" USING btree ("_order");
  CREATE INDEX "_split_narrow_v_parent_id_idx" ON "_split_narrow_v" USING btree ("_parent_id");
  CREATE INDEX "_split_narrow_v_path_idx" ON "_split_narrow_v" USING btree ("_path");
  CREATE INDEX "_split_narrow_v_media_idx" ON "_split_narrow_v" USING btree ("media_id");
  CREATE INDEX "work_pages_blocks_feature_heading_offset_order_idx" ON "work_pages_blocks_feature_heading_offset" USING btree ("_order");
  CREATE INDEX "work_pages_blocks_feature_heading_offset_parent_id_idx" ON "work_pages_blocks_feature_heading_offset" USING btree ("_parent_id");
  CREATE INDEX "work_pages_blocks_feature_heading_offset_path_idx" ON "work_pages_blocks_feature_heading_offset" USING btree ("_path");
  CREATE INDEX "work_pages_blocks_feature_statement_grid_cards_order_idx" ON "work_pages_blocks_feature_statement_grid_cards" USING btree ("_order");
  CREATE INDEX "work_pages_blocks_feature_statement_grid_cards_parent_id_idx" ON "work_pages_blocks_feature_statement_grid_cards" USING btree ("_parent_id");
  CREATE INDEX "work_pages_blocks_feature_statement_grid_cards_media_idx" ON "work_pages_blocks_feature_statement_grid_cards" USING btree ("media_id");
  CREATE INDEX "work_pages_blocks_feature_statement_grid_order_idx" ON "work_pages_blocks_feature_statement_grid" USING btree ("_order");
  CREATE INDEX "work_pages_blocks_feature_statement_grid_parent_id_idx" ON "work_pages_blocks_feature_statement_grid" USING btree ("_parent_id");
  CREATE INDEX "work_pages_blocks_feature_statement_grid_path_idx" ON "work_pages_blocks_feature_statement_grid" USING btree ("_path");
  CREATE INDEX "work_pages_blocks_feature_tabs_tabs_items_order_idx" ON "work_pages_blocks_feature_tabs_tabs_items" USING btree ("_order");
  CREATE INDEX "work_pages_blocks_feature_tabs_tabs_items_parent_id_idx" ON "work_pages_blocks_feature_tabs_tabs_items" USING btree ("_parent_id");
  CREATE INDEX "work_pages_blocks_feature_tabs_tabs_order_idx" ON "work_pages_blocks_feature_tabs_tabs" USING btree ("_order");
  CREATE INDEX "work_pages_blocks_feature_tabs_tabs_parent_id_idx" ON "work_pages_blocks_feature_tabs_tabs" USING btree ("_parent_id");
  CREATE INDEX "work_pages_blocks_feature_tabs_tabs_media_idx" ON "work_pages_blocks_feature_tabs_tabs" USING btree ("media_id");
  CREATE INDEX "work_pages_blocks_feature_tabs_order_idx" ON "work_pages_blocks_feature_tabs" USING btree ("_order");
  CREATE INDEX "work_pages_blocks_feature_tabs_parent_id_idx" ON "work_pages_blocks_feature_tabs" USING btree ("_parent_id");
  CREATE INDEX "work_pages_blocks_feature_tabs_path_idx" ON "work_pages_blocks_feature_tabs" USING btree ("_path");
  CREATE INDEX "_work_pages_v_blocks_feature_heading_offset_order_idx" ON "_work_pages_v_blocks_feature_heading_offset" USING btree ("_order");
  CREATE INDEX "_work_pages_v_blocks_feature_heading_offset_parent_id_idx" ON "_work_pages_v_blocks_feature_heading_offset" USING btree ("_parent_id");
  CREATE INDEX "_work_pages_v_blocks_feature_heading_offset_path_idx" ON "_work_pages_v_blocks_feature_heading_offset" USING btree ("_path");
  CREATE INDEX "_work_pages_v_blocks_feature_statement_grid_cards_order_idx" ON "_work_pages_v_blocks_feature_statement_grid_cards" USING btree ("_order");
  CREATE INDEX "_work_pages_v_blocks_feature_statement_grid_cards_parent_id_idx" ON "_work_pages_v_blocks_feature_statement_grid_cards" USING btree ("_parent_id");
  CREATE INDEX "_work_pages_v_blocks_feature_statement_grid_cards_media_idx" ON "_work_pages_v_blocks_feature_statement_grid_cards" USING btree ("media_id");
  CREATE INDEX "_work_pages_v_blocks_feature_statement_grid_order_idx" ON "_work_pages_v_blocks_feature_statement_grid" USING btree ("_order");
  CREATE INDEX "_work_pages_v_blocks_feature_statement_grid_parent_id_idx" ON "_work_pages_v_blocks_feature_statement_grid" USING btree ("_parent_id");
  CREATE INDEX "_work_pages_v_blocks_feature_statement_grid_path_idx" ON "_work_pages_v_blocks_feature_statement_grid" USING btree ("_path");
  CREATE INDEX "_work_pages_v_blocks_feature_tabs_tabs_items_order_idx" ON "_work_pages_v_blocks_feature_tabs_tabs_items" USING btree ("_order");
  CREATE INDEX "_work_pages_v_blocks_feature_tabs_tabs_items_parent_id_idx" ON "_work_pages_v_blocks_feature_tabs_tabs_items" USING btree ("_parent_id");
  CREATE INDEX "_work_pages_v_blocks_feature_tabs_tabs_order_idx" ON "_work_pages_v_blocks_feature_tabs_tabs" USING btree ("_order");
  CREATE INDEX "_work_pages_v_blocks_feature_tabs_tabs_parent_id_idx" ON "_work_pages_v_blocks_feature_tabs_tabs" USING btree ("_parent_id");
  CREATE INDEX "_work_pages_v_blocks_feature_tabs_tabs_media_idx" ON "_work_pages_v_blocks_feature_tabs_tabs" USING btree ("media_id");
  CREATE INDEX "_work_pages_v_blocks_feature_tabs_order_idx" ON "_work_pages_v_blocks_feature_tabs" USING btree ("_order");
  CREATE INDEX "_work_pages_v_blocks_feature_tabs_parent_id_idx" ON "_work_pages_v_blocks_feature_tabs" USING btree ("_parent_id");
  CREATE INDEX "_work_pages_v_blocks_feature_tabs_path_idx" ON "_work_pages_v_blocks_feature_tabs" USING btree ("_path");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "split_narrow" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_split_narrow_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "work_pages_blocks_feature_heading_offset" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "work_pages_blocks_feature_statement_grid_cards" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "work_pages_blocks_feature_statement_grid" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "work_pages_blocks_feature_tabs_tabs_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "work_pages_blocks_feature_tabs_tabs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "work_pages_blocks_feature_tabs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_work_pages_v_blocks_feature_heading_offset" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_work_pages_v_blocks_feature_statement_grid_cards" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_work_pages_v_blocks_feature_statement_grid" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_work_pages_v_blocks_feature_tabs_tabs_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_work_pages_v_blocks_feature_tabs_tabs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_work_pages_v_blocks_feature_tabs" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "split_narrow" CASCADE;
  DROP TABLE "_split_narrow_v" CASCADE;
  DROP TABLE "work_pages_blocks_feature_heading_offset" CASCADE;
  DROP TABLE "work_pages_blocks_feature_statement_grid_cards" CASCADE;
  DROP TABLE "work_pages_blocks_feature_statement_grid" CASCADE;
  DROP TABLE "work_pages_blocks_feature_tabs_tabs_items" CASCADE;
  DROP TABLE "work_pages_blocks_feature_tabs_tabs" CASCADE;
  DROP TABLE "work_pages_blocks_feature_tabs" CASCADE;
  DROP TABLE "_work_pages_v_blocks_feature_heading_offset" CASCADE;
  DROP TABLE "_work_pages_v_blocks_feature_statement_grid_cards" CASCADE;
  DROP TABLE "_work_pages_v_blocks_feature_statement_grid" CASCADE;
  DROP TABLE "_work_pages_v_blocks_feature_tabs_tabs_items" CASCADE;
  DROP TABLE "_work_pages_v_blocks_feature_tabs_tabs" CASCADE;
  DROP TABLE "_work_pages_v_blocks_feature_tabs" CASCADE;
  ALTER TABLE "pages_blocks_feature_statement_grid" ALTER COLUMN "statement" SET DATA TYPE varchar USING "statement"::text;
  ALTER TABLE "pages_blocks_feature_heading_offset" ALTER COLUMN "body" SET DATA TYPE varchar USING "body"::text;
  ALTER TABLE "pages_blocks_feature_tabs_tabs" ALTER COLUMN "description" SET DATA TYPE varchar USING "description"::text;
  ALTER TABLE "image_statement" ALTER COLUMN "caption" SET DATA TYPE varchar USING "caption"::text;
  ALTER TABLE "_pages_v_blocks_feature_statement_grid" ALTER COLUMN "statement" SET DATA TYPE varchar USING "statement"::text;
  ALTER TABLE "_pages_v_blocks_feature_heading_offset" ALTER COLUMN "body" SET DATA TYPE varchar USING "body"::text;
  ALTER TABLE "_pages_v_blocks_feature_tabs_tabs" ALTER COLUMN "description" SET DATA TYPE varchar USING "description"::text;
  ALTER TABLE "_image_statement_v" ALTER COLUMN "caption" SET DATA TYPE varchar USING "caption"::text;
  ALTER TABLE "expertise_pages_blocks_feature_statement_grid" ALTER COLUMN "statement" SET DATA TYPE varchar USING "statement"::text;
  ALTER TABLE "expertise_pages_blocks_feature_heading_offset" ALTER COLUMN "body" SET DATA TYPE varchar USING "body"::text;
  ALTER TABLE "expertise_pages_blocks_feature_tabs_tabs" ALTER COLUMN "description" SET DATA TYPE varchar USING "description"::text;
  ALTER TABLE "_expertise_pages_v_blocks_feature_statement_grid" ALTER COLUMN "statement" SET DATA TYPE varchar USING "statement"::text;
  ALTER TABLE "_expertise_pages_v_blocks_feature_heading_offset" ALTER COLUMN "body" SET DATA TYPE varchar USING "body"::text;
  ALTER TABLE "_expertise_pages_v_blocks_feature_tabs_tabs" ALTER COLUMN "description" SET DATA TYPE varchar USING "description"::text;
  ALTER TABLE "audience_pages_blocks_feature_statement_grid" ALTER COLUMN "statement" SET DATA TYPE varchar USING "statement"::text;
  ALTER TABLE "audience_pages_blocks_feature_heading_offset" ALTER COLUMN "body" SET DATA TYPE varchar USING "body"::text;
  ALTER TABLE "audience_pages_blocks_feature_tabs_tabs" ALTER COLUMN "description" SET DATA TYPE varchar USING "description"::text;
  ALTER TABLE "_audience_pages_v_blocks_feature_statement_grid" ALTER COLUMN "statement" SET DATA TYPE varchar USING "statement"::text;
  ALTER TABLE "_audience_pages_v_blocks_feature_heading_offset" ALTER COLUMN "body" SET DATA TYPE varchar USING "body"::text;
  ALTER TABLE "_audience_pages_v_blocks_feature_tabs_tabs" ALTER COLUMN "description" SET DATA TYPE varchar USING "description"::text;
  ALTER TABLE "pages_blocks_feature_statement_grid" DROP COLUMN "source";
  ALTER TABLE "pages_blocks_feature_heading_offset" DROP COLUMN "source";
  ALTER TABLE "pages_blocks_feature_tabs_tabs" DROP COLUMN "source";
  ALTER TABLE "image_statement" DROP COLUMN "source";
  ALTER TABLE "_pages_v_blocks_feature_statement_grid" DROP COLUMN "source";
  ALTER TABLE "_pages_v_blocks_feature_heading_offset" DROP COLUMN "source";
  ALTER TABLE "_pages_v_blocks_feature_tabs_tabs" DROP COLUMN "source";
  ALTER TABLE "_image_statement_v" DROP COLUMN "source";
  ALTER TABLE "expertise_pages_blocks_feature_statement_grid" DROP COLUMN "source";
  ALTER TABLE "expertise_pages_blocks_feature_heading_offset" DROP COLUMN "source";
  ALTER TABLE "expertise_pages_blocks_feature_tabs_tabs" DROP COLUMN "source";
  ALTER TABLE "_expertise_pages_v_blocks_feature_statement_grid" DROP COLUMN "source";
  ALTER TABLE "_expertise_pages_v_blocks_feature_heading_offset" DROP COLUMN "source";
  ALTER TABLE "_expertise_pages_v_blocks_feature_tabs_tabs" DROP COLUMN "source";
  ALTER TABLE "audience_pages_blocks_feature_statement_grid" DROP COLUMN "source";
  ALTER TABLE "audience_pages_blocks_feature_heading_offset" DROP COLUMN "source";
  ALTER TABLE "audience_pages_blocks_feature_tabs_tabs" DROP COLUMN "source";
  ALTER TABLE "_audience_pages_v_blocks_feature_statement_grid" DROP COLUMN "source";
  ALTER TABLE "_audience_pages_v_blocks_feature_heading_offset" DROP COLUMN "source";
  ALTER TABLE "_audience_pages_v_blocks_feature_tabs_tabs" DROP COLUMN "source";
  ALTER TABLE "media" DROP COLUMN "all_channels";
  DROP TYPE "public"."enum_pages_blocks_feature_statement_grid_source";
  DROP TYPE "public"."enum_pages_blocks_feature_heading_offset_source";
  DROP TYPE "public"."enum_pages_blocks_feature_tabs_tabs_source";
  DROP TYPE "public"."enum_image_statement_source";
  DROP TYPE "public"."enum_split_narrow_source";
  DROP TYPE "public"."enum_split_narrow_image_position";
  DROP TYPE "public"."enum_split_narrow_theme";
  DROP TYPE "public"."enum__pages_v_blocks_feature_statement_grid_source";
  DROP TYPE "public"."enum__pages_v_blocks_feature_heading_offset_source";
  DROP TYPE "public"."enum__pages_v_blocks_feature_tabs_tabs_source";
  DROP TYPE "public"."enum__image_statement_v_source";
  DROP TYPE "public"."enum__split_narrow_v_source";
  DROP TYPE "public"."enum__split_narrow_v_image_position";
  DROP TYPE "public"."enum__split_narrow_v_theme";
  DROP TYPE "public"."enum_work_pages_blocks_feature_heading_offset_source";
  DROP TYPE "public"."enum_work_pages_blocks_feature_statement_grid_source";
  DROP TYPE "public"."enum_work_pages_blocks_feature_tabs_tabs_source";
  DROP TYPE "public"."enum__work_pages_v_blocks_feature_heading_offset_source";
  DROP TYPE "public"."enum__work_pages_v_blocks_feature_statement_grid_source";
  DROP TYPE "public"."enum__work_pages_v_blocks_feature_tabs_tabs_source";
  DROP TYPE "public"."enum_expertise_pages_blocks_feature_statement_grid_source";
  DROP TYPE "public"."enum_expertise_pages_blocks_feature_heading_offset_source";
  DROP TYPE "public"."enum_expertise_pages_blocks_feature_tabs_tabs_source";
  DROP TYPE "public"."enum__expertise_pages_v_blocks_feature_statement_grid_source";
  DROP TYPE "public"."enum__expertise_pages_v_blocks_feature_heading_offset_source";
  DROP TYPE "public"."enum__expertise_pages_v_blocks_feature_tabs_tabs_source";
  DROP TYPE "public"."enum_audience_pages_blocks_feature_statement_grid_source";
  DROP TYPE "public"."enum_audience_pages_blocks_feature_heading_offset_source";
  DROP TYPE "public"."enum_audience_pages_blocks_feature_tabs_tabs_source";
  DROP TYPE "public"."enum__audience_pages_v_blocks_feature_statement_grid_source";
  DROP TYPE "public"."enum__audience_pages_v_blocks_feature_heading_offset_source";
  DROP TYPE "public"."enum__audience_pages_v_blocks_feature_tabs_tabs_source";`)
}
