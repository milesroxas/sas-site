import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_streak_looks_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__streak_looks_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_streak_renders_kind" AS ENUM('publish', 'export');
  CREATE TYPE "public"."enum_streak_renders_state" AS ENUM('queued', 'rendering', 'complete', 'failed', 'cancelled');
  ALTER TYPE "public"."enum_payload_folders_folder_type" ADD VALUE 'streak-looks';
  CREATE TABLE "streak_looks" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"thumbnail_id" integer,
  	"archived" boolean DEFAULT false,
  	"recipe" jsonb DEFAULT '{"version":1,"seed":694,"deltas":{},"frame":150}'::jsonb,
  	"created_by_id" integer,
  	"updated_by_id" integer,
  	"folder_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_streak_looks_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "streak_looks_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "_streak_looks_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_description" varchar,
  	"version_thumbnail_id" integer,
  	"version_archived" boolean DEFAULT false,
  	"version_recipe" jsonb DEFAULT '{"version":1,"seed":694,"deltas":{},"frame":150}'::jsonb,
  	"version_created_by_id" integer,
  	"version_updated_by_id" integer,
  	"version_folder_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__streak_looks_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_streak_looks_v_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "streak_releases" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"look_id" integer NOT NULL,
  	"source_hash" varchar NOT NULL,
  	"release_key" varchar NOT NULL,
  	"snapshot" jsonb NOT NULL,
  	"posters" jsonb NOT NULL,
  	"dark_poster_id" integer NOT NULL,
  	"light_poster_id" integer NOT NULL,
  	"published_by_id" integer,
  	"capture_build" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "streak_renders" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"look_id" integer NOT NULL,
  	"kind" "enum_streak_renders_kind" NOT NULL,
  	"state" "enum_streak_renders_state" DEFAULT 'queued' NOT NULL,
  	"source_hash" varchar NOT NULL,
  	"snapshot" jsonb NOT NULL,
  	"capture" jsonb NOT NULL,
  	"requested_by_id" integer NOT NULL,
  	"attempts" numeric DEFAULT 0,
  	"lease" varchar,
  	"lease_expires" timestamp(3) with time zone,
  	"error" varchar,
  	"release_id" integer,
  	"output_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  DROP INDEX "_pages_v_version_menu_preview_shader_version_menu_previe_idx";
  DROP INDEX "_work_pages_v_version_menu_preview_shader_version_menu_p_idx";
  DROP INDEX "expertise_pages_menu_preview_shader_menu_preview_shader__idx";
  DROP INDEX "_expertise_pages_v_blocks_feature_tabs_tabs_shader_shade_idx";
  DROP INDEX "_expertise_pages_v_version_hero_shader_version_hero_shad_idx";
  DROP INDEX "_expertise_pages_v_version_menu_preview_shader_version_m_idx";
  DROP INDEX "_audience_pages_v_blocks_feature_tabs_tabs_shader_shader_idx";
  DROP INDEX "_audience_pages_v_version_hero_shader_version_hero_shade_idx";
  DROP INDEX "_audience_pages_v_version_menu_preview_shader_version_me_idx";
  DROP INDEX "_contact_pages_v_version_menu_preview_shader_version_men_idx";
  DROP INDEX "_insights_index_v_version_hero_shader_version_hero_shade_idx";
  DROP INDEX "_insights_index_v_version_menu_preview_shader_version_me_idx";
  DROP INDEX "_works_index_v_version_menu_preview_shader_version_menu__idx";
  ALTER TABLE "pages_full_media" ADD COLUMN "shader_release_id" integer;
  ALTER TABLE "pages_media_split" ADD COLUMN "shader_release_id" integer;
  ALTER TABLE "pages_split_narrow" ADD COLUMN "shader_release_id" integer;
  ALTER TABLE "pages_blocks_feature_tabs_tabs" ADD COLUMN "shader_release_id" integer;
  ALTER TABLE "pages_aud_tabs_tabs" ADD COLUMN "shader_release_id" integer;
  ALTER TABLE "pages" ADD COLUMN "hero_shader_release_id" integer;
  ALTER TABLE "pages" ADD COLUMN "menu_preview_shader_release_id" integer;
  ALTER TABLE "__pages_v_full_media_v" ADD COLUMN "shader_release_id" integer;
  ALTER TABLE "__pages_v_media_split_v" ADD COLUMN "shader_release_id" integer;
  ALTER TABLE "__pages_v_split_narrow_v" ADD COLUMN "shader_release_id" integer;
  ALTER TABLE "_pages_v_blocks_feature_tabs_tabs" ADD COLUMN "shader_release_id" integer;
  ALTER TABLE "__pages_v_aud_tabs_v_tabs" ADD COLUMN "shader_release_id" integer;
  ALTER TABLE "_pages_v" ADD COLUMN "version_hero_shader_release_id" integer;
  ALTER TABLE "_pages_v" ADD COLUMN "version_menu_preview_shader_release_id" integer;
  ALTER TABLE "posts_full_media" ADD COLUMN "shader_release_id" integer;
  ALTER TABLE "posts_media_split" ADD COLUMN "shader_release_id" integer;
  ALTER TABLE "posts_split_narrow" ADD COLUMN "shader_release_id" integer;
  ALTER TABLE "posts_blocks_feature_tabs_tabs" ADD COLUMN "shader_release_id" integer;
  ALTER TABLE "posts" ADD COLUMN "shader_release_id" integer;
  ALTER TABLE "__posts_v_full_media_v" ADD COLUMN "shader_release_id" integer;
  ALTER TABLE "__posts_v_media_split_v" ADD COLUMN "shader_release_id" integer;
  ALTER TABLE "__posts_v_split_narrow_v" ADD COLUMN "shader_release_id" integer;
  ALTER TABLE "_posts_v_blocks_feature_tabs_tabs" ADD COLUMN "shader_release_id" integer;
  ALTER TABLE "_posts_v" ADD COLUMN "version_shader_release_id" integer;
  ALTER TABLE "work_pages_full_media" ADD COLUMN "shader_release_id" integer;
  ALTER TABLE "work_pages_media_split" ADD COLUMN "shader_release_id" integer;
  ALTER TABLE "work_pages_split_narrow" ADD COLUMN "shader_release_id" integer;
  ALTER TABLE "work_pages_blocks_feature_tabs_tabs" ADD COLUMN "shader_release_id" integer;
  ALTER TABLE "work_pages_aud_tabs_tabs" ADD COLUMN "shader_release_id" integer;
  ALTER TABLE "work_pages" ADD COLUMN "hero_shader_release_id" integer;
  ALTER TABLE "work_pages" ADD COLUMN "menu_preview_shader_release_id" integer;
  ALTER TABLE "__work_pages_v_full_media_v" ADD COLUMN "shader_release_id" integer;
  ALTER TABLE "__work_pages_v_media_split_v" ADD COLUMN "shader_release_id" integer;
  ALTER TABLE "__work_pages_v_split_narrow_v" ADD COLUMN "shader_release_id" integer;
  ALTER TABLE "_work_pages_v_blocks_feature_tabs_tabs" ADD COLUMN "shader_release_id" integer;
  ALTER TABLE "__work_pages_v_aud_tabs_v_tabs" ADD COLUMN "shader_release_id" integer;
  ALTER TABLE "_work_pages_v" ADD COLUMN "version_hero_shader_release_id" integer;
  ALTER TABLE "_work_pages_v" ADD COLUMN "version_menu_preview_shader_release_id" integer;
  ALTER TABLE "lab_pages_full_media" ADD COLUMN "shader_release_id" integer;
  ALTER TABLE "lab_pages_media_split" ADD COLUMN "shader_release_id" integer;
  ALTER TABLE "lab_pages_split_narrow" ADD COLUMN "shader_release_id" integer;
  ALTER TABLE "lab_pages_blocks_feature_tabs_tabs" ADD COLUMN "shader_release_id" integer;
  ALTER TABLE "lab_pages" ADD COLUMN "hero_shader_release_id" integer;
  ALTER TABLE "__lab_pages_v_full_media_v" ADD COLUMN "shader_release_id" integer;
  ALTER TABLE "__lab_pages_v_media_split_v" ADD COLUMN "shader_release_id" integer;
  ALTER TABLE "__lab_pages_v_split_narrow_v" ADD COLUMN "shader_release_id" integer;
  ALTER TABLE "_lab_pages_v_blocks_feature_tabs_tabs" ADD COLUMN "shader_release_id" integer;
  ALTER TABLE "_lab_pages_v" ADD COLUMN "version_hero_shader_release_id" integer;
  ALTER TABLE "expertise_pages_full_media" ADD COLUMN "shader_release_id" integer;
  ALTER TABLE "expertise_pages_media_split" ADD COLUMN "shader_release_id" integer;
  ALTER TABLE "expertise_pages_split_narrow" ADD COLUMN "shader_release_id" integer;
  ALTER TABLE "expertise_pages_blocks_feature_tabs_tabs" ADD COLUMN "shader_release_id" integer;
  ALTER TABLE "expertise_pages_aud_tabs_tabs" ADD COLUMN "shader_release_id" integer;
  ALTER TABLE "expertise_pages" ADD COLUMN "hero_shader_release_id" integer;
  ALTER TABLE "expertise_pages" ADD COLUMN "menu_preview_shader_release_id" integer;
  ALTER TABLE "__expertise_pages_v_full_media_v" ADD COLUMN "shader_release_id" integer;
  ALTER TABLE "__expertise_pages_v_media_split_v" ADD COLUMN "shader_release_id" integer;
  ALTER TABLE "__expertise_pages_v_split_narrow_v" ADD COLUMN "shader_release_id" integer;
  ALTER TABLE "_expertise_pages_v_blocks_feature_tabs_tabs" ADD COLUMN "shader_release_id" integer;
  ALTER TABLE "__expertise_pages_v_aud_tabs_v_tabs" ADD COLUMN "shader_release_id" integer;
  ALTER TABLE "_expertise_pages_v" ADD COLUMN "version_hero_shader_release_id" integer;
  ALTER TABLE "_expertise_pages_v" ADD COLUMN "version_menu_preview_shader_release_id" integer;
  ALTER TABLE "audience_pages_full_media" ADD COLUMN "shader_release_id" integer;
  ALTER TABLE "audience_pages_media_split" ADD COLUMN "shader_release_id" integer;
  ALTER TABLE "audience_pages_split_narrow" ADD COLUMN "shader_release_id" integer;
  ALTER TABLE "audience_pages_blocks_feature_tabs_tabs" ADD COLUMN "shader_release_id" integer;
  ALTER TABLE "audience_pages_aud_tabs_tabs" ADD COLUMN "shader_release_id" integer;
  ALTER TABLE "audience_pages" ADD COLUMN "hero_shader_release_id" integer;
  ALTER TABLE "audience_pages" ADD COLUMN "menu_preview_shader_release_id" integer;
  ALTER TABLE "__audience_pages_v_full_media_v" ADD COLUMN "shader_release_id" integer;
  ALTER TABLE "__audience_pages_v_media_split_v" ADD COLUMN "shader_release_id" integer;
  ALTER TABLE "__audience_pages_v_split_narrow_v" ADD COLUMN "shader_release_id" integer;
  ALTER TABLE "_audience_pages_v_blocks_feature_tabs_tabs" ADD COLUMN "shader_release_id" integer;
  ALTER TABLE "__audience_pages_v_aud_tabs_v_tabs" ADD COLUMN "shader_release_id" integer;
  ALTER TABLE "_audience_pages_v" ADD COLUMN "version_hero_shader_release_id" integer;
  ALTER TABLE "_audience_pages_v" ADD COLUMN "version_menu_preview_shader_release_id" integer;
  ALTER TABLE "contact_pages" ADD COLUMN "menu_preview_shader_release_id" integer;
  ALTER TABLE "_contact_pages_v" ADD COLUMN "version_menu_preview_shader_release_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "streak_looks_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "streak_releases_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "streak_renders_id" integer;
  ALTER TABLE "home_full_media" ADD COLUMN "shader_release_id" integer;
  ALTER TABLE "home_media_split" ADD COLUMN "shader_release_id" integer;
  ALTER TABLE "home_split_narrow" ADD COLUMN "shader_release_id" integer;
  ALTER TABLE "home_blocks_feature_tabs_tabs" ADD COLUMN "shader_release_id" integer;
  ALTER TABLE "home_aud_tabs_tabs" ADD COLUMN "shader_release_id" integer;
  ALTER TABLE "home" ADD COLUMN "hero_shader_release_id" integer;
  ALTER TABLE "__home_v_full_media_v" ADD COLUMN "shader_release_id" integer;
  ALTER TABLE "__home_v_media_split_v" ADD COLUMN "shader_release_id" integer;
  ALTER TABLE "__home_v_split_narrow_v" ADD COLUMN "shader_release_id" integer;
  ALTER TABLE "_home_v_blocks_feature_tabs_tabs" ADD COLUMN "shader_release_id" integer;
  ALTER TABLE "__home_v_aud_tabs_v_tabs" ADD COLUMN "shader_release_id" integer;
  ALTER TABLE "_home_v" ADD COLUMN "version_hero_shader_release_id" integer;
  ALTER TABLE "insights_index" ADD COLUMN "hero_shader_release_id" integer;
  ALTER TABLE "insights_index" ADD COLUMN "menu_preview_shader_release_id" integer;
  ALTER TABLE "_insights_index_v" ADD COLUMN "version_hero_shader_release_id" integer;
  ALTER TABLE "_insights_index_v" ADD COLUMN "version_menu_preview_shader_release_id" integer;
  ALTER TABLE "works_index" ADD COLUMN "hero_shader_release_id" integer;
  ALTER TABLE "works_index" ADD COLUMN "menu_preview_shader_release_id" integer;
  ALTER TABLE "_works_index_v" ADD COLUMN "version_hero_shader_release_id" integer;
  ALTER TABLE "_works_index_v" ADD COLUMN "version_menu_preview_shader_release_id" integer;
  ALTER TABLE "streak_looks" ADD CONSTRAINT "streak_looks_thumbnail_id_media_id_fk" FOREIGN KEY ("thumbnail_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "streak_looks" ADD CONSTRAINT "streak_looks_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "streak_looks" ADD CONSTRAINT "streak_looks_updated_by_id_users_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "streak_looks" ADD CONSTRAINT "streak_looks_folder_id_payload_folders_id_fk" FOREIGN KEY ("folder_id") REFERENCES "public"."payload_folders"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "streak_looks_texts" ADD CONSTRAINT "streak_looks_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."streak_looks"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_streak_looks_v" ADD CONSTRAINT "_streak_looks_v_parent_id_streak_looks_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_streak_looks_v" ADD CONSTRAINT "_streak_looks_v_version_thumbnail_id_media_id_fk" FOREIGN KEY ("version_thumbnail_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_streak_looks_v" ADD CONSTRAINT "_streak_looks_v_version_created_by_id_users_id_fk" FOREIGN KEY ("version_created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_streak_looks_v" ADD CONSTRAINT "_streak_looks_v_version_updated_by_id_users_id_fk" FOREIGN KEY ("version_updated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_streak_looks_v" ADD CONSTRAINT "_streak_looks_v_version_folder_id_payload_folders_id_fk" FOREIGN KEY ("version_folder_id") REFERENCES "public"."payload_folders"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_streak_looks_v_texts" ADD CONSTRAINT "_streak_looks_v_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_streak_looks_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "streak_releases" ADD CONSTRAINT "streak_releases_look_id_streak_looks_id_fk" FOREIGN KEY ("look_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "streak_releases" ADD CONSTRAINT "streak_releases_dark_poster_id_media_id_fk" FOREIGN KEY ("dark_poster_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "streak_releases" ADD CONSTRAINT "streak_releases_light_poster_id_media_id_fk" FOREIGN KEY ("light_poster_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "streak_releases" ADD CONSTRAINT "streak_releases_published_by_id_users_id_fk" FOREIGN KEY ("published_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "streak_renders" ADD CONSTRAINT "streak_renders_look_id_streak_looks_id_fk" FOREIGN KEY ("look_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "streak_renders" ADD CONSTRAINT "streak_renders_requested_by_id_users_id_fk" FOREIGN KEY ("requested_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "streak_renders" ADD CONSTRAINT "streak_renders_release_id_streak_releases_id_fk" FOREIGN KEY ("release_id") REFERENCES "public"."streak_releases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "streak_renders" ADD CONSTRAINT "streak_renders_output_id_media_id_fk" FOREIGN KEY ("output_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "streak_looks_title_idx" ON "streak_looks" USING btree ("title");
  CREATE INDEX "streak_looks_thumbnail_idx" ON "streak_looks" USING btree ("thumbnail_id");
  CREATE INDEX "streak_looks_archived_idx" ON "streak_looks" USING btree ("archived");
  CREATE INDEX "streak_looks_created_by_idx" ON "streak_looks" USING btree ("created_by_id");
  CREATE INDEX "streak_looks_updated_by_idx" ON "streak_looks" USING btree ("updated_by_id");
  CREATE INDEX "streak_looks_folder_idx" ON "streak_looks" USING btree ("folder_id");
  CREATE INDEX "streak_looks_updated_at_idx" ON "streak_looks" USING btree ("updated_at");
  CREATE INDEX "streak_looks_created_at_idx" ON "streak_looks" USING btree ("created_at");
  CREATE INDEX "streak_looks__status_idx" ON "streak_looks" USING btree ("_status");
  CREATE INDEX "streak_looks_texts_order_parent" ON "streak_looks_texts" USING btree ("order","parent_id");
  CREATE INDEX "streak_looks_texts_text_idx" ON "streak_looks_texts" USING btree ("text");
  CREATE INDEX "_streak_looks_v_parent_idx" ON "_streak_looks_v" USING btree ("parent_id");
  CREATE INDEX "_streak_looks_v_version_version_title_idx" ON "_streak_looks_v" USING btree ("version_title");
  CREATE INDEX "_streak_looks_v_version_version_thumbnail_idx" ON "_streak_looks_v" USING btree ("version_thumbnail_id");
  CREATE INDEX "_streak_looks_v_version_version_archived_idx" ON "_streak_looks_v" USING btree ("version_archived");
  CREATE INDEX "_streak_looks_v_version_version_created_by_idx" ON "_streak_looks_v" USING btree ("version_created_by_id");
  CREATE INDEX "_streak_looks_v_version_version_updated_by_idx" ON "_streak_looks_v" USING btree ("version_updated_by_id");
  CREATE INDEX "_streak_looks_v_version_version_folder_idx" ON "_streak_looks_v" USING btree ("version_folder_id");
  CREATE INDEX "_streak_looks_v_version_version_updated_at_idx" ON "_streak_looks_v" USING btree ("version_updated_at");
  CREATE INDEX "_streak_looks_v_version_version_created_at_idx" ON "_streak_looks_v" USING btree ("version_created_at");
  CREATE INDEX "_streak_looks_v_version_version__status_idx" ON "_streak_looks_v" USING btree ("version__status");
  CREATE INDEX "_streak_looks_v_created_at_idx" ON "_streak_looks_v" USING btree ("created_at");
  CREATE INDEX "_streak_looks_v_updated_at_idx" ON "_streak_looks_v" USING btree ("updated_at");
  CREATE INDEX "_streak_looks_v_latest_idx" ON "_streak_looks_v" USING btree ("latest");
  CREATE INDEX "_streak_looks_v_autosave_idx" ON "_streak_looks_v" USING btree ("autosave");
  CREATE INDEX "_streak_looks_v_texts_order_parent" ON "_streak_looks_v_texts" USING btree ("order","parent_id");
  CREATE INDEX "streak_releases_look_idx" ON "streak_releases" USING btree ("look_id");
  CREATE INDEX "streak_releases_source_hash_idx" ON "streak_releases" USING btree ("source_hash");
  CREATE UNIQUE INDEX "streak_releases_release_key_idx" ON "streak_releases" USING btree ("release_key");
  CREATE INDEX "streak_releases_dark_poster_idx" ON "streak_releases" USING btree ("dark_poster_id");
  CREATE INDEX "streak_releases_light_poster_idx" ON "streak_releases" USING btree ("light_poster_id");
  CREATE INDEX "streak_releases_published_by_idx" ON "streak_releases" USING btree ("published_by_id");
  CREATE INDEX "streak_releases_updated_at_idx" ON "streak_releases" USING btree ("updated_at");
  CREATE INDEX "streak_releases_created_at_idx" ON "streak_releases" USING btree ("created_at");
  CREATE INDEX "streak_renders_look_idx" ON "streak_renders" USING btree ("look_id");
  CREATE INDEX "streak_renders_state_idx" ON "streak_renders" USING btree ("state");
  CREATE INDEX "streak_renders_requested_by_idx" ON "streak_renders" USING btree ("requested_by_id");
  CREATE INDEX "streak_renders_release_idx" ON "streak_renders" USING btree ("release_id");
  CREATE INDEX "streak_renders_output_idx" ON "streak_renders" USING btree ("output_id");
  CREATE INDEX "streak_renders_updated_at_idx" ON "streak_renders" USING btree ("updated_at");
  CREATE INDEX "streak_renders_created_at_idx" ON "streak_renders" USING btree ("created_at");
  ALTER TABLE "pages_full_media" ADD CONSTRAINT "pages_full_media_shader_release_id_streak_releases_id_fk" FOREIGN KEY ("shader_release_id") REFERENCES "public"."streak_releases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_media_split" ADD CONSTRAINT "pages_media_split_shader_release_id_streak_releases_id_fk" FOREIGN KEY ("shader_release_id") REFERENCES "public"."streak_releases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_split_narrow" ADD CONSTRAINT "pages_split_narrow_shader_release_id_streak_releases_id_fk" FOREIGN KEY ("shader_release_id") REFERENCES "public"."streak_releases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_feature_tabs_tabs" ADD CONSTRAINT "pages_blocks_feature_tabs_tabs_shader_release_id_streak_releases_id_fk" FOREIGN KEY ("shader_release_id") REFERENCES "public"."streak_releases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_aud_tabs_tabs" ADD CONSTRAINT "pages_aud_tabs_tabs_shader_release_id_streak_releases_id_fk" FOREIGN KEY ("shader_release_id") REFERENCES "public"."streak_releases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_hero_shader_release_id_streak_releases_id_fk" FOREIGN KEY ("hero_shader_release_id") REFERENCES "public"."streak_releases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_menu_preview_shader_release_id_streak_releases_id_fk" FOREIGN KEY ("menu_preview_shader_release_id") REFERENCES "public"."streak_releases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__pages_v_full_media_v" ADD CONSTRAINT "__pages_v_full_media_v_shader_release_id_streak_releases_id_fk" FOREIGN KEY ("shader_release_id") REFERENCES "public"."streak_releases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__pages_v_media_split_v" ADD CONSTRAINT "__pages_v_media_split_v_shader_release_id_streak_releases_id_fk" FOREIGN KEY ("shader_release_id") REFERENCES "public"."streak_releases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__pages_v_split_narrow_v" ADD CONSTRAINT "__pages_v_split_narrow_v_shader_release_id_streak_releases_id_fk" FOREIGN KEY ("shader_release_id") REFERENCES "public"."streak_releases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_feature_tabs_tabs" ADD CONSTRAINT "_pages_v_blocks_feature_tabs_tabs_shader_release_id_streak_releases_id_fk" FOREIGN KEY ("shader_release_id") REFERENCES "public"."streak_releases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__pages_v_aud_tabs_v_tabs" ADD CONSTRAINT "__pages_v_aud_tabs_v_tabs_shader_release_id_streak_releases_id_fk" FOREIGN KEY ("shader_release_id") REFERENCES "public"."streak_releases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_hero_shader_release_id_streak_releases_id_fk" FOREIGN KEY ("version_hero_shader_release_id") REFERENCES "public"."streak_releases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_menu_preview_shader_release_id_streak_releases_id_fk" FOREIGN KEY ("version_menu_preview_shader_release_id") REFERENCES "public"."streak_releases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_full_media" ADD CONSTRAINT "posts_full_media_shader_release_id_streak_releases_id_fk" FOREIGN KEY ("shader_release_id") REFERENCES "public"."streak_releases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_media_split" ADD CONSTRAINT "posts_media_split_shader_release_id_streak_releases_id_fk" FOREIGN KEY ("shader_release_id") REFERENCES "public"."streak_releases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_split_narrow" ADD CONSTRAINT "posts_split_narrow_shader_release_id_streak_releases_id_fk" FOREIGN KEY ("shader_release_id") REFERENCES "public"."streak_releases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_feature_tabs_tabs" ADD CONSTRAINT "posts_blocks_feature_tabs_tabs_shader_release_id_streak_releases_id_fk" FOREIGN KEY ("shader_release_id") REFERENCES "public"."streak_releases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_shader_release_id_streak_releases_id_fk" FOREIGN KEY ("shader_release_id") REFERENCES "public"."streak_releases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__posts_v_full_media_v" ADD CONSTRAINT "__posts_v_full_media_v_shader_release_id_streak_releases_id_fk" FOREIGN KEY ("shader_release_id") REFERENCES "public"."streak_releases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__posts_v_media_split_v" ADD CONSTRAINT "__posts_v_media_split_v_shader_release_id_streak_releases_id_fk" FOREIGN KEY ("shader_release_id") REFERENCES "public"."streak_releases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__posts_v_split_narrow_v" ADD CONSTRAINT "__posts_v_split_narrow_v_shader_release_id_streak_releases_id_fk" FOREIGN KEY ("shader_release_id") REFERENCES "public"."streak_releases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_feature_tabs_tabs" ADD CONSTRAINT "_posts_v_blocks_feature_tabs_tabs_shader_release_id_streak_releases_id_fk" FOREIGN KEY ("shader_release_id") REFERENCES "public"."streak_releases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_shader_release_id_streak_releases_id_fk" FOREIGN KEY ("version_shader_release_id") REFERENCES "public"."streak_releases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "work_pages_full_media" ADD CONSTRAINT "work_pages_full_media_shader_release_id_streak_releases_id_fk" FOREIGN KEY ("shader_release_id") REFERENCES "public"."streak_releases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "work_pages_media_split" ADD CONSTRAINT "work_pages_media_split_shader_release_id_streak_releases_id_fk" FOREIGN KEY ("shader_release_id") REFERENCES "public"."streak_releases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "work_pages_split_narrow" ADD CONSTRAINT "work_pages_split_narrow_shader_release_id_streak_releases_id_fk" FOREIGN KEY ("shader_release_id") REFERENCES "public"."streak_releases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "work_pages_blocks_feature_tabs_tabs" ADD CONSTRAINT "work_pages_blocks_feature_tabs_tabs_shader_release_id_streak_releases_id_fk" FOREIGN KEY ("shader_release_id") REFERENCES "public"."streak_releases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "work_pages_aud_tabs_tabs" ADD CONSTRAINT "work_pages_aud_tabs_tabs_shader_release_id_streak_releases_id_fk" FOREIGN KEY ("shader_release_id") REFERENCES "public"."streak_releases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "work_pages" ADD CONSTRAINT "work_pages_hero_shader_release_id_streak_releases_id_fk" FOREIGN KEY ("hero_shader_release_id") REFERENCES "public"."streak_releases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "work_pages" ADD CONSTRAINT "work_pages_menu_preview_shader_release_id_streak_releases_id_fk" FOREIGN KEY ("menu_preview_shader_release_id") REFERENCES "public"."streak_releases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__work_pages_v_full_media_v" ADD CONSTRAINT "__work_pages_v_full_media_v_shader_release_id_streak_releases_id_fk" FOREIGN KEY ("shader_release_id") REFERENCES "public"."streak_releases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__work_pages_v_media_split_v" ADD CONSTRAINT "__work_pages_v_media_split_v_shader_release_id_streak_releases_id_fk" FOREIGN KEY ("shader_release_id") REFERENCES "public"."streak_releases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__work_pages_v_split_narrow_v" ADD CONSTRAINT "__work_pages_v_split_narrow_v_shader_release_id_streak_releases_id_fk" FOREIGN KEY ("shader_release_id") REFERENCES "public"."streak_releases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_work_pages_v_blocks_feature_tabs_tabs" ADD CONSTRAINT "_work_pages_v_blocks_feature_tabs_tabs_shader_release_id_streak_releases_id_fk" FOREIGN KEY ("shader_release_id") REFERENCES "public"."streak_releases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__work_pages_v_aud_tabs_v_tabs" ADD CONSTRAINT "__work_pages_v_aud_tabs_v_tabs_shader_release_id_streak_releases_id_fk" FOREIGN KEY ("shader_release_id") REFERENCES "public"."streak_releases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_work_pages_v" ADD CONSTRAINT "_work_pages_v_version_hero_shader_release_id_streak_releases_id_fk" FOREIGN KEY ("version_hero_shader_release_id") REFERENCES "public"."streak_releases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_work_pages_v" ADD CONSTRAINT "_work_pages_v_version_menu_preview_shader_release_id_streak_releases_id_fk" FOREIGN KEY ("version_menu_preview_shader_release_id") REFERENCES "public"."streak_releases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "lab_pages_full_media" ADD CONSTRAINT "lab_pages_full_media_shader_release_id_streak_releases_id_fk" FOREIGN KEY ("shader_release_id") REFERENCES "public"."streak_releases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "lab_pages_media_split" ADD CONSTRAINT "lab_pages_media_split_shader_release_id_streak_releases_id_fk" FOREIGN KEY ("shader_release_id") REFERENCES "public"."streak_releases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "lab_pages_split_narrow" ADD CONSTRAINT "lab_pages_split_narrow_shader_release_id_streak_releases_id_fk" FOREIGN KEY ("shader_release_id") REFERENCES "public"."streak_releases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "lab_pages_blocks_feature_tabs_tabs" ADD CONSTRAINT "lab_pages_blocks_feature_tabs_tabs_shader_release_id_streak_releases_id_fk" FOREIGN KEY ("shader_release_id") REFERENCES "public"."streak_releases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "lab_pages" ADD CONSTRAINT "lab_pages_hero_shader_release_id_streak_releases_id_fk" FOREIGN KEY ("hero_shader_release_id") REFERENCES "public"."streak_releases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__lab_pages_v_full_media_v" ADD CONSTRAINT "__lab_pages_v_full_media_v_shader_release_id_streak_releases_id_fk" FOREIGN KEY ("shader_release_id") REFERENCES "public"."streak_releases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__lab_pages_v_media_split_v" ADD CONSTRAINT "__lab_pages_v_media_split_v_shader_release_id_streak_releases_id_fk" FOREIGN KEY ("shader_release_id") REFERENCES "public"."streak_releases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__lab_pages_v_split_narrow_v" ADD CONSTRAINT "__lab_pages_v_split_narrow_v_shader_release_id_streak_releases_id_fk" FOREIGN KEY ("shader_release_id") REFERENCES "public"."streak_releases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_lab_pages_v_blocks_feature_tabs_tabs" ADD CONSTRAINT "_lab_pages_v_blocks_feature_tabs_tabs_shader_release_id_streak_releases_id_fk" FOREIGN KEY ("shader_release_id") REFERENCES "public"."streak_releases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_lab_pages_v" ADD CONSTRAINT "_lab_pages_v_version_hero_shader_release_id_streak_releases_id_fk" FOREIGN KEY ("version_hero_shader_release_id") REFERENCES "public"."streak_releases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "expertise_pages_full_media" ADD CONSTRAINT "expertise_pages_full_media_shader_release_id_streak_releases_id_fk" FOREIGN KEY ("shader_release_id") REFERENCES "public"."streak_releases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "expertise_pages_media_split" ADD CONSTRAINT "expertise_pages_media_split_shader_release_id_streak_releases_id_fk" FOREIGN KEY ("shader_release_id") REFERENCES "public"."streak_releases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "expertise_pages_split_narrow" ADD CONSTRAINT "expertise_pages_split_narrow_shader_release_id_streak_releases_id_fk" FOREIGN KEY ("shader_release_id") REFERENCES "public"."streak_releases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "expertise_pages_blocks_feature_tabs_tabs" ADD CONSTRAINT "expertise_pages_blocks_feature_tabs_tabs_shader_release_id_streak_releases_id_fk" FOREIGN KEY ("shader_release_id") REFERENCES "public"."streak_releases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "expertise_pages_aud_tabs_tabs" ADD CONSTRAINT "expertise_pages_aud_tabs_tabs_shader_release_id_streak_releases_id_fk" FOREIGN KEY ("shader_release_id") REFERENCES "public"."streak_releases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "expertise_pages" ADD CONSTRAINT "expertise_pages_hero_shader_release_id_streak_releases_id_fk" FOREIGN KEY ("hero_shader_release_id") REFERENCES "public"."streak_releases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "expertise_pages" ADD CONSTRAINT "expertise_pages_menu_preview_shader_release_id_streak_releases_id_fk" FOREIGN KEY ("menu_preview_shader_release_id") REFERENCES "public"."streak_releases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__expertise_pages_v_full_media_v" ADD CONSTRAINT "__expertise_pages_v_full_media_v_shader_release_id_streak_releases_id_fk" FOREIGN KEY ("shader_release_id") REFERENCES "public"."streak_releases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__expertise_pages_v_media_split_v" ADD CONSTRAINT "__expertise_pages_v_media_split_v_shader_release_id_streak_releases_id_fk" FOREIGN KEY ("shader_release_id") REFERENCES "public"."streak_releases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__expertise_pages_v_split_narrow_v" ADD CONSTRAINT "__expertise_pages_v_split_narrow_v_shader_release_id_streak_releases_id_fk" FOREIGN KEY ("shader_release_id") REFERENCES "public"."streak_releases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_expertise_pages_v_blocks_feature_tabs_tabs" ADD CONSTRAINT "_expertise_pages_v_blocks_feature_tabs_tabs_shader_release_id_streak_releases_id_fk" FOREIGN KEY ("shader_release_id") REFERENCES "public"."streak_releases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__expertise_pages_v_aud_tabs_v_tabs" ADD CONSTRAINT "__expertise_pages_v_aud_tabs_v_tabs_shader_release_id_streak_releases_id_fk" FOREIGN KEY ("shader_release_id") REFERENCES "public"."streak_releases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_expertise_pages_v" ADD CONSTRAINT "_expertise_pages_v_version_hero_shader_release_id_streak_releases_id_fk" FOREIGN KEY ("version_hero_shader_release_id") REFERENCES "public"."streak_releases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_expertise_pages_v" ADD CONSTRAINT "_expertise_pages_v_version_menu_preview_shader_release_id_streak_releases_id_fk" FOREIGN KEY ("version_menu_preview_shader_release_id") REFERENCES "public"."streak_releases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "audience_pages_full_media" ADD CONSTRAINT "audience_pages_full_media_shader_release_id_streak_releases_id_fk" FOREIGN KEY ("shader_release_id") REFERENCES "public"."streak_releases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "audience_pages_media_split" ADD CONSTRAINT "audience_pages_media_split_shader_release_id_streak_releases_id_fk" FOREIGN KEY ("shader_release_id") REFERENCES "public"."streak_releases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "audience_pages_split_narrow" ADD CONSTRAINT "audience_pages_split_narrow_shader_release_id_streak_releases_id_fk" FOREIGN KEY ("shader_release_id") REFERENCES "public"."streak_releases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "audience_pages_blocks_feature_tabs_tabs" ADD CONSTRAINT "audience_pages_blocks_feature_tabs_tabs_shader_release_id_streak_releases_id_fk" FOREIGN KEY ("shader_release_id") REFERENCES "public"."streak_releases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "audience_pages_aud_tabs_tabs" ADD CONSTRAINT "audience_pages_aud_tabs_tabs_shader_release_id_streak_releases_id_fk" FOREIGN KEY ("shader_release_id") REFERENCES "public"."streak_releases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "audience_pages" ADD CONSTRAINT "audience_pages_hero_shader_release_id_streak_releases_id_fk" FOREIGN KEY ("hero_shader_release_id") REFERENCES "public"."streak_releases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "audience_pages" ADD CONSTRAINT "audience_pages_menu_preview_shader_release_id_streak_releases_id_fk" FOREIGN KEY ("menu_preview_shader_release_id") REFERENCES "public"."streak_releases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__audience_pages_v_full_media_v" ADD CONSTRAINT "__audience_pages_v_full_media_v_shader_release_id_streak_releases_id_fk" FOREIGN KEY ("shader_release_id") REFERENCES "public"."streak_releases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__audience_pages_v_media_split_v" ADD CONSTRAINT "__audience_pages_v_media_split_v_shader_release_id_streak_releases_id_fk" FOREIGN KEY ("shader_release_id") REFERENCES "public"."streak_releases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__audience_pages_v_split_narrow_v" ADD CONSTRAINT "__audience_pages_v_split_narrow_v_shader_release_id_streak_releases_id_fk" FOREIGN KEY ("shader_release_id") REFERENCES "public"."streak_releases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_audience_pages_v_blocks_feature_tabs_tabs" ADD CONSTRAINT "_audience_pages_v_blocks_feature_tabs_tabs_shader_release_id_streak_releases_id_fk" FOREIGN KEY ("shader_release_id") REFERENCES "public"."streak_releases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__audience_pages_v_aud_tabs_v_tabs" ADD CONSTRAINT "__audience_pages_v_aud_tabs_v_tabs_shader_release_id_streak_releases_id_fk" FOREIGN KEY ("shader_release_id") REFERENCES "public"."streak_releases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_audience_pages_v" ADD CONSTRAINT "_audience_pages_v_version_hero_shader_release_id_streak_releases_id_fk" FOREIGN KEY ("version_hero_shader_release_id") REFERENCES "public"."streak_releases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_audience_pages_v" ADD CONSTRAINT "_audience_pages_v_version_menu_preview_shader_release_id_streak_releases_id_fk" FOREIGN KEY ("version_menu_preview_shader_release_id") REFERENCES "public"."streak_releases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "contact_pages" ADD CONSTRAINT "contact_pages_menu_preview_shader_release_id_streak_releases_id_fk" FOREIGN KEY ("menu_preview_shader_release_id") REFERENCES "public"."streak_releases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_contact_pages_v" ADD CONSTRAINT "_contact_pages_v_version_menu_preview_shader_release_id_streak_releases_id_fk" FOREIGN KEY ("version_menu_preview_shader_release_id") REFERENCES "public"."streak_releases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_streak_looks_fk" FOREIGN KEY ("streak_looks_id") REFERENCES "public"."streak_looks"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_streak_releases_fk" FOREIGN KEY ("streak_releases_id") REFERENCES "public"."streak_releases"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_streak_renders_fk" FOREIGN KEY ("streak_renders_id") REFERENCES "public"."streak_renders"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_full_media" ADD CONSTRAINT "home_full_media_shader_release_id_streak_releases_id_fk" FOREIGN KEY ("shader_release_id") REFERENCES "public"."streak_releases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_media_split" ADD CONSTRAINT "home_media_split_shader_release_id_streak_releases_id_fk" FOREIGN KEY ("shader_release_id") REFERENCES "public"."streak_releases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_split_narrow" ADD CONSTRAINT "home_split_narrow_shader_release_id_streak_releases_id_fk" FOREIGN KEY ("shader_release_id") REFERENCES "public"."streak_releases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_blocks_feature_tabs_tabs" ADD CONSTRAINT "home_blocks_feature_tabs_tabs_shader_release_id_streak_releases_id_fk" FOREIGN KEY ("shader_release_id") REFERENCES "public"."streak_releases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_aud_tabs_tabs" ADD CONSTRAINT "home_aud_tabs_tabs_shader_release_id_streak_releases_id_fk" FOREIGN KEY ("shader_release_id") REFERENCES "public"."streak_releases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home" ADD CONSTRAINT "home_hero_shader_release_id_streak_releases_id_fk" FOREIGN KEY ("hero_shader_release_id") REFERENCES "public"."streak_releases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__home_v_full_media_v" ADD CONSTRAINT "__home_v_full_media_v_shader_release_id_streak_releases_id_fk" FOREIGN KEY ("shader_release_id") REFERENCES "public"."streak_releases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__home_v_media_split_v" ADD CONSTRAINT "__home_v_media_split_v_shader_release_id_streak_releases_id_fk" FOREIGN KEY ("shader_release_id") REFERENCES "public"."streak_releases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__home_v_split_narrow_v" ADD CONSTRAINT "__home_v_split_narrow_v_shader_release_id_streak_releases_id_fk" FOREIGN KEY ("shader_release_id") REFERENCES "public"."streak_releases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_home_v_blocks_feature_tabs_tabs" ADD CONSTRAINT "_home_v_blocks_feature_tabs_tabs_shader_release_id_streak_releases_id_fk" FOREIGN KEY ("shader_release_id") REFERENCES "public"."streak_releases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__home_v_aud_tabs_v_tabs" ADD CONSTRAINT "__home_v_aud_tabs_v_tabs_shader_release_id_streak_releases_id_fk" FOREIGN KEY ("shader_release_id") REFERENCES "public"."streak_releases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_home_v" ADD CONSTRAINT "_home_v_version_hero_shader_release_id_streak_releases_id_fk" FOREIGN KEY ("version_hero_shader_release_id") REFERENCES "public"."streak_releases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "insights_index" ADD CONSTRAINT "insights_index_hero_shader_release_id_streak_releases_id_fk" FOREIGN KEY ("hero_shader_release_id") REFERENCES "public"."streak_releases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "insights_index" ADD CONSTRAINT "insights_index_menu_preview_shader_release_id_streak_releases_id_fk" FOREIGN KEY ("menu_preview_shader_release_id") REFERENCES "public"."streak_releases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_insights_index_v" ADD CONSTRAINT "_insights_index_v_version_hero_shader_release_id_streak_releases_id_fk" FOREIGN KEY ("version_hero_shader_release_id") REFERENCES "public"."streak_releases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_insights_index_v" ADD CONSTRAINT "_insights_index_v_version_menu_preview_shader_release_id_streak_releases_id_fk" FOREIGN KEY ("version_menu_preview_shader_release_id") REFERENCES "public"."streak_releases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "works_index" ADD CONSTRAINT "works_index_hero_shader_release_id_streak_releases_id_fk" FOREIGN KEY ("hero_shader_release_id") REFERENCES "public"."streak_releases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "works_index" ADD CONSTRAINT "works_index_menu_preview_shader_release_id_streak_releases_id_fk" FOREIGN KEY ("menu_preview_shader_release_id") REFERENCES "public"."streak_releases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_works_index_v" ADD CONSTRAINT "_works_index_v_version_hero_shader_release_id_streak_releases_id_fk" FOREIGN KEY ("version_hero_shader_release_id") REFERENCES "public"."streak_releases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_works_index_v" ADD CONSTRAINT "_works_index_v_version_menu_preview_shader_release_id_streak_releases_id_fk" FOREIGN KEY ("version_menu_preview_shader_release_id") REFERENCES "public"."streak_releases"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "pages_full_media_shader_shader_release_idx" ON "pages_full_media" USING btree ("shader_release_id");
  CREATE INDEX "pages_media_split_shader_shader_release_idx" ON "pages_media_split" USING btree ("shader_release_id");
  CREATE INDEX "pages_split_narrow_shader_shader_release_idx" ON "pages_split_narrow" USING btree ("shader_release_id");
  CREATE INDEX "pages_blocks_feature_tabs_tabs_shader_shader_release_idx" ON "pages_blocks_feature_tabs_tabs" USING btree ("shader_release_id");
  CREATE INDEX "pages_aud_tabs_tabs_shader_shader_release_idx" ON "pages_aud_tabs_tabs" USING btree ("shader_release_id");
  CREATE INDEX "pages_hero_shader_hero_shader_release_idx" ON "pages" USING btree ("hero_shader_release_id");
  CREATE INDEX "pages_menu_preview_shader_menu_preview_shader_release_idx" ON "pages" USING btree ("menu_preview_shader_release_id");
  CREATE INDEX "__pages_v_full_media_v_shader_shader_release_idx" ON "__pages_v_full_media_v" USING btree ("shader_release_id");
  CREATE INDEX "__pages_v_media_split_v_shader_shader_release_idx" ON "__pages_v_media_split_v" USING btree ("shader_release_id");
  CREATE INDEX "__pages_v_split_narrow_v_shader_shader_release_idx" ON "__pages_v_split_narrow_v" USING btree ("shader_release_id");
  CREATE INDEX "_pages_v_blocks_feature_tabs_tabs_shader_shader_release_idx" ON "_pages_v_blocks_feature_tabs_tabs" USING btree ("shader_release_id");
  CREATE INDEX "__pages_v_aud_tabs_v_tabs_shader_shader_release_idx" ON "__pages_v_aud_tabs_v_tabs" USING btree ("shader_release_id");
  CREATE INDEX "_pages_v_version_hero_shader_version_hero_shader_release_idx" ON "_pages_v" USING btree ("version_hero_shader_release_id");
  CREATE INDEX "_pages_v_version_menu_preview_shader_version_menu_prev_1_idx" ON "_pages_v" USING btree ("version_menu_preview_shader_poster_media_id");
  CREATE INDEX "posts_full_media_shader_shader_release_idx" ON "posts_full_media" USING btree ("shader_release_id");
  CREATE INDEX "posts_media_split_shader_shader_release_idx" ON "posts_media_split" USING btree ("shader_release_id");
  CREATE INDEX "posts_split_narrow_shader_shader_release_idx" ON "posts_split_narrow" USING btree ("shader_release_id");
  CREATE INDEX "posts_blocks_feature_tabs_tabs_shader_shader_release_idx" ON "posts_blocks_feature_tabs_tabs" USING btree ("shader_release_id");
  CREATE INDEX "posts_shader_shader_release_idx" ON "posts" USING btree ("shader_release_id");
  CREATE INDEX "__posts_v_full_media_v_shader_shader_release_idx" ON "__posts_v_full_media_v" USING btree ("shader_release_id");
  CREATE INDEX "__posts_v_media_split_v_shader_shader_release_idx" ON "__posts_v_media_split_v" USING btree ("shader_release_id");
  CREATE INDEX "__posts_v_split_narrow_v_shader_shader_release_idx" ON "__posts_v_split_narrow_v" USING btree ("shader_release_id");
  CREATE INDEX "_posts_v_blocks_feature_tabs_tabs_shader_shader_release_idx" ON "_posts_v_blocks_feature_tabs_tabs" USING btree ("shader_release_id");
  CREATE INDEX "_posts_v_version_shader_version_shader_release_idx" ON "_posts_v" USING btree ("version_shader_release_id");
  CREATE INDEX "work_pages_full_media_shader_shader_release_idx" ON "work_pages_full_media" USING btree ("shader_release_id");
  CREATE INDEX "work_pages_media_split_shader_shader_release_idx" ON "work_pages_media_split" USING btree ("shader_release_id");
  CREATE INDEX "work_pages_split_narrow_shader_shader_release_idx" ON "work_pages_split_narrow" USING btree ("shader_release_id");
  CREATE INDEX "work_pages_blocks_feature_tabs_tabs_shader_shader_releas_idx" ON "work_pages_blocks_feature_tabs_tabs" USING btree ("shader_release_id");
  CREATE INDEX "work_pages_aud_tabs_tabs_shader_shader_release_idx" ON "work_pages_aud_tabs_tabs" USING btree ("shader_release_id");
  CREATE INDEX "work_pages_hero_shader_hero_shader_release_idx" ON "work_pages" USING btree ("hero_shader_release_id");
  CREATE INDEX "work_pages_menu_preview_shader_menu_preview_shader_relea_idx" ON "work_pages" USING btree ("menu_preview_shader_release_id");
  CREATE INDEX "__work_pages_v_full_media_v_shader_shader_release_idx" ON "__work_pages_v_full_media_v" USING btree ("shader_release_id");
  CREATE INDEX "__work_pages_v_media_split_v_shader_shader_release_idx" ON "__work_pages_v_media_split_v" USING btree ("shader_release_id");
  CREATE INDEX "__work_pages_v_split_narrow_v_shader_shader_release_idx" ON "__work_pages_v_split_narrow_v" USING btree ("shader_release_id");
  CREATE INDEX "_work_pages_v_blocks_feature_tabs_tabs_shader_shader_rel_idx" ON "_work_pages_v_blocks_feature_tabs_tabs" USING btree ("shader_release_id");
  CREATE INDEX "__work_pages_v_aud_tabs_v_tabs_shader_shader_release_idx" ON "__work_pages_v_aud_tabs_v_tabs" USING btree ("shader_release_id");
  CREATE INDEX "_work_pages_v_version_hero_shader_version_hero_shader_re_idx" ON "_work_pages_v" USING btree ("version_hero_shader_release_id");
  CREATE INDEX "_work_pages_v_version_menu_preview_shader_version_menu_1_idx" ON "_work_pages_v" USING btree ("version_menu_preview_shader_poster_media_id");
  CREATE INDEX "lab_pages_full_media_shader_shader_release_idx" ON "lab_pages_full_media" USING btree ("shader_release_id");
  CREATE INDEX "lab_pages_media_split_shader_shader_release_idx" ON "lab_pages_media_split" USING btree ("shader_release_id");
  CREATE INDEX "lab_pages_split_narrow_shader_shader_release_idx" ON "lab_pages_split_narrow" USING btree ("shader_release_id");
  CREATE INDEX "lab_pages_blocks_feature_tabs_tabs_shader_shader_release_idx" ON "lab_pages_blocks_feature_tabs_tabs" USING btree ("shader_release_id");
  CREATE INDEX "lab_pages_hero_shader_hero_shader_release_idx" ON "lab_pages" USING btree ("hero_shader_release_id");
  CREATE INDEX "__lab_pages_v_full_media_v_shader_shader_release_idx" ON "__lab_pages_v_full_media_v" USING btree ("shader_release_id");
  CREATE INDEX "__lab_pages_v_media_split_v_shader_shader_release_idx" ON "__lab_pages_v_media_split_v" USING btree ("shader_release_id");
  CREATE INDEX "__lab_pages_v_split_narrow_v_shader_shader_release_idx" ON "__lab_pages_v_split_narrow_v" USING btree ("shader_release_id");
  CREATE INDEX "_lab_pages_v_blocks_feature_tabs_tabs_shader_shader_rele_idx" ON "_lab_pages_v_blocks_feature_tabs_tabs" USING btree ("shader_release_id");
  CREATE INDEX "_lab_pages_v_version_hero_shader_version_hero_shader_rel_idx" ON "_lab_pages_v" USING btree ("version_hero_shader_release_id");
  CREATE INDEX "expertise_pages_full_media_shader_shader_release_idx" ON "expertise_pages_full_media" USING btree ("shader_release_id");
  CREATE INDEX "expertise_pages_media_split_shader_shader_release_idx" ON "expertise_pages_media_split" USING btree ("shader_release_id");
  CREATE INDEX "expertise_pages_split_narrow_shader_shader_release_idx" ON "expertise_pages_split_narrow" USING btree ("shader_release_id");
  CREATE INDEX "expertise_pages_blocks_feature_tabs_tabs_shader_shader_r_idx" ON "expertise_pages_blocks_feature_tabs_tabs" USING btree ("shader_release_id");
  CREATE INDEX "expertise_pages_aud_tabs_tabs_shader_shader_release_idx" ON "expertise_pages_aud_tabs_tabs" USING btree ("shader_release_id");
  CREATE INDEX "expertise_pages_hero_shader_hero_shader_release_idx" ON "expertise_pages" USING btree ("hero_shader_release_id");
  CREATE INDEX "expertise_pages_menu_preview_shader_menu_preview_shade_1_idx" ON "expertise_pages" USING btree ("menu_preview_shader_poster_media_id");
  CREATE INDEX "__expertise_pages_v_full_media_v_shader_shader_release_idx" ON "__expertise_pages_v_full_media_v" USING btree ("shader_release_id");
  CREATE INDEX "__expertise_pages_v_media_split_v_shader_shader_release_idx" ON "__expertise_pages_v_media_split_v" USING btree ("shader_release_id");
  CREATE INDEX "__expertise_pages_v_split_narrow_v_shader_shader_release_idx" ON "__expertise_pages_v_split_narrow_v" USING btree ("shader_release_id");
  CREATE INDEX "_expertise_pages_v_blocks_feature_tabs_tabs_shader_sha_1_idx" ON "_expertise_pages_v_blocks_feature_tabs_tabs" USING btree ("shader_poster_media_id");
  CREATE INDEX "__expertise_pages_v_aud_tabs_v_tabs_shader_shader_releas_idx" ON "__expertise_pages_v_aud_tabs_v_tabs" USING btree ("shader_release_id");
  CREATE INDEX "_expertise_pages_v_version_hero_shader_version_hero_sh_1_idx" ON "_expertise_pages_v" USING btree ("version_hero_shader_poster_media_id");
  CREATE INDEX "_expertise_pages_v_version_menu_preview_shader_version_1_idx" ON "_expertise_pages_v" USING btree ("version_menu_preview_shader_poster_media_id");
  CREATE INDEX "audience_pages_full_media_shader_shader_release_idx" ON "audience_pages_full_media" USING btree ("shader_release_id");
  CREATE INDEX "audience_pages_media_split_shader_shader_release_idx" ON "audience_pages_media_split" USING btree ("shader_release_id");
  CREATE INDEX "audience_pages_split_narrow_shader_shader_release_idx" ON "audience_pages_split_narrow" USING btree ("shader_release_id");
  CREATE INDEX "audience_pages_blocks_feature_tabs_tabs_shader_shader_re_idx" ON "audience_pages_blocks_feature_tabs_tabs" USING btree ("shader_release_id");
  CREATE INDEX "audience_pages_aud_tabs_tabs_shader_shader_release_idx" ON "audience_pages_aud_tabs_tabs" USING btree ("shader_release_id");
  CREATE INDEX "audience_pages_hero_shader_hero_shader_release_idx" ON "audience_pages" USING btree ("hero_shader_release_id");
  CREATE INDEX "audience_pages_menu_preview_shader_menu_preview_shader_r_idx" ON "audience_pages" USING btree ("menu_preview_shader_release_id");
  CREATE INDEX "__audience_pages_v_full_media_v_shader_shader_release_idx" ON "__audience_pages_v_full_media_v" USING btree ("shader_release_id");
  CREATE INDEX "__audience_pages_v_media_split_v_shader_shader_release_idx" ON "__audience_pages_v_media_split_v" USING btree ("shader_release_id");
  CREATE INDEX "__audience_pages_v_split_narrow_v_shader_shader_release_idx" ON "__audience_pages_v_split_narrow_v" USING btree ("shader_release_id");
  CREATE INDEX "_audience_pages_v_blocks_feature_tabs_tabs_shader_shad_1_idx" ON "_audience_pages_v_blocks_feature_tabs_tabs" USING btree ("shader_poster_media_id");
  CREATE INDEX "__audience_pages_v_aud_tabs_v_tabs_shader_shader_release_idx" ON "__audience_pages_v_aud_tabs_v_tabs" USING btree ("shader_release_id");
  CREATE INDEX "_audience_pages_v_version_hero_shader_version_hero_sha_1_idx" ON "_audience_pages_v" USING btree ("version_hero_shader_poster_media_id");
  CREATE INDEX "_audience_pages_v_version_menu_preview_shader_version__1_idx" ON "_audience_pages_v" USING btree ("version_menu_preview_shader_poster_media_id");
  CREATE INDEX "contact_pages_menu_preview_shader_menu_preview_shader_re_idx" ON "contact_pages" USING btree ("menu_preview_shader_release_id");
  CREATE INDEX "_contact_pages_v_version_menu_preview_shader_version_m_1_idx" ON "_contact_pages_v" USING btree ("version_menu_preview_shader_poster_media_id");
  CREATE INDEX "payload_locked_documents_rels_streak_looks_id_idx" ON "payload_locked_documents_rels" USING btree ("streak_looks_id");
  CREATE INDEX "payload_locked_documents_rels_streak_releases_id_idx" ON "payload_locked_documents_rels" USING btree ("streak_releases_id");
  CREATE INDEX "payload_locked_documents_rels_streak_renders_id_idx" ON "payload_locked_documents_rels" USING btree ("streak_renders_id");
  CREATE INDEX "home_full_media_shader_shader_release_idx" ON "home_full_media" USING btree ("shader_release_id");
  CREATE INDEX "home_media_split_shader_shader_release_idx" ON "home_media_split" USING btree ("shader_release_id");
  CREATE INDEX "home_split_narrow_shader_shader_release_idx" ON "home_split_narrow" USING btree ("shader_release_id");
  CREATE INDEX "home_blocks_feature_tabs_tabs_shader_shader_release_idx" ON "home_blocks_feature_tabs_tabs" USING btree ("shader_release_id");
  CREATE INDEX "home_aud_tabs_tabs_shader_shader_release_idx" ON "home_aud_tabs_tabs" USING btree ("shader_release_id");
  CREATE INDEX "home_hero_shader_hero_shader_release_idx" ON "home" USING btree ("hero_shader_release_id");
  CREATE INDEX "__home_v_full_media_v_shader_shader_release_idx" ON "__home_v_full_media_v" USING btree ("shader_release_id");
  CREATE INDEX "__home_v_media_split_v_shader_shader_release_idx" ON "__home_v_media_split_v" USING btree ("shader_release_id");
  CREATE INDEX "__home_v_split_narrow_v_shader_shader_release_idx" ON "__home_v_split_narrow_v" USING btree ("shader_release_id");
  CREATE INDEX "_home_v_blocks_feature_tabs_tabs_shader_shader_release_idx" ON "_home_v_blocks_feature_tabs_tabs" USING btree ("shader_release_id");
  CREATE INDEX "__home_v_aud_tabs_v_tabs_shader_shader_release_idx" ON "__home_v_aud_tabs_v_tabs" USING btree ("shader_release_id");
  CREATE INDEX "_home_v_version_hero_shader_version_hero_shader_release_idx" ON "_home_v" USING btree ("version_hero_shader_release_id");
  CREATE INDEX "insights_index_hero_shader_hero_shader_release_idx" ON "insights_index" USING btree ("hero_shader_release_id");
  CREATE INDEX "insights_index_menu_preview_shader_menu_preview_shader_r_idx" ON "insights_index" USING btree ("menu_preview_shader_release_id");
  CREATE INDEX "_insights_index_v_version_hero_shader_version_hero_sha_1_idx" ON "_insights_index_v" USING btree ("version_hero_shader_poster_media_id");
  CREATE INDEX "_insights_index_v_version_menu_preview_shader_version__1_idx" ON "_insights_index_v" USING btree ("version_menu_preview_shader_poster_media_id");
  CREATE INDEX "works_index_hero_shader_hero_shader_release_idx" ON "works_index" USING btree ("hero_shader_release_id");
  CREATE INDEX "works_index_menu_preview_shader_menu_preview_shader_rele_idx" ON "works_index" USING btree ("menu_preview_shader_release_id");
  CREATE INDEX "_works_index_v_version_hero_shader_version_hero_shader_r_idx" ON "_works_index_v" USING btree ("version_hero_shader_release_id");
  CREATE INDEX "_works_index_v_version_menu_preview_shader_version_men_1_idx" ON "_works_index_v" USING btree ("version_menu_preview_shader_poster_media_id");
  CREATE INDEX "_pages_v_version_menu_preview_shader_version_menu_previe_idx" ON "_pages_v" USING btree ("version_menu_preview_shader_release_id");
  CREATE INDEX "_work_pages_v_version_menu_preview_shader_version_menu_p_idx" ON "_work_pages_v" USING btree ("version_menu_preview_shader_release_id");
  CREATE INDEX "expertise_pages_menu_preview_shader_menu_preview_shader__idx" ON "expertise_pages" USING btree ("menu_preview_shader_release_id");
  CREATE INDEX "_expertise_pages_v_blocks_feature_tabs_tabs_shader_shade_idx" ON "_expertise_pages_v_blocks_feature_tabs_tabs" USING btree ("shader_release_id");
  CREATE INDEX "_expertise_pages_v_version_hero_shader_version_hero_shad_idx" ON "_expertise_pages_v" USING btree ("version_hero_shader_release_id");
  CREATE INDEX "_expertise_pages_v_version_menu_preview_shader_version_m_idx" ON "_expertise_pages_v" USING btree ("version_menu_preview_shader_release_id");
  CREATE INDEX "_audience_pages_v_blocks_feature_tabs_tabs_shader_shader_idx" ON "_audience_pages_v_blocks_feature_tabs_tabs" USING btree ("shader_release_id");
  CREATE INDEX "_audience_pages_v_version_hero_shader_version_hero_shade_idx" ON "_audience_pages_v" USING btree ("version_hero_shader_release_id");
  CREATE INDEX "_audience_pages_v_version_menu_preview_shader_version_me_idx" ON "_audience_pages_v" USING btree ("version_menu_preview_shader_release_id");
  CREATE INDEX "_contact_pages_v_version_menu_preview_shader_version_men_idx" ON "_contact_pages_v" USING btree ("version_menu_preview_shader_release_id");
  CREATE INDEX "_insights_index_v_version_hero_shader_version_hero_shade_idx" ON "_insights_index_v" USING btree ("version_hero_shader_release_id");
  CREATE INDEX "_insights_index_v_version_menu_preview_shader_version_me_idx" ON "_insights_index_v" USING btree ("version_menu_preview_shader_release_id");
  CREATE INDEX "_works_index_v_version_menu_preview_shader_version_menu__idx" ON "_works_index_v" USING btree ("version_menu_preview_shader_release_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "streak_looks" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "streak_looks_texts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_streak_looks_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_streak_looks_v_texts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "streak_releases" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "streak_renders" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "streak_looks" CASCADE;
  DROP TABLE "streak_looks_texts" CASCADE;
  DROP TABLE "_streak_looks_v" CASCADE;
  DROP TABLE "_streak_looks_v_texts" CASCADE;
  DROP TABLE "streak_releases" CASCADE;
  DROP TABLE "streak_renders" CASCADE;
  ALTER TABLE "pages_full_media" DROP CONSTRAINT "pages_full_media_shader_release_id_streak_releases_id_fk";
  
  ALTER TABLE "pages_media_split" DROP CONSTRAINT "pages_media_split_shader_release_id_streak_releases_id_fk";
  
  ALTER TABLE "pages_split_narrow" DROP CONSTRAINT "pages_split_narrow_shader_release_id_streak_releases_id_fk";
  
  ALTER TABLE "pages_blocks_feature_tabs_tabs" DROP CONSTRAINT "pages_blocks_feature_tabs_tabs_shader_release_id_streak_releases_id_fk";
  
  ALTER TABLE "pages_aud_tabs_tabs" DROP CONSTRAINT "pages_aud_tabs_tabs_shader_release_id_streak_releases_id_fk";
  
  ALTER TABLE "pages" DROP CONSTRAINT "pages_hero_shader_release_id_streak_releases_id_fk";
  
  ALTER TABLE "pages" DROP CONSTRAINT "pages_menu_preview_shader_release_id_streak_releases_id_fk";
  
  ALTER TABLE "__pages_v_full_media_v" DROP CONSTRAINT "__pages_v_full_media_v_shader_release_id_streak_releases_id_fk";
  
  ALTER TABLE "__pages_v_media_split_v" DROP CONSTRAINT "__pages_v_media_split_v_shader_release_id_streak_releases_id_fk";
  
  ALTER TABLE "__pages_v_split_narrow_v" DROP CONSTRAINT "__pages_v_split_narrow_v_shader_release_id_streak_releases_id_fk";
  
  ALTER TABLE "_pages_v_blocks_feature_tabs_tabs" DROP CONSTRAINT "_pages_v_blocks_feature_tabs_tabs_shader_release_id_streak_releases_id_fk";
  
  ALTER TABLE "__pages_v_aud_tabs_v_tabs" DROP CONSTRAINT "__pages_v_aud_tabs_v_tabs_shader_release_id_streak_releases_id_fk";
  
  ALTER TABLE "_pages_v" DROP CONSTRAINT "_pages_v_version_hero_shader_release_id_streak_releases_id_fk";
  
  ALTER TABLE "_pages_v" DROP CONSTRAINT "_pages_v_version_menu_preview_shader_release_id_streak_releases_id_fk";
  
  ALTER TABLE "posts_full_media" DROP CONSTRAINT "posts_full_media_shader_release_id_streak_releases_id_fk";
  
  ALTER TABLE "posts_media_split" DROP CONSTRAINT "posts_media_split_shader_release_id_streak_releases_id_fk";
  
  ALTER TABLE "posts_split_narrow" DROP CONSTRAINT "posts_split_narrow_shader_release_id_streak_releases_id_fk";
  
  ALTER TABLE "posts_blocks_feature_tabs_tabs" DROP CONSTRAINT "posts_blocks_feature_tabs_tabs_shader_release_id_streak_releases_id_fk";
  
  ALTER TABLE "posts" DROP CONSTRAINT "posts_shader_release_id_streak_releases_id_fk";
  
  ALTER TABLE "__posts_v_full_media_v" DROP CONSTRAINT "__posts_v_full_media_v_shader_release_id_streak_releases_id_fk";
  
  ALTER TABLE "__posts_v_media_split_v" DROP CONSTRAINT "__posts_v_media_split_v_shader_release_id_streak_releases_id_fk";
  
  ALTER TABLE "__posts_v_split_narrow_v" DROP CONSTRAINT "__posts_v_split_narrow_v_shader_release_id_streak_releases_id_fk";
  
  ALTER TABLE "_posts_v_blocks_feature_tabs_tabs" DROP CONSTRAINT "_posts_v_blocks_feature_tabs_tabs_shader_release_id_streak_releases_id_fk";
  
  ALTER TABLE "_posts_v" DROP CONSTRAINT "_posts_v_version_shader_release_id_streak_releases_id_fk";
  
  ALTER TABLE "work_pages_full_media" DROP CONSTRAINT "work_pages_full_media_shader_release_id_streak_releases_id_fk";
  
  ALTER TABLE "work_pages_media_split" DROP CONSTRAINT "work_pages_media_split_shader_release_id_streak_releases_id_fk";
  
  ALTER TABLE "work_pages_split_narrow" DROP CONSTRAINT "work_pages_split_narrow_shader_release_id_streak_releases_id_fk";
  
  ALTER TABLE "work_pages_blocks_feature_tabs_tabs" DROP CONSTRAINT "work_pages_blocks_feature_tabs_tabs_shader_release_id_streak_releases_id_fk";
  
  ALTER TABLE "work_pages_aud_tabs_tabs" DROP CONSTRAINT "work_pages_aud_tabs_tabs_shader_release_id_streak_releases_id_fk";
  
  ALTER TABLE "work_pages" DROP CONSTRAINT "work_pages_hero_shader_release_id_streak_releases_id_fk";
  
  ALTER TABLE "work_pages" DROP CONSTRAINT "work_pages_menu_preview_shader_release_id_streak_releases_id_fk";
  
  ALTER TABLE "__work_pages_v_full_media_v" DROP CONSTRAINT "__work_pages_v_full_media_v_shader_release_id_streak_releases_id_fk";
  
  ALTER TABLE "__work_pages_v_media_split_v" DROP CONSTRAINT "__work_pages_v_media_split_v_shader_release_id_streak_releases_id_fk";
  
  ALTER TABLE "__work_pages_v_split_narrow_v" DROP CONSTRAINT "__work_pages_v_split_narrow_v_shader_release_id_streak_releases_id_fk";
  
  ALTER TABLE "_work_pages_v_blocks_feature_tabs_tabs" DROP CONSTRAINT "_work_pages_v_blocks_feature_tabs_tabs_shader_release_id_streak_releases_id_fk";
  
  ALTER TABLE "__work_pages_v_aud_tabs_v_tabs" DROP CONSTRAINT "__work_pages_v_aud_tabs_v_tabs_shader_release_id_streak_releases_id_fk";
  
  ALTER TABLE "_work_pages_v" DROP CONSTRAINT "_work_pages_v_version_hero_shader_release_id_streak_releases_id_fk";
  
  ALTER TABLE "_work_pages_v" DROP CONSTRAINT "_work_pages_v_version_menu_preview_shader_release_id_streak_releases_id_fk";
  
  ALTER TABLE "lab_pages_full_media" DROP CONSTRAINT "lab_pages_full_media_shader_release_id_streak_releases_id_fk";
  
  ALTER TABLE "lab_pages_media_split" DROP CONSTRAINT "lab_pages_media_split_shader_release_id_streak_releases_id_fk";
  
  ALTER TABLE "lab_pages_split_narrow" DROP CONSTRAINT "lab_pages_split_narrow_shader_release_id_streak_releases_id_fk";
  
  ALTER TABLE "lab_pages_blocks_feature_tabs_tabs" DROP CONSTRAINT "lab_pages_blocks_feature_tabs_tabs_shader_release_id_streak_releases_id_fk";
  
  ALTER TABLE "lab_pages" DROP CONSTRAINT "lab_pages_hero_shader_release_id_streak_releases_id_fk";
  
  ALTER TABLE "__lab_pages_v_full_media_v" DROP CONSTRAINT "__lab_pages_v_full_media_v_shader_release_id_streak_releases_id_fk";
  
  ALTER TABLE "__lab_pages_v_media_split_v" DROP CONSTRAINT "__lab_pages_v_media_split_v_shader_release_id_streak_releases_id_fk";
  
  ALTER TABLE "__lab_pages_v_split_narrow_v" DROP CONSTRAINT "__lab_pages_v_split_narrow_v_shader_release_id_streak_releases_id_fk";
  
  ALTER TABLE "_lab_pages_v_blocks_feature_tabs_tabs" DROP CONSTRAINT "_lab_pages_v_blocks_feature_tabs_tabs_shader_release_id_streak_releases_id_fk";
  
  ALTER TABLE "_lab_pages_v" DROP CONSTRAINT "_lab_pages_v_version_hero_shader_release_id_streak_releases_id_fk";
  
  ALTER TABLE "expertise_pages_full_media" DROP CONSTRAINT "expertise_pages_full_media_shader_release_id_streak_releases_id_fk";
  
  ALTER TABLE "expertise_pages_media_split" DROP CONSTRAINT "expertise_pages_media_split_shader_release_id_streak_releases_id_fk";
  
  ALTER TABLE "expertise_pages_split_narrow" DROP CONSTRAINT "expertise_pages_split_narrow_shader_release_id_streak_releases_id_fk";
  
  ALTER TABLE "expertise_pages_blocks_feature_tabs_tabs" DROP CONSTRAINT "expertise_pages_blocks_feature_tabs_tabs_shader_release_id_streak_releases_id_fk";
  
  ALTER TABLE "expertise_pages_aud_tabs_tabs" DROP CONSTRAINT "expertise_pages_aud_tabs_tabs_shader_release_id_streak_releases_id_fk";
  
  ALTER TABLE "expertise_pages" DROP CONSTRAINT "expertise_pages_hero_shader_release_id_streak_releases_id_fk";
  
  ALTER TABLE "expertise_pages" DROP CONSTRAINT "expertise_pages_menu_preview_shader_release_id_streak_releases_id_fk";
  
  ALTER TABLE "__expertise_pages_v_full_media_v" DROP CONSTRAINT "__expertise_pages_v_full_media_v_shader_release_id_streak_releases_id_fk";
  
  ALTER TABLE "__expertise_pages_v_media_split_v" DROP CONSTRAINT "__expertise_pages_v_media_split_v_shader_release_id_streak_releases_id_fk";
  
  ALTER TABLE "__expertise_pages_v_split_narrow_v" DROP CONSTRAINT "__expertise_pages_v_split_narrow_v_shader_release_id_streak_releases_id_fk";
  
  ALTER TABLE "_expertise_pages_v_blocks_feature_tabs_tabs" DROP CONSTRAINT "_expertise_pages_v_blocks_feature_tabs_tabs_shader_release_id_streak_releases_id_fk";
  
  ALTER TABLE "__expertise_pages_v_aud_tabs_v_tabs" DROP CONSTRAINT "__expertise_pages_v_aud_tabs_v_tabs_shader_release_id_streak_releases_id_fk";
  
  ALTER TABLE "_expertise_pages_v" DROP CONSTRAINT "_expertise_pages_v_version_hero_shader_release_id_streak_releases_id_fk";
  
  ALTER TABLE "_expertise_pages_v" DROP CONSTRAINT "_expertise_pages_v_version_menu_preview_shader_release_id_streak_releases_id_fk";
  
  ALTER TABLE "audience_pages_full_media" DROP CONSTRAINT "audience_pages_full_media_shader_release_id_streak_releases_id_fk";
  
  ALTER TABLE "audience_pages_media_split" DROP CONSTRAINT "audience_pages_media_split_shader_release_id_streak_releases_id_fk";
  
  ALTER TABLE "audience_pages_split_narrow" DROP CONSTRAINT "audience_pages_split_narrow_shader_release_id_streak_releases_id_fk";
  
  ALTER TABLE "audience_pages_blocks_feature_tabs_tabs" DROP CONSTRAINT "audience_pages_blocks_feature_tabs_tabs_shader_release_id_streak_releases_id_fk";
  
  ALTER TABLE "audience_pages_aud_tabs_tabs" DROP CONSTRAINT "audience_pages_aud_tabs_tabs_shader_release_id_streak_releases_id_fk";
  
  ALTER TABLE "audience_pages" DROP CONSTRAINT "audience_pages_hero_shader_release_id_streak_releases_id_fk";
  
  ALTER TABLE "audience_pages" DROP CONSTRAINT "audience_pages_menu_preview_shader_release_id_streak_releases_id_fk";
  
  ALTER TABLE "__audience_pages_v_full_media_v" DROP CONSTRAINT "__audience_pages_v_full_media_v_shader_release_id_streak_releases_id_fk";
  
  ALTER TABLE "__audience_pages_v_media_split_v" DROP CONSTRAINT "__audience_pages_v_media_split_v_shader_release_id_streak_releases_id_fk";
  
  ALTER TABLE "__audience_pages_v_split_narrow_v" DROP CONSTRAINT "__audience_pages_v_split_narrow_v_shader_release_id_streak_releases_id_fk";
  
  ALTER TABLE "_audience_pages_v_blocks_feature_tabs_tabs" DROP CONSTRAINT "_audience_pages_v_blocks_feature_tabs_tabs_shader_release_id_streak_releases_id_fk";
  
  ALTER TABLE "__audience_pages_v_aud_tabs_v_tabs" DROP CONSTRAINT "__audience_pages_v_aud_tabs_v_tabs_shader_release_id_streak_releases_id_fk";
  
  ALTER TABLE "_audience_pages_v" DROP CONSTRAINT "_audience_pages_v_version_hero_shader_release_id_streak_releases_id_fk";
  
  ALTER TABLE "_audience_pages_v" DROP CONSTRAINT "_audience_pages_v_version_menu_preview_shader_release_id_streak_releases_id_fk";
  
  ALTER TABLE "contact_pages" DROP CONSTRAINT "contact_pages_menu_preview_shader_release_id_streak_releases_id_fk";
  
  ALTER TABLE "_contact_pages_v" DROP CONSTRAINT "_contact_pages_v_version_menu_preview_shader_release_id_streak_releases_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_streak_looks_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_streak_releases_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_streak_renders_fk";
  
  ALTER TABLE "home_full_media" DROP CONSTRAINT "home_full_media_shader_release_id_streak_releases_id_fk";
  
  ALTER TABLE "home_media_split" DROP CONSTRAINT "home_media_split_shader_release_id_streak_releases_id_fk";
  
  ALTER TABLE "home_split_narrow" DROP CONSTRAINT "home_split_narrow_shader_release_id_streak_releases_id_fk";
  
  ALTER TABLE "home_blocks_feature_tabs_tabs" DROP CONSTRAINT "home_blocks_feature_tabs_tabs_shader_release_id_streak_releases_id_fk";
  
  ALTER TABLE "home_aud_tabs_tabs" DROP CONSTRAINT "home_aud_tabs_tabs_shader_release_id_streak_releases_id_fk";
  
  ALTER TABLE "home" DROP CONSTRAINT "home_hero_shader_release_id_streak_releases_id_fk";
  
  ALTER TABLE "__home_v_full_media_v" DROP CONSTRAINT "__home_v_full_media_v_shader_release_id_streak_releases_id_fk";
  
  ALTER TABLE "__home_v_media_split_v" DROP CONSTRAINT "__home_v_media_split_v_shader_release_id_streak_releases_id_fk";
  
  ALTER TABLE "__home_v_split_narrow_v" DROP CONSTRAINT "__home_v_split_narrow_v_shader_release_id_streak_releases_id_fk";
  
  ALTER TABLE "_home_v_blocks_feature_tabs_tabs" DROP CONSTRAINT "_home_v_blocks_feature_tabs_tabs_shader_release_id_streak_releases_id_fk";
  
  ALTER TABLE "__home_v_aud_tabs_v_tabs" DROP CONSTRAINT "__home_v_aud_tabs_v_tabs_shader_release_id_streak_releases_id_fk";
  
  ALTER TABLE "_home_v" DROP CONSTRAINT "_home_v_version_hero_shader_release_id_streak_releases_id_fk";
  
  ALTER TABLE "insights_index" DROP CONSTRAINT "insights_index_hero_shader_release_id_streak_releases_id_fk";
  
  ALTER TABLE "insights_index" DROP CONSTRAINT "insights_index_menu_preview_shader_release_id_streak_releases_id_fk";
  
  ALTER TABLE "_insights_index_v" DROP CONSTRAINT "_insights_index_v_version_hero_shader_release_id_streak_releases_id_fk";
  
  ALTER TABLE "_insights_index_v" DROP CONSTRAINT "_insights_index_v_version_menu_preview_shader_release_id_streak_releases_id_fk";
  
  ALTER TABLE "works_index" DROP CONSTRAINT "works_index_hero_shader_release_id_streak_releases_id_fk";
  
  ALTER TABLE "works_index" DROP CONSTRAINT "works_index_menu_preview_shader_release_id_streak_releases_id_fk";
  
  ALTER TABLE "_works_index_v" DROP CONSTRAINT "_works_index_v_version_hero_shader_release_id_streak_releases_id_fk";
  
  ALTER TABLE "_works_index_v" DROP CONSTRAINT "_works_index_v_version_menu_preview_shader_release_id_streak_releases_id_fk";
  
  ALTER TABLE "payload_folders_folder_type" ALTER COLUMN "value" SET DATA TYPE text;
  DROP TYPE "public"."enum_payload_folders_folder_type";
  CREATE TYPE "public"."enum_payload_folders_folder_type" AS ENUM('media');
  ALTER TABLE "payload_folders_folder_type" ALTER COLUMN "value" SET DATA TYPE "public"."enum_payload_folders_folder_type" USING "value"::"public"."enum_payload_folders_folder_type";
  DROP INDEX "pages_full_media_shader_shader_release_idx";
  DROP INDEX "pages_media_split_shader_shader_release_idx";
  DROP INDEX "pages_split_narrow_shader_shader_release_idx";
  DROP INDEX "pages_blocks_feature_tabs_tabs_shader_shader_release_idx";
  DROP INDEX "pages_aud_tabs_tabs_shader_shader_release_idx";
  DROP INDEX "pages_hero_shader_hero_shader_release_idx";
  DROP INDEX "pages_menu_preview_shader_menu_preview_shader_release_idx";
  DROP INDEX "__pages_v_full_media_v_shader_shader_release_idx";
  DROP INDEX "__pages_v_media_split_v_shader_shader_release_idx";
  DROP INDEX "__pages_v_split_narrow_v_shader_shader_release_idx";
  DROP INDEX "_pages_v_blocks_feature_tabs_tabs_shader_shader_release_idx";
  DROP INDEX "__pages_v_aud_tabs_v_tabs_shader_shader_release_idx";
  DROP INDEX "_pages_v_version_hero_shader_version_hero_shader_release_idx";
  DROP INDEX "_pages_v_version_menu_preview_shader_version_menu_prev_1_idx";
  DROP INDEX "posts_full_media_shader_shader_release_idx";
  DROP INDEX "posts_media_split_shader_shader_release_idx";
  DROP INDEX "posts_split_narrow_shader_shader_release_idx";
  DROP INDEX "posts_blocks_feature_tabs_tabs_shader_shader_release_idx";
  DROP INDEX "posts_shader_shader_release_idx";
  DROP INDEX "__posts_v_full_media_v_shader_shader_release_idx";
  DROP INDEX "__posts_v_media_split_v_shader_shader_release_idx";
  DROP INDEX "__posts_v_split_narrow_v_shader_shader_release_idx";
  DROP INDEX "_posts_v_blocks_feature_tabs_tabs_shader_shader_release_idx";
  DROP INDEX "_posts_v_version_shader_version_shader_release_idx";
  DROP INDEX "work_pages_full_media_shader_shader_release_idx";
  DROP INDEX "work_pages_media_split_shader_shader_release_idx";
  DROP INDEX "work_pages_split_narrow_shader_shader_release_idx";
  DROP INDEX "work_pages_blocks_feature_tabs_tabs_shader_shader_releas_idx";
  DROP INDEX "work_pages_aud_tabs_tabs_shader_shader_release_idx";
  DROP INDEX "work_pages_hero_shader_hero_shader_release_idx";
  DROP INDEX "work_pages_menu_preview_shader_menu_preview_shader_relea_idx";
  DROP INDEX "__work_pages_v_full_media_v_shader_shader_release_idx";
  DROP INDEX "__work_pages_v_media_split_v_shader_shader_release_idx";
  DROP INDEX "__work_pages_v_split_narrow_v_shader_shader_release_idx";
  DROP INDEX "_work_pages_v_blocks_feature_tabs_tabs_shader_shader_rel_idx";
  DROP INDEX "__work_pages_v_aud_tabs_v_tabs_shader_shader_release_idx";
  DROP INDEX "_work_pages_v_version_hero_shader_version_hero_shader_re_idx";
  DROP INDEX "_work_pages_v_version_menu_preview_shader_version_menu_1_idx";
  DROP INDEX "lab_pages_full_media_shader_shader_release_idx";
  DROP INDEX "lab_pages_media_split_shader_shader_release_idx";
  DROP INDEX "lab_pages_split_narrow_shader_shader_release_idx";
  DROP INDEX "lab_pages_blocks_feature_tabs_tabs_shader_shader_release_idx";
  DROP INDEX "lab_pages_hero_shader_hero_shader_release_idx";
  DROP INDEX "__lab_pages_v_full_media_v_shader_shader_release_idx";
  DROP INDEX "__lab_pages_v_media_split_v_shader_shader_release_idx";
  DROP INDEX "__lab_pages_v_split_narrow_v_shader_shader_release_idx";
  DROP INDEX "_lab_pages_v_blocks_feature_tabs_tabs_shader_shader_rele_idx";
  DROP INDEX "_lab_pages_v_version_hero_shader_version_hero_shader_rel_idx";
  DROP INDEX "expertise_pages_full_media_shader_shader_release_idx";
  DROP INDEX "expertise_pages_media_split_shader_shader_release_idx";
  DROP INDEX "expertise_pages_split_narrow_shader_shader_release_idx";
  DROP INDEX "expertise_pages_blocks_feature_tabs_tabs_shader_shader_r_idx";
  DROP INDEX "expertise_pages_aud_tabs_tabs_shader_shader_release_idx";
  DROP INDEX "expertise_pages_hero_shader_hero_shader_release_idx";
  DROP INDEX "expertise_pages_menu_preview_shader_menu_preview_shade_1_idx";
  DROP INDEX "__expertise_pages_v_full_media_v_shader_shader_release_idx";
  DROP INDEX "__expertise_pages_v_media_split_v_shader_shader_release_idx";
  DROP INDEX "__expertise_pages_v_split_narrow_v_shader_shader_release_idx";
  DROP INDEX "_expertise_pages_v_blocks_feature_tabs_tabs_shader_sha_1_idx";
  DROP INDEX "__expertise_pages_v_aud_tabs_v_tabs_shader_shader_releas_idx";
  DROP INDEX "_expertise_pages_v_version_hero_shader_version_hero_sh_1_idx";
  DROP INDEX "_expertise_pages_v_version_menu_preview_shader_version_1_idx";
  DROP INDEX "audience_pages_full_media_shader_shader_release_idx";
  DROP INDEX "audience_pages_media_split_shader_shader_release_idx";
  DROP INDEX "audience_pages_split_narrow_shader_shader_release_idx";
  DROP INDEX "audience_pages_blocks_feature_tabs_tabs_shader_shader_re_idx";
  DROP INDEX "audience_pages_aud_tabs_tabs_shader_shader_release_idx";
  DROP INDEX "audience_pages_hero_shader_hero_shader_release_idx";
  DROP INDEX "audience_pages_menu_preview_shader_menu_preview_shader_r_idx";
  DROP INDEX "__audience_pages_v_full_media_v_shader_shader_release_idx";
  DROP INDEX "__audience_pages_v_media_split_v_shader_shader_release_idx";
  DROP INDEX "__audience_pages_v_split_narrow_v_shader_shader_release_idx";
  DROP INDEX "_audience_pages_v_blocks_feature_tabs_tabs_shader_shad_1_idx";
  DROP INDEX "__audience_pages_v_aud_tabs_v_tabs_shader_shader_release_idx";
  DROP INDEX "_audience_pages_v_version_hero_shader_version_hero_sha_1_idx";
  DROP INDEX "_audience_pages_v_version_menu_preview_shader_version__1_idx";
  DROP INDEX "contact_pages_menu_preview_shader_menu_preview_shader_re_idx";
  DROP INDEX "_contact_pages_v_version_menu_preview_shader_version_m_1_idx";
  DROP INDEX "payload_locked_documents_rels_streak_looks_id_idx";
  DROP INDEX "payload_locked_documents_rels_streak_releases_id_idx";
  DROP INDEX "payload_locked_documents_rels_streak_renders_id_idx";
  DROP INDEX "home_full_media_shader_shader_release_idx";
  DROP INDEX "home_media_split_shader_shader_release_idx";
  DROP INDEX "home_split_narrow_shader_shader_release_idx";
  DROP INDEX "home_blocks_feature_tabs_tabs_shader_shader_release_idx";
  DROP INDEX "home_aud_tabs_tabs_shader_shader_release_idx";
  DROP INDEX "home_hero_shader_hero_shader_release_idx";
  DROP INDEX "__home_v_full_media_v_shader_shader_release_idx";
  DROP INDEX "__home_v_media_split_v_shader_shader_release_idx";
  DROP INDEX "__home_v_split_narrow_v_shader_shader_release_idx";
  DROP INDEX "_home_v_blocks_feature_tabs_tabs_shader_shader_release_idx";
  DROP INDEX "__home_v_aud_tabs_v_tabs_shader_shader_release_idx";
  DROP INDEX "_home_v_version_hero_shader_version_hero_shader_release_idx";
  DROP INDEX "insights_index_hero_shader_hero_shader_release_idx";
  DROP INDEX "insights_index_menu_preview_shader_menu_preview_shader_r_idx";
  DROP INDEX "_insights_index_v_version_hero_shader_version_hero_sha_1_idx";
  DROP INDEX "_insights_index_v_version_menu_preview_shader_version__1_idx";
  DROP INDEX "works_index_hero_shader_hero_shader_release_idx";
  DROP INDEX "works_index_menu_preview_shader_menu_preview_shader_rele_idx";
  DROP INDEX "_works_index_v_version_hero_shader_version_hero_shader_r_idx";
  DROP INDEX "_works_index_v_version_menu_preview_shader_version_men_1_idx";
  DROP INDEX "_pages_v_version_menu_preview_shader_version_menu_previe_idx";
  DROP INDEX "_work_pages_v_version_menu_preview_shader_version_menu_p_idx";
  DROP INDEX "expertise_pages_menu_preview_shader_menu_preview_shader__idx";
  DROP INDEX "_expertise_pages_v_blocks_feature_tabs_tabs_shader_shade_idx";
  DROP INDEX "_expertise_pages_v_version_hero_shader_version_hero_shad_idx";
  DROP INDEX "_expertise_pages_v_version_menu_preview_shader_version_m_idx";
  DROP INDEX "_audience_pages_v_blocks_feature_tabs_tabs_shader_shader_idx";
  DROP INDEX "_audience_pages_v_version_hero_shader_version_hero_shade_idx";
  DROP INDEX "_audience_pages_v_version_menu_preview_shader_version_me_idx";
  DROP INDEX "_contact_pages_v_version_menu_preview_shader_version_men_idx";
  DROP INDEX "_insights_index_v_version_hero_shader_version_hero_shade_idx";
  DROP INDEX "_insights_index_v_version_menu_preview_shader_version_me_idx";
  DROP INDEX "_works_index_v_version_menu_preview_shader_version_menu__idx";
  CREATE INDEX "_pages_v_version_menu_preview_shader_version_menu_previe_idx" ON "_pages_v" USING btree ("version_menu_preview_shader_poster_media_id");
  CREATE INDEX "_work_pages_v_version_menu_preview_shader_version_menu_p_idx" ON "_work_pages_v" USING btree ("version_menu_preview_shader_poster_media_id");
  CREATE INDEX "expertise_pages_menu_preview_shader_menu_preview_shader__idx" ON "expertise_pages" USING btree ("menu_preview_shader_poster_media_id");
  CREATE INDEX "_expertise_pages_v_blocks_feature_tabs_tabs_shader_shade_idx" ON "_expertise_pages_v_blocks_feature_tabs_tabs" USING btree ("shader_poster_media_id");
  CREATE INDEX "_expertise_pages_v_version_hero_shader_version_hero_shad_idx" ON "_expertise_pages_v" USING btree ("version_hero_shader_poster_media_id");
  CREATE INDEX "_expertise_pages_v_version_menu_preview_shader_version_m_idx" ON "_expertise_pages_v" USING btree ("version_menu_preview_shader_poster_media_id");
  CREATE INDEX "_audience_pages_v_blocks_feature_tabs_tabs_shader_shader_idx" ON "_audience_pages_v_blocks_feature_tabs_tabs" USING btree ("shader_poster_media_id");
  CREATE INDEX "_audience_pages_v_version_hero_shader_version_hero_shade_idx" ON "_audience_pages_v" USING btree ("version_hero_shader_poster_media_id");
  CREATE INDEX "_audience_pages_v_version_menu_preview_shader_version_me_idx" ON "_audience_pages_v" USING btree ("version_menu_preview_shader_poster_media_id");
  CREATE INDEX "_contact_pages_v_version_menu_preview_shader_version_men_idx" ON "_contact_pages_v" USING btree ("version_menu_preview_shader_poster_media_id");
  CREATE INDEX "_insights_index_v_version_hero_shader_version_hero_shade_idx" ON "_insights_index_v" USING btree ("version_hero_shader_poster_media_id");
  CREATE INDEX "_insights_index_v_version_menu_preview_shader_version_me_idx" ON "_insights_index_v" USING btree ("version_menu_preview_shader_poster_media_id");
  CREATE INDEX "_works_index_v_version_menu_preview_shader_version_menu__idx" ON "_works_index_v" USING btree ("version_menu_preview_shader_poster_media_id");
  ALTER TABLE "pages_full_media" DROP COLUMN "shader_release_id";
  ALTER TABLE "pages_media_split" DROP COLUMN "shader_release_id";
  ALTER TABLE "pages_split_narrow" DROP COLUMN "shader_release_id";
  ALTER TABLE "pages_blocks_feature_tabs_tabs" DROP COLUMN "shader_release_id";
  ALTER TABLE "pages_aud_tabs_tabs" DROP COLUMN "shader_release_id";
  ALTER TABLE "pages" DROP COLUMN "hero_shader_release_id";
  ALTER TABLE "pages" DROP COLUMN "menu_preview_shader_release_id";
  ALTER TABLE "__pages_v_full_media_v" DROP COLUMN "shader_release_id";
  ALTER TABLE "__pages_v_media_split_v" DROP COLUMN "shader_release_id";
  ALTER TABLE "__pages_v_split_narrow_v" DROP COLUMN "shader_release_id";
  ALTER TABLE "_pages_v_blocks_feature_tabs_tabs" DROP COLUMN "shader_release_id";
  ALTER TABLE "__pages_v_aud_tabs_v_tabs" DROP COLUMN "shader_release_id";
  ALTER TABLE "_pages_v" DROP COLUMN "version_hero_shader_release_id";
  ALTER TABLE "_pages_v" DROP COLUMN "version_menu_preview_shader_release_id";
  ALTER TABLE "posts_full_media" DROP COLUMN "shader_release_id";
  ALTER TABLE "posts_media_split" DROP COLUMN "shader_release_id";
  ALTER TABLE "posts_split_narrow" DROP COLUMN "shader_release_id";
  ALTER TABLE "posts_blocks_feature_tabs_tabs" DROP COLUMN "shader_release_id";
  ALTER TABLE "posts" DROP COLUMN "shader_release_id";
  ALTER TABLE "__posts_v_full_media_v" DROP COLUMN "shader_release_id";
  ALTER TABLE "__posts_v_media_split_v" DROP COLUMN "shader_release_id";
  ALTER TABLE "__posts_v_split_narrow_v" DROP COLUMN "shader_release_id";
  ALTER TABLE "_posts_v_blocks_feature_tabs_tabs" DROP COLUMN "shader_release_id";
  ALTER TABLE "_posts_v" DROP COLUMN "version_shader_release_id";
  ALTER TABLE "work_pages_full_media" DROP COLUMN "shader_release_id";
  ALTER TABLE "work_pages_media_split" DROP COLUMN "shader_release_id";
  ALTER TABLE "work_pages_split_narrow" DROP COLUMN "shader_release_id";
  ALTER TABLE "work_pages_blocks_feature_tabs_tabs" DROP COLUMN "shader_release_id";
  ALTER TABLE "work_pages_aud_tabs_tabs" DROP COLUMN "shader_release_id";
  ALTER TABLE "work_pages" DROP COLUMN "hero_shader_release_id";
  ALTER TABLE "work_pages" DROP COLUMN "menu_preview_shader_release_id";
  ALTER TABLE "__work_pages_v_full_media_v" DROP COLUMN "shader_release_id";
  ALTER TABLE "__work_pages_v_media_split_v" DROP COLUMN "shader_release_id";
  ALTER TABLE "__work_pages_v_split_narrow_v" DROP COLUMN "shader_release_id";
  ALTER TABLE "_work_pages_v_blocks_feature_tabs_tabs" DROP COLUMN "shader_release_id";
  ALTER TABLE "__work_pages_v_aud_tabs_v_tabs" DROP COLUMN "shader_release_id";
  ALTER TABLE "_work_pages_v" DROP COLUMN "version_hero_shader_release_id";
  ALTER TABLE "_work_pages_v" DROP COLUMN "version_menu_preview_shader_release_id";
  ALTER TABLE "lab_pages_full_media" DROP COLUMN "shader_release_id";
  ALTER TABLE "lab_pages_media_split" DROP COLUMN "shader_release_id";
  ALTER TABLE "lab_pages_split_narrow" DROP COLUMN "shader_release_id";
  ALTER TABLE "lab_pages_blocks_feature_tabs_tabs" DROP COLUMN "shader_release_id";
  ALTER TABLE "lab_pages" DROP COLUMN "hero_shader_release_id";
  ALTER TABLE "__lab_pages_v_full_media_v" DROP COLUMN "shader_release_id";
  ALTER TABLE "__lab_pages_v_media_split_v" DROP COLUMN "shader_release_id";
  ALTER TABLE "__lab_pages_v_split_narrow_v" DROP COLUMN "shader_release_id";
  ALTER TABLE "_lab_pages_v_blocks_feature_tabs_tabs" DROP COLUMN "shader_release_id";
  ALTER TABLE "_lab_pages_v" DROP COLUMN "version_hero_shader_release_id";
  ALTER TABLE "expertise_pages_full_media" DROP COLUMN "shader_release_id";
  ALTER TABLE "expertise_pages_media_split" DROP COLUMN "shader_release_id";
  ALTER TABLE "expertise_pages_split_narrow" DROP COLUMN "shader_release_id";
  ALTER TABLE "expertise_pages_blocks_feature_tabs_tabs" DROP COLUMN "shader_release_id";
  ALTER TABLE "expertise_pages_aud_tabs_tabs" DROP COLUMN "shader_release_id";
  ALTER TABLE "expertise_pages" DROP COLUMN "hero_shader_release_id";
  ALTER TABLE "expertise_pages" DROP COLUMN "menu_preview_shader_release_id";
  ALTER TABLE "__expertise_pages_v_full_media_v" DROP COLUMN "shader_release_id";
  ALTER TABLE "__expertise_pages_v_media_split_v" DROP COLUMN "shader_release_id";
  ALTER TABLE "__expertise_pages_v_split_narrow_v" DROP COLUMN "shader_release_id";
  ALTER TABLE "_expertise_pages_v_blocks_feature_tabs_tabs" DROP COLUMN "shader_release_id";
  ALTER TABLE "__expertise_pages_v_aud_tabs_v_tabs" DROP COLUMN "shader_release_id";
  ALTER TABLE "_expertise_pages_v" DROP COLUMN "version_hero_shader_release_id";
  ALTER TABLE "_expertise_pages_v" DROP COLUMN "version_menu_preview_shader_release_id";
  ALTER TABLE "audience_pages_full_media" DROP COLUMN "shader_release_id";
  ALTER TABLE "audience_pages_media_split" DROP COLUMN "shader_release_id";
  ALTER TABLE "audience_pages_split_narrow" DROP COLUMN "shader_release_id";
  ALTER TABLE "audience_pages_blocks_feature_tabs_tabs" DROP COLUMN "shader_release_id";
  ALTER TABLE "audience_pages_aud_tabs_tabs" DROP COLUMN "shader_release_id";
  ALTER TABLE "audience_pages" DROP COLUMN "hero_shader_release_id";
  ALTER TABLE "audience_pages" DROP COLUMN "menu_preview_shader_release_id";
  ALTER TABLE "__audience_pages_v_full_media_v" DROP COLUMN "shader_release_id";
  ALTER TABLE "__audience_pages_v_media_split_v" DROP COLUMN "shader_release_id";
  ALTER TABLE "__audience_pages_v_split_narrow_v" DROP COLUMN "shader_release_id";
  ALTER TABLE "_audience_pages_v_blocks_feature_tabs_tabs" DROP COLUMN "shader_release_id";
  ALTER TABLE "__audience_pages_v_aud_tabs_v_tabs" DROP COLUMN "shader_release_id";
  ALTER TABLE "_audience_pages_v" DROP COLUMN "version_hero_shader_release_id";
  ALTER TABLE "_audience_pages_v" DROP COLUMN "version_menu_preview_shader_release_id";
  ALTER TABLE "contact_pages" DROP COLUMN "menu_preview_shader_release_id";
  ALTER TABLE "_contact_pages_v" DROP COLUMN "version_menu_preview_shader_release_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "streak_looks_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "streak_releases_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "streak_renders_id";
  ALTER TABLE "home_full_media" DROP COLUMN "shader_release_id";
  ALTER TABLE "home_media_split" DROP COLUMN "shader_release_id";
  ALTER TABLE "home_split_narrow" DROP COLUMN "shader_release_id";
  ALTER TABLE "home_blocks_feature_tabs_tabs" DROP COLUMN "shader_release_id";
  ALTER TABLE "home_aud_tabs_tabs" DROP COLUMN "shader_release_id";
  ALTER TABLE "home" DROP COLUMN "hero_shader_release_id";
  ALTER TABLE "__home_v_full_media_v" DROP COLUMN "shader_release_id";
  ALTER TABLE "__home_v_media_split_v" DROP COLUMN "shader_release_id";
  ALTER TABLE "__home_v_split_narrow_v" DROP COLUMN "shader_release_id";
  ALTER TABLE "_home_v_blocks_feature_tabs_tabs" DROP COLUMN "shader_release_id";
  ALTER TABLE "__home_v_aud_tabs_v_tabs" DROP COLUMN "shader_release_id";
  ALTER TABLE "_home_v" DROP COLUMN "version_hero_shader_release_id";
  ALTER TABLE "insights_index" DROP COLUMN "hero_shader_release_id";
  ALTER TABLE "insights_index" DROP COLUMN "menu_preview_shader_release_id";
  ALTER TABLE "_insights_index_v" DROP COLUMN "version_hero_shader_release_id";
  ALTER TABLE "_insights_index_v" DROP COLUMN "version_menu_preview_shader_release_id";
  ALTER TABLE "works_index" DROP COLUMN "hero_shader_release_id";
  ALTER TABLE "works_index" DROP COLUMN "menu_preview_shader_release_id";
  ALTER TABLE "_works_index_v" DROP COLUMN "version_hero_shader_release_id";
  ALTER TABLE "_works_index_v" DROP COLUMN "version_menu_preview_shader_release_id";
  DROP TYPE "public"."enum_streak_looks_status";
  DROP TYPE "public"."enum__streak_looks_v_version_status";
  DROP TYPE "public"."enum_streak_renders_kind";
  DROP TYPE "public"."enum_streak_renders_state";`)
}
