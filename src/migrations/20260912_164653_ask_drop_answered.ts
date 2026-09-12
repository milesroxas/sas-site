import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "ask_questions_answered_idx";
  ALTER TABLE "ask_questions" DROP COLUMN "answered";
  ALTER TABLE "ask_questions" DROP COLUMN "source_count";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "ask_questions" ADD COLUMN "answered" boolean DEFAULT false;
  ALTER TABLE "ask_questions" ADD COLUMN "source_count" numeric;
  CREATE INDEX "ask_questions_answered_idx" ON "ask_questions" USING btree ("answered");`)
}
