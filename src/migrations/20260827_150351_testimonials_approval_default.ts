import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "testimonials" ALTER COLUMN "approval_status" SET DEFAULT 'approved-public';
  ALTER TABLE "_testimonials_v" ALTER COLUMN "version_approval_status" SET DEFAULT 'approved-public';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "testimonials" ALTER COLUMN "approval_status" SET DEFAULT 'unverified';
  ALTER TABLE "_testimonials_v" ALTER COLUMN "version_approval_status" SET DEFAULT 'unverified';`)
}
