import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_dyn_aud_audiences" ADD COLUMN "subheading" varchar;
  ALTER TABLE "__pages_v_dyn_aud_v_audiences" ADD COLUMN "subheading" varchar;
  ALTER TABLE "home_dyn_aud_audiences" ADD COLUMN "subheading" varchar;
  ALTER TABLE "__home_v_dyn_aud_v_audiences" ADD COLUMN "subheading" varchar;
  ALTER TABLE "pages_dyn_aud" DROP COLUMN "subheading";
  ALTER TABLE "__pages_v_dyn_aud_v" DROP COLUMN "subheading";
  ALTER TABLE "home_dyn_aud" DROP COLUMN "subheading";
  ALTER TABLE "__home_v_dyn_aud_v" DROP COLUMN "subheading";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_dyn_aud" ADD COLUMN "subheading" varchar DEFAULT 'turn complexity into something clear, useful, and easy to act on.';
  ALTER TABLE "__pages_v_dyn_aud_v" ADD COLUMN "subheading" varchar DEFAULT 'turn complexity into something clear, useful, and easy to act on.';
  ALTER TABLE "home_dyn_aud" ADD COLUMN "subheading" varchar DEFAULT 'turn complexity into something clear, useful, and easy to act on.';
  ALTER TABLE "__home_v_dyn_aud_v" ADD COLUMN "subheading" varchar DEFAULT 'turn complexity into something clear, useful, and easy to act on.';
  ALTER TABLE "pages_dyn_aud_audiences" DROP COLUMN "subheading";
  ALTER TABLE "__pages_v_dyn_aud_v_audiences" DROP COLUMN "subheading";
  ALTER TABLE "home_dyn_aud_audiences" DROP COLUMN "subheading";
  ALTER TABLE "__home_v_dyn_aud_v_audiences" DROP COLUMN "subheading";`)
}
