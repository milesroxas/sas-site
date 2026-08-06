import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_stmt_links_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum___pages_v_stmt_links_v_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_work_pages_stmt_links_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum___work_pages_v_stmt_links_v_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_home_stmt_links_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum___home_v_stmt_links_v_links_link_type" AS ENUM('reference', 'custom');
  CREATE TABLE "pages_stmt_links_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_pages_stmt_links_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar
  );
  
  CREATE TABLE "pages_stmt_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"statement" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "__pages_v_stmt_links_v_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_type" "enum___pages_v_stmt_links_v_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "__pages_v_stmt_links_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"statement" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "work_pages_stmt_links_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_work_pages_stmt_links_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar
  );
  
  CREATE TABLE "work_pages_stmt_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"statement" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "__work_pages_v_stmt_links_v_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_type" "enum___work_pages_v_stmt_links_v_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "__work_pages_v_stmt_links_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"statement" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "home_stmt_links_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_home_stmt_links_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar
  );
  
  CREATE TABLE "home_stmt_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"statement" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "__home_v_stmt_links_v_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_type" "enum___home_v_stmt_links_v_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "__home_v_stmt_links_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"statement" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "work_pages_rels" ADD COLUMN "pages_id" integer;
  ALTER TABLE "work_pages_rels" ADD COLUMN "posts_id" integer;
  ALTER TABLE "_work_pages_v_rels" ADD COLUMN "pages_id" integer;
  ALTER TABLE "_work_pages_v_rels" ADD COLUMN "posts_id" integer;
  ALTER TABLE "pages_stmt_links_links" ADD CONSTRAINT "pages_stmt_links_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_stmt_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_stmt_links" ADD CONSTRAINT "pages_stmt_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__pages_v_stmt_links_v_links" ADD CONSTRAINT "__pages_v_stmt_links_v_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."__pages_v_stmt_links_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__pages_v_stmt_links_v" ADD CONSTRAINT "__pages_v_stmt_links_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "work_pages_stmt_links_links" ADD CONSTRAINT "work_pages_stmt_links_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."work_pages_stmt_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "work_pages_stmt_links" ADD CONSTRAINT "work_pages_stmt_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."work_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__work_pages_v_stmt_links_v_links" ADD CONSTRAINT "__work_pages_v_stmt_links_v_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."__work_pages_v_stmt_links_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__work_pages_v_stmt_links_v" ADD CONSTRAINT "__work_pages_v_stmt_links_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_work_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_stmt_links_links" ADD CONSTRAINT "home_stmt_links_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_stmt_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_stmt_links" ADD CONSTRAINT "home_stmt_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__home_v_stmt_links_v_links" ADD CONSTRAINT "__home_v_stmt_links_v_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."__home_v_stmt_links_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__home_v_stmt_links_v" ADD CONSTRAINT "__home_v_stmt_links_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_stmt_links_links_order_idx" ON "pages_stmt_links_links" USING btree ("_order");
  CREATE INDEX "pages_stmt_links_links_parent_id_idx" ON "pages_stmt_links_links" USING btree ("_parent_id");
  CREATE INDEX "pages_stmt_links_order_idx" ON "pages_stmt_links" USING btree ("_order");
  CREATE INDEX "pages_stmt_links_parent_id_idx" ON "pages_stmt_links" USING btree ("_parent_id");
  CREATE INDEX "pages_stmt_links_path_idx" ON "pages_stmt_links" USING btree ("_path");
  CREATE INDEX "__pages_v_stmt_links_v_links_order_idx" ON "__pages_v_stmt_links_v_links" USING btree ("_order");
  CREATE INDEX "__pages_v_stmt_links_v_links_parent_id_idx" ON "__pages_v_stmt_links_v_links" USING btree ("_parent_id");
  CREATE INDEX "__pages_v_stmt_links_v_order_idx" ON "__pages_v_stmt_links_v" USING btree ("_order");
  CREATE INDEX "__pages_v_stmt_links_v_parent_id_idx" ON "__pages_v_stmt_links_v" USING btree ("_parent_id");
  CREATE INDEX "__pages_v_stmt_links_v_path_idx" ON "__pages_v_stmt_links_v" USING btree ("_path");
  CREATE INDEX "work_pages_stmt_links_links_order_idx" ON "work_pages_stmt_links_links" USING btree ("_order");
  CREATE INDEX "work_pages_stmt_links_links_parent_id_idx" ON "work_pages_stmt_links_links" USING btree ("_parent_id");
  CREATE INDEX "work_pages_stmt_links_order_idx" ON "work_pages_stmt_links" USING btree ("_order");
  CREATE INDEX "work_pages_stmt_links_parent_id_idx" ON "work_pages_stmt_links" USING btree ("_parent_id");
  CREATE INDEX "work_pages_stmt_links_path_idx" ON "work_pages_stmt_links" USING btree ("_path");
  CREATE INDEX "__work_pages_v_stmt_links_v_links_order_idx" ON "__work_pages_v_stmt_links_v_links" USING btree ("_order");
  CREATE INDEX "__work_pages_v_stmt_links_v_links_parent_id_idx" ON "__work_pages_v_stmt_links_v_links" USING btree ("_parent_id");
  CREATE INDEX "__work_pages_v_stmt_links_v_order_idx" ON "__work_pages_v_stmt_links_v" USING btree ("_order");
  CREATE INDEX "__work_pages_v_stmt_links_v_parent_id_idx" ON "__work_pages_v_stmt_links_v" USING btree ("_parent_id");
  CREATE INDEX "__work_pages_v_stmt_links_v_path_idx" ON "__work_pages_v_stmt_links_v" USING btree ("_path");
  CREATE INDEX "home_stmt_links_links_order_idx" ON "home_stmt_links_links" USING btree ("_order");
  CREATE INDEX "home_stmt_links_links_parent_id_idx" ON "home_stmt_links_links" USING btree ("_parent_id");
  CREATE INDEX "home_stmt_links_order_idx" ON "home_stmt_links" USING btree ("_order");
  CREATE INDEX "home_stmt_links_parent_id_idx" ON "home_stmt_links" USING btree ("_parent_id");
  CREATE INDEX "home_stmt_links_path_idx" ON "home_stmt_links" USING btree ("_path");
  CREATE INDEX "__home_v_stmt_links_v_links_order_idx" ON "__home_v_stmt_links_v_links" USING btree ("_order");
  CREATE INDEX "__home_v_stmt_links_v_links_parent_id_idx" ON "__home_v_stmt_links_v_links" USING btree ("_parent_id");
  CREATE INDEX "__home_v_stmt_links_v_order_idx" ON "__home_v_stmt_links_v" USING btree ("_order");
  CREATE INDEX "__home_v_stmt_links_v_parent_id_idx" ON "__home_v_stmt_links_v" USING btree ("_parent_id");
  CREATE INDEX "__home_v_stmt_links_v_path_idx" ON "__home_v_stmt_links_v" USING btree ("_path");
  ALTER TABLE "work_pages_rels" ADD CONSTRAINT "work_pages_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "work_pages_rels" ADD CONSTRAINT "work_pages_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_work_pages_v_rels" ADD CONSTRAINT "_work_pages_v_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_work_pages_v_rels" ADD CONSTRAINT "_work_pages_v_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "work_pages_rels_pages_id_idx" ON "work_pages_rels" USING btree ("pages_id");
  CREATE INDEX "work_pages_rels_posts_id_idx" ON "work_pages_rels" USING btree ("posts_id");
  CREATE INDEX "_work_pages_v_rels_pages_id_idx" ON "_work_pages_v_rels" USING btree ("pages_id");
  CREATE INDEX "_work_pages_v_rels_posts_id_idx" ON "_work_pages_v_rels" USING btree ("posts_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_stmt_links_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_stmt_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__pages_v_stmt_links_v_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__pages_v_stmt_links_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "work_pages_stmt_links_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "work_pages_stmt_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__work_pages_v_stmt_links_v_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__work_pages_v_stmt_links_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_stmt_links_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_stmt_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__home_v_stmt_links_v_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__home_v_stmt_links_v" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "pages_stmt_links_links" CASCADE;
  DROP TABLE "pages_stmt_links" CASCADE;
  DROP TABLE "__pages_v_stmt_links_v_links" CASCADE;
  DROP TABLE "__pages_v_stmt_links_v" CASCADE;
  DROP TABLE "work_pages_stmt_links_links" CASCADE;
  DROP TABLE "work_pages_stmt_links" CASCADE;
  DROP TABLE "__work_pages_v_stmt_links_v_links" CASCADE;
  DROP TABLE "__work_pages_v_stmt_links_v" CASCADE;
  DROP TABLE "home_stmt_links_links" CASCADE;
  DROP TABLE "home_stmt_links" CASCADE;
  DROP TABLE "__home_v_stmt_links_v_links" CASCADE;
  DROP TABLE "__home_v_stmt_links_v" CASCADE;
  ALTER TABLE "work_pages_rels" DROP CONSTRAINT "work_pages_rels_pages_fk";
  
  ALTER TABLE "work_pages_rels" DROP CONSTRAINT "work_pages_rels_posts_fk";
  
  ALTER TABLE "_work_pages_v_rels" DROP CONSTRAINT "_work_pages_v_rels_pages_fk";
  
  ALTER TABLE "_work_pages_v_rels" DROP CONSTRAINT "_work_pages_v_rels_posts_fk";
  
  DROP INDEX "work_pages_rels_pages_id_idx";
  DROP INDEX "work_pages_rels_posts_id_idx";
  DROP INDEX "_work_pages_v_rels_pages_id_idx";
  DROP INDEX "_work_pages_v_rels_posts_id_idx";
  ALTER TABLE "work_pages_rels" DROP COLUMN "pages_id";
  ALTER TABLE "work_pages_rels" DROP COLUMN "posts_id";
  ALTER TABLE "_work_pages_v_rels" DROP COLUMN "pages_id";
  ALTER TABLE "_work_pages_v_rels" DROP COLUMN "posts_id";
  DROP TYPE "public"."enum_pages_stmt_links_links_link_type";
  DROP TYPE "public"."enum___pages_v_stmt_links_v_links_link_type";
  DROP TYPE "public"."enum_work_pages_stmt_links_links_link_type";
  DROP TYPE "public"."enum___work_pages_v_stmt_links_v_links_link_type";
  DROP TYPE "public"."enum_home_stmt_links_links_link_type";
  DROP TYPE "public"."enum___home_v_stmt_links_v_links_link_type";`)
}
