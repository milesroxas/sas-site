import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_wp_story_story_scope" AS ENUM('overview', 'section', 'beat');
  CREATE TYPE "public"."enum_work_pages_full_media_story_scope" AS ENUM('overview', 'section', 'beat');
  CREATE TYPE "public"."enum_work_pages_image_pair_story_scope" AS ENUM('overview', 'section', 'beat');
  CREATE TYPE "public"."enum_work_pages_split_offset_story_scope" AS ENUM('overview', 'section', 'beat');
  CREATE TYPE "public"."enum_work_pages_split_narrow_story_scope" AS ENUM('overview', 'section', 'beat');
  CREATE TYPE "public"."enum_work_pages_blocks_feature_statement_grid_story_scope" AS ENUM('overview', 'section', 'beat');
  CREATE TYPE "public"."enum_work_pages_blocks_feature_heading_offset_story_scope" AS ENUM('overview', 'section', 'beat');
  CREATE TYPE "public"."enum_work_pages_image_statement_story_scope" AS ENUM('overview', 'section', 'beat');
  CREATE TYPE "public"."enum_work_pages_blocks_feature_tabs_tabs_story_scope" AS ENUM('overview', 'section', 'beat');
  CREATE TYPE "public"."enum__wp_story_v_story_scope" AS ENUM('overview', 'section', 'beat');
  CREATE TYPE "public"."enum___work_pages_v_full_media_v_story_scope" AS ENUM('overview', 'section', 'beat');
  CREATE TYPE "public"."enum___work_pages_v_image_pair_v_story_scope" AS ENUM('overview', 'section', 'beat');
  CREATE TYPE "public"."enum___work_pages_v_split_offset_v_story_scope" AS ENUM('overview', 'section', 'beat');
  CREATE TYPE "public"."enum___work_pages_v_split_narrow_v_story_scope" AS ENUM('overview', 'section', 'beat');
  CREATE TYPE "public"."enum__work_pages_v_blocks_feature_statement_grid_story_scope" AS ENUM('overview', 'section', 'beat');
  CREATE TYPE "public"."enum__work_pages_v_blocks_feature_heading_offset_story_scope" AS ENUM('overview', 'section', 'beat');
  CREATE TYPE "public"."enum___work_pages_v_image_statement_v_story_scope" AS ENUM('overview', 'section', 'beat');
  CREATE TYPE "public"."enum__work_pages_v_blocks_feature_tabs_tabs_story_scope" AS ENUM('overview', 'section', 'beat');
  ALTER TABLE "wp_story" ADD COLUMN "story_scope" "enum_wp_story_story_scope" DEFAULT 'overview';
  ALTER TABLE "wp_story" ADD COLUMN "show_overrides" boolean DEFAULT false;
  ALTER TABLE "work_pages_full_media" ADD COLUMN "story_scope" "enum_work_pages_full_media_story_scope" DEFAULT 'overview';
  ALTER TABLE "work_pages_full_media" ADD COLUMN "show_overrides" boolean DEFAULT false;
  ALTER TABLE "work_pages_image_pair" ADD COLUMN "story_scope" "enum_work_pages_image_pair_story_scope" DEFAULT 'overview';
  ALTER TABLE "work_pages_image_pair" ADD COLUMN "show_overrides" boolean DEFAULT false;
  ALTER TABLE "work_pages_split_offset" ADD COLUMN "story_scope" "enum_work_pages_split_offset_story_scope" DEFAULT 'overview';
  ALTER TABLE "work_pages_split_offset" ADD COLUMN "show_overrides" boolean DEFAULT false;
  ALTER TABLE "work_pages_split_narrow" ADD COLUMN "story_scope" "enum_work_pages_split_narrow_story_scope" DEFAULT 'overview';
  ALTER TABLE "work_pages_split_narrow" ADD COLUMN "show_overrides" boolean DEFAULT false;
  ALTER TABLE "work_pages_blocks_feature_statement_grid" ADD COLUMN "story_scope" "enum_work_pages_blocks_feature_statement_grid_story_scope" DEFAULT 'overview';
  ALTER TABLE "work_pages_blocks_feature_statement_grid" ADD COLUMN "show_overrides" boolean DEFAULT false;
  ALTER TABLE "work_pages_blocks_feature_heading_offset" ADD COLUMN "story_scope" "enum_work_pages_blocks_feature_heading_offset_story_scope" DEFAULT 'overview';
  ALTER TABLE "work_pages_blocks_feature_heading_offset" ADD COLUMN "show_overrides" boolean DEFAULT false;
  ALTER TABLE "work_pages_image_statement" ADD COLUMN "story_scope" "enum_work_pages_image_statement_story_scope" DEFAULT 'overview';
  ALTER TABLE "work_pages_image_statement" ADD COLUMN "show_overrides" boolean DEFAULT false;
  ALTER TABLE "work_pages_blocks_feature_tabs_tabs" ADD COLUMN "story_scope" "enum_work_pages_blocks_feature_tabs_tabs_story_scope" DEFAULT 'overview';
  ALTER TABLE "work_pages_blocks_feature_tabs_tabs" ADD COLUMN "show_overrides" boolean DEFAULT false;
  ALTER TABLE "_wp_story_v" ADD COLUMN "story_scope" "enum__wp_story_v_story_scope" DEFAULT 'overview';
  ALTER TABLE "_wp_story_v" ADD COLUMN "show_overrides" boolean DEFAULT false;
  ALTER TABLE "__work_pages_v_full_media_v" ADD COLUMN "story_scope" "enum___work_pages_v_full_media_v_story_scope" DEFAULT 'overview';
  ALTER TABLE "__work_pages_v_full_media_v" ADD COLUMN "show_overrides" boolean DEFAULT false;
  ALTER TABLE "__work_pages_v_image_pair_v" ADD COLUMN "story_scope" "enum___work_pages_v_image_pair_v_story_scope" DEFAULT 'overview';
  ALTER TABLE "__work_pages_v_image_pair_v" ADD COLUMN "show_overrides" boolean DEFAULT false;
  ALTER TABLE "__work_pages_v_split_offset_v" ADD COLUMN "story_scope" "enum___work_pages_v_split_offset_v_story_scope" DEFAULT 'overview';
  ALTER TABLE "__work_pages_v_split_offset_v" ADD COLUMN "show_overrides" boolean DEFAULT false;
  ALTER TABLE "__work_pages_v_split_narrow_v" ADD COLUMN "story_scope" "enum___work_pages_v_split_narrow_v_story_scope" DEFAULT 'overview';
  ALTER TABLE "__work_pages_v_split_narrow_v" ADD COLUMN "show_overrides" boolean DEFAULT false;
  ALTER TABLE "_work_pages_v_blocks_feature_statement_grid" ADD COLUMN "story_scope" "enum__work_pages_v_blocks_feature_statement_grid_story_scope" DEFAULT 'overview';
  ALTER TABLE "_work_pages_v_blocks_feature_statement_grid" ADD COLUMN "show_overrides" boolean DEFAULT false;
  ALTER TABLE "_work_pages_v_blocks_feature_heading_offset" ADD COLUMN "story_scope" "enum__work_pages_v_blocks_feature_heading_offset_story_scope" DEFAULT 'overview';
  ALTER TABLE "_work_pages_v_blocks_feature_heading_offset" ADD COLUMN "show_overrides" boolean DEFAULT false;
  ALTER TABLE "__work_pages_v_image_statement_v" ADD COLUMN "story_scope" "enum___work_pages_v_image_statement_v_story_scope" DEFAULT 'overview';
  ALTER TABLE "__work_pages_v_image_statement_v" ADD COLUMN "show_overrides" boolean DEFAULT false;
  ALTER TABLE "_work_pages_v_blocks_feature_tabs_tabs" ADD COLUMN "story_scope" "enum__work_pages_v_blocks_feature_tabs_tabs_story_scope" DEFAULT 'overview';
  ALTER TABLE "_work_pages_v_blocks_feature_tabs_tabs" ADD COLUMN "show_overrides" boolean DEFAULT false;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "wp_story" DROP COLUMN "story_scope";
  ALTER TABLE "wp_story" DROP COLUMN "show_overrides";
  ALTER TABLE "work_pages_full_media" DROP COLUMN "story_scope";
  ALTER TABLE "work_pages_full_media" DROP COLUMN "show_overrides";
  ALTER TABLE "work_pages_image_pair" DROP COLUMN "story_scope";
  ALTER TABLE "work_pages_image_pair" DROP COLUMN "show_overrides";
  ALTER TABLE "work_pages_split_offset" DROP COLUMN "story_scope";
  ALTER TABLE "work_pages_split_offset" DROP COLUMN "show_overrides";
  ALTER TABLE "work_pages_split_narrow" DROP COLUMN "story_scope";
  ALTER TABLE "work_pages_split_narrow" DROP COLUMN "show_overrides";
  ALTER TABLE "work_pages_blocks_feature_statement_grid" DROP COLUMN "story_scope";
  ALTER TABLE "work_pages_blocks_feature_statement_grid" DROP COLUMN "show_overrides";
  ALTER TABLE "work_pages_blocks_feature_heading_offset" DROP COLUMN "story_scope";
  ALTER TABLE "work_pages_blocks_feature_heading_offset" DROP COLUMN "show_overrides";
  ALTER TABLE "work_pages_image_statement" DROP COLUMN "story_scope";
  ALTER TABLE "work_pages_image_statement" DROP COLUMN "show_overrides";
  ALTER TABLE "work_pages_blocks_feature_tabs_tabs" DROP COLUMN "story_scope";
  ALTER TABLE "work_pages_blocks_feature_tabs_tabs" DROP COLUMN "show_overrides";
  ALTER TABLE "_wp_story_v" DROP COLUMN "story_scope";
  ALTER TABLE "_wp_story_v" DROP COLUMN "show_overrides";
  ALTER TABLE "__work_pages_v_full_media_v" DROP COLUMN "story_scope";
  ALTER TABLE "__work_pages_v_full_media_v" DROP COLUMN "show_overrides";
  ALTER TABLE "__work_pages_v_image_pair_v" DROP COLUMN "story_scope";
  ALTER TABLE "__work_pages_v_image_pair_v" DROP COLUMN "show_overrides";
  ALTER TABLE "__work_pages_v_split_offset_v" DROP COLUMN "story_scope";
  ALTER TABLE "__work_pages_v_split_offset_v" DROP COLUMN "show_overrides";
  ALTER TABLE "__work_pages_v_split_narrow_v" DROP COLUMN "story_scope";
  ALTER TABLE "__work_pages_v_split_narrow_v" DROP COLUMN "show_overrides";
  ALTER TABLE "_work_pages_v_blocks_feature_statement_grid" DROP COLUMN "story_scope";
  ALTER TABLE "_work_pages_v_blocks_feature_statement_grid" DROP COLUMN "show_overrides";
  ALTER TABLE "_work_pages_v_blocks_feature_heading_offset" DROP COLUMN "story_scope";
  ALTER TABLE "_work_pages_v_blocks_feature_heading_offset" DROP COLUMN "show_overrides";
  ALTER TABLE "__work_pages_v_image_statement_v" DROP COLUMN "story_scope";
  ALTER TABLE "__work_pages_v_image_statement_v" DROP COLUMN "show_overrides";
  ALTER TABLE "_work_pages_v_blocks_feature_tabs_tabs" DROP COLUMN "story_scope";
  ALTER TABLE "_work_pages_v_blocks_feature_tabs_tabs" DROP COLUMN "show_overrides";
  DROP TYPE "public"."enum_wp_story_story_scope";
  DROP TYPE "public"."enum_work_pages_full_media_story_scope";
  DROP TYPE "public"."enum_work_pages_image_pair_story_scope";
  DROP TYPE "public"."enum_work_pages_split_offset_story_scope";
  DROP TYPE "public"."enum_work_pages_split_narrow_story_scope";
  DROP TYPE "public"."enum_work_pages_blocks_feature_statement_grid_story_scope";
  DROP TYPE "public"."enum_work_pages_blocks_feature_heading_offset_story_scope";
  DROP TYPE "public"."enum_work_pages_image_statement_story_scope";
  DROP TYPE "public"."enum_work_pages_blocks_feature_tabs_tabs_story_scope";
  DROP TYPE "public"."enum__wp_story_v_story_scope";
  DROP TYPE "public"."enum___work_pages_v_full_media_v_story_scope";
  DROP TYPE "public"."enum___work_pages_v_image_pair_v_story_scope";
  DROP TYPE "public"."enum___work_pages_v_split_offset_v_story_scope";
  DROP TYPE "public"."enum___work_pages_v_split_narrow_v_story_scope";
  DROP TYPE "public"."enum__work_pages_v_blocks_feature_statement_grid_story_scope";
  DROP TYPE "public"."enum__work_pages_v_blocks_feature_heading_offset_story_scope";
  DROP TYPE "public"."enum___work_pages_v_image_statement_v_story_scope";
  DROP TYPE "public"."enum__work_pages_v_blocks_feature_tabs_tabs_story_scope";`)
}
