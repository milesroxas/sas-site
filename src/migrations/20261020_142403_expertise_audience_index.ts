import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_expertise_index_hero_links_link_type" AS ENUM('reference', 'site', 'custom');
  CREATE TYPE "public"."enum_expertise_index_hero_links_link_site_page" AS ENUM('home', 'works-index', 'insights-index', 'lab-index');
  CREATE TYPE "public"."enum_expertise_index_hero_links_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum_expertise_index_hero_type" AS ENUM('none', 'highImpact', 'mediumImpact', 'lowImpact');
  CREATE TYPE "public"."enum_expertise_index_hero_visual_type" AS ENUM('media', 'streakField', 'lightLeak');
  CREATE TYPE "public"."enum_expertise_index_hero_shader_origin" AS ENUM('top-right', 'top-left', 'bottom-right', 'bottom-left');
  CREATE TYPE "public"."enum_expertise_index_menu_preview_type" AS ENUM('automatic', 'media', 'streakField');
  CREATE TYPE "public"."enum_expertise_index_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__expertise_index_v_version_hero_links_link_type" AS ENUM('reference', 'site', 'custom');
  CREATE TYPE "public"."enum__expertise_index_v_version_hero_links_link_site_page" AS ENUM('home', 'works-index', 'insights-index', 'lab-index');
  CREATE TYPE "public"."enum__expertise_index_v_version_hero_links_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum__expertise_index_v_version_hero_type" AS ENUM('none', 'highImpact', 'mediumImpact', 'lowImpact');
  CREATE TYPE "public"."enum__expertise_index_v_version_hero_visual_type" AS ENUM('media', 'streakField', 'lightLeak');
  CREATE TYPE "public"."enum__expertise_index_v_version_hero_shader_origin" AS ENUM('top-right', 'top-left', 'bottom-right', 'bottom-left');
  CREATE TYPE "public"."enum__expertise_index_v_version_menu_preview_type" AS ENUM('automatic', 'media', 'streakField');
  CREATE TYPE "public"."enum__expertise_index_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_audience_index_hero_links_link_type" AS ENUM('reference', 'site', 'custom');
  CREATE TYPE "public"."enum_audience_index_hero_links_link_site_page" AS ENUM('home', 'works-index', 'insights-index', 'lab-index');
  CREATE TYPE "public"."enum_audience_index_hero_links_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum_audience_index_hero_type" AS ENUM('none', 'highImpact', 'mediumImpact', 'lowImpact');
  CREATE TYPE "public"."enum_audience_index_hero_visual_type" AS ENUM('media', 'streakField', 'lightLeak');
  CREATE TYPE "public"."enum_audience_index_hero_shader_origin" AS ENUM('top-right', 'top-left', 'bottom-right', 'bottom-left');
  CREATE TYPE "public"."enum_audience_index_menu_preview_type" AS ENUM('automatic', 'media', 'streakField');
  CREATE TYPE "public"."enum_audience_index_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__audience_index_v_version_hero_links_link_type" AS ENUM('reference', 'site', 'custom');
  CREATE TYPE "public"."enum__audience_index_v_version_hero_links_link_site_page" AS ENUM('home', 'works-index', 'insights-index', 'lab-index');
  CREATE TYPE "public"."enum__audience_index_v_version_hero_links_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum__audience_index_v_version_hero_type" AS ENUM('none', 'highImpact', 'mediumImpact', 'lowImpact');
  CREATE TYPE "public"."enum__audience_index_v_version_hero_visual_type" AS ENUM('media', 'streakField', 'lightLeak');
  CREATE TYPE "public"."enum__audience_index_v_version_hero_shader_origin" AS ENUM('top-right', 'top-left', 'bottom-right', 'bottom-left');
  CREATE TYPE "public"."enum__audience_index_v_version_menu_preview_type" AS ENUM('automatic', 'media', 'streakField');
  CREATE TYPE "public"."enum__audience_index_v_version_status" AS ENUM('draft', 'published');
  CREATE TABLE "expertise_index_hero_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_expertise_index_hero_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_site_page" "enum_expertise_index_hero_links_link_site_page",
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum_expertise_index_hero_links_link_appearance" DEFAULT 'default'
  );
  
  CREATE TABLE "expertise_index" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar DEFAULT 'Expertise Index',
  	"hero_type" "enum_expertise_index_hero_type" DEFAULT 'lowImpact',
  	"hero_eyebrow" varchar,
  	"hero_title" varchar,
  	"hero_rich_text" jsonb,
  	"hero_description" varchar,
  	"hero_media_id" integer,
  	"hero_visual_type" "enum_expertise_index_hero_visual_type",
  	"hero_shader_studio_id" integer,
  	"hero_shader_preset" varchar,
  	"hero_shader_seed" numeric,
  	"hero_shader_speed" numeric,
  	"hero_shader_intensity" numeric,
  	"hero_shader_release_id" integer,
  	"hero_shader_bleed" boolean DEFAULT false,
  	"hero_shader_origin" "enum_expertise_index_hero_shader_origin" DEFAULT 'top-right',
  	"hero_shader_show_media" boolean DEFAULT false,
  	"hero_shader_surface" "enum_visual_surface" DEFAULT 'auto',
  	"hero_shader_pointer_interaction" boolean DEFAULT false,
  	"hero_shader_hover_targets" "enum_leak_hover_targets",
  	"hero_shader_section_hover" numeric,
  	"hero_shader_poster_media_id" integer,
  	"meta_title" varchar,
  	"meta_image_id" integer,
  	"meta_description" varchar,
  	"meta_og_title" varchar,
  	"meta_og_description" varchar,
  	"meta_og_image_id" integer,
  	"menu_preview_type" "enum_expertise_index_menu_preview_type" DEFAULT 'automatic',
  	"menu_preview_id" integer,
  	"menu_preview_shader_studio_id" integer,
  	"menu_preview_shader_preset" varchar,
  	"menu_preview_shader_seed" numeric,
  	"menu_preview_shader_speed" numeric,
  	"menu_preview_shader_intensity" numeric,
  	"menu_preview_shader_release_id" integer,
  	"menu_preview_shader_surface" "enum_visual_surface" DEFAULT 'auto',
  	"menu_preview_shader_pointer_interaction" boolean DEFAULT false,
  	"menu_preview_shader_poster_media_id" integer,
  	"_status" "enum_expertise_index_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "expertise_index_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"posts_id" integer,
  	"contact_pages_id" integer
  );
  
  CREATE TABLE "_expertise_index_v_version_hero_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_type" "enum__expertise_index_v_version_hero_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_site_page" "enum__expertise_index_v_version_hero_links_link_site_page",
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum__expertise_index_v_version_hero_links_link_appearance" DEFAULT 'default',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_expertise_index_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_title" varchar DEFAULT 'Expertise Index',
  	"version_hero_type" "enum__expertise_index_v_version_hero_type" DEFAULT 'lowImpact',
  	"version_hero_eyebrow" varchar,
  	"version_hero_title" varchar,
  	"version_hero_rich_text" jsonb,
  	"version_hero_description" varchar,
  	"version_hero_media_id" integer,
  	"version_hero_visual_type" "enum__expertise_index_v_version_hero_visual_type",
  	"version_hero_shader_studio_id" integer,
  	"version_hero_shader_preset" varchar,
  	"version_hero_shader_seed" numeric,
  	"version_hero_shader_speed" numeric,
  	"version_hero_shader_intensity" numeric,
  	"version_hero_shader_release_id" integer,
  	"version_hero_shader_bleed" boolean DEFAULT false,
  	"version_hero_shader_origin" "enum__expertise_index_v_version_hero_shader_origin" DEFAULT 'top-right',
  	"version_hero_shader_show_media" boolean DEFAULT false,
  	"version_hero_shader_surface" "enum_visual_surface" DEFAULT 'auto',
  	"version_hero_shader_pointer_interaction" boolean DEFAULT false,
  	"version_hero_shader_hover_targets" "enum_leak_hover_targets",
  	"version_hero_shader_section_hover" numeric,
  	"version_hero_shader_poster_media_id" integer,
  	"version_meta_title" varchar,
  	"version_meta_image_id" integer,
  	"version_meta_description" varchar,
  	"version_meta_og_title" varchar,
  	"version_meta_og_description" varchar,
  	"version_meta_og_image_id" integer,
  	"version_menu_preview_type" "enum__expertise_index_v_version_menu_preview_type" DEFAULT 'automatic',
  	"version_menu_preview_id" integer,
  	"version_menu_preview_shader_studio_id" integer,
  	"version_menu_preview_shader_preset" varchar,
  	"version_menu_preview_shader_seed" numeric,
  	"version_menu_preview_shader_speed" numeric,
  	"version_menu_preview_shader_intensity" numeric,
  	"version_menu_preview_shader_release_id" integer,
  	"version_menu_preview_shader_surface" "enum_visual_surface" DEFAULT 'auto',
  	"version_menu_preview_shader_pointer_interaction" boolean DEFAULT false,
  	"version_menu_preview_shader_poster_media_id" integer,
  	"version__status" "enum__expertise_index_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_expertise_index_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"posts_id" integer,
  	"contact_pages_id" integer
  );
  
  CREATE TABLE "audience_index_hero_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_audience_index_hero_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_site_page" "enum_audience_index_hero_links_link_site_page",
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum_audience_index_hero_links_link_appearance" DEFAULT 'default'
  );
  
  CREATE TABLE "audience_index" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar DEFAULT 'Who We Help Index',
  	"hero_type" "enum_audience_index_hero_type" DEFAULT 'lowImpact',
  	"hero_eyebrow" varchar,
  	"hero_title" varchar,
  	"hero_rich_text" jsonb,
  	"hero_description" varchar,
  	"hero_media_id" integer,
  	"hero_visual_type" "enum_audience_index_hero_visual_type",
  	"hero_shader_studio_id" integer,
  	"hero_shader_preset" varchar,
  	"hero_shader_seed" numeric,
  	"hero_shader_speed" numeric,
  	"hero_shader_intensity" numeric,
  	"hero_shader_release_id" integer,
  	"hero_shader_bleed" boolean DEFAULT false,
  	"hero_shader_origin" "enum_audience_index_hero_shader_origin" DEFAULT 'top-right',
  	"hero_shader_show_media" boolean DEFAULT false,
  	"hero_shader_surface" "enum_visual_surface" DEFAULT 'auto',
  	"hero_shader_pointer_interaction" boolean DEFAULT false,
  	"hero_shader_hover_targets" "enum_leak_hover_targets",
  	"hero_shader_section_hover" numeric,
  	"hero_shader_poster_media_id" integer,
  	"meta_title" varchar,
  	"meta_image_id" integer,
  	"meta_description" varchar,
  	"meta_og_title" varchar,
  	"meta_og_description" varchar,
  	"meta_og_image_id" integer,
  	"menu_preview_type" "enum_audience_index_menu_preview_type" DEFAULT 'automatic',
  	"menu_preview_id" integer,
  	"menu_preview_shader_studio_id" integer,
  	"menu_preview_shader_preset" varchar,
  	"menu_preview_shader_seed" numeric,
  	"menu_preview_shader_speed" numeric,
  	"menu_preview_shader_intensity" numeric,
  	"menu_preview_shader_release_id" integer,
  	"menu_preview_shader_surface" "enum_visual_surface" DEFAULT 'auto',
  	"menu_preview_shader_pointer_interaction" boolean DEFAULT false,
  	"menu_preview_shader_poster_media_id" integer,
  	"_status" "enum_audience_index_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "audience_index_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"posts_id" integer,
  	"contact_pages_id" integer
  );
  
  CREATE TABLE "_audience_index_v_version_hero_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_type" "enum__audience_index_v_version_hero_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_site_page" "enum__audience_index_v_version_hero_links_link_site_page",
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum__audience_index_v_version_hero_links_link_appearance" DEFAULT 'default',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_audience_index_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_title" varchar DEFAULT 'Who We Help Index',
  	"version_hero_type" "enum__audience_index_v_version_hero_type" DEFAULT 'lowImpact',
  	"version_hero_eyebrow" varchar,
  	"version_hero_title" varchar,
  	"version_hero_rich_text" jsonb,
  	"version_hero_description" varchar,
  	"version_hero_media_id" integer,
  	"version_hero_visual_type" "enum__audience_index_v_version_hero_visual_type",
  	"version_hero_shader_studio_id" integer,
  	"version_hero_shader_preset" varchar,
  	"version_hero_shader_seed" numeric,
  	"version_hero_shader_speed" numeric,
  	"version_hero_shader_intensity" numeric,
  	"version_hero_shader_release_id" integer,
  	"version_hero_shader_bleed" boolean DEFAULT false,
  	"version_hero_shader_origin" "enum__audience_index_v_version_hero_shader_origin" DEFAULT 'top-right',
  	"version_hero_shader_show_media" boolean DEFAULT false,
  	"version_hero_shader_surface" "enum_visual_surface" DEFAULT 'auto',
  	"version_hero_shader_pointer_interaction" boolean DEFAULT false,
  	"version_hero_shader_hover_targets" "enum_leak_hover_targets",
  	"version_hero_shader_section_hover" numeric,
  	"version_hero_shader_poster_media_id" integer,
  	"version_meta_title" varchar,
  	"version_meta_image_id" integer,
  	"version_meta_description" varchar,
  	"version_meta_og_title" varchar,
  	"version_meta_og_description" varchar,
  	"version_meta_og_image_id" integer,
  	"version_menu_preview_type" "enum__audience_index_v_version_menu_preview_type" DEFAULT 'automatic',
  	"version_menu_preview_id" integer,
  	"version_menu_preview_shader_studio_id" integer,
  	"version_menu_preview_shader_preset" varchar,
  	"version_menu_preview_shader_seed" numeric,
  	"version_menu_preview_shader_speed" numeric,
  	"version_menu_preview_shader_intensity" numeric,
  	"version_menu_preview_shader_release_id" integer,
  	"version_menu_preview_shader_surface" "enum_visual_surface" DEFAULT 'auto',
  	"version_menu_preview_shader_pointer_interaction" boolean DEFAULT false,
  	"version_menu_preview_shader_poster_media_id" integer,
  	"version__status" "enum__audience_index_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_audience_index_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"posts_id" integer,
  	"contact_pages_id" integer
  );
  
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "audience_index_find" boolean DEFAULT false;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "audience_index_update" boolean DEFAULT false;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "expertise_index_find" boolean DEFAULT false;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "expertise_index_update" boolean DEFAULT false;
  ALTER TABLE "expertise_index_hero_links" ADD CONSTRAINT "expertise_index_hero_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."expertise_index"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "expertise_index" ADD CONSTRAINT "expertise_index_hero_media_id_media_id_fk" FOREIGN KEY ("hero_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "expertise_index" ADD CONSTRAINT "expertise_index_hero_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("hero_shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "expertise_index" ADD CONSTRAINT "expertise_index_hero_shader_release_id_streak_releases_id_fk" FOREIGN KEY ("hero_shader_release_id") REFERENCES "public"."streak_releases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "expertise_index" ADD CONSTRAINT "expertise_index_hero_shader_poster_media_id_media_id_fk" FOREIGN KEY ("hero_shader_poster_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "expertise_index" ADD CONSTRAINT "expertise_index_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "expertise_index" ADD CONSTRAINT "expertise_index_meta_og_image_id_media_id_fk" FOREIGN KEY ("meta_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "expertise_index" ADD CONSTRAINT "expertise_index_menu_preview_id_media_id_fk" FOREIGN KEY ("menu_preview_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "expertise_index" ADD CONSTRAINT "expertise_index_menu_preview_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("menu_preview_shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "expertise_index" ADD CONSTRAINT "expertise_index_menu_preview_shader_release_id_streak_releases_id_fk" FOREIGN KEY ("menu_preview_shader_release_id") REFERENCES "public"."streak_releases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "expertise_index" ADD CONSTRAINT "expertise_index_menu_preview_shader_poster_media_id_media_id_fk" FOREIGN KEY ("menu_preview_shader_poster_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "expertise_index_rels" ADD CONSTRAINT "expertise_index_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."expertise_index"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "expertise_index_rels" ADD CONSTRAINT "expertise_index_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "expertise_index_rels" ADD CONSTRAINT "expertise_index_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "expertise_index_rels" ADD CONSTRAINT "expertise_index_rels_contact_pages_fk" FOREIGN KEY ("contact_pages_id") REFERENCES "public"."contact_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_expertise_index_v_version_hero_links" ADD CONSTRAINT "_expertise_index_v_version_hero_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_expertise_index_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_expertise_index_v" ADD CONSTRAINT "_expertise_index_v_version_hero_media_id_media_id_fk" FOREIGN KEY ("version_hero_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_expertise_index_v" ADD CONSTRAINT "_expertise_index_v_version_hero_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("version_hero_shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_expertise_index_v" ADD CONSTRAINT "_expertise_index_v_version_hero_shader_release_id_streak_releases_id_fk" FOREIGN KEY ("version_hero_shader_release_id") REFERENCES "public"."streak_releases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_expertise_index_v" ADD CONSTRAINT "_expertise_index_v_version_hero_shader_poster_media_id_media_id_fk" FOREIGN KEY ("version_hero_shader_poster_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_expertise_index_v" ADD CONSTRAINT "_expertise_index_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_expertise_index_v" ADD CONSTRAINT "_expertise_index_v_version_meta_og_image_id_media_id_fk" FOREIGN KEY ("version_meta_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_expertise_index_v" ADD CONSTRAINT "_expertise_index_v_version_menu_preview_id_media_id_fk" FOREIGN KEY ("version_menu_preview_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_expertise_index_v" ADD CONSTRAINT "_expertise_index_v_version_menu_preview_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("version_menu_preview_shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_expertise_index_v" ADD CONSTRAINT "_expertise_index_v_version_menu_preview_shader_release_id_streak_releases_id_fk" FOREIGN KEY ("version_menu_preview_shader_release_id") REFERENCES "public"."streak_releases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_expertise_index_v" ADD CONSTRAINT "_expertise_index_v_version_menu_preview_shader_poster_media_id_media_id_fk" FOREIGN KEY ("version_menu_preview_shader_poster_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_expertise_index_v_rels" ADD CONSTRAINT "_expertise_index_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_expertise_index_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_expertise_index_v_rels" ADD CONSTRAINT "_expertise_index_v_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_expertise_index_v_rels" ADD CONSTRAINT "_expertise_index_v_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_expertise_index_v_rels" ADD CONSTRAINT "_expertise_index_v_rels_contact_pages_fk" FOREIGN KEY ("contact_pages_id") REFERENCES "public"."contact_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "audience_index_hero_links" ADD CONSTRAINT "audience_index_hero_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."audience_index"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "audience_index" ADD CONSTRAINT "audience_index_hero_media_id_media_id_fk" FOREIGN KEY ("hero_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "audience_index" ADD CONSTRAINT "audience_index_hero_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("hero_shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "audience_index" ADD CONSTRAINT "audience_index_hero_shader_release_id_streak_releases_id_fk" FOREIGN KEY ("hero_shader_release_id") REFERENCES "public"."streak_releases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "audience_index" ADD CONSTRAINT "audience_index_hero_shader_poster_media_id_media_id_fk" FOREIGN KEY ("hero_shader_poster_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "audience_index" ADD CONSTRAINT "audience_index_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "audience_index" ADD CONSTRAINT "audience_index_meta_og_image_id_media_id_fk" FOREIGN KEY ("meta_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "audience_index" ADD CONSTRAINT "audience_index_menu_preview_id_media_id_fk" FOREIGN KEY ("menu_preview_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "audience_index" ADD CONSTRAINT "audience_index_menu_preview_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("menu_preview_shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "audience_index" ADD CONSTRAINT "audience_index_menu_preview_shader_release_id_streak_releases_id_fk" FOREIGN KEY ("menu_preview_shader_release_id") REFERENCES "public"."streak_releases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "audience_index" ADD CONSTRAINT "audience_index_menu_preview_shader_poster_media_id_media_id_fk" FOREIGN KEY ("menu_preview_shader_poster_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "audience_index_rels" ADD CONSTRAINT "audience_index_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."audience_index"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "audience_index_rels" ADD CONSTRAINT "audience_index_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "audience_index_rels" ADD CONSTRAINT "audience_index_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "audience_index_rels" ADD CONSTRAINT "audience_index_rels_contact_pages_fk" FOREIGN KEY ("contact_pages_id") REFERENCES "public"."contact_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_audience_index_v_version_hero_links" ADD CONSTRAINT "_audience_index_v_version_hero_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_audience_index_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_audience_index_v" ADD CONSTRAINT "_audience_index_v_version_hero_media_id_media_id_fk" FOREIGN KEY ("version_hero_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_audience_index_v" ADD CONSTRAINT "_audience_index_v_version_hero_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("version_hero_shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_audience_index_v" ADD CONSTRAINT "_audience_index_v_version_hero_shader_release_id_streak_releases_id_fk" FOREIGN KEY ("version_hero_shader_release_id") REFERENCES "public"."streak_releases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_audience_index_v" ADD CONSTRAINT "_audience_index_v_version_hero_shader_poster_media_id_media_id_fk" FOREIGN KEY ("version_hero_shader_poster_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_audience_index_v" ADD CONSTRAINT "_audience_index_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_audience_index_v" ADD CONSTRAINT "_audience_index_v_version_meta_og_image_id_media_id_fk" FOREIGN KEY ("version_meta_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_audience_index_v" ADD CONSTRAINT "_audience_index_v_version_menu_preview_id_media_id_fk" FOREIGN KEY ("version_menu_preview_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_audience_index_v" ADD CONSTRAINT "_audience_index_v_version_menu_preview_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("version_menu_preview_shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_audience_index_v" ADD CONSTRAINT "_audience_index_v_version_menu_preview_shader_release_id_streak_releases_id_fk" FOREIGN KEY ("version_menu_preview_shader_release_id") REFERENCES "public"."streak_releases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_audience_index_v" ADD CONSTRAINT "_audience_index_v_version_menu_preview_shader_poster_media_id_media_id_fk" FOREIGN KEY ("version_menu_preview_shader_poster_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_audience_index_v_rels" ADD CONSTRAINT "_audience_index_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_audience_index_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_audience_index_v_rels" ADD CONSTRAINT "_audience_index_v_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_audience_index_v_rels" ADD CONSTRAINT "_audience_index_v_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_audience_index_v_rels" ADD CONSTRAINT "_audience_index_v_rels_contact_pages_fk" FOREIGN KEY ("contact_pages_id") REFERENCES "public"."contact_pages"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "expertise_index_hero_links_order_idx" ON "expertise_index_hero_links" USING btree ("_order");
  CREATE INDEX "expertise_index_hero_links_parent_id_idx" ON "expertise_index_hero_links" USING btree ("_parent_id");
  CREATE INDEX "expertise_index_hero_hero_media_idx" ON "expertise_index" USING btree ("hero_media_id");
  CREATE INDEX "expertise_index_hero_shader_hero_shader_studio_idx" ON "expertise_index" USING btree ("hero_shader_studio_id");
  CREATE INDEX "expertise_index_hero_shader_hero_shader_release_idx" ON "expertise_index" USING btree ("hero_shader_release_id");
  CREATE INDEX "expertise_index_hero_shader_hero_shader_poster_media_idx" ON "expertise_index" USING btree ("hero_shader_poster_media_id");
  CREATE INDEX "expertise_index_meta_meta_image_idx" ON "expertise_index" USING btree ("meta_image_id");
  CREATE INDEX "expertise_index_meta_og_meta_og_image_idx" ON "expertise_index" USING btree ("meta_og_image_id");
  CREATE INDEX "expertise_index_menu_preview_idx" ON "expertise_index" USING btree ("menu_preview_id");
  CREATE INDEX "expertise_index_menu_preview_shader_menu_preview_shader__idx" ON "expertise_index" USING btree ("menu_preview_shader_studio_id");
  CREATE INDEX "expertise_index_menu_preview_shader_menu_preview_shade_1_idx" ON "expertise_index" USING btree ("menu_preview_shader_release_id");
  CREATE INDEX "expertise_index_menu_preview_shader_menu_preview_shade_2_idx" ON "expertise_index" USING btree ("menu_preview_shader_poster_media_id");
  CREATE INDEX "expertise_index__status_idx" ON "expertise_index" USING btree ("_status");
  CREATE INDEX "expertise_index_rels_order_idx" ON "expertise_index_rels" USING btree ("order");
  CREATE INDEX "expertise_index_rels_parent_idx" ON "expertise_index_rels" USING btree ("parent_id");
  CREATE INDEX "expertise_index_rels_path_idx" ON "expertise_index_rels" USING btree ("path");
  CREATE INDEX "expertise_index_rels_pages_id_idx" ON "expertise_index_rels" USING btree ("pages_id");
  CREATE INDEX "expertise_index_rels_posts_id_idx" ON "expertise_index_rels" USING btree ("posts_id");
  CREATE INDEX "expertise_index_rels_contact_pages_id_idx" ON "expertise_index_rels" USING btree ("contact_pages_id");
  CREATE INDEX "_expertise_index_v_version_hero_links_order_idx" ON "_expertise_index_v_version_hero_links" USING btree ("_order");
  CREATE INDEX "_expertise_index_v_version_hero_links_parent_id_idx" ON "_expertise_index_v_version_hero_links" USING btree ("_parent_id");
  CREATE INDEX "_expertise_index_v_version_hero_version_hero_media_idx" ON "_expertise_index_v" USING btree ("version_hero_media_id");
  CREATE INDEX "_expertise_index_v_version_hero_shader_version_hero_shad_idx" ON "_expertise_index_v" USING btree ("version_hero_shader_studio_id");
  CREATE INDEX "_expertise_index_v_version_hero_shader_version_hero_sh_1_idx" ON "_expertise_index_v" USING btree ("version_hero_shader_release_id");
  CREATE INDEX "_expertise_index_v_version_hero_shader_version_hero_sh_2_idx" ON "_expertise_index_v" USING btree ("version_hero_shader_poster_media_id");
  CREATE INDEX "_expertise_index_v_version_meta_version_meta_image_idx" ON "_expertise_index_v" USING btree ("version_meta_image_id");
  CREATE INDEX "_expertise_index_v_version_meta_og_version_meta_og_image_idx" ON "_expertise_index_v" USING btree ("version_meta_og_image_id");
  CREATE INDEX "_expertise_index_v_version_version_menu_preview_idx" ON "_expertise_index_v" USING btree ("version_menu_preview_id");
  CREATE INDEX "_expertise_index_v_version_menu_preview_shader_version_m_idx" ON "_expertise_index_v" USING btree ("version_menu_preview_shader_studio_id");
  CREATE INDEX "_expertise_index_v_version_menu_preview_shader_version_1_idx" ON "_expertise_index_v" USING btree ("version_menu_preview_shader_release_id");
  CREATE INDEX "_expertise_index_v_version_menu_preview_shader_version_2_idx" ON "_expertise_index_v" USING btree ("version_menu_preview_shader_poster_media_id");
  CREATE INDEX "_expertise_index_v_version_version__status_idx" ON "_expertise_index_v" USING btree ("version__status");
  CREATE INDEX "_expertise_index_v_created_at_idx" ON "_expertise_index_v" USING btree ("created_at");
  CREATE INDEX "_expertise_index_v_updated_at_idx" ON "_expertise_index_v" USING btree ("updated_at");
  CREATE INDEX "_expertise_index_v_latest_idx" ON "_expertise_index_v" USING btree ("latest");
  CREATE INDEX "_expertise_index_v_autosave_idx" ON "_expertise_index_v" USING btree ("autosave");
  CREATE INDEX "_expertise_index_v_rels_order_idx" ON "_expertise_index_v_rels" USING btree ("order");
  CREATE INDEX "_expertise_index_v_rels_parent_idx" ON "_expertise_index_v_rels" USING btree ("parent_id");
  CREATE INDEX "_expertise_index_v_rels_path_idx" ON "_expertise_index_v_rels" USING btree ("path");
  CREATE INDEX "_expertise_index_v_rels_pages_id_idx" ON "_expertise_index_v_rels" USING btree ("pages_id");
  CREATE INDEX "_expertise_index_v_rels_posts_id_idx" ON "_expertise_index_v_rels" USING btree ("posts_id");
  CREATE INDEX "_expertise_index_v_rels_contact_pages_id_idx" ON "_expertise_index_v_rels" USING btree ("contact_pages_id");
  CREATE INDEX "audience_index_hero_links_order_idx" ON "audience_index_hero_links" USING btree ("_order");
  CREATE INDEX "audience_index_hero_links_parent_id_idx" ON "audience_index_hero_links" USING btree ("_parent_id");
  CREATE INDEX "audience_index_hero_hero_media_idx" ON "audience_index" USING btree ("hero_media_id");
  CREATE INDEX "audience_index_hero_shader_hero_shader_studio_idx" ON "audience_index" USING btree ("hero_shader_studio_id");
  CREATE INDEX "audience_index_hero_shader_hero_shader_release_idx" ON "audience_index" USING btree ("hero_shader_release_id");
  CREATE INDEX "audience_index_hero_shader_hero_shader_poster_media_idx" ON "audience_index" USING btree ("hero_shader_poster_media_id");
  CREATE INDEX "audience_index_meta_meta_image_idx" ON "audience_index" USING btree ("meta_image_id");
  CREATE INDEX "audience_index_meta_og_meta_og_image_idx" ON "audience_index" USING btree ("meta_og_image_id");
  CREATE INDEX "audience_index_menu_preview_idx" ON "audience_index" USING btree ("menu_preview_id");
  CREATE INDEX "audience_index_menu_preview_shader_menu_preview_shader_s_idx" ON "audience_index" USING btree ("menu_preview_shader_studio_id");
  CREATE INDEX "audience_index_menu_preview_shader_menu_preview_shader_r_idx" ON "audience_index" USING btree ("menu_preview_shader_release_id");
  CREATE INDEX "audience_index_menu_preview_shader_menu_preview_shader_p_idx" ON "audience_index" USING btree ("menu_preview_shader_poster_media_id");
  CREATE INDEX "audience_index__status_idx" ON "audience_index" USING btree ("_status");
  CREATE INDEX "audience_index_rels_order_idx" ON "audience_index_rels" USING btree ("order");
  CREATE INDEX "audience_index_rels_parent_idx" ON "audience_index_rels" USING btree ("parent_id");
  CREATE INDEX "audience_index_rels_path_idx" ON "audience_index_rels" USING btree ("path");
  CREATE INDEX "audience_index_rels_pages_id_idx" ON "audience_index_rels" USING btree ("pages_id");
  CREATE INDEX "audience_index_rels_posts_id_idx" ON "audience_index_rels" USING btree ("posts_id");
  CREATE INDEX "audience_index_rels_contact_pages_id_idx" ON "audience_index_rels" USING btree ("contact_pages_id");
  CREATE INDEX "_audience_index_v_version_hero_links_order_idx" ON "_audience_index_v_version_hero_links" USING btree ("_order");
  CREATE INDEX "_audience_index_v_version_hero_links_parent_id_idx" ON "_audience_index_v_version_hero_links" USING btree ("_parent_id");
  CREATE INDEX "_audience_index_v_version_hero_version_hero_media_idx" ON "_audience_index_v" USING btree ("version_hero_media_id");
  CREATE INDEX "_audience_index_v_version_hero_shader_version_hero_shade_idx" ON "_audience_index_v" USING btree ("version_hero_shader_studio_id");
  CREATE INDEX "_audience_index_v_version_hero_shader_version_hero_sha_1_idx" ON "_audience_index_v" USING btree ("version_hero_shader_release_id");
  CREATE INDEX "_audience_index_v_version_hero_shader_version_hero_sha_2_idx" ON "_audience_index_v" USING btree ("version_hero_shader_poster_media_id");
  CREATE INDEX "_audience_index_v_version_meta_version_meta_image_idx" ON "_audience_index_v" USING btree ("version_meta_image_id");
  CREATE INDEX "_audience_index_v_version_meta_og_version_meta_og_image_idx" ON "_audience_index_v" USING btree ("version_meta_og_image_id");
  CREATE INDEX "_audience_index_v_version_version_menu_preview_idx" ON "_audience_index_v" USING btree ("version_menu_preview_id");
  CREATE INDEX "_audience_index_v_version_menu_preview_shader_version_me_idx" ON "_audience_index_v" USING btree ("version_menu_preview_shader_studio_id");
  CREATE INDEX "_audience_index_v_version_menu_preview_shader_version__1_idx" ON "_audience_index_v" USING btree ("version_menu_preview_shader_release_id");
  CREATE INDEX "_audience_index_v_version_menu_preview_shader_version__2_idx" ON "_audience_index_v" USING btree ("version_menu_preview_shader_poster_media_id");
  CREATE INDEX "_audience_index_v_version_version__status_idx" ON "_audience_index_v" USING btree ("version__status");
  CREATE INDEX "_audience_index_v_created_at_idx" ON "_audience_index_v" USING btree ("created_at");
  CREATE INDEX "_audience_index_v_updated_at_idx" ON "_audience_index_v" USING btree ("updated_at");
  CREATE INDEX "_audience_index_v_latest_idx" ON "_audience_index_v" USING btree ("latest");
  CREATE INDEX "_audience_index_v_autosave_idx" ON "_audience_index_v" USING btree ("autosave");
  CREATE INDEX "_audience_index_v_rels_order_idx" ON "_audience_index_v_rels" USING btree ("order");
  CREATE INDEX "_audience_index_v_rels_parent_idx" ON "_audience_index_v_rels" USING btree ("parent_id");
  CREATE INDEX "_audience_index_v_rels_path_idx" ON "_audience_index_v_rels" USING btree ("path");
  CREATE INDEX "_audience_index_v_rels_pages_id_idx" ON "_audience_index_v_rels" USING btree ("pages_id");
  CREATE INDEX "_audience_index_v_rels_posts_id_idx" ON "_audience_index_v_rels" USING btree ("posts_id");
  CREATE INDEX "_audience_index_v_rels_contact_pages_id_idx" ON "_audience_index_v_rels" USING btree ("contact_pages_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "expertise_index_hero_links" CASCADE;
  DROP TABLE "expertise_index" CASCADE;
  DROP TABLE "expertise_index_rels" CASCADE;
  DROP TABLE "_expertise_index_v_version_hero_links" CASCADE;
  DROP TABLE "_expertise_index_v" CASCADE;
  DROP TABLE "_expertise_index_v_rels" CASCADE;
  DROP TABLE "audience_index_hero_links" CASCADE;
  DROP TABLE "audience_index" CASCADE;
  DROP TABLE "audience_index_rels" CASCADE;
  DROP TABLE "_audience_index_v_version_hero_links" CASCADE;
  DROP TABLE "_audience_index_v" CASCADE;
  DROP TABLE "_audience_index_v_rels" CASCADE;
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "audience_index_find";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "audience_index_update";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "expertise_index_find";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "expertise_index_update";
  DROP TYPE "public"."enum_expertise_index_hero_links_link_type";
  DROP TYPE "public"."enum_expertise_index_hero_links_link_site_page";
  DROP TYPE "public"."enum_expertise_index_hero_links_link_appearance";
  DROP TYPE "public"."enum_expertise_index_hero_type";
  DROP TYPE "public"."enum_expertise_index_hero_visual_type";
  DROP TYPE "public"."enum_expertise_index_hero_shader_origin";
  DROP TYPE "public"."enum_expertise_index_menu_preview_type";
  DROP TYPE "public"."enum_expertise_index_status";
  DROP TYPE "public"."enum__expertise_index_v_version_hero_links_link_type";
  DROP TYPE "public"."enum__expertise_index_v_version_hero_links_link_site_page";
  DROP TYPE "public"."enum__expertise_index_v_version_hero_links_link_appearance";
  DROP TYPE "public"."enum__expertise_index_v_version_hero_type";
  DROP TYPE "public"."enum__expertise_index_v_version_hero_visual_type";
  DROP TYPE "public"."enum__expertise_index_v_version_hero_shader_origin";
  DROP TYPE "public"."enum__expertise_index_v_version_menu_preview_type";
  DROP TYPE "public"."enum__expertise_index_v_version_status";
  DROP TYPE "public"."enum_audience_index_hero_links_link_type";
  DROP TYPE "public"."enum_audience_index_hero_links_link_site_page";
  DROP TYPE "public"."enum_audience_index_hero_links_link_appearance";
  DROP TYPE "public"."enum_audience_index_hero_type";
  DROP TYPE "public"."enum_audience_index_hero_visual_type";
  DROP TYPE "public"."enum_audience_index_hero_shader_origin";
  DROP TYPE "public"."enum_audience_index_menu_preview_type";
  DROP TYPE "public"."enum_audience_index_status";
  DROP TYPE "public"."enum__audience_index_v_version_hero_links_link_type";
  DROP TYPE "public"."enum__audience_index_v_version_hero_links_link_site_page";
  DROP TYPE "public"."enum__audience_index_v_version_hero_links_link_appearance";
  DROP TYPE "public"."enum__audience_index_v_version_hero_type";
  DROP TYPE "public"."enum__audience_index_v_version_hero_visual_type";
  DROP TYPE "public"."enum__audience_index_v_version_hero_shader_origin";
  DROP TYPE "public"."enum__audience_index_v_version_menu_preview_type";
  DROP TYPE "public"."enum__audience_index_v_version_status";`)
}
