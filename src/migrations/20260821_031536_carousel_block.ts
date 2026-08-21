import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_carousel_width" AS ENUM('contained', 'full-width');
  CREATE TYPE "public"."enum_pages_blocks_carousel_slide_size" AS ENUM('full', 'half', 'third');
  CREATE TYPE "public"."enum__pages_v_blocks_carousel_width" AS ENUM('contained', 'full-width');
  CREATE TYPE "public"."enum__pages_v_blocks_carousel_slide_size" AS ENUM('full', 'half', 'third');
  CREATE TYPE "public"."enum_home_blocks_carousel_width" AS ENUM('contained', 'full-width');
  CREATE TYPE "public"."enum_home_blocks_carousel_slide_size" AS ENUM('full', 'half', 'third');
  CREATE TYPE "public"."enum__home_v_blocks_carousel_width" AS ENUM('contained', 'full-width');
  CREATE TYPE "public"."enum__home_v_blocks_carousel_slide_size" AS ENUM('full', 'half', 'third');
  CREATE TABLE "pages_blocks_carousel_slides" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"caption" varchar
  );
  
  CREATE TABLE "pages_blocks_carousel" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"width" "enum_pages_blocks_carousel_width" DEFAULT 'contained',
  	"show_arrows" boolean DEFAULT false,
  	"slide_size" "enum_pages_blocks_carousel_slide_size" DEFAULT 'full',
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_carousel_slides" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"caption" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_carousel" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"width" "enum__pages_v_blocks_carousel_width" DEFAULT 'contained',
  	"show_arrows" boolean DEFAULT false,
  	"slide_size" "enum__pages_v_blocks_carousel_slide_size" DEFAULT 'full',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "home_blocks_carousel_slides" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"caption" varchar
  );
  
  CREATE TABLE "home_blocks_carousel" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"width" "enum_home_blocks_carousel_width" DEFAULT 'contained',
  	"show_arrows" boolean DEFAULT false,
  	"slide_size" "enum_home_blocks_carousel_slide_size" DEFAULT 'full',
  	"block_name" varchar
  );
  
  CREATE TABLE "_home_v_blocks_carousel_slides" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"caption" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_home_v_blocks_carousel" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"width" "enum__home_v_blocks_carousel_width" DEFAULT 'contained',
  	"show_arrows" boolean DEFAULT false,
  	"slide_size" "enum__home_v_blocks_carousel_slide_size" DEFAULT 'full',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "pages_blocks_carousel_slides" ADD CONSTRAINT "pages_blocks_carousel_slides_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_carousel_slides" ADD CONSTRAINT "pages_blocks_carousel_slides_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_carousel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_carousel" ADD CONSTRAINT "pages_blocks_carousel_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_carousel_slides" ADD CONSTRAINT "_pages_v_blocks_carousel_slides_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_carousel_slides" ADD CONSTRAINT "_pages_v_blocks_carousel_slides_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_carousel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_carousel" ADD CONSTRAINT "_pages_v_blocks_carousel_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_blocks_carousel_slides" ADD CONSTRAINT "home_blocks_carousel_slides_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_blocks_carousel_slides" ADD CONSTRAINT "home_blocks_carousel_slides_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_blocks_carousel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_blocks_carousel" ADD CONSTRAINT "home_blocks_carousel_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_blocks_carousel_slides" ADD CONSTRAINT "_home_v_blocks_carousel_slides_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_home_v_blocks_carousel_slides" ADD CONSTRAINT "_home_v_blocks_carousel_slides_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v_blocks_carousel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_blocks_carousel" ADD CONSTRAINT "_home_v_blocks_carousel_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_carousel_slides_order_idx" ON "pages_blocks_carousel_slides" USING btree ("_order");
  CREATE INDEX "pages_blocks_carousel_slides_parent_id_idx" ON "pages_blocks_carousel_slides" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_carousel_slides_media_idx" ON "pages_blocks_carousel_slides" USING btree ("media_id");
  CREATE INDEX "pages_blocks_carousel_order_idx" ON "pages_blocks_carousel" USING btree ("_order");
  CREATE INDEX "pages_blocks_carousel_parent_id_idx" ON "pages_blocks_carousel" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_carousel_path_idx" ON "pages_blocks_carousel" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_carousel_slides_order_idx" ON "_pages_v_blocks_carousel_slides" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_carousel_slides_parent_id_idx" ON "_pages_v_blocks_carousel_slides" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_carousel_slides_media_idx" ON "_pages_v_blocks_carousel_slides" USING btree ("media_id");
  CREATE INDEX "_pages_v_blocks_carousel_order_idx" ON "_pages_v_blocks_carousel" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_carousel_parent_id_idx" ON "_pages_v_blocks_carousel" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_carousel_path_idx" ON "_pages_v_blocks_carousel" USING btree ("_path");
  CREATE INDEX "home_blocks_carousel_slides_order_idx" ON "home_blocks_carousel_slides" USING btree ("_order");
  CREATE INDEX "home_blocks_carousel_slides_parent_id_idx" ON "home_blocks_carousel_slides" USING btree ("_parent_id");
  CREATE INDEX "home_blocks_carousel_slides_media_idx" ON "home_blocks_carousel_slides" USING btree ("media_id");
  CREATE INDEX "home_blocks_carousel_order_idx" ON "home_blocks_carousel" USING btree ("_order");
  CREATE INDEX "home_blocks_carousel_parent_id_idx" ON "home_blocks_carousel" USING btree ("_parent_id");
  CREATE INDEX "home_blocks_carousel_path_idx" ON "home_blocks_carousel" USING btree ("_path");
  CREATE INDEX "_home_v_blocks_carousel_slides_order_idx" ON "_home_v_blocks_carousel_slides" USING btree ("_order");
  CREATE INDEX "_home_v_blocks_carousel_slides_parent_id_idx" ON "_home_v_blocks_carousel_slides" USING btree ("_parent_id");
  CREATE INDEX "_home_v_blocks_carousel_slides_media_idx" ON "_home_v_blocks_carousel_slides" USING btree ("media_id");
  CREATE INDEX "_home_v_blocks_carousel_order_idx" ON "_home_v_blocks_carousel" USING btree ("_order");
  CREATE INDEX "_home_v_blocks_carousel_parent_id_idx" ON "_home_v_blocks_carousel" USING btree ("_parent_id");
  CREATE INDEX "_home_v_blocks_carousel_path_idx" ON "_home_v_blocks_carousel" USING btree ("_path");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_blocks_carousel_slides" CASCADE;
  DROP TABLE "pages_blocks_carousel" CASCADE;
  DROP TABLE "_pages_v_blocks_carousel_slides" CASCADE;
  DROP TABLE "_pages_v_blocks_carousel" CASCADE;
  DROP TABLE "home_blocks_carousel_slides" CASCADE;
  DROP TABLE "home_blocks_carousel" CASCADE;
  DROP TABLE "_home_v_blocks_carousel_slides" CASCADE;
  DROP TABLE "_home_v_blocks_carousel" CASCADE;
  DROP TYPE "public"."enum_pages_blocks_carousel_width";
  DROP TYPE "public"."enum_pages_blocks_carousel_slide_size";
  DROP TYPE "public"."enum__pages_v_blocks_carousel_width";
  DROP TYPE "public"."enum__pages_v_blocks_carousel_slide_size";
  DROP TYPE "public"."enum_home_blocks_carousel_width";
  DROP TYPE "public"."enum_home_blocks_carousel_slide_size";
  DROP TYPE "public"."enum__home_v_blocks_carousel_width";
  DROP TYPE "public"."enum__home_v_blocks_carousel_slide_size";`)
}
