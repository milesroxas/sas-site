import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_youtube_size" AS ENUM('full', 'inset', 'small');
  CREATE TYPE "public"."enum_pages_youtube_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___pages_v_youtube_v_size" AS ENUM('full', 'inset', 'small');
  CREATE TYPE "public"."enum___pages_v_youtube_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_posts_youtube_size" AS ENUM('full', 'inset', 'small');
  CREATE TYPE "public"."enum_posts_youtube_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_posts_shader_origin" AS ENUM('top-right', 'top-left', 'bottom-right', 'bottom-left');
  CREATE TYPE "public"."enum___posts_v_youtube_v_size" AS ENUM('full', 'inset', 'small');
  CREATE TYPE "public"."enum___posts_v_youtube_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum__posts_v_version_shader_origin" AS ENUM('top-right', 'top-left', 'bottom-right', 'bottom-left');
  CREATE TYPE "public"."enum_work_pages_story_beats_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum_work_pages_story_beats_story_scope" AS ENUM('overview', 'section', 'beat');
  CREATE TYPE "public"."enum_work_pages_story_beats_variant" AS ENUM('default', 'small', 'lead');
  CREATE TYPE "public"."enum_work_pages_story_beats_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___work_pages_v_story_beats_v_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum___work_pages_v_story_beats_v_story_scope" AS ENUM('overview', 'section', 'beat');
  CREATE TYPE "public"."enum___work_pages_v_story_beats_v_variant" AS ENUM('default', 'small', 'lead');
  CREATE TYPE "public"."enum___work_pages_v_story_beats_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_lab_pages_youtube_size" AS ENUM('full', 'inset', 'small');
  CREATE TYPE "public"."enum_lab_pages_youtube_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_lab_pages_story_beats_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum_lab_pages_story_beats_story_scope" AS ENUM('overview', 'section', 'beat');
  CREATE TYPE "public"."enum_lab_pages_story_beats_variant" AS ENUM('default', 'small', 'lead');
  CREATE TYPE "public"."enum_lab_pages_story_beats_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___lab_pages_v_youtube_v_size" AS ENUM('full', 'inset', 'small');
  CREATE TYPE "public"."enum___lab_pages_v_youtube_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___lab_pages_v_story_beats_v_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum___lab_pages_v_story_beats_v_story_scope" AS ENUM('overview', 'section', 'beat');
  CREATE TYPE "public"."enum___lab_pages_v_story_beats_v_variant" AS ENUM('default', 'small', 'lead');
  CREATE TYPE "public"."enum___lab_pages_v_story_beats_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_expertise_pages_youtube_size" AS ENUM('full', 'inset', 'small');
  CREATE TYPE "public"."enum_expertise_pages_youtube_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___expertise_pages_v_youtube_v_size" AS ENUM('full', 'inset', 'small');
  CREATE TYPE "public"."enum___expertise_pages_v_youtube_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_audience_pages_youtube_size" AS ENUM('full', 'inset', 'small');
  CREATE TYPE "public"."enum_audience_pages_youtube_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___audience_pages_v_youtube_v_size" AS ENUM('full', 'inset', 'small');
  CREATE TYPE "public"."enum___audience_pages_v_youtube_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_home_youtube_size" AS ENUM('full', 'inset', 'small');
  CREATE TYPE "public"."enum_home_youtube_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___home_v_youtube_v_size" AS ENUM('full', 'inset', 'small');
  CREATE TYPE "public"."enum___home_v_youtube_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  ALTER TYPE "public"."enum_posts_visual_type" ADD VALUE 'lightLeak';
  ALTER TYPE "public"."enum__posts_v_version_visual_type" ADD VALUE 'lightLeak';
  CREATE TABLE "pages_youtube" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"url" varchar,
  	"title" varchar,
  	"size" "enum_pages_youtube_size" DEFAULT 'full',
  	"theme" "enum_pages_youtube_theme" DEFAULT 'light',
  	"block_name" varchar
  );
  
  CREATE TABLE "__pages_v_youtube_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"url" varchar,
  	"title" varchar,
  	"size" "enum___pages_v_youtube_v_size" DEFAULT 'full',
  	"theme" "enum___pages_v_youtube_v_theme" DEFAULT 'light',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "posts_youtube" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"url" varchar,
  	"title" varchar,
  	"size" "enum_posts_youtube_size" DEFAULT 'full',
  	"theme" "enum_posts_youtube_theme" DEFAULT 'light',
  	"block_name" varchar
  );
  
  CREATE TABLE "__posts_v_youtube_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"url" varchar,
  	"title" varchar,
  	"size" "enum___posts_v_youtube_v_size" DEFAULT 'full',
  	"theme" "enum___posts_v_youtube_v_theme" DEFAULT 'light',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "work_pages_story_beats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"source" "enum_work_pages_story_beats_source" DEFAULT 'custom',
  	"story_scope" "enum_work_pages_story_beats_story_scope" DEFAULT 'overview',
  	"story_beat_key" varchar,
  	"show_overrides" boolean DEFAULT false,
  	"body" jsonb,
  	"variant" "enum_work_pages_story_beats_variant" DEFAULT 'default',
  	"theme" "enum_work_pages_story_beats_theme" DEFAULT 'light',
  	"block_name" varchar
  );
  
  CREATE TABLE "__work_pages_v_story_beats_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"source" "enum___work_pages_v_story_beats_v_source" DEFAULT 'custom',
  	"story_scope" "enum___work_pages_v_story_beats_v_story_scope" DEFAULT 'overview',
  	"story_beat_key" varchar,
  	"show_overrides" boolean DEFAULT false,
  	"body" jsonb,
  	"variant" "enum___work_pages_v_story_beats_v_variant" DEFAULT 'default',
  	"theme" "enum___work_pages_v_story_beats_v_theme" DEFAULT 'light',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "lab_pages_youtube" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"url" varchar,
  	"title" varchar,
  	"size" "enum_lab_pages_youtube_size" DEFAULT 'full',
  	"theme" "enum_lab_pages_youtube_theme" DEFAULT 'light',
  	"block_name" varchar
  );
  
  CREATE TABLE "lab_pages_story_beats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"source" "enum_lab_pages_story_beats_source" DEFAULT 'custom',
  	"story_scope" "enum_lab_pages_story_beats_story_scope" DEFAULT 'overview',
  	"story_beat_key" varchar,
  	"show_overrides" boolean DEFAULT false,
  	"body" jsonb,
  	"variant" "enum_lab_pages_story_beats_variant" DEFAULT 'default',
  	"theme" "enum_lab_pages_story_beats_theme" DEFAULT 'light',
  	"block_name" varchar
  );
  
  CREATE TABLE "__lab_pages_v_youtube_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"url" varchar,
  	"title" varchar,
  	"size" "enum___lab_pages_v_youtube_v_size" DEFAULT 'full',
  	"theme" "enum___lab_pages_v_youtube_v_theme" DEFAULT 'light',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "__lab_pages_v_story_beats_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"source" "enum___lab_pages_v_story_beats_v_source" DEFAULT 'custom',
  	"story_scope" "enum___lab_pages_v_story_beats_v_story_scope" DEFAULT 'overview',
  	"story_beat_key" varchar,
  	"show_overrides" boolean DEFAULT false,
  	"body" jsonb,
  	"variant" "enum___lab_pages_v_story_beats_v_variant" DEFAULT 'default',
  	"theme" "enum___lab_pages_v_story_beats_v_theme" DEFAULT 'light',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "expertise_pages_youtube" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"url" varchar,
  	"title" varchar,
  	"size" "enum_expertise_pages_youtube_size" DEFAULT 'full',
  	"theme" "enum_expertise_pages_youtube_theme" DEFAULT 'light',
  	"block_name" varchar
  );
  
  CREATE TABLE "__expertise_pages_v_youtube_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"url" varchar,
  	"title" varchar,
  	"size" "enum___expertise_pages_v_youtube_v_size" DEFAULT 'full',
  	"theme" "enum___expertise_pages_v_youtube_v_theme" DEFAULT 'light',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "audience_pages_youtube" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"url" varchar,
  	"title" varchar,
  	"size" "enum_audience_pages_youtube_size" DEFAULT 'full',
  	"theme" "enum_audience_pages_youtube_theme" DEFAULT 'light',
  	"block_name" varchar
  );
  
  CREATE TABLE "__audience_pages_v_youtube_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"url" varchar,
  	"title" varchar,
  	"size" "enum___audience_pages_v_youtube_v_size" DEFAULT 'full',
  	"theme" "enum___audience_pages_v_youtube_v_theme" DEFAULT 'light',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "lab_projects_populated_authors" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar
  );
  
  CREATE TABLE "_lab_projects_v_version_populated_authors" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"name" varchar
  );
  
  CREATE TABLE "home_youtube" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"url" varchar,
  	"title" varchar,
  	"size" "enum_home_youtube_size" DEFAULT 'full',
  	"theme" "enum_home_youtube_theme" DEFAULT 'light',
  	"block_name" varchar
  );
  
  CREATE TABLE "__home_v_youtube_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"url" varchar,
  	"title" varchar,
  	"size" "enum___home_v_youtube_v_size" DEFAULT 'full',
  	"theme" "enum___home_v_youtube_v_theme" DEFAULT 'light',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "posts" ADD COLUMN "shader_bleed" boolean DEFAULT false;
  ALTER TABLE "posts" ADD COLUMN "shader_origin" "enum_posts_shader_origin" DEFAULT 'top-right';
  ALTER TABLE "posts" ADD COLUMN "shader_show_media" boolean DEFAULT false;
  ALTER TABLE "posts" ADD COLUMN "shader_hover_targets" "enum_leak_hover_targets";
  ALTER TABLE "posts" ADD COLUMN "shader_section_hover" numeric;
  ALTER TABLE "_posts_v" ADD COLUMN "version_shader_bleed" boolean DEFAULT false;
  ALTER TABLE "_posts_v" ADD COLUMN "version_shader_origin" "enum__posts_v_version_shader_origin" DEFAULT 'top-right';
  ALTER TABLE "_posts_v" ADD COLUMN "version_shader_show_media" boolean DEFAULT false;
  ALTER TABLE "_posts_v" ADD COLUMN "version_shader_hover_targets" "enum_leak_hover_targets";
  ALTER TABLE "_posts_v" ADD COLUMN "version_shader_section_hover" numeric;
  ALTER TABLE "lab_projects_rels" ADD COLUMN "users_id" integer;
  ALTER TABLE "_lab_projects_v_rels" ADD COLUMN "users_id" integer;
  ALTER TABLE "pages_youtube" ADD CONSTRAINT "pages_youtube_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__pages_v_youtube_v" ADD CONSTRAINT "__pages_v_youtube_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_youtube" ADD CONSTRAINT "posts_youtube_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__posts_v_youtube_v" ADD CONSTRAINT "__posts_v_youtube_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "work_pages_story_beats" ADD CONSTRAINT "work_pages_story_beats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."work_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__work_pages_v_story_beats_v" ADD CONSTRAINT "__work_pages_v_story_beats_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_work_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lab_pages_youtube" ADD CONSTRAINT "lab_pages_youtube_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lab_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lab_pages_story_beats" ADD CONSTRAINT "lab_pages_story_beats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lab_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__lab_pages_v_youtube_v" ADD CONSTRAINT "__lab_pages_v_youtube_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_lab_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__lab_pages_v_story_beats_v" ADD CONSTRAINT "__lab_pages_v_story_beats_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_lab_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "expertise_pages_youtube" ADD CONSTRAINT "expertise_pages_youtube_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."expertise_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__expertise_pages_v_youtube_v" ADD CONSTRAINT "__expertise_pages_v_youtube_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_expertise_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "audience_pages_youtube" ADD CONSTRAINT "audience_pages_youtube_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."audience_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__audience_pages_v_youtube_v" ADD CONSTRAINT "__audience_pages_v_youtube_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_audience_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lab_projects_populated_authors" ADD CONSTRAINT "lab_projects_populated_authors_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lab_projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_lab_projects_v_version_populated_authors" ADD CONSTRAINT "_lab_projects_v_version_populated_authors_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_lab_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_youtube" ADD CONSTRAINT "home_youtube_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__home_v_youtube_v" ADD CONSTRAINT "__home_v_youtube_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_youtube_order_idx" ON "pages_youtube" USING btree ("_order");
  CREATE INDEX "pages_youtube_parent_id_idx" ON "pages_youtube" USING btree ("_parent_id");
  CREATE INDEX "pages_youtube_path_idx" ON "pages_youtube" USING btree ("_path");
  CREATE INDEX "__pages_v_youtube_v_order_idx" ON "__pages_v_youtube_v" USING btree ("_order");
  CREATE INDEX "__pages_v_youtube_v_parent_id_idx" ON "__pages_v_youtube_v" USING btree ("_parent_id");
  CREATE INDEX "__pages_v_youtube_v_path_idx" ON "__pages_v_youtube_v" USING btree ("_path");
  CREATE INDEX "posts_youtube_order_idx" ON "posts_youtube" USING btree ("_order");
  CREATE INDEX "posts_youtube_parent_id_idx" ON "posts_youtube" USING btree ("_parent_id");
  CREATE INDEX "posts_youtube_path_idx" ON "posts_youtube" USING btree ("_path");
  CREATE INDEX "__posts_v_youtube_v_order_idx" ON "__posts_v_youtube_v" USING btree ("_order");
  CREATE INDEX "__posts_v_youtube_v_parent_id_idx" ON "__posts_v_youtube_v" USING btree ("_parent_id");
  CREATE INDEX "__posts_v_youtube_v_path_idx" ON "__posts_v_youtube_v" USING btree ("_path");
  CREATE INDEX "work_pages_story_beats_order_idx" ON "work_pages_story_beats" USING btree ("_order");
  CREATE INDEX "work_pages_story_beats_parent_id_idx" ON "work_pages_story_beats" USING btree ("_parent_id");
  CREATE INDEX "work_pages_story_beats_path_idx" ON "work_pages_story_beats" USING btree ("_path");
  CREATE INDEX "__work_pages_v_story_beats_v_order_idx" ON "__work_pages_v_story_beats_v" USING btree ("_order");
  CREATE INDEX "__work_pages_v_story_beats_v_parent_id_idx" ON "__work_pages_v_story_beats_v" USING btree ("_parent_id");
  CREATE INDEX "__work_pages_v_story_beats_v_path_idx" ON "__work_pages_v_story_beats_v" USING btree ("_path");
  CREATE INDEX "lab_pages_youtube_order_idx" ON "lab_pages_youtube" USING btree ("_order");
  CREATE INDEX "lab_pages_youtube_parent_id_idx" ON "lab_pages_youtube" USING btree ("_parent_id");
  CREATE INDEX "lab_pages_youtube_path_idx" ON "lab_pages_youtube" USING btree ("_path");
  CREATE INDEX "lab_pages_story_beats_order_idx" ON "lab_pages_story_beats" USING btree ("_order");
  CREATE INDEX "lab_pages_story_beats_parent_id_idx" ON "lab_pages_story_beats" USING btree ("_parent_id");
  CREATE INDEX "lab_pages_story_beats_path_idx" ON "lab_pages_story_beats" USING btree ("_path");
  CREATE INDEX "__lab_pages_v_youtube_v_order_idx" ON "__lab_pages_v_youtube_v" USING btree ("_order");
  CREATE INDEX "__lab_pages_v_youtube_v_parent_id_idx" ON "__lab_pages_v_youtube_v" USING btree ("_parent_id");
  CREATE INDEX "__lab_pages_v_youtube_v_path_idx" ON "__lab_pages_v_youtube_v" USING btree ("_path");
  CREATE INDEX "__lab_pages_v_story_beats_v_order_idx" ON "__lab_pages_v_story_beats_v" USING btree ("_order");
  CREATE INDEX "__lab_pages_v_story_beats_v_parent_id_idx" ON "__lab_pages_v_story_beats_v" USING btree ("_parent_id");
  CREATE INDEX "__lab_pages_v_story_beats_v_path_idx" ON "__lab_pages_v_story_beats_v" USING btree ("_path");
  CREATE INDEX "expertise_pages_youtube_order_idx" ON "expertise_pages_youtube" USING btree ("_order");
  CREATE INDEX "expertise_pages_youtube_parent_id_idx" ON "expertise_pages_youtube" USING btree ("_parent_id");
  CREATE INDEX "expertise_pages_youtube_path_idx" ON "expertise_pages_youtube" USING btree ("_path");
  CREATE INDEX "__expertise_pages_v_youtube_v_order_idx" ON "__expertise_pages_v_youtube_v" USING btree ("_order");
  CREATE INDEX "__expertise_pages_v_youtube_v_parent_id_idx" ON "__expertise_pages_v_youtube_v" USING btree ("_parent_id");
  CREATE INDEX "__expertise_pages_v_youtube_v_path_idx" ON "__expertise_pages_v_youtube_v" USING btree ("_path");
  CREATE INDEX "audience_pages_youtube_order_idx" ON "audience_pages_youtube" USING btree ("_order");
  CREATE INDEX "audience_pages_youtube_parent_id_idx" ON "audience_pages_youtube" USING btree ("_parent_id");
  CREATE INDEX "audience_pages_youtube_path_idx" ON "audience_pages_youtube" USING btree ("_path");
  CREATE INDEX "__audience_pages_v_youtube_v_order_idx" ON "__audience_pages_v_youtube_v" USING btree ("_order");
  CREATE INDEX "__audience_pages_v_youtube_v_parent_id_idx" ON "__audience_pages_v_youtube_v" USING btree ("_parent_id");
  CREATE INDEX "__audience_pages_v_youtube_v_path_idx" ON "__audience_pages_v_youtube_v" USING btree ("_path");
  CREATE INDEX "lab_projects_populated_authors_order_idx" ON "lab_projects_populated_authors" USING btree ("_order");
  CREATE INDEX "lab_projects_populated_authors_parent_id_idx" ON "lab_projects_populated_authors" USING btree ("_parent_id");
  CREATE INDEX "_lab_projects_v_version_populated_authors_order_idx" ON "_lab_projects_v_version_populated_authors" USING btree ("_order");
  CREATE INDEX "_lab_projects_v_version_populated_authors_parent_id_idx" ON "_lab_projects_v_version_populated_authors" USING btree ("_parent_id");
  CREATE INDEX "home_youtube_order_idx" ON "home_youtube" USING btree ("_order");
  CREATE INDEX "home_youtube_parent_id_idx" ON "home_youtube" USING btree ("_parent_id");
  CREATE INDEX "home_youtube_path_idx" ON "home_youtube" USING btree ("_path");
  CREATE INDEX "__home_v_youtube_v_order_idx" ON "__home_v_youtube_v" USING btree ("_order");
  CREATE INDEX "__home_v_youtube_v_parent_id_idx" ON "__home_v_youtube_v" USING btree ("_parent_id");
  CREATE INDEX "__home_v_youtube_v_path_idx" ON "__home_v_youtube_v" USING btree ("_path");
  ALTER TABLE "lab_projects_rels" ADD CONSTRAINT "lab_projects_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_lab_projects_v_rels" ADD CONSTRAINT "_lab_projects_v_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "lab_projects_rels_users_id_idx" ON "lab_projects_rels" USING btree ("users_id");
  CREATE INDEX "_lab_projects_v_rels_users_id_idx" ON "_lab_projects_v_rels" USING btree ("users_id");
  ALTER TABLE "lab_pages" DROP COLUMN "hero_layout";
  ALTER TABLE "_lab_pages_v" DROP COLUMN "version_hero_layout";
  DROP TYPE "public"."enum_lab_pages_hero_layout";
  DROP TYPE "public"."enum__lab_pages_v_version_hero_layout";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_lab_pages_hero_layout" AS ENUM('editorial-split', 'centered', 'immersive', 'media-led');
  CREATE TYPE "public"."enum__lab_pages_v_version_hero_layout" AS ENUM('editorial-split', 'centered', 'immersive', 'media-led');
  ALTER TABLE "pages_youtube" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__pages_v_youtube_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "posts_youtube" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__posts_v_youtube_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "work_pages_story_beats" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__work_pages_v_story_beats_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "lab_pages_youtube" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "lab_pages_story_beats" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__lab_pages_v_youtube_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__lab_pages_v_story_beats_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "expertise_pages_youtube" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__expertise_pages_v_youtube_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "audience_pages_youtube" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__audience_pages_v_youtube_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "lab_projects_populated_authors" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_lab_projects_v_version_populated_authors" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_youtube" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__home_v_youtube_v" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "pages_youtube" CASCADE;
  DROP TABLE "__pages_v_youtube_v" CASCADE;
  DROP TABLE "posts_youtube" CASCADE;
  DROP TABLE "__posts_v_youtube_v" CASCADE;
  DROP TABLE "work_pages_story_beats" CASCADE;
  DROP TABLE "__work_pages_v_story_beats_v" CASCADE;
  DROP TABLE "lab_pages_youtube" CASCADE;
  DROP TABLE "lab_pages_story_beats" CASCADE;
  DROP TABLE "__lab_pages_v_youtube_v" CASCADE;
  DROP TABLE "__lab_pages_v_story_beats_v" CASCADE;
  DROP TABLE "expertise_pages_youtube" CASCADE;
  DROP TABLE "__expertise_pages_v_youtube_v" CASCADE;
  DROP TABLE "audience_pages_youtube" CASCADE;
  DROP TABLE "__audience_pages_v_youtube_v" CASCADE;
  DROP TABLE "lab_projects_populated_authors" CASCADE;
  DROP TABLE "_lab_projects_v_version_populated_authors" CASCADE;
  DROP TABLE "home_youtube" CASCADE;
  DROP TABLE "__home_v_youtube_v" CASCADE;
  ALTER TABLE "lab_projects_rels" DROP CONSTRAINT "lab_projects_rels_users_fk";
  
  ALTER TABLE "_lab_projects_v_rels" DROP CONSTRAINT "_lab_projects_v_rels_users_fk";
  
  ALTER TABLE "posts" ALTER COLUMN "visual_type" SET DATA TYPE text;
  DROP TYPE "public"."enum_posts_visual_type";
  CREATE TYPE "public"."enum_posts_visual_type" AS ENUM('media', 'streakField');
  ALTER TABLE "posts" ALTER COLUMN "visual_type" SET DATA TYPE "public"."enum_posts_visual_type" USING "visual_type"::"public"."enum_posts_visual_type";
  ALTER TABLE "_posts_v" ALTER COLUMN "version_visual_type" SET DATA TYPE text;
  DROP TYPE "public"."enum__posts_v_version_visual_type";
  CREATE TYPE "public"."enum__posts_v_version_visual_type" AS ENUM('media', 'streakField');
  ALTER TABLE "_posts_v" ALTER COLUMN "version_visual_type" SET DATA TYPE "public"."enum__posts_v_version_visual_type" USING "version_visual_type"::"public"."enum__posts_v_version_visual_type";
  DROP INDEX "lab_projects_rels_users_id_idx";
  DROP INDEX "_lab_projects_v_rels_users_id_idx";
  ALTER TABLE "lab_pages" ADD COLUMN "hero_layout" "enum_lab_pages_hero_layout" DEFAULT 'editorial-split';
  ALTER TABLE "_lab_pages_v" ADD COLUMN "version_hero_layout" "enum__lab_pages_v_version_hero_layout" DEFAULT 'editorial-split';
  ALTER TABLE "posts" DROP COLUMN "shader_bleed";
  ALTER TABLE "posts" DROP COLUMN "shader_origin";
  ALTER TABLE "posts" DROP COLUMN "shader_show_media";
  ALTER TABLE "posts" DROP COLUMN "shader_hover_targets";
  ALTER TABLE "posts" DROP COLUMN "shader_section_hover";
  ALTER TABLE "_posts_v" DROP COLUMN "version_shader_bleed";
  ALTER TABLE "_posts_v" DROP COLUMN "version_shader_origin";
  ALTER TABLE "_posts_v" DROP COLUMN "version_shader_show_media";
  ALTER TABLE "_posts_v" DROP COLUMN "version_shader_hover_targets";
  ALTER TABLE "_posts_v" DROP COLUMN "version_shader_section_hover";
  ALTER TABLE "lab_projects_rels" DROP COLUMN "users_id";
  ALTER TABLE "_lab_projects_v_rels" DROP COLUMN "users_id";
  DROP TYPE "public"."enum_pages_youtube_size";
  DROP TYPE "public"."enum_pages_youtube_theme";
  DROP TYPE "public"."enum___pages_v_youtube_v_size";
  DROP TYPE "public"."enum___pages_v_youtube_v_theme";
  DROP TYPE "public"."enum_posts_youtube_size";
  DROP TYPE "public"."enum_posts_youtube_theme";
  DROP TYPE "public"."enum_posts_shader_origin";
  DROP TYPE "public"."enum___posts_v_youtube_v_size";
  DROP TYPE "public"."enum___posts_v_youtube_v_theme";
  DROP TYPE "public"."enum__posts_v_version_shader_origin";
  DROP TYPE "public"."enum_work_pages_story_beats_source";
  DROP TYPE "public"."enum_work_pages_story_beats_story_scope";
  DROP TYPE "public"."enum_work_pages_story_beats_variant";
  DROP TYPE "public"."enum_work_pages_story_beats_theme";
  DROP TYPE "public"."enum___work_pages_v_story_beats_v_source";
  DROP TYPE "public"."enum___work_pages_v_story_beats_v_story_scope";
  DROP TYPE "public"."enum___work_pages_v_story_beats_v_variant";
  DROP TYPE "public"."enum___work_pages_v_story_beats_v_theme";
  DROP TYPE "public"."enum_lab_pages_youtube_size";
  DROP TYPE "public"."enum_lab_pages_youtube_theme";
  DROP TYPE "public"."enum_lab_pages_story_beats_source";
  DROP TYPE "public"."enum_lab_pages_story_beats_story_scope";
  DROP TYPE "public"."enum_lab_pages_story_beats_variant";
  DROP TYPE "public"."enum_lab_pages_story_beats_theme";
  DROP TYPE "public"."enum___lab_pages_v_youtube_v_size";
  DROP TYPE "public"."enum___lab_pages_v_youtube_v_theme";
  DROP TYPE "public"."enum___lab_pages_v_story_beats_v_source";
  DROP TYPE "public"."enum___lab_pages_v_story_beats_v_story_scope";
  DROP TYPE "public"."enum___lab_pages_v_story_beats_v_variant";
  DROP TYPE "public"."enum___lab_pages_v_story_beats_v_theme";
  DROP TYPE "public"."enum_expertise_pages_youtube_size";
  DROP TYPE "public"."enum_expertise_pages_youtube_theme";
  DROP TYPE "public"."enum___expertise_pages_v_youtube_v_size";
  DROP TYPE "public"."enum___expertise_pages_v_youtube_v_theme";
  DROP TYPE "public"."enum_audience_pages_youtube_size";
  DROP TYPE "public"."enum_audience_pages_youtube_theme";
  DROP TYPE "public"."enum___audience_pages_v_youtube_v_size";
  DROP TYPE "public"."enum___audience_pages_v_youtube_v_theme";
  DROP TYPE "public"."enum_home_youtube_size";
  DROP TYPE "public"."enum_home_youtube_theme";
  DROP TYPE "public"."enum___home_v_youtube_v_size";
  DROP TYPE "public"."enum___home_v_youtube_v_theme";`)
}
