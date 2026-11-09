import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_resources_usage_status" AS ENUM('internal', 'client-review', 'public-approved');
  CREATE TABLE "lab_pages_download" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"resource_id" integer,
  	"heading" varchar,
  	"description" varchar,
  	"button_label" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "__lab_pages_v_download_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"resource_id" integer,
  	"heading" varchar,
  	"description" varchar,
  	"button_label" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "resources" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"description" varchar,
  	"usage_status" "enum_resources_usage_status" DEFAULT 'public-approved' NOT NULL,
  	"prefix" varchar DEFAULT 'resources',
  	"_objectkey" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric
  );
  
  ALTER TABLE "posts" ADD COLUMN "primary_resource_resource_id" integer;
  ALTER TABLE "posts" ADD COLUMN "primary_resource_heading" varchar;
  ALTER TABLE "posts" ADD COLUMN "primary_resource_description" varchar;
  ALTER TABLE "posts" ADD COLUMN "primary_resource_button_label" varchar;
  ALTER TABLE "_posts_v" ADD COLUMN "version_primary_resource_resource_id" integer;
  ALTER TABLE "_posts_v" ADD COLUMN "version_primary_resource_heading" varchar;
  ALTER TABLE "_posts_v" ADD COLUMN "version_primary_resource_description" varchar;
  ALTER TABLE "_posts_v" ADD COLUMN "version_primary_resource_button_label" varchar;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "resources_find" boolean DEFAULT false;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "resources_update" boolean DEFAULT false;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "resources_delete" boolean DEFAULT false;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "upload_resources" boolean DEFAULT false;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "resources_id" integer;
  ALTER TABLE "lab_pages_download" ADD CONSTRAINT "lab_pages_download_resource_id_resources_id_fk" FOREIGN KEY ("resource_id") REFERENCES "public"."resources"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "lab_pages_download" ADD CONSTRAINT "lab_pages_download_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lab_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__lab_pages_v_download_v" ADD CONSTRAINT "__lab_pages_v_download_v_resource_id_resources_id_fk" FOREIGN KEY ("resource_id") REFERENCES "public"."resources"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__lab_pages_v_download_v" ADD CONSTRAINT "__lab_pages_v_download_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_lab_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "lab_pages_download_order_idx" ON "lab_pages_download" USING btree ("_order");
  CREATE INDEX "lab_pages_download_parent_id_idx" ON "lab_pages_download" USING btree ("_parent_id");
  CREATE INDEX "lab_pages_download_path_idx" ON "lab_pages_download" USING btree ("_path");
  CREATE INDEX "lab_pages_download_resource_idx" ON "lab_pages_download" USING btree ("resource_id");
  CREATE INDEX "__lab_pages_v_download_v_order_idx" ON "__lab_pages_v_download_v" USING btree ("_order");
  CREATE INDEX "__lab_pages_v_download_v_parent_id_idx" ON "__lab_pages_v_download_v" USING btree ("_parent_id");
  CREATE INDEX "__lab_pages_v_download_v_path_idx" ON "__lab_pages_v_download_v" USING btree ("_path");
  CREATE INDEX "__lab_pages_v_download_v_resource_idx" ON "__lab_pages_v_download_v" USING btree ("resource_id");
  CREATE INDEX "resources_updated_at_idx" ON "resources" USING btree ("updated_at");
  CREATE INDEX "resources_created_at_idx" ON "resources" USING btree ("created_at");
  CREATE UNIQUE INDEX "resources_filename_idx" ON "resources" USING btree ("filename");
  ALTER TABLE "posts" ADD CONSTRAINT "posts_primary_resource_resource_id_resources_id_fk" FOREIGN KEY ("primary_resource_resource_id") REFERENCES "public"."resources"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_primary_resource_resource_id_resources_id_fk" FOREIGN KEY ("version_primary_resource_resource_id") REFERENCES "public"."resources"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_resources_fk" FOREIGN KEY ("resources_id") REFERENCES "public"."resources"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "posts_primary_resource_primary_resource_resource_idx" ON "posts" USING btree ("primary_resource_resource_id");
  CREATE INDEX "_posts_v_version_primary_resource_version_primary_resour_idx" ON "_posts_v" USING btree ("version_primary_resource_resource_id");
  CREATE INDEX "payload_locked_documents_rels_resources_id_idx" ON "payload_locked_documents_rels" USING btree ("resources_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "lab_pages_download" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__lab_pages_v_download_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "resources" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "lab_pages_download" CASCADE;
  DROP TABLE "__lab_pages_v_download_v" CASCADE;
  DROP TABLE "resources" CASCADE;
  ALTER TABLE "posts" DROP CONSTRAINT "posts_primary_resource_resource_id_resources_id_fk";
  
  ALTER TABLE "_posts_v" DROP CONSTRAINT "_posts_v_version_primary_resource_resource_id_resources_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_resources_fk";
  
  DROP INDEX "posts_primary_resource_primary_resource_resource_idx";
  DROP INDEX "_posts_v_version_primary_resource_version_primary_resour_idx";
  DROP INDEX "payload_locked_documents_rels_resources_id_idx";
  ALTER TABLE "posts" DROP COLUMN "primary_resource_resource_id";
  ALTER TABLE "posts" DROP COLUMN "primary_resource_heading";
  ALTER TABLE "posts" DROP COLUMN "primary_resource_description";
  ALTER TABLE "posts" DROP COLUMN "primary_resource_button_label";
  ALTER TABLE "_posts_v" DROP COLUMN "version_primary_resource_resource_id";
  ALTER TABLE "_posts_v" DROP COLUMN "version_primary_resource_heading";
  ALTER TABLE "_posts_v" DROP COLUMN "version_primary_resource_description";
  ALTER TABLE "_posts_v" DROP COLUMN "version_primary_resource_button_label";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "resources_find";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "resources_update";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "resources_delete";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "upload_resources";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "resources_id";
  DROP TYPE "public"."enum_resources_usage_status";`)
}
