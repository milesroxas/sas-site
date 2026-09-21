import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_ask_questions_handoff_reason" ADD VALUE 'case_study';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "ask_questions" ALTER COLUMN "handoff_reason" SET DATA TYPE text;
  DROP TYPE "public"."enum_ask_questions_handoff_reason";
  CREATE TYPE "public"."enum_ask_questions_handoff_reason" AS ENUM('estimate', 'project', 'person', 'contact_details', 'no_answer');
  ALTER TABLE "ask_questions" ALTER COLUMN "handoff_reason" SET DATA TYPE "public"."enum_ask_questions_handoff_reason" USING "handoff_reason"::"public"."enum_ask_questions_handoff_reason";`)
}
