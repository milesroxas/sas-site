import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_dyn_aud_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___pages_v_dyn_aud_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_home_dyn_aud_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___home_v_dyn_aud_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TABLE "pages_dyn_aud_audiences_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "pages_dyn_aud_audiences" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"intro" varchar,
  	"media_id" integer
  );
  
  CREATE TABLE "pages_dyn_aud" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar DEFAULT 'How we help',
  	"subheading" varchar DEFAULT 'turn complexity into something clear, useful, and easy to act on.',
  	"theme" "enum_pages_dyn_aud_theme" DEFAULT 'dark',
  	"block_name" varchar
  );
  
  CREATE TABLE "__pages_v_dyn_aud_v_audiences_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "__pages_v_dyn_aud_v_audiences" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"intro" varchar,
  	"media_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "__pages_v_dyn_aud_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar DEFAULT 'How we help',
  	"subheading" varchar DEFAULT 'turn complexity into something clear, useful, and easy to act on.',
  	"theme" "enum___pages_v_dyn_aud_v_theme" DEFAULT 'dark',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "home_dyn_aud_audiences_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "home_dyn_aud_audiences" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"intro" varchar,
  	"media_id" integer
  );
  
  CREATE TABLE "home_dyn_aud" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar DEFAULT 'How we help',
  	"subheading" varchar DEFAULT 'turn complexity into something clear, useful, and easy to act on.',
  	"theme" "enum_home_dyn_aud_theme" DEFAULT 'dark',
  	"block_name" varchar
  );
  
  CREATE TABLE "__home_v_dyn_aud_v_audiences_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "__home_v_dyn_aud_v_audiences" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"intro" varchar,
  	"media_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "__home_v_dyn_aud_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar DEFAULT 'How we help',
  	"subheading" varchar DEFAULT 'turn complexity into something clear, useful, and easy to act on.',
  	"theme" "enum___home_v_dyn_aud_v_theme" DEFAULT 'dark',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "pages_dyn_aud_audiences_items" ADD CONSTRAINT "pages_dyn_aud_audiences_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_dyn_aud_audiences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_dyn_aud_audiences" ADD CONSTRAINT "pages_dyn_aud_audiences_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_dyn_aud_audiences" ADD CONSTRAINT "pages_dyn_aud_audiences_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_dyn_aud"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_dyn_aud" ADD CONSTRAINT "pages_dyn_aud_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__pages_v_dyn_aud_v_audiences_items" ADD CONSTRAINT "__pages_v_dyn_aud_v_audiences_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."__pages_v_dyn_aud_v_audiences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__pages_v_dyn_aud_v_audiences" ADD CONSTRAINT "__pages_v_dyn_aud_v_audiences_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__pages_v_dyn_aud_v_audiences" ADD CONSTRAINT "__pages_v_dyn_aud_v_audiences_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."__pages_v_dyn_aud_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__pages_v_dyn_aud_v" ADD CONSTRAINT "__pages_v_dyn_aud_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_dyn_aud_audiences_items" ADD CONSTRAINT "home_dyn_aud_audiences_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_dyn_aud_audiences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_dyn_aud_audiences" ADD CONSTRAINT "home_dyn_aud_audiences_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_dyn_aud_audiences" ADD CONSTRAINT "home_dyn_aud_audiences_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_dyn_aud"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_dyn_aud" ADD CONSTRAINT "home_dyn_aud_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__home_v_dyn_aud_v_audiences_items" ADD CONSTRAINT "__home_v_dyn_aud_v_audiences_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."__home_v_dyn_aud_v_audiences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__home_v_dyn_aud_v_audiences" ADD CONSTRAINT "__home_v_dyn_aud_v_audiences_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__home_v_dyn_aud_v_audiences" ADD CONSTRAINT "__home_v_dyn_aud_v_audiences_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."__home_v_dyn_aud_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__home_v_dyn_aud_v" ADD CONSTRAINT "__home_v_dyn_aud_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_dyn_aud_audiences_items_order_idx" ON "pages_dyn_aud_audiences_items" USING btree ("_order");
  CREATE INDEX "pages_dyn_aud_audiences_items_parent_id_idx" ON "pages_dyn_aud_audiences_items" USING btree ("_parent_id");
  CREATE INDEX "pages_dyn_aud_audiences_order_idx" ON "pages_dyn_aud_audiences" USING btree ("_order");
  CREATE INDEX "pages_dyn_aud_audiences_parent_id_idx" ON "pages_dyn_aud_audiences" USING btree ("_parent_id");
  CREATE INDEX "pages_dyn_aud_audiences_media_idx" ON "pages_dyn_aud_audiences" USING btree ("media_id");
  CREATE INDEX "pages_dyn_aud_order_idx" ON "pages_dyn_aud" USING btree ("_order");
  CREATE INDEX "pages_dyn_aud_parent_id_idx" ON "pages_dyn_aud" USING btree ("_parent_id");
  CREATE INDEX "pages_dyn_aud_path_idx" ON "pages_dyn_aud" USING btree ("_path");
  CREATE INDEX "__pages_v_dyn_aud_v_audiences_items_order_idx" ON "__pages_v_dyn_aud_v_audiences_items" USING btree ("_order");
  CREATE INDEX "__pages_v_dyn_aud_v_audiences_items_parent_id_idx" ON "__pages_v_dyn_aud_v_audiences_items" USING btree ("_parent_id");
  CREATE INDEX "__pages_v_dyn_aud_v_audiences_order_idx" ON "__pages_v_dyn_aud_v_audiences" USING btree ("_order");
  CREATE INDEX "__pages_v_dyn_aud_v_audiences_parent_id_idx" ON "__pages_v_dyn_aud_v_audiences" USING btree ("_parent_id");
  CREATE INDEX "__pages_v_dyn_aud_v_audiences_media_idx" ON "__pages_v_dyn_aud_v_audiences" USING btree ("media_id");
  CREATE INDEX "__pages_v_dyn_aud_v_order_idx" ON "__pages_v_dyn_aud_v" USING btree ("_order");
  CREATE INDEX "__pages_v_dyn_aud_v_parent_id_idx" ON "__pages_v_dyn_aud_v" USING btree ("_parent_id");
  CREATE INDEX "__pages_v_dyn_aud_v_path_idx" ON "__pages_v_dyn_aud_v" USING btree ("_path");
  CREATE INDEX "home_dyn_aud_audiences_items_order_idx" ON "home_dyn_aud_audiences_items" USING btree ("_order");
  CREATE INDEX "home_dyn_aud_audiences_items_parent_id_idx" ON "home_dyn_aud_audiences_items" USING btree ("_parent_id");
  CREATE INDEX "home_dyn_aud_audiences_order_idx" ON "home_dyn_aud_audiences" USING btree ("_order");
  CREATE INDEX "home_dyn_aud_audiences_parent_id_idx" ON "home_dyn_aud_audiences" USING btree ("_parent_id");
  CREATE INDEX "home_dyn_aud_audiences_media_idx" ON "home_dyn_aud_audiences" USING btree ("media_id");
  CREATE INDEX "home_dyn_aud_order_idx" ON "home_dyn_aud" USING btree ("_order");
  CREATE INDEX "home_dyn_aud_parent_id_idx" ON "home_dyn_aud" USING btree ("_parent_id");
  CREATE INDEX "home_dyn_aud_path_idx" ON "home_dyn_aud" USING btree ("_path");
  CREATE INDEX "__home_v_dyn_aud_v_audiences_items_order_idx" ON "__home_v_dyn_aud_v_audiences_items" USING btree ("_order");
  CREATE INDEX "__home_v_dyn_aud_v_audiences_items_parent_id_idx" ON "__home_v_dyn_aud_v_audiences_items" USING btree ("_parent_id");
  CREATE INDEX "__home_v_dyn_aud_v_audiences_order_idx" ON "__home_v_dyn_aud_v_audiences" USING btree ("_order");
  CREATE INDEX "__home_v_dyn_aud_v_audiences_parent_id_idx" ON "__home_v_dyn_aud_v_audiences" USING btree ("_parent_id");
  CREATE INDEX "__home_v_dyn_aud_v_audiences_media_idx" ON "__home_v_dyn_aud_v_audiences" USING btree ("media_id");
  CREATE INDEX "__home_v_dyn_aud_v_order_idx" ON "__home_v_dyn_aud_v" USING btree ("_order");
  CREATE INDEX "__home_v_dyn_aud_v_parent_id_idx" ON "__home_v_dyn_aud_v" USING btree ("_parent_id");
  CREATE INDEX "__home_v_dyn_aud_v_path_idx" ON "__home_v_dyn_aud_v" USING btree ("_path");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_dyn_aud_audiences_items" CASCADE;
  DROP TABLE "pages_dyn_aud_audiences" CASCADE;
  DROP TABLE "pages_dyn_aud" CASCADE;
  DROP TABLE "__pages_v_dyn_aud_v_audiences_items" CASCADE;
  DROP TABLE "__pages_v_dyn_aud_v_audiences" CASCADE;
  DROP TABLE "__pages_v_dyn_aud_v" CASCADE;
  DROP TABLE "home_dyn_aud_audiences_items" CASCADE;
  DROP TABLE "home_dyn_aud_audiences" CASCADE;
  DROP TABLE "home_dyn_aud" CASCADE;
  DROP TABLE "__home_v_dyn_aud_v_audiences_items" CASCADE;
  DROP TABLE "__home_v_dyn_aud_v_audiences" CASCADE;
  DROP TABLE "__home_v_dyn_aud_v" CASCADE;
  DROP TYPE "public"."enum_pages_dyn_aud_theme";
  DROP TYPE "public"."enum___pages_v_dyn_aud_v_theme";
  DROP TYPE "public"."enum_home_dyn_aud_theme";
  DROP TYPE "public"."enum___home_v_dyn_aud_v_theme";`)
}
