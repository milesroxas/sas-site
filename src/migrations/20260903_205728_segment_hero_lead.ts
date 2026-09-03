import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_rich_text_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___pages_v_rich_text_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_posts_rich_text_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___posts_v_rich_text_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_lab_pages_rich_text_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___lab_pages_v_rich_text_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_expertise_pages_rich_text_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___expertise_pages_v_rich_text_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_audience_pages_rich_text_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___audience_pages_v_rich_text_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_home_rich_text_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___home_v_rich_text_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TABLE "pages_rich_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"body" jsonb,
  	"theme" "enum_pages_rich_text_theme" DEFAULT 'light',
  	"block_name" varchar
  );
  
  CREATE TABLE "__pages_v_rich_text_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"body" jsonb,
  	"theme" "enum___pages_v_rich_text_v_theme" DEFAULT 'light',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "posts_rich_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"body" jsonb,
  	"theme" "enum_posts_rich_text_theme" DEFAULT 'light',
  	"block_name" varchar
  );
  
  CREATE TABLE "__posts_v_rich_text_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"body" jsonb,
  	"theme" "enum___posts_v_rich_text_v_theme" DEFAULT 'light',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "lab_pages_rich_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"body" jsonb,
  	"theme" "enum_lab_pages_rich_text_theme" DEFAULT 'light',
  	"block_name" varchar
  );
  
  CREATE TABLE "__lab_pages_v_rich_text_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"body" jsonb,
  	"theme" "enum___lab_pages_v_rich_text_v_theme" DEFAULT 'light',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "expertise_pages_rich_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"body" jsonb,
  	"theme" "enum_expertise_pages_rich_text_theme" DEFAULT 'light',
  	"block_name" varchar
  );
  
  CREATE TABLE "__expertise_pages_v_rich_text_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"body" jsonb,
  	"theme" "enum___expertise_pages_v_rich_text_v_theme" DEFAULT 'light',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "audience_pages_rich_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"body" jsonb,
  	"theme" "enum_audience_pages_rich_text_theme" DEFAULT 'light',
  	"block_name" varchar
  );
  
  CREATE TABLE "__audience_pages_v_rich_text_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"body" jsonb,
  	"theme" "enum___audience_pages_v_rich_text_v_theme" DEFAULT 'light',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "home_rich_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"body" jsonb,
  	"theme" "enum_home_rich_text_theme" DEFAULT 'light',
  	"block_name" varchar
  );
  
  CREATE TABLE "__home_v_rich_text_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"body" jsonb,
  	"theme" "enum___home_v_rich_text_v_theme" DEFAULT 'light',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "expertise_pages" ADD COLUMN "hero_lead" varchar;
  ALTER TABLE "_expertise_pages_v" ADD COLUMN "version_hero_lead" varchar;
  ALTER TABLE "audience_pages" ADD COLUMN "hero_lead" varchar;
  ALTER TABLE "_audience_pages_v" ADD COLUMN "version_hero_lead" varchar;
  ALTER TABLE "pages_rich_text" ADD CONSTRAINT "pages_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__pages_v_rich_text_v" ADD CONSTRAINT "__pages_v_rich_text_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_rich_text" ADD CONSTRAINT "posts_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__posts_v_rich_text_v" ADD CONSTRAINT "__posts_v_rich_text_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lab_pages_rich_text" ADD CONSTRAINT "lab_pages_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lab_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__lab_pages_v_rich_text_v" ADD CONSTRAINT "__lab_pages_v_rich_text_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_lab_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "expertise_pages_rich_text" ADD CONSTRAINT "expertise_pages_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."expertise_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__expertise_pages_v_rich_text_v" ADD CONSTRAINT "__expertise_pages_v_rich_text_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_expertise_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "audience_pages_rich_text" ADD CONSTRAINT "audience_pages_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."audience_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__audience_pages_v_rich_text_v" ADD CONSTRAINT "__audience_pages_v_rich_text_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_audience_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_rich_text" ADD CONSTRAINT "home_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__home_v_rich_text_v" ADD CONSTRAINT "__home_v_rich_text_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_rich_text_order_idx" ON "pages_rich_text" USING btree ("_order");
  CREATE INDEX "pages_rich_text_parent_id_idx" ON "pages_rich_text" USING btree ("_parent_id");
  CREATE INDEX "pages_rich_text_path_idx" ON "pages_rich_text" USING btree ("_path");
  CREATE INDEX "__pages_v_rich_text_v_order_idx" ON "__pages_v_rich_text_v" USING btree ("_order");
  CREATE INDEX "__pages_v_rich_text_v_parent_id_idx" ON "__pages_v_rich_text_v" USING btree ("_parent_id");
  CREATE INDEX "__pages_v_rich_text_v_path_idx" ON "__pages_v_rich_text_v" USING btree ("_path");
  CREATE INDEX "posts_rich_text_order_idx" ON "posts_rich_text" USING btree ("_order");
  CREATE INDEX "posts_rich_text_parent_id_idx" ON "posts_rich_text" USING btree ("_parent_id");
  CREATE INDEX "posts_rich_text_path_idx" ON "posts_rich_text" USING btree ("_path");
  CREATE INDEX "__posts_v_rich_text_v_order_idx" ON "__posts_v_rich_text_v" USING btree ("_order");
  CREATE INDEX "__posts_v_rich_text_v_parent_id_idx" ON "__posts_v_rich_text_v" USING btree ("_parent_id");
  CREATE INDEX "__posts_v_rich_text_v_path_idx" ON "__posts_v_rich_text_v" USING btree ("_path");
  CREATE INDEX "lab_pages_rich_text_order_idx" ON "lab_pages_rich_text" USING btree ("_order");
  CREATE INDEX "lab_pages_rich_text_parent_id_idx" ON "lab_pages_rich_text" USING btree ("_parent_id");
  CREATE INDEX "lab_pages_rich_text_path_idx" ON "lab_pages_rich_text" USING btree ("_path");
  CREATE INDEX "__lab_pages_v_rich_text_v_order_idx" ON "__lab_pages_v_rich_text_v" USING btree ("_order");
  CREATE INDEX "__lab_pages_v_rich_text_v_parent_id_idx" ON "__lab_pages_v_rich_text_v" USING btree ("_parent_id");
  CREATE INDEX "__lab_pages_v_rich_text_v_path_idx" ON "__lab_pages_v_rich_text_v" USING btree ("_path");
  CREATE INDEX "expertise_pages_rich_text_order_idx" ON "expertise_pages_rich_text" USING btree ("_order");
  CREATE INDEX "expertise_pages_rich_text_parent_id_idx" ON "expertise_pages_rich_text" USING btree ("_parent_id");
  CREATE INDEX "expertise_pages_rich_text_path_idx" ON "expertise_pages_rich_text" USING btree ("_path");
  CREATE INDEX "__expertise_pages_v_rich_text_v_order_idx" ON "__expertise_pages_v_rich_text_v" USING btree ("_order");
  CREATE INDEX "__expertise_pages_v_rich_text_v_parent_id_idx" ON "__expertise_pages_v_rich_text_v" USING btree ("_parent_id");
  CREATE INDEX "__expertise_pages_v_rich_text_v_path_idx" ON "__expertise_pages_v_rich_text_v" USING btree ("_path");
  CREATE INDEX "audience_pages_rich_text_order_idx" ON "audience_pages_rich_text" USING btree ("_order");
  CREATE INDEX "audience_pages_rich_text_parent_id_idx" ON "audience_pages_rich_text" USING btree ("_parent_id");
  CREATE INDEX "audience_pages_rich_text_path_idx" ON "audience_pages_rich_text" USING btree ("_path");
  CREATE INDEX "__audience_pages_v_rich_text_v_order_idx" ON "__audience_pages_v_rich_text_v" USING btree ("_order");
  CREATE INDEX "__audience_pages_v_rich_text_v_parent_id_idx" ON "__audience_pages_v_rich_text_v" USING btree ("_parent_id");
  CREATE INDEX "__audience_pages_v_rich_text_v_path_idx" ON "__audience_pages_v_rich_text_v" USING btree ("_path");
  CREATE INDEX "home_rich_text_order_idx" ON "home_rich_text" USING btree ("_order");
  CREATE INDEX "home_rich_text_parent_id_idx" ON "home_rich_text" USING btree ("_parent_id");
  CREATE INDEX "home_rich_text_path_idx" ON "home_rich_text" USING btree ("_path");
  CREATE INDEX "__home_v_rich_text_v_order_idx" ON "__home_v_rich_text_v" USING btree ("_order");
  CREATE INDEX "__home_v_rich_text_v_parent_id_idx" ON "__home_v_rich_text_v" USING btree ("_parent_id");
  CREATE INDEX "__home_v_rich_text_v_path_idx" ON "__home_v_rich_text_v" USING btree ("_path");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_rich_text" CASCADE;
  DROP TABLE "__pages_v_rich_text_v" CASCADE;
  DROP TABLE "posts_rich_text" CASCADE;
  DROP TABLE "__posts_v_rich_text_v" CASCADE;
  DROP TABLE "lab_pages_rich_text" CASCADE;
  DROP TABLE "__lab_pages_v_rich_text_v" CASCADE;
  DROP TABLE "expertise_pages_rich_text" CASCADE;
  DROP TABLE "__expertise_pages_v_rich_text_v" CASCADE;
  DROP TABLE "audience_pages_rich_text" CASCADE;
  DROP TABLE "__audience_pages_v_rich_text_v" CASCADE;
  DROP TABLE "home_rich_text" CASCADE;
  DROP TABLE "__home_v_rich_text_v" CASCADE;
  ALTER TABLE "expertise_pages" DROP COLUMN "hero_lead";
  ALTER TABLE "_expertise_pages_v" DROP COLUMN "version_hero_lead";
  ALTER TABLE "audience_pages" DROP COLUMN "hero_lead";
  ALTER TABLE "_audience_pages_v" DROP COLUMN "version_hero_lead";
  DROP TYPE "public"."enum_pages_rich_text_theme";
  DROP TYPE "public"."enum___pages_v_rich_text_v_theme";
  DROP TYPE "public"."enum_posts_rich_text_theme";
  DROP TYPE "public"."enum___posts_v_rich_text_v_theme";
  DROP TYPE "public"."enum_lab_pages_rich_text_theme";
  DROP TYPE "public"."enum___lab_pages_v_rich_text_v_theme";
  DROP TYPE "public"."enum_expertise_pages_rich_text_theme";
  DROP TYPE "public"."enum___expertise_pages_v_rich_text_v_theme";
  DROP TYPE "public"."enum_audience_pages_rich_text_theme";
  DROP TYPE "public"."enum___audience_pages_v_rich_text_v_theme";
  DROP TYPE "public"."enum_home_rich_text_theme";
  DROP TYPE "public"."enum___home_v_rich_text_v_theme";`)
}
