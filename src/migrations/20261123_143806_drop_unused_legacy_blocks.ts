import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

/**
 * Every table this migration drops, checked before anything is dropped. The
 * eight blocks it removes had no rows in production when it was written
 * (audit 2026-11-22, docs/blocks-reorg-roadmap.md section 0), version history
 * included; Statement grid, Statement links and Metrics stay because old
 * versions still hold them. If any table here, or the Lab media rels column,
 * holds a row, the migration raises, the transaction rolls back, and nothing
 * is dropped.
 */
export const DROPPED_TABLES = [
  '__home_v_dyn_aud_v',
  '__home_v_dyn_aud_v_audiences',
  '__home_v_dyn_aud_v_audiences_items',
  '__lab_pages_v_scroll_gal_v',
  '__lab_pages_v_scroll_gal_v_items',
  '__pages_v_dyn_aud_v',
  '__pages_v_dyn_aud_v_audiences',
  '__pages_v_dyn_aud_v_audiences_items',
  '__work_pages_v_scroll_gal_v',
  '__work_pages_v_scroll_gal_v_items',
  '_lp_media_v',
  '_lp_story_v',
  '_wp_decisions_v',
  '_wp_quote_v',
  '_wp_related_v',
  'home_dyn_aud',
  'home_dyn_aud_audiences',
  'home_dyn_aud_audiences_items',
  'lab_pages_scroll_gal',
  'lab_pages_scroll_gal_items',
  'lp_media',
  'lp_story',
  'pages_dyn_aud',
  'pages_dyn_aud_audiences',
  'pages_dyn_aud_audiences_items',
  'work_pages_scroll_gal',
  'work_pages_scroll_gal_items',
  'wp_decisions',
  'wp_quote',
  'wp_related',
] as const

const assertNothingToLose = (db: MigrateUpArgs['db']) =>
  db.execute(sql`
  DO $$
  DECLARE t text; n bigint;
  BEGIN
    FOREACH t IN ARRAY ARRAY[${sql.raw(DROPPED_TABLES.map((name) => `'${name}'`).join(', '))}]::text[] LOOP
      IF to_regclass(format('public.%I', t)) IS NOT NULL THEN
        EXECUTE format('SELECT count(*) FROM %I', t) INTO n;
        IF n > 0 THEN
          RAISE EXCEPTION 'drop_unused_legacy_blocks: % holds % rows; nothing was dropped', t, n;
        END IF;
      END IF;
    END LOOP;
    IF EXISTS (SELECT 1 FROM "lab_pages_rels" WHERE "media_id" IS NOT NULL)
      OR EXISTS (SELECT 1 FROM "_lab_pages_v_rels" WHERE "media_id" IS NOT NULL) THEN
      RAISE EXCEPTION 'drop_unused_legacy_blocks: lab_pages_rels.media_id holds rows; nothing was dropped';
    END IF;
  END $$;
  `)

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await assertNothingToLose(db)
  await db.execute(sql`
   ALTER TABLE "pages_dyn_aud_audiences_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_dyn_aud_audiences" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_dyn_aud" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__pages_v_dyn_aud_v_audiences_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__pages_v_dyn_aud_v_audiences" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__pages_v_dyn_aud_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "work_pages_scroll_gal_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "work_pages_scroll_gal" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "wp_quote" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "wp_decisions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "wp_related" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__work_pages_v_scroll_gal_v_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__work_pages_v_scroll_gal_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_wp_quote_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_wp_decisions_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_wp_related_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "lp_media" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "lab_pages_scroll_gal_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "lab_pages_scroll_gal" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "lp_story" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_lp_media_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__lab_pages_v_scroll_gal_v_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__lab_pages_v_scroll_gal_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_lp_story_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_dyn_aud_audiences_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_dyn_aud_audiences" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_dyn_aud" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__home_v_dyn_aud_v_audiences_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__home_v_dyn_aud_v_audiences" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__home_v_dyn_aud_v" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "pages_dyn_aud_audiences_items" CASCADE;
  DROP TABLE "pages_dyn_aud_audiences" CASCADE;
  DROP TABLE "pages_dyn_aud" CASCADE;
  DROP TABLE "__pages_v_dyn_aud_v_audiences_items" CASCADE;
  DROP TABLE "__pages_v_dyn_aud_v_audiences" CASCADE;
  DROP TABLE "__pages_v_dyn_aud_v" CASCADE;
  DROP TABLE "work_pages_scroll_gal_items" CASCADE;
  DROP TABLE "work_pages_scroll_gal" CASCADE;
  DROP TABLE "wp_quote" CASCADE;
  DROP TABLE "wp_decisions" CASCADE;
  DROP TABLE "wp_related" CASCADE;
  DROP TABLE "__work_pages_v_scroll_gal_v_items" CASCADE;
  DROP TABLE "__work_pages_v_scroll_gal_v" CASCADE;
  DROP TABLE "_wp_quote_v" CASCADE;
  DROP TABLE "_wp_decisions_v" CASCADE;
  DROP TABLE "_wp_related_v" CASCADE;
  DROP TABLE "lp_media" CASCADE;
  DROP TABLE "lab_pages_scroll_gal_items" CASCADE;
  DROP TABLE "lab_pages_scroll_gal" CASCADE;
  DROP TABLE "lp_story" CASCADE;
  DROP TABLE "_lp_media_v" CASCADE;
  DROP TABLE "__lab_pages_v_scroll_gal_v_items" CASCADE;
  DROP TABLE "__lab_pages_v_scroll_gal_v" CASCADE;
  DROP TABLE "_lp_story_v" CASCADE;
  DROP TABLE "home_dyn_aud_audiences_items" CASCADE;
  DROP TABLE "home_dyn_aud_audiences" CASCADE;
  DROP TABLE "home_dyn_aud" CASCADE;
  DROP TABLE "__home_v_dyn_aud_v_audiences_items" CASCADE;
  DROP TABLE "__home_v_dyn_aud_v_audiences" CASCADE;
  DROP TABLE "__home_v_dyn_aud_v" CASCADE;
  ALTER TABLE "lab_pages_rels" DROP CONSTRAINT "lab_pages_rels_media_fk";
  
  ALTER TABLE "_lab_pages_v_rels" DROP CONSTRAINT "_lab_pages_v_rels_media_fk";
  
  DROP INDEX "lab_pages_rels_media_id_idx";
  DROP INDEX "_lab_pages_v_rels_media_id_idx";
  ALTER TABLE "lab_pages_rels" DROP COLUMN "media_id";
  ALTER TABLE "_lab_pages_v_rels" DROP COLUMN "media_id";
  DROP TYPE "public"."enum_pages_dyn_aud_theme";
  DROP TYPE "public"."enum___pages_v_dyn_aud_v_theme";
  DROP TYPE "public"."enum_work_pages_scroll_gal_theme";
  DROP TYPE "public"."enum_wp_quote_layout";
  DROP TYPE "public"."enum_wp_quote_theme";
  DROP TYPE "public"."enum_wp_decisions_source";
  DROP TYPE "public"."enum_wp_decisions_layout";
  DROP TYPE "public"."enum_wp_decisions_theme";
  DROP TYPE "public"."enum_wp_related_selection_mode";
  DROP TYPE "public"."enum_wp_related_layout";
  DROP TYPE "public"."enum___work_pages_v_scroll_gal_v_theme";
  DROP TYPE "public"."enum__wp_quote_v_layout";
  DROP TYPE "public"."enum__wp_quote_v_theme";
  DROP TYPE "public"."enum__wp_decisions_v_source";
  DROP TYPE "public"."enum__wp_decisions_v_layout";
  DROP TYPE "public"."enum__wp_decisions_v_theme";
  DROP TYPE "public"."enum__wp_related_v_selection_mode";
  DROP TYPE "public"."enum__wp_related_v_layout";
  DROP TYPE "public"."enum_lp_media_layout";
  DROP TYPE "public"."enum_lp_media_theme";
  DROP TYPE "public"."enum_lab_pages_scroll_gal_theme";
  DROP TYPE "public"."enum_lp_story_source";
  DROP TYPE "public"."enum_lp_story_story_scope";
  DROP TYPE "public"."enum_lp_story_layout";
  DROP TYPE "public"."enum_lp_story_theme";
  DROP TYPE "public"."enum_lp_story_width";
  DROP TYPE "public"."enum__lp_media_v_layout";
  DROP TYPE "public"."enum__lp_media_v_theme";
  DROP TYPE "public"."enum___lab_pages_v_scroll_gal_v_theme";
  DROP TYPE "public"."enum__lp_story_v_source";
  DROP TYPE "public"."enum__lp_story_v_story_scope";
  DROP TYPE "public"."enum__lp_story_v_layout";
  DROP TYPE "public"."enum__lp_story_v_theme";
  DROP TYPE "public"."enum__lp_story_v_width";
  DROP TYPE "public"."enum_home_dyn_aud_theme";
  DROP TYPE "public"."enum___home_v_dyn_aud_v_theme";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_dyn_aud_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum___pages_v_dyn_aud_v_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum_work_pages_scroll_gal_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum_wp_quote_layout" AS ENUM('editorial', 'centered', 'split', 'compact');
  CREATE TYPE "public"."enum_wp_quote_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum_wp_decisions_source" AS ENUM('featured', 'all');
  CREATE TYPE "public"."enum_wp_decisions_layout" AS ENUM('list', 'cards', 'editorial', 'sticky');
  CREATE TYPE "public"."enum_wp_decisions_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum_wp_related_selection_mode" AS ENUM('document-settings', 'automatic-capability-match');
  CREATE TYPE "public"."enum_wp_related_layout" AS ENUM('grid', 'list', 'feature');
  CREATE TYPE "public"."enum___work_pages_v_scroll_gal_v_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum__wp_quote_v_layout" AS ENUM('editorial', 'centered', 'split', 'compact');
  CREATE TYPE "public"."enum__wp_quote_v_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum__wp_decisions_v_source" AS ENUM('featured', 'all');
  CREATE TYPE "public"."enum__wp_decisions_v_layout" AS ENUM('list', 'cards', 'editorial', 'sticky');
  CREATE TYPE "public"."enum__wp_decisions_v_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum__wp_related_v_selection_mode" AS ENUM('document-settings', 'automatic-capability-match');
  CREATE TYPE "public"."enum__wp_related_v_layout" AS ENUM('grid', 'list', 'feature');
  CREATE TYPE "public"."enum_lp_media_layout" AS ENUM('single', 'grid', 'horizontal', 'stacked', 'full-bleed', 'comparison');
  CREATE TYPE "public"."enum_lp_media_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum_lab_pages_scroll_gal_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum_lp_story_source" AS ENUM('context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings', 'custom');
  CREATE TYPE "public"."enum_lp_story_story_scope" AS ENUM('overview', 'section', 'beat');
  CREATE TYPE "public"."enum_lp_story_layout" AS ENUM('text-only', 'text-left', 'text-right', 'centered', 'sticky-media');
  CREATE TYPE "public"."enum_lp_story_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum_lp_story_width" AS ENUM('narrow', 'standard', 'wide');
  CREATE TYPE "public"."enum__lp_media_v_layout" AS ENUM('single', 'grid', 'horizontal', 'stacked', 'full-bleed', 'comparison');
  CREATE TYPE "public"."enum__lp_media_v_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum___lab_pages_v_scroll_gal_v_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum__lp_story_v_source" AS ENUM('context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings', 'custom');
  CREATE TYPE "public"."enum__lp_story_v_story_scope" AS ENUM('overview', 'section', 'beat');
  CREATE TYPE "public"."enum__lp_story_v_layout" AS ENUM('text-only', 'text-left', 'text-right', 'centered', 'sticky-media');
  CREATE TYPE "public"."enum__lp_story_v_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum__lp_story_v_width" AS ENUM('narrow', 'standard', 'wide');
  CREATE TYPE "public"."enum_home_dyn_aud_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum___home_v_dyn_aud_v_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TABLE "pages_dyn_aud_audiences_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "pages_dyn_aud_audiences" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"subheading" varchar,
  	"intro" varchar,
  	"media_id" integer
  );
  
  CREATE TABLE "pages_dyn_aud" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar DEFAULT 'How we help',
  	"theme" "enum_pages_dyn_aud_theme" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "__pages_v_dyn_aud_v_audiences_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "__pages_v_dyn_aud_v_audiences" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"subheading" varchar,
  	"intro" varchar,
  	"media_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "__pages_v_dyn_aud_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar DEFAULT 'How we help',
  	"theme" "enum___pages_v_dyn_aud_v_theme" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "work_pages_scroll_gal_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"mood_background" varchar,
  	"mood_blob1" varchar,
  	"mood_blob2" varchar
  );
  
  CREATE TABLE "work_pages_scroll_gal" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"browse_all_media" boolean DEFAULT false,
  	"theme" "enum_work_pages_scroll_gal_theme" DEFAULT 'inverted',
  	"block_name" varchar
  );
  
  CREATE TABLE "wp_quote" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"testimonial_id" integer,
  	"layout" "enum_wp_quote_layout" DEFAULT 'editorial',
  	"theme" "enum_wp_quote_theme" DEFAULT 'default',
  	"show_portrait" boolean DEFAULT true,
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
  	"theme" "enum_wp_decisions_theme" DEFAULT 'default',
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
  
  CREATE TABLE "__work_pages_v_scroll_gal_v_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"mood_background" varchar,
  	"mood_blob1" varchar,
  	"mood_blob2" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "__work_pages_v_scroll_gal_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"browse_all_media" boolean DEFAULT false,
  	"theme" "enum___work_pages_v_scroll_gal_v_theme" DEFAULT 'inverted',
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
  	"theme" "enum__wp_quote_v_theme" DEFAULT 'default',
  	"show_portrait" boolean DEFAULT true,
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
  	"theme" "enum__wp_decisions_v_theme" DEFAULT 'default',
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
  
  CREATE TABLE "lp_media" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"introduction" jsonb,
  	"layout" "enum_lp_media_layout" DEFAULT 'grid',
  	"theme" "enum_lp_media_theme" DEFAULT 'default',
  	"show_captions" boolean DEFAULT true,
  	"show_credits" boolean DEFAULT true,
  	"block_name" varchar
  );
  
  CREATE TABLE "lab_pages_scroll_gal_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"mood_background" varchar,
  	"mood_blob1" varchar,
  	"mood_blob2" varchar
  );
  
  CREATE TABLE "lab_pages_scroll_gal" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"theme" "enum_lab_pages_scroll_gal_theme" DEFAULT 'inverted',
  	"block_name" varchar
  );
  
  CREATE TABLE "lp_story" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"source" "enum_lp_story_source" DEFAULT 'context',
  	"story_scope" "enum_lp_story_story_scope" DEFAULT 'overview',
  	"story_beat_key" varchar,
  	"show_overrides" boolean DEFAULT false,
  	"eyebrow" varchar,
  	"heading_override" varchar,
  	"body_override" jsonb,
  	"custom_body" jsonb,
  	"media_id" integer,
  	"layout" "enum_lp_story_layout" DEFAULT 'text-only',
  	"theme" "enum_lp_story_theme" DEFAULT 'default',
  	"width" "enum_lp_story_width" DEFAULT 'standard',
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
  	"theme" "enum__lp_media_v_theme" DEFAULT 'default',
  	"show_captions" boolean DEFAULT true,
  	"show_credits" boolean DEFAULT true,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "__lab_pages_v_scroll_gal_v_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"mood_background" varchar,
  	"mood_blob1" varchar,
  	"mood_blob2" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "__lab_pages_v_scroll_gal_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"theme" "enum___lab_pages_v_scroll_gal_v_theme" DEFAULT 'inverted',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_lp_story_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"source" "enum__lp_story_v_source" DEFAULT 'context',
  	"story_scope" "enum__lp_story_v_story_scope" DEFAULT 'overview',
  	"story_beat_key" varchar,
  	"show_overrides" boolean DEFAULT false,
  	"eyebrow" varchar,
  	"heading_override" varchar,
  	"body_override" jsonb,
  	"custom_body" jsonb,
  	"media_id" integer,
  	"layout" "enum__lp_story_v_layout" DEFAULT 'text-only',
  	"theme" "enum__lp_story_v_theme" DEFAULT 'default',
  	"width" "enum__lp_story_v_width" DEFAULT 'standard',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "home_dyn_aud_audiences_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "home_dyn_aud_audiences" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"subheading" varchar,
  	"intro" varchar,
  	"media_id" integer
  );
  
  CREATE TABLE "home_dyn_aud" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar DEFAULT 'How we help',
  	"theme" "enum_home_dyn_aud_theme" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "__home_v_dyn_aud_v_audiences_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "__home_v_dyn_aud_v_audiences" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"subheading" varchar,
  	"intro" varchar,
  	"media_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "__home_v_dyn_aud_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar DEFAULT 'How we help',
  	"theme" "enum___home_v_dyn_aud_v_theme" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "lab_pages_rels" ADD COLUMN "media_id" integer;
  ALTER TABLE "_lab_pages_v_rels" ADD COLUMN "media_id" integer;
  ALTER TABLE "pages_dyn_aud_audiences_items" ADD CONSTRAINT "pages_dyn_aud_audiences_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_dyn_aud_audiences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_dyn_aud_audiences" ADD CONSTRAINT "pages_dyn_aud_audiences_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_dyn_aud_audiences" ADD CONSTRAINT "pages_dyn_aud_audiences_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_dyn_aud"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_dyn_aud" ADD CONSTRAINT "pages_dyn_aud_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__pages_v_dyn_aud_v_audiences_items" ADD CONSTRAINT "__pages_v_dyn_aud_v_audiences_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."__pages_v_dyn_aud_v_audiences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__pages_v_dyn_aud_v_audiences" ADD CONSTRAINT "__pages_v_dyn_aud_v_audiences_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__pages_v_dyn_aud_v_audiences" ADD CONSTRAINT "__pages_v_dyn_aud_v_audiences_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."__pages_v_dyn_aud_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__pages_v_dyn_aud_v" ADD CONSTRAINT "__pages_v_dyn_aud_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "work_pages_scroll_gal_items" ADD CONSTRAINT "work_pages_scroll_gal_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "work_pages_scroll_gal_items" ADD CONSTRAINT "work_pages_scroll_gal_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."work_pages_scroll_gal"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "work_pages_scroll_gal" ADD CONSTRAINT "work_pages_scroll_gal_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."work_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "wp_quote" ADD CONSTRAINT "wp_quote_testimonial_id_testimonials_id_fk" FOREIGN KEY ("testimonial_id") REFERENCES "public"."testimonials"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "wp_quote" ADD CONSTRAINT "wp_quote_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."work_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "wp_decisions" ADD CONSTRAINT "wp_decisions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."work_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "wp_related" ADD CONSTRAINT "wp_related_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."work_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__work_pages_v_scroll_gal_v_items" ADD CONSTRAINT "__work_pages_v_scroll_gal_v_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__work_pages_v_scroll_gal_v_items" ADD CONSTRAINT "__work_pages_v_scroll_gal_v_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."__work_pages_v_scroll_gal_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__work_pages_v_scroll_gal_v" ADD CONSTRAINT "__work_pages_v_scroll_gal_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_work_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_wp_quote_v" ADD CONSTRAINT "_wp_quote_v_testimonial_id_testimonials_id_fk" FOREIGN KEY ("testimonial_id") REFERENCES "public"."testimonials"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_wp_quote_v" ADD CONSTRAINT "_wp_quote_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_work_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_wp_decisions_v" ADD CONSTRAINT "_wp_decisions_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_work_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_wp_related_v" ADD CONSTRAINT "_wp_related_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_work_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lp_media" ADD CONSTRAINT "lp_media_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lab_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lab_pages_scroll_gal_items" ADD CONSTRAINT "lab_pages_scroll_gal_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "lab_pages_scroll_gal_items" ADD CONSTRAINT "lab_pages_scroll_gal_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lab_pages_scroll_gal"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lab_pages_scroll_gal" ADD CONSTRAINT "lab_pages_scroll_gal_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lab_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lp_story" ADD CONSTRAINT "lp_story_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "lp_story" ADD CONSTRAINT "lp_story_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lab_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_lp_media_v" ADD CONSTRAINT "_lp_media_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_lab_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__lab_pages_v_scroll_gal_v_items" ADD CONSTRAINT "__lab_pages_v_scroll_gal_v_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__lab_pages_v_scroll_gal_v_items" ADD CONSTRAINT "__lab_pages_v_scroll_gal_v_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."__lab_pages_v_scroll_gal_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__lab_pages_v_scroll_gal_v" ADD CONSTRAINT "__lab_pages_v_scroll_gal_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_lab_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_lp_story_v" ADD CONSTRAINT "_lp_story_v_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_lp_story_v" ADD CONSTRAINT "_lp_story_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_lab_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_dyn_aud_audiences_items" ADD CONSTRAINT "home_dyn_aud_audiences_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_dyn_aud_audiences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_dyn_aud_audiences" ADD CONSTRAINT "home_dyn_aud_audiences_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_dyn_aud_audiences" ADD CONSTRAINT "home_dyn_aud_audiences_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_dyn_aud"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_dyn_aud" ADD CONSTRAINT "home_dyn_aud_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__home_v_dyn_aud_v_audiences_items" ADD CONSTRAINT "__home_v_dyn_aud_v_audiences_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."__home_v_dyn_aud_v_audiences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__home_v_dyn_aud_v_audiences" ADD CONSTRAINT "__home_v_dyn_aud_v_audiences_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__home_v_dyn_aud_v_audiences" ADD CONSTRAINT "__home_v_dyn_aud_v_audiences_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."__home_v_dyn_aud_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__home_v_dyn_aud_v" ADD CONSTRAINT "__home_v_dyn_aud_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_dyn_aud_audiences_items_order_idx" ON "pages_dyn_aud_audiences_items" USING btree ("_order");
  CREATE INDEX "pages_dyn_aud_audiences_items_parent_id_idx" ON "pages_dyn_aud_audiences_items" USING btree ("_parent_id");
  CREATE INDEX "pages_dyn_aud_audiences_order_idx" ON "pages_dyn_aud_audiences" USING btree ("_order");
  CREATE INDEX "pages_dyn_aud_audiences_parent_id_idx" ON "pages_dyn_aud_audiences" USING btree ("_parent_id");
  CREATE INDEX "pages_dyn_aud_audiences_media_idx" ON "pages_dyn_aud_audiences" USING btree ("media_id");
  CREATE INDEX "pages_dyn_aud_order_idx" ON "pages_dyn_aud" USING btree ("_order");
  CREATE INDEX "pages_dyn_aud_parent_id_idx" ON "pages_dyn_aud" USING btree ("_parent_id");
  CREATE INDEX "pages_dyn_aud_path_idx" ON "pages_dyn_aud" USING btree ("_path");
  CREATE INDEX "__pages_v_dyn_aud_v_audiences_items_order_idx" ON "__pages_v_dyn_aud_v_audiences_items" USING btree ("_order");
  CREATE INDEX "__pages_v_dyn_aud_v_audiences_items_parent_id_idx" ON "__pages_v_dyn_aud_v_audiences_items" USING btree ("_parent_id");
  CREATE INDEX "__pages_v_dyn_aud_v_audiences_order_idx" ON "__pages_v_dyn_aud_v_audiences" USING btree ("_order");
  CREATE INDEX "__pages_v_dyn_aud_v_audiences_parent_id_idx" ON "__pages_v_dyn_aud_v_audiences" USING btree ("_parent_id");
  CREATE INDEX "__pages_v_dyn_aud_v_audiences_media_idx" ON "__pages_v_dyn_aud_v_audiences" USING btree ("media_id");
  CREATE INDEX "__pages_v_dyn_aud_v_order_idx" ON "__pages_v_dyn_aud_v" USING btree ("_order");
  CREATE INDEX "__pages_v_dyn_aud_v_parent_id_idx" ON "__pages_v_dyn_aud_v" USING btree ("_parent_id");
  CREATE INDEX "__pages_v_dyn_aud_v_path_idx" ON "__pages_v_dyn_aud_v" USING btree ("_path");
  CREATE INDEX "work_pages_scroll_gal_items_order_idx" ON "work_pages_scroll_gal_items" USING btree ("_order");
  CREATE INDEX "work_pages_scroll_gal_items_parent_id_idx" ON "work_pages_scroll_gal_items" USING btree ("_parent_id");
  CREATE INDEX "work_pages_scroll_gal_items_media_idx" ON "work_pages_scroll_gal_items" USING btree ("media_id");
  CREATE INDEX "work_pages_scroll_gal_order_idx" ON "work_pages_scroll_gal" USING btree ("_order");
  CREATE INDEX "work_pages_scroll_gal_parent_id_idx" ON "work_pages_scroll_gal" USING btree ("_parent_id");
  CREATE INDEX "work_pages_scroll_gal_path_idx" ON "work_pages_scroll_gal" USING btree ("_path");
  CREATE INDEX "wp_quote_order_idx" ON "wp_quote" USING btree ("_order");
  CREATE INDEX "wp_quote_parent_id_idx" ON "wp_quote" USING btree ("_parent_id");
  CREATE INDEX "wp_quote_path_idx" ON "wp_quote" USING btree ("_path");
  CREATE INDEX "wp_quote_testimonial_idx" ON "wp_quote" USING btree ("testimonial_id");
  CREATE INDEX "wp_decisions_order_idx" ON "wp_decisions" USING btree ("_order");
  CREATE INDEX "wp_decisions_parent_id_idx" ON "wp_decisions" USING btree ("_parent_id");
  CREATE INDEX "wp_decisions_path_idx" ON "wp_decisions" USING btree ("_path");
  CREATE INDEX "wp_related_order_idx" ON "wp_related" USING btree ("_order");
  CREATE INDEX "wp_related_parent_id_idx" ON "wp_related" USING btree ("_parent_id");
  CREATE INDEX "wp_related_path_idx" ON "wp_related" USING btree ("_path");
  CREATE INDEX "__work_pages_v_scroll_gal_v_items_order_idx" ON "__work_pages_v_scroll_gal_v_items" USING btree ("_order");
  CREATE INDEX "__work_pages_v_scroll_gal_v_items_parent_id_idx" ON "__work_pages_v_scroll_gal_v_items" USING btree ("_parent_id");
  CREATE INDEX "__work_pages_v_scroll_gal_v_items_media_idx" ON "__work_pages_v_scroll_gal_v_items" USING btree ("media_id");
  CREATE INDEX "__work_pages_v_scroll_gal_v_order_idx" ON "__work_pages_v_scroll_gal_v" USING btree ("_order");
  CREATE INDEX "__work_pages_v_scroll_gal_v_parent_id_idx" ON "__work_pages_v_scroll_gal_v" USING btree ("_parent_id");
  CREATE INDEX "__work_pages_v_scroll_gal_v_path_idx" ON "__work_pages_v_scroll_gal_v" USING btree ("_path");
  CREATE INDEX "_wp_quote_v_order_idx" ON "_wp_quote_v" USING btree ("_order");
  CREATE INDEX "_wp_quote_v_parent_id_idx" ON "_wp_quote_v" USING btree ("_parent_id");
  CREATE INDEX "_wp_quote_v_path_idx" ON "_wp_quote_v" USING btree ("_path");
  CREATE INDEX "_wp_quote_v_testimonial_idx" ON "_wp_quote_v" USING btree ("testimonial_id");
  CREATE INDEX "_wp_decisions_v_order_idx" ON "_wp_decisions_v" USING btree ("_order");
  CREATE INDEX "_wp_decisions_v_parent_id_idx" ON "_wp_decisions_v" USING btree ("_parent_id");
  CREATE INDEX "_wp_decisions_v_path_idx" ON "_wp_decisions_v" USING btree ("_path");
  CREATE INDEX "_wp_related_v_order_idx" ON "_wp_related_v" USING btree ("_order");
  CREATE INDEX "_wp_related_v_parent_id_idx" ON "_wp_related_v" USING btree ("_parent_id");
  CREATE INDEX "_wp_related_v_path_idx" ON "_wp_related_v" USING btree ("_path");
  CREATE INDEX "lp_media_order_idx" ON "lp_media" USING btree ("_order");
  CREATE INDEX "lp_media_parent_id_idx" ON "lp_media" USING btree ("_parent_id");
  CREATE INDEX "lp_media_path_idx" ON "lp_media" USING btree ("_path");
  CREATE INDEX "lab_pages_scroll_gal_items_order_idx" ON "lab_pages_scroll_gal_items" USING btree ("_order");
  CREATE INDEX "lab_pages_scroll_gal_items_parent_id_idx" ON "lab_pages_scroll_gal_items" USING btree ("_parent_id");
  CREATE INDEX "lab_pages_scroll_gal_items_media_idx" ON "lab_pages_scroll_gal_items" USING btree ("media_id");
  CREATE INDEX "lab_pages_scroll_gal_order_idx" ON "lab_pages_scroll_gal" USING btree ("_order");
  CREATE INDEX "lab_pages_scroll_gal_parent_id_idx" ON "lab_pages_scroll_gal" USING btree ("_parent_id");
  CREATE INDEX "lab_pages_scroll_gal_path_idx" ON "lab_pages_scroll_gal" USING btree ("_path");
  CREATE INDEX "lp_story_order_idx" ON "lp_story" USING btree ("_order");
  CREATE INDEX "lp_story_parent_id_idx" ON "lp_story" USING btree ("_parent_id");
  CREATE INDEX "lp_story_path_idx" ON "lp_story" USING btree ("_path");
  CREATE INDEX "lp_story_media_idx" ON "lp_story" USING btree ("media_id");
  CREATE INDEX "_lp_media_v_order_idx" ON "_lp_media_v" USING btree ("_order");
  CREATE INDEX "_lp_media_v_parent_id_idx" ON "_lp_media_v" USING btree ("_parent_id");
  CREATE INDEX "_lp_media_v_path_idx" ON "_lp_media_v" USING btree ("_path");
  CREATE INDEX "__lab_pages_v_scroll_gal_v_items_order_idx" ON "__lab_pages_v_scroll_gal_v_items" USING btree ("_order");
  CREATE INDEX "__lab_pages_v_scroll_gal_v_items_parent_id_idx" ON "__lab_pages_v_scroll_gal_v_items" USING btree ("_parent_id");
  CREATE INDEX "__lab_pages_v_scroll_gal_v_items_media_idx" ON "__lab_pages_v_scroll_gal_v_items" USING btree ("media_id");
  CREATE INDEX "__lab_pages_v_scroll_gal_v_order_idx" ON "__lab_pages_v_scroll_gal_v" USING btree ("_order");
  CREATE INDEX "__lab_pages_v_scroll_gal_v_parent_id_idx" ON "__lab_pages_v_scroll_gal_v" USING btree ("_parent_id");
  CREATE INDEX "__lab_pages_v_scroll_gal_v_path_idx" ON "__lab_pages_v_scroll_gal_v" USING btree ("_path");
  CREATE INDEX "_lp_story_v_order_idx" ON "_lp_story_v" USING btree ("_order");
  CREATE INDEX "_lp_story_v_parent_id_idx" ON "_lp_story_v" USING btree ("_parent_id");
  CREATE INDEX "_lp_story_v_path_idx" ON "_lp_story_v" USING btree ("_path");
  CREATE INDEX "_lp_story_v_media_idx" ON "_lp_story_v" USING btree ("media_id");
  CREATE INDEX "home_dyn_aud_audiences_items_order_idx" ON "home_dyn_aud_audiences_items" USING btree ("_order");
  CREATE INDEX "home_dyn_aud_audiences_items_parent_id_idx" ON "home_dyn_aud_audiences_items" USING btree ("_parent_id");
  CREATE INDEX "home_dyn_aud_audiences_order_idx" ON "home_dyn_aud_audiences" USING btree ("_order");
  CREATE INDEX "home_dyn_aud_audiences_parent_id_idx" ON "home_dyn_aud_audiences" USING btree ("_parent_id");
  CREATE INDEX "home_dyn_aud_audiences_media_idx" ON "home_dyn_aud_audiences" USING btree ("media_id");
  CREATE INDEX "home_dyn_aud_order_idx" ON "home_dyn_aud" USING btree ("_order");
  CREATE INDEX "home_dyn_aud_parent_id_idx" ON "home_dyn_aud" USING btree ("_parent_id");
  CREATE INDEX "home_dyn_aud_path_idx" ON "home_dyn_aud" USING btree ("_path");
  CREATE INDEX "__home_v_dyn_aud_v_audiences_items_order_idx" ON "__home_v_dyn_aud_v_audiences_items" USING btree ("_order");
  CREATE INDEX "__home_v_dyn_aud_v_audiences_items_parent_id_idx" ON "__home_v_dyn_aud_v_audiences_items" USING btree ("_parent_id");
  CREATE INDEX "__home_v_dyn_aud_v_audiences_order_idx" ON "__home_v_dyn_aud_v_audiences" USING btree ("_order");
  CREATE INDEX "__home_v_dyn_aud_v_audiences_parent_id_idx" ON "__home_v_dyn_aud_v_audiences" USING btree ("_parent_id");
  CREATE INDEX "__home_v_dyn_aud_v_audiences_media_idx" ON "__home_v_dyn_aud_v_audiences" USING btree ("media_id");
  CREATE INDEX "__home_v_dyn_aud_v_order_idx" ON "__home_v_dyn_aud_v" USING btree ("_order");
  CREATE INDEX "__home_v_dyn_aud_v_parent_id_idx" ON "__home_v_dyn_aud_v" USING btree ("_parent_id");
  CREATE INDEX "__home_v_dyn_aud_v_path_idx" ON "__home_v_dyn_aud_v" USING btree ("_path");
  ALTER TABLE "lab_pages_rels" ADD CONSTRAINT "lab_pages_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_lab_pages_v_rels" ADD CONSTRAINT "_lab_pages_v_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "lab_pages_rels_media_id_idx" ON "lab_pages_rels" USING btree ("media_id");
  CREATE INDEX "_lab_pages_v_rels_media_id_idx" ON "_lab_pages_v_rels" USING btree ("media_id");`)
}
