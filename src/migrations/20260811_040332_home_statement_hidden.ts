import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "home" ADD COLUMN "statement_hidden" boolean DEFAULT false;
  ALTER TABLE "_home_v" ADD COLUMN "version_statement_hidden" boolean DEFAULT false;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "home" DROP COLUMN "statement_hidden";
  ALTER TABLE "_home_v" DROP COLUMN "version_statement_hidden";`)
}
