import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_contact_pages_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__contact_pages_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_forms_blocks_checkbox_maps_to" AS ENUM('name', 'email', 'company', 'website', 'capabilities', 'budget', 'timeline', 'message');
  CREATE TYPE "public"."enum_forms_blocks_email_maps_to" AS ENUM('name', 'email', 'company', 'website', 'capabilities', 'budget', 'timeline', 'message');
  CREATE TYPE "public"."enum_forms_blocks_number_maps_to" AS ENUM('name', 'email', 'company', 'website', 'capabilities', 'budget', 'timeline', 'message');
  CREATE TYPE "public"."enum_forms_blocks_select_maps_to" AS ENUM('name', 'email', 'company', 'website', 'capabilities', 'budget', 'timeline', 'message');
  CREATE TYPE "public"."enum_forms_blocks_state_maps_to" AS ENUM('name', 'email', 'company', 'website', 'capabilities', 'budget', 'timeline', 'message');
  CREATE TYPE "public"."enum_forms_blocks_text_maps_to" AS ENUM('name', 'email', 'company', 'website', 'capabilities', 'budget', 'timeline', 'message');
  CREATE TYPE "public"."enum_forms_blocks_textarea_maps_to" AS ENUM('name', 'email', 'company', 'website', 'capabilities', 'budget', 'timeline', 'message');
  CREATE TYPE "public"."enum_forms_blocks_capabilities_maps_to" AS ENUM('name', 'email', 'company', 'website', 'capabilities', 'budget', 'timeline', 'message');
  CREATE TYPE "public"."enum_forms_delivery" AS ENUM('submissions', 'inquiries');
  CREATE TYPE "public"."enum_forms_inquiry_type" AS ENUM('project', 'general');
  CREATE TABLE "contact_pages_details" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"term" varchar,
  	"value" varchar
  );
  
  CREATE TABLE "contact_pages_next_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "contact_pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"eyebrow" varchar DEFAULT 'Project inquiry',
  	"heading" varchar DEFAULT 'Got a project in mind?',
  	"lead" varchar DEFAULT 'Send some details over and we''ll let you know how we can help.',
  	"next_steps_title" varchar DEFAULT 'What happens next',
  	"alt_cta_enabled" boolean DEFAULT true,
  	"alt_cta_body" varchar DEFAULT 'Rather talk it through first?',
  	"alt_cta_label" varchar DEFAULT 'Schedule a call',
  	"alt_cta_url" varchar,
  	"form_id" integer,
  	"submit_note" varchar DEFAULT 'We read every one. No sales sequence, no newsletter.',
  	"sent_eyebrow" varchar DEFAULT 'Inquiry received',
  	"sent_heading" varchar DEFAULT 'Thanks, it''s in.',
  	"sent_body" varchar DEFAULT '{name}, a partner is reading your brief. You''ll hear back {responseTime}.',
  	"sent_reference_label" varchar DEFAULT 'Reference',
  	"sent_sent_label" varchar DEFAULT 'Sent',
  	"sent_copy_label" varchar DEFAULT 'Copy to',
  	"sent_summary_title" varchar DEFAULT 'What you sent',
  	"sent_edit_label" varchar DEFAULT 'Edit and resend',
  	"sent_alt_body" varchar DEFAULT 'Want to skip ahead? Put 30 minutes on the calendar.',
  	"meta_title" varchar,
  	"meta_image_id" integer,
  	"meta_description" varchar,
  	"meta_og_title" varchar,
  	"meta_og_description" varchar,
  	"meta_og_image_id" integer,
  	"published_at" timestamp(3) with time zone,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_contact_pages_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_contact_pages_v_version_details" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"term" varchar,
  	"value" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_contact_pages_v_version_next_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_contact_pages_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_eyebrow" varchar DEFAULT 'Project inquiry',
  	"version_heading" varchar DEFAULT 'Got a project in mind?',
  	"version_lead" varchar DEFAULT 'Send some details over and we''ll let you know how we can help.',
  	"version_next_steps_title" varchar DEFAULT 'What happens next',
  	"version_alt_cta_enabled" boolean DEFAULT true,
  	"version_alt_cta_body" varchar DEFAULT 'Rather talk it through first?',
  	"version_alt_cta_label" varchar DEFAULT 'Schedule a call',
  	"version_alt_cta_url" varchar,
  	"version_form_id" integer,
  	"version_submit_note" varchar DEFAULT 'We read every one. No sales sequence, no newsletter.',
  	"version_sent_eyebrow" varchar DEFAULT 'Inquiry received',
  	"version_sent_heading" varchar DEFAULT 'Thanks, it''s in.',
  	"version_sent_body" varchar DEFAULT '{name}, a partner is reading your brief. You''ll hear back {responseTime}.',
  	"version_sent_reference_label" varchar DEFAULT 'Reference',
  	"version_sent_sent_label" varchar DEFAULT 'Sent',
  	"version_sent_copy_label" varchar DEFAULT 'Copy to',
  	"version_sent_summary_title" varchar DEFAULT 'What you sent',
  	"version_sent_edit_label" varchar DEFAULT 'Edit and resend',
  	"version_sent_alt_body" varchar DEFAULT 'Want to skip ahead? Put 30 minutes on the calendar.',
  	"version_meta_title" varchar,
  	"version_meta_image_id" integer,
  	"version_meta_description" varchar,
  	"version_meta_og_title" varchar,
  	"version_meta_og_description" varchar,
  	"version_meta_og_image_id" integer,
  	"version_published_at" timestamp(3) with time zone,
  	"version_generate_slug" boolean DEFAULT true,
  	"version_slug" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__contact_pages_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "forms_blocks_capabilities" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"label" varchar,
  	"hint" varchar DEFAULT 'Select any',
  	"width" numeric,
  	"unsure_label" varchar DEFAULT 'Not sure yet',
  	"required" boolean,
  	"maps_to" "enum_forms_blocks_capabilities_maps_to",
  	"block_name" varchar
  );
  
  CREATE TABLE "forms_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"capabilities_id" integer
  );
  
  ALTER TABLE "pages_contact_details" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_contact_next_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "budget" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "timeline" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_contact" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__pages_v_contact_v_details" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__pages_v_contact_v_next_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_budget_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_timeline_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__pages_v_contact_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "expertise_pages_contact_details" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "expertise_pages_contact_next_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "expertise_pages_contact" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__expertise_pages_v_contact_v_details" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__expertise_pages_v_contact_v_next_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__expertise_pages_v_contact_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "audience_pages_contact_details" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "audience_pages_contact_next_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "audience_pages_contact" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__audience_pages_v_contact_v_details" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__audience_pages_v_contact_v_next_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__audience_pages_v_contact_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "forms_blocks_country" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_contact_details" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_contact_next_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_contact" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__home_v_contact_v_details" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__home_v_contact_v_next_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__home_v_contact_v" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "pages_contact_details" CASCADE;
  DROP TABLE "pages_contact_next_steps" CASCADE;
  DROP TABLE "budget" CASCADE;
  DROP TABLE "timeline" CASCADE;
  DROP TABLE "pages_contact" CASCADE;
  DROP TABLE "__pages_v_contact_v_details" CASCADE;
  DROP TABLE "__pages_v_contact_v_next_steps" CASCADE;
  DROP TABLE "_budget_v" CASCADE;
  DROP TABLE "_timeline_v" CASCADE;
  DROP TABLE "__pages_v_contact_v" CASCADE;
  DROP TABLE "expertise_pages_contact_details" CASCADE;
  DROP TABLE "expertise_pages_contact_next_steps" CASCADE;
  DROP TABLE "expertise_pages_contact" CASCADE;
  DROP TABLE "__expertise_pages_v_contact_v_details" CASCADE;
  DROP TABLE "__expertise_pages_v_contact_v_next_steps" CASCADE;
  DROP TABLE "__expertise_pages_v_contact_v" CASCADE;
  DROP TABLE "audience_pages_contact_details" CASCADE;
  DROP TABLE "audience_pages_contact_next_steps" CASCADE;
  DROP TABLE "audience_pages_contact" CASCADE;
  DROP TABLE "__audience_pages_v_contact_v_details" CASCADE;
  DROP TABLE "__audience_pages_v_contact_v_next_steps" CASCADE;
  DROP TABLE "__audience_pages_v_contact_v" CASCADE;
  DROP TABLE "forms_blocks_country" CASCADE;
  DROP TABLE "home_contact_details" CASCADE;
  DROP TABLE "home_contact_next_steps" CASCADE;
  DROP TABLE "home_contact" CASCADE;
  DROP TABLE "__home_v_contact_v_details" CASCADE;
  DROP TABLE "__home_v_contact_v_next_steps" CASCADE;
  DROP TABLE "__home_v_contact_v" CASCADE;
  ALTER TABLE "pages_rels" DROP CONSTRAINT "pages_rels_capabilities_fk";
  
  ALTER TABLE "_pages_v_rels" DROP CONSTRAINT "_pages_v_rels_capabilities_fk";
  
  ALTER TABLE "audience_pages_rels" DROP CONSTRAINT "audience_pages_rels_capabilities_fk";
  
  ALTER TABLE "_audience_pages_v_rels" DROP CONSTRAINT "_audience_pages_v_rels_capabilities_fk";
  
  ALTER TABLE "home_rels" DROP CONSTRAINT "home_rels_capabilities_fk";
  
  ALTER TABLE "_home_v_rels" DROP CONSTRAINT "_home_v_rels_capabilities_fk";
  
  DROP INDEX "pages_rels_capabilities_id_idx";
  DROP INDEX "_pages_v_rels_capabilities_id_idx";
  DROP INDEX "audience_pages_rels_capabilities_id_idx";
  DROP INDEX "_audience_pages_v_rels_capabilities_id_idx";
  DROP INDEX "home_rels_capabilities_id_idx";
  DROP INDEX "_home_v_rels_capabilities_id_idx";
  ALTER TABLE "forms_blocks_checkbox" ADD COLUMN "maps_to" "enum_forms_blocks_checkbox_maps_to";
  ALTER TABLE "forms_blocks_email" ADD COLUMN "placeholder" varchar;
  ALTER TABLE "forms_blocks_email" ADD COLUMN "maps_to" "enum_forms_blocks_email_maps_to";
  ALTER TABLE "forms_blocks_number" ADD COLUMN "placeholder" varchar;
  ALTER TABLE "forms_blocks_number" ADD COLUMN "maps_to" "enum_forms_blocks_number_maps_to";
  ALTER TABLE "forms_blocks_select" ADD COLUMN "hint" varchar;
  ALTER TABLE "forms_blocks_select" ADD COLUMN "maps_to" "enum_forms_blocks_select_maps_to";
  ALTER TABLE "forms_blocks_state" ADD COLUMN "maps_to" "enum_forms_blocks_state_maps_to";
  ALTER TABLE "forms_blocks_text" ADD COLUMN "placeholder" varchar;
  ALTER TABLE "forms_blocks_text" ADD COLUMN "maps_to" "enum_forms_blocks_text_maps_to";
  ALTER TABLE "forms_blocks_textarea" ADD COLUMN "placeholder" varchar;
  ALTER TABLE "forms_blocks_textarea" ADD COLUMN "hint" varchar;
  ALTER TABLE "forms_blocks_textarea" ADD COLUMN "max_length" numeric;
  ALTER TABLE "forms_blocks_textarea" ADD COLUMN "maps_to" "enum_forms_blocks_textarea_maps_to";
  ALTER TABLE "forms" ADD COLUMN "delivery" "enum_forms_delivery" DEFAULT 'submissions' NOT NULL;
  ALTER TABLE "forms" ADD COLUMN "inquiry_type" "enum_forms_inquiry_type" DEFAULT 'project';
  ALTER TABLE "search_rels" ADD COLUMN "contact_pages_id" integer;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "contact_pages_find" boolean DEFAULT false;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "contact_pages_create" boolean DEFAULT false;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "contact_pages_update" boolean DEFAULT false;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "contact_pages_delete" boolean DEFAULT false;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "contact_pages_id" integer;
  ALTER TABLE "contact_pages_details" ADD CONSTRAINT "contact_pages_details_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."contact_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "contact_pages_next_steps" ADD CONSTRAINT "contact_pages_next_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."contact_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "contact_pages" ADD CONSTRAINT "contact_pages_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "contact_pages" ADD CONSTRAINT "contact_pages_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "contact_pages" ADD CONSTRAINT "contact_pages_meta_og_image_id_media_id_fk" FOREIGN KEY ("meta_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_contact_pages_v_version_details" ADD CONSTRAINT "_contact_pages_v_version_details_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_contact_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_contact_pages_v_version_next_steps" ADD CONSTRAINT "_contact_pages_v_version_next_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_contact_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_contact_pages_v" ADD CONSTRAINT "_contact_pages_v_parent_id_contact_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."contact_pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_contact_pages_v" ADD CONSTRAINT "_contact_pages_v_version_form_id_forms_id_fk" FOREIGN KEY ("version_form_id") REFERENCES "public"."forms"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_contact_pages_v" ADD CONSTRAINT "_contact_pages_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_contact_pages_v" ADD CONSTRAINT "_contact_pages_v_version_meta_og_image_id_media_id_fk" FOREIGN KEY ("version_meta_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "forms_blocks_capabilities" ADD CONSTRAINT "forms_blocks_capabilities_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_rels" ADD CONSTRAINT "forms_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_rels" ADD CONSTRAINT "forms_rels_capabilities_fk" FOREIGN KEY ("capabilities_id") REFERENCES "public"."capabilities"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "contact_pages_details_order_idx" ON "contact_pages_details" USING btree ("_order");
  CREATE INDEX "contact_pages_details_parent_id_idx" ON "contact_pages_details" USING btree ("_parent_id");
  CREATE INDEX "contact_pages_next_steps_order_idx" ON "contact_pages_next_steps" USING btree ("_order");
  CREATE INDEX "contact_pages_next_steps_parent_id_idx" ON "contact_pages_next_steps" USING btree ("_parent_id");
  CREATE INDEX "contact_pages_form_idx" ON "contact_pages" USING btree ("form_id");
  CREATE INDEX "contact_pages_meta_meta_image_idx" ON "contact_pages" USING btree ("meta_image_id");
  CREATE INDEX "contact_pages_meta_og_meta_og_image_idx" ON "contact_pages" USING btree ("meta_og_image_id");
  CREATE UNIQUE INDEX "contact_pages_slug_idx" ON "contact_pages" USING btree ("slug");
  CREATE INDEX "contact_pages_updated_at_idx" ON "contact_pages" USING btree ("updated_at");
  CREATE INDEX "contact_pages_created_at_idx" ON "contact_pages" USING btree ("created_at");
  CREATE INDEX "contact_pages__status_idx" ON "contact_pages" USING btree ("_status");
  CREATE INDEX "_contact_pages_v_version_details_order_idx" ON "_contact_pages_v_version_details" USING btree ("_order");
  CREATE INDEX "_contact_pages_v_version_details_parent_id_idx" ON "_contact_pages_v_version_details" USING btree ("_parent_id");
  CREATE INDEX "_contact_pages_v_version_next_steps_order_idx" ON "_contact_pages_v_version_next_steps" USING btree ("_order");
  CREATE INDEX "_contact_pages_v_version_next_steps_parent_id_idx" ON "_contact_pages_v_version_next_steps" USING btree ("_parent_id");
  CREATE INDEX "_contact_pages_v_parent_idx" ON "_contact_pages_v" USING btree ("parent_id");
  CREATE INDEX "_contact_pages_v_version_version_form_idx" ON "_contact_pages_v" USING btree ("version_form_id");
  CREATE INDEX "_contact_pages_v_version_meta_version_meta_image_idx" ON "_contact_pages_v" USING btree ("version_meta_image_id");
  CREATE INDEX "_contact_pages_v_version_meta_og_version_meta_og_image_idx" ON "_contact_pages_v" USING btree ("version_meta_og_image_id");
  CREATE INDEX "_contact_pages_v_version_version_slug_idx" ON "_contact_pages_v" USING btree ("version_slug");
  CREATE INDEX "_contact_pages_v_version_version_updated_at_idx" ON "_contact_pages_v" USING btree ("version_updated_at");
  CREATE INDEX "_contact_pages_v_version_version_created_at_idx" ON "_contact_pages_v" USING btree ("version_created_at");
  CREATE INDEX "_contact_pages_v_version_version__status_idx" ON "_contact_pages_v" USING btree ("version__status");
  CREATE INDEX "_contact_pages_v_created_at_idx" ON "_contact_pages_v" USING btree ("created_at");
  CREATE INDEX "_contact_pages_v_updated_at_idx" ON "_contact_pages_v" USING btree ("updated_at");
  CREATE INDEX "_contact_pages_v_latest_idx" ON "_contact_pages_v" USING btree ("latest");
  CREATE INDEX "_contact_pages_v_autosave_idx" ON "_contact_pages_v" USING btree ("autosave");
  CREATE INDEX "forms_blocks_capabilities_order_idx" ON "forms_blocks_capabilities" USING btree ("_order");
  CREATE INDEX "forms_blocks_capabilities_parent_id_idx" ON "forms_blocks_capabilities" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_capabilities_path_idx" ON "forms_blocks_capabilities" USING btree ("_path");
  CREATE INDEX "forms_rels_order_idx" ON "forms_rels" USING btree ("order");
  CREATE INDEX "forms_rels_parent_idx" ON "forms_rels" USING btree ("parent_id");
  CREATE INDEX "forms_rels_path_idx" ON "forms_rels" USING btree ("path");
  CREATE INDEX "forms_rels_capabilities_id_idx" ON "forms_rels" USING btree ("capabilities_id");
  ALTER TABLE "search_rels" ADD CONSTRAINT "search_rels_contact_pages_fk" FOREIGN KEY ("contact_pages_id") REFERENCES "public"."contact_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_contact_pages_fk" FOREIGN KEY ("contact_pages_id") REFERENCES "public"."contact_pages"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "search_rels_contact_pages_id_idx" ON "search_rels" USING btree ("contact_pages_id");
  CREATE INDEX "payload_locked_documents_rels_contact_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("contact_pages_id");
  ALTER TABLE "pages_rels" DROP COLUMN "capabilities_id";
  ALTER TABLE "_pages_v_rels" DROP COLUMN "capabilities_id";
  ALTER TABLE "audience_pages_rels" DROP COLUMN "capabilities_id";
  ALTER TABLE "_audience_pages_v_rels" DROP COLUMN "capabilities_id";
  ALTER TABLE "home_rels" DROP COLUMN "capabilities_id";
  ALTER TABLE "_home_v_rels" DROP COLUMN "capabilities_id";
  DROP TYPE "public"."enum_budget_value";
  DROP TYPE "public"."enum_timeline_value";
  DROP TYPE "public"."enum_pages_contact_variant";
  DROP TYPE "public"."enum_pages_contact_theme";
  DROP TYPE "public"."enum__budget_v_value";
  DROP TYPE "public"."enum__timeline_v_value";
  DROP TYPE "public"."enum___pages_v_contact_v_variant";
  DROP TYPE "public"."enum___pages_v_contact_v_theme";
  DROP TYPE "public"."enum_expertise_pages_contact_variant";
  DROP TYPE "public"."enum_expertise_pages_contact_theme";
  DROP TYPE "public"."enum___expertise_pages_v_contact_v_variant";
  DROP TYPE "public"."enum___expertise_pages_v_contact_v_theme";
  DROP TYPE "public"."enum_audience_pages_contact_variant";
  DROP TYPE "public"."enum_audience_pages_contact_theme";
  DROP TYPE "public"."enum___audience_pages_v_contact_v_variant";
  DROP TYPE "public"."enum___audience_pages_v_contact_v_theme";
  DROP TYPE "public"."enum_home_contact_variant";
  DROP TYPE "public"."enum_home_contact_theme";
  DROP TYPE "public"."enum___home_v_contact_v_variant";
  DROP TYPE "public"."enum___home_v_contact_v_theme";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_budget_value" AS ENUM('under-25k', '25-50k', '50-100k', '100k-plus', 'guidance');
  CREATE TYPE "public"."enum_timeline_value" AS ENUM('asap', '1-3-months', '3-6-months', 'exploring');
  CREATE TYPE "public"."enum_pages_contact_variant" AS ENUM('project', 'general');
  CREATE TYPE "public"."enum_pages_contact_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum__budget_v_value" AS ENUM('under-25k', '25-50k', '50-100k', '100k-plus', 'guidance');
  CREATE TYPE "public"."enum__timeline_v_value" AS ENUM('asap', '1-3-months', '3-6-months', 'exploring');
  CREATE TYPE "public"."enum___pages_v_contact_v_variant" AS ENUM('project', 'general');
  CREATE TYPE "public"."enum___pages_v_contact_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_expertise_pages_contact_variant" AS ENUM('project', 'general');
  CREATE TYPE "public"."enum_expertise_pages_contact_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___expertise_pages_v_contact_v_variant" AS ENUM('project', 'general');
  CREATE TYPE "public"."enum___expertise_pages_v_contact_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_audience_pages_contact_variant" AS ENUM('project', 'general');
  CREATE TYPE "public"."enum_audience_pages_contact_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___audience_pages_v_contact_v_variant" AS ENUM('project', 'general');
  CREATE TYPE "public"."enum___audience_pages_v_contact_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_home_contact_variant" AS ENUM('project', 'general');
  CREATE TYPE "public"."enum_home_contact_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___home_v_contact_v_variant" AS ENUM('project', 'general');
  CREATE TYPE "public"."enum___home_v_contact_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TABLE "pages_contact_details" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"term" varchar,
  	"value" varchar
  );
  
  CREATE TABLE "pages_contact_next_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "budget" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" "enum_budget_value",
  	"label" varchar
  );
  
  CREATE TABLE "timeline" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" "enum_timeline_value",
  	"label" varchar
  );
  
  CREATE TABLE "pages_contact" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_pages_contact_variant" DEFAULT 'project',
  	"eyebrow" varchar DEFAULT 'Project inquiry',
  	"heading" varchar DEFAULT 'Got a project in mind?',
  	"lead" varchar DEFAULT 'Send some details over and we''ll let you know how we can help.',
  	"next_steps_title" varchar DEFAULT 'What happens next',
  	"alt_cta_enabled" boolean DEFAULT true,
  	"alt_cta_body" varchar DEFAULT 'Rather talk it through first?',
  	"alt_cta_label" varchar DEFAULT 'Schedule a call',
  	"alt_cta_url" varchar,
  	"name_label" varchar DEFAULT 'Name',
  	"email_label" varchar DEFAULT 'Email',
  	"company_label" varchar DEFAULT 'Company',
  	"website_label" varchar DEFAULT 'Current site (optional)',
  	"capabilities_label" varchar DEFAULT 'What you need',
  	"capabilities_hint" varchar DEFAULT 'Select any',
  	"capabilities_unsure_label" varchar DEFAULT 'Not sure yet',
  	"budget_label" varchar DEFAULT 'Budget range',
  	"budget_hint" varchar DEFAULT 'USD',
  	"timeline_label" varchar DEFAULT 'Timeline',
  	"message_label" varchar DEFAULT 'The brief',
  	"message_placeholder" varchar DEFAULT 'What are you trying to move? A launch, a rebrand, a site that stopped keeping up. A paragraph is plenty.',
  	"message_helper" varchar,
  	"submit_label" varchar DEFAULT 'Send inquiry',
  	"submit_note" varchar DEFAULT 'We read every one. No sales sequence, no newsletter.',
  	"sent_eyebrow" varchar DEFAULT 'Inquiry received',
  	"sent_heading" varchar DEFAULT 'Thanks, it''s in.',
  	"sent_body" varchar DEFAULT '{name}, a partner is reading your brief. You''ll hear back {responseTime}.',
  	"sent_reference_label" varchar DEFAULT 'Reference',
  	"sent_sent_label" varchar DEFAULT 'Sent',
  	"sent_copy_label" varchar DEFAULT 'Copy to',
  	"sent_summary_title" varchar DEFAULT 'What you sent',
  	"sent_edit_label" varchar DEFAULT 'Edit and resend',
  	"sent_scope_label" varchar DEFAULT 'Scope',
  	"sent_budget_label" varchar DEFAULT 'Budget',
  	"sent_timeline_label" varchar DEFAULT 'Timeline',
  	"sent_brief_label" varchar DEFAULT 'Brief',
  	"sent_alt_body" varchar DEFAULT 'Want to skip ahead? Put 30 minutes on the calendar.',
  	"theme" "enum_pages_contact_theme" DEFAULT 'light',
  	"block_name" varchar
  );
  
  CREATE TABLE "__pages_v_contact_v_details" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"term" varchar,
  	"value" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "__pages_v_contact_v_next_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_budget_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" "enum__budget_v_value",
  	"label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_timeline_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" "enum__timeline_v_value",
  	"label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "__pages_v_contact_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"variant" "enum___pages_v_contact_v_variant" DEFAULT 'project',
  	"eyebrow" varchar DEFAULT 'Project inquiry',
  	"heading" varchar DEFAULT 'Got a project in mind?',
  	"lead" varchar DEFAULT 'Send some details over and we''ll let you know how we can help.',
  	"next_steps_title" varchar DEFAULT 'What happens next',
  	"alt_cta_enabled" boolean DEFAULT true,
  	"alt_cta_body" varchar DEFAULT 'Rather talk it through first?',
  	"alt_cta_label" varchar DEFAULT 'Schedule a call',
  	"alt_cta_url" varchar,
  	"name_label" varchar DEFAULT 'Name',
  	"email_label" varchar DEFAULT 'Email',
  	"company_label" varchar DEFAULT 'Company',
  	"website_label" varchar DEFAULT 'Current site (optional)',
  	"capabilities_label" varchar DEFAULT 'What you need',
  	"capabilities_hint" varchar DEFAULT 'Select any',
  	"capabilities_unsure_label" varchar DEFAULT 'Not sure yet',
  	"budget_label" varchar DEFAULT 'Budget range',
  	"budget_hint" varchar DEFAULT 'USD',
  	"timeline_label" varchar DEFAULT 'Timeline',
  	"message_label" varchar DEFAULT 'The brief',
  	"message_placeholder" varchar DEFAULT 'What are you trying to move? A launch, a rebrand, a site that stopped keeping up. A paragraph is plenty.',
  	"message_helper" varchar,
  	"submit_label" varchar DEFAULT 'Send inquiry',
  	"submit_note" varchar DEFAULT 'We read every one. No sales sequence, no newsletter.',
  	"sent_eyebrow" varchar DEFAULT 'Inquiry received',
  	"sent_heading" varchar DEFAULT 'Thanks, it''s in.',
  	"sent_body" varchar DEFAULT '{name}, a partner is reading your brief. You''ll hear back {responseTime}.',
  	"sent_reference_label" varchar DEFAULT 'Reference',
  	"sent_sent_label" varchar DEFAULT 'Sent',
  	"sent_copy_label" varchar DEFAULT 'Copy to',
  	"sent_summary_title" varchar DEFAULT 'What you sent',
  	"sent_edit_label" varchar DEFAULT 'Edit and resend',
  	"sent_scope_label" varchar DEFAULT 'Scope',
  	"sent_budget_label" varchar DEFAULT 'Budget',
  	"sent_timeline_label" varchar DEFAULT 'Timeline',
  	"sent_brief_label" varchar DEFAULT 'Brief',
  	"sent_alt_body" varchar DEFAULT 'Want to skip ahead? Put 30 minutes on the calendar.',
  	"theme" "enum___pages_v_contact_v_theme" DEFAULT 'light',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "expertise_pages_contact_details" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"term" varchar,
  	"value" varchar
  );
  
  CREATE TABLE "expertise_pages_contact_next_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "expertise_pages_contact" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_expertise_pages_contact_variant" DEFAULT 'project',
  	"eyebrow" varchar DEFAULT 'Project inquiry',
  	"heading" varchar DEFAULT 'Got a project in mind?',
  	"lead" varchar DEFAULT 'Send some details over and we''ll let you know how we can help.',
  	"next_steps_title" varchar DEFAULT 'What happens next',
  	"alt_cta_enabled" boolean DEFAULT true,
  	"alt_cta_body" varchar DEFAULT 'Rather talk it through first?',
  	"alt_cta_label" varchar DEFAULT 'Schedule a call',
  	"alt_cta_url" varchar,
  	"name_label" varchar DEFAULT 'Name',
  	"email_label" varchar DEFAULT 'Email',
  	"company_label" varchar DEFAULT 'Company',
  	"website_label" varchar DEFAULT 'Current site (optional)',
  	"capabilities_label" varchar DEFAULT 'What you need',
  	"capabilities_hint" varchar DEFAULT 'Select any',
  	"capabilities_unsure_label" varchar DEFAULT 'Not sure yet',
  	"budget_label" varchar DEFAULT 'Budget range',
  	"budget_hint" varchar DEFAULT 'USD',
  	"timeline_label" varchar DEFAULT 'Timeline',
  	"message_label" varchar DEFAULT 'The brief',
  	"message_placeholder" varchar DEFAULT 'What are you trying to move? A launch, a rebrand, a site that stopped keeping up. A paragraph is plenty.',
  	"message_helper" varchar,
  	"submit_label" varchar DEFAULT 'Send inquiry',
  	"submit_note" varchar DEFAULT 'We read every one. No sales sequence, no newsletter.',
  	"sent_eyebrow" varchar DEFAULT 'Inquiry received',
  	"sent_heading" varchar DEFAULT 'Thanks, it''s in.',
  	"sent_body" varchar DEFAULT '{name}, a partner is reading your brief. You''ll hear back {responseTime}.',
  	"sent_reference_label" varchar DEFAULT 'Reference',
  	"sent_sent_label" varchar DEFAULT 'Sent',
  	"sent_copy_label" varchar DEFAULT 'Copy to',
  	"sent_summary_title" varchar DEFAULT 'What you sent',
  	"sent_edit_label" varchar DEFAULT 'Edit and resend',
  	"sent_scope_label" varchar DEFAULT 'Scope',
  	"sent_budget_label" varchar DEFAULT 'Budget',
  	"sent_timeline_label" varchar DEFAULT 'Timeline',
  	"sent_brief_label" varchar DEFAULT 'Brief',
  	"sent_alt_body" varchar DEFAULT 'Want to skip ahead? Put 30 minutes on the calendar.',
  	"theme" "enum_expertise_pages_contact_theme" DEFAULT 'light',
  	"block_name" varchar
  );
  
  CREATE TABLE "__expertise_pages_v_contact_v_details" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"term" varchar,
  	"value" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "__expertise_pages_v_contact_v_next_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "__expertise_pages_v_contact_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"variant" "enum___expertise_pages_v_contact_v_variant" DEFAULT 'project',
  	"eyebrow" varchar DEFAULT 'Project inquiry',
  	"heading" varchar DEFAULT 'Got a project in mind?',
  	"lead" varchar DEFAULT 'Send some details over and we''ll let you know how we can help.',
  	"next_steps_title" varchar DEFAULT 'What happens next',
  	"alt_cta_enabled" boolean DEFAULT true,
  	"alt_cta_body" varchar DEFAULT 'Rather talk it through first?',
  	"alt_cta_label" varchar DEFAULT 'Schedule a call',
  	"alt_cta_url" varchar,
  	"name_label" varchar DEFAULT 'Name',
  	"email_label" varchar DEFAULT 'Email',
  	"company_label" varchar DEFAULT 'Company',
  	"website_label" varchar DEFAULT 'Current site (optional)',
  	"capabilities_label" varchar DEFAULT 'What you need',
  	"capabilities_hint" varchar DEFAULT 'Select any',
  	"capabilities_unsure_label" varchar DEFAULT 'Not sure yet',
  	"budget_label" varchar DEFAULT 'Budget range',
  	"budget_hint" varchar DEFAULT 'USD',
  	"timeline_label" varchar DEFAULT 'Timeline',
  	"message_label" varchar DEFAULT 'The brief',
  	"message_placeholder" varchar DEFAULT 'What are you trying to move? A launch, a rebrand, a site that stopped keeping up. A paragraph is plenty.',
  	"message_helper" varchar,
  	"submit_label" varchar DEFAULT 'Send inquiry',
  	"submit_note" varchar DEFAULT 'We read every one. No sales sequence, no newsletter.',
  	"sent_eyebrow" varchar DEFAULT 'Inquiry received',
  	"sent_heading" varchar DEFAULT 'Thanks, it''s in.',
  	"sent_body" varchar DEFAULT '{name}, a partner is reading your brief. You''ll hear back {responseTime}.',
  	"sent_reference_label" varchar DEFAULT 'Reference',
  	"sent_sent_label" varchar DEFAULT 'Sent',
  	"sent_copy_label" varchar DEFAULT 'Copy to',
  	"sent_summary_title" varchar DEFAULT 'What you sent',
  	"sent_edit_label" varchar DEFAULT 'Edit and resend',
  	"sent_scope_label" varchar DEFAULT 'Scope',
  	"sent_budget_label" varchar DEFAULT 'Budget',
  	"sent_timeline_label" varchar DEFAULT 'Timeline',
  	"sent_brief_label" varchar DEFAULT 'Brief',
  	"sent_alt_body" varchar DEFAULT 'Want to skip ahead? Put 30 minutes on the calendar.',
  	"theme" "enum___expertise_pages_v_contact_v_theme" DEFAULT 'light',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "audience_pages_contact_details" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"term" varchar,
  	"value" varchar
  );
  
  CREATE TABLE "audience_pages_contact_next_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "audience_pages_contact" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_audience_pages_contact_variant" DEFAULT 'project',
  	"eyebrow" varchar DEFAULT 'Project inquiry',
  	"heading" varchar DEFAULT 'Got a project in mind?',
  	"lead" varchar DEFAULT 'Send some details over and we''ll let you know how we can help.',
  	"next_steps_title" varchar DEFAULT 'What happens next',
  	"alt_cta_enabled" boolean DEFAULT true,
  	"alt_cta_body" varchar DEFAULT 'Rather talk it through first?',
  	"alt_cta_label" varchar DEFAULT 'Schedule a call',
  	"alt_cta_url" varchar,
  	"name_label" varchar DEFAULT 'Name',
  	"email_label" varchar DEFAULT 'Email',
  	"company_label" varchar DEFAULT 'Company',
  	"website_label" varchar DEFAULT 'Current site (optional)',
  	"capabilities_label" varchar DEFAULT 'What you need',
  	"capabilities_hint" varchar DEFAULT 'Select any',
  	"capabilities_unsure_label" varchar DEFAULT 'Not sure yet',
  	"budget_label" varchar DEFAULT 'Budget range',
  	"budget_hint" varchar DEFAULT 'USD',
  	"timeline_label" varchar DEFAULT 'Timeline',
  	"message_label" varchar DEFAULT 'The brief',
  	"message_placeholder" varchar DEFAULT 'What are you trying to move? A launch, a rebrand, a site that stopped keeping up. A paragraph is plenty.',
  	"message_helper" varchar,
  	"submit_label" varchar DEFAULT 'Send inquiry',
  	"submit_note" varchar DEFAULT 'We read every one. No sales sequence, no newsletter.',
  	"sent_eyebrow" varchar DEFAULT 'Inquiry received',
  	"sent_heading" varchar DEFAULT 'Thanks, it''s in.',
  	"sent_body" varchar DEFAULT '{name}, a partner is reading your brief. You''ll hear back {responseTime}.',
  	"sent_reference_label" varchar DEFAULT 'Reference',
  	"sent_sent_label" varchar DEFAULT 'Sent',
  	"sent_copy_label" varchar DEFAULT 'Copy to',
  	"sent_summary_title" varchar DEFAULT 'What you sent',
  	"sent_edit_label" varchar DEFAULT 'Edit and resend',
  	"sent_scope_label" varchar DEFAULT 'Scope',
  	"sent_budget_label" varchar DEFAULT 'Budget',
  	"sent_timeline_label" varchar DEFAULT 'Timeline',
  	"sent_brief_label" varchar DEFAULT 'Brief',
  	"sent_alt_body" varchar DEFAULT 'Want to skip ahead? Put 30 minutes on the calendar.',
  	"theme" "enum_audience_pages_contact_theme" DEFAULT 'light',
  	"block_name" varchar
  );
  
  CREATE TABLE "__audience_pages_v_contact_v_details" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"term" varchar,
  	"value" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "__audience_pages_v_contact_v_next_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "__audience_pages_v_contact_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"variant" "enum___audience_pages_v_contact_v_variant" DEFAULT 'project',
  	"eyebrow" varchar DEFAULT 'Project inquiry',
  	"heading" varchar DEFAULT 'Got a project in mind?',
  	"lead" varchar DEFAULT 'Send some details over and we''ll let you know how we can help.',
  	"next_steps_title" varchar DEFAULT 'What happens next',
  	"alt_cta_enabled" boolean DEFAULT true,
  	"alt_cta_body" varchar DEFAULT 'Rather talk it through first?',
  	"alt_cta_label" varchar DEFAULT 'Schedule a call',
  	"alt_cta_url" varchar,
  	"name_label" varchar DEFAULT 'Name',
  	"email_label" varchar DEFAULT 'Email',
  	"company_label" varchar DEFAULT 'Company',
  	"website_label" varchar DEFAULT 'Current site (optional)',
  	"capabilities_label" varchar DEFAULT 'What you need',
  	"capabilities_hint" varchar DEFAULT 'Select any',
  	"capabilities_unsure_label" varchar DEFAULT 'Not sure yet',
  	"budget_label" varchar DEFAULT 'Budget range',
  	"budget_hint" varchar DEFAULT 'USD',
  	"timeline_label" varchar DEFAULT 'Timeline',
  	"message_label" varchar DEFAULT 'The brief',
  	"message_placeholder" varchar DEFAULT 'What are you trying to move? A launch, a rebrand, a site that stopped keeping up. A paragraph is plenty.',
  	"message_helper" varchar,
  	"submit_label" varchar DEFAULT 'Send inquiry',
  	"submit_note" varchar DEFAULT 'We read every one. No sales sequence, no newsletter.',
  	"sent_eyebrow" varchar DEFAULT 'Inquiry received',
  	"sent_heading" varchar DEFAULT 'Thanks, it''s in.',
  	"sent_body" varchar DEFAULT '{name}, a partner is reading your brief. You''ll hear back {responseTime}.',
  	"sent_reference_label" varchar DEFAULT 'Reference',
  	"sent_sent_label" varchar DEFAULT 'Sent',
  	"sent_copy_label" varchar DEFAULT 'Copy to',
  	"sent_summary_title" varchar DEFAULT 'What you sent',
  	"sent_edit_label" varchar DEFAULT 'Edit and resend',
  	"sent_scope_label" varchar DEFAULT 'Scope',
  	"sent_budget_label" varchar DEFAULT 'Budget',
  	"sent_timeline_label" varchar DEFAULT 'Timeline',
  	"sent_brief_label" varchar DEFAULT 'Brief',
  	"sent_alt_body" varchar DEFAULT 'Want to skip ahead? Put 30 minutes on the calendar.',
  	"theme" "enum___audience_pages_v_contact_v_theme" DEFAULT 'light',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "forms_blocks_country" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"label" varchar,
  	"width" numeric,
  	"required" boolean,
  	"block_name" varchar
  );
  
  CREATE TABLE "home_contact_details" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"term" varchar,
  	"value" varchar
  );
  
  CREATE TABLE "home_contact_next_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "home_contact" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_home_contact_variant" DEFAULT 'project',
  	"eyebrow" varchar DEFAULT 'Project inquiry',
  	"heading" varchar DEFAULT 'Got a project in mind?',
  	"lead" varchar DEFAULT 'Send some details over and we''ll let you know how we can help.',
  	"next_steps_title" varchar DEFAULT 'What happens next',
  	"alt_cta_enabled" boolean DEFAULT true,
  	"alt_cta_body" varchar DEFAULT 'Rather talk it through first?',
  	"alt_cta_label" varchar DEFAULT 'Schedule a call',
  	"alt_cta_url" varchar,
  	"name_label" varchar DEFAULT 'Name',
  	"email_label" varchar DEFAULT 'Email',
  	"company_label" varchar DEFAULT 'Company',
  	"website_label" varchar DEFAULT 'Current site (optional)',
  	"capabilities_label" varchar DEFAULT 'What you need',
  	"capabilities_hint" varchar DEFAULT 'Select any',
  	"capabilities_unsure_label" varchar DEFAULT 'Not sure yet',
  	"budget_label" varchar DEFAULT 'Budget range',
  	"budget_hint" varchar DEFAULT 'USD',
  	"timeline_label" varchar DEFAULT 'Timeline',
  	"message_label" varchar DEFAULT 'The brief',
  	"message_placeholder" varchar DEFAULT 'What are you trying to move? A launch, a rebrand, a site that stopped keeping up. A paragraph is plenty.',
  	"message_helper" varchar,
  	"submit_label" varchar DEFAULT 'Send inquiry',
  	"submit_note" varchar DEFAULT 'We read every one. No sales sequence, no newsletter.',
  	"sent_eyebrow" varchar DEFAULT 'Inquiry received',
  	"sent_heading" varchar DEFAULT 'Thanks, it''s in.',
  	"sent_body" varchar DEFAULT '{name}, a partner is reading your brief. You''ll hear back {responseTime}.',
  	"sent_reference_label" varchar DEFAULT 'Reference',
  	"sent_sent_label" varchar DEFAULT 'Sent',
  	"sent_copy_label" varchar DEFAULT 'Copy to',
  	"sent_summary_title" varchar DEFAULT 'What you sent',
  	"sent_edit_label" varchar DEFAULT 'Edit and resend',
  	"sent_scope_label" varchar DEFAULT 'Scope',
  	"sent_budget_label" varchar DEFAULT 'Budget',
  	"sent_timeline_label" varchar DEFAULT 'Timeline',
  	"sent_brief_label" varchar DEFAULT 'Brief',
  	"sent_alt_body" varchar DEFAULT 'Want to skip ahead? Put 30 minutes on the calendar.',
  	"theme" "enum_home_contact_theme" DEFAULT 'light',
  	"block_name" varchar
  );
  
  CREATE TABLE "__home_v_contact_v_details" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"term" varchar,
  	"value" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "__home_v_contact_v_next_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "__home_v_contact_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"variant" "enum___home_v_contact_v_variant" DEFAULT 'project',
  	"eyebrow" varchar DEFAULT 'Project inquiry',
  	"heading" varchar DEFAULT 'Got a project in mind?',
  	"lead" varchar DEFAULT 'Send some details over and we''ll let you know how we can help.',
  	"next_steps_title" varchar DEFAULT 'What happens next',
  	"alt_cta_enabled" boolean DEFAULT true,
  	"alt_cta_body" varchar DEFAULT 'Rather talk it through first?',
  	"alt_cta_label" varchar DEFAULT 'Schedule a call',
  	"alt_cta_url" varchar,
  	"name_label" varchar DEFAULT 'Name',
  	"email_label" varchar DEFAULT 'Email',
  	"company_label" varchar DEFAULT 'Company',
  	"website_label" varchar DEFAULT 'Current site (optional)',
  	"capabilities_label" varchar DEFAULT 'What you need',
  	"capabilities_hint" varchar DEFAULT 'Select any',
  	"capabilities_unsure_label" varchar DEFAULT 'Not sure yet',
  	"budget_label" varchar DEFAULT 'Budget range',
  	"budget_hint" varchar DEFAULT 'USD',
  	"timeline_label" varchar DEFAULT 'Timeline',
  	"message_label" varchar DEFAULT 'The brief',
  	"message_placeholder" varchar DEFAULT 'What are you trying to move? A launch, a rebrand, a site that stopped keeping up. A paragraph is plenty.',
  	"message_helper" varchar,
  	"submit_label" varchar DEFAULT 'Send inquiry',
  	"submit_note" varchar DEFAULT 'We read every one. No sales sequence, no newsletter.',
  	"sent_eyebrow" varchar DEFAULT 'Inquiry received',
  	"sent_heading" varchar DEFAULT 'Thanks, it''s in.',
  	"sent_body" varchar DEFAULT '{name}, a partner is reading your brief. You''ll hear back {responseTime}.',
  	"sent_reference_label" varchar DEFAULT 'Reference',
  	"sent_sent_label" varchar DEFAULT 'Sent',
  	"sent_copy_label" varchar DEFAULT 'Copy to',
  	"sent_summary_title" varchar DEFAULT 'What you sent',
  	"sent_edit_label" varchar DEFAULT 'Edit and resend',
  	"sent_scope_label" varchar DEFAULT 'Scope',
  	"sent_budget_label" varchar DEFAULT 'Budget',
  	"sent_timeline_label" varchar DEFAULT 'Timeline',
  	"sent_brief_label" varchar DEFAULT 'Brief',
  	"sent_alt_body" varchar DEFAULT 'Want to skip ahead? Put 30 minutes on the calendar.',
  	"theme" "enum___home_v_contact_v_theme" DEFAULT 'light',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "contact_pages_details" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "contact_pages_next_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "contact_pages" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_contact_pages_v_version_details" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_contact_pages_v_version_next_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_contact_pages_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "forms_blocks_capabilities" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "forms_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "contact_pages_details" CASCADE;
  DROP TABLE "contact_pages_next_steps" CASCADE;
  DROP TABLE "contact_pages" CASCADE;
  DROP TABLE "_contact_pages_v_version_details" CASCADE;
  DROP TABLE "_contact_pages_v_version_next_steps" CASCADE;
  DROP TABLE "_contact_pages_v" CASCADE;
  DROP TABLE "forms_blocks_capabilities" CASCADE;
  DROP TABLE "forms_rels" CASCADE;
  ALTER TABLE "search_rels" DROP CONSTRAINT "search_rels_contact_pages_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_contact_pages_fk";
  
  DROP INDEX "search_rels_contact_pages_id_idx";
  DROP INDEX "payload_locked_documents_rels_contact_pages_id_idx";
  ALTER TABLE "pages_rels" ADD COLUMN "capabilities_id" integer;
  ALTER TABLE "_pages_v_rels" ADD COLUMN "capabilities_id" integer;
  ALTER TABLE "audience_pages_rels" ADD COLUMN "capabilities_id" integer;
  ALTER TABLE "_audience_pages_v_rels" ADD COLUMN "capabilities_id" integer;
  ALTER TABLE "home_rels" ADD COLUMN "capabilities_id" integer;
  ALTER TABLE "_home_v_rels" ADD COLUMN "capabilities_id" integer;
  ALTER TABLE "pages_contact_details" ADD CONSTRAINT "pages_contact_details_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_contact"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_contact_next_steps" ADD CONSTRAINT "pages_contact_next_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_contact"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "budget" ADD CONSTRAINT "budget_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_contact"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "timeline" ADD CONSTRAINT "timeline_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_contact"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_contact" ADD CONSTRAINT "pages_contact_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__pages_v_contact_v_details" ADD CONSTRAINT "__pages_v_contact_v_details_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."__pages_v_contact_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__pages_v_contact_v_next_steps" ADD CONSTRAINT "__pages_v_contact_v_next_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."__pages_v_contact_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_budget_v" ADD CONSTRAINT "_budget_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."__home_v_contact_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_timeline_v" ADD CONSTRAINT "_timeline_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."__home_v_contact_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__pages_v_contact_v" ADD CONSTRAINT "__pages_v_contact_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "expertise_pages_contact_details" ADD CONSTRAINT "expertise_pages_contact_details_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."expertise_pages_contact"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "expertise_pages_contact_next_steps" ADD CONSTRAINT "expertise_pages_contact_next_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."expertise_pages_contact"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "expertise_pages_contact" ADD CONSTRAINT "expertise_pages_contact_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."expertise_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__expertise_pages_v_contact_v_details" ADD CONSTRAINT "__expertise_pages_v_contact_v_details_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."__expertise_pages_v_contact_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__expertise_pages_v_contact_v_next_steps" ADD CONSTRAINT "__expertise_pages_v_contact_v_next_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."__expertise_pages_v_contact_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__expertise_pages_v_contact_v" ADD CONSTRAINT "__expertise_pages_v_contact_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_expertise_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "audience_pages_contact_details" ADD CONSTRAINT "audience_pages_contact_details_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."audience_pages_contact"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "audience_pages_contact_next_steps" ADD CONSTRAINT "audience_pages_contact_next_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."audience_pages_contact"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "audience_pages_contact" ADD CONSTRAINT "audience_pages_contact_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."audience_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__audience_pages_v_contact_v_details" ADD CONSTRAINT "__audience_pages_v_contact_v_details_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."__audience_pages_v_contact_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__audience_pages_v_contact_v_next_steps" ADD CONSTRAINT "__audience_pages_v_contact_v_next_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."__audience_pages_v_contact_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__audience_pages_v_contact_v" ADD CONSTRAINT "__audience_pages_v_contact_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_audience_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms_blocks_country" ADD CONSTRAINT "forms_blocks_country_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_contact_details" ADD CONSTRAINT "home_contact_details_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_contact"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_contact_next_steps" ADD CONSTRAINT "home_contact_next_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_contact"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_contact" ADD CONSTRAINT "home_contact_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__home_v_contact_v_details" ADD CONSTRAINT "__home_v_contact_v_details_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."__home_v_contact_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__home_v_contact_v_next_steps" ADD CONSTRAINT "__home_v_contact_v_next_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."__home_v_contact_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__home_v_contact_v" ADD CONSTRAINT "__home_v_contact_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_contact_details_order_idx" ON "pages_contact_details" USING btree ("_order");
  CREATE INDEX "pages_contact_details_parent_id_idx" ON "pages_contact_details" USING btree ("_parent_id");
  CREATE INDEX "pages_contact_next_steps_order_idx" ON "pages_contact_next_steps" USING btree ("_order");
  CREATE INDEX "pages_contact_next_steps_parent_id_idx" ON "pages_contact_next_steps" USING btree ("_parent_id");
  CREATE INDEX "budget_order_idx" ON "budget" USING btree ("_order");
  CREATE INDEX "budget_parent_id_idx" ON "budget" USING btree ("_parent_id");
  CREATE INDEX "timeline_order_idx" ON "timeline" USING btree ("_order");
  CREATE INDEX "timeline_parent_id_idx" ON "timeline" USING btree ("_parent_id");
  CREATE INDEX "pages_contact_order_idx" ON "pages_contact" USING btree ("_order");
  CREATE INDEX "pages_contact_parent_id_idx" ON "pages_contact" USING btree ("_parent_id");
  CREATE INDEX "pages_contact_path_idx" ON "pages_contact" USING btree ("_path");
  CREATE INDEX "__pages_v_contact_v_details_order_idx" ON "__pages_v_contact_v_details" USING btree ("_order");
  CREATE INDEX "__pages_v_contact_v_details_parent_id_idx" ON "__pages_v_contact_v_details" USING btree ("_parent_id");
  CREATE INDEX "__pages_v_contact_v_next_steps_order_idx" ON "__pages_v_contact_v_next_steps" USING btree ("_order");
  CREATE INDEX "__pages_v_contact_v_next_steps_parent_id_idx" ON "__pages_v_contact_v_next_steps" USING btree ("_parent_id");
  CREATE INDEX "_budget_v_order_idx" ON "_budget_v" USING btree ("_order");
  CREATE INDEX "_budget_v_parent_id_idx" ON "_budget_v" USING btree ("_parent_id");
  CREATE INDEX "_timeline_v_order_idx" ON "_timeline_v" USING btree ("_order");
  CREATE INDEX "_timeline_v_parent_id_idx" ON "_timeline_v" USING btree ("_parent_id");
  CREATE INDEX "__pages_v_contact_v_order_idx" ON "__pages_v_contact_v" USING btree ("_order");
  CREATE INDEX "__pages_v_contact_v_parent_id_idx" ON "__pages_v_contact_v" USING btree ("_parent_id");
  CREATE INDEX "__pages_v_contact_v_path_idx" ON "__pages_v_contact_v" USING btree ("_path");
  CREATE INDEX "expertise_pages_contact_details_order_idx" ON "expertise_pages_contact_details" USING btree ("_order");
  CREATE INDEX "expertise_pages_contact_details_parent_id_idx" ON "expertise_pages_contact_details" USING btree ("_parent_id");
  CREATE INDEX "expertise_pages_contact_next_steps_order_idx" ON "expertise_pages_contact_next_steps" USING btree ("_order");
  CREATE INDEX "expertise_pages_contact_next_steps_parent_id_idx" ON "expertise_pages_contact_next_steps" USING btree ("_parent_id");
  CREATE INDEX "expertise_pages_contact_order_idx" ON "expertise_pages_contact" USING btree ("_order");
  CREATE INDEX "expertise_pages_contact_parent_id_idx" ON "expertise_pages_contact" USING btree ("_parent_id");
  CREATE INDEX "expertise_pages_contact_path_idx" ON "expertise_pages_contact" USING btree ("_path");
  CREATE INDEX "__expertise_pages_v_contact_v_details_order_idx" ON "__expertise_pages_v_contact_v_details" USING btree ("_order");
  CREATE INDEX "__expertise_pages_v_contact_v_details_parent_id_idx" ON "__expertise_pages_v_contact_v_details" USING btree ("_parent_id");
  CREATE INDEX "__expertise_pages_v_contact_v_next_steps_order_idx" ON "__expertise_pages_v_contact_v_next_steps" USING btree ("_order");
  CREATE INDEX "__expertise_pages_v_contact_v_next_steps_parent_id_idx" ON "__expertise_pages_v_contact_v_next_steps" USING btree ("_parent_id");
  CREATE INDEX "__expertise_pages_v_contact_v_order_idx" ON "__expertise_pages_v_contact_v" USING btree ("_order");
  CREATE INDEX "__expertise_pages_v_contact_v_parent_id_idx" ON "__expertise_pages_v_contact_v" USING btree ("_parent_id");
  CREATE INDEX "__expertise_pages_v_contact_v_path_idx" ON "__expertise_pages_v_contact_v" USING btree ("_path");
  CREATE INDEX "audience_pages_contact_details_order_idx" ON "audience_pages_contact_details" USING btree ("_order");
  CREATE INDEX "audience_pages_contact_details_parent_id_idx" ON "audience_pages_contact_details" USING btree ("_parent_id");
  CREATE INDEX "audience_pages_contact_next_steps_order_idx" ON "audience_pages_contact_next_steps" USING btree ("_order");
  CREATE INDEX "audience_pages_contact_next_steps_parent_id_idx" ON "audience_pages_contact_next_steps" USING btree ("_parent_id");
  CREATE INDEX "audience_pages_contact_order_idx" ON "audience_pages_contact" USING btree ("_order");
  CREATE INDEX "audience_pages_contact_parent_id_idx" ON "audience_pages_contact" USING btree ("_parent_id");
  CREATE INDEX "audience_pages_contact_path_idx" ON "audience_pages_contact" USING btree ("_path");
  CREATE INDEX "__audience_pages_v_contact_v_details_order_idx" ON "__audience_pages_v_contact_v_details" USING btree ("_order");
  CREATE INDEX "__audience_pages_v_contact_v_details_parent_id_idx" ON "__audience_pages_v_contact_v_details" USING btree ("_parent_id");
  CREATE INDEX "__audience_pages_v_contact_v_next_steps_order_idx" ON "__audience_pages_v_contact_v_next_steps" USING btree ("_order");
  CREATE INDEX "__audience_pages_v_contact_v_next_steps_parent_id_idx" ON "__audience_pages_v_contact_v_next_steps" USING btree ("_parent_id");
  CREATE INDEX "__audience_pages_v_contact_v_order_idx" ON "__audience_pages_v_contact_v" USING btree ("_order");
  CREATE INDEX "__audience_pages_v_contact_v_parent_id_idx" ON "__audience_pages_v_contact_v" USING btree ("_parent_id");
  CREATE INDEX "__audience_pages_v_contact_v_path_idx" ON "__audience_pages_v_contact_v" USING btree ("_path");
  CREATE INDEX "forms_blocks_country_order_idx" ON "forms_blocks_country" USING btree ("_order");
  CREATE INDEX "forms_blocks_country_parent_id_idx" ON "forms_blocks_country" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_country_path_idx" ON "forms_blocks_country" USING btree ("_path");
  CREATE INDEX "home_contact_details_order_idx" ON "home_contact_details" USING btree ("_order");
  CREATE INDEX "home_contact_details_parent_id_idx" ON "home_contact_details" USING btree ("_parent_id");
  CREATE INDEX "home_contact_next_steps_order_idx" ON "home_contact_next_steps" USING btree ("_order");
  CREATE INDEX "home_contact_next_steps_parent_id_idx" ON "home_contact_next_steps" USING btree ("_parent_id");
  CREATE INDEX "home_contact_order_idx" ON "home_contact" USING btree ("_order");
  CREATE INDEX "home_contact_parent_id_idx" ON "home_contact" USING btree ("_parent_id");
  CREATE INDEX "home_contact_path_idx" ON "home_contact" USING btree ("_path");
  CREATE INDEX "__home_v_contact_v_details_order_idx" ON "__home_v_contact_v_details" USING btree ("_order");
  CREATE INDEX "__home_v_contact_v_details_parent_id_idx" ON "__home_v_contact_v_details" USING btree ("_parent_id");
  CREATE INDEX "__home_v_contact_v_next_steps_order_idx" ON "__home_v_contact_v_next_steps" USING btree ("_order");
  CREATE INDEX "__home_v_contact_v_next_steps_parent_id_idx" ON "__home_v_contact_v_next_steps" USING btree ("_parent_id");
  CREATE INDEX "__home_v_contact_v_order_idx" ON "__home_v_contact_v" USING btree ("_order");
  CREATE INDEX "__home_v_contact_v_parent_id_idx" ON "__home_v_contact_v" USING btree ("_parent_id");
  CREATE INDEX "__home_v_contact_v_path_idx" ON "__home_v_contact_v" USING btree ("_path");
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_capabilities_fk" FOREIGN KEY ("capabilities_id") REFERENCES "public"."capabilities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_capabilities_fk" FOREIGN KEY ("capabilities_id") REFERENCES "public"."capabilities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "audience_pages_rels" ADD CONSTRAINT "audience_pages_rels_capabilities_fk" FOREIGN KEY ("capabilities_id") REFERENCES "public"."capabilities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_audience_pages_v_rels" ADD CONSTRAINT "_audience_pages_v_rels_capabilities_fk" FOREIGN KEY ("capabilities_id") REFERENCES "public"."capabilities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_rels" ADD CONSTRAINT "home_rels_capabilities_fk" FOREIGN KEY ("capabilities_id") REFERENCES "public"."capabilities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_rels" ADD CONSTRAINT "_home_v_rels_capabilities_fk" FOREIGN KEY ("capabilities_id") REFERENCES "public"."capabilities"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_rels_capabilities_id_idx" ON "pages_rels" USING btree ("capabilities_id");
  CREATE INDEX "_pages_v_rels_capabilities_id_idx" ON "_pages_v_rels" USING btree ("capabilities_id");
  CREATE INDEX "audience_pages_rels_capabilities_id_idx" ON "audience_pages_rels" USING btree ("capabilities_id");
  CREATE INDEX "_audience_pages_v_rels_capabilities_id_idx" ON "_audience_pages_v_rels" USING btree ("capabilities_id");
  CREATE INDEX "home_rels_capabilities_id_idx" ON "home_rels" USING btree ("capabilities_id");
  CREATE INDEX "_home_v_rels_capabilities_id_idx" ON "_home_v_rels" USING btree ("capabilities_id");
  ALTER TABLE "forms_blocks_checkbox" DROP COLUMN "maps_to";
  ALTER TABLE "forms_blocks_email" DROP COLUMN "placeholder";
  ALTER TABLE "forms_blocks_email" DROP COLUMN "maps_to";
  ALTER TABLE "forms_blocks_number" DROP COLUMN "placeholder";
  ALTER TABLE "forms_blocks_number" DROP COLUMN "maps_to";
  ALTER TABLE "forms_blocks_select" DROP COLUMN "hint";
  ALTER TABLE "forms_blocks_select" DROP COLUMN "maps_to";
  ALTER TABLE "forms_blocks_state" DROP COLUMN "maps_to";
  ALTER TABLE "forms_blocks_text" DROP COLUMN "placeholder";
  ALTER TABLE "forms_blocks_text" DROP COLUMN "maps_to";
  ALTER TABLE "forms_blocks_textarea" DROP COLUMN "placeholder";
  ALTER TABLE "forms_blocks_textarea" DROP COLUMN "hint";
  ALTER TABLE "forms_blocks_textarea" DROP COLUMN "max_length";
  ALTER TABLE "forms_blocks_textarea" DROP COLUMN "maps_to";
  ALTER TABLE "forms" DROP COLUMN "delivery";
  ALTER TABLE "forms" DROP COLUMN "inquiry_type";
  ALTER TABLE "search_rels" DROP COLUMN "contact_pages_id";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "contact_pages_find";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "contact_pages_create";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "contact_pages_update";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "contact_pages_delete";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "contact_pages_id";
  DROP TYPE "public"."enum_contact_pages_status";
  DROP TYPE "public"."enum__contact_pages_v_version_status";
  DROP TYPE "public"."enum_forms_blocks_checkbox_maps_to";
  DROP TYPE "public"."enum_forms_blocks_email_maps_to";
  DROP TYPE "public"."enum_forms_blocks_number_maps_to";
  DROP TYPE "public"."enum_forms_blocks_select_maps_to";
  DROP TYPE "public"."enum_forms_blocks_state_maps_to";
  DROP TYPE "public"."enum_forms_blocks_text_maps_to";
  DROP TYPE "public"."enum_forms_blocks_textarea_maps_to";
  DROP TYPE "public"."enum_forms_blocks_capabilities_maps_to";
  DROP TYPE "public"."enum_forms_delivery";
  DROP TYPE "public"."enum_forms_inquiry_type";`)
}
