import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_posts_blocks_content_columns_size" AS ENUM('oneThird', 'half', 'twoThirds', 'full');
  CREATE TYPE "public"."enum_posts_blocks_content_columns_link_type" AS ENUM('reference', 'site', 'custom');
  CREATE TYPE "public"."enum_posts_blocks_content_columns_link_site_page" AS ENUM('home', 'works-index', 'insights-index');
  CREATE TYPE "public"."enum_posts_blocks_content_columns_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum_posts_blocks_content_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum__posts_v_blocks_content_columns_size" AS ENUM('oneThird', 'half', 'twoThirds', 'full');
  CREATE TYPE "public"."enum__posts_v_blocks_content_columns_link_type" AS ENUM('reference', 'site', 'custom');
  CREATE TYPE "public"."enum__posts_v_blocks_content_columns_link_site_page" AS ENUM('home', 'works-index', 'insights-index');
  CREATE TYPE "public"."enum__posts_v_blocks_content_columns_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum__posts_v_blocks_content_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_work_pages_blocks_content_columns_size" AS ENUM('oneThird', 'half', 'twoThirds', 'full');
  CREATE TYPE "public"."enum_work_pages_blocks_content_columns_link_type" AS ENUM('reference', 'site', 'custom');
  CREATE TYPE "public"."enum_work_pages_blocks_content_columns_link_site_page" AS ENUM('home', 'works-index', 'insights-index');
  CREATE TYPE "public"."enum_work_pages_blocks_content_columns_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum_work_pages_blocks_content_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum__work_pages_v_blocks_content_columns_size" AS ENUM('oneThird', 'half', 'twoThirds', 'full');
  CREATE TYPE "public"."enum__work_pages_v_blocks_content_columns_link_type" AS ENUM('reference', 'site', 'custom');
  CREATE TYPE "public"."enum__work_pages_v_blocks_content_columns_link_site_page" AS ENUM('home', 'works-index', 'insights-index');
  CREATE TYPE "public"."enum__work_pages_v_blocks_content_columns_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum__work_pages_v_blocks_content_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_lab_pages_blocks_content_columns_size" AS ENUM('oneThird', 'half', 'twoThirds', 'full');
  CREATE TYPE "public"."enum_lab_pages_blocks_content_columns_link_type" AS ENUM('reference', 'site', 'custom');
  CREATE TYPE "public"."enum_lab_pages_blocks_content_columns_link_site_page" AS ENUM('home', 'works-index', 'insights-index');
  CREATE TYPE "public"."enum_lab_pages_blocks_content_columns_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum_lab_pages_blocks_content_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum__lab_pages_v_blocks_content_columns_size" AS ENUM('oneThird', 'half', 'twoThirds', 'full');
  CREATE TYPE "public"."enum__lab_pages_v_blocks_content_columns_link_type" AS ENUM('reference', 'site', 'custom');
  CREATE TYPE "public"."enum__lab_pages_v_blocks_content_columns_link_site_page" AS ENUM('home', 'works-index', 'insights-index');
  CREATE TYPE "public"."enum__lab_pages_v_blocks_content_columns_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum__lab_pages_v_blocks_content_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TABLE "posts_blocks_content_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"size" "enum_posts_blocks_content_columns_size" DEFAULT 'oneThird',
  	"rich_text" jsonb,
  	"enable_link" boolean,
  	"link_type" "enum_posts_blocks_content_columns_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_site_page" "enum_posts_blocks_content_columns_link_site_page",
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum_posts_blocks_content_columns_link_appearance" DEFAULT 'default'
  );
  
  CREATE TABLE "posts_blocks_content" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"theme" "enum_posts_blocks_content_theme" DEFAULT 'light',
  	"block_name" varchar
  );
  
  CREATE TABLE "_posts_v_blocks_content_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"size" "enum__posts_v_blocks_content_columns_size" DEFAULT 'oneThird',
  	"rich_text" jsonb,
  	"enable_link" boolean,
  	"link_type" "enum__posts_v_blocks_content_columns_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_site_page" "enum__posts_v_blocks_content_columns_link_site_page",
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum__posts_v_blocks_content_columns_link_appearance" DEFAULT 'default',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_posts_v_blocks_content" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"theme" "enum__posts_v_blocks_content_theme" DEFAULT 'light',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "work_pages_blocks_content_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"size" "enum_work_pages_blocks_content_columns_size" DEFAULT 'oneThird',
  	"rich_text" jsonb,
  	"enable_link" boolean,
  	"link_type" "enum_work_pages_blocks_content_columns_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_site_page" "enum_work_pages_blocks_content_columns_link_site_page",
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum_work_pages_blocks_content_columns_link_appearance" DEFAULT 'default'
  );
  
  CREATE TABLE "work_pages_blocks_content" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"theme" "enum_work_pages_blocks_content_theme" DEFAULT 'light',
  	"block_name" varchar
  );
  
  CREATE TABLE "_work_pages_v_blocks_content_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"size" "enum__work_pages_v_blocks_content_columns_size" DEFAULT 'oneThird',
  	"rich_text" jsonb,
  	"enable_link" boolean,
  	"link_type" "enum__work_pages_v_blocks_content_columns_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_site_page" "enum__work_pages_v_blocks_content_columns_link_site_page",
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum__work_pages_v_blocks_content_columns_link_appearance" DEFAULT 'default',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_work_pages_v_blocks_content" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"theme" "enum__work_pages_v_blocks_content_theme" DEFAULT 'light',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "lab_pages_blocks_content_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"size" "enum_lab_pages_blocks_content_columns_size" DEFAULT 'oneThird',
  	"rich_text" jsonb,
  	"enable_link" boolean,
  	"link_type" "enum_lab_pages_blocks_content_columns_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_site_page" "enum_lab_pages_blocks_content_columns_link_site_page",
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum_lab_pages_blocks_content_columns_link_appearance" DEFAULT 'default'
  );
  
  CREATE TABLE "lab_pages_blocks_content" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"theme" "enum_lab_pages_blocks_content_theme" DEFAULT 'light',
  	"block_name" varchar
  );
  
  CREATE TABLE "_lab_pages_v_blocks_content_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"size" "enum__lab_pages_v_blocks_content_columns_size" DEFAULT 'oneThird',
  	"rich_text" jsonb,
  	"enable_link" boolean,
  	"link_type" "enum__lab_pages_v_blocks_content_columns_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_site_page" "enum__lab_pages_v_blocks_content_columns_link_site_page",
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum__lab_pages_v_blocks_content_columns_link_appearance" DEFAULT 'default',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_lab_pages_v_blocks_content" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"theme" "enum__lab_pages_v_blocks_content_theme" DEFAULT 'light',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "lab_pages_rels" ADD COLUMN "pages_id" integer;
  ALTER TABLE "lab_pages_rels" ADD COLUMN "posts_id" integer;
  ALTER TABLE "lab_pages_rels" ADD COLUMN "contact_pages_id" integer;
  ALTER TABLE "_lab_pages_v_rels" ADD COLUMN "pages_id" integer;
  ALTER TABLE "_lab_pages_v_rels" ADD COLUMN "posts_id" integer;
  ALTER TABLE "_lab_pages_v_rels" ADD COLUMN "contact_pages_id" integer;
  ALTER TABLE "posts_blocks_content_columns" ADD CONSTRAINT "posts_blocks_content_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts_blocks_content"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_content" ADD CONSTRAINT "posts_blocks_content_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_content_columns" ADD CONSTRAINT "_posts_v_blocks_content_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v_blocks_content"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_content" ADD CONSTRAINT "_posts_v_blocks_content_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "work_pages_blocks_content_columns" ADD CONSTRAINT "work_pages_blocks_content_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."work_pages_blocks_content"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "work_pages_blocks_content" ADD CONSTRAINT "work_pages_blocks_content_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."work_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_work_pages_v_blocks_content_columns" ADD CONSTRAINT "_work_pages_v_blocks_content_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_work_pages_v_blocks_content"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_work_pages_v_blocks_content" ADD CONSTRAINT "_work_pages_v_blocks_content_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_work_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lab_pages_blocks_content_columns" ADD CONSTRAINT "lab_pages_blocks_content_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lab_pages_blocks_content"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lab_pages_blocks_content" ADD CONSTRAINT "lab_pages_blocks_content_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lab_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_lab_pages_v_blocks_content_columns" ADD CONSTRAINT "_lab_pages_v_blocks_content_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_lab_pages_v_blocks_content"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_lab_pages_v_blocks_content" ADD CONSTRAINT "_lab_pages_v_blocks_content_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_lab_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "posts_blocks_content_columns_order_idx" ON "posts_blocks_content_columns" USING btree ("_order");
  CREATE INDEX "posts_blocks_content_columns_parent_id_idx" ON "posts_blocks_content_columns" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_content_order_idx" ON "posts_blocks_content" USING btree ("_order");
  CREATE INDEX "posts_blocks_content_parent_id_idx" ON "posts_blocks_content" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_content_path_idx" ON "posts_blocks_content" USING btree ("_path");
  CREATE INDEX "_posts_v_blocks_content_columns_order_idx" ON "_posts_v_blocks_content_columns" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_content_columns_parent_id_idx" ON "_posts_v_blocks_content_columns" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_content_order_idx" ON "_posts_v_blocks_content" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_content_parent_id_idx" ON "_posts_v_blocks_content" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_content_path_idx" ON "_posts_v_blocks_content" USING btree ("_path");
  CREATE INDEX "work_pages_blocks_content_columns_order_idx" ON "work_pages_blocks_content_columns" USING btree ("_order");
  CREATE INDEX "work_pages_blocks_content_columns_parent_id_idx" ON "work_pages_blocks_content_columns" USING btree ("_parent_id");
  CREATE INDEX "work_pages_blocks_content_order_idx" ON "work_pages_blocks_content" USING btree ("_order");
  CREATE INDEX "work_pages_blocks_content_parent_id_idx" ON "work_pages_blocks_content" USING btree ("_parent_id");
  CREATE INDEX "work_pages_blocks_content_path_idx" ON "work_pages_blocks_content" USING btree ("_path");
  CREATE INDEX "_work_pages_v_blocks_content_columns_order_idx" ON "_work_pages_v_blocks_content_columns" USING btree ("_order");
  CREATE INDEX "_work_pages_v_blocks_content_columns_parent_id_idx" ON "_work_pages_v_blocks_content_columns" USING btree ("_parent_id");
  CREATE INDEX "_work_pages_v_blocks_content_order_idx" ON "_work_pages_v_blocks_content" USING btree ("_order");
  CREATE INDEX "_work_pages_v_blocks_content_parent_id_idx" ON "_work_pages_v_blocks_content" USING btree ("_parent_id");
  CREATE INDEX "_work_pages_v_blocks_content_path_idx" ON "_work_pages_v_blocks_content" USING btree ("_path");
  CREATE INDEX "lab_pages_blocks_content_columns_order_idx" ON "lab_pages_blocks_content_columns" USING btree ("_order");
  CREATE INDEX "lab_pages_blocks_content_columns_parent_id_idx" ON "lab_pages_blocks_content_columns" USING btree ("_parent_id");
  CREATE INDEX "lab_pages_blocks_content_order_idx" ON "lab_pages_blocks_content" USING btree ("_order");
  CREATE INDEX "lab_pages_blocks_content_parent_id_idx" ON "lab_pages_blocks_content" USING btree ("_parent_id");
  CREATE INDEX "lab_pages_blocks_content_path_idx" ON "lab_pages_blocks_content" USING btree ("_path");
  CREATE INDEX "_lab_pages_v_blocks_content_columns_order_idx" ON "_lab_pages_v_blocks_content_columns" USING btree ("_order");
  CREATE INDEX "_lab_pages_v_blocks_content_columns_parent_id_idx" ON "_lab_pages_v_blocks_content_columns" USING btree ("_parent_id");
  CREATE INDEX "_lab_pages_v_blocks_content_order_idx" ON "_lab_pages_v_blocks_content" USING btree ("_order");
  CREATE INDEX "_lab_pages_v_blocks_content_parent_id_idx" ON "_lab_pages_v_blocks_content" USING btree ("_parent_id");
  CREATE INDEX "_lab_pages_v_blocks_content_path_idx" ON "_lab_pages_v_blocks_content" USING btree ("_path");
  ALTER TABLE "lab_pages_rels" ADD CONSTRAINT "lab_pages_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lab_pages_rels" ADD CONSTRAINT "lab_pages_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lab_pages_rels" ADD CONSTRAINT "lab_pages_rels_contact_pages_fk" FOREIGN KEY ("contact_pages_id") REFERENCES "public"."contact_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_lab_pages_v_rels" ADD CONSTRAINT "_lab_pages_v_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_lab_pages_v_rels" ADD CONSTRAINT "_lab_pages_v_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_lab_pages_v_rels" ADD CONSTRAINT "_lab_pages_v_rels_contact_pages_fk" FOREIGN KEY ("contact_pages_id") REFERENCES "public"."contact_pages"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "lab_pages_rels_pages_id_idx" ON "lab_pages_rels" USING btree ("pages_id");
  CREATE INDEX "lab_pages_rels_posts_id_idx" ON "lab_pages_rels" USING btree ("posts_id");
  CREATE INDEX "lab_pages_rels_contact_pages_id_idx" ON "lab_pages_rels" USING btree ("contact_pages_id");
  CREATE INDEX "_lab_pages_v_rels_pages_id_idx" ON "_lab_pages_v_rels" USING btree ("pages_id");
  CREATE INDEX "_lab_pages_v_rels_posts_id_idx" ON "_lab_pages_v_rels" USING btree ("posts_id");
  CREATE INDEX "_lab_pages_v_rels_contact_pages_id_idx" ON "_lab_pages_v_rels" USING btree ("contact_pages_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "posts_blocks_content_columns" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "posts_blocks_content" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_posts_v_blocks_content_columns" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_posts_v_blocks_content" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "work_pages_blocks_content_columns" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "work_pages_blocks_content" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_work_pages_v_blocks_content_columns" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_work_pages_v_blocks_content" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "lab_pages_blocks_content_columns" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "lab_pages_blocks_content" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_lab_pages_v_blocks_content_columns" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_lab_pages_v_blocks_content" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "posts_blocks_content_columns" CASCADE;
  DROP TABLE "posts_blocks_content" CASCADE;
  DROP TABLE "_posts_v_blocks_content_columns" CASCADE;
  DROP TABLE "_posts_v_blocks_content" CASCADE;
  DROP TABLE "work_pages_blocks_content_columns" CASCADE;
  DROP TABLE "work_pages_blocks_content" CASCADE;
  DROP TABLE "_work_pages_v_blocks_content_columns" CASCADE;
  DROP TABLE "_work_pages_v_blocks_content" CASCADE;
  DROP TABLE "lab_pages_blocks_content_columns" CASCADE;
  DROP TABLE "lab_pages_blocks_content" CASCADE;
  DROP TABLE "_lab_pages_v_blocks_content_columns" CASCADE;
  DROP TABLE "_lab_pages_v_blocks_content" CASCADE;
  ALTER TABLE "lab_pages_rels" DROP CONSTRAINT "lab_pages_rels_pages_fk";
  
  ALTER TABLE "lab_pages_rels" DROP CONSTRAINT "lab_pages_rels_posts_fk";
  
  ALTER TABLE "lab_pages_rels" DROP CONSTRAINT "lab_pages_rels_contact_pages_fk";
  
  ALTER TABLE "_lab_pages_v_rels" DROP CONSTRAINT "_lab_pages_v_rels_pages_fk";
  
  ALTER TABLE "_lab_pages_v_rels" DROP CONSTRAINT "_lab_pages_v_rels_posts_fk";
  
  ALTER TABLE "_lab_pages_v_rels" DROP CONSTRAINT "_lab_pages_v_rels_contact_pages_fk";
  
  DROP INDEX "lab_pages_rels_pages_id_idx";
  DROP INDEX "lab_pages_rels_posts_id_idx";
  DROP INDEX "lab_pages_rels_contact_pages_id_idx";
  DROP INDEX "_lab_pages_v_rels_pages_id_idx";
  DROP INDEX "_lab_pages_v_rels_posts_id_idx";
  DROP INDEX "_lab_pages_v_rels_contact_pages_id_idx";
  ALTER TABLE "lab_pages_rels" DROP COLUMN "pages_id";
  ALTER TABLE "lab_pages_rels" DROP COLUMN "posts_id";
  ALTER TABLE "lab_pages_rels" DROP COLUMN "contact_pages_id";
  ALTER TABLE "_lab_pages_v_rels" DROP COLUMN "pages_id";
  ALTER TABLE "_lab_pages_v_rels" DROP COLUMN "posts_id";
  ALTER TABLE "_lab_pages_v_rels" DROP COLUMN "contact_pages_id";
  DROP TYPE "public"."enum_posts_blocks_content_columns_size";
  DROP TYPE "public"."enum_posts_blocks_content_columns_link_type";
  DROP TYPE "public"."enum_posts_blocks_content_columns_link_site_page";
  DROP TYPE "public"."enum_posts_blocks_content_columns_link_appearance";
  DROP TYPE "public"."enum_posts_blocks_content_theme";
  DROP TYPE "public"."enum__posts_v_blocks_content_columns_size";
  DROP TYPE "public"."enum__posts_v_blocks_content_columns_link_type";
  DROP TYPE "public"."enum__posts_v_blocks_content_columns_link_site_page";
  DROP TYPE "public"."enum__posts_v_blocks_content_columns_link_appearance";
  DROP TYPE "public"."enum__posts_v_blocks_content_theme";
  DROP TYPE "public"."enum_work_pages_blocks_content_columns_size";
  DROP TYPE "public"."enum_work_pages_blocks_content_columns_link_type";
  DROP TYPE "public"."enum_work_pages_blocks_content_columns_link_site_page";
  DROP TYPE "public"."enum_work_pages_blocks_content_columns_link_appearance";
  DROP TYPE "public"."enum_work_pages_blocks_content_theme";
  DROP TYPE "public"."enum__work_pages_v_blocks_content_columns_size";
  DROP TYPE "public"."enum__work_pages_v_blocks_content_columns_link_type";
  DROP TYPE "public"."enum__work_pages_v_blocks_content_columns_link_site_page";
  DROP TYPE "public"."enum__work_pages_v_blocks_content_columns_link_appearance";
  DROP TYPE "public"."enum__work_pages_v_blocks_content_theme";
  DROP TYPE "public"."enum_lab_pages_blocks_content_columns_size";
  DROP TYPE "public"."enum_lab_pages_blocks_content_columns_link_type";
  DROP TYPE "public"."enum_lab_pages_blocks_content_columns_link_site_page";
  DROP TYPE "public"."enum_lab_pages_blocks_content_columns_link_appearance";
  DROP TYPE "public"."enum_lab_pages_blocks_content_theme";
  DROP TYPE "public"."enum__lab_pages_v_blocks_content_columns_size";
  DROP TYPE "public"."enum__lab_pages_v_blocks_content_columns_link_type";
  DROP TYPE "public"."enum__lab_pages_v_blocks_content_columns_link_site_page";
  DROP TYPE "public"."enum__lab_pages_v_blocks_content_columns_link_appearance";
  DROP TYPE "public"."enum__lab_pages_v_blocks_content_theme";`)
}
