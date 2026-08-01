import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "work_pages" ADD COLUMN "hero_show_overrides" boolean DEFAULT false;
  ALTER TABLE "work_pages" ADD COLUMN "intro_eyebrow" varchar;
  ALTER TABLE "work_pages" ADD COLUMN "intro_title" varchar;
  ALTER TABLE "work_pages" ADD COLUMN "intro_show_overrides" boolean DEFAULT false;
  ALTER TABLE "work_pages" ADD COLUMN "intro_body_override" jsonb;
  ALTER TABLE "_work_pages_v" ADD COLUMN "version_hero_show_overrides" boolean DEFAULT false;
  ALTER TABLE "_work_pages_v" ADD COLUMN "version_intro_eyebrow" varchar;
  ALTER TABLE "_work_pages_v" ADD COLUMN "version_intro_title" varchar;
  ALTER TABLE "_work_pages_v" ADD COLUMN "version_intro_show_overrides" boolean DEFAULT false;
  ALTER TABLE "_work_pages_v" ADD COLUMN "version_intro_body_override" jsonb;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "work_pages" DROP COLUMN "hero_show_overrides";
  ALTER TABLE "work_pages" DROP COLUMN "intro_eyebrow";
  ALTER TABLE "work_pages" DROP COLUMN "intro_title";
  ALTER TABLE "work_pages" DROP COLUMN "intro_show_overrides";
  ALTER TABLE "work_pages" DROP COLUMN "intro_body_override";
  ALTER TABLE "_work_pages_v" DROP COLUMN "version_hero_show_overrides";
  ALTER TABLE "_work_pages_v" DROP COLUMN "version_intro_eyebrow";
  ALTER TABLE "_work_pages_v" DROP COLUMN "version_intro_title";
  ALTER TABLE "_work_pages_v" DROP COLUMN "version_intro_show_overrides";
  ALTER TABLE "_work_pages_v" DROP COLUMN "version_intro_body_override";`)
}
