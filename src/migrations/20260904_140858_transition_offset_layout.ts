import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

/**
 * Standard (rich transition) layout: the arrangement that shipped as `left`
 * becomes `offset` and a new flush `left` is added, default `offset`.
 *
 * Drizzle generated `ALTER TYPE ... ADD VALUE 'offset'` followed by
 * `SET DEFAULT 'offset'` in the same up(). Payload runs up() in one
 * transaction and Postgres rejects that ("unsafe use of new value"), which
 * failed the CI migrate step. Recreating each enum through a text cast is
 * safe in one transaction, and the same pass moves existing `left` rows to
 * `offset` so their rendering does not change (see src/blocks/shared/fields.ts).
 */
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "pages_transition" ALTER COLUMN "layout" SET DATA TYPE text;
  ALTER TABLE "pages_transition" ALTER COLUMN "layout" SET DEFAULT 'offset'::text;
  UPDATE "pages_transition" SET "layout" = 'offset' WHERE "layout" = 'left';
  DROP TYPE "public"."enum_pages_transition_layout";
  CREATE TYPE "public"."enum_pages_transition_layout" AS ENUM('offset', 'left', 'centered', 'split', 'statement');
  ALTER TABLE "pages_transition" ALTER COLUMN "layout" SET DEFAULT 'offset'::"public"."enum_pages_transition_layout";
  ALTER TABLE "pages_transition" ALTER COLUMN "layout" SET DATA TYPE "public"."enum_pages_transition_layout" USING "layout"::"public"."enum_pages_transition_layout";
  ALTER TABLE "__pages_v_transition_v" ALTER COLUMN "layout" SET DATA TYPE text;
  ALTER TABLE "__pages_v_transition_v" ALTER COLUMN "layout" SET DEFAULT 'offset'::text;
  UPDATE "__pages_v_transition_v" SET "layout" = 'offset' WHERE "layout" = 'left';
  DROP TYPE "public"."enum___pages_v_transition_v_layout";
  CREATE TYPE "public"."enum___pages_v_transition_v_layout" AS ENUM('offset', 'left', 'centered', 'split', 'statement');
  ALTER TABLE "__pages_v_transition_v" ALTER COLUMN "layout" SET DEFAULT 'offset'::"public"."enum___pages_v_transition_v_layout";
  ALTER TABLE "__pages_v_transition_v" ALTER COLUMN "layout" SET DATA TYPE "public"."enum___pages_v_transition_v_layout" USING "layout"::"public"."enum___pages_v_transition_v_layout";
  ALTER TABLE "posts_transition" ALTER COLUMN "layout" SET DATA TYPE text;
  ALTER TABLE "posts_transition" ALTER COLUMN "layout" SET DEFAULT 'offset'::text;
  UPDATE "posts_transition" SET "layout" = 'offset' WHERE "layout" = 'left';
  DROP TYPE "public"."enum_posts_transition_layout";
  CREATE TYPE "public"."enum_posts_transition_layout" AS ENUM('offset', 'left', 'centered', 'split', 'statement');
  ALTER TABLE "posts_transition" ALTER COLUMN "layout" SET DEFAULT 'offset'::"public"."enum_posts_transition_layout";
  ALTER TABLE "posts_transition" ALTER COLUMN "layout" SET DATA TYPE "public"."enum_posts_transition_layout" USING "layout"::"public"."enum_posts_transition_layout";
  ALTER TABLE "__posts_v_transition_v" ALTER COLUMN "layout" SET DATA TYPE text;
  ALTER TABLE "__posts_v_transition_v" ALTER COLUMN "layout" SET DEFAULT 'offset'::text;
  UPDATE "__posts_v_transition_v" SET "layout" = 'offset' WHERE "layout" = 'left';
  DROP TYPE "public"."enum___posts_v_transition_v_layout";
  CREATE TYPE "public"."enum___posts_v_transition_v_layout" AS ENUM('offset', 'left', 'centered', 'split', 'statement');
  ALTER TABLE "__posts_v_transition_v" ALTER COLUMN "layout" SET DEFAULT 'offset'::"public"."enum___posts_v_transition_v_layout";
  ALTER TABLE "__posts_v_transition_v" ALTER COLUMN "layout" SET DATA TYPE "public"."enum___posts_v_transition_v_layout" USING "layout"::"public"."enum___posts_v_transition_v_layout";
  ALTER TABLE "wp_transition" ALTER COLUMN "layout" SET DATA TYPE text;
  ALTER TABLE "wp_transition" ALTER COLUMN "layout" SET DEFAULT 'offset'::text;
  UPDATE "wp_transition" SET "layout" = 'offset' WHERE "layout" = 'left';
  DROP TYPE "public"."enum_wp_transition_layout";
  CREATE TYPE "public"."enum_wp_transition_layout" AS ENUM('offset', 'left', 'centered', 'split', 'statement');
  ALTER TABLE "wp_transition" ALTER COLUMN "layout" SET DEFAULT 'offset'::"public"."enum_wp_transition_layout";
  ALTER TABLE "wp_transition" ALTER COLUMN "layout" SET DATA TYPE "public"."enum_wp_transition_layout" USING "layout"::"public"."enum_wp_transition_layout";
  ALTER TABLE "_wp_transition_v" ALTER COLUMN "layout" SET DATA TYPE text;
  ALTER TABLE "_wp_transition_v" ALTER COLUMN "layout" SET DEFAULT 'offset'::text;
  UPDATE "_wp_transition_v" SET "layout" = 'offset' WHERE "layout" = 'left';
  DROP TYPE "public"."enum__wp_transition_v_layout";
  CREATE TYPE "public"."enum__wp_transition_v_layout" AS ENUM('offset', 'left', 'centered', 'split', 'statement');
  ALTER TABLE "_wp_transition_v" ALTER COLUMN "layout" SET DEFAULT 'offset'::"public"."enum__wp_transition_v_layout";
  ALTER TABLE "_wp_transition_v" ALTER COLUMN "layout" SET DATA TYPE "public"."enum__wp_transition_v_layout" USING "layout"::"public"."enum__wp_transition_v_layout";
  ALTER TABLE "lab_pages_transition" ALTER COLUMN "layout" SET DATA TYPE text;
  ALTER TABLE "lab_pages_transition" ALTER COLUMN "layout" SET DEFAULT 'offset'::text;
  UPDATE "lab_pages_transition" SET "layout" = 'offset' WHERE "layout" = 'left';
  DROP TYPE "public"."enum_lab_pages_transition_layout";
  CREATE TYPE "public"."enum_lab_pages_transition_layout" AS ENUM('offset', 'left', 'centered', 'split', 'statement');
  ALTER TABLE "lab_pages_transition" ALTER COLUMN "layout" SET DEFAULT 'offset'::"public"."enum_lab_pages_transition_layout";
  ALTER TABLE "lab_pages_transition" ALTER COLUMN "layout" SET DATA TYPE "public"."enum_lab_pages_transition_layout" USING "layout"::"public"."enum_lab_pages_transition_layout";
  ALTER TABLE "__lab_pages_v_transition_v" ALTER COLUMN "layout" SET DATA TYPE text;
  ALTER TABLE "__lab_pages_v_transition_v" ALTER COLUMN "layout" SET DEFAULT 'offset'::text;
  UPDATE "__lab_pages_v_transition_v" SET "layout" = 'offset' WHERE "layout" = 'left';
  DROP TYPE "public"."enum___lab_pages_v_transition_v_layout";
  CREATE TYPE "public"."enum___lab_pages_v_transition_v_layout" AS ENUM('offset', 'left', 'centered', 'split', 'statement');
  ALTER TABLE "__lab_pages_v_transition_v" ALTER COLUMN "layout" SET DEFAULT 'offset'::"public"."enum___lab_pages_v_transition_v_layout";
  ALTER TABLE "__lab_pages_v_transition_v" ALTER COLUMN "layout" SET DATA TYPE "public"."enum___lab_pages_v_transition_v_layout" USING "layout"::"public"."enum___lab_pages_v_transition_v_layout";
  ALTER TABLE "expertise_pages_transition" ALTER COLUMN "layout" SET DATA TYPE text;
  ALTER TABLE "expertise_pages_transition" ALTER COLUMN "layout" SET DEFAULT 'offset'::text;
  UPDATE "expertise_pages_transition" SET "layout" = 'offset' WHERE "layout" = 'left';
  DROP TYPE "public"."enum_expertise_pages_transition_layout";
  CREATE TYPE "public"."enum_expertise_pages_transition_layout" AS ENUM('offset', 'left', 'centered', 'split', 'statement');
  ALTER TABLE "expertise_pages_transition" ALTER COLUMN "layout" SET DEFAULT 'offset'::"public"."enum_expertise_pages_transition_layout";
  ALTER TABLE "expertise_pages_transition" ALTER COLUMN "layout" SET DATA TYPE "public"."enum_expertise_pages_transition_layout" USING "layout"::"public"."enum_expertise_pages_transition_layout";
  ALTER TABLE "__expertise_pages_v_transition_v" ALTER COLUMN "layout" SET DATA TYPE text;
  ALTER TABLE "__expertise_pages_v_transition_v" ALTER COLUMN "layout" SET DEFAULT 'offset'::text;
  UPDATE "__expertise_pages_v_transition_v" SET "layout" = 'offset' WHERE "layout" = 'left';
  DROP TYPE "public"."enum___expertise_pages_v_transition_v_layout";
  CREATE TYPE "public"."enum___expertise_pages_v_transition_v_layout" AS ENUM('offset', 'left', 'centered', 'split', 'statement');
  ALTER TABLE "__expertise_pages_v_transition_v" ALTER COLUMN "layout" SET DEFAULT 'offset'::"public"."enum___expertise_pages_v_transition_v_layout";
  ALTER TABLE "__expertise_pages_v_transition_v" ALTER COLUMN "layout" SET DATA TYPE "public"."enum___expertise_pages_v_transition_v_layout" USING "layout"::"public"."enum___expertise_pages_v_transition_v_layout";
  ALTER TABLE "audience_pages_transition" ALTER COLUMN "layout" SET DATA TYPE text;
  ALTER TABLE "audience_pages_transition" ALTER COLUMN "layout" SET DEFAULT 'offset'::text;
  UPDATE "audience_pages_transition" SET "layout" = 'offset' WHERE "layout" = 'left';
  DROP TYPE "public"."enum_audience_pages_transition_layout";
  CREATE TYPE "public"."enum_audience_pages_transition_layout" AS ENUM('offset', 'left', 'centered', 'split', 'statement');
  ALTER TABLE "audience_pages_transition" ALTER COLUMN "layout" SET DEFAULT 'offset'::"public"."enum_audience_pages_transition_layout";
  ALTER TABLE "audience_pages_transition" ALTER COLUMN "layout" SET DATA TYPE "public"."enum_audience_pages_transition_layout" USING "layout"::"public"."enum_audience_pages_transition_layout";
  ALTER TABLE "__audience_pages_v_transition_v" ALTER COLUMN "layout" SET DATA TYPE text;
  ALTER TABLE "__audience_pages_v_transition_v" ALTER COLUMN "layout" SET DEFAULT 'offset'::text;
  UPDATE "__audience_pages_v_transition_v" SET "layout" = 'offset' WHERE "layout" = 'left';
  DROP TYPE "public"."enum___audience_pages_v_transition_v_layout";
  CREATE TYPE "public"."enum___audience_pages_v_transition_v_layout" AS ENUM('offset', 'left', 'centered', 'split', 'statement');
  ALTER TABLE "__audience_pages_v_transition_v" ALTER COLUMN "layout" SET DEFAULT 'offset'::"public"."enum___audience_pages_v_transition_v_layout";
  ALTER TABLE "__audience_pages_v_transition_v" ALTER COLUMN "layout" SET DATA TYPE "public"."enum___audience_pages_v_transition_v_layout" USING "layout"::"public"."enum___audience_pages_v_transition_v_layout";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "pages_transition" ALTER COLUMN "layout" SET DATA TYPE text;
  ALTER TABLE "pages_transition" ALTER COLUMN "layout" SET DEFAULT 'left'::text;
  UPDATE "pages_transition" SET "layout" = 'left' WHERE "layout" = 'offset';
  DROP TYPE "public"."enum_pages_transition_layout";
  CREATE TYPE "public"."enum_pages_transition_layout" AS ENUM('left', 'centered', 'split', 'statement');
  ALTER TABLE "pages_transition" ALTER COLUMN "layout" SET DEFAULT 'left'::"public"."enum_pages_transition_layout";
  ALTER TABLE "pages_transition" ALTER COLUMN "layout" SET DATA TYPE "public"."enum_pages_transition_layout" USING "layout"::"public"."enum_pages_transition_layout";
  ALTER TABLE "__pages_v_transition_v" ALTER COLUMN "layout" SET DATA TYPE text;
  ALTER TABLE "__pages_v_transition_v" ALTER COLUMN "layout" SET DEFAULT 'left'::text;
  UPDATE "__pages_v_transition_v" SET "layout" = 'left' WHERE "layout" = 'offset';
  DROP TYPE "public"."enum___pages_v_transition_v_layout";
  CREATE TYPE "public"."enum___pages_v_transition_v_layout" AS ENUM('left', 'centered', 'split', 'statement');
  ALTER TABLE "__pages_v_transition_v" ALTER COLUMN "layout" SET DEFAULT 'left'::"public"."enum___pages_v_transition_v_layout";
  ALTER TABLE "__pages_v_transition_v" ALTER COLUMN "layout" SET DATA TYPE "public"."enum___pages_v_transition_v_layout" USING "layout"::"public"."enum___pages_v_transition_v_layout";
  ALTER TABLE "posts_transition" ALTER COLUMN "layout" SET DATA TYPE text;
  ALTER TABLE "posts_transition" ALTER COLUMN "layout" SET DEFAULT 'left'::text;
  UPDATE "posts_transition" SET "layout" = 'left' WHERE "layout" = 'offset';
  DROP TYPE "public"."enum_posts_transition_layout";
  CREATE TYPE "public"."enum_posts_transition_layout" AS ENUM('left', 'centered', 'split', 'statement');
  ALTER TABLE "posts_transition" ALTER COLUMN "layout" SET DEFAULT 'left'::"public"."enum_posts_transition_layout";
  ALTER TABLE "posts_transition" ALTER COLUMN "layout" SET DATA TYPE "public"."enum_posts_transition_layout" USING "layout"::"public"."enum_posts_transition_layout";
  ALTER TABLE "__posts_v_transition_v" ALTER COLUMN "layout" SET DATA TYPE text;
  ALTER TABLE "__posts_v_transition_v" ALTER COLUMN "layout" SET DEFAULT 'left'::text;
  UPDATE "__posts_v_transition_v" SET "layout" = 'left' WHERE "layout" = 'offset';
  DROP TYPE "public"."enum___posts_v_transition_v_layout";
  CREATE TYPE "public"."enum___posts_v_transition_v_layout" AS ENUM('left', 'centered', 'split', 'statement');
  ALTER TABLE "__posts_v_transition_v" ALTER COLUMN "layout" SET DEFAULT 'left'::"public"."enum___posts_v_transition_v_layout";
  ALTER TABLE "__posts_v_transition_v" ALTER COLUMN "layout" SET DATA TYPE "public"."enum___posts_v_transition_v_layout" USING "layout"::"public"."enum___posts_v_transition_v_layout";
  ALTER TABLE "wp_transition" ALTER COLUMN "layout" SET DATA TYPE text;
  ALTER TABLE "wp_transition" ALTER COLUMN "layout" SET DEFAULT 'left'::text;
  UPDATE "wp_transition" SET "layout" = 'left' WHERE "layout" = 'offset';
  DROP TYPE "public"."enum_wp_transition_layout";
  CREATE TYPE "public"."enum_wp_transition_layout" AS ENUM('left', 'centered', 'split', 'statement');
  ALTER TABLE "wp_transition" ALTER COLUMN "layout" SET DEFAULT 'left'::"public"."enum_wp_transition_layout";
  ALTER TABLE "wp_transition" ALTER COLUMN "layout" SET DATA TYPE "public"."enum_wp_transition_layout" USING "layout"::"public"."enum_wp_transition_layout";
  ALTER TABLE "_wp_transition_v" ALTER COLUMN "layout" SET DATA TYPE text;
  ALTER TABLE "_wp_transition_v" ALTER COLUMN "layout" SET DEFAULT 'left'::text;
  UPDATE "_wp_transition_v" SET "layout" = 'left' WHERE "layout" = 'offset';
  DROP TYPE "public"."enum__wp_transition_v_layout";
  CREATE TYPE "public"."enum__wp_transition_v_layout" AS ENUM('left', 'centered', 'split', 'statement');
  ALTER TABLE "_wp_transition_v" ALTER COLUMN "layout" SET DEFAULT 'left'::"public"."enum__wp_transition_v_layout";
  ALTER TABLE "_wp_transition_v" ALTER COLUMN "layout" SET DATA TYPE "public"."enum__wp_transition_v_layout" USING "layout"::"public"."enum__wp_transition_v_layout";
  ALTER TABLE "lab_pages_transition" ALTER COLUMN "layout" SET DATA TYPE text;
  ALTER TABLE "lab_pages_transition" ALTER COLUMN "layout" SET DEFAULT 'left'::text;
  UPDATE "lab_pages_transition" SET "layout" = 'left' WHERE "layout" = 'offset';
  DROP TYPE "public"."enum_lab_pages_transition_layout";
  CREATE TYPE "public"."enum_lab_pages_transition_layout" AS ENUM('left', 'centered', 'split', 'statement');
  ALTER TABLE "lab_pages_transition" ALTER COLUMN "layout" SET DEFAULT 'left'::"public"."enum_lab_pages_transition_layout";
  ALTER TABLE "lab_pages_transition" ALTER COLUMN "layout" SET DATA TYPE "public"."enum_lab_pages_transition_layout" USING "layout"::"public"."enum_lab_pages_transition_layout";
  ALTER TABLE "__lab_pages_v_transition_v" ALTER COLUMN "layout" SET DATA TYPE text;
  ALTER TABLE "__lab_pages_v_transition_v" ALTER COLUMN "layout" SET DEFAULT 'left'::text;
  UPDATE "__lab_pages_v_transition_v" SET "layout" = 'left' WHERE "layout" = 'offset';
  DROP TYPE "public"."enum___lab_pages_v_transition_v_layout";
  CREATE TYPE "public"."enum___lab_pages_v_transition_v_layout" AS ENUM('left', 'centered', 'split', 'statement');
  ALTER TABLE "__lab_pages_v_transition_v" ALTER COLUMN "layout" SET DEFAULT 'left'::"public"."enum___lab_pages_v_transition_v_layout";
  ALTER TABLE "__lab_pages_v_transition_v" ALTER COLUMN "layout" SET DATA TYPE "public"."enum___lab_pages_v_transition_v_layout" USING "layout"::"public"."enum___lab_pages_v_transition_v_layout";
  ALTER TABLE "expertise_pages_transition" ALTER COLUMN "layout" SET DATA TYPE text;
  ALTER TABLE "expertise_pages_transition" ALTER COLUMN "layout" SET DEFAULT 'left'::text;
  UPDATE "expertise_pages_transition" SET "layout" = 'left' WHERE "layout" = 'offset';
  DROP TYPE "public"."enum_expertise_pages_transition_layout";
  CREATE TYPE "public"."enum_expertise_pages_transition_layout" AS ENUM('left', 'centered', 'split', 'statement');
  ALTER TABLE "expertise_pages_transition" ALTER COLUMN "layout" SET DEFAULT 'left'::"public"."enum_expertise_pages_transition_layout";
  ALTER TABLE "expertise_pages_transition" ALTER COLUMN "layout" SET DATA TYPE "public"."enum_expertise_pages_transition_layout" USING "layout"::"public"."enum_expertise_pages_transition_layout";
  ALTER TABLE "__expertise_pages_v_transition_v" ALTER COLUMN "layout" SET DATA TYPE text;
  ALTER TABLE "__expertise_pages_v_transition_v" ALTER COLUMN "layout" SET DEFAULT 'left'::text;
  UPDATE "__expertise_pages_v_transition_v" SET "layout" = 'left' WHERE "layout" = 'offset';
  DROP TYPE "public"."enum___expertise_pages_v_transition_v_layout";
  CREATE TYPE "public"."enum___expertise_pages_v_transition_v_layout" AS ENUM('left', 'centered', 'split', 'statement');
  ALTER TABLE "__expertise_pages_v_transition_v" ALTER COLUMN "layout" SET DEFAULT 'left'::"public"."enum___expertise_pages_v_transition_v_layout";
  ALTER TABLE "__expertise_pages_v_transition_v" ALTER COLUMN "layout" SET DATA TYPE "public"."enum___expertise_pages_v_transition_v_layout" USING "layout"::"public"."enum___expertise_pages_v_transition_v_layout";
  ALTER TABLE "audience_pages_transition" ALTER COLUMN "layout" SET DATA TYPE text;
  ALTER TABLE "audience_pages_transition" ALTER COLUMN "layout" SET DEFAULT 'left'::text;
  UPDATE "audience_pages_transition" SET "layout" = 'left' WHERE "layout" = 'offset';
  DROP TYPE "public"."enum_audience_pages_transition_layout";
  CREATE TYPE "public"."enum_audience_pages_transition_layout" AS ENUM('left', 'centered', 'split', 'statement');
  ALTER TABLE "audience_pages_transition" ALTER COLUMN "layout" SET DEFAULT 'left'::"public"."enum_audience_pages_transition_layout";
  ALTER TABLE "audience_pages_transition" ALTER COLUMN "layout" SET DATA TYPE "public"."enum_audience_pages_transition_layout" USING "layout"::"public"."enum_audience_pages_transition_layout";
  ALTER TABLE "__audience_pages_v_transition_v" ALTER COLUMN "layout" SET DATA TYPE text;
  ALTER TABLE "__audience_pages_v_transition_v" ALTER COLUMN "layout" SET DEFAULT 'left'::text;
  UPDATE "__audience_pages_v_transition_v" SET "layout" = 'left' WHERE "layout" = 'offset';
  DROP TYPE "public"."enum___audience_pages_v_transition_v_layout";
  CREATE TYPE "public"."enum___audience_pages_v_transition_v_layout" AS ENUM('left', 'centered', 'split', 'statement');
  ALTER TABLE "__audience_pages_v_transition_v" ALTER COLUMN "layout" SET DEFAULT 'left'::"public"."enum___audience_pages_v_transition_v_layout";
  ALTER TABLE "__audience_pages_v_transition_v" ALTER COLUMN "layout" SET DATA TYPE "public"."enum___audience_pages_v_transition_v_layout" USING "layout"::"public"."enum___audience_pages_v_transition_v_layout";`)
}
