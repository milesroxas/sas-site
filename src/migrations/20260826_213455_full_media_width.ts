import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_full_media_width" AS ENUM('contained', 'full-width');
  CREATE TYPE "public"."enum_pages_full_media_aspect_ratio" AS ENUM('16-9', '3-2', '21-9');
  CREATE TYPE "public"."enum___pages_v_full_media_v_width" AS ENUM('contained', 'full-width');
  CREATE TYPE "public"."enum___pages_v_full_media_v_aspect_ratio" AS ENUM('16-9', '3-2', '21-9');
  CREATE TYPE "public"."enum_work_pages_full_media_width" AS ENUM('contained', 'full-width');
  CREATE TYPE "public"."enum_work_pages_full_media_aspect_ratio" AS ENUM('16-9', '3-2', '21-9');
  CREATE TYPE "public"."enum_work_pages_blocks_carousel_width" AS ENUM('contained', 'full-width');
  CREATE TYPE "public"."enum_work_pages_blocks_carousel_slide_size" AS ENUM('full', 'half', 'third');
  CREATE TYPE "public"."enum___work_pages_v_full_media_v_width" AS ENUM('contained', 'full-width');
  CREATE TYPE "public"."enum___work_pages_v_full_media_v_aspect_ratio" AS ENUM('16-9', '3-2', '21-9');
  CREATE TYPE "public"."enum__work_pages_v_blocks_carousel_width" AS ENUM('contained', 'full-width');
  CREATE TYPE "public"."enum__work_pages_v_blocks_carousel_slide_size" AS ENUM('full', 'half', 'third');
  CREATE TYPE "public"."enum_lab_pages_blocks_carousel_width" AS ENUM('contained', 'full-width');
  CREATE TYPE "public"."enum_lab_pages_blocks_carousel_slide_size" AS ENUM('full', 'half', 'third');
  CREATE TYPE "public"."enum__lab_pages_v_blocks_carousel_width" AS ENUM('contained', 'full-width');
  CREATE TYPE "public"."enum__lab_pages_v_blocks_carousel_slide_size" AS ENUM('full', 'half', 'third');
  CREATE TYPE "public"."enum_expertise_pages_blocks_carousel_width" AS ENUM('contained', 'full-width');
  CREATE TYPE "public"."enum_expertise_pages_blocks_carousel_slide_size" AS ENUM('full', 'half', 'third');
  CREATE TYPE "public"."enum__expertise_pages_v_blocks_carousel_width" AS ENUM('contained', 'full-width');
  CREATE TYPE "public"."enum__expertise_pages_v_blocks_carousel_slide_size" AS ENUM('full', 'half', 'third');
  CREATE TYPE "public"."enum_audience_pages_blocks_carousel_width" AS ENUM('contained', 'full-width');
  CREATE TYPE "public"."enum_audience_pages_blocks_carousel_slide_size" AS ENUM('full', 'half', 'third');
  CREATE TYPE "public"."enum__audience_pages_v_blocks_carousel_width" AS ENUM('contained', 'full-width');
  CREATE TYPE "public"."enum__audience_pages_v_blocks_carousel_slide_size" AS ENUM('full', 'half', 'third');
  CREATE TYPE "public"."enum_home_full_media_width" AS ENUM('contained', 'full-width');
  CREATE TYPE "public"."enum_home_full_media_aspect_ratio" AS ENUM('16-9', '3-2', '21-9');
  CREATE TYPE "public"."enum___home_v_full_media_v_width" AS ENUM('contained', 'full-width');
  CREATE TYPE "public"."enum___home_v_full_media_v_aspect_ratio" AS ENUM('16-9', '3-2', '21-9');
  CREATE TABLE "work_pages_blocks_carousel_slides" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"caption" varchar
  );
  
  CREATE TABLE "work_pages_blocks_carousel" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"width" "enum_work_pages_blocks_carousel_width" DEFAULT 'contained',
  	"show_arrows" boolean DEFAULT false,
  	"slide_size" "enum_work_pages_blocks_carousel_slide_size" DEFAULT 'full',
  	"block_name" varchar
  );
  
  CREATE TABLE "_work_pages_v_blocks_carousel_slides" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"caption" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_work_pages_v_blocks_carousel" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"width" "enum__work_pages_v_blocks_carousel_width" DEFAULT 'contained',
  	"show_arrows" boolean DEFAULT false,
  	"slide_size" "enum__work_pages_v_blocks_carousel_slide_size" DEFAULT 'full',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "lab_pages_blocks_carousel_slides" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"caption" varchar
  );
  
  CREATE TABLE "lab_pages_blocks_carousel" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"width" "enum_lab_pages_blocks_carousel_width" DEFAULT 'contained',
  	"show_arrows" boolean DEFAULT false,
  	"slide_size" "enum_lab_pages_blocks_carousel_slide_size" DEFAULT 'full',
  	"block_name" varchar
  );
  
  CREATE TABLE "_lab_pages_v_blocks_carousel_slides" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"caption" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_lab_pages_v_blocks_carousel" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"width" "enum__lab_pages_v_blocks_carousel_width" DEFAULT 'contained',
  	"show_arrows" boolean DEFAULT false,
  	"slide_size" "enum__lab_pages_v_blocks_carousel_slide_size" DEFAULT 'full',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "expertise_pages_blocks_carousel_slides" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"caption" varchar
  );
  
  CREATE TABLE "expertise_pages_blocks_carousel" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"width" "enum_expertise_pages_blocks_carousel_width" DEFAULT 'contained',
  	"show_arrows" boolean DEFAULT false,
  	"slide_size" "enum_expertise_pages_blocks_carousel_slide_size" DEFAULT 'full',
  	"block_name" varchar
  );
  
  CREATE TABLE "_expertise_pages_v_blocks_carousel_slides" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"caption" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_expertise_pages_v_blocks_carousel" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"width" "enum__expertise_pages_v_blocks_carousel_width" DEFAULT 'contained',
  	"show_arrows" boolean DEFAULT false,
  	"slide_size" "enum__expertise_pages_v_blocks_carousel_slide_size" DEFAULT 'full',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "audience_pages_blocks_carousel_slides" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"caption" varchar
  );
  
  CREATE TABLE "audience_pages_blocks_carousel" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"width" "enum_audience_pages_blocks_carousel_width" DEFAULT 'contained',
  	"show_arrows" boolean DEFAULT false,
  	"slide_size" "enum_audience_pages_blocks_carousel_slide_size" DEFAULT 'full',
  	"block_name" varchar
  );
  
  CREATE TABLE "_audience_pages_v_blocks_carousel_slides" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"caption" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_audience_pages_v_blocks_carousel" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"width" "enum__audience_pages_v_blocks_carousel_width" DEFAULT 'contained',
  	"show_arrows" boolean DEFAULT false,
  	"slide_size" "enum__audience_pages_v_blocks_carousel_slide_size" DEFAULT 'full',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "pages_full_media" ADD COLUMN "width" "enum_pages_full_media_width" DEFAULT 'full-width';
  ALTER TABLE "pages_full_media" ADD COLUMN "aspect_ratio" "enum_pages_full_media_aspect_ratio" DEFAULT '16-9';
  ALTER TABLE "__pages_v_full_media_v" ADD COLUMN "width" "enum___pages_v_full_media_v_width" DEFAULT 'full-width';
  ALTER TABLE "__pages_v_full_media_v" ADD COLUMN "aspect_ratio" "enum___pages_v_full_media_v_aspect_ratio" DEFAULT '16-9';
  ALTER TABLE "work_pages_full_media" ADD COLUMN "width" "enum_work_pages_full_media_width" DEFAULT 'full-width';
  ALTER TABLE "work_pages_full_media" ADD COLUMN "aspect_ratio" "enum_work_pages_full_media_aspect_ratio" DEFAULT '16-9';
  ALTER TABLE "__work_pages_v_full_media_v" ADD COLUMN "width" "enum___work_pages_v_full_media_v_width" DEFAULT 'full-width';
  ALTER TABLE "__work_pages_v_full_media_v" ADD COLUMN "aspect_ratio" "enum___work_pages_v_full_media_v_aspect_ratio" DEFAULT '16-9';
  ALTER TABLE "home_full_media" ADD COLUMN "width" "enum_home_full_media_width" DEFAULT 'full-width';
  ALTER TABLE "home_full_media" ADD COLUMN "aspect_ratio" "enum_home_full_media_aspect_ratio" DEFAULT '16-9';
  ALTER TABLE "__home_v_full_media_v" ADD COLUMN "width" "enum___home_v_full_media_v_width" DEFAULT 'full-width';
  ALTER TABLE "__home_v_full_media_v" ADD COLUMN "aspect_ratio" "enum___home_v_full_media_v_aspect_ratio" DEFAULT '16-9';
  ALTER TABLE "work_pages_blocks_carousel_slides" ADD CONSTRAINT "work_pages_blocks_carousel_slides_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "work_pages_blocks_carousel_slides" ADD CONSTRAINT "work_pages_blocks_carousel_slides_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."work_pages_blocks_carousel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "work_pages_blocks_carousel" ADD CONSTRAINT "work_pages_blocks_carousel_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."work_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_work_pages_v_blocks_carousel_slides" ADD CONSTRAINT "_work_pages_v_blocks_carousel_slides_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_work_pages_v_blocks_carousel_slides" ADD CONSTRAINT "_work_pages_v_blocks_carousel_slides_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_work_pages_v_blocks_carousel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_work_pages_v_blocks_carousel" ADD CONSTRAINT "_work_pages_v_blocks_carousel_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_work_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lab_pages_blocks_carousel_slides" ADD CONSTRAINT "lab_pages_blocks_carousel_slides_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "lab_pages_blocks_carousel_slides" ADD CONSTRAINT "lab_pages_blocks_carousel_slides_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lab_pages_blocks_carousel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lab_pages_blocks_carousel" ADD CONSTRAINT "lab_pages_blocks_carousel_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lab_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_lab_pages_v_blocks_carousel_slides" ADD CONSTRAINT "_lab_pages_v_blocks_carousel_slides_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_lab_pages_v_blocks_carousel_slides" ADD CONSTRAINT "_lab_pages_v_blocks_carousel_slides_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_lab_pages_v_blocks_carousel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_lab_pages_v_blocks_carousel" ADD CONSTRAINT "_lab_pages_v_blocks_carousel_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_lab_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "expertise_pages_blocks_carousel_slides" ADD CONSTRAINT "expertise_pages_blocks_carousel_slides_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "expertise_pages_blocks_carousel_slides" ADD CONSTRAINT "expertise_pages_blocks_carousel_slides_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."expertise_pages_blocks_carousel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "expertise_pages_blocks_carousel" ADD CONSTRAINT "expertise_pages_blocks_carousel_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."expertise_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_expertise_pages_v_blocks_carousel_slides" ADD CONSTRAINT "_expertise_pages_v_blocks_carousel_slides_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_expertise_pages_v_blocks_carousel_slides" ADD CONSTRAINT "_expertise_pages_v_blocks_carousel_slides_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_expertise_pages_v_blocks_carousel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_expertise_pages_v_blocks_carousel" ADD CONSTRAINT "_expertise_pages_v_blocks_carousel_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_expertise_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "audience_pages_blocks_carousel_slides" ADD CONSTRAINT "audience_pages_blocks_carousel_slides_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "audience_pages_blocks_carousel_slides" ADD CONSTRAINT "audience_pages_blocks_carousel_slides_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."audience_pages_blocks_carousel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "audience_pages_blocks_carousel" ADD CONSTRAINT "audience_pages_blocks_carousel_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."audience_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_audience_pages_v_blocks_carousel_slides" ADD CONSTRAINT "_audience_pages_v_blocks_carousel_slides_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_audience_pages_v_blocks_carousel_slides" ADD CONSTRAINT "_audience_pages_v_blocks_carousel_slides_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_audience_pages_v_blocks_carousel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_audience_pages_v_blocks_carousel" ADD CONSTRAINT "_audience_pages_v_blocks_carousel_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_audience_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "work_pages_blocks_carousel_slides_order_idx" ON "work_pages_blocks_carousel_slides" USING btree ("_order");
  CREATE INDEX "work_pages_blocks_carousel_slides_parent_id_idx" ON "work_pages_blocks_carousel_slides" USING btree ("_parent_id");
  CREATE INDEX "work_pages_blocks_carousel_slides_media_idx" ON "work_pages_blocks_carousel_slides" USING btree ("media_id");
  CREATE INDEX "work_pages_blocks_carousel_order_idx" ON "work_pages_blocks_carousel" USING btree ("_order");
  CREATE INDEX "work_pages_blocks_carousel_parent_id_idx" ON "work_pages_blocks_carousel" USING btree ("_parent_id");
  CREATE INDEX "work_pages_blocks_carousel_path_idx" ON "work_pages_blocks_carousel" USING btree ("_path");
  CREATE INDEX "_work_pages_v_blocks_carousel_slides_order_idx" ON "_work_pages_v_blocks_carousel_slides" USING btree ("_order");
  CREATE INDEX "_work_pages_v_blocks_carousel_slides_parent_id_idx" ON "_work_pages_v_blocks_carousel_slides" USING btree ("_parent_id");
  CREATE INDEX "_work_pages_v_blocks_carousel_slides_media_idx" ON "_work_pages_v_blocks_carousel_slides" USING btree ("media_id");
  CREATE INDEX "_work_pages_v_blocks_carousel_order_idx" ON "_work_pages_v_blocks_carousel" USING btree ("_order");
  CREATE INDEX "_work_pages_v_blocks_carousel_parent_id_idx" ON "_work_pages_v_blocks_carousel" USING btree ("_parent_id");
  CREATE INDEX "_work_pages_v_blocks_carousel_path_idx" ON "_work_pages_v_blocks_carousel" USING btree ("_path");
  CREATE INDEX "lab_pages_blocks_carousel_slides_order_idx" ON "lab_pages_blocks_carousel_slides" USING btree ("_order");
  CREATE INDEX "lab_pages_blocks_carousel_slides_parent_id_idx" ON "lab_pages_blocks_carousel_slides" USING btree ("_parent_id");
  CREATE INDEX "lab_pages_blocks_carousel_slides_media_idx" ON "lab_pages_blocks_carousel_slides" USING btree ("media_id");
  CREATE INDEX "lab_pages_blocks_carousel_order_idx" ON "lab_pages_blocks_carousel" USING btree ("_order");
  CREATE INDEX "lab_pages_blocks_carousel_parent_id_idx" ON "lab_pages_blocks_carousel" USING btree ("_parent_id");
  CREATE INDEX "lab_pages_blocks_carousel_path_idx" ON "lab_pages_blocks_carousel" USING btree ("_path");
  CREATE INDEX "_lab_pages_v_blocks_carousel_slides_order_idx" ON "_lab_pages_v_blocks_carousel_slides" USING btree ("_order");
  CREATE INDEX "_lab_pages_v_blocks_carousel_slides_parent_id_idx" ON "_lab_pages_v_blocks_carousel_slides" USING btree ("_parent_id");
  CREATE INDEX "_lab_pages_v_blocks_carousel_slides_media_idx" ON "_lab_pages_v_blocks_carousel_slides" USING btree ("media_id");
  CREATE INDEX "_lab_pages_v_blocks_carousel_order_idx" ON "_lab_pages_v_blocks_carousel" USING btree ("_order");
  CREATE INDEX "_lab_pages_v_blocks_carousel_parent_id_idx" ON "_lab_pages_v_blocks_carousel" USING btree ("_parent_id");
  CREATE INDEX "_lab_pages_v_blocks_carousel_path_idx" ON "_lab_pages_v_blocks_carousel" USING btree ("_path");
  CREATE INDEX "expertise_pages_blocks_carousel_slides_order_idx" ON "expertise_pages_blocks_carousel_slides" USING btree ("_order");
  CREATE INDEX "expertise_pages_blocks_carousel_slides_parent_id_idx" ON "expertise_pages_blocks_carousel_slides" USING btree ("_parent_id");
  CREATE INDEX "expertise_pages_blocks_carousel_slides_media_idx" ON "expertise_pages_blocks_carousel_slides" USING btree ("media_id");
  CREATE INDEX "expertise_pages_blocks_carousel_order_idx" ON "expertise_pages_blocks_carousel" USING btree ("_order");
  CREATE INDEX "expertise_pages_blocks_carousel_parent_id_idx" ON "expertise_pages_blocks_carousel" USING btree ("_parent_id");
  CREATE INDEX "expertise_pages_blocks_carousel_path_idx" ON "expertise_pages_blocks_carousel" USING btree ("_path");
  CREATE INDEX "_expertise_pages_v_blocks_carousel_slides_order_idx" ON "_expertise_pages_v_blocks_carousel_slides" USING btree ("_order");
  CREATE INDEX "_expertise_pages_v_blocks_carousel_slides_parent_id_idx" ON "_expertise_pages_v_blocks_carousel_slides" USING btree ("_parent_id");
  CREATE INDEX "_expertise_pages_v_blocks_carousel_slides_media_idx" ON "_expertise_pages_v_blocks_carousel_slides" USING btree ("media_id");
  CREATE INDEX "_expertise_pages_v_blocks_carousel_order_idx" ON "_expertise_pages_v_blocks_carousel" USING btree ("_order");
  CREATE INDEX "_expertise_pages_v_blocks_carousel_parent_id_idx" ON "_expertise_pages_v_blocks_carousel" USING btree ("_parent_id");
  CREATE INDEX "_expertise_pages_v_blocks_carousel_path_idx" ON "_expertise_pages_v_blocks_carousel" USING btree ("_path");
  CREATE INDEX "audience_pages_blocks_carousel_slides_order_idx" ON "audience_pages_blocks_carousel_slides" USING btree ("_order");
  CREATE INDEX "audience_pages_blocks_carousel_slides_parent_id_idx" ON "audience_pages_blocks_carousel_slides" USING btree ("_parent_id");
  CREATE INDEX "audience_pages_blocks_carousel_slides_media_idx" ON "audience_pages_blocks_carousel_slides" USING btree ("media_id");
  CREATE INDEX "audience_pages_blocks_carousel_order_idx" ON "audience_pages_blocks_carousel" USING btree ("_order");
  CREATE INDEX "audience_pages_blocks_carousel_parent_id_idx" ON "audience_pages_blocks_carousel" USING btree ("_parent_id");
  CREATE INDEX "audience_pages_blocks_carousel_path_idx" ON "audience_pages_blocks_carousel" USING btree ("_path");
  CREATE INDEX "_audience_pages_v_blocks_carousel_slides_order_idx" ON "_audience_pages_v_blocks_carousel_slides" USING btree ("_order");
  CREATE INDEX "_audience_pages_v_blocks_carousel_slides_parent_id_idx" ON "_audience_pages_v_blocks_carousel_slides" USING btree ("_parent_id");
  CREATE INDEX "_audience_pages_v_blocks_carousel_slides_media_idx" ON "_audience_pages_v_blocks_carousel_slides" USING btree ("media_id");
  CREATE INDEX "_audience_pages_v_blocks_carousel_order_idx" ON "_audience_pages_v_blocks_carousel" USING btree ("_order");
  CREATE INDEX "_audience_pages_v_blocks_carousel_parent_id_idx" ON "_audience_pages_v_blocks_carousel" USING btree ("_parent_id");
  CREATE INDEX "_audience_pages_v_blocks_carousel_path_idx" ON "_audience_pages_v_blocks_carousel" USING btree ("_path");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "work_pages_blocks_carousel_slides" CASCADE;
  DROP TABLE "work_pages_blocks_carousel" CASCADE;
  DROP TABLE "_work_pages_v_blocks_carousel_slides" CASCADE;
  DROP TABLE "_work_pages_v_blocks_carousel" CASCADE;
  DROP TABLE "lab_pages_blocks_carousel_slides" CASCADE;
  DROP TABLE "lab_pages_blocks_carousel" CASCADE;
  DROP TABLE "_lab_pages_v_blocks_carousel_slides" CASCADE;
  DROP TABLE "_lab_pages_v_blocks_carousel" CASCADE;
  DROP TABLE "expertise_pages_blocks_carousel_slides" CASCADE;
  DROP TABLE "expertise_pages_blocks_carousel" CASCADE;
  DROP TABLE "_expertise_pages_v_blocks_carousel_slides" CASCADE;
  DROP TABLE "_expertise_pages_v_blocks_carousel" CASCADE;
  DROP TABLE "audience_pages_blocks_carousel_slides" CASCADE;
  DROP TABLE "audience_pages_blocks_carousel" CASCADE;
  DROP TABLE "_audience_pages_v_blocks_carousel_slides" CASCADE;
  DROP TABLE "_audience_pages_v_blocks_carousel" CASCADE;
  ALTER TABLE "pages_full_media" DROP COLUMN "width";
  ALTER TABLE "pages_full_media" DROP COLUMN "aspect_ratio";
  ALTER TABLE "__pages_v_full_media_v" DROP COLUMN "width";
  ALTER TABLE "__pages_v_full_media_v" DROP COLUMN "aspect_ratio";
  ALTER TABLE "work_pages_full_media" DROP COLUMN "width";
  ALTER TABLE "work_pages_full_media" DROP COLUMN "aspect_ratio";
  ALTER TABLE "__work_pages_v_full_media_v" DROP COLUMN "width";
  ALTER TABLE "__work_pages_v_full_media_v" DROP COLUMN "aspect_ratio";
  ALTER TABLE "home_full_media" DROP COLUMN "width";
  ALTER TABLE "home_full_media" DROP COLUMN "aspect_ratio";
  ALTER TABLE "__home_v_full_media_v" DROP COLUMN "width";
  ALTER TABLE "__home_v_full_media_v" DROP COLUMN "aspect_ratio";
  DROP TYPE "public"."enum_pages_full_media_width";
  DROP TYPE "public"."enum_pages_full_media_aspect_ratio";
  DROP TYPE "public"."enum___pages_v_full_media_v_width";
  DROP TYPE "public"."enum___pages_v_full_media_v_aspect_ratio";
  DROP TYPE "public"."enum_work_pages_full_media_width";
  DROP TYPE "public"."enum_work_pages_full_media_aspect_ratio";
  DROP TYPE "public"."enum_work_pages_blocks_carousel_width";
  DROP TYPE "public"."enum_work_pages_blocks_carousel_slide_size";
  DROP TYPE "public"."enum___work_pages_v_full_media_v_width";
  DROP TYPE "public"."enum___work_pages_v_full_media_v_aspect_ratio";
  DROP TYPE "public"."enum__work_pages_v_blocks_carousel_width";
  DROP TYPE "public"."enum__work_pages_v_blocks_carousel_slide_size";
  DROP TYPE "public"."enum_lab_pages_blocks_carousel_width";
  DROP TYPE "public"."enum_lab_pages_blocks_carousel_slide_size";
  DROP TYPE "public"."enum__lab_pages_v_blocks_carousel_width";
  DROP TYPE "public"."enum__lab_pages_v_blocks_carousel_slide_size";
  DROP TYPE "public"."enum_expertise_pages_blocks_carousel_width";
  DROP TYPE "public"."enum_expertise_pages_blocks_carousel_slide_size";
  DROP TYPE "public"."enum__expertise_pages_v_blocks_carousel_width";
  DROP TYPE "public"."enum__expertise_pages_v_blocks_carousel_slide_size";
  DROP TYPE "public"."enum_audience_pages_blocks_carousel_width";
  DROP TYPE "public"."enum_audience_pages_blocks_carousel_slide_size";
  DROP TYPE "public"."enum__audience_pages_v_blocks_carousel_width";
  DROP TYPE "public"."enum__audience_pages_v_blocks_carousel_slide_size";
  DROP TYPE "public"."enum_home_full_media_width";
  DROP TYPE "public"."enum_home_full_media_aspect_ratio";
  DROP TYPE "public"."enum___home_v_full_media_v_width";
  DROP TYPE "public"."enum___home_v_full_media_v_aspect_ratio";`)
}
