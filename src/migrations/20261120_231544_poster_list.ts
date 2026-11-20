import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_poster_list_items_link_type" AS ENUM('reference', 'site', 'custom');
  CREATE TYPE "public"."enum_pages_poster_list_items_link_site_page" AS ENUM('home', 'works-index', 'insights-index', 'lab-index');
  CREATE TYPE "public"."enum_pages_poster_list_layout" AS ENUM('stacked', 'row');
  CREATE TYPE "public"."enum_pages_poster_list_item_source" AS ENUM('static', 'collection');
  CREATE TYPE "public"."enum_pages_poster_list_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum___pages_v_poster_list_v_items_link_type" AS ENUM('reference', 'site', 'custom');
  CREATE TYPE "public"."enum___pages_v_poster_list_v_items_link_site_page" AS ENUM('home', 'works-index', 'insights-index', 'lab-index');
  CREATE TYPE "public"."enum___pages_v_poster_list_v_layout" AS ENUM('stacked', 'row');
  CREATE TYPE "public"."enum___pages_v_poster_list_v_item_source" AS ENUM('static', 'collection');
  CREATE TYPE "public"."enum___pages_v_poster_list_v_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum_posts_poster_list_items_link_type" AS ENUM('reference', 'site', 'custom');
  CREATE TYPE "public"."enum_posts_poster_list_items_link_site_page" AS ENUM('home', 'works-index', 'insights-index', 'lab-index');
  CREATE TYPE "public"."enum_posts_poster_list_layout" AS ENUM('stacked', 'row');
  CREATE TYPE "public"."enum_posts_poster_list_item_source" AS ENUM('static', 'collection');
  CREATE TYPE "public"."enum_posts_poster_list_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum___posts_v_poster_list_v_items_link_type" AS ENUM('reference', 'site', 'custom');
  CREATE TYPE "public"."enum___posts_v_poster_list_v_items_link_site_page" AS ENUM('home', 'works-index', 'insights-index', 'lab-index');
  CREATE TYPE "public"."enum___posts_v_poster_list_v_layout" AS ENUM('stacked', 'row');
  CREATE TYPE "public"."enum___posts_v_poster_list_v_item_source" AS ENUM('static', 'collection');
  CREATE TYPE "public"."enum___posts_v_poster_list_v_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum_lab_pages_poster_list_items_link_type" AS ENUM('reference', 'site', 'custom');
  CREATE TYPE "public"."enum_lab_pages_poster_list_items_link_site_page" AS ENUM('home', 'works-index', 'insights-index', 'lab-index');
  CREATE TYPE "public"."enum_lab_pages_poster_list_layout" AS ENUM('stacked', 'row');
  CREATE TYPE "public"."enum_lab_pages_poster_list_item_source" AS ENUM('static', 'collection');
  CREATE TYPE "public"."enum_lab_pages_poster_list_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum___lab_pages_v_poster_list_v_items_link_type" AS ENUM('reference', 'site', 'custom');
  CREATE TYPE "public"."enum___lab_pages_v_poster_list_v_items_link_site_page" AS ENUM('home', 'works-index', 'insights-index', 'lab-index');
  CREATE TYPE "public"."enum___lab_pages_v_poster_list_v_layout" AS ENUM('stacked', 'row');
  CREATE TYPE "public"."enum___lab_pages_v_poster_list_v_item_source" AS ENUM('static', 'collection');
  CREATE TYPE "public"."enum___lab_pages_v_poster_list_v_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum_expertise_pages_poster_list_items_link_type" AS ENUM('reference', 'site', 'custom');
  CREATE TYPE "public"."enum_expertise_pages_poster_list_items_link_site_page" AS ENUM('home', 'works-index', 'insights-index', 'lab-index');
  CREATE TYPE "public"."enum_expertise_pages_poster_list_layout" AS ENUM('stacked', 'row');
  CREATE TYPE "public"."enum_expertise_pages_poster_list_item_source" AS ENUM('static', 'collection');
  CREATE TYPE "public"."enum_expertise_pages_poster_list_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum___expertise_pages_v_poster_list_v_items_link_type" AS ENUM('reference', 'site', 'custom');
  CREATE TYPE "public"."enum___expertise_pages_v_poster_list_v_items_link_site_page" AS ENUM('home', 'works-index', 'insights-index', 'lab-index');
  CREATE TYPE "public"."enum___expertise_pages_v_poster_list_v_layout" AS ENUM('stacked', 'row');
  CREATE TYPE "public"."enum___expertise_pages_v_poster_list_v_item_source" AS ENUM('static', 'collection');
  CREATE TYPE "public"."enum___expertise_pages_v_poster_list_v_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum_audience_pages_poster_list_items_link_type" AS ENUM('reference', 'site', 'custom');
  CREATE TYPE "public"."enum_audience_pages_poster_list_items_link_site_page" AS ENUM('home', 'works-index', 'insights-index', 'lab-index');
  CREATE TYPE "public"."enum_audience_pages_poster_list_layout" AS ENUM('stacked', 'row');
  CREATE TYPE "public"."enum_audience_pages_poster_list_item_source" AS ENUM('static', 'collection');
  CREATE TYPE "public"."enum_audience_pages_poster_list_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum___audience_pages_v_poster_list_v_items_link_type" AS ENUM('reference', 'site', 'custom');
  CREATE TYPE "public"."enum___audience_pages_v_poster_list_v_items_link_site_page" AS ENUM('home', 'works-index', 'insights-index', 'lab-index');
  CREATE TYPE "public"."enum___audience_pages_v_poster_list_v_layout" AS ENUM('stacked', 'row');
  CREATE TYPE "public"."enum___audience_pages_v_poster_list_v_item_source" AS ENUM('static', 'collection');
  CREATE TYPE "public"."enum___audience_pages_v_poster_list_v_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum_home_poster_list_items_link_type" AS ENUM('reference', 'site', 'custom');
  CREATE TYPE "public"."enum_home_poster_list_items_link_site_page" AS ENUM('home', 'works-index', 'insights-index', 'lab-index');
  CREATE TYPE "public"."enum_home_poster_list_layout" AS ENUM('stacked', 'row');
  CREATE TYPE "public"."enum_home_poster_list_item_source" AS ENUM('static', 'collection');
  CREATE TYPE "public"."enum_home_poster_list_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum___home_v_poster_list_v_items_link_type" AS ENUM('reference', 'site', 'custom');
  CREATE TYPE "public"."enum___home_v_poster_list_v_items_link_site_page" AS ENUM('home', 'works-index', 'insights-index', 'lab-index');
  CREATE TYPE "public"."enum___home_v_poster_list_v_layout" AS ENUM('stacked', 'row');
  CREATE TYPE "public"."enum___home_v_poster_list_v_item_source" AS ENUM('static', 'collection');
  CREATE TYPE "public"."enum___home_v_poster_list_v_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TABLE "pages_poster_list_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"title" varchar,
  	"description" varchar,
  	"enable_link" boolean,
  	"link_type" "enum_pages_poster_list_items_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_site_page" "enum_pages_poster_list_items_link_site_page",
  	"link_url" varchar
  );
  
  CREATE TABLE "pages_poster_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"summary" varchar,
  	"layout" "enum_pages_poster_list_layout" DEFAULT 'stacked',
  	"item_source" "enum_pages_poster_list_item_source" DEFAULT 'static',
  	"theme" "enum_pages_poster_list_theme" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "__pages_v_poster_list_v_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"title" varchar,
  	"description" varchar,
  	"enable_link" boolean,
  	"link_type" "enum___pages_v_poster_list_v_items_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_site_page" "enum___pages_v_poster_list_v_items_link_site_page",
  	"link_url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "__pages_v_poster_list_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"summary" varchar,
  	"layout" "enum___pages_v_poster_list_v_layout" DEFAULT 'stacked',
  	"item_source" "enum___pages_v_poster_list_v_item_source" DEFAULT 'static',
  	"theme" "enum___pages_v_poster_list_v_theme" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "posts_poster_list_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"title" varchar,
  	"description" varchar,
  	"enable_link" boolean,
  	"link_type" "enum_posts_poster_list_items_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_site_page" "enum_posts_poster_list_items_link_site_page",
  	"link_url" varchar
  );
  
  CREATE TABLE "posts_poster_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"summary" varchar,
  	"layout" "enum_posts_poster_list_layout" DEFAULT 'stacked',
  	"item_source" "enum_posts_poster_list_item_source" DEFAULT 'static',
  	"theme" "enum_posts_poster_list_theme" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "__posts_v_poster_list_v_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"title" varchar,
  	"description" varchar,
  	"enable_link" boolean,
  	"link_type" "enum___posts_v_poster_list_v_items_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_site_page" "enum___posts_v_poster_list_v_items_link_site_page",
  	"link_url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "__posts_v_poster_list_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"summary" varchar,
  	"layout" "enum___posts_v_poster_list_v_layout" DEFAULT 'stacked',
  	"item_source" "enum___posts_v_poster_list_v_item_source" DEFAULT 'static',
  	"theme" "enum___posts_v_poster_list_v_theme" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "lab_pages_poster_list_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"title" varchar,
  	"description" varchar,
  	"enable_link" boolean,
  	"link_type" "enum_lab_pages_poster_list_items_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_site_page" "enum_lab_pages_poster_list_items_link_site_page",
  	"link_url" varchar
  );
  
  CREATE TABLE "lab_pages_poster_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"summary" varchar,
  	"layout" "enum_lab_pages_poster_list_layout" DEFAULT 'stacked',
  	"item_source" "enum_lab_pages_poster_list_item_source" DEFAULT 'static',
  	"theme" "enum_lab_pages_poster_list_theme" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "__lab_pages_v_poster_list_v_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"title" varchar,
  	"description" varchar,
  	"enable_link" boolean,
  	"link_type" "enum___lab_pages_v_poster_list_v_items_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_site_page" "enum___lab_pages_v_poster_list_v_items_link_site_page",
  	"link_url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "__lab_pages_v_poster_list_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"summary" varchar,
  	"layout" "enum___lab_pages_v_poster_list_v_layout" DEFAULT 'stacked',
  	"item_source" "enum___lab_pages_v_poster_list_v_item_source" DEFAULT 'static',
  	"theme" "enum___lab_pages_v_poster_list_v_theme" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "expertise_pages_poster_list_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"title" varchar,
  	"description" varchar,
  	"enable_link" boolean,
  	"link_type" "enum_expertise_pages_poster_list_items_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_site_page" "enum_expertise_pages_poster_list_items_link_site_page",
  	"link_url" varchar
  );
  
  CREATE TABLE "expertise_pages_poster_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"summary" varchar,
  	"layout" "enum_expertise_pages_poster_list_layout" DEFAULT 'stacked',
  	"item_source" "enum_expertise_pages_poster_list_item_source" DEFAULT 'static',
  	"theme" "enum_expertise_pages_poster_list_theme" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "__expertise_pages_v_poster_list_v_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"title" varchar,
  	"description" varchar,
  	"enable_link" boolean,
  	"link_type" "enum___expertise_pages_v_poster_list_v_items_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_site_page" "enum___expertise_pages_v_poster_list_v_items_link_site_page",
  	"link_url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "__expertise_pages_v_poster_list_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"summary" varchar,
  	"layout" "enum___expertise_pages_v_poster_list_v_layout" DEFAULT 'stacked',
  	"item_source" "enum___expertise_pages_v_poster_list_v_item_source" DEFAULT 'static',
  	"theme" "enum___expertise_pages_v_poster_list_v_theme" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "audience_pages_poster_list_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"title" varchar,
  	"description" varchar,
  	"enable_link" boolean,
  	"link_type" "enum_audience_pages_poster_list_items_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_site_page" "enum_audience_pages_poster_list_items_link_site_page",
  	"link_url" varchar
  );
  
  CREATE TABLE "audience_pages_poster_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"summary" varchar,
  	"layout" "enum_audience_pages_poster_list_layout" DEFAULT 'stacked',
  	"item_source" "enum_audience_pages_poster_list_item_source" DEFAULT 'static',
  	"theme" "enum_audience_pages_poster_list_theme" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "__audience_pages_v_poster_list_v_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"title" varchar,
  	"description" varchar,
  	"enable_link" boolean,
  	"link_type" "enum___audience_pages_v_poster_list_v_items_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_site_page" "enum___audience_pages_v_poster_list_v_items_link_site_page",
  	"link_url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "__audience_pages_v_poster_list_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"summary" varchar,
  	"layout" "enum___audience_pages_v_poster_list_v_layout" DEFAULT 'stacked',
  	"item_source" "enum___audience_pages_v_poster_list_v_item_source" DEFAULT 'static',
  	"theme" "enum___audience_pages_v_poster_list_v_theme" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "home_poster_list_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"title" varchar,
  	"description" varchar,
  	"enable_link" boolean,
  	"link_type" "enum_home_poster_list_items_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_site_page" "enum_home_poster_list_items_link_site_page",
  	"link_url" varchar
  );
  
  CREATE TABLE "home_poster_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"summary" varchar,
  	"layout" "enum_home_poster_list_layout" DEFAULT 'stacked',
  	"item_source" "enum_home_poster_list_item_source" DEFAULT 'static',
  	"theme" "enum_home_poster_list_theme" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "__home_v_poster_list_v_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"title" varchar,
  	"description" varchar,
  	"enable_link" boolean,
  	"link_type" "enum___home_v_poster_list_v_items_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_site_page" "enum___home_v_poster_list_v_items_link_site_page",
  	"link_url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "__home_v_poster_list_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"summary" varchar,
  	"layout" "enum___home_v_poster_list_v_layout" DEFAULT 'stacked',
  	"item_source" "enum___home_v_poster_list_v_item_source" DEFAULT 'static',
  	"theme" "enum___home_v_poster_list_v_theme" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "lab_pages_rels" ADD COLUMN "work_pages_id" integer;
  ALTER TABLE "_lab_pages_v_rels" ADD COLUMN "work_pages_id" integer;
  ALTER TABLE "pages_poster_list_items" ADD CONSTRAINT "pages_poster_list_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_poster_list_items" ADD CONSTRAINT "pages_poster_list_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_poster_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_poster_list" ADD CONSTRAINT "pages_poster_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__pages_v_poster_list_v_items" ADD CONSTRAINT "__pages_v_poster_list_v_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__pages_v_poster_list_v_items" ADD CONSTRAINT "__pages_v_poster_list_v_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."__pages_v_poster_list_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__pages_v_poster_list_v" ADD CONSTRAINT "__pages_v_poster_list_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_poster_list_items" ADD CONSTRAINT "posts_poster_list_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_poster_list_items" ADD CONSTRAINT "posts_poster_list_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts_poster_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_poster_list" ADD CONSTRAINT "posts_poster_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__posts_v_poster_list_v_items" ADD CONSTRAINT "__posts_v_poster_list_v_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__posts_v_poster_list_v_items" ADD CONSTRAINT "__posts_v_poster_list_v_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."__posts_v_poster_list_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__posts_v_poster_list_v" ADD CONSTRAINT "__posts_v_poster_list_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lab_pages_poster_list_items" ADD CONSTRAINT "lab_pages_poster_list_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "lab_pages_poster_list_items" ADD CONSTRAINT "lab_pages_poster_list_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lab_pages_poster_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lab_pages_poster_list" ADD CONSTRAINT "lab_pages_poster_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lab_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__lab_pages_v_poster_list_v_items" ADD CONSTRAINT "__lab_pages_v_poster_list_v_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__lab_pages_v_poster_list_v_items" ADD CONSTRAINT "__lab_pages_v_poster_list_v_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."__lab_pages_v_poster_list_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__lab_pages_v_poster_list_v" ADD CONSTRAINT "__lab_pages_v_poster_list_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_lab_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "expertise_pages_poster_list_items" ADD CONSTRAINT "expertise_pages_poster_list_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "expertise_pages_poster_list_items" ADD CONSTRAINT "expertise_pages_poster_list_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."expertise_pages_poster_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "expertise_pages_poster_list" ADD CONSTRAINT "expertise_pages_poster_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."expertise_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__expertise_pages_v_poster_list_v_items" ADD CONSTRAINT "__expertise_pages_v_poster_list_v_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__expertise_pages_v_poster_list_v_items" ADD CONSTRAINT "__expertise_pages_v_poster_list_v_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."__expertise_pages_v_poster_list_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__expertise_pages_v_poster_list_v" ADD CONSTRAINT "__expertise_pages_v_poster_list_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_expertise_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "audience_pages_poster_list_items" ADD CONSTRAINT "audience_pages_poster_list_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "audience_pages_poster_list_items" ADD CONSTRAINT "audience_pages_poster_list_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."audience_pages_poster_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "audience_pages_poster_list" ADD CONSTRAINT "audience_pages_poster_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."audience_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__audience_pages_v_poster_list_v_items" ADD CONSTRAINT "__audience_pages_v_poster_list_v_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__audience_pages_v_poster_list_v_items" ADD CONSTRAINT "__audience_pages_v_poster_list_v_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."__audience_pages_v_poster_list_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__audience_pages_v_poster_list_v" ADD CONSTRAINT "__audience_pages_v_poster_list_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_audience_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_poster_list_items" ADD CONSTRAINT "home_poster_list_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_poster_list_items" ADD CONSTRAINT "home_poster_list_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_poster_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_poster_list" ADD CONSTRAINT "home_poster_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__home_v_poster_list_v_items" ADD CONSTRAINT "__home_v_poster_list_v_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__home_v_poster_list_v_items" ADD CONSTRAINT "__home_v_poster_list_v_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."__home_v_poster_list_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__home_v_poster_list_v" ADD CONSTRAINT "__home_v_poster_list_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_poster_list_items_order_idx" ON "pages_poster_list_items" USING btree ("_order");
  CREATE INDEX "pages_poster_list_items_parent_id_idx" ON "pages_poster_list_items" USING btree ("_parent_id");
  CREATE INDEX "pages_poster_list_items_media_idx" ON "pages_poster_list_items" USING btree ("media_id");
  CREATE INDEX "pages_poster_list_order_idx" ON "pages_poster_list" USING btree ("_order");
  CREATE INDEX "pages_poster_list_parent_id_idx" ON "pages_poster_list" USING btree ("_parent_id");
  CREATE INDEX "pages_poster_list_path_idx" ON "pages_poster_list" USING btree ("_path");
  CREATE INDEX "__pages_v_poster_list_v_items_order_idx" ON "__pages_v_poster_list_v_items" USING btree ("_order");
  CREATE INDEX "__pages_v_poster_list_v_items_parent_id_idx" ON "__pages_v_poster_list_v_items" USING btree ("_parent_id");
  CREATE INDEX "__pages_v_poster_list_v_items_media_idx" ON "__pages_v_poster_list_v_items" USING btree ("media_id");
  CREATE INDEX "__pages_v_poster_list_v_order_idx" ON "__pages_v_poster_list_v" USING btree ("_order");
  CREATE INDEX "__pages_v_poster_list_v_parent_id_idx" ON "__pages_v_poster_list_v" USING btree ("_parent_id");
  CREATE INDEX "__pages_v_poster_list_v_path_idx" ON "__pages_v_poster_list_v" USING btree ("_path");
  CREATE INDEX "posts_poster_list_items_order_idx" ON "posts_poster_list_items" USING btree ("_order");
  CREATE INDEX "posts_poster_list_items_parent_id_idx" ON "posts_poster_list_items" USING btree ("_parent_id");
  CREATE INDEX "posts_poster_list_items_media_idx" ON "posts_poster_list_items" USING btree ("media_id");
  CREATE INDEX "posts_poster_list_order_idx" ON "posts_poster_list" USING btree ("_order");
  CREATE INDEX "posts_poster_list_parent_id_idx" ON "posts_poster_list" USING btree ("_parent_id");
  CREATE INDEX "posts_poster_list_path_idx" ON "posts_poster_list" USING btree ("_path");
  CREATE INDEX "__posts_v_poster_list_v_items_order_idx" ON "__posts_v_poster_list_v_items" USING btree ("_order");
  CREATE INDEX "__posts_v_poster_list_v_items_parent_id_idx" ON "__posts_v_poster_list_v_items" USING btree ("_parent_id");
  CREATE INDEX "__posts_v_poster_list_v_items_media_idx" ON "__posts_v_poster_list_v_items" USING btree ("media_id");
  CREATE INDEX "__posts_v_poster_list_v_order_idx" ON "__posts_v_poster_list_v" USING btree ("_order");
  CREATE INDEX "__posts_v_poster_list_v_parent_id_idx" ON "__posts_v_poster_list_v" USING btree ("_parent_id");
  CREATE INDEX "__posts_v_poster_list_v_path_idx" ON "__posts_v_poster_list_v" USING btree ("_path");
  CREATE INDEX "lab_pages_poster_list_items_order_idx" ON "lab_pages_poster_list_items" USING btree ("_order");
  CREATE INDEX "lab_pages_poster_list_items_parent_id_idx" ON "lab_pages_poster_list_items" USING btree ("_parent_id");
  CREATE INDEX "lab_pages_poster_list_items_media_idx" ON "lab_pages_poster_list_items" USING btree ("media_id");
  CREATE INDEX "lab_pages_poster_list_order_idx" ON "lab_pages_poster_list" USING btree ("_order");
  CREATE INDEX "lab_pages_poster_list_parent_id_idx" ON "lab_pages_poster_list" USING btree ("_parent_id");
  CREATE INDEX "lab_pages_poster_list_path_idx" ON "lab_pages_poster_list" USING btree ("_path");
  CREATE INDEX "__lab_pages_v_poster_list_v_items_order_idx" ON "__lab_pages_v_poster_list_v_items" USING btree ("_order");
  CREATE INDEX "__lab_pages_v_poster_list_v_items_parent_id_idx" ON "__lab_pages_v_poster_list_v_items" USING btree ("_parent_id");
  CREATE INDEX "__lab_pages_v_poster_list_v_items_media_idx" ON "__lab_pages_v_poster_list_v_items" USING btree ("media_id");
  CREATE INDEX "__lab_pages_v_poster_list_v_order_idx" ON "__lab_pages_v_poster_list_v" USING btree ("_order");
  CREATE INDEX "__lab_pages_v_poster_list_v_parent_id_idx" ON "__lab_pages_v_poster_list_v" USING btree ("_parent_id");
  CREATE INDEX "__lab_pages_v_poster_list_v_path_idx" ON "__lab_pages_v_poster_list_v" USING btree ("_path");
  CREATE INDEX "expertise_pages_poster_list_items_order_idx" ON "expertise_pages_poster_list_items" USING btree ("_order");
  CREATE INDEX "expertise_pages_poster_list_items_parent_id_idx" ON "expertise_pages_poster_list_items" USING btree ("_parent_id");
  CREATE INDEX "expertise_pages_poster_list_items_media_idx" ON "expertise_pages_poster_list_items" USING btree ("media_id");
  CREATE INDEX "expertise_pages_poster_list_order_idx" ON "expertise_pages_poster_list" USING btree ("_order");
  CREATE INDEX "expertise_pages_poster_list_parent_id_idx" ON "expertise_pages_poster_list" USING btree ("_parent_id");
  CREATE INDEX "expertise_pages_poster_list_path_idx" ON "expertise_pages_poster_list" USING btree ("_path");
  CREATE INDEX "__expertise_pages_v_poster_list_v_items_order_idx" ON "__expertise_pages_v_poster_list_v_items" USING btree ("_order");
  CREATE INDEX "__expertise_pages_v_poster_list_v_items_parent_id_idx" ON "__expertise_pages_v_poster_list_v_items" USING btree ("_parent_id");
  CREATE INDEX "__expertise_pages_v_poster_list_v_items_media_idx" ON "__expertise_pages_v_poster_list_v_items" USING btree ("media_id");
  CREATE INDEX "__expertise_pages_v_poster_list_v_order_idx" ON "__expertise_pages_v_poster_list_v" USING btree ("_order");
  CREATE INDEX "__expertise_pages_v_poster_list_v_parent_id_idx" ON "__expertise_pages_v_poster_list_v" USING btree ("_parent_id");
  CREATE INDEX "__expertise_pages_v_poster_list_v_path_idx" ON "__expertise_pages_v_poster_list_v" USING btree ("_path");
  CREATE INDEX "audience_pages_poster_list_items_order_idx" ON "audience_pages_poster_list_items" USING btree ("_order");
  CREATE INDEX "audience_pages_poster_list_items_parent_id_idx" ON "audience_pages_poster_list_items" USING btree ("_parent_id");
  CREATE INDEX "audience_pages_poster_list_items_media_idx" ON "audience_pages_poster_list_items" USING btree ("media_id");
  CREATE INDEX "audience_pages_poster_list_order_idx" ON "audience_pages_poster_list" USING btree ("_order");
  CREATE INDEX "audience_pages_poster_list_parent_id_idx" ON "audience_pages_poster_list" USING btree ("_parent_id");
  CREATE INDEX "audience_pages_poster_list_path_idx" ON "audience_pages_poster_list" USING btree ("_path");
  CREATE INDEX "__audience_pages_v_poster_list_v_items_order_idx" ON "__audience_pages_v_poster_list_v_items" USING btree ("_order");
  CREATE INDEX "__audience_pages_v_poster_list_v_items_parent_id_idx" ON "__audience_pages_v_poster_list_v_items" USING btree ("_parent_id");
  CREATE INDEX "__audience_pages_v_poster_list_v_items_media_idx" ON "__audience_pages_v_poster_list_v_items" USING btree ("media_id");
  CREATE INDEX "__audience_pages_v_poster_list_v_order_idx" ON "__audience_pages_v_poster_list_v" USING btree ("_order");
  CREATE INDEX "__audience_pages_v_poster_list_v_parent_id_idx" ON "__audience_pages_v_poster_list_v" USING btree ("_parent_id");
  CREATE INDEX "__audience_pages_v_poster_list_v_path_idx" ON "__audience_pages_v_poster_list_v" USING btree ("_path");
  CREATE INDEX "home_poster_list_items_order_idx" ON "home_poster_list_items" USING btree ("_order");
  CREATE INDEX "home_poster_list_items_parent_id_idx" ON "home_poster_list_items" USING btree ("_parent_id");
  CREATE INDEX "home_poster_list_items_media_idx" ON "home_poster_list_items" USING btree ("media_id");
  CREATE INDEX "home_poster_list_order_idx" ON "home_poster_list" USING btree ("_order");
  CREATE INDEX "home_poster_list_parent_id_idx" ON "home_poster_list" USING btree ("_parent_id");
  CREATE INDEX "home_poster_list_path_idx" ON "home_poster_list" USING btree ("_path");
  CREATE INDEX "__home_v_poster_list_v_items_order_idx" ON "__home_v_poster_list_v_items" USING btree ("_order");
  CREATE INDEX "__home_v_poster_list_v_items_parent_id_idx" ON "__home_v_poster_list_v_items" USING btree ("_parent_id");
  CREATE INDEX "__home_v_poster_list_v_items_media_idx" ON "__home_v_poster_list_v_items" USING btree ("media_id");
  CREATE INDEX "__home_v_poster_list_v_order_idx" ON "__home_v_poster_list_v" USING btree ("_order");
  CREATE INDEX "__home_v_poster_list_v_parent_id_idx" ON "__home_v_poster_list_v" USING btree ("_parent_id");
  CREATE INDEX "__home_v_poster_list_v_path_idx" ON "__home_v_poster_list_v" USING btree ("_path");
  ALTER TABLE "lab_pages_rels" ADD CONSTRAINT "lab_pages_rels_work_pages_fk" FOREIGN KEY ("work_pages_id") REFERENCES "public"."work_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_lab_pages_v_rels" ADD CONSTRAINT "_lab_pages_v_rels_work_pages_fk" FOREIGN KEY ("work_pages_id") REFERENCES "public"."work_pages"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "lab_pages_rels_work_pages_id_idx" ON "lab_pages_rels" USING btree ("work_pages_id");
  CREATE INDEX "_lab_pages_v_rels_work_pages_id_idx" ON "_lab_pages_v_rels" USING btree ("work_pages_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_poster_list_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_poster_list" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__pages_v_poster_list_v_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__pages_v_poster_list_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "posts_poster_list_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "posts_poster_list" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__posts_v_poster_list_v_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__posts_v_poster_list_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "lab_pages_poster_list_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "lab_pages_poster_list" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__lab_pages_v_poster_list_v_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__lab_pages_v_poster_list_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "expertise_pages_poster_list_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "expertise_pages_poster_list" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__expertise_pages_v_poster_list_v_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__expertise_pages_v_poster_list_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "audience_pages_poster_list_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "audience_pages_poster_list" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__audience_pages_v_poster_list_v_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__audience_pages_v_poster_list_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_poster_list_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_poster_list" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__home_v_poster_list_v_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__home_v_poster_list_v" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "pages_poster_list_items" CASCADE;
  DROP TABLE "pages_poster_list" CASCADE;
  DROP TABLE "__pages_v_poster_list_v_items" CASCADE;
  DROP TABLE "__pages_v_poster_list_v" CASCADE;
  DROP TABLE "posts_poster_list_items" CASCADE;
  DROP TABLE "posts_poster_list" CASCADE;
  DROP TABLE "__posts_v_poster_list_v_items" CASCADE;
  DROP TABLE "__posts_v_poster_list_v" CASCADE;
  DROP TABLE "lab_pages_poster_list_items" CASCADE;
  DROP TABLE "lab_pages_poster_list" CASCADE;
  DROP TABLE "__lab_pages_v_poster_list_v_items" CASCADE;
  DROP TABLE "__lab_pages_v_poster_list_v" CASCADE;
  DROP TABLE "expertise_pages_poster_list_items" CASCADE;
  DROP TABLE "expertise_pages_poster_list" CASCADE;
  DROP TABLE "__expertise_pages_v_poster_list_v_items" CASCADE;
  DROP TABLE "__expertise_pages_v_poster_list_v" CASCADE;
  DROP TABLE "audience_pages_poster_list_items" CASCADE;
  DROP TABLE "audience_pages_poster_list" CASCADE;
  DROP TABLE "__audience_pages_v_poster_list_v_items" CASCADE;
  DROP TABLE "__audience_pages_v_poster_list_v" CASCADE;
  DROP TABLE "home_poster_list_items" CASCADE;
  DROP TABLE "home_poster_list" CASCADE;
  DROP TABLE "__home_v_poster_list_v_items" CASCADE;
  DROP TABLE "__home_v_poster_list_v" CASCADE;
  ALTER TABLE "lab_pages_rels" DROP CONSTRAINT "lab_pages_rels_work_pages_fk";
  
  ALTER TABLE "_lab_pages_v_rels" DROP CONSTRAINT "_lab_pages_v_rels_work_pages_fk";
  
  DROP INDEX "lab_pages_rels_work_pages_id_idx";
  DROP INDEX "_lab_pages_v_rels_work_pages_id_idx";
  ALTER TABLE "lab_pages_rels" DROP COLUMN "work_pages_id";
  ALTER TABLE "_lab_pages_v_rels" DROP COLUMN "work_pages_id";
  DROP TYPE "public"."enum_pages_poster_list_items_link_type";
  DROP TYPE "public"."enum_pages_poster_list_items_link_site_page";
  DROP TYPE "public"."enum_pages_poster_list_layout";
  DROP TYPE "public"."enum_pages_poster_list_item_source";
  DROP TYPE "public"."enum_pages_poster_list_theme";
  DROP TYPE "public"."enum___pages_v_poster_list_v_items_link_type";
  DROP TYPE "public"."enum___pages_v_poster_list_v_items_link_site_page";
  DROP TYPE "public"."enum___pages_v_poster_list_v_layout";
  DROP TYPE "public"."enum___pages_v_poster_list_v_item_source";
  DROP TYPE "public"."enum___pages_v_poster_list_v_theme";
  DROP TYPE "public"."enum_posts_poster_list_items_link_type";
  DROP TYPE "public"."enum_posts_poster_list_items_link_site_page";
  DROP TYPE "public"."enum_posts_poster_list_layout";
  DROP TYPE "public"."enum_posts_poster_list_item_source";
  DROP TYPE "public"."enum_posts_poster_list_theme";
  DROP TYPE "public"."enum___posts_v_poster_list_v_items_link_type";
  DROP TYPE "public"."enum___posts_v_poster_list_v_items_link_site_page";
  DROP TYPE "public"."enum___posts_v_poster_list_v_layout";
  DROP TYPE "public"."enum___posts_v_poster_list_v_item_source";
  DROP TYPE "public"."enum___posts_v_poster_list_v_theme";
  DROP TYPE "public"."enum_lab_pages_poster_list_items_link_type";
  DROP TYPE "public"."enum_lab_pages_poster_list_items_link_site_page";
  DROP TYPE "public"."enum_lab_pages_poster_list_layout";
  DROP TYPE "public"."enum_lab_pages_poster_list_item_source";
  DROP TYPE "public"."enum_lab_pages_poster_list_theme";
  DROP TYPE "public"."enum___lab_pages_v_poster_list_v_items_link_type";
  DROP TYPE "public"."enum___lab_pages_v_poster_list_v_items_link_site_page";
  DROP TYPE "public"."enum___lab_pages_v_poster_list_v_layout";
  DROP TYPE "public"."enum___lab_pages_v_poster_list_v_item_source";
  DROP TYPE "public"."enum___lab_pages_v_poster_list_v_theme";
  DROP TYPE "public"."enum_expertise_pages_poster_list_items_link_type";
  DROP TYPE "public"."enum_expertise_pages_poster_list_items_link_site_page";
  DROP TYPE "public"."enum_expertise_pages_poster_list_layout";
  DROP TYPE "public"."enum_expertise_pages_poster_list_item_source";
  DROP TYPE "public"."enum_expertise_pages_poster_list_theme";
  DROP TYPE "public"."enum___expertise_pages_v_poster_list_v_items_link_type";
  DROP TYPE "public"."enum___expertise_pages_v_poster_list_v_items_link_site_page";
  DROP TYPE "public"."enum___expertise_pages_v_poster_list_v_layout";
  DROP TYPE "public"."enum___expertise_pages_v_poster_list_v_item_source";
  DROP TYPE "public"."enum___expertise_pages_v_poster_list_v_theme";
  DROP TYPE "public"."enum_audience_pages_poster_list_items_link_type";
  DROP TYPE "public"."enum_audience_pages_poster_list_items_link_site_page";
  DROP TYPE "public"."enum_audience_pages_poster_list_layout";
  DROP TYPE "public"."enum_audience_pages_poster_list_item_source";
  DROP TYPE "public"."enum_audience_pages_poster_list_theme";
  DROP TYPE "public"."enum___audience_pages_v_poster_list_v_items_link_type";
  DROP TYPE "public"."enum___audience_pages_v_poster_list_v_items_link_site_page";
  DROP TYPE "public"."enum___audience_pages_v_poster_list_v_layout";
  DROP TYPE "public"."enum___audience_pages_v_poster_list_v_item_source";
  DROP TYPE "public"."enum___audience_pages_v_poster_list_v_theme";
  DROP TYPE "public"."enum_home_poster_list_items_link_type";
  DROP TYPE "public"."enum_home_poster_list_items_link_site_page";
  DROP TYPE "public"."enum_home_poster_list_layout";
  DROP TYPE "public"."enum_home_poster_list_item_source";
  DROP TYPE "public"."enum_home_poster_list_theme";
  DROP TYPE "public"."enum___home_v_poster_list_v_items_link_type";
  DROP TYPE "public"."enum___home_v_poster_list_v_items_link_site_page";
  DROP TYPE "public"."enum___home_v_poster_list_v_layout";
  DROP TYPE "public"."enum___home_v_poster_list_v_item_source";
  DROP TYPE "public"."enum___home_v_poster_list_v_theme";`)
}
