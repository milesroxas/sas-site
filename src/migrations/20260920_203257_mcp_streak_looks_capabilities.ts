import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "streak_looks_find" boolean DEFAULT false;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "streak_looks_create" boolean DEFAULT false;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "streak_looks_update" boolean DEFAULT false;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "streak_looks_delete" boolean DEFAULT false;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "streak_looks_find";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "streak_looks_create";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "streak_looks_update";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "streak_looks_delete";`)
}
