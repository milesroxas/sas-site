import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_transition_layout" AS ENUM('left', 'centered', 'split', 'statement');
  CREATE TYPE "public"."enum_pages_transition_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___pages_v_transition_v_layout" AS ENUM('left', 'centered', 'split', 'statement');
  CREATE TYPE "public"."enum___pages_v_transition_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_posts_transition_layout" AS ENUM('left', 'centered', 'split', 'statement');
  CREATE TYPE "public"."enum_posts_transition_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___posts_v_transition_v_layout" AS ENUM('left', 'centered', 'split', 'statement');
  CREATE TYPE "public"."enum___posts_v_transition_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_lab_pages_transition_layout" AS ENUM('left', 'centered', 'split', 'statement');
  CREATE TYPE "public"."enum_lab_pages_transition_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___lab_pages_v_transition_v_layout" AS ENUM('left', 'centered', 'split', 'statement');
  CREATE TYPE "public"."enum___lab_pages_v_transition_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_expertise_pages_transition_layout" AS ENUM('left', 'centered', 'split', 'statement');
  CREATE TYPE "public"."enum_expertise_pages_transition_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___expertise_pages_v_transition_v_layout" AS ENUM('left', 'centered', 'split', 'statement');
  CREATE TYPE "public"."enum___expertise_pages_v_transition_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_audience_pages_transition_layout" AS ENUM('left', 'centered', 'split', 'statement');
  CREATE TYPE "public"."enum_audience_pages_transition_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___audience_pages_v_transition_v_layout" AS ENUM('left', 'centered', 'split', 'statement');
  CREATE TYPE "public"."enum___audience_pages_v_transition_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TABLE "pages_transition" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"layout" "enum_pages_transition_layout" DEFAULT 'left',
  	"theme" "enum_pages_transition_theme" DEFAULT 'light',
  	"body" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "__pages_v_transition_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"layout" "enum___pages_v_transition_v_layout" DEFAULT 'left',
  	"theme" "enum___pages_v_transition_v_theme" DEFAULT 'light',
  	"body" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "posts_transition" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"layout" "enum_posts_transition_layout" DEFAULT 'left',
  	"theme" "enum_posts_transition_theme" DEFAULT 'light',
  	"body" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "__posts_v_transition_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"layout" "enum___posts_v_transition_v_layout" DEFAULT 'left',
  	"theme" "enum___posts_v_transition_v_theme" DEFAULT 'light',
  	"body" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "lab_pages_transition" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"layout" "enum_lab_pages_transition_layout" DEFAULT 'left',
  	"theme" "enum_lab_pages_transition_theme" DEFAULT 'light',
  	"body" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "__lab_pages_v_transition_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"layout" "enum___lab_pages_v_transition_v_layout" DEFAULT 'left',
  	"theme" "enum___lab_pages_v_transition_v_theme" DEFAULT 'light',
  	"body" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "expertise_pages_transition" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"layout" "enum_expertise_pages_transition_layout" DEFAULT 'left',
  	"theme" "enum_expertise_pages_transition_theme" DEFAULT 'light',
  	"body" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "__expertise_pages_v_transition_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"layout" "enum___expertise_pages_v_transition_v_layout" DEFAULT 'left',
  	"theme" "enum___expertise_pages_v_transition_v_theme" DEFAULT 'light',
  	"body" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "audience_pages_transition" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"layout" "enum_audience_pages_transition_layout" DEFAULT 'left',
  	"theme" "enum_audience_pages_transition_theme" DEFAULT 'light',
  	"body" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "__audience_pages_v_transition_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"layout" "enum___audience_pages_v_transition_v_layout" DEFAULT 'left',
  	"theme" "enum___audience_pages_v_transition_v_theme" DEFAULT 'light',
  	"body" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  DROP TABLE "lp_transition" CASCADE;
  DROP TABLE "_lp_transition_v" CASCADE;
  ALTER TABLE "pages_transition" ADD CONSTRAINT "pages_transition_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__pages_v_transition_v" ADD CONSTRAINT "__pages_v_transition_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_transition" ADD CONSTRAINT "posts_transition_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__posts_v_transition_v" ADD CONSTRAINT "__posts_v_transition_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lab_pages_transition" ADD CONSTRAINT "lab_pages_transition_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lab_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__lab_pages_v_transition_v" ADD CONSTRAINT "__lab_pages_v_transition_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_lab_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "expertise_pages_transition" ADD CONSTRAINT "expertise_pages_transition_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."expertise_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__expertise_pages_v_transition_v" ADD CONSTRAINT "__expertise_pages_v_transition_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_expertise_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "audience_pages_transition" ADD CONSTRAINT "audience_pages_transition_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."audience_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__audience_pages_v_transition_v" ADD CONSTRAINT "__audience_pages_v_transition_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_audience_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_transition_order_idx" ON "pages_transition" USING btree ("_order");
  CREATE INDEX "pages_transition_parent_id_idx" ON "pages_transition" USING btree ("_parent_id");
  CREATE INDEX "pages_transition_path_idx" ON "pages_transition" USING btree ("_path");
  CREATE INDEX "__pages_v_transition_v_order_idx" ON "__pages_v_transition_v" USING btree ("_order");
  CREATE INDEX "__pages_v_transition_v_parent_id_idx" ON "__pages_v_transition_v" USING btree ("_parent_id");
  CREATE INDEX "__pages_v_transition_v_path_idx" ON "__pages_v_transition_v" USING btree ("_path");
  CREATE INDEX "posts_transition_order_idx" ON "posts_transition" USING btree ("_order");
  CREATE INDEX "posts_transition_parent_id_idx" ON "posts_transition" USING btree ("_parent_id");
  CREATE INDEX "posts_transition_path_idx" ON "posts_transition" USING btree ("_path");
  CREATE INDEX "__posts_v_transition_v_order_idx" ON "__posts_v_transition_v" USING btree ("_order");
  CREATE INDEX "__posts_v_transition_v_parent_id_idx" ON "__posts_v_transition_v" USING btree ("_parent_id");
  CREATE INDEX "__posts_v_transition_v_path_idx" ON "__posts_v_transition_v" USING btree ("_path");
  CREATE INDEX "lab_pages_transition_order_idx" ON "lab_pages_transition" USING btree ("_order");
  CREATE INDEX "lab_pages_transition_parent_id_idx" ON "lab_pages_transition" USING btree ("_parent_id");
  CREATE INDEX "lab_pages_transition_path_idx" ON "lab_pages_transition" USING btree ("_path");
  CREATE INDEX "__lab_pages_v_transition_v_order_idx" ON "__lab_pages_v_transition_v" USING btree ("_order");
  CREATE INDEX "__lab_pages_v_transition_v_parent_id_idx" ON "__lab_pages_v_transition_v" USING btree ("_parent_id");
  CREATE INDEX "__lab_pages_v_transition_v_path_idx" ON "__lab_pages_v_transition_v" USING btree ("_path");
  CREATE INDEX "expertise_pages_transition_order_idx" ON "expertise_pages_transition" USING btree ("_order");
  CREATE INDEX "expertise_pages_transition_parent_id_idx" ON "expertise_pages_transition" USING btree ("_parent_id");
  CREATE INDEX "expertise_pages_transition_path_idx" ON "expertise_pages_transition" USING btree ("_path");
  CREATE INDEX "__expertise_pages_v_transition_v_order_idx" ON "__expertise_pages_v_transition_v" USING btree ("_order");
  CREATE INDEX "__expertise_pages_v_transition_v_parent_id_idx" ON "__expertise_pages_v_transition_v" USING btree ("_parent_id");
  CREATE INDEX "__expertise_pages_v_transition_v_path_idx" ON "__expertise_pages_v_transition_v" USING btree ("_path");
  CREATE INDEX "audience_pages_transition_order_idx" ON "audience_pages_transition" USING btree ("_order");
  CREATE INDEX "audience_pages_transition_parent_id_idx" ON "audience_pages_transition" USING btree ("_parent_id");
  CREATE INDEX "audience_pages_transition_path_idx" ON "audience_pages_transition" USING btree ("_path");
  CREATE INDEX "__audience_pages_v_transition_v_order_idx" ON "__audience_pages_v_transition_v" USING btree ("_order");
  CREATE INDEX "__audience_pages_v_transition_v_parent_id_idx" ON "__audience_pages_v_transition_v" USING btree ("_parent_id");
  CREATE INDEX "__audience_pages_v_transition_v_path_idx" ON "__audience_pages_v_transition_v" USING btree ("_path");
  ALTER TABLE "expertise_pages_hero_links" DROP COLUMN "link_appearance";
  ALTER TABLE "expertise_pages" DROP COLUMN "hero_type";
  ALTER TABLE "expertise_pages" DROP COLUMN "hero_rich_text";
  ALTER TABLE "_expertise_pages_v_version_hero_links" DROP COLUMN "link_appearance";
  ALTER TABLE "_expertise_pages_v" DROP COLUMN "version_hero_type";
  ALTER TABLE "_expertise_pages_v" DROP COLUMN "version_hero_rich_text";
  ALTER TABLE "audience_pages_hero_links" DROP COLUMN "link_appearance";
  ALTER TABLE "audience_pages" DROP COLUMN "hero_type";
  ALTER TABLE "audience_pages" DROP COLUMN "hero_rich_text";
  ALTER TABLE "_audience_pages_v_version_hero_links" DROP COLUMN "link_appearance";
  ALTER TABLE "_audience_pages_v" DROP COLUMN "version_hero_type";
  ALTER TABLE "_audience_pages_v" DROP COLUMN "version_hero_rich_text";
  DROP TYPE "public"."enum_lp_transition_layout";
  DROP TYPE "public"."enum_lp_transition_theme";
  DROP TYPE "public"."enum__lp_transition_v_layout";
  DROP TYPE "public"."enum__lp_transition_v_theme";
  DROP TYPE "public"."enum_expertise_pages_hero_links_link_appearance";
  DROP TYPE "public"."enum_expertise_pages_hero_type";
  DROP TYPE "public"."enum__expertise_pages_v_version_hero_links_link_appearance";
  DROP TYPE "public"."enum__expertise_pages_v_version_hero_type";
  DROP TYPE "public"."enum_audience_pages_hero_links_link_appearance";
  DROP TYPE "public"."enum_audience_pages_hero_type";
  DROP TYPE "public"."enum__audience_pages_v_version_hero_links_link_appearance";
  DROP TYPE "public"."enum__audience_pages_v_version_hero_type";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_lp_transition_layout" AS ENUM('left', 'centered', 'split', 'statement');
  CREATE TYPE "public"."enum_lp_transition_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum__lp_transition_v_layout" AS ENUM('left', 'centered', 'split', 'statement');
  CREATE TYPE "public"."enum__lp_transition_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_expertise_pages_hero_links_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum_expertise_pages_hero_type" AS ENUM('none', 'highImpact', 'mediumImpact', 'lowImpact');
  CREATE TYPE "public"."enum__expertise_pages_v_version_hero_links_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum__expertise_pages_v_version_hero_type" AS ENUM('none', 'highImpact', 'mediumImpact', 'lowImpact');
  CREATE TYPE "public"."enum_audience_pages_hero_links_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum_audience_pages_hero_type" AS ENUM('none', 'highImpact', 'mediumImpact', 'lowImpact');
  CREATE TYPE "public"."enum__audience_pages_v_version_hero_links_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum__audience_pages_v_version_hero_type" AS ENUM('none', 'highImpact', 'mediumImpact', 'lowImpact');
  CREATE TABLE "lp_transition" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"layout" "enum_lp_transition_layout" DEFAULT 'left',
  	"theme" "enum_lp_transition_theme" DEFAULT 'light',
  	"body" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "_lp_transition_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"layout" "enum__lp_transition_v_layout" DEFAULT 'left',
  	"theme" "enum__lp_transition_v_theme" DEFAULT 'light',
  	"body" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  DROP TABLE "pages_transition" CASCADE;
  DROP TABLE "__pages_v_transition_v" CASCADE;
  DROP TABLE "posts_transition" CASCADE;
  DROP TABLE "__posts_v_transition_v" CASCADE;
  DROP TABLE "lab_pages_transition" CASCADE;
  DROP TABLE "__lab_pages_v_transition_v" CASCADE;
  DROP TABLE "expertise_pages_transition" CASCADE;
  DROP TABLE "__expertise_pages_v_transition_v" CASCADE;
  DROP TABLE "audience_pages_transition" CASCADE;
  DROP TABLE "__audience_pages_v_transition_v" CASCADE;
  ALTER TABLE "expertise_pages_hero_links" ADD COLUMN "link_appearance" "enum_expertise_pages_hero_links_link_appearance" DEFAULT 'default';
  ALTER TABLE "expertise_pages" ADD COLUMN "hero_type" "enum_expertise_pages_hero_type" DEFAULT 'lowImpact';
  ALTER TABLE "expertise_pages" ADD COLUMN "hero_rich_text" jsonb;
  ALTER TABLE "_expertise_pages_v_version_hero_links" ADD COLUMN "link_appearance" "enum__expertise_pages_v_version_hero_links_link_appearance" DEFAULT 'default';
  ALTER TABLE "_expertise_pages_v" ADD COLUMN "version_hero_type" "enum__expertise_pages_v_version_hero_type" DEFAULT 'lowImpact';
  ALTER TABLE "_expertise_pages_v" ADD COLUMN "version_hero_rich_text" jsonb;
  ALTER TABLE "audience_pages_hero_links" ADD COLUMN "link_appearance" "enum_audience_pages_hero_links_link_appearance" DEFAULT 'default';
  ALTER TABLE "audience_pages" ADD COLUMN "hero_type" "enum_audience_pages_hero_type" DEFAULT 'lowImpact';
  ALTER TABLE "audience_pages" ADD COLUMN "hero_rich_text" jsonb;
  ALTER TABLE "_audience_pages_v_version_hero_links" ADD COLUMN "link_appearance" "enum__audience_pages_v_version_hero_links_link_appearance" DEFAULT 'default';
  ALTER TABLE "_audience_pages_v" ADD COLUMN "version_hero_type" "enum__audience_pages_v_version_hero_type" DEFAULT 'lowImpact';
  ALTER TABLE "_audience_pages_v" ADD COLUMN "version_hero_rich_text" jsonb;
  ALTER TABLE "lp_transition" ADD CONSTRAINT "lp_transition_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lab_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_lp_transition_v" ADD CONSTRAINT "_lp_transition_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_lab_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "lp_transition_order_idx" ON "lp_transition" USING btree ("_order");
  CREATE INDEX "lp_transition_parent_id_idx" ON "lp_transition" USING btree ("_parent_id");
  CREATE INDEX "lp_transition_path_idx" ON "lp_transition" USING btree ("_path");
  CREATE INDEX "_lp_transition_v_order_idx" ON "_lp_transition_v" USING btree ("_order");
  CREATE INDEX "_lp_transition_v_parent_id_idx" ON "_lp_transition_v" USING btree ("_parent_id");
  CREATE INDEX "_lp_transition_v_path_idx" ON "_lp_transition_v" USING btree ("_path");
  DROP TYPE "public"."enum_pages_transition_layout";
  DROP TYPE "public"."enum_pages_transition_theme";
  DROP TYPE "public"."enum___pages_v_transition_v_layout";
  DROP TYPE "public"."enum___pages_v_transition_v_theme";
  DROP TYPE "public"."enum_posts_transition_layout";
  DROP TYPE "public"."enum_posts_transition_theme";
  DROP TYPE "public"."enum___posts_v_transition_v_layout";
  DROP TYPE "public"."enum___posts_v_transition_v_theme";
  DROP TYPE "public"."enum_lab_pages_transition_layout";
  DROP TYPE "public"."enum_lab_pages_transition_theme";
  DROP TYPE "public"."enum___lab_pages_v_transition_v_layout";
  DROP TYPE "public"."enum___lab_pages_v_transition_v_theme";
  DROP TYPE "public"."enum_expertise_pages_transition_layout";
  DROP TYPE "public"."enum_expertise_pages_transition_theme";
  DROP TYPE "public"."enum___expertise_pages_v_transition_v_layout";
  DROP TYPE "public"."enum___expertise_pages_v_transition_v_theme";
  DROP TYPE "public"."enum_audience_pages_transition_layout";
  DROP TYPE "public"."enum_audience_pages_transition_theme";
  DROP TYPE "public"."enum___audience_pages_v_transition_v_layout";
  DROP TYPE "public"."enum___audience_pages_v_transition_v_theme";`)
}
