import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_newsletters_template" AS ENUM('letter', 'announcement');
  CREATE TYPE "public"."enum_newsletters_delivery_status" AS ENUM('unsent', 'sending', 'sent', 'failed');
  CREATE TYPE "public"."enum_newsletters_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__newsletters_v_version_template" AS ENUM('letter', 'announcement');
  CREATE TYPE "public"."enum__newsletters_v_version_delivery_status" AS ENUM('unsent', 'sending', 'sent', 'failed');
  CREATE TYPE "public"."enum__newsletters_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_subscribers_status" AS ENUM('pending', 'subscribed', 'unsubscribed', 'bounced', 'complained');
  CREATE TYPE "public"."enum_subscribers_source" AS ENUM('site', 'import', 'manual');
  ALTER TYPE "public"."enum_payload_jobs_log_task_slug" ADD VALUE 'newsletterSend' BEFORE 'schedulePublish';
  ALTER TYPE "public"."enum_payload_jobs_task_slug" ADD VALUE 'newsletterSend' BEFORE 'schedulePublish';
  CREATE TABLE "pages_blocks_newsletter_signup" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar DEFAULT 'Newsletter',
  	"heading" varchar DEFAULT 'Notes on clarity, trust, and momentum',
  	"body" varchar DEFAULT 'Occasional letters from the studio on making complex organizations make sense. No noise — unsubscribe anytime.',
  	"button_label" varchar DEFAULT 'Subscribe',
  	"audience_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_newsletter_signup" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar DEFAULT 'Newsletter',
  	"heading" varchar DEFAULT 'Notes on clarity, trust, and momentum',
  	"body" varchar DEFAULT 'Occasional letters from the studio on making complex organizations make sense. No noise — unsubscribe anytime.',
  	"button_label" varchar DEFAULT 'Subscribe',
  	"audience_id" integer,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "newsletters_blocks_nl_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"body" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "newsletters_blocks_nl_image" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"link" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "newsletters_blocks_nl_button" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"url" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "newsletters_blocks_nl_posts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "newsletters_blocks_nl_divider" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "newsletters" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"subject" varchar,
  	"preview_text" varchar,
  	"heading" varchar,
  	"template" "enum_newsletters_template" DEFAULT 'letter',
  	"delivery_status" "enum_newsletters_delivery_status" DEFAULT 'unsent',
  	"sent_at" timestamp(3) with time zone,
  	"recipient_count" numeric,
  	"send_error" varchar,
  	"send_progress" numeric DEFAULT 0,
  	"send_cursor" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_newsletters_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "newsletters_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"posts_id" integer,
  	"audiences_id" integer
  );
  
  CREATE TABLE "_newsletters_v_blocks_nl_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"body" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_newsletters_v_blocks_nl_image" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"link" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_newsletters_v_blocks_nl_button" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"url" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_newsletters_v_blocks_nl_posts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_newsletters_v_blocks_nl_divider" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_newsletters_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_subject" varchar,
  	"version_preview_text" varchar,
  	"version_heading" varchar,
  	"version_template" "enum__newsletters_v_version_template" DEFAULT 'letter',
  	"version_delivery_status" "enum__newsletters_v_version_delivery_status" DEFAULT 'unsent',
  	"version_sent_at" timestamp(3) with time zone,
  	"version_recipient_count" numeric,
  	"version_send_error" varchar,
  	"version_send_progress" numeric DEFAULT 0,
  	"version_send_cursor" numeric DEFAULT 0,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__newsletters_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_newsletters_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"posts_id" integer,
  	"audiences_id" integer
  );
  
  CREATE TABLE "audiences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar NOT NULL,
  	"description" varchar,
  	"allow_public_signup" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "subscribers" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"email" varchar NOT NULL,
  	"name" varchar,
  	"organization_id" integer,
  	"status" "enum_subscribers_status" DEFAULT 'pending' NOT NULL,
  	"source" "enum_subscribers_source" DEFAULT 'manual' NOT NULL,
  	"token" varchar,
  	"confirm_sent_at" timestamp(3) with time zone,
  	"subscribed_at" timestamp(3) with time zone,
  	"confirmed_at" timestamp(3) with time zone,
  	"unsubscribed_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "subscribers_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"audiences_id" integer
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "newsletters_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "audiences_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "subscribers_id" integer;
  ALTER TABLE "pages_blocks_newsletter_signup" ADD CONSTRAINT "pages_blocks_newsletter_signup_audience_id_audiences_id_fk" FOREIGN KEY ("audience_id") REFERENCES "public"."audiences"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_newsletter_signup" ADD CONSTRAINT "pages_blocks_newsletter_signup_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_newsletter_signup" ADD CONSTRAINT "_pages_v_blocks_newsletter_signup_audience_id_audiences_id_fk" FOREIGN KEY ("audience_id") REFERENCES "public"."audiences"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_newsletter_signup" ADD CONSTRAINT "_pages_v_blocks_newsletter_signup_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "newsletters_blocks_nl_text" ADD CONSTRAINT "newsletters_blocks_nl_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."newsletters"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "newsletters_blocks_nl_image" ADD CONSTRAINT "newsletters_blocks_nl_image_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "newsletters_blocks_nl_image" ADD CONSTRAINT "newsletters_blocks_nl_image_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."newsletters"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "newsletters_blocks_nl_button" ADD CONSTRAINT "newsletters_blocks_nl_button_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."newsletters"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "newsletters_blocks_nl_posts" ADD CONSTRAINT "newsletters_blocks_nl_posts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."newsletters"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "newsletters_blocks_nl_divider" ADD CONSTRAINT "newsletters_blocks_nl_divider_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."newsletters"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "newsletters_rels" ADD CONSTRAINT "newsletters_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."newsletters"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "newsletters_rels" ADD CONSTRAINT "newsletters_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "newsletters_rels" ADD CONSTRAINT "newsletters_rels_audiences_fk" FOREIGN KEY ("audiences_id") REFERENCES "public"."audiences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_newsletters_v_blocks_nl_text" ADD CONSTRAINT "_newsletters_v_blocks_nl_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_newsletters_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_newsletters_v_blocks_nl_image" ADD CONSTRAINT "_newsletters_v_blocks_nl_image_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_newsletters_v_blocks_nl_image" ADD CONSTRAINT "_newsletters_v_blocks_nl_image_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_newsletters_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_newsletters_v_blocks_nl_button" ADD CONSTRAINT "_newsletters_v_blocks_nl_button_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_newsletters_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_newsletters_v_blocks_nl_posts" ADD CONSTRAINT "_newsletters_v_blocks_nl_posts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_newsletters_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_newsletters_v_blocks_nl_divider" ADD CONSTRAINT "_newsletters_v_blocks_nl_divider_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_newsletters_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_newsletters_v" ADD CONSTRAINT "_newsletters_v_parent_id_newsletters_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."newsletters"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_newsletters_v_rels" ADD CONSTRAINT "_newsletters_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_newsletters_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_newsletters_v_rels" ADD CONSTRAINT "_newsletters_v_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_newsletters_v_rels" ADD CONSTRAINT "_newsletters_v_rels_audiences_fk" FOREIGN KEY ("audiences_id") REFERENCES "public"."audiences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "subscribers" ADD CONSTRAINT "subscribers_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "subscribers_rels" ADD CONSTRAINT "subscribers_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."subscribers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "subscribers_rels" ADD CONSTRAINT "subscribers_rels_audiences_fk" FOREIGN KEY ("audiences_id") REFERENCES "public"."audiences"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_newsletter_signup_order_idx" ON "pages_blocks_newsletter_signup" USING btree ("_order");
  CREATE INDEX "pages_blocks_newsletter_signup_parent_id_idx" ON "pages_blocks_newsletter_signup" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_newsletter_signup_path_idx" ON "pages_blocks_newsletter_signup" USING btree ("_path");
  CREATE INDEX "pages_blocks_newsletter_signup_audience_idx" ON "pages_blocks_newsletter_signup" USING btree ("audience_id");
  CREATE INDEX "_pages_v_blocks_newsletter_signup_order_idx" ON "_pages_v_blocks_newsletter_signup" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_newsletter_signup_parent_id_idx" ON "_pages_v_blocks_newsletter_signup" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_newsletter_signup_path_idx" ON "_pages_v_blocks_newsletter_signup" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_newsletter_signup_audience_idx" ON "_pages_v_blocks_newsletter_signup" USING btree ("audience_id");
  CREATE INDEX "newsletters_blocks_nl_text_order_idx" ON "newsletters_blocks_nl_text" USING btree ("_order");
  CREATE INDEX "newsletters_blocks_nl_text_parent_id_idx" ON "newsletters_blocks_nl_text" USING btree ("_parent_id");
  CREATE INDEX "newsletters_blocks_nl_text_path_idx" ON "newsletters_blocks_nl_text" USING btree ("_path");
  CREATE INDEX "newsletters_blocks_nl_image_order_idx" ON "newsletters_blocks_nl_image" USING btree ("_order");
  CREATE INDEX "newsletters_blocks_nl_image_parent_id_idx" ON "newsletters_blocks_nl_image" USING btree ("_parent_id");
  CREATE INDEX "newsletters_blocks_nl_image_path_idx" ON "newsletters_blocks_nl_image" USING btree ("_path");
  CREATE INDEX "newsletters_blocks_nl_image_media_idx" ON "newsletters_blocks_nl_image" USING btree ("media_id");
  CREATE INDEX "newsletters_blocks_nl_button_order_idx" ON "newsletters_blocks_nl_button" USING btree ("_order");
  CREATE INDEX "newsletters_blocks_nl_button_parent_id_idx" ON "newsletters_blocks_nl_button" USING btree ("_parent_id");
  CREATE INDEX "newsletters_blocks_nl_button_path_idx" ON "newsletters_blocks_nl_button" USING btree ("_path");
  CREATE INDEX "newsletters_blocks_nl_posts_order_idx" ON "newsletters_blocks_nl_posts" USING btree ("_order");
  CREATE INDEX "newsletters_blocks_nl_posts_parent_id_idx" ON "newsletters_blocks_nl_posts" USING btree ("_parent_id");
  CREATE INDEX "newsletters_blocks_nl_posts_path_idx" ON "newsletters_blocks_nl_posts" USING btree ("_path");
  CREATE INDEX "newsletters_blocks_nl_divider_order_idx" ON "newsletters_blocks_nl_divider" USING btree ("_order");
  CREATE INDEX "newsletters_blocks_nl_divider_parent_id_idx" ON "newsletters_blocks_nl_divider" USING btree ("_parent_id");
  CREATE INDEX "newsletters_blocks_nl_divider_path_idx" ON "newsletters_blocks_nl_divider" USING btree ("_path");
  CREATE INDEX "newsletters_delivery_status_idx" ON "newsletters" USING btree ("delivery_status");
  CREATE INDEX "newsletters_updated_at_idx" ON "newsletters" USING btree ("updated_at");
  CREATE INDEX "newsletters_created_at_idx" ON "newsletters" USING btree ("created_at");
  CREATE INDEX "newsletters__status_idx" ON "newsletters" USING btree ("_status");
  CREATE INDEX "newsletters_rels_order_idx" ON "newsletters_rels" USING btree ("order");
  CREATE INDEX "newsletters_rels_parent_idx" ON "newsletters_rels" USING btree ("parent_id");
  CREATE INDEX "newsletters_rels_path_idx" ON "newsletters_rels" USING btree ("path");
  CREATE INDEX "newsletters_rels_posts_id_idx" ON "newsletters_rels" USING btree ("posts_id");
  CREATE INDEX "newsletters_rels_audiences_id_idx" ON "newsletters_rels" USING btree ("audiences_id");
  CREATE INDEX "_newsletters_v_blocks_nl_text_order_idx" ON "_newsletters_v_blocks_nl_text" USING btree ("_order");
  CREATE INDEX "_newsletters_v_blocks_nl_text_parent_id_idx" ON "_newsletters_v_blocks_nl_text" USING btree ("_parent_id");
  CREATE INDEX "_newsletters_v_blocks_nl_text_path_idx" ON "_newsletters_v_blocks_nl_text" USING btree ("_path");
  CREATE INDEX "_newsletters_v_blocks_nl_image_order_idx" ON "_newsletters_v_blocks_nl_image" USING btree ("_order");
  CREATE INDEX "_newsletters_v_blocks_nl_image_parent_id_idx" ON "_newsletters_v_blocks_nl_image" USING btree ("_parent_id");
  CREATE INDEX "_newsletters_v_blocks_nl_image_path_idx" ON "_newsletters_v_blocks_nl_image" USING btree ("_path");
  CREATE INDEX "_newsletters_v_blocks_nl_image_media_idx" ON "_newsletters_v_blocks_nl_image" USING btree ("media_id");
  CREATE INDEX "_newsletters_v_blocks_nl_button_order_idx" ON "_newsletters_v_blocks_nl_button" USING btree ("_order");
  CREATE INDEX "_newsletters_v_blocks_nl_button_parent_id_idx" ON "_newsletters_v_blocks_nl_button" USING btree ("_parent_id");
  CREATE INDEX "_newsletters_v_blocks_nl_button_path_idx" ON "_newsletters_v_blocks_nl_button" USING btree ("_path");
  CREATE INDEX "_newsletters_v_blocks_nl_posts_order_idx" ON "_newsletters_v_blocks_nl_posts" USING btree ("_order");
  CREATE INDEX "_newsletters_v_blocks_nl_posts_parent_id_idx" ON "_newsletters_v_blocks_nl_posts" USING btree ("_parent_id");
  CREATE INDEX "_newsletters_v_blocks_nl_posts_path_idx" ON "_newsletters_v_blocks_nl_posts" USING btree ("_path");
  CREATE INDEX "_newsletters_v_blocks_nl_divider_order_idx" ON "_newsletters_v_blocks_nl_divider" USING btree ("_order");
  CREATE INDEX "_newsletters_v_blocks_nl_divider_parent_id_idx" ON "_newsletters_v_blocks_nl_divider" USING btree ("_parent_id");
  CREATE INDEX "_newsletters_v_blocks_nl_divider_path_idx" ON "_newsletters_v_blocks_nl_divider" USING btree ("_path");
  CREATE INDEX "_newsletters_v_parent_idx" ON "_newsletters_v" USING btree ("parent_id");
  CREATE INDEX "_newsletters_v_version_version_delivery_status_idx" ON "_newsletters_v" USING btree ("version_delivery_status");
  CREATE INDEX "_newsletters_v_version_version_updated_at_idx" ON "_newsletters_v" USING btree ("version_updated_at");
  CREATE INDEX "_newsletters_v_version_version_created_at_idx" ON "_newsletters_v" USING btree ("version_created_at");
  CREATE INDEX "_newsletters_v_version_version__status_idx" ON "_newsletters_v" USING btree ("version__status");
  CREATE INDEX "_newsletters_v_created_at_idx" ON "_newsletters_v" USING btree ("created_at");
  CREATE INDEX "_newsletters_v_updated_at_idx" ON "_newsletters_v" USING btree ("updated_at");
  CREATE INDEX "_newsletters_v_latest_idx" ON "_newsletters_v" USING btree ("latest");
  CREATE INDEX "_newsletters_v_autosave_idx" ON "_newsletters_v" USING btree ("autosave");
  CREATE INDEX "_newsletters_v_rels_order_idx" ON "_newsletters_v_rels" USING btree ("order");
  CREATE INDEX "_newsletters_v_rels_parent_idx" ON "_newsletters_v_rels" USING btree ("parent_id");
  CREATE INDEX "_newsletters_v_rels_path_idx" ON "_newsletters_v_rels" USING btree ("path");
  CREATE INDEX "_newsletters_v_rels_posts_id_idx" ON "_newsletters_v_rels" USING btree ("posts_id");
  CREATE INDEX "_newsletters_v_rels_audiences_id_idx" ON "_newsletters_v_rels" USING btree ("audiences_id");
  CREATE UNIQUE INDEX "audiences_name_idx" ON "audiences" USING btree ("name");
  CREATE UNIQUE INDEX "audiences_slug_idx" ON "audiences" USING btree ("slug");
  CREATE INDEX "audiences_updated_at_idx" ON "audiences" USING btree ("updated_at");
  CREATE INDEX "audiences_created_at_idx" ON "audiences" USING btree ("created_at");
  CREATE UNIQUE INDEX "subscribers_email_idx" ON "subscribers" USING btree ("email");
  CREATE INDEX "subscribers_organization_idx" ON "subscribers" USING btree ("organization_id");
  CREATE INDEX "subscribers_status_idx" ON "subscribers" USING btree ("status");
  CREATE UNIQUE INDEX "subscribers_token_idx" ON "subscribers" USING btree ("token");
  CREATE INDEX "subscribers_updated_at_idx" ON "subscribers" USING btree ("updated_at");
  CREATE INDEX "subscribers_created_at_idx" ON "subscribers" USING btree ("created_at");
  CREATE INDEX "subscribers_rels_order_idx" ON "subscribers_rels" USING btree ("order");
  CREATE INDEX "subscribers_rels_parent_idx" ON "subscribers_rels" USING btree ("parent_id");
  CREATE INDEX "subscribers_rels_path_idx" ON "subscribers_rels" USING btree ("path");
  CREATE INDEX "subscribers_rels_audiences_id_idx" ON "subscribers_rels" USING btree ("audiences_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_newsletters_fk" FOREIGN KEY ("newsletters_id") REFERENCES "public"."newsletters"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_audiences_fk" FOREIGN KEY ("audiences_id") REFERENCES "public"."audiences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_subscribers_fk" FOREIGN KEY ("subscribers_id") REFERENCES "public"."subscribers"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_newsletters_id_idx" ON "payload_locked_documents_rels" USING btree ("newsletters_id");
  CREATE INDEX "payload_locked_documents_rels_audiences_id_idx" ON "payload_locked_documents_rels" USING btree ("audiences_id");
  CREATE INDEX "payload_locked_documents_rels_subscribers_id_idx" ON "payload_locked_documents_rels" USING btree ("subscribers_id");`)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_newsletter_signup" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_newsletter_signup" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "newsletters_blocks_nl_text" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "newsletters_blocks_nl_image" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "newsletters_blocks_nl_button" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "newsletters_blocks_nl_posts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "newsletters_blocks_nl_divider" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "newsletters" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "newsletters_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_newsletters_v_blocks_nl_text" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_newsletters_v_blocks_nl_image" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_newsletters_v_blocks_nl_button" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_newsletters_v_blocks_nl_posts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_newsletters_v_blocks_nl_divider" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_newsletters_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_newsletters_v_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "audiences" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "subscribers" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "subscribers_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "pages_blocks_newsletter_signup" CASCADE;
  DROP TABLE "_pages_v_blocks_newsletter_signup" CASCADE;
  DROP TABLE "newsletters_blocks_nl_text" CASCADE;
  DROP TABLE "newsletters_blocks_nl_image" CASCADE;
  DROP TABLE "newsletters_blocks_nl_button" CASCADE;
  DROP TABLE "newsletters_blocks_nl_posts" CASCADE;
  DROP TABLE "newsletters_blocks_nl_divider" CASCADE;
  DROP TABLE "newsletters" CASCADE;
  DROP TABLE "newsletters_rels" CASCADE;
  DROP TABLE "_newsletters_v_blocks_nl_text" CASCADE;
  DROP TABLE "_newsletters_v_blocks_nl_image" CASCADE;
  DROP TABLE "_newsletters_v_blocks_nl_button" CASCADE;
  DROP TABLE "_newsletters_v_blocks_nl_posts" CASCADE;
  DROP TABLE "_newsletters_v_blocks_nl_divider" CASCADE;
  DROP TABLE "_newsletters_v" CASCADE;
  DROP TABLE "_newsletters_v_rels" CASCADE;
  DROP TABLE "audiences" CASCADE;
  DROP TABLE "subscribers" CASCADE;
  DROP TABLE "subscribers_rels" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_newsletters_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_audiences_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_subscribers_fk";
  
  ALTER TABLE "payload_jobs_log" ALTER COLUMN "task_slug" SET DATA TYPE text;
  DROP TYPE "public"."enum_payload_jobs_log_task_slug";
  CREATE TYPE "public"."enum_payload_jobs_log_task_slug" AS ENUM('inline', 'schedulePublish');
  ALTER TABLE "payload_jobs_log" ALTER COLUMN "task_slug" SET DATA TYPE "public"."enum_payload_jobs_log_task_slug" USING "task_slug"::"public"."enum_payload_jobs_log_task_slug";
  ALTER TABLE "payload_jobs" ALTER COLUMN "task_slug" SET DATA TYPE text;
  DROP TYPE "public"."enum_payload_jobs_task_slug";
  CREATE TYPE "public"."enum_payload_jobs_task_slug" AS ENUM('inline', 'schedulePublish');
  ALTER TABLE "payload_jobs" ALTER COLUMN "task_slug" SET DATA TYPE "public"."enum_payload_jobs_task_slug" USING "task_slug"::"public"."enum_payload_jobs_task_slug";
  DROP INDEX "payload_locked_documents_rels_newsletters_id_idx";
  DROP INDEX "payload_locked_documents_rels_audiences_id_idx";
  DROP INDEX "payload_locked_documents_rels_subscribers_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "newsletters_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "audiences_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "subscribers_id";
  DROP TYPE "public"."enum_newsletters_template";
  DROP TYPE "public"."enum_newsletters_delivery_status";
  DROP TYPE "public"."enum_newsletters_status";
  DROP TYPE "public"."enum__newsletters_v_version_template";
  DROP TYPE "public"."enum__newsletters_v_version_delivery_status";
  DROP TYPE "public"."enum__newsletters_v_version_status";
  DROP TYPE "public"."enum_subscribers_status";
  DROP TYPE "public"."enum_subscribers_source";`)
}
