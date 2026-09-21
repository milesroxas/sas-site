import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_work_pages_story_beats_heading_level" AS ENUM('h2', 'h3', 'h4');
  CREATE TYPE "public"."enum___work_pages_v_story_beats_v_heading_level" AS ENUM('h2', 'h3', 'h4');
  CREATE TYPE "public"."enum_lab_pages_story_beats_heading_level" AS ENUM('h2', 'h3', 'h4');
  CREATE TYPE "public"."enum___lab_pages_v_story_beats_v_heading_level" AS ENUM('h2', 'h3', 'h4');
  ALTER TABLE "work_pages_story_beats" ADD COLUMN "heading" varchar;
  ALTER TABLE "work_pages_story_beats" ADD COLUMN "heading_level" "enum_work_pages_story_beats_heading_level" DEFAULT 'h3';
  ALTER TABLE "__work_pages_v_story_beats_v" ADD COLUMN "heading" varchar;
  ALTER TABLE "__work_pages_v_story_beats_v" ADD COLUMN "heading_level" "enum___work_pages_v_story_beats_v_heading_level" DEFAULT 'h3';
  ALTER TABLE "lab_pages_story_beats" ADD COLUMN "heading" varchar;
  ALTER TABLE "lab_pages_story_beats" ADD COLUMN "heading_level" "enum_lab_pages_story_beats_heading_level" DEFAULT 'h3';
  ALTER TABLE "__lab_pages_v_story_beats_v" ADD COLUMN "heading" varchar;
  ALTER TABLE "__lab_pages_v_story_beats_v" ADD COLUMN "heading_level" "enum___lab_pages_v_story_beats_v_heading_level" DEFAULT 'h3';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "work_pages_story_beats" DROP COLUMN "heading";
  ALTER TABLE "work_pages_story_beats" DROP COLUMN "heading_level";
  ALTER TABLE "__work_pages_v_story_beats_v" DROP COLUMN "heading";
  ALTER TABLE "__work_pages_v_story_beats_v" DROP COLUMN "heading_level";
  ALTER TABLE "lab_pages_story_beats" DROP COLUMN "heading";
  ALTER TABLE "lab_pages_story_beats" DROP COLUMN "heading_level";
  ALTER TABLE "__lab_pages_v_story_beats_v" DROP COLUMN "heading";
  ALTER TABLE "__lab_pages_v_story_beats_v" DROP COLUMN "heading_level";
  DROP TYPE "public"."enum_work_pages_story_beats_heading_level";
  DROP TYPE "public"."enum___work_pages_v_story_beats_v_heading_level";
  DROP TYPE "public"."enum_lab_pages_story_beats_heading_level";
  DROP TYPE "public"."enum___lab_pages_v_story_beats_v_heading_level";`)
}
