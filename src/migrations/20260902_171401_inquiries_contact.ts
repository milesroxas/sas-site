import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_contact_pages_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__contact_pages_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_inquiries_type" AS ENUM('project', 'general');
  CREATE TYPE "public"."enum_inquiries_status" AS ENUM('new', 'in-progress', 'replied', 'closed', 'spam');
  CREATE TYPE "public"."enum_inquiries_budget" AS ENUM('under-25k', '25-50k', '50-100k', '100k-plus', 'guidance');
  CREATE TYPE "public"."enum_inquiries_timeline" AS ENUM('asap', '1-3-months', '3-6-months', 'exploring');
  CREATE TYPE "public"."enum_users_notifications_inquiry_types" AS ENUM('project', 'general');
  CREATE TYPE "public"."enum_forms_blocks_checkbox_maps_to" AS ENUM('name', 'email', 'company', 'website', 'capabilities', 'budget', 'timeline', 'message');
  CREATE TYPE "public"."enum_forms_blocks_email_maps_to" AS ENUM('name', 'email', 'company', 'website', 'capabilities', 'budget', 'timeline', 'message');
  CREATE TYPE "public"."enum_forms_blocks_number_maps_to" AS ENUM('name', 'email', 'company', 'website', 'capabilities', 'budget', 'timeline', 'message');
  CREATE TYPE "public"."enum_forms_blocks_select_maps_to" AS ENUM('name', 'email', 'company', 'website', 'capabilities', 'budget', 'timeline', 'message');
  CREATE TYPE "public"."enum_forms_blocks_state_maps_to" AS ENUM('name', 'email', 'company', 'website', 'capabilities', 'budget', 'timeline', 'message');
  CREATE TYPE "public"."enum_forms_blocks_text_maps_to" AS ENUM('name', 'email', 'company', 'website', 'capabilities', 'budget', 'timeline', 'message');
  CREATE TYPE "public"."enum_forms_blocks_textarea_maps_to" AS ENUM('name', 'email', 'company', 'website', 'capabilities', 'budget', 'timeline', 'message');
  CREATE TYPE "public"."enum_forms_blocks_capabilities_maps_to" AS ENUM('name', 'email', 'company', 'website', 'capabilities', 'budget', 'timeline', 'message');
  CREATE TYPE "public"."enum_forms_delivery" AS ENUM('submissions', 'inquiries');
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
  
  CREATE TABLE "inquiries_notes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"note" varchar NOT NULL,
  	"author_id" integer,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "inquiries" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"reference" varchar,
  	"type" "enum_inquiries_type" DEFAULT 'general' NOT NULL,
  	"status" "enum_inquiries_status" DEFAULT 'new' NOT NULL,
  	"assigned_to_id" integer,
  	"submitted_at" timestamp(3) with time zone,
  	"replied_at" timestamp(3) with time zone,
  	"name" varchar NOT NULL,
  	"email" varchar NOT NULL,
  	"company" varchar,
  	"website" varchar,
  	"capabilities_unsure" boolean,
  	"budget" "enum_inquiries_budget",
  	"timeline" "enum_inquiries_timeline",
  	"message" varchar NOT NULL,
  	"source_url" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "inquiries_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"capabilities_id" integer
  );
  
  CREATE TABLE "users_notifications_inquiry_types" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_users_notifications_inquiry_types",
  	"id" serial PRIMARY KEY NOT NULL
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
  
  ALTER TABLE "forms_blocks_country" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "forms_blocks_country" CASCADE;
  ALTER TABLE "users" ADD COLUMN "notifications_inquiries" boolean DEFAULT false;
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
  ALTER TABLE "search_rels" ADD COLUMN "contact_pages_id" integer;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "contact_pages_find" boolean DEFAULT false;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "contact_pages_create" boolean DEFAULT false;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "contact_pages_update" boolean DEFAULT false;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "contact_pages_delete" boolean DEFAULT false;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "contact_pages_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "inquiries_id" integer;
  ALTER TABLE "site_info" ADD COLUMN "inquiries_response_time" varchar DEFAULT 'within 2 business days';
  ALTER TABLE "site_info" ADD COLUMN "inquiries_schedule_url" varchar;
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
  ALTER TABLE "inquiries_notes" ADD CONSTRAINT "inquiries_notes_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "inquiries_notes" ADD CONSTRAINT "inquiries_notes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."inquiries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "inquiries" ADD CONSTRAINT "inquiries_assigned_to_id_users_id_fk" FOREIGN KEY ("assigned_to_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "inquiries_rels" ADD CONSTRAINT "inquiries_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."inquiries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "inquiries_rels" ADD CONSTRAINT "inquiries_rels_capabilities_fk" FOREIGN KEY ("capabilities_id") REFERENCES "public"."capabilities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_notifications_inquiry_types" ADD CONSTRAINT "users_notifications_inquiry_types_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
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
  CREATE INDEX "inquiries_notes_order_idx" ON "inquiries_notes" USING btree ("_order");
  CREATE INDEX "inquiries_notes_parent_id_idx" ON "inquiries_notes" USING btree ("_parent_id");
  CREATE INDEX "inquiries_notes_author_idx" ON "inquiries_notes" USING btree ("author_id");
  CREATE UNIQUE INDEX "inquiries_reference_idx" ON "inquiries" USING btree ("reference");
  CREATE INDEX "inquiries_type_idx" ON "inquiries" USING btree ("type");
  CREATE INDEX "inquiries_status_idx" ON "inquiries" USING btree ("status");
  CREATE INDEX "inquiries_assigned_to_idx" ON "inquiries" USING btree ("assigned_to_id");
  CREATE INDEX "inquiries_submitted_at_idx" ON "inquiries" USING btree ("submitted_at");
  CREATE INDEX "inquiries_email_idx" ON "inquiries" USING btree ("email");
  CREATE INDEX "inquiries_updated_at_idx" ON "inquiries" USING btree ("updated_at");
  CREATE INDEX "inquiries_created_at_idx" ON "inquiries" USING btree ("created_at");
  CREATE INDEX "inquiries_rels_order_idx" ON "inquiries_rels" USING btree ("order");
  CREATE INDEX "inquiries_rels_parent_idx" ON "inquiries_rels" USING btree ("parent_id");
  CREATE INDEX "inquiries_rels_path_idx" ON "inquiries_rels" USING btree ("path");
  CREATE INDEX "inquiries_rels_capabilities_id_idx" ON "inquiries_rels" USING btree ("capabilities_id");
  CREATE INDEX "users_notifications_inquiry_types_order_idx" ON "users_notifications_inquiry_types" USING btree ("order");
  CREATE INDEX "users_notifications_inquiry_types_parent_idx" ON "users_notifications_inquiry_types" USING btree ("parent_id");
  CREATE INDEX "forms_blocks_capabilities_order_idx" ON "forms_blocks_capabilities" USING btree ("_order");
  CREATE INDEX "forms_blocks_capabilities_parent_id_idx" ON "forms_blocks_capabilities" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_capabilities_path_idx" ON "forms_blocks_capabilities" USING btree ("_path");
  CREATE INDEX "forms_rels_order_idx" ON "forms_rels" USING btree ("order");
  CREATE INDEX "forms_rels_parent_idx" ON "forms_rels" USING btree ("parent_id");
  CREATE INDEX "forms_rels_path_idx" ON "forms_rels" USING btree ("path");
  CREATE INDEX "forms_rels_capabilities_id_idx" ON "forms_rels" USING btree ("capabilities_id");
  ALTER TABLE "search_rels" ADD CONSTRAINT "search_rels_contact_pages_fk" FOREIGN KEY ("contact_pages_id") REFERENCES "public"."contact_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_contact_pages_fk" FOREIGN KEY ("contact_pages_id") REFERENCES "public"."contact_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_inquiries_fk" FOREIGN KEY ("inquiries_id") REFERENCES "public"."inquiries"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "search_rels_contact_pages_id_idx" ON "search_rels" USING btree ("contact_pages_id");
  CREATE INDEX "payload_locked_documents_rels_contact_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("contact_pages_id");
  CREATE INDEX "payload_locked_documents_rels_inquiries_id_idx" ON "payload_locked_documents_rels" USING btree ("inquiries_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
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
  
  ALTER TABLE "contact_pages_details" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "contact_pages_next_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "contact_pages" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_contact_pages_v_version_details" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_contact_pages_v_version_next_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_contact_pages_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "inquiries_notes" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "inquiries" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "inquiries_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "users_notifications_inquiry_types" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "forms_blocks_capabilities" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "forms_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "contact_pages_details" CASCADE;
  DROP TABLE "contact_pages_next_steps" CASCADE;
  DROP TABLE "contact_pages" CASCADE;
  DROP TABLE "_contact_pages_v_version_details" CASCADE;
  DROP TABLE "_contact_pages_v_version_next_steps" CASCADE;
  DROP TABLE "_contact_pages_v" CASCADE;
  DROP TABLE "inquiries_notes" CASCADE;
  DROP TABLE "inquiries" CASCADE;
  DROP TABLE "inquiries_rels" CASCADE;
  DROP TABLE "users_notifications_inquiry_types" CASCADE;
  DROP TABLE "forms_blocks_capabilities" CASCADE;
  DROP TABLE "forms_rels" CASCADE;
  ALTER TABLE "search_rels" DROP CONSTRAINT "search_rels_contact_pages_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_contact_pages_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_inquiries_fk";
  
  DROP INDEX "search_rels_contact_pages_id_idx";
  DROP INDEX "payload_locked_documents_rels_contact_pages_id_idx";
  DROP INDEX "payload_locked_documents_rels_inquiries_id_idx";
  ALTER TABLE "forms_blocks_country" ADD CONSTRAINT "forms_blocks_country_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "forms_blocks_country_order_idx" ON "forms_blocks_country" USING btree ("_order");
  CREATE INDEX "forms_blocks_country_parent_id_idx" ON "forms_blocks_country" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_country_path_idx" ON "forms_blocks_country" USING btree ("_path");
  ALTER TABLE "users" DROP COLUMN "notifications_inquiries";
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
  ALTER TABLE "search_rels" DROP COLUMN "contact_pages_id";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "contact_pages_find";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "contact_pages_create";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "contact_pages_update";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "contact_pages_delete";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "contact_pages_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "inquiries_id";
  ALTER TABLE "site_info" DROP COLUMN "inquiries_response_time";
  ALTER TABLE "site_info" DROP COLUMN "inquiries_schedule_url";
  DROP TYPE "public"."enum_contact_pages_status";
  DROP TYPE "public"."enum__contact_pages_v_version_status";
  DROP TYPE "public"."enum_inquiries_type";
  DROP TYPE "public"."enum_inquiries_status";
  DROP TYPE "public"."enum_inquiries_budget";
  DROP TYPE "public"."enum_inquiries_timeline";
  DROP TYPE "public"."enum_users_notifications_inquiry_types";
  DROP TYPE "public"."enum_forms_blocks_checkbox_maps_to";
  DROP TYPE "public"."enum_forms_blocks_email_maps_to";
  DROP TYPE "public"."enum_forms_blocks_number_maps_to";
  DROP TYPE "public"."enum_forms_blocks_select_maps_to";
  DROP TYPE "public"."enum_forms_blocks_state_maps_to";
  DROP TYPE "public"."enum_forms_blocks_text_maps_to";
  DROP TYPE "public"."enum_forms_blocks_textarea_maps_to";
  DROP TYPE "public"."enum_forms_blocks_capabilities_maps_to";
  DROP TYPE "public"."enum_forms_delivery";`)
}
