import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_home_blocks_cta_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_home_blocks_cta_links_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum_home_blocks_content_columns_size" AS ENUM('oneThird', 'half', 'twoThirds', 'full');
  CREATE TYPE "public"."enum_home_blocks_content_columns_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_home_blocks_content_columns_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum_home_blocks_media_block_size" AS ENUM('full', 'inset', 'small');
  CREATE TYPE "public"."enum_home_blocks_archive_populate_by" AS ENUM('collection', 'selection');
  CREATE TYPE "public"."enum_home_blocks_archive_relation_to" AS ENUM('posts');
  CREATE TYPE "public"."enum_home_blocks_archive_card_variant" AS ENUM('contained', 'open', 'overlay');
  CREATE TYPE "public"."enum_home_blocks_feature_statement_grid_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum_home_blocks_feature_heading_offset_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum_home_blocks_feature_tabs_tabs_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum_home_image_statement_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum_home_image_statement_text_position" AS ENUM('right', 'left');
  CREATE TYPE "public"."enum_home_image_statement_text_size" AS ENUM('default', 'small');
  CREATE TYPE "public"."enum_home_image_statement_image_width" AS ENUM('contained', 'full');
  CREATE TYPE "public"."enum_home_split_narrow_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum_home_split_narrow_image_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum_home_split_narrow_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_home_hero_type" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum_home_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__home_v_blocks_cta_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__home_v_blocks_cta_links_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum__home_v_blocks_content_columns_size" AS ENUM('oneThird', 'half', 'twoThirds', 'full');
  CREATE TYPE "public"."enum__home_v_blocks_content_columns_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__home_v_blocks_content_columns_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum__home_v_blocks_media_block_size" AS ENUM('full', 'inset', 'small');
  CREATE TYPE "public"."enum__home_v_blocks_archive_populate_by" AS ENUM('collection', 'selection');
  CREATE TYPE "public"."enum__home_v_blocks_archive_relation_to" AS ENUM('posts');
  CREATE TYPE "public"."enum__home_v_blocks_archive_card_variant" AS ENUM('contained', 'open', 'overlay');
  CREATE TYPE "public"."enum__home_v_blocks_feature_statement_grid_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum__home_v_blocks_feature_heading_offset_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum__home_v_blocks_feature_tabs_tabs_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum___home_v_image_statement_v_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum___home_v_image_statement_v_text_position" AS ENUM('right', 'left');
  CREATE TYPE "public"."enum___home_v_image_statement_v_text_size" AS ENUM('default', 'small');
  CREATE TYPE "public"."enum___home_v_image_statement_v_image_width" AS ENUM('contained', 'full');
  CREATE TYPE "public"."enum___home_v_split_narrow_v_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum___home_v_split_narrow_v_image_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum___home_v_split_narrow_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum__home_v_version_hero_type" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum__home_v_version_status" AS ENUM('draft', 'published');
  CREATE TABLE "home_blocks_cta_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_home_blocks_cta_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum_home_blocks_cta_links_link_appearance" DEFAULT 'default'
  );
  
  CREATE TABLE "home_blocks_cta" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"rich_text" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "home_blocks_content_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"size" "enum_home_blocks_content_columns_size" DEFAULT 'oneThird',
  	"rich_text" jsonb,
  	"enable_link" boolean,
  	"link_type" "enum_home_blocks_content_columns_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum_home_blocks_content_columns_link_appearance" DEFAULT 'default'
  );
  
  CREATE TABLE "home_blocks_content" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "home_blocks_media_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"size" "enum_home_blocks_media_block_size" DEFAULT 'full',
  	"caption_override" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "home_blocks_archive" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"intro_content" jsonb,
  	"populate_by" "enum_home_blocks_archive_populate_by" DEFAULT 'collection',
  	"relation_to" "enum_home_blocks_archive_relation_to" DEFAULT 'posts',
  	"limit" numeric DEFAULT 10,
  	"card_variant" "enum_home_blocks_archive_card_variant" DEFAULT 'contained',
  	"block_name" varchar
  );
  
  CREATE TABLE "home_blocks_form_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"form_id" integer,
  	"enable_intro" boolean,
  	"intro_content" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "home_blocks_newsletter_signup" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar DEFAULT 'Newsletter',
  	"heading" varchar DEFAULT 'Notes on clarity, trust, and momentum',
  	"body" varchar DEFAULT 'Occasional letters from the studio on making complex organizations make sense. No noise — unsubscribe anytime.',
  	"button_label" varchar DEFAULT 'Subscribe',
  	"audience_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE "home_blocks_feature_statement_grid_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"title" varchar,
  	"description" varchar
  );
  
  CREATE TABLE "home_blocks_feature_statement_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"source" "enum_home_blocks_feature_statement_grid_source" DEFAULT 'custom',
  	"statement" jsonb,
  	"footnote" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "home_blocks_feature_heading_offset" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"source" "enum_home_blocks_feature_heading_offset_source" DEFAULT 'custom',
  	"body" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "home_blocks_feature_tabs_tabs_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "home_blocks_feature_tabs_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"heading" varchar,
  	"source" "enum_home_blocks_feature_tabs_tabs_source" DEFAULT 'custom',
  	"description" jsonb,
  	"subheading" varchar DEFAULT 'Included',
  	"media_id" integer,
  	"caption" varchar
  );
  
  CREATE TABLE "home_blocks_feature_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "home_image_statement" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"source" "enum_home_image_statement_source" DEFAULT 'custom',
  	"caption" jsonb,
  	"text_position" "enum_home_image_statement_text_position" DEFAULT 'right',
  	"text_size" "enum_home_image_statement_text_size" DEFAULT 'default',
  	"image_width" "enum_home_image_statement_image_width" DEFAULT 'contained',
  	"block_name" varchar
  );
  
  CREATE TABLE "home_split_narrow" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"source" "enum_home_split_narrow_source" DEFAULT 'custom',
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" jsonb,
  	"media_id" integer,
  	"browse_all_media" boolean DEFAULT false,
  	"image_position" "enum_home_split_narrow_image_position" DEFAULT 'right',
  	"theme" "enum_home_split_narrow_theme" DEFAULT 'light',
  	"block_name" varchar
  );
  
  CREATE TABLE "home" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar DEFAULT 'Home',
  	"hero_type" "enum_home_hero_type" DEFAULT 'left',
  	"hero_title" varchar,
  	"hero_description" varchar,
  	"hero_media_id" integer,
  	"hero_featured_post_id" integer,
  	"hero_featured_label" varchar DEFAULT 'Insights',
  	"meta_title" varchar,
  	"meta_image_id" integer,
  	"meta_description" varchar,
  	"published_at" timestamp(3) with time zone,
  	"_status" "enum_home_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "home_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"posts_id" integer,
  	"categories_id" integer
  );
  
  CREATE TABLE "_home_v_blocks_cta_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_type" "enum__home_v_blocks_cta_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum__home_v_blocks_cta_links_link_appearance" DEFAULT 'default',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_home_v_blocks_cta" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"rich_text" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_home_v_blocks_content_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"size" "enum__home_v_blocks_content_columns_size" DEFAULT 'oneThird',
  	"rich_text" jsonb,
  	"enable_link" boolean,
  	"link_type" "enum__home_v_blocks_content_columns_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum__home_v_blocks_content_columns_link_appearance" DEFAULT 'default',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_home_v_blocks_content" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_home_v_blocks_media_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"size" "enum__home_v_blocks_media_block_size" DEFAULT 'full',
  	"caption_override" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_home_v_blocks_archive" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"intro_content" jsonb,
  	"populate_by" "enum__home_v_blocks_archive_populate_by" DEFAULT 'collection',
  	"relation_to" "enum__home_v_blocks_archive_relation_to" DEFAULT 'posts',
  	"limit" numeric DEFAULT 10,
  	"card_variant" "enum__home_v_blocks_archive_card_variant" DEFAULT 'contained',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_home_v_blocks_form_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"form_id" integer,
  	"enable_intro" boolean,
  	"intro_content" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_home_v_blocks_newsletter_signup" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar DEFAULT 'Newsletter',
  	"heading" varchar DEFAULT 'Notes on clarity, trust, and momentum',
  	"body" varchar DEFAULT 'Occasional letters from the studio on making complex organizations make sense. No noise — unsubscribe anytime.',
  	"button_label" varchar DEFAULT 'Subscribe',
  	"audience_id" integer,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_home_v_blocks_feature_statement_grid_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"title" varchar,
  	"description" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_home_v_blocks_feature_statement_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"source" "enum__home_v_blocks_feature_statement_grid_source" DEFAULT 'custom',
  	"statement" jsonb,
  	"footnote" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_home_v_blocks_feature_heading_offset" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"source" "enum__home_v_blocks_feature_heading_offset_source" DEFAULT 'custom',
  	"body" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_home_v_blocks_feature_tabs_tabs_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_home_v_blocks_feature_tabs_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"heading" varchar,
  	"source" "enum__home_v_blocks_feature_tabs_tabs_source" DEFAULT 'custom',
  	"description" jsonb,
  	"subheading" varchar DEFAULT 'Included',
  	"media_id" integer,
  	"caption" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_home_v_blocks_feature_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "__home_v_image_statement_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"source" "enum___home_v_image_statement_v_source" DEFAULT 'custom',
  	"caption" jsonb,
  	"text_position" "enum___home_v_image_statement_v_text_position" DEFAULT 'right',
  	"text_size" "enum___home_v_image_statement_v_text_size" DEFAULT 'default',
  	"image_width" "enum___home_v_image_statement_v_image_width" DEFAULT 'contained',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "__home_v_split_narrow_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"source" "enum___home_v_split_narrow_v_source" DEFAULT 'custom',
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" jsonb,
  	"media_id" integer,
  	"browse_all_media" boolean DEFAULT false,
  	"image_position" "enum___home_v_split_narrow_v_image_position" DEFAULT 'right',
  	"theme" "enum___home_v_split_narrow_v_theme" DEFAULT 'light',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_home_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_title" varchar DEFAULT 'Home',
  	"version_hero_type" "enum__home_v_version_hero_type" DEFAULT 'left',
  	"version_hero_title" varchar,
  	"version_hero_description" varchar,
  	"version_hero_media_id" integer,
  	"version_hero_featured_post_id" integer,
  	"version_hero_featured_label" varchar DEFAULT 'Insights',
  	"version_meta_title" varchar,
  	"version_meta_image_id" integer,
  	"version_meta_description" varchar,
  	"version_published_at" timestamp(3) with time zone,
  	"version__status" "enum__home_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_home_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"posts_id" integer,
  	"categories_id" integer
  );
  
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "home_find" boolean DEFAULT false;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "home_update" boolean DEFAULT false;
  ALTER TABLE "home_blocks_cta_links" ADD CONSTRAINT "home_blocks_cta_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_blocks_cta"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_blocks_cta" ADD CONSTRAINT "home_blocks_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_blocks_content_columns" ADD CONSTRAINT "home_blocks_content_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_blocks_content"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_blocks_content" ADD CONSTRAINT "home_blocks_content_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_blocks_media_block" ADD CONSTRAINT "home_blocks_media_block_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_blocks_media_block" ADD CONSTRAINT "home_blocks_media_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_blocks_archive" ADD CONSTRAINT "home_blocks_archive_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_blocks_form_block" ADD CONSTRAINT "home_blocks_form_block_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_blocks_form_block" ADD CONSTRAINT "home_blocks_form_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_blocks_newsletter_signup" ADD CONSTRAINT "home_blocks_newsletter_signup_audience_id_audiences_id_fk" FOREIGN KEY ("audience_id") REFERENCES "public"."audiences"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_blocks_newsletter_signup" ADD CONSTRAINT "home_blocks_newsletter_signup_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_blocks_feature_statement_grid_cards" ADD CONSTRAINT "home_blocks_feature_statement_grid_cards_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_blocks_feature_statement_grid_cards" ADD CONSTRAINT "home_blocks_feature_statement_grid_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_blocks_feature_statement_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_blocks_feature_statement_grid" ADD CONSTRAINT "home_blocks_feature_statement_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_blocks_feature_heading_offset" ADD CONSTRAINT "home_blocks_feature_heading_offset_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_blocks_feature_tabs_tabs_items" ADD CONSTRAINT "home_blocks_feature_tabs_tabs_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_blocks_feature_tabs_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_blocks_feature_tabs_tabs" ADD CONSTRAINT "home_blocks_feature_tabs_tabs_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_blocks_feature_tabs_tabs" ADD CONSTRAINT "home_blocks_feature_tabs_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_blocks_feature_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_blocks_feature_tabs" ADD CONSTRAINT "home_blocks_feature_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_image_statement" ADD CONSTRAINT "home_image_statement_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_image_statement" ADD CONSTRAINT "home_image_statement_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_split_narrow" ADD CONSTRAINT "home_split_narrow_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_split_narrow" ADD CONSTRAINT "home_split_narrow_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home" ADD CONSTRAINT "home_hero_media_id_media_id_fk" FOREIGN KEY ("hero_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home" ADD CONSTRAINT "home_hero_featured_post_id_posts_id_fk" FOREIGN KEY ("hero_featured_post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home" ADD CONSTRAINT "home_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_rels" ADD CONSTRAINT "home_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_rels" ADD CONSTRAINT "home_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_rels" ADD CONSTRAINT "home_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_rels" ADD CONSTRAINT "home_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_blocks_cta_links" ADD CONSTRAINT "_home_v_blocks_cta_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v_blocks_cta"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_blocks_cta" ADD CONSTRAINT "_home_v_blocks_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_blocks_content_columns" ADD CONSTRAINT "_home_v_blocks_content_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v_blocks_content"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_blocks_content" ADD CONSTRAINT "_home_v_blocks_content_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_blocks_media_block" ADD CONSTRAINT "_home_v_blocks_media_block_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_home_v_blocks_media_block" ADD CONSTRAINT "_home_v_blocks_media_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_blocks_archive" ADD CONSTRAINT "_home_v_blocks_archive_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_blocks_form_block" ADD CONSTRAINT "_home_v_blocks_form_block_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_home_v_blocks_form_block" ADD CONSTRAINT "_home_v_blocks_form_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_blocks_newsletter_signup" ADD CONSTRAINT "_home_v_blocks_newsletter_signup_audience_id_audiences_id_fk" FOREIGN KEY ("audience_id") REFERENCES "public"."audiences"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_home_v_blocks_newsletter_signup" ADD CONSTRAINT "_home_v_blocks_newsletter_signup_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_blocks_feature_statement_grid_cards" ADD CONSTRAINT "_home_v_blocks_feature_statement_grid_cards_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_home_v_blocks_feature_statement_grid_cards" ADD CONSTRAINT "_home_v_blocks_feature_statement_grid_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v_blocks_feature_statement_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_blocks_feature_statement_grid" ADD CONSTRAINT "_home_v_blocks_feature_statement_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_blocks_feature_heading_offset" ADD CONSTRAINT "_home_v_blocks_feature_heading_offset_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_blocks_feature_tabs_tabs_items" ADD CONSTRAINT "_home_v_blocks_feature_tabs_tabs_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v_blocks_feature_tabs_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_blocks_feature_tabs_tabs" ADD CONSTRAINT "_home_v_blocks_feature_tabs_tabs_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_home_v_blocks_feature_tabs_tabs" ADD CONSTRAINT "_home_v_blocks_feature_tabs_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v_blocks_feature_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_blocks_feature_tabs" ADD CONSTRAINT "_home_v_blocks_feature_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__home_v_image_statement_v" ADD CONSTRAINT "__home_v_image_statement_v_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__home_v_image_statement_v" ADD CONSTRAINT "__home_v_image_statement_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__home_v_split_narrow_v" ADD CONSTRAINT "__home_v_split_narrow_v_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__home_v_split_narrow_v" ADD CONSTRAINT "__home_v_split_narrow_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v" ADD CONSTRAINT "_home_v_version_hero_media_id_media_id_fk" FOREIGN KEY ("version_hero_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_home_v" ADD CONSTRAINT "_home_v_version_hero_featured_post_id_posts_id_fk" FOREIGN KEY ("version_hero_featured_post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_home_v" ADD CONSTRAINT "_home_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_home_v_rels" ADD CONSTRAINT "_home_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_rels" ADD CONSTRAINT "_home_v_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_rels" ADD CONSTRAINT "_home_v_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_rels" ADD CONSTRAINT "_home_v_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "home_blocks_cta_links_order_idx" ON "home_blocks_cta_links" USING btree ("_order");
  CREATE INDEX "home_blocks_cta_links_parent_id_idx" ON "home_blocks_cta_links" USING btree ("_parent_id");
  CREATE INDEX "home_blocks_cta_order_idx" ON "home_blocks_cta" USING btree ("_order");
  CREATE INDEX "home_blocks_cta_parent_id_idx" ON "home_blocks_cta" USING btree ("_parent_id");
  CREATE INDEX "home_blocks_cta_path_idx" ON "home_blocks_cta" USING btree ("_path");
  CREATE INDEX "home_blocks_content_columns_order_idx" ON "home_blocks_content_columns" USING btree ("_order");
  CREATE INDEX "home_blocks_content_columns_parent_id_idx" ON "home_blocks_content_columns" USING btree ("_parent_id");
  CREATE INDEX "home_blocks_content_order_idx" ON "home_blocks_content" USING btree ("_order");
  CREATE INDEX "home_blocks_content_parent_id_idx" ON "home_blocks_content" USING btree ("_parent_id");
  CREATE INDEX "home_blocks_content_path_idx" ON "home_blocks_content" USING btree ("_path");
  CREATE INDEX "home_blocks_media_block_order_idx" ON "home_blocks_media_block" USING btree ("_order");
  CREATE INDEX "home_blocks_media_block_parent_id_idx" ON "home_blocks_media_block" USING btree ("_parent_id");
  CREATE INDEX "home_blocks_media_block_path_idx" ON "home_blocks_media_block" USING btree ("_path");
  CREATE INDEX "home_blocks_media_block_media_idx" ON "home_blocks_media_block" USING btree ("media_id");
  CREATE INDEX "home_blocks_archive_order_idx" ON "home_blocks_archive" USING btree ("_order");
  CREATE INDEX "home_blocks_archive_parent_id_idx" ON "home_blocks_archive" USING btree ("_parent_id");
  CREATE INDEX "home_blocks_archive_path_idx" ON "home_blocks_archive" USING btree ("_path");
  CREATE INDEX "home_blocks_form_block_order_idx" ON "home_blocks_form_block" USING btree ("_order");
  CREATE INDEX "home_blocks_form_block_parent_id_idx" ON "home_blocks_form_block" USING btree ("_parent_id");
  CREATE INDEX "home_blocks_form_block_path_idx" ON "home_blocks_form_block" USING btree ("_path");
  CREATE INDEX "home_blocks_form_block_form_idx" ON "home_blocks_form_block" USING btree ("form_id");
  CREATE INDEX "home_blocks_newsletter_signup_order_idx" ON "home_blocks_newsletter_signup" USING btree ("_order");
  CREATE INDEX "home_blocks_newsletter_signup_parent_id_idx" ON "home_blocks_newsletter_signup" USING btree ("_parent_id");
  CREATE INDEX "home_blocks_newsletter_signup_path_idx" ON "home_blocks_newsletter_signup" USING btree ("_path");
  CREATE INDEX "home_blocks_newsletter_signup_audience_idx" ON "home_blocks_newsletter_signup" USING btree ("audience_id");
  CREATE INDEX "home_blocks_feature_statement_grid_cards_order_idx" ON "home_blocks_feature_statement_grid_cards" USING btree ("_order");
  CREATE INDEX "home_blocks_feature_statement_grid_cards_parent_id_idx" ON "home_blocks_feature_statement_grid_cards" USING btree ("_parent_id");
  CREATE INDEX "home_blocks_feature_statement_grid_cards_media_idx" ON "home_blocks_feature_statement_grid_cards" USING btree ("media_id");
  CREATE INDEX "home_blocks_feature_statement_grid_order_idx" ON "home_blocks_feature_statement_grid" USING btree ("_order");
  CREATE INDEX "home_blocks_feature_statement_grid_parent_id_idx" ON "home_blocks_feature_statement_grid" USING btree ("_parent_id");
  CREATE INDEX "home_blocks_feature_statement_grid_path_idx" ON "home_blocks_feature_statement_grid" USING btree ("_path");
  CREATE INDEX "home_blocks_feature_heading_offset_order_idx" ON "home_blocks_feature_heading_offset" USING btree ("_order");
  CREATE INDEX "home_blocks_feature_heading_offset_parent_id_idx" ON "home_blocks_feature_heading_offset" USING btree ("_parent_id");
  CREATE INDEX "home_blocks_feature_heading_offset_path_idx" ON "home_blocks_feature_heading_offset" USING btree ("_path");
  CREATE INDEX "home_blocks_feature_tabs_tabs_items_order_idx" ON "home_blocks_feature_tabs_tabs_items" USING btree ("_order");
  CREATE INDEX "home_blocks_feature_tabs_tabs_items_parent_id_idx" ON "home_blocks_feature_tabs_tabs_items" USING btree ("_parent_id");
  CREATE INDEX "home_blocks_feature_tabs_tabs_order_idx" ON "home_blocks_feature_tabs_tabs" USING btree ("_order");
  CREATE INDEX "home_blocks_feature_tabs_tabs_parent_id_idx" ON "home_blocks_feature_tabs_tabs" USING btree ("_parent_id");
  CREATE INDEX "home_blocks_feature_tabs_tabs_media_idx" ON "home_blocks_feature_tabs_tabs" USING btree ("media_id");
  CREATE INDEX "home_blocks_feature_tabs_order_idx" ON "home_blocks_feature_tabs" USING btree ("_order");
  CREATE INDEX "home_blocks_feature_tabs_parent_id_idx" ON "home_blocks_feature_tabs" USING btree ("_parent_id");
  CREATE INDEX "home_blocks_feature_tabs_path_idx" ON "home_blocks_feature_tabs" USING btree ("_path");
  CREATE INDEX "home_image_statement_order_idx" ON "home_image_statement" USING btree ("_order");
  CREATE INDEX "home_image_statement_parent_id_idx" ON "home_image_statement" USING btree ("_parent_id");
  CREATE INDEX "home_image_statement_path_idx" ON "home_image_statement" USING btree ("_path");
  CREATE INDEX "home_image_statement_media_idx" ON "home_image_statement" USING btree ("media_id");
  CREATE INDEX "home_split_narrow_order_idx" ON "home_split_narrow" USING btree ("_order");
  CREATE INDEX "home_split_narrow_parent_id_idx" ON "home_split_narrow" USING btree ("_parent_id");
  CREATE INDEX "home_split_narrow_path_idx" ON "home_split_narrow" USING btree ("_path");
  CREATE INDEX "home_split_narrow_media_idx" ON "home_split_narrow" USING btree ("media_id");
  CREATE INDEX "home_hero_hero_media_idx" ON "home" USING btree ("hero_media_id");
  CREATE INDEX "home_hero_hero_featured_post_idx" ON "home" USING btree ("hero_featured_post_id");
  CREATE INDEX "home_meta_meta_image_idx" ON "home" USING btree ("meta_image_id");
  CREATE INDEX "home__status_idx" ON "home" USING btree ("_status");
  CREATE INDEX "home_rels_order_idx" ON "home_rels" USING btree ("order");
  CREATE INDEX "home_rels_parent_idx" ON "home_rels" USING btree ("parent_id");
  CREATE INDEX "home_rels_path_idx" ON "home_rels" USING btree ("path");
  CREATE INDEX "home_rels_pages_id_idx" ON "home_rels" USING btree ("pages_id");
  CREATE INDEX "home_rels_posts_id_idx" ON "home_rels" USING btree ("posts_id");
  CREATE INDEX "home_rels_categories_id_idx" ON "home_rels" USING btree ("categories_id");
  CREATE INDEX "_home_v_blocks_cta_links_order_idx" ON "_home_v_blocks_cta_links" USING btree ("_order");
  CREATE INDEX "_home_v_blocks_cta_links_parent_id_idx" ON "_home_v_blocks_cta_links" USING btree ("_parent_id");
  CREATE INDEX "_home_v_blocks_cta_order_idx" ON "_home_v_blocks_cta" USING btree ("_order");
  CREATE INDEX "_home_v_blocks_cta_parent_id_idx" ON "_home_v_blocks_cta" USING btree ("_parent_id");
  CREATE INDEX "_home_v_blocks_cta_path_idx" ON "_home_v_blocks_cta" USING btree ("_path");
  CREATE INDEX "_home_v_blocks_content_columns_order_idx" ON "_home_v_blocks_content_columns" USING btree ("_order");
  CREATE INDEX "_home_v_blocks_content_columns_parent_id_idx" ON "_home_v_blocks_content_columns" USING btree ("_parent_id");
  CREATE INDEX "_home_v_blocks_content_order_idx" ON "_home_v_blocks_content" USING btree ("_order");
  CREATE INDEX "_home_v_blocks_content_parent_id_idx" ON "_home_v_blocks_content" USING btree ("_parent_id");
  CREATE INDEX "_home_v_blocks_content_path_idx" ON "_home_v_blocks_content" USING btree ("_path");
  CREATE INDEX "_home_v_blocks_media_block_order_idx" ON "_home_v_blocks_media_block" USING btree ("_order");
  CREATE INDEX "_home_v_blocks_media_block_parent_id_idx" ON "_home_v_blocks_media_block" USING btree ("_parent_id");
  CREATE INDEX "_home_v_blocks_media_block_path_idx" ON "_home_v_blocks_media_block" USING btree ("_path");
  CREATE INDEX "_home_v_blocks_media_block_media_idx" ON "_home_v_blocks_media_block" USING btree ("media_id");
  CREATE INDEX "_home_v_blocks_archive_order_idx" ON "_home_v_blocks_archive" USING btree ("_order");
  CREATE INDEX "_home_v_blocks_archive_parent_id_idx" ON "_home_v_blocks_archive" USING btree ("_parent_id");
  CREATE INDEX "_home_v_blocks_archive_path_idx" ON "_home_v_blocks_archive" USING btree ("_path");
  CREATE INDEX "_home_v_blocks_form_block_order_idx" ON "_home_v_blocks_form_block" USING btree ("_order");
  CREATE INDEX "_home_v_blocks_form_block_parent_id_idx" ON "_home_v_blocks_form_block" USING btree ("_parent_id");
  CREATE INDEX "_home_v_blocks_form_block_path_idx" ON "_home_v_blocks_form_block" USING btree ("_path");
  CREATE INDEX "_home_v_blocks_form_block_form_idx" ON "_home_v_blocks_form_block" USING btree ("form_id");
  CREATE INDEX "_home_v_blocks_newsletter_signup_order_idx" ON "_home_v_blocks_newsletter_signup" USING btree ("_order");
  CREATE INDEX "_home_v_blocks_newsletter_signup_parent_id_idx" ON "_home_v_blocks_newsletter_signup" USING btree ("_parent_id");
  CREATE INDEX "_home_v_blocks_newsletter_signup_path_idx" ON "_home_v_blocks_newsletter_signup" USING btree ("_path");
  CREATE INDEX "_home_v_blocks_newsletter_signup_audience_idx" ON "_home_v_blocks_newsletter_signup" USING btree ("audience_id");
  CREATE INDEX "_home_v_blocks_feature_statement_grid_cards_order_idx" ON "_home_v_blocks_feature_statement_grid_cards" USING btree ("_order");
  CREATE INDEX "_home_v_blocks_feature_statement_grid_cards_parent_id_idx" ON "_home_v_blocks_feature_statement_grid_cards" USING btree ("_parent_id");
  CREATE INDEX "_home_v_blocks_feature_statement_grid_cards_media_idx" ON "_home_v_blocks_feature_statement_grid_cards" USING btree ("media_id");
  CREATE INDEX "_home_v_blocks_feature_statement_grid_order_idx" ON "_home_v_blocks_feature_statement_grid" USING btree ("_order");
  CREATE INDEX "_home_v_blocks_feature_statement_grid_parent_id_idx" ON "_home_v_blocks_feature_statement_grid" USING btree ("_parent_id");
  CREATE INDEX "_home_v_blocks_feature_statement_grid_path_idx" ON "_home_v_blocks_feature_statement_grid" USING btree ("_path");
  CREATE INDEX "_home_v_blocks_feature_heading_offset_order_idx" ON "_home_v_blocks_feature_heading_offset" USING btree ("_order");
  CREATE INDEX "_home_v_blocks_feature_heading_offset_parent_id_idx" ON "_home_v_blocks_feature_heading_offset" USING btree ("_parent_id");
  CREATE INDEX "_home_v_blocks_feature_heading_offset_path_idx" ON "_home_v_blocks_feature_heading_offset" USING btree ("_path");
  CREATE INDEX "_home_v_blocks_feature_tabs_tabs_items_order_idx" ON "_home_v_blocks_feature_tabs_tabs_items" USING btree ("_order");
  CREATE INDEX "_home_v_blocks_feature_tabs_tabs_items_parent_id_idx" ON "_home_v_blocks_feature_tabs_tabs_items" USING btree ("_parent_id");
  CREATE INDEX "_home_v_blocks_feature_tabs_tabs_order_idx" ON "_home_v_blocks_feature_tabs_tabs" USING btree ("_order");
  CREATE INDEX "_home_v_blocks_feature_tabs_tabs_parent_id_idx" ON "_home_v_blocks_feature_tabs_tabs" USING btree ("_parent_id");
  CREATE INDEX "_home_v_blocks_feature_tabs_tabs_media_idx" ON "_home_v_blocks_feature_tabs_tabs" USING btree ("media_id");
  CREATE INDEX "_home_v_blocks_feature_tabs_order_idx" ON "_home_v_blocks_feature_tabs" USING btree ("_order");
  CREATE INDEX "_home_v_blocks_feature_tabs_parent_id_idx" ON "_home_v_blocks_feature_tabs" USING btree ("_parent_id");
  CREATE INDEX "_home_v_blocks_feature_tabs_path_idx" ON "_home_v_blocks_feature_tabs" USING btree ("_path");
  CREATE INDEX "__home_v_image_statement_v_order_idx" ON "__home_v_image_statement_v" USING btree ("_order");
  CREATE INDEX "__home_v_image_statement_v_parent_id_idx" ON "__home_v_image_statement_v" USING btree ("_parent_id");
  CREATE INDEX "__home_v_image_statement_v_path_idx" ON "__home_v_image_statement_v" USING btree ("_path");
  CREATE INDEX "__home_v_image_statement_v_media_idx" ON "__home_v_image_statement_v" USING btree ("media_id");
  CREATE INDEX "__home_v_split_narrow_v_order_idx" ON "__home_v_split_narrow_v" USING btree ("_order");
  CREATE INDEX "__home_v_split_narrow_v_parent_id_idx" ON "__home_v_split_narrow_v" USING btree ("_parent_id");
  CREATE INDEX "__home_v_split_narrow_v_path_idx" ON "__home_v_split_narrow_v" USING btree ("_path");
  CREATE INDEX "__home_v_split_narrow_v_media_idx" ON "__home_v_split_narrow_v" USING btree ("media_id");
  CREATE INDEX "_home_v_version_hero_version_hero_media_idx" ON "_home_v" USING btree ("version_hero_media_id");
  CREATE INDEX "_home_v_version_hero_version_hero_featured_post_idx" ON "_home_v" USING btree ("version_hero_featured_post_id");
  CREATE INDEX "_home_v_version_meta_version_meta_image_idx" ON "_home_v" USING btree ("version_meta_image_id");
  CREATE INDEX "_home_v_version_version__status_idx" ON "_home_v" USING btree ("version__status");
  CREATE INDEX "_home_v_created_at_idx" ON "_home_v" USING btree ("created_at");
  CREATE INDEX "_home_v_updated_at_idx" ON "_home_v" USING btree ("updated_at");
  CREATE INDEX "_home_v_latest_idx" ON "_home_v" USING btree ("latest");
  CREATE INDEX "_home_v_autosave_idx" ON "_home_v" USING btree ("autosave");
  CREATE INDEX "_home_v_rels_order_idx" ON "_home_v_rels" USING btree ("order");
  CREATE INDEX "_home_v_rels_parent_idx" ON "_home_v_rels" USING btree ("parent_id");
  CREATE INDEX "_home_v_rels_path_idx" ON "_home_v_rels" USING btree ("path");
  CREATE INDEX "_home_v_rels_pages_id_idx" ON "_home_v_rels" USING btree ("pages_id");
  CREATE INDEX "_home_v_rels_posts_id_idx" ON "_home_v_rels" USING btree ("posts_id");
  CREATE INDEX "_home_v_rels_categories_id_idx" ON "_home_v_rels" USING btree ("categories_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "home_blocks_cta_links" CASCADE;
  DROP TABLE "home_blocks_cta" CASCADE;
  DROP TABLE "home_blocks_content_columns" CASCADE;
  DROP TABLE "home_blocks_content" CASCADE;
  DROP TABLE "home_blocks_media_block" CASCADE;
  DROP TABLE "home_blocks_archive" CASCADE;
  DROP TABLE "home_blocks_form_block" CASCADE;
  DROP TABLE "home_blocks_newsletter_signup" CASCADE;
  DROP TABLE "home_blocks_feature_statement_grid_cards" CASCADE;
  DROP TABLE "home_blocks_feature_statement_grid" CASCADE;
  DROP TABLE "home_blocks_feature_heading_offset" CASCADE;
  DROP TABLE "home_blocks_feature_tabs_tabs_items" CASCADE;
  DROP TABLE "home_blocks_feature_tabs_tabs" CASCADE;
  DROP TABLE "home_blocks_feature_tabs" CASCADE;
  DROP TABLE "home_image_statement" CASCADE;
  DROP TABLE "home_split_narrow" CASCADE;
  DROP TABLE "home" CASCADE;
  DROP TABLE "home_rels" CASCADE;
  DROP TABLE "_home_v_blocks_cta_links" CASCADE;
  DROP TABLE "_home_v_blocks_cta" CASCADE;
  DROP TABLE "_home_v_blocks_content_columns" CASCADE;
  DROP TABLE "_home_v_blocks_content" CASCADE;
  DROP TABLE "_home_v_blocks_media_block" CASCADE;
  DROP TABLE "_home_v_blocks_archive" CASCADE;
  DROP TABLE "_home_v_blocks_form_block" CASCADE;
  DROP TABLE "_home_v_blocks_newsletter_signup" CASCADE;
  DROP TABLE "_home_v_blocks_feature_statement_grid_cards" CASCADE;
  DROP TABLE "_home_v_blocks_feature_statement_grid" CASCADE;
  DROP TABLE "_home_v_blocks_feature_heading_offset" CASCADE;
  DROP TABLE "_home_v_blocks_feature_tabs_tabs_items" CASCADE;
  DROP TABLE "_home_v_blocks_feature_tabs_tabs" CASCADE;
  DROP TABLE "_home_v_blocks_feature_tabs" CASCADE;
  DROP TABLE "__home_v_image_statement_v" CASCADE;
  DROP TABLE "__home_v_split_narrow_v" CASCADE;
  DROP TABLE "_home_v" CASCADE;
  DROP TABLE "_home_v_rels" CASCADE;
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "home_find";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "home_update";
  DROP TYPE "public"."enum_home_blocks_cta_links_link_type";
  DROP TYPE "public"."enum_home_blocks_cta_links_link_appearance";
  DROP TYPE "public"."enum_home_blocks_content_columns_size";
  DROP TYPE "public"."enum_home_blocks_content_columns_link_type";
  DROP TYPE "public"."enum_home_blocks_content_columns_link_appearance";
  DROP TYPE "public"."enum_home_blocks_media_block_size";
  DROP TYPE "public"."enum_home_blocks_archive_populate_by";
  DROP TYPE "public"."enum_home_blocks_archive_relation_to";
  DROP TYPE "public"."enum_home_blocks_archive_card_variant";
  DROP TYPE "public"."enum_home_blocks_feature_statement_grid_source";
  DROP TYPE "public"."enum_home_blocks_feature_heading_offset_source";
  DROP TYPE "public"."enum_home_blocks_feature_tabs_tabs_source";
  DROP TYPE "public"."enum_home_image_statement_source";
  DROP TYPE "public"."enum_home_image_statement_text_position";
  DROP TYPE "public"."enum_home_image_statement_text_size";
  DROP TYPE "public"."enum_home_image_statement_image_width";
  DROP TYPE "public"."enum_home_split_narrow_source";
  DROP TYPE "public"."enum_home_split_narrow_image_position";
  DROP TYPE "public"."enum_home_split_narrow_theme";
  DROP TYPE "public"."enum_home_hero_type";
  DROP TYPE "public"."enum_home_status";
  DROP TYPE "public"."enum__home_v_blocks_cta_links_link_type";
  DROP TYPE "public"."enum__home_v_blocks_cta_links_link_appearance";
  DROP TYPE "public"."enum__home_v_blocks_content_columns_size";
  DROP TYPE "public"."enum__home_v_blocks_content_columns_link_type";
  DROP TYPE "public"."enum__home_v_blocks_content_columns_link_appearance";
  DROP TYPE "public"."enum__home_v_blocks_media_block_size";
  DROP TYPE "public"."enum__home_v_blocks_archive_populate_by";
  DROP TYPE "public"."enum__home_v_blocks_archive_relation_to";
  DROP TYPE "public"."enum__home_v_blocks_archive_card_variant";
  DROP TYPE "public"."enum__home_v_blocks_feature_statement_grid_source";
  DROP TYPE "public"."enum__home_v_blocks_feature_heading_offset_source";
  DROP TYPE "public"."enum__home_v_blocks_feature_tabs_tabs_source";
  DROP TYPE "public"."enum___home_v_image_statement_v_source";
  DROP TYPE "public"."enum___home_v_image_statement_v_text_position";
  DROP TYPE "public"."enum___home_v_image_statement_v_text_size";
  DROP TYPE "public"."enum___home_v_image_statement_v_image_width";
  DROP TYPE "public"."enum___home_v_split_narrow_v_source";
  DROP TYPE "public"."enum___home_v_split_narrow_v_image_position";
  DROP TYPE "public"."enum___home_v_split_narrow_v_theme";
  DROP TYPE "public"."enum__home_v_version_hero_type";
  DROP TYPE "public"."enum__home_v_version_status";`)
}
