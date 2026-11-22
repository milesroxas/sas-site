import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_quote_banner_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum___pages_v_quote_banner_v_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum_posts_quote_banner_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum___posts_v_quote_banner_v_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum_lab_pages_quote_banner_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum___lab_pages_v_quote_banner_v_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum_expertise_pages_quote_banner_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum___expertise_pages_v_quote_banner_v_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum_audience_pages_quote_banner_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum___audience_pages_v_quote_banner_v_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum_home_quote_banner_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum___home_v_quote_banner_v_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TABLE "pages_quote_banner" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"theme" "enum_pages_quote_banner_theme" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "__pages_v_quote_banner_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"theme" "enum___pages_v_quote_banner_v_theme" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "posts_quote_banner" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"theme" "enum_posts_quote_banner_theme" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "__posts_v_quote_banner_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"theme" "enum___posts_v_quote_banner_v_theme" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "lab_pages_quote_banner" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"theme" "enum_lab_pages_quote_banner_theme" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "__lab_pages_v_quote_banner_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"theme" "enum___lab_pages_v_quote_banner_v_theme" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "expertise_pages_quote_banner" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"theme" "enum_expertise_pages_quote_banner_theme" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "__expertise_pages_v_quote_banner_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"theme" "enum___expertise_pages_v_quote_banner_v_theme" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "audience_pages_quote_banner" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"theme" "enum_audience_pages_quote_banner_theme" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "__audience_pages_v_quote_banner_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"theme" "enum___audience_pages_v_quote_banner_v_theme" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "home_quote_banner" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"theme" "enum_home_quote_banner_theme" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "__home_v_quote_banner_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"theme" "enum___home_v_quote_banner_v_theme" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "posts_rels" ADD COLUMN "testimonials_id" integer;
  ALTER TABLE "_posts_v_rels" ADD COLUMN "testimonials_id" integer;
  ALTER TABLE "lab_pages_rels" ADD COLUMN "testimonials_id" integer;
  ALTER TABLE "_lab_pages_v_rels" ADD COLUMN "testimonials_id" integer;
  ALTER TABLE "expertise_pages_rels" ADD COLUMN "testimonials_id" integer;
  ALTER TABLE "_expertise_pages_v_rels" ADD COLUMN "testimonials_id" integer;
  ALTER TABLE "audience_pages_rels" ADD COLUMN "testimonials_id" integer;
  ALTER TABLE "_audience_pages_v_rels" ADD COLUMN "testimonials_id" integer;
  ALTER TABLE "pages_quote_banner" ADD CONSTRAINT "pages_quote_banner_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__pages_v_quote_banner_v" ADD CONSTRAINT "__pages_v_quote_banner_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_quote_banner" ADD CONSTRAINT "posts_quote_banner_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__posts_v_quote_banner_v" ADD CONSTRAINT "__posts_v_quote_banner_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lab_pages_quote_banner" ADD CONSTRAINT "lab_pages_quote_banner_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lab_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__lab_pages_v_quote_banner_v" ADD CONSTRAINT "__lab_pages_v_quote_banner_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_lab_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "expertise_pages_quote_banner" ADD CONSTRAINT "expertise_pages_quote_banner_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."expertise_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__expertise_pages_v_quote_banner_v" ADD CONSTRAINT "__expertise_pages_v_quote_banner_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_expertise_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "audience_pages_quote_banner" ADD CONSTRAINT "audience_pages_quote_banner_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."audience_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__audience_pages_v_quote_banner_v" ADD CONSTRAINT "__audience_pages_v_quote_banner_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_audience_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_quote_banner" ADD CONSTRAINT "home_quote_banner_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__home_v_quote_banner_v" ADD CONSTRAINT "__home_v_quote_banner_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_quote_banner_order_idx" ON "pages_quote_banner" USING btree ("_order");
  CREATE INDEX "pages_quote_banner_parent_id_idx" ON "pages_quote_banner" USING btree ("_parent_id");
  CREATE INDEX "pages_quote_banner_path_idx" ON "pages_quote_banner" USING btree ("_path");
  CREATE INDEX "__pages_v_quote_banner_v_order_idx" ON "__pages_v_quote_banner_v" USING btree ("_order");
  CREATE INDEX "__pages_v_quote_banner_v_parent_id_idx" ON "__pages_v_quote_banner_v" USING btree ("_parent_id");
  CREATE INDEX "__pages_v_quote_banner_v_path_idx" ON "__pages_v_quote_banner_v" USING btree ("_path");
  CREATE INDEX "posts_quote_banner_order_idx" ON "posts_quote_banner" USING btree ("_order");
  CREATE INDEX "posts_quote_banner_parent_id_idx" ON "posts_quote_banner" USING btree ("_parent_id");
  CREATE INDEX "posts_quote_banner_path_idx" ON "posts_quote_banner" USING btree ("_path");
  CREATE INDEX "__posts_v_quote_banner_v_order_idx" ON "__posts_v_quote_banner_v" USING btree ("_order");
  CREATE INDEX "__posts_v_quote_banner_v_parent_id_idx" ON "__posts_v_quote_banner_v" USING btree ("_parent_id");
  CREATE INDEX "__posts_v_quote_banner_v_path_idx" ON "__posts_v_quote_banner_v" USING btree ("_path");
  CREATE INDEX "lab_pages_quote_banner_order_idx" ON "lab_pages_quote_banner" USING btree ("_order");
  CREATE INDEX "lab_pages_quote_banner_parent_id_idx" ON "lab_pages_quote_banner" USING btree ("_parent_id");
  CREATE INDEX "lab_pages_quote_banner_path_idx" ON "lab_pages_quote_banner" USING btree ("_path");
  CREATE INDEX "__lab_pages_v_quote_banner_v_order_idx" ON "__lab_pages_v_quote_banner_v" USING btree ("_order");
  CREATE INDEX "__lab_pages_v_quote_banner_v_parent_id_idx" ON "__lab_pages_v_quote_banner_v" USING btree ("_parent_id");
  CREATE INDEX "__lab_pages_v_quote_banner_v_path_idx" ON "__lab_pages_v_quote_banner_v" USING btree ("_path");
  CREATE INDEX "expertise_pages_quote_banner_order_idx" ON "expertise_pages_quote_banner" USING btree ("_order");
  CREATE INDEX "expertise_pages_quote_banner_parent_id_idx" ON "expertise_pages_quote_banner" USING btree ("_parent_id");
  CREATE INDEX "expertise_pages_quote_banner_path_idx" ON "expertise_pages_quote_banner" USING btree ("_path");
  CREATE INDEX "__expertise_pages_v_quote_banner_v_order_idx" ON "__expertise_pages_v_quote_banner_v" USING btree ("_order");
  CREATE INDEX "__expertise_pages_v_quote_banner_v_parent_id_idx" ON "__expertise_pages_v_quote_banner_v" USING btree ("_parent_id");
  CREATE INDEX "__expertise_pages_v_quote_banner_v_path_idx" ON "__expertise_pages_v_quote_banner_v" USING btree ("_path");
  CREATE INDEX "audience_pages_quote_banner_order_idx" ON "audience_pages_quote_banner" USING btree ("_order");
  CREATE INDEX "audience_pages_quote_banner_parent_id_idx" ON "audience_pages_quote_banner" USING btree ("_parent_id");
  CREATE INDEX "audience_pages_quote_banner_path_idx" ON "audience_pages_quote_banner" USING btree ("_path");
  CREATE INDEX "__audience_pages_v_quote_banner_v_order_idx" ON "__audience_pages_v_quote_banner_v" USING btree ("_order");
  CREATE INDEX "__audience_pages_v_quote_banner_v_parent_id_idx" ON "__audience_pages_v_quote_banner_v" USING btree ("_parent_id");
  CREATE INDEX "__audience_pages_v_quote_banner_v_path_idx" ON "__audience_pages_v_quote_banner_v" USING btree ("_path");
  CREATE INDEX "home_quote_banner_order_idx" ON "home_quote_banner" USING btree ("_order");
  CREATE INDEX "home_quote_banner_parent_id_idx" ON "home_quote_banner" USING btree ("_parent_id");
  CREATE INDEX "home_quote_banner_path_idx" ON "home_quote_banner" USING btree ("_path");
  CREATE INDEX "__home_v_quote_banner_v_order_idx" ON "__home_v_quote_banner_v" USING btree ("_order");
  CREATE INDEX "__home_v_quote_banner_v_parent_id_idx" ON "__home_v_quote_banner_v" USING btree ("_parent_id");
  CREATE INDEX "__home_v_quote_banner_v_path_idx" ON "__home_v_quote_banner_v" USING btree ("_path");
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_testimonials_fk" FOREIGN KEY ("testimonials_id") REFERENCES "public"."testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_rels" ADD CONSTRAINT "_posts_v_rels_testimonials_fk" FOREIGN KEY ("testimonials_id") REFERENCES "public"."testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lab_pages_rels" ADD CONSTRAINT "lab_pages_rels_testimonials_fk" FOREIGN KEY ("testimonials_id") REFERENCES "public"."testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_lab_pages_v_rels" ADD CONSTRAINT "_lab_pages_v_rels_testimonials_fk" FOREIGN KEY ("testimonials_id") REFERENCES "public"."testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "expertise_pages_rels" ADD CONSTRAINT "expertise_pages_rels_testimonials_fk" FOREIGN KEY ("testimonials_id") REFERENCES "public"."testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_expertise_pages_v_rels" ADD CONSTRAINT "_expertise_pages_v_rels_testimonials_fk" FOREIGN KEY ("testimonials_id") REFERENCES "public"."testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "audience_pages_rels" ADD CONSTRAINT "audience_pages_rels_testimonials_fk" FOREIGN KEY ("testimonials_id") REFERENCES "public"."testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_audience_pages_v_rels" ADD CONSTRAINT "_audience_pages_v_rels_testimonials_fk" FOREIGN KEY ("testimonials_id") REFERENCES "public"."testimonials"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "posts_rels_testimonials_id_idx" ON "posts_rels" USING btree ("testimonials_id");
  CREATE INDEX "_posts_v_rels_testimonials_id_idx" ON "_posts_v_rels" USING btree ("testimonials_id");
  CREATE INDEX "lab_pages_rels_testimonials_id_idx" ON "lab_pages_rels" USING btree ("testimonials_id");
  CREATE INDEX "_lab_pages_v_rels_testimonials_id_idx" ON "_lab_pages_v_rels" USING btree ("testimonials_id");
  CREATE INDEX "expertise_pages_rels_testimonials_id_idx" ON "expertise_pages_rels" USING btree ("testimonials_id");
  CREATE INDEX "_expertise_pages_v_rels_testimonials_id_idx" ON "_expertise_pages_v_rels" USING btree ("testimonials_id");
  CREATE INDEX "audience_pages_rels_testimonials_id_idx" ON "audience_pages_rels" USING btree ("testimonials_id");
  CREATE INDEX "_audience_pages_v_rels_testimonials_id_idx" ON "_audience_pages_v_rels" USING btree ("testimonials_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_quote_banner" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__pages_v_quote_banner_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "posts_quote_banner" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__posts_v_quote_banner_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "lab_pages_quote_banner" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__lab_pages_v_quote_banner_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "expertise_pages_quote_banner" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__expertise_pages_v_quote_banner_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "audience_pages_quote_banner" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__audience_pages_v_quote_banner_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_quote_banner" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__home_v_quote_banner_v" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "pages_quote_banner" CASCADE;
  DROP TABLE "__pages_v_quote_banner_v" CASCADE;
  DROP TABLE "posts_quote_banner" CASCADE;
  DROP TABLE "__posts_v_quote_banner_v" CASCADE;
  DROP TABLE "lab_pages_quote_banner" CASCADE;
  DROP TABLE "__lab_pages_v_quote_banner_v" CASCADE;
  DROP TABLE "expertise_pages_quote_banner" CASCADE;
  DROP TABLE "__expertise_pages_v_quote_banner_v" CASCADE;
  DROP TABLE "audience_pages_quote_banner" CASCADE;
  DROP TABLE "__audience_pages_v_quote_banner_v" CASCADE;
  DROP TABLE "home_quote_banner" CASCADE;
  DROP TABLE "__home_v_quote_banner_v" CASCADE;
  ALTER TABLE "posts_rels" DROP CONSTRAINT "posts_rels_testimonials_fk";
  
  ALTER TABLE "_posts_v_rels" DROP CONSTRAINT "_posts_v_rels_testimonials_fk";
  
  ALTER TABLE "lab_pages_rels" DROP CONSTRAINT "lab_pages_rels_testimonials_fk";
  
  ALTER TABLE "_lab_pages_v_rels" DROP CONSTRAINT "_lab_pages_v_rels_testimonials_fk";
  
  ALTER TABLE "expertise_pages_rels" DROP CONSTRAINT "expertise_pages_rels_testimonials_fk";
  
  ALTER TABLE "_expertise_pages_v_rels" DROP CONSTRAINT "_expertise_pages_v_rels_testimonials_fk";
  
  ALTER TABLE "audience_pages_rels" DROP CONSTRAINT "audience_pages_rels_testimonials_fk";
  
  ALTER TABLE "_audience_pages_v_rels" DROP CONSTRAINT "_audience_pages_v_rels_testimonials_fk";
  
  DROP INDEX "posts_rels_testimonials_id_idx";
  DROP INDEX "_posts_v_rels_testimonials_id_idx";
  DROP INDEX "lab_pages_rels_testimonials_id_idx";
  DROP INDEX "_lab_pages_v_rels_testimonials_id_idx";
  DROP INDEX "expertise_pages_rels_testimonials_id_idx";
  DROP INDEX "_expertise_pages_v_rels_testimonials_id_idx";
  DROP INDEX "audience_pages_rels_testimonials_id_idx";
  DROP INDEX "_audience_pages_v_rels_testimonials_id_idx";
  ALTER TABLE "posts_rels" DROP COLUMN "testimonials_id";
  ALTER TABLE "_posts_v_rels" DROP COLUMN "testimonials_id";
  ALTER TABLE "lab_pages_rels" DROP COLUMN "testimonials_id";
  ALTER TABLE "_lab_pages_v_rels" DROP COLUMN "testimonials_id";
  ALTER TABLE "expertise_pages_rels" DROP COLUMN "testimonials_id";
  ALTER TABLE "_expertise_pages_v_rels" DROP COLUMN "testimonials_id";
  ALTER TABLE "audience_pages_rels" DROP COLUMN "testimonials_id";
  ALTER TABLE "_audience_pages_v_rels" DROP COLUMN "testimonials_id";
  DROP TYPE "public"."enum_pages_quote_banner_theme";
  DROP TYPE "public"."enum___pages_v_quote_banner_v_theme";
  DROP TYPE "public"."enum_posts_quote_banner_theme";
  DROP TYPE "public"."enum___posts_v_quote_banner_v_theme";
  DROP TYPE "public"."enum_lab_pages_quote_banner_theme";
  DROP TYPE "public"."enum___lab_pages_v_quote_banner_v_theme";
  DROP TYPE "public"."enum_expertise_pages_quote_banner_theme";
  DROP TYPE "public"."enum___expertise_pages_v_quote_banner_v_theme";
  DROP TYPE "public"."enum_audience_pages_quote_banner_theme";
  DROP TYPE "public"."enum___audience_pages_v_quote_banner_v_theme";
  DROP TYPE "public"."enum_home_quote_banner_theme";
  DROP TYPE "public"."enum___home_v_quote_banner_v_theme";`)
}
