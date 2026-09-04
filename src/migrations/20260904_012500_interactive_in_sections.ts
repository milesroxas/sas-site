import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_faq_link_type" AS ENUM('reference', 'site', 'custom');
  CREATE TYPE "public"."enum_pages_faq_link_site_page" AS ENUM('home', 'works-index', 'insights-index');
  CREATE TYPE "public"."enum_pages_faq_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___pages_v_faq_v_link_type" AS ENUM('reference', 'site', 'custom');
  CREATE TYPE "public"."enum___pages_v_faq_v_link_site_page" AS ENUM('home', 'works-index', 'insights-index');
  CREATE TYPE "public"."enum___pages_v_faq_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_posts_faq_link_type" AS ENUM('reference', 'site', 'custom');
  CREATE TYPE "public"."enum_posts_faq_link_site_page" AS ENUM('home', 'works-index', 'insights-index');
  CREATE TYPE "public"."enum_posts_faq_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_posts_blocks_carousel_width" AS ENUM('contained', 'full-width');
  CREATE TYPE "public"."enum_posts_blocks_carousel_slide_size" AS ENUM('full', 'half', 'third');
  CREATE TYPE "public"."enum_posts_blocks_carousel_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___posts_v_faq_v_link_type" AS ENUM('reference', 'site', 'custom');
  CREATE TYPE "public"."enum___posts_v_faq_v_link_site_page" AS ENUM('home', 'works-index', 'insights-index');
  CREATE TYPE "public"."enum___posts_v_faq_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum__posts_v_blocks_carousel_width" AS ENUM('contained', 'full-width');
  CREATE TYPE "public"."enum__posts_v_blocks_carousel_slide_size" AS ENUM('full', 'half', 'third');
  CREATE TYPE "public"."enum__posts_v_blocks_carousel_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_work_pages_faq_link_type" AS ENUM('reference', 'site', 'custom');
  CREATE TYPE "public"."enum_work_pages_faq_link_site_page" AS ENUM('home', 'works-index', 'insights-index');
  CREATE TYPE "public"."enum_work_pages_faq_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___work_pages_v_faq_v_link_type" AS ENUM('reference', 'site', 'custom');
  CREATE TYPE "public"."enum___work_pages_v_faq_v_link_site_page" AS ENUM('home', 'works-index', 'insights-index');
  CREATE TYPE "public"."enum___work_pages_v_faq_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_lab_pages_faq_link_type" AS ENUM('reference', 'site', 'custom');
  CREATE TYPE "public"."enum_lab_pages_faq_link_site_page" AS ENUM('home', 'works-index', 'insights-index');
  CREATE TYPE "public"."enum_lab_pages_faq_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___lab_pages_v_faq_v_link_type" AS ENUM('reference', 'site', 'custom');
  CREATE TYPE "public"."enum___lab_pages_v_faq_v_link_site_page" AS ENUM('home', 'works-index', 'insights-index');
  CREATE TYPE "public"."enum___lab_pages_v_faq_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_expertise_pages_faq_link_type" AS ENUM('reference', 'site', 'custom');
  CREATE TYPE "public"."enum_expertise_pages_faq_link_site_page" AS ENUM('home', 'works-index', 'insights-index');
  CREATE TYPE "public"."enum_expertise_pages_faq_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___expertise_pages_v_faq_v_link_type" AS ENUM('reference', 'site', 'custom');
  CREATE TYPE "public"."enum___expertise_pages_v_faq_v_link_site_page" AS ENUM('home', 'works-index', 'insights-index');
  CREATE TYPE "public"."enum___expertise_pages_v_faq_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_audience_pages_faq_link_type" AS ENUM('reference', 'site', 'custom');
  CREATE TYPE "public"."enum_audience_pages_faq_link_site_page" AS ENUM('home', 'works-index', 'insights-index');
  CREATE TYPE "public"."enum_audience_pages_faq_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___audience_pages_v_faq_v_link_type" AS ENUM('reference', 'site', 'custom');
  CREATE TYPE "public"."enum___audience_pages_v_faq_v_link_site_page" AS ENUM('home', 'works-index', 'insights-index');
  CREATE TYPE "public"."enum___audience_pages_v_faq_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_home_faq_link_type" AS ENUM('reference', 'site', 'custom');
  CREATE TYPE "public"."enum_home_faq_link_site_page" AS ENUM('home', 'works-index', 'insights-index');
  CREATE TYPE "public"."enum_home_faq_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___home_v_faq_v_link_type" AS ENUM('reference', 'site', 'custom');
  CREATE TYPE "public"."enum___home_v_faq_v_link_site_page" AS ENUM('home', 'works-index', 'insights-index');
  CREATE TYPE "public"."enum___home_v_faq_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TABLE "pages_faq_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" jsonb
  );
  
  CREATE TABLE "pages_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"enable_link" boolean,
  	"prompt" varchar,
  	"link_type" "enum_pages_faq_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_site_page" "enum_pages_faq_link_site_page",
  	"link_url" varchar,
  	"link_label" varchar,
  	"theme" "enum_pages_faq_theme" DEFAULT 'light',
  	"block_name" varchar
  );
  
  CREATE TABLE "__pages_v_faq_v_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" jsonb,
  	"_uuid" varchar
  );
  
  CREATE TABLE "__pages_v_faq_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"enable_link" boolean,
  	"prompt" varchar,
  	"link_type" "enum___pages_v_faq_v_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_site_page" "enum___pages_v_faq_v_link_site_page",
  	"link_url" varchar,
  	"link_label" varchar,
  	"theme" "enum___pages_v_faq_v_theme" DEFAULT 'light',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "posts_faq_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" jsonb
  );
  
  CREATE TABLE "posts_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"enable_link" boolean,
  	"prompt" varchar,
  	"link_type" "enum_posts_faq_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_site_page" "enum_posts_faq_link_site_page",
  	"link_url" varchar,
  	"link_label" varchar,
  	"theme" "enum_posts_faq_theme" DEFAULT 'light',
  	"block_name" varchar
  );
  
  CREATE TABLE "posts_blocks_carousel_slides" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"caption" varchar
  );
  
  CREATE TABLE "posts_blocks_carousel" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"width" "enum_posts_blocks_carousel_width" DEFAULT 'contained',
  	"show_arrows" boolean DEFAULT false,
  	"slide_size" "enum_posts_blocks_carousel_slide_size" DEFAULT 'full',
  	"theme" "enum_posts_blocks_carousel_theme" DEFAULT 'light',
  	"block_name" varchar
  );
  
  CREATE TABLE "__posts_v_faq_v_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" jsonb,
  	"_uuid" varchar
  );
  
  CREATE TABLE "__posts_v_faq_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"enable_link" boolean,
  	"prompt" varchar,
  	"link_type" "enum___posts_v_faq_v_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_site_page" "enum___posts_v_faq_v_link_site_page",
  	"link_url" varchar,
  	"link_label" varchar,
  	"theme" "enum___posts_v_faq_v_theme" DEFAULT 'light',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_posts_v_blocks_carousel_slides" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"caption" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_posts_v_blocks_carousel" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"width" "enum__posts_v_blocks_carousel_width" DEFAULT 'contained',
  	"show_arrows" boolean DEFAULT false,
  	"slide_size" "enum__posts_v_blocks_carousel_slide_size" DEFAULT 'full',
  	"theme" "enum__posts_v_blocks_carousel_theme" DEFAULT 'light',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "work_pages_faq_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" jsonb
  );
  
  CREATE TABLE "work_pages_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"enable_link" boolean,
  	"prompt" varchar,
  	"link_type" "enum_work_pages_faq_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_site_page" "enum_work_pages_faq_link_site_page",
  	"link_url" varchar,
  	"link_label" varchar,
  	"theme" "enum_work_pages_faq_theme" DEFAULT 'light',
  	"block_name" varchar
  );
  
  CREATE TABLE "__work_pages_v_faq_v_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" jsonb,
  	"_uuid" varchar
  );
  
  CREATE TABLE "__work_pages_v_faq_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"enable_link" boolean,
  	"prompt" varchar,
  	"link_type" "enum___work_pages_v_faq_v_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_site_page" "enum___work_pages_v_faq_v_link_site_page",
  	"link_url" varchar,
  	"link_label" varchar,
  	"theme" "enum___work_pages_v_faq_v_theme" DEFAULT 'light',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "lab_pages_faq_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" jsonb
  );
  
  CREATE TABLE "lab_pages_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"enable_link" boolean,
  	"prompt" varchar,
  	"link_type" "enum_lab_pages_faq_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_site_page" "enum_lab_pages_faq_link_site_page",
  	"link_url" varchar,
  	"link_label" varchar,
  	"theme" "enum_lab_pages_faq_theme" DEFAULT 'light',
  	"block_name" varchar
  );
  
  CREATE TABLE "__lab_pages_v_faq_v_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" jsonb,
  	"_uuid" varchar
  );
  
  CREATE TABLE "__lab_pages_v_faq_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"enable_link" boolean,
  	"prompt" varchar,
  	"link_type" "enum___lab_pages_v_faq_v_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_site_page" "enum___lab_pages_v_faq_v_link_site_page",
  	"link_url" varchar,
  	"link_label" varchar,
  	"theme" "enum___lab_pages_v_faq_v_theme" DEFAULT 'light',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "expertise_pages_faq_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" jsonb
  );
  
  CREATE TABLE "expertise_pages_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"enable_link" boolean,
  	"prompt" varchar,
  	"link_type" "enum_expertise_pages_faq_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_site_page" "enum_expertise_pages_faq_link_site_page",
  	"link_url" varchar,
  	"link_label" varchar,
  	"theme" "enum_expertise_pages_faq_theme" DEFAULT 'light',
  	"block_name" varchar
  );
  
  CREATE TABLE "__expertise_pages_v_faq_v_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" jsonb,
  	"_uuid" varchar
  );
  
  CREATE TABLE "__expertise_pages_v_faq_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"enable_link" boolean,
  	"prompt" varchar,
  	"link_type" "enum___expertise_pages_v_faq_v_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_site_page" "enum___expertise_pages_v_faq_v_link_site_page",
  	"link_url" varchar,
  	"link_label" varchar,
  	"theme" "enum___expertise_pages_v_faq_v_theme" DEFAULT 'light',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "audience_pages_faq_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" jsonb
  );
  
  CREATE TABLE "audience_pages_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"enable_link" boolean,
  	"prompt" varchar,
  	"link_type" "enum_audience_pages_faq_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_site_page" "enum_audience_pages_faq_link_site_page",
  	"link_url" varchar,
  	"link_label" varchar,
  	"theme" "enum_audience_pages_faq_theme" DEFAULT 'light',
  	"block_name" varchar
  );
  
  CREATE TABLE "__audience_pages_v_faq_v_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" jsonb,
  	"_uuid" varchar
  );
  
  CREATE TABLE "__audience_pages_v_faq_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"enable_link" boolean,
  	"prompt" varchar,
  	"link_type" "enum___audience_pages_v_faq_v_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_site_page" "enum___audience_pages_v_faq_v_link_site_page",
  	"link_url" varchar,
  	"link_label" varchar,
  	"theme" "enum___audience_pages_v_faq_v_theme" DEFAULT 'light',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "home_faq_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" jsonb
  );
  
  CREATE TABLE "home_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"enable_link" boolean,
  	"prompt" varchar,
  	"link_type" "enum_home_faq_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_site_page" "enum_home_faq_link_site_page",
  	"link_url" varchar,
  	"link_label" varchar,
  	"theme" "enum_home_faq_theme" DEFAULT 'light',
  	"block_name" varchar
  );
  
  CREATE TABLE "__home_v_faq_v_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" jsonb,
  	"_uuid" varchar
  );
  
  CREATE TABLE "__home_v_faq_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"enable_link" boolean,
  	"prompt" varchar,
  	"link_type" "enum___home_v_faq_v_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_site_page" "enum___home_v_faq_v_link_site_page",
  	"link_url" varchar,
  	"link_label" varchar,
  	"theme" "enum___home_v_faq_v_theme" DEFAULT 'light',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "pages_faq_items" ADD CONSTRAINT "pages_faq_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_faq" ADD CONSTRAINT "pages_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__pages_v_faq_v_items" ADD CONSTRAINT "__pages_v_faq_v_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."__pages_v_faq_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__pages_v_faq_v" ADD CONSTRAINT "__pages_v_faq_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_faq_items" ADD CONSTRAINT "posts_faq_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_faq" ADD CONSTRAINT "posts_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_carousel_slides" ADD CONSTRAINT "posts_blocks_carousel_slides_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_carousel_slides" ADD CONSTRAINT "posts_blocks_carousel_slides_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts_blocks_carousel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_carousel" ADD CONSTRAINT "posts_blocks_carousel_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__posts_v_faq_v_items" ADD CONSTRAINT "__posts_v_faq_v_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."__posts_v_faq_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__posts_v_faq_v" ADD CONSTRAINT "__posts_v_faq_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_carousel_slides" ADD CONSTRAINT "_posts_v_blocks_carousel_slides_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_carousel_slides" ADD CONSTRAINT "_posts_v_blocks_carousel_slides_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v_blocks_carousel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_carousel" ADD CONSTRAINT "_posts_v_blocks_carousel_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "work_pages_faq_items" ADD CONSTRAINT "work_pages_faq_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."work_pages_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "work_pages_faq" ADD CONSTRAINT "work_pages_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."work_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__work_pages_v_faq_v_items" ADD CONSTRAINT "__work_pages_v_faq_v_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."__work_pages_v_faq_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__work_pages_v_faq_v" ADD CONSTRAINT "__work_pages_v_faq_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_work_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lab_pages_faq_items" ADD CONSTRAINT "lab_pages_faq_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lab_pages_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lab_pages_faq" ADD CONSTRAINT "lab_pages_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lab_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__lab_pages_v_faq_v_items" ADD CONSTRAINT "__lab_pages_v_faq_v_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."__lab_pages_v_faq_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__lab_pages_v_faq_v" ADD CONSTRAINT "__lab_pages_v_faq_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_lab_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "expertise_pages_faq_items" ADD CONSTRAINT "expertise_pages_faq_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."expertise_pages_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "expertise_pages_faq" ADD CONSTRAINT "expertise_pages_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."expertise_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__expertise_pages_v_faq_v_items" ADD CONSTRAINT "__expertise_pages_v_faq_v_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."__expertise_pages_v_faq_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__expertise_pages_v_faq_v" ADD CONSTRAINT "__expertise_pages_v_faq_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_expertise_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "audience_pages_faq_items" ADD CONSTRAINT "audience_pages_faq_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."audience_pages_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "audience_pages_faq" ADD CONSTRAINT "audience_pages_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."audience_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__audience_pages_v_faq_v_items" ADD CONSTRAINT "__audience_pages_v_faq_v_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."__audience_pages_v_faq_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__audience_pages_v_faq_v" ADD CONSTRAINT "__audience_pages_v_faq_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_audience_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_faq_items" ADD CONSTRAINT "home_faq_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_faq" ADD CONSTRAINT "home_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__home_v_faq_v_items" ADD CONSTRAINT "__home_v_faq_v_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."__home_v_faq_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__home_v_faq_v" ADD CONSTRAINT "__home_v_faq_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_faq_items_order_idx" ON "pages_faq_items" USING btree ("_order");
  CREATE INDEX "pages_faq_items_parent_id_idx" ON "pages_faq_items" USING btree ("_parent_id");
  CREATE INDEX "pages_faq_order_idx" ON "pages_faq" USING btree ("_order");
  CREATE INDEX "pages_faq_parent_id_idx" ON "pages_faq" USING btree ("_parent_id");
  CREATE INDEX "pages_faq_path_idx" ON "pages_faq" USING btree ("_path");
  CREATE INDEX "__pages_v_faq_v_items_order_idx" ON "__pages_v_faq_v_items" USING btree ("_order");
  CREATE INDEX "__pages_v_faq_v_items_parent_id_idx" ON "__pages_v_faq_v_items" USING btree ("_parent_id");
  CREATE INDEX "__pages_v_faq_v_order_idx" ON "__pages_v_faq_v" USING btree ("_order");
  CREATE INDEX "__pages_v_faq_v_parent_id_idx" ON "__pages_v_faq_v" USING btree ("_parent_id");
  CREATE INDEX "__pages_v_faq_v_path_idx" ON "__pages_v_faq_v" USING btree ("_path");
  CREATE INDEX "posts_faq_items_order_idx" ON "posts_faq_items" USING btree ("_order");
  CREATE INDEX "posts_faq_items_parent_id_idx" ON "posts_faq_items" USING btree ("_parent_id");
  CREATE INDEX "posts_faq_order_idx" ON "posts_faq" USING btree ("_order");
  CREATE INDEX "posts_faq_parent_id_idx" ON "posts_faq" USING btree ("_parent_id");
  CREATE INDEX "posts_faq_path_idx" ON "posts_faq" USING btree ("_path");
  CREATE INDEX "posts_blocks_carousel_slides_order_idx" ON "posts_blocks_carousel_slides" USING btree ("_order");
  CREATE INDEX "posts_blocks_carousel_slides_parent_id_idx" ON "posts_blocks_carousel_slides" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_carousel_slides_media_idx" ON "posts_blocks_carousel_slides" USING btree ("media_id");
  CREATE INDEX "posts_blocks_carousel_order_idx" ON "posts_blocks_carousel" USING btree ("_order");
  CREATE INDEX "posts_blocks_carousel_parent_id_idx" ON "posts_blocks_carousel" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_carousel_path_idx" ON "posts_blocks_carousel" USING btree ("_path");
  CREATE INDEX "__posts_v_faq_v_items_order_idx" ON "__posts_v_faq_v_items" USING btree ("_order");
  CREATE INDEX "__posts_v_faq_v_items_parent_id_idx" ON "__posts_v_faq_v_items" USING btree ("_parent_id");
  CREATE INDEX "__posts_v_faq_v_order_idx" ON "__posts_v_faq_v" USING btree ("_order");
  CREATE INDEX "__posts_v_faq_v_parent_id_idx" ON "__posts_v_faq_v" USING btree ("_parent_id");
  CREATE INDEX "__posts_v_faq_v_path_idx" ON "__posts_v_faq_v" USING btree ("_path");
  CREATE INDEX "_posts_v_blocks_carousel_slides_order_idx" ON "_posts_v_blocks_carousel_slides" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_carousel_slides_parent_id_idx" ON "_posts_v_blocks_carousel_slides" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_carousel_slides_media_idx" ON "_posts_v_blocks_carousel_slides" USING btree ("media_id");
  CREATE INDEX "_posts_v_blocks_carousel_order_idx" ON "_posts_v_blocks_carousel" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_carousel_parent_id_idx" ON "_posts_v_blocks_carousel" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_carousel_path_idx" ON "_posts_v_blocks_carousel" USING btree ("_path");
  CREATE INDEX "work_pages_faq_items_order_idx" ON "work_pages_faq_items" USING btree ("_order");
  CREATE INDEX "work_pages_faq_items_parent_id_idx" ON "work_pages_faq_items" USING btree ("_parent_id");
  CREATE INDEX "work_pages_faq_order_idx" ON "work_pages_faq" USING btree ("_order");
  CREATE INDEX "work_pages_faq_parent_id_idx" ON "work_pages_faq" USING btree ("_parent_id");
  CREATE INDEX "work_pages_faq_path_idx" ON "work_pages_faq" USING btree ("_path");
  CREATE INDEX "__work_pages_v_faq_v_items_order_idx" ON "__work_pages_v_faq_v_items" USING btree ("_order");
  CREATE INDEX "__work_pages_v_faq_v_items_parent_id_idx" ON "__work_pages_v_faq_v_items" USING btree ("_parent_id");
  CREATE INDEX "__work_pages_v_faq_v_order_idx" ON "__work_pages_v_faq_v" USING btree ("_order");
  CREATE INDEX "__work_pages_v_faq_v_parent_id_idx" ON "__work_pages_v_faq_v" USING btree ("_parent_id");
  CREATE INDEX "__work_pages_v_faq_v_path_idx" ON "__work_pages_v_faq_v" USING btree ("_path");
  CREATE INDEX "lab_pages_faq_items_order_idx" ON "lab_pages_faq_items" USING btree ("_order");
  CREATE INDEX "lab_pages_faq_items_parent_id_idx" ON "lab_pages_faq_items" USING btree ("_parent_id");
  CREATE INDEX "lab_pages_faq_order_idx" ON "lab_pages_faq" USING btree ("_order");
  CREATE INDEX "lab_pages_faq_parent_id_idx" ON "lab_pages_faq" USING btree ("_parent_id");
  CREATE INDEX "lab_pages_faq_path_idx" ON "lab_pages_faq" USING btree ("_path");
  CREATE INDEX "__lab_pages_v_faq_v_items_order_idx" ON "__lab_pages_v_faq_v_items" USING btree ("_order");
  CREATE INDEX "__lab_pages_v_faq_v_items_parent_id_idx" ON "__lab_pages_v_faq_v_items" USING btree ("_parent_id");
  CREATE INDEX "__lab_pages_v_faq_v_order_idx" ON "__lab_pages_v_faq_v" USING btree ("_order");
  CREATE INDEX "__lab_pages_v_faq_v_parent_id_idx" ON "__lab_pages_v_faq_v" USING btree ("_parent_id");
  CREATE INDEX "__lab_pages_v_faq_v_path_idx" ON "__lab_pages_v_faq_v" USING btree ("_path");
  CREATE INDEX "expertise_pages_faq_items_order_idx" ON "expertise_pages_faq_items" USING btree ("_order");
  CREATE INDEX "expertise_pages_faq_items_parent_id_idx" ON "expertise_pages_faq_items" USING btree ("_parent_id");
  CREATE INDEX "expertise_pages_faq_order_idx" ON "expertise_pages_faq" USING btree ("_order");
  CREATE INDEX "expertise_pages_faq_parent_id_idx" ON "expertise_pages_faq" USING btree ("_parent_id");
  CREATE INDEX "expertise_pages_faq_path_idx" ON "expertise_pages_faq" USING btree ("_path");
  CREATE INDEX "__expertise_pages_v_faq_v_items_order_idx" ON "__expertise_pages_v_faq_v_items" USING btree ("_order");
  CREATE INDEX "__expertise_pages_v_faq_v_items_parent_id_idx" ON "__expertise_pages_v_faq_v_items" USING btree ("_parent_id");
  CREATE INDEX "__expertise_pages_v_faq_v_order_idx" ON "__expertise_pages_v_faq_v" USING btree ("_order");
  CREATE INDEX "__expertise_pages_v_faq_v_parent_id_idx" ON "__expertise_pages_v_faq_v" USING btree ("_parent_id");
  CREATE INDEX "__expertise_pages_v_faq_v_path_idx" ON "__expertise_pages_v_faq_v" USING btree ("_path");
  CREATE INDEX "audience_pages_faq_items_order_idx" ON "audience_pages_faq_items" USING btree ("_order");
  CREATE INDEX "audience_pages_faq_items_parent_id_idx" ON "audience_pages_faq_items" USING btree ("_parent_id");
  CREATE INDEX "audience_pages_faq_order_idx" ON "audience_pages_faq" USING btree ("_order");
  CREATE INDEX "audience_pages_faq_parent_id_idx" ON "audience_pages_faq" USING btree ("_parent_id");
  CREATE INDEX "audience_pages_faq_path_idx" ON "audience_pages_faq" USING btree ("_path");
  CREATE INDEX "__audience_pages_v_faq_v_items_order_idx" ON "__audience_pages_v_faq_v_items" USING btree ("_order");
  CREATE INDEX "__audience_pages_v_faq_v_items_parent_id_idx" ON "__audience_pages_v_faq_v_items" USING btree ("_parent_id");
  CREATE INDEX "__audience_pages_v_faq_v_order_idx" ON "__audience_pages_v_faq_v" USING btree ("_order");
  CREATE INDEX "__audience_pages_v_faq_v_parent_id_idx" ON "__audience_pages_v_faq_v" USING btree ("_parent_id");
  CREATE INDEX "__audience_pages_v_faq_v_path_idx" ON "__audience_pages_v_faq_v" USING btree ("_path");
  CREATE INDEX "home_faq_items_order_idx" ON "home_faq_items" USING btree ("_order");
  CREATE INDEX "home_faq_items_parent_id_idx" ON "home_faq_items" USING btree ("_parent_id");
  CREATE INDEX "home_faq_order_idx" ON "home_faq" USING btree ("_order");
  CREATE INDEX "home_faq_parent_id_idx" ON "home_faq" USING btree ("_parent_id");
  CREATE INDEX "home_faq_path_idx" ON "home_faq" USING btree ("_path");
  CREATE INDEX "__home_v_faq_v_items_order_idx" ON "__home_v_faq_v_items" USING btree ("_order");
  CREATE INDEX "__home_v_faq_v_items_parent_id_idx" ON "__home_v_faq_v_items" USING btree ("_parent_id");
  CREATE INDEX "__home_v_faq_v_order_idx" ON "__home_v_faq_v" USING btree ("_order");
  CREATE INDEX "__home_v_faq_v_parent_id_idx" ON "__home_v_faq_v" USING btree ("_parent_id");
  CREATE INDEX "__home_v_faq_v_path_idx" ON "__home_v_faq_v" USING btree ("_path");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_faq_items" CASCADE;
  DROP TABLE "pages_faq" CASCADE;
  DROP TABLE "__pages_v_faq_v_items" CASCADE;
  DROP TABLE "__pages_v_faq_v" CASCADE;
  DROP TABLE "posts_faq_items" CASCADE;
  DROP TABLE "posts_faq" CASCADE;
  DROP TABLE "posts_blocks_carousel_slides" CASCADE;
  DROP TABLE "posts_blocks_carousel" CASCADE;
  DROP TABLE "__posts_v_faq_v_items" CASCADE;
  DROP TABLE "__posts_v_faq_v" CASCADE;
  DROP TABLE "_posts_v_blocks_carousel_slides" CASCADE;
  DROP TABLE "_posts_v_blocks_carousel" CASCADE;
  DROP TABLE "work_pages_faq_items" CASCADE;
  DROP TABLE "work_pages_faq" CASCADE;
  DROP TABLE "__work_pages_v_faq_v_items" CASCADE;
  DROP TABLE "__work_pages_v_faq_v" CASCADE;
  DROP TABLE "lab_pages_faq_items" CASCADE;
  DROP TABLE "lab_pages_faq" CASCADE;
  DROP TABLE "__lab_pages_v_faq_v_items" CASCADE;
  DROP TABLE "__lab_pages_v_faq_v" CASCADE;
  DROP TABLE "expertise_pages_faq_items" CASCADE;
  DROP TABLE "expertise_pages_faq" CASCADE;
  DROP TABLE "__expertise_pages_v_faq_v_items" CASCADE;
  DROP TABLE "__expertise_pages_v_faq_v" CASCADE;
  DROP TABLE "audience_pages_faq_items" CASCADE;
  DROP TABLE "audience_pages_faq" CASCADE;
  DROP TABLE "__audience_pages_v_faq_v_items" CASCADE;
  DROP TABLE "__audience_pages_v_faq_v" CASCADE;
  DROP TABLE "home_faq_items" CASCADE;
  DROP TABLE "home_faq" CASCADE;
  DROP TABLE "__home_v_faq_v_items" CASCADE;
  DROP TABLE "__home_v_faq_v" CASCADE;
  DROP TYPE "public"."enum_pages_faq_link_type";
  DROP TYPE "public"."enum_pages_faq_link_site_page";
  DROP TYPE "public"."enum_pages_faq_theme";
  DROP TYPE "public"."enum___pages_v_faq_v_link_type";
  DROP TYPE "public"."enum___pages_v_faq_v_link_site_page";
  DROP TYPE "public"."enum___pages_v_faq_v_theme";
  DROP TYPE "public"."enum_posts_faq_link_type";
  DROP TYPE "public"."enum_posts_faq_link_site_page";
  DROP TYPE "public"."enum_posts_faq_theme";
  DROP TYPE "public"."enum_posts_blocks_carousel_width";
  DROP TYPE "public"."enum_posts_blocks_carousel_slide_size";
  DROP TYPE "public"."enum_posts_blocks_carousel_theme";
  DROP TYPE "public"."enum___posts_v_faq_v_link_type";
  DROP TYPE "public"."enum___posts_v_faq_v_link_site_page";
  DROP TYPE "public"."enum___posts_v_faq_v_theme";
  DROP TYPE "public"."enum__posts_v_blocks_carousel_width";
  DROP TYPE "public"."enum__posts_v_blocks_carousel_slide_size";
  DROP TYPE "public"."enum__posts_v_blocks_carousel_theme";
  DROP TYPE "public"."enum_work_pages_faq_link_type";
  DROP TYPE "public"."enum_work_pages_faq_link_site_page";
  DROP TYPE "public"."enum_work_pages_faq_theme";
  DROP TYPE "public"."enum___work_pages_v_faq_v_link_type";
  DROP TYPE "public"."enum___work_pages_v_faq_v_link_site_page";
  DROP TYPE "public"."enum___work_pages_v_faq_v_theme";
  DROP TYPE "public"."enum_lab_pages_faq_link_type";
  DROP TYPE "public"."enum_lab_pages_faq_link_site_page";
  DROP TYPE "public"."enum_lab_pages_faq_theme";
  DROP TYPE "public"."enum___lab_pages_v_faq_v_link_type";
  DROP TYPE "public"."enum___lab_pages_v_faq_v_link_site_page";
  DROP TYPE "public"."enum___lab_pages_v_faq_v_theme";
  DROP TYPE "public"."enum_expertise_pages_faq_link_type";
  DROP TYPE "public"."enum_expertise_pages_faq_link_site_page";
  DROP TYPE "public"."enum_expertise_pages_faq_theme";
  DROP TYPE "public"."enum___expertise_pages_v_faq_v_link_type";
  DROP TYPE "public"."enum___expertise_pages_v_faq_v_link_site_page";
  DROP TYPE "public"."enum___expertise_pages_v_faq_v_theme";
  DROP TYPE "public"."enum_audience_pages_faq_link_type";
  DROP TYPE "public"."enum_audience_pages_faq_link_site_page";
  DROP TYPE "public"."enum_audience_pages_faq_theme";
  DROP TYPE "public"."enum___audience_pages_v_faq_v_link_type";
  DROP TYPE "public"."enum___audience_pages_v_faq_v_link_site_page";
  DROP TYPE "public"."enum___audience_pages_v_faq_v_theme";
  DROP TYPE "public"."enum_home_faq_link_type";
  DROP TYPE "public"."enum_home_faq_link_site_page";
  DROP TYPE "public"."enum_home_faq_theme";
  DROP TYPE "public"."enum___home_v_faq_v_link_type";
  DROP TYPE "public"."enum___home_v_faq_v_link_site_page";
  DROP TYPE "public"."enum___home_v_faq_v_theme";`)
}
