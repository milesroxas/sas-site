import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_pages_transition_layout" ADD VALUE 'offset' BEFORE 'left';
  ALTER TYPE "public"."enum___pages_v_transition_v_layout" ADD VALUE 'offset' BEFORE 'left';
  ALTER TYPE "public"."enum_posts_transition_layout" ADD VALUE 'offset' BEFORE 'left';
  ALTER TYPE "public"."enum___posts_v_transition_v_layout" ADD VALUE 'offset' BEFORE 'left';
  ALTER TYPE "public"."enum_wp_transition_layout" ADD VALUE 'offset' BEFORE 'left';
  ALTER TYPE "public"."enum__wp_transition_v_layout" ADD VALUE 'offset' BEFORE 'left';
  ALTER TYPE "public"."enum_lab_pages_transition_layout" ADD VALUE 'offset' BEFORE 'left';
  ALTER TYPE "public"."enum___lab_pages_v_transition_v_layout" ADD VALUE 'offset' BEFORE 'left';
  ALTER TYPE "public"."enum_expertise_pages_transition_layout" ADD VALUE 'offset' BEFORE 'left';
  ALTER TYPE "public"."enum___expertise_pages_v_transition_v_layout" ADD VALUE 'offset' BEFORE 'left';
  ALTER TYPE "public"."enum_audience_pages_transition_layout" ADD VALUE 'offset' BEFORE 'left';
  ALTER TYPE "public"."enum___audience_pages_v_transition_v_layout" ADD VALUE 'offset' BEFORE 'left';
  ALTER TABLE "pages_transition" ALTER COLUMN "layout" SET DEFAULT 'offset';
  ALTER TABLE "__pages_v_transition_v" ALTER COLUMN "layout" SET DEFAULT 'offset';
  ALTER TABLE "posts_transition" ALTER COLUMN "layout" SET DEFAULT 'offset';
  ALTER TABLE "__posts_v_transition_v" ALTER COLUMN "layout" SET DEFAULT 'offset';
  ALTER TABLE "wp_transition" ALTER COLUMN "layout" SET DEFAULT 'offset';
  ALTER TABLE "_wp_transition_v" ALTER COLUMN "layout" SET DEFAULT 'offset';
  ALTER TABLE "lab_pages_transition" ALTER COLUMN "layout" SET DEFAULT 'offset';
  ALTER TABLE "__lab_pages_v_transition_v" ALTER COLUMN "layout" SET DEFAULT 'offset';
  ALTER TABLE "expertise_pages_transition" ALTER COLUMN "layout" SET DEFAULT 'offset';
  ALTER TABLE "__expertise_pages_v_transition_v" ALTER COLUMN "layout" SET DEFAULT 'offset';
  ALTER TABLE "audience_pages_transition" ALTER COLUMN "layout" SET DEFAULT 'offset';
  ALTER TABLE "__audience_pages_v_transition_v" ALTER COLUMN "layout" SET DEFAULT 'offset';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_transition" ALTER COLUMN "layout" SET DATA TYPE text;
  ALTER TABLE "pages_transition" ALTER COLUMN "layout" SET DEFAULT 'left'::text;
  DROP TYPE "public"."enum_pages_transition_layout";
  CREATE TYPE "public"."enum_pages_transition_layout" AS ENUM('left', 'centered', 'split', 'statement');
  ALTER TABLE "pages_transition" ALTER COLUMN "layout" SET DEFAULT 'left'::"public"."enum_pages_transition_layout";
  ALTER TABLE "pages_transition" ALTER COLUMN "layout" SET DATA TYPE "public"."enum_pages_transition_layout" USING "layout"::"public"."enum_pages_transition_layout";
  ALTER TABLE "__pages_v_transition_v" ALTER COLUMN "layout" SET DATA TYPE text;
  ALTER TABLE "__pages_v_transition_v" ALTER COLUMN "layout" SET DEFAULT 'left'::text;
  DROP TYPE "public"."enum___pages_v_transition_v_layout";
  CREATE TYPE "public"."enum___pages_v_transition_v_layout" AS ENUM('left', 'centered', 'split', 'statement');
  ALTER TABLE "__pages_v_transition_v" ALTER COLUMN "layout" SET DEFAULT 'left'::"public"."enum___pages_v_transition_v_layout";
  ALTER TABLE "__pages_v_transition_v" ALTER COLUMN "layout" SET DATA TYPE "public"."enum___pages_v_transition_v_layout" USING "layout"::"public"."enum___pages_v_transition_v_layout";
  ALTER TABLE "posts_transition" ALTER COLUMN "layout" SET DATA TYPE text;
  ALTER TABLE "posts_transition" ALTER COLUMN "layout" SET DEFAULT 'left'::text;
  DROP TYPE "public"."enum_posts_transition_layout";
  CREATE TYPE "public"."enum_posts_transition_layout" AS ENUM('left', 'centered', 'split', 'statement');
  ALTER TABLE "posts_transition" ALTER COLUMN "layout" SET DEFAULT 'left'::"public"."enum_posts_transition_layout";
  ALTER TABLE "posts_transition" ALTER COLUMN "layout" SET DATA TYPE "public"."enum_posts_transition_layout" USING "layout"::"public"."enum_posts_transition_layout";
  ALTER TABLE "__posts_v_transition_v" ALTER COLUMN "layout" SET DATA TYPE text;
  ALTER TABLE "__posts_v_transition_v" ALTER COLUMN "layout" SET DEFAULT 'left'::text;
  DROP TYPE "public"."enum___posts_v_transition_v_layout";
  CREATE TYPE "public"."enum___posts_v_transition_v_layout" AS ENUM('left', 'centered', 'split', 'statement');
  ALTER TABLE "__posts_v_transition_v" ALTER COLUMN "layout" SET DEFAULT 'left'::"public"."enum___posts_v_transition_v_layout";
  ALTER TABLE "__posts_v_transition_v" ALTER COLUMN "layout" SET DATA TYPE "public"."enum___posts_v_transition_v_layout" USING "layout"::"public"."enum___posts_v_transition_v_layout";
  ALTER TABLE "wp_transition" ALTER COLUMN "layout" SET DATA TYPE text;
  ALTER TABLE "wp_transition" ALTER COLUMN "layout" SET DEFAULT 'left'::text;
  DROP TYPE "public"."enum_wp_transition_layout";
  CREATE TYPE "public"."enum_wp_transition_layout" AS ENUM('left', 'centered', 'split', 'statement');
  ALTER TABLE "wp_transition" ALTER COLUMN "layout" SET DEFAULT 'left'::"public"."enum_wp_transition_layout";
  ALTER TABLE "wp_transition" ALTER COLUMN "layout" SET DATA TYPE "public"."enum_wp_transition_layout" USING "layout"::"public"."enum_wp_transition_layout";
  ALTER TABLE "_wp_transition_v" ALTER COLUMN "layout" SET DATA TYPE text;
  ALTER TABLE "_wp_transition_v" ALTER COLUMN "layout" SET DEFAULT 'left'::text;
  DROP TYPE "public"."enum__wp_transition_v_layout";
  CREATE TYPE "public"."enum__wp_transition_v_layout" AS ENUM('left', 'centered', 'split', 'statement');
  ALTER TABLE "_wp_transition_v" ALTER COLUMN "layout" SET DEFAULT 'left'::"public"."enum__wp_transition_v_layout";
  ALTER TABLE "_wp_transition_v" ALTER COLUMN "layout" SET DATA TYPE "public"."enum__wp_transition_v_layout" USING "layout"::"public"."enum__wp_transition_v_layout";
  ALTER TABLE "lab_pages_transition" ALTER COLUMN "layout" SET DATA TYPE text;
  ALTER TABLE "lab_pages_transition" ALTER COLUMN "layout" SET DEFAULT 'left'::text;
  DROP TYPE "public"."enum_lab_pages_transition_layout";
  CREATE TYPE "public"."enum_lab_pages_transition_layout" AS ENUM('left', 'centered', 'split', 'statement');
  ALTER TABLE "lab_pages_transition" ALTER COLUMN "layout" SET DEFAULT 'left'::"public"."enum_lab_pages_transition_layout";
  ALTER TABLE "lab_pages_transition" ALTER COLUMN "layout" SET DATA TYPE "public"."enum_lab_pages_transition_layout" USING "layout"::"public"."enum_lab_pages_transition_layout";
  ALTER TABLE "__lab_pages_v_transition_v" ALTER COLUMN "layout" SET DATA TYPE text;
  ALTER TABLE "__lab_pages_v_transition_v" ALTER COLUMN "layout" SET DEFAULT 'left'::text;
  DROP TYPE "public"."enum___lab_pages_v_transition_v_layout";
  CREATE TYPE "public"."enum___lab_pages_v_transition_v_layout" AS ENUM('left', 'centered', 'split', 'statement');
  ALTER TABLE "__lab_pages_v_transition_v" ALTER COLUMN "layout" SET DEFAULT 'left'::"public"."enum___lab_pages_v_transition_v_layout";
  ALTER TABLE "__lab_pages_v_transition_v" ALTER COLUMN "layout" SET DATA TYPE "public"."enum___lab_pages_v_transition_v_layout" USING "layout"::"public"."enum___lab_pages_v_transition_v_layout";
  ALTER TABLE "expertise_pages_transition" ALTER COLUMN "layout" SET DATA TYPE text;
  ALTER TABLE "expertise_pages_transition" ALTER COLUMN "layout" SET DEFAULT 'left'::text;
  DROP TYPE "public"."enum_expertise_pages_transition_layout";
  CREATE TYPE "public"."enum_expertise_pages_transition_layout" AS ENUM('left', 'centered', 'split', 'statement');
  ALTER TABLE "expertise_pages_transition" ALTER COLUMN "layout" SET DEFAULT 'left'::"public"."enum_expertise_pages_transition_layout";
  ALTER TABLE "expertise_pages_transition" ALTER COLUMN "layout" SET DATA TYPE "public"."enum_expertise_pages_transition_layout" USING "layout"::"public"."enum_expertise_pages_transition_layout";
  ALTER TABLE "__expertise_pages_v_transition_v" ALTER COLUMN "layout" SET DATA TYPE text;
  ALTER TABLE "__expertise_pages_v_transition_v" ALTER COLUMN "layout" SET DEFAULT 'left'::text;
  DROP TYPE "public"."enum___expertise_pages_v_transition_v_layout";
  CREATE TYPE "public"."enum___expertise_pages_v_transition_v_layout" AS ENUM('left', 'centered', 'split', 'statement');
  ALTER TABLE "__expertise_pages_v_transition_v" ALTER COLUMN "layout" SET DEFAULT 'left'::"public"."enum___expertise_pages_v_transition_v_layout";
  ALTER TABLE "__expertise_pages_v_transition_v" ALTER COLUMN "layout" SET DATA TYPE "public"."enum___expertise_pages_v_transition_v_layout" USING "layout"::"public"."enum___expertise_pages_v_transition_v_layout";
  ALTER TABLE "audience_pages_transition" ALTER COLUMN "layout" SET DATA TYPE text;
  ALTER TABLE "audience_pages_transition" ALTER COLUMN "layout" SET DEFAULT 'left'::text;
  DROP TYPE "public"."enum_audience_pages_transition_layout";
  CREATE TYPE "public"."enum_audience_pages_transition_layout" AS ENUM('left', 'centered', 'split', 'statement');
  ALTER TABLE "audience_pages_transition" ALTER COLUMN "layout" SET DEFAULT 'left'::"public"."enum_audience_pages_transition_layout";
  ALTER TABLE "audience_pages_transition" ALTER COLUMN "layout" SET DATA TYPE "public"."enum_audience_pages_transition_layout" USING "layout"::"public"."enum_audience_pages_transition_layout";
  ALTER TABLE "__audience_pages_v_transition_v" ALTER COLUMN "layout" SET DATA TYPE text;
  ALTER TABLE "__audience_pages_v_transition_v" ALTER COLUMN "layout" SET DEFAULT 'left'::text;
  DROP TYPE "public"."enum___audience_pages_v_transition_v_layout";
  CREATE TYPE "public"."enum___audience_pages_v_transition_v_layout" AS ENUM('left', 'centered', 'split', 'statement');
  ALTER TABLE "__audience_pages_v_transition_v" ALTER COLUMN "layout" SET DEFAULT 'left'::"public"."enum___audience_pages_v_transition_v_layout";
  ALTER TABLE "__audience_pages_v_transition_v" ALTER COLUMN "layout" SET DATA TYPE "public"."enum___audience_pages_v_transition_v_layout" USING "layout"::"public"."enum___audience_pages_v_transition_v_layout";`)
}
