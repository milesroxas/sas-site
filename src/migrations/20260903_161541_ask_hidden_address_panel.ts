import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "footer" ADD COLUMN "closing_address_note" varchar DEFAULT 'We’re a fully remote company and have been since 2019. But, in case you need it, our business address is:';
  ALTER TABLE "site_info" ADD COLUMN "ask_hidden" boolean DEFAULT false;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "footer" DROP COLUMN "closing_address_note";
  ALTER TABLE "site_info" DROP COLUMN "ask_hidden";`)
}
