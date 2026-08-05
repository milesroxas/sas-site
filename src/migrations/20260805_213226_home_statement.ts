import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_dyn_aud" ALTER COLUMN "theme" SET DEFAULT 'light';
  ALTER TABLE "__pages_v_dyn_aud_v" ALTER COLUMN "theme" SET DEFAULT 'light';
  ALTER TABLE "home_dyn_aud" ALTER COLUMN "theme" SET DEFAULT 'light';
  ALTER TABLE "__home_v_dyn_aud_v" ALTER COLUMN "theme" SET DEFAULT 'light';
  ALTER TABLE "home" ADD COLUMN "statement_body" jsonb;
  ALTER TABLE "_home_v" ADD COLUMN "version_statement_body" jsonb;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_dyn_aud" ALTER COLUMN "theme" SET DEFAULT 'dark';
  ALTER TABLE "__pages_v_dyn_aud_v" ALTER COLUMN "theme" SET DEFAULT 'dark';
  ALTER TABLE "home_dyn_aud" ALTER COLUMN "theme" SET DEFAULT 'dark';
  ALTER TABLE "__home_v_dyn_aud_v" ALTER COLUMN "theme" SET DEFAULT 'dark';
  ALTER TABLE "home" DROP COLUMN "statement_body";
  ALTER TABLE "_home_v" DROP COLUMN "version_statement_body";`)
}
