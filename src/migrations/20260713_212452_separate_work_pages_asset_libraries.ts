import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_wp_story_source" AS ENUM('context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings', 'custom');
  CREATE TYPE "public"."enum_wp_story_layout" AS ENUM('text-only', 'text-left', 'text-right', 'centered', 'sticky-media');
  CREATE TYPE "public"."enum_wp_story_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_wp_story_width" AS ENUM('narrow', 'standard', 'wide');
  CREATE TYPE "public"."enum_wp_media_layout" AS ENUM('single', 'grid', 'horizontal', 'stacked', 'full-bleed', 'comparison');
  CREATE TYPE "public"."enum_wp_media_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_wp_decisions_source" AS ENUM('featured', 'all');
  CREATE TYPE "public"."enum_wp_decisions_layout" AS ENUM('list', 'cards', 'editorial', 'sticky');
  CREATE TYPE "public"."enum_wp_decisions_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_wp_metrics_source" AS ENUM('featured-public', 'all-public');
  CREATE TYPE "public"."enum_wp_metrics_layout" AS ENUM('grid', 'row', 'statement', 'editorial');
  CREATE TYPE "public"."enum_wp_metrics_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_wp_quote_layout" AS ENUM('editorial', 'centered', 'split', 'compact');
  CREATE TYPE "public"."enum_wp_quote_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_wp_transition_layout" AS ENUM('left', 'centered', 'split', 'statement');
  CREATE TYPE "public"."enum_wp_transition_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_wp_related_selection_mode" AS ENUM('document-settings', 'automatic-capability-match');
  CREATE TYPE "public"."enum_wp_related_layout" AS ENUM('grid', 'list', 'feature');
  CREATE TYPE "public"."enum_work_pages_hero_layout" AS ENUM('editorial-split', 'centered', 'immersive', 'media-led');
  CREATE TYPE "public"."enum_work_pages_hero_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_work_pages_hero_media_treatment" AS ENUM('contained', 'full-bleed', 'floating', 'background');
  CREATE TYPE "public"."enum_work_pages_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__wp_story_v_source" AS ENUM('context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings', 'custom');
  CREATE TYPE "public"."enum__wp_story_v_layout" AS ENUM('text-only', 'text-left', 'text-right', 'centered', 'sticky-media');
  CREATE TYPE "public"."enum__wp_story_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum__wp_story_v_width" AS ENUM('narrow', 'standard', 'wide');
  CREATE TYPE "public"."enum__wp_media_v_layout" AS ENUM('single', 'grid', 'horizontal', 'stacked', 'full-bleed', 'comparison');
  CREATE TYPE "public"."enum__wp_media_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum__wp_decisions_v_source" AS ENUM('featured', 'all');
  CREATE TYPE "public"."enum__wp_decisions_v_layout" AS ENUM('list', 'cards', 'editorial', 'sticky');
  CREATE TYPE "public"."enum__wp_decisions_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum__wp_metrics_v_source" AS ENUM('featured-public', 'all-public');
  CREATE TYPE "public"."enum__wp_metrics_v_layout" AS ENUM('grid', 'row', 'statement', 'editorial');
  CREATE TYPE "public"."enum__wp_metrics_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum__wp_quote_v_layout" AS ENUM('editorial', 'centered', 'split', 'compact');
  CREATE TYPE "public"."enum__wp_quote_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum__wp_transition_v_layout" AS ENUM('left', 'centered', 'split', 'statement');
  CREATE TYPE "public"."enum__wp_transition_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum__wp_related_v_selection_mode" AS ENUM('document-settings', 'automatic-capability-match');
  CREATE TYPE "public"."enum__wp_related_v_layout" AS ENUM('grid', 'list', 'feature');
  CREATE TYPE "public"."enum__work_pages_v_version_hero_layout" AS ENUM('editorial-split', 'centered', 'immersive', 'media-led');
  CREATE TYPE "public"."enum__work_pages_v_version_hero_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum__work_pages_v_version_hero_media_treatment" AS ENUM('contained', 'full-bleed', 'floating', 'background');
  CREATE TYPE "public"."enum__work_pages_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_asset_libraries_library_status" AS ENUM('active', 'archived');
  CREATE TABLE "wp_story" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"source" "enum_wp_story_source" DEFAULT 'context',
  	"eyebrow" varchar,
  	"heading_override" varchar,
  	"body_override" jsonb,
  	"custom_body" jsonb,
  	"media_id" integer,
  	"layout" "enum_wp_story_layout" DEFAULT 'text-only',
  	"theme" "enum_wp_story_theme" DEFAULT 'light',
  	"width" "enum_wp_story_width" DEFAULT 'standard',
  	"block_name" varchar
  );
  
  CREATE TABLE "wp_media" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"introduction" jsonb,
  	"layout" "enum_wp_media_layout" DEFAULT 'grid',
  	"theme" "enum_wp_media_theme" DEFAULT 'light',
  	"show_captions" boolean DEFAULT true,
  	"show_credits" boolean DEFAULT true,
  	"block_name" varchar
  );
  
  CREATE TABLE "wp_decisions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"introduction" jsonb,
  	"source" "enum_wp_decisions_source" DEFAULT 'featured',
  	"layout" "enum_wp_decisions_layout" DEFAULT 'cards',
  	"theme" "enum_wp_decisions_theme" DEFAULT 'light',
  	"block_name" varchar
  );
  
  CREATE TABLE "wp_metrics" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"introduction" jsonb,
  	"source" "enum_wp_metrics_source" DEFAULT 'featured-public',
  	"layout" "enum_wp_metrics_layout" DEFAULT 'grid',
  	"theme" "enum_wp_metrics_theme" DEFAULT 'light',
  	"block_name" varchar
  );
  
  CREATE TABLE "wp_quote" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"testimonial_id" integer,
  	"layout" "enum_wp_quote_layout" DEFAULT 'editorial',
  	"theme" "enum_wp_quote_theme" DEFAULT 'light',
  	"show_portrait" boolean DEFAULT true,
  	"block_name" varchar
  );
  
  CREATE TABLE "wp_transition" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" jsonb,
  	"layout" "enum_wp_transition_layout" DEFAULT 'centered',
  	"theme" "enum_wp_transition_theme" DEFAULT 'light',
  	"block_name" varchar
  );
  
  CREATE TABLE "wp_related" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar DEFAULT 'Related work',
  	"selection_mode" "enum_wp_related_selection_mode" DEFAULT 'document-settings',
  	"limit" numeric DEFAULT 3,
  	"layout" "enum_wp_related_layout" DEFAULT 'grid',
  	"block_name" varchar
  );
  
  CREATE TABLE "work_pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"case_study_id" integer,
  	"hero_eyebrow" varchar,
  	"hero_title_override" varchar,
  	"hero_summary_override" varchar,
  	"hero_media_id" integer,
  	"hero_layout" "enum_work_pages_hero_layout" DEFAULT 'editorial-split',
  	"hero_theme" "enum_work_pages_hero_theme" DEFAULT 'light',
  	"hero_media_treatment" "enum_work_pages_hero_media_treatment" DEFAULT 'contained',
  	"cover_asset_id" integer,
  	"editorial_notes" varchar,
  	"meta_title" varchar,
  	"meta_image_id" integer,
  	"meta_description" varchar,
  	"featured" boolean DEFAULT false,
  	"published_at" timestamp(3) with time zone,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_work_pages_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "work_pages_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer,
  	"work_pages_id" integer
  );
  
  CREATE TABLE "_wp_story_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"source" "enum__wp_story_v_source" DEFAULT 'context',
  	"eyebrow" varchar,
  	"heading_override" varchar,
  	"body_override" jsonb,
  	"custom_body" jsonb,
  	"media_id" integer,
  	"layout" "enum__wp_story_v_layout" DEFAULT 'text-only',
  	"theme" "enum__wp_story_v_theme" DEFAULT 'light',
  	"width" "enum__wp_story_v_width" DEFAULT 'standard',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_wp_media_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"introduction" jsonb,
  	"layout" "enum__wp_media_v_layout" DEFAULT 'grid',
  	"theme" "enum__wp_media_v_theme" DEFAULT 'light',
  	"show_captions" boolean DEFAULT true,
  	"show_credits" boolean DEFAULT true,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_wp_decisions_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"introduction" jsonb,
  	"source" "enum__wp_decisions_v_source" DEFAULT 'featured',
  	"layout" "enum__wp_decisions_v_layout" DEFAULT 'cards',
  	"theme" "enum__wp_decisions_v_theme" DEFAULT 'light',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_wp_metrics_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"introduction" jsonb,
  	"source" "enum__wp_metrics_v_source" DEFAULT 'featured-public',
  	"layout" "enum__wp_metrics_v_layout" DEFAULT 'grid',
  	"theme" "enum__wp_metrics_v_theme" DEFAULT 'light',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_wp_quote_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"testimonial_id" integer,
  	"layout" "enum__wp_quote_v_layout" DEFAULT 'editorial',
  	"theme" "enum__wp_quote_v_theme" DEFAULT 'light',
  	"show_portrait" boolean DEFAULT true,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_wp_transition_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" jsonb,
  	"layout" "enum__wp_transition_v_layout" DEFAULT 'centered',
  	"theme" "enum__wp_transition_v_theme" DEFAULT 'light',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_wp_related_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar DEFAULT 'Related work',
  	"selection_mode" "enum__wp_related_v_selection_mode" DEFAULT 'document-settings',
  	"limit" numeric DEFAULT 3,
  	"layout" "enum__wp_related_v_layout" DEFAULT 'grid',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_work_pages_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_case_study_id" integer,
  	"version_hero_eyebrow" varchar,
  	"version_hero_title_override" varchar,
  	"version_hero_summary_override" varchar,
  	"version_hero_media_id" integer,
  	"version_hero_layout" "enum__work_pages_v_version_hero_layout" DEFAULT 'editorial-split',
  	"version_hero_theme" "enum__work_pages_v_version_hero_theme" DEFAULT 'light',
  	"version_hero_media_treatment" "enum__work_pages_v_version_hero_media_treatment" DEFAULT 'contained',
  	"version_cover_asset_id" integer,
  	"version_editorial_notes" varchar,
  	"version_meta_title" varchar,
  	"version_meta_image_id" integer,
  	"version_meta_description" varchar,
  	"version_featured" boolean DEFAULT false,
  	"version_published_at" timestamp(3) with time zone,
  	"version_generate_slug" boolean DEFAULT true,
  	"version_slug" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__work_pages_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_work_pages_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer,
  	"work_pages_id" integer
  );
  
  CREATE TABLE "asset_libraries" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar NOT NULL,
  	"organization_id" integer NOT NULL,
  	"project_id" integer NOT NULL,
  	"root_folder_id" integer,
  	"description" varchar,
  	"library_status" "enum_asset_libraries_library_status" DEFAULT 'active' NOT NULL,
  	"usage_notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  -- Preserve the existing editorial surface before removing website fields from Case Studies.
  -- IDs intentionally match the source Case Study so block parents and related-work references remain stable.
  INSERT INTO "work_pages" (
    "id", "title", "case_study_id", "hero_eyebrow", "hero_title_override",
    "hero_summary_override", "hero_media_id", "hero_layout", "hero_theme",
    "hero_media_treatment", "cover_asset_id", "editorial_notes", "meta_title",
    "meta_image_id", "meta_description", "featured", "published_at", "generate_slug",
    "slug", "updated_at", "created_at", "_status"
  )
  SELECT
    "id", "title", "id", "website_hero_eyebrow", "website_hero_title_override",
    "website_hero_summary_override", "website_hero_media_id",
    "website_hero_layout"::text::"enum_work_pages_hero_layout",
    "website_hero_theme"::text::"enum_work_pages_hero_theme",
    "website_hero_media_treatment"::text::"enum_work_pages_hero_media_treatment",
    "cover_asset_id", "website_notes", "meta_title", "meta_image_id", "meta_description",
    "featured", "published_at", "generate_slug", "slug", "updated_at", "created_at",
    CASE
      WHEN "website_enabled" = true AND "_status" = 'published'
        THEN 'published'::"enum_work_pages_status"
      ELSE 'draft'::"enum_work_pages_status"
    END
  FROM "case_studies";

  SELECT setval(
    pg_get_serial_sequence('work_pages', 'id'),
    GREATEST(COALESCE((SELECT MAX("id") FROM "work_pages"), 1), 1),
    true
  );

  INSERT INTO "wp_story"
  SELECT "_order", "_parent_id", replace("_path", 'websiteLayout', 'layout'), "id",
    "source"::text::"enum_wp_story_source", "eyebrow", "heading_override", "body_override",
    "custom_body", "media_id", "layout"::text::"enum_wp_story_layout",
    "theme"::text::"enum_wp_story_theme", "width"::text::"enum_wp_story_width", "block_name"
  FROM "cs_story";

  INSERT INTO "wp_media"
  SELECT "_order", "_parent_id", replace("_path", 'websiteLayout', 'layout'), "id", "heading",
    "introduction", "layout"::text::"enum_wp_media_layout",
    "theme"::text::"enum_wp_media_theme", "show_captions", "show_credits", "block_name"
  FROM "cs_media";

  INSERT INTO "wp_decisions"
  SELECT "_order", "_parent_id", replace("_path", 'websiteLayout', 'layout'), "id", "heading",
    "introduction", "source"::text::"enum_wp_decisions_source",
    "layout"::text::"enum_wp_decisions_layout", "theme"::text::"enum_wp_decisions_theme", "block_name"
  FROM "cs_decisions";

  INSERT INTO "wp_metrics"
  SELECT "_order", "_parent_id", replace("_path", 'websiteLayout', 'layout'), "id", "heading",
    "introduction", "source"::text::"enum_wp_metrics_source",
    "layout"::text::"enum_wp_metrics_layout", "theme"::text::"enum_wp_metrics_theme", "block_name"
  FROM "cs_metrics";

  INSERT INTO "wp_quote"
  SELECT "_order", "_parent_id", replace("_path", 'websiteLayout', 'layout'), "id",
    "testimonial_id", "layout"::text::"enum_wp_quote_layout",
    "theme"::text::"enum_wp_quote_theme", "show_portrait", "block_name"
  FROM "cs_quote";

  INSERT INTO "wp_transition"
  SELECT "_order", "_parent_id", replace("_path", 'websiteLayout', 'layout'), "id", "eyebrow",
    "heading", "body", "layout"::text::"enum_wp_transition_layout",
    "theme"::text::"enum_wp_transition_theme", "block_name"
  FROM "cs_transition";

  INSERT INTO "wp_related"
  SELECT "_order", "_parent_id", replace("_path", 'websiteLayout', 'layout'), "id", "heading",
    "selection_mode"::text::"enum_wp_related_selection_mode", "limit",
    "layout"::text::"enum_wp_related_layout", "block_name"
  FROM "cs_related";

  INSERT INTO "work_pages_rels" ("order", "parent_id", "path", "media_id", "work_pages_id")
  SELECT
    "order", "parent_id",
    CASE
      WHEN "path" LIKE 'websiteLayout%' THEN replace("path", 'websiteLayout', 'layout')
      WHEN "path" = 'relatedCaseStudies' THEN 'relatedWorkPages'
      ELSE "path"
    END,
    "media_id", "case_studies_id"
  FROM "case_studies_rels"
  WHERE
    ("media_id" IS NOT NULL AND ("path" LIKE 'websiteLayout%' OR "path" = 'downloadableAssets'))
    OR ("case_studies_id" IS NOT NULL AND "path" = 'relatedCaseStudies');

  -- One imported library per project keeps the previous project ownership intact.
  INSERT INTO "asset_libraries" (
    "id", "name", "generate_slug", "slug", "organization_id", "project_id",
    "library_status", "updated_at", "created_at"
  )
  SELECT DISTINCT ON (p."id")
    p."id", COALESCE(p."public_title", p."internal_title", 'Project') || ' Asset Library',
    false, 'project-' || p."id" || '-assets', p."organization_id", p."id",
    'active'::"enum_asset_libraries_library_status", now(), now()
  FROM "projects" p
  INNER JOIN "case_studies" cs ON cs."project_id" = p."id"
  WHERE p."organization_id" IS NOT NULL;

  SELECT setval(
    pg_get_serial_sequence('asset_libraries', 'id'),
    GREATEST(COALESCE((SELECT MAX("id") FROM "asset_libraries"), 1), 1),
    true
  );
  
  ALTER TABLE "cs_story" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "cs_media" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "cs_decisions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "cs_metrics" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "cs_quote" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "cs_transition" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "cs_related" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_cs_story_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_cs_media_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_cs_decisions_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_cs_metrics_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_cs_quote_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_cs_transition_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_cs_related_v" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "cs_story" CASCADE;
  DROP TABLE "cs_media" CASCADE;
  DROP TABLE "cs_decisions" CASCADE;
  DROP TABLE "cs_metrics" CASCADE;
  DROP TABLE "cs_quote" CASCADE;
  DROP TABLE "cs_transition" CASCADE;
  DROP TABLE "cs_related" CASCADE;
  DROP TABLE "_cs_story_v" CASCADE;
  DROP TABLE "_cs_media_v" CASCADE;
  DROP TABLE "_cs_decisions_v" CASCADE;
  DROP TABLE "_cs_metrics_v" CASCADE;
  DROP TABLE "_cs_quote_v" CASCADE;
  DROP TABLE "_cs_transition_v" CASCADE;
  DROP TABLE "_cs_related_v" CASCADE;
  ALTER TABLE "case_studies" DROP CONSTRAINT "case_studies_cover_asset_id_media_id_fk";
  
  ALTER TABLE "case_studies" DROP CONSTRAINT "case_studies_website_hero_media_id_media_id_fk";
  
  ALTER TABLE "case_studies" DROP CONSTRAINT "case_studies_meta_image_id_media_id_fk";
  
  ALTER TABLE "case_studies_rels" DROP CONSTRAINT "case_studies_rels_media_fk";
  
  ALTER TABLE "case_studies_rels" DROP CONSTRAINT "case_studies_rels_case_studies_fk";
  
  ALTER TABLE "_case_studies_v" DROP CONSTRAINT "_case_studies_v_version_cover_asset_id_media_id_fk";
  
  ALTER TABLE "_case_studies_v" DROP CONSTRAINT "_case_studies_v_version_website_hero_media_id_media_id_fk";
  
  ALTER TABLE "_case_studies_v" DROP CONSTRAINT "_case_studies_v_version_meta_image_id_media_id_fk";
  
  ALTER TABLE "_case_studies_v_rels" DROP CONSTRAINT "_case_studies_v_rels_media_fk";
  
  ALTER TABLE "_case_studies_v_rels" DROP CONSTRAINT "_case_studies_v_rels_case_studies_fk";
  
  ALTER TABLE "redirects_rels" DROP CONSTRAINT "redirects_rels_case_studies_fk";
  
  DROP INDEX "case_studies_cover_asset_idx";
  DROP INDEX "case_studies_website_hero_website_hero_media_idx";
  DROP INDEX "case_studies_meta_meta_image_idx";
  DROP INDEX "case_studies_slug_idx";
  DROP INDEX "case_studies_rels_media_id_idx";
  DROP INDEX "case_studies_rels_case_studies_id_idx";
  DROP INDEX "_case_studies_v_version_version_cover_asset_idx";
  DROP INDEX "_case_studies_v_version_website_hero_version_website_her_idx";
  DROP INDEX "_case_studies_v_version_meta_version_meta_image_idx";
  DROP INDEX "_case_studies_v_version_version_slug_idx";
  DROP INDEX "_case_studies_v_rels_media_id_idx";
  DROP INDEX "_case_studies_v_rels_case_studies_id_idx";
  DROP INDEX "redirects_rels_case_studies_id_idx";
  ALTER TABLE "case_studies" ADD COLUMN "generate_key" boolean DEFAULT true;
  ALTER TABLE "case_studies" ADD COLUMN "key" varchar;
  ALTER TABLE "case_studies_rels" ADD COLUMN "asset_libraries_id" integer;
  ALTER TABLE "_case_studies_v" ADD COLUMN "version_generate_key" boolean DEFAULT true;
  ALTER TABLE "_case_studies_v" ADD COLUMN "version_key" varchar;
  ALTER TABLE "_case_studies_v_rels" ADD COLUMN "asset_libraries_id" integer;
  ALTER TABLE "media" ADD COLUMN "asset_library_id" integer;
  ALTER TABLE "redirects_rels" ADD COLUMN "work_pages_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "work_pages_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "asset_libraries_id" integer;

  -- Complete the canonical/surface split after the new relationship columns exist.
  UPDATE "case_studies"
  SET "key" = "slug", "generate_key" = "generate_slug";

  UPDATE "_case_studies_v"
  SET "version_key" = "version_slug", "version_generate_key" = "version_generate_slug";

  INSERT INTO "case_studies_rels" ("order", "parent_id", "path", "asset_libraries_id")
  SELECT 1, cs."id", 'assetLibraries', cs."project_id"
  FROM "case_studies" cs
  INNER JOIN "asset_libraries" libraries ON libraries."id" = cs."project_id";

  INSERT INTO "_case_studies_v_rels" ("order", "parent_id", "path", "asset_libraries_id")
  SELECT 1, versions."id", 'assetLibraries', versions."version_project_id"
  FROM "_case_studies_v" versions
  INNER JOIN "asset_libraries" libraries ON libraries."id" = versions."version_project_id";

  UPDATE "media" media
  SET "asset_library_id" = media."project_id"
  FROM "asset_libraries" libraries
  WHERE media."project_id" = libraries."id" AND media."asset_library_id" IS NULL;

  UPDATE "media" media
  SET "asset_library_id" = cs."project_id"
  FROM "work_pages" pages
  INNER JOIN "case_studies" cs ON cs."id" = pages."case_study_id"
  WHERE media."asset_library_id" IS NULL
    AND (
      media."id" IN (pages."hero_media_id", pages."cover_asset_id", pages."meta_image_id")
      OR EXISTS (SELECT 1 FROM "wp_story" story WHERE story."_parent_id" = pages."id" AND story."media_id" = media."id")
      OR EXISTS (SELECT 1 FROM "work_pages_rels" rels WHERE rels."parent_id" = pages."id" AND rels."media_id" = media."id")
    );

  UPDATE "redirects_rels"
  SET "work_pages_id" = "case_studies_id"
  WHERE "case_studies_id" IS NOT NULL;
  ALTER TABLE "wp_story" ADD CONSTRAINT "wp_story_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "wp_story" ADD CONSTRAINT "wp_story_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."work_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "wp_media" ADD CONSTRAINT "wp_media_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."work_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "wp_decisions" ADD CONSTRAINT "wp_decisions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."work_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "wp_metrics" ADD CONSTRAINT "wp_metrics_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."work_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "wp_quote" ADD CONSTRAINT "wp_quote_testimonial_id_testimonials_id_fk" FOREIGN KEY ("testimonial_id") REFERENCES "public"."testimonials"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "wp_quote" ADD CONSTRAINT "wp_quote_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."work_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "wp_transition" ADD CONSTRAINT "wp_transition_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."work_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "wp_related" ADD CONSTRAINT "wp_related_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."work_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "work_pages" ADD CONSTRAINT "work_pages_case_study_id_case_studies_id_fk" FOREIGN KEY ("case_study_id") REFERENCES "public"."case_studies"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "work_pages" ADD CONSTRAINT "work_pages_hero_media_id_media_id_fk" FOREIGN KEY ("hero_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "work_pages" ADD CONSTRAINT "work_pages_cover_asset_id_media_id_fk" FOREIGN KEY ("cover_asset_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "work_pages" ADD CONSTRAINT "work_pages_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "work_pages_rels" ADD CONSTRAINT "work_pages_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."work_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "work_pages_rels" ADD CONSTRAINT "work_pages_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "work_pages_rels" ADD CONSTRAINT "work_pages_rels_work_pages_fk" FOREIGN KEY ("work_pages_id") REFERENCES "public"."work_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_wp_story_v" ADD CONSTRAINT "_wp_story_v_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_wp_story_v" ADD CONSTRAINT "_wp_story_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_work_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_wp_media_v" ADD CONSTRAINT "_wp_media_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_work_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_wp_decisions_v" ADD CONSTRAINT "_wp_decisions_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_work_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_wp_metrics_v" ADD CONSTRAINT "_wp_metrics_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_work_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_wp_quote_v" ADD CONSTRAINT "_wp_quote_v_testimonial_id_testimonials_id_fk" FOREIGN KEY ("testimonial_id") REFERENCES "public"."testimonials"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_wp_quote_v" ADD CONSTRAINT "_wp_quote_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_work_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_wp_transition_v" ADD CONSTRAINT "_wp_transition_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_work_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_wp_related_v" ADD CONSTRAINT "_wp_related_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_work_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_work_pages_v" ADD CONSTRAINT "_work_pages_v_parent_id_work_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."work_pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_work_pages_v" ADD CONSTRAINT "_work_pages_v_version_case_study_id_case_studies_id_fk" FOREIGN KEY ("version_case_study_id") REFERENCES "public"."case_studies"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_work_pages_v" ADD CONSTRAINT "_work_pages_v_version_hero_media_id_media_id_fk" FOREIGN KEY ("version_hero_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_work_pages_v" ADD CONSTRAINT "_work_pages_v_version_cover_asset_id_media_id_fk" FOREIGN KEY ("version_cover_asset_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_work_pages_v" ADD CONSTRAINT "_work_pages_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_work_pages_v_rels" ADD CONSTRAINT "_work_pages_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_work_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_work_pages_v_rels" ADD CONSTRAINT "_work_pages_v_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_work_pages_v_rels" ADD CONSTRAINT "_work_pages_v_rels_work_pages_fk" FOREIGN KEY ("work_pages_id") REFERENCES "public"."work_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "asset_libraries" ADD CONSTRAINT "asset_libraries_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "asset_libraries" ADD CONSTRAINT "asset_libraries_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "asset_libraries" ADD CONSTRAINT "asset_libraries_root_folder_id_payload_folders_id_fk" FOREIGN KEY ("root_folder_id") REFERENCES "public"."payload_folders"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "wp_story_order_idx" ON "wp_story" USING btree ("_order");
  CREATE INDEX "wp_story_parent_id_idx" ON "wp_story" USING btree ("_parent_id");
  CREATE INDEX "wp_story_path_idx" ON "wp_story" USING btree ("_path");
  CREATE INDEX "wp_story_media_idx" ON "wp_story" USING btree ("media_id");
  CREATE INDEX "wp_media_order_idx" ON "wp_media" USING btree ("_order");
  CREATE INDEX "wp_media_parent_id_idx" ON "wp_media" USING btree ("_parent_id");
  CREATE INDEX "wp_media_path_idx" ON "wp_media" USING btree ("_path");
  CREATE INDEX "wp_decisions_order_idx" ON "wp_decisions" USING btree ("_order");
  CREATE INDEX "wp_decisions_parent_id_idx" ON "wp_decisions" USING btree ("_parent_id");
  CREATE INDEX "wp_decisions_path_idx" ON "wp_decisions" USING btree ("_path");
  CREATE INDEX "wp_metrics_order_idx" ON "wp_metrics" USING btree ("_order");
  CREATE INDEX "wp_metrics_parent_id_idx" ON "wp_metrics" USING btree ("_parent_id");
  CREATE INDEX "wp_metrics_path_idx" ON "wp_metrics" USING btree ("_path");
  CREATE INDEX "wp_quote_order_idx" ON "wp_quote" USING btree ("_order");
  CREATE INDEX "wp_quote_parent_id_idx" ON "wp_quote" USING btree ("_parent_id");
  CREATE INDEX "wp_quote_path_idx" ON "wp_quote" USING btree ("_path");
  CREATE INDEX "wp_quote_testimonial_idx" ON "wp_quote" USING btree ("testimonial_id");
  CREATE INDEX "wp_transition_order_idx" ON "wp_transition" USING btree ("_order");
  CREATE INDEX "wp_transition_parent_id_idx" ON "wp_transition" USING btree ("_parent_id");
  CREATE INDEX "wp_transition_path_idx" ON "wp_transition" USING btree ("_path");
  CREATE INDEX "wp_related_order_idx" ON "wp_related" USING btree ("_order");
  CREATE INDEX "wp_related_parent_id_idx" ON "wp_related" USING btree ("_parent_id");
  CREATE INDEX "wp_related_path_idx" ON "wp_related" USING btree ("_path");
  CREATE UNIQUE INDEX "work_pages_case_study_idx" ON "work_pages" USING btree ("case_study_id");
  CREATE INDEX "work_pages_hero_hero_media_idx" ON "work_pages" USING btree ("hero_media_id");
  CREATE INDEX "work_pages_cover_asset_idx" ON "work_pages" USING btree ("cover_asset_id");
  CREATE INDEX "work_pages_meta_meta_image_idx" ON "work_pages" USING btree ("meta_image_id");
  CREATE UNIQUE INDEX "work_pages_slug_idx" ON "work_pages" USING btree ("slug");
  CREATE INDEX "work_pages_updated_at_idx" ON "work_pages" USING btree ("updated_at");
  CREATE INDEX "work_pages_created_at_idx" ON "work_pages" USING btree ("created_at");
  CREATE INDEX "work_pages__status_idx" ON "work_pages" USING btree ("_status");
  CREATE INDEX "work_pages_rels_order_idx" ON "work_pages_rels" USING btree ("order");
  CREATE INDEX "work_pages_rels_parent_idx" ON "work_pages_rels" USING btree ("parent_id");
  CREATE INDEX "work_pages_rels_path_idx" ON "work_pages_rels" USING btree ("path");
  CREATE INDEX "work_pages_rels_media_id_idx" ON "work_pages_rels" USING btree ("media_id");
  CREATE INDEX "work_pages_rels_work_pages_id_idx" ON "work_pages_rels" USING btree ("work_pages_id");
  CREATE INDEX "_wp_story_v_order_idx" ON "_wp_story_v" USING btree ("_order");
  CREATE INDEX "_wp_story_v_parent_id_idx" ON "_wp_story_v" USING btree ("_parent_id");
  CREATE INDEX "_wp_story_v_path_idx" ON "_wp_story_v" USING btree ("_path");
  CREATE INDEX "_wp_story_v_media_idx" ON "_wp_story_v" USING btree ("media_id");
  CREATE INDEX "_wp_media_v_order_idx" ON "_wp_media_v" USING btree ("_order");
  CREATE INDEX "_wp_media_v_parent_id_idx" ON "_wp_media_v" USING btree ("_parent_id");
  CREATE INDEX "_wp_media_v_path_idx" ON "_wp_media_v" USING btree ("_path");
  CREATE INDEX "_wp_decisions_v_order_idx" ON "_wp_decisions_v" USING btree ("_order");
  CREATE INDEX "_wp_decisions_v_parent_id_idx" ON "_wp_decisions_v" USING btree ("_parent_id");
  CREATE INDEX "_wp_decisions_v_path_idx" ON "_wp_decisions_v" USING btree ("_path");
  CREATE INDEX "_wp_metrics_v_order_idx" ON "_wp_metrics_v" USING btree ("_order");
  CREATE INDEX "_wp_metrics_v_parent_id_idx" ON "_wp_metrics_v" USING btree ("_parent_id");
  CREATE INDEX "_wp_metrics_v_path_idx" ON "_wp_metrics_v" USING btree ("_path");
  CREATE INDEX "_wp_quote_v_order_idx" ON "_wp_quote_v" USING btree ("_order");
  CREATE INDEX "_wp_quote_v_parent_id_idx" ON "_wp_quote_v" USING btree ("_parent_id");
  CREATE INDEX "_wp_quote_v_path_idx" ON "_wp_quote_v" USING btree ("_path");
  CREATE INDEX "_wp_quote_v_testimonial_idx" ON "_wp_quote_v" USING btree ("testimonial_id");
  CREATE INDEX "_wp_transition_v_order_idx" ON "_wp_transition_v" USING btree ("_order");
  CREATE INDEX "_wp_transition_v_parent_id_idx" ON "_wp_transition_v" USING btree ("_parent_id");
  CREATE INDEX "_wp_transition_v_path_idx" ON "_wp_transition_v" USING btree ("_path");
  CREATE INDEX "_wp_related_v_order_idx" ON "_wp_related_v" USING btree ("_order");
  CREATE INDEX "_wp_related_v_parent_id_idx" ON "_wp_related_v" USING btree ("_parent_id");
  CREATE INDEX "_wp_related_v_path_idx" ON "_wp_related_v" USING btree ("_path");
  CREATE INDEX "_work_pages_v_parent_idx" ON "_work_pages_v" USING btree ("parent_id");
  CREATE INDEX "_work_pages_v_version_version_case_study_idx" ON "_work_pages_v" USING btree ("version_case_study_id");
  CREATE INDEX "_work_pages_v_version_hero_version_hero_media_idx" ON "_work_pages_v" USING btree ("version_hero_media_id");
  CREATE INDEX "_work_pages_v_version_version_cover_asset_idx" ON "_work_pages_v" USING btree ("version_cover_asset_id");
  CREATE INDEX "_work_pages_v_version_meta_version_meta_image_idx" ON "_work_pages_v" USING btree ("version_meta_image_id");
  CREATE INDEX "_work_pages_v_version_version_slug_idx" ON "_work_pages_v" USING btree ("version_slug");
  CREATE INDEX "_work_pages_v_version_version_updated_at_idx" ON "_work_pages_v" USING btree ("version_updated_at");
  CREATE INDEX "_work_pages_v_version_version_created_at_idx" ON "_work_pages_v" USING btree ("version_created_at");
  CREATE INDEX "_work_pages_v_version_version__status_idx" ON "_work_pages_v" USING btree ("version__status");
  CREATE INDEX "_work_pages_v_created_at_idx" ON "_work_pages_v" USING btree ("created_at");
  CREATE INDEX "_work_pages_v_updated_at_idx" ON "_work_pages_v" USING btree ("updated_at");
  CREATE INDEX "_work_pages_v_latest_idx" ON "_work_pages_v" USING btree ("latest");
  CREATE INDEX "_work_pages_v_autosave_idx" ON "_work_pages_v" USING btree ("autosave");
  CREATE INDEX "_work_pages_v_rels_order_idx" ON "_work_pages_v_rels" USING btree ("order");
  CREATE INDEX "_work_pages_v_rels_parent_idx" ON "_work_pages_v_rels" USING btree ("parent_id");
  CREATE INDEX "_work_pages_v_rels_path_idx" ON "_work_pages_v_rels" USING btree ("path");
  CREATE INDEX "_work_pages_v_rels_media_id_idx" ON "_work_pages_v_rels" USING btree ("media_id");
  CREATE INDEX "_work_pages_v_rels_work_pages_id_idx" ON "_work_pages_v_rels" USING btree ("work_pages_id");
  CREATE UNIQUE INDEX "asset_libraries_slug_idx" ON "asset_libraries" USING btree ("slug");
  CREATE INDEX "asset_libraries_organization_idx" ON "asset_libraries" USING btree ("organization_id");
  CREATE INDEX "asset_libraries_project_idx" ON "asset_libraries" USING btree ("project_id");
  CREATE INDEX "asset_libraries_root_folder_idx" ON "asset_libraries" USING btree ("root_folder_id");
  CREATE INDEX "asset_libraries_updated_at_idx" ON "asset_libraries" USING btree ("updated_at");
  CREATE INDEX "asset_libraries_created_at_idx" ON "asset_libraries" USING btree ("created_at");
  ALTER TABLE "case_studies_rels" ADD CONSTRAINT "case_studies_rels_asset_libraries_fk" FOREIGN KEY ("asset_libraries_id") REFERENCES "public"."asset_libraries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_case_studies_v_rels" ADD CONSTRAINT "_case_studies_v_rels_asset_libraries_fk" FOREIGN KEY ("asset_libraries_id") REFERENCES "public"."asset_libraries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "media" ADD CONSTRAINT "media_asset_library_id_asset_libraries_id_fk" FOREIGN KEY ("asset_library_id") REFERENCES "public"."asset_libraries"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "redirects_rels" ADD CONSTRAINT "redirects_rels_work_pages_fk" FOREIGN KEY ("work_pages_id") REFERENCES "public"."work_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_work_pages_fk" FOREIGN KEY ("work_pages_id") REFERENCES "public"."work_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_asset_libraries_fk" FOREIGN KEY ("asset_libraries_id") REFERENCES "public"."asset_libraries"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "case_studies_key_idx" ON "case_studies" USING btree ("key");
  CREATE INDEX "case_studies_rels_asset_libraries_id_idx" ON "case_studies_rels" USING btree ("asset_libraries_id");
  CREATE INDEX "_case_studies_v_version_version_key_idx" ON "_case_studies_v" USING btree ("version_key");
  CREATE INDEX "_case_studies_v_rels_asset_libraries_id_idx" ON "_case_studies_v_rels" USING btree ("asset_libraries_id");
  CREATE INDEX "media_asset_library_idx" ON "media" USING btree ("asset_library_id");
  CREATE INDEX "redirects_rels_work_pages_id_idx" ON "redirects_rels" USING btree ("work_pages_id");
  CREATE INDEX "payload_locked_documents_rels_work_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("work_pages_id");
  CREATE INDEX "payload_locked_documents_rels_asset_libraries_id_idx" ON "payload_locked_documents_rels" USING btree ("asset_libraries_id");
  ALTER TABLE "case_studies" DROP COLUMN "cover_asset_id";
  ALTER TABLE "case_studies" DROP COLUMN "website_enabled";
  ALTER TABLE "case_studies" DROP COLUMN "website_hero_eyebrow";
  ALTER TABLE "case_studies" DROP COLUMN "website_hero_title_override";
  ALTER TABLE "case_studies" DROP COLUMN "website_hero_summary_override";
  ALTER TABLE "case_studies" DROP COLUMN "website_hero_media_id";
  ALTER TABLE "case_studies" DROP COLUMN "website_hero_layout";
  ALTER TABLE "case_studies" DROP COLUMN "website_hero_theme";
  ALTER TABLE "case_studies" DROP COLUMN "website_hero_media_treatment";
  ALTER TABLE "case_studies" DROP COLUMN "website_notes";
  ALTER TABLE "case_studies" DROP COLUMN "meta_title";
  ALTER TABLE "case_studies" DROP COLUMN "meta_image_id";
  ALTER TABLE "case_studies" DROP COLUMN "meta_description";
  ALTER TABLE "case_studies" DROP COLUMN "featured";
  ALTER TABLE "case_studies" DROP COLUMN "generate_slug";
  ALTER TABLE "case_studies" DROP COLUMN "slug";
  ALTER TABLE "case_studies_rels" DROP COLUMN "media_id";
  ALTER TABLE "case_studies_rels" DROP COLUMN "case_studies_id";
  ALTER TABLE "_case_studies_v" DROP COLUMN "version_cover_asset_id";
  ALTER TABLE "_case_studies_v" DROP COLUMN "version_website_enabled";
  ALTER TABLE "_case_studies_v" DROP COLUMN "version_website_hero_eyebrow";
  ALTER TABLE "_case_studies_v" DROP COLUMN "version_website_hero_title_override";
  ALTER TABLE "_case_studies_v" DROP COLUMN "version_website_hero_summary_override";
  ALTER TABLE "_case_studies_v" DROP COLUMN "version_website_hero_media_id";
  ALTER TABLE "_case_studies_v" DROP COLUMN "version_website_hero_layout";
  ALTER TABLE "_case_studies_v" DROP COLUMN "version_website_hero_theme";
  ALTER TABLE "_case_studies_v" DROP COLUMN "version_website_hero_media_treatment";
  ALTER TABLE "_case_studies_v" DROP COLUMN "version_website_notes";
  ALTER TABLE "_case_studies_v" DROP COLUMN "version_meta_title";
  ALTER TABLE "_case_studies_v" DROP COLUMN "version_meta_image_id";
  ALTER TABLE "_case_studies_v" DROP COLUMN "version_meta_description";
  ALTER TABLE "_case_studies_v" DROP COLUMN "version_featured";
  ALTER TABLE "_case_studies_v" DROP COLUMN "version_generate_slug";
  ALTER TABLE "_case_studies_v" DROP COLUMN "version_slug";
  ALTER TABLE "_case_studies_v_rels" DROP COLUMN "media_id";
  ALTER TABLE "_case_studies_v_rels" DROP COLUMN "case_studies_id";
  ALTER TABLE "redirects_rels" DROP COLUMN "case_studies_id";
  DROP TYPE "public"."enum_cs_story_source";
  DROP TYPE "public"."enum_cs_story_layout";
  DROP TYPE "public"."enum_cs_story_theme";
  DROP TYPE "public"."enum_cs_story_width";
  DROP TYPE "public"."enum_cs_media_layout";
  DROP TYPE "public"."enum_cs_media_theme";
  DROP TYPE "public"."enum_cs_decisions_source";
  DROP TYPE "public"."enum_cs_decisions_layout";
  DROP TYPE "public"."enum_cs_decisions_theme";
  DROP TYPE "public"."enum_cs_metrics_source";
  DROP TYPE "public"."enum_cs_metrics_layout";
  DROP TYPE "public"."enum_cs_metrics_theme";
  DROP TYPE "public"."enum_cs_quote_layout";
  DROP TYPE "public"."enum_cs_quote_theme";
  DROP TYPE "public"."enum_cs_transition_layout";
  DROP TYPE "public"."enum_cs_transition_theme";
  DROP TYPE "public"."enum_cs_related_selection_mode";
  DROP TYPE "public"."enum_cs_related_layout";
  DROP TYPE "public"."enum_case_studies_website_hero_layout";
  DROP TYPE "public"."enum_case_studies_website_hero_theme";
  DROP TYPE "public"."enum_case_studies_website_hero_media_treatment";
  DROP TYPE "public"."enum__cs_story_v_source";
  DROP TYPE "public"."enum__cs_story_v_layout";
  DROP TYPE "public"."enum__cs_story_v_theme";
  DROP TYPE "public"."enum__cs_story_v_width";
  DROP TYPE "public"."enum__cs_media_v_layout";
  DROP TYPE "public"."enum__cs_media_v_theme";
  DROP TYPE "public"."enum__cs_decisions_v_source";
  DROP TYPE "public"."enum__cs_decisions_v_layout";
  DROP TYPE "public"."enum__cs_decisions_v_theme";
  DROP TYPE "public"."enum__cs_metrics_v_source";
  DROP TYPE "public"."enum__cs_metrics_v_layout";
  DROP TYPE "public"."enum__cs_metrics_v_theme";
  DROP TYPE "public"."enum__cs_quote_v_layout";
  DROP TYPE "public"."enum__cs_quote_v_theme";
  DROP TYPE "public"."enum__cs_transition_v_layout";
  DROP TYPE "public"."enum__cs_transition_v_theme";
  DROP TYPE "public"."enum__cs_related_v_selection_mode";
  DROP TYPE "public"."enum__cs_related_v_layout";
  DROP TYPE "public"."enum__case_studies_v_version_website_hero_layout";
  DROP TYPE "public"."enum__case_studies_v_version_website_hero_theme";
  DROP TYPE "public"."enum__case_studies_v_version_website_hero_media_treatment";`)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_cs_story_source" AS ENUM('context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings', 'custom');
  CREATE TYPE "public"."enum_cs_story_layout" AS ENUM('text-only', 'text-left', 'text-right', 'centered', 'sticky-media');
  CREATE TYPE "public"."enum_cs_story_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_cs_story_width" AS ENUM('narrow', 'standard', 'wide');
  CREATE TYPE "public"."enum_cs_media_layout" AS ENUM('single', 'grid', 'horizontal', 'stacked', 'full-bleed', 'comparison');
  CREATE TYPE "public"."enum_cs_media_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_cs_decisions_source" AS ENUM('featured', 'all');
  CREATE TYPE "public"."enum_cs_decisions_layout" AS ENUM('list', 'cards', 'editorial', 'sticky');
  CREATE TYPE "public"."enum_cs_decisions_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_cs_metrics_source" AS ENUM('featured-public', 'all-public');
  CREATE TYPE "public"."enum_cs_metrics_layout" AS ENUM('grid', 'row', 'statement', 'editorial');
  CREATE TYPE "public"."enum_cs_metrics_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_cs_quote_layout" AS ENUM('editorial', 'centered', 'split', 'compact');
  CREATE TYPE "public"."enum_cs_quote_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_cs_transition_layout" AS ENUM('left', 'centered', 'split', 'statement');
  CREATE TYPE "public"."enum_cs_transition_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_cs_related_selection_mode" AS ENUM('document-settings', 'automatic-capability-match');
  CREATE TYPE "public"."enum_cs_related_layout" AS ENUM('grid', 'list', 'feature');
  CREATE TYPE "public"."enum_case_studies_website_hero_layout" AS ENUM('editorial-split', 'centered', 'immersive', 'media-led');
  CREATE TYPE "public"."enum_case_studies_website_hero_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_case_studies_website_hero_media_treatment" AS ENUM('contained', 'full-bleed', 'floating', 'background');
  CREATE TYPE "public"."enum__cs_story_v_source" AS ENUM('context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings', 'custom');
  CREATE TYPE "public"."enum__cs_story_v_layout" AS ENUM('text-only', 'text-left', 'text-right', 'centered', 'sticky-media');
  CREATE TYPE "public"."enum__cs_story_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum__cs_story_v_width" AS ENUM('narrow', 'standard', 'wide');
  CREATE TYPE "public"."enum__cs_media_v_layout" AS ENUM('single', 'grid', 'horizontal', 'stacked', 'full-bleed', 'comparison');
  CREATE TYPE "public"."enum__cs_media_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum__cs_decisions_v_source" AS ENUM('featured', 'all');
  CREATE TYPE "public"."enum__cs_decisions_v_layout" AS ENUM('list', 'cards', 'editorial', 'sticky');
  CREATE TYPE "public"."enum__cs_decisions_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum__cs_metrics_v_source" AS ENUM('featured-public', 'all-public');
  CREATE TYPE "public"."enum__cs_metrics_v_layout" AS ENUM('grid', 'row', 'statement', 'editorial');
  CREATE TYPE "public"."enum__cs_metrics_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum__cs_quote_v_layout" AS ENUM('editorial', 'centered', 'split', 'compact');
  CREATE TYPE "public"."enum__cs_quote_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum__cs_transition_v_layout" AS ENUM('left', 'centered', 'split', 'statement');
  CREATE TYPE "public"."enum__cs_transition_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum__cs_related_v_selection_mode" AS ENUM('document-settings', 'automatic-capability-match');
  CREATE TYPE "public"."enum__cs_related_v_layout" AS ENUM('grid', 'list', 'feature');
  CREATE TYPE "public"."enum__case_studies_v_version_website_hero_layout" AS ENUM('editorial-split', 'centered', 'immersive', 'media-led');
  CREATE TYPE "public"."enum__case_studies_v_version_website_hero_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum__case_studies_v_version_website_hero_media_treatment" AS ENUM('contained', 'full-bleed', 'floating', 'background');
  CREATE TABLE "cs_story" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"source" "enum_cs_story_source" DEFAULT 'context',
  	"eyebrow" varchar,
  	"heading_override" varchar,
  	"body_override" jsonb,
  	"custom_body" jsonb,
  	"media_id" integer,
  	"layout" "enum_cs_story_layout" DEFAULT 'text-only',
  	"theme" "enum_cs_story_theme" DEFAULT 'light',
  	"width" "enum_cs_story_width" DEFAULT 'standard',
  	"block_name" varchar
  );
  
  CREATE TABLE "cs_media" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"introduction" jsonb,
  	"layout" "enum_cs_media_layout" DEFAULT 'grid',
  	"theme" "enum_cs_media_theme" DEFAULT 'light',
  	"show_captions" boolean DEFAULT true,
  	"show_credits" boolean DEFAULT true,
  	"block_name" varchar
  );
  
  CREATE TABLE "cs_decisions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"introduction" jsonb,
  	"source" "enum_cs_decisions_source" DEFAULT 'featured',
  	"layout" "enum_cs_decisions_layout" DEFAULT 'cards',
  	"theme" "enum_cs_decisions_theme" DEFAULT 'light',
  	"block_name" varchar
  );
  
  CREATE TABLE "cs_metrics" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"introduction" jsonb,
  	"source" "enum_cs_metrics_source" DEFAULT 'featured-public',
  	"layout" "enum_cs_metrics_layout" DEFAULT 'grid',
  	"theme" "enum_cs_metrics_theme" DEFAULT 'light',
  	"block_name" varchar
  );
  
  CREATE TABLE "cs_quote" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"testimonial_id" integer,
  	"layout" "enum_cs_quote_layout" DEFAULT 'editorial',
  	"theme" "enum_cs_quote_theme" DEFAULT 'light',
  	"show_portrait" boolean DEFAULT true,
  	"block_name" varchar
  );
  
  CREATE TABLE "cs_transition" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" jsonb,
  	"layout" "enum_cs_transition_layout" DEFAULT 'centered',
  	"theme" "enum_cs_transition_theme" DEFAULT 'light',
  	"block_name" varchar
  );
  
  CREATE TABLE "cs_related" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar DEFAULT 'Related work',
  	"selection_mode" "enum_cs_related_selection_mode" DEFAULT 'document-settings',
  	"limit" numeric DEFAULT 3,
  	"layout" "enum_cs_related_layout" DEFAULT 'grid',
  	"block_name" varchar
  );
  
  CREATE TABLE "_cs_story_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"source" "enum__cs_story_v_source" DEFAULT 'context',
  	"eyebrow" varchar,
  	"heading_override" varchar,
  	"body_override" jsonb,
  	"custom_body" jsonb,
  	"media_id" integer,
  	"layout" "enum__cs_story_v_layout" DEFAULT 'text-only',
  	"theme" "enum__cs_story_v_theme" DEFAULT 'light',
  	"width" "enum__cs_story_v_width" DEFAULT 'standard',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_cs_media_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"introduction" jsonb,
  	"layout" "enum__cs_media_v_layout" DEFAULT 'grid',
  	"theme" "enum__cs_media_v_theme" DEFAULT 'light',
  	"show_captions" boolean DEFAULT true,
  	"show_credits" boolean DEFAULT true,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_cs_decisions_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"introduction" jsonb,
  	"source" "enum__cs_decisions_v_source" DEFAULT 'featured',
  	"layout" "enum__cs_decisions_v_layout" DEFAULT 'cards',
  	"theme" "enum__cs_decisions_v_theme" DEFAULT 'light',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_cs_metrics_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"introduction" jsonb,
  	"source" "enum__cs_metrics_v_source" DEFAULT 'featured-public',
  	"layout" "enum__cs_metrics_v_layout" DEFAULT 'grid',
  	"theme" "enum__cs_metrics_v_theme" DEFAULT 'light',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_cs_quote_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"testimonial_id" integer,
  	"layout" "enum__cs_quote_v_layout" DEFAULT 'editorial',
  	"theme" "enum__cs_quote_v_theme" DEFAULT 'light',
  	"show_portrait" boolean DEFAULT true,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_cs_transition_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" jsonb,
  	"layout" "enum__cs_transition_v_layout" DEFAULT 'centered',
  	"theme" "enum__cs_transition_v_theme" DEFAULT 'light',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_cs_related_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar DEFAULT 'Related work',
  	"selection_mode" "enum__cs_related_v_selection_mode" DEFAULT 'document-settings',
  	"limit" numeric DEFAULT 3,
  	"layout" "enum__cs_related_v_layout" DEFAULT 'grid',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "wp_story" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "wp_media" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "wp_decisions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "wp_metrics" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "wp_quote" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "wp_transition" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "wp_related" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "work_pages" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "work_pages_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_wp_story_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_wp_media_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_wp_decisions_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_wp_metrics_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_wp_quote_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_wp_transition_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_wp_related_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_work_pages_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_work_pages_v_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "asset_libraries" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "wp_story" CASCADE;
  DROP TABLE "wp_media" CASCADE;
  DROP TABLE "wp_decisions" CASCADE;
  DROP TABLE "wp_metrics" CASCADE;
  DROP TABLE "wp_quote" CASCADE;
  DROP TABLE "wp_transition" CASCADE;
  DROP TABLE "wp_related" CASCADE;
  DROP TABLE "work_pages" CASCADE;
  DROP TABLE "work_pages_rels" CASCADE;
  DROP TABLE "_wp_story_v" CASCADE;
  DROP TABLE "_wp_media_v" CASCADE;
  DROP TABLE "_wp_decisions_v" CASCADE;
  DROP TABLE "_wp_metrics_v" CASCADE;
  DROP TABLE "_wp_quote_v" CASCADE;
  DROP TABLE "_wp_transition_v" CASCADE;
  DROP TABLE "_wp_related_v" CASCADE;
  DROP TABLE "_work_pages_v" CASCADE;
  DROP TABLE "_work_pages_v_rels" CASCADE;
  DROP TABLE "asset_libraries" CASCADE;
  ALTER TABLE "case_studies_rels" DROP CONSTRAINT "case_studies_rels_asset_libraries_fk";
  
  ALTER TABLE "_case_studies_v_rels" DROP CONSTRAINT "_case_studies_v_rels_asset_libraries_fk";
  
  ALTER TABLE "media" DROP CONSTRAINT "media_asset_library_id_asset_libraries_id_fk";
  
  ALTER TABLE "redirects_rels" DROP CONSTRAINT "redirects_rels_work_pages_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_work_pages_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_asset_libraries_fk";
  
  DROP INDEX "case_studies_key_idx";
  DROP INDEX "case_studies_rels_asset_libraries_id_idx";
  DROP INDEX "_case_studies_v_version_version_key_idx";
  DROP INDEX "_case_studies_v_rels_asset_libraries_id_idx";
  DROP INDEX "media_asset_library_idx";
  DROP INDEX "redirects_rels_work_pages_id_idx";
  DROP INDEX "payload_locked_documents_rels_work_pages_id_idx";
  DROP INDEX "payload_locked_documents_rels_asset_libraries_id_idx";
  ALTER TABLE "case_studies" ADD COLUMN "cover_asset_id" integer;
  ALTER TABLE "case_studies" ADD COLUMN "website_enabled" boolean DEFAULT true;
  ALTER TABLE "case_studies" ADD COLUMN "website_hero_eyebrow" varchar;
  ALTER TABLE "case_studies" ADD COLUMN "website_hero_title_override" varchar;
  ALTER TABLE "case_studies" ADD COLUMN "website_hero_summary_override" varchar;
  ALTER TABLE "case_studies" ADD COLUMN "website_hero_media_id" integer;
  ALTER TABLE "case_studies" ADD COLUMN "website_hero_layout" "enum_case_studies_website_hero_layout" DEFAULT 'editorial-split';
  ALTER TABLE "case_studies" ADD COLUMN "website_hero_theme" "enum_case_studies_website_hero_theme" DEFAULT 'light';
  ALTER TABLE "case_studies" ADD COLUMN "website_hero_media_treatment" "enum_case_studies_website_hero_media_treatment" DEFAULT 'contained';
  ALTER TABLE "case_studies" ADD COLUMN "website_notes" varchar;
  ALTER TABLE "case_studies" ADD COLUMN "meta_title" varchar;
  ALTER TABLE "case_studies" ADD COLUMN "meta_image_id" integer;
  ALTER TABLE "case_studies" ADD COLUMN "meta_description" varchar;
  ALTER TABLE "case_studies" ADD COLUMN "featured" boolean DEFAULT false;
  ALTER TABLE "case_studies" ADD COLUMN "generate_slug" boolean DEFAULT true;
  ALTER TABLE "case_studies" ADD COLUMN "slug" varchar;
  ALTER TABLE "case_studies_rels" ADD COLUMN "media_id" integer;
  ALTER TABLE "case_studies_rels" ADD COLUMN "case_studies_id" integer;
  ALTER TABLE "_case_studies_v" ADD COLUMN "version_cover_asset_id" integer;
  ALTER TABLE "_case_studies_v" ADD COLUMN "version_website_enabled" boolean DEFAULT true;
  ALTER TABLE "_case_studies_v" ADD COLUMN "version_website_hero_eyebrow" varchar;
  ALTER TABLE "_case_studies_v" ADD COLUMN "version_website_hero_title_override" varchar;
  ALTER TABLE "_case_studies_v" ADD COLUMN "version_website_hero_summary_override" varchar;
  ALTER TABLE "_case_studies_v" ADD COLUMN "version_website_hero_media_id" integer;
  ALTER TABLE "_case_studies_v" ADD COLUMN "version_website_hero_layout" "enum__case_studies_v_version_website_hero_layout" DEFAULT 'editorial-split';
  ALTER TABLE "_case_studies_v" ADD COLUMN "version_website_hero_theme" "enum__case_studies_v_version_website_hero_theme" DEFAULT 'light';
  ALTER TABLE "_case_studies_v" ADD COLUMN "version_website_hero_media_treatment" "enum__case_studies_v_version_website_hero_media_treatment" DEFAULT 'contained';
  ALTER TABLE "_case_studies_v" ADD COLUMN "version_website_notes" varchar;
  ALTER TABLE "_case_studies_v" ADD COLUMN "version_meta_title" varchar;
  ALTER TABLE "_case_studies_v" ADD COLUMN "version_meta_image_id" integer;
  ALTER TABLE "_case_studies_v" ADD COLUMN "version_meta_description" varchar;
  ALTER TABLE "_case_studies_v" ADD COLUMN "version_featured" boolean DEFAULT false;
  ALTER TABLE "_case_studies_v" ADD COLUMN "version_generate_slug" boolean DEFAULT true;
  ALTER TABLE "_case_studies_v" ADD COLUMN "version_slug" varchar;
  ALTER TABLE "_case_studies_v_rels" ADD COLUMN "media_id" integer;
  ALTER TABLE "_case_studies_v_rels" ADD COLUMN "case_studies_id" integer;
  ALTER TABLE "redirects_rels" ADD COLUMN "case_studies_id" integer;
  ALTER TABLE "cs_story" ADD CONSTRAINT "cs_story_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cs_story" ADD CONSTRAINT "cs_story_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."case_studies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cs_media" ADD CONSTRAINT "cs_media_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."case_studies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cs_decisions" ADD CONSTRAINT "cs_decisions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."case_studies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cs_metrics" ADD CONSTRAINT "cs_metrics_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."case_studies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cs_quote" ADD CONSTRAINT "cs_quote_testimonial_id_testimonials_id_fk" FOREIGN KEY ("testimonial_id") REFERENCES "public"."testimonials"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cs_quote" ADD CONSTRAINT "cs_quote_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."case_studies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cs_transition" ADD CONSTRAINT "cs_transition_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."case_studies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cs_related" ADD CONSTRAINT "cs_related_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."case_studies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_cs_story_v" ADD CONSTRAINT "_cs_story_v_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_cs_story_v" ADD CONSTRAINT "_cs_story_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_case_studies_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_cs_media_v" ADD CONSTRAINT "_cs_media_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_case_studies_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_cs_decisions_v" ADD CONSTRAINT "_cs_decisions_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_case_studies_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_cs_metrics_v" ADD CONSTRAINT "_cs_metrics_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_case_studies_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_cs_quote_v" ADD CONSTRAINT "_cs_quote_v_testimonial_id_testimonials_id_fk" FOREIGN KEY ("testimonial_id") REFERENCES "public"."testimonials"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_cs_quote_v" ADD CONSTRAINT "_cs_quote_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_case_studies_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_cs_transition_v" ADD CONSTRAINT "_cs_transition_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_case_studies_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_cs_related_v" ADD CONSTRAINT "_cs_related_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_case_studies_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "cs_story_order_idx" ON "cs_story" USING btree ("_order");
  CREATE INDEX "cs_story_parent_id_idx" ON "cs_story" USING btree ("_parent_id");
  CREATE INDEX "cs_story_path_idx" ON "cs_story" USING btree ("_path");
  CREATE INDEX "cs_story_media_idx" ON "cs_story" USING btree ("media_id");
  CREATE INDEX "cs_media_order_idx" ON "cs_media" USING btree ("_order");
  CREATE INDEX "cs_media_parent_id_idx" ON "cs_media" USING btree ("_parent_id");
  CREATE INDEX "cs_media_path_idx" ON "cs_media" USING btree ("_path");
  CREATE INDEX "cs_decisions_order_idx" ON "cs_decisions" USING btree ("_order");
  CREATE INDEX "cs_decisions_parent_id_idx" ON "cs_decisions" USING btree ("_parent_id");
  CREATE INDEX "cs_decisions_path_idx" ON "cs_decisions" USING btree ("_path");
  CREATE INDEX "cs_metrics_order_idx" ON "cs_metrics" USING btree ("_order");
  CREATE INDEX "cs_metrics_parent_id_idx" ON "cs_metrics" USING btree ("_parent_id");
  CREATE INDEX "cs_metrics_path_idx" ON "cs_metrics" USING btree ("_path");
  CREATE INDEX "cs_quote_order_idx" ON "cs_quote" USING btree ("_order");
  CREATE INDEX "cs_quote_parent_id_idx" ON "cs_quote" USING btree ("_parent_id");
  CREATE INDEX "cs_quote_path_idx" ON "cs_quote" USING btree ("_path");
  CREATE INDEX "cs_quote_testimonial_idx" ON "cs_quote" USING btree ("testimonial_id");
  CREATE INDEX "cs_transition_order_idx" ON "cs_transition" USING btree ("_order");
  CREATE INDEX "cs_transition_parent_id_idx" ON "cs_transition" USING btree ("_parent_id");
  CREATE INDEX "cs_transition_path_idx" ON "cs_transition" USING btree ("_path");
  CREATE INDEX "cs_related_order_idx" ON "cs_related" USING btree ("_order");
  CREATE INDEX "cs_related_parent_id_idx" ON "cs_related" USING btree ("_parent_id");
  CREATE INDEX "cs_related_path_idx" ON "cs_related" USING btree ("_path");
  CREATE INDEX "_cs_story_v_order_idx" ON "_cs_story_v" USING btree ("_order");
  CREATE INDEX "_cs_story_v_parent_id_idx" ON "_cs_story_v" USING btree ("_parent_id");
  CREATE INDEX "_cs_story_v_path_idx" ON "_cs_story_v" USING btree ("_path");
  CREATE INDEX "_cs_story_v_media_idx" ON "_cs_story_v" USING btree ("media_id");
  CREATE INDEX "_cs_media_v_order_idx" ON "_cs_media_v" USING btree ("_order");
  CREATE INDEX "_cs_media_v_parent_id_idx" ON "_cs_media_v" USING btree ("_parent_id");
  CREATE INDEX "_cs_media_v_path_idx" ON "_cs_media_v" USING btree ("_path");
  CREATE INDEX "_cs_decisions_v_order_idx" ON "_cs_decisions_v" USING btree ("_order");
  CREATE INDEX "_cs_decisions_v_parent_id_idx" ON "_cs_decisions_v" USING btree ("_parent_id");
  CREATE INDEX "_cs_decisions_v_path_idx" ON "_cs_decisions_v" USING btree ("_path");
  CREATE INDEX "_cs_metrics_v_order_idx" ON "_cs_metrics_v" USING btree ("_order");
  CREATE INDEX "_cs_metrics_v_parent_id_idx" ON "_cs_metrics_v" USING btree ("_parent_id");
  CREATE INDEX "_cs_metrics_v_path_idx" ON "_cs_metrics_v" USING btree ("_path");
  CREATE INDEX "_cs_quote_v_order_idx" ON "_cs_quote_v" USING btree ("_order");
  CREATE INDEX "_cs_quote_v_parent_id_idx" ON "_cs_quote_v" USING btree ("_parent_id");
  CREATE INDEX "_cs_quote_v_path_idx" ON "_cs_quote_v" USING btree ("_path");
  CREATE INDEX "_cs_quote_v_testimonial_idx" ON "_cs_quote_v" USING btree ("testimonial_id");
  CREATE INDEX "_cs_transition_v_order_idx" ON "_cs_transition_v" USING btree ("_order");
  CREATE INDEX "_cs_transition_v_parent_id_idx" ON "_cs_transition_v" USING btree ("_parent_id");
  CREATE INDEX "_cs_transition_v_path_idx" ON "_cs_transition_v" USING btree ("_path");
  CREATE INDEX "_cs_related_v_order_idx" ON "_cs_related_v" USING btree ("_order");
  CREATE INDEX "_cs_related_v_parent_id_idx" ON "_cs_related_v" USING btree ("_parent_id");
  CREATE INDEX "_cs_related_v_path_idx" ON "_cs_related_v" USING btree ("_path");
  ALTER TABLE "case_studies" ADD CONSTRAINT "case_studies_cover_asset_id_media_id_fk" FOREIGN KEY ("cover_asset_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "case_studies" ADD CONSTRAINT "case_studies_website_hero_media_id_media_id_fk" FOREIGN KEY ("website_hero_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "case_studies" ADD CONSTRAINT "case_studies_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "case_studies_rels" ADD CONSTRAINT "case_studies_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "case_studies_rels" ADD CONSTRAINT "case_studies_rels_case_studies_fk" FOREIGN KEY ("case_studies_id") REFERENCES "public"."case_studies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_case_studies_v" ADD CONSTRAINT "_case_studies_v_version_cover_asset_id_media_id_fk" FOREIGN KEY ("version_cover_asset_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_case_studies_v" ADD CONSTRAINT "_case_studies_v_version_website_hero_media_id_media_id_fk" FOREIGN KEY ("version_website_hero_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_case_studies_v" ADD CONSTRAINT "_case_studies_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_case_studies_v_rels" ADD CONSTRAINT "_case_studies_v_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_case_studies_v_rels" ADD CONSTRAINT "_case_studies_v_rels_case_studies_fk" FOREIGN KEY ("case_studies_id") REFERENCES "public"."case_studies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "redirects_rels" ADD CONSTRAINT "redirects_rels_case_studies_fk" FOREIGN KEY ("case_studies_id") REFERENCES "public"."case_studies"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "case_studies_cover_asset_idx" ON "case_studies" USING btree ("cover_asset_id");
  CREATE INDEX "case_studies_website_hero_website_hero_media_idx" ON "case_studies" USING btree ("website_hero_media_id");
  CREATE INDEX "case_studies_meta_meta_image_idx" ON "case_studies" USING btree ("meta_image_id");
  CREATE UNIQUE INDEX "case_studies_slug_idx" ON "case_studies" USING btree ("slug");
  CREATE INDEX "case_studies_rels_media_id_idx" ON "case_studies_rels" USING btree ("media_id");
  CREATE INDEX "case_studies_rels_case_studies_id_idx" ON "case_studies_rels" USING btree ("case_studies_id");
  CREATE INDEX "_case_studies_v_version_version_cover_asset_idx" ON "_case_studies_v" USING btree ("version_cover_asset_id");
  CREATE INDEX "_case_studies_v_version_website_hero_version_website_her_idx" ON "_case_studies_v" USING btree ("version_website_hero_media_id");
  CREATE INDEX "_case_studies_v_version_meta_version_meta_image_idx" ON "_case_studies_v" USING btree ("version_meta_image_id");
  CREATE INDEX "_case_studies_v_version_version_slug_idx" ON "_case_studies_v" USING btree ("version_slug");
  CREATE INDEX "_case_studies_v_rels_media_id_idx" ON "_case_studies_v_rels" USING btree ("media_id");
  CREATE INDEX "_case_studies_v_rels_case_studies_id_idx" ON "_case_studies_v_rels" USING btree ("case_studies_id");
  CREATE INDEX "redirects_rels_case_studies_id_idx" ON "redirects_rels" USING btree ("case_studies_id");
  ALTER TABLE "case_studies" DROP COLUMN "generate_key";
  ALTER TABLE "case_studies" DROP COLUMN "key";
  ALTER TABLE "case_studies_rels" DROP COLUMN "asset_libraries_id";
  ALTER TABLE "_case_studies_v" DROP COLUMN "version_generate_key";
  ALTER TABLE "_case_studies_v" DROP COLUMN "version_key";
  ALTER TABLE "_case_studies_v_rels" DROP COLUMN "asset_libraries_id";
  ALTER TABLE "media" DROP COLUMN "asset_library_id";
  ALTER TABLE "redirects_rels" DROP COLUMN "work_pages_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "work_pages_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "asset_libraries_id";
  DROP TYPE "public"."enum_wp_story_source";
  DROP TYPE "public"."enum_wp_story_layout";
  DROP TYPE "public"."enum_wp_story_theme";
  DROP TYPE "public"."enum_wp_story_width";
  DROP TYPE "public"."enum_wp_media_layout";
  DROP TYPE "public"."enum_wp_media_theme";
  DROP TYPE "public"."enum_wp_decisions_source";
  DROP TYPE "public"."enum_wp_decisions_layout";
  DROP TYPE "public"."enum_wp_decisions_theme";
  DROP TYPE "public"."enum_wp_metrics_source";
  DROP TYPE "public"."enum_wp_metrics_layout";
  DROP TYPE "public"."enum_wp_metrics_theme";
  DROP TYPE "public"."enum_wp_quote_layout";
  DROP TYPE "public"."enum_wp_quote_theme";
  DROP TYPE "public"."enum_wp_transition_layout";
  DROP TYPE "public"."enum_wp_transition_theme";
  DROP TYPE "public"."enum_wp_related_selection_mode";
  DROP TYPE "public"."enum_wp_related_layout";
  DROP TYPE "public"."enum_work_pages_hero_layout";
  DROP TYPE "public"."enum_work_pages_hero_theme";
  DROP TYPE "public"."enum_work_pages_hero_media_treatment";
  DROP TYPE "public"."enum_work_pages_status";
  DROP TYPE "public"."enum__wp_story_v_source";
  DROP TYPE "public"."enum__wp_story_v_layout";
  DROP TYPE "public"."enum__wp_story_v_theme";
  DROP TYPE "public"."enum__wp_story_v_width";
  DROP TYPE "public"."enum__wp_media_v_layout";
  DROP TYPE "public"."enum__wp_media_v_theme";
  DROP TYPE "public"."enum__wp_decisions_v_source";
  DROP TYPE "public"."enum__wp_decisions_v_layout";
  DROP TYPE "public"."enum__wp_decisions_v_theme";
  DROP TYPE "public"."enum__wp_metrics_v_source";
  DROP TYPE "public"."enum__wp_metrics_v_layout";
  DROP TYPE "public"."enum__wp_metrics_v_theme";
  DROP TYPE "public"."enum__wp_quote_v_layout";
  DROP TYPE "public"."enum__wp_quote_v_theme";
  DROP TYPE "public"."enum__wp_transition_v_layout";
  DROP TYPE "public"."enum__wp_transition_v_theme";
  DROP TYPE "public"."enum__wp_related_v_selection_mode";
  DROP TYPE "public"."enum__wp_related_v_layout";
  DROP TYPE "public"."enum__work_pages_v_version_hero_layout";
  DROP TYPE "public"."enum__work_pages_v_version_hero_theme";
  DROP TYPE "public"."enum__work_pages_v_version_hero_media_treatment";
  DROP TYPE "public"."enum__work_pages_v_version_status";
  DROP TYPE "public"."enum_asset_libraries_library_status";`)
}
