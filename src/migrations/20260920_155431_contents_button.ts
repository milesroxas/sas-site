import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "posts" ADD COLUMN "show_contents" boolean DEFAULT false;
  ALTER TABLE "_posts_v" ADD COLUMN "version_show_contents" boolean DEFAULT false;
  ALTER TABLE "work_pages" ADD COLUMN "show_contents" boolean DEFAULT false;
  ALTER TABLE "_work_pages_v" ADD COLUMN "version_show_contents" boolean DEFAULT false;
  ALTER TABLE "lab_pages" ADD COLUMN "show_contents" boolean DEFAULT false;
  ALTER TABLE "_lab_pages_v" ADD COLUMN "version_show_contents" boolean DEFAULT false;
  ALTER TABLE "expertise_pages" ADD COLUMN "show_contents" boolean DEFAULT false;
  ALTER TABLE "_expertise_pages_v" ADD COLUMN "version_show_contents" boolean DEFAULT false;
  ALTER TABLE "audience_pages" ADD COLUMN "show_contents" boolean DEFAULT false;
  ALTER TABLE "_audience_pages_v" ADD COLUMN "version_show_contents" boolean DEFAULT false;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "posts" DROP COLUMN "show_contents";
  ALTER TABLE "_posts_v" DROP COLUMN "version_show_contents";
  ALTER TABLE "work_pages" DROP COLUMN "show_contents";
  ALTER TABLE "_work_pages_v" DROP COLUMN "version_show_contents";
  ALTER TABLE "lab_pages" DROP COLUMN "show_contents";
  ALTER TABLE "_lab_pages_v" DROP COLUMN "version_show_contents";
  ALTER TABLE "expertise_pages" DROP COLUMN "show_contents";
  ALTER TABLE "_expertise_pages_v" DROP COLUMN "version_show_contents";
  ALTER TABLE "audience_pages" DROP COLUMN "show_contents";
  ALTER TABLE "_audience_pages_v" DROP COLUMN "version_show_contents";`)
}
