import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_insights_index_hero_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_insights_index_hero_links_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum_insights_index_hero_type" AS ENUM('none', 'highImpact', 'mediumImpact', 'lowImpact');
  CREATE TYPE "public"."enum_insights_index_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__insights_index_v_version_hero_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__insights_index_v_version_hero_links_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum__insights_index_v_version_hero_type" AS ENUM('none', 'highImpact', 'mediumImpact', 'lowImpact');
  CREATE TYPE "public"."enum__insights_index_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_works_index_hero_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_works_index_hero_links_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum_works_index_hero_type" AS ENUM('none', 'highImpact', 'mediumImpact', 'lowImpact');
  CREATE TYPE "public"."enum_works_index_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__works_index_v_version_hero_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__works_index_v_version_hero_links_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum__works_index_v_version_hero_type" AS ENUM('none', 'highImpact', 'mediumImpact', 'lowImpact');
  CREATE TYPE "public"."enum__works_index_v_version_status" AS ENUM('draft', 'published');
  ALTER TYPE "public"."enum_pages_blocks_archive_card_variant" ADD VALUE 'backdrop';
  ALTER TYPE "public"."enum__pages_v_blocks_archive_card_variant" ADD VALUE 'backdrop';
  ALTER TYPE "public"."enum_expertise_pages_blocks_archive_card_variant" ADD VALUE 'backdrop';
  ALTER TYPE "public"."enum__expertise_pages_v_blocks_archive_card_variant" ADD VALUE 'backdrop';
  ALTER TYPE "public"."enum_audience_pages_blocks_archive_card_variant" ADD VALUE 'backdrop';
  ALTER TYPE "public"."enum__audience_pages_v_blocks_archive_card_variant" ADD VALUE 'backdrop';
  ALTER TYPE "public"."enum_home_blocks_archive_card_variant" ADD VALUE 'backdrop';
  ALTER TYPE "public"."enum__home_v_blocks_archive_card_variant" ADD VALUE 'backdrop';
  CREATE TABLE "insights_index_hero_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_insights_index_hero_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum_insights_index_hero_links_link_appearance" DEFAULT 'default'
  );
  
  CREATE TABLE "insights_index" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar DEFAULT 'Insights Index',
  	"hero_type" "enum_insights_index_hero_type" DEFAULT 'lowImpact',
  	"hero_eyebrow" varchar,
  	"hero_title" varchar,
  	"hero_rich_text" jsonb,
  	"hero_description" varchar,
  	"hero_media_id" integer,
  	"meta_title" varchar,
  	"meta_image_id" integer,
  	"meta_description" varchar,
  	"meta_og_title" varchar,
  	"meta_og_description" varchar,
  	"meta_og_image_id" integer,
  	"_status" "enum_insights_index_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "insights_index_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"posts_id" integer
  );
  
  CREATE TABLE "_insights_index_v_version_hero_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_type" "enum__insights_index_v_version_hero_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum__insights_index_v_version_hero_links_link_appearance" DEFAULT 'default',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_insights_index_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_title" varchar DEFAULT 'Insights Index',
  	"version_hero_type" "enum__insights_index_v_version_hero_type" DEFAULT 'lowImpact',
  	"version_hero_eyebrow" varchar,
  	"version_hero_title" varchar,
  	"version_hero_rich_text" jsonb,
  	"version_hero_description" varchar,
  	"version_hero_media_id" integer,
  	"version_meta_title" varchar,
  	"version_meta_image_id" integer,
  	"version_meta_description" varchar,
  	"version_meta_og_title" varchar,
  	"version_meta_og_description" varchar,
  	"version_meta_og_image_id" integer,
  	"version__status" "enum__insights_index_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_insights_index_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"posts_id" integer
  );
  
  CREATE TABLE "works_index_hero_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_works_index_hero_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum_works_index_hero_links_link_appearance" DEFAULT 'default'
  );
  
  CREATE TABLE "works_index" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar DEFAULT 'Works Index',
  	"hero_type" "enum_works_index_hero_type" DEFAULT 'lowImpact',
  	"hero_eyebrow" varchar,
  	"hero_title" varchar,
  	"hero_rich_text" jsonb,
  	"hero_description" varchar,
  	"hero_media_id" integer,
  	"meta_title" varchar,
  	"meta_image_id" integer,
  	"meta_description" varchar,
  	"meta_og_title" varchar,
  	"meta_og_description" varchar,
  	"meta_og_image_id" integer,
  	"_status" "enum_works_index_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "works_index_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"posts_id" integer
  );
  
  CREATE TABLE "_works_index_v_version_hero_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_type" "enum__works_index_v_version_hero_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum__works_index_v_version_hero_links_link_appearance" DEFAULT 'default',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_works_index_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_title" varchar DEFAULT 'Works Index',
  	"version_hero_type" "enum__works_index_v_version_hero_type" DEFAULT 'lowImpact',
  	"version_hero_eyebrow" varchar,
  	"version_hero_title" varchar,
  	"version_hero_rich_text" jsonb,
  	"version_hero_description" varchar,
  	"version_hero_media_id" integer,
  	"version_meta_title" varchar,
  	"version_meta_image_id" integer,
  	"version_meta_description" varchar,
  	"version_meta_og_title" varchar,
  	"version_meta_og_description" varchar,
  	"version_meta_og_image_id" integer,
  	"version__status" "enum__works_index_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_works_index_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"posts_id" integer
  );
  
  ALTER TABLE "insights_index_hero_links" ADD CONSTRAINT "insights_index_hero_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."insights_index"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "insights_index" ADD CONSTRAINT "insights_index_hero_media_id_media_id_fk" FOREIGN KEY ("hero_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "insights_index" ADD CONSTRAINT "insights_index_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "insights_index" ADD CONSTRAINT "insights_index_meta_og_image_id_media_id_fk" FOREIGN KEY ("meta_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "insights_index_rels" ADD CONSTRAINT "insights_index_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."insights_index"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "insights_index_rels" ADD CONSTRAINT "insights_index_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "insights_index_rels" ADD CONSTRAINT "insights_index_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_insights_index_v_version_hero_links" ADD CONSTRAINT "_insights_index_v_version_hero_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_insights_index_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_insights_index_v" ADD CONSTRAINT "_insights_index_v_version_hero_media_id_media_id_fk" FOREIGN KEY ("version_hero_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_insights_index_v" ADD CONSTRAINT "_insights_index_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_insights_index_v" ADD CONSTRAINT "_insights_index_v_version_meta_og_image_id_media_id_fk" FOREIGN KEY ("version_meta_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_insights_index_v_rels" ADD CONSTRAINT "_insights_index_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_insights_index_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_insights_index_v_rels" ADD CONSTRAINT "_insights_index_v_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_insights_index_v_rels" ADD CONSTRAINT "_insights_index_v_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "works_index_hero_links" ADD CONSTRAINT "works_index_hero_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."works_index"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "works_index" ADD CONSTRAINT "works_index_hero_media_id_media_id_fk" FOREIGN KEY ("hero_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "works_index" ADD CONSTRAINT "works_index_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "works_index" ADD CONSTRAINT "works_index_meta_og_image_id_media_id_fk" FOREIGN KEY ("meta_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "works_index_rels" ADD CONSTRAINT "works_index_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."works_index"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "works_index_rels" ADD CONSTRAINT "works_index_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "works_index_rels" ADD CONSTRAINT "works_index_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_works_index_v_version_hero_links" ADD CONSTRAINT "_works_index_v_version_hero_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_works_index_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_works_index_v" ADD CONSTRAINT "_works_index_v_version_hero_media_id_media_id_fk" FOREIGN KEY ("version_hero_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_works_index_v" ADD CONSTRAINT "_works_index_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_works_index_v" ADD CONSTRAINT "_works_index_v_version_meta_og_image_id_media_id_fk" FOREIGN KEY ("version_meta_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_works_index_v_rels" ADD CONSTRAINT "_works_index_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_works_index_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_works_index_v_rels" ADD CONSTRAINT "_works_index_v_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_works_index_v_rels" ADD CONSTRAINT "_works_index_v_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "insights_index_hero_links_order_idx" ON "insights_index_hero_links" USING btree ("_order");
  CREATE INDEX "insights_index_hero_links_parent_id_idx" ON "insights_index_hero_links" USING btree ("_parent_id");
  CREATE INDEX "insights_index_hero_hero_media_idx" ON "insights_index" USING btree ("hero_media_id");
  CREATE INDEX "insights_index_meta_meta_image_idx" ON "insights_index" USING btree ("meta_image_id");
  CREATE INDEX "insights_index_meta_og_meta_og_image_idx" ON "insights_index" USING btree ("meta_og_image_id");
  CREATE INDEX "insights_index__status_idx" ON "insights_index" USING btree ("_status");
  CREATE INDEX "insights_index_rels_order_idx" ON "insights_index_rels" USING btree ("order");
  CREATE INDEX "insights_index_rels_parent_idx" ON "insights_index_rels" USING btree ("parent_id");
  CREATE INDEX "insights_index_rels_path_idx" ON "insights_index_rels" USING btree ("path");
  CREATE INDEX "insights_index_rels_pages_id_idx" ON "insights_index_rels" USING btree ("pages_id");
  CREATE INDEX "insights_index_rels_posts_id_idx" ON "insights_index_rels" USING btree ("posts_id");
  CREATE INDEX "_insights_index_v_version_hero_links_order_idx" ON "_insights_index_v_version_hero_links" USING btree ("_order");
  CREATE INDEX "_insights_index_v_version_hero_links_parent_id_idx" ON "_insights_index_v_version_hero_links" USING btree ("_parent_id");
  CREATE INDEX "_insights_index_v_version_hero_version_hero_media_idx" ON "_insights_index_v" USING btree ("version_hero_media_id");
  CREATE INDEX "_insights_index_v_version_meta_version_meta_image_idx" ON "_insights_index_v" USING btree ("version_meta_image_id");
  CREATE INDEX "_insights_index_v_version_meta_og_version_meta_og_image_idx" ON "_insights_index_v" USING btree ("version_meta_og_image_id");
  CREATE INDEX "_insights_index_v_version_version__status_idx" ON "_insights_index_v" USING btree ("version__status");
  CREATE INDEX "_insights_index_v_created_at_idx" ON "_insights_index_v" USING btree ("created_at");
  CREATE INDEX "_insights_index_v_updated_at_idx" ON "_insights_index_v" USING btree ("updated_at");
  CREATE INDEX "_insights_index_v_latest_idx" ON "_insights_index_v" USING btree ("latest");
  CREATE INDEX "_insights_index_v_autosave_idx" ON "_insights_index_v" USING btree ("autosave");
  CREATE INDEX "_insights_index_v_rels_order_idx" ON "_insights_index_v_rels" USING btree ("order");
  CREATE INDEX "_insights_index_v_rels_parent_idx" ON "_insights_index_v_rels" USING btree ("parent_id");
  CREATE INDEX "_insights_index_v_rels_path_idx" ON "_insights_index_v_rels" USING btree ("path");
  CREATE INDEX "_insights_index_v_rels_pages_id_idx" ON "_insights_index_v_rels" USING btree ("pages_id");
  CREATE INDEX "_insights_index_v_rels_posts_id_idx" ON "_insights_index_v_rels" USING btree ("posts_id");
  CREATE INDEX "works_index_hero_links_order_idx" ON "works_index_hero_links" USING btree ("_order");
  CREATE INDEX "works_index_hero_links_parent_id_idx" ON "works_index_hero_links" USING btree ("_parent_id");
  CREATE INDEX "works_index_hero_hero_media_idx" ON "works_index" USING btree ("hero_media_id");
  CREATE INDEX "works_index_meta_meta_image_idx" ON "works_index" USING btree ("meta_image_id");
  CREATE INDEX "works_index_meta_og_meta_og_image_idx" ON "works_index" USING btree ("meta_og_image_id");
  CREATE INDEX "works_index__status_idx" ON "works_index" USING btree ("_status");
  CREATE INDEX "works_index_rels_order_idx" ON "works_index_rels" USING btree ("order");
  CREATE INDEX "works_index_rels_parent_idx" ON "works_index_rels" USING btree ("parent_id");
  CREATE INDEX "works_index_rels_path_idx" ON "works_index_rels" USING btree ("path");
  CREATE INDEX "works_index_rels_pages_id_idx" ON "works_index_rels" USING btree ("pages_id");
  CREATE INDEX "works_index_rels_posts_id_idx" ON "works_index_rels" USING btree ("posts_id");
  CREATE INDEX "_works_index_v_version_hero_links_order_idx" ON "_works_index_v_version_hero_links" USING btree ("_order");
  CREATE INDEX "_works_index_v_version_hero_links_parent_id_idx" ON "_works_index_v_version_hero_links" USING btree ("_parent_id");
  CREATE INDEX "_works_index_v_version_hero_version_hero_media_idx" ON "_works_index_v" USING btree ("version_hero_media_id");
  CREATE INDEX "_works_index_v_version_meta_version_meta_image_idx" ON "_works_index_v" USING btree ("version_meta_image_id");
  CREATE INDEX "_works_index_v_version_meta_og_version_meta_og_image_idx" ON "_works_index_v" USING btree ("version_meta_og_image_id");
  CREATE INDEX "_works_index_v_version_version__status_idx" ON "_works_index_v" USING btree ("version__status");
  CREATE INDEX "_works_index_v_created_at_idx" ON "_works_index_v" USING btree ("created_at");
  CREATE INDEX "_works_index_v_updated_at_idx" ON "_works_index_v" USING btree ("updated_at");
  CREATE INDEX "_works_index_v_latest_idx" ON "_works_index_v" USING btree ("latest");
  CREATE INDEX "_works_index_v_autosave_idx" ON "_works_index_v" USING btree ("autosave");
  CREATE INDEX "_works_index_v_rels_order_idx" ON "_works_index_v_rels" USING btree ("order");
  CREATE INDEX "_works_index_v_rels_parent_idx" ON "_works_index_v_rels" USING btree ("parent_id");
  CREATE INDEX "_works_index_v_rels_path_idx" ON "_works_index_v_rels" USING btree ("path");
  CREATE INDEX "_works_index_v_rels_pages_id_idx" ON "_works_index_v_rels" USING btree ("pages_id");
  CREATE INDEX "_works_index_v_rels_posts_id_idx" ON "_works_index_v_rels" USING btree ("posts_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "insights_index_hero_links" CASCADE;
  DROP TABLE "insights_index" CASCADE;
  DROP TABLE "insights_index_rels" CASCADE;
  DROP TABLE "_insights_index_v_version_hero_links" CASCADE;
  DROP TABLE "_insights_index_v" CASCADE;
  DROP TABLE "_insights_index_v_rels" CASCADE;
  DROP TABLE "works_index_hero_links" CASCADE;
  DROP TABLE "works_index" CASCADE;
  DROP TABLE "works_index_rels" CASCADE;
  DROP TABLE "_works_index_v_version_hero_links" CASCADE;
  DROP TABLE "_works_index_v" CASCADE;
  DROP TABLE "_works_index_v_rels" CASCADE;
  ALTER TABLE "pages_blocks_archive" ALTER COLUMN "card_variant" SET DATA TYPE text;
  ALTER TABLE "pages_blocks_archive" ALTER COLUMN "card_variant" SET DEFAULT 'split'::text;
  DROP TYPE "public"."enum_pages_blocks_archive_card_variant";
  CREATE TYPE "public"."enum_pages_blocks_archive_card_variant" AS ENUM('contained', 'open', 'overlay', 'split');
  ALTER TABLE "pages_blocks_archive" ALTER COLUMN "card_variant" SET DEFAULT 'split'::"public"."enum_pages_blocks_archive_card_variant";
  ALTER TABLE "pages_blocks_archive" ALTER COLUMN "card_variant" SET DATA TYPE "public"."enum_pages_blocks_archive_card_variant" USING "card_variant"::"public"."enum_pages_blocks_archive_card_variant";
  ALTER TABLE "_pages_v_blocks_archive" ALTER COLUMN "card_variant" SET DATA TYPE text;
  ALTER TABLE "_pages_v_blocks_archive" ALTER COLUMN "card_variant" SET DEFAULT 'split'::text;
  DROP TYPE "public"."enum__pages_v_blocks_archive_card_variant";
  CREATE TYPE "public"."enum__pages_v_blocks_archive_card_variant" AS ENUM('contained', 'open', 'overlay', 'split');
  ALTER TABLE "_pages_v_blocks_archive" ALTER COLUMN "card_variant" SET DEFAULT 'split'::"public"."enum__pages_v_blocks_archive_card_variant";
  ALTER TABLE "_pages_v_blocks_archive" ALTER COLUMN "card_variant" SET DATA TYPE "public"."enum__pages_v_blocks_archive_card_variant" USING "card_variant"::"public"."enum__pages_v_blocks_archive_card_variant";
  ALTER TABLE "expertise_pages_blocks_archive" ALTER COLUMN "card_variant" SET DATA TYPE text;
  ALTER TABLE "expertise_pages_blocks_archive" ALTER COLUMN "card_variant" SET DEFAULT 'split'::text;
  DROP TYPE "public"."enum_expertise_pages_blocks_archive_card_variant";
  CREATE TYPE "public"."enum_expertise_pages_blocks_archive_card_variant" AS ENUM('contained', 'open', 'overlay', 'split');
  ALTER TABLE "expertise_pages_blocks_archive" ALTER COLUMN "card_variant" SET DEFAULT 'split'::"public"."enum_expertise_pages_blocks_archive_card_variant";
  ALTER TABLE "expertise_pages_blocks_archive" ALTER COLUMN "card_variant" SET DATA TYPE "public"."enum_expertise_pages_blocks_archive_card_variant" USING "card_variant"::"public"."enum_expertise_pages_blocks_archive_card_variant";
  ALTER TABLE "_expertise_pages_v_blocks_archive" ALTER COLUMN "card_variant" SET DATA TYPE text;
  ALTER TABLE "_expertise_pages_v_blocks_archive" ALTER COLUMN "card_variant" SET DEFAULT 'split'::text;
  DROP TYPE "public"."enum__expertise_pages_v_blocks_archive_card_variant";
  CREATE TYPE "public"."enum__expertise_pages_v_blocks_archive_card_variant" AS ENUM('contained', 'open', 'overlay', 'split');
  ALTER TABLE "_expertise_pages_v_blocks_archive" ALTER COLUMN "card_variant" SET DEFAULT 'split'::"public"."enum__expertise_pages_v_blocks_archive_card_variant";
  ALTER TABLE "_expertise_pages_v_blocks_archive" ALTER COLUMN "card_variant" SET DATA TYPE "public"."enum__expertise_pages_v_blocks_archive_card_variant" USING "card_variant"::"public"."enum__expertise_pages_v_blocks_archive_card_variant";
  ALTER TABLE "audience_pages_blocks_archive" ALTER COLUMN "card_variant" SET DATA TYPE text;
  ALTER TABLE "audience_pages_blocks_archive" ALTER COLUMN "card_variant" SET DEFAULT 'split'::text;
  DROP TYPE "public"."enum_audience_pages_blocks_archive_card_variant";
  CREATE TYPE "public"."enum_audience_pages_blocks_archive_card_variant" AS ENUM('contained', 'open', 'overlay', 'split');
  ALTER TABLE "audience_pages_blocks_archive" ALTER COLUMN "card_variant" SET DEFAULT 'split'::"public"."enum_audience_pages_blocks_archive_card_variant";
  ALTER TABLE "audience_pages_blocks_archive" ALTER COLUMN "card_variant" SET DATA TYPE "public"."enum_audience_pages_blocks_archive_card_variant" USING "card_variant"::"public"."enum_audience_pages_blocks_archive_card_variant";
  ALTER TABLE "_audience_pages_v_blocks_archive" ALTER COLUMN "card_variant" SET DATA TYPE text;
  ALTER TABLE "_audience_pages_v_blocks_archive" ALTER COLUMN "card_variant" SET DEFAULT 'split'::text;
  DROP TYPE "public"."enum__audience_pages_v_blocks_archive_card_variant";
  CREATE TYPE "public"."enum__audience_pages_v_blocks_archive_card_variant" AS ENUM('contained', 'open', 'overlay', 'split');
  ALTER TABLE "_audience_pages_v_blocks_archive" ALTER COLUMN "card_variant" SET DEFAULT 'split'::"public"."enum__audience_pages_v_blocks_archive_card_variant";
  ALTER TABLE "_audience_pages_v_blocks_archive" ALTER COLUMN "card_variant" SET DATA TYPE "public"."enum__audience_pages_v_blocks_archive_card_variant" USING "card_variant"::"public"."enum__audience_pages_v_blocks_archive_card_variant";
  ALTER TABLE "home_blocks_archive" ALTER COLUMN "card_variant" SET DATA TYPE text;
  ALTER TABLE "home_blocks_archive" ALTER COLUMN "card_variant" SET DEFAULT 'split'::text;
  DROP TYPE "public"."enum_home_blocks_archive_card_variant";
  CREATE TYPE "public"."enum_home_blocks_archive_card_variant" AS ENUM('contained', 'open', 'overlay', 'split');
  ALTER TABLE "home_blocks_archive" ALTER COLUMN "card_variant" SET DEFAULT 'split'::"public"."enum_home_blocks_archive_card_variant";
  ALTER TABLE "home_blocks_archive" ALTER COLUMN "card_variant" SET DATA TYPE "public"."enum_home_blocks_archive_card_variant" USING "card_variant"::"public"."enum_home_blocks_archive_card_variant";
  ALTER TABLE "_home_v_blocks_archive" ALTER COLUMN "card_variant" SET DATA TYPE text;
  ALTER TABLE "_home_v_blocks_archive" ALTER COLUMN "card_variant" SET DEFAULT 'split'::text;
  DROP TYPE "public"."enum__home_v_blocks_archive_card_variant";
  CREATE TYPE "public"."enum__home_v_blocks_archive_card_variant" AS ENUM('contained', 'open', 'overlay', 'split');
  ALTER TABLE "_home_v_blocks_archive" ALTER COLUMN "card_variant" SET DEFAULT 'split'::"public"."enum__home_v_blocks_archive_card_variant";
  ALTER TABLE "_home_v_blocks_archive" ALTER COLUMN "card_variant" SET DATA TYPE "public"."enum__home_v_blocks_archive_card_variant" USING "card_variant"::"public"."enum__home_v_blocks_archive_card_variant";
  DROP TYPE "public"."enum_insights_index_hero_links_link_type";
  DROP TYPE "public"."enum_insights_index_hero_links_link_appearance";
  DROP TYPE "public"."enum_insights_index_hero_type";
  DROP TYPE "public"."enum_insights_index_status";
  DROP TYPE "public"."enum__insights_index_v_version_hero_links_link_type";
  DROP TYPE "public"."enum__insights_index_v_version_hero_links_link_appearance";
  DROP TYPE "public"."enum__insights_index_v_version_hero_type";
  DROP TYPE "public"."enum__insights_index_v_version_status";
  DROP TYPE "public"."enum_works_index_hero_links_link_type";
  DROP TYPE "public"."enum_works_index_hero_links_link_appearance";
  DROP TYPE "public"."enum_works_index_hero_type";
  DROP TYPE "public"."enum_works_index_status";
  DROP TYPE "public"."enum__works_index_v_version_hero_links_link_type";
  DROP TYPE "public"."enum__works_index_v_version_hero_links_link_appearance";
  DROP TYPE "public"."enum__works_index_v_version_hero_type";
  DROP TYPE "public"."enum__works_index_v_version_status";`)
}
