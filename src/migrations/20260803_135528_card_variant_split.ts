import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_pages_blocks_archive_card_variant" ADD VALUE 'split';
  ALTER TYPE "public"."enum__pages_v_blocks_archive_card_variant" ADD VALUE 'split';
  ALTER TYPE "public"."enum_expertise_pages_blocks_archive_card_variant" ADD VALUE 'split';
  ALTER TYPE "public"."enum__expertise_pages_v_blocks_archive_card_variant" ADD VALUE 'split';
  ALTER TYPE "public"."enum_audience_pages_blocks_archive_card_variant" ADD VALUE 'split';
  ALTER TYPE "public"."enum__audience_pages_v_blocks_archive_card_variant" ADD VALUE 'split';
  ALTER TYPE "public"."enum_home_blocks_archive_card_variant" ADD VALUE 'split';
  ALTER TYPE "public"."enum__home_v_blocks_archive_card_variant" ADD VALUE 'split';
  ALTER TABLE "pages_blocks_archive" ALTER COLUMN "card_variant" SET DEFAULT 'split';
  ALTER TABLE "_pages_v_blocks_archive" ALTER COLUMN "card_variant" SET DEFAULT 'split';
  ALTER TABLE "expertise_pages_blocks_archive" ALTER COLUMN "card_variant" SET DEFAULT 'split';
  ALTER TABLE "_expertise_pages_v_blocks_archive" ALTER COLUMN "card_variant" SET DEFAULT 'split';
  ALTER TABLE "audience_pages_blocks_archive" ALTER COLUMN "card_variant" SET DEFAULT 'split';
  ALTER TABLE "_audience_pages_v_blocks_archive" ALTER COLUMN "card_variant" SET DEFAULT 'split';
  ALTER TABLE "home_blocks_archive" ALTER COLUMN "card_variant" SET DEFAULT 'split';
  ALTER TABLE "_home_v_blocks_archive" ALTER COLUMN "card_variant" SET DEFAULT 'split';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_archive" ALTER COLUMN "card_variant" SET DATA TYPE text;
  ALTER TABLE "pages_blocks_archive" ALTER COLUMN "card_variant" SET DEFAULT 'contained'::text;
  DROP TYPE "public"."enum_pages_blocks_archive_card_variant";
  CREATE TYPE "public"."enum_pages_blocks_archive_card_variant" AS ENUM('contained', 'open', 'overlay');
  ALTER TABLE "pages_blocks_archive" ALTER COLUMN "card_variant" SET DEFAULT 'contained'::"public"."enum_pages_blocks_archive_card_variant";
  ALTER TABLE "pages_blocks_archive" ALTER COLUMN "card_variant" SET DATA TYPE "public"."enum_pages_blocks_archive_card_variant" USING "card_variant"::"public"."enum_pages_blocks_archive_card_variant";
  ALTER TABLE "_pages_v_blocks_archive" ALTER COLUMN "card_variant" SET DATA TYPE text;
  ALTER TABLE "_pages_v_blocks_archive" ALTER COLUMN "card_variant" SET DEFAULT 'contained'::text;
  DROP TYPE "public"."enum__pages_v_blocks_archive_card_variant";
  CREATE TYPE "public"."enum__pages_v_blocks_archive_card_variant" AS ENUM('contained', 'open', 'overlay');
  ALTER TABLE "_pages_v_blocks_archive" ALTER COLUMN "card_variant" SET DEFAULT 'contained'::"public"."enum__pages_v_blocks_archive_card_variant";
  ALTER TABLE "_pages_v_blocks_archive" ALTER COLUMN "card_variant" SET DATA TYPE "public"."enum__pages_v_blocks_archive_card_variant" USING "card_variant"::"public"."enum__pages_v_blocks_archive_card_variant";
  ALTER TABLE "expertise_pages_blocks_archive" ALTER COLUMN "card_variant" SET DATA TYPE text;
  ALTER TABLE "expertise_pages_blocks_archive" ALTER COLUMN "card_variant" SET DEFAULT 'contained'::text;
  DROP TYPE "public"."enum_expertise_pages_blocks_archive_card_variant";
  CREATE TYPE "public"."enum_expertise_pages_blocks_archive_card_variant" AS ENUM('contained', 'open', 'overlay');
  ALTER TABLE "expertise_pages_blocks_archive" ALTER COLUMN "card_variant" SET DEFAULT 'contained'::"public"."enum_expertise_pages_blocks_archive_card_variant";
  ALTER TABLE "expertise_pages_blocks_archive" ALTER COLUMN "card_variant" SET DATA TYPE "public"."enum_expertise_pages_blocks_archive_card_variant" USING "card_variant"::"public"."enum_expertise_pages_blocks_archive_card_variant";
  ALTER TABLE "_expertise_pages_v_blocks_archive" ALTER COLUMN "card_variant" SET DATA TYPE text;
  ALTER TABLE "_expertise_pages_v_blocks_archive" ALTER COLUMN "card_variant" SET DEFAULT 'contained'::text;
  DROP TYPE "public"."enum__expertise_pages_v_blocks_archive_card_variant";
  CREATE TYPE "public"."enum__expertise_pages_v_blocks_archive_card_variant" AS ENUM('contained', 'open', 'overlay');
  ALTER TABLE "_expertise_pages_v_blocks_archive" ALTER COLUMN "card_variant" SET DEFAULT 'contained'::"public"."enum__expertise_pages_v_blocks_archive_card_variant";
  ALTER TABLE "_expertise_pages_v_blocks_archive" ALTER COLUMN "card_variant" SET DATA TYPE "public"."enum__expertise_pages_v_blocks_archive_card_variant" USING "card_variant"::"public"."enum__expertise_pages_v_blocks_archive_card_variant";
  ALTER TABLE "audience_pages_blocks_archive" ALTER COLUMN "card_variant" SET DATA TYPE text;
  ALTER TABLE "audience_pages_blocks_archive" ALTER COLUMN "card_variant" SET DEFAULT 'contained'::text;
  DROP TYPE "public"."enum_audience_pages_blocks_archive_card_variant";
  CREATE TYPE "public"."enum_audience_pages_blocks_archive_card_variant" AS ENUM('contained', 'open', 'overlay');
  ALTER TABLE "audience_pages_blocks_archive" ALTER COLUMN "card_variant" SET DEFAULT 'contained'::"public"."enum_audience_pages_blocks_archive_card_variant";
  ALTER TABLE "audience_pages_blocks_archive" ALTER COLUMN "card_variant" SET DATA TYPE "public"."enum_audience_pages_blocks_archive_card_variant" USING "card_variant"::"public"."enum_audience_pages_blocks_archive_card_variant";
  ALTER TABLE "_audience_pages_v_blocks_archive" ALTER COLUMN "card_variant" SET DATA TYPE text;
  ALTER TABLE "_audience_pages_v_blocks_archive" ALTER COLUMN "card_variant" SET DEFAULT 'contained'::text;
  DROP TYPE "public"."enum__audience_pages_v_blocks_archive_card_variant";
  CREATE TYPE "public"."enum__audience_pages_v_blocks_archive_card_variant" AS ENUM('contained', 'open', 'overlay');
  ALTER TABLE "_audience_pages_v_blocks_archive" ALTER COLUMN "card_variant" SET DEFAULT 'contained'::"public"."enum__audience_pages_v_blocks_archive_card_variant";
  ALTER TABLE "_audience_pages_v_blocks_archive" ALTER COLUMN "card_variant" SET DATA TYPE "public"."enum__audience_pages_v_blocks_archive_card_variant" USING "card_variant"::"public"."enum__audience_pages_v_blocks_archive_card_variant";
  ALTER TABLE "home_blocks_archive" ALTER COLUMN "card_variant" SET DATA TYPE text;
  ALTER TABLE "home_blocks_archive" ALTER COLUMN "card_variant" SET DEFAULT 'contained'::text;
  DROP TYPE "public"."enum_home_blocks_archive_card_variant";
  CREATE TYPE "public"."enum_home_blocks_archive_card_variant" AS ENUM('contained', 'open', 'overlay');
  ALTER TABLE "home_blocks_archive" ALTER COLUMN "card_variant" SET DEFAULT 'contained'::"public"."enum_home_blocks_archive_card_variant";
  ALTER TABLE "home_blocks_archive" ALTER COLUMN "card_variant" SET DATA TYPE "public"."enum_home_blocks_archive_card_variant" USING "card_variant"::"public"."enum_home_blocks_archive_card_variant";
  ALTER TABLE "_home_v_blocks_archive" ALTER COLUMN "card_variant" SET DATA TYPE text;
  ALTER TABLE "_home_v_blocks_archive" ALTER COLUMN "card_variant" SET DEFAULT 'contained'::text;
  DROP TYPE "public"."enum__home_v_blocks_archive_card_variant";
  CREATE TYPE "public"."enum__home_v_blocks_archive_card_variant" AS ENUM('contained', 'open', 'overlay');
  ALTER TABLE "_home_v_blocks_archive" ALTER COLUMN "card_variant" SET DEFAULT 'contained'::"public"."enum__home_v_blocks_archive_card_variant";
  ALTER TABLE "_home_v_blocks_archive" ALTER COLUMN "card_variant" SET DATA TYPE "public"."enum__home_v_blocks_archive_card_variant" USING "card_variant"::"public"."enum__home_v_blocks_archive_card_variant";`)
}
