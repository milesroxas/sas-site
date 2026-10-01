import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_pages_blocks_feature_statement_grid_source" RENAME TO "enum_pages_stmt_grid_source";
  ALTER TYPE "public"."enum_pages_blocks_feature_statement_grid_theme" RENAME TO "enum_pages_stmt_grid_theme";
  ALTER TYPE "public"."enum__pages_v_blocks_feature_statement_grid_source" RENAME TO "enum___pages_v_stmt_grid_v_source";
  ALTER TYPE "public"."enum__pages_v_blocks_feature_statement_grid_theme" RENAME TO "enum___pages_v_stmt_grid_v_theme";
  ALTER TYPE "public"."enum_work_pages_blocks_feature_statement_grid_source" RENAME TO "enum_work_pages_stmt_grid_source";
  ALTER TYPE "public"."enum_work_pages_blocks_feature_statement_grid_story_scope" RENAME TO "enum_work_pages_stmt_grid_story_scope";
  ALTER TYPE "public"."enum_work_pages_blocks_feature_statement_grid_theme" RENAME TO "enum_work_pages_stmt_grid_theme";
  ALTER TYPE "public"."enum__work_pages_v_blocks_feature_statement_grid_source" RENAME TO "enum___work_pages_v_stmt_grid_v_source";
  ALTER TYPE "public"."enum__work_pages_v_blocks_feature_statement_grid_story_scope" RENAME TO "enum___work_pages_v_stmt_grid_v_story_scope";
  ALTER TYPE "public"."enum__work_pages_v_blocks_feature_statement_grid_theme" RENAME TO "enum___work_pages_v_stmt_grid_v_theme";
  ALTER TYPE "public"."enum_lab_pages_blocks_feature_statement_grid_source" RENAME TO "enum_lab_pages_stmt_grid_source";
  ALTER TYPE "public"."enum_lab_pages_blocks_feature_statement_grid_story_scope" RENAME TO "enum_lab_pages_stmt_grid_story_scope";
  ALTER TYPE "public"."enum_lab_pages_blocks_feature_statement_grid_theme" RENAME TO "enum_lab_pages_stmt_grid_theme";
  ALTER TYPE "public"."enum__lab_pages_v_blocks_feature_statement_grid_source" RENAME TO "enum___lab_pages_v_stmt_grid_v_source";
  ALTER TYPE "public"."enum__lab_pages_v_blocks_feature_statement_grid_story_scope" RENAME TO "enum___lab_pages_v_stmt_grid_v_story_scope";
  ALTER TYPE "public"."enum__lab_pages_v_blocks_feature_statement_grid_theme" RENAME TO "enum___lab_pages_v_stmt_grid_v_theme";
  ALTER TYPE "public"."enum_expertise_pages_blocks_feature_statement_grid_source" RENAME TO "enum_expertise_pages_stmt_grid_source";
  ALTER TYPE "public"."enum_expertise_pages_blocks_feature_statement_grid_theme" RENAME TO "enum_expertise_pages_stmt_grid_theme";
  ALTER TYPE "public"."enum__expertise_pages_v_blocks_feature_statement_grid_source" RENAME TO "enum___expertise_pages_v_stmt_grid_v_source";
  ALTER TYPE "public"."enum__expertise_pages_v_blocks_feature_statement_grid_theme" RENAME TO "enum___expertise_pages_v_stmt_grid_v_theme";
  ALTER TYPE "public"."enum_audience_pages_blocks_feature_statement_grid_source" RENAME TO "enum_audience_pages_stmt_grid_source";
  ALTER TYPE "public"."enum_audience_pages_blocks_feature_statement_grid_theme" RENAME TO "enum_audience_pages_stmt_grid_theme";
  ALTER TYPE "public"."enum__audience_pages_v_blocks_feature_statement_grid_source" RENAME TO "enum___audience_pages_v_stmt_grid_v_source";
  ALTER TYPE "public"."enum__audience_pages_v_blocks_feature_statement_grid_theme" RENAME TO "enum___audience_pages_v_stmt_grid_v_theme";
  ALTER TYPE "public"."enum_home_blocks_feature_statement_grid_source" RENAME TO "enum_home_stmt_grid_source";
  ALTER TYPE "public"."enum_home_blocks_feature_statement_grid_theme" RENAME TO "enum_home_stmt_grid_theme";
  ALTER TYPE "public"."enum__home_v_blocks_feature_statement_grid_source" RENAME TO "enum___home_v_stmt_grid_v_source";
  ALTER TYPE "public"."enum__home_v_blocks_feature_statement_grid_theme" RENAME TO "enum___home_v_stmt_grid_v_theme";
  ALTER TABLE "pages_blocks_feature_statement_grid_cards" RENAME TO "pages_stmt_grid_cards";
  ALTER TABLE "pages_blocks_feature_statement_grid" RENAME TO "pages_stmt_grid";
  ALTER TABLE "_pages_v_blocks_feature_statement_grid_cards" RENAME TO "__pages_v_stmt_grid_v_cards";
  ALTER TABLE "_pages_v_blocks_feature_statement_grid" RENAME TO "__pages_v_stmt_grid_v";
  ALTER TABLE "work_pages_blocks_feature_statement_grid_cards" RENAME TO "work_pages_stmt_grid_cards";
  ALTER TABLE "work_pages_blocks_feature_statement_grid" RENAME TO "work_pages_stmt_grid";
  ALTER TABLE "_work_pages_v_blocks_feature_statement_grid_cards" RENAME TO "__work_pages_v_stmt_grid_v_cards";
  ALTER TABLE "_work_pages_v_blocks_feature_statement_grid" RENAME TO "__work_pages_v_stmt_grid_v";
  ALTER TABLE "lab_pages_blocks_feature_statement_grid_cards" RENAME TO "lab_pages_stmt_grid_cards";
  ALTER TABLE "lab_pages_blocks_feature_statement_grid" RENAME TO "lab_pages_stmt_grid";
  ALTER TABLE "_lab_pages_v_blocks_feature_statement_grid_cards" RENAME TO "__lab_pages_v_stmt_grid_v_cards";
  ALTER TABLE "_lab_pages_v_blocks_feature_statement_grid" RENAME TO "__lab_pages_v_stmt_grid_v";
  ALTER TABLE "expertise_pages_blocks_feature_statement_grid_cards" RENAME TO "expertise_pages_stmt_grid_cards";
  ALTER TABLE "expertise_pages_blocks_feature_statement_grid" RENAME TO "expertise_pages_stmt_grid";
  ALTER TABLE "_expertise_pages_v_blocks_feature_statement_grid_cards" RENAME TO "__expertise_pages_v_stmt_grid_v_cards";
  ALTER TABLE "_expertise_pages_v_blocks_feature_statement_grid" RENAME TO "__expertise_pages_v_stmt_grid_v";
  ALTER TABLE "audience_pages_blocks_feature_statement_grid_cards" RENAME TO "audience_pages_stmt_grid_cards";
  ALTER TABLE "audience_pages_blocks_feature_statement_grid" RENAME TO "audience_pages_stmt_grid";
  ALTER TABLE "_audience_pages_v_blocks_feature_statement_grid_cards" RENAME TO "__audience_pages_v_stmt_grid_v_cards";
  ALTER TABLE "_audience_pages_v_blocks_feature_statement_grid" RENAME TO "__audience_pages_v_stmt_grid_v";
  ALTER TABLE "case_studies_context_story_beats" RENAME TO "case_studies_context_beats";
  ALTER TABLE "case_studies_challenge_story_beats" RENAME TO "case_studies_challenge_beats";
  ALTER TABLE "case_studies_strategy_story_beats" RENAME TO "case_studies_strategy_beats";
  ALTER TABLE "case_studies_approach_story_beats" RENAME TO "case_studies_approach_beats";
  ALTER TABLE "case_studies_outcome_summary_story_beats" RENAME TO "case_studies_outcome_summary_beats";
  ALTER TABLE "case_studies_learnings_story_beats" RENAME TO "case_studies_learnings_beats";
  ALTER TABLE "_case_studies_v_version_context_story_beats" RENAME TO "__case_studies_v_version_context_beats_v";
  ALTER TABLE "_case_studies_v_version_challenge_story_beats" RENAME TO "__case_studies_v_version_challenge_beats_v";
  ALTER TABLE "_case_studies_v_version_strategy_story_beats" RENAME TO "__case_studies_v_version_strategy_beats_v";
  ALTER TABLE "_case_studies_v_version_approach_story_beats" RENAME TO "__case_studies_v_version_approach_beats_v";
  ALTER TABLE "_case_studies_v_version_outcome_summary_story_beats" RENAME TO "__case_studies_v_version_outcome_summary_beats_v";
  ALTER TABLE "_case_studies_v_version_learnings_story_beats" RENAME TO "__case_studies_v_version_learnings_beats_v";
  ALTER TABLE "lab_projects_context_story_beats" RENAME TO "lab_projects_context_beats";
  ALTER TABLE "lab_projects_challenge_story_beats" RENAME TO "lab_projects_challenge_beats";
  ALTER TABLE "lab_projects_strategy_story_beats" RENAME TO "lab_projects_strategy_beats";
  ALTER TABLE "lab_projects_approach_story_beats" RENAME TO "lab_projects_approach_beats";
  ALTER TABLE "lab_projects_outcome_summary_story_beats" RENAME TO "lab_projects_outcome_summary_beats";
  ALTER TABLE "lab_projects_learnings_story_beats" RENAME TO "lab_projects_learnings_beats";
  ALTER TABLE "_lab_projects_v_version_context_story_beats" RENAME TO "__lab_projects_v_version_context_beats_v";
  ALTER TABLE "_lab_projects_v_version_challenge_story_beats" RENAME TO "__lab_projects_v_version_challenge_beats_v";
  ALTER TABLE "_lab_projects_v_version_strategy_story_beats" RENAME TO "__lab_projects_v_version_strategy_beats_v";
  ALTER TABLE "_lab_projects_v_version_approach_story_beats" RENAME TO "__lab_projects_v_version_approach_beats_v";
  ALTER TABLE "_lab_projects_v_version_outcome_summary_story_beats" RENAME TO "__lab_projects_v_version_outcome_summary_beats_v";
  ALTER TABLE "_lab_projects_v_version_learnings_story_beats" RENAME TO "__lab_projects_v_version_learnings_beats_v";
  ALTER TABLE "home_blocks_feature_statement_grid_cards" RENAME TO "home_stmt_grid_cards";
  ALTER TABLE "home_blocks_feature_statement_grid" RENAME TO "home_stmt_grid";
  ALTER TABLE "_home_v_blocks_feature_statement_grid_cards" RENAME TO "__home_v_stmt_grid_v_cards";
  ALTER TABLE "_home_v_blocks_feature_statement_grid" RENAME TO "__home_v_stmt_grid_v";
  ALTER TABLE "pages_stmt_grid_cards" DROP CONSTRAINT "pages_blocks_feature_statement_grid_cards_media_id_media_id_fk";
  
  ALTER TABLE "pages_stmt_grid_cards" DROP CONSTRAINT "pages_blocks_feature_statement_grid_cards_parent_id_fk";
  
  ALTER TABLE "pages_stmt_grid" DROP CONSTRAINT "pages_blocks_feature_statement_grid_parent_id_fk";
  
  ALTER TABLE "__pages_v_stmt_grid_v_cards" DROP CONSTRAINT "_pages_v_blocks_feature_statement_grid_cards_media_id_media_id_fk";
  
  ALTER TABLE "__pages_v_stmt_grid_v_cards" DROP CONSTRAINT "_pages_v_blocks_feature_statement_grid_cards_parent_id_fk";
  
  ALTER TABLE "__pages_v_stmt_grid_v" DROP CONSTRAINT "_pages_v_blocks_feature_statement_grid_parent_id_fk";
  
  ALTER TABLE "work_pages_stmt_grid_cards" DROP CONSTRAINT "work_pages_blocks_feature_statement_grid_cards_media_id_media_id_fk";
  
  ALTER TABLE "work_pages_stmt_grid_cards" DROP CONSTRAINT "work_pages_blocks_feature_statement_grid_cards_parent_id_fk";
  
  ALTER TABLE "work_pages_stmt_grid" DROP CONSTRAINT "work_pages_blocks_feature_statement_grid_parent_id_fk";
  
  ALTER TABLE "__work_pages_v_stmt_grid_v_cards" DROP CONSTRAINT "_work_pages_v_blocks_feature_statement_grid_cards_media_id_media_id_fk";
  
  ALTER TABLE "__work_pages_v_stmt_grid_v_cards" DROP CONSTRAINT "_work_pages_v_blocks_feature_statement_grid_cards_parent_id_fk";
  
  ALTER TABLE "__work_pages_v_stmt_grid_v" DROP CONSTRAINT "_work_pages_v_blocks_feature_statement_grid_parent_id_fk";
  
  ALTER TABLE "lab_pages_stmt_grid_cards" DROP CONSTRAINT "lab_pages_blocks_feature_statement_grid_cards_media_id_media_id_fk";
  
  ALTER TABLE "lab_pages_stmt_grid_cards" DROP CONSTRAINT "lab_pages_blocks_feature_statement_grid_cards_parent_id_fk";
  
  ALTER TABLE "lab_pages_stmt_grid" DROP CONSTRAINT "lab_pages_blocks_feature_statement_grid_parent_id_fk";
  
  ALTER TABLE "__lab_pages_v_stmt_grid_v_cards" DROP CONSTRAINT "_lab_pages_v_blocks_feature_statement_grid_cards_media_id_media_id_fk";
  
  ALTER TABLE "__lab_pages_v_stmt_grid_v_cards" DROP CONSTRAINT "_lab_pages_v_blocks_feature_statement_grid_cards_parent_id_fk";
  
  ALTER TABLE "__lab_pages_v_stmt_grid_v" DROP CONSTRAINT "_lab_pages_v_blocks_feature_statement_grid_parent_id_fk";
  
  ALTER TABLE "expertise_pages_stmt_grid_cards" DROP CONSTRAINT "expertise_pages_blocks_feature_statement_grid_cards_media_id_media_id_fk";
  
  ALTER TABLE "expertise_pages_stmt_grid_cards" DROP CONSTRAINT "expertise_pages_blocks_feature_statement_grid_cards_parent_id_fk";
  
  ALTER TABLE "expertise_pages_stmt_grid" DROP CONSTRAINT "expertise_pages_blocks_feature_statement_grid_parent_id_fk";
  
  ALTER TABLE "__expertise_pages_v_stmt_grid_v_cards" DROP CONSTRAINT "_expertise_pages_v_blocks_feature_statement_grid_cards_media_id_media_id_fk";
  
  ALTER TABLE "__expertise_pages_v_stmt_grid_v_cards" DROP CONSTRAINT "_expertise_pages_v_blocks_feature_statement_grid_cards_parent_id_fk";
  
  ALTER TABLE "__expertise_pages_v_stmt_grid_v" DROP CONSTRAINT "_expertise_pages_v_blocks_feature_statement_grid_parent_id_fk";
  
  ALTER TABLE "audience_pages_stmt_grid_cards" DROP CONSTRAINT "audience_pages_blocks_feature_statement_grid_cards_media_id_media_id_fk";
  
  ALTER TABLE "audience_pages_stmt_grid_cards" DROP CONSTRAINT "audience_pages_blocks_feature_statement_grid_cards_parent_id_fk";
  
  ALTER TABLE "audience_pages_stmt_grid" DROP CONSTRAINT "audience_pages_blocks_feature_statement_grid_parent_id_fk";
  
  ALTER TABLE "__audience_pages_v_stmt_grid_v_cards" DROP CONSTRAINT "_audience_pages_v_blocks_feature_statement_grid_cards_media_id_media_id_fk";
  
  ALTER TABLE "__audience_pages_v_stmt_grid_v_cards" DROP CONSTRAINT "_audience_pages_v_blocks_feature_statement_grid_cards_parent_id_fk";
  
  ALTER TABLE "__audience_pages_v_stmt_grid_v" DROP CONSTRAINT "_audience_pages_v_blocks_feature_statement_grid_parent_id_fk";
  
  ALTER TABLE "case_studies_context_beats" DROP CONSTRAINT "case_studies_context_story_beats_parent_id_fk";
  
  ALTER TABLE "case_studies_challenge_beats" DROP CONSTRAINT "case_studies_challenge_story_beats_parent_id_fk";
  
  ALTER TABLE "case_studies_strategy_beats" DROP CONSTRAINT "case_studies_strategy_story_beats_parent_id_fk";
  
  ALTER TABLE "case_studies_approach_beats" DROP CONSTRAINT "case_studies_approach_story_beats_parent_id_fk";
  
  ALTER TABLE "case_studies_outcome_summary_beats" DROP CONSTRAINT "case_studies_outcome_summary_story_beats_parent_id_fk";
  
  ALTER TABLE "case_studies_learnings_beats" DROP CONSTRAINT "case_studies_learnings_story_beats_parent_id_fk";
  
  ALTER TABLE "__case_studies_v_version_context_beats_v" DROP CONSTRAINT "_case_studies_v_version_context_story_beats_parent_id_fk";
  
  ALTER TABLE "__case_studies_v_version_challenge_beats_v" DROP CONSTRAINT "_case_studies_v_version_challenge_story_beats_parent_id_fk";
  
  ALTER TABLE "__case_studies_v_version_strategy_beats_v" DROP CONSTRAINT "_case_studies_v_version_strategy_story_beats_parent_id_fk";
  
  ALTER TABLE "__case_studies_v_version_approach_beats_v" DROP CONSTRAINT "_case_studies_v_version_approach_story_beats_parent_id_fk";
  
  ALTER TABLE "__case_studies_v_version_outcome_summary_beats_v" DROP CONSTRAINT "_case_studies_v_version_outcome_summary_story_beats_parent_id_fk";
  
  ALTER TABLE "__case_studies_v_version_learnings_beats_v" DROP CONSTRAINT "_case_studies_v_version_learnings_story_beats_parent_id_fk";
  
  ALTER TABLE "lab_projects_context_beats" DROP CONSTRAINT "lab_projects_context_story_beats_parent_id_fk";
  
  ALTER TABLE "lab_projects_challenge_beats" DROP CONSTRAINT "lab_projects_challenge_story_beats_parent_id_fk";
  
  ALTER TABLE "lab_projects_strategy_beats" DROP CONSTRAINT "lab_projects_strategy_story_beats_parent_id_fk";
  
  ALTER TABLE "lab_projects_approach_beats" DROP CONSTRAINT "lab_projects_approach_story_beats_parent_id_fk";
  
  ALTER TABLE "lab_projects_outcome_summary_beats" DROP CONSTRAINT "lab_projects_outcome_summary_story_beats_parent_id_fk";
  
  ALTER TABLE "lab_projects_learnings_beats" DROP CONSTRAINT "lab_projects_learnings_story_beats_parent_id_fk";
  
  ALTER TABLE "__lab_projects_v_version_context_beats_v" DROP CONSTRAINT "_lab_projects_v_version_context_story_beats_parent_id_fk";
  
  ALTER TABLE "__lab_projects_v_version_challenge_beats_v" DROP CONSTRAINT "_lab_projects_v_version_challenge_story_beats_parent_id_fk";
  
  ALTER TABLE "__lab_projects_v_version_strategy_beats_v" DROP CONSTRAINT "_lab_projects_v_version_strategy_story_beats_parent_id_fk";
  
  ALTER TABLE "__lab_projects_v_version_approach_beats_v" DROP CONSTRAINT "_lab_projects_v_version_approach_story_beats_parent_id_fk";
  
  ALTER TABLE "__lab_projects_v_version_outcome_summary_beats_v" DROP CONSTRAINT "_lab_projects_v_version_outcome_summary_story_beats_parent_id_fk";
  
  ALTER TABLE "__lab_projects_v_version_learnings_beats_v" DROP CONSTRAINT "_lab_projects_v_version_learnings_story_beats_parent_id_fk";
  
  ALTER TABLE "home_stmt_grid_cards" DROP CONSTRAINT "home_blocks_feature_statement_grid_cards_media_id_media_id_fk";
  
  ALTER TABLE "home_stmt_grid_cards" DROP CONSTRAINT "home_blocks_feature_statement_grid_cards_parent_id_fk";
  
  ALTER TABLE "home_stmt_grid" DROP CONSTRAINT "home_blocks_feature_statement_grid_parent_id_fk";
  
  ALTER TABLE "__home_v_stmt_grid_v_cards" DROP CONSTRAINT "_home_v_blocks_feature_statement_grid_cards_media_id_media_id_fk";
  
  ALTER TABLE "__home_v_stmt_grid_v_cards" DROP CONSTRAINT "_home_v_blocks_feature_statement_grid_cards_parent_id_fk";
  
  ALTER TABLE "__home_v_stmt_grid_v" DROP CONSTRAINT "_home_v_blocks_feature_statement_grid_parent_id_fk";
  
  DROP INDEX "pages_blocks_feature_statement_grid_cards_order_idx";
  DROP INDEX "pages_blocks_feature_statement_grid_cards_parent_id_idx";
  DROP INDEX "pages_blocks_feature_statement_grid_cards_media_idx";
  DROP INDEX "pages_blocks_feature_statement_grid_order_idx";
  DROP INDEX "pages_blocks_feature_statement_grid_parent_id_idx";
  DROP INDEX "pages_blocks_feature_statement_grid_path_idx";
  DROP INDEX "_pages_v_blocks_feature_statement_grid_cards_order_idx";
  DROP INDEX "_pages_v_blocks_feature_statement_grid_cards_parent_id_idx";
  DROP INDEX "_pages_v_blocks_feature_statement_grid_cards_media_idx";
  DROP INDEX "_pages_v_blocks_feature_statement_grid_order_idx";
  DROP INDEX "_pages_v_blocks_feature_statement_grid_parent_id_idx";
  DROP INDEX "_pages_v_blocks_feature_statement_grid_path_idx";
  DROP INDEX "work_pages_blocks_feature_statement_grid_cards_order_idx";
  DROP INDEX "work_pages_blocks_feature_statement_grid_cards_parent_id_idx";
  DROP INDEX "work_pages_blocks_feature_statement_grid_cards_media_idx";
  DROP INDEX "work_pages_blocks_feature_statement_grid_order_idx";
  DROP INDEX "work_pages_blocks_feature_statement_grid_parent_id_idx";
  DROP INDEX "work_pages_blocks_feature_statement_grid_path_idx";
  DROP INDEX "_work_pages_v_blocks_feature_statement_grid_cards_order_idx";
  DROP INDEX "_work_pages_v_blocks_feature_statement_grid_cards_parent_id_idx";
  DROP INDEX "_work_pages_v_blocks_feature_statement_grid_cards_media_idx";
  DROP INDEX "_work_pages_v_blocks_feature_statement_grid_order_idx";
  DROP INDEX "_work_pages_v_blocks_feature_statement_grid_parent_id_idx";
  DROP INDEX "_work_pages_v_blocks_feature_statement_grid_path_idx";
  DROP INDEX "lab_pages_blocks_feature_statement_grid_cards_order_idx";
  DROP INDEX "lab_pages_blocks_feature_statement_grid_cards_parent_id_idx";
  DROP INDEX "lab_pages_blocks_feature_statement_grid_cards_media_idx";
  DROP INDEX "lab_pages_blocks_feature_statement_grid_order_idx";
  DROP INDEX "lab_pages_blocks_feature_statement_grid_parent_id_idx";
  DROP INDEX "lab_pages_blocks_feature_statement_grid_path_idx";
  DROP INDEX "_lab_pages_v_blocks_feature_statement_grid_cards_order_idx";
  DROP INDEX "_lab_pages_v_blocks_feature_statement_grid_cards_parent_id_idx";
  DROP INDEX "_lab_pages_v_blocks_feature_statement_grid_cards_media_idx";
  DROP INDEX "_lab_pages_v_blocks_feature_statement_grid_order_idx";
  DROP INDEX "_lab_pages_v_blocks_feature_statement_grid_parent_id_idx";
  DROP INDEX "_lab_pages_v_blocks_feature_statement_grid_path_idx";
  DROP INDEX "expertise_pages_blocks_feature_statement_grid_cards_order_idx";
  DROP INDEX "expertise_pages_blocks_feature_statement_grid_cards_parent_id_idx";
  DROP INDEX "expertise_pages_blocks_feature_statement_grid_cards_medi_idx";
  DROP INDEX "expertise_pages_blocks_feature_statement_grid_order_idx";
  DROP INDEX "expertise_pages_blocks_feature_statement_grid_parent_id_idx";
  DROP INDEX "expertise_pages_blocks_feature_statement_grid_path_idx";
  DROP INDEX "_expertise_pages_v_blocks_feature_statement_grid_cards_order_idx";
  DROP INDEX "_expertise_pages_v_blocks_feature_statement_grid_cards_parent_id_idx";
  DROP INDEX "_expertise_pages_v_blocks_feature_statement_grid_cards_m_idx";
  DROP INDEX "_expertise_pages_v_blocks_feature_statement_grid_order_idx";
  DROP INDEX "_expertise_pages_v_blocks_feature_statement_grid_parent_id_idx";
  DROP INDEX "_expertise_pages_v_blocks_feature_statement_grid_path_idx";
  DROP INDEX "audience_pages_blocks_feature_statement_grid_cards_order_idx";
  DROP INDEX "audience_pages_blocks_feature_statement_grid_cards_parent_id_idx";
  DROP INDEX "audience_pages_blocks_feature_statement_grid_cards_media_idx";
  DROP INDEX "audience_pages_blocks_feature_statement_grid_order_idx";
  DROP INDEX "audience_pages_blocks_feature_statement_grid_parent_id_idx";
  DROP INDEX "audience_pages_blocks_feature_statement_grid_path_idx";
  DROP INDEX "_audience_pages_v_blocks_feature_statement_grid_cards_order_idx";
  DROP INDEX "_audience_pages_v_blocks_feature_statement_grid_cards_parent_id_idx";
  DROP INDEX "_audience_pages_v_blocks_feature_statement_grid_cards_me_idx";
  DROP INDEX "_audience_pages_v_blocks_feature_statement_grid_order_idx";
  DROP INDEX "_audience_pages_v_blocks_feature_statement_grid_parent_id_idx";
  DROP INDEX "_audience_pages_v_blocks_feature_statement_grid_path_idx";
  DROP INDEX "case_studies_context_story_beats_order_idx";
  DROP INDEX "case_studies_context_story_beats_parent_id_idx";
  DROP INDEX "case_studies_challenge_story_beats_order_idx";
  DROP INDEX "case_studies_challenge_story_beats_parent_id_idx";
  DROP INDEX "case_studies_strategy_story_beats_order_idx";
  DROP INDEX "case_studies_strategy_story_beats_parent_id_idx";
  DROP INDEX "case_studies_approach_story_beats_order_idx";
  DROP INDEX "case_studies_approach_story_beats_parent_id_idx";
  DROP INDEX "case_studies_outcome_summary_story_beats_order_idx";
  DROP INDEX "case_studies_outcome_summary_story_beats_parent_id_idx";
  DROP INDEX "case_studies_learnings_story_beats_order_idx";
  DROP INDEX "case_studies_learnings_story_beats_parent_id_idx";
  DROP INDEX "_case_studies_v_version_context_story_beats_order_idx";
  DROP INDEX "_case_studies_v_version_context_story_beats_parent_id_idx";
  DROP INDEX "_case_studies_v_version_challenge_story_beats_order_idx";
  DROP INDEX "_case_studies_v_version_challenge_story_beats_parent_id_idx";
  DROP INDEX "_case_studies_v_version_strategy_story_beats_order_idx";
  DROP INDEX "_case_studies_v_version_strategy_story_beats_parent_id_idx";
  DROP INDEX "_case_studies_v_version_approach_story_beats_order_idx";
  DROP INDEX "_case_studies_v_version_approach_story_beats_parent_id_idx";
  DROP INDEX "_case_studies_v_version_outcome_summary_story_beats_order_idx";
  DROP INDEX "_case_studies_v_version_outcome_summary_story_beats_parent_id_idx";
  DROP INDEX "_case_studies_v_version_learnings_story_beats_order_idx";
  DROP INDEX "_case_studies_v_version_learnings_story_beats_parent_id_idx";
  DROP INDEX "lab_projects_context_story_beats_order_idx";
  DROP INDEX "lab_projects_context_story_beats_parent_id_idx";
  DROP INDEX "lab_projects_challenge_story_beats_order_idx";
  DROP INDEX "lab_projects_challenge_story_beats_parent_id_idx";
  DROP INDEX "lab_projects_strategy_story_beats_order_idx";
  DROP INDEX "lab_projects_strategy_story_beats_parent_id_idx";
  DROP INDEX "lab_projects_approach_story_beats_order_idx";
  DROP INDEX "lab_projects_approach_story_beats_parent_id_idx";
  DROP INDEX "lab_projects_outcome_summary_story_beats_order_idx";
  DROP INDEX "lab_projects_outcome_summary_story_beats_parent_id_idx";
  DROP INDEX "lab_projects_learnings_story_beats_order_idx";
  DROP INDEX "lab_projects_learnings_story_beats_parent_id_idx";
  DROP INDEX "_lab_projects_v_version_context_story_beats_order_idx";
  DROP INDEX "_lab_projects_v_version_context_story_beats_parent_id_idx";
  DROP INDEX "_lab_projects_v_version_challenge_story_beats_order_idx";
  DROP INDEX "_lab_projects_v_version_challenge_story_beats_parent_id_idx";
  DROP INDEX "_lab_projects_v_version_strategy_story_beats_order_idx";
  DROP INDEX "_lab_projects_v_version_strategy_story_beats_parent_id_idx";
  DROP INDEX "_lab_projects_v_version_approach_story_beats_order_idx";
  DROP INDEX "_lab_projects_v_version_approach_story_beats_parent_id_idx";
  DROP INDEX "_lab_projects_v_version_outcome_summary_story_beats_order_idx";
  DROP INDEX "_lab_projects_v_version_outcome_summary_story_beats_parent_id_idx";
  DROP INDEX "_lab_projects_v_version_learnings_story_beats_order_idx";
  DROP INDEX "_lab_projects_v_version_learnings_story_beats_parent_id_idx";
  DROP INDEX "home_blocks_feature_statement_grid_cards_order_idx";
  DROP INDEX "home_blocks_feature_statement_grid_cards_parent_id_idx";
  DROP INDEX "home_blocks_feature_statement_grid_cards_media_idx";
  DROP INDEX "home_blocks_feature_statement_grid_order_idx";
  DROP INDEX "home_blocks_feature_statement_grid_parent_id_idx";
  DROP INDEX "home_blocks_feature_statement_grid_path_idx";
  DROP INDEX "_home_v_blocks_feature_statement_grid_cards_order_idx";
  DROP INDEX "_home_v_blocks_feature_statement_grid_cards_parent_id_idx";
  DROP INDEX "_home_v_blocks_feature_statement_grid_cards_media_idx";
  DROP INDEX "_home_v_blocks_feature_statement_grid_order_idx";
  DROP INDEX "_home_v_blocks_feature_statement_grid_parent_id_idx";
  DROP INDEX "_home_v_blocks_feature_statement_grid_path_idx";
  ALTER TABLE "pages_stmt_grid_cards" ADD CONSTRAINT "pages_stmt_grid_cards_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_stmt_grid_cards" ADD CONSTRAINT "pages_stmt_grid_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_stmt_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_stmt_grid" ADD CONSTRAINT "pages_stmt_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__pages_v_stmt_grid_v_cards" ADD CONSTRAINT "__pages_v_stmt_grid_v_cards_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__pages_v_stmt_grid_v_cards" ADD CONSTRAINT "__pages_v_stmt_grid_v_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."__pages_v_stmt_grid_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__pages_v_stmt_grid_v" ADD CONSTRAINT "__pages_v_stmt_grid_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "work_pages_stmt_grid_cards" ADD CONSTRAINT "work_pages_stmt_grid_cards_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "work_pages_stmt_grid_cards" ADD CONSTRAINT "work_pages_stmt_grid_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."work_pages_stmt_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "work_pages_stmt_grid" ADD CONSTRAINT "work_pages_stmt_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."work_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__work_pages_v_stmt_grid_v_cards" ADD CONSTRAINT "__work_pages_v_stmt_grid_v_cards_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__work_pages_v_stmt_grid_v_cards" ADD CONSTRAINT "__work_pages_v_stmt_grid_v_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."__work_pages_v_stmt_grid_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__work_pages_v_stmt_grid_v" ADD CONSTRAINT "__work_pages_v_stmt_grid_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_work_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lab_pages_stmt_grid_cards" ADD CONSTRAINT "lab_pages_stmt_grid_cards_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "lab_pages_stmt_grid_cards" ADD CONSTRAINT "lab_pages_stmt_grid_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lab_pages_stmt_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lab_pages_stmt_grid" ADD CONSTRAINT "lab_pages_stmt_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lab_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__lab_pages_v_stmt_grid_v_cards" ADD CONSTRAINT "__lab_pages_v_stmt_grid_v_cards_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__lab_pages_v_stmt_grid_v_cards" ADD CONSTRAINT "__lab_pages_v_stmt_grid_v_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."__lab_pages_v_stmt_grid_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__lab_pages_v_stmt_grid_v" ADD CONSTRAINT "__lab_pages_v_stmt_grid_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_lab_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "expertise_pages_stmt_grid_cards" ADD CONSTRAINT "expertise_pages_stmt_grid_cards_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "expertise_pages_stmt_grid_cards" ADD CONSTRAINT "expertise_pages_stmt_grid_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."expertise_pages_stmt_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "expertise_pages_stmt_grid" ADD CONSTRAINT "expertise_pages_stmt_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."expertise_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__expertise_pages_v_stmt_grid_v_cards" ADD CONSTRAINT "__expertise_pages_v_stmt_grid_v_cards_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__expertise_pages_v_stmt_grid_v_cards" ADD CONSTRAINT "__expertise_pages_v_stmt_grid_v_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."__expertise_pages_v_stmt_grid_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__expertise_pages_v_stmt_grid_v" ADD CONSTRAINT "__expertise_pages_v_stmt_grid_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_expertise_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "audience_pages_stmt_grid_cards" ADD CONSTRAINT "audience_pages_stmt_grid_cards_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "audience_pages_stmt_grid_cards" ADD CONSTRAINT "audience_pages_stmt_grid_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."audience_pages_stmt_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "audience_pages_stmt_grid" ADD CONSTRAINT "audience_pages_stmt_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."audience_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__audience_pages_v_stmt_grid_v_cards" ADD CONSTRAINT "__audience_pages_v_stmt_grid_v_cards_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__audience_pages_v_stmt_grid_v_cards" ADD CONSTRAINT "__audience_pages_v_stmt_grid_v_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."__audience_pages_v_stmt_grid_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__audience_pages_v_stmt_grid_v" ADD CONSTRAINT "__audience_pages_v_stmt_grid_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_audience_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "case_studies_context_beats" ADD CONSTRAINT "case_studies_context_beats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."case_studies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "case_studies_challenge_beats" ADD CONSTRAINT "case_studies_challenge_beats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."case_studies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "case_studies_strategy_beats" ADD CONSTRAINT "case_studies_strategy_beats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."case_studies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "case_studies_approach_beats" ADD CONSTRAINT "case_studies_approach_beats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."case_studies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "case_studies_outcome_summary_beats" ADD CONSTRAINT "case_studies_outcome_summary_beats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."case_studies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "case_studies_learnings_beats" ADD CONSTRAINT "case_studies_learnings_beats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."case_studies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__case_studies_v_version_context_beats_v" ADD CONSTRAINT "__case_studies_v_version_context_beats_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_case_studies_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__case_studies_v_version_challenge_beats_v" ADD CONSTRAINT "__case_studies_v_version_challenge_beats_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_case_studies_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__case_studies_v_version_strategy_beats_v" ADD CONSTRAINT "__case_studies_v_version_strategy_beats_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_case_studies_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__case_studies_v_version_approach_beats_v" ADD CONSTRAINT "__case_studies_v_version_approach_beats_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_case_studies_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__case_studies_v_version_outcome_summary_beats_v" ADD CONSTRAINT "__case_studies_v_version_outcome_summary_beats_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_case_studies_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__case_studies_v_version_learnings_beats_v" ADD CONSTRAINT "__case_studies_v_version_learnings_beats_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_case_studies_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lab_projects_context_beats" ADD CONSTRAINT "lab_projects_context_beats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lab_projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lab_projects_challenge_beats" ADD CONSTRAINT "lab_projects_challenge_beats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lab_projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lab_projects_strategy_beats" ADD CONSTRAINT "lab_projects_strategy_beats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lab_projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lab_projects_approach_beats" ADD CONSTRAINT "lab_projects_approach_beats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lab_projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lab_projects_outcome_summary_beats" ADD CONSTRAINT "lab_projects_outcome_summary_beats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lab_projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lab_projects_learnings_beats" ADD CONSTRAINT "lab_projects_learnings_beats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lab_projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__lab_projects_v_version_context_beats_v" ADD CONSTRAINT "__lab_projects_v_version_context_beats_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_lab_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__lab_projects_v_version_challenge_beats_v" ADD CONSTRAINT "__lab_projects_v_version_challenge_beats_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_lab_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__lab_projects_v_version_strategy_beats_v" ADD CONSTRAINT "__lab_projects_v_version_strategy_beats_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_lab_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__lab_projects_v_version_approach_beats_v" ADD CONSTRAINT "__lab_projects_v_version_approach_beats_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_lab_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__lab_projects_v_version_outcome_summary_beats_v" ADD CONSTRAINT "__lab_projects_v_version_outcome_summary_beats_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_lab_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__lab_projects_v_version_learnings_beats_v" ADD CONSTRAINT "__lab_projects_v_version_learnings_beats_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_lab_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_stmt_grid_cards" ADD CONSTRAINT "home_stmt_grid_cards_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_stmt_grid_cards" ADD CONSTRAINT "home_stmt_grid_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_stmt_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_stmt_grid" ADD CONSTRAINT "home_stmt_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__home_v_stmt_grid_v_cards" ADD CONSTRAINT "__home_v_stmt_grid_v_cards_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__home_v_stmt_grid_v_cards" ADD CONSTRAINT "__home_v_stmt_grid_v_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."__home_v_stmt_grid_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__home_v_stmt_grid_v" ADD CONSTRAINT "__home_v_stmt_grid_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_stmt_grid_cards_order_idx" ON "pages_stmt_grid_cards" USING btree ("_order");
  CREATE INDEX "pages_stmt_grid_cards_parent_id_idx" ON "pages_stmt_grid_cards" USING btree ("_parent_id");
  CREATE INDEX "pages_stmt_grid_cards_media_idx" ON "pages_stmt_grid_cards" USING btree ("media_id");
  CREATE INDEX "pages_stmt_grid_order_idx" ON "pages_stmt_grid" USING btree ("_order");
  CREATE INDEX "pages_stmt_grid_parent_id_idx" ON "pages_stmt_grid" USING btree ("_parent_id");
  CREATE INDEX "pages_stmt_grid_path_idx" ON "pages_stmt_grid" USING btree ("_path");
  CREATE INDEX "__pages_v_stmt_grid_v_cards_order_idx" ON "__pages_v_stmt_grid_v_cards" USING btree ("_order");
  CREATE INDEX "__pages_v_stmt_grid_v_cards_parent_id_idx" ON "__pages_v_stmt_grid_v_cards" USING btree ("_parent_id");
  CREATE INDEX "__pages_v_stmt_grid_v_cards_media_idx" ON "__pages_v_stmt_grid_v_cards" USING btree ("media_id");
  CREATE INDEX "__pages_v_stmt_grid_v_order_idx" ON "__pages_v_stmt_grid_v" USING btree ("_order");
  CREATE INDEX "__pages_v_stmt_grid_v_parent_id_idx" ON "__pages_v_stmt_grid_v" USING btree ("_parent_id");
  CREATE INDEX "__pages_v_stmt_grid_v_path_idx" ON "__pages_v_stmt_grid_v" USING btree ("_path");
  CREATE INDEX "work_pages_stmt_grid_cards_order_idx" ON "work_pages_stmt_grid_cards" USING btree ("_order");
  CREATE INDEX "work_pages_stmt_grid_cards_parent_id_idx" ON "work_pages_stmt_grid_cards" USING btree ("_parent_id");
  CREATE INDEX "work_pages_stmt_grid_cards_media_idx" ON "work_pages_stmt_grid_cards" USING btree ("media_id");
  CREATE INDEX "work_pages_stmt_grid_order_idx" ON "work_pages_stmt_grid" USING btree ("_order");
  CREATE INDEX "work_pages_stmt_grid_parent_id_idx" ON "work_pages_stmt_grid" USING btree ("_parent_id");
  CREATE INDEX "work_pages_stmt_grid_path_idx" ON "work_pages_stmt_grid" USING btree ("_path");
  CREATE INDEX "__work_pages_v_stmt_grid_v_cards_order_idx" ON "__work_pages_v_stmt_grid_v_cards" USING btree ("_order");
  CREATE INDEX "__work_pages_v_stmt_grid_v_cards_parent_id_idx" ON "__work_pages_v_stmt_grid_v_cards" USING btree ("_parent_id");
  CREATE INDEX "__work_pages_v_stmt_grid_v_cards_media_idx" ON "__work_pages_v_stmt_grid_v_cards" USING btree ("media_id");
  CREATE INDEX "__work_pages_v_stmt_grid_v_order_idx" ON "__work_pages_v_stmt_grid_v" USING btree ("_order");
  CREATE INDEX "__work_pages_v_stmt_grid_v_parent_id_idx" ON "__work_pages_v_stmt_grid_v" USING btree ("_parent_id");
  CREATE INDEX "__work_pages_v_stmt_grid_v_path_idx" ON "__work_pages_v_stmt_grid_v" USING btree ("_path");
  CREATE INDEX "lab_pages_stmt_grid_cards_order_idx" ON "lab_pages_stmt_grid_cards" USING btree ("_order");
  CREATE INDEX "lab_pages_stmt_grid_cards_parent_id_idx" ON "lab_pages_stmt_grid_cards" USING btree ("_parent_id");
  CREATE INDEX "lab_pages_stmt_grid_cards_media_idx" ON "lab_pages_stmt_grid_cards" USING btree ("media_id");
  CREATE INDEX "lab_pages_stmt_grid_order_idx" ON "lab_pages_stmt_grid" USING btree ("_order");
  CREATE INDEX "lab_pages_stmt_grid_parent_id_idx" ON "lab_pages_stmt_grid" USING btree ("_parent_id");
  CREATE INDEX "lab_pages_stmt_grid_path_idx" ON "lab_pages_stmt_grid" USING btree ("_path");
  CREATE INDEX "__lab_pages_v_stmt_grid_v_cards_order_idx" ON "__lab_pages_v_stmt_grid_v_cards" USING btree ("_order");
  CREATE INDEX "__lab_pages_v_stmt_grid_v_cards_parent_id_idx" ON "__lab_pages_v_stmt_grid_v_cards" USING btree ("_parent_id");
  CREATE INDEX "__lab_pages_v_stmt_grid_v_cards_media_idx" ON "__lab_pages_v_stmt_grid_v_cards" USING btree ("media_id");
  CREATE INDEX "__lab_pages_v_stmt_grid_v_order_idx" ON "__lab_pages_v_stmt_grid_v" USING btree ("_order");
  CREATE INDEX "__lab_pages_v_stmt_grid_v_parent_id_idx" ON "__lab_pages_v_stmt_grid_v" USING btree ("_parent_id");
  CREATE INDEX "__lab_pages_v_stmt_grid_v_path_idx" ON "__lab_pages_v_stmt_grid_v" USING btree ("_path");
  CREATE INDEX "expertise_pages_stmt_grid_cards_order_idx" ON "expertise_pages_stmt_grid_cards" USING btree ("_order");
  CREATE INDEX "expertise_pages_stmt_grid_cards_parent_id_idx" ON "expertise_pages_stmt_grid_cards" USING btree ("_parent_id");
  CREATE INDEX "expertise_pages_stmt_grid_cards_media_idx" ON "expertise_pages_stmt_grid_cards" USING btree ("media_id");
  CREATE INDEX "expertise_pages_stmt_grid_order_idx" ON "expertise_pages_stmt_grid" USING btree ("_order");
  CREATE INDEX "expertise_pages_stmt_grid_parent_id_idx" ON "expertise_pages_stmt_grid" USING btree ("_parent_id");
  CREATE INDEX "expertise_pages_stmt_grid_path_idx" ON "expertise_pages_stmt_grid" USING btree ("_path");
  CREATE INDEX "__expertise_pages_v_stmt_grid_v_cards_order_idx" ON "__expertise_pages_v_stmt_grid_v_cards" USING btree ("_order");
  CREATE INDEX "__expertise_pages_v_stmt_grid_v_cards_parent_id_idx" ON "__expertise_pages_v_stmt_grid_v_cards" USING btree ("_parent_id");
  CREATE INDEX "__expertise_pages_v_stmt_grid_v_cards_media_idx" ON "__expertise_pages_v_stmt_grid_v_cards" USING btree ("media_id");
  CREATE INDEX "__expertise_pages_v_stmt_grid_v_order_idx" ON "__expertise_pages_v_stmt_grid_v" USING btree ("_order");
  CREATE INDEX "__expertise_pages_v_stmt_grid_v_parent_id_idx" ON "__expertise_pages_v_stmt_grid_v" USING btree ("_parent_id");
  CREATE INDEX "__expertise_pages_v_stmt_grid_v_path_idx" ON "__expertise_pages_v_stmt_grid_v" USING btree ("_path");
  CREATE INDEX "audience_pages_stmt_grid_cards_order_idx" ON "audience_pages_stmt_grid_cards" USING btree ("_order");
  CREATE INDEX "audience_pages_stmt_grid_cards_parent_id_idx" ON "audience_pages_stmt_grid_cards" USING btree ("_parent_id");
  CREATE INDEX "audience_pages_stmt_grid_cards_media_idx" ON "audience_pages_stmt_grid_cards" USING btree ("media_id");
  CREATE INDEX "audience_pages_stmt_grid_order_idx" ON "audience_pages_stmt_grid" USING btree ("_order");
  CREATE INDEX "audience_pages_stmt_grid_parent_id_idx" ON "audience_pages_stmt_grid" USING btree ("_parent_id");
  CREATE INDEX "audience_pages_stmt_grid_path_idx" ON "audience_pages_stmt_grid" USING btree ("_path");
  CREATE INDEX "__audience_pages_v_stmt_grid_v_cards_order_idx" ON "__audience_pages_v_stmt_grid_v_cards" USING btree ("_order");
  CREATE INDEX "__audience_pages_v_stmt_grid_v_cards_parent_id_idx" ON "__audience_pages_v_stmt_grid_v_cards" USING btree ("_parent_id");
  CREATE INDEX "__audience_pages_v_stmt_grid_v_cards_media_idx" ON "__audience_pages_v_stmt_grid_v_cards" USING btree ("media_id");
  CREATE INDEX "__audience_pages_v_stmt_grid_v_order_idx" ON "__audience_pages_v_stmt_grid_v" USING btree ("_order");
  CREATE INDEX "__audience_pages_v_stmt_grid_v_parent_id_idx" ON "__audience_pages_v_stmt_grid_v" USING btree ("_parent_id");
  CREATE INDEX "__audience_pages_v_stmt_grid_v_path_idx" ON "__audience_pages_v_stmt_grid_v" USING btree ("_path");
  CREATE INDEX "case_studies_context_beats_order_idx" ON "case_studies_context_beats" USING btree ("_order");
  CREATE INDEX "case_studies_context_beats_parent_id_idx" ON "case_studies_context_beats" USING btree ("_parent_id");
  CREATE INDEX "case_studies_challenge_beats_order_idx" ON "case_studies_challenge_beats" USING btree ("_order");
  CREATE INDEX "case_studies_challenge_beats_parent_id_idx" ON "case_studies_challenge_beats" USING btree ("_parent_id");
  CREATE INDEX "case_studies_strategy_beats_order_idx" ON "case_studies_strategy_beats" USING btree ("_order");
  CREATE INDEX "case_studies_strategy_beats_parent_id_idx" ON "case_studies_strategy_beats" USING btree ("_parent_id");
  CREATE INDEX "case_studies_approach_beats_order_idx" ON "case_studies_approach_beats" USING btree ("_order");
  CREATE INDEX "case_studies_approach_beats_parent_id_idx" ON "case_studies_approach_beats" USING btree ("_parent_id");
  CREATE INDEX "case_studies_outcome_summary_beats_order_idx" ON "case_studies_outcome_summary_beats" USING btree ("_order");
  CREATE INDEX "case_studies_outcome_summary_beats_parent_id_idx" ON "case_studies_outcome_summary_beats" USING btree ("_parent_id");
  CREATE INDEX "case_studies_learnings_beats_order_idx" ON "case_studies_learnings_beats" USING btree ("_order");
  CREATE INDEX "case_studies_learnings_beats_parent_id_idx" ON "case_studies_learnings_beats" USING btree ("_parent_id");
  CREATE INDEX "__case_studies_v_version_context_beats_v_order_idx" ON "__case_studies_v_version_context_beats_v" USING btree ("_order");
  CREATE INDEX "__case_studies_v_version_context_beats_v_parent_id_idx" ON "__case_studies_v_version_context_beats_v" USING btree ("_parent_id");
  CREATE INDEX "__case_studies_v_version_challenge_beats_v_order_idx" ON "__case_studies_v_version_challenge_beats_v" USING btree ("_order");
  CREATE INDEX "__case_studies_v_version_challenge_beats_v_parent_id_idx" ON "__case_studies_v_version_challenge_beats_v" USING btree ("_parent_id");
  CREATE INDEX "__case_studies_v_version_strategy_beats_v_order_idx" ON "__case_studies_v_version_strategy_beats_v" USING btree ("_order");
  CREATE INDEX "__case_studies_v_version_strategy_beats_v_parent_id_idx" ON "__case_studies_v_version_strategy_beats_v" USING btree ("_parent_id");
  CREATE INDEX "__case_studies_v_version_approach_beats_v_order_idx" ON "__case_studies_v_version_approach_beats_v" USING btree ("_order");
  CREATE INDEX "__case_studies_v_version_approach_beats_v_parent_id_idx" ON "__case_studies_v_version_approach_beats_v" USING btree ("_parent_id");
  CREATE INDEX "__case_studies_v_version_outcome_summary_beats_v_order_idx" ON "__case_studies_v_version_outcome_summary_beats_v" USING btree ("_order");
  CREATE INDEX "__case_studies_v_version_outcome_summary_beats_v_parent_id_idx" ON "__case_studies_v_version_outcome_summary_beats_v" USING btree ("_parent_id");
  CREATE INDEX "__case_studies_v_version_learnings_beats_v_order_idx" ON "__case_studies_v_version_learnings_beats_v" USING btree ("_order");
  CREATE INDEX "__case_studies_v_version_learnings_beats_v_parent_id_idx" ON "__case_studies_v_version_learnings_beats_v" USING btree ("_parent_id");
  CREATE INDEX "lab_projects_context_beats_order_idx" ON "lab_projects_context_beats" USING btree ("_order");
  CREATE INDEX "lab_projects_context_beats_parent_id_idx" ON "lab_projects_context_beats" USING btree ("_parent_id");
  CREATE INDEX "lab_projects_challenge_beats_order_idx" ON "lab_projects_challenge_beats" USING btree ("_order");
  CREATE INDEX "lab_projects_challenge_beats_parent_id_idx" ON "lab_projects_challenge_beats" USING btree ("_parent_id");
  CREATE INDEX "lab_projects_strategy_beats_order_idx" ON "lab_projects_strategy_beats" USING btree ("_order");
  CREATE INDEX "lab_projects_strategy_beats_parent_id_idx" ON "lab_projects_strategy_beats" USING btree ("_parent_id");
  CREATE INDEX "lab_projects_approach_beats_order_idx" ON "lab_projects_approach_beats" USING btree ("_order");
  CREATE INDEX "lab_projects_approach_beats_parent_id_idx" ON "lab_projects_approach_beats" USING btree ("_parent_id");
  CREATE INDEX "lab_projects_outcome_summary_beats_order_idx" ON "lab_projects_outcome_summary_beats" USING btree ("_order");
  CREATE INDEX "lab_projects_outcome_summary_beats_parent_id_idx" ON "lab_projects_outcome_summary_beats" USING btree ("_parent_id");
  CREATE INDEX "lab_projects_learnings_beats_order_idx" ON "lab_projects_learnings_beats" USING btree ("_order");
  CREATE INDEX "lab_projects_learnings_beats_parent_id_idx" ON "lab_projects_learnings_beats" USING btree ("_parent_id");
  CREATE INDEX "__lab_projects_v_version_context_beats_v_order_idx" ON "__lab_projects_v_version_context_beats_v" USING btree ("_order");
  CREATE INDEX "__lab_projects_v_version_context_beats_v_parent_id_idx" ON "__lab_projects_v_version_context_beats_v" USING btree ("_parent_id");
  CREATE INDEX "__lab_projects_v_version_challenge_beats_v_order_idx" ON "__lab_projects_v_version_challenge_beats_v" USING btree ("_order");
  CREATE INDEX "__lab_projects_v_version_challenge_beats_v_parent_id_idx" ON "__lab_projects_v_version_challenge_beats_v" USING btree ("_parent_id");
  CREATE INDEX "__lab_projects_v_version_strategy_beats_v_order_idx" ON "__lab_projects_v_version_strategy_beats_v" USING btree ("_order");
  CREATE INDEX "__lab_projects_v_version_strategy_beats_v_parent_id_idx" ON "__lab_projects_v_version_strategy_beats_v" USING btree ("_parent_id");
  CREATE INDEX "__lab_projects_v_version_approach_beats_v_order_idx" ON "__lab_projects_v_version_approach_beats_v" USING btree ("_order");
  CREATE INDEX "__lab_projects_v_version_approach_beats_v_parent_id_idx" ON "__lab_projects_v_version_approach_beats_v" USING btree ("_parent_id");
  CREATE INDEX "__lab_projects_v_version_outcome_summary_beats_v_order_idx" ON "__lab_projects_v_version_outcome_summary_beats_v" USING btree ("_order");
  CREATE INDEX "__lab_projects_v_version_outcome_summary_beats_v_parent_id_idx" ON "__lab_projects_v_version_outcome_summary_beats_v" USING btree ("_parent_id");
  CREATE INDEX "__lab_projects_v_version_learnings_beats_v_order_idx" ON "__lab_projects_v_version_learnings_beats_v" USING btree ("_order");
  CREATE INDEX "__lab_projects_v_version_learnings_beats_v_parent_id_idx" ON "__lab_projects_v_version_learnings_beats_v" USING btree ("_parent_id");
  CREATE INDEX "home_stmt_grid_cards_order_idx" ON "home_stmt_grid_cards" USING btree ("_order");
  CREATE INDEX "home_stmt_grid_cards_parent_id_idx" ON "home_stmt_grid_cards" USING btree ("_parent_id");
  CREATE INDEX "home_stmt_grid_cards_media_idx" ON "home_stmt_grid_cards" USING btree ("media_id");
  CREATE INDEX "home_stmt_grid_order_idx" ON "home_stmt_grid" USING btree ("_order");
  CREATE INDEX "home_stmt_grid_parent_id_idx" ON "home_stmt_grid" USING btree ("_parent_id");
  CREATE INDEX "home_stmt_grid_path_idx" ON "home_stmt_grid" USING btree ("_path");
  CREATE INDEX "__home_v_stmt_grid_v_cards_order_idx" ON "__home_v_stmt_grid_v_cards" USING btree ("_order");
  CREATE INDEX "__home_v_stmt_grid_v_cards_parent_id_idx" ON "__home_v_stmt_grid_v_cards" USING btree ("_parent_id");
  CREATE INDEX "__home_v_stmt_grid_v_cards_media_idx" ON "__home_v_stmt_grid_v_cards" USING btree ("media_id");
  CREATE INDEX "__home_v_stmt_grid_v_order_idx" ON "__home_v_stmt_grid_v" USING btree ("_order");
  CREATE INDEX "__home_v_stmt_grid_v_parent_id_idx" ON "__home_v_stmt_grid_v" USING btree ("_parent_id");
  CREATE INDEX "__home_v_stmt_grid_v_path_idx" ON "__home_v_stmt_grid_v" USING btree ("_path");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_pages_stmt_grid_source" RENAME TO "enum_pages_blocks_feature_statement_grid_source";
  ALTER TYPE "public"."enum_pages_stmt_grid_theme" RENAME TO "enum_pages_blocks_feature_statement_grid_theme";
  ALTER TYPE "public"."enum___pages_v_stmt_grid_v_source" RENAME TO "enum__pages_v_blocks_feature_statement_grid_source";
  ALTER TYPE "public"."enum___pages_v_stmt_grid_v_theme" RENAME TO "enum__pages_v_blocks_feature_statement_grid_theme";
  ALTER TYPE "public"."enum_work_pages_stmt_grid_source" RENAME TO "enum_work_pages_blocks_feature_statement_grid_source";
  ALTER TYPE "public"."enum_work_pages_stmt_grid_story_scope" RENAME TO "enum_work_pages_blocks_feature_statement_grid_story_scope";
  ALTER TYPE "public"."enum_work_pages_stmt_grid_theme" RENAME TO "enum_work_pages_blocks_feature_statement_grid_theme";
  ALTER TYPE "public"."enum___work_pages_v_stmt_grid_v_source" RENAME TO "enum__work_pages_v_blocks_feature_statement_grid_source";
  ALTER TYPE "public"."enum___work_pages_v_stmt_grid_v_story_scope" RENAME TO "enum__work_pages_v_blocks_feature_statement_grid_story_scope";
  ALTER TYPE "public"."enum___work_pages_v_stmt_grid_v_theme" RENAME TO "enum__work_pages_v_blocks_feature_statement_grid_theme";
  ALTER TYPE "public"."enum_lab_pages_stmt_grid_source" RENAME TO "enum_lab_pages_blocks_feature_statement_grid_source";
  ALTER TYPE "public"."enum_lab_pages_stmt_grid_story_scope" RENAME TO "enum_lab_pages_blocks_feature_statement_grid_story_scope";
  ALTER TYPE "public"."enum_lab_pages_stmt_grid_theme" RENAME TO "enum_lab_pages_blocks_feature_statement_grid_theme";
  ALTER TYPE "public"."enum___lab_pages_v_stmt_grid_v_source" RENAME TO "enum__lab_pages_v_blocks_feature_statement_grid_source";
  ALTER TYPE "public"."enum___lab_pages_v_stmt_grid_v_story_scope" RENAME TO "enum__lab_pages_v_blocks_feature_statement_grid_story_scope";
  ALTER TYPE "public"."enum___lab_pages_v_stmt_grid_v_theme" RENAME TO "enum__lab_pages_v_blocks_feature_statement_grid_theme";
  ALTER TYPE "public"."enum_expertise_pages_stmt_grid_source" RENAME TO "enum_expertise_pages_blocks_feature_statement_grid_source";
  ALTER TYPE "public"."enum_expertise_pages_stmt_grid_theme" RENAME TO "enum_expertise_pages_blocks_feature_statement_grid_theme";
  ALTER TYPE "public"."enum___expertise_pages_v_stmt_grid_v_source" RENAME TO "enum__expertise_pages_v_blocks_feature_statement_grid_source";
  ALTER TYPE "public"."enum___expertise_pages_v_stmt_grid_v_theme" RENAME TO "enum__expertise_pages_v_blocks_feature_statement_grid_theme";
  ALTER TYPE "public"."enum_audience_pages_stmt_grid_source" RENAME TO "enum_audience_pages_blocks_feature_statement_grid_source";
  ALTER TYPE "public"."enum_audience_pages_stmt_grid_theme" RENAME TO "enum_audience_pages_blocks_feature_statement_grid_theme";
  ALTER TYPE "public"."enum___audience_pages_v_stmt_grid_v_source" RENAME TO "enum__audience_pages_v_blocks_feature_statement_grid_source";
  ALTER TYPE "public"."enum___audience_pages_v_stmt_grid_v_theme" RENAME TO "enum__audience_pages_v_blocks_feature_statement_grid_theme";
  ALTER TYPE "public"."enum_home_stmt_grid_source" RENAME TO "enum_home_blocks_feature_statement_grid_source";
  ALTER TYPE "public"."enum_home_stmt_grid_theme" RENAME TO "enum_home_blocks_feature_statement_grid_theme";
  ALTER TYPE "public"."enum___home_v_stmt_grid_v_source" RENAME TO "enum__home_v_blocks_feature_statement_grid_source";
  ALTER TYPE "public"."enum___home_v_stmt_grid_v_theme" RENAME TO "enum__home_v_blocks_feature_statement_grid_theme";
  ALTER TABLE "pages_stmt_grid_cards" RENAME TO "pages_blocks_feature_statement_grid_cards";
  ALTER TABLE "pages_stmt_grid" RENAME TO "pages_blocks_feature_statement_grid";
  ALTER TABLE "__pages_v_stmt_grid_v_cards" RENAME TO "_pages_v_blocks_feature_statement_grid_cards";
  ALTER TABLE "__pages_v_stmt_grid_v" RENAME TO "_pages_v_blocks_feature_statement_grid";
  ALTER TABLE "work_pages_stmt_grid_cards" RENAME TO "work_pages_blocks_feature_statement_grid_cards";
  ALTER TABLE "work_pages_stmt_grid" RENAME TO "work_pages_blocks_feature_statement_grid";
  ALTER TABLE "__work_pages_v_stmt_grid_v_cards" RENAME TO "_work_pages_v_blocks_feature_statement_grid_cards";
  ALTER TABLE "__work_pages_v_stmt_grid_v" RENAME TO "_work_pages_v_blocks_feature_statement_grid";
  ALTER TABLE "lab_pages_stmt_grid_cards" RENAME TO "lab_pages_blocks_feature_statement_grid_cards";
  ALTER TABLE "lab_pages_stmt_grid" RENAME TO "lab_pages_blocks_feature_statement_grid";
  ALTER TABLE "__lab_pages_v_stmt_grid_v_cards" RENAME TO "_lab_pages_v_blocks_feature_statement_grid_cards";
  ALTER TABLE "__lab_pages_v_stmt_grid_v" RENAME TO "_lab_pages_v_blocks_feature_statement_grid";
  ALTER TABLE "expertise_pages_stmt_grid_cards" RENAME TO "expertise_pages_blocks_feature_statement_grid_cards";
  ALTER TABLE "expertise_pages_stmt_grid" RENAME TO "expertise_pages_blocks_feature_statement_grid";
  ALTER TABLE "__expertise_pages_v_stmt_grid_v_cards" RENAME TO "_expertise_pages_v_blocks_feature_statement_grid_cards";
  ALTER TABLE "__expertise_pages_v_stmt_grid_v" RENAME TO "_expertise_pages_v_blocks_feature_statement_grid";
  ALTER TABLE "audience_pages_stmt_grid_cards" RENAME TO "audience_pages_blocks_feature_statement_grid_cards";
  ALTER TABLE "audience_pages_stmt_grid" RENAME TO "audience_pages_blocks_feature_statement_grid";
  ALTER TABLE "__audience_pages_v_stmt_grid_v_cards" RENAME TO "_audience_pages_v_blocks_feature_statement_grid_cards";
  ALTER TABLE "__audience_pages_v_stmt_grid_v" RENAME TO "_audience_pages_v_blocks_feature_statement_grid";
  ALTER TABLE "case_studies_context_beats" RENAME TO "case_studies_context_story_beats";
  ALTER TABLE "case_studies_challenge_beats" RENAME TO "case_studies_challenge_story_beats";
  ALTER TABLE "case_studies_strategy_beats" RENAME TO "case_studies_strategy_story_beats";
  ALTER TABLE "case_studies_approach_beats" RENAME TO "case_studies_approach_story_beats";
  ALTER TABLE "case_studies_outcome_summary_beats" RENAME TO "case_studies_outcome_summary_story_beats";
  ALTER TABLE "case_studies_learnings_beats" RENAME TO "case_studies_learnings_story_beats";
  ALTER TABLE "__case_studies_v_version_context_beats_v" RENAME TO "_case_studies_v_version_context_story_beats";
  ALTER TABLE "__case_studies_v_version_challenge_beats_v" RENAME TO "_case_studies_v_version_challenge_story_beats";
  ALTER TABLE "__case_studies_v_version_strategy_beats_v" RENAME TO "_case_studies_v_version_strategy_story_beats";
  ALTER TABLE "__case_studies_v_version_approach_beats_v" RENAME TO "_case_studies_v_version_approach_story_beats";
  ALTER TABLE "__case_studies_v_version_outcome_summary_beats_v" RENAME TO "_case_studies_v_version_outcome_summary_story_beats";
  ALTER TABLE "__case_studies_v_version_learnings_beats_v" RENAME TO "_case_studies_v_version_learnings_story_beats";
  ALTER TABLE "lab_projects_context_beats" RENAME TO "lab_projects_context_story_beats";
  ALTER TABLE "lab_projects_challenge_beats" RENAME TO "lab_projects_challenge_story_beats";
  ALTER TABLE "lab_projects_strategy_beats" RENAME TO "lab_projects_strategy_story_beats";
  ALTER TABLE "lab_projects_approach_beats" RENAME TO "lab_projects_approach_story_beats";
  ALTER TABLE "lab_projects_outcome_summary_beats" RENAME TO "lab_projects_outcome_summary_story_beats";
  ALTER TABLE "lab_projects_learnings_beats" RENAME TO "lab_projects_learnings_story_beats";
  ALTER TABLE "__lab_projects_v_version_context_beats_v" RENAME TO "_lab_projects_v_version_context_story_beats";
  ALTER TABLE "__lab_projects_v_version_challenge_beats_v" RENAME TO "_lab_projects_v_version_challenge_story_beats";
  ALTER TABLE "__lab_projects_v_version_strategy_beats_v" RENAME TO "_lab_projects_v_version_strategy_story_beats";
  ALTER TABLE "__lab_projects_v_version_approach_beats_v" RENAME TO "_lab_projects_v_version_approach_story_beats";
  ALTER TABLE "__lab_projects_v_version_outcome_summary_beats_v" RENAME TO "_lab_projects_v_version_outcome_summary_story_beats";
  ALTER TABLE "__lab_projects_v_version_learnings_beats_v" RENAME TO "_lab_projects_v_version_learnings_story_beats";
  ALTER TABLE "home_stmt_grid_cards" RENAME TO "home_blocks_feature_statement_grid_cards";
  ALTER TABLE "home_stmt_grid" RENAME TO "home_blocks_feature_statement_grid";
  ALTER TABLE "__home_v_stmt_grid_v_cards" RENAME TO "_home_v_blocks_feature_statement_grid_cards";
  ALTER TABLE "__home_v_stmt_grid_v" RENAME TO "_home_v_blocks_feature_statement_grid";
  ALTER TABLE "pages_blocks_feature_statement_grid_cards" DROP CONSTRAINT "pages_stmt_grid_cards_media_id_media_id_fk";
  
  ALTER TABLE "pages_blocks_feature_statement_grid_cards" DROP CONSTRAINT "pages_stmt_grid_cards_parent_id_fk";
  
  ALTER TABLE "pages_blocks_feature_statement_grid" DROP CONSTRAINT "pages_stmt_grid_parent_id_fk";
  
  ALTER TABLE "_pages_v_blocks_feature_statement_grid_cards" DROP CONSTRAINT "__pages_v_stmt_grid_v_cards_media_id_media_id_fk";
  
  ALTER TABLE "_pages_v_blocks_feature_statement_grid_cards" DROP CONSTRAINT "__pages_v_stmt_grid_v_cards_parent_id_fk";
  
  ALTER TABLE "_pages_v_blocks_feature_statement_grid" DROP CONSTRAINT "__pages_v_stmt_grid_v_parent_id_fk";
  
  ALTER TABLE "work_pages_blocks_feature_statement_grid_cards" DROP CONSTRAINT "work_pages_stmt_grid_cards_media_id_media_id_fk";
  
  ALTER TABLE "work_pages_blocks_feature_statement_grid_cards" DROP CONSTRAINT "work_pages_stmt_grid_cards_parent_id_fk";
  
  ALTER TABLE "work_pages_blocks_feature_statement_grid" DROP CONSTRAINT "work_pages_stmt_grid_parent_id_fk";
  
  ALTER TABLE "_work_pages_v_blocks_feature_statement_grid_cards" DROP CONSTRAINT "__work_pages_v_stmt_grid_v_cards_media_id_media_id_fk";
  
  ALTER TABLE "_work_pages_v_blocks_feature_statement_grid_cards" DROP CONSTRAINT "__work_pages_v_stmt_grid_v_cards_parent_id_fk";
  
  ALTER TABLE "_work_pages_v_blocks_feature_statement_grid" DROP CONSTRAINT "__work_pages_v_stmt_grid_v_parent_id_fk";
  
  ALTER TABLE "lab_pages_blocks_feature_statement_grid_cards" DROP CONSTRAINT "lab_pages_stmt_grid_cards_media_id_media_id_fk";
  
  ALTER TABLE "lab_pages_blocks_feature_statement_grid_cards" DROP CONSTRAINT "lab_pages_stmt_grid_cards_parent_id_fk";
  
  ALTER TABLE "lab_pages_blocks_feature_statement_grid" DROP CONSTRAINT "lab_pages_stmt_grid_parent_id_fk";
  
  ALTER TABLE "_lab_pages_v_blocks_feature_statement_grid_cards" DROP CONSTRAINT "__lab_pages_v_stmt_grid_v_cards_media_id_media_id_fk";
  
  ALTER TABLE "_lab_pages_v_blocks_feature_statement_grid_cards" DROP CONSTRAINT "__lab_pages_v_stmt_grid_v_cards_parent_id_fk";
  
  ALTER TABLE "_lab_pages_v_blocks_feature_statement_grid" DROP CONSTRAINT "__lab_pages_v_stmt_grid_v_parent_id_fk";
  
  ALTER TABLE "expertise_pages_blocks_feature_statement_grid_cards" DROP CONSTRAINT "expertise_pages_stmt_grid_cards_media_id_media_id_fk";
  
  ALTER TABLE "expertise_pages_blocks_feature_statement_grid_cards" DROP CONSTRAINT "expertise_pages_stmt_grid_cards_parent_id_fk";
  
  ALTER TABLE "expertise_pages_blocks_feature_statement_grid" DROP CONSTRAINT "expertise_pages_stmt_grid_parent_id_fk";
  
  ALTER TABLE "_expertise_pages_v_blocks_feature_statement_grid_cards" DROP CONSTRAINT "__expertise_pages_v_stmt_grid_v_cards_media_id_media_id_fk";
  
  ALTER TABLE "_expertise_pages_v_blocks_feature_statement_grid_cards" DROP CONSTRAINT "__expertise_pages_v_stmt_grid_v_cards_parent_id_fk";
  
  ALTER TABLE "_expertise_pages_v_blocks_feature_statement_grid" DROP CONSTRAINT "__expertise_pages_v_stmt_grid_v_parent_id_fk";
  
  ALTER TABLE "audience_pages_blocks_feature_statement_grid_cards" DROP CONSTRAINT "audience_pages_stmt_grid_cards_media_id_media_id_fk";
  
  ALTER TABLE "audience_pages_blocks_feature_statement_grid_cards" DROP CONSTRAINT "audience_pages_stmt_grid_cards_parent_id_fk";
  
  ALTER TABLE "audience_pages_blocks_feature_statement_grid" DROP CONSTRAINT "audience_pages_stmt_grid_parent_id_fk";
  
  ALTER TABLE "_audience_pages_v_blocks_feature_statement_grid_cards" DROP CONSTRAINT "__audience_pages_v_stmt_grid_v_cards_media_id_media_id_fk";
  
  ALTER TABLE "_audience_pages_v_blocks_feature_statement_grid_cards" DROP CONSTRAINT "__audience_pages_v_stmt_grid_v_cards_parent_id_fk";
  
  ALTER TABLE "_audience_pages_v_blocks_feature_statement_grid" DROP CONSTRAINT "__audience_pages_v_stmt_grid_v_parent_id_fk";
  
  ALTER TABLE "case_studies_context_story_beats" DROP CONSTRAINT "case_studies_context_beats_parent_id_fk";
  
  ALTER TABLE "case_studies_challenge_story_beats" DROP CONSTRAINT "case_studies_challenge_beats_parent_id_fk";
  
  ALTER TABLE "case_studies_strategy_story_beats" DROP CONSTRAINT "case_studies_strategy_beats_parent_id_fk";
  
  ALTER TABLE "case_studies_approach_story_beats" DROP CONSTRAINT "case_studies_approach_beats_parent_id_fk";
  
  ALTER TABLE "case_studies_outcome_summary_story_beats" DROP CONSTRAINT "case_studies_outcome_summary_beats_parent_id_fk";
  
  ALTER TABLE "case_studies_learnings_story_beats" DROP CONSTRAINT "case_studies_learnings_beats_parent_id_fk";
  
  ALTER TABLE "_case_studies_v_version_context_story_beats" DROP CONSTRAINT "__case_studies_v_version_context_beats_v_parent_id_fk";
  
  ALTER TABLE "_case_studies_v_version_challenge_story_beats" DROP CONSTRAINT "__case_studies_v_version_challenge_beats_v_parent_id_fk";
  
  ALTER TABLE "_case_studies_v_version_strategy_story_beats" DROP CONSTRAINT "__case_studies_v_version_strategy_beats_v_parent_id_fk";
  
  ALTER TABLE "_case_studies_v_version_approach_story_beats" DROP CONSTRAINT "__case_studies_v_version_approach_beats_v_parent_id_fk";
  
  ALTER TABLE "_case_studies_v_version_outcome_summary_story_beats" DROP CONSTRAINT "__case_studies_v_version_outcome_summary_beats_v_parent_id_fk";
  
  ALTER TABLE "_case_studies_v_version_learnings_story_beats" DROP CONSTRAINT "__case_studies_v_version_learnings_beats_v_parent_id_fk";
  
  ALTER TABLE "lab_projects_context_story_beats" DROP CONSTRAINT "lab_projects_context_beats_parent_id_fk";
  
  ALTER TABLE "lab_projects_challenge_story_beats" DROP CONSTRAINT "lab_projects_challenge_beats_parent_id_fk";
  
  ALTER TABLE "lab_projects_strategy_story_beats" DROP CONSTRAINT "lab_projects_strategy_beats_parent_id_fk";
  
  ALTER TABLE "lab_projects_approach_story_beats" DROP CONSTRAINT "lab_projects_approach_beats_parent_id_fk";
  
  ALTER TABLE "lab_projects_outcome_summary_story_beats" DROP CONSTRAINT "lab_projects_outcome_summary_beats_parent_id_fk";
  
  ALTER TABLE "lab_projects_learnings_story_beats" DROP CONSTRAINT "lab_projects_learnings_beats_parent_id_fk";
  
  ALTER TABLE "_lab_projects_v_version_context_story_beats" DROP CONSTRAINT "__lab_projects_v_version_context_beats_v_parent_id_fk";
  
  ALTER TABLE "_lab_projects_v_version_challenge_story_beats" DROP CONSTRAINT "__lab_projects_v_version_challenge_beats_v_parent_id_fk";
  
  ALTER TABLE "_lab_projects_v_version_strategy_story_beats" DROP CONSTRAINT "__lab_projects_v_version_strategy_beats_v_parent_id_fk";
  
  ALTER TABLE "_lab_projects_v_version_approach_story_beats" DROP CONSTRAINT "__lab_projects_v_version_approach_beats_v_parent_id_fk";
  
  ALTER TABLE "_lab_projects_v_version_outcome_summary_story_beats" DROP CONSTRAINT "__lab_projects_v_version_outcome_summary_beats_v_parent_id_fk";
  
  ALTER TABLE "_lab_projects_v_version_learnings_story_beats" DROP CONSTRAINT "__lab_projects_v_version_learnings_beats_v_parent_id_fk";
  
  ALTER TABLE "home_blocks_feature_statement_grid_cards" DROP CONSTRAINT "home_stmt_grid_cards_media_id_media_id_fk";
  
  ALTER TABLE "home_blocks_feature_statement_grid_cards" DROP CONSTRAINT "home_stmt_grid_cards_parent_id_fk";
  
  ALTER TABLE "home_blocks_feature_statement_grid" DROP CONSTRAINT "home_stmt_grid_parent_id_fk";
  
  ALTER TABLE "_home_v_blocks_feature_statement_grid_cards" DROP CONSTRAINT "__home_v_stmt_grid_v_cards_media_id_media_id_fk";
  
  ALTER TABLE "_home_v_blocks_feature_statement_grid_cards" DROP CONSTRAINT "__home_v_stmt_grid_v_cards_parent_id_fk";
  
  ALTER TABLE "_home_v_blocks_feature_statement_grid" DROP CONSTRAINT "__home_v_stmt_grid_v_parent_id_fk";
  
  DROP INDEX "pages_stmt_grid_cards_order_idx";
  DROP INDEX "pages_stmt_grid_cards_parent_id_idx";
  DROP INDEX "pages_stmt_grid_cards_media_idx";
  DROP INDEX "pages_stmt_grid_order_idx";
  DROP INDEX "pages_stmt_grid_parent_id_idx";
  DROP INDEX "pages_stmt_grid_path_idx";
  DROP INDEX "__pages_v_stmt_grid_v_cards_order_idx";
  DROP INDEX "__pages_v_stmt_grid_v_cards_parent_id_idx";
  DROP INDEX "__pages_v_stmt_grid_v_cards_media_idx";
  DROP INDEX "__pages_v_stmt_grid_v_order_idx";
  DROP INDEX "__pages_v_stmt_grid_v_parent_id_idx";
  DROP INDEX "__pages_v_stmt_grid_v_path_idx";
  DROP INDEX "work_pages_stmt_grid_cards_order_idx";
  DROP INDEX "work_pages_stmt_grid_cards_parent_id_idx";
  DROP INDEX "work_pages_stmt_grid_cards_media_idx";
  DROP INDEX "work_pages_stmt_grid_order_idx";
  DROP INDEX "work_pages_stmt_grid_parent_id_idx";
  DROP INDEX "work_pages_stmt_grid_path_idx";
  DROP INDEX "__work_pages_v_stmt_grid_v_cards_order_idx";
  DROP INDEX "__work_pages_v_stmt_grid_v_cards_parent_id_idx";
  DROP INDEX "__work_pages_v_stmt_grid_v_cards_media_idx";
  DROP INDEX "__work_pages_v_stmt_grid_v_order_idx";
  DROP INDEX "__work_pages_v_stmt_grid_v_parent_id_idx";
  DROP INDEX "__work_pages_v_stmt_grid_v_path_idx";
  DROP INDEX "lab_pages_stmt_grid_cards_order_idx";
  DROP INDEX "lab_pages_stmt_grid_cards_parent_id_idx";
  DROP INDEX "lab_pages_stmt_grid_cards_media_idx";
  DROP INDEX "lab_pages_stmt_grid_order_idx";
  DROP INDEX "lab_pages_stmt_grid_parent_id_idx";
  DROP INDEX "lab_pages_stmt_grid_path_idx";
  DROP INDEX "__lab_pages_v_stmt_grid_v_cards_order_idx";
  DROP INDEX "__lab_pages_v_stmt_grid_v_cards_parent_id_idx";
  DROP INDEX "__lab_pages_v_stmt_grid_v_cards_media_idx";
  DROP INDEX "__lab_pages_v_stmt_grid_v_order_idx";
  DROP INDEX "__lab_pages_v_stmt_grid_v_parent_id_idx";
  DROP INDEX "__lab_pages_v_stmt_grid_v_path_idx";
  DROP INDEX "expertise_pages_stmt_grid_cards_order_idx";
  DROP INDEX "expertise_pages_stmt_grid_cards_parent_id_idx";
  DROP INDEX "expertise_pages_stmt_grid_cards_media_idx";
  DROP INDEX "expertise_pages_stmt_grid_order_idx";
  DROP INDEX "expertise_pages_stmt_grid_parent_id_idx";
  DROP INDEX "expertise_pages_stmt_grid_path_idx";
  DROP INDEX "__expertise_pages_v_stmt_grid_v_cards_order_idx";
  DROP INDEX "__expertise_pages_v_stmt_grid_v_cards_parent_id_idx";
  DROP INDEX "__expertise_pages_v_stmt_grid_v_cards_media_idx";
  DROP INDEX "__expertise_pages_v_stmt_grid_v_order_idx";
  DROP INDEX "__expertise_pages_v_stmt_grid_v_parent_id_idx";
  DROP INDEX "__expertise_pages_v_stmt_grid_v_path_idx";
  DROP INDEX "audience_pages_stmt_grid_cards_order_idx";
  DROP INDEX "audience_pages_stmt_grid_cards_parent_id_idx";
  DROP INDEX "audience_pages_stmt_grid_cards_media_idx";
  DROP INDEX "audience_pages_stmt_grid_order_idx";
  DROP INDEX "audience_pages_stmt_grid_parent_id_idx";
  DROP INDEX "audience_pages_stmt_grid_path_idx";
  DROP INDEX "__audience_pages_v_stmt_grid_v_cards_order_idx";
  DROP INDEX "__audience_pages_v_stmt_grid_v_cards_parent_id_idx";
  DROP INDEX "__audience_pages_v_stmt_grid_v_cards_media_idx";
  DROP INDEX "__audience_pages_v_stmt_grid_v_order_idx";
  DROP INDEX "__audience_pages_v_stmt_grid_v_parent_id_idx";
  DROP INDEX "__audience_pages_v_stmt_grid_v_path_idx";
  DROP INDEX "case_studies_context_beats_order_idx";
  DROP INDEX "case_studies_context_beats_parent_id_idx";
  DROP INDEX "case_studies_challenge_beats_order_idx";
  DROP INDEX "case_studies_challenge_beats_parent_id_idx";
  DROP INDEX "case_studies_strategy_beats_order_idx";
  DROP INDEX "case_studies_strategy_beats_parent_id_idx";
  DROP INDEX "case_studies_approach_beats_order_idx";
  DROP INDEX "case_studies_approach_beats_parent_id_idx";
  DROP INDEX "case_studies_outcome_summary_beats_order_idx";
  DROP INDEX "case_studies_outcome_summary_beats_parent_id_idx";
  DROP INDEX "case_studies_learnings_beats_order_idx";
  DROP INDEX "case_studies_learnings_beats_parent_id_idx";
  DROP INDEX "__case_studies_v_version_context_beats_v_order_idx";
  DROP INDEX "__case_studies_v_version_context_beats_v_parent_id_idx";
  DROP INDEX "__case_studies_v_version_challenge_beats_v_order_idx";
  DROP INDEX "__case_studies_v_version_challenge_beats_v_parent_id_idx";
  DROP INDEX "__case_studies_v_version_strategy_beats_v_order_idx";
  DROP INDEX "__case_studies_v_version_strategy_beats_v_parent_id_idx";
  DROP INDEX "__case_studies_v_version_approach_beats_v_order_idx";
  DROP INDEX "__case_studies_v_version_approach_beats_v_parent_id_idx";
  DROP INDEX "__case_studies_v_version_outcome_summary_beats_v_order_idx";
  DROP INDEX "__case_studies_v_version_outcome_summary_beats_v_parent_id_idx";
  DROP INDEX "__case_studies_v_version_learnings_beats_v_order_idx";
  DROP INDEX "__case_studies_v_version_learnings_beats_v_parent_id_idx";
  DROP INDEX "lab_projects_context_beats_order_idx";
  DROP INDEX "lab_projects_context_beats_parent_id_idx";
  DROP INDEX "lab_projects_challenge_beats_order_idx";
  DROP INDEX "lab_projects_challenge_beats_parent_id_idx";
  DROP INDEX "lab_projects_strategy_beats_order_idx";
  DROP INDEX "lab_projects_strategy_beats_parent_id_idx";
  DROP INDEX "lab_projects_approach_beats_order_idx";
  DROP INDEX "lab_projects_approach_beats_parent_id_idx";
  DROP INDEX "lab_projects_outcome_summary_beats_order_idx";
  DROP INDEX "lab_projects_outcome_summary_beats_parent_id_idx";
  DROP INDEX "lab_projects_learnings_beats_order_idx";
  DROP INDEX "lab_projects_learnings_beats_parent_id_idx";
  DROP INDEX "__lab_projects_v_version_context_beats_v_order_idx";
  DROP INDEX "__lab_projects_v_version_context_beats_v_parent_id_idx";
  DROP INDEX "__lab_projects_v_version_challenge_beats_v_order_idx";
  DROP INDEX "__lab_projects_v_version_challenge_beats_v_parent_id_idx";
  DROP INDEX "__lab_projects_v_version_strategy_beats_v_order_idx";
  DROP INDEX "__lab_projects_v_version_strategy_beats_v_parent_id_idx";
  DROP INDEX "__lab_projects_v_version_approach_beats_v_order_idx";
  DROP INDEX "__lab_projects_v_version_approach_beats_v_parent_id_idx";
  DROP INDEX "__lab_projects_v_version_outcome_summary_beats_v_order_idx";
  DROP INDEX "__lab_projects_v_version_outcome_summary_beats_v_parent_id_idx";
  DROP INDEX "__lab_projects_v_version_learnings_beats_v_order_idx";
  DROP INDEX "__lab_projects_v_version_learnings_beats_v_parent_id_idx";
  DROP INDEX "home_stmt_grid_cards_order_idx";
  DROP INDEX "home_stmt_grid_cards_parent_id_idx";
  DROP INDEX "home_stmt_grid_cards_media_idx";
  DROP INDEX "home_stmt_grid_order_idx";
  DROP INDEX "home_stmt_grid_parent_id_idx";
  DROP INDEX "home_stmt_grid_path_idx";
  DROP INDEX "__home_v_stmt_grid_v_cards_order_idx";
  DROP INDEX "__home_v_stmt_grid_v_cards_parent_id_idx";
  DROP INDEX "__home_v_stmt_grid_v_cards_media_idx";
  DROP INDEX "__home_v_stmt_grid_v_order_idx";
  DROP INDEX "__home_v_stmt_grid_v_parent_id_idx";
  DROP INDEX "__home_v_stmt_grid_v_path_idx";
  ALTER TABLE "pages_blocks_feature_statement_grid_cards" ADD CONSTRAINT "pages_blocks_feature_statement_grid_cards_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_feature_statement_grid_cards" ADD CONSTRAINT "pages_blocks_feature_statement_grid_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_feature_statement_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_feature_statement_grid" ADD CONSTRAINT "pages_blocks_feature_statement_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_feature_statement_grid_cards" ADD CONSTRAINT "_pages_v_blocks_feature_statement_grid_cards_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_feature_statement_grid_cards" ADD CONSTRAINT "_pages_v_blocks_feature_statement_grid_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_feature_statement_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_feature_statement_grid" ADD CONSTRAINT "_pages_v_blocks_feature_statement_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "work_pages_blocks_feature_statement_grid_cards" ADD CONSTRAINT "work_pages_blocks_feature_statement_grid_cards_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "work_pages_blocks_feature_statement_grid_cards" ADD CONSTRAINT "work_pages_blocks_feature_statement_grid_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."work_pages_blocks_feature_statement_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "work_pages_blocks_feature_statement_grid" ADD CONSTRAINT "work_pages_blocks_feature_statement_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."work_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_work_pages_v_blocks_feature_statement_grid_cards" ADD CONSTRAINT "_work_pages_v_blocks_feature_statement_grid_cards_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_work_pages_v_blocks_feature_statement_grid_cards" ADD CONSTRAINT "_work_pages_v_blocks_feature_statement_grid_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_work_pages_v_blocks_feature_statement_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_work_pages_v_blocks_feature_statement_grid" ADD CONSTRAINT "_work_pages_v_blocks_feature_statement_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_work_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lab_pages_blocks_feature_statement_grid_cards" ADD CONSTRAINT "lab_pages_blocks_feature_statement_grid_cards_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "lab_pages_blocks_feature_statement_grid_cards" ADD CONSTRAINT "lab_pages_blocks_feature_statement_grid_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lab_pages_blocks_feature_statement_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lab_pages_blocks_feature_statement_grid" ADD CONSTRAINT "lab_pages_blocks_feature_statement_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lab_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_lab_pages_v_blocks_feature_statement_grid_cards" ADD CONSTRAINT "_lab_pages_v_blocks_feature_statement_grid_cards_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_lab_pages_v_blocks_feature_statement_grid_cards" ADD CONSTRAINT "_lab_pages_v_blocks_feature_statement_grid_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_lab_pages_v_blocks_feature_statement_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_lab_pages_v_blocks_feature_statement_grid" ADD CONSTRAINT "_lab_pages_v_blocks_feature_statement_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_lab_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "expertise_pages_blocks_feature_statement_grid_cards" ADD CONSTRAINT "expertise_pages_blocks_feature_statement_grid_cards_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "expertise_pages_blocks_feature_statement_grid_cards" ADD CONSTRAINT "expertise_pages_blocks_feature_statement_grid_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."expertise_pages_blocks_feature_statement_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "expertise_pages_blocks_feature_statement_grid" ADD CONSTRAINT "expertise_pages_blocks_feature_statement_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."expertise_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_expertise_pages_v_blocks_feature_statement_grid_cards" ADD CONSTRAINT "_expertise_pages_v_blocks_feature_statement_grid_cards_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_expertise_pages_v_blocks_feature_statement_grid_cards" ADD CONSTRAINT "_expertise_pages_v_blocks_feature_statement_grid_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_expertise_pages_v_blocks_feature_statement_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_expertise_pages_v_blocks_feature_statement_grid" ADD CONSTRAINT "_expertise_pages_v_blocks_feature_statement_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_expertise_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "audience_pages_blocks_feature_statement_grid_cards" ADD CONSTRAINT "audience_pages_blocks_feature_statement_grid_cards_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "audience_pages_blocks_feature_statement_grid_cards" ADD CONSTRAINT "audience_pages_blocks_feature_statement_grid_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."audience_pages_blocks_feature_statement_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "audience_pages_blocks_feature_statement_grid" ADD CONSTRAINT "audience_pages_blocks_feature_statement_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."audience_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_audience_pages_v_blocks_feature_statement_grid_cards" ADD CONSTRAINT "_audience_pages_v_blocks_feature_statement_grid_cards_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_audience_pages_v_blocks_feature_statement_grid_cards" ADD CONSTRAINT "_audience_pages_v_blocks_feature_statement_grid_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_audience_pages_v_blocks_feature_statement_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_audience_pages_v_blocks_feature_statement_grid" ADD CONSTRAINT "_audience_pages_v_blocks_feature_statement_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_audience_pages_v"("id") ON DELETE cascade ON UPDATE no action;
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
  ALTER TABLE "lab_projects_context_story_beats" ADD CONSTRAINT "lab_projects_context_story_beats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lab_projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lab_projects_challenge_story_beats" ADD CONSTRAINT "lab_projects_challenge_story_beats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lab_projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lab_projects_strategy_story_beats" ADD CONSTRAINT "lab_projects_strategy_story_beats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lab_projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lab_projects_approach_story_beats" ADD CONSTRAINT "lab_projects_approach_story_beats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lab_projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lab_projects_outcome_summary_story_beats" ADD CONSTRAINT "lab_projects_outcome_summary_story_beats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lab_projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lab_projects_learnings_story_beats" ADD CONSTRAINT "lab_projects_learnings_story_beats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lab_projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_lab_projects_v_version_context_story_beats" ADD CONSTRAINT "_lab_projects_v_version_context_story_beats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_lab_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_lab_projects_v_version_challenge_story_beats" ADD CONSTRAINT "_lab_projects_v_version_challenge_story_beats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_lab_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_lab_projects_v_version_strategy_story_beats" ADD CONSTRAINT "_lab_projects_v_version_strategy_story_beats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_lab_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_lab_projects_v_version_approach_story_beats" ADD CONSTRAINT "_lab_projects_v_version_approach_story_beats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_lab_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_lab_projects_v_version_outcome_summary_story_beats" ADD CONSTRAINT "_lab_projects_v_version_outcome_summary_story_beats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_lab_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_lab_projects_v_version_learnings_story_beats" ADD CONSTRAINT "_lab_projects_v_version_learnings_story_beats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_lab_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_blocks_feature_statement_grid_cards" ADD CONSTRAINT "home_blocks_feature_statement_grid_cards_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_blocks_feature_statement_grid_cards" ADD CONSTRAINT "home_blocks_feature_statement_grid_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_blocks_feature_statement_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_blocks_feature_statement_grid" ADD CONSTRAINT "home_blocks_feature_statement_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_blocks_feature_statement_grid_cards" ADD CONSTRAINT "_home_v_blocks_feature_statement_grid_cards_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_home_v_blocks_feature_statement_grid_cards" ADD CONSTRAINT "_home_v_blocks_feature_statement_grid_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v_blocks_feature_statement_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_blocks_feature_statement_grid" ADD CONSTRAINT "_home_v_blocks_feature_statement_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_feature_statement_grid_cards_order_idx" ON "pages_blocks_feature_statement_grid_cards" USING btree ("_order");
  CREATE INDEX "pages_blocks_feature_statement_grid_cards_parent_id_idx" ON "pages_blocks_feature_statement_grid_cards" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_feature_statement_grid_cards_media_idx" ON "pages_blocks_feature_statement_grid_cards" USING btree ("media_id");
  CREATE INDEX "pages_blocks_feature_statement_grid_order_idx" ON "pages_blocks_feature_statement_grid" USING btree ("_order");
  CREATE INDEX "pages_blocks_feature_statement_grid_parent_id_idx" ON "pages_blocks_feature_statement_grid" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_feature_statement_grid_path_idx" ON "pages_blocks_feature_statement_grid" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_feature_statement_grid_cards_order_idx" ON "_pages_v_blocks_feature_statement_grid_cards" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_feature_statement_grid_cards_parent_id_idx" ON "_pages_v_blocks_feature_statement_grid_cards" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_feature_statement_grid_cards_media_idx" ON "_pages_v_blocks_feature_statement_grid_cards" USING btree ("media_id");
  CREATE INDEX "_pages_v_blocks_feature_statement_grid_order_idx" ON "_pages_v_blocks_feature_statement_grid" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_feature_statement_grid_parent_id_idx" ON "_pages_v_blocks_feature_statement_grid" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_feature_statement_grid_path_idx" ON "_pages_v_blocks_feature_statement_grid" USING btree ("_path");
  CREATE INDEX "work_pages_blocks_feature_statement_grid_cards_order_idx" ON "work_pages_blocks_feature_statement_grid_cards" USING btree ("_order");
  CREATE INDEX "work_pages_blocks_feature_statement_grid_cards_parent_id_idx" ON "work_pages_blocks_feature_statement_grid_cards" USING btree ("_parent_id");
  CREATE INDEX "work_pages_blocks_feature_statement_grid_cards_media_idx" ON "work_pages_blocks_feature_statement_grid_cards" USING btree ("media_id");
  CREATE INDEX "work_pages_blocks_feature_statement_grid_order_idx" ON "work_pages_blocks_feature_statement_grid" USING btree ("_order");
  CREATE INDEX "work_pages_blocks_feature_statement_grid_parent_id_idx" ON "work_pages_blocks_feature_statement_grid" USING btree ("_parent_id");
  CREATE INDEX "work_pages_blocks_feature_statement_grid_path_idx" ON "work_pages_blocks_feature_statement_grid" USING btree ("_path");
  CREATE INDEX "_work_pages_v_blocks_feature_statement_grid_cards_order_idx" ON "_work_pages_v_blocks_feature_statement_grid_cards" USING btree ("_order");
  CREATE INDEX "_work_pages_v_blocks_feature_statement_grid_cards_parent_id_idx" ON "_work_pages_v_blocks_feature_statement_grid_cards" USING btree ("_parent_id");
  CREATE INDEX "_work_pages_v_blocks_feature_statement_grid_cards_media_idx" ON "_work_pages_v_blocks_feature_statement_grid_cards" USING btree ("media_id");
  CREATE INDEX "_work_pages_v_blocks_feature_statement_grid_order_idx" ON "_work_pages_v_blocks_feature_statement_grid" USING btree ("_order");
  CREATE INDEX "_work_pages_v_blocks_feature_statement_grid_parent_id_idx" ON "_work_pages_v_blocks_feature_statement_grid" USING btree ("_parent_id");
  CREATE INDEX "_work_pages_v_blocks_feature_statement_grid_path_idx" ON "_work_pages_v_blocks_feature_statement_grid" USING btree ("_path");
  CREATE INDEX "lab_pages_blocks_feature_statement_grid_cards_order_idx" ON "lab_pages_blocks_feature_statement_grid_cards" USING btree ("_order");
  CREATE INDEX "lab_pages_blocks_feature_statement_grid_cards_parent_id_idx" ON "lab_pages_blocks_feature_statement_grid_cards" USING btree ("_parent_id");
  CREATE INDEX "lab_pages_blocks_feature_statement_grid_cards_media_idx" ON "lab_pages_blocks_feature_statement_grid_cards" USING btree ("media_id");
  CREATE INDEX "lab_pages_blocks_feature_statement_grid_order_idx" ON "lab_pages_blocks_feature_statement_grid" USING btree ("_order");
  CREATE INDEX "lab_pages_blocks_feature_statement_grid_parent_id_idx" ON "lab_pages_blocks_feature_statement_grid" USING btree ("_parent_id");
  CREATE INDEX "lab_pages_blocks_feature_statement_grid_path_idx" ON "lab_pages_blocks_feature_statement_grid" USING btree ("_path");
  CREATE INDEX "_lab_pages_v_blocks_feature_statement_grid_cards_order_idx" ON "_lab_pages_v_blocks_feature_statement_grid_cards" USING btree ("_order");
  CREATE INDEX "_lab_pages_v_blocks_feature_statement_grid_cards_parent_id_idx" ON "_lab_pages_v_blocks_feature_statement_grid_cards" USING btree ("_parent_id");
  CREATE INDEX "_lab_pages_v_blocks_feature_statement_grid_cards_media_idx" ON "_lab_pages_v_blocks_feature_statement_grid_cards" USING btree ("media_id");
  CREATE INDEX "_lab_pages_v_blocks_feature_statement_grid_order_idx" ON "_lab_pages_v_blocks_feature_statement_grid" USING btree ("_order");
  CREATE INDEX "_lab_pages_v_blocks_feature_statement_grid_parent_id_idx" ON "_lab_pages_v_blocks_feature_statement_grid" USING btree ("_parent_id");
  CREATE INDEX "_lab_pages_v_blocks_feature_statement_grid_path_idx" ON "_lab_pages_v_blocks_feature_statement_grid" USING btree ("_path");
  CREATE INDEX "expertise_pages_blocks_feature_statement_grid_cards_order_idx" ON "expertise_pages_blocks_feature_statement_grid_cards" USING btree ("_order");
  CREATE INDEX "expertise_pages_blocks_feature_statement_grid_cards_parent_id_idx" ON "expertise_pages_blocks_feature_statement_grid_cards" USING btree ("_parent_id");
  CREATE INDEX "expertise_pages_blocks_feature_statement_grid_cards_medi_idx" ON "expertise_pages_blocks_feature_statement_grid_cards" USING btree ("media_id");
  CREATE INDEX "expertise_pages_blocks_feature_statement_grid_order_idx" ON "expertise_pages_blocks_feature_statement_grid" USING btree ("_order");
  CREATE INDEX "expertise_pages_blocks_feature_statement_grid_parent_id_idx" ON "expertise_pages_blocks_feature_statement_grid" USING btree ("_parent_id");
  CREATE INDEX "expertise_pages_blocks_feature_statement_grid_path_idx" ON "expertise_pages_blocks_feature_statement_grid" USING btree ("_path");
  CREATE INDEX "_expertise_pages_v_blocks_feature_statement_grid_cards_order_idx" ON "_expertise_pages_v_blocks_feature_statement_grid_cards" USING btree ("_order");
  CREATE INDEX "_expertise_pages_v_blocks_feature_statement_grid_cards_parent_id_idx" ON "_expertise_pages_v_blocks_feature_statement_grid_cards" USING btree ("_parent_id");
  CREATE INDEX "_expertise_pages_v_blocks_feature_statement_grid_cards_m_idx" ON "_expertise_pages_v_blocks_feature_statement_grid_cards" USING btree ("media_id");
  CREATE INDEX "_expertise_pages_v_blocks_feature_statement_grid_order_idx" ON "_expertise_pages_v_blocks_feature_statement_grid" USING btree ("_order");
  CREATE INDEX "_expertise_pages_v_blocks_feature_statement_grid_parent_id_idx" ON "_expertise_pages_v_blocks_feature_statement_grid" USING btree ("_parent_id");
  CREATE INDEX "_expertise_pages_v_blocks_feature_statement_grid_path_idx" ON "_expertise_pages_v_blocks_feature_statement_grid" USING btree ("_path");
  CREATE INDEX "audience_pages_blocks_feature_statement_grid_cards_order_idx" ON "audience_pages_blocks_feature_statement_grid_cards" USING btree ("_order");
  CREATE INDEX "audience_pages_blocks_feature_statement_grid_cards_parent_id_idx" ON "audience_pages_blocks_feature_statement_grid_cards" USING btree ("_parent_id");
  CREATE INDEX "audience_pages_blocks_feature_statement_grid_cards_media_idx" ON "audience_pages_blocks_feature_statement_grid_cards" USING btree ("media_id");
  CREATE INDEX "audience_pages_blocks_feature_statement_grid_order_idx" ON "audience_pages_blocks_feature_statement_grid" USING btree ("_order");
  CREATE INDEX "audience_pages_blocks_feature_statement_grid_parent_id_idx" ON "audience_pages_blocks_feature_statement_grid" USING btree ("_parent_id");
  CREATE INDEX "audience_pages_blocks_feature_statement_grid_path_idx" ON "audience_pages_blocks_feature_statement_grid" USING btree ("_path");
  CREATE INDEX "_audience_pages_v_blocks_feature_statement_grid_cards_order_idx" ON "_audience_pages_v_blocks_feature_statement_grid_cards" USING btree ("_order");
  CREATE INDEX "_audience_pages_v_blocks_feature_statement_grid_cards_parent_id_idx" ON "_audience_pages_v_blocks_feature_statement_grid_cards" USING btree ("_parent_id");
  CREATE INDEX "_audience_pages_v_blocks_feature_statement_grid_cards_me_idx" ON "_audience_pages_v_blocks_feature_statement_grid_cards" USING btree ("media_id");
  CREATE INDEX "_audience_pages_v_blocks_feature_statement_grid_order_idx" ON "_audience_pages_v_blocks_feature_statement_grid" USING btree ("_order");
  CREATE INDEX "_audience_pages_v_blocks_feature_statement_grid_parent_id_idx" ON "_audience_pages_v_blocks_feature_statement_grid" USING btree ("_parent_id");
  CREATE INDEX "_audience_pages_v_blocks_feature_statement_grid_path_idx" ON "_audience_pages_v_blocks_feature_statement_grid" USING btree ("_path");
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
  CREATE INDEX "_case_studies_v_version_learnings_story_beats_parent_id_idx" ON "_case_studies_v_version_learnings_story_beats" USING btree ("_parent_id");
  CREATE INDEX "lab_projects_context_story_beats_order_idx" ON "lab_projects_context_story_beats" USING btree ("_order");
  CREATE INDEX "lab_projects_context_story_beats_parent_id_idx" ON "lab_projects_context_story_beats" USING btree ("_parent_id");
  CREATE INDEX "lab_projects_challenge_story_beats_order_idx" ON "lab_projects_challenge_story_beats" USING btree ("_order");
  CREATE INDEX "lab_projects_challenge_story_beats_parent_id_idx" ON "lab_projects_challenge_story_beats" USING btree ("_parent_id");
  CREATE INDEX "lab_projects_strategy_story_beats_order_idx" ON "lab_projects_strategy_story_beats" USING btree ("_order");
  CREATE INDEX "lab_projects_strategy_story_beats_parent_id_idx" ON "lab_projects_strategy_story_beats" USING btree ("_parent_id");
  CREATE INDEX "lab_projects_approach_story_beats_order_idx" ON "lab_projects_approach_story_beats" USING btree ("_order");
  CREATE INDEX "lab_projects_approach_story_beats_parent_id_idx" ON "lab_projects_approach_story_beats" USING btree ("_parent_id");
  CREATE INDEX "lab_projects_outcome_summary_story_beats_order_idx" ON "lab_projects_outcome_summary_story_beats" USING btree ("_order");
  CREATE INDEX "lab_projects_outcome_summary_story_beats_parent_id_idx" ON "lab_projects_outcome_summary_story_beats" USING btree ("_parent_id");
  CREATE INDEX "lab_projects_learnings_story_beats_order_idx" ON "lab_projects_learnings_story_beats" USING btree ("_order");
  CREATE INDEX "lab_projects_learnings_story_beats_parent_id_idx" ON "lab_projects_learnings_story_beats" USING btree ("_parent_id");
  CREATE INDEX "_lab_projects_v_version_context_story_beats_order_idx" ON "_lab_projects_v_version_context_story_beats" USING btree ("_order");
  CREATE INDEX "_lab_projects_v_version_context_story_beats_parent_id_idx" ON "_lab_projects_v_version_context_story_beats" USING btree ("_parent_id");
  CREATE INDEX "_lab_projects_v_version_challenge_story_beats_order_idx" ON "_lab_projects_v_version_challenge_story_beats" USING btree ("_order");
  CREATE INDEX "_lab_projects_v_version_challenge_story_beats_parent_id_idx" ON "_lab_projects_v_version_challenge_story_beats" USING btree ("_parent_id");
  CREATE INDEX "_lab_projects_v_version_strategy_story_beats_order_idx" ON "_lab_projects_v_version_strategy_story_beats" USING btree ("_order");
  CREATE INDEX "_lab_projects_v_version_strategy_story_beats_parent_id_idx" ON "_lab_projects_v_version_strategy_story_beats" USING btree ("_parent_id");
  CREATE INDEX "_lab_projects_v_version_approach_story_beats_order_idx" ON "_lab_projects_v_version_approach_story_beats" USING btree ("_order");
  CREATE INDEX "_lab_projects_v_version_approach_story_beats_parent_id_idx" ON "_lab_projects_v_version_approach_story_beats" USING btree ("_parent_id");
  CREATE INDEX "_lab_projects_v_version_outcome_summary_story_beats_order_idx" ON "_lab_projects_v_version_outcome_summary_story_beats" USING btree ("_order");
  CREATE INDEX "_lab_projects_v_version_outcome_summary_story_beats_parent_id_idx" ON "_lab_projects_v_version_outcome_summary_story_beats" USING btree ("_parent_id");
  CREATE INDEX "_lab_projects_v_version_learnings_story_beats_order_idx" ON "_lab_projects_v_version_learnings_story_beats" USING btree ("_order");
  CREATE INDEX "_lab_projects_v_version_learnings_story_beats_parent_id_idx" ON "_lab_projects_v_version_learnings_story_beats" USING btree ("_parent_id");
  CREATE INDEX "home_blocks_feature_statement_grid_cards_order_idx" ON "home_blocks_feature_statement_grid_cards" USING btree ("_order");
  CREATE INDEX "home_blocks_feature_statement_grid_cards_parent_id_idx" ON "home_blocks_feature_statement_grid_cards" USING btree ("_parent_id");
  CREATE INDEX "home_blocks_feature_statement_grid_cards_media_idx" ON "home_blocks_feature_statement_grid_cards" USING btree ("media_id");
  CREATE INDEX "home_blocks_feature_statement_grid_order_idx" ON "home_blocks_feature_statement_grid" USING btree ("_order");
  CREATE INDEX "home_blocks_feature_statement_grid_parent_id_idx" ON "home_blocks_feature_statement_grid" USING btree ("_parent_id");
  CREATE INDEX "home_blocks_feature_statement_grid_path_idx" ON "home_blocks_feature_statement_grid" USING btree ("_path");
  CREATE INDEX "_home_v_blocks_feature_statement_grid_cards_order_idx" ON "_home_v_blocks_feature_statement_grid_cards" USING btree ("_order");
  CREATE INDEX "_home_v_blocks_feature_statement_grid_cards_parent_id_idx" ON "_home_v_blocks_feature_statement_grid_cards" USING btree ("_parent_id");
  CREATE INDEX "_home_v_blocks_feature_statement_grid_cards_media_idx" ON "_home_v_blocks_feature_statement_grid_cards" USING btree ("media_id");
  CREATE INDEX "_home_v_blocks_feature_statement_grid_order_idx" ON "_home_v_blocks_feature_statement_grid" USING btree ("_order");
  CREATE INDEX "_home_v_blocks_feature_statement_grid_parent_id_idx" ON "_home_v_blocks_feature_statement_grid" USING btree ("_parent_id");
  CREATE INDEX "_home_v_blocks_feature_statement_grid_path_idx" ON "_home_v_blocks_feature_statement_grid" USING btree ("_path");`)
}
