import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_transition_heading_level" AS ENUM('h2', 'h3', 'h4');
  CREATE TYPE "public"."enum___pages_v_transition_v_heading_level" AS ENUM('h2', 'h3', 'h4');
  CREATE TYPE "public"."enum_posts_transition_heading_level" AS ENUM('h2', 'h3', 'h4');
  CREATE TYPE "public"."enum___posts_v_transition_v_heading_level" AS ENUM('h2', 'h3', 'h4');
  CREATE TYPE "public"."enum_wp_transition_heading_level" AS ENUM('h2', 'h3', 'h4');
  CREATE TYPE "public"."enum__wp_transition_v_heading_level" AS ENUM('h2', 'h3', 'h4');
  CREATE TYPE "public"."enum_lab_pages_transition_heading_level" AS ENUM('h2', 'h3', 'h4');
  CREATE TYPE "public"."enum___lab_pages_v_transition_v_heading_level" AS ENUM('h2', 'h3', 'h4');
  CREATE TYPE "public"."enum_expertise_pages_transition_heading_level" AS ENUM('h2', 'h3', 'h4');
  CREATE TYPE "public"."enum___expertise_pages_v_transition_v_heading_level" AS ENUM('h2', 'h3', 'h4');
  CREATE TYPE "public"."enum_audience_pages_transition_heading_level" AS ENUM('h2', 'h3', 'h4');
  CREATE TYPE "public"."enum___audience_pages_v_transition_v_heading_level" AS ENUM('h2', 'h3', 'h4');
  ALTER TABLE "pages_transition" ADD COLUMN "heading_level" "enum_pages_transition_heading_level" DEFAULT 'h2';
  ALTER TABLE "__pages_v_transition_v" ADD COLUMN "heading_level" "enum___pages_v_transition_v_heading_level" DEFAULT 'h2';
  ALTER TABLE "posts_transition" ADD COLUMN "heading_level" "enum_posts_transition_heading_level" DEFAULT 'h2';
  ALTER TABLE "__posts_v_transition_v" ADD COLUMN "heading_level" "enum___posts_v_transition_v_heading_level" DEFAULT 'h2';
  ALTER TABLE "wp_transition" ADD COLUMN "heading_level" "enum_wp_transition_heading_level" DEFAULT 'h2';
  ALTER TABLE "_wp_transition_v" ADD COLUMN "heading_level" "enum__wp_transition_v_heading_level" DEFAULT 'h2';
  ALTER TABLE "lab_pages_transition" ADD COLUMN "heading_level" "enum_lab_pages_transition_heading_level" DEFAULT 'h2';
  ALTER TABLE "__lab_pages_v_transition_v" ADD COLUMN "heading_level" "enum___lab_pages_v_transition_v_heading_level" DEFAULT 'h2';
  ALTER TABLE "expertise_pages_transition" ADD COLUMN "heading_level" "enum_expertise_pages_transition_heading_level" DEFAULT 'h2';
  ALTER TABLE "__expertise_pages_v_transition_v" ADD COLUMN "heading_level" "enum___expertise_pages_v_transition_v_heading_level" DEFAULT 'h2';
  ALTER TABLE "audience_pages_transition" ADD COLUMN "heading_level" "enum_audience_pages_transition_heading_level" DEFAULT 'h2';
  ALTER TABLE "__audience_pages_v_transition_v" ADD COLUMN "heading_level" "enum___audience_pages_v_transition_v_heading_level" DEFAULT 'h2';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_transition" DROP COLUMN "heading_level";
  ALTER TABLE "__pages_v_transition_v" DROP COLUMN "heading_level";
  ALTER TABLE "posts_transition" DROP COLUMN "heading_level";
  ALTER TABLE "__posts_v_transition_v" DROP COLUMN "heading_level";
  ALTER TABLE "wp_transition" DROP COLUMN "heading_level";
  ALTER TABLE "_wp_transition_v" DROP COLUMN "heading_level";
  ALTER TABLE "lab_pages_transition" DROP COLUMN "heading_level";
  ALTER TABLE "__lab_pages_v_transition_v" DROP COLUMN "heading_level";
  ALTER TABLE "expertise_pages_transition" DROP COLUMN "heading_level";
  ALTER TABLE "__expertise_pages_v_transition_v" DROP COLUMN "heading_level";
  ALTER TABLE "audience_pages_transition" DROP COLUMN "heading_level";
  ALTER TABLE "__audience_pages_v_transition_v" DROP COLUMN "heading_level";
  DROP TYPE "public"."enum_pages_transition_heading_level";
  DROP TYPE "public"."enum___pages_v_transition_v_heading_level";
  DROP TYPE "public"."enum_posts_transition_heading_level";
  DROP TYPE "public"."enum___posts_v_transition_v_heading_level";
  DROP TYPE "public"."enum_wp_transition_heading_level";
  DROP TYPE "public"."enum__wp_transition_v_heading_level";
  DROP TYPE "public"."enum_lab_pages_transition_heading_level";
  DROP TYPE "public"."enum___lab_pages_v_transition_v_heading_level";
  DROP TYPE "public"."enum_expertise_pages_transition_heading_level";
  DROP TYPE "public"."enum___expertise_pages_v_transition_v_heading_level";
  DROP TYPE "public"."enum_audience_pages_transition_heading_level";
  DROP TYPE "public"."enum___audience_pages_v_transition_v_heading_level";`)
}
