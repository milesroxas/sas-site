import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_expertise_pages_hero_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_expertise_pages_hero_links_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum_expertise_pages_blocks_cta_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_expertise_pages_blocks_cta_links_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum_expertise_pages_blocks_content_columns_size" AS ENUM('oneThird', 'half', 'twoThirds', 'full');
  CREATE TYPE "public"."enum_expertise_pages_blocks_content_columns_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_expertise_pages_blocks_content_columns_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum_expertise_pages_blocks_archive_populate_by" AS ENUM('collection', 'selection');
  CREATE TYPE "public"."enum_expertise_pages_blocks_archive_relation_to" AS ENUM('posts');
  CREATE TYPE "public"."enum_expertise_pages_hero_type" AS ENUM('none', 'highImpact', 'mediumImpact', 'lowImpact');
  CREATE TYPE "public"."enum_expertise_pages_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__expertise_pages_v_version_hero_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__expertise_pages_v_version_hero_links_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum__expertise_pages_v_blocks_cta_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__expertise_pages_v_blocks_cta_links_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum__expertise_pages_v_blocks_content_columns_size" AS ENUM('oneThird', 'half', 'twoThirds', 'full');
  CREATE TYPE "public"."enum__expertise_pages_v_blocks_content_columns_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__expertise_pages_v_blocks_content_columns_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum__expertise_pages_v_blocks_archive_populate_by" AS ENUM('collection', 'selection');
  CREATE TYPE "public"."enum__expertise_pages_v_blocks_archive_relation_to" AS ENUM('posts');
  CREATE TYPE "public"."enum__expertise_pages_v_version_hero_type" AS ENUM('none', 'highImpact', 'mediumImpact', 'lowImpact');
  CREATE TYPE "public"."enum__expertise_pages_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_audience_pages_hero_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_audience_pages_hero_links_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum_audience_pages_blocks_cta_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_audience_pages_blocks_cta_links_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum_audience_pages_blocks_content_columns_size" AS ENUM('oneThird', 'half', 'twoThirds', 'full');
  CREATE TYPE "public"."enum_audience_pages_blocks_content_columns_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_audience_pages_blocks_content_columns_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum_audience_pages_blocks_archive_populate_by" AS ENUM('collection', 'selection');
  CREATE TYPE "public"."enum_audience_pages_blocks_archive_relation_to" AS ENUM('posts');
  CREATE TYPE "public"."enum_audience_pages_hero_type" AS ENUM('none', 'highImpact', 'mediumImpact', 'lowImpact');
  CREATE TYPE "public"."enum_audience_pages_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__audience_pages_v_version_hero_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__audience_pages_v_version_hero_links_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum__audience_pages_v_blocks_cta_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__audience_pages_v_blocks_cta_links_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum__audience_pages_v_blocks_content_columns_size" AS ENUM('oneThird', 'half', 'twoThirds', 'full');
  CREATE TYPE "public"."enum__audience_pages_v_blocks_content_columns_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__audience_pages_v_blocks_content_columns_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum__audience_pages_v_blocks_archive_populate_by" AS ENUM('collection', 'selection');
  CREATE TYPE "public"."enum__audience_pages_v_blocks_archive_relation_to" AS ENUM('posts');
  CREATE TYPE "public"."enum__audience_pages_v_version_hero_type" AS ENUM('none', 'highImpact', 'mediumImpact', 'lowImpact');
  CREATE TYPE "public"."enum__audience_pages_v_version_status" AS ENUM('draft', 'published');
  CREATE TABLE "expertise_pages_hero_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_expertise_pages_hero_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum_expertise_pages_hero_links_link_appearance" DEFAULT 'default'
  );
  
  CREATE TABLE "expertise_pages_blocks_cta_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_expertise_pages_blocks_cta_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum_expertise_pages_blocks_cta_links_link_appearance" DEFAULT 'default'
  );
  
  CREATE TABLE "expertise_pages_blocks_cta" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"rich_text" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "expertise_pages_blocks_content_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"size" "enum_expertise_pages_blocks_content_columns_size" DEFAULT 'oneThird',
  	"rich_text" jsonb,
  	"enable_link" boolean,
  	"link_type" "enum_expertise_pages_blocks_content_columns_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum_expertise_pages_blocks_content_columns_link_appearance" DEFAULT 'default'
  );
  
  CREATE TABLE "expertise_pages_blocks_content" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "expertise_pages_blocks_media_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE "expertise_pages_blocks_archive" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"intro_content" jsonb,
  	"populate_by" "enum_expertise_pages_blocks_archive_populate_by" DEFAULT 'collection',
  	"relation_to" "enum_expertise_pages_blocks_archive_relation_to" DEFAULT 'posts',
  	"limit" numeric DEFAULT 10,
  	"block_name" varchar
  );
  
  CREATE TABLE "expertise_pages_blocks_form_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"form_id" integer,
  	"enable_intro" boolean,
  	"intro_content" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "expertise_pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"hero_type" "enum_expertise_pages_hero_type" DEFAULT 'lowImpact',
  	"hero_rich_text" jsonb,
  	"hero_media_id" integer,
  	"editorial_notes" varchar,
  	"meta_title" varchar,
  	"meta_image_id" integer,
  	"meta_description" varchar,
  	"published_at" timestamp(3) with time zone,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_expertise_pages_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "expertise_pages_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"posts_id" integer,
  	"categories_id" integer,
  	"capabilities_id" integer,
  	"work_pages_id" integer
  );
  
  CREATE TABLE "_expertise_pages_v_version_hero_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_type" "enum__expertise_pages_v_version_hero_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum__expertise_pages_v_version_hero_links_link_appearance" DEFAULT 'default',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_expertise_pages_v_blocks_cta_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_type" "enum__expertise_pages_v_blocks_cta_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum__expertise_pages_v_blocks_cta_links_link_appearance" DEFAULT 'default',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_expertise_pages_v_blocks_cta" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"rich_text" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_expertise_pages_v_blocks_content_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"size" "enum__expertise_pages_v_blocks_content_columns_size" DEFAULT 'oneThird',
  	"rich_text" jsonb,
  	"enable_link" boolean,
  	"link_type" "enum__expertise_pages_v_blocks_content_columns_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum__expertise_pages_v_blocks_content_columns_link_appearance" DEFAULT 'default',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_expertise_pages_v_blocks_content" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_expertise_pages_v_blocks_media_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_expertise_pages_v_blocks_archive" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"intro_content" jsonb,
  	"populate_by" "enum__expertise_pages_v_blocks_archive_populate_by" DEFAULT 'collection',
  	"relation_to" "enum__expertise_pages_v_blocks_archive_relation_to" DEFAULT 'posts',
  	"limit" numeric DEFAULT 10,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_expertise_pages_v_blocks_form_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"form_id" integer,
  	"enable_intro" boolean,
  	"intro_content" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_expertise_pages_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_hero_type" "enum__expertise_pages_v_version_hero_type" DEFAULT 'lowImpact',
  	"version_hero_rich_text" jsonb,
  	"version_hero_media_id" integer,
  	"version_editorial_notes" varchar,
  	"version_meta_title" varchar,
  	"version_meta_image_id" integer,
  	"version_meta_description" varchar,
  	"version_published_at" timestamp(3) with time zone,
  	"version_generate_slug" boolean DEFAULT true,
  	"version_slug" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__expertise_pages_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_expertise_pages_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"posts_id" integer,
  	"categories_id" integer,
  	"capabilities_id" integer,
  	"work_pages_id" integer
  );
  
  CREATE TABLE "audience_pages_hero_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_audience_pages_hero_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum_audience_pages_hero_links_link_appearance" DEFAULT 'default'
  );
  
  CREATE TABLE "audience_pages_blocks_cta_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_audience_pages_blocks_cta_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum_audience_pages_blocks_cta_links_link_appearance" DEFAULT 'default'
  );
  
  CREATE TABLE "audience_pages_blocks_cta" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"rich_text" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "audience_pages_blocks_content_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"size" "enum_audience_pages_blocks_content_columns_size" DEFAULT 'oneThird',
  	"rich_text" jsonb,
  	"enable_link" boolean,
  	"link_type" "enum_audience_pages_blocks_content_columns_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum_audience_pages_blocks_content_columns_link_appearance" DEFAULT 'default'
  );
  
  CREATE TABLE "audience_pages_blocks_content" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "audience_pages_blocks_media_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE "audience_pages_blocks_archive" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"intro_content" jsonb,
  	"populate_by" "enum_audience_pages_blocks_archive_populate_by" DEFAULT 'collection',
  	"relation_to" "enum_audience_pages_blocks_archive_relation_to" DEFAULT 'posts',
  	"limit" numeric DEFAULT 10,
  	"block_name" varchar
  );
  
  CREATE TABLE "audience_pages_blocks_form_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"form_id" integer,
  	"enable_intro" boolean,
  	"intro_content" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "audience_pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"hero_type" "enum_audience_pages_hero_type" DEFAULT 'lowImpact',
  	"hero_rich_text" jsonb,
  	"hero_media_id" integer,
  	"editorial_notes" varchar,
  	"meta_title" varchar,
  	"meta_image_id" integer,
  	"meta_description" varchar,
  	"published_at" timestamp(3) with time zone,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_audience_pages_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "audience_pages_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"posts_id" integer,
  	"categories_id" integer,
  	"industries_id" integer,
  	"work_pages_id" integer
  );
  
  CREATE TABLE "_audience_pages_v_version_hero_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_type" "enum__audience_pages_v_version_hero_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum__audience_pages_v_version_hero_links_link_appearance" DEFAULT 'default',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_audience_pages_v_blocks_cta_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_type" "enum__audience_pages_v_blocks_cta_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum__audience_pages_v_blocks_cta_links_link_appearance" DEFAULT 'default',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_audience_pages_v_blocks_cta" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"rich_text" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_audience_pages_v_blocks_content_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"size" "enum__audience_pages_v_blocks_content_columns_size" DEFAULT 'oneThird',
  	"rich_text" jsonb,
  	"enable_link" boolean,
  	"link_type" "enum__audience_pages_v_blocks_content_columns_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum__audience_pages_v_blocks_content_columns_link_appearance" DEFAULT 'default',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_audience_pages_v_blocks_content" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_audience_pages_v_blocks_media_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_audience_pages_v_blocks_archive" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"intro_content" jsonb,
  	"populate_by" "enum__audience_pages_v_blocks_archive_populate_by" DEFAULT 'collection',
  	"relation_to" "enum__audience_pages_v_blocks_archive_relation_to" DEFAULT 'posts',
  	"limit" numeric DEFAULT 10,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_audience_pages_v_blocks_form_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"form_id" integer,
  	"enable_intro" boolean,
  	"intro_content" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_audience_pages_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_hero_type" "enum__audience_pages_v_version_hero_type" DEFAULT 'lowImpact',
  	"version_hero_rich_text" jsonb,
  	"version_hero_media_id" integer,
  	"version_editorial_notes" varchar,
  	"version_meta_title" varchar,
  	"version_meta_image_id" integer,
  	"version_meta_description" varchar,
  	"version_published_at" timestamp(3) with time zone,
  	"version_generate_slug" boolean DEFAULT true,
  	"version_slug" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__audience_pages_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_audience_pages_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"posts_id" integer,
  	"categories_id" integer,
  	"industries_id" integer,
  	"work_pages_id" integer
  );
  
  ALTER TABLE "categories" ADD COLUMN "description" varchar;
  ALTER TABLE "redirects_rels" ADD COLUMN "expertise_pages_id" integer;
  ALTER TABLE "redirects_rels" ADD COLUMN "audience_pages_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "expertise_pages_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "audience_pages_id" integer;
  ALTER TABLE "expertise_pages_hero_links" ADD CONSTRAINT "expertise_pages_hero_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."expertise_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "expertise_pages_blocks_cta_links" ADD CONSTRAINT "expertise_pages_blocks_cta_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."expertise_pages_blocks_cta"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "expertise_pages_blocks_cta" ADD CONSTRAINT "expertise_pages_blocks_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."expertise_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "expertise_pages_blocks_content_columns" ADD CONSTRAINT "expertise_pages_blocks_content_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."expertise_pages_blocks_content"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "expertise_pages_blocks_content" ADD CONSTRAINT "expertise_pages_blocks_content_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."expertise_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "expertise_pages_blocks_media_block" ADD CONSTRAINT "expertise_pages_blocks_media_block_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "expertise_pages_blocks_media_block" ADD CONSTRAINT "expertise_pages_blocks_media_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."expertise_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "expertise_pages_blocks_archive" ADD CONSTRAINT "expertise_pages_blocks_archive_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."expertise_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "expertise_pages_blocks_form_block" ADD CONSTRAINT "expertise_pages_blocks_form_block_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "expertise_pages_blocks_form_block" ADD CONSTRAINT "expertise_pages_blocks_form_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."expertise_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "expertise_pages" ADD CONSTRAINT "expertise_pages_hero_media_id_media_id_fk" FOREIGN KEY ("hero_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "expertise_pages" ADD CONSTRAINT "expertise_pages_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "expertise_pages_rels" ADD CONSTRAINT "expertise_pages_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."expertise_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "expertise_pages_rels" ADD CONSTRAINT "expertise_pages_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "expertise_pages_rels" ADD CONSTRAINT "expertise_pages_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "expertise_pages_rels" ADD CONSTRAINT "expertise_pages_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "expertise_pages_rels" ADD CONSTRAINT "expertise_pages_rels_capabilities_fk" FOREIGN KEY ("capabilities_id") REFERENCES "public"."capabilities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "expertise_pages_rels" ADD CONSTRAINT "expertise_pages_rels_work_pages_fk" FOREIGN KEY ("work_pages_id") REFERENCES "public"."work_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_expertise_pages_v_version_hero_links" ADD CONSTRAINT "_expertise_pages_v_version_hero_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_expertise_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_expertise_pages_v_blocks_cta_links" ADD CONSTRAINT "_expertise_pages_v_blocks_cta_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_expertise_pages_v_blocks_cta"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_expertise_pages_v_blocks_cta" ADD CONSTRAINT "_expertise_pages_v_blocks_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_expertise_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_expertise_pages_v_blocks_content_columns" ADD CONSTRAINT "_expertise_pages_v_blocks_content_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_expertise_pages_v_blocks_content"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_expertise_pages_v_blocks_content" ADD CONSTRAINT "_expertise_pages_v_blocks_content_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_expertise_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_expertise_pages_v_blocks_media_block" ADD CONSTRAINT "_expertise_pages_v_blocks_media_block_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_expertise_pages_v_blocks_media_block" ADD CONSTRAINT "_expertise_pages_v_blocks_media_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_expertise_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_expertise_pages_v_blocks_archive" ADD CONSTRAINT "_expertise_pages_v_blocks_archive_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_expertise_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_expertise_pages_v_blocks_form_block" ADD CONSTRAINT "_expertise_pages_v_blocks_form_block_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_expertise_pages_v_blocks_form_block" ADD CONSTRAINT "_expertise_pages_v_blocks_form_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_expertise_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_expertise_pages_v" ADD CONSTRAINT "_expertise_pages_v_parent_id_expertise_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."expertise_pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_expertise_pages_v" ADD CONSTRAINT "_expertise_pages_v_version_hero_media_id_media_id_fk" FOREIGN KEY ("version_hero_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_expertise_pages_v" ADD CONSTRAINT "_expertise_pages_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_expertise_pages_v_rels" ADD CONSTRAINT "_expertise_pages_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_expertise_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_expertise_pages_v_rels" ADD CONSTRAINT "_expertise_pages_v_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_expertise_pages_v_rels" ADD CONSTRAINT "_expertise_pages_v_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_expertise_pages_v_rels" ADD CONSTRAINT "_expertise_pages_v_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_expertise_pages_v_rels" ADD CONSTRAINT "_expertise_pages_v_rels_capabilities_fk" FOREIGN KEY ("capabilities_id") REFERENCES "public"."capabilities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_expertise_pages_v_rels" ADD CONSTRAINT "_expertise_pages_v_rels_work_pages_fk" FOREIGN KEY ("work_pages_id") REFERENCES "public"."work_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "audience_pages_hero_links" ADD CONSTRAINT "audience_pages_hero_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."audience_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "audience_pages_blocks_cta_links" ADD CONSTRAINT "audience_pages_blocks_cta_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."audience_pages_blocks_cta"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "audience_pages_blocks_cta" ADD CONSTRAINT "audience_pages_blocks_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."audience_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "audience_pages_blocks_content_columns" ADD CONSTRAINT "audience_pages_blocks_content_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."audience_pages_blocks_content"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "audience_pages_blocks_content" ADD CONSTRAINT "audience_pages_blocks_content_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."audience_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "audience_pages_blocks_media_block" ADD CONSTRAINT "audience_pages_blocks_media_block_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "audience_pages_blocks_media_block" ADD CONSTRAINT "audience_pages_blocks_media_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."audience_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "audience_pages_blocks_archive" ADD CONSTRAINT "audience_pages_blocks_archive_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."audience_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "audience_pages_blocks_form_block" ADD CONSTRAINT "audience_pages_blocks_form_block_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "audience_pages_blocks_form_block" ADD CONSTRAINT "audience_pages_blocks_form_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."audience_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "audience_pages" ADD CONSTRAINT "audience_pages_hero_media_id_media_id_fk" FOREIGN KEY ("hero_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "audience_pages" ADD CONSTRAINT "audience_pages_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "audience_pages_rels" ADD CONSTRAINT "audience_pages_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."audience_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "audience_pages_rels" ADD CONSTRAINT "audience_pages_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "audience_pages_rels" ADD CONSTRAINT "audience_pages_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "audience_pages_rels" ADD CONSTRAINT "audience_pages_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "audience_pages_rels" ADD CONSTRAINT "audience_pages_rels_industries_fk" FOREIGN KEY ("industries_id") REFERENCES "public"."industries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "audience_pages_rels" ADD CONSTRAINT "audience_pages_rels_work_pages_fk" FOREIGN KEY ("work_pages_id") REFERENCES "public"."work_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_audience_pages_v_version_hero_links" ADD CONSTRAINT "_audience_pages_v_version_hero_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_audience_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_audience_pages_v_blocks_cta_links" ADD CONSTRAINT "_audience_pages_v_blocks_cta_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_audience_pages_v_blocks_cta"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_audience_pages_v_blocks_cta" ADD CONSTRAINT "_audience_pages_v_blocks_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_audience_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_audience_pages_v_blocks_content_columns" ADD CONSTRAINT "_audience_pages_v_blocks_content_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_audience_pages_v_blocks_content"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_audience_pages_v_blocks_content" ADD CONSTRAINT "_audience_pages_v_blocks_content_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_audience_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_audience_pages_v_blocks_media_block" ADD CONSTRAINT "_audience_pages_v_blocks_media_block_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_audience_pages_v_blocks_media_block" ADD CONSTRAINT "_audience_pages_v_blocks_media_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_audience_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_audience_pages_v_blocks_archive" ADD CONSTRAINT "_audience_pages_v_blocks_archive_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_audience_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_audience_pages_v_blocks_form_block" ADD CONSTRAINT "_audience_pages_v_blocks_form_block_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_audience_pages_v_blocks_form_block" ADD CONSTRAINT "_audience_pages_v_blocks_form_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_audience_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_audience_pages_v" ADD CONSTRAINT "_audience_pages_v_parent_id_audience_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."audience_pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_audience_pages_v" ADD CONSTRAINT "_audience_pages_v_version_hero_media_id_media_id_fk" FOREIGN KEY ("version_hero_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_audience_pages_v" ADD CONSTRAINT "_audience_pages_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_audience_pages_v_rels" ADD CONSTRAINT "_audience_pages_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_audience_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_audience_pages_v_rels" ADD CONSTRAINT "_audience_pages_v_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_audience_pages_v_rels" ADD CONSTRAINT "_audience_pages_v_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_audience_pages_v_rels" ADD CONSTRAINT "_audience_pages_v_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_audience_pages_v_rels" ADD CONSTRAINT "_audience_pages_v_rels_industries_fk" FOREIGN KEY ("industries_id") REFERENCES "public"."industries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_audience_pages_v_rels" ADD CONSTRAINT "_audience_pages_v_rels_work_pages_fk" FOREIGN KEY ("work_pages_id") REFERENCES "public"."work_pages"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "expertise_pages_hero_links_order_idx" ON "expertise_pages_hero_links" USING btree ("_order");
  CREATE INDEX "expertise_pages_hero_links_parent_id_idx" ON "expertise_pages_hero_links" USING btree ("_parent_id");
  CREATE INDEX "expertise_pages_blocks_cta_links_order_idx" ON "expertise_pages_blocks_cta_links" USING btree ("_order");
  CREATE INDEX "expertise_pages_blocks_cta_links_parent_id_idx" ON "expertise_pages_blocks_cta_links" USING btree ("_parent_id");
  CREATE INDEX "expertise_pages_blocks_cta_order_idx" ON "expertise_pages_blocks_cta" USING btree ("_order");
  CREATE INDEX "expertise_pages_blocks_cta_parent_id_idx" ON "expertise_pages_blocks_cta" USING btree ("_parent_id");
  CREATE INDEX "expertise_pages_blocks_cta_path_idx" ON "expertise_pages_blocks_cta" USING btree ("_path");
  CREATE INDEX "expertise_pages_blocks_content_columns_order_idx" ON "expertise_pages_blocks_content_columns" USING btree ("_order");
  CREATE INDEX "expertise_pages_blocks_content_columns_parent_id_idx" ON "expertise_pages_blocks_content_columns" USING btree ("_parent_id");
  CREATE INDEX "expertise_pages_blocks_content_order_idx" ON "expertise_pages_blocks_content" USING btree ("_order");
  CREATE INDEX "expertise_pages_blocks_content_parent_id_idx" ON "expertise_pages_blocks_content" USING btree ("_parent_id");
  CREATE INDEX "expertise_pages_blocks_content_path_idx" ON "expertise_pages_blocks_content" USING btree ("_path");
  CREATE INDEX "expertise_pages_blocks_media_block_order_idx" ON "expertise_pages_blocks_media_block" USING btree ("_order");
  CREATE INDEX "expertise_pages_blocks_media_block_parent_id_idx" ON "expertise_pages_blocks_media_block" USING btree ("_parent_id");
  CREATE INDEX "expertise_pages_blocks_media_block_path_idx" ON "expertise_pages_blocks_media_block" USING btree ("_path");
  CREATE INDEX "expertise_pages_blocks_media_block_media_idx" ON "expertise_pages_blocks_media_block" USING btree ("media_id");
  CREATE INDEX "expertise_pages_blocks_archive_order_idx" ON "expertise_pages_blocks_archive" USING btree ("_order");
  CREATE INDEX "expertise_pages_blocks_archive_parent_id_idx" ON "expertise_pages_blocks_archive" USING btree ("_parent_id");
  CREATE INDEX "expertise_pages_blocks_archive_path_idx" ON "expertise_pages_blocks_archive" USING btree ("_path");
  CREATE INDEX "expertise_pages_blocks_form_block_order_idx" ON "expertise_pages_blocks_form_block" USING btree ("_order");
  CREATE INDEX "expertise_pages_blocks_form_block_parent_id_idx" ON "expertise_pages_blocks_form_block" USING btree ("_parent_id");
  CREATE INDEX "expertise_pages_blocks_form_block_path_idx" ON "expertise_pages_blocks_form_block" USING btree ("_path");
  CREATE INDEX "expertise_pages_blocks_form_block_form_idx" ON "expertise_pages_blocks_form_block" USING btree ("form_id");
  CREATE INDEX "expertise_pages_hero_hero_media_idx" ON "expertise_pages" USING btree ("hero_media_id");
  CREATE INDEX "expertise_pages_meta_meta_image_idx" ON "expertise_pages" USING btree ("meta_image_id");
  CREATE UNIQUE INDEX "expertise_pages_slug_idx" ON "expertise_pages" USING btree ("slug");
  CREATE INDEX "expertise_pages_updated_at_idx" ON "expertise_pages" USING btree ("updated_at");
  CREATE INDEX "expertise_pages_created_at_idx" ON "expertise_pages" USING btree ("created_at");
  CREATE INDEX "expertise_pages__status_idx" ON "expertise_pages" USING btree ("_status");
  CREATE INDEX "expertise_pages_rels_order_idx" ON "expertise_pages_rels" USING btree ("order");
  CREATE INDEX "expertise_pages_rels_parent_idx" ON "expertise_pages_rels" USING btree ("parent_id");
  CREATE INDEX "expertise_pages_rels_path_idx" ON "expertise_pages_rels" USING btree ("path");
  CREATE INDEX "expertise_pages_rels_pages_id_idx" ON "expertise_pages_rels" USING btree ("pages_id");
  CREATE INDEX "expertise_pages_rels_posts_id_idx" ON "expertise_pages_rels" USING btree ("posts_id");
  CREATE INDEX "expertise_pages_rels_categories_id_idx" ON "expertise_pages_rels" USING btree ("categories_id");
  CREATE INDEX "expertise_pages_rels_capabilities_id_idx" ON "expertise_pages_rels" USING btree ("capabilities_id");
  CREATE INDEX "expertise_pages_rels_work_pages_id_idx" ON "expertise_pages_rels" USING btree ("work_pages_id");
  CREATE INDEX "_expertise_pages_v_version_hero_links_order_idx" ON "_expertise_pages_v_version_hero_links" USING btree ("_order");
  CREATE INDEX "_expertise_pages_v_version_hero_links_parent_id_idx" ON "_expertise_pages_v_version_hero_links" USING btree ("_parent_id");
  CREATE INDEX "_expertise_pages_v_blocks_cta_links_order_idx" ON "_expertise_pages_v_blocks_cta_links" USING btree ("_order");
  CREATE INDEX "_expertise_pages_v_blocks_cta_links_parent_id_idx" ON "_expertise_pages_v_blocks_cta_links" USING btree ("_parent_id");
  CREATE INDEX "_expertise_pages_v_blocks_cta_order_idx" ON "_expertise_pages_v_blocks_cta" USING btree ("_order");
  CREATE INDEX "_expertise_pages_v_blocks_cta_parent_id_idx" ON "_expertise_pages_v_blocks_cta" USING btree ("_parent_id");
  CREATE INDEX "_expertise_pages_v_blocks_cta_path_idx" ON "_expertise_pages_v_blocks_cta" USING btree ("_path");
  CREATE INDEX "_expertise_pages_v_blocks_content_columns_order_idx" ON "_expertise_pages_v_blocks_content_columns" USING btree ("_order");
  CREATE INDEX "_expertise_pages_v_blocks_content_columns_parent_id_idx" ON "_expertise_pages_v_blocks_content_columns" USING btree ("_parent_id");
  CREATE INDEX "_expertise_pages_v_blocks_content_order_idx" ON "_expertise_pages_v_blocks_content" USING btree ("_order");
  CREATE INDEX "_expertise_pages_v_blocks_content_parent_id_idx" ON "_expertise_pages_v_blocks_content" USING btree ("_parent_id");
  CREATE INDEX "_expertise_pages_v_blocks_content_path_idx" ON "_expertise_pages_v_blocks_content" USING btree ("_path");
  CREATE INDEX "_expertise_pages_v_blocks_media_block_order_idx" ON "_expertise_pages_v_blocks_media_block" USING btree ("_order");
  CREATE INDEX "_expertise_pages_v_blocks_media_block_parent_id_idx" ON "_expertise_pages_v_blocks_media_block" USING btree ("_parent_id");
  CREATE INDEX "_expertise_pages_v_blocks_media_block_path_idx" ON "_expertise_pages_v_blocks_media_block" USING btree ("_path");
  CREATE INDEX "_expertise_pages_v_blocks_media_block_media_idx" ON "_expertise_pages_v_blocks_media_block" USING btree ("media_id");
  CREATE INDEX "_expertise_pages_v_blocks_archive_order_idx" ON "_expertise_pages_v_blocks_archive" USING btree ("_order");
  CREATE INDEX "_expertise_pages_v_blocks_archive_parent_id_idx" ON "_expertise_pages_v_blocks_archive" USING btree ("_parent_id");
  CREATE INDEX "_expertise_pages_v_blocks_archive_path_idx" ON "_expertise_pages_v_blocks_archive" USING btree ("_path");
  CREATE INDEX "_expertise_pages_v_blocks_form_block_order_idx" ON "_expertise_pages_v_blocks_form_block" USING btree ("_order");
  CREATE INDEX "_expertise_pages_v_blocks_form_block_parent_id_idx" ON "_expertise_pages_v_blocks_form_block" USING btree ("_parent_id");
  CREATE INDEX "_expertise_pages_v_blocks_form_block_path_idx" ON "_expertise_pages_v_blocks_form_block" USING btree ("_path");
  CREATE INDEX "_expertise_pages_v_blocks_form_block_form_idx" ON "_expertise_pages_v_blocks_form_block" USING btree ("form_id");
  CREATE INDEX "_expertise_pages_v_parent_idx" ON "_expertise_pages_v" USING btree ("parent_id");
  CREATE INDEX "_expertise_pages_v_version_hero_version_hero_media_idx" ON "_expertise_pages_v" USING btree ("version_hero_media_id");
  CREATE INDEX "_expertise_pages_v_version_meta_version_meta_image_idx" ON "_expertise_pages_v" USING btree ("version_meta_image_id");
  CREATE INDEX "_expertise_pages_v_version_version_slug_idx" ON "_expertise_pages_v" USING btree ("version_slug");
  CREATE INDEX "_expertise_pages_v_version_version_updated_at_idx" ON "_expertise_pages_v" USING btree ("version_updated_at");
  CREATE INDEX "_expertise_pages_v_version_version_created_at_idx" ON "_expertise_pages_v" USING btree ("version_created_at");
  CREATE INDEX "_expertise_pages_v_version_version__status_idx" ON "_expertise_pages_v" USING btree ("version__status");
  CREATE INDEX "_expertise_pages_v_created_at_idx" ON "_expertise_pages_v" USING btree ("created_at");
  CREATE INDEX "_expertise_pages_v_updated_at_idx" ON "_expertise_pages_v" USING btree ("updated_at");
  CREATE INDEX "_expertise_pages_v_latest_idx" ON "_expertise_pages_v" USING btree ("latest");
  CREATE INDEX "_expertise_pages_v_autosave_idx" ON "_expertise_pages_v" USING btree ("autosave");
  CREATE INDEX "_expertise_pages_v_rels_order_idx" ON "_expertise_pages_v_rels" USING btree ("order");
  CREATE INDEX "_expertise_pages_v_rels_parent_idx" ON "_expertise_pages_v_rels" USING btree ("parent_id");
  CREATE INDEX "_expertise_pages_v_rels_path_idx" ON "_expertise_pages_v_rels" USING btree ("path");
  CREATE INDEX "_expertise_pages_v_rels_pages_id_idx" ON "_expertise_pages_v_rels" USING btree ("pages_id");
  CREATE INDEX "_expertise_pages_v_rels_posts_id_idx" ON "_expertise_pages_v_rels" USING btree ("posts_id");
  CREATE INDEX "_expertise_pages_v_rels_categories_id_idx" ON "_expertise_pages_v_rels" USING btree ("categories_id");
  CREATE INDEX "_expertise_pages_v_rels_capabilities_id_idx" ON "_expertise_pages_v_rels" USING btree ("capabilities_id");
  CREATE INDEX "_expertise_pages_v_rels_work_pages_id_idx" ON "_expertise_pages_v_rels" USING btree ("work_pages_id");
  CREATE INDEX "audience_pages_hero_links_order_idx" ON "audience_pages_hero_links" USING btree ("_order");
  CREATE INDEX "audience_pages_hero_links_parent_id_idx" ON "audience_pages_hero_links" USING btree ("_parent_id");
  CREATE INDEX "audience_pages_blocks_cta_links_order_idx" ON "audience_pages_blocks_cta_links" USING btree ("_order");
  CREATE INDEX "audience_pages_blocks_cta_links_parent_id_idx" ON "audience_pages_blocks_cta_links" USING btree ("_parent_id");
  CREATE INDEX "audience_pages_blocks_cta_order_idx" ON "audience_pages_blocks_cta" USING btree ("_order");
  CREATE INDEX "audience_pages_blocks_cta_parent_id_idx" ON "audience_pages_blocks_cta" USING btree ("_parent_id");
  CREATE INDEX "audience_pages_blocks_cta_path_idx" ON "audience_pages_blocks_cta" USING btree ("_path");
  CREATE INDEX "audience_pages_blocks_content_columns_order_idx" ON "audience_pages_blocks_content_columns" USING btree ("_order");
  CREATE INDEX "audience_pages_blocks_content_columns_parent_id_idx" ON "audience_pages_blocks_content_columns" USING btree ("_parent_id");
  CREATE INDEX "audience_pages_blocks_content_order_idx" ON "audience_pages_blocks_content" USING btree ("_order");
  CREATE INDEX "audience_pages_blocks_content_parent_id_idx" ON "audience_pages_blocks_content" USING btree ("_parent_id");
  CREATE INDEX "audience_pages_blocks_content_path_idx" ON "audience_pages_blocks_content" USING btree ("_path");
  CREATE INDEX "audience_pages_blocks_media_block_order_idx" ON "audience_pages_blocks_media_block" USING btree ("_order");
  CREATE INDEX "audience_pages_blocks_media_block_parent_id_idx" ON "audience_pages_blocks_media_block" USING btree ("_parent_id");
  CREATE INDEX "audience_pages_blocks_media_block_path_idx" ON "audience_pages_blocks_media_block" USING btree ("_path");
  CREATE INDEX "audience_pages_blocks_media_block_media_idx" ON "audience_pages_blocks_media_block" USING btree ("media_id");
  CREATE INDEX "audience_pages_blocks_archive_order_idx" ON "audience_pages_blocks_archive" USING btree ("_order");
  CREATE INDEX "audience_pages_blocks_archive_parent_id_idx" ON "audience_pages_blocks_archive" USING btree ("_parent_id");
  CREATE INDEX "audience_pages_blocks_archive_path_idx" ON "audience_pages_blocks_archive" USING btree ("_path");
  CREATE INDEX "audience_pages_blocks_form_block_order_idx" ON "audience_pages_blocks_form_block" USING btree ("_order");
  CREATE INDEX "audience_pages_blocks_form_block_parent_id_idx" ON "audience_pages_blocks_form_block" USING btree ("_parent_id");
  CREATE INDEX "audience_pages_blocks_form_block_path_idx" ON "audience_pages_blocks_form_block" USING btree ("_path");
  CREATE INDEX "audience_pages_blocks_form_block_form_idx" ON "audience_pages_blocks_form_block" USING btree ("form_id");
  CREATE INDEX "audience_pages_hero_hero_media_idx" ON "audience_pages" USING btree ("hero_media_id");
  CREATE INDEX "audience_pages_meta_meta_image_idx" ON "audience_pages" USING btree ("meta_image_id");
  CREATE UNIQUE INDEX "audience_pages_slug_idx" ON "audience_pages" USING btree ("slug");
  CREATE INDEX "audience_pages_updated_at_idx" ON "audience_pages" USING btree ("updated_at");
  CREATE INDEX "audience_pages_created_at_idx" ON "audience_pages" USING btree ("created_at");
  CREATE INDEX "audience_pages__status_idx" ON "audience_pages" USING btree ("_status");
  CREATE INDEX "audience_pages_rels_order_idx" ON "audience_pages_rels" USING btree ("order");
  CREATE INDEX "audience_pages_rels_parent_idx" ON "audience_pages_rels" USING btree ("parent_id");
  CREATE INDEX "audience_pages_rels_path_idx" ON "audience_pages_rels" USING btree ("path");
  CREATE INDEX "audience_pages_rels_pages_id_idx" ON "audience_pages_rels" USING btree ("pages_id");
  CREATE INDEX "audience_pages_rels_posts_id_idx" ON "audience_pages_rels" USING btree ("posts_id");
  CREATE INDEX "audience_pages_rels_categories_id_idx" ON "audience_pages_rels" USING btree ("categories_id");
  CREATE INDEX "audience_pages_rels_industries_id_idx" ON "audience_pages_rels" USING btree ("industries_id");
  CREATE INDEX "audience_pages_rels_work_pages_id_idx" ON "audience_pages_rels" USING btree ("work_pages_id");
  CREATE INDEX "_audience_pages_v_version_hero_links_order_idx" ON "_audience_pages_v_version_hero_links" USING btree ("_order");
  CREATE INDEX "_audience_pages_v_version_hero_links_parent_id_idx" ON "_audience_pages_v_version_hero_links" USING btree ("_parent_id");
  CREATE INDEX "_audience_pages_v_blocks_cta_links_order_idx" ON "_audience_pages_v_blocks_cta_links" USING btree ("_order");
  CREATE INDEX "_audience_pages_v_blocks_cta_links_parent_id_idx" ON "_audience_pages_v_blocks_cta_links" USING btree ("_parent_id");
  CREATE INDEX "_audience_pages_v_blocks_cta_order_idx" ON "_audience_pages_v_blocks_cta" USING btree ("_order");
  CREATE INDEX "_audience_pages_v_blocks_cta_parent_id_idx" ON "_audience_pages_v_blocks_cta" USING btree ("_parent_id");
  CREATE INDEX "_audience_pages_v_blocks_cta_path_idx" ON "_audience_pages_v_blocks_cta" USING btree ("_path");
  CREATE INDEX "_audience_pages_v_blocks_content_columns_order_idx" ON "_audience_pages_v_blocks_content_columns" USING btree ("_order");
  CREATE INDEX "_audience_pages_v_blocks_content_columns_parent_id_idx" ON "_audience_pages_v_blocks_content_columns" USING btree ("_parent_id");
  CREATE INDEX "_audience_pages_v_blocks_content_order_idx" ON "_audience_pages_v_blocks_content" USING btree ("_order");
  CREATE INDEX "_audience_pages_v_blocks_content_parent_id_idx" ON "_audience_pages_v_blocks_content" USING btree ("_parent_id");
  CREATE INDEX "_audience_pages_v_blocks_content_path_idx" ON "_audience_pages_v_blocks_content" USING btree ("_path");
  CREATE INDEX "_audience_pages_v_blocks_media_block_order_idx" ON "_audience_pages_v_blocks_media_block" USING btree ("_order");
  CREATE INDEX "_audience_pages_v_blocks_media_block_parent_id_idx" ON "_audience_pages_v_blocks_media_block" USING btree ("_parent_id");
  CREATE INDEX "_audience_pages_v_blocks_media_block_path_idx" ON "_audience_pages_v_blocks_media_block" USING btree ("_path");
  CREATE INDEX "_audience_pages_v_blocks_media_block_media_idx" ON "_audience_pages_v_blocks_media_block" USING btree ("media_id");
  CREATE INDEX "_audience_pages_v_blocks_archive_order_idx" ON "_audience_pages_v_blocks_archive" USING btree ("_order");
  CREATE INDEX "_audience_pages_v_blocks_archive_parent_id_idx" ON "_audience_pages_v_blocks_archive" USING btree ("_parent_id");
  CREATE INDEX "_audience_pages_v_blocks_archive_path_idx" ON "_audience_pages_v_blocks_archive" USING btree ("_path");
  CREATE INDEX "_audience_pages_v_blocks_form_block_order_idx" ON "_audience_pages_v_blocks_form_block" USING btree ("_order");
  CREATE INDEX "_audience_pages_v_blocks_form_block_parent_id_idx" ON "_audience_pages_v_blocks_form_block" USING btree ("_parent_id");
  CREATE INDEX "_audience_pages_v_blocks_form_block_path_idx" ON "_audience_pages_v_blocks_form_block" USING btree ("_path");
  CREATE INDEX "_audience_pages_v_blocks_form_block_form_idx" ON "_audience_pages_v_blocks_form_block" USING btree ("form_id");
  CREATE INDEX "_audience_pages_v_parent_idx" ON "_audience_pages_v" USING btree ("parent_id");
  CREATE INDEX "_audience_pages_v_version_hero_version_hero_media_idx" ON "_audience_pages_v" USING btree ("version_hero_media_id");
  CREATE INDEX "_audience_pages_v_version_meta_version_meta_image_idx" ON "_audience_pages_v" USING btree ("version_meta_image_id");
  CREATE INDEX "_audience_pages_v_version_version_slug_idx" ON "_audience_pages_v" USING btree ("version_slug");
  CREATE INDEX "_audience_pages_v_version_version_updated_at_idx" ON "_audience_pages_v" USING btree ("version_updated_at");
  CREATE INDEX "_audience_pages_v_version_version_created_at_idx" ON "_audience_pages_v" USING btree ("version_created_at");
  CREATE INDEX "_audience_pages_v_version_version__status_idx" ON "_audience_pages_v" USING btree ("version__status");
  CREATE INDEX "_audience_pages_v_created_at_idx" ON "_audience_pages_v" USING btree ("created_at");
  CREATE INDEX "_audience_pages_v_updated_at_idx" ON "_audience_pages_v" USING btree ("updated_at");
  CREATE INDEX "_audience_pages_v_latest_idx" ON "_audience_pages_v" USING btree ("latest");
  CREATE INDEX "_audience_pages_v_autosave_idx" ON "_audience_pages_v" USING btree ("autosave");
  CREATE INDEX "_audience_pages_v_rels_order_idx" ON "_audience_pages_v_rels" USING btree ("order");
  CREATE INDEX "_audience_pages_v_rels_parent_idx" ON "_audience_pages_v_rels" USING btree ("parent_id");
  CREATE INDEX "_audience_pages_v_rels_path_idx" ON "_audience_pages_v_rels" USING btree ("path");
  CREATE INDEX "_audience_pages_v_rels_pages_id_idx" ON "_audience_pages_v_rels" USING btree ("pages_id");
  CREATE INDEX "_audience_pages_v_rels_posts_id_idx" ON "_audience_pages_v_rels" USING btree ("posts_id");
  CREATE INDEX "_audience_pages_v_rels_categories_id_idx" ON "_audience_pages_v_rels" USING btree ("categories_id");
  CREATE INDEX "_audience_pages_v_rels_industries_id_idx" ON "_audience_pages_v_rels" USING btree ("industries_id");
  CREATE INDEX "_audience_pages_v_rels_work_pages_id_idx" ON "_audience_pages_v_rels" USING btree ("work_pages_id");
  ALTER TABLE "redirects_rels" ADD CONSTRAINT "redirects_rels_expertise_pages_fk" FOREIGN KEY ("expertise_pages_id") REFERENCES "public"."expertise_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "redirects_rels" ADD CONSTRAINT "redirects_rels_audience_pages_fk" FOREIGN KEY ("audience_pages_id") REFERENCES "public"."audience_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_expertise_pages_fk" FOREIGN KEY ("expertise_pages_id") REFERENCES "public"."expertise_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_audience_pages_fk" FOREIGN KEY ("audience_pages_id") REFERENCES "public"."audience_pages"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "redirects_rels_expertise_pages_id_idx" ON "redirects_rels" USING btree ("expertise_pages_id");
  CREATE INDEX "redirects_rels_audience_pages_id_idx" ON "redirects_rels" USING btree ("audience_pages_id");
  CREATE INDEX "payload_locked_documents_rels_expertise_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("expertise_pages_id");
  CREATE INDEX "payload_locked_documents_rels_audience_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("audience_pages_id");`)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "expertise_pages_hero_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "expertise_pages_blocks_cta_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "expertise_pages_blocks_cta" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "expertise_pages_blocks_content_columns" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "expertise_pages_blocks_content" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "expertise_pages_blocks_media_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "expertise_pages_blocks_archive" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "expertise_pages_blocks_form_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "expertise_pages" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "expertise_pages_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_expertise_pages_v_version_hero_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_expertise_pages_v_blocks_cta_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_expertise_pages_v_blocks_cta" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_expertise_pages_v_blocks_content_columns" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_expertise_pages_v_blocks_content" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_expertise_pages_v_blocks_media_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_expertise_pages_v_blocks_archive" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_expertise_pages_v_blocks_form_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_expertise_pages_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_expertise_pages_v_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "audience_pages_hero_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "audience_pages_blocks_cta_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "audience_pages_blocks_cta" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "audience_pages_blocks_content_columns" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "audience_pages_blocks_content" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "audience_pages_blocks_media_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "audience_pages_blocks_archive" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "audience_pages_blocks_form_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "audience_pages" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "audience_pages_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_audience_pages_v_version_hero_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_audience_pages_v_blocks_cta_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_audience_pages_v_blocks_cta" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_audience_pages_v_blocks_content_columns" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_audience_pages_v_blocks_content" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_audience_pages_v_blocks_media_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_audience_pages_v_blocks_archive" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_audience_pages_v_blocks_form_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_audience_pages_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_audience_pages_v_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "expertise_pages_hero_links" CASCADE;
  DROP TABLE "expertise_pages_blocks_cta_links" CASCADE;
  DROP TABLE "expertise_pages_blocks_cta" CASCADE;
  DROP TABLE "expertise_pages_blocks_content_columns" CASCADE;
  DROP TABLE "expertise_pages_blocks_content" CASCADE;
  DROP TABLE "expertise_pages_blocks_media_block" CASCADE;
  DROP TABLE "expertise_pages_blocks_archive" CASCADE;
  DROP TABLE "expertise_pages_blocks_form_block" CASCADE;
  DROP TABLE "expertise_pages" CASCADE;
  DROP TABLE "expertise_pages_rels" CASCADE;
  DROP TABLE "_expertise_pages_v_version_hero_links" CASCADE;
  DROP TABLE "_expertise_pages_v_blocks_cta_links" CASCADE;
  DROP TABLE "_expertise_pages_v_blocks_cta" CASCADE;
  DROP TABLE "_expertise_pages_v_blocks_content_columns" CASCADE;
  DROP TABLE "_expertise_pages_v_blocks_content" CASCADE;
  DROP TABLE "_expertise_pages_v_blocks_media_block" CASCADE;
  DROP TABLE "_expertise_pages_v_blocks_archive" CASCADE;
  DROP TABLE "_expertise_pages_v_blocks_form_block" CASCADE;
  DROP TABLE "_expertise_pages_v" CASCADE;
  DROP TABLE "_expertise_pages_v_rels" CASCADE;
  DROP TABLE "audience_pages_hero_links" CASCADE;
  DROP TABLE "audience_pages_blocks_cta_links" CASCADE;
  DROP TABLE "audience_pages_blocks_cta" CASCADE;
  DROP TABLE "audience_pages_blocks_content_columns" CASCADE;
  DROP TABLE "audience_pages_blocks_content" CASCADE;
  DROP TABLE "audience_pages_blocks_media_block" CASCADE;
  DROP TABLE "audience_pages_blocks_archive" CASCADE;
  DROP TABLE "audience_pages_blocks_form_block" CASCADE;
  DROP TABLE "audience_pages" CASCADE;
  DROP TABLE "audience_pages_rels" CASCADE;
  DROP TABLE "_audience_pages_v_version_hero_links" CASCADE;
  DROP TABLE "_audience_pages_v_blocks_cta_links" CASCADE;
  DROP TABLE "_audience_pages_v_blocks_cta" CASCADE;
  DROP TABLE "_audience_pages_v_blocks_content_columns" CASCADE;
  DROP TABLE "_audience_pages_v_blocks_content" CASCADE;
  DROP TABLE "_audience_pages_v_blocks_media_block" CASCADE;
  DROP TABLE "_audience_pages_v_blocks_archive" CASCADE;
  DROP TABLE "_audience_pages_v_blocks_form_block" CASCADE;
  DROP TABLE "_audience_pages_v" CASCADE;
  DROP TABLE "_audience_pages_v_rels" CASCADE;
  ALTER TABLE "redirects_rels" DROP CONSTRAINT "redirects_rels_expertise_pages_fk";
  
  ALTER TABLE "redirects_rels" DROP CONSTRAINT "redirects_rels_audience_pages_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_expertise_pages_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_audience_pages_fk";
  
  DROP INDEX "redirects_rels_expertise_pages_id_idx";
  DROP INDEX "redirects_rels_audience_pages_id_idx";
  DROP INDEX "payload_locked_documents_rels_expertise_pages_id_idx";
  DROP INDEX "payload_locked_documents_rels_audience_pages_id_idx";
  ALTER TABLE "categories" DROP COLUMN "description";
  ALTER TABLE "redirects_rels" DROP COLUMN "expertise_pages_id";
  ALTER TABLE "redirects_rels" DROP COLUMN "audience_pages_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "expertise_pages_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "audience_pages_id";
  DROP TYPE "public"."enum_expertise_pages_hero_links_link_type";
  DROP TYPE "public"."enum_expertise_pages_hero_links_link_appearance";
  DROP TYPE "public"."enum_expertise_pages_blocks_cta_links_link_type";
  DROP TYPE "public"."enum_expertise_pages_blocks_cta_links_link_appearance";
  DROP TYPE "public"."enum_expertise_pages_blocks_content_columns_size";
  DROP TYPE "public"."enum_expertise_pages_blocks_content_columns_link_type";
  DROP TYPE "public"."enum_expertise_pages_blocks_content_columns_link_appearance";
  DROP TYPE "public"."enum_expertise_pages_blocks_archive_populate_by";
  DROP TYPE "public"."enum_expertise_pages_blocks_archive_relation_to";
  DROP TYPE "public"."enum_expertise_pages_hero_type";
  DROP TYPE "public"."enum_expertise_pages_status";
  DROP TYPE "public"."enum__expertise_pages_v_version_hero_links_link_type";
  DROP TYPE "public"."enum__expertise_pages_v_version_hero_links_link_appearance";
  DROP TYPE "public"."enum__expertise_pages_v_blocks_cta_links_link_type";
  DROP TYPE "public"."enum__expertise_pages_v_blocks_cta_links_link_appearance";
  DROP TYPE "public"."enum__expertise_pages_v_blocks_content_columns_size";
  DROP TYPE "public"."enum__expertise_pages_v_blocks_content_columns_link_type";
  DROP TYPE "public"."enum__expertise_pages_v_blocks_content_columns_link_appearance";
  DROP TYPE "public"."enum__expertise_pages_v_blocks_archive_populate_by";
  DROP TYPE "public"."enum__expertise_pages_v_blocks_archive_relation_to";
  DROP TYPE "public"."enum__expertise_pages_v_version_hero_type";
  DROP TYPE "public"."enum__expertise_pages_v_version_status";
  DROP TYPE "public"."enum_audience_pages_hero_links_link_type";
  DROP TYPE "public"."enum_audience_pages_hero_links_link_appearance";
  DROP TYPE "public"."enum_audience_pages_blocks_cta_links_link_type";
  DROP TYPE "public"."enum_audience_pages_blocks_cta_links_link_appearance";
  DROP TYPE "public"."enum_audience_pages_blocks_content_columns_size";
  DROP TYPE "public"."enum_audience_pages_blocks_content_columns_link_type";
  DROP TYPE "public"."enum_audience_pages_blocks_content_columns_link_appearance";
  DROP TYPE "public"."enum_audience_pages_blocks_archive_populate_by";
  DROP TYPE "public"."enum_audience_pages_blocks_archive_relation_to";
  DROP TYPE "public"."enum_audience_pages_hero_type";
  DROP TYPE "public"."enum_audience_pages_status";
  DROP TYPE "public"."enum__audience_pages_v_version_hero_links_link_type";
  DROP TYPE "public"."enum__audience_pages_v_version_hero_links_link_appearance";
  DROP TYPE "public"."enum__audience_pages_v_blocks_cta_links_link_type";
  DROP TYPE "public"."enum__audience_pages_v_blocks_cta_links_link_appearance";
  DROP TYPE "public"."enum__audience_pages_v_blocks_content_columns_size";
  DROP TYPE "public"."enum__audience_pages_v_blocks_content_columns_link_type";
  DROP TYPE "public"."enum__audience_pages_v_blocks_content_columns_link_appearance";
  DROP TYPE "public"."enum__audience_pages_v_blocks_archive_populate_by";
  DROP TYPE "public"."enum__audience_pages_v_blocks_archive_relation_to";
  DROP TYPE "public"."enum__audience_pages_v_version_hero_type";
  DROP TYPE "public"."enum__audience_pages_v_version_status";`)
}
