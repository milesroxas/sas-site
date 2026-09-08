import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_feature_tabs_tab_size" AS ENUM('default', 'small');
  CREATE TYPE "public"."enum__pages_v_blocks_feature_tabs_tab_size" AS ENUM('default', 'small');
  CREATE TYPE "public"."enum_posts_blocks_feature_tabs_tab_size" AS ENUM('default', 'small');
  CREATE TYPE "public"."enum__posts_v_blocks_feature_tabs_tab_size" AS ENUM('default', 'small');
  CREATE TYPE "public"."enum_work_pages_blocks_feature_tabs_tab_size" AS ENUM('default', 'small');
  CREATE TYPE "public"."enum__work_pages_v_blocks_feature_tabs_tab_size" AS ENUM('default', 'small');
  CREATE TYPE "public"."enum_lab_pages_blocks_feature_tabs_tab_size" AS ENUM('default', 'small');
  CREATE TYPE "public"."enum__lab_pages_v_blocks_feature_tabs_tab_size" AS ENUM('default', 'small');
  CREATE TYPE "public"."enum_expertise_pages_blocks_feature_tabs_tab_size" AS ENUM('default', 'small');
  CREATE TYPE "public"."enum__expertise_pages_v_blocks_feature_tabs_tab_size" AS ENUM('default', 'small');
  CREATE TYPE "public"."enum_audience_pages_blocks_feature_tabs_tab_size" AS ENUM('default', 'small');
  CREATE TYPE "public"."enum__audience_pages_v_blocks_feature_tabs_tab_size" AS ENUM('default', 'small');
  CREATE TYPE "public"."enum_home_blocks_feature_tabs_tab_size" AS ENUM('default', 'small');
  CREATE TYPE "public"."enum__home_v_blocks_feature_tabs_tab_size" AS ENUM('default', 'small');
  ALTER TABLE "pages_blocks_feature_tabs" ADD COLUMN "tab_size" "enum_pages_blocks_feature_tabs_tab_size" DEFAULT 'default';
  ALTER TABLE "_pages_v_blocks_feature_tabs" ADD COLUMN "tab_size" "enum__pages_v_blocks_feature_tabs_tab_size" DEFAULT 'default';
  ALTER TABLE "posts_blocks_feature_tabs" ADD COLUMN "tab_size" "enum_posts_blocks_feature_tabs_tab_size" DEFAULT 'default';
  ALTER TABLE "_posts_v_blocks_feature_tabs" ADD COLUMN "tab_size" "enum__posts_v_blocks_feature_tabs_tab_size" DEFAULT 'default';
  ALTER TABLE "work_pages_blocks_feature_tabs" ADD COLUMN "tab_size" "enum_work_pages_blocks_feature_tabs_tab_size" DEFAULT 'default';
  ALTER TABLE "_work_pages_v_blocks_feature_tabs" ADD COLUMN "tab_size" "enum__work_pages_v_blocks_feature_tabs_tab_size" DEFAULT 'default';
  ALTER TABLE "lab_pages_blocks_feature_tabs" ADD COLUMN "tab_size" "enum_lab_pages_blocks_feature_tabs_tab_size" DEFAULT 'default';
  ALTER TABLE "_lab_pages_v_blocks_feature_tabs" ADD COLUMN "tab_size" "enum__lab_pages_v_blocks_feature_tabs_tab_size" DEFAULT 'default';
  ALTER TABLE "expertise_pages_blocks_feature_tabs" ADD COLUMN "tab_size" "enum_expertise_pages_blocks_feature_tabs_tab_size" DEFAULT 'default';
  ALTER TABLE "_expertise_pages_v_blocks_feature_tabs" ADD COLUMN "tab_size" "enum__expertise_pages_v_blocks_feature_tabs_tab_size" DEFAULT 'default';
  ALTER TABLE "audience_pages_blocks_feature_tabs" ADD COLUMN "tab_size" "enum_audience_pages_blocks_feature_tabs_tab_size" DEFAULT 'default';
  ALTER TABLE "_audience_pages_v_blocks_feature_tabs" ADD COLUMN "tab_size" "enum__audience_pages_v_blocks_feature_tabs_tab_size" DEFAULT 'default';
  ALTER TABLE "home_blocks_feature_tabs" ADD COLUMN "tab_size" "enum_home_blocks_feature_tabs_tab_size" DEFAULT 'default';
  ALTER TABLE "_home_v_blocks_feature_tabs" ADD COLUMN "tab_size" "enum__home_v_blocks_feature_tabs_tab_size" DEFAULT 'default';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_feature_tabs" DROP COLUMN "tab_size";
  ALTER TABLE "_pages_v_blocks_feature_tabs" DROP COLUMN "tab_size";
  ALTER TABLE "posts_blocks_feature_tabs" DROP COLUMN "tab_size";
  ALTER TABLE "_posts_v_blocks_feature_tabs" DROP COLUMN "tab_size";
  ALTER TABLE "work_pages_blocks_feature_tabs" DROP COLUMN "tab_size";
  ALTER TABLE "_work_pages_v_blocks_feature_tabs" DROP COLUMN "tab_size";
  ALTER TABLE "lab_pages_blocks_feature_tabs" DROP COLUMN "tab_size";
  ALTER TABLE "_lab_pages_v_blocks_feature_tabs" DROP COLUMN "tab_size";
  ALTER TABLE "expertise_pages_blocks_feature_tabs" DROP COLUMN "tab_size";
  ALTER TABLE "_expertise_pages_v_blocks_feature_tabs" DROP COLUMN "tab_size";
  ALTER TABLE "audience_pages_blocks_feature_tabs" DROP COLUMN "tab_size";
  ALTER TABLE "_audience_pages_v_blocks_feature_tabs" DROP COLUMN "tab_size";
  ALTER TABLE "home_blocks_feature_tabs" DROP COLUMN "tab_size";
  ALTER TABLE "_home_v_blocks_feature_tabs" DROP COLUMN "tab_size";
  DROP TYPE "public"."enum_pages_blocks_feature_tabs_tab_size";
  DROP TYPE "public"."enum__pages_v_blocks_feature_tabs_tab_size";
  DROP TYPE "public"."enum_posts_blocks_feature_tabs_tab_size";
  DROP TYPE "public"."enum__posts_v_blocks_feature_tabs_tab_size";
  DROP TYPE "public"."enum_work_pages_blocks_feature_tabs_tab_size";
  DROP TYPE "public"."enum__work_pages_v_blocks_feature_tabs_tab_size";
  DROP TYPE "public"."enum_lab_pages_blocks_feature_tabs_tab_size";
  DROP TYPE "public"."enum__lab_pages_v_blocks_feature_tabs_tab_size";
  DROP TYPE "public"."enum_expertise_pages_blocks_feature_tabs_tab_size";
  DROP TYPE "public"."enum__expertise_pages_v_blocks_feature_tabs_tab_size";
  DROP TYPE "public"."enum_audience_pages_blocks_feature_tabs_tab_size";
  DROP TYPE "public"."enum__audience_pages_v_blocks_feature_tabs_tab_size";
  DROP TYPE "public"."enum_home_blocks_feature_tabs_tab_size";
  DROP TYPE "public"."enum__home_v_blocks_feature_tabs_tab_size";`)
}
