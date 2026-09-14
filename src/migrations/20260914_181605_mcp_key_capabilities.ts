import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "forms_find" boolean DEFAULT false;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "forms_create" boolean DEFAULT false;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "forms_update" boolean DEFAULT false;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "forms_delete" boolean DEFAULT false;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "redirects_find" boolean DEFAULT false;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "redirects_create" boolean DEFAULT false;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "redirects_update" boolean DEFAULT false;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "redirects_delete" boolean DEFAULT false;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "audiences_find" boolean DEFAULT false;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "audiences_create" boolean DEFAULT false;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "audiences_update" boolean DEFAULT false;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "audiences_delete" boolean DEFAULT false;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "newsletters_find" boolean DEFAULT false;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "newsletters_create" boolean DEFAULT false;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "newsletters_update" boolean DEFAULT false;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "newsletters_delete" boolean DEFAULT false;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "form_submissions_find" boolean DEFAULT false;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "inquiries_find" boolean DEFAULT false;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "subscribers_find" boolean DEFAULT false;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "insights_index_find" boolean DEFAULT false;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "insights_index_update" boolean DEFAULT false;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "works_index_find" boolean DEFAULT false;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "works_index_update" boolean DEFAULT false;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "forms_find";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "forms_create";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "forms_update";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "forms_delete";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "redirects_find";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "redirects_create";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "redirects_update";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "redirects_delete";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "audiences_find";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "audiences_create";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "audiences_update";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "audiences_delete";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "newsletters_find";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "newsletters_create";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "newsletters_update";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "newsletters_delete";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "form_submissions_find";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "inquiries_find";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "subscribers_find";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "insights_index_find";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "insights_index_update";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "works_index_find";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "works_index_update";`)
}
