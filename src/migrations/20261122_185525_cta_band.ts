import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_cta_band_links_link_type" AS ENUM('reference', 'site', 'custom');
  CREATE TYPE "public"."enum_pages_cta_band_links_link_site_page" AS ENUM('home', 'works-index', 'insights-index', 'lab-index');
  CREATE TYPE "public"."enum_pages_cta_band_layout" AS ENUM('full', 'compact');
  CREATE TYPE "public"."enum___pages_v_cta_band_v_links_link_type" AS ENUM('reference', 'site', 'custom');
  CREATE TYPE "public"."enum___pages_v_cta_band_v_links_link_site_page" AS ENUM('home', 'works-index', 'insights-index', 'lab-index');
  CREATE TYPE "public"."enum___pages_v_cta_band_v_layout" AS ENUM('full', 'compact');
  CREATE TYPE "public"."enum_posts_cta_band_links_link_type" AS ENUM('reference', 'site', 'custom');
  CREATE TYPE "public"."enum_posts_cta_band_links_link_site_page" AS ENUM('home', 'works-index', 'insights-index', 'lab-index');
  CREATE TYPE "public"."enum_posts_cta_band_layout" AS ENUM('full', 'compact');
  CREATE TYPE "public"."enum___posts_v_cta_band_v_links_link_type" AS ENUM('reference', 'site', 'custom');
  CREATE TYPE "public"."enum___posts_v_cta_band_v_links_link_site_page" AS ENUM('home', 'works-index', 'insights-index', 'lab-index');
  CREATE TYPE "public"."enum___posts_v_cta_band_v_layout" AS ENUM('full', 'compact');
  CREATE TYPE "public"."enum_work_pages_cta_band_links_link_type" AS ENUM('reference', 'site', 'custom');
  CREATE TYPE "public"."enum_work_pages_cta_band_links_link_site_page" AS ENUM('home', 'works-index', 'insights-index', 'lab-index');
  CREATE TYPE "public"."enum_work_pages_cta_band_layout" AS ENUM('full', 'compact');
  CREATE TYPE "public"."enum___work_pages_v_cta_band_v_links_link_type" AS ENUM('reference', 'site', 'custom');
  CREATE TYPE "public"."enum___work_pages_v_cta_band_v_links_link_site_page" AS ENUM('home', 'works-index', 'insights-index', 'lab-index');
  CREATE TYPE "public"."enum___work_pages_v_cta_band_v_layout" AS ENUM('full', 'compact');
  CREATE TYPE "public"."enum_lab_pages_cta_band_links_link_type" AS ENUM('reference', 'site', 'custom');
  CREATE TYPE "public"."enum_lab_pages_cta_band_links_link_site_page" AS ENUM('home', 'works-index', 'insights-index', 'lab-index');
  CREATE TYPE "public"."enum_lab_pages_cta_band_layout" AS ENUM('full', 'compact');
  CREATE TYPE "public"."enum___lab_pages_v_cta_band_v_links_link_type" AS ENUM('reference', 'site', 'custom');
  CREATE TYPE "public"."enum___lab_pages_v_cta_band_v_links_link_site_page" AS ENUM('home', 'works-index', 'insights-index', 'lab-index');
  CREATE TYPE "public"."enum___lab_pages_v_cta_band_v_layout" AS ENUM('full', 'compact');
  CREATE TYPE "public"."enum_expertise_pages_cta_band_links_link_type" AS ENUM('reference', 'site', 'custom');
  CREATE TYPE "public"."enum_expertise_pages_cta_band_links_link_site_page" AS ENUM('home', 'works-index', 'insights-index', 'lab-index');
  CREATE TYPE "public"."enum_expertise_pages_cta_band_layout" AS ENUM('full', 'compact');
  CREATE TYPE "public"."enum___expertise_pages_v_cta_band_v_links_link_type" AS ENUM('reference', 'site', 'custom');
  CREATE TYPE "public"."enum___expertise_pages_v_cta_band_v_links_link_site_page" AS ENUM('home', 'works-index', 'insights-index', 'lab-index');
  CREATE TYPE "public"."enum___expertise_pages_v_cta_band_v_layout" AS ENUM('full', 'compact');
  CREATE TYPE "public"."enum_audience_pages_cta_band_links_link_type" AS ENUM('reference', 'site', 'custom');
  CREATE TYPE "public"."enum_audience_pages_cta_band_links_link_site_page" AS ENUM('home', 'works-index', 'insights-index', 'lab-index');
  CREATE TYPE "public"."enum_audience_pages_cta_band_layout" AS ENUM('full', 'compact');
  CREATE TYPE "public"."enum___audience_pages_v_cta_band_v_links_link_type" AS ENUM('reference', 'site', 'custom');
  CREATE TYPE "public"."enum___audience_pages_v_cta_band_v_links_link_site_page" AS ENUM('home', 'works-index', 'insights-index', 'lab-index');
  CREATE TYPE "public"."enum___audience_pages_v_cta_band_v_layout" AS ENUM('full', 'compact');
  CREATE TYPE "public"."enum_home_cta_band_links_link_type" AS ENUM('reference', 'site', 'custom');
  CREATE TYPE "public"."enum_home_cta_band_links_link_site_page" AS ENUM('home', 'works-index', 'insights-index', 'lab-index');
  CREATE TYPE "public"."enum_home_cta_band_layout" AS ENUM('full', 'compact');
  CREATE TYPE "public"."enum___home_v_cta_band_v_links_link_type" AS ENUM('reference', 'site', 'custom');
  CREATE TYPE "public"."enum___home_v_cta_band_v_links_link_site_page" AS ENUM('home', 'works-index', 'insights-index', 'lab-index');
  CREATE TYPE "public"."enum___home_v_cta_band_v_layout" AS ENUM('full', 'compact');
  CREATE TABLE "pages_cta_band_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_pages_cta_band_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_site_page" "enum_pages_cta_band_links_link_site_page",
  	"link_url" varchar,
  	"link_label" varchar
  );
  
  CREATE TABLE "pages_cta_band" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"layout" "enum_pages_cta_band_layout" DEFAULT 'full',
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" varchar,
  	"caption" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "__pages_v_cta_band_v_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_type" "enum___pages_v_cta_band_v_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_site_page" "enum___pages_v_cta_band_v_links_link_site_page",
  	"link_url" varchar,
  	"link_label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "__pages_v_cta_band_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"layout" "enum___pages_v_cta_band_v_layout" DEFAULT 'full',
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" varchar,
  	"caption" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "posts_cta_band_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_posts_cta_band_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_site_page" "enum_posts_cta_band_links_link_site_page",
  	"link_url" varchar,
  	"link_label" varchar
  );
  
  CREATE TABLE "posts_cta_band" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"layout" "enum_posts_cta_band_layout" DEFAULT 'full',
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" varchar,
  	"caption" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "__posts_v_cta_band_v_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_type" "enum___posts_v_cta_band_v_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_site_page" "enum___posts_v_cta_band_v_links_link_site_page",
  	"link_url" varchar,
  	"link_label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "__posts_v_cta_band_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"layout" "enum___posts_v_cta_band_v_layout" DEFAULT 'full',
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" varchar,
  	"caption" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "work_pages_cta_band_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_work_pages_cta_band_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_site_page" "enum_work_pages_cta_band_links_link_site_page",
  	"link_url" varchar,
  	"link_label" varchar
  );
  
  CREATE TABLE "work_pages_cta_band" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"layout" "enum_work_pages_cta_band_layout" DEFAULT 'full',
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" varchar,
  	"caption" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "__work_pages_v_cta_band_v_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_type" "enum___work_pages_v_cta_band_v_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_site_page" "enum___work_pages_v_cta_band_v_links_link_site_page",
  	"link_url" varchar,
  	"link_label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "__work_pages_v_cta_band_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"layout" "enum___work_pages_v_cta_band_v_layout" DEFAULT 'full',
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" varchar,
  	"caption" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "lab_pages_cta_band_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_lab_pages_cta_band_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_site_page" "enum_lab_pages_cta_band_links_link_site_page",
  	"link_url" varchar,
  	"link_label" varchar
  );
  
  CREATE TABLE "lab_pages_cta_band" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"layout" "enum_lab_pages_cta_band_layout" DEFAULT 'full',
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" varchar,
  	"caption" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "__lab_pages_v_cta_band_v_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_type" "enum___lab_pages_v_cta_band_v_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_site_page" "enum___lab_pages_v_cta_band_v_links_link_site_page",
  	"link_url" varchar,
  	"link_label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "__lab_pages_v_cta_band_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"layout" "enum___lab_pages_v_cta_band_v_layout" DEFAULT 'full',
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" varchar,
  	"caption" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "expertise_pages_cta_band_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_expertise_pages_cta_band_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_site_page" "enum_expertise_pages_cta_band_links_link_site_page",
  	"link_url" varchar,
  	"link_label" varchar
  );
  
  CREATE TABLE "expertise_pages_cta_band" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"layout" "enum_expertise_pages_cta_band_layout" DEFAULT 'full',
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" varchar,
  	"caption" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "__expertise_pages_v_cta_band_v_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_type" "enum___expertise_pages_v_cta_band_v_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_site_page" "enum___expertise_pages_v_cta_band_v_links_link_site_page",
  	"link_url" varchar,
  	"link_label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "__expertise_pages_v_cta_band_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"layout" "enum___expertise_pages_v_cta_band_v_layout" DEFAULT 'full',
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" varchar,
  	"caption" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "audience_pages_cta_band_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_audience_pages_cta_band_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_site_page" "enum_audience_pages_cta_band_links_link_site_page",
  	"link_url" varchar,
  	"link_label" varchar
  );
  
  CREATE TABLE "audience_pages_cta_band" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"layout" "enum_audience_pages_cta_band_layout" DEFAULT 'full',
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" varchar,
  	"caption" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "__audience_pages_v_cta_band_v_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_type" "enum___audience_pages_v_cta_band_v_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_site_page" "enum___audience_pages_v_cta_band_v_links_link_site_page",
  	"link_url" varchar,
  	"link_label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "__audience_pages_v_cta_band_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"layout" "enum___audience_pages_v_cta_band_v_layout" DEFAULT 'full',
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" varchar,
  	"caption" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "home_cta_band_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_home_cta_band_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_site_page" "enum_home_cta_band_links_link_site_page",
  	"link_url" varchar,
  	"link_label" varchar
  );
  
  CREATE TABLE "home_cta_band" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"layout" "enum_home_cta_band_layout" DEFAULT 'full',
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" varchar,
  	"caption" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "__home_v_cta_band_v_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_type" "enum___home_v_cta_band_v_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_site_page" "enum___home_v_cta_band_v_links_link_site_page",
  	"link_url" varchar,
  	"link_label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "__home_v_cta_band_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"layout" "enum___home_v_cta_band_v_layout" DEFAULT 'full',
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" varchar,
  	"caption" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "pages_cta_band_links" ADD CONSTRAINT "pages_cta_band_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_cta_band"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_cta_band" ADD CONSTRAINT "pages_cta_band_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__pages_v_cta_band_v_links" ADD CONSTRAINT "__pages_v_cta_band_v_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."__pages_v_cta_band_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__pages_v_cta_band_v" ADD CONSTRAINT "__pages_v_cta_band_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_cta_band_links" ADD CONSTRAINT "posts_cta_band_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts_cta_band"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_cta_band" ADD CONSTRAINT "posts_cta_band_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__posts_v_cta_band_v_links" ADD CONSTRAINT "__posts_v_cta_band_v_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."__posts_v_cta_band_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__posts_v_cta_band_v" ADD CONSTRAINT "__posts_v_cta_band_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "work_pages_cta_band_links" ADD CONSTRAINT "work_pages_cta_band_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."work_pages_cta_band"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "work_pages_cta_band" ADD CONSTRAINT "work_pages_cta_band_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."work_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__work_pages_v_cta_band_v_links" ADD CONSTRAINT "__work_pages_v_cta_band_v_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."__work_pages_v_cta_band_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__work_pages_v_cta_band_v" ADD CONSTRAINT "__work_pages_v_cta_band_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_work_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lab_pages_cta_band_links" ADD CONSTRAINT "lab_pages_cta_band_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lab_pages_cta_band"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lab_pages_cta_band" ADD CONSTRAINT "lab_pages_cta_band_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lab_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__lab_pages_v_cta_band_v_links" ADD CONSTRAINT "__lab_pages_v_cta_band_v_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."__lab_pages_v_cta_band_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__lab_pages_v_cta_band_v" ADD CONSTRAINT "__lab_pages_v_cta_band_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_lab_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "expertise_pages_cta_band_links" ADD CONSTRAINT "expertise_pages_cta_band_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."expertise_pages_cta_band"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "expertise_pages_cta_band" ADD CONSTRAINT "expertise_pages_cta_band_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."expertise_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__expertise_pages_v_cta_band_v_links" ADD CONSTRAINT "__expertise_pages_v_cta_band_v_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."__expertise_pages_v_cta_band_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__expertise_pages_v_cta_band_v" ADD CONSTRAINT "__expertise_pages_v_cta_band_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_expertise_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "audience_pages_cta_band_links" ADD CONSTRAINT "audience_pages_cta_band_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."audience_pages_cta_band"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "audience_pages_cta_band" ADD CONSTRAINT "audience_pages_cta_band_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."audience_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__audience_pages_v_cta_band_v_links" ADD CONSTRAINT "__audience_pages_v_cta_band_v_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."__audience_pages_v_cta_band_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__audience_pages_v_cta_band_v" ADD CONSTRAINT "__audience_pages_v_cta_band_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_audience_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_cta_band_links" ADD CONSTRAINT "home_cta_band_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_cta_band"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_cta_band" ADD CONSTRAINT "home_cta_band_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__home_v_cta_band_v_links" ADD CONSTRAINT "__home_v_cta_band_v_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."__home_v_cta_band_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__home_v_cta_band_v" ADD CONSTRAINT "__home_v_cta_band_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_cta_band_links_order_idx" ON "pages_cta_band_links" USING btree ("_order");
  CREATE INDEX "pages_cta_band_links_parent_id_idx" ON "pages_cta_band_links" USING btree ("_parent_id");
  CREATE INDEX "pages_cta_band_order_idx" ON "pages_cta_band" USING btree ("_order");
  CREATE INDEX "pages_cta_band_parent_id_idx" ON "pages_cta_band" USING btree ("_parent_id");
  CREATE INDEX "pages_cta_band_path_idx" ON "pages_cta_band" USING btree ("_path");
  CREATE INDEX "__pages_v_cta_band_v_links_order_idx" ON "__pages_v_cta_band_v_links" USING btree ("_order");
  CREATE INDEX "__pages_v_cta_band_v_links_parent_id_idx" ON "__pages_v_cta_band_v_links" USING btree ("_parent_id");
  CREATE INDEX "__pages_v_cta_band_v_order_idx" ON "__pages_v_cta_band_v" USING btree ("_order");
  CREATE INDEX "__pages_v_cta_band_v_parent_id_idx" ON "__pages_v_cta_band_v" USING btree ("_parent_id");
  CREATE INDEX "__pages_v_cta_band_v_path_idx" ON "__pages_v_cta_band_v" USING btree ("_path");
  CREATE INDEX "posts_cta_band_links_order_idx" ON "posts_cta_band_links" USING btree ("_order");
  CREATE INDEX "posts_cta_band_links_parent_id_idx" ON "posts_cta_band_links" USING btree ("_parent_id");
  CREATE INDEX "posts_cta_band_order_idx" ON "posts_cta_band" USING btree ("_order");
  CREATE INDEX "posts_cta_band_parent_id_idx" ON "posts_cta_band" USING btree ("_parent_id");
  CREATE INDEX "posts_cta_band_path_idx" ON "posts_cta_band" USING btree ("_path");
  CREATE INDEX "__posts_v_cta_band_v_links_order_idx" ON "__posts_v_cta_band_v_links" USING btree ("_order");
  CREATE INDEX "__posts_v_cta_band_v_links_parent_id_idx" ON "__posts_v_cta_band_v_links" USING btree ("_parent_id");
  CREATE INDEX "__posts_v_cta_band_v_order_idx" ON "__posts_v_cta_band_v" USING btree ("_order");
  CREATE INDEX "__posts_v_cta_band_v_parent_id_idx" ON "__posts_v_cta_band_v" USING btree ("_parent_id");
  CREATE INDEX "__posts_v_cta_band_v_path_idx" ON "__posts_v_cta_band_v" USING btree ("_path");
  CREATE INDEX "work_pages_cta_band_links_order_idx" ON "work_pages_cta_band_links" USING btree ("_order");
  CREATE INDEX "work_pages_cta_band_links_parent_id_idx" ON "work_pages_cta_band_links" USING btree ("_parent_id");
  CREATE INDEX "work_pages_cta_band_order_idx" ON "work_pages_cta_band" USING btree ("_order");
  CREATE INDEX "work_pages_cta_band_parent_id_idx" ON "work_pages_cta_band" USING btree ("_parent_id");
  CREATE INDEX "work_pages_cta_band_path_idx" ON "work_pages_cta_band" USING btree ("_path");
  CREATE INDEX "__work_pages_v_cta_band_v_links_order_idx" ON "__work_pages_v_cta_band_v_links" USING btree ("_order");
  CREATE INDEX "__work_pages_v_cta_band_v_links_parent_id_idx" ON "__work_pages_v_cta_band_v_links" USING btree ("_parent_id");
  CREATE INDEX "__work_pages_v_cta_band_v_order_idx" ON "__work_pages_v_cta_band_v" USING btree ("_order");
  CREATE INDEX "__work_pages_v_cta_band_v_parent_id_idx" ON "__work_pages_v_cta_band_v" USING btree ("_parent_id");
  CREATE INDEX "__work_pages_v_cta_band_v_path_idx" ON "__work_pages_v_cta_band_v" USING btree ("_path");
  CREATE INDEX "lab_pages_cta_band_links_order_idx" ON "lab_pages_cta_band_links" USING btree ("_order");
  CREATE INDEX "lab_pages_cta_band_links_parent_id_idx" ON "lab_pages_cta_band_links" USING btree ("_parent_id");
  CREATE INDEX "lab_pages_cta_band_order_idx" ON "lab_pages_cta_band" USING btree ("_order");
  CREATE INDEX "lab_pages_cta_band_parent_id_idx" ON "lab_pages_cta_band" USING btree ("_parent_id");
  CREATE INDEX "lab_pages_cta_band_path_idx" ON "lab_pages_cta_band" USING btree ("_path");
  CREATE INDEX "__lab_pages_v_cta_band_v_links_order_idx" ON "__lab_pages_v_cta_band_v_links" USING btree ("_order");
  CREATE INDEX "__lab_pages_v_cta_band_v_links_parent_id_idx" ON "__lab_pages_v_cta_band_v_links" USING btree ("_parent_id");
  CREATE INDEX "__lab_pages_v_cta_band_v_order_idx" ON "__lab_pages_v_cta_band_v" USING btree ("_order");
  CREATE INDEX "__lab_pages_v_cta_band_v_parent_id_idx" ON "__lab_pages_v_cta_band_v" USING btree ("_parent_id");
  CREATE INDEX "__lab_pages_v_cta_band_v_path_idx" ON "__lab_pages_v_cta_band_v" USING btree ("_path");
  CREATE INDEX "expertise_pages_cta_band_links_order_idx" ON "expertise_pages_cta_band_links" USING btree ("_order");
  CREATE INDEX "expertise_pages_cta_band_links_parent_id_idx" ON "expertise_pages_cta_band_links" USING btree ("_parent_id");
  CREATE INDEX "expertise_pages_cta_band_order_idx" ON "expertise_pages_cta_band" USING btree ("_order");
  CREATE INDEX "expertise_pages_cta_band_parent_id_idx" ON "expertise_pages_cta_band" USING btree ("_parent_id");
  CREATE INDEX "expertise_pages_cta_band_path_idx" ON "expertise_pages_cta_band" USING btree ("_path");
  CREATE INDEX "__expertise_pages_v_cta_band_v_links_order_idx" ON "__expertise_pages_v_cta_band_v_links" USING btree ("_order");
  CREATE INDEX "__expertise_pages_v_cta_band_v_links_parent_id_idx" ON "__expertise_pages_v_cta_band_v_links" USING btree ("_parent_id");
  CREATE INDEX "__expertise_pages_v_cta_band_v_order_idx" ON "__expertise_pages_v_cta_band_v" USING btree ("_order");
  CREATE INDEX "__expertise_pages_v_cta_band_v_parent_id_idx" ON "__expertise_pages_v_cta_band_v" USING btree ("_parent_id");
  CREATE INDEX "__expertise_pages_v_cta_band_v_path_idx" ON "__expertise_pages_v_cta_band_v" USING btree ("_path");
  CREATE INDEX "audience_pages_cta_band_links_order_idx" ON "audience_pages_cta_band_links" USING btree ("_order");
  CREATE INDEX "audience_pages_cta_band_links_parent_id_idx" ON "audience_pages_cta_band_links" USING btree ("_parent_id");
  CREATE INDEX "audience_pages_cta_band_order_idx" ON "audience_pages_cta_band" USING btree ("_order");
  CREATE INDEX "audience_pages_cta_band_parent_id_idx" ON "audience_pages_cta_band" USING btree ("_parent_id");
  CREATE INDEX "audience_pages_cta_band_path_idx" ON "audience_pages_cta_band" USING btree ("_path");
  CREATE INDEX "__audience_pages_v_cta_band_v_links_order_idx" ON "__audience_pages_v_cta_band_v_links" USING btree ("_order");
  CREATE INDEX "__audience_pages_v_cta_band_v_links_parent_id_idx" ON "__audience_pages_v_cta_band_v_links" USING btree ("_parent_id");
  CREATE INDEX "__audience_pages_v_cta_band_v_order_idx" ON "__audience_pages_v_cta_band_v" USING btree ("_order");
  CREATE INDEX "__audience_pages_v_cta_band_v_parent_id_idx" ON "__audience_pages_v_cta_band_v" USING btree ("_parent_id");
  CREATE INDEX "__audience_pages_v_cta_band_v_path_idx" ON "__audience_pages_v_cta_band_v" USING btree ("_path");
  CREATE INDEX "home_cta_band_links_order_idx" ON "home_cta_band_links" USING btree ("_order");
  CREATE INDEX "home_cta_band_links_parent_id_idx" ON "home_cta_band_links" USING btree ("_parent_id");
  CREATE INDEX "home_cta_band_order_idx" ON "home_cta_band" USING btree ("_order");
  CREATE INDEX "home_cta_band_parent_id_idx" ON "home_cta_band" USING btree ("_parent_id");
  CREATE INDEX "home_cta_band_path_idx" ON "home_cta_band" USING btree ("_path");
  CREATE INDEX "__home_v_cta_band_v_links_order_idx" ON "__home_v_cta_band_v_links" USING btree ("_order");
  CREATE INDEX "__home_v_cta_band_v_links_parent_id_idx" ON "__home_v_cta_band_v_links" USING btree ("_parent_id");
  CREATE INDEX "__home_v_cta_band_v_order_idx" ON "__home_v_cta_band_v" USING btree ("_order");
  CREATE INDEX "__home_v_cta_band_v_parent_id_idx" ON "__home_v_cta_band_v" USING btree ("_parent_id");
  CREATE INDEX "__home_v_cta_band_v_path_idx" ON "__home_v_cta_band_v" USING btree ("_path");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_cta_band_links" CASCADE;
  DROP TABLE "pages_cta_band" CASCADE;
  DROP TABLE "__pages_v_cta_band_v_links" CASCADE;
  DROP TABLE "__pages_v_cta_band_v" CASCADE;
  DROP TABLE "posts_cta_band_links" CASCADE;
  DROP TABLE "posts_cta_band" CASCADE;
  DROP TABLE "__posts_v_cta_band_v_links" CASCADE;
  DROP TABLE "__posts_v_cta_band_v" CASCADE;
  DROP TABLE "work_pages_cta_band_links" CASCADE;
  DROP TABLE "work_pages_cta_band" CASCADE;
  DROP TABLE "__work_pages_v_cta_band_v_links" CASCADE;
  DROP TABLE "__work_pages_v_cta_band_v" CASCADE;
  DROP TABLE "lab_pages_cta_band_links" CASCADE;
  DROP TABLE "lab_pages_cta_band" CASCADE;
  DROP TABLE "__lab_pages_v_cta_band_v_links" CASCADE;
  DROP TABLE "__lab_pages_v_cta_band_v" CASCADE;
  DROP TABLE "expertise_pages_cta_band_links" CASCADE;
  DROP TABLE "expertise_pages_cta_band" CASCADE;
  DROP TABLE "__expertise_pages_v_cta_band_v_links" CASCADE;
  DROP TABLE "__expertise_pages_v_cta_band_v" CASCADE;
  DROP TABLE "audience_pages_cta_band_links" CASCADE;
  DROP TABLE "audience_pages_cta_band" CASCADE;
  DROP TABLE "__audience_pages_v_cta_band_v_links" CASCADE;
  DROP TABLE "__audience_pages_v_cta_band_v" CASCADE;
  DROP TABLE "home_cta_band_links" CASCADE;
  DROP TABLE "home_cta_band" CASCADE;
  DROP TABLE "__home_v_cta_band_v_links" CASCADE;
  DROP TABLE "__home_v_cta_band_v" CASCADE;
  DROP TYPE "public"."enum_pages_cta_band_links_link_type";
  DROP TYPE "public"."enum_pages_cta_band_links_link_site_page";
  DROP TYPE "public"."enum_pages_cta_band_layout";
  DROP TYPE "public"."enum___pages_v_cta_band_v_links_link_type";
  DROP TYPE "public"."enum___pages_v_cta_band_v_links_link_site_page";
  DROP TYPE "public"."enum___pages_v_cta_band_v_layout";
  DROP TYPE "public"."enum_posts_cta_band_links_link_type";
  DROP TYPE "public"."enum_posts_cta_band_links_link_site_page";
  DROP TYPE "public"."enum_posts_cta_band_layout";
  DROP TYPE "public"."enum___posts_v_cta_band_v_links_link_type";
  DROP TYPE "public"."enum___posts_v_cta_band_v_links_link_site_page";
  DROP TYPE "public"."enum___posts_v_cta_band_v_layout";
  DROP TYPE "public"."enum_work_pages_cta_band_links_link_type";
  DROP TYPE "public"."enum_work_pages_cta_band_links_link_site_page";
  DROP TYPE "public"."enum_work_pages_cta_band_layout";
  DROP TYPE "public"."enum___work_pages_v_cta_band_v_links_link_type";
  DROP TYPE "public"."enum___work_pages_v_cta_band_v_links_link_site_page";
  DROP TYPE "public"."enum___work_pages_v_cta_band_v_layout";
  DROP TYPE "public"."enum_lab_pages_cta_band_links_link_type";
  DROP TYPE "public"."enum_lab_pages_cta_band_links_link_site_page";
  DROP TYPE "public"."enum_lab_pages_cta_band_layout";
  DROP TYPE "public"."enum___lab_pages_v_cta_band_v_links_link_type";
  DROP TYPE "public"."enum___lab_pages_v_cta_band_v_links_link_site_page";
  DROP TYPE "public"."enum___lab_pages_v_cta_band_v_layout";
  DROP TYPE "public"."enum_expertise_pages_cta_band_links_link_type";
  DROP TYPE "public"."enum_expertise_pages_cta_band_links_link_site_page";
  DROP TYPE "public"."enum_expertise_pages_cta_band_layout";
  DROP TYPE "public"."enum___expertise_pages_v_cta_band_v_links_link_type";
  DROP TYPE "public"."enum___expertise_pages_v_cta_band_v_links_link_site_page";
  DROP TYPE "public"."enum___expertise_pages_v_cta_band_v_layout";
  DROP TYPE "public"."enum_audience_pages_cta_band_links_link_type";
  DROP TYPE "public"."enum_audience_pages_cta_band_links_link_site_page";
  DROP TYPE "public"."enum_audience_pages_cta_band_layout";
  DROP TYPE "public"."enum___audience_pages_v_cta_band_v_links_link_type";
  DROP TYPE "public"."enum___audience_pages_v_cta_band_v_links_link_site_page";
  DROP TYPE "public"."enum___audience_pages_v_cta_band_v_layout";
  DROP TYPE "public"."enum_home_cta_band_links_link_type";
  DROP TYPE "public"."enum_home_cta_band_links_link_site_page";
  DROP TYPE "public"."enum_home_cta_band_layout";
  DROP TYPE "public"."enum___home_v_cta_band_v_links_link_type";
  DROP TYPE "public"."enum___home_v_cta_band_v_links_link_site_page";
  DROP TYPE "public"."enum___home_v_cta_band_v_layout";`)
}
