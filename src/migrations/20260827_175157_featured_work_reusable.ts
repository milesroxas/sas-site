import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_feat_work_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___pages_v_feat_work_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_posts_feat_work_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___posts_v_feat_work_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_work_pages_feat_work_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___work_pages_v_feat_work_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_expertise_pages_feat_work_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___expertise_pages_v_feat_work_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_audience_pages_feat_work_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___audience_pages_v_feat_work_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TABLE "pages_feat_work" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar DEFAULT 'Featured Work',
  	"theme" "enum_pages_feat_work_theme" DEFAULT 'dark',
  	"block_name" varchar
  );
  
  CREATE TABLE "__pages_v_feat_work_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar DEFAULT 'Featured Work',
  	"theme" "enum___pages_v_feat_work_v_theme" DEFAULT 'dark',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "posts_feat_work" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar DEFAULT 'Featured Work',
  	"theme" "enum_posts_feat_work_theme" DEFAULT 'dark',
  	"block_name" varchar
  );
  
  CREATE TABLE "__posts_v_feat_work_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar DEFAULT 'Featured Work',
  	"theme" "enum___posts_v_feat_work_v_theme" DEFAULT 'dark',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "work_pages_feat_work" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar DEFAULT 'Featured Work',
  	"theme" "enum_work_pages_feat_work_theme" DEFAULT 'dark',
  	"block_name" varchar
  );
  
  CREATE TABLE "__work_pages_v_feat_work_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar DEFAULT 'Featured Work',
  	"theme" "enum___work_pages_v_feat_work_v_theme" DEFAULT 'dark',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "expertise_pages_feat_work" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar DEFAULT 'Featured Work',
  	"theme" "enum_expertise_pages_feat_work_theme" DEFAULT 'dark',
  	"block_name" varchar
  );
  
  CREATE TABLE "__expertise_pages_v_feat_work_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar DEFAULT 'Featured Work',
  	"theme" "enum___expertise_pages_v_feat_work_v_theme" DEFAULT 'dark',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "audience_pages_feat_work" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar DEFAULT 'Featured Work',
  	"theme" "enum_audience_pages_feat_work_theme" DEFAULT 'dark',
  	"block_name" varchar
  );
  
  CREATE TABLE "__audience_pages_v_feat_work_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar DEFAULT 'Featured Work',
  	"theme" "enum___audience_pages_v_feat_work_v_theme" DEFAULT 'dark',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "home_feat_work" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_home_feat_work_v" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "home_feat_work" CASCADE;
  DROP TABLE "_home_feat_work_v" CASCADE;
  ALTER TABLE "pages_rels" ADD COLUMN "work_pages_id" integer;
  ALTER TABLE "_pages_v_rels" ADD COLUMN "work_pages_id" integer;
  ALTER TABLE "posts_rels" ADD COLUMN "work_pages_id" integer;
  ALTER TABLE "_posts_v_rels" ADD COLUMN "work_pages_id" integer;
  ALTER TABLE "pages_feat_work" ADD CONSTRAINT "pages_feat_work_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__pages_v_feat_work_v" ADD CONSTRAINT "__pages_v_feat_work_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_feat_work" ADD CONSTRAINT "posts_feat_work_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__posts_v_feat_work_v" ADD CONSTRAINT "__posts_v_feat_work_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "work_pages_feat_work" ADD CONSTRAINT "work_pages_feat_work_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."work_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__work_pages_v_feat_work_v" ADD CONSTRAINT "__work_pages_v_feat_work_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_work_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "expertise_pages_feat_work" ADD CONSTRAINT "expertise_pages_feat_work_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."expertise_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__expertise_pages_v_feat_work_v" ADD CONSTRAINT "__expertise_pages_v_feat_work_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_expertise_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "audience_pages_feat_work" ADD CONSTRAINT "audience_pages_feat_work_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."audience_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__audience_pages_v_feat_work_v" ADD CONSTRAINT "__audience_pages_v_feat_work_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_audience_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_feat_work_order_idx" ON "pages_feat_work" USING btree ("_order");
  CREATE INDEX "pages_feat_work_parent_id_idx" ON "pages_feat_work" USING btree ("_parent_id");
  CREATE INDEX "pages_feat_work_path_idx" ON "pages_feat_work" USING btree ("_path");
  CREATE INDEX "__pages_v_feat_work_v_order_idx" ON "__pages_v_feat_work_v" USING btree ("_order");
  CREATE INDEX "__pages_v_feat_work_v_parent_id_idx" ON "__pages_v_feat_work_v" USING btree ("_parent_id");
  CREATE INDEX "__pages_v_feat_work_v_path_idx" ON "__pages_v_feat_work_v" USING btree ("_path");
  CREATE INDEX "posts_feat_work_order_idx" ON "posts_feat_work" USING btree ("_order");
  CREATE INDEX "posts_feat_work_parent_id_idx" ON "posts_feat_work" USING btree ("_parent_id");
  CREATE INDEX "posts_feat_work_path_idx" ON "posts_feat_work" USING btree ("_path");
  CREATE INDEX "__posts_v_feat_work_v_order_idx" ON "__posts_v_feat_work_v" USING btree ("_order");
  CREATE INDEX "__posts_v_feat_work_v_parent_id_idx" ON "__posts_v_feat_work_v" USING btree ("_parent_id");
  CREATE INDEX "__posts_v_feat_work_v_path_idx" ON "__posts_v_feat_work_v" USING btree ("_path");
  CREATE INDEX "work_pages_feat_work_order_idx" ON "work_pages_feat_work" USING btree ("_order");
  CREATE INDEX "work_pages_feat_work_parent_id_idx" ON "work_pages_feat_work" USING btree ("_parent_id");
  CREATE INDEX "work_pages_feat_work_path_idx" ON "work_pages_feat_work" USING btree ("_path");
  CREATE INDEX "__work_pages_v_feat_work_v_order_idx" ON "__work_pages_v_feat_work_v" USING btree ("_order");
  CREATE INDEX "__work_pages_v_feat_work_v_parent_id_idx" ON "__work_pages_v_feat_work_v" USING btree ("_parent_id");
  CREATE INDEX "__work_pages_v_feat_work_v_path_idx" ON "__work_pages_v_feat_work_v" USING btree ("_path");
  CREATE INDEX "expertise_pages_feat_work_order_idx" ON "expertise_pages_feat_work" USING btree ("_order");
  CREATE INDEX "expertise_pages_feat_work_parent_id_idx" ON "expertise_pages_feat_work" USING btree ("_parent_id");
  CREATE INDEX "expertise_pages_feat_work_path_idx" ON "expertise_pages_feat_work" USING btree ("_path");
  CREATE INDEX "__expertise_pages_v_feat_work_v_order_idx" ON "__expertise_pages_v_feat_work_v" USING btree ("_order");
  CREATE INDEX "__expertise_pages_v_feat_work_v_parent_id_idx" ON "__expertise_pages_v_feat_work_v" USING btree ("_parent_id");
  CREATE INDEX "__expertise_pages_v_feat_work_v_path_idx" ON "__expertise_pages_v_feat_work_v" USING btree ("_path");
  CREATE INDEX "audience_pages_feat_work_order_idx" ON "audience_pages_feat_work" USING btree ("_order");
  CREATE INDEX "audience_pages_feat_work_parent_id_idx" ON "audience_pages_feat_work" USING btree ("_parent_id");
  CREATE INDEX "audience_pages_feat_work_path_idx" ON "audience_pages_feat_work" USING btree ("_path");
  CREATE INDEX "__audience_pages_v_feat_work_v_order_idx" ON "__audience_pages_v_feat_work_v" USING btree ("_order");
  CREATE INDEX "__audience_pages_v_feat_work_v_parent_id_idx" ON "__audience_pages_v_feat_work_v" USING btree ("_parent_id");
  CREATE INDEX "__audience_pages_v_feat_work_v_path_idx" ON "__audience_pages_v_feat_work_v" USING btree ("_path");
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_work_pages_fk" FOREIGN KEY ("work_pages_id") REFERENCES "public"."work_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_work_pages_fk" FOREIGN KEY ("work_pages_id") REFERENCES "public"."work_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_work_pages_fk" FOREIGN KEY ("work_pages_id") REFERENCES "public"."work_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_rels" ADD CONSTRAINT "_posts_v_rels_work_pages_fk" FOREIGN KEY ("work_pages_id") REFERENCES "public"."work_pages"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_rels_work_pages_id_idx" ON "pages_rels" USING btree ("work_pages_id");
  CREATE INDEX "_pages_v_rels_work_pages_id_idx" ON "_pages_v_rels" USING btree ("work_pages_id");
  CREATE INDEX "posts_rels_work_pages_id_idx" ON "posts_rels" USING btree ("work_pages_id");
  CREATE INDEX "_posts_v_rels_work_pages_id_idx" ON "_posts_v_rels" USING btree ("work_pages_id");
  DROP TYPE "public"."enum_home_feat_work_theme";
  DROP TYPE "public"."enum__home_feat_work_v_theme";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_home_feat_work_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum__home_feat_work_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TABLE "home_feat_work" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar DEFAULT 'Featured Work',
  	"theme" "enum_home_feat_work_theme" DEFAULT 'dark',
  	"block_name" varchar
  );
  
  CREATE TABLE "_home_feat_work_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar DEFAULT 'Featured Work',
  	"theme" "enum__home_feat_work_v_theme" DEFAULT 'dark',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "pages_feat_work" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__pages_v_feat_work_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "posts_feat_work" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__posts_v_feat_work_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "work_pages_feat_work" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__work_pages_v_feat_work_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "expertise_pages_feat_work" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__expertise_pages_v_feat_work_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "audience_pages_feat_work" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__audience_pages_v_feat_work_v" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "pages_feat_work" CASCADE;
  DROP TABLE "__pages_v_feat_work_v" CASCADE;
  DROP TABLE "posts_feat_work" CASCADE;
  DROP TABLE "__posts_v_feat_work_v" CASCADE;
  DROP TABLE "work_pages_feat_work" CASCADE;
  DROP TABLE "__work_pages_v_feat_work_v" CASCADE;
  DROP TABLE "expertise_pages_feat_work" CASCADE;
  DROP TABLE "__expertise_pages_v_feat_work_v" CASCADE;
  DROP TABLE "audience_pages_feat_work" CASCADE;
  DROP TABLE "__audience_pages_v_feat_work_v" CASCADE;
  ALTER TABLE "pages_rels" DROP CONSTRAINT "pages_rels_work_pages_fk";
  
  ALTER TABLE "_pages_v_rels" DROP CONSTRAINT "_pages_v_rels_work_pages_fk";
  
  ALTER TABLE "posts_rels" DROP CONSTRAINT "posts_rels_work_pages_fk";
  
  ALTER TABLE "_posts_v_rels" DROP CONSTRAINT "_posts_v_rels_work_pages_fk";
  
  DROP INDEX "pages_rels_work_pages_id_idx";
  DROP INDEX "_pages_v_rels_work_pages_id_idx";
  DROP INDEX "posts_rels_work_pages_id_idx";
  DROP INDEX "_posts_v_rels_work_pages_id_idx";
  ALTER TABLE "home_feat_work" ADD CONSTRAINT "home_feat_work_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."work_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_feat_work_v" ADD CONSTRAINT "_home_feat_work_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_work_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "home_feat_work_order_idx" ON "home_feat_work" USING btree ("_order");
  CREATE INDEX "home_feat_work_parent_id_idx" ON "home_feat_work" USING btree ("_parent_id");
  CREATE INDEX "home_feat_work_path_idx" ON "home_feat_work" USING btree ("_path");
  CREATE INDEX "_home_feat_work_v_order_idx" ON "_home_feat_work_v" USING btree ("_order");
  CREATE INDEX "_home_feat_work_v_parent_id_idx" ON "_home_feat_work_v" USING btree ("_parent_id");
  CREATE INDEX "_home_feat_work_v_path_idx" ON "_home_feat_work_v" USING btree ("_path");
  ALTER TABLE "pages_rels" DROP COLUMN "work_pages_id";
  ALTER TABLE "_pages_v_rels" DROP COLUMN "work_pages_id";
  ALTER TABLE "posts_rels" DROP COLUMN "work_pages_id";
  ALTER TABLE "_posts_v_rels" DROP COLUMN "work_pages_id";
  DROP TYPE "public"."enum_pages_feat_work_theme";
  DROP TYPE "public"."enum___pages_v_feat_work_v_theme";
  DROP TYPE "public"."enum_posts_feat_work_theme";
  DROP TYPE "public"."enum___posts_v_feat_work_v_theme";
  DROP TYPE "public"."enum_work_pages_feat_work_theme";
  DROP TYPE "public"."enum___work_pages_v_feat_work_v_theme";
  DROP TYPE "public"."enum_expertise_pages_feat_work_theme";
  DROP TYPE "public"."enum___expertise_pages_v_feat_work_v_theme";
  DROP TYPE "public"."enum_audience_pages_feat_work_theme";
  DROP TYPE "public"."enum___audience_pages_v_feat_work_v_theme";`)
}
