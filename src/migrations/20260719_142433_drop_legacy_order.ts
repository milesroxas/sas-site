import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "capabilities_order_idx";
  DROP INDEX "industries_order_idx";
  ALTER TABLE "capabilities" DROP COLUMN "order";
  ALTER TABLE "industries" DROP COLUMN "order";`)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "capabilities" ADD COLUMN "order" numeric DEFAULT 0;
  ALTER TABLE "industries" ADD COLUMN "order" numeric DEFAULT 0;
  CREATE INDEX "capabilities_order_idx" ON "capabilities" USING btree ("order");
  CREATE INDEX "industries_order_idx" ON "industries" USING btree ("order");`)
}
