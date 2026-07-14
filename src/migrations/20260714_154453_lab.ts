import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_lp_story_source" AS ENUM('context', 'approach', 'outcome', 'learnings', 'custom');
  CREATE TYPE "public"."enum_lp_story_layout" AS ENUM('text-only', 'text-left', 'text-right', 'centered', 'sticky-media');
  CREATE TYPE "public"."enum_lp_story_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_lp_story_width" AS ENUM('narrow', 'standard', 'wide');
  CREATE TYPE "public"."enum_lp_media_layout" AS ENUM('single', 'grid', 'horizontal', 'stacked', 'full-bleed', 'comparison');
  CREATE TYPE "public"."enum_lp_media_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_lp_facts_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_lp_transition_layout" AS ENUM('left', 'centered', 'split', 'statement');
  CREATE TYPE "public"."enum_lp_transition_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_lp_related_selection_mode" AS ENUM('document-settings', 'automatic-capability-match');
  CREATE TYPE "public"."enum_lp_related_layout" AS ENUM('grid', 'list', 'feature');
  CREATE TYPE "public"."enum_lab_pages_hero_layout" AS ENUM('editorial-split', 'centered', 'immersive', 'media-led');
  CREATE TYPE "public"."enum_lab_pages_hero_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_lab_pages_hero_media_treatment" AS ENUM('contained', 'full-bleed', 'floating', 'background');
  CREATE TYPE "public"."enum_lab_pages_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__lp_story_v_source" AS ENUM('context', 'approach', 'outcome', 'learnings', 'custom');
  CREATE TYPE "public"."enum__lp_story_v_layout" AS ENUM('text-only', 'text-left', 'text-right', 'centered', 'sticky-media');
  CREATE TYPE "public"."enum__lp_story_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum__lp_story_v_width" AS ENUM('narrow', 'standard', 'wide');
  CREATE TYPE "public"."enum__lp_media_v_layout" AS ENUM('single', 'grid', 'horizontal', 'stacked', 'full-bleed', 'comparison');
  CREATE TYPE "public"."enum__lp_media_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum__lp_facts_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum__lp_transition_v_layout" AS ENUM('left', 'centered', 'split', 'statement');
  CREATE TYPE "public"."enum__lp_transition_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum__lp_related_v_selection_mode" AS ENUM('document-settings', 'automatic-capability-match');
  CREATE TYPE "public"."enum__lp_related_v_layout" AS ENUM('grid', 'list', 'feature');
  CREATE TYPE "public"."enum__lab_pages_v_version_hero_layout" AS ENUM('editorial-split', 'centered', 'immersive', 'media-led');
  CREATE TYPE "public"."enum__lab_pages_v_version_hero_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum__lab_pages_v_version_hero_media_treatment" AS ENUM('contained', 'full-bleed', 'floating', 'background');
  CREATE TYPE "public"."enum__lab_pages_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_lab_projects_project_links_visibility" AS ENUM('public', 'internal');
  CREATE TYPE "public"."lab_project_kind" AS ENUM('experiment', 'prototype', 'showcase', 'tool', 'research');
  CREATE TYPE "public"."lab_project_status" AS ENUM('planned', 'active', 'completed', 'archived');
  CREATE TYPE "public"."enum_lab_projects_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__lab_projects_v_version_project_links_visibility" AS ENUM('public', 'internal');
  CREATE TYPE "public"."enum__lab_projects_v_version_status" AS ENUM('draft', 'published');
  CREATE TABLE "lp_story" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"source" "enum_lp_story_source" DEFAULT 'context',
  	"eyebrow" varchar,
  	"heading_override" varchar,
  	"body_override" jsonb,
  	"custom_body" jsonb,
  	"media_id" integer,
  	"layout" "enum_lp_story_layout" DEFAULT 'text-only',
  	"theme" "enum_lp_story_theme" DEFAULT 'light',
  	"width" "enum_lp_story_width" DEFAULT 'standard',
  	"block_name" varchar
  );
  
  CREATE TABLE "lp_media" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"introduction" jsonb,
  	"layout" "enum_lp_media_layout" DEFAULT 'grid',
  	"theme" "enum_lp_media_theme" DEFAULT 'light',
  	"show_captions" boolean DEFAULT true,
  	"show_credits" boolean DEFAULT true,
  	"block_name" varchar
  );
  
  CREATE TABLE "lp_facts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar DEFAULT 'About this project',
  	"show_status" boolean DEFAULT true,
  	"show_technologies" boolean DEFAULT true,
  	"show_links" boolean DEFAULT true,
  	"theme" "enum_lp_facts_theme" DEFAULT 'light',
  	"block_name" varchar
  );
  
  CREATE TABLE "lp_transition" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" jsonb,
  	"layout" "enum_lp_transition_layout" DEFAULT 'centered',
  	"theme" "enum_lp_transition_theme" DEFAULT 'light',
  	"block_name" varchar
  );
  
  CREATE TABLE "lp_related" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar DEFAULT 'More from the lab',
  	"selection_mode" "enum_lp_related_selection_mode" DEFAULT 'document-settings',
  	"limit" numeric DEFAULT 3,
  	"layout" "enum_lp_related_layout" DEFAULT 'grid',
  	"block_name" varchar
  );
  
  CREATE TABLE "lab_pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"lab_project_id" integer,
  	"hero_eyebrow" varchar,
  	"hero_title_override" varchar,
  	"hero_summary_override" varchar,
  	"hero_media_id" integer,
  	"hero_layout" "enum_lab_pages_hero_layout" DEFAULT 'editorial-split',
  	"hero_theme" "enum_lab_pages_hero_theme" DEFAULT 'light',
  	"hero_media_treatment" "enum_lab_pages_hero_media_treatment" DEFAULT 'contained',
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
  	"_status" "enum_lab_pages_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "lab_pages_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer,
  	"lab_pages_id" integer
  );
  
  CREATE TABLE "_lp_story_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"source" "enum__lp_story_v_source" DEFAULT 'context',
  	"eyebrow" varchar,
  	"heading_override" varchar,
  	"body_override" jsonb,
  	"custom_body" jsonb,
  	"media_id" integer,
  	"layout" "enum__lp_story_v_layout" DEFAULT 'text-only',
  	"theme" "enum__lp_story_v_theme" DEFAULT 'light',
  	"width" "enum__lp_story_v_width" DEFAULT 'standard',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_lp_media_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"introduction" jsonb,
  	"layout" "enum__lp_media_v_layout" DEFAULT 'grid',
  	"theme" "enum__lp_media_v_theme" DEFAULT 'light',
  	"show_captions" boolean DEFAULT true,
  	"show_credits" boolean DEFAULT true,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_lp_facts_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar DEFAULT 'About this project',
  	"show_status" boolean DEFAULT true,
  	"show_technologies" boolean DEFAULT true,
  	"show_links" boolean DEFAULT true,
  	"theme" "enum__lp_facts_v_theme" DEFAULT 'light',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_lp_transition_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" jsonb,
  	"layout" "enum__lp_transition_v_layout" DEFAULT 'centered',
  	"theme" "enum__lp_transition_v_theme" DEFAULT 'light',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_lp_related_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar DEFAULT 'More from the lab',
  	"selection_mode" "enum__lp_related_v_selection_mode" DEFAULT 'document-settings',
  	"limit" numeric DEFAULT 3,
  	"layout" "enum__lp_related_v_layout" DEFAULT 'grid',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_lab_pages_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_lab_project_id" integer,
  	"version_hero_eyebrow" varchar,
  	"version_hero_title_override" varchar,
  	"version_hero_summary_override" varchar,
  	"version_hero_media_id" integer,
  	"version_hero_layout" "enum__lab_pages_v_version_hero_layout" DEFAULT 'editorial-split',
  	"version_hero_theme" "enum__lab_pages_v_version_hero_theme" DEFAULT 'light',
  	"version_hero_media_treatment" "enum__lab_pages_v_version_hero_media_treatment" DEFAULT 'contained',
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
  	"version__status" "enum__lab_pages_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_lab_pages_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer,
  	"lab_pages_id" integer
  );
  
  CREATE TABLE "lab_projects_technologies" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar
  );
  
  CREATE TABLE "lab_projects_project_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"url" varchar,
  	"visibility" "enum_lab_projects_project_links_visibility" DEFAULT 'public'
  );
  
  CREATE TABLE "lab_projects" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"kind" "lab_project_kind" DEFAULT 'experiment',
  	"status" "lab_project_status" DEFAULT 'active',
  	"start_date" timestamp(3) with time zone,
  	"end_date" timestamp(3) with time zone,
  	"thesis" varchar,
  	"summaries_one_line" varchar,
  	"summaries_short" varchar,
  	"summaries_medium" varchar,
  	"context" jsonb,
  	"approach" jsonb,
  	"outcome" jsonb,
  	"learnings" jsonb,
  	"internal_notes" varchar,
  	"cover_asset_id" integer,
  	"published_at" timestamp(3) with time zone,
  	"generate_key" boolean DEFAULT true,
  	"key" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_lab_projects_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "lab_projects_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"capabilities_id" integer,
  	"media_id" integer
  );
  
  CREATE TABLE "_lab_projects_v_version_technologies" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_lab_projects_v_version_project_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"url" varchar,
  	"visibility" "enum__lab_projects_v_version_project_links_visibility" DEFAULT 'public',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_lab_projects_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_kind" "lab_project_kind" DEFAULT 'experiment',
  	"version_status" "lab_project_status" DEFAULT 'active',
  	"version_start_date" timestamp(3) with time zone,
  	"version_end_date" timestamp(3) with time zone,
  	"version_thesis" varchar,
  	"version_summaries_one_line" varchar,
  	"version_summaries_short" varchar,
  	"version_summaries_medium" varchar,
  	"version_context" jsonb,
  	"version_approach" jsonb,
  	"version_outcome" jsonb,
  	"version_learnings" jsonb,
  	"version_internal_notes" varchar,
  	"version_cover_asset_id" integer,
  	"version_published_at" timestamp(3) with time zone,
  	"version_generate_key" boolean DEFAULT true,
  	"version_key" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__lab_projects_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_lab_projects_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"capabilities_id" integer,
  	"media_id" integer
  );
  
  CREATE TABLE "newsletters_blocks_nl_lab_pages" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_newsletters_v_blocks_nl_lab_pages" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "newsletters_rels" ADD COLUMN "lab_pages_id" integer;
  ALTER TABLE "_newsletters_v_rels" ADD COLUMN "lab_pages_id" integer;
  ALTER TABLE "redirects_rels" ADD COLUMN "lab_pages_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "lab_pages_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "lab_projects_id" integer;
  ALTER TABLE "lp_story" ADD CONSTRAINT "lp_story_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "lp_story" ADD CONSTRAINT "lp_story_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lab_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lp_media" ADD CONSTRAINT "lp_media_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lab_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lp_facts" ADD CONSTRAINT "lp_facts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lab_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lp_transition" ADD CONSTRAINT "lp_transition_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lab_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lp_related" ADD CONSTRAINT "lp_related_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lab_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lab_pages" ADD CONSTRAINT "lab_pages_lab_project_id_lab_projects_id_fk" FOREIGN KEY ("lab_project_id") REFERENCES "public"."lab_projects"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "lab_pages" ADD CONSTRAINT "lab_pages_hero_media_id_media_id_fk" FOREIGN KEY ("hero_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "lab_pages" ADD CONSTRAINT "lab_pages_cover_asset_id_media_id_fk" FOREIGN KEY ("cover_asset_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "lab_pages" ADD CONSTRAINT "lab_pages_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "lab_pages_rels" ADD CONSTRAINT "lab_pages_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."lab_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lab_pages_rels" ADD CONSTRAINT "lab_pages_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lab_pages_rels" ADD CONSTRAINT "lab_pages_rels_lab_pages_fk" FOREIGN KEY ("lab_pages_id") REFERENCES "public"."lab_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_lp_story_v" ADD CONSTRAINT "_lp_story_v_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_lp_story_v" ADD CONSTRAINT "_lp_story_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_lab_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_lp_media_v" ADD CONSTRAINT "_lp_media_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_lab_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_lp_facts_v" ADD CONSTRAINT "_lp_facts_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_lab_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_lp_transition_v" ADD CONSTRAINT "_lp_transition_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_lab_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_lp_related_v" ADD CONSTRAINT "_lp_related_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_lab_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_lab_pages_v" ADD CONSTRAINT "_lab_pages_v_parent_id_lab_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."lab_pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_lab_pages_v" ADD CONSTRAINT "_lab_pages_v_version_lab_project_id_lab_projects_id_fk" FOREIGN KEY ("version_lab_project_id") REFERENCES "public"."lab_projects"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_lab_pages_v" ADD CONSTRAINT "_lab_pages_v_version_hero_media_id_media_id_fk" FOREIGN KEY ("version_hero_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_lab_pages_v" ADD CONSTRAINT "_lab_pages_v_version_cover_asset_id_media_id_fk" FOREIGN KEY ("version_cover_asset_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_lab_pages_v" ADD CONSTRAINT "_lab_pages_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_lab_pages_v_rels" ADD CONSTRAINT "_lab_pages_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_lab_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_lab_pages_v_rels" ADD CONSTRAINT "_lab_pages_v_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_lab_pages_v_rels" ADD CONSTRAINT "_lab_pages_v_rels_lab_pages_fk" FOREIGN KEY ("lab_pages_id") REFERENCES "public"."lab_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lab_projects_technologies" ADD CONSTRAINT "lab_projects_technologies_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lab_projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lab_projects_project_links" ADD CONSTRAINT "lab_projects_project_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lab_projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lab_projects" ADD CONSTRAINT "lab_projects_cover_asset_id_media_id_fk" FOREIGN KEY ("cover_asset_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "lab_projects_rels" ADD CONSTRAINT "lab_projects_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."lab_projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lab_projects_rels" ADD CONSTRAINT "lab_projects_rels_capabilities_fk" FOREIGN KEY ("capabilities_id") REFERENCES "public"."capabilities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lab_projects_rels" ADD CONSTRAINT "lab_projects_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_lab_projects_v_version_technologies" ADD CONSTRAINT "_lab_projects_v_version_technologies_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_lab_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_lab_projects_v_version_project_links" ADD CONSTRAINT "_lab_projects_v_version_project_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_lab_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_lab_projects_v" ADD CONSTRAINT "_lab_projects_v_parent_id_lab_projects_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."lab_projects"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_lab_projects_v" ADD CONSTRAINT "_lab_projects_v_version_cover_asset_id_media_id_fk" FOREIGN KEY ("version_cover_asset_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_lab_projects_v_rels" ADD CONSTRAINT "_lab_projects_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_lab_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_lab_projects_v_rels" ADD CONSTRAINT "_lab_projects_v_rels_capabilities_fk" FOREIGN KEY ("capabilities_id") REFERENCES "public"."capabilities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_lab_projects_v_rels" ADD CONSTRAINT "_lab_projects_v_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "newsletters_blocks_nl_lab_pages" ADD CONSTRAINT "newsletters_blocks_nl_lab_pages_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."newsletters"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_newsletters_v_blocks_nl_lab_pages" ADD CONSTRAINT "_newsletters_v_blocks_nl_lab_pages_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_newsletters_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "lp_story_order_idx" ON "lp_story" USING btree ("_order");
  CREATE INDEX "lp_story_parent_id_idx" ON "lp_story" USING btree ("_parent_id");
  CREATE INDEX "lp_story_path_idx" ON "lp_story" USING btree ("_path");
  CREATE INDEX "lp_story_media_idx" ON "lp_story" USING btree ("media_id");
  CREATE INDEX "lp_media_order_idx" ON "lp_media" USING btree ("_order");
  CREATE INDEX "lp_media_parent_id_idx" ON "lp_media" USING btree ("_parent_id");
  CREATE INDEX "lp_media_path_idx" ON "lp_media" USING btree ("_path");
  CREATE INDEX "lp_facts_order_idx" ON "lp_facts" USING btree ("_order");
  CREATE INDEX "lp_facts_parent_id_idx" ON "lp_facts" USING btree ("_parent_id");
  CREATE INDEX "lp_facts_path_idx" ON "lp_facts" USING btree ("_path");
  CREATE INDEX "lp_transition_order_idx" ON "lp_transition" USING btree ("_order");
  CREATE INDEX "lp_transition_parent_id_idx" ON "lp_transition" USING btree ("_parent_id");
  CREATE INDEX "lp_transition_path_idx" ON "lp_transition" USING btree ("_path");
  CREATE INDEX "lp_related_order_idx" ON "lp_related" USING btree ("_order");
  CREATE INDEX "lp_related_parent_id_idx" ON "lp_related" USING btree ("_parent_id");
  CREATE INDEX "lp_related_path_idx" ON "lp_related" USING btree ("_path");
  CREATE UNIQUE INDEX "lab_pages_lab_project_idx" ON "lab_pages" USING btree ("lab_project_id");
  CREATE INDEX "lab_pages_hero_hero_media_idx" ON "lab_pages" USING btree ("hero_media_id");
  CREATE INDEX "lab_pages_cover_asset_idx" ON "lab_pages" USING btree ("cover_asset_id");
  CREATE INDEX "lab_pages_meta_meta_image_idx" ON "lab_pages" USING btree ("meta_image_id");
  CREATE UNIQUE INDEX "lab_pages_slug_idx" ON "lab_pages" USING btree ("slug");
  CREATE INDEX "lab_pages_updated_at_idx" ON "lab_pages" USING btree ("updated_at");
  CREATE INDEX "lab_pages_created_at_idx" ON "lab_pages" USING btree ("created_at");
  CREATE INDEX "lab_pages__status_idx" ON "lab_pages" USING btree ("_status");
  CREATE INDEX "lab_pages_rels_order_idx" ON "lab_pages_rels" USING btree ("order");
  CREATE INDEX "lab_pages_rels_parent_idx" ON "lab_pages_rels" USING btree ("parent_id");
  CREATE INDEX "lab_pages_rels_path_idx" ON "lab_pages_rels" USING btree ("path");
  CREATE INDEX "lab_pages_rels_media_id_idx" ON "lab_pages_rels" USING btree ("media_id");
  CREATE INDEX "lab_pages_rels_lab_pages_id_idx" ON "lab_pages_rels" USING btree ("lab_pages_id");
  CREATE INDEX "_lp_story_v_order_idx" ON "_lp_story_v" USING btree ("_order");
  CREATE INDEX "_lp_story_v_parent_id_idx" ON "_lp_story_v" USING btree ("_parent_id");
  CREATE INDEX "_lp_story_v_path_idx" ON "_lp_story_v" USING btree ("_path");
  CREATE INDEX "_lp_story_v_media_idx" ON "_lp_story_v" USING btree ("media_id");
  CREATE INDEX "_lp_media_v_order_idx" ON "_lp_media_v" USING btree ("_order");
  CREATE INDEX "_lp_media_v_parent_id_idx" ON "_lp_media_v" USING btree ("_parent_id");
  CREATE INDEX "_lp_media_v_path_idx" ON "_lp_media_v" USING btree ("_path");
  CREATE INDEX "_lp_facts_v_order_idx" ON "_lp_facts_v" USING btree ("_order");
  CREATE INDEX "_lp_facts_v_parent_id_idx" ON "_lp_facts_v" USING btree ("_parent_id");
  CREATE INDEX "_lp_facts_v_path_idx" ON "_lp_facts_v" USING btree ("_path");
  CREATE INDEX "_lp_transition_v_order_idx" ON "_lp_transition_v" USING btree ("_order");
  CREATE INDEX "_lp_transition_v_parent_id_idx" ON "_lp_transition_v" USING btree ("_parent_id");
  CREATE INDEX "_lp_transition_v_path_idx" ON "_lp_transition_v" USING btree ("_path");
  CREATE INDEX "_lp_related_v_order_idx" ON "_lp_related_v" USING btree ("_order");
  CREATE INDEX "_lp_related_v_parent_id_idx" ON "_lp_related_v" USING btree ("_parent_id");
  CREATE INDEX "_lp_related_v_path_idx" ON "_lp_related_v" USING btree ("_path");
  CREATE INDEX "_lab_pages_v_parent_idx" ON "_lab_pages_v" USING btree ("parent_id");
  CREATE INDEX "_lab_pages_v_version_version_lab_project_idx" ON "_lab_pages_v" USING btree ("version_lab_project_id");
  CREATE INDEX "_lab_pages_v_version_hero_version_hero_media_idx" ON "_lab_pages_v" USING btree ("version_hero_media_id");
  CREATE INDEX "_lab_pages_v_version_version_cover_asset_idx" ON "_lab_pages_v" USING btree ("version_cover_asset_id");
  CREATE INDEX "_lab_pages_v_version_meta_version_meta_image_idx" ON "_lab_pages_v" USING btree ("version_meta_image_id");
  CREATE INDEX "_lab_pages_v_version_version_slug_idx" ON "_lab_pages_v" USING btree ("version_slug");
  CREATE INDEX "_lab_pages_v_version_version_updated_at_idx" ON "_lab_pages_v" USING btree ("version_updated_at");
  CREATE INDEX "_lab_pages_v_version_version_created_at_idx" ON "_lab_pages_v" USING btree ("version_created_at");
  CREATE INDEX "_lab_pages_v_version_version__status_idx" ON "_lab_pages_v" USING btree ("version__status");
  CREATE INDEX "_lab_pages_v_created_at_idx" ON "_lab_pages_v" USING btree ("created_at");
  CREATE INDEX "_lab_pages_v_updated_at_idx" ON "_lab_pages_v" USING btree ("updated_at");
  CREATE INDEX "_lab_pages_v_latest_idx" ON "_lab_pages_v" USING btree ("latest");
  CREATE INDEX "_lab_pages_v_autosave_idx" ON "_lab_pages_v" USING btree ("autosave");
  CREATE INDEX "_lab_pages_v_rels_order_idx" ON "_lab_pages_v_rels" USING btree ("order");
  CREATE INDEX "_lab_pages_v_rels_parent_idx" ON "_lab_pages_v_rels" USING btree ("parent_id");
  CREATE INDEX "_lab_pages_v_rels_path_idx" ON "_lab_pages_v_rels" USING btree ("path");
  CREATE INDEX "_lab_pages_v_rels_media_id_idx" ON "_lab_pages_v_rels" USING btree ("media_id");
  CREATE INDEX "_lab_pages_v_rels_lab_pages_id_idx" ON "_lab_pages_v_rels" USING btree ("lab_pages_id");
  CREATE INDEX "lab_projects_technologies_order_idx" ON "lab_projects_technologies" USING btree ("_order");
  CREATE INDEX "lab_projects_technologies_parent_id_idx" ON "lab_projects_technologies" USING btree ("_parent_id");
  CREATE INDEX "lab_projects_project_links_order_idx" ON "lab_projects_project_links" USING btree ("_order");
  CREATE INDEX "lab_projects_project_links_parent_id_idx" ON "lab_projects_project_links" USING btree ("_parent_id");
  CREATE INDEX "lab_projects_cover_asset_idx" ON "lab_projects" USING btree ("cover_asset_id");
  CREATE UNIQUE INDEX "lab_projects_key_idx" ON "lab_projects" USING btree ("key");
  CREATE INDEX "lab_projects_updated_at_idx" ON "lab_projects" USING btree ("updated_at");
  CREATE INDEX "lab_projects_created_at_idx" ON "lab_projects" USING btree ("created_at");
  CREATE INDEX "lab_projects__status_idx" ON "lab_projects" USING btree ("_status");
  CREATE INDEX "lab_projects_rels_order_idx" ON "lab_projects_rels" USING btree ("order");
  CREATE INDEX "lab_projects_rels_parent_idx" ON "lab_projects_rels" USING btree ("parent_id");
  CREATE INDEX "lab_projects_rels_path_idx" ON "lab_projects_rels" USING btree ("path");
  CREATE INDEX "lab_projects_rels_capabilities_id_idx" ON "lab_projects_rels" USING btree ("capabilities_id");
  CREATE INDEX "lab_projects_rels_media_id_idx" ON "lab_projects_rels" USING btree ("media_id");
  CREATE INDEX "_lab_projects_v_version_technologies_order_idx" ON "_lab_projects_v_version_technologies" USING btree ("_order");
  CREATE INDEX "_lab_projects_v_version_technologies_parent_id_idx" ON "_lab_projects_v_version_technologies" USING btree ("_parent_id");
  CREATE INDEX "_lab_projects_v_version_project_links_order_idx" ON "_lab_projects_v_version_project_links" USING btree ("_order");
  CREATE INDEX "_lab_projects_v_version_project_links_parent_id_idx" ON "_lab_projects_v_version_project_links" USING btree ("_parent_id");
  CREATE INDEX "_lab_projects_v_parent_idx" ON "_lab_projects_v" USING btree ("parent_id");
  CREATE INDEX "_lab_projects_v_version_version_cover_asset_idx" ON "_lab_projects_v" USING btree ("version_cover_asset_id");
  CREATE INDEX "_lab_projects_v_version_version_key_idx" ON "_lab_projects_v" USING btree ("version_key");
  CREATE INDEX "_lab_projects_v_version_version_updated_at_idx" ON "_lab_projects_v" USING btree ("version_updated_at");
  CREATE INDEX "_lab_projects_v_version_version_created_at_idx" ON "_lab_projects_v" USING btree ("version_created_at");
  CREATE INDEX "_lab_projects_v_version_version__status_idx" ON "_lab_projects_v" USING btree ("version__status");
  CREATE INDEX "_lab_projects_v_created_at_idx" ON "_lab_projects_v" USING btree ("created_at");
  CREATE INDEX "_lab_projects_v_updated_at_idx" ON "_lab_projects_v" USING btree ("updated_at");
  CREATE INDEX "_lab_projects_v_latest_idx" ON "_lab_projects_v" USING btree ("latest");
  CREATE INDEX "_lab_projects_v_autosave_idx" ON "_lab_projects_v" USING btree ("autosave");
  CREATE INDEX "_lab_projects_v_rels_order_idx" ON "_lab_projects_v_rels" USING btree ("order");
  CREATE INDEX "_lab_projects_v_rels_parent_idx" ON "_lab_projects_v_rels" USING btree ("parent_id");
  CREATE INDEX "_lab_projects_v_rels_path_idx" ON "_lab_projects_v_rels" USING btree ("path");
  CREATE INDEX "_lab_projects_v_rels_capabilities_id_idx" ON "_lab_projects_v_rels" USING btree ("capabilities_id");
  CREATE INDEX "_lab_projects_v_rels_media_id_idx" ON "_lab_projects_v_rels" USING btree ("media_id");
  CREATE INDEX "newsletters_blocks_nl_lab_pages_order_idx" ON "newsletters_blocks_nl_lab_pages" USING btree ("_order");
  CREATE INDEX "newsletters_blocks_nl_lab_pages_parent_id_idx" ON "newsletters_blocks_nl_lab_pages" USING btree ("_parent_id");
  CREATE INDEX "newsletters_blocks_nl_lab_pages_path_idx" ON "newsletters_blocks_nl_lab_pages" USING btree ("_path");
  CREATE INDEX "_newsletters_v_blocks_nl_lab_pages_order_idx" ON "_newsletters_v_blocks_nl_lab_pages" USING btree ("_order");
  CREATE INDEX "_newsletters_v_blocks_nl_lab_pages_parent_id_idx" ON "_newsletters_v_blocks_nl_lab_pages" USING btree ("_parent_id");
  CREATE INDEX "_newsletters_v_blocks_nl_lab_pages_path_idx" ON "_newsletters_v_blocks_nl_lab_pages" USING btree ("_path");
  ALTER TABLE "newsletters_rels" ADD CONSTRAINT "newsletters_rels_lab_pages_fk" FOREIGN KEY ("lab_pages_id") REFERENCES "public"."lab_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_newsletters_v_rels" ADD CONSTRAINT "_newsletters_v_rels_lab_pages_fk" FOREIGN KEY ("lab_pages_id") REFERENCES "public"."lab_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "redirects_rels" ADD CONSTRAINT "redirects_rels_lab_pages_fk" FOREIGN KEY ("lab_pages_id") REFERENCES "public"."lab_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_lab_pages_fk" FOREIGN KEY ("lab_pages_id") REFERENCES "public"."lab_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_lab_projects_fk" FOREIGN KEY ("lab_projects_id") REFERENCES "public"."lab_projects"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "newsletters_rels_lab_pages_id_idx" ON "newsletters_rels" USING btree ("lab_pages_id");
  CREATE INDEX "_newsletters_v_rels_lab_pages_id_idx" ON "_newsletters_v_rels" USING btree ("lab_pages_id");
  CREATE INDEX "redirects_rels_lab_pages_id_idx" ON "redirects_rels" USING btree ("lab_pages_id");
  CREATE INDEX "payload_locked_documents_rels_lab_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("lab_pages_id");
  CREATE INDEX "payload_locked_documents_rels_lab_projects_id_idx" ON "payload_locked_documents_rels" USING btree ("lab_projects_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "lp_story" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "lp_media" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "lp_facts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "lp_transition" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "lp_related" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "lab_pages" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "lab_pages_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_lp_story_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_lp_media_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_lp_facts_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_lp_transition_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_lp_related_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_lab_pages_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_lab_pages_v_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "lab_projects_technologies" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "lab_projects_project_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "lab_projects" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "lab_projects_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_lab_projects_v_version_technologies" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_lab_projects_v_version_project_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_lab_projects_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_lab_projects_v_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "newsletters_blocks_nl_lab_pages" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_newsletters_v_blocks_nl_lab_pages" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "lp_story" CASCADE;
  DROP TABLE "lp_media" CASCADE;
  DROP TABLE "lp_facts" CASCADE;
  DROP TABLE "lp_transition" CASCADE;
  DROP TABLE "lp_related" CASCADE;
  DROP TABLE "lab_pages" CASCADE;
  DROP TABLE "lab_pages_rels" CASCADE;
  DROP TABLE "_lp_story_v" CASCADE;
  DROP TABLE "_lp_media_v" CASCADE;
  DROP TABLE "_lp_facts_v" CASCADE;
  DROP TABLE "_lp_transition_v" CASCADE;
  DROP TABLE "_lp_related_v" CASCADE;
  DROP TABLE "_lab_pages_v" CASCADE;
  DROP TABLE "_lab_pages_v_rels" CASCADE;
  DROP TABLE "lab_projects_technologies" CASCADE;
  DROP TABLE "lab_projects_project_links" CASCADE;
  DROP TABLE "lab_projects" CASCADE;
  DROP TABLE "lab_projects_rels" CASCADE;
  DROP TABLE "_lab_projects_v_version_technologies" CASCADE;
  DROP TABLE "_lab_projects_v_version_project_links" CASCADE;
  DROP TABLE "_lab_projects_v" CASCADE;
  DROP TABLE "_lab_projects_v_rels" CASCADE;
  DROP TABLE "newsletters_blocks_nl_lab_pages" CASCADE;
  DROP TABLE "_newsletters_v_blocks_nl_lab_pages" CASCADE;
  ALTER TABLE "newsletters_rels" DROP CONSTRAINT "newsletters_rels_lab_pages_fk";
  
  ALTER TABLE "_newsletters_v_rels" DROP CONSTRAINT "_newsletters_v_rels_lab_pages_fk";
  
  ALTER TABLE "redirects_rels" DROP CONSTRAINT "redirects_rels_lab_pages_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_lab_pages_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_lab_projects_fk";
  
  DROP INDEX "newsletters_rels_lab_pages_id_idx";
  DROP INDEX "_newsletters_v_rels_lab_pages_id_idx";
  DROP INDEX "redirects_rels_lab_pages_id_idx";
  DROP INDEX "payload_locked_documents_rels_lab_pages_id_idx";
  DROP INDEX "payload_locked_documents_rels_lab_projects_id_idx";
  ALTER TABLE "newsletters_rels" DROP COLUMN "lab_pages_id";
  ALTER TABLE "_newsletters_v_rels" DROP COLUMN "lab_pages_id";
  ALTER TABLE "redirects_rels" DROP COLUMN "lab_pages_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "lab_pages_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "lab_projects_id";
  DROP TYPE "public"."enum_lp_story_source";
  DROP TYPE "public"."enum_lp_story_layout";
  DROP TYPE "public"."enum_lp_story_theme";
  DROP TYPE "public"."enum_lp_story_width";
  DROP TYPE "public"."enum_lp_media_layout";
  DROP TYPE "public"."enum_lp_media_theme";
  DROP TYPE "public"."enum_lp_facts_theme";
  DROP TYPE "public"."enum_lp_transition_layout";
  DROP TYPE "public"."enum_lp_transition_theme";
  DROP TYPE "public"."enum_lp_related_selection_mode";
  DROP TYPE "public"."enum_lp_related_layout";
  DROP TYPE "public"."enum_lab_pages_hero_layout";
  DROP TYPE "public"."enum_lab_pages_hero_theme";
  DROP TYPE "public"."enum_lab_pages_hero_media_treatment";
  DROP TYPE "public"."enum_lab_pages_status";
  DROP TYPE "public"."enum__lp_story_v_source";
  DROP TYPE "public"."enum__lp_story_v_layout";
  DROP TYPE "public"."enum__lp_story_v_theme";
  DROP TYPE "public"."enum__lp_story_v_width";
  DROP TYPE "public"."enum__lp_media_v_layout";
  DROP TYPE "public"."enum__lp_media_v_theme";
  DROP TYPE "public"."enum__lp_facts_v_theme";
  DROP TYPE "public"."enum__lp_transition_v_layout";
  DROP TYPE "public"."enum__lp_transition_v_theme";
  DROP TYPE "public"."enum__lp_related_v_selection_mode";
  DROP TYPE "public"."enum__lp_related_v_layout";
  DROP TYPE "public"."enum__lab_pages_v_version_hero_layout";
  DROP TYPE "public"."enum__lab_pages_v_version_hero_theme";
  DROP TYPE "public"."enum__lab_pages_v_version_hero_media_treatment";
  DROP TYPE "public"."enum__lab_pages_v_version_status";
  DROP TYPE "public"."enum_lab_projects_project_links_visibility";
  DROP TYPE "public"."lab_project_kind";
  DROP TYPE "public"."lab_project_status";
  DROP TYPE "public"."enum_lab_projects_status";
  DROP TYPE "public"."enum__lab_projects_v_version_project_links_visibility";
  DROP TYPE "public"."enum__lab_projects_v_version_status";`)
}
