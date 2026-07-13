import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_organizations_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__organizations_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_projects_project_links_visibility" AS ENUM('public', 'internal');
  CREATE TYPE "public"."enum_projects_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__projects_v_version_project_links_visibility" AS ENUM('public', 'internal');
  CREATE TYPE "public"."enum__projects_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_case_studies_metrics_direction" AS ENUM('increase', 'decrease', 'neutral', 'not-applicable');
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
  CREATE TYPE "public"."enum_case_studies_primary_audience" AS ENUM('prospective-client', 'existing-client', 'design-community', 'development-community', 'general');
  CREATE TYPE "public"."enum_case_studies_website_hero_layout" AS ENUM('editorial-split', 'centered', 'immersive', 'media-led');
  CREATE TYPE "public"."enum_case_studies_website_hero_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_case_studies_website_hero_media_treatment" AS ENUM('contained', 'full-bleed', 'floating', 'background');
  CREATE TYPE "public"."enum_case_studies_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__case_studies_v_version_metrics_direction" AS ENUM('increase', 'decrease', 'neutral', 'not-applicable');
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
  CREATE TYPE "public"."enum__case_studies_v_version_primary_audience" AS ENUM('prospective-client', 'existing-client', 'design-community', 'development-community', 'general');
  CREATE TYPE "public"."enum__case_studies_v_version_website_hero_layout" AS ENUM('editorial-split', 'centered', 'immersive', 'media-led');
  CREATE TYPE "public"."enum__case_studies_v_version_website_hero_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum__case_studies_v_version_website_hero_media_treatment" AS ENUM('contained', 'full-bleed', 'floating', 'background');
  CREATE TYPE "public"."enum__case_studies_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_testimonials_approval_status" AS ENUM('unverified', 'client-review', 'approved-public', 'internal-only');
  CREATE TYPE "public"."enum_testimonials_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__testimonials_v_version_approval_status" AS ENUM('unverified', 'client-review', 'approved-public', 'internal-only');
  CREATE TYPE "public"."enum__testimonials_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_media_approved_channels" AS ENUM('website', 'pitch-deck', 'proposal', 'email', 'social');
  CREATE TYPE "public"."enum_media_purpose" AS ENUM('overview', 'research', 'process', 'strategy', 'wireframe', 'design-system', 'interface', 'environment', 'team', 'result', 'before', 'after', 'motion', 'other');
  CREATE TYPE "public"."enum_media_usage_status" AS ENUM('internal', 'client-review', 'public-approved');
  CREATE TABLE "organizations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"short_name" varchar,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar,
  	"website" varchar,
  	"logo_id" integer,
  	"description" jsonb,
  	"internal_notes" varchar,
  	"published_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_organizations_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "organizations_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"industries_id" integer
  );
  
  CREATE TABLE "_organizations_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_name" varchar,
  	"version_short_name" varchar,
  	"version_generate_slug" boolean DEFAULT true,
  	"version_slug" varchar,
  	"version_website" varchar,
  	"version_logo_id" integer,
  	"version_description" jsonb,
  	"version_internal_notes" varchar,
  	"version_published_at" timestamp(3) with time zone,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__organizations_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_organizations_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"industries_id" integer
  );
  
  CREATE TABLE "projects_platforms" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar
  );
  
  CREATE TABLE "projects_deliverables" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar
  );
  
  CREATE TABLE "projects_project_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"url" varchar,
  	"visibility" "enum_projects_project_links_visibility" DEFAULT 'public'
  );
  
  CREATE TABLE "projects" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"internal_title" varchar,
  	"public_title" varchar,
  	"organization_id" integer,
	"status" varchar DEFAULT 'planned',
  	"engagement_type" varchar,
  	"start_date" timestamp(3) with time zone,
  	"end_date" timestamp(3) with time zone,
  	"public_summary" jsonb,
  	"scope" jsonb,
  	"constraints" jsonb,
  	"internal_notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_projects_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "projects_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"capabilities_id" integer,
  	"industries_id" integer
  );
  
  CREATE TABLE "_projects_v_version_platforms" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_projects_v_version_deliverables" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_projects_v_version_project_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"url" varchar,
  	"visibility" "enum__projects_v_version_project_links_visibility" DEFAULT 'public',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_projects_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_internal_title" varchar,
  	"version_public_title" varchar,
  	"version_organization_id" integer,
	"version_status" varchar DEFAULT 'planned',
  	"version_engagement_type" varchar,
  	"version_start_date" timestamp(3) with time zone,
  	"version_end_date" timestamp(3) with time zone,
  	"version_public_summary" jsonb,
  	"version_scope" jsonb,
  	"version_constraints" jsonb,
  	"version_internal_notes" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__projects_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_projects_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"capabilities_id" integer,
  	"industries_id" integer
  );
  
  CREATE TABLE "case_studies_objectives" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar
  );
  
  CREATE TABLE "case_studies_key_decisions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"title" varchar,
  	"problem" varchar,
  	"decision" varchar,
  	"rationale" varchar,
  	"impact" varchar,
  	"featured" boolean
  );
  
  CREATE TABLE "case_studies_qualitative_outcomes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"featured" boolean
  );
  
  CREATE TABLE "case_studies_metrics" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"label" varchar,
  	"value" varchar,
  	"unit" varchar,
  	"direction" "enum_case_studies_metrics_direction",
  	"qualifier" varchar,
  	"comparison_baseline" varchar,
  	"timeframe" varchar,
  	"source" varchar,
  	"approved_for_public" boolean DEFAULT false,
  	"featured" boolean
  );
  
  CREATE TABLE "case_studies_approved_claims" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"claim" varchar,
  	"source" varchar,
  	"approved" boolean
  );
  
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
  
  CREATE TABLE "case_studies" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"project_id" integer,
  	"thesis" varchar,
  	"summaries_one_line" varchar,
  	"summaries_short" varchar,
  	"summaries_medium" varchar,
  	"primary_audience" "enum_case_studies_primary_audience",
  	"context" jsonb,
  	"challenge" jsonb,
  	"strategy" jsonb,
  	"approach" jsonb,
  	"learnings" jsonb,
  	"outcome_summary" jsonb,
  	"review_date" timestamp(3) with time zone,
  	"cover_asset_id" integer,
  	"website_enabled" boolean DEFAULT true,
  	"website_hero_eyebrow" varchar,
  	"website_hero_title_override" varchar,
  	"website_hero_summary_override" varchar,
  	"website_hero_media_id" integer,
  	"website_hero_layout" "enum_case_studies_website_hero_layout" DEFAULT 'editorial-split',
  	"website_hero_theme" "enum_case_studies_website_hero_theme" DEFAULT 'light',
  	"website_hero_media_treatment" "enum_case_studies_website_hero_media_treatment" DEFAULT 'contained',
  	"website_notes" varchar,
  	"meta_title" varchar,
  	"meta_image_id" integer,
  	"meta_description" varchar,
  	"featured" boolean DEFAULT false,
  	"published_at" timestamp(3) with time zone,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_case_studies_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "case_studies_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"capabilities_id" integer,
  	"testimonials_id" integer,
  	"media_id" integer,
  	"case_studies_id" integer
  );
  
  CREATE TABLE "_case_studies_v_version_objectives" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_case_studies_v_version_key_decisions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"title" varchar,
  	"problem" varchar,
  	"decision" varchar,
  	"rationale" varchar,
  	"impact" varchar,
  	"featured" boolean,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_case_studies_v_version_qualitative_outcomes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"featured" boolean,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_case_studies_v_version_metrics" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"label" varchar,
  	"value" varchar,
  	"unit" varchar,
  	"direction" "enum__case_studies_v_version_metrics_direction",
  	"qualifier" varchar,
  	"comparison_baseline" varchar,
  	"timeframe" varchar,
  	"source" varchar,
  	"approved_for_public" boolean DEFAULT false,
  	"featured" boolean,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_case_studies_v_version_approved_claims" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"claim" varchar,
  	"source" varchar,
  	"approved" boolean,
  	"_uuid" varchar
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
  
  CREATE TABLE "_case_studies_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_project_id" integer,
  	"version_thesis" varchar,
  	"version_summaries_one_line" varchar,
  	"version_summaries_short" varchar,
  	"version_summaries_medium" varchar,
  	"version_primary_audience" "enum__case_studies_v_version_primary_audience",
  	"version_context" jsonb,
  	"version_challenge" jsonb,
  	"version_strategy" jsonb,
  	"version_approach" jsonb,
  	"version_learnings" jsonb,
  	"version_outcome_summary" jsonb,
  	"version_review_date" timestamp(3) with time zone,
  	"version_cover_asset_id" integer,
  	"version_website_enabled" boolean DEFAULT true,
  	"version_website_hero_eyebrow" varchar,
  	"version_website_hero_title_override" varchar,
  	"version_website_hero_summary_override" varchar,
  	"version_website_hero_media_id" integer,
  	"version_website_hero_layout" "enum__case_studies_v_version_website_hero_layout" DEFAULT 'editorial-split',
  	"version_website_hero_theme" "enum__case_studies_v_version_website_hero_theme" DEFAULT 'light',
  	"version_website_hero_media_treatment" "enum__case_studies_v_version_website_hero_media_treatment" DEFAULT 'contained',
  	"version_website_notes" varchar,
  	"version_meta_title" varchar,
  	"version_meta_image_id" integer,
  	"version_meta_description" varchar,
  	"version_featured" boolean DEFAULT false,
  	"version_published_at" timestamp(3) with time zone,
  	"version_generate_slug" boolean DEFAULT true,
  	"version_slug" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__case_studies_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_case_studies_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"capabilities_id" integer,
  	"testimonials_id" integer,
  	"media_id" integer,
  	"case_studies_id" integer
  );
  
  CREATE TABLE "testimonials" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"internal_title" varchar,
  	"organization_id" integer,
  	"project_id" integer,
  	"speaker_name" varchar,
  	"speaker_role" varchar,
  	"speaker_organization" varchar,
  	"quote" jsonb,
  	"portrait_id" integer,
  	"approval_status" "enum_testimonials_approval_status" DEFAULT 'unverified',
  	"source" varchar,
  	"approved_at" timestamp(3) with time zone,
  	"internal_notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_testimonials_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_testimonials_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_internal_title" varchar,
  	"version_organization_id" integer,
  	"version_project_id" integer,
  	"version_speaker_name" varchar,
  	"version_speaker_role" varchar,
  	"version_speaker_organization" varchar,
  	"version_quote" jsonb,
  	"version_portrait_id" integer,
  	"version_approval_status" "enum__testimonials_v_version_approval_status" DEFAULT 'unverified',
  	"version_source" varchar,
  	"version_approved_at" timestamp(3) with time zone,
  	"version_internal_notes" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__testimonials_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "capabilities" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar NOT NULL,
  	"description" varchar,
  	"order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "industries" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar NOT NULL,
  	"description" varchar,
  	"order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "media_approved_channels" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_media_approved_channels",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  ALTER TABLE "media" ADD COLUMN "title" varchar;
  ALTER TABLE "media" ADD COLUMN "description" varchar;
  ALTER TABLE "media" ADD COLUMN "organization_id" integer;
  ALTER TABLE "media" ADD COLUMN "project_id" integer;
  ALTER TABLE "media" ADD COLUMN "purpose" "enum_media_purpose";
  ALTER TABLE "media" ADD COLUMN "usage_status" "enum_media_usage_status";
  -- Existing assets power the current public site, so preserve compatibility before enforcing the new constraint.
  UPDATE "media" SET "usage_status" = 'public-approved' WHERE "usage_status" IS NULL;
  ALTER TABLE "media" ALTER COLUMN "usage_status" SET DEFAULT 'internal';
  ALTER TABLE "media" ALTER COLUMN "usage_status" SET NOT NULL;
  ALTER TABLE "media" ADD COLUMN "credit" varchar;
  ALTER TABLE "media" ADD COLUMN "source_url" varchar;
  ALTER TABLE "media" ADD COLUMN "asset_date" timestamp(3) with time zone;
  ALTER TABLE "redirects_rels" ADD COLUMN "case_studies_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "organizations_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "projects_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "case_studies_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "testimonials_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "capabilities_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "industries_id" integer;
  ALTER TABLE "organizations" ADD CONSTRAINT "organizations_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "organizations_rels" ADD CONSTRAINT "organizations_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "organizations_rels" ADD CONSTRAINT "organizations_rels_industries_fk" FOREIGN KEY ("industries_id") REFERENCES "public"."industries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_organizations_v" ADD CONSTRAINT "_organizations_v_parent_id_organizations_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."organizations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_organizations_v" ADD CONSTRAINT "_organizations_v_version_logo_id_media_id_fk" FOREIGN KEY ("version_logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_organizations_v_rels" ADD CONSTRAINT "_organizations_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_organizations_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_organizations_v_rels" ADD CONSTRAINT "_organizations_v_rels_industries_fk" FOREIGN KEY ("industries_id") REFERENCES "public"."industries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_platforms" ADD CONSTRAINT "projects_platforms_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_deliverables" ADD CONSTRAINT "projects_deliverables_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_project_links" ADD CONSTRAINT "projects_project_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects" ADD CONSTRAINT "projects_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects_rels" ADD CONSTRAINT "projects_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_rels" ADD CONSTRAINT "projects_rels_capabilities_fk" FOREIGN KEY ("capabilities_id") REFERENCES "public"."capabilities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_rels" ADD CONSTRAINT "projects_rels_industries_fk" FOREIGN KEY ("industries_id") REFERENCES "public"."industries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_version_platforms" ADD CONSTRAINT "_projects_v_version_platforms_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_version_deliverables" ADD CONSTRAINT "_projects_v_version_deliverables_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_version_project_links" ADD CONSTRAINT "_projects_v_version_project_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v" ADD CONSTRAINT "_projects_v_parent_id_projects_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v" ADD CONSTRAINT "_projects_v_version_organization_id_organizations_id_fk" FOREIGN KEY ("version_organization_id") REFERENCES "public"."organizations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v_rels" ADD CONSTRAINT "_projects_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_rels" ADD CONSTRAINT "_projects_v_rels_capabilities_fk" FOREIGN KEY ("capabilities_id") REFERENCES "public"."capabilities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_rels" ADD CONSTRAINT "_projects_v_rels_industries_fk" FOREIGN KEY ("industries_id") REFERENCES "public"."industries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "case_studies_objectives" ADD CONSTRAINT "case_studies_objectives_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."case_studies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "case_studies_key_decisions" ADD CONSTRAINT "case_studies_key_decisions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."case_studies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "case_studies_qualitative_outcomes" ADD CONSTRAINT "case_studies_qualitative_outcomes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."case_studies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "case_studies_metrics" ADD CONSTRAINT "case_studies_metrics_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."case_studies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "case_studies_approved_claims" ADD CONSTRAINT "case_studies_approved_claims_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."case_studies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cs_story" ADD CONSTRAINT "cs_story_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cs_story" ADD CONSTRAINT "cs_story_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."case_studies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cs_media" ADD CONSTRAINT "cs_media_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."case_studies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cs_decisions" ADD CONSTRAINT "cs_decisions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."case_studies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cs_metrics" ADD CONSTRAINT "cs_metrics_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."case_studies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cs_quote" ADD CONSTRAINT "cs_quote_testimonial_id_testimonials_id_fk" FOREIGN KEY ("testimonial_id") REFERENCES "public"."testimonials"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cs_quote" ADD CONSTRAINT "cs_quote_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."case_studies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cs_transition" ADD CONSTRAINT "cs_transition_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."case_studies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cs_related" ADD CONSTRAINT "cs_related_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."case_studies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "case_studies" ADD CONSTRAINT "case_studies_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "case_studies" ADD CONSTRAINT "case_studies_cover_asset_id_media_id_fk" FOREIGN KEY ("cover_asset_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "case_studies" ADD CONSTRAINT "case_studies_website_hero_media_id_media_id_fk" FOREIGN KEY ("website_hero_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "case_studies" ADD CONSTRAINT "case_studies_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "case_studies_rels" ADD CONSTRAINT "case_studies_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."case_studies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "case_studies_rels" ADD CONSTRAINT "case_studies_rels_capabilities_fk" FOREIGN KEY ("capabilities_id") REFERENCES "public"."capabilities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "case_studies_rels" ADD CONSTRAINT "case_studies_rels_testimonials_fk" FOREIGN KEY ("testimonials_id") REFERENCES "public"."testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "case_studies_rels" ADD CONSTRAINT "case_studies_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "case_studies_rels" ADD CONSTRAINT "case_studies_rels_case_studies_fk" FOREIGN KEY ("case_studies_id") REFERENCES "public"."case_studies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_case_studies_v_version_objectives" ADD CONSTRAINT "_case_studies_v_version_objectives_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_case_studies_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_case_studies_v_version_key_decisions" ADD CONSTRAINT "_case_studies_v_version_key_decisions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_case_studies_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_case_studies_v_version_qualitative_outcomes" ADD CONSTRAINT "_case_studies_v_version_qualitative_outcomes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_case_studies_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_case_studies_v_version_metrics" ADD CONSTRAINT "_case_studies_v_version_metrics_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_case_studies_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_case_studies_v_version_approved_claims" ADD CONSTRAINT "_case_studies_v_version_approved_claims_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_case_studies_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_cs_story_v" ADD CONSTRAINT "_cs_story_v_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_cs_story_v" ADD CONSTRAINT "_cs_story_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_case_studies_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_cs_media_v" ADD CONSTRAINT "_cs_media_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_case_studies_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_cs_decisions_v" ADD CONSTRAINT "_cs_decisions_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_case_studies_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_cs_metrics_v" ADD CONSTRAINT "_cs_metrics_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_case_studies_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_cs_quote_v" ADD CONSTRAINT "_cs_quote_v_testimonial_id_testimonials_id_fk" FOREIGN KEY ("testimonial_id") REFERENCES "public"."testimonials"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_cs_quote_v" ADD CONSTRAINT "_cs_quote_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_case_studies_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_cs_transition_v" ADD CONSTRAINT "_cs_transition_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_case_studies_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_cs_related_v" ADD CONSTRAINT "_cs_related_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_case_studies_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_case_studies_v" ADD CONSTRAINT "_case_studies_v_parent_id_case_studies_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."case_studies"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_case_studies_v" ADD CONSTRAINT "_case_studies_v_version_project_id_projects_id_fk" FOREIGN KEY ("version_project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_case_studies_v" ADD CONSTRAINT "_case_studies_v_version_cover_asset_id_media_id_fk" FOREIGN KEY ("version_cover_asset_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_case_studies_v" ADD CONSTRAINT "_case_studies_v_version_website_hero_media_id_media_id_fk" FOREIGN KEY ("version_website_hero_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_case_studies_v" ADD CONSTRAINT "_case_studies_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_case_studies_v_rels" ADD CONSTRAINT "_case_studies_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_case_studies_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_case_studies_v_rels" ADD CONSTRAINT "_case_studies_v_rels_capabilities_fk" FOREIGN KEY ("capabilities_id") REFERENCES "public"."capabilities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_case_studies_v_rels" ADD CONSTRAINT "_case_studies_v_rels_testimonials_fk" FOREIGN KEY ("testimonials_id") REFERENCES "public"."testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_case_studies_v_rels" ADD CONSTRAINT "_case_studies_v_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_case_studies_v_rels" ADD CONSTRAINT "_case_studies_v_rels_case_studies_fk" FOREIGN KEY ("case_studies_id") REFERENCES "public"."case_studies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_portrait_id_media_id_fk" FOREIGN KEY ("portrait_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_testimonials_v" ADD CONSTRAINT "_testimonials_v_parent_id_testimonials_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."testimonials"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_testimonials_v" ADD CONSTRAINT "_testimonials_v_version_organization_id_organizations_id_fk" FOREIGN KEY ("version_organization_id") REFERENCES "public"."organizations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_testimonials_v" ADD CONSTRAINT "_testimonials_v_version_project_id_projects_id_fk" FOREIGN KEY ("version_project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_testimonials_v" ADD CONSTRAINT "_testimonials_v_version_portrait_id_media_id_fk" FOREIGN KEY ("version_portrait_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "media_approved_channels" ADD CONSTRAINT "media_approved_channels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "organizations_slug_idx" ON "organizations" USING btree ("slug");
  CREATE INDEX "organizations_logo_idx" ON "organizations" USING btree ("logo_id");
  CREATE INDEX "organizations_updated_at_idx" ON "organizations" USING btree ("updated_at");
  CREATE INDEX "organizations_created_at_idx" ON "organizations" USING btree ("created_at");
  CREATE INDEX "organizations__status_idx" ON "organizations" USING btree ("_status");
  CREATE INDEX "organizations_rels_order_idx" ON "organizations_rels" USING btree ("order");
  CREATE INDEX "organizations_rels_parent_idx" ON "organizations_rels" USING btree ("parent_id");
  CREATE INDEX "organizations_rels_path_idx" ON "organizations_rels" USING btree ("path");
  CREATE INDEX "organizations_rels_industries_id_idx" ON "organizations_rels" USING btree ("industries_id");
  CREATE INDEX "_organizations_v_parent_idx" ON "_organizations_v" USING btree ("parent_id");
  CREATE INDEX "_organizations_v_version_version_slug_idx" ON "_organizations_v" USING btree ("version_slug");
  CREATE INDEX "_organizations_v_version_version_logo_idx" ON "_organizations_v" USING btree ("version_logo_id");
  CREATE INDEX "_organizations_v_version_version_updated_at_idx" ON "_organizations_v" USING btree ("version_updated_at");
  CREATE INDEX "_organizations_v_version_version_created_at_idx" ON "_organizations_v" USING btree ("version_created_at");
  CREATE INDEX "_organizations_v_version_version__status_idx" ON "_organizations_v" USING btree ("version__status");
  CREATE INDEX "_organizations_v_created_at_idx" ON "_organizations_v" USING btree ("created_at");
  CREATE INDEX "_organizations_v_updated_at_idx" ON "_organizations_v" USING btree ("updated_at");
  CREATE INDEX "_organizations_v_latest_idx" ON "_organizations_v" USING btree ("latest");
  CREATE INDEX "_organizations_v_autosave_idx" ON "_organizations_v" USING btree ("autosave");
  CREATE INDEX "_organizations_v_rels_order_idx" ON "_organizations_v_rels" USING btree ("order");
  CREATE INDEX "_organizations_v_rels_parent_idx" ON "_organizations_v_rels" USING btree ("parent_id");
  CREATE INDEX "_organizations_v_rels_path_idx" ON "_organizations_v_rels" USING btree ("path");
  CREATE INDEX "_organizations_v_rels_industries_id_idx" ON "_organizations_v_rels" USING btree ("industries_id");
  CREATE INDEX "projects_platforms_order_idx" ON "projects_platforms" USING btree ("_order");
  CREATE INDEX "projects_platforms_parent_id_idx" ON "projects_platforms" USING btree ("_parent_id");
  CREATE INDEX "projects_deliverables_order_idx" ON "projects_deliverables" USING btree ("_order");
  CREATE INDEX "projects_deliverables_parent_id_idx" ON "projects_deliverables" USING btree ("_parent_id");
  CREATE INDEX "projects_project_links_order_idx" ON "projects_project_links" USING btree ("_order");
  CREATE INDEX "projects_project_links_parent_id_idx" ON "projects_project_links" USING btree ("_parent_id");
  CREATE INDEX "projects_organization_idx" ON "projects" USING btree ("organization_id");
  CREATE INDEX "projects_updated_at_idx" ON "projects" USING btree ("updated_at");
  CREATE INDEX "projects_created_at_idx" ON "projects" USING btree ("created_at");
  CREATE INDEX "projects__status_idx" ON "projects" USING btree ("_status");
  CREATE INDEX "projects_rels_order_idx" ON "projects_rels" USING btree ("order");
  CREATE INDEX "projects_rels_parent_idx" ON "projects_rels" USING btree ("parent_id");
  CREATE INDEX "projects_rels_path_idx" ON "projects_rels" USING btree ("path");
  CREATE INDEX "projects_rels_capabilities_id_idx" ON "projects_rels" USING btree ("capabilities_id");
  CREATE INDEX "projects_rels_industries_id_idx" ON "projects_rels" USING btree ("industries_id");
  CREATE INDEX "_projects_v_version_platforms_order_idx" ON "_projects_v_version_platforms" USING btree ("_order");
  CREATE INDEX "_projects_v_version_platforms_parent_id_idx" ON "_projects_v_version_platforms" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_version_deliverables_order_idx" ON "_projects_v_version_deliverables" USING btree ("_order");
  CREATE INDEX "_projects_v_version_deliverables_parent_id_idx" ON "_projects_v_version_deliverables" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_version_project_links_order_idx" ON "_projects_v_version_project_links" USING btree ("_order");
  CREATE INDEX "_projects_v_version_project_links_parent_id_idx" ON "_projects_v_version_project_links" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_parent_idx" ON "_projects_v" USING btree ("parent_id");
  CREATE INDEX "_projects_v_version_version_organization_idx" ON "_projects_v" USING btree ("version_organization_id");
  CREATE INDEX "_projects_v_version_version_updated_at_idx" ON "_projects_v" USING btree ("version_updated_at");
  CREATE INDEX "_projects_v_version_version_created_at_idx" ON "_projects_v" USING btree ("version_created_at");
  CREATE INDEX "_projects_v_version_version__status_idx" ON "_projects_v" USING btree ("version__status");
  CREATE INDEX "_projects_v_created_at_idx" ON "_projects_v" USING btree ("created_at");
  CREATE INDEX "_projects_v_updated_at_idx" ON "_projects_v" USING btree ("updated_at");
  CREATE INDEX "_projects_v_latest_idx" ON "_projects_v" USING btree ("latest");
  CREATE INDEX "_projects_v_autosave_idx" ON "_projects_v" USING btree ("autosave");
  CREATE INDEX "_projects_v_rels_order_idx" ON "_projects_v_rels" USING btree ("order");
  CREATE INDEX "_projects_v_rels_parent_idx" ON "_projects_v_rels" USING btree ("parent_id");
  CREATE INDEX "_projects_v_rels_path_idx" ON "_projects_v_rels" USING btree ("path");
  CREATE INDEX "_projects_v_rels_capabilities_id_idx" ON "_projects_v_rels" USING btree ("capabilities_id");
  CREATE INDEX "_projects_v_rels_industries_id_idx" ON "_projects_v_rels" USING btree ("industries_id");
  CREATE INDEX "case_studies_objectives_order_idx" ON "case_studies_objectives" USING btree ("_order");
  CREATE INDEX "case_studies_objectives_parent_id_idx" ON "case_studies_objectives" USING btree ("_parent_id");
  CREATE INDEX "case_studies_key_decisions_order_idx" ON "case_studies_key_decisions" USING btree ("_order");
  CREATE INDEX "case_studies_key_decisions_parent_id_idx" ON "case_studies_key_decisions" USING btree ("_parent_id");
  CREATE INDEX "case_studies_qualitative_outcomes_order_idx" ON "case_studies_qualitative_outcomes" USING btree ("_order");
  CREATE INDEX "case_studies_qualitative_outcomes_parent_id_idx" ON "case_studies_qualitative_outcomes" USING btree ("_parent_id");
  CREATE INDEX "case_studies_metrics_order_idx" ON "case_studies_metrics" USING btree ("_order");
  CREATE INDEX "case_studies_metrics_parent_id_idx" ON "case_studies_metrics" USING btree ("_parent_id");
  CREATE INDEX "case_studies_approved_claims_order_idx" ON "case_studies_approved_claims" USING btree ("_order");
  CREATE INDEX "case_studies_approved_claims_parent_id_idx" ON "case_studies_approved_claims" USING btree ("_parent_id");
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
  CREATE INDEX "case_studies_project_idx" ON "case_studies" USING btree ("project_id");
  CREATE INDEX "case_studies_cover_asset_idx" ON "case_studies" USING btree ("cover_asset_id");
  CREATE INDEX "case_studies_website_hero_website_hero_media_idx" ON "case_studies" USING btree ("website_hero_media_id");
  CREATE INDEX "case_studies_meta_meta_image_idx" ON "case_studies" USING btree ("meta_image_id");
  CREATE UNIQUE INDEX "case_studies_slug_idx" ON "case_studies" USING btree ("slug");
  CREATE INDEX "case_studies_updated_at_idx" ON "case_studies" USING btree ("updated_at");
  CREATE INDEX "case_studies_created_at_idx" ON "case_studies" USING btree ("created_at");
  CREATE INDEX "case_studies__status_idx" ON "case_studies" USING btree ("_status");
  CREATE INDEX "case_studies_rels_order_idx" ON "case_studies_rels" USING btree ("order");
  CREATE INDEX "case_studies_rels_parent_idx" ON "case_studies_rels" USING btree ("parent_id");
  CREATE INDEX "case_studies_rels_path_idx" ON "case_studies_rels" USING btree ("path");
  CREATE INDEX "case_studies_rels_capabilities_id_idx" ON "case_studies_rels" USING btree ("capabilities_id");
  CREATE INDEX "case_studies_rels_testimonials_id_idx" ON "case_studies_rels" USING btree ("testimonials_id");
  CREATE INDEX "case_studies_rels_media_id_idx" ON "case_studies_rels" USING btree ("media_id");
  CREATE INDEX "case_studies_rels_case_studies_id_idx" ON "case_studies_rels" USING btree ("case_studies_id");
  CREATE INDEX "_case_studies_v_version_objectives_order_idx" ON "_case_studies_v_version_objectives" USING btree ("_order");
  CREATE INDEX "_case_studies_v_version_objectives_parent_id_idx" ON "_case_studies_v_version_objectives" USING btree ("_parent_id");
  CREATE INDEX "_case_studies_v_version_key_decisions_order_idx" ON "_case_studies_v_version_key_decisions" USING btree ("_order");
  CREATE INDEX "_case_studies_v_version_key_decisions_parent_id_idx" ON "_case_studies_v_version_key_decisions" USING btree ("_parent_id");
  CREATE INDEX "_case_studies_v_version_qualitative_outcomes_order_idx" ON "_case_studies_v_version_qualitative_outcomes" USING btree ("_order");
  CREATE INDEX "_case_studies_v_version_qualitative_outcomes_parent_id_idx" ON "_case_studies_v_version_qualitative_outcomes" USING btree ("_parent_id");
  CREATE INDEX "_case_studies_v_version_metrics_order_idx" ON "_case_studies_v_version_metrics" USING btree ("_order");
  CREATE INDEX "_case_studies_v_version_metrics_parent_id_idx" ON "_case_studies_v_version_metrics" USING btree ("_parent_id");
  CREATE INDEX "_case_studies_v_version_approved_claims_order_idx" ON "_case_studies_v_version_approved_claims" USING btree ("_order");
  CREATE INDEX "_case_studies_v_version_approved_claims_parent_id_idx" ON "_case_studies_v_version_approved_claims" USING btree ("_parent_id");
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
  CREATE INDEX "_case_studies_v_parent_idx" ON "_case_studies_v" USING btree ("parent_id");
  CREATE INDEX "_case_studies_v_version_version_project_idx" ON "_case_studies_v" USING btree ("version_project_id");
  CREATE INDEX "_case_studies_v_version_version_cover_asset_idx" ON "_case_studies_v" USING btree ("version_cover_asset_id");
  CREATE INDEX "_case_studies_v_version_website_hero_version_website_her_idx" ON "_case_studies_v" USING btree ("version_website_hero_media_id");
  CREATE INDEX "_case_studies_v_version_meta_version_meta_image_idx" ON "_case_studies_v" USING btree ("version_meta_image_id");
  CREATE INDEX "_case_studies_v_version_version_slug_idx" ON "_case_studies_v" USING btree ("version_slug");
  CREATE INDEX "_case_studies_v_version_version_updated_at_idx" ON "_case_studies_v" USING btree ("version_updated_at");
  CREATE INDEX "_case_studies_v_version_version_created_at_idx" ON "_case_studies_v" USING btree ("version_created_at");
  CREATE INDEX "_case_studies_v_version_version__status_idx" ON "_case_studies_v" USING btree ("version__status");
  CREATE INDEX "_case_studies_v_created_at_idx" ON "_case_studies_v" USING btree ("created_at");
  CREATE INDEX "_case_studies_v_updated_at_idx" ON "_case_studies_v" USING btree ("updated_at");
  CREATE INDEX "_case_studies_v_latest_idx" ON "_case_studies_v" USING btree ("latest");
  CREATE INDEX "_case_studies_v_autosave_idx" ON "_case_studies_v" USING btree ("autosave");
  CREATE INDEX "_case_studies_v_rels_order_idx" ON "_case_studies_v_rels" USING btree ("order");
  CREATE INDEX "_case_studies_v_rels_parent_idx" ON "_case_studies_v_rels" USING btree ("parent_id");
  CREATE INDEX "_case_studies_v_rels_path_idx" ON "_case_studies_v_rels" USING btree ("path");
  CREATE INDEX "_case_studies_v_rels_capabilities_id_idx" ON "_case_studies_v_rels" USING btree ("capabilities_id");
  CREATE INDEX "_case_studies_v_rels_testimonials_id_idx" ON "_case_studies_v_rels" USING btree ("testimonials_id");
  CREATE INDEX "_case_studies_v_rels_media_id_idx" ON "_case_studies_v_rels" USING btree ("media_id");
  CREATE INDEX "_case_studies_v_rels_case_studies_id_idx" ON "_case_studies_v_rels" USING btree ("case_studies_id");
  CREATE INDEX "testimonials_organization_idx" ON "testimonials" USING btree ("organization_id");
  CREATE INDEX "testimonials_project_idx" ON "testimonials" USING btree ("project_id");
  CREATE INDEX "testimonials_portrait_idx" ON "testimonials" USING btree ("portrait_id");
  CREATE INDEX "testimonials_updated_at_idx" ON "testimonials" USING btree ("updated_at");
  CREATE INDEX "testimonials_created_at_idx" ON "testimonials" USING btree ("created_at");
  CREATE INDEX "testimonials__status_idx" ON "testimonials" USING btree ("_status");
  CREATE INDEX "_testimonials_v_parent_idx" ON "_testimonials_v" USING btree ("parent_id");
  CREATE INDEX "_testimonials_v_version_version_organization_idx" ON "_testimonials_v" USING btree ("version_organization_id");
  CREATE INDEX "_testimonials_v_version_version_project_idx" ON "_testimonials_v" USING btree ("version_project_id");
  CREATE INDEX "_testimonials_v_version_version_portrait_idx" ON "_testimonials_v" USING btree ("version_portrait_id");
  CREATE INDEX "_testimonials_v_version_version_updated_at_idx" ON "_testimonials_v" USING btree ("version_updated_at");
  CREATE INDEX "_testimonials_v_version_version_created_at_idx" ON "_testimonials_v" USING btree ("version_created_at");
  CREATE INDEX "_testimonials_v_version_version__status_idx" ON "_testimonials_v" USING btree ("version__status");
  CREATE INDEX "_testimonials_v_created_at_idx" ON "_testimonials_v" USING btree ("created_at");
  CREATE INDEX "_testimonials_v_updated_at_idx" ON "_testimonials_v" USING btree ("updated_at");
  CREATE INDEX "_testimonials_v_latest_idx" ON "_testimonials_v" USING btree ("latest");
  CREATE INDEX "_testimonials_v_autosave_idx" ON "_testimonials_v" USING btree ("autosave");
  CREATE UNIQUE INDEX "capabilities_slug_idx" ON "capabilities" USING btree ("slug");
  CREATE INDEX "capabilities_order_idx" ON "capabilities" USING btree ("order");
  CREATE INDEX "capabilities_updated_at_idx" ON "capabilities" USING btree ("updated_at");
  CREATE INDEX "capabilities_created_at_idx" ON "capabilities" USING btree ("created_at");
  CREATE UNIQUE INDEX "industries_slug_idx" ON "industries" USING btree ("slug");
  CREATE INDEX "industries_order_idx" ON "industries" USING btree ("order");
  CREATE INDEX "industries_updated_at_idx" ON "industries" USING btree ("updated_at");
  CREATE INDEX "industries_created_at_idx" ON "industries" USING btree ("created_at");
  CREATE INDEX "media_approved_channels_order_idx" ON "media_approved_channels" USING btree ("order");
  CREATE INDEX "media_approved_channels_parent_idx" ON "media_approved_channels" USING btree ("parent_id");
  ALTER TABLE "media" ADD CONSTRAINT "media_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "media" ADD CONSTRAINT "media_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "redirects_rels" ADD CONSTRAINT "redirects_rels_case_studies_fk" FOREIGN KEY ("case_studies_id") REFERENCES "public"."case_studies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_organizations_fk" FOREIGN KEY ("organizations_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_projects_fk" FOREIGN KEY ("projects_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_case_studies_fk" FOREIGN KEY ("case_studies_id") REFERENCES "public"."case_studies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_testimonials_fk" FOREIGN KEY ("testimonials_id") REFERENCES "public"."testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_capabilities_fk" FOREIGN KEY ("capabilities_id") REFERENCES "public"."capabilities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_industries_fk" FOREIGN KEY ("industries_id") REFERENCES "public"."industries"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "media_organization_idx" ON "media" USING btree ("organization_id");
  CREATE INDEX "media_project_idx" ON "media" USING btree ("project_id");
  CREATE INDEX "redirects_rels_case_studies_id_idx" ON "redirects_rels" USING btree ("case_studies_id");
  CREATE INDEX "payload_locked_documents_rels_organizations_id_idx" ON "payload_locked_documents_rels" USING btree ("organizations_id");
  CREATE INDEX "payload_locked_documents_rels_projects_id_idx" ON "payload_locked_documents_rels" USING btree ("projects_id");
  CREATE INDEX "payload_locked_documents_rels_case_studies_id_idx" ON "payload_locked_documents_rels" USING btree ("case_studies_id");
  CREATE INDEX "payload_locked_documents_rels_testimonials_id_idx" ON "payload_locked_documents_rels" USING btree ("testimonials_id");
  CREATE INDEX "payload_locked_documents_rels_capabilities_id_idx" ON "payload_locked_documents_rels" USING btree ("capabilities_id");
  CREATE INDEX "payload_locked_documents_rels_industries_id_idx" ON "payload_locked_documents_rels" USING btree ("industries_id");`)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "organizations" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "organizations_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_organizations_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_organizations_v_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "projects_platforms" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "projects_deliverables" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "projects_project_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "projects" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "projects_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_projects_v_version_platforms" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_projects_v_version_deliverables" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_projects_v_version_project_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_projects_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_projects_v_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "case_studies_objectives" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "case_studies_key_decisions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "case_studies_qualitative_outcomes" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "case_studies_metrics" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "case_studies_approved_claims" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "cs_story" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "cs_media" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "cs_decisions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "cs_metrics" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "cs_quote" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "cs_transition" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "cs_related" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "case_studies" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "case_studies_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_case_studies_v_version_objectives" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_case_studies_v_version_key_decisions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_case_studies_v_version_qualitative_outcomes" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_case_studies_v_version_metrics" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_case_studies_v_version_approved_claims" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_cs_story_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_cs_media_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_cs_decisions_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_cs_metrics_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_cs_quote_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_cs_transition_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_cs_related_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_case_studies_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_case_studies_v_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "testimonials" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_testimonials_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "capabilities" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "industries" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "media_approved_channels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "organizations" CASCADE;
  DROP TABLE "organizations_rels" CASCADE;
  DROP TABLE "_organizations_v" CASCADE;
  DROP TABLE "_organizations_v_rels" CASCADE;
  DROP TABLE "projects_platforms" CASCADE;
  DROP TABLE "projects_deliverables" CASCADE;
  DROP TABLE "projects_project_links" CASCADE;
  DROP TABLE "projects" CASCADE;
  DROP TABLE "projects_rels" CASCADE;
  DROP TABLE "_projects_v_version_platforms" CASCADE;
  DROP TABLE "_projects_v_version_deliverables" CASCADE;
  DROP TABLE "_projects_v_version_project_links" CASCADE;
  DROP TABLE "_projects_v" CASCADE;
  DROP TABLE "_projects_v_rels" CASCADE;
  DROP TABLE "case_studies_objectives" CASCADE;
  DROP TABLE "case_studies_key_decisions" CASCADE;
  DROP TABLE "case_studies_qualitative_outcomes" CASCADE;
  DROP TABLE "case_studies_metrics" CASCADE;
  DROP TABLE "case_studies_approved_claims" CASCADE;
  DROP TABLE "cs_story" CASCADE;
  DROP TABLE "cs_media" CASCADE;
  DROP TABLE "cs_decisions" CASCADE;
  DROP TABLE "cs_metrics" CASCADE;
  DROP TABLE "cs_quote" CASCADE;
  DROP TABLE "cs_transition" CASCADE;
  DROP TABLE "cs_related" CASCADE;
  DROP TABLE "case_studies" CASCADE;
  DROP TABLE "case_studies_rels" CASCADE;
  DROP TABLE "_case_studies_v_version_objectives" CASCADE;
  DROP TABLE "_case_studies_v_version_key_decisions" CASCADE;
  DROP TABLE "_case_studies_v_version_qualitative_outcomes" CASCADE;
  DROP TABLE "_case_studies_v_version_metrics" CASCADE;
  DROP TABLE "_case_studies_v_version_approved_claims" CASCADE;
  DROP TABLE "_cs_story_v" CASCADE;
  DROP TABLE "_cs_media_v" CASCADE;
  DROP TABLE "_cs_decisions_v" CASCADE;
  DROP TABLE "_cs_metrics_v" CASCADE;
  DROP TABLE "_cs_quote_v" CASCADE;
  DROP TABLE "_cs_transition_v" CASCADE;
  DROP TABLE "_cs_related_v" CASCADE;
  DROP TABLE "_case_studies_v" CASCADE;
  DROP TABLE "_case_studies_v_rels" CASCADE;
  DROP TABLE "testimonials" CASCADE;
  DROP TABLE "_testimonials_v" CASCADE;
  DROP TABLE "capabilities" CASCADE;
  DROP TABLE "industries" CASCADE;
  DROP TABLE "media_approved_channels" CASCADE;
  ALTER TABLE "media" DROP CONSTRAINT "media_organization_id_organizations_id_fk";
  
  ALTER TABLE "media" DROP CONSTRAINT "media_project_id_projects_id_fk";
  
  ALTER TABLE "redirects_rels" DROP CONSTRAINT "redirects_rels_case_studies_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_organizations_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_projects_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_case_studies_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_testimonials_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_capabilities_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_industries_fk";
  
  DROP INDEX "media_organization_idx";
  DROP INDEX "media_project_idx";
  DROP INDEX "redirects_rels_case_studies_id_idx";
  DROP INDEX "payload_locked_documents_rels_organizations_id_idx";
  DROP INDEX "payload_locked_documents_rels_projects_id_idx";
  DROP INDEX "payload_locked_documents_rels_case_studies_id_idx";
  DROP INDEX "payload_locked_documents_rels_testimonials_id_idx";
  DROP INDEX "payload_locked_documents_rels_capabilities_id_idx";
  DROP INDEX "payload_locked_documents_rels_industries_id_idx";
  ALTER TABLE "media" DROP COLUMN "title";
  ALTER TABLE "media" DROP COLUMN "description";
  ALTER TABLE "media" DROP COLUMN "organization_id";
  ALTER TABLE "media" DROP COLUMN "project_id";
  ALTER TABLE "media" DROP COLUMN "purpose";
  ALTER TABLE "media" DROP COLUMN "usage_status";
  ALTER TABLE "media" DROP COLUMN "credit";
  ALTER TABLE "media" DROP COLUMN "source_url";
  ALTER TABLE "media" DROP COLUMN "asset_date";
  ALTER TABLE "redirects_rels" DROP COLUMN "case_studies_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "organizations_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "projects_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "case_studies_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "testimonials_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "capabilities_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "industries_id";
  DROP TYPE "public"."enum_organizations_status";
  DROP TYPE "public"."enum__organizations_v_version_status";
  DROP TYPE "public"."enum_projects_project_links_visibility";
  DROP TYPE "public"."enum_projects_status";
  DROP TYPE "public"."enum__projects_v_version_project_links_visibility";
  DROP TYPE "public"."enum__projects_v_version_status";
  DROP TYPE "public"."enum_case_studies_metrics_direction";
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
  DROP TYPE "public"."enum_case_studies_primary_audience";
  DROP TYPE "public"."enum_case_studies_website_hero_layout";
  DROP TYPE "public"."enum_case_studies_website_hero_theme";
  DROP TYPE "public"."enum_case_studies_website_hero_media_treatment";
  DROP TYPE "public"."enum_case_studies_status";
  DROP TYPE "public"."enum__case_studies_v_version_metrics_direction";
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
  DROP TYPE "public"."enum__case_studies_v_version_primary_audience";
  DROP TYPE "public"."enum__case_studies_v_version_website_hero_layout";
  DROP TYPE "public"."enum__case_studies_v_version_website_hero_theme";
  DROP TYPE "public"."enum__case_studies_v_version_website_hero_media_treatment";
  DROP TYPE "public"."enum__case_studies_v_version_status";
  DROP TYPE "public"."enum_testimonials_approval_status";
  DROP TYPE "public"."enum_testimonials_status";
  DROP TYPE "public"."enum__testimonials_v_version_approval_status";
  DROP TYPE "public"."enum__testimonials_v_version_status";
  DROP TYPE "public"."enum_media_approved_channels";
  DROP TYPE "public"."enum_media_purpose";
  DROP TYPE "public"."enum_media_usage_status";`)
}
