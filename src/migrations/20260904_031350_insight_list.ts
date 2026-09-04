import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_insight_list_layout" AS ENUM('side', 'stacked');
  CREATE TYPE "public"."enum_pages_insight_list_mark_size" AS ENUM('small', 'medium', 'large');
  CREATE TYPE "public"."enum_pages_insight_list_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___pages_v_insight_list_v_layout" AS ENUM('side', 'stacked');
  CREATE TYPE "public"."enum___pages_v_insight_list_v_mark_size" AS ENUM('small', 'medium', 'large');
  CREATE TYPE "public"."enum___pages_v_insight_list_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_posts_insight_list_layout" AS ENUM('side', 'stacked');
  CREATE TYPE "public"."enum_posts_insight_list_mark_size" AS ENUM('small', 'medium', 'large');
  CREATE TYPE "public"."enum_posts_insight_list_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___posts_v_insight_list_v_layout" AS ENUM('side', 'stacked');
  CREATE TYPE "public"."enum___posts_v_insight_list_v_mark_size" AS ENUM('small', 'medium', 'large');
  CREATE TYPE "public"."enum___posts_v_insight_list_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_work_pages_insight_list_layout" AS ENUM('side', 'stacked');
  CREATE TYPE "public"."enum_work_pages_insight_list_mark_size" AS ENUM('small', 'medium', 'large');
  CREATE TYPE "public"."enum_work_pages_insight_list_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___work_pages_v_insight_list_v_layout" AS ENUM('side', 'stacked');
  CREATE TYPE "public"."enum___work_pages_v_insight_list_v_mark_size" AS ENUM('small', 'medium', 'large');
  CREATE TYPE "public"."enum___work_pages_v_insight_list_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_lab_pages_insight_list_layout" AS ENUM('side', 'stacked');
  CREATE TYPE "public"."enum_lab_pages_insight_list_mark_size" AS ENUM('small', 'medium', 'large');
  CREATE TYPE "public"."enum_lab_pages_insight_list_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___lab_pages_v_insight_list_v_layout" AS ENUM('side', 'stacked');
  CREATE TYPE "public"."enum___lab_pages_v_insight_list_v_mark_size" AS ENUM('small', 'medium', 'large');
  CREATE TYPE "public"."enum___lab_pages_v_insight_list_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_expertise_pages_insight_list_layout" AS ENUM('side', 'stacked');
  CREATE TYPE "public"."enum_expertise_pages_insight_list_mark_size" AS ENUM('small', 'medium', 'large');
  CREATE TYPE "public"."enum_expertise_pages_insight_list_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___expertise_pages_v_insight_list_v_layout" AS ENUM('side', 'stacked');
  CREATE TYPE "public"."enum___expertise_pages_v_insight_list_v_mark_size" AS ENUM('small', 'medium', 'large');
  CREATE TYPE "public"."enum___expertise_pages_v_insight_list_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_audience_pages_insight_list_layout" AS ENUM('side', 'stacked');
  CREATE TYPE "public"."enum_audience_pages_insight_list_mark_size" AS ENUM('small', 'medium', 'large');
  CREATE TYPE "public"."enum_audience_pages_insight_list_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___audience_pages_v_insight_list_v_layout" AS ENUM('side', 'stacked');
  CREATE TYPE "public"."enum___audience_pages_v_insight_list_v_mark_size" AS ENUM('small', 'medium', 'large');
  CREATE TYPE "public"."enum___audience_pages_v_insight_list_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_home_insight_list_layout" AS ENUM('side', 'stacked');
  CREATE TYPE "public"."enum_home_insight_list_mark_size" AS ENUM('small', 'medium', 'large');
  CREATE TYPE "public"."enum_home_insight_list_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___home_v_insight_list_v_layout" AS ENUM('side', 'stacked');
  CREATE TYPE "public"."enum___home_v_insight_list_v_mark_size" AS ENUM('small', 'medium', 'large');
  CREATE TYPE "public"."enum___home_v_insight_list_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TABLE "pages_insight_list_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"title" varchar,
  	"description" varchar
  );
  
  CREATE TABLE "pages_insight_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"summary" varchar,
  	"layout" "enum_pages_insight_list_layout" DEFAULT 'side',
  	"mark_size" "enum_pages_insight_list_mark_size" DEFAULT 'medium',
  	"theme" "enum_pages_insight_list_theme" DEFAULT 'light',
  	"block_name" varchar
  );
  
  CREATE TABLE "__pages_v_insight_list_v_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"title" varchar,
  	"description" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "__pages_v_insight_list_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"summary" varchar,
  	"layout" "enum___pages_v_insight_list_v_layout" DEFAULT 'side',
  	"mark_size" "enum___pages_v_insight_list_v_mark_size" DEFAULT 'medium',
  	"theme" "enum___pages_v_insight_list_v_theme" DEFAULT 'light',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "posts_insight_list_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"title" varchar,
  	"description" varchar
  );
  
  CREATE TABLE "posts_insight_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"summary" varchar,
  	"layout" "enum_posts_insight_list_layout" DEFAULT 'side',
  	"mark_size" "enum_posts_insight_list_mark_size" DEFAULT 'medium',
  	"theme" "enum_posts_insight_list_theme" DEFAULT 'light',
  	"block_name" varchar
  );
  
  CREATE TABLE "__posts_v_insight_list_v_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"title" varchar,
  	"description" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "__posts_v_insight_list_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"summary" varchar,
  	"layout" "enum___posts_v_insight_list_v_layout" DEFAULT 'side',
  	"mark_size" "enum___posts_v_insight_list_v_mark_size" DEFAULT 'medium',
  	"theme" "enum___posts_v_insight_list_v_theme" DEFAULT 'light',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "work_pages_insight_list_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"title" varchar,
  	"description" varchar
  );
  
  CREATE TABLE "work_pages_insight_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"summary" varchar,
  	"layout" "enum_work_pages_insight_list_layout" DEFAULT 'side',
  	"mark_size" "enum_work_pages_insight_list_mark_size" DEFAULT 'medium',
  	"theme" "enum_work_pages_insight_list_theme" DEFAULT 'light',
  	"block_name" varchar
  );
  
  CREATE TABLE "__work_pages_v_insight_list_v_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"title" varchar,
  	"description" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "__work_pages_v_insight_list_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"summary" varchar,
  	"layout" "enum___work_pages_v_insight_list_v_layout" DEFAULT 'side',
  	"mark_size" "enum___work_pages_v_insight_list_v_mark_size" DEFAULT 'medium',
  	"theme" "enum___work_pages_v_insight_list_v_theme" DEFAULT 'light',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "lab_pages_insight_list_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"title" varchar,
  	"description" varchar
  );
  
  CREATE TABLE "lab_pages_insight_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"summary" varchar,
  	"layout" "enum_lab_pages_insight_list_layout" DEFAULT 'side',
  	"mark_size" "enum_lab_pages_insight_list_mark_size" DEFAULT 'medium',
  	"theme" "enum_lab_pages_insight_list_theme" DEFAULT 'light',
  	"block_name" varchar
  );
  
  CREATE TABLE "__lab_pages_v_insight_list_v_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"title" varchar,
  	"description" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "__lab_pages_v_insight_list_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"summary" varchar,
  	"layout" "enum___lab_pages_v_insight_list_v_layout" DEFAULT 'side',
  	"mark_size" "enum___lab_pages_v_insight_list_v_mark_size" DEFAULT 'medium',
  	"theme" "enum___lab_pages_v_insight_list_v_theme" DEFAULT 'light',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "expertise_pages_insight_list_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"title" varchar,
  	"description" varchar
  );
  
  CREATE TABLE "expertise_pages_insight_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"summary" varchar,
  	"layout" "enum_expertise_pages_insight_list_layout" DEFAULT 'side',
  	"mark_size" "enum_expertise_pages_insight_list_mark_size" DEFAULT 'medium',
  	"theme" "enum_expertise_pages_insight_list_theme" DEFAULT 'light',
  	"block_name" varchar
  );
  
  CREATE TABLE "__expertise_pages_v_insight_list_v_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"title" varchar,
  	"description" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "__expertise_pages_v_insight_list_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"summary" varchar,
  	"layout" "enum___expertise_pages_v_insight_list_v_layout" DEFAULT 'side',
  	"mark_size" "enum___expertise_pages_v_insight_list_v_mark_size" DEFAULT 'medium',
  	"theme" "enum___expertise_pages_v_insight_list_v_theme" DEFAULT 'light',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "audience_pages_insight_list_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"title" varchar,
  	"description" varchar
  );
  
  CREATE TABLE "audience_pages_insight_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"summary" varchar,
  	"layout" "enum_audience_pages_insight_list_layout" DEFAULT 'side',
  	"mark_size" "enum_audience_pages_insight_list_mark_size" DEFAULT 'medium',
  	"theme" "enum_audience_pages_insight_list_theme" DEFAULT 'light',
  	"block_name" varchar
  );
  
  CREATE TABLE "__audience_pages_v_insight_list_v_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"title" varchar,
  	"description" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "__audience_pages_v_insight_list_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"summary" varchar,
  	"layout" "enum___audience_pages_v_insight_list_v_layout" DEFAULT 'side',
  	"mark_size" "enum___audience_pages_v_insight_list_v_mark_size" DEFAULT 'medium',
  	"theme" "enum___audience_pages_v_insight_list_v_theme" DEFAULT 'light',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "home_insight_list_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"title" varchar,
  	"description" varchar
  );
  
  CREATE TABLE "home_insight_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"summary" varchar,
  	"layout" "enum_home_insight_list_layout" DEFAULT 'side',
  	"mark_size" "enum_home_insight_list_mark_size" DEFAULT 'medium',
  	"theme" "enum_home_insight_list_theme" DEFAULT 'light',
  	"block_name" varchar
  );
  
  CREATE TABLE "__home_v_insight_list_v_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"title" varchar,
  	"description" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "__home_v_insight_list_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"summary" varchar,
  	"layout" "enum___home_v_insight_list_v_layout" DEFAULT 'side',
  	"mark_size" "enum___home_v_insight_list_v_mark_size" DEFAULT 'medium',
  	"theme" "enum___home_v_insight_list_v_theme" DEFAULT 'light',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "pages_insight_list_items" ADD CONSTRAINT "pages_insight_list_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_insight_list_items" ADD CONSTRAINT "pages_insight_list_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_insight_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_insight_list" ADD CONSTRAINT "pages_insight_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__pages_v_insight_list_v_items" ADD CONSTRAINT "__pages_v_insight_list_v_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__pages_v_insight_list_v_items" ADD CONSTRAINT "__pages_v_insight_list_v_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."__pages_v_insight_list_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__pages_v_insight_list_v" ADD CONSTRAINT "__pages_v_insight_list_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_insight_list_items" ADD CONSTRAINT "posts_insight_list_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_insight_list_items" ADD CONSTRAINT "posts_insight_list_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts_insight_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_insight_list" ADD CONSTRAINT "posts_insight_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__posts_v_insight_list_v_items" ADD CONSTRAINT "__posts_v_insight_list_v_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__posts_v_insight_list_v_items" ADD CONSTRAINT "__posts_v_insight_list_v_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."__posts_v_insight_list_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__posts_v_insight_list_v" ADD CONSTRAINT "__posts_v_insight_list_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "work_pages_insight_list_items" ADD CONSTRAINT "work_pages_insight_list_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "work_pages_insight_list_items" ADD CONSTRAINT "work_pages_insight_list_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."work_pages_insight_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "work_pages_insight_list" ADD CONSTRAINT "work_pages_insight_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."work_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__work_pages_v_insight_list_v_items" ADD CONSTRAINT "__work_pages_v_insight_list_v_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__work_pages_v_insight_list_v_items" ADD CONSTRAINT "__work_pages_v_insight_list_v_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."__work_pages_v_insight_list_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__work_pages_v_insight_list_v" ADD CONSTRAINT "__work_pages_v_insight_list_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_work_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lab_pages_insight_list_items" ADD CONSTRAINT "lab_pages_insight_list_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "lab_pages_insight_list_items" ADD CONSTRAINT "lab_pages_insight_list_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lab_pages_insight_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lab_pages_insight_list" ADD CONSTRAINT "lab_pages_insight_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lab_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__lab_pages_v_insight_list_v_items" ADD CONSTRAINT "__lab_pages_v_insight_list_v_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__lab_pages_v_insight_list_v_items" ADD CONSTRAINT "__lab_pages_v_insight_list_v_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."__lab_pages_v_insight_list_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__lab_pages_v_insight_list_v" ADD CONSTRAINT "__lab_pages_v_insight_list_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_lab_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "expertise_pages_insight_list_items" ADD CONSTRAINT "expertise_pages_insight_list_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "expertise_pages_insight_list_items" ADD CONSTRAINT "expertise_pages_insight_list_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."expertise_pages_insight_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "expertise_pages_insight_list" ADD CONSTRAINT "expertise_pages_insight_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."expertise_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__expertise_pages_v_insight_list_v_items" ADD CONSTRAINT "__expertise_pages_v_insight_list_v_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__expertise_pages_v_insight_list_v_items" ADD CONSTRAINT "__expertise_pages_v_insight_list_v_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."__expertise_pages_v_insight_list_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__expertise_pages_v_insight_list_v" ADD CONSTRAINT "__expertise_pages_v_insight_list_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_expertise_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "audience_pages_insight_list_items" ADD CONSTRAINT "audience_pages_insight_list_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "audience_pages_insight_list_items" ADD CONSTRAINT "audience_pages_insight_list_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."audience_pages_insight_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "audience_pages_insight_list" ADD CONSTRAINT "audience_pages_insight_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."audience_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__audience_pages_v_insight_list_v_items" ADD CONSTRAINT "__audience_pages_v_insight_list_v_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__audience_pages_v_insight_list_v_items" ADD CONSTRAINT "__audience_pages_v_insight_list_v_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."__audience_pages_v_insight_list_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__audience_pages_v_insight_list_v" ADD CONSTRAINT "__audience_pages_v_insight_list_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_audience_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_insight_list_items" ADD CONSTRAINT "home_insight_list_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_insight_list_items" ADD CONSTRAINT "home_insight_list_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_insight_list"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_insight_list" ADD CONSTRAINT "home_insight_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__home_v_insight_list_v_items" ADD CONSTRAINT "__home_v_insight_list_v_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__home_v_insight_list_v_items" ADD CONSTRAINT "__home_v_insight_list_v_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."__home_v_insight_list_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__home_v_insight_list_v" ADD CONSTRAINT "__home_v_insight_list_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_insight_list_items_order_idx" ON "pages_insight_list_items" USING btree ("_order");
  CREATE INDEX "pages_insight_list_items_parent_id_idx" ON "pages_insight_list_items" USING btree ("_parent_id");
  CREATE INDEX "pages_insight_list_items_media_idx" ON "pages_insight_list_items" USING btree ("media_id");
  CREATE INDEX "pages_insight_list_order_idx" ON "pages_insight_list" USING btree ("_order");
  CREATE INDEX "pages_insight_list_parent_id_idx" ON "pages_insight_list" USING btree ("_parent_id");
  CREATE INDEX "pages_insight_list_path_idx" ON "pages_insight_list" USING btree ("_path");
  CREATE INDEX "__pages_v_insight_list_v_items_order_idx" ON "__pages_v_insight_list_v_items" USING btree ("_order");
  CREATE INDEX "__pages_v_insight_list_v_items_parent_id_idx" ON "__pages_v_insight_list_v_items" USING btree ("_parent_id");
  CREATE INDEX "__pages_v_insight_list_v_items_media_idx" ON "__pages_v_insight_list_v_items" USING btree ("media_id");
  CREATE INDEX "__pages_v_insight_list_v_order_idx" ON "__pages_v_insight_list_v" USING btree ("_order");
  CREATE INDEX "__pages_v_insight_list_v_parent_id_idx" ON "__pages_v_insight_list_v" USING btree ("_parent_id");
  CREATE INDEX "__pages_v_insight_list_v_path_idx" ON "__pages_v_insight_list_v" USING btree ("_path");
  CREATE INDEX "posts_insight_list_items_order_idx" ON "posts_insight_list_items" USING btree ("_order");
  CREATE INDEX "posts_insight_list_items_parent_id_idx" ON "posts_insight_list_items" USING btree ("_parent_id");
  CREATE INDEX "posts_insight_list_items_media_idx" ON "posts_insight_list_items" USING btree ("media_id");
  CREATE INDEX "posts_insight_list_order_idx" ON "posts_insight_list" USING btree ("_order");
  CREATE INDEX "posts_insight_list_parent_id_idx" ON "posts_insight_list" USING btree ("_parent_id");
  CREATE INDEX "posts_insight_list_path_idx" ON "posts_insight_list" USING btree ("_path");
  CREATE INDEX "__posts_v_insight_list_v_items_order_idx" ON "__posts_v_insight_list_v_items" USING btree ("_order");
  CREATE INDEX "__posts_v_insight_list_v_items_parent_id_idx" ON "__posts_v_insight_list_v_items" USING btree ("_parent_id");
  CREATE INDEX "__posts_v_insight_list_v_items_media_idx" ON "__posts_v_insight_list_v_items" USING btree ("media_id");
  CREATE INDEX "__posts_v_insight_list_v_order_idx" ON "__posts_v_insight_list_v" USING btree ("_order");
  CREATE INDEX "__posts_v_insight_list_v_parent_id_idx" ON "__posts_v_insight_list_v" USING btree ("_parent_id");
  CREATE INDEX "__posts_v_insight_list_v_path_idx" ON "__posts_v_insight_list_v" USING btree ("_path");
  CREATE INDEX "work_pages_insight_list_items_order_idx" ON "work_pages_insight_list_items" USING btree ("_order");
  CREATE INDEX "work_pages_insight_list_items_parent_id_idx" ON "work_pages_insight_list_items" USING btree ("_parent_id");
  CREATE INDEX "work_pages_insight_list_items_media_idx" ON "work_pages_insight_list_items" USING btree ("media_id");
  CREATE INDEX "work_pages_insight_list_order_idx" ON "work_pages_insight_list" USING btree ("_order");
  CREATE INDEX "work_pages_insight_list_parent_id_idx" ON "work_pages_insight_list" USING btree ("_parent_id");
  CREATE INDEX "work_pages_insight_list_path_idx" ON "work_pages_insight_list" USING btree ("_path");
  CREATE INDEX "__work_pages_v_insight_list_v_items_order_idx" ON "__work_pages_v_insight_list_v_items" USING btree ("_order");
  CREATE INDEX "__work_pages_v_insight_list_v_items_parent_id_idx" ON "__work_pages_v_insight_list_v_items" USING btree ("_parent_id");
  CREATE INDEX "__work_pages_v_insight_list_v_items_media_idx" ON "__work_pages_v_insight_list_v_items" USING btree ("media_id");
  CREATE INDEX "__work_pages_v_insight_list_v_order_idx" ON "__work_pages_v_insight_list_v" USING btree ("_order");
  CREATE INDEX "__work_pages_v_insight_list_v_parent_id_idx" ON "__work_pages_v_insight_list_v" USING btree ("_parent_id");
  CREATE INDEX "__work_pages_v_insight_list_v_path_idx" ON "__work_pages_v_insight_list_v" USING btree ("_path");
  CREATE INDEX "lab_pages_insight_list_items_order_idx" ON "lab_pages_insight_list_items" USING btree ("_order");
  CREATE INDEX "lab_pages_insight_list_items_parent_id_idx" ON "lab_pages_insight_list_items" USING btree ("_parent_id");
  CREATE INDEX "lab_pages_insight_list_items_media_idx" ON "lab_pages_insight_list_items" USING btree ("media_id");
  CREATE INDEX "lab_pages_insight_list_order_idx" ON "lab_pages_insight_list" USING btree ("_order");
  CREATE INDEX "lab_pages_insight_list_parent_id_idx" ON "lab_pages_insight_list" USING btree ("_parent_id");
  CREATE INDEX "lab_pages_insight_list_path_idx" ON "lab_pages_insight_list" USING btree ("_path");
  CREATE INDEX "__lab_pages_v_insight_list_v_items_order_idx" ON "__lab_pages_v_insight_list_v_items" USING btree ("_order");
  CREATE INDEX "__lab_pages_v_insight_list_v_items_parent_id_idx" ON "__lab_pages_v_insight_list_v_items" USING btree ("_parent_id");
  CREATE INDEX "__lab_pages_v_insight_list_v_items_media_idx" ON "__lab_pages_v_insight_list_v_items" USING btree ("media_id");
  CREATE INDEX "__lab_pages_v_insight_list_v_order_idx" ON "__lab_pages_v_insight_list_v" USING btree ("_order");
  CREATE INDEX "__lab_pages_v_insight_list_v_parent_id_idx" ON "__lab_pages_v_insight_list_v" USING btree ("_parent_id");
  CREATE INDEX "__lab_pages_v_insight_list_v_path_idx" ON "__lab_pages_v_insight_list_v" USING btree ("_path");
  CREATE INDEX "expertise_pages_insight_list_items_order_idx" ON "expertise_pages_insight_list_items" USING btree ("_order");
  CREATE INDEX "expertise_pages_insight_list_items_parent_id_idx" ON "expertise_pages_insight_list_items" USING btree ("_parent_id");
  CREATE INDEX "expertise_pages_insight_list_items_media_idx" ON "expertise_pages_insight_list_items" USING btree ("media_id");
  CREATE INDEX "expertise_pages_insight_list_order_idx" ON "expertise_pages_insight_list" USING btree ("_order");
  CREATE INDEX "expertise_pages_insight_list_parent_id_idx" ON "expertise_pages_insight_list" USING btree ("_parent_id");
  CREATE INDEX "expertise_pages_insight_list_path_idx" ON "expertise_pages_insight_list" USING btree ("_path");
  CREATE INDEX "__expertise_pages_v_insight_list_v_items_order_idx" ON "__expertise_pages_v_insight_list_v_items" USING btree ("_order");
  CREATE INDEX "__expertise_pages_v_insight_list_v_items_parent_id_idx" ON "__expertise_pages_v_insight_list_v_items" USING btree ("_parent_id");
  CREATE INDEX "__expertise_pages_v_insight_list_v_items_media_idx" ON "__expertise_pages_v_insight_list_v_items" USING btree ("media_id");
  CREATE INDEX "__expertise_pages_v_insight_list_v_order_idx" ON "__expertise_pages_v_insight_list_v" USING btree ("_order");
  CREATE INDEX "__expertise_pages_v_insight_list_v_parent_id_idx" ON "__expertise_pages_v_insight_list_v" USING btree ("_parent_id");
  CREATE INDEX "__expertise_pages_v_insight_list_v_path_idx" ON "__expertise_pages_v_insight_list_v" USING btree ("_path");
  CREATE INDEX "audience_pages_insight_list_items_order_idx" ON "audience_pages_insight_list_items" USING btree ("_order");
  CREATE INDEX "audience_pages_insight_list_items_parent_id_idx" ON "audience_pages_insight_list_items" USING btree ("_parent_id");
  CREATE INDEX "audience_pages_insight_list_items_media_idx" ON "audience_pages_insight_list_items" USING btree ("media_id");
  CREATE INDEX "audience_pages_insight_list_order_idx" ON "audience_pages_insight_list" USING btree ("_order");
  CREATE INDEX "audience_pages_insight_list_parent_id_idx" ON "audience_pages_insight_list" USING btree ("_parent_id");
  CREATE INDEX "audience_pages_insight_list_path_idx" ON "audience_pages_insight_list" USING btree ("_path");
  CREATE INDEX "__audience_pages_v_insight_list_v_items_order_idx" ON "__audience_pages_v_insight_list_v_items" USING btree ("_order");
  CREATE INDEX "__audience_pages_v_insight_list_v_items_parent_id_idx" ON "__audience_pages_v_insight_list_v_items" USING btree ("_parent_id");
  CREATE INDEX "__audience_pages_v_insight_list_v_items_media_idx" ON "__audience_pages_v_insight_list_v_items" USING btree ("media_id");
  CREATE INDEX "__audience_pages_v_insight_list_v_order_idx" ON "__audience_pages_v_insight_list_v" USING btree ("_order");
  CREATE INDEX "__audience_pages_v_insight_list_v_parent_id_idx" ON "__audience_pages_v_insight_list_v" USING btree ("_parent_id");
  CREATE INDEX "__audience_pages_v_insight_list_v_path_idx" ON "__audience_pages_v_insight_list_v" USING btree ("_path");
  CREATE INDEX "home_insight_list_items_order_idx" ON "home_insight_list_items" USING btree ("_order");
  CREATE INDEX "home_insight_list_items_parent_id_idx" ON "home_insight_list_items" USING btree ("_parent_id");
  CREATE INDEX "home_insight_list_items_media_idx" ON "home_insight_list_items" USING btree ("media_id");
  CREATE INDEX "home_insight_list_order_idx" ON "home_insight_list" USING btree ("_order");
  CREATE INDEX "home_insight_list_parent_id_idx" ON "home_insight_list" USING btree ("_parent_id");
  CREATE INDEX "home_insight_list_path_idx" ON "home_insight_list" USING btree ("_path");
  CREATE INDEX "__home_v_insight_list_v_items_order_idx" ON "__home_v_insight_list_v_items" USING btree ("_order");
  CREATE INDEX "__home_v_insight_list_v_items_parent_id_idx" ON "__home_v_insight_list_v_items" USING btree ("_parent_id");
  CREATE INDEX "__home_v_insight_list_v_items_media_idx" ON "__home_v_insight_list_v_items" USING btree ("media_id");
  CREATE INDEX "__home_v_insight_list_v_order_idx" ON "__home_v_insight_list_v" USING btree ("_order");
  CREATE INDEX "__home_v_insight_list_v_parent_id_idx" ON "__home_v_insight_list_v" USING btree ("_parent_id");
  CREATE INDEX "__home_v_insight_list_v_path_idx" ON "__home_v_insight_list_v" USING btree ("_path");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_insight_list_items" CASCADE;
  DROP TABLE "pages_insight_list" CASCADE;
  DROP TABLE "__pages_v_insight_list_v_items" CASCADE;
  DROP TABLE "__pages_v_insight_list_v" CASCADE;
  DROP TABLE "posts_insight_list_items" CASCADE;
  DROP TABLE "posts_insight_list" CASCADE;
  DROP TABLE "__posts_v_insight_list_v_items" CASCADE;
  DROP TABLE "__posts_v_insight_list_v" CASCADE;
  DROP TABLE "work_pages_insight_list_items" CASCADE;
  DROP TABLE "work_pages_insight_list" CASCADE;
  DROP TABLE "__work_pages_v_insight_list_v_items" CASCADE;
  DROP TABLE "__work_pages_v_insight_list_v" CASCADE;
  DROP TABLE "lab_pages_insight_list_items" CASCADE;
  DROP TABLE "lab_pages_insight_list" CASCADE;
  DROP TABLE "__lab_pages_v_insight_list_v_items" CASCADE;
  DROP TABLE "__lab_pages_v_insight_list_v" CASCADE;
  DROP TABLE "expertise_pages_insight_list_items" CASCADE;
  DROP TABLE "expertise_pages_insight_list" CASCADE;
  DROP TABLE "__expertise_pages_v_insight_list_v_items" CASCADE;
  DROP TABLE "__expertise_pages_v_insight_list_v" CASCADE;
  DROP TABLE "audience_pages_insight_list_items" CASCADE;
  DROP TABLE "audience_pages_insight_list" CASCADE;
  DROP TABLE "__audience_pages_v_insight_list_v_items" CASCADE;
  DROP TABLE "__audience_pages_v_insight_list_v" CASCADE;
  DROP TABLE "home_insight_list_items" CASCADE;
  DROP TABLE "home_insight_list" CASCADE;
  DROP TABLE "__home_v_insight_list_v_items" CASCADE;
  DROP TABLE "__home_v_insight_list_v" CASCADE;
  DROP TYPE "public"."enum_pages_insight_list_layout";
  DROP TYPE "public"."enum_pages_insight_list_mark_size";
  DROP TYPE "public"."enum_pages_insight_list_theme";
  DROP TYPE "public"."enum___pages_v_insight_list_v_layout";
  DROP TYPE "public"."enum___pages_v_insight_list_v_mark_size";
  DROP TYPE "public"."enum___pages_v_insight_list_v_theme";
  DROP TYPE "public"."enum_posts_insight_list_layout";
  DROP TYPE "public"."enum_posts_insight_list_mark_size";
  DROP TYPE "public"."enum_posts_insight_list_theme";
  DROP TYPE "public"."enum___posts_v_insight_list_v_layout";
  DROP TYPE "public"."enum___posts_v_insight_list_v_mark_size";
  DROP TYPE "public"."enum___posts_v_insight_list_v_theme";
  DROP TYPE "public"."enum_work_pages_insight_list_layout";
  DROP TYPE "public"."enum_work_pages_insight_list_mark_size";
  DROP TYPE "public"."enum_work_pages_insight_list_theme";
  DROP TYPE "public"."enum___work_pages_v_insight_list_v_layout";
  DROP TYPE "public"."enum___work_pages_v_insight_list_v_mark_size";
  DROP TYPE "public"."enum___work_pages_v_insight_list_v_theme";
  DROP TYPE "public"."enum_lab_pages_insight_list_layout";
  DROP TYPE "public"."enum_lab_pages_insight_list_mark_size";
  DROP TYPE "public"."enum_lab_pages_insight_list_theme";
  DROP TYPE "public"."enum___lab_pages_v_insight_list_v_layout";
  DROP TYPE "public"."enum___lab_pages_v_insight_list_v_mark_size";
  DROP TYPE "public"."enum___lab_pages_v_insight_list_v_theme";
  DROP TYPE "public"."enum_expertise_pages_insight_list_layout";
  DROP TYPE "public"."enum_expertise_pages_insight_list_mark_size";
  DROP TYPE "public"."enum_expertise_pages_insight_list_theme";
  DROP TYPE "public"."enum___expertise_pages_v_insight_list_v_layout";
  DROP TYPE "public"."enum___expertise_pages_v_insight_list_v_mark_size";
  DROP TYPE "public"."enum___expertise_pages_v_insight_list_v_theme";
  DROP TYPE "public"."enum_audience_pages_insight_list_layout";
  DROP TYPE "public"."enum_audience_pages_insight_list_mark_size";
  DROP TYPE "public"."enum_audience_pages_insight_list_theme";
  DROP TYPE "public"."enum___audience_pages_v_insight_list_v_layout";
  DROP TYPE "public"."enum___audience_pages_v_insight_list_v_mark_size";
  DROP TYPE "public"."enum___audience_pages_v_insight_list_v_theme";
  DROP TYPE "public"."enum_home_insight_list_layout";
  DROP TYPE "public"."enum_home_insight_list_mark_size";
  DROP TYPE "public"."enum_home_insight_list_theme";
  DROP TYPE "public"."enum___home_v_insight_list_v_layout";
  DROP TYPE "public"."enum___home_v_insight_list_v_mark_size";
  DROP TYPE "public"."enum___home_v_insight_list_v_theme";`)
}
