import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_feature_statement_grid" ADD COLUMN "browse_all_media" boolean DEFAULT false;
  ALTER TABLE "pages_blocks_feature_tabs" ADD COLUMN "browse_all_media" boolean DEFAULT false;
  ALTER TABLE "pages_image_statement" ADD COLUMN "browse_all_media" boolean DEFAULT false;
  ALTER TABLE "_pages_v_blocks_feature_statement_grid" ADD COLUMN "browse_all_media" boolean DEFAULT false;
  ALTER TABLE "_pages_v_blocks_feature_tabs" ADD COLUMN "browse_all_media" boolean DEFAULT false;
  ALTER TABLE "__pages_v_image_statement_v" ADD COLUMN "browse_all_media" boolean DEFAULT false;
  ALTER TABLE "work_pages_blocks_feature_statement_grid" ADD COLUMN "browse_all_media" boolean DEFAULT false;
  ALTER TABLE "work_pages_image_statement" ADD COLUMN "browse_all_media" boolean DEFAULT false;
  ALTER TABLE "work_pages_blocks_feature_tabs" ADD COLUMN "browse_all_media" boolean DEFAULT false;
  ALTER TABLE "_work_pages_v_blocks_feature_statement_grid" ADD COLUMN "browse_all_media" boolean DEFAULT false;
  ALTER TABLE "__work_pages_v_image_statement_v" ADD COLUMN "browse_all_media" boolean DEFAULT false;
  ALTER TABLE "_work_pages_v_blocks_feature_tabs" ADD COLUMN "browse_all_media" boolean DEFAULT false;
  ALTER TABLE "expertise_pages_blocks_feature_statement_grid" ADD COLUMN "browse_all_media" boolean DEFAULT false;
  ALTER TABLE "expertise_pages_blocks_feature_tabs" ADD COLUMN "browse_all_media" boolean DEFAULT false;
  ALTER TABLE "expertise_pages_image_statement" ADD COLUMN "browse_all_media" boolean DEFAULT false;
  ALTER TABLE "_expertise_pages_v_blocks_feature_statement_grid" ADD COLUMN "browse_all_media" boolean DEFAULT false;
  ALTER TABLE "_expertise_pages_v_blocks_feature_tabs" ADD COLUMN "browse_all_media" boolean DEFAULT false;
  ALTER TABLE "__expertise_pages_v_image_statement_v" ADD COLUMN "browse_all_media" boolean DEFAULT false;
  ALTER TABLE "audience_pages_blocks_feature_statement_grid" ADD COLUMN "browse_all_media" boolean DEFAULT false;
  ALTER TABLE "audience_pages_blocks_feature_tabs" ADD COLUMN "browse_all_media" boolean DEFAULT false;
  ALTER TABLE "audience_pages_image_statement" ADD COLUMN "browse_all_media" boolean DEFAULT false;
  ALTER TABLE "_audience_pages_v_blocks_feature_statement_grid" ADD COLUMN "browse_all_media" boolean DEFAULT false;
  ALTER TABLE "_audience_pages_v_blocks_feature_tabs" ADD COLUMN "browse_all_media" boolean DEFAULT false;
  ALTER TABLE "__audience_pages_v_image_statement_v" ADD COLUMN "browse_all_media" boolean DEFAULT false;
  ALTER TABLE "home_blocks_feature_statement_grid" ADD COLUMN "browse_all_media" boolean DEFAULT false;
  ALTER TABLE "home_blocks_feature_tabs" ADD COLUMN "browse_all_media" boolean DEFAULT false;
  ALTER TABLE "home_image_statement" ADD COLUMN "browse_all_media" boolean DEFAULT false;
  ALTER TABLE "_home_v_blocks_feature_statement_grid" ADD COLUMN "browse_all_media" boolean DEFAULT false;
  ALTER TABLE "_home_v_blocks_feature_tabs" ADD COLUMN "browse_all_media" boolean DEFAULT false;
  ALTER TABLE "__home_v_image_statement_v" ADD COLUMN "browse_all_media" boolean DEFAULT false;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_feature_statement_grid" DROP COLUMN "browse_all_media";
  ALTER TABLE "pages_blocks_feature_tabs" DROP COLUMN "browse_all_media";
  ALTER TABLE "pages_image_statement" DROP COLUMN "browse_all_media";
  ALTER TABLE "_pages_v_blocks_feature_statement_grid" DROP COLUMN "browse_all_media";
  ALTER TABLE "_pages_v_blocks_feature_tabs" DROP COLUMN "browse_all_media";
  ALTER TABLE "__pages_v_image_statement_v" DROP COLUMN "browse_all_media";
  ALTER TABLE "work_pages_blocks_feature_statement_grid" DROP COLUMN "browse_all_media";
  ALTER TABLE "work_pages_image_statement" DROP COLUMN "browse_all_media";
  ALTER TABLE "work_pages_blocks_feature_tabs" DROP COLUMN "browse_all_media";
  ALTER TABLE "_work_pages_v_blocks_feature_statement_grid" DROP COLUMN "browse_all_media";
  ALTER TABLE "__work_pages_v_image_statement_v" DROP COLUMN "browse_all_media";
  ALTER TABLE "_work_pages_v_blocks_feature_tabs" DROP COLUMN "browse_all_media";
  ALTER TABLE "expertise_pages_blocks_feature_statement_grid" DROP COLUMN "browse_all_media";
  ALTER TABLE "expertise_pages_blocks_feature_tabs" DROP COLUMN "browse_all_media";
  ALTER TABLE "expertise_pages_image_statement" DROP COLUMN "browse_all_media";
  ALTER TABLE "_expertise_pages_v_blocks_feature_statement_grid" DROP COLUMN "browse_all_media";
  ALTER TABLE "_expertise_pages_v_blocks_feature_tabs" DROP COLUMN "browse_all_media";
  ALTER TABLE "__expertise_pages_v_image_statement_v" DROP COLUMN "browse_all_media";
  ALTER TABLE "audience_pages_blocks_feature_statement_grid" DROP COLUMN "browse_all_media";
  ALTER TABLE "audience_pages_blocks_feature_tabs" DROP COLUMN "browse_all_media";
  ALTER TABLE "audience_pages_image_statement" DROP COLUMN "browse_all_media";
  ALTER TABLE "_audience_pages_v_blocks_feature_statement_grid" DROP COLUMN "browse_all_media";
  ALTER TABLE "_audience_pages_v_blocks_feature_tabs" DROP COLUMN "browse_all_media";
  ALTER TABLE "__audience_pages_v_image_statement_v" DROP COLUMN "browse_all_media";
  ALTER TABLE "home_blocks_feature_statement_grid" DROP COLUMN "browse_all_media";
  ALTER TABLE "home_blocks_feature_tabs" DROP COLUMN "browse_all_media";
  ALTER TABLE "home_image_statement" DROP COLUMN "browse_all_media";
  ALTER TABLE "_home_v_blocks_feature_statement_grid" DROP COLUMN "browse_all_media";
  ALTER TABLE "_home_v_blocks_feature_tabs" DROP COLUMN "browse_all_media";
  ALTER TABLE "__home_v_image_statement_v" DROP COLUMN "browse_all_media";`)
}
