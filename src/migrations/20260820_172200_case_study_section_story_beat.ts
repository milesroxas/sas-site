import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "case_studies_context_story_beats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"label" varchar,
  	"heading" varchar,
  	"body" jsonb
  );
  
  CREATE TABLE "case_studies_challenge_story_beats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"label" varchar,
  	"heading" varchar,
  	"body" jsonb
  );
  
  CREATE TABLE "case_studies_strategy_story_beats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"label" varchar,
  	"heading" varchar,
  	"body" jsonb
  );
  
  CREATE TABLE "case_studies_approach_story_beats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"label" varchar,
  	"heading" varchar,
  	"body" jsonb
  );
  
  CREATE TABLE "case_studies_outcome_summary_story_beats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"label" varchar,
  	"heading" varchar,
  	"body" jsonb
  );
  
  CREATE TABLE "case_studies_learnings_story_beats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"label" varchar,
  	"heading" varchar,
  	"body" jsonb
  );
  
  CREATE TABLE "_case_studies_v_version_context_story_beats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"label" varchar,
  	"heading" varchar,
  	"body" jsonb,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_case_studies_v_version_challenge_story_beats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"label" varchar,
  	"heading" varchar,
  	"body" jsonb,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_case_studies_v_version_strategy_story_beats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"label" varchar,
  	"heading" varchar,
  	"body" jsonb,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_case_studies_v_version_approach_story_beats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"label" varchar,
  	"heading" varchar,
  	"body" jsonb,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_case_studies_v_version_outcome_summary_story_beats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"label" varchar,
  	"heading" varchar,
  	"body" jsonb,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_case_studies_v_version_learnings_story_beats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"label" varchar,
  	"heading" varchar,
  	"body" jsonb,
  	"_uuid" varchar
  );
  
  ALTER TABLE "case_studies" RENAME COLUMN "context" TO "context_body";
  ALTER TABLE "case_studies" RENAME COLUMN "challenge" TO "challenge_body";
  ALTER TABLE "case_studies" RENAME COLUMN "strategy" TO "strategy_body";
  ALTER TABLE "case_studies" RENAME COLUMN "approach" TO "approach_body";
  ALTER TABLE "case_studies" RENAME COLUMN "outcome_summary" TO "outcome_summary_body";
  ALTER TABLE "case_studies" RENAME COLUMN "learnings" TO "learnings_body";
  ALTER TABLE "_case_studies_v" RENAME COLUMN "version_context" TO "version_context_body";
  ALTER TABLE "_case_studies_v" RENAME COLUMN "version_challenge" TO "version_challenge_body";
  ALTER TABLE "_case_studies_v" RENAME COLUMN "version_strategy" TO "version_strategy_body";
  ALTER TABLE "_case_studies_v" RENAME COLUMN "version_approach" TO "version_approach_body";
  ALTER TABLE "_case_studies_v" RENAME COLUMN "version_outcome_summary" TO "version_outcome_summary_body";
  ALTER TABLE "_case_studies_v" RENAME COLUMN "version_learnings" TO "version_learnings_body";
  ALTER TABLE "wp_story" ADD COLUMN "story_beat_key" varchar;
  ALTER TABLE "work_pages_split_narrow" ADD COLUMN "story_beat_key" varchar;
  ALTER TABLE "work_pages_full_media" ADD COLUMN "story_beat_key" varchar;
  ALTER TABLE "work_pages_image_pair" ADD COLUMN "story_beat_key" varchar;
  ALTER TABLE "work_pages_split_offset" ADD COLUMN "story_beat_key" varchar;
  ALTER TABLE "work_pages_blocks_feature_heading_offset" ADD COLUMN "story_beat_key" varchar;
  ALTER TABLE "work_pages_blocks_feature_statement_grid" ADD COLUMN "story_beat_key" varchar;
  ALTER TABLE "work_pages_image_statement" ADD COLUMN "story_beat_key" varchar;
  ALTER TABLE "work_pages_blocks_feature_tabs_tabs" ADD COLUMN "story_beat_key" varchar;
  ALTER TABLE "_wp_story_v" ADD COLUMN "story_beat_key" varchar;
  ALTER TABLE "__work_pages_v_split_narrow_v" ADD COLUMN "story_beat_key" varchar;
  ALTER TABLE "__work_pages_v_full_media_v" ADD COLUMN "story_beat_key" varchar;
  ALTER TABLE "__work_pages_v_image_pair_v" ADD COLUMN "story_beat_key" varchar;
  ALTER TABLE "__work_pages_v_split_offset_v" ADD COLUMN "story_beat_key" varchar;
  ALTER TABLE "_work_pages_v_blocks_feature_heading_offset" ADD COLUMN "story_beat_key" varchar;
  ALTER TABLE "_work_pages_v_blocks_feature_statement_grid" ADD COLUMN "story_beat_key" varchar;
  ALTER TABLE "__work_pages_v_image_statement_v" ADD COLUMN "story_beat_key" varchar;
  ALTER TABLE "_work_pages_v_blocks_feature_tabs_tabs" ADD COLUMN "story_beat_key" varchar;
  ALTER TABLE "case_studies_context_story_beats" ADD CONSTRAINT "case_studies_context_story_beats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."case_studies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "case_studies_challenge_story_beats" ADD CONSTRAINT "case_studies_challenge_story_beats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."case_studies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "case_studies_strategy_story_beats" ADD CONSTRAINT "case_studies_strategy_story_beats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."case_studies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "case_studies_approach_story_beats" ADD CONSTRAINT "case_studies_approach_story_beats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."case_studies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "case_studies_outcome_summary_story_beats" ADD CONSTRAINT "case_studies_outcome_summary_story_beats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."case_studies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "case_studies_learnings_story_beats" ADD CONSTRAINT "case_studies_learnings_story_beats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."case_studies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_case_studies_v_version_context_story_beats" ADD CONSTRAINT "_case_studies_v_version_context_story_beats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_case_studies_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_case_studies_v_version_challenge_story_beats" ADD CONSTRAINT "_case_studies_v_version_challenge_story_beats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_case_studies_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_case_studies_v_version_strategy_story_beats" ADD CONSTRAINT "_case_studies_v_version_strategy_story_beats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_case_studies_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_case_studies_v_version_approach_story_beats" ADD CONSTRAINT "_case_studies_v_version_approach_story_beats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_case_studies_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_case_studies_v_version_outcome_summary_story_beats" ADD CONSTRAINT "_case_studies_v_version_outcome_summary_story_beats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_case_studies_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_case_studies_v_version_learnings_story_beats" ADD CONSTRAINT "_case_studies_v_version_learnings_story_beats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_case_studies_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "case_studies_context_story_beats_order_idx" ON "case_studies_context_story_beats" USING btree ("_order");
  CREATE INDEX "case_studies_context_story_beats_parent_id_idx" ON "case_studies_context_story_beats" USING btree ("_parent_id");
  CREATE INDEX "case_studies_challenge_story_beats_order_idx" ON "case_studies_challenge_story_beats" USING btree ("_order");
  CREATE INDEX "case_studies_challenge_story_beats_parent_id_idx" ON "case_studies_challenge_story_beats" USING btree ("_parent_id");
  CREATE INDEX "case_studies_strategy_story_beats_order_idx" ON "case_studies_strategy_story_beats" USING btree ("_order");
  CREATE INDEX "case_studies_strategy_story_beats_parent_id_idx" ON "case_studies_strategy_story_beats" USING btree ("_parent_id");
  CREATE INDEX "case_studies_approach_story_beats_order_idx" ON "case_studies_approach_story_beats" USING btree ("_order");
  CREATE INDEX "case_studies_approach_story_beats_parent_id_idx" ON "case_studies_approach_story_beats" USING btree ("_parent_id");
  CREATE INDEX "case_studies_outcome_summary_story_beats_order_idx" ON "case_studies_outcome_summary_story_beats" USING btree ("_order");
  CREATE INDEX "case_studies_outcome_summary_story_beats_parent_id_idx" ON "case_studies_outcome_summary_story_beats" USING btree ("_parent_id");
  CREATE INDEX "case_studies_learnings_story_beats_order_idx" ON "case_studies_learnings_story_beats" USING btree ("_order");
  CREATE INDEX "case_studies_learnings_story_beats_parent_id_idx" ON "case_studies_learnings_story_beats" USING btree ("_parent_id");
  CREATE INDEX "_case_studies_v_version_context_story_beats_order_idx" ON "_case_studies_v_version_context_story_beats" USING btree ("_order");
  CREATE INDEX "_case_studies_v_version_context_story_beats_parent_id_idx" ON "_case_studies_v_version_context_story_beats" USING btree ("_parent_id");
  CREATE INDEX "_case_studies_v_version_challenge_story_beats_order_idx" ON "_case_studies_v_version_challenge_story_beats" USING btree ("_order");
  CREATE INDEX "_case_studies_v_version_challenge_story_beats_parent_id_idx" ON "_case_studies_v_version_challenge_story_beats" USING btree ("_parent_id");
  CREATE INDEX "_case_studies_v_version_strategy_story_beats_order_idx" ON "_case_studies_v_version_strategy_story_beats" USING btree ("_order");
  CREATE INDEX "_case_studies_v_version_strategy_story_beats_parent_id_idx" ON "_case_studies_v_version_strategy_story_beats" USING btree ("_parent_id");
  CREATE INDEX "_case_studies_v_version_approach_story_beats_order_idx" ON "_case_studies_v_version_approach_story_beats" USING btree ("_order");
  CREATE INDEX "_case_studies_v_version_approach_story_beats_parent_id_idx" ON "_case_studies_v_version_approach_story_beats" USING btree ("_parent_id");
  CREATE INDEX "_case_studies_v_version_outcome_summary_story_beats_order_idx" ON "_case_studies_v_version_outcome_summary_story_beats" USING btree ("_order");
  CREATE INDEX "_case_studies_v_version_outcome_summary_story_beats_parent_id_idx" ON "_case_studies_v_version_outcome_summary_story_beats" USING btree ("_parent_id");
  CREATE INDEX "_case_studies_v_version_learnings_story_beats_order_idx" ON "_case_studies_v_version_learnings_story_beats" USING btree ("_order");
  CREATE INDEX "_case_studies_v_version_learnings_story_beats_parent_id_idx" ON "_case_studies_v_version_learnings_story_beats" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "case_studies_context_story_beats" CASCADE;
  DROP TABLE "case_studies_challenge_story_beats" CASCADE;
  DROP TABLE "case_studies_strategy_story_beats" CASCADE;
  DROP TABLE "case_studies_approach_story_beats" CASCADE;
  DROP TABLE "case_studies_outcome_summary_story_beats" CASCADE;
  DROP TABLE "case_studies_learnings_story_beats" CASCADE;
  DROP TABLE "_case_studies_v_version_context_story_beats" CASCADE;
  DROP TABLE "_case_studies_v_version_challenge_story_beats" CASCADE;
  DROP TABLE "_case_studies_v_version_strategy_story_beats" CASCADE;
  DROP TABLE "_case_studies_v_version_approach_story_beats" CASCADE;
  DROP TABLE "_case_studies_v_version_outcome_summary_story_beats" CASCADE;
  DROP TABLE "_case_studies_v_version_learnings_story_beats" CASCADE;
  ALTER TABLE "case_studies" RENAME COLUMN "context_body" TO "context";
  ALTER TABLE "case_studies" RENAME COLUMN "challenge_body" TO "challenge";
  ALTER TABLE "case_studies" RENAME COLUMN "strategy_body" TO "strategy";
  ALTER TABLE "case_studies" RENAME COLUMN "approach_body" TO "approach";
  ALTER TABLE "case_studies" RENAME COLUMN "learnings_body" TO "learnings";
  ALTER TABLE "case_studies" RENAME COLUMN "outcome_summary_body" TO "outcome_summary";
  ALTER TABLE "_case_studies_v" RENAME COLUMN "version_context_body" TO "version_context";
  ALTER TABLE "_case_studies_v" RENAME COLUMN "version_challenge_body" TO "version_challenge";
  ALTER TABLE "_case_studies_v" RENAME COLUMN "version_strategy_body" TO "version_strategy";
  ALTER TABLE "_case_studies_v" RENAME COLUMN "version_approach_body" TO "version_approach";
  ALTER TABLE "_case_studies_v" RENAME COLUMN "version_learnings_body" TO "version_learnings";
  ALTER TABLE "_case_studies_v" RENAME COLUMN "version_outcome_summary_body" TO "version_outcome_summary";
  ALTER TABLE "wp_story" DROP COLUMN "story_beat_key";
  ALTER TABLE "work_pages_split_narrow" DROP COLUMN "story_beat_key";
  ALTER TABLE "work_pages_full_media" DROP COLUMN "story_beat_key";
  ALTER TABLE "work_pages_image_pair" DROP COLUMN "story_beat_key";
  ALTER TABLE "work_pages_split_offset" DROP COLUMN "story_beat_key";
  ALTER TABLE "work_pages_blocks_feature_heading_offset" DROP COLUMN "story_beat_key";
  ALTER TABLE "work_pages_blocks_feature_statement_grid" DROP COLUMN "story_beat_key";
  ALTER TABLE "work_pages_image_statement" DROP COLUMN "story_beat_key";
  ALTER TABLE "work_pages_blocks_feature_tabs_tabs" DROP COLUMN "story_beat_key";
  ALTER TABLE "_wp_story_v" DROP COLUMN "story_beat_key";
  ALTER TABLE "__work_pages_v_split_narrow_v" DROP COLUMN "story_beat_key";
  ALTER TABLE "__work_pages_v_full_media_v" DROP COLUMN "story_beat_key";
  ALTER TABLE "__work_pages_v_image_pair_v" DROP COLUMN "story_beat_key";
  ALTER TABLE "__work_pages_v_split_offset_v" DROP COLUMN "story_beat_key";
  ALTER TABLE "_work_pages_v_blocks_feature_heading_offset" DROP COLUMN "story_beat_key";
  ALTER TABLE "_work_pages_v_blocks_feature_statement_grid" DROP COLUMN "story_beat_key";
  ALTER TABLE "__work_pages_v_image_statement_v" DROP COLUMN "story_beat_key";
  ALTER TABLE "_work_pages_v_blocks_feature_tabs_tabs" DROP COLUMN "story_beat_key";`)
}
