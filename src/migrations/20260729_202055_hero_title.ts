import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "pages" ADD COLUMN "hero_title" varchar;
  ALTER TABLE "_pages_v" ADD COLUMN "version_hero_title" varchar;
  ALTER TABLE "expertise_pages" ADD COLUMN "hero_title" varchar;
  ALTER TABLE "_expertise_pages_v" ADD COLUMN "version_hero_title" varchar;
  ALTER TABLE "audience_pages" ADD COLUMN "hero_title" varchar;
  ALTER TABLE "_audience_pages_v" ADD COLUMN "version_hero_title" varchar;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "pages" DROP COLUMN "hero_title";
  ALTER TABLE "_pages_v" DROP COLUMN "version_hero_title";
  ALTER TABLE "expertise_pages" DROP COLUMN "hero_title";
  ALTER TABLE "_expertise_pages_v" DROP COLUMN "version_hero_title";
  ALTER TABLE "audience_pages" DROP COLUMN "hero_title";
  ALTER TABLE "_audience_pages_v" DROP COLUMN "version_hero_title";`)
}
