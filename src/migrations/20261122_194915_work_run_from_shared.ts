import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_work_pages_youtube_size" AS ENUM('full', 'inset', 'small');
  CREATE TYPE "public"."enum_work_pages_youtube_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum_work_pages_rich_text_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum_work_pages_poster_list_items_link_type" AS ENUM('reference', 'site', 'custom');
  CREATE TYPE "public"."enum_work_pages_poster_list_items_link_site_page" AS ENUM('home', 'works-index', 'insights-index', 'lab-index');
  CREATE TYPE "public"."enum_work_pages_poster_list_layout" AS ENUM('stacked', 'row');
  CREATE TYPE "public"."enum_work_pages_poster_list_item_source" AS ENUM('static', 'collection');
  CREATE TYPE "public"."enum_work_pages_poster_list_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum_work_pages_quote_banner_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum___work_pages_v_youtube_v_size" AS ENUM('full', 'inset', 'small');
  CREATE TYPE "public"."enum___work_pages_v_youtube_v_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum___work_pages_v_rich_text_v_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum___work_pages_v_poster_list_v_items_link_type" AS ENUM('reference', 'site', 'custom');
  CREATE TYPE "public"."enum___work_pages_v_poster_list_v_items_link_site_page" AS ENUM('home', 'works-index', 'insights-index', 'lab-index');
  CREATE TYPE "public"."enum___work_pages_v_poster_list_v_layout" AS ENUM('stacked', 'row');
  CREATE TYPE "public"."enum___work_pages_v_poster_list_v_item_source" AS ENUM('static', 'collection');
  CREATE TYPE "public"."enum___work_pages_v_poster_list_v_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum___work_pages_v_quote_banner_v_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TABLE "work_pages_youtube" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"url" varchar,
  	"title" varchar,
  	"size" "enum_work_pages_youtube_size" DEFAULT 'full',
  	"theme" "enum_work_pages_youtube_theme" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "work_pages_rich_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"body" jsonb,
  	"theme" "enum_work_pages_rich_text_theme" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "work_pages_poster_list_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"title" varchar,
  	"description" varchar,
  	"enable_link" boolean,
  	"link_type" "enum_work_pages_poster_list_items_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_site_page" "enum_work_pages_poster_list_items_link_site_page",
  	"link_url" varchar
  );
  
  CREATE TABLE "work_pages_poster_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"summary" varchar,
  	"layout" "enum_work_pages_poster_list_layout" DEFAULT 'stacked',
  	"item_source" "enum_work_pages_poster_list_item_source" DEFAULT 'static',
  	"theme" "enum_work_pages_poster_list_theme" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "work_pages_quote_banner" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"theme" "enum_work_pages_quote_banner_theme" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "__work_pages_v_youtube_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"url" varchar,
  	"title" varchar,
  	"size" "enum___work_pages_v_youtube_v_size" DEFAULT 'full',
  	"theme" "enum___work_pages_v_youtube_v_theme" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "__work_pages_v_rich_text_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"body" jsonb,
  	"theme" "enum___work_pages_v_rich_text_v_theme" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "__work_pages_v_poster_list_v_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"title" varchar,
  	"description" varchar,
  	"enable_link" boolean,
  	"link_type" "enum___work_pages_v_poster_list_v_items_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_site_page" "enum___work_pages_v_poster_list_v_items_link_site_page",
  	"link_url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "__work_pages_v_poster_list_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"summary" varchar,
  	"layout" "enum___work_pages_v_poster_list_v_layout" DEFAULT 'stacked',
  	"item_source" "enum___work_pages_v_poster_list_v_item_source" DEFAULT 'static',
  	"theme" "enum___work_pages_v_poster_list_v_theme" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "__work_pages_v_quote_banner_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"theme" "enum___work_pages_v_quote_banner_v_theme" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "work_pages_rels" ADD COLUMN "testimonials_id" integer;
  ALTER TABLE "_work_pages_v_rels" ADD COLUMN "testimonials_id" integer;
  ALTER TABLE "work_pages_youtube" ADD CONSTRAINT "work_pages_youtube_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."work_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "work_pages_rich_text" ADD CONSTRAINT "work_pages_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."work_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "work_pages_poster_list_items" ADD CONSTRAINT "work_pages_poster_list_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "work_pages_poster_list_items" ADD CONSTRAINT "work_pages_poster_list_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."work_pages_poster_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "work_pages_poster_list" ADD CONSTRAINT "work_pages_poster_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."work_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "work_pages_quote_banner" ADD CONSTRAINT "work_pages_quote_banner_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."work_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__work_pages_v_youtube_v" ADD CONSTRAINT "__work_pages_v_youtube_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_work_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__work_pages_v_rich_text_v" ADD CONSTRAINT "__work_pages_v_rich_text_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_work_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__work_pages_v_poster_list_v_items" ADD CONSTRAINT "__work_pages_v_poster_list_v_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__work_pages_v_poster_list_v_items" ADD CONSTRAINT "__work_pages_v_poster_list_v_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."__work_pages_v_poster_list_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__work_pages_v_poster_list_v" ADD CONSTRAINT "__work_pages_v_poster_list_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_work_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__work_pages_v_quote_banner_v" ADD CONSTRAINT "__work_pages_v_quote_banner_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_work_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "work_pages_youtube_order_idx" ON "work_pages_youtube" USING btree ("_order");
  CREATE INDEX "work_pages_youtube_parent_id_idx" ON "work_pages_youtube" USING btree ("_parent_id");
  CREATE INDEX "work_pages_youtube_path_idx" ON "work_pages_youtube" USING btree ("_path");
  CREATE INDEX "work_pages_rich_text_order_idx" ON "work_pages_rich_text" USING btree ("_order");
  CREATE INDEX "work_pages_rich_text_parent_id_idx" ON "work_pages_rich_text" USING btree ("_parent_id");
  CREATE INDEX "work_pages_rich_text_path_idx" ON "work_pages_rich_text" USING btree ("_path");
  CREATE INDEX "work_pages_poster_list_items_order_idx" ON "work_pages_poster_list_items" USING btree ("_order");
  CREATE INDEX "work_pages_poster_list_items_parent_id_idx" ON "work_pages_poster_list_items" USING btree ("_parent_id");
  CREATE INDEX "work_pages_poster_list_items_media_idx" ON "work_pages_poster_list_items" USING btree ("media_id");
  CREATE INDEX "work_pages_poster_list_order_idx" ON "work_pages_poster_list" USING btree ("_order");
  CREATE INDEX "work_pages_poster_list_parent_id_idx" ON "work_pages_poster_list" USING btree ("_parent_id");
  CREATE INDEX "work_pages_poster_list_path_idx" ON "work_pages_poster_list" USING btree ("_path");
  CREATE INDEX "work_pages_quote_banner_order_idx" ON "work_pages_quote_banner" USING btree ("_order");
  CREATE INDEX "work_pages_quote_banner_parent_id_idx" ON "work_pages_quote_banner" USING btree ("_parent_id");
  CREATE INDEX "work_pages_quote_banner_path_idx" ON "work_pages_quote_banner" USING btree ("_path");
  CREATE INDEX "__work_pages_v_youtube_v_order_idx" ON "__work_pages_v_youtube_v" USING btree ("_order");
  CREATE INDEX "__work_pages_v_youtube_v_parent_id_idx" ON "__work_pages_v_youtube_v" USING btree ("_parent_id");
  CREATE INDEX "__work_pages_v_youtube_v_path_idx" ON "__work_pages_v_youtube_v" USING btree ("_path");
  CREATE INDEX "__work_pages_v_rich_text_v_order_idx" ON "__work_pages_v_rich_text_v" USING btree ("_order");
  CREATE INDEX "__work_pages_v_rich_text_v_parent_id_idx" ON "__work_pages_v_rich_text_v" USING btree ("_parent_id");
  CREATE INDEX "__work_pages_v_rich_text_v_path_idx" ON "__work_pages_v_rich_text_v" USING btree ("_path");
  CREATE INDEX "__work_pages_v_poster_list_v_items_order_idx" ON "__work_pages_v_poster_list_v_items" USING btree ("_order");
  CREATE INDEX "__work_pages_v_poster_list_v_items_parent_id_idx" ON "__work_pages_v_poster_list_v_items" USING btree ("_parent_id");
  CREATE INDEX "__work_pages_v_poster_list_v_items_media_idx" ON "__work_pages_v_poster_list_v_items" USING btree ("media_id");
  CREATE INDEX "__work_pages_v_poster_list_v_order_idx" ON "__work_pages_v_poster_list_v" USING btree ("_order");
  CREATE INDEX "__work_pages_v_poster_list_v_parent_id_idx" ON "__work_pages_v_poster_list_v" USING btree ("_parent_id");
  CREATE INDEX "__work_pages_v_poster_list_v_path_idx" ON "__work_pages_v_poster_list_v" USING btree ("_path");
  CREATE INDEX "__work_pages_v_quote_banner_v_order_idx" ON "__work_pages_v_quote_banner_v" USING btree ("_order");
  CREATE INDEX "__work_pages_v_quote_banner_v_parent_id_idx" ON "__work_pages_v_quote_banner_v" USING btree ("_parent_id");
  CREATE INDEX "__work_pages_v_quote_banner_v_path_idx" ON "__work_pages_v_quote_banner_v" USING btree ("_path");
  ALTER TABLE "work_pages_rels" ADD CONSTRAINT "work_pages_rels_testimonials_fk" FOREIGN KEY ("testimonials_id") REFERENCES "public"."testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_work_pages_v_rels" ADD CONSTRAINT "_work_pages_v_rels_testimonials_fk" FOREIGN KEY ("testimonials_id") REFERENCES "public"."testimonials"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "work_pages_rels_testimonials_id_idx" ON "work_pages_rels" USING btree ("testimonials_id");
  CREATE INDEX "_work_pages_v_rels_testimonials_id_idx" ON "_work_pages_v_rels" USING btree ("testimonials_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "work_pages_youtube" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "work_pages_rich_text" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "work_pages_poster_list_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "work_pages_poster_list" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "work_pages_quote_banner" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__work_pages_v_youtube_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__work_pages_v_rich_text_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__work_pages_v_poster_list_v_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__work_pages_v_poster_list_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__work_pages_v_quote_banner_v" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "work_pages_youtube" CASCADE;
  DROP TABLE "work_pages_rich_text" CASCADE;
  DROP TABLE "work_pages_poster_list_items" CASCADE;
  DROP TABLE "work_pages_poster_list" CASCADE;
  DROP TABLE "work_pages_quote_banner" CASCADE;
  DROP TABLE "__work_pages_v_youtube_v" CASCADE;
  DROP TABLE "__work_pages_v_rich_text_v" CASCADE;
  DROP TABLE "__work_pages_v_poster_list_v_items" CASCADE;
  DROP TABLE "__work_pages_v_poster_list_v" CASCADE;
  DROP TABLE "__work_pages_v_quote_banner_v" CASCADE;
  ALTER TABLE "work_pages_rels" DROP CONSTRAINT "work_pages_rels_testimonials_fk";
  
  ALTER TABLE "_work_pages_v_rels" DROP CONSTRAINT "_work_pages_v_rels_testimonials_fk";
  
  DROP INDEX "work_pages_rels_testimonials_id_idx";
  DROP INDEX "_work_pages_v_rels_testimonials_id_idx";
  ALTER TABLE "work_pages_rels" DROP COLUMN "testimonials_id";
  ALTER TABLE "_work_pages_v_rels" DROP COLUMN "testimonials_id";
  DROP TYPE "public"."enum_work_pages_youtube_size";
  DROP TYPE "public"."enum_work_pages_youtube_theme";
  DROP TYPE "public"."enum_work_pages_rich_text_theme";
  DROP TYPE "public"."enum_work_pages_poster_list_items_link_type";
  DROP TYPE "public"."enum_work_pages_poster_list_items_link_site_page";
  DROP TYPE "public"."enum_work_pages_poster_list_layout";
  DROP TYPE "public"."enum_work_pages_poster_list_item_source";
  DROP TYPE "public"."enum_work_pages_poster_list_theme";
  DROP TYPE "public"."enum_work_pages_quote_banner_theme";
  DROP TYPE "public"."enum___work_pages_v_youtube_v_size";
  DROP TYPE "public"."enum___work_pages_v_youtube_v_theme";
  DROP TYPE "public"."enum___work_pages_v_rich_text_v_theme";
  DROP TYPE "public"."enum___work_pages_v_poster_list_v_items_link_type";
  DROP TYPE "public"."enum___work_pages_v_poster_list_v_items_link_site_page";
  DROP TYPE "public"."enum___work_pages_v_poster_list_v_layout";
  DROP TYPE "public"."enum___work_pages_v_poster_list_v_item_source";
  DROP TYPE "public"."enum___work_pages_v_poster_list_v_theme";
  DROP TYPE "public"."enum___work_pages_v_quote_banner_v_theme";`)
}
