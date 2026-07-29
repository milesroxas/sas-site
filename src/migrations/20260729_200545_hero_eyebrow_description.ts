import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "media" ALTER COLUMN "usage_status" SET DEFAULT 'public-approved';
  ALTER TABLE "pages" ADD COLUMN "hero_eyebrow" varchar;
  ALTER TABLE "pages" ADD COLUMN "hero_description" varchar;
  ALTER TABLE "_pages_v" ADD COLUMN "version_hero_eyebrow" varchar;
  ALTER TABLE "_pages_v" ADD COLUMN "version_hero_description" varchar;
  ALTER TABLE "expertise_pages" ADD COLUMN "hero_eyebrow" varchar;
  ALTER TABLE "expertise_pages" ADD COLUMN "hero_description" varchar;
  ALTER TABLE "_expertise_pages_v" ADD COLUMN "version_hero_eyebrow" varchar;
  ALTER TABLE "_expertise_pages_v" ADD COLUMN "version_hero_description" varchar;
  ALTER TABLE "audience_pages" ADD COLUMN "hero_eyebrow" varchar;
  ALTER TABLE "audience_pages" ADD COLUMN "hero_description" varchar;
  ALTER TABLE "_audience_pages_v" ADD COLUMN "version_hero_eyebrow" varchar;
  ALTER TABLE "_audience_pages_v" ADD COLUMN "version_hero_description" varchar;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "media" ALTER COLUMN "usage_status" SET DEFAULT 'internal';
  ALTER TABLE "pages" DROP COLUMN "hero_eyebrow";
  ALTER TABLE "pages" DROP COLUMN "hero_description";
  ALTER TABLE "_pages_v" DROP COLUMN "version_hero_eyebrow";
  ALTER TABLE "_pages_v" DROP COLUMN "version_hero_description";
  ALTER TABLE "expertise_pages" DROP COLUMN "hero_eyebrow";
  ALTER TABLE "expertise_pages" DROP COLUMN "hero_description";
  ALTER TABLE "_expertise_pages_v" DROP COLUMN "version_hero_eyebrow";
  ALTER TABLE "_expertise_pages_v" DROP COLUMN "version_hero_description";
  ALTER TABLE "audience_pages" DROP COLUMN "hero_eyebrow";
  ALTER TABLE "audience_pages" DROP COLUMN "hero_description";
  ALTER TABLE "_audience_pages_v" DROP COLUMN "version_hero_eyebrow";
  ALTER TABLE "_audience_pages_v" DROP COLUMN "version_hero_description";`)
}
