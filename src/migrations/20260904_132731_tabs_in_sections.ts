import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_posts_blocks_feature_tabs_tabs_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum_posts_blocks_feature_tabs_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum__posts_v_blocks_feature_tabs_tabs_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum__posts_v_blocks_feature_tabs_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_lab_pages_blocks_feature_tabs_tabs_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum_lab_pages_blocks_feature_tabs_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum__lab_pages_v_blocks_feature_tabs_tabs_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum__lab_pages_v_blocks_feature_tabs_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TABLE "posts_blocks_feature_tabs_tabs_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "posts_blocks_feature_tabs_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"heading" varchar,
  	"source" "enum_posts_blocks_feature_tabs_tabs_source" DEFAULT 'custom',
  	"description" jsonb,
  	"subheading" varchar DEFAULT 'Included',
  	"media_id" integer,
  	"caption" varchar
  );
  
  CREATE TABLE "posts_blocks_feature_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"browse_all_media" boolean DEFAULT false,
  	"theme" "enum_posts_blocks_feature_tabs_theme" DEFAULT 'light',
  	"block_name" varchar
  );
  
  CREATE TABLE "_posts_v_blocks_feature_tabs_tabs_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_posts_v_blocks_feature_tabs_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"heading" varchar,
  	"source" "enum__posts_v_blocks_feature_tabs_tabs_source" DEFAULT 'custom',
  	"description" jsonb,
  	"subheading" varchar DEFAULT 'Included',
  	"media_id" integer,
  	"caption" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_posts_v_blocks_feature_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"browse_all_media" boolean DEFAULT false,
  	"theme" "enum__posts_v_blocks_feature_tabs_theme" DEFAULT 'light',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "lab_pages_blocks_feature_tabs_tabs_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "lab_pages_blocks_feature_tabs_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"heading" varchar,
  	"source" "enum_lab_pages_blocks_feature_tabs_tabs_source" DEFAULT 'custom',
  	"description" jsonb,
  	"subheading" varchar DEFAULT 'Included',
  	"media_id" integer,
  	"caption" varchar
  );
  
  CREATE TABLE "lab_pages_blocks_feature_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"browse_all_media" boolean DEFAULT false,
  	"theme" "enum_lab_pages_blocks_feature_tabs_theme" DEFAULT 'light',
  	"block_name" varchar
  );
  
  CREATE TABLE "_lab_pages_v_blocks_feature_tabs_tabs_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_lab_pages_v_blocks_feature_tabs_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"heading" varchar,
  	"source" "enum__lab_pages_v_blocks_feature_tabs_tabs_source" DEFAULT 'custom',
  	"description" jsonb,
  	"subheading" varchar DEFAULT 'Included',
  	"media_id" integer,
  	"caption" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_lab_pages_v_blocks_feature_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"browse_all_media" boolean DEFAULT false,
  	"theme" "enum__lab_pages_v_blocks_feature_tabs_theme" DEFAULT 'light',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "posts_blocks_feature_tabs_tabs_items" ADD CONSTRAINT "posts_blocks_feature_tabs_tabs_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts_blocks_feature_tabs_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_feature_tabs_tabs" ADD CONSTRAINT "posts_blocks_feature_tabs_tabs_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_feature_tabs_tabs" ADD CONSTRAINT "posts_blocks_feature_tabs_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts_blocks_feature_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_feature_tabs" ADD CONSTRAINT "posts_blocks_feature_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_feature_tabs_tabs_items" ADD CONSTRAINT "_posts_v_blocks_feature_tabs_tabs_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v_blocks_feature_tabs_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_feature_tabs_tabs" ADD CONSTRAINT "_posts_v_blocks_feature_tabs_tabs_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_feature_tabs_tabs" ADD CONSTRAINT "_posts_v_blocks_feature_tabs_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v_blocks_feature_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_feature_tabs" ADD CONSTRAINT "_posts_v_blocks_feature_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lab_pages_blocks_feature_tabs_tabs_items" ADD CONSTRAINT "lab_pages_blocks_feature_tabs_tabs_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lab_pages_blocks_feature_tabs_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lab_pages_blocks_feature_tabs_tabs" ADD CONSTRAINT "lab_pages_blocks_feature_tabs_tabs_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "lab_pages_blocks_feature_tabs_tabs" ADD CONSTRAINT "lab_pages_blocks_feature_tabs_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lab_pages_blocks_feature_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lab_pages_blocks_feature_tabs" ADD CONSTRAINT "lab_pages_blocks_feature_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lab_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_lab_pages_v_blocks_feature_tabs_tabs_items" ADD CONSTRAINT "_lab_pages_v_blocks_feature_tabs_tabs_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_lab_pages_v_blocks_feature_tabs_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_lab_pages_v_blocks_feature_tabs_tabs" ADD CONSTRAINT "_lab_pages_v_blocks_feature_tabs_tabs_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_lab_pages_v_blocks_feature_tabs_tabs" ADD CONSTRAINT "_lab_pages_v_blocks_feature_tabs_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_lab_pages_v_blocks_feature_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_lab_pages_v_blocks_feature_tabs" ADD CONSTRAINT "_lab_pages_v_blocks_feature_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_lab_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "posts_blocks_feature_tabs_tabs_items_order_idx" ON "posts_blocks_feature_tabs_tabs_items" USING btree ("_order");
  CREATE INDEX "posts_blocks_feature_tabs_tabs_items_parent_id_idx" ON "posts_blocks_feature_tabs_tabs_items" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_feature_tabs_tabs_order_idx" ON "posts_blocks_feature_tabs_tabs" USING btree ("_order");
  CREATE INDEX "posts_blocks_feature_tabs_tabs_parent_id_idx" ON "posts_blocks_feature_tabs_tabs" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_feature_tabs_tabs_media_idx" ON "posts_blocks_feature_tabs_tabs" USING btree ("media_id");
  CREATE INDEX "posts_blocks_feature_tabs_order_idx" ON "posts_blocks_feature_tabs" USING btree ("_order");
  CREATE INDEX "posts_blocks_feature_tabs_parent_id_idx" ON "posts_blocks_feature_tabs" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_feature_tabs_path_idx" ON "posts_blocks_feature_tabs" USING btree ("_path");
  CREATE INDEX "_posts_v_blocks_feature_tabs_tabs_items_order_idx" ON "_posts_v_blocks_feature_tabs_tabs_items" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_feature_tabs_tabs_items_parent_id_idx" ON "_posts_v_blocks_feature_tabs_tabs_items" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_feature_tabs_tabs_order_idx" ON "_posts_v_blocks_feature_tabs_tabs" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_feature_tabs_tabs_parent_id_idx" ON "_posts_v_blocks_feature_tabs_tabs" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_feature_tabs_tabs_media_idx" ON "_posts_v_blocks_feature_tabs_tabs" USING btree ("media_id");
  CREATE INDEX "_posts_v_blocks_feature_tabs_order_idx" ON "_posts_v_blocks_feature_tabs" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_feature_tabs_parent_id_idx" ON "_posts_v_blocks_feature_tabs" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_feature_tabs_path_idx" ON "_posts_v_blocks_feature_tabs" USING btree ("_path");
  CREATE INDEX "lab_pages_blocks_feature_tabs_tabs_items_order_idx" ON "lab_pages_blocks_feature_tabs_tabs_items" USING btree ("_order");
  CREATE INDEX "lab_pages_blocks_feature_tabs_tabs_items_parent_id_idx" ON "lab_pages_blocks_feature_tabs_tabs_items" USING btree ("_parent_id");
  CREATE INDEX "lab_pages_blocks_feature_tabs_tabs_order_idx" ON "lab_pages_blocks_feature_tabs_tabs" USING btree ("_order");
  CREATE INDEX "lab_pages_blocks_feature_tabs_tabs_parent_id_idx" ON "lab_pages_blocks_feature_tabs_tabs" USING btree ("_parent_id");
  CREATE INDEX "lab_pages_blocks_feature_tabs_tabs_media_idx" ON "lab_pages_blocks_feature_tabs_tabs" USING btree ("media_id");
  CREATE INDEX "lab_pages_blocks_feature_tabs_order_idx" ON "lab_pages_blocks_feature_tabs" USING btree ("_order");
  CREATE INDEX "lab_pages_blocks_feature_tabs_parent_id_idx" ON "lab_pages_blocks_feature_tabs" USING btree ("_parent_id");
  CREATE INDEX "lab_pages_blocks_feature_tabs_path_idx" ON "lab_pages_blocks_feature_tabs" USING btree ("_path");
  CREATE INDEX "_lab_pages_v_blocks_feature_tabs_tabs_items_order_idx" ON "_lab_pages_v_blocks_feature_tabs_tabs_items" USING btree ("_order");
  CREATE INDEX "_lab_pages_v_blocks_feature_tabs_tabs_items_parent_id_idx" ON "_lab_pages_v_blocks_feature_tabs_tabs_items" USING btree ("_parent_id");
  CREATE INDEX "_lab_pages_v_blocks_feature_tabs_tabs_order_idx" ON "_lab_pages_v_blocks_feature_tabs_tabs" USING btree ("_order");
  CREATE INDEX "_lab_pages_v_blocks_feature_tabs_tabs_parent_id_idx" ON "_lab_pages_v_blocks_feature_tabs_tabs" USING btree ("_parent_id");
  CREATE INDEX "_lab_pages_v_blocks_feature_tabs_tabs_media_idx" ON "_lab_pages_v_blocks_feature_tabs_tabs" USING btree ("media_id");
  CREATE INDEX "_lab_pages_v_blocks_feature_tabs_order_idx" ON "_lab_pages_v_blocks_feature_tabs" USING btree ("_order");
  CREATE INDEX "_lab_pages_v_blocks_feature_tabs_parent_id_idx" ON "_lab_pages_v_blocks_feature_tabs" USING btree ("_parent_id");
  CREATE INDEX "_lab_pages_v_blocks_feature_tabs_path_idx" ON "_lab_pages_v_blocks_feature_tabs" USING btree ("_path");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "posts_blocks_feature_tabs_tabs_items" CASCADE;
  DROP TABLE "posts_blocks_feature_tabs_tabs" CASCADE;
  DROP TABLE "posts_blocks_feature_tabs" CASCADE;
  DROP TABLE "_posts_v_blocks_feature_tabs_tabs_items" CASCADE;
  DROP TABLE "_posts_v_blocks_feature_tabs_tabs" CASCADE;
  DROP TABLE "_posts_v_blocks_feature_tabs" CASCADE;
  DROP TABLE "lab_pages_blocks_feature_tabs_tabs_items" CASCADE;
  DROP TABLE "lab_pages_blocks_feature_tabs_tabs" CASCADE;
  DROP TABLE "lab_pages_blocks_feature_tabs" CASCADE;
  DROP TABLE "_lab_pages_v_blocks_feature_tabs_tabs_items" CASCADE;
  DROP TABLE "_lab_pages_v_blocks_feature_tabs_tabs" CASCADE;
  DROP TABLE "_lab_pages_v_blocks_feature_tabs" CASCADE;
  DROP TYPE "public"."enum_posts_blocks_feature_tabs_tabs_source";
  DROP TYPE "public"."enum_posts_blocks_feature_tabs_theme";
  DROP TYPE "public"."enum__posts_v_blocks_feature_tabs_tabs_source";
  DROP TYPE "public"."enum__posts_v_blocks_feature_tabs_theme";
  DROP TYPE "public"."enum_lab_pages_blocks_feature_tabs_tabs_source";
  DROP TYPE "public"."enum_lab_pages_blocks_feature_tabs_theme";
  DROP TYPE "public"."enum__lab_pages_v_blocks_feature_tabs_tabs_source";
  DROP TYPE "public"."enum__lab_pages_v_blocks_feature_tabs_theme";`)
}
