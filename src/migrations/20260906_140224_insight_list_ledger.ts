import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_pages_insight_list_layout" ADD VALUE 'ledger';
  ALTER TYPE "public"."enum___pages_v_insight_list_v_layout" ADD VALUE 'ledger';
  ALTER TYPE "public"."enum_posts_insight_list_layout" ADD VALUE 'ledger';
  ALTER TYPE "public"."enum___posts_v_insight_list_v_layout" ADD VALUE 'ledger';
  ALTER TYPE "public"."enum_work_pages_insight_list_layout" ADD VALUE 'ledger';
  ALTER TYPE "public"."enum___work_pages_v_insight_list_v_layout" ADD VALUE 'ledger';
  ALTER TYPE "public"."enum_lab_pages_insight_list_layout" ADD VALUE 'ledger';
  ALTER TYPE "public"."enum___lab_pages_v_insight_list_v_layout" ADD VALUE 'ledger';
  ALTER TYPE "public"."enum_expertise_pages_insight_list_layout" ADD VALUE 'ledger';
  ALTER TYPE "public"."enum___expertise_pages_v_insight_list_v_layout" ADD VALUE 'ledger';
  ALTER TYPE "public"."enum_audience_pages_insight_list_layout" ADD VALUE 'ledger';
  ALTER TYPE "public"."enum___audience_pages_v_insight_list_v_layout" ADD VALUE 'ledger';
  ALTER TYPE "public"."enum_home_insight_list_layout" ADD VALUE 'ledger';
  ALTER TYPE "public"."enum___home_v_insight_list_v_layout" ADD VALUE 'ledger';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_insight_list" ALTER COLUMN "layout" SET DATA TYPE text;
  ALTER TABLE "pages_insight_list" ALTER COLUMN "layout" SET DEFAULT 'side'::text;
  DROP TYPE "public"."enum_pages_insight_list_layout";
  CREATE TYPE "public"."enum_pages_insight_list_layout" AS ENUM('side', 'stacked');
  ALTER TABLE "pages_insight_list" ALTER COLUMN "layout" SET DEFAULT 'side'::"public"."enum_pages_insight_list_layout";
  ALTER TABLE "pages_insight_list" ALTER COLUMN "layout" SET DATA TYPE "public"."enum_pages_insight_list_layout" USING "layout"::"public"."enum_pages_insight_list_layout";
  ALTER TABLE "__pages_v_insight_list_v" ALTER COLUMN "layout" SET DATA TYPE text;
  ALTER TABLE "__pages_v_insight_list_v" ALTER COLUMN "layout" SET DEFAULT 'side'::text;
  DROP TYPE "public"."enum___pages_v_insight_list_v_layout";
  CREATE TYPE "public"."enum___pages_v_insight_list_v_layout" AS ENUM('side', 'stacked');
  ALTER TABLE "__pages_v_insight_list_v" ALTER COLUMN "layout" SET DEFAULT 'side'::"public"."enum___pages_v_insight_list_v_layout";
  ALTER TABLE "__pages_v_insight_list_v" ALTER COLUMN "layout" SET DATA TYPE "public"."enum___pages_v_insight_list_v_layout" USING "layout"::"public"."enum___pages_v_insight_list_v_layout";
  ALTER TABLE "posts_insight_list" ALTER COLUMN "layout" SET DATA TYPE text;
  ALTER TABLE "posts_insight_list" ALTER COLUMN "layout" SET DEFAULT 'side'::text;
  DROP TYPE "public"."enum_posts_insight_list_layout";
  CREATE TYPE "public"."enum_posts_insight_list_layout" AS ENUM('side', 'stacked');
  ALTER TABLE "posts_insight_list" ALTER COLUMN "layout" SET DEFAULT 'side'::"public"."enum_posts_insight_list_layout";
  ALTER TABLE "posts_insight_list" ALTER COLUMN "layout" SET DATA TYPE "public"."enum_posts_insight_list_layout" USING "layout"::"public"."enum_posts_insight_list_layout";
  ALTER TABLE "__posts_v_insight_list_v" ALTER COLUMN "layout" SET DATA TYPE text;
  ALTER TABLE "__posts_v_insight_list_v" ALTER COLUMN "layout" SET DEFAULT 'side'::text;
  DROP TYPE "public"."enum___posts_v_insight_list_v_layout";
  CREATE TYPE "public"."enum___posts_v_insight_list_v_layout" AS ENUM('side', 'stacked');
  ALTER TABLE "__posts_v_insight_list_v" ALTER COLUMN "layout" SET DEFAULT 'side'::"public"."enum___posts_v_insight_list_v_layout";
  ALTER TABLE "__posts_v_insight_list_v" ALTER COLUMN "layout" SET DATA TYPE "public"."enum___posts_v_insight_list_v_layout" USING "layout"::"public"."enum___posts_v_insight_list_v_layout";
  ALTER TABLE "work_pages_insight_list" ALTER COLUMN "layout" SET DATA TYPE text;
  ALTER TABLE "work_pages_insight_list" ALTER COLUMN "layout" SET DEFAULT 'side'::text;
  DROP TYPE "public"."enum_work_pages_insight_list_layout";
  CREATE TYPE "public"."enum_work_pages_insight_list_layout" AS ENUM('side', 'stacked');
  ALTER TABLE "work_pages_insight_list" ALTER COLUMN "layout" SET DEFAULT 'side'::"public"."enum_work_pages_insight_list_layout";
  ALTER TABLE "work_pages_insight_list" ALTER COLUMN "layout" SET DATA TYPE "public"."enum_work_pages_insight_list_layout" USING "layout"::"public"."enum_work_pages_insight_list_layout";
  ALTER TABLE "__work_pages_v_insight_list_v" ALTER COLUMN "layout" SET DATA TYPE text;
  ALTER TABLE "__work_pages_v_insight_list_v" ALTER COLUMN "layout" SET DEFAULT 'side'::text;
  DROP TYPE "public"."enum___work_pages_v_insight_list_v_layout";
  CREATE TYPE "public"."enum___work_pages_v_insight_list_v_layout" AS ENUM('side', 'stacked');
  ALTER TABLE "__work_pages_v_insight_list_v" ALTER COLUMN "layout" SET DEFAULT 'side'::"public"."enum___work_pages_v_insight_list_v_layout";
  ALTER TABLE "__work_pages_v_insight_list_v" ALTER COLUMN "layout" SET DATA TYPE "public"."enum___work_pages_v_insight_list_v_layout" USING "layout"::"public"."enum___work_pages_v_insight_list_v_layout";
  ALTER TABLE "lab_pages_insight_list" ALTER COLUMN "layout" SET DATA TYPE text;
  ALTER TABLE "lab_pages_insight_list" ALTER COLUMN "layout" SET DEFAULT 'side'::text;
  DROP TYPE "public"."enum_lab_pages_insight_list_layout";
  CREATE TYPE "public"."enum_lab_pages_insight_list_layout" AS ENUM('side', 'stacked');
  ALTER TABLE "lab_pages_insight_list" ALTER COLUMN "layout" SET DEFAULT 'side'::"public"."enum_lab_pages_insight_list_layout";
  ALTER TABLE "lab_pages_insight_list" ALTER COLUMN "layout" SET DATA TYPE "public"."enum_lab_pages_insight_list_layout" USING "layout"::"public"."enum_lab_pages_insight_list_layout";
  ALTER TABLE "__lab_pages_v_insight_list_v" ALTER COLUMN "layout" SET DATA TYPE text;
  ALTER TABLE "__lab_pages_v_insight_list_v" ALTER COLUMN "layout" SET DEFAULT 'side'::text;
  DROP TYPE "public"."enum___lab_pages_v_insight_list_v_layout";
  CREATE TYPE "public"."enum___lab_pages_v_insight_list_v_layout" AS ENUM('side', 'stacked');
  ALTER TABLE "__lab_pages_v_insight_list_v" ALTER COLUMN "layout" SET DEFAULT 'side'::"public"."enum___lab_pages_v_insight_list_v_layout";
  ALTER TABLE "__lab_pages_v_insight_list_v" ALTER COLUMN "layout" SET DATA TYPE "public"."enum___lab_pages_v_insight_list_v_layout" USING "layout"::"public"."enum___lab_pages_v_insight_list_v_layout";
  ALTER TABLE "expertise_pages_insight_list" ALTER COLUMN "layout" SET DATA TYPE text;
  ALTER TABLE "expertise_pages_insight_list" ALTER COLUMN "layout" SET DEFAULT 'side'::text;
  DROP TYPE "public"."enum_expertise_pages_insight_list_layout";
  CREATE TYPE "public"."enum_expertise_pages_insight_list_layout" AS ENUM('side', 'stacked');
  ALTER TABLE "expertise_pages_insight_list" ALTER COLUMN "layout" SET DEFAULT 'side'::"public"."enum_expertise_pages_insight_list_layout";
  ALTER TABLE "expertise_pages_insight_list" ALTER COLUMN "layout" SET DATA TYPE "public"."enum_expertise_pages_insight_list_layout" USING "layout"::"public"."enum_expertise_pages_insight_list_layout";
  ALTER TABLE "__expertise_pages_v_insight_list_v" ALTER COLUMN "layout" SET DATA TYPE text;
  ALTER TABLE "__expertise_pages_v_insight_list_v" ALTER COLUMN "layout" SET DEFAULT 'side'::text;
  DROP TYPE "public"."enum___expertise_pages_v_insight_list_v_layout";
  CREATE TYPE "public"."enum___expertise_pages_v_insight_list_v_layout" AS ENUM('side', 'stacked');
  ALTER TABLE "__expertise_pages_v_insight_list_v" ALTER COLUMN "layout" SET DEFAULT 'side'::"public"."enum___expertise_pages_v_insight_list_v_layout";
  ALTER TABLE "__expertise_pages_v_insight_list_v" ALTER COLUMN "layout" SET DATA TYPE "public"."enum___expertise_pages_v_insight_list_v_layout" USING "layout"::"public"."enum___expertise_pages_v_insight_list_v_layout";
  ALTER TABLE "audience_pages_insight_list" ALTER COLUMN "layout" SET DATA TYPE text;
  ALTER TABLE "audience_pages_insight_list" ALTER COLUMN "layout" SET DEFAULT 'side'::text;
  DROP TYPE "public"."enum_audience_pages_insight_list_layout";
  CREATE TYPE "public"."enum_audience_pages_insight_list_layout" AS ENUM('side', 'stacked');
  ALTER TABLE "audience_pages_insight_list" ALTER COLUMN "layout" SET DEFAULT 'side'::"public"."enum_audience_pages_insight_list_layout";
  ALTER TABLE "audience_pages_insight_list" ALTER COLUMN "layout" SET DATA TYPE "public"."enum_audience_pages_insight_list_layout" USING "layout"::"public"."enum_audience_pages_insight_list_layout";
  ALTER TABLE "__audience_pages_v_insight_list_v" ALTER COLUMN "layout" SET DATA TYPE text;
  ALTER TABLE "__audience_pages_v_insight_list_v" ALTER COLUMN "layout" SET DEFAULT 'side'::text;
  DROP TYPE "public"."enum___audience_pages_v_insight_list_v_layout";
  CREATE TYPE "public"."enum___audience_pages_v_insight_list_v_layout" AS ENUM('side', 'stacked');
  ALTER TABLE "__audience_pages_v_insight_list_v" ALTER COLUMN "layout" SET DEFAULT 'side'::"public"."enum___audience_pages_v_insight_list_v_layout";
  ALTER TABLE "__audience_pages_v_insight_list_v" ALTER COLUMN "layout" SET DATA TYPE "public"."enum___audience_pages_v_insight_list_v_layout" USING "layout"::"public"."enum___audience_pages_v_insight_list_v_layout";
  ALTER TABLE "home_insight_list" ALTER COLUMN "layout" SET DATA TYPE text;
  ALTER TABLE "home_insight_list" ALTER COLUMN "layout" SET DEFAULT 'side'::text;
  DROP TYPE "public"."enum_home_insight_list_layout";
  CREATE TYPE "public"."enum_home_insight_list_layout" AS ENUM('side', 'stacked');
  ALTER TABLE "home_insight_list" ALTER COLUMN "layout" SET DEFAULT 'side'::"public"."enum_home_insight_list_layout";
  ALTER TABLE "home_insight_list" ALTER COLUMN "layout" SET DATA TYPE "public"."enum_home_insight_list_layout" USING "layout"::"public"."enum_home_insight_list_layout";
  ALTER TABLE "__home_v_insight_list_v" ALTER COLUMN "layout" SET DATA TYPE text;
  ALTER TABLE "__home_v_insight_list_v" ALTER COLUMN "layout" SET DEFAULT 'side'::text;
  DROP TYPE "public"."enum___home_v_insight_list_v_layout";
  CREATE TYPE "public"."enum___home_v_insight_list_v_layout" AS ENUM('side', 'stacked');
  ALTER TABLE "__home_v_insight_list_v" ALTER COLUMN "layout" SET DEFAULT 'side'::"public"."enum___home_v_insight_list_v_layout";
  ALTER TABLE "__home_v_insight_list_v" ALTER COLUMN "layout" SET DATA TYPE "public"."enum___home_v_insight_list_v_layout" USING "layout"::"public"."enum___home_v_insight_list_v_layout";`)
}
