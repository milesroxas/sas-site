import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."project_engagement_type" AS ENUM('project', 'retainer');
  -- Legacy free-text values ("Project", "Website design and development", '') cannot cast to the enum.
  UPDATE "projects" SET "engagement_type" = lower(btrim("engagement_type"));
  UPDATE "projects" SET "engagement_type" = NULL WHERE "engagement_type" NOT IN ('project', 'retainer');
  UPDATE "_projects_v" SET "version_engagement_type" = lower(btrim("version_engagement_type"));
  UPDATE "_projects_v" SET "version_engagement_type" = NULL WHERE "version_engagement_type" NOT IN ('project', 'retainer');
  ALTER TABLE "projects" ALTER COLUMN "engagement_type" SET DATA TYPE "public"."project_engagement_type" USING "engagement_type"::"public"."project_engagement_type";
  ALTER TABLE "_projects_v" ALTER COLUMN "version_engagement_type" SET DATA TYPE "public"."project_engagement_type" USING "version_engagement_type"::"public"."project_engagement_type";
  ALTER TABLE "pages_ind_work_industries" ADD COLUMN "second_line" varchar;
  ALTER TABLE "__pages_v_ind_work_v_industries" ADD COLUMN "second_line" varchar;
  ALTER TABLE "work_pages_ind_work_industries" ADD COLUMN "second_line" varchar;
  ALTER TABLE "__work_pages_v_ind_work_v_industries" ADD COLUMN "second_line" varchar;
  ALTER TABLE "home_ind_work_industries" ADD COLUMN "second_line" varchar;
  ALTER TABLE "__home_v_ind_work_v_industries" ADD COLUMN "second_line" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "projects" ALTER COLUMN "engagement_type" SET DATA TYPE varchar;
  ALTER TABLE "_projects_v" ALTER COLUMN "version_engagement_type" SET DATA TYPE varchar;
  ALTER TABLE "pages_ind_work_industries" DROP COLUMN "second_line";
  ALTER TABLE "__pages_v_ind_work_v_industries" DROP COLUMN "second_line";
  ALTER TABLE "work_pages_ind_work_industries" DROP COLUMN "second_line";
  ALTER TABLE "__work_pages_v_ind_work_v_industries" DROP COLUMN "second_line";
  ALTER TABLE "home_ind_work_industries" DROP COLUMN "second_line";
  ALTER TABLE "__home_v_ind_work_v_industries" DROP COLUMN "second_line";
  DROP TYPE "public"."project_engagement_type";`)
}
