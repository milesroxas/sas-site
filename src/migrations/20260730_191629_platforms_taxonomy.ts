import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "platforms" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"_order" varchar,
  	"name" varchar NOT NULL,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar NOT NULL,
  	"description" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "projects_platforms" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_projects_v_version_platforms" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "projects_platforms" CASCADE;
  DROP TABLE "_projects_v_version_platforms" CASCADE;
  ALTER TABLE "media" ALTER COLUMN "all_channels" SET DEFAULT true;
  ALTER TABLE "projects_rels" ADD COLUMN "platforms_id" integer;
  ALTER TABLE "_projects_v_rels" ADD COLUMN "platforms_id" integer;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "platforms_find" boolean DEFAULT false;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "platforms_create" boolean DEFAULT false;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "platforms_update" boolean DEFAULT false;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "platforms_delete" boolean DEFAULT false;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "platforms_id" integer;
  CREATE INDEX "platforms__order_idx" ON "platforms" USING btree ("_order");
  CREATE UNIQUE INDEX "platforms_slug_idx" ON "platforms" USING btree ("slug");
  CREATE INDEX "platforms_updated_at_idx" ON "platforms" USING btree ("updated_at");
  CREATE INDEX "platforms_created_at_idx" ON "platforms" USING btree ("created_at");
  ALTER TABLE "projects_rels" ADD CONSTRAINT "projects_rels_platforms_fk" FOREIGN KEY ("platforms_id") REFERENCES "public"."platforms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_rels" ADD CONSTRAINT "_projects_v_rels_platforms_fk" FOREIGN KEY ("platforms_id") REFERENCES "public"."platforms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_platforms_fk" FOREIGN KEY ("platforms_id") REFERENCES "public"."platforms"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "projects_rels_platforms_id_idx" ON "projects_rels" USING btree ("platforms_id");
  CREATE INDEX "_projects_v_rels_platforms_id_idx" ON "_projects_v_rels" USING btree ("platforms_id");
  CREATE INDEX "payload_locked_documents_rels_platforms_id_idx" ON "payload_locked_documents_rels" USING btree ("platforms_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "projects_platforms" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar
  );
  
  CREATE TABLE "_projects_v_version_platforms" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"_uuid" varchar
  );
  
  ALTER TABLE "platforms" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "platforms" CASCADE;
  ALTER TABLE "projects_rels" DROP CONSTRAINT "projects_rels_platforms_fk";
  
  ALTER TABLE "_projects_v_rels" DROP CONSTRAINT "_projects_v_rels_platforms_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_platforms_fk";
  
  DROP INDEX "projects_rels_platforms_id_idx";
  DROP INDEX "_projects_v_rels_platforms_id_idx";
  DROP INDEX "payload_locked_documents_rels_platforms_id_idx";
  ALTER TABLE "media" ALTER COLUMN "all_channels" SET DEFAULT false;
  ALTER TABLE "projects_platforms" ADD CONSTRAINT "projects_platforms_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_version_platforms" ADD CONSTRAINT "_projects_v_version_platforms_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "projects_platforms_order_idx" ON "projects_platforms" USING btree ("_order");
  CREATE INDEX "projects_platforms_parent_id_idx" ON "projects_platforms" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_version_platforms_order_idx" ON "_projects_v_version_platforms" USING btree ("_order");
  CREATE INDEX "_projects_v_version_platforms_parent_id_idx" ON "_projects_v_version_platforms" USING btree ("_parent_id");
  ALTER TABLE "projects_rels" DROP COLUMN "platforms_id";
  ALTER TABLE "_projects_v_rels" DROP COLUMN "platforms_id";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "platforms_find";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "platforms_create";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "platforms_update";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "platforms_delete";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "platforms_id";`)
}
