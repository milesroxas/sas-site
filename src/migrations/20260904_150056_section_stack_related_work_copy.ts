import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_section_stack" AS ENUM('default', 'tight', 'loose', 'none');
  CREATE TYPE "public"."enum___pages_v_section_v_stack" AS ENUM('default', 'tight', 'loose', 'none');
  CREATE TYPE "public"."enum_posts_section_stack" AS ENUM('default', 'tight', 'loose', 'none');
  CREATE TYPE "public"."enum___posts_v_section_v_stack" AS ENUM('default', 'tight', 'loose', 'none');
  CREATE TYPE "public"."enum_work_pages_section_stack" AS ENUM('default', 'tight', 'loose', 'none');
  CREATE TYPE "public"."enum___work_pages_v_section_v_stack" AS ENUM('default', 'tight', 'loose', 'none');
  CREATE TYPE "public"."enum_lab_pages_section_stack" AS ENUM('default', 'tight', 'loose', 'none');
  CREATE TYPE "public"."enum___lab_pages_v_section_v_stack" AS ENUM('default', 'tight', 'loose', 'none');
  CREATE TYPE "public"."enum_expertise_pages_section_stack" AS ENUM('default', 'tight', 'loose', 'none');
  CREATE TYPE "public"."enum___expertise_pages_v_section_v_stack" AS ENUM('default', 'tight', 'loose', 'none');
  CREATE TYPE "public"."enum_audience_pages_section_stack" AS ENUM('default', 'tight', 'loose', 'none');
  CREATE TYPE "public"."enum___audience_pages_v_section_v_stack" AS ENUM('default', 'tight', 'loose', 'none');
  ALTER TABLE "pages_section" ADD COLUMN "stack" "enum_pages_section_stack" DEFAULT 'default';
  ALTER TABLE "__pages_v_section_v" ADD COLUMN "stack" "enum___pages_v_section_v_stack" DEFAULT 'default';
  ALTER TABLE "posts_section" ADD COLUMN "stack" "enum_posts_section_stack" DEFAULT 'default';
  ALTER TABLE "__posts_v_section_v" ADD COLUMN "stack" "enum___posts_v_section_v_stack" DEFAULT 'default';
  ALTER TABLE "work_pages_section" ADD COLUMN "stack" "enum_work_pages_section_stack" DEFAULT 'default';
  ALTER TABLE "__work_pages_v_section_v" ADD COLUMN "stack" "enum___work_pages_v_section_v_stack" DEFAULT 'default';
  ALTER TABLE "lab_pages_section" ADD COLUMN "stack" "enum_lab_pages_section_stack" DEFAULT 'default';
  ALTER TABLE "__lab_pages_v_section_v" ADD COLUMN "stack" "enum___lab_pages_v_section_v_stack" DEFAULT 'default';
  ALTER TABLE "expertise_pages_section" ADD COLUMN "stack" "enum_expertise_pages_section_stack" DEFAULT 'default';
  ALTER TABLE "expertise_pages" ADD COLUMN "related_work_eyebrow" varchar;
  ALTER TABLE "expertise_pages" ADD COLUMN "related_work_heading" varchar;
  ALTER TABLE "expertise_pages" ADD COLUMN "related_work_description" varchar;
  ALTER TABLE "__expertise_pages_v_section_v" ADD COLUMN "stack" "enum___expertise_pages_v_section_v_stack" DEFAULT 'default';
  ALTER TABLE "_expertise_pages_v" ADD COLUMN "version_related_work_eyebrow" varchar;
  ALTER TABLE "_expertise_pages_v" ADD COLUMN "version_related_work_heading" varchar;
  ALTER TABLE "_expertise_pages_v" ADD COLUMN "version_related_work_description" varchar;
  ALTER TABLE "audience_pages_section" ADD COLUMN "stack" "enum_audience_pages_section_stack" DEFAULT 'default';
  ALTER TABLE "audience_pages" ADD COLUMN "related_work_eyebrow" varchar;
  ALTER TABLE "audience_pages" ADD COLUMN "related_work_heading" varchar;
  ALTER TABLE "audience_pages" ADD COLUMN "related_work_description" varchar;
  ALTER TABLE "__audience_pages_v_section_v" ADD COLUMN "stack" "enum___audience_pages_v_section_v_stack" DEFAULT 'default';
  ALTER TABLE "_audience_pages_v" ADD COLUMN "version_related_work_eyebrow" varchar;
  ALTER TABLE "_audience_pages_v" ADD COLUMN "version_related_work_heading" varchar;
  ALTER TABLE "_audience_pages_v" ADD COLUMN "version_related_work_description" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_section" DROP COLUMN "stack";
  ALTER TABLE "__pages_v_section_v" DROP COLUMN "stack";
  ALTER TABLE "posts_section" DROP COLUMN "stack";
  ALTER TABLE "__posts_v_section_v" DROP COLUMN "stack";
  ALTER TABLE "work_pages_section" DROP COLUMN "stack";
  ALTER TABLE "__work_pages_v_section_v" DROP COLUMN "stack";
  ALTER TABLE "lab_pages_section" DROP COLUMN "stack";
  ALTER TABLE "__lab_pages_v_section_v" DROP COLUMN "stack";
  ALTER TABLE "expertise_pages_section" DROP COLUMN "stack";
  ALTER TABLE "expertise_pages" DROP COLUMN "related_work_eyebrow";
  ALTER TABLE "expertise_pages" DROP COLUMN "related_work_heading";
  ALTER TABLE "expertise_pages" DROP COLUMN "related_work_description";
  ALTER TABLE "__expertise_pages_v_section_v" DROP COLUMN "stack";
  ALTER TABLE "_expertise_pages_v" DROP COLUMN "version_related_work_eyebrow";
  ALTER TABLE "_expertise_pages_v" DROP COLUMN "version_related_work_heading";
  ALTER TABLE "_expertise_pages_v" DROP COLUMN "version_related_work_description";
  ALTER TABLE "audience_pages_section" DROP COLUMN "stack";
  ALTER TABLE "audience_pages" DROP COLUMN "related_work_eyebrow";
  ALTER TABLE "audience_pages" DROP COLUMN "related_work_heading";
  ALTER TABLE "audience_pages" DROP COLUMN "related_work_description";
  ALTER TABLE "__audience_pages_v_section_v" DROP COLUMN "stack";
  ALTER TABLE "_audience_pages_v" DROP COLUMN "version_related_work_eyebrow";
  ALTER TABLE "_audience_pages_v" DROP COLUMN "version_related_work_heading";
  ALTER TABLE "_audience_pages_v" DROP COLUMN "version_related_work_description";
  DROP TYPE "public"."enum_pages_section_stack";
  DROP TYPE "public"."enum___pages_v_section_v_stack";
  DROP TYPE "public"."enum_posts_section_stack";
  DROP TYPE "public"."enum___posts_v_section_v_stack";
  DROP TYPE "public"."enum_work_pages_section_stack";
  DROP TYPE "public"."enum___work_pages_v_section_v_stack";
  DROP TYPE "public"."enum_lab_pages_section_stack";
  DROP TYPE "public"."enum___lab_pages_v_section_v_stack";
  DROP TYPE "public"."enum_expertise_pages_section_stack";
  DROP TYPE "public"."enum___expertise_pages_v_section_v_stack";
  DROP TYPE "public"."enum_audience_pages_section_stack";
  DROP TYPE "public"."enum___audience_pages_v_section_v_stack";`)
}
