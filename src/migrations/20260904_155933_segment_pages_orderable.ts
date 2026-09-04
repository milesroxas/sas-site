import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "expertise_pages" ADD COLUMN "_order" varchar;
  ALTER TABLE "_expertise_pages_v" ADD COLUMN "version__order" varchar;
  ALTER TABLE "audience_pages" ADD COLUMN "_order" varchar;
  ALTER TABLE "_audience_pages_v" ADD COLUMN "version__order" varchar;
  CREATE INDEX "expertise_pages__order_idx" ON "expertise_pages" USING btree ("_order");
  CREATE INDEX "_expertise_pages_v_version_version__order_idx" ON "_expertise_pages_v" USING btree ("version__order");
  CREATE INDEX "audience_pages__order_idx" ON "audience_pages" USING btree ("_order");
  CREATE INDEX "_audience_pages_v_version_version__order_idx" ON "_audience_pages_v" USING btree ("version__order");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "expertise_pages__order_idx";
  DROP INDEX "_expertise_pages_v_version_version__order_idx";
  DROP INDEX "audience_pages__order_idx";
  DROP INDEX "_audience_pages_v_version_version__order_idx";
  ALTER TABLE "expertise_pages" DROP COLUMN "_order";
  ALTER TABLE "_expertise_pages_v" DROP COLUMN "version__order";
  ALTER TABLE "audience_pages" DROP COLUMN "_order";
  ALTER TABLE "_audience_pages_v" DROP COLUMN "version__order";`)
}
