import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_work_pages_scroll_gal_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___work_pages_v_scroll_gal_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_lab_pages_scroll_gal_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___lab_pages_v_scroll_gal_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TABLE "work_pages_scroll_gal_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"mood_background" varchar,
  	"mood_blob1" varchar,
  	"mood_blob2" varchar
  );
  
  CREATE TABLE "work_pages_scroll_gal" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"browse_all_media" boolean DEFAULT false,
  	"theme" "enum_work_pages_scroll_gal_theme" DEFAULT 'dark',
  	"block_name" varchar
  );
  
  CREATE TABLE "__work_pages_v_scroll_gal_v_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"mood_background" varchar,
  	"mood_blob1" varchar,
  	"mood_blob2" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "__work_pages_v_scroll_gal_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"browse_all_media" boolean DEFAULT false,
  	"theme" "enum___work_pages_v_scroll_gal_v_theme" DEFAULT 'dark',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "lab_pages_scroll_gal_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"mood_background" varchar,
  	"mood_blob1" varchar,
  	"mood_blob2" varchar
  );
  
  CREATE TABLE "lab_pages_scroll_gal" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"browse_all_media" boolean DEFAULT false,
  	"theme" "enum_lab_pages_scroll_gal_theme" DEFAULT 'dark',
  	"block_name" varchar
  );
  
  CREATE TABLE "__lab_pages_v_scroll_gal_v_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"mood_background" varchar,
  	"mood_blob1" varchar,
  	"mood_blob2" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "__lab_pages_v_scroll_gal_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"browse_all_media" boolean DEFAULT false,
  	"theme" "enum___lab_pages_v_scroll_gal_v_theme" DEFAULT 'dark',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "work_pages_scroll_gal_items" ADD CONSTRAINT "work_pages_scroll_gal_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "work_pages_scroll_gal_items" ADD CONSTRAINT "work_pages_scroll_gal_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."work_pages_scroll_gal"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "work_pages_scroll_gal" ADD CONSTRAINT "work_pages_scroll_gal_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."work_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__work_pages_v_scroll_gal_v_items" ADD CONSTRAINT "__work_pages_v_scroll_gal_v_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__work_pages_v_scroll_gal_v_items" ADD CONSTRAINT "__work_pages_v_scroll_gal_v_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."__work_pages_v_scroll_gal_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__work_pages_v_scroll_gal_v" ADD CONSTRAINT "__work_pages_v_scroll_gal_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_work_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lab_pages_scroll_gal_items" ADD CONSTRAINT "lab_pages_scroll_gal_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "lab_pages_scroll_gal_items" ADD CONSTRAINT "lab_pages_scroll_gal_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lab_pages_scroll_gal"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lab_pages_scroll_gal" ADD CONSTRAINT "lab_pages_scroll_gal_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lab_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__lab_pages_v_scroll_gal_v_items" ADD CONSTRAINT "__lab_pages_v_scroll_gal_v_items_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__lab_pages_v_scroll_gal_v_items" ADD CONSTRAINT "__lab_pages_v_scroll_gal_v_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."__lab_pages_v_scroll_gal_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__lab_pages_v_scroll_gal_v" ADD CONSTRAINT "__lab_pages_v_scroll_gal_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_lab_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "work_pages_scroll_gal_items_order_idx" ON "work_pages_scroll_gal_items" USING btree ("_order");
  CREATE INDEX "work_pages_scroll_gal_items_parent_id_idx" ON "work_pages_scroll_gal_items" USING btree ("_parent_id");
  CREATE INDEX "work_pages_scroll_gal_items_media_idx" ON "work_pages_scroll_gal_items" USING btree ("media_id");
  CREATE INDEX "work_pages_scroll_gal_order_idx" ON "work_pages_scroll_gal" USING btree ("_order");
  CREATE INDEX "work_pages_scroll_gal_parent_id_idx" ON "work_pages_scroll_gal" USING btree ("_parent_id");
  CREATE INDEX "work_pages_scroll_gal_path_idx" ON "work_pages_scroll_gal" USING btree ("_path");
  CREATE INDEX "__work_pages_v_scroll_gal_v_items_order_idx" ON "__work_pages_v_scroll_gal_v_items" USING btree ("_order");
  CREATE INDEX "__work_pages_v_scroll_gal_v_items_parent_id_idx" ON "__work_pages_v_scroll_gal_v_items" USING btree ("_parent_id");
  CREATE INDEX "__work_pages_v_scroll_gal_v_items_media_idx" ON "__work_pages_v_scroll_gal_v_items" USING btree ("media_id");
  CREATE INDEX "__work_pages_v_scroll_gal_v_order_idx" ON "__work_pages_v_scroll_gal_v" USING btree ("_order");
  CREATE INDEX "__work_pages_v_scroll_gal_v_parent_id_idx" ON "__work_pages_v_scroll_gal_v" USING btree ("_parent_id");
  CREATE INDEX "__work_pages_v_scroll_gal_v_path_idx" ON "__work_pages_v_scroll_gal_v" USING btree ("_path");
  CREATE INDEX "lab_pages_scroll_gal_items_order_idx" ON "lab_pages_scroll_gal_items" USING btree ("_order");
  CREATE INDEX "lab_pages_scroll_gal_items_parent_id_idx" ON "lab_pages_scroll_gal_items" USING btree ("_parent_id");
  CREATE INDEX "lab_pages_scroll_gal_items_media_idx" ON "lab_pages_scroll_gal_items" USING btree ("media_id");
  CREATE INDEX "lab_pages_scroll_gal_order_idx" ON "lab_pages_scroll_gal" USING btree ("_order");
  CREATE INDEX "lab_pages_scroll_gal_parent_id_idx" ON "lab_pages_scroll_gal" USING btree ("_parent_id");
  CREATE INDEX "lab_pages_scroll_gal_path_idx" ON "lab_pages_scroll_gal" USING btree ("_path");
  CREATE INDEX "__lab_pages_v_scroll_gal_v_items_order_idx" ON "__lab_pages_v_scroll_gal_v_items" USING btree ("_order");
  CREATE INDEX "__lab_pages_v_scroll_gal_v_items_parent_id_idx" ON "__lab_pages_v_scroll_gal_v_items" USING btree ("_parent_id");
  CREATE INDEX "__lab_pages_v_scroll_gal_v_items_media_idx" ON "__lab_pages_v_scroll_gal_v_items" USING btree ("media_id");
  CREATE INDEX "__lab_pages_v_scroll_gal_v_order_idx" ON "__lab_pages_v_scroll_gal_v" USING btree ("_order");
  CREATE INDEX "__lab_pages_v_scroll_gal_v_parent_id_idx" ON "__lab_pages_v_scroll_gal_v" USING btree ("_parent_id");
  CREATE INDEX "__lab_pages_v_scroll_gal_v_path_idx" ON "__lab_pages_v_scroll_gal_v" USING btree ("_path");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "work_pages_scroll_gal_items" CASCADE;
  DROP TABLE "work_pages_scroll_gal" CASCADE;
  DROP TABLE "__work_pages_v_scroll_gal_v_items" CASCADE;
  DROP TABLE "__work_pages_v_scroll_gal_v" CASCADE;
  DROP TABLE "lab_pages_scroll_gal_items" CASCADE;
  DROP TABLE "lab_pages_scroll_gal" CASCADE;
  DROP TABLE "__lab_pages_v_scroll_gal_v_items" CASCADE;
  DROP TABLE "__lab_pages_v_scroll_gal_v" CASCADE;
  DROP TYPE "public"."enum_work_pages_scroll_gal_theme";
  DROP TYPE "public"."enum___work_pages_v_scroll_gal_v_theme";
  DROP TYPE "public"."enum_lab_pages_scroll_gal_theme";
  DROP TYPE "public"."enum___lab_pages_v_scroll_gal_v_theme";`)
}
