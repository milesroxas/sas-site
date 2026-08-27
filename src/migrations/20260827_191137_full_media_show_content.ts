import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_full_media" ALTER COLUMN "width" SET DEFAULT 'contained';
  ALTER TABLE "__pages_v_full_media_v" ALTER COLUMN "width" SET DEFAULT 'contained';
  ALTER TABLE "work_pages_full_media" ALTER COLUMN "width" SET DEFAULT 'contained';
  ALTER TABLE "__work_pages_v_full_media_v" ALTER COLUMN "width" SET DEFAULT 'contained';
  ALTER TABLE "home_full_media" ALTER COLUMN "width" SET DEFAULT 'contained';
  ALTER TABLE "__home_v_full_media_v" ALTER COLUMN "width" SET DEFAULT 'contained';
  ALTER TABLE "pages_full_media" ADD COLUMN "show_content" boolean DEFAULT true;
  ALTER TABLE "__pages_v_full_media_v" ADD COLUMN "show_content" boolean DEFAULT true;
  ALTER TABLE "work_pages_full_media" ADD COLUMN "show_content" boolean DEFAULT true;
  ALTER TABLE "__work_pages_v_full_media_v" ADD COLUMN "show_content" boolean DEFAULT true;
  ALTER TABLE "home_full_media" ADD COLUMN "show_content" boolean DEFAULT true;
  ALTER TABLE "__home_v_full_media_v" ADD COLUMN "show_content" boolean DEFAULT true;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_full_media" ALTER COLUMN "width" SET DEFAULT 'full-width';
  ALTER TABLE "__pages_v_full_media_v" ALTER COLUMN "width" SET DEFAULT 'full-width';
  ALTER TABLE "work_pages_full_media" ALTER COLUMN "width" SET DEFAULT 'full-width';
  ALTER TABLE "__work_pages_v_full_media_v" ALTER COLUMN "width" SET DEFAULT 'full-width';
  ALTER TABLE "home_full_media" ALTER COLUMN "width" SET DEFAULT 'full-width';
  ALTER TABLE "__home_v_full_media_v" ALTER COLUMN "width" SET DEFAULT 'full-width';
  ALTER TABLE "pages_full_media" DROP COLUMN "show_content";
  ALTER TABLE "__pages_v_full_media_v" DROP COLUMN "show_content";
  ALTER TABLE "work_pages_full_media" DROP COLUMN "show_content";
  ALTER TABLE "__work_pages_v_full_media_v" DROP COLUMN "show_content";
  ALTER TABLE "home_full_media" DROP COLUMN "show_content";
  ALTER TABLE "__home_v_full_media_v" DROP COLUMN "show_content";`)
}
