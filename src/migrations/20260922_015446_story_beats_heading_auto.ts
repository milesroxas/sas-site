import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "work_pages_story_beats" ADD COLUMN "heading_auto" jsonb;
  ALTER TABLE "__work_pages_v_story_beats_v" ADD COLUMN "heading_auto" jsonb;
  ALTER TABLE "lab_pages_story_beats" ADD COLUMN "heading_auto" jsonb;
  ALTER TABLE "__lab_pages_v_story_beats_v" ADD COLUMN "heading_auto" jsonb;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "work_pages_story_beats" DROP COLUMN "heading_auto";
  ALTER TABLE "__work_pages_v_story_beats_v" DROP COLUMN "heading_auto";
  ALTER TABLE "lab_pages_story_beats" DROP COLUMN "heading_auto";
  ALTER TABLE "__lab_pages_v_story_beats_v" DROP COLUMN "heading_auto";`)
}
