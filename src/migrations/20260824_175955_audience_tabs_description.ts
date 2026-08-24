import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_aud_tabs_tabs" ADD COLUMN "description" varchar;
  ALTER TABLE "__pages_v_aud_tabs_v_tabs" ADD COLUMN "description" varchar;
  ALTER TABLE "work_pages_aud_tabs_tabs" ADD COLUMN "description" varchar;
  ALTER TABLE "__work_pages_v_aud_tabs_v_tabs" ADD COLUMN "description" varchar;
  ALTER TABLE "expertise_pages_aud_tabs_tabs" ADD COLUMN "description" varchar;
  ALTER TABLE "__expertise_pages_v_aud_tabs_v_tabs" ADD COLUMN "description" varchar;
  ALTER TABLE "audience_pages_aud_tabs_tabs" ADD COLUMN "description" varchar;
  ALTER TABLE "__audience_pages_v_aud_tabs_v_tabs" ADD COLUMN "description" varchar;
  ALTER TABLE "home_aud_tabs_tabs" ADD COLUMN "description" varchar;
  ALTER TABLE "__home_v_aud_tabs_v_tabs" ADD COLUMN "description" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_aud_tabs_tabs" DROP COLUMN "description";
  ALTER TABLE "__pages_v_aud_tabs_v_tabs" DROP COLUMN "description";
  ALTER TABLE "work_pages_aud_tabs_tabs" DROP COLUMN "description";
  ALTER TABLE "__work_pages_v_aud_tabs_v_tabs" DROP COLUMN "description";
  ALTER TABLE "expertise_pages_aud_tabs_tabs" DROP COLUMN "description";
  ALTER TABLE "__expertise_pages_v_aud_tabs_v_tabs" DROP COLUMN "description";
  ALTER TABLE "audience_pages_aud_tabs_tabs" DROP COLUMN "description";
  ALTER TABLE "__audience_pages_v_aud_tabs_v_tabs" DROP COLUMN "description";
  ALTER TABLE "home_aud_tabs_tabs" DROP COLUMN "description";
  ALTER TABLE "__home_v_aud_tabs_v_tabs" DROP COLUMN "description";`)
}
