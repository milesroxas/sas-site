import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_stmt_links_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___pages_v_stmt_links_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_work_pages_stmt_links_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___work_pages_v_stmt_links_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_home_stmt_links_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___home_v_stmt_links_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  ALTER TABLE "pages_stmt_links" ADD COLUMN "theme" "enum_pages_stmt_links_theme" DEFAULT 'light';
  ALTER TABLE "__pages_v_stmt_links_v" ADD COLUMN "theme" "enum___pages_v_stmt_links_v_theme" DEFAULT 'light';
  ALTER TABLE "work_pages_stmt_links" ADD COLUMN "theme" "enum_work_pages_stmt_links_theme" DEFAULT 'light';
  ALTER TABLE "__work_pages_v_stmt_links_v" ADD COLUMN "theme" "enum___work_pages_v_stmt_links_v_theme" DEFAULT 'light';
  ALTER TABLE "home_stmt_links" ADD COLUMN "theme" "enum_home_stmt_links_theme" DEFAULT 'light';
  ALTER TABLE "__home_v_stmt_links_v" ADD COLUMN "theme" "enum___home_v_stmt_links_v_theme" DEFAULT 'light';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_stmt_links" DROP COLUMN "theme";
  ALTER TABLE "__pages_v_stmt_links_v" DROP COLUMN "theme";
  ALTER TABLE "work_pages_stmt_links" DROP COLUMN "theme";
  ALTER TABLE "__work_pages_v_stmt_links_v" DROP COLUMN "theme";
  ALTER TABLE "home_stmt_links" DROP COLUMN "theme";
  ALTER TABLE "__home_v_stmt_links_v" DROP COLUMN "theme";
  DROP TYPE "public"."enum_pages_stmt_links_theme";
  DROP TYPE "public"."enum___pages_v_stmt_links_v_theme";
  DROP TYPE "public"."enum_work_pages_stmt_links_theme";
  DROP TYPE "public"."enum___work_pages_v_stmt_links_v_theme";
  DROP TYPE "public"."enum_home_stmt_links_theme";
  DROP TYPE "public"."enum___home_v_stmt_links_v_theme";`)
}
