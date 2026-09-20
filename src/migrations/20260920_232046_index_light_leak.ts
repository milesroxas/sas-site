import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_insights_index_hero_shader_origin" AS ENUM('top-right', 'top-left', 'bottom-right', 'bottom-left');
  CREATE TYPE "public"."enum__insights_index_v_version_hero_shader_origin" AS ENUM('top-right', 'top-left', 'bottom-right', 'bottom-left');
  CREATE TYPE "public"."enum_lab_index_hero_shader_origin" AS ENUM('top-right', 'top-left', 'bottom-right', 'bottom-left');
  CREATE TYPE "public"."enum__lab_index_v_version_hero_shader_origin" AS ENUM('top-right', 'top-left', 'bottom-right', 'bottom-left');
  CREATE TYPE "public"."enum_works_index_hero_shader_origin" AS ENUM('top-right', 'top-left', 'bottom-right', 'bottom-left');
  CREATE TYPE "public"."enum__works_index_v_version_hero_shader_origin" AS ENUM('top-right', 'top-left', 'bottom-right', 'bottom-left');
  ALTER TYPE "public"."enum_insights_index_hero_visual_type" ADD VALUE 'lightLeak';
  ALTER TYPE "public"."enum__insights_index_v_version_hero_visual_type" ADD VALUE 'lightLeak';
  ALTER TYPE "public"."enum_lab_index_hero_visual_type" ADD VALUE 'lightLeak';
  ALTER TYPE "public"."enum__lab_index_v_version_hero_visual_type" ADD VALUE 'lightLeak';
  ALTER TYPE "public"."enum_works_index_hero_visual_type" ADD VALUE 'lightLeak';
  ALTER TYPE "public"."enum__works_index_v_version_hero_visual_type" ADD VALUE 'lightLeak';
  ALTER TABLE "insights_index" ADD COLUMN "hero_shader_bleed" boolean DEFAULT false;
  ALTER TABLE "insights_index" ADD COLUMN "hero_shader_origin" "enum_insights_index_hero_shader_origin" DEFAULT 'top-right';
  ALTER TABLE "insights_index" ADD COLUMN "hero_shader_show_media" boolean DEFAULT false;
  ALTER TABLE "insights_index" ADD COLUMN "hero_shader_hover_targets" "enum_leak_hover_targets";
  ALTER TABLE "insights_index" ADD COLUMN "hero_shader_section_hover" numeric;
  ALTER TABLE "_insights_index_v" ADD COLUMN "version_hero_shader_bleed" boolean DEFAULT false;
  ALTER TABLE "_insights_index_v" ADD COLUMN "version_hero_shader_origin" "enum__insights_index_v_version_hero_shader_origin" DEFAULT 'top-right';
  ALTER TABLE "_insights_index_v" ADD COLUMN "version_hero_shader_show_media" boolean DEFAULT false;
  ALTER TABLE "_insights_index_v" ADD COLUMN "version_hero_shader_hover_targets" "enum_leak_hover_targets";
  ALTER TABLE "_insights_index_v" ADD COLUMN "version_hero_shader_section_hover" numeric;
  ALTER TABLE "lab_index" ADD COLUMN "hero_shader_bleed" boolean DEFAULT false;
  ALTER TABLE "lab_index" ADD COLUMN "hero_shader_origin" "enum_lab_index_hero_shader_origin" DEFAULT 'top-right';
  ALTER TABLE "lab_index" ADD COLUMN "hero_shader_show_media" boolean DEFAULT false;
  ALTER TABLE "lab_index" ADD COLUMN "hero_shader_hover_targets" "enum_leak_hover_targets";
  ALTER TABLE "lab_index" ADD COLUMN "hero_shader_section_hover" numeric;
  ALTER TABLE "_lab_index_v" ADD COLUMN "version_hero_shader_bleed" boolean DEFAULT false;
  ALTER TABLE "_lab_index_v" ADD COLUMN "version_hero_shader_origin" "enum__lab_index_v_version_hero_shader_origin" DEFAULT 'top-right';
  ALTER TABLE "_lab_index_v" ADD COLUMN "version_hero_shader_show_media" boolean DEFAULT false;
  ALTER TABLE "_lab_index_v" ADD COLUMN "version_hero_shader_hover_targets" "enum_leak_hover_targets";
  ALTER TABLE "_lab_index_v" ADD COLUMN "version_hero_shader_section_hover" numeric;
  ALTER TABLE "works_index" ADD COLUMN "hero_shader_bleed" boolean DEFAULT false;
  ALTER TABLE "works_index" ADD COLUMN "hero_shader_origin" "enum_works_index_hero_shader_origin" DEFAULT 'top-right';
  ALTER TABLE "works_index" ADD COLUMN "hero_shader_show_media" boolean DEFAULT false;
  ALTER TABLE "works_index" ADD COLUMN "hero_shader_hover_targets" "enum_leak_hover_targets";
  ALTER TABLE "works_index" ADD COLUMN "hero_shader_section_hover" numeric;
  ALTER TABLE "_works_index_v" ADD COLUMN "version_hero_shader_bleed" boolean DEFAULT false;
  ALTER TABLE "_works_index_v" ADD COLUMN "version_hero_shader_origin" "enum__works_index_v_version_hero_shader_origin" DEFAULT 'top-right';
  ALTER TABLE "_works_index_v" ADD COLUMN "version_hero_shader_show_media" boolean DEFAULT false;
  ALTER TABLE "_works_index_v" ADD COLUMN "version_hero_shader_hover_targets" "enum_leak_hover_targets";
  ALTER TABLE "_works_index_v" ADD COLUMN "version_hero_shader_section_hover" numeric;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "insights_index" ALTER COLUMN "hero_visual_type" SET DATA TYPE text;
  DROP TYPE "public"."enum_insights_index_hero_visual_type";
  CREATE TYPE "public"."enum_insights_index_hero_visual_type" AS ENUM('media', 'streakField');
  ALTER TABLE "insights_index" ALTER COLUMN "hero_visual_type" SET DATA TYPE "public"."enum_insights_index_hero_visual_type" USING "hero_visual_type"::"public"."enum_insights_index_hero_visual_type";
  ALTER TABLE "_insights_index_v" ALTER COLUMN "version_hero_visual_type" SET DATA TYPE text;
  DROP TYPE "public"."enum__insights_index_v_version_hero_visual_type";
  CREATE TYPE "public"."enum__insights_index_v_version_hero_visual_type" AS ENUM('media', 'streakField');
  ALTER TABLE "_insights_index_v" ALTER COLUMN "version_hero_visual_type" SET DATA TYPE "public"."enum__insights_index_v_version_hero_visual_type" USING "version_hero_visual_type"::"public"."enum__insights_index_v_version_hero_visual_type";
  ALTER TABLE "lab_index" ALTER COLUMN "hero_visual_type" SET DATA TYPE text;
  DROP TYPE "public"."enum_lab_index_hero_visual_type";
  CREATE TYPE "public"."enum_lab_index_hero_visual_type" AS ENUM('media', 'streakField');
  ALTER TABLE "lab_index" ALTER COLUMN "hero_visual_type" SET DATA TYPE "public"."enum_lab_index_hero_visual_type" USING "hero_visual_type"::"public"."enum_lab_index_hero_visual_type";
  ALTER TABLE "_lab_index_v" ALTER COLUMN "version_hero_visual_type" SET DATA TYPE text;
  DROP TYPE "public"."enum__lab_index_v_version_hero_visual_type";
  CREATE TYPE "public"."enum__lab_index_v_version_hero_visual_type" AS ENUM('media', 'streakField');
  ALTER TABLE "_lab_index_v" ALTER COLUMN "version_hero_visual_type" SET DATA TYPE "public"."enum__lab_index_v_version_hero_visual_type" USING "version_hero_visual_type"::"public"."enum__lab_index_v_version_hero_visual_type";
  ALTER TABLE "works_index" ALTER COLUMN "hero_visual_type" SET DATA TYPE text;
  DROP TYPE "public"."enum_works_index_hero_visual_type";
  CREATE TYPE "public"."enum_works_index_hero_visual_type" AS ENUM('media', 'streakField');
  ALTER TABLE "works_index" ALTER COLUMN "hero_visual_type" SET DATA TYPE "public"."enum_works_index_hero_visual_type" USING "hero_visual_type"::"public"."enum_works_index_hero_visual_type";
  ALTER TABLE "_works_index_v" ALTER COLUMN "version_hero_visual_type" SET DATA TYPE text;
  DROP TYPE "public"."enum__works_index_v_version_hero_visual_type";
  CREATE TYPE "public"."enum__works_index_v_version_hero_visual_type" AS ENUM('media', 'streakField');
  ALTER TABLE "_works_index_v" ALTER COLUMN "version_hero_visual_type" SET DATA TYPE "public"."enum__works_index_v_version_hero_visual_type" USING "version_hero_visual_type"::"public"."enum__works_index_v_version_hero_visual_type";
  ALTER TABLE "insights_index" DROP COLUMN "hero_shader_bleed";
  ALTER TABLE "insights_index" DROP COLUMN "hero_shader_origin";
  ALTER TABLE "insights_index" DROP COLUMN "hero_shader_show_media";
  ALTER TABLE "insights_index" DROP COLUMN "hero_shader_hover_targets";
  ALTER TABLE "insights_index" DROP COLUMN "hero_shader_section_hover";
  ALTER TABLE "_insights_index_v" DROP COLUMN "version_hero_shader_bleed";
  ALTER TABLE "_insights_index_v" DROP COLUMN "version_hero_shader_origin";
  ALTER TABLE "_insights_index_v" DROP COLUMN "version_hero_shader_show_media";
  ALTER TABLE "_insights_index_v" DROP COLUMN "version_hero_shader_hover_targets";
  ALTER TABLE "_insights_index_v" DROP COLUMN "version_hero_shader_section_hover";
  ALTER TABLE "lab_index" DROP COLUMN "hero_shader_bleed";
  ALTER TABLE "lab_index" DROP COLUMN "hero_shader_origin";
  ALTER TABLE "lab_index" DROP COLUMN "hero_shader_show_media";
  ALTER TABLE "lab_index" DROP COLUMN "hero_shader_hover_targets";
  ALTER TABLE "lab_index" DROP COLUMN "hero_shader_section_hover";
  ALTER TABLE "_lab_index_v" DROP COLUMN "version_hero_shader_bleed";
  ALTER TABLE "_lab_index_v" DROP COLUMN "version_hero_shader_origin";
  ALTER TABLE "_lab_index_v" DROP COLUMN "version_hero_shader_show_media";
  ALTER TABLE "_lab_index_v" DROP COLUMN "version_hero_shader_hover_targets";
  ALTER TABLE "_lab_index_v" DROP COLUMN "version_hero_shader_section_hover";
  ALTER TABLE "works_index" DROP COLUMN "hero_shader_bleed";
  ALTER TABLE "works_index" DROP COLUMN "hero_shader_origin";
  ALTER TABLE "works_index" DROP COLUMN "hero_shader_show_media";
  ALTER TABLE "works_index" DROP COLUMN "hero_shader_hover_targets";
  ALTER TABLE "works_index" DROP COLUMN "hero_shader_section_hover";
  ALTER TABLE "_works_index_v" DROP COLUMN "version_hero_shader_bleed";
  ALTER TABLE "_works_index_v" DROP COLUMN "version_hero_shader_origin";
  ALTER TABLE "_works_index_v" DROP COLUMN "version_hero_shader_show_media";
  ALTER TABLE "_works_index_v" DROP COLUMN "version_hero_shader_hover_targets";
  ALTER TABLE "_works_index_v" DROP COLUMN "version_hero_shader_section_hover";
  DROP TYPE "public"."enum_insights_index_hero_shader_origin";
  DROP TYPE "public"."enum__insights_index_v_version_hero_shader_origin";
  DROP TYPE "public"."enum_lab_index_hero_shader_origin";
  DROP TYPE "public"."enum__lab_index_v_version_hero_shader_origin";
  DROP TYPE "public"."enum_works_index_hero_shader_origin";
  DROP TYPE "public"."enum__works_index_v_version_hero_shader_origin";`)
}
