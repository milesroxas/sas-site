import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "payload_mcp_tool_outline_document" boolean DEFAULT false;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "payload_mcp_tool_locate_block" boolean DEFAULT false;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "payload_mcp_tool_get_block" boolean DEFAULT false;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "payload_mcp_tool_patch_block" boolean DEFAULT false;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "payload_mcp_tool_outline_document";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "payload_mcp_tool_locate_block";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "payload_mcp_tool_get_block";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "payload_mcp_tool_patch_block";`)
}
