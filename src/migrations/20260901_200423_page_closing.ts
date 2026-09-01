import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_closing_cl_link_type" AS ENUM('reference', 'site', 'custom');
  CREATE TYPE "public"."enum_pages_closing_cl_link_site_page" AS ENUM('home', 'works-index', 'insights-index');
  CREATE TYPE "public"."enum_pages_closing_cl_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum___pages_v_version_closing_cl_v_link_type" AS ENUM('reference', 'site', 'custom');
  CREATE TYPE "public"."enum___pages_v_version_closing_cl_v_link_site_page" AS ENUM('home', 'works-index', 'insights-index');
  CREATE TYPE "public"."enum___pages_v_version_closing_cl_v_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum_posts_closing_cl_link_type" AS ENUM('reference', 'site', 'custom');
  CREATE TYPE "public"."enum_posts_closing_cl_link_site_page" AS ENUM('home', 'works-index', 'insights-index');
  CREATE TYPE "public"."enum_posts_closing_cl_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum___posts_v_version_closing_cl_v_link_type" AS ENUM('reference', 'site', 'custom');
  CREATE TYPE "public"."enum___posts_v_version_closing_cl_v_link_site_page" AS ENUM('home', 'works-index', 'insights-index');
  CREATE TYPE "public"."enum___posts_v_version_closing_cl_v_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum_work_pages_closing_cl_link_type" AS ENUM('reference', 'site', 'custom');
  CREATE TYPE "public"."enum_work_pages_closing_cl_link_site_page" AS ENUM('home', 'works-index', 'insights-index');
  CREATE TYPE "public"."enum_work_pages_closing_cl_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum___work_pages_v_version_closing_cl_v_link_type" AS ENUM('reference', 'site', 'custom');
  CREATE TYPE "public"."enum___work_pages_v_version_closing_cl_v_link_site_page" AS ENUM('home', 'works-index', 'insights-index');
  CREATE TYPE "public"."enum___work_pages_v_version_closing_cl_v_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum_expertise_pages_closing_cl_link_type" AS ENUM('reference', 'site', 'custom');
  CREATE TYPE "public"."enum_expertise_pages_closing_cl_link_site_page" AS ENUM('home', 'works-index', 'insights-index');
  CREATE TYPE "public"."enum_expertise_pages_closing_cl_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum___expertise_pages_v_version_closing_cl_v_link_type" AS ENUM('reference', 'site', 'custom');
  CREATE TYPE "public"."enum___expertise_pages_v_version_closing_cl_v_link_site_page" AS ENUM('home', 'works-index', 'insights-index');
  CREATE TYPE "public"."enum___expertise_pages_v_version_closing_cl_v_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum_audience_pages_closing_cl_link_type" AS ENUM('reference', 'site', 'custom');
  CREATE TYPE "public"."enum_audience_pages_closing_cl_link_site_page" AS ENUM('home', 'works-index', 'insights-index');
  CREATE TYPE "public"."enum_audience_pages_closing_cl_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum___audience_pages_v_version_closing_cl_v_link_type" AS ENUM('reference', 'site', 'custom');
  CREATE TYPE "public"."enum___audience_pages_v_version_closing_cl_v_link_site_page" AS ENUM('home', 'works-index', 'insights-index');
  CREATE TYPE "public"."enum___audience_pages_v_version_closing_cl_v_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum_home_closing_cl_link_type" AS ENUM('reference', 'site', 'custom');
  CREATE TYPE "public"."enum_home_closing_cl_link_site_page" AS ENUM('home', 'works-index', 'insights-index');
  CREATE TYPE "public"."enum_home_closing_cl_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum___home_v_version_closing_cl_v_link_type" AS ENUM('reference', 'site', 'custom');
  CREATE TYPE "public"."enum___home_v_version_closing_cl_v_link_site_page" AS ENUM('home', 'works-index', 'insights-index');
  CREATE TYPE "public"."enum___home_v_version_closing_cl_v_link_appearance" AS ENUM('default', 'outline');
  CREATE TABLE "pages_closing_cl" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_pages_closing_cl_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_site_page" "enum_pages_closing_cl_link_site_page",
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum_pages_closing_cl_link_appearance" DEFAULT 'default'
  );
  
  CREATE TABLE "__pages_v_version_closing_cl_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_type" "enum___pages_v_version_closing_cl_v_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_site_page" "enum___pages_v_version_closing_cl_v_link_site_page",
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum___pages_v_version_closing_cl_v_link_appearance" DEFAULT 'default',
  	"_uuid" varchar
  );
  
  CREATE TABLE "posts_closing_cl" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_posts_closing_cl_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_site_page" "enum_posts_closing_cl_link_site_page",
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum_posts_closing_cl_link_appearance" DEFAULT 'default'
  );
  
  CREATE TABLE "__posts_v_version_closing_cl_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_type" "enum___posts_v_version_closing_cl_v_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_site_page" "enum___posts_v_version_closing_cl_v_link_site_page",
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum___posts_v_version_closing_cl_v_link_appearance" DEFAULT 'default',
  	"_uuid" varchar
  );
  
  CREATE TABLE "work_pages_closing_cl" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_work_pages_closing_cl_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_site_page" "enum_work_pages_closing_cl_link_site_page",
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum_work_pages_closing_cl_link_appearance" DEFAULT 'default'
  );
  
  CREATE TABLE "__work_pages_v_version_closing_cl_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_type" "enum___work_pages_v_version_closing_cl_v_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_site_page" "enum___work_pages_v_version_closing_cl_v_link_site_page",
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum___work_pages_v_version_closing_cl_v_link_appearance" DEFAULT 'default',
  	"_uuid" varchar
  );
  
  CREATE TABLE "expertise_pages_closing_cl" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_expertise_pages_closing_cl_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_site_page" "enum_expertise_pages_closing_cl_link_site_page",
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum_expertise_pages_closing_cl_link_appearance" DEFAULT 'default'
  );
  
  CREATE TABLE "__expertise_pages_v_version_closing_cl_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_type" "enum___expertise_pages_v_version_closing_cl_v_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_site_page" "enum___expertise_pages_v_version_closing_cl_v_link_site_page",
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum___expertise_pages_v_version_closing_cl_v_link_appearance" DEFAULT 'default',
  	"_uuid" varchar
  );
  
  CREATE TABLE "audience_pages_closing_cl" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_audience_pages_closing_cl_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_site_page" "enum_audience_pages_closing_cl_link_site_page",
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum_audience_pages_closing_cl_link_appearance" DEFAULT 'default'
  );
  
  CREATE TABLE "__audience_pages_v_version_closing_cl_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_type" "enum___audience_pages_v_version_closing_cl_v_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_site_page" "enum___audience_pages_v_version_closing_cl_v_link_site_page",
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum___audience_pages_v_version_closing_cl_v_link_appearance" DEFAULT 'default',
  	"_uuid" varchar
  );
  
  CREATE TABLE "home_closing_cl" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_home_closing_cl_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_site_page" "enum_home_closing_cl_link_site_page",
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum_home_closing_cl_link_appearance" DEFAULT 'default'
  );
  
  CREATE TABLE "__home_v_version_closing_cl_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_type" "enum___home_v_version_closing_cl_v_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_site_page" "enum___home_v_version_closing_cl_v_link_site_page",
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum___home_v_version_closing_cl_v_link_appearance" DEFAULT 'default',
  	"_uuid" varchar
  );
  
  ALTER TABLE "pages_feat_work" ALTER COLUMN "theme" SET DEFAULT 'light';
  ALTER TABLE "__pages_v_feat_work_v" ALTER COLUMN "theme" SET DEFAULT 'light';
  ALTER TABLE "posts_feat_work" ALTER COLUMN "theme" SET DEFAULT 'light';
  ALTER TABLE "__posts_v_feat_work_v" ALTER COLUMN "theme" SET DEFAULT 'light';
  ALTER TABLE "work_pages_feat_work" ALTER COLUMN "theme" SET DEFAULT 'light';
  ALTER TABLE "__work_pages_v_feat_work_v" ALTER COLUMN "theme" SET DEFAULT 'light';
  ALTER TABLE "expertise_pages_feat_work" ALTER COLUMN "theme" SET DEFAULT 'light';
  ALTER TABLE "__expertise_pages_v_feat_work_v" ALTER COLUMN "theme" SET DEFAULT 'light';
  ALTER TABLE "audience_pages_feat_work" ALTER COLUMN "theme" SET DEFAULT 'light';
  ALTER TABLE "__audience_pages_v_feat_work_v" ALTER COLUMN "theme" SET DEFAULT 'light';
  ALTER TABLE "pages" ADD COLUMN "closing_hidden" boolean DEFAULT false;
  ALTER TABLE "pages" ADD COLUMN "closing_show_overrides" boolean DEFAULT false;
  ALTER TABLE "pages" ADD COLUMN "closing_eyebrow_override" varchar;
  ALTER TABLE "pages" ADD COLUMN "closing_heading_override" varchar;
  ALTER TABLE "pages" ADD COLUMN "closing_ask_override_title" varchar;
  ALTER TABLE "pages" ADD COLUMN "closing_ask_override_body" varchar;
  ALTER TABLE "pages" ADD COLUMN "closing_media_override_id" integer;
  ALTER TABLE "_pages_v" ADD COLUMN "version_closing_hidden" boolean DEFAULT false;
  ALTER TABLE "_pages_v" ADD COLUMN "version_closing_show_overrides" boolean DEFAULT false;
  ALTER TABLE "_pages_v" ADD COLUMN "version_closing_eyebrow_override" varchar;
  ALTER TABLE "_pages_v" ADD COLUMN "version_closing_heading_override" varchar;
  ALTER TABLE "_pages_v" ADD COLUMN "version_closing_ask_override_title" varchar;
  ALTER TABLE "_pages_v" ADD COLUMN "version_closing_ask_override_body" varchar;
  ALTER TABLE "_pages_v" ADD COLUMN "version_closing_media_override_id" integer;
  ALTER TABLE "posts" ADD COLUMN "closing_hidden" boolean DEFAULT false;
  ALTER TABLE "posts" ADD COLUMN "closing_show_overrides" boolean DEFAULT false;
  ALTER TABLE "posts" ADD COLUMN "closing_eyebrow_override" varchar;
  ALTER TABLE "posts" ADD COLUMN "closing_heading_override" varchar;
  ALTER TABLE "posts" ADD COLUMN "closing_ask_override_title" varchar;
  ALTER TABLE "posts" ADD COLUMN "closing_ask_override_body" varchar;
  ALTER TABLE "posts" ADD COLUMN "closing_media_override_id" integer;
  ALTER TABLE "posts_rels" ADD COLUMN "pages_id" integer;
  ALTER TABLE "_posts_v" ADD COLUMN "version_closing_hidden" boolean DEFAULT false;
  ALTER TABLE "_posts_v" ADD COLUMN "version_closing_show_overrides" boolean DEFAULT false;
  ALTER TABLE "_posts_v" ADD COLUMN "version_closing_eyebrow_override" varchar;
  ALTER TABLE "_posts_v" ADD COLUMN "version_closing_heading_override" varchar;
  ALTER TABLE "_posts_v" ADD COLUMN "version_closing_ask_override_title" varchar;
  ALTER TABLE "_posts_v" ADD COLUMN "version_closing_ask_override_body" varchar;
  ALTER TABLE "_posts_v" ADD COLUMN "version_closing_media_override_id" integer;
  ALTER TABLE "_posts_v_rels" ADD COLUMN "pages_id" integer;
  ALTER TABLE "work_pages" ADD COLUMN "closing_hidden" boolean DEFAULT false;
  ALTER TABLE "work_pages" ADD COLUMN "closing_show_overrides" boolean DEFAULT false;
  ALTER TABLE "work_pages" ADD COLUMN "closing_eyebrow_override" varchar;
  ALTER TABLE "work_pages" ADD COLUMN "closing_heading_override" varchar;
  ALTER TABLE "work_pages" ADD COLUMN "closing_ask_override_title" varchar;
  ALTER TABLE "work_pages" ADD COLUMN "closing_ask_override_body" varchar;
  ALTER TABLE "work_pages" ADD COLUMN "closing_media_override_id" integer;
  ALTER TABLE "_work_pages_v" ADD COLUMN "version_closing_hidden" boolean DEFAULT false;
  ALTER TABLE "_work_pages_v" ADD COLUMN "version_closing_show_overrides" boolean DEFAULT false;
  ALTER TABLE "_work_pages_v" ADD COLUMN "version_closing_eyebrow_override" varchar;
  ALTER TABLE "_work_pages_v" ADD COLUMN "version_closing_heading_override" varchar;
  ALTER TABLE "_work_pages_v" ADD COLUMN "version_closing_ask_override_title" varchar;
  ALTER TABLE "_work_pages_v" ADD COLUMN "version_closing_ask_override_body" varchar;
  ALTER TABLE "_work_pages_v" ADD COLUMN "version_closing_media_override_id" integer;
  ALTER TABLE "expertise_pages" ADD COLUMN "closing_hidden" boolean DEFAULT false;
  ALTER TABLE "expertise_pages" ADD COLUMN "closing_show_overrides" boolean DEFAULT false;
  ALTER TABLE "expertise_pages" ADD COLUMN "closing_eyebrow_override" varchar;
  ALTER TABLE "expertise_pages" ADD COLUMN "closing_heading_override" varchar;
  ALTER TABLE "expertise_pages" ADD COLUMN "closing_ask_override_title" varchar;
  ALTER TABLE "expertise_pages" ADD COLUMN "closing_ask_override_body" varchar;
  ALTER TABLE "expertise_pages" ADD COLUMN "closing_media_override_id" integer;
  ALTER TABLE "_expertise_pages_v" ADD COLUMN "version_closing_hidden" boolean DEFAULT false;
  ALTER TABLE "_expertise_pages_v" ADD COLUMN "version_closing_show_overrides" boolean DEFAULT false;
  ALTER TABLE "_expertise_pages_v" ADD COLUMN "version_closing_eyebrow_override" varchar;
  ALTER TABLE "_expertise_pages_v" ADD COLUMN "version_closing_heading_override" varchar;
  ALTER TABLE "_expertise_pages_v" ADD COLUMN "version_closing_ask_override_title" varchar;
  ALTER TABLE "_expertise_pages_v" ADD COLUMN "version_closing_ask_override_body" varchar;
  ALTER TABLE "_expertise_pages_v" ADD COLUMN "version_closing_media_override_id" integer;
  ALTER TABLE "audience_pages" ADD COLUMN "closing_hidden" boolean DEFAULT false;
  ALTER TABLE "audience_pages" ADD COLUMN "closing_show_overrides" boolean DEFAULT false;
  ALTER TABLE "audience_pages" ADD COLUMN "closing_eyebrow_override" varchar;
  ALTER TABLE "audience_pages" ADD COLUMN "closing_heading_override" varchar;
  ALTER TABLE "audience_pages" ADD COLUMN "closing_ask_override_title" varchar;
  ALTER TABLE "audience_pages" ADD COLUMN "closing_ask_override_body" varchar;
  ALTER TABLE "audience_pages" ADD COLUMN "closing_media_override_id" integer;
  ALTER TABLE "_audience_pages_v" ADD COLUMN "version_closing_hidden" boolean DEFAULT false;
  ALTER TABLE "_audience_pages_v" ADD COLUMN "version_closing_show_overrides" boolean DEFAULT false;
  ALTER TABLE "_audience_pages_v" ADD COLUMN "version_closing_eyebrow_override" varchar;
  ALTER TABLE "_audience_pages_v" ADD COLUMN "version_closing_heading_override" varchar;
  ALTER TABLE "_audience_pages_v" ADD COLUMN "version_closing_ask_override_title" varchar;
  ALTER TABLE "_audience_pages_v" ADD COLUMN "version_closing_ask_override_body" varchar;
  ALTER TABLE "_audience_pages_v" ADD COLUMN "version_closing_media_override_id" integer;
  ALTER TABLE "home" ADD COLUMN "closing_hidden" boolean DEFAULT false;
  ALTER TABLE "home" ADD COLUMN "closing_show_overrides" boolean DEFAULT false;
  ALTER TABLE "home" ADD COLUMN "closing_eyebrow_override" varchar;
  ALTER TABLE "home" ADD COLUMN "closing_heading_override" varchar;
  ALTER TABLE "home" ADD COLUMN "closing_ask_override_title" varchar;
  ALTER TABLE "home" ADD COLUMN "closing_ask_override_body" varchar;
  ALTER TABLE "home" ADD COLUMN "closing_media_override_id" integer;
  ALTER TABLE "_home_v" ADD COLUMN "version_closing_hidden" boolean DEFAULT false;
  ALTER TABLE "_home_v" ADD COLUMN "version_closing_show_overrides" boolean DEFAULT false;
  ALTER TABLE "_home_v" ADD COLUMN "version_closing_eyebrow_override" varchar;
  ALTER TABLE "_home_v" ADD COLUMN "version_closing_heading_override" varchar;
  ALTER TABLE "_home_v" ADD COLUMN "version_closing_ask_override_title" varchar;
  ALTER TABLE "_home_v" ADD COLUMN "version_closing_ask_override_body" varchar;
  ALTER TABLE "_home_v" ADD COLUMN "version_closing_media_override_id" integer;
  ALTER TABLE "pages_closing_cl" ADD CONSTRAINT "pages_closing_cl_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__pages_v_version_closing_cl_v" ADD CONSTRAINT "__pages_v_version_closing_cl_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_closing_cl" ADD CONSTRAINT "posts_closing_cl_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__posts_v_version_closing_cl_v" ADD CONSTRAINT "__posts_v_version_closing_cl_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "work_pages_closing_cl" ADD CONSTRAINT "work_pages_closing_cl_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."work_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__work_pages_v_version_closing_cl_v" ADD CONSTRAINT "__work_pages_v_version_closing_cl_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_work_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "expertise_pages_closing_cl" ADD CONSTRAINT "expertise_pages_closing_cl_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."expertise_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__expertise_pages_v_version_closing_cl_v" ADD CONSTRAINT "__expertise_pages_v_version_closing_cl_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_expertise_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "audience_pages_closing_cl" ADD CONSTRAINT "audience_pages_closing_cl_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."audience_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__audience_pages_v_version_closing_cl_v" ADD CONSTRAINT "__audience_pages_v_version_closing_cl_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_audience_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_closing_cl" ADD CONSTRAINT "home_closing_cl_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__home_v_version_closing_cl_v" ADD CONSTRAINT "__home_v_version_closing_cl_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_closing_cl_order_idx" ON "pages_closing_cl" USING btree ("_order");
  CREATE INDEX "pages_closing_cl_parent_id_idx" ON "pages_closing_cl" USING btree ("_parent_id");
  CREATE INDEX "__pages_v_version_closing_cl_v_order_idx" ON "__pages_v_version_closing_cl_v" USING btree ("_order");
  CREATE INDEX "__pages_v_version_closing_cl_v_parent_id_idx" ON "__pages_v_version_closing_cl_v" USING btree ("_parent_id");
  CREATE INDEX "posts_closing_cl_order_idx" ON "posts_closing_cl" USING btree ("_order");
  CREATE INDEX "posts_closing_cl_parent_id_idx" ON "posts_closing_cl" USING btree ("_parent_id");
  CREATE INDEX "__posts_v_version_closing_cl_v_order_idx" ON "__posts_v_version_closing_cl_v" USING btree ("_order");
  CREATE INDEX "__posts_v_version_closing_cl_v_parent_id_idx" ON "__posts_v_version_closing_cl_v" USING btree ("_parent_id");
  CREATE INDEX "work_pages_closing_cl_order_idx" ON "work_pages_closing_cl" USING btree ("_order");
  CREATE INDEX "work_pages_closing_cl_parent_id_idx" ON "work_pages_closing_cl" USING btree ("_parent_id");
  CREATE INDEX "__work_pages_v_version_closing_cl_v_order_idx" ON "__work_pages_v_version_closing_cl_v" USING btree ("_order");
  CREATE INDEX "__work_pages_v_version_closing_cl_v_parent_id_idx" ON "__work_pages_v_version_closing_cl_v" USING btree ("_parent_id");
  CREATE INDEX "expertise_pages_closing_cl_order_idx" ON "expertise_pages_closing_cl" USING btree ("_order");
  CREATE INDEX "expertise_pages_closing_cl_parent_id_idx" ON "expertise_pages_closing_cl" USING btree ("_parent_id");
  CREATE INDEX "__expertise_pages_v_version_closing_cl_v_order_idx" ON "__expertise_pages_v_version_closing_cl_v" USING btree ("_order");
  CREATE INDEX "__expertise_pages_v_version_closing_cl_v_parent_id_idx" ON "__expertise_pages_v_version_closing_cl_v" USING btree ("_parent_id");
  CREATE INDEX "audience_pages_closing_cl_order_idx" ON "audience_pages_closing_cl" USING btree ("_order");
  CREATE INDEX "audience_pages_closing_cl_parent_id_idx" ON "audience_pages_closing_cl" USING btree ("_parent_id");
  CREATE INDEX "__audience_pages_v_version_closing_cl_v_order_idx" ON "__audience_pages_v_version_closing_cl_v" USING btree ("_order");
  CREATE INDEX "__audience_pages_v_version_closing_cl_v_parent_id_idx" ON "__audience_pages_v_version_closing_cl_v" USING btree ("_parent_id");
  CREATE INDEX "home_closing_cl_order_idx" ON "home_closing_cl" USING btree ("_order");
  CREATE INDEX "home_closing_cl_parent_id_idx" ON "home_closing_cl" USING btree ("_parent_id");
  CREATE INDEX "__home_v_version_closing_cl_v_order_idx" ON "__home_v_version_closing_cl_v" USING btree ("_order");
  CREATE INDEX "__home_v_version_closing_cl_v_parent_id_idx" ON "__home_v_version_closing_cl_v" USING btree ("_parent_id");
  ALTER TABLE "pages" ADD CONSTRAINT "pages_closing_media_override_id_media_id_fk" FOREIGN KEY ("closing_media_override_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_closing_media_override_id_media_id_fk" FOREIGN KEY ("version_closing_media_override_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_closing_media_override_id_media_id_fk" FOREIGN KEY ("closing_media_override_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_closing_media_override_id_media_id_fk" FOREIGN KEY ("version_closing_media_override_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_rels" ADD CONSTRAINT "_posts_v_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "work_pages" ADD CONSTRAINT "work_pages_closing_media_override_id_media_id_fk" FOREIGN KEY ("closing_media_override_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_work_pages_v" ADD CONSTRAINT "_work_pages_v_version_closing_media_override_id_media_id_fk" FOREIGN KEY ("version_closing_media_override_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "expertise_pages" ADD CONSTRAINT "expertise_pages_closing_media_override_id_media_id_fk" FOREIGN KEY ("closing_media_override_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_expertise_pages_v" ADD CONSTRAINT "_expertise_pages_v_version_closing_media_override_id_media_id_fk" FOREIGN KEY ("version_closing_media_override_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "audience_pages" ADD CONSTRAINT "audience_pages_closing_media_override_id_media_id_fk" FOREIGN KEY ("closing_media_override_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_audience_pages_v" ADD CONSTRAINT "_audience_pages_v_version_closing_media_override_id_media_id_fk" FOREIGN KEY ("version_closing_media_override_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home" ADD CONSTRAINT "home_closing_media_override_id_media_id_fk" FOREIGN KEY ("closing_media_override_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_home_v" ADD CONSTRAINT "_home_v_version_closing_media_override_id_media_id_fk" FOREIGN KEY ("version_closing_media_override_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "pages_closing_closing_media_override_idx" ON "pages" USING btree ("closing_media_override_id");
  CREATE INDEX "_pages_v_version_closing_version_closing_media_override_idx" ON "_pages_v" USING btree ("version_closing_media_override_id");
  CREATE INDEX "posts_closing_closing_media_override_idx" ON "posts" USING btree ("closing_media_override_id");
  CREATE INDEX "posts_rels_pages_id_idx" ON "posts_rels" USING btree ("pages_id");
  CREATE INDEX "_posts_v_version_closing_version_closing_media_override_idx" ON "_posts_v" USING btree ("version_closing_media_override_id");
  CREATE INDEX "_posts_v_rels_pages_id_idx" ON "_posts_v_rels" USING btree ("pages_id");
  CREATE INDEX "work_pages_closing_closing_media_override_idx" ON "work_pages" USING btree ("closing_media_override_id");
  CREATE INDEX "_work_pages_v_version_closing_version_closing_media_over_idx" ON "_work_pages_v" USING btree ("version_closing_media_override_id");
  CREATE INDEX "expertise_pages_closing_closing_media_override_idx" ON "expertise_pages" USING btree ("closing_media_override_id");
  CREATE INDEX "_expertise_pages_v_version_closing_version_closing_media_idx" ON "_expertise_pages_v" USING btree ("version_closing_media_override_id");
  CREATE INDEX "audience_pages_closing_closing_media_override_idx" ON "audience_pages" USING btree ("closing_media_override_id");
  CREATE INDEX "_audience_pages_v_version_closing_version_closing_media__idx" ON "_audience_pages_v" USING btree ("version_closing_media_override_id");
  CREATE INDEX "home_closing_closing_media_override_idx" ON "home" USING btree ("closing_media_override_id");
  CREATE INDEX "_home_v_version_closing_version_closing_media_override_idx" ON "_home_v" USING btree ("version_closing_media_override_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_closing_cl" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__pages_v_version_closing_cl_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "posts_closing_cl" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__posts_v_version_closing_cl_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "work_pages_closing_cl" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__work_pages_v_version_closing_cl_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "expertise_pages_closing_cl" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__expertise_pages_v_version_closing_cl_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "audience_pages_closing_cl" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__audience_pages_v_version_closing_cl_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_closing_cl" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__home_v_version_closing_cl_v" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "pages_closing_cl" CASCADE;
  DROP TABLE "__pages_v_version_closing_cl_v" CASCADE;
  DROP TABLE "posts_closing_cl" CASCADE;
  DROP TABLE "__posts_v_version_closing_cl_v" CASCADE;
  DROP TABLE "work_pages_closing_cl" CASCADE;
  DROP TABLE "__work_pages_v_version_closing_cl_v" CASCADE;
  DROP TABLE "expertise_pages_closing_cl" CASCADE;
  DROP TABLE "__expertise_pages_v_version_closing_cl_v" CASCADE;
  DROP TABLE "audience_pages_closing_cl" CASCADE;
  DROP TABLE "__audience_pages_v_version_closing_cl_v" CASCADE;
  DROP TABLE "home_closing_cl" CASCADE;
  DROP TABLE "__home_v_version_closing_cl_v" CASCADE;
  ALTER TABLE "pages" DROP CONSTRAINT "pages_closing_media_override_id_media_id_fk";
  
  ALTER TABLE "_pages_v" DROP CONSTRAINT "_pages_v_version_closing_media_override_id_media_id_fk";
  
  ALTER TABLE "posts" DROP CONSTRAINT "posts_closing_media_override_id_media_id_fk";
  
  ALTER TABLE "posts_rels" DROP CONSTRAINT "posts_rels_pages_fk";
  
  ALTER TABLE "_posts_v" DROP CONSTRAINT "_posts_v_version_closing_media_override_id_media_id_fk";
  
  ALTER TABLE "_posts_v_rels" DROP CONSTRAINT "_posts_v_rels_pages_fk";
  
  ALTER TABLE "work_pages" DROP CONSTRAINT "work_pages_closing_media_override_id_media_id_fk";
  
  ALTER TABLE "_work_pages_v" DROP CONSTRAINT "_work_pages_v_version_closing_media_override_id_media_id_fk";
  
  ALTER TABLE "expertise_pages" DROP CONSTRAINT "expertise_pages_closing_media_override_id_media_id_fk";
  
  ALTER TABLE "_expertise_pages_v" DROP CONSTRAINT "_expertise_pages_v_version_closing_media_override_id_media_id_fk";
  
  ALTER TABLE "audience_pages" DROP CONSTRAINT "audience_pages_closing_media_override_id_media_id_fk";
  
  ALTER TABLE "_audience_pages_v" DROP CONSTRAINT "_audience_pages_v_version_closing_media_override_id_media_id_fk";
  
  ALTER TABLE "home" DROP CONSTRAINT "home_closing_media_override_id_media_id_fk";
  
  ALTER TABLE "_home_v" DROP CONSTRAINT "_home_v_version_closing_media_override_id_media_id_fk";
  
  DROP INDEX "pages_closing_closing_media_override_idx";
  DROP INDEX "_pages_v_version_closing_version_closing_media_override_idx";
  DROP INDEX "posts_closing_closing_media_override_idx";
  DROP INDEX "posts_rels_pages_id_idx";
  DROP INDEX "_posts_v_version_closing_version_closing_media_override_idx";
  DROP INDEX "_posts_v_rels_pages_id_idx";
  DROP INDEX "work_pages_closing_closing_media_override_idx";
  DROP INDEX "_work_pages_v_version_closing_version_closing_media_over_idx";
  DROP INDEX "expertise_pages_closing_closing_media_override_idx";
  DROP INDEX "_expertise_pages_v_version_closing_version_closing_media_idx";
  DROP INDEX "audience_pages_closing_closing_media_override_idx";
  DROP INDEX "_audience_pages_v_version_closing_version_closing_media__idx";
  DROP INDEX "home_closing_closing_media_override_idx";
  DROP INDEX "_home_v_version_closing_version_closing_media_override_idx";
  ALTER TABLE "pages_feat_work" ALTER COLUMN "theme" SET DEFAULT 'dark';
  ALTER TABLE "__pages_v_feat_work_v" ALTER COLUMN "theme" SET DEFAULT 'dark';
  ALTER TABLE "posts_feat_work" ALTER COLUMN "theme" SET DEFAULT 'dark';
  ALTER TABLE "__posts_v_feat_work_v" ALTER COLUMN "theme" SET DEFAULT 'dark';
  ALTER TABLE "work_pages_feat_work" ALTER COLUMN "theme" SET DEFAULT 'dark';
  ALTER TABLE "__work_pages_v_feat_work_v" ALTER COLUMN "theme" SET DEFAULT 'dark';
  ALTER TABLE "expertise_pages_feat_work" ALTER COLUMN "theme" SET DEFAULT 'dark';
  ALTER TABLE "__expertise_pages_v_feat_work_v" ALTER COLUMN "theme" SET DEFAULT 'dark';
  ALTER TABLE "audience_pages_feat_work" ALTER COLUMN "theme" SET DEFAULT 'dark';
  ALTER TABLE "__audience_pages_v_feat_work_v" ALTER COLUMN "theme" SET DEFAULT 'dark';
  ALTER TABLE "pages" DROP COLUMN "closing_hidden";
  ALTER TABLE "pages" DROP COLUMN "closing_show_overrides";
  ALTER TABLE "pages" DROP COLUMN "closing_eyebrow_override";
  ALTER TABLE "pages" DROP COLUMN "closing_heading_override";
  ALTER TABLE "pages" DROP COLUMN "closing_ask_override_title";
  ALTER TABLE "pages" DROP COLUMN "closing_ask_override_body";
  ALTER TABLE "pages" DROP COLUMN "closing_media_override_id";
  ALTER TABLE "_pages_v" DROP COLUMN "version_closing_hidden";
  ALTER TABLE "_pages_v" DROP COLUMN "version_closing_show_overrides";
  ALTER TABLE "_pages_v" DROP COLUMN "version_closing_eyebrow_override";
  ALTER TABLE "_pages_v" DROP COLUMN "version_closing_heading_override";
  ALTER TABLE "_pages_v" DROP COLUMN "version_closing_ask_override_title";
  ALTER TABLE "_pages_v" DROP COLUMN "version_closing_ask_override_body";
  ALTER TABLE "_pages_v" DROP COLUMN "version_closing_media_override_id";
  ALTER TABLE "posts" DROP COLUMN "closing_hidden";
  ALTER TABLE "posts" DROP COLUMN "closing_show_overrides";
  ALTER TABLE "posts" DROP COLUMN "closing_eyebrow_override";
  ALTER TABLE "posts" DROP COLUMN "closing_heading_override";
  ALTER TABLE "posts" DROP COLUMN "closing_ask_override_title";
  ALTER TABLE "posts" DROP COLUMN "closing_ask_override_body";
  ALTER TABLE "posts" DROP COLUMN "closing_media_override_id";
  ALTER TABLE "posts_rels" DROP COLUMN "pages_id";
  ALTER TABLE "_posts_v" DROP COLUMN "version_closing_hidden";
  ALTER TABLE "_posts_v" DROP COLUMN "version_closing_show_overrides";
  ALTER TABLE "_posts_v" DROP COLUMN "version_closing_eyebrow_override";
  ALTER TABLE "_posts_v" DROP COLUMN "version_closing_heading_override";
  ALTER TABLE "_posts_v" DROP COLUMN "version_closing_ask_override_title";
  ALTER TABLE "_posts_v" DROP COLUMN "version_closing_ask_override_body";
  ALTER TABLE "_posts_v" DROP COLUMN "version_closing_media_override_id";
  ALTER TABLE "_posts_v_rels" DROP COLUMN "pages_id";
  ALTER TABLE "work_pages" DROP COLUMN "closing_hidden";
  ALTER TABLE "work_pages" DROP COLUMN "closing_show_overrides";
  ALTER TABLE "work_pages" DROP COLUMN "closing_eyebrow_override";
  ALTER TABLE "work_pages" DROP COLUMN "closing_heading_override";
  ALTER TABLE "work_pages" DROP COLUMN "closing_ask_override_title";
  ALTER TABLE "work_pages" DROP COLUMN "closing_ask_override_body";
  ALTER TABLE "work_pages" DROP COLUMN "closing_media_override_id";
  ALTER TABLE "_work_pages_v" DROP COLUMN "version_closing_hidden";
  ALTER TABLE "_work_pages_v" DROP COLUMN "version_closing_show_overrides";
  ALTER TABLE "_work_pages_v" DROP COLUMN "version_closing_eyebrow_override";
  ALTER TABLE "_work_pages_v" DROP COLUMN "version_closing_heading_override";
  ALTER TABLE "_work_pages_v" DROP COLUMN "version_closing_ask_override_title";
  ALTER TABLE "_work_pages_v" DROP COLUMN "version_closing_ask_override_body";
  ALTER TABLE "_work_pages_v" DROP COLUMN "version_closing_media_override_id";
  ALTER TABLE "expertise_pages" DROP COLUMN "closing_hidden";
  ALTER TABLE "expertise_pages" DROP COLUMN "closing_show_overrides";
  ALTER TABLE "expertise_pages" DROP COLUMN "closing_eyebrow_override";
  ALTER TABLE "expertise_pages" DROP COLUMN "closing_heading_override";
  ALTER TABLE "expertise_pages" DROP COLUMN "closing_ask_override_title";
  ALTER TABLE "expertise_pages" DROP COLUMN "closing_ask_override_body";
  ALTER TABLE "expertise_pages" DROP COLUMN "closing_media_override_id";
  ALTER TABLE "_expertise_pages_v" DROP COLUMN "version_closing_hidden";
  ALTER TABLE "_expertise_pages_v" DROP COLUMN "version_closing_show_overrides";
  ALTER TABLE "_expertise_pages_v" DROP COLUMN "version_closing_eyebrow_override";
  ALTER TABLE "_expertise_pages_v" DROP COLUMN "version_closing_heading_override";
  ALTER TABLE "_expertise_pages_v" DROP COLUMN "version_closing_ask_override_title";
  ALTER TABLE "_expertise_pages_v" DROP COLUMN "version_closing_ask_override_body";
  ALTER TABLE "_expertise_pages_v" DROP COLUMN "version_closing_media_override_id";
  ALTER TABLE "audience_pages" DROP COLUMN "closing_hidden";
  ALTER TABLE "audience_pages" DROP COLUMN "closing_show_overrides";
  ALTER TABLE "audience_pages" DROP COLUMN "closing_eyebrow_override";
  ALTER TABLE "audience_pages" DROP COLUMN "closing_heading_override";
  ALTER TABLE "audience_pages" DROP COLUMN "closing_ask_override_title";
  ALTER TABLE "audience_pages" DROP COLUMN "closing_ask_override_body";
  ALTER TABLE "audience_pages" DROP COLUMN "closing_media_override_id";
  ALTER TABLE "_audience_pages_v" DROP COLUMN "version_closing_hidden";
  ALTER TABLE "_audience_pages_v" DROP COLUMN "version_closing_show_overrides";
  ALTER TABLE "_audience_pages_v" DROP COLUMN "version_closing_eyebrow_override";
  ALTER TABLE "_audience_pages_v" DROP COLUMN "version_closing_heading_override";
  ALTER TABLE "_audience_pages_v" DROP COLUMN "version_closing_ask_override_title";
  ALTER TABLE "_audience_pages_v" DROP COLUMN "version_closing_ask_override_body";
  ALTER TABLE "_audience_pages_v" DROP COLUMN "version_closing_media_override_id";
  ALTER TABLE "home" DROP COLUMN "closing_hidden";
  ALTER TABLE "home" DROP COLUMN "closing_show_overrides";
  ALTER TABLE "home" DROP COLUMN "closing_eyebrow_override";
  ALTER TABLE "home" DROP COLUMN "closing_heading_override";
  ALTER TABLE "home" DROP COLUMN "closing_ask_override_title";
  ALTER TABLE "home" DROP COLUMN "closing_ask_override_body";
  ALTER TABLE "home" DROP COLUMN "closing_media_override_id";
  ALTER TABLE "_home_v" DROP COLUMN "version_closing_hidden";
  ALTER TABLE "_home_v" DROP COLUMN "version_closing_show_overrides";
  ALTER TABLE "_home_v" DROP COLUMN "version_closing_eyebrow_override";
  ALTER TABLE "_home_v" DROP COLUMN "version_closing_heading_override";
  ALTER TABLE "_home_v" DROP COLUMN "version_closing_ask_override_title";
  ALTER TABLE "_home_v" DROP COLUMN "version_closing_ask_override_body";
  ALTER TABLE "_home_v" DROP COLUMN "version_closing_media_override_id";
  DROP TYPE "public"."enum_pages_closing_cl_link_type";
  DROP TYPE "public"."enum_pages_closing_cl_link_site_page";
  DROP TYPE "public"."enum_pages_closing_cl_link_appearance";
  DROP TYPE "public"."enum___pages_v_version_closing_cl_v_link_type";
  DROP TYPE "public"."enum___pages_v_version_closing_cl_v_link_site_page";
  DROP TYPE "public"."enum___pages_v_version_closing_cl_v_link_appearance";
  DROP TYPE "public"."enum_posts_closing_cl_link_type";
  DROP TYPE "public"."enum_posts_closing_cl_link_site_page";
  DROP TYPE "public"."enum_posts_closing_cl_link_appearance";
  DROP TYPE "public"."enum___posts_v_version_closing_cl_v_link_type";
  DROP TYPE "public"."enum___posts_v_version_closing_cl_v_link_site_page";
  DROP TYPE "public"."enum___posts_v_version_closing_cl_v_link_appearance";
  DROP TYPE "public"."enum_work_pages_closing_cl_link_type";
  DROP TYPE "public"."enum_work_pages_closing_cl_link_site_page";
  DROP TYPE "public"."enum_work_pages_closing_cl_link_appearance";
  DROP TYPE "public"."enum___work_pages_v_version_closing_cl_v_link_type";
  DROP TYPE "public"."enum___work_pages_v_version_closing_cl_v_link_site_page";
  DROP TYPE "public"."enum___work_pages_v_version_closing_cl_v_link_appearance";
  DROP TYPE "public"."enum_expertise_pages_closing_cl_link_type";
  DROP TYPE "public"."enum_expertise_pages_closing_cl_link_site_page";
  DROP TYPE "public"."enum_expertise_pages_closing_cl_link_appearance";
  DROP TYPE "public"."enum___expertise_pages_v_version_closing_cl_v_link_type";
  DROP TYPE "public"."enum___expertise_pages_v_version_closing_cl_v_link_site_page";
  DROP TYPE "public"."enum___expertise_pages_v_version_closing_cl_v_link_appearance";
  DROP TYPE "public"."enum_audience_pages_closing_cl_link_type";
  DROP TYPE "public"."enum_audience_pages_closing_cl_link_site_page";
  DROP TYPE "public"."enum_audience_pages_closing_cl_link_appearance";
  DROP TYPE "public"."enum___audience_pages_v_version_closing_cl_v_link_type";
  DROP TYPE "public"."enum___audience_pages_v_version_closing_cl_v_link_site_page";
  DROP TYPE "public"."enum___audience_pages_v_version_closing_cl_v_link_appearance";
  DROP TYPE "public"."enum_home_closing_cl_link_type";
  DROP TYPE "public"."enum_home_closing_cl_link_site_page";
  DROP TYPE "public"."enum_home_closing_cl_link_appearance";
  DROP TYPE "public"."enum___home_v_version_closing_cl_v_link_type";
  DROP TYPE "public"."enum___home_v_version_closing_cl_v_link_site_page";
  DROP TYPE "public"."enum___home_v_version_closing_cl_v_link_appearance";`)
}
