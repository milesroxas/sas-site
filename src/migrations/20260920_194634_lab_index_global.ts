import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_lab_index_hero_links_link_type" AS ENUM('reference', 'site', 'custom');
  CREATE TYPE "public"."enum_lab_index_hero_links_link_site_page" AS ENUM('home', 'works-index', 'insights-index', 'lab-index');
  CREATE TYPE "public"."enum_lab_index_hero_links_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum_lab_index_hero_type" AS ENUM('none', 'highImpact', 'mediumImpact', 'lowImpact');
  CREATE TYPE "public"."enum_lab_index_hero_visual_type" AS ENUM('media', 'streakField');
  CREATE TYPE "public"."enum_lab_index_menu_preview_type" AS ENUM('automatic', 'media', 'streakField');
  CREATE TYPE "public"."enum_lab_index_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__lab_index_v_version_hero_links_link_type" AS ENUM('reference', 'site', 'custom');
  CREATE TYPE "public"."enum__lab_index_v_version_hero_links_link_site_page" AS ENUM('home', 'works-index', 'insights-index', 'lab-index');
  CREATE TYPE "public"."enum__lab_index_v_version_hero_links_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum__lab_index_v_version_hero_type" AS ENUM('none', 'highImpact', 'mediumImpact', 'lowImpact');
  CREATE TYPE "public"."enum__lab_index_v_version_hero_visual_type" AS ENUM('media', 'streakField');
  CREATE TYPE "public"."enum__lab_index_v_version_menu_preview_type" AS ENUM('automatic', 'media', 'streakField');
  CREATE TYPE "public"."enum__lab_index_v_version_status" AS ENUM('draft', 'published');
  ALTER TYPE "public"."enum_pages_hero_links_link_site_page" ADD VALUE 'lab-index';
  ALTER TYPE "public"."enum_pages_faq_link_site_page" ADD VALUE 'lab-index';
  ALTER TYPE "public"."enum_pages_blocks_content_columns_link_site_page" ADD VALUE 'lab-index';
  ALTER TYPE "public"."enum_pages_blocks_testimonials_marquee_links_link_site_page" ADD VALUE 'lab-index';
  ALTER TYPE "public"."enum_pages_stmt_links_links_link_site_page" ADD VALUE 'lab-index';
  ALTER TYPE "public"."enum_pages_blocks_cta_links_link_site_page" ADD VALUE 'lab-index';
  ALTER TYPE "public"."enum_pages_closing_cl_link_site_page" ADD VALUE 'lab-index';
  ALTER TYPE "public"."enum__pages_v_version_hero_links_link_site_page" ADD VALUE 'lab-index';
  ALTER TYPE "public"."enum___pages_v_faq_v_link_site_page" ADD VALUE 'lab-index';
  ALTER TYPE "public"."enum__pages_v_blocks_content_columns_link_site_page" ADD VALUE 'lab-index';
  ALTER TYPE "public"."enum__pages_v_blocks_testimonials_marquee_links_link_site_page" ADD VALUE 'lab-index';
  ALTER TYPE "public"."enum___pages_v_stmt_links_v_links_link_site_page" ADD VALUE 'lab-index';
  ALTER TYPE "public"."enum__pages_v_blocks_cta_links_link_site_page" ADD VALUE 'lab-index';
  ALTER TYPE "public"."enum___pages_v_version_closing_cl_v_link_site_page" ADD VALUE 'lab-index';
  ALTER TYPE "public"."enum_posts_faq_link_site_page" ADD VALUE 'lab-index';
  ALTER TYPE "public"."enum_posts_blocks_content_columns_link_site_page" ADD VALUE 'lab-index';
  ALTER TYPE "public"."enum_posts_closing_cl_link_site_page" ADD VALUE 'lab-index';
  ALTER TYPE "public"."enum___posts_v_faq_v_link_site_page" ADD VALUE 'lab-index';
  ALTER TYPE "public"."enum__posts_v_blocks_content_columns_link_site_page" ADD VALUE 'lab-index';
  ALTER TYPE "public"."enum___posts_v_version_closing_cl_v_link_site_page" ADD VALUE 'lab-index';
  ALTER TYPE "public"."enum_work_pages_faq_link_site_page" ADD VALUE 'lab-index';
  ALTER TYPE "public"."enum_work_pages_blocks_content_columns_link_site_page" ADD VALUE 'lab-index';
  ALTER TYPE "public"."enum_work_pages_stmt_links_links_link_site_page" ADD VALUE 'lab-index';
  ALTER TYPE "public"."enum_work_pages_closing_cl_link_site_page" ADD VALUE 'lab-index';
  ALTER TYPE "public"."enum___work_pages_v_faq_v_link_site_page" ADD VALUE 'lab-index';
  ALTER TYPE "public"."enum__work_pages_v_blocks_content_columns_link_site_page" ADD VALUE 'lab-index';
  ALTER TYPE "public"."enum___work_pages_v_stmt_links_v_links_link_site_page" ADD VALUE 'lab-index';
  ALTER TYPE "public"."enum___work_pages_v_version_closing_cl_v_link_site_page" ADD VALUE 'lab-index';
  ALTER TYPE "public"."enum_lab_pages_faq_link_site_page" ADD VALUE 'lab-index';
  ALTER TYPE "public"."enum_lab_pages_blocks_content_columns_link_site_page" ADD VALUE 'lab-index';
  ALTER TYPE "public"."enum_lab_pages_closing_cl_link_site_page" ADD VALUE 'lab-index';
  ALTER TYPE "public"."enum___lab_pages_v_faq_v_link_site_page" ADD VALUE 'lab-index';
  ALTER TYPE "public"."enum__lab_pages_v_blocks_content_columns_link_site_page" ADD VALUE 'lab-index';
  ALTER TYPE "public"."enum___lab_pages_v_version_closing_cl_v_link_site_page" ADD VALUE 'lab-index';
  ALTER TYPE "public"."enum_expertise_pages_hero_links_link_site_page" ADD VALUE 'lab-index';
  ALTER TYPE "public"."enum_expertise_pages_faq_link_site_page" ADD VALUE 'lab-index';
  ALTER TYPE "public"."enum_expertise_pages_blocks_content_columns_link_site_page" ADD VALUE 'lab-index';
  ALTER TYPE "public"."enum_expertise_pages_blocks_cta_links_link_site_page" ADD VALUE 'lab-index';
  ALTER TYPE "public"."enum_expertise_pages_closing_cl_link_site_page" ADD VALUE 'lab-index';
  ALTER TYPE "public"."enum__expertise_pages_v_version_hero_links_link_site_page" ADD VALUE 'lab-index';
  ALTER TYPE "public"."enum___expertise_pages_v_faq_v_link_site_page" ADD VALUE 'lab-index';
  ALTER TYPE "public"."enum__expertise_pages_v_blocks_content_columns_link_site_page" ADD VALUE 'lab-index';
  ALTER TYPE "public"."enum__expertise_pages_v_blocks_cta_links_link_site_page" ADD VALUE 'lab-index';
  ALTER TYPE "public"."enum___expertise_pages_v_version_closing_cl_v_link_site_page" ADD VALUE 'lab-index';
  ALTER TYPE "public"."enum_audience_pages_hero_links_link_site_page" ADD VALUE 'lab-index';
  ALTER TYPE "public"."enum_audience_pages_faq_link_site_page" ADD VALUE 'lab-index';
  ALTER TYPE "public"."enum_audience_pages_blocks_content_columns_link_site_page" ADD VALUE 'lab-index';
  ALTER TYPE "public"."enum_audience_pages_blocks_cta_links_link_site_page" ADD VALUE 'lab-index';
  ALTER TYPE "public"."enum_audience_pages_closing_cl_link_site_page" ADD VALUE 'lab-index';
  ALTER TYPE "public"."enum__audience_pages_v_version_hero_links_link_site_page" ADD VALUE 'lab-index';
  ALTER TYPE "public"."enum___audience_pages_v_faq_v_link_site_page" ADD VALUE 'lab-index';
  ALTER TYPE "public"."enum__audience_pages_v_blocks_content_columns_link_site_page" ADD VALUE 'lab-index';
  ALTER TYPE "public"."enum__audience_pages_v_blocks_cta_links_link_site_page" ADD VALUE 'lab-index';
  ALTER TYPE "public"."enum___audience_pages_v_version_closing_cl_v_link_site_page" ADD VALUE 'lab-index';
  ALTER TYPE "public"."enum_contact_pages_alt_cta_link_site_page" ADD VALUE 'lab-index';
  ALTER TYPE "public"."enum__contact_pages_v_version_alt_cta_link_site_page" ADD VALUE 'lab-index';
  ALTER TYPE "public"."enum_home_faq_link_site_page" ADD VALUE 'lab-index';
  ALTER TYPE "public"."enum_home_blocks_testimonials_marquee_links_link_site_page" ADD VALUE 'lab-index';
  ALTER TYPE "public"."enum_home_stmt_links_links_link_site_page" ADD VALUE 'lab-index';
  ALTER TYPE "public"."enum_home_blocks_cta_links_link_site_page" ADD VALUE 'lab-index';
  ALTER TYPE "public"."enum_home_blocks_content_columns_link_site_page" ADD VALUE 'lab-index';
  ALTER TYPE "public"."enum_home_closing_cl_link_site_page" ADD VALUE 'lab-index';
  ALTER TYPE "public"."enum___home_v_faq_v_link_site_page" ADD VALUE 'lab-index';
  ALTER TYPE "public"."enum__home_v_blocks_testimonials_marquee_links_link_site_page" ADD VALUE 'lab-index';
  ALTER TYPE "public"."enum___home_v_stmt_links_v_links_link_site_page" ADD VALUE 'lab-index';
  ALTER TYPE "public"."enum__home_v_blocks_cta_links_link_site_page" ADD VALUE 'lab-index';
  ALTER TYPE "public"."enum__home_v_blocks_content_columns_link_site_page" ADD VALUE 'lab-index';
  ALTER TYPE "public"."enum___home_v_version_closing_cl_v_link_site_page" ADD VALUE 'lab-index';
  ALTER TYPE "public"."enum_insights_index_hero_links_link_site_page" ADD VALUE 'lab-index';
  ALTER TYPE "public"."enum__insights_index_v_version_hero_links_link_site_page" ADD VALUE 'lab-index';
  ALTER TYPE "public"."enum_works_index_hero_links_link_site_page" ADD VALUE 'lab-index';
  ALTER TYPE "public"."enum__works_index_v_version_hero_links_link_site_page" ADD VALUE 'lab-index';
  ALTER TYPE "public"."enum_header_nav_items_link_site_page" ADD VALUE 'lab-index';
  ALTER TYPE "public"."enum_header_cta_link_site_page" ADD VALUE 'lab-index';
  ALTER TYPE "public"."enum_footer_closing_links_link_site_page" ADD VALUE 'lab-index';
  ALTER TYPE "public"."enum_footer_get_in_touch_site_page" ADD VALUE 'lab-index';
  ALTER TYPE "public"."enum_site_info_legal_links_link_site_page" ADD VALUE 'lab-index';
  CREATE TABLE "lab_index_hero_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_lab_index_hero_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_site_page" "enum_lab_index_hero_links_link_site_page",
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum_lab_index_hero_links_link_appearance" DEFAULT 'default'
  );
  
  CREATE TABLE "lab_index" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar DEFAULT 'Lab Index',
  	"hero_type" "enum_lab_index_hero_type" DEFAULT 'lowImpact',
  	"hero_eyebrow" varchar,
  	"hero_title" varchar,
  	"hero_rich_text" jsonb,
  	"hero_description" varchar,
  	"hero_media_id" integer,
  	"hero_visual_type" "enum_lab_index_hero_visual_type",
  	"hero_shader_studio_id" integer,
  	"hero_shader_preset" varchar,
  	"hero_shader_seed" numeric,
  	"hero_shader_speed" numeric,
  	"hero_shader_intensity" numeric,
  	"hero_shader_release_id" integer,
  	"hero_shader_pointer_interaction" boolean DEFAULT false,
  	"hero_shader_poster_media_id" integer,
  	"meta_title" varchar,
  	"meta_image_id" integer,
  	"meta_description" varchar,
  	"meta_og_title" varchar,
  	"meta_og_description" varchar,
  	"meta_og_image_id" integer,
  	"menu_preview_type" "enum_lab_index_menu_preview_type" DEFAULT 'automatic',
  	"menu_preview_id" integer,
  	"menu_preview_shader_studio_id" integer,
  	"menu_preview_shader_preset" varchar,
  	"menu_preview_shader_seed" numeric,
  	"menu_preview_shader_speed" numeric,
  	"menu_preview_shader_intensity" numeric,
  	"menu_preview_shader_release_id" integer,
  	"menu_preview_shader_pointer_interaction" boolean DEFAULT false,
  	"menu_preview_shader_poster_media_id" integer,
  	"_status" "enum_lab_index_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "lab_index_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"posts_id" integer,
  	"contact_pages_id" integer
  );
  
  CREATE TABLE "_lab_index_v_version_hero_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_type" "enum__lab_index_v_version_hero_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_site_page" "enum__lab_index_v_version_hero_links_link_site_page",
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum__lab_index_v_version_hero_links_link_appearance" DEFAULT 'default',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_lab_index_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_title" varchar DEFAULT 'Lab Index',
  	"version_hero_type" "enum__lab_index_v_version_hero_type" DEFAULT 'lowImpact',
  	"version_hero_eyebrow" varchar,
  	"version_hero_title" varchar,
  	"version_hero_rich_text" jsonb,
  	"version_hero_description" varchar,
  	"version_hero_media_id" integer,
  	"version_hero_visual_type" "enum__lab_index_v_version_hero_visual_type",
  	"version_hero_shader_studio_id" integer,
  	"version_hero_shader_preset" varchar,
  	"version_hero_shader_seed" numeric,
  	"version_hero_shader_speed" numeric,
  	"version_hero_shader_intensity" numeric,
  	"version_hero_shader_release_id" integer,
  	"version_hero_shader_pointer_interaction" boolean DEFAULT false,
  	"version_hero_shader_poster_media_id" integer,
  	"version_meta_title" varchar,
  	"version_meta_image_id" integer,
  	"version_meta_description" varchar,
  	"version_meta_og_title" varchar,
  	"version_meta_og_description" varchar,
  	"version_meta_og_image_id" integer,
  	"version_menu_preview_type" "enum__lab_index_v_version_menu_preview_type" DEFAULT 'automatic',
  	"version_menu_preview_id" integer,
  	"version_menu_preview_shader_studio_id" integer,
  	"version_menu_preview_shader_preset" varchar,
  	"version_menu_preview_shader_seed" numeric,
  	"version_menu_preview_shader_speed" numeric,
  	"version_menu_preview_shader_intensity" numeric,
  	"version_menu_preview_shader_release_id" integer,
  	"version_menu_preview_shader_pointer_interaction" boolean DEFAULT false,
  	"version_menu_preview_shader_poster_media_id" integer,
  	"version__status" "enum__lab_index_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_lab_index_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"posts_id" integer,
  	"contact_pages_id" integer
  );
  
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "lab_index_find" boolean DEFAULT false;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "lab_index_update" boolean DEFAULT false;
  ALTER TABLE "lab_index_hero_links" ADD CONSTRAINT "lab_index_hero_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lab_index"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lab_index" ADD CONSTRAINT "lab_index_hero_media_id_media_id_fk" FOREIGN KEY ("hero_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "lab_index" ADD CONSTRAINT "lab_index_hero_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("hero_shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "lab_index" ADD CONSTRAINT "lab_index_hero_shader_release_id_streak_releases_id_fk" FOREIGN KEY ("hero_shader_release_id") REFERENCES "public"."streak_releases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "lab_index" ADD CONSTRAINT "lab_index_hero_shader_poster_media_id_media_id_fk" FOREIGN KEY ("hero_shader_poster_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "lab_index" ADD CONSTRAINT "lab_index_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "lab_index" ADD CONSTRAINT "lab_index_meta_og_image_id_media_id_fk" FOREIGN KEY ("meta_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "lab_index" ADD CONSTRAINT "lab_index_menu_preview_id_media_id_fk" FOREIGN KEY ("menu_preview_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "lab_index" ADD CONSTRAINT "lab_index_menu_preview_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("menu_preview_shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "lab_index" ADD CONSTRAINT "lab_index_menu_preview_shader_release_id_streak_releases_id_fk" FOREIGN KEY ("menu_preview_shader_release_id") REFERENCES "public"."streak_releases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "lab_index" ADD CONSTRAINT "lab_index_menu_preview_shader_poster_media_id_media_id_fk" FOREIGN KEY ("menu_preview_shader_poster_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "lab_index_rels" ADD CONSTRAINT "lab_index_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."lab_index"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lab_index_rels" ADD CONSTRAINT "lab_index_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lab_index_rels" ADD CONSTRAINT "lab_index_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lab_index_rels" ADD CONSTRAINT "lab_index_rels_contact_pages_fk" FOREIGN KEY ("contact_pages_id") REFERENCES "public"."contact_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_lab_index_v_version_hero_links" ADD CONSTRAINT "_lab_index_v_version_hero_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_lab_index_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_lab_index_v" ADD CONSTRAINT "_lab_index_v_version_hero_media_id_media_id_fk" FOREIGN KEY ("version_hero_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_lab_index_v" ADD CONSTRAINT "_lab_index_v_version_hero_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("version_hero_shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_lab_index_v" ADD CONSTRAINT "_lab_index_v_version_hero_shader_release_id_streak_releases_id_fk" FOREIGN KEY ("version_hero_shader_release_id") REFERENCES "public"."streak_releases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_lab_index_v" ADD CONSTRAINT "_lab_index_v_version_hero_shader_poster_media_id_media_id_fk" FOREIGN KEY ("version_hero_shader_poster_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_lab_index_v" ADD CONSTRAINT "_lab_index_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_lab_index_v" ADD CONSTRAINT "_lab_index_v_version_meta_og_image_id_media_id_fk" FOREIGN KEY ("version_meta_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_lab_index_v" ADD CONSTRAINT "_lab_index_v_version_menu_preview_id_media_id_fk" FOREIGN KEY ("version_menu_preview_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_lab_index_v" ADD CONSTRAINT "_lab_index_v_version_menu_preview_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("version_menu_preview_shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_lab_index_v" ADD CONSTRAINT "_lab_index_v_version_menu_preview_shader_release_id_streak_releases_id_fk" FOREIGN KEY ("version_menu_preview_shader_release_id") REFERENCES "public"."streak_releases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_lab_index_v" ADD CONSTRAINT "_lab_index_v_version_menu_preview_shader_poster_media_id_media_id_fk" FOREIGN KEY ("version_menu_preview_shader_poster_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_lab_index_v_rels" ADD CONSTRAINT "_lab_index_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_lab_index_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_lab_index_v_rels" ADD CONSTRAINT "_lab_index_v_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_lab_index_v_rels" ADD CONSTRAINT "_lab_index_v_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_lab_index_v_rels" ADD CONSTRAINT "_lab_index_v_rels_contact_pages_fk" FOREIGN KEY ("contact_pages_id") REFERENCES "public"."contact_pages"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "lab_index_hero_links_order_idx" ON "lab_index_hero_links" USING btree ("_order");
  CREATE INDEX "lab_index_hero_links_parent_id_idx" ON "lab_index_hero_links" USING btree ("_parent_id");
  CREATE INDEX "lab_index_hero_hero_media_idx" ON "lab_index" USING btree ("hero_media_id");
  CREATE INDEX "lab_index_hero_shader_hero_shader_studio_idx" ON "lab_index" USING btree ("hero_shader_studio_id");
  CREATE INDEX "lab_index_hero_shader_hero_shader_release_idx" ON "lab_index" USING btree ("hero_shader_release_id");
  CREATE INDEX "lab_index_hero_shader_hero_shader_poster_media_idx" ON "lab_index" USING btree ("hero_shader_poster_media_id");
  CREATE INDEX "lab_index_meta_meta_image_idx" ON "lab_index" USING btree ("meta_image_id");
  CREATE INDEX "lab_index_meta_og_meta_og_image_idx" ON "lab_index" USING btree ("meta_og_image_id");
  CREATE INDEX "lab_index_menu_preview_idx" ON "lab_index" USING btree ("menu_preview_id");
  CREATE INDEX "lab_index_menu_preview_shader_menu_preview_shader_studio_idx" ON "lab_index" USING btree ("menu_preview_shader_studio_id");
  CREATE INDEX "lab_index_menu_preview_shader_menu_preview_shader_releas_idx" ON "lab_index" USING btree ("menu_preview_shader_release_id");
  CREATE INDEX "lab_index_menu_preview_shader_menu_preview_shader_poster_idx" ON "lab_index" USING btree ("menu_preview_shader_poster_media_id");
  CREATE INDEX "lab_index__status_idx" ON "lab_index" USING btree ("_status");
  CREATE INDEX "lab_index_rels_order_idx" ON "lab_index_rels" USING btree ("order");
  CREATE INDEX "lab_index_rels_parent_idx" ON "lab_index_rels" USING btree ("parent_id");
  CREATE INDEX "lab_index_rels_path_idx" ON "lab_index_rels" USING btree ("path");
  CREATE INDEX "lab_index_rels_pages_id_idx" ON "lab_index_rels" USING btree ("pages_id");
  CREATE INDEX "lab_index_rels_posts_id_idx" ON "lab_index_rels" USING btree ("posts_id");
  CREATE INDEX "lab_index_rels_contact_pages_id_idx" ON "lab_index_rels" USING btree ("contact_pages_id");
  CREATE INDEX "_lab_index_v_version_hero_links_order_idx" ON "_lab_index_v_version_hero_links" USING btree ("_order");
  CREATE INDEX "_lab_index_v_version_hero_links_parent_id_idx" ON "_lab_index_v_version_hero_links" USING btree ("_parent_id");
  CREATE INDEX "_lab_index_v_version_hero_version_hero_media_idx" ON "_lab_index_v" USING btree ("version_hero_media_id");
  CREATE INDEX "_lab_index_v_version_hero_shader_version_hero_shader_stu_idx" ON "_lab_index_v" USING btree ("version_hero_shader_studio_id");
  CREATE INDEX "_lab_index_v_version_hero_shader_version_hero_shader_rel_idx" ON "_lab_index_v" USING btree ("version_hero_shader_release_id");
  CREATE INDEX "_lab_index_v_version_hero_shader_version_hero_shader_pos_idx" ON "_lab_index_v" USING btree ("version_hero_shader_poster_media_id");
  CREATE INDEX "_lab_index_v_version_meta_version_meta_image_idx" ON "_lab_index_v" USING btree ("version_meta_image_id");
  CREATE INDEX "_lab_index_v_version_meta_og_version_meta_og_image_idx" ON "_lab_index_v" USING btree ("version_meta_og_image_id");
  CREATE INDEX "_lab_index_v_version_version_menu_preview_idx" ON "_lab_index_v" USING btree ("version_menu_preview_id");
  CREATE INDEX "_lab_index_v_version_menu_preview_shader_version_menu_pr_idx" ON "_lab_index_v" USING btree ("version_menu_preview_shader_studio_id");
  CREATE INDEX "_lab_index_v_version_menu_preview_shader_version_menu__1_idx" ON "_lab_index_v" USING btree ("version_menu_preview_shader_release_id");
  CREATE INDEX "_lab_index_v_version_menu_preview_shader_version_menu__2_idx" ON "_lab_index_v" USING btree ("version_menu_preview_shader_poster_media_id");
  CREATE INDEX "_lab_index_v_version_version__status_idx" ON "_lab_index_v" USING btree ("version__status");
  CREATE INDEX "_lab_index_v_created_at_idx" ON "_lab_index_v" USING btree ("created_at");
  CREATE INDEX "_lab_index_v_updated_at_idx" ON "_lab_index_v" USING btree ("updated_at");
  CREATE INDEX "_lab_index_v_latest_idx" ON "_lab_index_v" USING btree ("latest");
  CREATE INDEX "_lab_index_v_autosave_idx" ON "_lab_index_v" USING btree ("autosave");
  CREATE INDEX "_lab_index_v_rels_order_idx" ON "_lab_index_v_rels" USING btree ("order");
  CREATE INDEX "_lab_index_v_rels_parent_idx" ON "_lab_index_v_rels" USING btree ("parent_id");
  CREATE INDEX "_lab_index_v_rels_path_idx" ON "_lab_index_v_rels" USING btree ("path");
  CREATE INDEX "_lab_index_v_rels_pages_id_idx" ON "_lab_index_v_rels" USING btree ("pages_id");
  CREATE INDEX "_lab_index_v_rels_posts_id_idx" ON "_lab_index_v_rels" USING btree ("posts_id");
  CREATE INDEX "_lab_index_v_rels_contact_pages_id_idx" ON "_lab_index_v_rels" USING btree ("contact_pages_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "lab_index_hero_links" CASCADE;
  DROP TABLE "lab_index" CASCADE;
  DROP TABLE "lab_index_rels" CASCADE;
  DROP TABLE "_lab_index_v_version_hero_links" CASCADE;
  DROP TABLE "_lab_index_v" CASCADE;
  DROP TABLE "_lab_index_v_rels" CASCADE;
  ALTER TABLE "pages_hero_links" ALTER COLUMN "link_site_page" SET DATA TYPE text;
  DROP TYPE "public"."enum_pages_hero_links_link_site_page";
  CREATE TYPE "public"."enum_pages_hero_links_link_site_page" AS ENUM('home', 'works-index', 'insights-index');
  ALTER TABLE "pages_hero_links" ALTER COLUMN "link_site_page" SET DATA TYPE "public"."enum_pages_hero_links_link_site_page" USING "link_site_page"::"public"."enum_pages_hero_links_link_site_page";
  ALTER TABLE "pages_faq" ALTER COLUMN "link_site_page" SET DATA TYPE text;
  DROP TYPE "public"."enum_pages_faq_link_site_page";
  CREATE TYPE "public"."enum_pages_faq_link_site_page" AS ENUM('home', 'works-index', 'insights-index');
  ALTER TABLE "pages_faq" ALTER COLUMN "link_site_page" SET DATA TYPE "public"."enum_pages_faq_link_site_page" USING "link_site_page"::"public"."enum_pages_faq_link_site_page";
  ALTER TABLE "pages_blocks_content_columns" ALTER COLUMN "link_site_page" SET DATA TYPE text;
  DROP TYPE "public"."enum_pages_blocks_content_columns_link_site_page";
  CREATE TYPE "public"."enum_pages_blocks_content_columns_link_site_page" AS ENUM('home', 'works-index', 'insights-index');
  ALTER TABLE "pages_blocks_content_columns" ALTER COLUMN "link_site_page" SET DATA TYPE "public"."enum_pages_blocks_content_columns_link_site_page" USING "link_site_page"::"public"."enum_pages_blocks_content_columns_link_site_page";
  ALTER TABLE "pages_blocks_testimonials_marquee_links" ALTER COLUMN "link_site_page" SET DATA TYPE text;
  DROP TYPE "public"."enum_pages_blocks_testimonials_marquee_links_link_site_page";
  CREATE TYPE "public"."enum_pages_blocks_testimonials_marquee_links_link_site_page" AS ENUM('home', 'works-index', 'insights-index');
  ALTER TABLE "pages_blocks_testimonials_marquee_links" ALTER COLUMN "link_site_page" SET DATA TYPE "public"."enum_pages_blocks_testimonials_marquee_links_link_site_page" USING "link_site_page"::"public"."enum_pages_blocks_testimonials_marquee_links_link_site_page";
  ALTER TABLE "pages_stmt_links_links" ALTER COLUMN "link_site_page" SET DATA TYPE text;
  DROP TYPE "public"."enum_pages_stmt_links_links_link_site_page";
  CREATE TYPE "public"."enum_pages_stmt_links_links_link_site_page" AS ENUM('home', 'works-index', 'insights-index');
  ALTER TABLE "pages_stmt_links_links" ALTER COLUMN "link_site_page" SET DATA TYPE "public"."enum_pages_stmt_links_links_link_site_page" USING "link_site_page"::"public"."enum_pages_stmt_links_links_link_site_page";
  ALTER TABLE "pages_blocks_cta_links" ALTER COLUMN "link_site_page" SET DATA TYPE text;
  DROP TYPE "public"."enum_pages_blocks_cta_links_link_site_page";
  CREATE TYPE "public"."enum_pages_blocks_cta_links_link_site_page" AS ENUM('home', 'works-index', 'insights-index');
  ALTER TABLE "pages_blocks_cta_links" ALTER COLUMN "link_site_page" SET DATA TYPE "public"."enum_pages_blocks_cta_links_link_site_page" USING "link_site_page"::"public"."enum_pages_blocks_cta_links_link_site_page";
  ALTER TABLE "pages_closing_cl" ALTER COLUMN "link_site_page" SET DATA TYPE text;
  DROP TYPE "public"."enum_pages_closing_cl_link_site_page";
  CREATE TYPE "public"."enum_pages_closing_cl_link_site_page" AS ENUM('home', 'works-index', 'insights-index');
  ALTER TABLE "pages_closing_cl" ALTER COLUMN "link_site_page" SET DATA TYPE "public"."enum_pages_closing_cl_link_site_page" USING "link_site_page"::"public"."enum_pages_closing_cl_link_site_page";
  ALTER TABLE "_pages_v_version_hero_links" ALTER COLUMN "link_site_page" SET DATA TYPE text;
  DROP TYPE "public"."enum__pages_v_version_hero_links_link_site_page";
  CREATE TYPE "public"."enum__pages_v_version_hero_links_link_site_page" AS ENUM('home', 'works-index', 'insights-index');
  ALTER TABLE "_pages_v_version_hero_links" ALTER COLUMN "link_site_page" SET DATA TYPE "public"."enum__pages_v_version_hero_links_link_site_page" USING "link_site_page"::"public"."enum__pages_v_version_hero_links_link_site_page";
  ALTER TABLE "__pages_v_faq_v" ALTER COLUMN "link_site_page" SET DATA TYPE text;
  DROP TYPE "public"."enum___pages_v_faq_v_link_site_page";
  CREATE TYPE "public"."enum___pages_v_faq_v_link_site_page" AS ENUM('home', 'works-index', 'insights-index');
  ALTER TABLE "__pages_v_faq_v" ALTER COLUMN "link_site_page" SET DATA TYPE "public"."enum___pages_v_faq_v_link_site_page" USING "link_site_page"::"public"."enum___pages_v_faq_v_link_site_page";
  ALTER TABLE "_pages_v_blocks_content_columns" ALTER COLUMN "link_site_page" SET DATA TYPE text;
  DROP TYPE "public"."enum__pages_v_blocks_content_columns_link_site_page";
  CREATE TYPE "public"."enum__pages_v_blocks_content_columns_link_site_page" AS ENUM('home', 'works-index', 'insights-index');
  ALTER TABLE "_pages_v_blocks_content_columns" ALTER COLUMN "link_site_page" SET DATA TYPE "public"."enum__pages_v_blocks_content_columns_link_site_page" USING "link_site_page"::"public"."enum__pages_v_blocks_content_columns_link_site_page";
  ALTER TABLE "_pages_v_blocks_testimonials_marquee_links" ALTER COLUMN "link_site_page" SET DATA TYPE text;
  DROP TYPE "public"."enum__pages_v_blocks_testimonials_marquee_links_link_site_page";
  CREATE TYPE "public"."enum__pages_v_blocks_testimonials_marquee_links_link_site_page" AS ENUM('home', 'works-index', 'insights-index');
  ALTER TABLE "_pages_v_blocks_testimonials_marquee_links" ALTER COLUMN "link_site_page" SET DATA TYPE "public"."enum__pages_v_blocks_testimonials_marquee_links_link_site_page" USING "link_site_page"::"public"."enum__pages_v_blocks_testimonials_marquee_links_link_site_page";
  ALTER TABLE "__pages_v_stmt_links_v_links" ALTER COLUMN "link_site_page" SET DATA TYPE text;
  DROP TYPE "public"."enum___pages_v_stmt_links_v_links_link_site_page";
  CREATE TYPE "public"."enum___pages_v_stmt_links_v_links_link_site_page" AS ENUM('home', 'works-index', 'insights-index');
  ALTER TABLE "__pages_v_stmt_links_v_links" ALTER COLUMN "link_site_page" SET DATA TYPE "public"."enum___pages_v_stmt_links_v_links_link_site_page" USING "link_site_page"::"public"."enum___pages_v_stmt_links_v_links_link_site_page";
  ALTER TABLE "_pages_v_blocks_cta_links" ALTER COLUMN "link_site_page" SET DATA TYPE text;
  DROP TYPE "public"."enum__pages_v_blocks_cta_links_link_site_page";
  CREATE TYPE "public"."enum__pages_v_blocks_cta_links_link_site_page" AS ENUM('home', 'works-index', 'insights-index');
  ALTER TABLE "_pages_v_blocks_cta_links" ALTER COLUMN "link_site_page" SET DATA TYPE "public"."enum__pages_v_blocks_cta_links_link_site_page" USING "link_site_page"::"public"."enum__pages_v_blocks_cta_links_link_site_page";
  ALTER TABLE "__pages_v_version_closing_cl_v" ALTER COLUMN "link_site_page" SET DATA TYPE text;
  DROP TYPE "public"."enum___pages_v_version_closing_cl_v_link_site_page";
  CREATE TYPE "public"."enum___pages_v_version_closing_cl_v_link_site_page" AS ENUM('home', 'works-index', 'insights-index');
  ALTER TABLE "__pages_v_version_closing_cl_v" ALTER COLUMN "link_site_page" SET DATA TYPE "public"."enum___pages_v_version_closing_cl_v_link_site_page" USING "link_site_page"::"public"."enum___pages_v_version_closing_cl_v_link_site_page";
  ALTER TABLE "posts_faq" ALTER COLUMN "link_site_page" SET DATA TYPE text;
  DROP TYPE "public"."enum_posts_faq_link_site_page";
  CREATE TYPE "public"."enum_posts_faq_link_site_page" AS ENUM('home', 'works-index', 'insights-index');
  ALTER TABLE "posts_faq" ALTER COLUMN "link_site_page" SET DATA TYPE "public"."enum_posts_faq_link_site_page" USING "link_site_page"::"public"."enum_posts_faq_link_site_page";
  ALTER TABLE "posts_blocks_content_columns" ALTER COLUMN "link_site_page" SET DATA TYPE text;
  DROP TYPE "public"."enum_posts_blocks_content_columns_link_site_page";
  CREATE TYPE "public"."enum_posts_blocks_content_columns_link_site_page" AS ENUM('home', 'works-index', 'insights-index');
  ALTER TABLE "posts_blocks_content_columns" ALTER COLUMN "link_site_page" SET DATA TYPE "public"."enum_posts_blocks_content_columns_link_site_page" USING "link_site_page"::"public"."enum_posts_blocks_content_columns_link_site_page";
  ALTER TABLE "posts_closing_cl" ALTER COLUMN "link_site_page" SET DATA TYPE text;
  DROP TYPE "public"."enum_posts_closing_cl_link_site_page";
  CREATE TYPE "public"."enum_posts_closing_cl_link_site_page" AS ENUM('home', 'works-index', 'insights-index');
  ALTER TABLE "posts_closing_cl" ALTER COLUMN "link_site_page" SET DATA TYPE "public"."enum_posts_closing_cl_link_site_page" USING "link_site_page"::"public"."enum_posts_closing_cl_link_site_page";
  ALTER TABLE "__posts_v_faq_v" ALTER COLUMN "link_site_page" SET DATA TYPE text;
  DROP TYPE "public"."enum___posts_v_faq_v_link_site_page";
  CREATE TYPE "public"."enum___posts_v_faq_v_link_site_page" AS ENUM('home', 'works-index', 'insights-index');
  ALTER TABLE "__posts_v_faq_v" ALTER COLUMN "link_site_page" SET DATA TYPE "public"."enum___posts_v_faq_v_link_site_page" USING "link_site_page"::"public"."enum___posts_v_faq_v_link_site_page";
  ALTER TABLE "_posts_v_blocks_content_columns" ALTER COLUMN "link_site_page" SET DATA TYPE text;
  DROP TYPE "public"."enum__posts_v_blocks_content_columns_link_site_page";
  CREATE TYPE "public"."enum__posts_v_blocks_content_columns_link_site_page" AS ENUM('home', 'works-index', 'insights-index');
  ALTER TABLE "_posts_v_blocks_content_columns" ALTER COLUMN "link_site_page" SET DATA TYPE "public"."enum__posts_v_blocks_content_columns_link_site_page" USING "link_site_page"::"public"."enum__posts_v_blocks_content_columns_link_site_page";
  ALTER TABLE "__posts_v_version_closing_cl_v" ALTER COLUMN "link_site_page" SET DATA TYPE text;
  DROP TYPE "public"."enum___posts_v_version_closing_cl_v_link_site_page";
  CREATE TYPE "public"."enum___posts_v_version_closing_cl_v_link_site_page" AS ENUM('home', 'works-index', 'insights-index');
  ALTER TABLE "__posts_v_version_closing_cl_v" ALTER COLUMN "link_site_page" SET DATA TYPE "public"."enum___posts_v_version_closing_cl_v_link_site_page" USING "link_site_page"::"public"."enum___posts_v_version_closing_cl_v_link_site_page";
  ALTER TABLE "work_pages_faq" ALTER COLUMN "link_site_page" SET DATA TYPE text;
  DROP TYPE "public"."enum_work_pages_faq_link_site_page";
  CREATE TYPE "public"."enum_work_pages_faq_link_site_page" AS ENUM('home', 'works-index', 'insights-index');
  ALTER TABLE "work_pages_faq" ALTER COLUMN "link_site_page" SET DATA TYPE "public"."enum_work_pages_faq_link_site_page" USING "link_site_page"::"public"."enum_work_pages_faq_link_site_page";
  ALTER TABLE "work_pages_blocks_content_columns" ALTER COLUMN "link_site_page" SET DATA TYPE text;
  DROP TYPE "public"."enum_work_pages_blocks_content_columns_link_site_page";
  CREATE TYPE "public"."enum_work_pages_blocks_content_columns_link_site_page" AS ENUM('home', 'works-index', 'insights-index');
  ALTER TABLE "work_pages_blocks_content_columns" ALTER COLUMN "link_site_page" SET DATA TYPE "public"."enum_work_pages_blocks_content_columns_link_site_page" USING "link_site_page"::"public"."enum_work_pages_blocks_content_columns_link_site_page";
  ALTER TABLE "work_pages_stmt_links_links" ALTER COLUMN "link_site_page" SET DATA TYPE text;
  DROP TYPE "public"."enum_work_pages_stmt_links_links_link_site_page";
  CREATE TYPE "public"."enum_work_pages_stmt_links_links_link_site_page" AS ENUM('home', 'works-index', 'insights-index');
  ALTER TABLE "work_pages_stmt_links_links" ALTER COLUMN "link_site_page" SET DATA TYPE "public"."enum_work_pages_stmt_links_links_link_site_page" USING "link_site_page"::"public"."enum_work_pages_stmt_links_links_link_site_page";
  ALTER TABLE "work_pages_closing_cl" ALTER COLUMN "link_site_page" SET DATA TYPE text;
  DROP TYPE "public"."enum_work_pages_closing_cl_link_site_page";
  CREATE TYPE "public"."enum_work_pages_closing_cl_link_site_page" AS ENUM('home', 'works-index', 'insights-index');
  ALTER TABLE "work_pages_closing_cl" ALTER COLUMN "link_site_page" SET DATA TYPE "public"."enum_work_pages_closing_cl_link_site_page" USING "link_site_page"::"public"."enum_work_pages_closing_cl_link_site_page";
  ALTER TABLE "__work_pages_v_faq_v" ALTER COLUMN "link_site_page" SET DATA TYPE text;
  DROP TYPE "public"."enum___work_pages_v_faq_v_link_site_page";
  CREATE TYPE "public"."enum___work_pages_v_faq_v_link_site_page" AS ENUM('home', 'works-index', 'insights-index');
  ALTER TABLE "__work_pages_v_faq_v" ALTER COLUMN "link_site_page" SET DATA TYPE "public"."enum___work_pages_v_faq_v_link_site_page" USING "link_site_page"::"public"."enum___work_pages_v_faq_v_link_site_page";
  ALTER TABLE "_work_pages_v_blocks_content_columns" ALTER COLUMN "link_site_page" SET DATA TYPE text;
  DROP TYPE "public"."enum__work_pages_v_blocks_content_columns_link_site_page";
  CREATE TYPE "public"."enum__work_pages_v_blocks_content_columns_link_site_page" AS ENUM('home', 'works-index', 'insights-index');
  ALTER TABLE "_work_pages_v_blocks_content_columns" ALTER COLUMN "link_site_page" SET DATA TYPE "public"."enum__work_pages_v_blocks_content_columns_link_site_page" USING "link_site_page"::"public"."enum__work_pages_v_blocks_content_columns_link_site_page";
  ALTER TABLE "__work_pages_v_stmt_links_v_links" ALTER COLUMN "link_site_page" SET DATA TYPE text;
  DROP TYPE "public"."enum___work_pages_v_stmt_links_v_links_link_site_page";
  CREATE TYPE "public"."enum___work_pages_v_stmt_links_v_links_link_site_page" AS ENUM('home', 'works-index', 'insights-index');
  ALTER TABLE "__work_pages_v_stmt_links_v_links" ALTER COLUMN "link_site_page" SET DATA TYPE "public"."enum___work_pages_v_stmt_links_v_links_link_site_page" USING "link_site_page"::"public"."enum___work_pages_v_stmt_links_v_links_link_site_page";
  ALTER TABLE "__work_pages_v_version_closing_cl_v" ALTER COLUMN "link_site_page" SET DATA TYPE text;
  DROP TYPE "public"."enum___work_pages_v_version_closing_cl_v_link_site_page";
  CREATE TYPE "public"."enum___work_pages_v_version_closing_cl_v_link_site_page" AS ENUM('home', 'works-index', 'insights-index');
  ALTER TABLE "__work_pages_v_version_closing_cl_v" ALTER COLUMN "link_site_page" SET DATA TYPE "public"."enum___work_pages_v_version_closing_cl_v_link_site_page" USING "link_site_page"::"public"."enum___work_pages_v_version_closing_cl_v_link_site_page";
  ALTER TABLE "lab_pages_faq" ALTER COLUMN "link_site_page" SET DATA TYPE text;
  DROP TYPE "public"."enum_lab_pages_faq_link_site_page";
  CREATE TYPE "public"."enum_lab_pages_faq_link_site_page" AS ENUM('home', 'works-index', 'insights-index');
  ALTER TABLE "lab_pages_faq" ALTER COLUMN "link_site_page" SET DATA TYPE "public"."enum_lab_pages_faq_link_site_page" USING "link_site_page"::"public"."enum_lab_pages_faq_link_site_page";
  ALTER TABLE "lab_pages_blocks_content_columns" ALTER COLUMN "link_site_page" SET DATA TYPE text;
  DROP TYPE "public"."enum_lab_pages_blocks_content_columns_link_site_page";
  CREATE TYPE "public"."enum_lab_pages_blocks_content_columns_link_site_page" AS ENUM('home', 'works-index', 'insights-index');
  ALTER TABLE "lab_pages_blocks_content_columns" ALTER COLUMN "link_site_page" SET DATA TYPE "public"."enum_lab_pages_blocks_content_columns_link_site_page" USING "link_site_page"::"public"."enum_lab_pages_blocks_content_columns_link_site_page";
  ALTER TABLE "lab_pages_closing_cl" ALTER COLUMN "link_site_page" SET DATA TYPE text;
  DROP TYPE "public"."enum_lab_pages_closing_cl_link_site_page";
  CREATE TYPE "public"."enum_lab_pages_closing_cl_link_site_page" AS ENUM('home', 'works-index', 'insights-index');
  ALTER TABLE "lab_pages_closing_cl" ALTER COLUMN "link_site_page" SET DATA TYPE "public"."enum_lab_pages_closing_cl_link_site_page" USING "link_site_page"::"public"."enum_lab_pages_closing_cl_link_site_page";
  ALTER TABLE "__lab_pages_v_faq_v" ALTER COLUMN "link_site_page" SET DATA TYPE text;
  DROP TYPE "public"."enum___lab_pages_v_faq_v_link_site_page";
  CREATE TYPE "public"."enum___lab_pages_v_faq_v_link_site_page" AS ENUM('home', 'works-index', 'insights-index');
  ALTER TABLE "__lab_pages_v_faq_v" ALTER COLUMN "link_site_page" SET DATA TYPE "public"."enum___lab_pages_v_faq_v_link_site_page" USING "link_site_page"::"public"."enum___lab_pages_v_faq_v_link_site_page";
  ALTER TABLE "_lab_pages_v_blocks_content_columns" ALTER COLUMN "link_site_page" SET DATA TYPE text;
  DROP TYPE "public"."enum__lab_pages_v_blocks_content_columns_link_site_page";
  CREATE TYPE "public"."enum__lab_pages_v_blocks_content_columns_link_site_page" AS ENUM('home', 'works-index', 'insights-index');
  ALTER TABLE "_lab_pages_v_blocks_content_columns" ALTER COLUMN "link_site_page" SET DATA TYPE "public"."enum__lab_pages_v_blocks_content_columns_link_site_page" USING "link_site_page"::"public"."enum__lab_pages_v_blocks_content_columns_link_site_page";
  ALTER TABLE "__lab_pages_v_version_closing_cl_v" ALTER COLUMN "link_site_page" SET DATA TYPE text;
  DROP TYPE "public"."enum___lab_pages_v_version_closing_cl_v_link_site_page";
  CREATE TYPE "public"."enum___lab_pages_v_version_closing_cl_v_link_site_page" AS ENUM('home', 'works-index', 'insights-index');
  ALTER TABLE "__lab_pages_v_version_closing_cl_v" ALTER COLUMN "link_site_page" SET DATA TYPE "public"."enum___lab_pages_v_version_closing_cl_v_link_site_page" USING "link_site_page"::"public"."enum___lab_pages_v_version_closing_cl_v_link_site_page";
  ALTER TABLE "expertise_pages_hero_links" ALTER COLUMN "link_site_page" SET DATA TYPE text;
  DROP TYPE "public"."enum_expertise_pages_hero_links_link_site_page";
  CREATE TYPE "public"."enum_expertise_pages_hero_links_link_site_page" AS ENUM('home', 'works-index', 'insights-index');
  ALTER TABLE "expertise_pages_hero_links" ALTER COLUMN "link_site_page" SET DATA TYPE "public"."enum_expertise_pages_hero_links_link_site_page" USING "link_site_page"::"public"."enum_expertise_pages_hero_links_link_site_page";
  ALTER TABLE "expertise_pages_faq" ALTER COLUMN "link_site_page" SET DATA TYPE text;
  DROP TYPE "public"."enum_expertise_pages_faq_link_site_page";
  CREATE TYPE "public"."enum_expertise_pages_faq_link_site_page" AS ENUM('home', 'works-index', 'insights-index');
  ALTER TABLE "expertise_pages_faq" ALTER COLUMN "link_site_page" SET DATA TYPE "public"."enum_expertise_pages_faq_link_site_page" USING "link_site_page"::"public"."enum_expertise_pages_faq_link_site_page";
  ALTER TABLE "expertise_pages_blocks_content_columns" ALTER COLUMN "link_site_page" SET DATA TYPE text;
  DROP TYPE "public"."enum_expertise_pages_blocks_content_columns_link_site_page";
  CREATE TYPE "public"."enum_expertise_pages_blocks_content_columns_link_site_page" AS ENUM('home', 'works-index', 'insights-index');
  ALTER TABLE "expertise_pages_blocks_content_columns" ALTER COLUMN "link_site_page" SET DATA TYPE "public"."enum_expertise_pages_blocks_content_columns_link_site_page" USING "link_site_page"::"public"."enum_expertise_pages_blocks_content_columns_link_site_page";
  ALTER TABLE "expertise_pages_blocks_cta_links" ALTER COLUMN "link_site_page" SET DATA TYPE text;
  DROP TYPE "public"."enum_expertise_pages_blocks_cta_links_link_site_page";
  CREATE TYPE "public"."enum_expertise_pages_blocks_cta_links_link_site_page" AS ENUM('home', 'works-index', 'insights-index');
  ALTER TABLE "expertise_pages_blocks_cta_links" ALTER COLUMN "link_site_page" SET DATA TYPE "public"."enum_expertise_pages_blocks_cta_links_link_site_page" USING "link_site_page"::"public"."enum_expertise_pages_blocks_cta_links_link_site_page";
  ALTER TABLE "expertise_pages_closing_cl" ALTER COLUMN "link_site_page" SET DATA TYPE text;
  DROP TYPE "public"."enum_expertise_pages_closing_cl_link_site_page";
  CREATE TYPE "public"."enum_expertise_pages_closing_cl_link_site_page" AS ENUM('home', 'works-index', 'insights-index');
  ALTER TABLE "expertise_pages_closing_cl" ALTER COLUMN "link_site_page" SET DATA TYPE "public"."enum_expertise_pages_closing_cl_link_site_page" USING "link_site_page"::"public"."enum_expertise_pages_closing_cl_link_site_page";
  ALTER TABLE "_expertise_pages_v_version_hero_links" ALTER COLUMN "link_site_page" SET DATA TYPE text;
  DROP TYPE "public"."enum__expertise_pages_v_version_hero_links_link_site_page";
  CREATE TYPE "public"."enum__expertise_pages_v_version_hero_links_link_site_page" AS ENUM('home', 'works-index', 'insights-index');
  ALTER TABLE "_expertise_pages_v_version_hero_links" ALTER COLUMN "link_site_page" SET DATA TYPE "public"."enum__expertise_pages_v_version_hero_links_link_site_page" USING "link_site_page"::"public"."enum__expertise_pages_v_version_hero_links_link_site_page";
  ALTER TABLE "__expertise_pages_v_faq_v" ALTER COLUMN "link_site_page" SET DATA TYPE text;
  DROP TYPE "public"."enum___expertise_pages_v_faq_v_link_site_page";
  CREATE TYPE "public"."enum___expertise_pages_v_faq_v_link_site_page" AS ENUM('home', 'works-index', 'insights-index');
  ALTER TABLE "__expertise_pages_v_faq_v" ALTER COLUMN "link_site_page" SET DATA TYPE "public"."enum___expertise_pages_v_faq_v_link_site_page" USING "link_site_page"::"public"."enum___expertise_pages_v_faq_v_link_site_page";
  ALTER TABLE "_expertise_pages_v_blocks_content_columns" ALTER COLUMN "link_site_page" SET DATA TYPE text;
  DROP TYPE "public"."enum__expertise_pages_v_blocks_content_columns_link_site_page";
  CREATE TYPE "public"."enum__expertise_pages_v_blocks_content_columns_link_site_page" AS ENUM('home', 'works-index', 'insights-index');
  ALTER TABLE "_expertise_pages_v_blocks_content_columns" ALTER COLUMN "link_site_page" SET DATA TYPE "public"."enum__expertise_pages_v_blocks_content_columns_link_site_page" USING "link_site_page"::"public"."enum__expertise_pages_v_blocks_content_columns_link_site_page";
  ALTER TABLE "_expertise_pages_v_blocks_cta_links" ALTER COLUMN "link_site_page" SET DATA TYPE text;
  DROP TYPE "public"."enum__expertise_pages_v_blocks_cta_links_link_site_page";
  CREATE TYPE "public"."enum__expertise_pages_v_blocks_cta_links_link_site_page" AS ENUM('home', 'works-index', 'insights-index');
  ALTER TABLE "_expertise_pages_v_blocks_cta_links" ALTER COLUMN "link_site_page" SET DATA TYPE "public"."enum__expertise_pages_v_blocks_cta_links_link_site_page" USING "link_site_page"::"public"."enum__expertise_pages_v_blocks_cta_links_link_site_page";
  ALTER TABLE "__expertise_pages_v_version_closing_cl_v" ALTER COLUMN "link_site_page" SET DATA TYPE text;
  DROP TYPE "public"."enum___expertise_pages_v_version_closing_cl_v_link_site_page";
  CREATE TYPE "public"."enum___expertise_pages_v_version_closing_cl_v_link_site_page" AS ENUM('home', 'works-index', 'insights-index');
  ALTER TABLE "__expertise_pages_v_version_closing_cl_v" ALTER COLUMN "link_site_page" SET DATA TYPE "public"."enum___expertise_pages_v_version_closing_cl_v_link_site_page" USING "link_site_page"::"public"."enum___expertise_pages_v_version_closing_cl_v_link_site_page";
  ALTER TABLE "audience_pages_hero_links" ALTER COLUMN "link_site_page" SET DATA TYPE text;
  DROP TYPE "public"."enum_audience_pages_hero_links_link_site_page";
  CREATE TYPE "public"."enum_audience_pages_hero_links_link_site_page" AS ENUM('home', 'works-index', 'insights-index');
  ALTER TABLE "audience_pages_hero_links" ALTER COLUMN "link_site_page" SET DATA TYPE "public"."enum_audience_pages_hero_links_link_site_page" USING "link_site_page"::"public"."enum_audience_pages_hero_links_link_site_page";
  ALTER TABLE "audience_pages_faq" ALTER COLUMN "link_site_page" SET DATA TYPE text;
  DROP TYPE "public"."enum_audience_pages_faq_link_site_page";
  CREATE TYPE "public"."enum_audience_pages_faq_link_site_page" AS ENUM('home', 'works-index', 'insights-index');
  ALTER TABLE "audience_pages_faq" ALTER COLUMN "link_site_page" SET DATA TYPE "public"."enum_audience_pages_faq_link_site_page" USING "link_site_page"::"public"."enum_audience_pages_faq_link_site_page";
  ALTER TABLE "audience_pages_blocks_content_columns" ALTER COLUMN "link_site_page" SET DATA TYPE text;
  DROP TYPE "public"."enum_audience_pages_blocks_content_columns_link_site_page";
  CREATE TYPE "public"."enum_audience_pages_blocks_content_columns_link_site_page" AS ENUM('home', 'works-index', 'insights-index');
  ALTER TABLE "audience_pages_blocks_content_columns" ALTER COLUMN "link_site_page" SET DATA TYPE "public"."enum_audience_pages_blocks_content_columns_link_site_page" USING "link_site_page"::"public"."enum_audience_pages_blocks_content_columns_link_site_page";
  ALTER TABLE "audience_pages_blocks_cta_links" ALTER COLUMN "link_site_page" SET DATA TYPE text;
  DROP TYPE "public"."enum_audience_pages_blocks_cta_links_link_site_page";
  CREATE TYPE "public"."enum_audience_pages_blocks_cta_links_link_site_page" AS ENUM('home', 'works-index', 'insights-index');
  ALTER TABLE "audience_pages_blocks_cta_links" ALTER COLUMN "link_site_page" SET DATA TYPE "public"."enum_audience_pages_blocks_cta_links_link_site_page" USING "link_site_page"::"public"."enum_audience_pages_blocks_cta_links_link_site_page";
  ALTER TABLE "audience_pages_closing_cl" ALTER COLUMN "link_site_page" SET DATA TYPE text;
  DROP TYPE "public"."enum_audience_pages_closing_cl_link_site_page";
  CREATE TYPE "public"."enum_audience_pages_closing_cl_link_site_page" AS ENUM('home', 'works-index', 'insights-index');
  ALTER TABLE "audience_pages_closing_cl" ALTER COLUMN "link_site_page" SET DATA TYPE "public"."enum_audience_pages_closing_cl_link_site_page" USING "link_site_page"::"public"."enum_audience_pages_closing_cl_link_site_page";
  ALTER TABLE "_audience_pages_v_version_hero_links" ALTER COLUMN "link_site_page" SET DATA TYPE text;
  DROP TYPE "public"."enum__audience_pages_v_version_hero_links_link_site_page";
  CREATE TYPE "public"."enum__audience_pages_v_version_hero_links_link_site_page" AS ENUM('home', 'works-index', 'insights-index');
  ALTER TABLE "_audience_pages_v_version_hero_links" ALTER COLUMN "link_site_page" SET DATA TYPE "public"."enum__audience_pages_v_version_hero_links_link_site_page" USING "link_site_page"::"public"."enum__audience_pages_v_version_hero_links_link_site_page";
  ALTER TABLE "__audience_pages_v_faq_v" ALTER COLUMN "link_site_page" SET DATA TYPE text;
  DROP TYPE "public"."enum___audience_pages_v_faq_v_link_site_page";
  CREATE TYPE "public"."enum___audience_pages_v_faq_v_link_site_page" AS ENUM('home', 'works-index', 'insights-index');
  ALTER TABLE "__audience_pages_v_faq_v" ALTER COLUMN "link_site_page" SET DATA TYPE "public"."enum___audience_pages_v_faq_v_link_site_page" USING "link_site_page"::"public"."enum___audience_pages_v_faq_v_link_site_page";
  ALTER TABLE "_audience_pages_v_blocks_content_columns" ALTER COLUMN "link_site_page" SET DATA TYPE text;
  DROP TYPE "public"."enum__audience_pages_v_blocks_content_columns_link_site_page";
  CREATE TYPE "public"."enum__audience_pages_v_blocks_content_columns_link_site_page" AS ENUM('home', 'works-index', 'insights-index');
  ALTER TABLE "_audience_pages_v_blocks_content_columns" ALTER COLUMN "link_site_page" SET DATA TYPE "public"."enum__audience_pages_v_blocks_content_columns_link_site_page" USING "link_site_page"::"public"."enum__audience_pages_v_blocks_content_columns_link_site_page";
  ALTER TABLE "_audience_pages_v_blocks_cta_links" ALTER COLUMN "link_site_page" SET DATA TYPE text;
  DROP TYPE "public"."enum__audience_pages_v_blocks_cta_links_link_site_page";
  CREATE TYPE "public"."enum__audience_pages_v_blocks_cta_links_link_site_page" AS ENUM('home', 'works-index', 'insights-index');
  ALTER TABLE "_audience_pages_v_blocks_cta_links" ALTER COLUMN "link_site_page" SET DATA TYPE "public"."enum__audience_pages_v_blocks_cta_links_link_site_page" USING "link_site_page"::"public"."enum__audience_pages_v_blocks_cta_links_link_site_page";
  ALTER TABLE "__audience_pages_v_version_closing_cl_v" ALTER COLUMN "link_site_page" SET DATA TYPE text;
  DROP TYPE "public"."enum___audience_pages_v_version_closing_cl_v_link_site_page";
  CREATE TYPE "public"."enum___audience_pages_v_version_closing_cl_v_link_site_page" AS ENUM('home', 'works-index', 'insights-index');
  ALTER TABLE "__audience_pages_v_version_closing_cl_v" ALTER COLUMN "link_site_page" SET DATA TYPE "public"."enum___audience_pages_v_version_closing_cl_v_link_site_page" USING "link_site_page"::"public"."enum___audience_pages_v_version_closing_cl_v_link_site_page";
  ALTER TABLE "contact_pages" ALTER COLUMN "alt_cta_link_site_page" SET DATA TYPE text;
  DROP TYPE "public"."enum_contact_pages_alt_cta_link_site_page";
  CREATE TYPE "public"."enum_contact_pages_alt_cta_link_site_page" AS ENUM('home', 'works-index', 'insights-index');
  ALTER TABLE "contact_pages" ALTER COLUMN "alt_cta_link_site_page" SET DATA TYPE "public"."enum_contact_pages_alt_cta_link_site_page" USING "alt_cta_link_site_page"::"public"."enum_contact_pages_alt_cta_link_site_page";
  ALTER TABLE "_contact_pages_v" ALTER COLUMN "version_alt_cta_link_site_page" SET DATA TYPE text;
  DROP TYPE "public"."enum__contact_pages_v_version_alt_cta_link_site_page";
  CREATE TYPE "public"."enum__contact_pages_v_version_alt_cta_link_site_page" AS ENUM('home', 'works-index', 'insights-index');
  ALTER TABLE "_contact_pages_v" ALTER COLUMN "version_alt_cta_link_site_page" SET DATA TYPE "public"."enum__contact_pages_v_version_alt_cta_link_site_page" USING "version_alt_cta_link_site_page"::"public"."enum__contact_pages_v_version_alt_cta_link_site_page";
  ALTER TABLE "home_faq" ALTER COLUMN "link_site_page" SET DATA TYPE text;
  DROP TYPE "public"."enum_home_faq_link_site_page";
  CREATE TYPE "public"."enum_home_faq_link_site_page" AS ENUM('home', 'works-index', 'insights-index');
  ALTER TABLE "home_faq" ALTER COLUMN "link_site_page" SET DATA TYPE "public"."enum_home_faq_link_site_page" USING "link_site_page"::"public"."enum_home_faq_link_site_page";
  ALTER TABLE "home_blocks_testimonials_marquee_links" ALTER COLUMN "link_site_page" SET DATA TYPE text;
  DROP TYPE "public"."enum_home_blocks_testimonials_marquee_links_link_site_page";
  CREATE TYPE "public"."enum_home_blocks_testimonials_marquee_links_link_site_page" AS ENUM('home', 'works-index', 'insights-index');
  ALTER TABLE "home_blocks_testimonials_marquee_links" ALTER COLUMN "link_site_page" SET DATA TYPE "public"."enum_home_blocks_testimonials_marquee_links_link_site_page" USING "link_site_page"::"public"."enum_home_blocks_testimonials_marquee_links_link_site_page";
  ALTER TABLE "home_stmt_links_links" ALTER COLUMN "link_site_page" SET DATA TYPE text;
  DROP TYPE "public"."enum_home_stmt_links_links_link_site_page";
  CREATE TYPE "public"."enum_home_stmt_links_links_link_site_page" AS ENUM('home', 'works-index', 'insights-index');
  ALTER TABLE "home_stmt_links_links" ALTER COLUMN "link_site_page" SET DATA TYPE "public"."enum_home_stmt_links_links_link_site_page" USING "link_site_page"::"public"."enum_home_stmt_links_links_link_site_page";
  ALTER TABLE "home_blocks_cta_links" ALTER COLUMN "link_site_page" SET DATA TYPE text;
  DROP TYPE "public"."enum_home_blocks_cta_links_link_site_page";
  CREATE TYPE "public"."enum_home_blocks_cta_links_link_site_page" AS ENUM('home', 'works-index', 'insights-index');
  ALTER TABLE "home_blocks_cta_links" ALTER COLUMN "link_site_page" SET DATA TYPE "public"."enum_home_blocks_cta_links_link_site_page" USING "link_site_page"::"public"."enum_home_blocks_cta_links_link_site_page";
  ALTER TABLE "home_blocks_content_columns" ALTER COLUMN "link_site_page" SET DATA TYPE text;
  DROP TYPE "public"."enum_home_blocks_content_columns_link_site_page";
  CREATE TYPE "public"."enum_home_blocks_content_columns_link_site_page" AS ENUM('home', 'works-index', 'insights-index');
  ALTER TABLE "home_blocks_content_columns" ALTER COLUMN "link_site_page" SET DATA TYPE "public"."enum_home_blocks_content_columns_link_site_page" USING "link_site_page"::"public"."enum_home_blocks_content_columns_link_site_page";
  ALTER TABLE "home_closing_cl" ALTER COLUMN "link_site_page" SET DATA TYPE text;
  DROP TYPE "public"."enum_home_closing_cl_link_site_page";
  CREATE TYPE "public"."enum_home_closing_cl_link_site_page" AS ENUM('home', 'works-index', 'insights-index');
  ALTER TABLE "home_closing_cl" ALTER COLUMN "link_site_page" SET DATA TYPE "public"."enum_home_closing_cl_link_site_page" USING "link_site_page"::"public"."enum_home_closing_cl_link_site_page";
  ALTER TABLE "__home_v_faq_v" ALTER COLUMN "link_site_page" SET DATA TYPE text;
  DROP TYPE "public"."enum___home_v_faq_v_link_site_page";
  CREATE TYPE "public"."enum___home_v_faq_v_link_site_page" AS ENUM('home', 'works-index', 'insights-index');
  ALTER TABLE "__home_v_faq_v" ALTER COLUMN "link_site_page" SET DATA TYPE "public"."enum___home_v_faq_v_link_site_page" USING "link_site_page"::"public"."enum___home_v_faq_v_link_site_page";
  ALTER TABLE "_home_v_blocks_testimonials_marquee_links" ALTER COLUMN "link_site_page" SET DATA TYPE text;
  DROP TYPE "public"."enum__home_v_blocks_testimonials_marquee_links_link_site_page";
  CREATE TYPE "public"."enum__home_v_blocks_testimonials_marquee_links_link_site_page" AS ENUM('home', 'works-index', 'insights-index');
  ALTER TABLE "_home_v_blocks_testimonials_marquee_links" ALTER COLUMN "link_site_page" SET DATA TYPE "public"."enum__home_v_blocks_testimonials_marquee_links_link_site_page" USING "link_site_page"::"public"."enum__home_v_blocks_testimonials_marquee_links_link_site_page";
  ALTER TABLE "__home_v_stmt_links_v_links" ALTER COLUMN "link_site_page" SET DATA TYPE text;
  DROP TYPE "public"."enum___home_v_stmt_links_v_links_link_site_page";
  CREATE TYPE "public"."enum___home_v_stmt_links_v_links_link_site_page" AS ENUM('home', 'works-index', 'insights-index');
  ALTER TABLE "__home_v_stmt_links_v_links" ALTER COLUMN "link_site_page" SET DATA TYPE "public"."enum___home_v_stmt_links_v_links_link_site_page" USING "link_site_page"::"public"."enum___home_v_stmt_links_v_links_link_site_page";
  ALTER TABLE "_home_v_blocks_cta_links" ALTER COLUMN "link_site_page" SET DATA TYPE text;
  DROP TYPE "public"."enum__home_v_blocks_cta_links_link_site_page";
  CREATE TYPE "public"."enum__home_v_blocks_cta_links_link_site_page" AS ENUM('home', 'works-index', 'insights-index');
  ALTER TABLE "_home_v_blocks_cta_links" ALTER COLUMN "link_site_page" SET DATA TYPE "public"."enum__home_v_blocks_cta_links_link_site_page" USING "link_site_page"::"public"."enum__home_v_blocks_cta_links_link_site_page";
  ALTER TABLE "_home_v_blocks_content_columns" ALTER COLUMN "link_site_page" SET DATA TYPE text;
  DROP TYPE "public"."enum__home_v_blocks_content_columns_link_site_page";
  CREATE TYPE "public"."enum__home_v_blocks_content_columns_link_site_page" AS ENUM('home', 'works-index', 'insights-index');
  ALTER TABLE "_home_v_blocks_content_columns" ALTER COLUMN "link_site_page" SET DATA TYPE "public"."enum__home_v_blocks_content_columns_link_site_page" USING "link_site_page"::"public"."enum__home_v_blocks_content_columns_link_site_page";
  ALTER TABLE "__home_v_version_closing_cl_v" ALTER COLUMN "link_site_page" SET DATA TYPE text;
  DROP TYPE "public"."enum___home_v_version_closing_cl_v_link_site_page";
  CREATE TYPE "public"."enum___home_v_version_closing_cl_v_link_site_page" AS ENUM('home', 'works-index', 'insights-index');
  ALTER TABLE "__home_v_version_closing_cl_v" ALTER COLUMN "link_site_page" SET DATA TYPE "public"."enum___home_v_version_closing_cl_v_link_site_page" USING "link_site_page"::"public"."enum___home_v_version_closing_cl_v_link_site_page";
  ALTER TABLE "insights_index_hero_links" ALTER COLUMN "link_site_page" SET DATA TYPE text;
  DROP TYPE "public"."enum_insights_index_hero_links_link_site_page";
  CREATE TYPE "public"."enum_insights_index_hero_links_link_site_page" AS ENUM('home', 'works-index', 'insights-index');
  ALTER TABLE "insights_index_hero_links" ALTER COLUMN "link_site_page" SET DATA TYPE "public"."enum_insights_index_hero_links_link_site_page" USING "link_site_page"::"public"."enum_insights_index_hero_links_link_site_page";
  ALTER TABLE "_insights_index_v_version_hero_links" ALTER COLUMN "link_site_page" SET DATA TYPE text;
  DROP TYPE "public"."enum__insights_index_v_version_hero_links_link_site_page";
  CREATE TYPE "public"."enum__insights_index_v_version_hero_links_link_site_page" AS ENUM('home', 'works-index', 'insights-index');
  ALTER TABLE "_insights_index_v_version_hero_links" ALTER COLUMN "link_site_page" SET DATA TYPE "public"."enum__insights_index_v_version_hero_links_link_site_page" USING "link_site_page"::"public"."enum__insights_index_v_version_hero_links_link_site_page";
  ALTER TABLE "works_index_hero_links" ALTER COLUMN "link_site_page" SET DATA TYPE text;
  DROP TYPE "public"."enum_works_index_hero_links_link_site_page";
  CREATE TYPE "public"."enum_works_index_hero_links_link_site_page" AS ENUM('home', 'works-index', 'insights-index');
  ALTER TABLE "works_index_hero_links" ALTER COLUMN "link_site_page" SET DATA TYPE "public"."enum_works_index_hero_links_link_site_page" USING "link_site_page"::"public"."enum_works_index_hero_links_link_site_page";
  ALTER TABLE "_works_index_v_version_hero_links" ALTER COLUMN "link_site_page" SET DATA TYPE text;
  DROP TYPE "public"."enum__works_index_v_version_hero_links_link_site_page";
  CREATE TYPE "public"."enum__works_index_v_version_hero_links_link_site_page" AS ENUM('home', 'works-index', 'insights-index');
  ALTER TABLE "_works_index_v_version_hero_links" ALTER COLUMN "link_site_page" SET DATA TYPE "public"."enum__works_index_v_version_hero_links_link_site_page" USING "link_site_page"::"public"."enum__works_index_v_version_hero_links_link_site_page";
  ALTER TABLE "header_nav_items" ALTER COLUMN "link_site_page" SET DATA TYPE text;
  DROP TYPE "public"."enum_header_nav_items_link_site_page";
  CREATE TYPE "public"."enum_header_nav_items_link_site_page" AS ENUM('home', 'works-index', 'insights-index');
  ALTER TABLE "header_nav_items" ALTER COLUMN "link_site_page" SET DATA TYPE "public"."enum_header_nav_items_link_site_page" USING "link_site_page"::"public"."enum_header_nav_items_link_site_page";
  ALTER TABLE "header" ALTER COLUMN "cta_link_site_page" SET DATA TYPE text;
  DROP TYPE "public"."enum_header_cta_link_site_page";
  CREATE TYPE "public"."enum_header_cta_link_site_page" AS ENUM('home', 'works-index', 'insights-index');
  ALTER TABLE "header" ALTER COLUMN "cta_link_site_page" SET DATA TYPE "public"."enum_header_cta_link_site_page" USING "cta_link_site_page"::"public"."enum_header_cta_link_site_page";
  ALTER TABLE "footer_closing_links" ALTER COLUMN "link_site_page" SET DATA TYPE text;
  DROP TYPE "public"."enum_footer_closing_links_link_site_page";
  CREATE TYPE "public"."enum_footer_closing_links_link_site_page" AS ENUM('home', 'works-index', 'insights-index');
  ALTER TABLE "footer_closing_links" ALTER COLUMN "link_site_page" SET DATA TYPE "public"."enum_footer_closing_links_link_site_page" USING "link_site_page"::"public"."enum_footer_closing_links_link_site_page";
  ALTER TABLE "footer" ALTER COLUMN "get_in_touch_site_page" SET DATA TYPE text;
  DROP TYPE "public"."enum_footer_get_in_touch_site_page";
  CREATE TYPE "public"."enum_footer_get_in_touch_site_page" AS ENUM('home', 'works-index', 'insights-index');
  ALTER TABLE "footer" ALTER COLUMN "get_in_touch_site_page" SET DATA TYPE "public"."enum_footer_get_in_touch_site_page" USING "get_in_touch_site_page"::"public"."enum_footer_get_in_touch_site_page";
  ALTER TABLE "site_info_legal_links" ALTER COLUMN "link_site_page" SET DATA TYPE text;
  DROP TYPE "public"."enum_site_info_legal_links_link_site_page";
  CREATE TYPE "public"."enum_site_info_legal_links_link_site_page" AS ENUM('home', 'works-index', 'insights-index');
  ALTER TABLE "site_info_legal_links" ALTER COLUMN "link_site_page" SET DATA TYPE "public"."enum_site_info_legal_links_link_site_page" USING "link_site_page"::"public"."enum_site_info_legal_links_link_site_page";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "lab_index_find";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "lab_index_update";
  DROP TYPE "public"."enum_lab_index_hero_links_link_type";
  DROP TYPE "public"."enum_lab_index_hero_links_link_site_page";
  DROP TYPE "public"."enum_lab_index_hero_links_link_appearance";
  DROP TYPE "public"."enum_lab_index_hero_type";
  DROP TYPE "public"."enum_lab_index_hero_visual_type";
  DROP TYPE "public"."enum_lab_index_menu_preview_type";
  DROP TYPE "public"."enum_lab_index_status";
  DROP TYPE "public"."enum__lab_index_v_version_hero_links_link_type";
  DROP TYPE "public"."enum__lab_index_v_version_hero_links_link_site_page";
  DROP TYPE "public"."enum__lab_index_v_version_hero_links_link_appearance";
  DROP TYPE "public"."enum__lab_index_v_version_hero_type";
  DROP TYPE "public"."enum__lab_index_v_version_hero_visual_type";
  DROP TYPE "public"."enum__lab_index_v_version_menu_preview_type";
  DROP TYPE "public"."enum__lab_index_v_version_status";`)
}
