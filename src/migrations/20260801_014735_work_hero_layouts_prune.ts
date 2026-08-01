import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "work_pages" ALTER COLUMN "hero_layout" SET DATA TYPE text;
  ALTER TABLE "work_pages" ALTER COLUMN "hero_layout" SET DEFAULT 'centered-media'::text;
  UPDATE "work_pages" SET "hero_layout" = 'centered-media' WHERE "hero_layout" NOT IN ('centered-media', 'landscape');
  DROP TYPE "public"."enum_work_pages_hero_layout";
  CREATE TYPE "public"."enum_work_pages_hero_layout" AS ENUM('centered-media', 'landscape');
  ALTER TABLE "work_pages" ALTER COLUMN "hero_layout" SET DEFAULT 'centered-media'::"public"."enum_work_pages_hero_layout";
  ALTER TABLE "work_pages" ALTER COLUMN "hero_layout" SET DATA TYPE "public"."enum_work_pages_hero_layout" USING "hero_layout"::"public"."enum_work_pages_hero_layout";
  ALTER TABLE "_work_pages_v" ALTER COLUMN "version_hero_layout" SET DATA TYPE text;
  ALTER TABLE "_work_pages_v" ALTER COLUMN "version_hero_layout" SET DEFAULT 'centered-media'::text;
  UPDATE "_work_pages_v" SET "version_hero_layout" = 'centered-media' WHERE "version_hero_layout" NOT IN ('centered-media', 'landscape');
  DROP TYPE "public"."enum__work_pages_v_version_hero_layout";
  CREATE TYPE "public"."enum__work_pages_v_version_hero_layout" AS ENUM('centered-media', 'landscape');
  ALTER TABLE "_work_pages_v" ALTER COLUMN "version_hero_layout" SET DEFAULT 'centered-media'::"public"."enum__work_pages_v_version_hero_layout";
  ALTER TABLE "_work_pages_v" ALTER COLUMN "version_hero_layout" SET DATA TYPE "public"."enum__work_pages_v_version_hero_layout" USING "version_hero_layout"::"public"."enum__work_pages_v_version_hero_layout";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "work_pages" ALTER COLUMN "hero_layout" SET DATA TYPE text;
  ALTER TABLE "work_pages" ALTER COLUMN "hero_layout" SET DEFAULT 'editorial-split'::text;
  UPDATE "work_pages" SET "hero_layout" = 'editorial-split' WHERE "hero_layout" NOT IN ('editorial-split', 'centered', 'immersive', 'media-led');
  DROP TYPE "public"."enum_work_pages_hero_layout";
  CREATE TYPE "public"."enum_work_pages_hero_layout" AS ENUM('editorial-split', 'centered', 'immersive', 'media-led');
  ALTER TABLE "work_pages" ALTER COLUMN "hero_layout" SET DEFAULT 'editorial-split'::"public"."enum_work_pages_hero_layout";
  ALTER TABLE "work_pages" ALTER COLUMN "hero_layout" SET DATA TYPE "public"."enum_work_pages_hero_layout" USING "hero_layout"::"public"."enum_work_pages_hero_layout";
  ALTER TABLE "_work_pages_v" ALTER COLUMN "version_hero_layout" SET DATA TYPE text;
  ALTER TABLE "_work_pages_v" ALTER COLUMN "version_hero_layout" SET DEFAULT 'editorial-split'::text;
  UPDATE "_work_pages_v" SET "version_hero_layout" = 'editorial-split' WHERE "version_hero_layout" NOT IN ('editorial-split', 'centered', 'immersive', 'media-led');
  DROP TYPE "public"."enum__work_pages_v_version_hero_layout";
  CREATE TYPE "public"."enum__work_pages_v_version_hero_layout" AS ENUM('editorial-split', 'centered', 'immersive', 'media-led');
  ALTER TABLE "_work_pages_v" ALTER COLUMN "version_hero_layout" SET DEFAULT 'editorial-split'::"public"."enum__work_pages_v_version_hero_layout";
  ALTER TABLE "_work_pages_v" ALTER COLUMN "version_hero_layout" SET DATA TYPE "public"."enum__work_pages_v_version_hero_layout" USING "version_hero_layout"::"public"."enum__work_pages_v_version_hero_layout";`)
}
