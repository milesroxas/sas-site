import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_lab_pages_transition_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum_lab_pages_transition_story_scope" AS ENUM('overview', 'section', 'beat');
  CREATE TYPE "public"."enum_lab_pages_blocks_feature_heading_offset_story_scope" AS ENUM('overview', 'section', 'beat');
  CREATE TYPE "public"."enum_lab_pages_full_media_story_scope" AS ENUM('overview', 'section', 'beat');
  CREATE TYPE "public"."enum_lab_pages_media_split_story_scope" AS ENUM('overview', 'section', 'beat');
  CREATE TYPE "public"."enum_lab_pages_split_narrow_story_scope" AS ENUM('overview', 'section', 'beat');
  CREATE TYPE "public"."enum_lab_pages_image_pair_story_scope" AS ENUM('overview', 'section', 'beat');
  CREATE TYPE "public"."enum_lab_pages_split_offset_story_scope" AS ENUM('overview', 'section', 'beat');
  CREATE TYPE "public"."enum_lab_pages_image_statement_story_scope" AS ENUM('overview', 'section', 'beat');
  CREATE TYPE "public"."enum_lab_pages_blocks_feature_tabs_tabs_story_scope" AS ENUM('overview', 'section', 'beat');
  CREATE TYPE "public"."enum_lp_story_story_scope" AS ENUM('overview', 'section', 'beat');
  CREATE TYPE "public"."enum_lab_pages_blocks_feature_statement_grid_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum_lab_pages_blocks_feature_statement_grid_story_scope" AS ENUM('overview', 'section', 'beat');
  CREATE TYPE "public"."enum_lab_pages_blocks_feature_statement_grid_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_lab_pages_closing_cl_link_type" AS ENUM('reference', 'site', 'custom');
  CREATE TYPE "public"."enum_lab_pages_closing_cl_link_site_page" AS ENUM('home', 'works-index', 'insights-index');
  CREATE TYPE "public"."enum_lab_pages_closing_cl_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum___lab_pages_v_transition_v_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum___lab_pages_v_transition_v_story_scope" AS ENUM('overview', 'section', 'beat');
  CREATE TYPE "public"."enum__lab_pages_v_blocks_feature_heading_offset_story_scope" AS ENUM('overview', 'section', 'beat');
  CREATE TYPE "public"."enum___lab_pages_v_full_media_v_story_scope" AS ENUM('overview', 'section', 'beat');
  CREATE TYPE "public"."enum___lab_pages_v_media_split_v_story_scope" AS ENUM('overview', 'section', 'beat');
  CREATE TYPE "public"."enum___lab_pages_v_split_narrow_v_story_scope" AS ENUM('overview', 'section', 'beat');
  CREATE TYPE "public"."enum___lab_pages_v_image_pair_v_story_scope" AS ENUM('overview', 'section', 'beat');
  CREATE TYPE "public"."enum___lab_pages_v_split_offset_v_story_scope" AS ENUM('overview', 'section', 'beat');
  CREATE TYPE "public"."enum___lab_pages_v_image_statement_v_story_scope" AS ENUM('overview', 'section', 'beat');
  CREATE TYPE "public"."enum__lab_pages_v_blocks_feature_tabs_tabs_story_scope" AS ENUM('overview', 'section', 'beat');
  CREATE TYPE "public"."enum__lp_story_v_story_scope" AS ENUM('overview', 'section', 'beat');
  CREATE TYPE "public"."enum__lab_pages_v_blocks_feature_statement_grid_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum__lab_pages_v_blocks_feature_statement_grid_story_scope" AS ENUM('overview', 'section', 'beat');
  CREATE TYPE "public"."enum__lab_pages_v_blocks_feature_statement_grid_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___lab_pages_v_version_closing_cl_v_link_type" AS ENUM('reference', 'site', 'custom');
  CREATE TYPE "public"."enum___lab_pages_v_version_closing_cl_v_link_site_page" AS ENUM('home', 'works-index', 'insights-index');
  CREATE TYPE "public"."enum___lab_pages_v_version_closing_cl_v_link_appearance" AS ENUM('default', 'outline');
  CREATE TABLE "lab_pages_blocks_feature_statement_grid_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"title" varchar,
  	"description" varchar
  );
  
  CREATE TABLE "lab_pages_blocks_feature_statement_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"source" "enum_lab_pages_blocks_feature_statement_grid_source" DEFAULT 'custom',
  	"story_scope" "enum_lab_pages_blocks_feature_statement_grid_story_scope" DEFAULT 'overview',
  	"story_beat_key" varchar,
  	"show_overrides" boolean DEFAULT false,
  	"statement" jsonb,
  	"footnote" varchar,
  	"theme" "enum_lab_pages_blocks_feature_statement_grid_theme" DEFAULT 'light',
  	"block_name" varchar
  );
  
  CREATE TABLE "lab_pages_closing_cl" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_lab_pages_closing_cl_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_site_page" "enum_lab_pages_closing_cl_link_site_page",
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum_lab_pages_closing_cl_link_appearance" DEFAULT 'default'
  );
  
  CREATE TABLE "_lab_pages_v_blocks_feature_statement_grid_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"title" varchar,
  	"description" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_lab_pages_v_blocks_feature_statement_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"source" "enum__lab_pages_v_blocks_feature_statement_grid_source" DEFAULT 'custom',
  	"story_scope" "enum__lab_pages_v_blocks_feature_statement_grid_story_scope" DEFAULT 'overview',
  	"story_beat_key" varchar,
  	"show_overrides" boolean DEFAULT false,
  	"statement" jsonb,
  	"footnote" varchar,
  	"theme" "enum__lab_pages_v_blocks_feature_statement_grid_theme" DEFAULT 'light',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "__lab_pages_v_version_closing_cl_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_type" "enum___lab_pages_v_version_closing_cl_v_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_site_page" "enum___lab_pages_v_version_closing_cl_v_link_site_page",
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum___lab_pages_v_version_closing_cl_v_link_appearance" DEFAULT 'default',
  	"_uuid" varchar
  );
  
  CREATE TABLE "lab_projects_context_story_beats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"label" varchar,
  	"heading" varchar,
  	"body" jsonb
  );
  
  CREATE TABLE "lab_projects_challenge_story_beats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"label" varchar,
  	"heading" varchar,
  	"body" jsonb
  );
  
  CREATE TABLE "lab_projects_strategy_story_beats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"label" varchar,
  	"heading" varchar,
  	"body" jsonb
  );
  
  CREATE TABLE "lab_projects_approach_story_beats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"label" varchar,
  	"heading" varchar,
  	"body" jsonb
  );
  
  CREATE TABLE "lab_projects_outcome_summary_story_beats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"label" varchar,
  	"heading" varchar,
  	"body" jsonb
  );
  
  CREATE TABLE "lab_projects_learnings_story_beats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"label" varchar,
  	"heading" varchar,
  	"body" jsonb
  );
  
  CREATE TABLE "_lab_projects_v_version_context_story_beats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"label" varchar,
  	"heading" varchar,
  	"body" jsonb,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_lab_projects_v_version_challenge_story_beats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"label" varchar,
  	"heading" varchar,
  	"body" jsonb,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_lab_projects_v_version_strategy_story_beats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"label" varchar,
  	"heading" varchar,
  	"body" jsonb,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_lab_projects_v_version_approach_story_beats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"label" varchar,
  	"heading" varchar,
  	"body" jsonb,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_lab_projects_v_version_outcome_summary_story_beats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"label" varchar,
  	"heading" varchar,
  	"body" jsonb,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_lab_projects_v_version_learnings_story_beats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"label" varchar,
  	"heading" varchar,
  	"body" jsonb,
  	"_uuid" varchar
  );
  
  ALTER TABLE "lab_projects" RENAME COLUMN "context" TO "context_body";
  ALTER TABLE "lab_projects" RENAME COLUMN "approach" TO "approach_body";
  ALTER TABLE "lab_projects" RENAME COLUMN "outcome" TO "outcome_summary_body";
  ALTER TABLE "lab_projects" RENAME COLUMN "learnings" TO "learnings_body";
  ALTER TABLE "_lab_projects_v" RENAME COLUMN "version_context" TO "version_context_body";
  ALTER TABLE "_lab_projects_v" RENAME COLUMN "version_approach" TO "version_approach_body";
  ALTER TABLE "_lab_projects_v" RENAME COLUMN "version_outcome" TO "version_outcome_summary_body";
  ALTER TABLE "_lab_projects_v" RENAME COLUMN "version_learnings" TO "version_learnings_body";
  ALTER TABLE "lp_story" ALTER COLUMN "source" SET DATA TYPE text;
  ALTER TABLE "lp_story" ALTER COLUMN "source" SET DEFAULT 'context'::text;
  -- Lab adopts the Case Study section vocabulary: outcome is now outcome-summary.
  UPDATE "lp_story" SET "source" = 'outcome-summary' WHERE "source" = 'outcome';
  UPDATE "lp_story" SET "source" = NULL WHERE "source" NOT IN ('context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings', 'custom');
  DROP TYPE "public"."enum_lp_story_source";
  CREATE TYPE "public"."enum_lp_story_source" AS ENUM('context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings', 'custom');
  ALTER TABLE "lp_story" ALTER COLUMN "source" SET DEFAULT 'context'::"public"."enum_lp_story_source";
  ALTER TABLE "lp_story" ALTER COLUMN "source" SET DATA TYPE "public"."enum_lp_story_source" USING "source"::"public"."enum_lp_story_source";
  ALTER TABLE "_lp_story_v" ALTER COLUMN "source" SET DATA TYPE text;
  ALTER TABLE "_lp_story_v" ALTER COLUMN "source" SET DEFAULT 'context'::text;
  UPDATE "_lp_story_v" SET "source" = 'outcome-summary' WHERE "source" = 'outcome';
  UPDATE "_lp_story_v" SET "source" = NULL WHERE "source" NOT IN ('context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings', 'custom');
  DROP TYPE "public"."enum__lp_story_v_source";
  CREATE TYPE "public"."enum__lp_story_v_source" AS ENUM('context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings', 'custom');
  ALTER TABLE "_lp_story_v" ALTER COLUMN "source" SET DEFAULT 'context'::"public"."enum__lp_story_v_source";
  ALTER TABLE "_lp_story_v" ALTER COLUMN "source" SET DATA TYPE "public"."enum__lp_story_v_source" USING "source"::"public"."enum__lp_story_v_source";
  ALTER TABLE "lab_pages_transition" ADD COLUMN "source" "enum_lab_pages_transition_source" DEFAULT 'custom';
  ALTER TABLE "lab_pages_transition" ADD COLUMN "story_scope" "enum_lab_pages_transition_story_scope" DEFAULT 'overview';
  ALTER TABLE "lab_pages_transition" ADD COLUMN "story_beat_key" varchar;
  ALTER TABLE "lab_pages_transition" ADD COLUMN "show_overrides" boolean DEFAULT false;
  ALTER TABLE "lab_pages_blocks_feature_heading_offset" ADD COLUMN "story_scope" "enum_lab_pages_blocks_feature_heading_offset_story_scope" DEFAULT 'overview';
  ALTER TABLE "lab_pages_blocks_feature_heading_offset" ADD COLUMN "story_beat_key" varchar;
  ALTER TABLE "lab_pages_blocks_feature_heading_offset" ADD COLUMN "show_overrides" boolean DEFAULT false;
  ALTER TABLE "lab_pages_full_media" ADD COLUMN "story_scope" "enum_lab_pages_full_media_story_scope" DEFAULT 'overview';
  ALTER TABLE "lab_pages_full_media" ADD COLUMN "story_beat_key" varchar;
  ALTER TABLE "lab_pages_full_media" ADD COLUMN "show_overrides" boolean DEFAULT false;
  ALTER TABLE "lab_pages_media_split" ADD COLUMN "story_scope" "enum_lab_pages_media_split_story_scope" DEFAULT 'overview';
  ALTER TABLE "lab_pages_media_split" ADD COLUMN "story_beat_key" varchar;
  ALTER TABLE "lab_pages_media_split" ADD COLUMN "show_overrides" boolean DEFAULT false;
  ALTER TABLE "lab_pages_split_narrow" ADD COLUMN "story_scope" "enum_lab_pages_split_narrow_story_scope" DEFAULT 'overview';
  ALTER TABLE "lab_pages_split_narrow" ADD COLUMN "story_beat_key" varchar;
  ALTER TABLE "lab_pages_split_narrow" ADD COLUMN "show_overrides" boolean DEFAULT false;
  ALTER TABLE "lab_pages_image_pair" ADD COLUMN "story_scope" "enum_lab_pages_image_pair_story_scope" DEFAULT 'overview';
  ALTER TABLE "lab_pages_image_pair" ADD COLUMN "story_beat_key" varchar;
  ALTER TABLE "lab_pages_image_pair" ADD COLUMN "show_overrides" boolean DEFAULT false;
  ALTER TABLE "lab_pages_split_offset" ADD COLUMN "story_scope" "enum_lab_pages_split_offset_story_scope" DEFAULT 'overview';
  ALTER TABLE "lab_pages_split_offset" ADD COLUMN "story_beat_key" varchar;
  ALTER TABLE "lab_pages_split_offset" ADD COLUMN "show_overrides" boolean DEFAULT false;
  ALTER TABLE "lab_pages_image_statement" ADD COLUMN "story_scope" "enum_lab_pages_image_statement_story_scope" DEFAULT 'overview';
  ALTER TABLE "lab_pages_image_statement" ADD COLUMN "story_beat_key" varchar;
  ALTER TABLE "lab_pages_image_statement" ADD COLUMN "show_overrides" boolean DEFAULT false;
  ALTER TABLE "lab_pages_blocks_feature_tabs_tabs" ADD COLUMN "story_scope" "enum_lab_pages_blocks_feature_tabs_tabs_story_scope" DEFAULT 'overview';
  ALTER TABLE "lab_pages_blocks_feature_tabs_tabs" ADD COLUMN "story_beat_key" varchar;
  ALTER TABLE "lab_pages_blocks_feature_tabs_tabs" ADD COLUMN "show_overrides" boolean DEFAULT false;
  ALTER TABLE "lp_story" ADD COLUMN "story_scope" "enum_lp_story_story_scope" DEFAULT 'overview';
  ALTER TABLE "lp_story" ADD COLUMN "story_beat_key" varchar;
  ALTER TABLE "lp_story" ADD COLUMN "show_overrides" boolean DEFAULT false;
  ALTER TABLE "lab_pages" ADD COLUMN "intro_eyebrow" varchar;
  ALTER TABLE "lab_pages" ADD COLUMN "intro_title" varchar;
  ALTER TABLE "lab_pages" ADD COLUMN "intro_show_overrides" boolean DEFAULT false;
  ALTER TABLE "lab_pages" ADD COLUMN "intro_body_override" jsonb;
  ALTER TABLE "lab_pages" ADD COLUMN "closing_hidden" boolean DEFAULT false;
  ALTER TABLE "lab_pages" ADD COLUMN "closing_show_overrides" boolean DEFAULT false;
  ALTER TABLE "lab_pages" ADD COLUMN "closing_eyebrow_override" varchar;
  ALTER TABLE "lab_pages" ADD COLUMN "closing_heading_override" varchar;
  ALTER TABLE "lab_pages" ADD COLUMN "closing_ask_override_title" varchar;
  ALTER TABLE "lab_pages" ADD COLUMN "closing_ask_override_body" varchar;
  ALTER TABLE "lab_pages" ADD COLUMN "closing_media_override_id" integer;
  ALTER TABLE "__lab_pages_v_transition_v" ADD COLUMN "source" "enum___lab_pages_v_transition_v_source" DEFAULT 'custom';
  ALTER TABLE "__lab_pages_v_transition_v" ADD COLUMN "story_scope" "enum___lab_pages_v_transition_v_story_scope" DEFAULT 'overview';
  ALTER TABLE "__lab_pages_v_transition_v" ADD COLUMN "story_beat_key" varchar;
  ALTER TABLE "__lab_pages_v_transition_v" ADD COLUMN "show_overrides" boolean DEFAULT false;
  ALTER TABLE "_lab_pages_v_blocks_feature_heading_offset" ADD COLUMN "story_scope" "enum__lab_pages_v_blocks_feature_heading_offset_story_scope" DEFAULT 'overview';
  ALTER TABLE "_lab_pages_v_blocks_feature_heading_offset" ADD COLUMN "story_beat_key" varchar;
  ALTER TABLE "_lab_pages_v_blocks_feature_heading_offset" ADD COLUMN "show_overrides" boolean DEFAULT false;
  ALTER TABLE "__lab_pages_v_full_media_v" ADD COLUMN "story_scope" "enum___lab_pages_v_full_media_v_story_scope" DEFAULT 'overview';
  ALTER TABLE "__lab_pages_v_full_media_v" ADD COLUMN "story_beat_key" varchar;
  ALTER TABLE "__lab_pages_v_full_media_v" ADD COLUMN "show_overrides" boolean DEFAULT false;
  ALTER TABLE "__lab_pages_v_media_split_v" ADD COLUMN "story_scope" "enum___lab_pages_v_media_split_v_story_scope" DEFAULT 'overview';
  ALTER TABLE "__lab_pages_v_media_split_v" ADD COLUMN "story_beat_key" varchar;
  ALTER TABLE "__lab_pages_v_media_split_v" ADD COLUMN "show_overrides" boolean DEFAULT false;
  ALTER TABLE "__lab_pages_v_split_narrow_v" ADD COLUMN "story_scope" "enum___lab_pages_v_split_narrow_v_story_scope" DEFAULT 'overview';
  ALTER TABLE "__lab_pages_v_split_narrow_v" ADD COLUMN "story_beat_key" varchar;
  ALTER TABLE "__lab_pages_v_split_narrow_v" ADD COLUMN "show_overrides" boolean DEFAULT false;
  ALTER TABLE "__lab_pages_v_image_pair_v" ADD COLUMN "story_scope" "enum___lab_pages_v_image_pair_v_story_scope" DEFAULT 'overview';
  ALTER TABLE "__lab_pages_v_image_pair_v" ADD COLUMN "story_beat_key" varchar;
  ALTER TABLE "__lab_pages_v_image_pair_v" ADD COLUMN "show_overrides" boolean DEFAULT false;
  ALTER TABLE "__lab_pages_v_split_offset_v" ADD COLUMN "story_scope" "enum___lab_pages_v_split_offset_v_story_scope" DEFAULT 'overview';
  ALTER TABLE "__lab_pages_v_split_offset_v" ADD COLUMN "story_beat_key" varchar;
  ALTER TABLE "__lab_pages_v_split_offset_v" ADD COLUMN "show_overrides" boolean DEFAULT false;
  ALTER TABLE "__lab_pages_v_image_statement_v" ADD COLUMN "story_scope" "enum___lab_pages_v_image_statement_v_story_scope" DEFAULT 'overview';
  ALTER TABLE "__lab_pages_v_image_statement_v" ADD COLUMN "story_beat_key" varchar;
  ALTER TABLE "__lab_pages_v_image_statement_v" ADD COLUMN "show_overrides" boolean DEFAULT false;
  ALTER TABLE "_lab_pages_v_blocks_feature_tabs_tabs" ADD COLUMN "story_scope" "enum__lab_pages_v_blocks_feature_tabs_tabs_story_scope" DEFAULT 'overview';
  ALTER TABLE "_lab_pages_v_blocks_feature_tabs_tabs" ADD COLUMN "story_beat_key" varchar;
  ALTER TABLE "_lab_pages_v_blocks_feature_tabs_tabs" ADD COLUMN "show_overrides" boolean DEFAULT false;
  ALTER TABLE "_lp_story_v" ADD COLUMN "story_scope" "enum__lp_story_v_story_scope" DEFAULT 'overview';
  ALTER TABLE "_lp_story_v" ADD COLUMN "story_beat_key" varchar;
  ALTER TABLE "_lp_story_v" ADD COLUMN "show_overrides" boolean DEFAULT false;
  ALTER TABLE "_lab_pages_v" ADD COLUMN "version_intro_eyebrow" varchar;
  ALTER TABLE "_lab_pages_v" ADD COLUMN "version_intro_title" varchar;
  ALTER TABLE "_lab_pages_v" ADD COLUMN "version_intro_show_overrides" boolean DEFAULT false;
  ALTER TABLE "_lab_pages_v" ADD COLUMN "version_intro_body_override" jsonb;
  ALTER TABLE "_lab_pages_v" ADD COLUMN "version_closing_hidden" boolean DEFAULT false;
  ALTER TABLE "_lab_pages_v" ADD COLUMN "version_closing_show_overrides" boolean DEFAULT false;
  ALTER TABLE "_lab_pages_v" ADD COLUMN "version_closing_eyebrow_override" varchar;
  ALTER TABLE "_lab_pages_v" ADD COLUMN "version_closing_heading_override" varchar;
  ALTER TABLE "_lab_pages_v" ADD COLUMN "version_closing_ask_override_title" varchar;
  ALTER TABLE "_lab_pages_v" ADD COLUMN "version_closing_ask_override_body" varchar;
  ALTER TABLE "_lab_pages_v" ADD COLUMN "version_closing_media_override_id" integer;
  ALTER TABLE "lab_projects" ADD COLUMN "challenge_body" jsonb;
  ALTER TABLE "lab_projects" ADD COLUMN "strategy_body" jsonb;
  ALTER TABLE "_lab_projects_v" ADD COLUMN "version_challenge_body" jsonb;
  ALTER TABLE "_lab_projects_v" ADD COLUMN "version_strategy_body" jsonb;
  ALTER TABLE "lab_pages_blocks_feature_statement_grid_cards" ADD CONSTRAINT "lab_pages_blocks_feature_statement_grid_cards_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "lab_pages_blocks_feature_statement_grid_cards" ADD CONSTRAINT "lab_pages_blocks_feature_statement_grid_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lab_pages_blocks_feature_statement_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lab_pages_blocks_feature_statement_grid" ADD CONSTRAINT "lab_pages_blocks_feature_statement_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lab_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lab_pages_closing_cl" ADD CONSTRAINT "lab_pages_closing_cl_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lab_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_lab_pages_v_blocks_feature_statement_grid_cards" ADD CONSTRAINT "_lab_pages_v_blocks_feature_statement_grid_cards_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_lab_pages_v_blocks_feature_statement_grid_cards" ADD CONSTRAINT "_lab_pages_v_blocks_feature_statement_grid_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_lab_pages_v_blocks_feature_statement_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_lab_pages_v_blocks_feature_statement_grid" ADD CONSTRAINT "_lab_pages_v_blocks_feature_statement_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_lab_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__lab_pages_v_version_closing_cl_v" ADD CONSTRAINT "__lab_pages_v_version_closing_cl_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_lab_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lab_projects_context_story_beats" ADD CONSTRAINT "lab_projects_context_story_beats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lab_projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lab_projects_challenge_story_beats" ADD CONSTRAINT "lab_projects_challenge_story_beats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lab_projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lab_projects_strategy_story_beats" ADD CONSTRAINT "lab_projects_strategy_story_beats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lab_projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lab_projects_approach_story_beats" ADD CONSTRAINT "lab_projects_approach_story_beats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lab_projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lab_projects_outcome_summary_story_beats" ADD CONSTRAINT "lab_projects_outcome_summary_story_beats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lab_projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lab_projects_learnings_story_beats" ADD CONSTRAINT "lab_projects_learnings_story_beats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lab_projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_lab_projects_v_version_context_story_beats" ADD CONSTRAINT "_lab_projects_v_version_context_story_beats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_lab_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_lab_projects_v_version_challenge_story_beats" ADD CONSTRAINT "_lab_projects_v_version_challenge_story_beats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_lab_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_lab_projects_v_version_strategy_story_beats" ADD CONSTRAINT "_lab_projects_v_version_strategy_story_beats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_lab_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_lab_projects_v_version_approach_story_beats" ADD CONSTRAINT "_lab_projects_v_version_approach_story_beats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_lab_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_lab_projects_v_version_outcome_summary_story_beats" ADD CONSTRAINT "_lab_projects_v_version_outcome_summary_story_beats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_lab_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_lab_projects_v_version_learnings_story_beats" ADD CONSTRAINT "_lab_projects_v_version_learnings_story_beats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_lab_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "lab_pages_blocks_feature_statement_grid_cards_order_idx" ON "lab_pages_blocks_feature_statement_grid_cards" USING btree ("_order");
  CREATE INDEX "lab_pages_blocks_feature_statement_grid_cards_parent_id_idx" ON "lab_pages_blocks_feature_statement_grid_cards" USING btree ("_parent_id");
  CREATE INDEX "lab_pages_blocks_feature_statement_grid_cards_media_idx" ON "lab_pages_blocks_feature_statement_grid_cards" USING btree ("media_id");
  CREATE INDEX "lab_pages_blocks_feature_statement_grid_order_idx" ON "lab_pages_blocks_feature_statement_grid" USING btree ("_order");
  CREATE INDEX "lab_pages_blocks_feature_statement_grid_parent_id_idx" ON "lab_pages_blocks_feature_statement_grid" USING btree ("_parent_id");
  CREATE INDEX "lab_pages_blocks_feature_statement_grid_path_idx" ON "lab_pages_blocks_feature_statement_grid" USING btree ("_path");
  CREATE INDEX "lab_pages_closing_cl_order_idx" ON "lab_pages_closing_cl" USING btree ("_order");
  CREATE INDEX "lab_pages_closing_cl_parent_id_idx" ON "lab_pages_closing_cl" USING btree ("_parent_id");
  CREATE INDEX "_lab_pages_v_blocks_feature_statement_grid_cards_order_idx" ON "_lab_pages_v_blocks_feature_statement_grid_cards" USING btree ("_order");
  CREATE INDEX "_lab_pages_v_blocks_feature_statement_grid_cards_parent_id_idx" ON "_lab_pages_v_blocks_feature_statement_grid_cards" USING btree ("_parent_id");
  CREATE INDEX "_lab_pages_v_blocks_feature_statement_grid_cards_media_idx" ON "_lab_pages_v_blocks_feature_statement_grid_cards" USING btree ("media_id");
  CREATE INDEX "_lab_pages_v_blocks_feature_statement_grid_order_idx" ON "_lab_pages_v_blocks_feature_statement_grid" USING btree ("_order");
  CREATE INDEX "_lab_pages_v_blocks_feature_statement_grid_parent_id_idx" ON "_lab_pages_v_blocks_feature_statement_grid" USING btree ("_parent_id");
  CREATE INDEX "_lab_pages_v_blocks_feature_statement_grid_path_idx" ON "_lab_pages_v_blocks_feature_statement_grid" USING btree ("_path");
  CREATE INDEX "__lab_pages_v_version_closing_cl_v_order_idx" ON "__lab_pages_v_version_closing_cl_v" USING btree ("_order");
  CREATE INDEX "__lab_pages_v_version_closing_cl_v_parent_id_idx" ON "__lab_pages_v_version_closing_cl_v" USING btree ("_parent_id");
  CREATE INDEX "lab_projects_context_story_beats_order_idx" ON "lab_projects_context_story_beats" USING btree ("_order");
  CREATE INDEX "lab_projects_context_story_beats_parent_id_idx" ON "lab_projects_context_story_beats" USING btree ("_parent_id");
  CREATE INDEX "lab_projects_challenge_story_beats_order_idx" ON "lab_projects_challenge_story_beats" USING btree ("_order");
  CREATE INDEX "lab_projects_challenge_story_beats_parent_id_idx" ON "lab_projects_challenge_story_beats" USING btree ("_parent_id");
  CREATE INDEX "lab_projects_strategy_story_beats_order_idx" ON "lab_projects_strategy_story_beats" USING btree ("_order");
  CREATE INDEX "lab_projects_strategy_story_beats_parent_id_idx" ON "lab_projects_strategy_story_beats" USING btree ("_parent_id");
  CREATE INDEX "lab_projects_approach_story_beats_order_idx" ON "lab_projects_approach_story_beats" USING btree ("_order");
  CREATE INDEX "lab_projects_approach_story_beats_parent_id_idx" ON "lab_projects_approach_story_beats" USING btree ("_parent_id");
  CREATE INDEX "lab_projects_outcome_summary_story_beats_order_idx" ON "lab_projects_outcome_summary_story_beats" USING btree ("_order");
  CREATE INDEX "lab_projects_outcome_summary_story_beats_parent_id_idx" ON "lab_projects_outcome_summary_story_beats" USING btree ("_parent_id");
  CREATE INDEX "lab_projects_learnings_story_beats_order_idx" ON "lab_projects_learnings_story_beats" USING btree ("_order");
  CREATE INDEX "lab_projects_learnings_story_beats_parent_id_idx" ON "lab_projects_learnings_story_beats" USING btree ("_parent_id");
  CREATE INDEX "_lab_projects_v_version_context_story_beats_order_idx" ON "_lab_projects_v_version_context_story_beats" USING btree ("_order");
  CREATE INDEX "_lab_projects_v_version_context_story_beats_parent_id_idx" ON "_lab_projects_v_version_context_story_beats" USING btree ("_parent_id");
  CREATE INDEX "_lab_projects_v_version_challenge_story_beats_order_idx" ON "_lab_projects_v_version_challenge_story_beats" USING btree ("_order");
  CREATE INDEX "_lab_projects_v_version_challenge_story_beats_parent_id_idx" ON "_lab_projects_v_version_challenge_story_beats" USING btree ("_parent_id");
  CREATE INDEX "_lab_projects_v_version_strategy_story_beats_order_idx" ON "_lab_projects_v_version_strategy_story_beats" USING btree ("_order");
  CREATE INDEX "_lab_projects_v_version_strategy_story_beats_parent_id_idx" ON "_lab_projects_v_version_strategy_story_beats" USING btree ("_parent_id");
  CREATE INDEX "_lab_projects_v_version_approach_story_beats_order_idx" ON "_lab_projects_v_version_approach_story_beats" USING btree ("_order");
  CREATE INDEX "_lab_projects_v_version_approach_story_beats_parent_id_idx" ON "_lab_projects_v_version_approach_story_beats" USING btree ("_parent_id");
  CREATE INDEX "_lab_projects_v_version_outcome_summary_story_beats_order_idx" ON "_lab_projects_v_version_outcome_summary_story_beats" USING btree ("_order");
  CREATE INDEX "_lab_projects_v_version_outcome_summary_story_beats_parent_id_idx" ON "_lab_projects_v_version_outcome_summary_story_beats" USING btree ("_parent_id");
  CREATE INDEX "_lab_projects_v_version_learnings_story_beats_order_idx" ON "_lab_projects_v_version_learnings_story_beats" USING btree ("_order");
  CREATE INDEX "_lab_projects_v_version_learnings_story_beats_parent_id_idx" ON "_lab_projects_v_version_learnings_story_beats" USING btree ("_parent_id");
  ALTER TABLE "lab_pages" ADD CONSTRAINT "lab_pages_closing_media_override_id_media_id_fk" FOREIGN KEY ("closing_media_override_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_lab_pages_v" ADD CONSTRAINT "_lab_pages_v_version_closing_media_override_id_media_id_fk" FOREIGN KEY ("version_closing_media_override_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "lab_pages_closing_closing_media_override_idx" ON "lab_pages" USING btree ("closing_media_override_id");
  CREATE INDEX "_lab_pages_v_version_closing_version_closing_media_overr_idx" ON "_lab_pages_v" USING btree ("version_closing_media_override_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "lab_pages_blocks_feature_statement_grid_cards" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "lab_pages_blocks_feature_statement_grid" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "lab_pages_closing_cl" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_lab_pages_v_blocks_feature_statement_grid_cards" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_lab_pages_v_blocks_feature_statement_grid" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__lab_pages_v_version_closing_cl_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "lab_projects_context_story_beats" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "lab_projects_challenge_story_beats" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "lab_projects_strategy_story_beats" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "lab_projects_approach_story_beats" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "lab_projects_outcome_summary_story_beats" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "lab_projects_learnings_story_beats" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_lab_projects_v_version_context_story_beats" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_lab_projects_v_version_challenge_story_beats" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_lab_projects_v_version_strategy_story_beats" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_lab_projects_v_version_approach_story_beats" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_lab_projects_v_version_outcome_summary_story_beats" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_lab_projects_v_version_learnings_story_beats" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "lab_pages_blocks_feature_statement_grid_cards" CASCADE;
  DROP TABLE "lab_pages_blocks_feature_statement_grid" CASCADE;
  DROP TABLE "lab_pages_closing_cl" CASCADE;
  DROP TABLE "_lab_pages_v_blocks_feature_statement_grid_cards" CASCADE;
  DROP TABLE "_lab_pages_v_blocks_feature_statement_grid" CASCADE;
  DROP TABLE "__lab_pages_v_version_closing_cl_v" CASCADE;
  DROP TABLE "lab_projects_context_story_beats" CASCADE;
  DROP TABLE "lab_projects_challenge_story_beats" CASCADE;
  DROP TABLE "lab_projects_strategy_story_beats" CASCADE;
  DROP TABLE "lab_projects_approach_story_beats" CASCADE;
  DROP TABLE "lab_projects_outcome_summary_story_beats" CASCADE;
  DROP TABLE "lab_projects_learnings_story_beats" CASCADE;
  DROP TABLE "_lab_projects_v_version_context_story_beats" CASCADE;
  DROP TABLE "_lab_projects_v_version_challenge_story_beats" CASCADE;
  DROP TABLE "_lab_projects_v_version_strategy_story_beats" CASCADE;
  DROP TABLE "_lab_projects_v_version_approach_story_beats" CASCADE;
  DROP TABLE "_lab_projects_v_version_outcome_summary_story_beats" CASCADE;
  DROP TABLE "_lab_projects_v_version_learnings_story_beats" CASCADE;
  ALTER TABLE "lab_projects" RENAME COLUMN "context_body" TO "context";
  ALTER TABLE "lab_projects" RENAME COLUMN "approach_body" TO "approach";
  ALTER TABLE "lab_projects" RENAME COLUMN "outcome_summary_body" TO "outcome";
  ALTER TABLE "lab_projects" RENAME COLUMN "learnings_body" TO "learnings";
  ALTER TABLE "_lab_projects_v" RENAME COLUMN "version_context_body" TO "version_context";
  ALTER TABLE "_lab_projects_v" RENAME COLUMN "version_approach_body" TO "version_approach";
  ALTER TABLE "_lab_projects_v" RENAME COLUMN "version_outcome_summary_body" TO "version_outcome";
  ALTER TABLE "_lab_projects_v" RENAME COLUMN "version_learnings_body" TO "version_learnings";
  ALTER TABLE "lab_pages" DROP CONSTRAINT "lab_pages_closing_media_override_id_media_id_fk";
  
  ALTER TABLE "_lab_pages_v" DROP CONSTRAINT "_lab_pages_v_version_closing_media_override_id_media_id_fk";
  
  ALTER TABLE "lp_story" ALTER COLUMN "source" SET DATA TYPE text;
  ALTER TABLE "lp_story" ALTER COLUMN "source" SET DEFAULT 'context'::text;
  UPDATE "lp_story" SET "source" = 'outcome' WHERE "source" = 'outcome-summary';
  UPDATE "lp_story" SET "source" = NULL WHERE "source" NOT IN ('context', 'approach', 'outcome', 'learnings', 'custom');
  DROP TYPE "public"."enum_lp_story_source";
  CREATE TYPE "public"."enum_lp_story_source" AS ENUM('context', 'approach', 'outcome', 'learnings', 'custom');
  ALTER TABLE "lp_story" ALTER COLUMN "source" SET DEFAULT 'context'::"public"."enum_lp_story_source";
  ALTER TABLE "lp_story" ALTER COLUMN "source" SET DATA TYPE "public"."enum_lp_story_source" USING "source"::"public"."enum_lp_story_source";
  ALTER TABLE "_lp_story_v" ALTER COLUMN "source" SET DATA TYPE text;
  ALTER TABLE "_lp_story_v" ALTER COLUMN "source" SET DEFAULT 'context'::text;
  UPDATE "_lp_story_v" SET "source" = 'outcome' WHERE "source" = 'outcome-summary';
  UPDATE "_lp_story_v" SET "source" = NULL WHERE "source" NOT IN ('context', 'approach', 'outcome', 'learnings', 'custom');
  DROP TYPE "public"."enum__lp_story_v_source";
  CREATE TYPE "public"."enum__lp_story_v_source" AS ENUM('context', 'approach', 'outcome', 'learnings', 'custom');
  ALTER TABLE "_lp_story_v" ALTER COLUMN "source" SET DEFAULT 'context'::"public"."enum__lp_story_v_source";
  ALTER TABLE "_lp_story_v" ALTER COLUMN "source" SET DATA TYPE "public"."enum__lp_story_v_source" USING "source"::"public"."enum__lp_story_v_source";
  DROP INDEX "lab_pages_closing_closing_media_override_idx";
  DROP INDEX "_lab_pages_v_version_closing_version_closing_media_overr_idx";
  ALTER TABLE "lab_pages_transition" DROP COLUMN "source";
  ALTER TABLE "lab_pages_transition" DROP COLUMN "story_scope";
  ALTER TABLE "lab_pages_transition" DROP COLUMN "story_beat_key";
  ALTER TABLE "lab_pages_transition" DROP COLUMN "show_overrides";
  ALTER TABLE "lab_pages_blocks_feature_heading_offset" DROP COLUMN "story_scope";
  ALTER TABLE "lab_pages_blocks_feature_heading_offset" DROP COLUMN "story_beat_key";
  ALTER TABLE "lab_pages_blocks_feature_heading_offset" DROP COLUMN "show_overrides";
  ALTER TABLE "lab_pages_full_media" DROP COLUMN "story_scope";
  ALTER TABLE "lab_pages_full_media" DROP COLUMN "story_beat_key";
  ALTER TABLE "lab_pages_full_media" DROP COLUMN "show_overrides";
  ALTER TABLE "lab_pages_media_split" DROP COLUMN "story_scope";
  ALTER TABLE "lab_pages_media_split" DROP COLUMN "story_beat_key";
  ALTER TABLE "lab_pages_media_split" DROP COLUMN "show_overrides";
  ALTER TABLE "lab_pages_split_narrow" DROP COLUMN "story_scope";
  ALTER TABLE "lab_pages_split_narrow" DROP COLUMN "story_beat_key";
  ALTER TABLE "lab_pages_split_narrow" DROP COLUMN "show_overrides";
  ALTER TABLE "lab_pages_image_pair" DROP COLUMN "story_scope";
  ALTER TABLE "lab_pages_image_pair" DROP COLUMN "story_beat_key";
  ALTER TABLE "lab_pages_image_pair" DROP COLUMN "show_overrides";
  ALTER TABLE "lab_pages_split_offset" DROP COLUMN "story_scope";
  ALTER TABLE "lab_pages_split_offset" DROP COLUMN "story_beat_key";
  ALTER TABLE "lab_pages_split_offset" DROP COLUMN "show_overrides";
  ALTER TABLE "lab_pages_image_statement" DROP COLUMN "story_scope";
  ALTER TABLE "lab_pages_image_statement" DROP COLUMN "story_beat_key";
  ALTER TABLE "lab_pages_image_statement" DROP COLUMN "show_overrides";
  ALTER TABLE "lab_pages_blocks_feature_tabs_tabs" DROP COLUMN "story_scope";
  ALTER TABLE "lab_pages_blocks_feature_tabs_tabs" DROP COLUMN "story_beat_key";
  ALTER TABLE "lab_pages_blocks_feature_tabs_tabs" DROP COLUMN "show_overrides";
  ALTER TABLE "lp_story" DROP COLUMN "story_scope";
  ALTER TABLE "lp_story" DROP COLUMN "story_beat_key";
  ALTER TABLE "lp_story" DROP COLUMN "show_overrides";
  ALTER TABLE "lab_pages" DROP COLUMN "intro_eyebrow";
  ALTER TABLE "lab_pages" DROP COLUMN "intro_title";
  ALTER TABLE "lab_pages" DROP COLUMN "intro_show_overrides";
  ALTER TABLE "lab_pages" DROP COLUMN "intro_body_override";
  ALTER TABLE "lab_pages" DROP COLUMN "closing_hidden";
  ALTER TABLE "lab_pages" DROP COLUMN "closing_show_overrides";
  ALTER TABLE "lab_pages" DROP COLUMN "closing_eyebrow_override";
  ALTER TABLE "lab_pages" DROP COLUMN "closing_heading_override";
  ALTER TABLE "lab_pages" DROP COLUMN "closing_ask_override_title";
  ALTER TABLE "lab_pages" DROP COLUMN "closing_ask_override_body";
  ALTER TABLE "lab_pages" DROP COLUMN "closing_media_override_id";
  ALTER TABLE "__lab_pages_v_transition_v" DROP COLUMN "source";
  ALTER TABLE "__lab_pages_v_transition_v" DROP COLUMN "story_scope";
  ALTER TABLE "__lab_pages_v_transition_v" DROP COLUMN "story_beat_key";
  ALTER TABLE "__lab_pages_v_transition_v" DROP COLUMN "show_overrides";
  ALTER TABLE "_lab_pages_v_blocks_feature_heading_offset" DROP COLUMN "story_scope";
  ALTER TABLE "_lab_pages_v_blocks_feature_heading_offset" DROP COLUMN "story_beat_key";
  ALTER TABLE "_lab_pages_v_blocks_feature_heading_offset" DROP COLUMN "show_overrides";
  ALTER TABLE "__lab_pages_v_full_media_v" DROP COLUMN "story_scope";
  ALTER TABLE "__lab_pages_v_full_media_v" DROP COLUMN "story_beat_key";
  ALTER TABLE "__lab_pages_v_full_media_v" DROP COLUMN "show_overrides";
  ALTER TABLE "__lab_pages_v_media_split_v" DROP COLUMN "story_scope";
  ALTER TABLE "__lab_pages_v_media_split_v" DROP COLUMN "story_beat_key";
  ALTER TABLE "__lab_pages_v_media_split_v" DROP COLUMN "show_overrides";
  ALTER TABLE "__lab_pages_v_split_narrow_v" DROP COLUMN "story_scope";
  ALTER TABLE "__lab_pages_v_split_narrow_v" DROP COLUMN "story_beat_key";
  ALTER TABLE "__lab_pages_v_split_narrow_v" DROP COLUMN "show_overrides";
  ALTER TABLE "__lab_pages_v_image_pair_v" DROP COLUMN "story_scope";
  ALTER TABLE "__lab_pages_v_image_pair_v" DROP COLUMN "story_beat_key";
  ALTER TABLE "__lab_pages_v_image_pair_v" DROP COLUMN "show_overrides";
  ALTER TABLE "__lab_pages_v_split_offset_v" DROP COLUMN "story_scope";
  ALTER TABLE "__lab_pages_v_split_offset_v" DROP COLUMN "story_beat_key";
  ALTER TABLE "__lab_pages_v_split_offset_v" DROP COLUMN "show_overrides";
  ALTER TABLE "__lab_pages_v_image_statement_v" DROP COLUMN "story_scope";
  ALTER TABLE "__lab_pages_v_image_statement_v" DROP COLUMN "story_beat_key";
  ALTER TABLE "__lab_pages_v_image_statement_v" DROP COLUMN "show_overrides";
  ALTER TABLE "_lab_pages_v_blocks_feature_tabs_tabs" DROP COLUMN "story_scope";
  ALTER TABLE "_lab_pages_v_blocks_feature_tabs_tabs" DROP COLUMN "story_beat_key";
  ALTER TABLE "_lab_pages_v_blocks_feature_tabs_tabs" DROP COLUMN "show_overrides";
  ALTER TABLE "_lp_story_v" DROP COLUMN "story_scope";
  ALTER TABLE "_lp_story_v" DROP COLUMN "story_beat_key";
  ALTER TABLE "_lp_story_v" DROP COLUMN "show_overrides";
  ALTER TABLE "_lab_pages_v" DROP COLUMN "version_intro_eyebrow";
  ALTER TABLE "_lab_pages_v" DROP COLUMN "version_intro_title";
  ALTER TABLE "_lab_pages_v" DROP COLUMN "version_intro_show_overrides";
  ALTER TABLE "_lab_pages_v" DROP COLUMN "version_intro_body_override";
  ALTER TABLE "_lab_pages_v" DROP COLUMN "version_closing_hidden";
  ALTER TABLE "_lab_pages_v" DROP COLUMN "version_closing_show_overrides";
  ALTER TABLE "_lab_pages_v" DROP COLUMN "version_closing_eyebrow_override";
  ALTER TABLE "_lab_pages_v" DROP COLUMN "version_closing_heading_override";
  ALTER TABLE "_lab_pages_v" DROP COLUMN "version_closing_ask_override_title";
  ALTER TABLE "_lab_pages_v" DROP COLUMN "version_closing_ask_override_body";
  ALTER TABLE "_lab_pages_v" DROP COLUMN "version_closing_media_override_id";
  ALTER TABLE "lab_projects" DROP COLUMN "challenge_body";
  ALTER TABLE "lab_projects" DROP COLUMN "strategy_body";
  ALTER TABLE "_lab_projects_v" DROP COLUMN "version_challenge_body";
  ALTER TABLE "_lab_projects_v" DROP COLUMN "version_strategy_body";
  DROP TYPE "public"."enum_lab_pages_transition_source";
  DROP TYPE "public"."enum_lab_pages_transition_story_scope";
  DROP TYPE "public"."enum_lab_pages_blocks_feature_heading_offset_story_scope";
  DROP TYPE "public"."enum_lab_pages_full_media_story_scope";
  DROP TYPE "public"."enum_lab_pages_media_split_story_scope";
  DROP TYPE "public"."enum_lab_pages_split_narrow_story_scope";
  DROP TYPE "public"."enum_lab_pages_image_pair_story_scope";
  DROP TYPE "public"."enum_lab_pages_split_offset_story_scope";
  DROP TYPE "public"."enum_lab_pages_image_statement_story_scope";
  DROP TYPE "public"."enum_lab_pages_blocks_feature_tabs_tabs_story_scope";
  DROP TYPE "public"."enum_lp_story_story_scope";
  DROP TYPE "public"."enum_lab_pages_blocks_feature_statement_grid_source";
  DROP TYPE "public"."enum_lab_pages_blocks_feature_statement_grid_story_scope";
  DROP TYPE "public"."enum_lab_pages_blocks_feature_statement_grid_theme";
  DROP TYPE "public"."enum_lab_pages_closing_cl_link_type";
  DROP TYPE "public"."enum_lab_pages_closing_cl_link_site_page";
  DROP TYPE "public"."enum_lab_pages_closing_cl_link_appearance";
  DROP TYPE "public"."enum___lab_pages_v_transition_v_source";
  DROP TYPE "public"."enum___lab_pages_v_transition_v_story_scope";
  DROP TYPE "public"."enum__lab_pages_v_blocks_feature_heading_offset_story_scope";
  DROP TYPE "public"."enum___lab_pages_v_full_media_v_story_scope";
  DROP TYPE "public"."enum___lab_pages_v_media_split_v_story_scope";
  DROP TYPE "public"."enum___lab_pages_v_split_narrow_v_story_scope";
  DROP TYPE "public"."enum___lab_pages_v_image_pair_v_story_scope";
  DROP TYPE "public"."enum___lab_pages_v_split_offset_v_story_scope";
  DROP TYPE "public"."enum___lab_pages_v_image_statement_v_story_scope";
  DROP TYPE "public"."enum__lab_pages_v_blocks_feature_tabs_tabs_story_scope";
  DROP TYPE "public"."enum__lp_story_v_story_scope";
  DROP TYPE "public"."enum__lab_pages_v_blocks_feature_statement_grid_source";
  DROP TYPE "public"."enum__lab_pages_v_blocks_feature_statement_grid_story_scope";
  DROP TYPE "public"."enum__lab_pages_v_blocks_feature_statement_grid_theme";
  DROP TYPE "public"."enum___lab_pages_v_version_closing_cl_v_link_type";
  DROP TYPE "public"."enum___lab_pages_v_version_closing_cl_v_link_site_page";
  DROP TYPE "public"."enum___lab_pages_v_version_closing_cl_v_link_appearance";`)
}
