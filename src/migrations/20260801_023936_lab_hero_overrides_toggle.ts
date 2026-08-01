import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "lab_pages" ADD COLUMN "hero_show_overrides" boolean DEFAULT false;
  ALTER TABLE "_lab_pages_v" ADD COLUMN "version_hero_show_overrides" boolean DEFAULT false;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "lab_pages" DROP COLUMN "hero_show_overrides";
  ALTER TABLE "_lab_pages_v" DROP COLUMN "version_hero_show_overrides";`)
}
