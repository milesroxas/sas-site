import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "forms_blocks_step" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"block_name" varchar
  );
  
  ALTER TABLE "forms" ADD COLUMN "steps_estimated_time" varchar;
  ALTER TABLE "forms" ADD COLUMN "steps_continue_label" varchar DEFAULT 'Continue';
  ALTER TABLE "forms" ADD COLUMN "steps_edit_label" varchar DEFAULT 'Edit';
  ALTER TABLE "forms" ADD COLUMN "steps_note" varchar DEFAULT 'Nothing is sent until the last step.';
  ALTER TABLE "forms_blocks_step" ADD CONSTRAINT "forms_blocks_step_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "forms_blocks_step_order_idx" ON "forms_blocks_step" USING btree ("_order");
  CREATE INDEX "forms_blocks_step_parent_id_idx" ON "forms_blocks_step" USING btree ("_parent_id");
  CREATE INDEX "forms_blocks_step_path_idx" ON "forms_blocks_step" USING btree ("_path");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "forms_blocks_step" CASCADE;
  ALTER TABLE "forms" DROP COLUMN "steps_estimated_time";
  ALTER TABLE "forms" DROP COLUMN "steps_continue_label";
  ALTER TABLE "forms" DROP COLUMN "steps_edit_label";
  ALTER TABLE "forms" DROP COLUMN "steps_note";`)
}
