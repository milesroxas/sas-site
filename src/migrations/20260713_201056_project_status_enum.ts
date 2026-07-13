import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."project_engagement_status" AS ENUM('planned', 'active', 'completed', 'archived');
  ALTER TABLE "projects" ALTER COLUMN "status" DROP DEFAULT;
  ALTER TABLE "projects" ALTER COLUMN "status" SET DATA TYPE "public"."project_engagement_status" USING "status"::text::"public"."project_engagement_status";
  ALTER TABLE "projects" ALTER COLUMN "status" SET DEFAULT 'planned';
  ALTER TABLE "_projects_v" ALTER COLUMN "version_status" DROP DEFAULT;
  ALTER TABLE "_projects_v" ALTER COLUMN "version_status" SET DATA TYPE "public"."project_engagement_status" USING "version_status"::text::"public"."project_engagement_status";
  ALTER TABLE "_projects_v" ALTER COLUMN "version_status" SET DEFAULT 'planned';`)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "projects" ALTER COLUMN "status" DROP DEFAULT;
  ALTER TABLE "projects" ALTER COLUMN "status" SET DATA TYPE varchar USING "status"::text;
  ALTER TABLE "projects" ALTER COLUMN "status" SET DEFAULT 'planned';
  ALTER TABLE "_projects_v" ALTER COLUMN "version_status" DROP DEFAULT;
  ALTER TABLE "_projects_v" ALTER COLUMN "version_status" SET DATA TYPE varchar USING "version_status"::text;
  ALTER TABLE "_projects_v" ALTER COLUMN "version_status" SET DEFAULT 'planned';
  DROP TYPE "public"."project_engagement_status";`)
}
