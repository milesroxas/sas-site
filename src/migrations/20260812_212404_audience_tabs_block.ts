import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_aud_tabs_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___pages_v_aud_tabs_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_work_pages_aud_tabs_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___work_pages_v_aud_tabs_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_expertise_pages_aud_tabs_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___expertise_pages_v_aud_tabs_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_audience_pages_aud_tabs_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___audience_pages_v_aud_tabs_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_home_aud_tabs_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___home_v_aud_tabs_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TABLE "pages_aud_tabs_tabs_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "pages_aud_tabs_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"intro" varchar,
  	"media_id" integer
  );
  
  CREATE TABLE "pages_aud_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar DEFAULT 'Different roles see different parts of the problem. We help bring the whole picture into focus.',
  	"browse_all_media" boolean DEFAULT false,
  	"theme" "enum_pages_aud_tabs_theme" DEFAULT 'dark',
  	"block_name" varchar
  );
  
  CREATE TABLE "__pages_v_aud_tabs_v_tabs_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "__pages_v_aud_tabs_v_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"intro" varchar,
  	"media_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "__pages_v_aud_tabs_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar DEFAULT 'Different roles see different parts of the problem. We help bring the whole picture into focus.',
  	"browse_all_media" boolean DEFAULT false,
  	"theme" "enum___pages_v_aud_tabs_v_theme" DEFAULT 'dark',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "work_pages_aud_tabs_tabs_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "work_pages_aud_tabs_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"intro" varchar,
  	"media_id" integer
  );
  
  CREATE TABLE "work_pages_aud_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar DEFAULT 'Different roles see different parts of the problem. We help bring the whole picture into focus.',
  	"browse_all_media" boolean DEFAULT false,
  	"theme" "enum_work_pages_aud_tabs_theme" DEFAULT 'dark',
  	"block_name" varchar
  );
  
  CREATE TABLE "__work_pages_v_aud_tabs_v_tabs_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "__work_pages_v_aud_tabs_v_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"intro" varchar,
  	"media_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "__work_pages_v_aud_tabs_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar DEFAULT 'Different roles see different parts of the problem. We help bring the whole picture into focus.',
  	"browse_all_media" boolean DEFAULT false,
  	"theme" "enum___work_pages_v_aud_tabs_v_theme" DEFAULT 'dark',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "expertise_pages_aud_tabs_tabs_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "expertise_pages_aud_tabs_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"intro" varchar,
  	"media_id" integer
  );
  
  CREATE TABLE "expertise_pages_aud_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar DEFAULT 'Different roles see different parts of the problem. We help bring the whole picture into focus.',
  	"browse_all_media" boolean DEFAULT false,
  	"theme" "enum_expertise_pages_aud_tabs_theme" DEFAULT 'dark',
  	"block_name" varchar
  );
  
  CREATE TABLE "__expertise_pages_v_aud_tabs_v_tabs_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "__expertise_pages_v_aud_tabs_v_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"intro" varchar,
  	"media_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "__expertise_pages_v_aud_tabs_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar DEFAULT 'Different roles see different parts of the problem. We help bring the whole picture into focus.',
  	"browse_all_media" boolean DEFAULT false,
  	"theme" "enum___expertise_pages_v_aud_tabs_v_theme" DEFAULT 'dark',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "audience_pages_aud_tabs_tabs_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "audience_pages_aud_tabs_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"intro" varchar,
  	"media_id" integer
  );
  
  CREATE TABLE "audience_pages_aud_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar DEFAULT 'Different roles see different parts of the problem. We help bring the whole picture into focus.',
  	"browse_all_media" boolean DEFAULT false,
  	"theme" "enum_audience_pages_aud_tabs_theme" DEFAULT 'dark',
  	"block_name" varchar
  );
  
  CREATE TABLE "__audience_pages_v_aud_tabs_v_tabs_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "__audience_pages_v_aud_tabs_v_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"intro" varchar,
  	"media_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "__audience_pages_v_aud_tabs_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar DEFAULT 'Different roles see different parts of the problem. We help bring the whole picture into focus.',
  	"browse_all_media" boolean DEFAULT false,
  	"theme" "enum___audience_pages_v_aud_tabs_v_theme" DEFAULT 'dark',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "home_aud_tabs_tabs_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "home_aud_tabs_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"intro" varchar,
  	"media_id" integer
  );
  
  CREATE TABLE "home_aud_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar DEFAULT 'Different roles see different parts of the problem. We help bring the whole picture into focus.',
  	"browse_all_media" boolean DEFAULT false,
  	"theme" "enum_home_aud_tabs_theme" DEFAULT 'dark',
  	"block_name" varchar
  );
  
  CREATE TABLE "__home_v_aud_tabs_v_tabs_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "__home_v_aud_tabs_v_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"intro" varchar,
  	"media_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "__home_v_aud_tabs_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar DEFAULT 'Different roles see different parts of the problem. We help bring the whole picture into focus.',
  	"browse_all_media" boolean DEFAULT false,
  	"theme" "enum___home_v_aud_tabs_v_theme" DEFAULT 'dark',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "pages_aud_tabs_tabs_items" ADD CONSTRAINT "pages_aud_tabs_tabs_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_aud_tabs_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_aud_tabs_tabs" ADD CONSTRAINT "pages_aud_tabs_tabs_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_aud_tabs_tabs" ADD CONSTRAINT "pages_aud_tabs_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_aud_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_aud_tabs" ADD CONSTRAINT "pages_aud_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__pages_v_aud_tabs_v_tabs_items" ADD CONSTRAINT "__pages_v_aud_tabs_v_tabs_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."__pages_v_aud_tabs_v_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__pages_v_aud_tabs_v_tabs" ADD CONSTRAINT "__pages_v_aud_tabs_v_tabs_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__pages_v_aud_tabs_v_tabs" ADD CONSTRAINT "__pages_v_aud_tabs_v_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."__pages_v_aud_tabs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__pages_v_aud_tabs_v" ADD CONSTRAINT "__pages_v_aud_tabs_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "work_pages_aud_tabs_tabs_items" ADD CONSTRAINT "work_pages_aud_tabs_tabs_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."work_pages_aud_tabs_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "work_pages_aud_tabs_tabs" ADD CONSTRAINT "work_pages_aud_tabs_tabs_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "work_pages_aud_tabs_tabs" ADD CONSTRAINT "work_pages_aud_tabs_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."work_pages_aud_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "work_pages_aud_tabs" ADD CONSTRAINT "work_pages_aud_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."work_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__work_pages_v_aud_tabs_v_tabs_items" ADD CONSTRAINT "__work_pages_v_aud_tabs_v_tabs_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."__work_pages_v_aud_tabs_v_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__work_pages_v_aud_tabs_v_tabs" ADD CONSTRAINT "__work_pages_v_aud_tabs_v_tabs_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__work_pages_v_aud_tabs_v_tabs" ADD CONSTRAINT "__work_pages_v_aud_tabs_v_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."__work_pages_v_aud_tabs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__work_pages_v_aud_tabs_v" ADD CONSTRAINT "__work_pages_v_aud_tabs_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_work_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "expertise_pages_aud_tabs_tabs_items" ADD CONSTRAINT "expertise_pages_aud_tabs_tabs_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."expertise_pages_aud_tabs_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "expertise_pages_aud_tabs_tabs" ADD CONSTRAINT "expertise_pages_aud_tabs_tabs_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "expertise_pages_aud_tabs_tabs" ADD CONSTRAINT "expertise_pages_aud_tabs_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."expertise_pages_aud_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "expertise_pages_aud_tabs" ADD CONSTRAINT "expertise_pages_aud_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."expertise_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__expertise_pages_v_aud_tabs_v_tabs_items" ADD CONSTRAINT "__expertise_pages_v_aud_tabs_v_tabs_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."__expertise_pages_v_aud_tabs_v_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__expertise_pages_v_aud_tabs_v_tabs" ADD CONSTRAINT "__expertise_pages_v_aud_tabs_v_tabs_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__expertise_pages_v_aud_tabs_v_tabs" ADD CONSTRAINT "__expertise_pages_v_aud_tabs_v_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."__expertise_pages_v_aud_tabs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__expertise_pages_v_aud_tabs_v" ADD CONSTRAINT "__expertise_pages_v_aud_tabs_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_expertise_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "audience_pages_aud_tabs_tabs_items" ADD CONSTRAINT "audience_pages_aud_tabs_tabs_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."audience_pages_aud_tabs_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "audience_pages_aud_tabs_tabs" ADD CONSTRAINT "audience_pages_aud_tabs_tabs_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "audience_pages_aud_tabs_tabs" ADD CONSTRAINT "audience_pages_aud_tabs_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."audience_pages_aud_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "audience_pages_aud_tabs" ADD CONSTRAINT "audience_pages_aud_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."audience_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__audience_pages_v_aud_tabs_v_tabs_items" ADD CONSTRAINT "__audience_pages_v_aud_tabs_v_tabs_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."__audience_pages_v_aud_tabs_v_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__audience_pages_v_aud_tabs_v_tabs" ADD CONSTRAINT "__audience_pages_v_aud_tabs_v_tabs_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__audience_pages_v_aud_tabs_v_tabs" ADD CONSTRAINT "__audience_pages_v_aud_tabs_v_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."__audience_pages_v_aud_tabs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__audience_pages_v_aud_tabs_v" ADD CONSTRAINT "__audience_pages_v_aud_tabs_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_audience_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_aud_tabs_tabs_items" ADD CONSTRAINT "home_aud_tabs_tabs_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_aud_tabs_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_aud_tabs_tabs" ADD CONSTRAINT "home_aud_tabs_tabs_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_aud_tabs_tabs" ADD CONSTRAINT "home_aud_tabs_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_aud_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_aud_tabs" ADD CONSTRAINT "home_aud_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__home_v_aud_tabs_v_tabs_items" ADD CONSTRAINT "__home_v_aud_tabs_v_tabs_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."__home_v_aud_tabs_v_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__home_v_aud_tabs_v_tabs" ADD CONSTRAINT "__home_v_aud_tabs_v_tabs_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__home_v_aud_tabs_v_tabs" ADD CONSTRAINT "__home_v_aud_tabs_v_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."__home_v_aud_tabs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__home_v_aud_tabs_v" ADD CONSTRAINT "__home_v_aud_tabs_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_aud_tabs_tabs_items_order_idx" ON "pages_aud_tabs_tabs_items" USING btree ("_order");
  CREATE INDEX "pages_aud_tabs_tabs_items_parent_id_idx" ON "pages_aud_tabs_tabs_items" USING btree ("_parent_id");
  CREATE INDEX "pages_aud_tabs_tabs_order_idx" ON "pages_aud_tabs_tabs" USING btree ("_order");
  CREATE INDEX "pages_aud_tabs_tabs_parent_id_idx" ON "pages_aud_tabs_tabs" USING btree ("_parent_id");
  CREATE INDEX "pages_aud_tabs_tabs_media_idx" ON "pages_aud_tabs_tabs" USING btree ("media_id");
  CREATE INDEX "pages_aud_tabs_order_idx" ON "pages_aud_tabs" USING btree ("_order");
  CREATE INDEX "pages_aud_tabs_parent_id_idx" ON "pages_aud_tabs" USING btree ("_parent_id");
  CREATE INDEX "pages_aud_tabs_path_idx" ON "pages_aud_tabs" USING btree ("_path");
  CREATE INDEX "__pages_v_aud_tabs_v_tabs_items_order_idx" ON "__pages_v_aud_tabs_v_tabs_items" USING btree ("_order");
  CREATE INDEX "__pages_v_aud_tabs_v_tabs_items_parent_id_idx" ON "__pages_v_aud_tabs_v_tabs_items" USING btree ("_parent_id");
  CREATE INDEX "__pages_v_aud_tabs_v_tabs_order_idx" ON "__pages_v_aud_tabs_v_tabs" USING btree ("_order");
  CREATE INDEX "__pages_v_aud_tabs_v_tabs_parent_id_idx" ON "__pages_v_aud_tabs_v_tabs" USING btree ("_parent_id");
  CREATE INDEX "__pages_v_aud_tabs_v_tabs_media_idx" ON "__pages_v_aud_tabs_v_tabs" USING btree ("media_id");
  CREATE INDEX "__pages_v_aud_tabs_v_order_idx" ON "__pages_v_aud_tabs_v" USING btree ("_order");
  CREATE INDEX "__pages_v_aud_tabs_v_parent_id_idx" ON "__pages_v_aud_tabs_v" USING btree ("_parent_id");
  CREATE INDEX "__pages_v_aud_tabs_v_path_idx" ON "__pages_v_aud_tabs_v" USING btree ("_path");
  CREATE INDEX "work_pages_aud_tabs_tabs_items_order_idx" ON "work_pages_aud_tabs_tabs_items" USING btree ("_order");
  CREATE INDEX "work_pages_aud_tabs_tabs_items_parent_id_idx" ON "work_pages_aud_tabs_tabs_items" USING btree ("_parent_id");
  CREATE INDEX "work_pages_aud_tabs_tabs_order_idx" ON "work_pages_aud_tabs_tabs" USING btree ("_order");
  CREATE INDEX "work_pages_aud_tabs_tabs_parent_id_idx" ON "work_pages_aud_tabs_tabs" USING btree ("_parent_id");
  CREATE INDEX "work_pages_aud_tabs_tabs_media_idx" ON "work_pages_aud_tabs_tabs" USING btree ("media_id");
  CREATE INDEX "work_pages_aud_tabs_order_idx" ON "work_pages_aud_tabs" USING btree ("_order");
  CREATE INDEX "work_pages_aud_tabs_parent_id_idx" ON "work_pages_aud_tabs" USING btree ("_parent_id");
  CREATE INDEX "work_pages_aud_tabs_path_idx" ON "work_pages_aud_tabs" USING btree ("_path");
  CREATE INDEX "__work_pages_v_aud_tabs_v_tabs_items_order_idx" ON "__work_pages_v_aud_tabs_v_tabs_items" USING btree ("_order");
  CREATE INDEX "__work_pages_v_aud_tabs_v_tabs_items_parent_id_idx" ON "__work_pages_v_aud_tabs_v_tabs_items" USING btree ("_parent_id");
  CREATE INDEX "__work_pages_v_aud_tabs_v_tabs_order_idx" ON "__work_pages_v_aud_tabs_v_tabs" USING btree ("_order");
  CREATE INDEX "__work_pages_v_aud_tabs_v_tabs_parent_id_idx" ON "__work_pages_v_aud_tabs_v_tabs" USING btree ("_parent_id");
  CREATE INDEX "__work_pages_v_aud_tabs_v_tabs_media_idx" ON "__work_pages_v_aud_tabs_v_tabs" USING btree ("media_id");
  CREATE INDEX "__work_pages_v_aud_tabs_v_order_idx" ON "__work_pages_v_aud_tabs_v" USING btree ("_order");
  CREATE INDEX "__work_pages_v_aud_tabs_v_parent_id_idx" ON "__work_pages_v_aud_tabs_v" USING btree ("_parent_id");
  CREATE INDEX "__work_pages_v_aud_tabs_v_path_idx" ON "__work_pages_v_aud_tabs_v" USING btree ("_path");
  CREATE INDEX "expertise_pages_aud_tabs_tabs_items_order_idx" ON "expertise_pages_aud_tabs_tabs_items" USING btree ("_order");
  CREATE INDEX "expertise_pages_aud_tabs_tabs_items_parent_id_idx" ON "expertise_pages_aud_tabs_tabs_items" USING btree ("_parent_id");
  CREATE INDEX "expertise_pages_aud_tabs_tabs_order_idx" ON "expertise_pages_aud_tabs_tabs" USING btree ("_order");
  CREATE INDEX "expertise_pages_aud_tabs_tabs_parent_id_idx" ON "expertise_pages_aud_tabs_tabs" USING btree ("_parent_id");
  CREATE INDEX "expertise_pages_aud_tabs_tabs_media_idx" ON "expertise_pages_aud_tabs_tabs" USING btree ("media_id");
  CREATE INDEX "expertise_pages_aud_tabs_order_idx" ON "expertise_pages_aud_tabs" USING btree ("_order");
  CREATE INDEX "expertise_pages_aud_tabs_parent_id_idx" ON "expertise_pages_aud_tabs" USING btree ("_parent_id");
  CREATE INDEX "expertise_pages_aud_tabs_path_idx" ON "expertise_pages_aud_tabs" USING btree ("_path");
  CREATE INDEX "__expertise_pages_v_aud_tabs_v_tabs_items_order_idx" ON "__expertise_pages_v_aud_tabs_v_tabs_items" USING btree ("_order");
  CREATE INDEX "__expertise_pages_v_aud_tabs_v_tabs_items_parent_id_idx" ON "__expertise_pages_v_aud_tabs_v_tabs_items" USING btree ("_parent_id");
  CREATE INDEX "__expertise_pages_v_aud_tabs_v_tabs_order_idx" ON "__expertise_pages_v_aud_tabs_v_tabs" USING btree ("_order");
  CREATE INDEX "__expertise_pages_v_aud_tabs_v_tabs_parent_id_idx" ON "__expertise_pages_v_aud_tabs_v_tabs" USING btree ("_parent_id");
  CREATE INDEX "__expertise_pages_v_aud_tabs_v_tabs_media_idx" ON "__expertise_pages_v_aud_tabs_v_tabs" USING btree ("media_id");
  CREATE INDEX "__expertise_pages_v_aud_tabs_v_order_idx" ON "__expertise_pages_v_aud_tabs_v" USING btree ("_order");
  CREATE INDEX "__expertise_pages_v_aud_tabs_v_parent_id_idx" ON "__expertise_pages_v_aud_tabs_v" USING btree ("_parent_id");
  CREATE INDEX "__expertise_pages_v_aud_tabs_v_path_idx" ON "__expertise_pages_v_aud_tabs_v" USING btree ("_path");
  CREATE INDEX "audience_pages_aud_tabs_tabs_items_order_idx" ON "audience_pages_aud_tabs_tabs_items" USING btree ("_order");
  CREATE INDEX "audience_pages_aud_tabs_tabs_items_parent_id_idx" ON "audience_pages_aud_tabs_tabs_items" USING btree ("_parent_id");
  CREATE INDEX "audience_pages_aud_tabs_tabs_order_idx" ON "audience_pages_aud_tabs_tabs" USING btree ("_order");
  CREATE INDEX "audience_pages_aud_tabs_tabs_parent_id_idx" ON "audience_pages_aud_tabs_tabs" USING btree ("_parent_id");
  CREATE INDEX "audience_pages_aud_tabs_tabs_media_idx" ON "audience_pages_aud_tabs_tabs" USING btree ("media_id");
  CREATE INDEX "audience_pages_aud_tabs_order_idx" ON "audience_pages_aud_tabs" USING btree ("_order");
  CREATE INDEX "audience_pages_aud_tabs_parent_id_idx" ON "audience_pages_aud_tabs" USING btree ("_parent_id");
  CREATE INDEX "audience_pages_aud_tabs_path_idx" ON "audience_pages_aud_tabs" USING btree ("_path");
  CREATE INDEX "__audience_pages_v_aud_tabs_v_tabs_items_order_idx" ON "__audience_pages_v_aud_tabs_v_tabs_items" USING btree ("_order");
  CREATE INDEX "__audience_pages_v_aud_tabs_v_tabs_items_parent_id_idx" ON "__audience_pages_v_aud_tabs_v_tabs_items" USING btree ("_parent_id");
  CREATE INDEX "__audience_pages_v_aud_tabs_v_tabs_order_idx" ON "__audience_pages_v_aud_tabs_v_tabs" USING btree ("_order");
  CREATE INDEX "__audience_pages_v_aud_tabs_v_tabs_parent_id_idx" ON "__audience_pages_v_aud_tabs_v_tabs" USING btree ("_parent_id");
  CREATE INDEX "__audience_pages_v_aud_tabs_v_tabs_media_idx" ON "__audience_pages_v_aud_tabs_v_tabs" USING btree ("media_id");
  CREATE INDEX "__audience_pages_v_aud_tabs_v_order_idx" ON "__audience_pages_v_aud_tabs_v" USING btree ("_order");
  CREATE INDEX "__audience_pages_v_aud_tabs_v_parent_id_idx" ON "__audience_pages_v_aud_tabs_v" USING btree ("_parent_id");
  CREATE INDEX "__audience_pages_v_aud_tabs_v_path_idx" ON "__audience_pages_v_aud_tabs_v" USING btree ("_path");
  CREATE INDEX "home_aud_tabs_tabs_items_order_idx" ON "home_aud_tabs_tabs_items" USING btree ("_order");
  CREATE INDEX "home_aud_tabs_tabs_items_parent_id_idx" ON "home_aud_tabs_tabs_items" USING btree ("_parent_id");
  CREATE INDEX "home_aud_tabs_tabs_order_idx" ON "home_aud_tabs_tabs" USING btree ("_order");
  CREATE INDEX "home_aud_tabs_tabs_parent_id_idx" ON "home_aud_tabs_tabs" USING btree ("_parent_id");
  CREATE INDEX "home_aud_tabs_tabs_media_idx" ON "home_aud_tabs_tabs" USING btree ("media_id");
  CREATE INDEX "home_aud_tabs_order_idx" ON "home_aud_tabs" USING btree ("_order");
  CREATE INDEX "home_aud_tabs_parent_id_idx" ON "home_aud_tabs" USING btree ("_parent_id");
  CREATE INDEX "home_aud_tabs_path_idx" ON "home_aud_tabs" USING btree ("_path");
  CREATE INDEX "__home_v_aud_tabs_v_tabs_items_order_idx" ON "__home_v_aud_tabs_v_tabs_items" USING btree ("_order");
  CREATE INDEX "__home_v_aud_tabs_v_tabs_items_parent_id_idx" ON "__home_v_aud_tabs_v_tabs_items" USING btree ("_parent_id");
  CREATE INDEX "__home_v_aud_tabs_v_tabs_order_idx" ON "__home_v_aud_tabs_v_tabs" USING btree ("_order");
  CREATE INDEX "__home_v_aud_tabs_v_tabs_parent_id_idx" ON "__home_v_aud_tabs_v_tabs" USING btree ("_parent_id");
  CREATE INDEX "__home_v_aud_tabs_v_tabs_media_idx" ON "__home_v_aud_tabs_v_tabs" USING btree ("media_id");
  CREATE INDEX "__home_v_aud_tabs_v_order_idx" ON "__home_v_aud_tabs_v" USING btree ("_order");
  CREATE INDEX "__home_v_aud_tabs_v_parent_id_idx" ON "__home_v_aud_tabs_v" USING btree ("_parent_id");
  CREATE INDEX "__home_v_aud_tabs_v_path_idx" ON "__home_v_aud_tabs_v" USING btree ("_path");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_aud_tabs_tabs_items" CASCADE;
  DROP TABLE "pages_aud_tabs_tabs" CASCADE;
  DROP TABLE "pages_aud_tabs" CASCADE;
  DROP TABLE "__pages_v_aud_tabs_v_tabs_items" CASCADE;
  DROP TABLE "__pages_v_aud_tabs_v_tabs" CASCADE;
  DROP TABLE "__pages_v_aud_tabs_v" CASCADE;
  DROP TABLE "work_pages_aud_tabs_tabs_items" CASCADE;
  DROP TABLE "work_pages_aud_tabs_tabs" CASCADE;
  DROP TABLE "work_pages_aud_tabs" CASCADE;
  DROP TABLE "__work_pages_v_aud_tabs_v_tabs_items" CASCADE;
  DROP TABLE "__work_pages_v_aud_tabs_v_tabs" CASCADE;
  DROP TABLE "__work_pages_v_aud_tabs_v" CASCADE;
  DROP TABLE "expertise_pages_aud_tabs_tabs_items" CASCADE;
  DROP TABLE "expertise_pages_aud_tabs_tabs" CASCADE;
  DROP TABLE "expertise_pages_aud_tabs" CASCADE;
  DROP TABLE "__expertise_pages_v_aud_tabs_v_tabs_items" CASCADE;
  DROP TABLE "__expertise_pages_v_aud_tabs_v_tabs" CASCADE;
  DROP TABLE "__expertise_pages_v_aud_tabs_v" CASCADE;
  DROP TABLE "audience_pages_aud_tabs_tabs_items" CASCADE;
  DROP TABLE "audience_pages_aud_tabs_tabs" CASCADE;
  DROP TABLE "audience_pages_aud_tabs" CASCADE;
  DROP TABLE "__audience_pages_v_aud_tabs_v_tabs_items" CASCADE;
  DROP TABLE "__audience_pages_v_aud_tabs_v_tabs" CASCADE;
  DROP TABLE "__audience_pages_v_aud_tabs_v" CASCADE;
  DROP TABLE "home_aud_tabs_tabs_items" CASCADE;
  DROP TABLE "home_aud_tabs_tabs" CASCADE;
  DROP TABLE "home_aud_tabs" CASCADE;
  DROP TABLE "__home_v_aud_tabs_v_tabs_items" CASCADE;
  DROP TABLE "__home_v_aud_tabs_v_tabs" CASCADE;
  DROP TABLE "__home_v_aud_tabs_v" CASCADE;
  DROP TYPE "public"."enum_pages_aud_tabs_theme";
  DROP TYPE "public"."enum___pages_v_aud_tabs_v_theme";
  DROP TYPE "public"."enum_work_pages_aud_tabs_theme";
  DROP TYPE "public"."enum___work_pages_v_aud_tabs_v_theme";
  DROP TYPE "public"."enum_expertise_pages_aud_tabs_theme";
  DROP TYPE "public"."enum___expertise_pages_v_aud_tabs_v_theme";
  DROP TYPE "public"."enum_audience_pages_aud_tabs_theme";
  DROP TYPE "public"."enum___audience_pages_v_aud_tabs_v_theme";
  DROP TYPE "public"."enum_home_aud_tabs_theme";
  DROP TYPE "public"."enum___home_v_aud_tabs_v_theme";`)
}
