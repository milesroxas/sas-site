import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
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
  CREATE TYPE "public"."enum_inquiries_type" AS ENUM('project', 'general');
  CREATE TYPE "public"."enum_inquiries_status" AS ENUM('new', 'in-progress', 'replied', 'closed', 'spam');
  CREATE TYPE "public"."enum_inquiries_budget" AS ENUM('under-25k', '25-50k', '50-100k', '100k-plus', 'guidance');
  CREATE TYPE "public"."enum_inquiries_timeline" AS ENUM('asap', '1-3-months', '3-6-months', 'exploring');
  CREATE TYPE "public"."enum_users_notifications_inquiry_types" AS ENUM('project', 'general');
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
  
  ALTER TABLE "pages_rels" ADD COLUMN "capabilities_id" integer;
  ALTER TABLE "_pages_v_rels" ADD COLUMN "capabilities_id" integer;
  ALTER TABLE "audience_pages_rels" ADD COLUMN "capabilities_id" integer;
  ALTER TABLE "_audience_pages_v_rels" ADD COLUMN "capabilities_id" integer;
  ALTER TABLE "users" ADD COLUMN "notifications_inquiries" boolean DEFAULT false;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "inquiries_id" integer;
  ALTER TABLE "home_rels" ADD COLUMN "capabilities_id" integer;
  ALTER TABLE "_home_v_rels" ADD COLUMN "capabilities_id" integer;
  ALTER TABLE "site_info" ADD COLUMN "inquiries_response_time" varchar DEFAULT 'within 2 business days';
  ALTER TABLE "site_info" ADD COLUMN "inquiries_schedule_url" varchar;
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
  ALTER TABLE "inquiries_notes" ADD CONSTRAINT "inquiries_notes_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "inquiries_notes" ADD CONSTRAINT "inquiries_notes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."inquiries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "inquiries" ADD CONSTRAINT "inquiries_assigned_to_id_users_id_fk" FOREIGN KEY ("assigned_to_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "inquiries_rels" ADD CONSTRAINT "inquiries_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."inquiries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "inquiries_rels" ADD CONSTRAINT "inquiries_rels_capabilities_fk" FOREIGN KEY ("capabilities_id") REFERENCES "public"."capabilities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_notifications_inquiry_types" ADD CONSTRAINT "users_notifications_inquiry_types_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
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
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_inquiries_fk" FOREIGN KEY ("inquiries_id") REFERENCES "public"."inquiries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_rels" ADD CONSTRAINT "home_rels_capabilities_fk" FOREIGN KEY ("capabilities_id") REFERENCES "public"."capabilities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_rels" ADD CONSTRAINT "_home_v_rels_capabilities_fk" FOREIGN KEY ("capabilities_id") REFERENCES "public"."capabilities"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_rels_capabilities_id_idx" ON "pages_rels" USING btree ("capabilities_id");
  CREATE INDEX "_pages_v_rels_capabilities_id_idx" ON "_pages_v_rels" USING btree ("capabilities_id");
  CREATE INDEX "audience_pages_rels_capabilities_id_idx" ON "audience_pages_rels" USING btree ("capabilities_id");
  CREATE INDEX "_audience_pages_v_rels_capabilities_id_idx" ON "_audience_pages_v_rels" USING btree ("capabilities_id");
  CREATE INDEX "payload_locked_documents_rels_inquiries_id_idx" ON "payload_locked_documents_rels" USING btree ("inquiries_id");
  CREATE INDEX "home_rels_capabilities_id_idx" ON "home_rels" USING btree ("capabilities_id");
  CREATE INDEX "_home_v_rels_capabilities_id_idx" ON "_home_v_rels" USING btree ("capabilities_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
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
  ALTER TABLE "inquiries_notes" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "inquiries" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "inquiries_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "users_notifications_inquiry_types" DISABLE ROW LEVEL SECURITY;
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
  DROP TABLE "inquiries_notes" CASCADE;
  DROP TABLE "inquiries" CASCADE;
  DROP TABLE "inquiries_rels" CASCADE;
  DROP TABLE "users_notifications_inquiry_types" CASCADE;
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
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_inquiries_fk";
  
  ALTER TABLE "home_rels" DROP CONSTRAINT "home_rels_capabilities_fk";
  
  ALTER TABLE "_home_v_rels" DROP CONSTRAINT "_home_v_rels_capabilities_fk";
  
  DROP INDEX "pages_rels_capabilities_id_idx";
  DROP INDEX "_pages_v_rels_capabilities_id_idx";
  DROP INDEX "audience_pages_rels_capabilities_id_idx";
  DROP INDEX "_audience_pages_v_rels_capabilities_id_idx";
  DROP INDEX "payload_locked_documents_rels_inquiries_id_idx";
  DROP INDEX "home_rels_capabilities_id_idx";
  DROP INDEX "_home_v_rels_capabilities_id_idx";
  ALTER TABLE "pages_rels" DROP COLUMN "capabilities_id";
  ALTER TABLE "_pages_v_rels" DROP COLUMN "capabilities_id";
  ALTER TABLE "audience_pages_rels" DROP COLUMN "capabilities_id";
  ALTER TABLE "_audience_pages_v_rels" DROP COLUMN "capabilities_id";
  ALTER TABLE "users" DROP COLUMN "notifications_inquiries";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "inquiries_id";
  ALTER TABLE "home_rels" DROP COLUMN "capabilities_id";
  ALTER TABLE "_home_v_rels" DROP COLUMN "capabilities_id";
  ALTER TABLE "site_info" DROP COLUMN "inquiries_response_time";
  ALTER TABLE "site_info" DROP COLUMN "inquiries_schedule_url";
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
  DROP TYPE "public"."enum_inquiries_type";
  DROP TYPE "public"."enum_inquiries_status";
  DROP TYPE "public"."enum_inquiries_budget";
  DROP TYPE "public"."enum_inquiries_timeline";
  DROP TYPE "public"."enum_users_notifications_inquiry_types";
  DROP TYPE "public"."enum_home_contact_variant";
  DROP TYPE "public"."enum_home_contact_theme";
  DROP TYPE "public"."enum___home_v_contact_v_variant";
  DROP TYPE "public"."enum___home_v_contact_v_theme";`)
}
