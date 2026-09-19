import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "_pages_v_version_menu_preview_shader_version_menu_previe_idx";
  DROP INDEX "_pages_v_version_menu_preview_shader_version_menu_prev_1_idx";
  DROP INDEX "_work_pages_v_version_menu_preview_shader_version_menu_p_idx";
  DROP INDEX "_work_pages_v_version_menu_preview_shader_version_menu_1_idx";
  DROP INDEX "expertise_pages_menu_preview_shader_menu_preview_shader__idx";
  DROP INDEX "expertise_pages_menu_preview_shader_menu_preview_shade_1_idx";
  DROP INDEX "_expertise_pages_v_blocks_feature_tabs_tabs_shader_shade_idx";
  DROP INDEX "_expertise_pages_v_blocks_feature_tabs_tabs_shader_sha_1_idx";
  DROP INDEX "_expertise_pages_v_version_hero_shader_version_hero_shad_idx";
  DROP INDEX "_expertise_pages_v_version_hero_shader_version_hero_sh_1_idx";
  DROP INDEX "_expertise_pages_v_version_menu_preview_shader_version_m_idx";
  DROP INDEX "_expertise_pages_v_version_menu_preview_shader_version_1_idx";
  DROP INDEX "_audience_pages_v_blocks_feature_tabs_tabs_shader_shader_idx";
  DROP INDEX "_audience_pages_v_blocks_feature_tabs_tabs_shader_shad_1_idx";
  DROP INDEX "_audience_pages_v_version_hero_shader_version_hero_shade_idx";
  DROP INDEX "_audience_pages_v_version_hero_shader_version_hero_sha_1_idx";
  DROP INDEX "_audience_pages_v_version_menu_preview_shader_version_me_idx";
  DROP INDEX "_audience_pages_v_version_menu_preview_shader_version__1_idx";
  DROP INDEX "_contact_pages_v_version_menu_preview_shader_version_men_idx";
  DROP INDEX "_contact_pages_v_version_menu_preview_shader_version_m_1_idx";
  DROP INDEX "_insights_index_v_version_hero_shader_version_hero_shade_idx";
  DROP INDEX "_insights_index_v_version_hero_shader_version_hero_sha_1_idx";
  DROP INDEX "_insights_index_v_version_menu_preview_shader_version_me_idx";
  DROP INDEX "_insights_index_v_version_menu_preview_shader_version__1_idx";
  DROP INDEX "_works_index_v_version_menu_preview_shader_version_menu__idx";
  DROP INDEX "_works_index_v_version_menu_preview_shader_version_men_1_idx";
  ALTER TABLE "pages_full_media" ADD COLUMN "shader_studio_id" integer;
  ALTER TABLE "pages_media_split" ADD COLUMN "shader_studio_id" integer;
  ALTER TABLE "pages_split_narrow" ADD COLUMN "shader_studio_id" integer;
  ALTER TABLE "pages_blocks_feature_tabs_tabs" ADD COLUMN "shader_studio_id" integer;
  ALTER TABLE "pages_aud_tabs_tabs" ADD COLUMN "shader_studio_id" integer;
  ALTER TABLE "pages" ADD COLUMN "hero_shader_studio_id" integer;
  ALTER TABLE "pages" ADD COLUMN "menu_preview_shader_studio_id" integer;
  ALTER TABLE "__pages_v_full_media_v" ADD COLUMN "shader_studio_id" integer;
  ALTER TABLE "__pages_v_media_split_v" ADD COLUMN "shader_studio_id" integer;
  ALTER TABLE "__pages_v_split_narrow_v" ADD COLUMN "shader_studio_id" integer;
  ALTER TABLE "_pages_v_blocks_feature_tabs_tabs" ADD COLUMN "shader_studio_id" integer;
  ALTER TABLE "__pages_v_aud_tabs_v_tabs" ADD COLUMN "shader_studio_id" integer;
  ALTER TABLE "_pages_v" ADD COLUMN "version_hero_shader_studio_id" integer;
  ALTER TABLE "_pages_v" ADD COLUMN "version_menu_preview_shader_studio_id" integer;
  ALTER TABLE "posts_full_media" ADD COLUMN "shader_studio_id" integer;
  ALTER TABLE "posts_media_split" ADD COLUMN "shader_studio_id" integer;
  ALTER TABLE "posts_split_narrow" ADD COLUMN "shader_studio_id" integer;
  ALTER TABLE "posts_blocks_feature_tabs_tabs" ADD COLUMN "shader_studio_id" integer;
  ALTER TABLE "posts" ADD COLUMN "shader_studio_id" integer;
  ALTER TABLE "__posts_v_full_media_v" ADD COLUMN "shader_studio_id" integer;
  ALTER TABLE "__posts_v_media_split_v" ADD COLUMN "shader_studio_id" integer;
  ALTER TABLE "__posts_v_split_narrow_v" ADD COLUMN "shader_studio_id" integer;
  ALTER TABLE "_posts_v_blocks_feature_tabs_tabs" ADD COLUMN "shader_studio_id" integer;
  ALTER TABLE "_posts_v" ADD COLUMN "version_shader_studio_id" integer;
  ALTER TABLE "work_pages_full_media" ADD COLUMN "shader_studio_id" integer;
  ALTER TABLE "work_pages_media_split" ADD COLUMN "shader_studio_id" integer;
  ALTER TABLE "work_pages_split_narrow" ADD COLUMN "shader_studio_id" integer;
  ALTER TABLE "work_pages_blocks_feature_tabs_tabs" ADD COLUMN "shader_studio_id" integer;
  ALTER TABLE "work_pages_aud_tabs_tabs" ADD COLUMN "shader_studio_id" integer;
  ALTER TABLE "work_pages" ADD COLUMN "hero_shader_studio_id" integer;
  ALTER TABLE "work_pages" ADD COLUMN "menu_preview_shader_studio_id" integer;
  ALTER TABLE "__work_pages_v_full_media_v" ADD COLUMN "shader_studio_id" integer;
  ALTER TABLE "__work_pages_v_media_split_v" ADD COLUMN "shader_studio_id" integer;
  ALTER TABLE "__work_pages_v_split_narrow_v" ADD COLUMN "shader_studio_id" integer;
  ALTER TABLE "_work_pages_v_blocks_feature_tabs_tabs" ADD COLUMN "shader_studio_id" integer;
  ALTER TABLE "__work_pages_v_aud_tabs_v_tabs" ADD COLUMN "shader_studio_id" integer;
  ALTER TABLE "_work_pages_v" ADD COLUMN "version_hero_shader_studio_id" integer;
  ALTER TABLE "_work_pages_v" ADD COLUMN "version_menu_preview_shader_studio_id" integer;
  ALTER TABLE "lab_pages_full_media" ADD COLUMN "shader_studio_id" integer;
  ALTER TABLE "lab_pages_media_split" ADD COLUMN "shader_studio_id" integer;
  ALTER TABLE "lab_pages_split_narrow" ADD COLUMN "shader_studio_id" integer;
  ALTER TABLE "lab_pages_blocks_feature_tabs_tabs" ADD COLUMN "shader_studio_id" integer;
  ALTER TABLE "lab_pages" ADD COLUMN "hero_shader_studio_id" integer;
  ALTER TABLE "__lab_pages_v_full_media_v" ADD COLUMN "shader_studio_id" integer;
  ALTER TABLE "__lab_pages_v_media_split_v" ADD COLUMN "shader_studio_id" integer;
  ALTER TABLE "__lab_pages_v_split_narrow_v" ADD COLUMN "shader_studio_id" integer;
  ALTER TABLE "_lab_pages_v_blocks_feature_tabs_tabs" ADD COLUMN "shader_studio_id" integer;
  ALTER TABLE "_lab_pages_v" ADD COLUMN "version_hero_shader_studio_id" integer;
  ALTER TABLE "expertise_pages_full_media" ADD COLUMN "shader_studio_id" integer;
  ALTER TABLE "expertise_pages_media_split" ADD COLUMN "shader_studio_id" integer;
  ALTER TABLE "expertise_pages_split_narrow" ADD COLUMN "shader_studio_id" integer;
  ALTER TABLE "expertise_pages_blocks_feature_tabs_tabs" ADD COLUMN "shader_studio_id" integer;
  ALTER TABLE "expertise_pages_aud_tabs_tabs" ADD COLUMN "shader_studio_id" integer;
  ALTER TABLE "expertise_pages" ADD COLUMN "hero_shader_studio_id" integer;
  ALTER TABLE "expertise_pages" ADD COLUMN "menu_preview_shader_studio_id" integer;
  ALTER TABLE "__expertise_pages_v_full_media_v" ADD COLUMN "shader_studio_id" integer;
  ALTER TABLE "__expertise_pages_v_media_split_v" ADD COLUMN "shader_studio_id" integer;
  ALTER TABLE "__expertise_pages_v_split_narrow_v" ADD COLUMN "shader_studio_id" integer;
  ALTER TABLE "_expertise_pages_v_blocks_feature_tabs_tabs" ADD COLUMN "shader_studio_id" integer;
  ALTER TABLE "__expertise_pages_v_aud_tabs_v_tabs" ADD COLUMN "shader_studio_id" integer;
  ALTER TABLE "_expertise_pages_v" ADD COLUMN "version_hero_shader_studio_id" integer;
  ALTER TABLE "_expertise_pages_v" ADD COLUMN "version_menu_preview_shader_studio_id" integer;
  ALTER TABLE "audience_pages_full_media" ADD COLUMN "shader_studio_id" integer;
  ALTER TABLE "audience_pages_media_split" ADD COLUMN "shader_studio_id" integer;
  ALTER TABLE "audience_pages_split_narrow" ADD COLUMN "shader_studio_id" integer;
  ALTER TABLE "audience_pages_blocks_feature_tabs_tabs" ADD COLUMN "shader_studio_id" integer;
  ALTER TABLE "audience_pages_aud_tabs_tabs" ADD COLUMN "shader_studio_id" integer;
  ALTER TABLE "audience_pages" ADD COLUMN "hero_shader_studio_id" integer;
  ALTER TABLE "audience_pages" ADD COLUMN "menu_preview_shader_studio_id" integer;
  ALTER TABLE "__audience_pages_v_full_media_v" ADD COLUMN "shader_studio_id" integer;
  ALTER TABLE "__audience_pages_v_media_split_v" ADD COLUMN "shader_studio_id" integer;
  ALTER TABLE "__audience_pages_v_split_narrow_v" ADD COLUMN "shader_studio_id" integer;
  ALTER TABLE "_audience_pages_v_blocks_feature_tabs_tabs" ADD COLUMN "shader_studio_id" integer;
  ALTER TABLE "__audience_pages_v_aud_tabs_v_tabs" ADD COLUMN "shader_studio_id" integer;
  ALTER TABLE "_audience_pages_v" ADD COLUMN "version_hero_shader_studio_id" integer;
  ALTER TABLE "_audience_pages_v" ADD COLUMN "version_menu_preview_shader_studio_id" integer;
  ALTER TABLE "contact_pages" ADD COLUMN "menu_preview_shader_studio_id" integer;
  ALTER TABLE "_contact_pages_v" ADD COLUMN "version_menu_preview_shader_studio_id" integer;
  ALTER TABLE "streak_looks" ADD COLUMN "light_poster_id" integer;
  ALTER TABLE "streak_looks" ADD COLUMN "snapshot" jsonb;
  ALTER TABLE "streak_looks" ADD COLUMN "posters" jsonb;
  ALTER TABLE "streak_looks" ADD COLUMN "source_hash" varchar;
  ALTER TABLE "_streak_looks_v" ADD COLUMN "version_light_poster_id" integer;
  ALTER TABLE "_streak_looks_v" ADD COLUMN "version_snapshot" jsonb;
  ALTER TABLE "_streak_looks_v" ADD COLUMN "version_posters" jsonb;
  ALTER TABLE "_streak_looks_v" ADD COLUMN "version_source_hash" varchar;
  ALTER TABLE "home_full_media" ADD COLUMN "shader_studio_id" integer;
  ALTER TABLE "home_media_split" ADD COLUMN "shader_studio_id" integer;
  ALTER TABLE "home_split_narrow" ADD COLUMN "shader_studio_id" integer;
  ALTER TABLE "home_blocks_feature_tabs_tabs" ADD COLUMN "shader_studio_id" integer;
  ALTER TABLE "home_aud_tabs_tabs" ADD COLUMN "shader_studio_id" integer;
  ALTER TABLE "home" ADD COLUMN "hero_shader_studio_id" integer;
  ALTER TABLE "__home_v_full_media_v" ADD COLUMN "shader_studio_id" integer;
  ALTER TABLE "__home_v_media_split_v" ADD COLUMN "shader_studio_id" integer;
  ALTER TABLE "__home_v_split_narrow_v" ADD COLUMN "shader_studio_id" integer;
  ALTER TABLE "_home_v_blocks_feature_tabs_tabs" ADD COLUMN "shader_studio_id" integer;
  ALTER TABLE "__home_v_aud_tabs_v_tabs" ADD COLUMN "shader_studio_id" integer;
  ALTER TABLE "_home_v" ADD COLUMN "version_hero_shader_studio_id" integer;
  ALTER TABLE "insights_index" ADD COLUMN "hero_shader_studio_id" integer;
  ALTER TABLE "insights_index" ADD COLUMN "menu_preview_shader_studio_id" integer;
  ALTER TABLE "_insights_index_v" ADD COLUMN "version_hero_shader_studio_id" integer;
  ALTER TABLE "_insights_index_v" ADD COLUMN "version_menu_preview_shader_studio_id" integer;
  ALTER TABLE "works_index" ADD COLUMN "hero_shader_studio_id" integer;
  ALTER TABLE "works_index" ADD COLUMN "menu_preview_shader_studio_id" integer;
  ALTER TABLE "_works_index_v" ADD COLUMN "version_hero_shader_studio_id" integer;
  ALTER TABLE "_works_index_v" ADD COLUMN "version_menu_preview_shader_studio_id" integer;
  ALTER TABLE "pages_full_media" ADD CONSTRAINT "pages_full_media_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_media_split" ADD CONSTRAINT "pages_media_split_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_split_narrow" ADD CONSTRAINT "pages_split_narrow_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_feature_tabs_tabs" ADD CONSTRAINT "pages_blocks_feature_tabs_tabs_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_aud_tabs_tabs" ADD CONSTRAINT "pages_aud_tabs_tabs_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_hero_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("hero_shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_menu_preview_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("menu_preview_shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__pages_v_full_media_v" ADD CONSTRAINT "__pages_v_full_media_v_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__pages_v_media_split_v" ADD CONSTRAINT "__pages_v_media_split_v_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__pages_v_split_narrow_v" ADD CONSTRAINT "__pages_v_split_narrow_v_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_feature_tabs_tabs" ADD CONSTRAINT "_pages_v_blocks_feature_tabs_tabs_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__pages_v_aud_tabs_v_tabs" ADD CONSTRAINT "__pages_v_aud_tabs_v_tabs_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_hero_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("version_hero_shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_menu_preview_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("version_menu_preview_shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_full_media" ADD CONSTRAINT "posts_full_media_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_media_split" ADD CONSTRAINT "posts_media_split_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_split_narrow" ADD CONSTRAINT "posts_split_narrow_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_blocks_feature_tabs_tabs" ADD CONSTRAINT "posts_blocks_feature_tabs_tabs_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__posts_v_full_media_v" ADD CONSTRAINT "__posts_v_full_media_v_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__posts_v_media_split_v" ADD CONSTRAINT "__posts_v_media_split_v_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__posts_v_split_narrow_v" ADD CONSTRAINT "__posts_v_split_narrow_v_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_feature_tabs_tabs" ADD CONSTRAINT "_posts_v_blocks_feature_tabs_tabs_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("version_shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "work_pages_full_media" ADD CONSTRAINT "work_pages_full_media_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "work_pages_media_split" ADD CONSTRAINT "work_pages_media_split_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "work_pages_split_narrow" ADD CONSTRAINT "work_pages_split_narrow_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "work_pages_blocks_feature_tabs_tabs" ADD CONSTRAINT "work_pages_blocks_feature_tabs_tabs_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "work_pages_aud_tabs_tabs" ADD CONSTRAINT "work_pages_aud_tabs_tabs_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "work_pages" ADD CONSTRAINT "work_pages_hero_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("hero_shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "work_pages" ADD CONSTRAINT "work_pages_menu_preview_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("menu_preview_shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__work_pages_v_full_media_v" ADD CONSTRAINT "__work_pages_v_full_media_v_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__work_pages_v_media_split_v" ADD CONSTRAINT "__work_pages_v_media_split_v_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__work_pages_v_split_narrow_v" ADD CONSTRAINT "__work_pages_v_split_narrow_v_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_work_pages_v_blocks_feature_tabs_tabs" ADD CONSTRAINT "_work_pages_v_blocks_feature_tabs_tabs_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__work_pages_v_aud_tabs_v_tabs" ADD CONSTRAINT "__work_pages_v_aud_tabs_v_tabs_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_work_pages_v" ADD CONSTRAINT "_work_pages_v_version_hero_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("version_hero_shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_work_pages_v" ADD CONSTRAINT "_work_pages_v_version_menu_preview_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("version_menu_preview_shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "lab_pages_full_media" ADD CONSTRAINT "lab_pages_full_media_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "lab_pages_media_split" ADD CONSTRAINT "lab_pages_media_split_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "lab_pages_split_narrow" ADD CONSTRAINT "lab_pages_split_narrow_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "lab_pages_blocks_feature_tabs_tabs" ADD CONSTRAINT "lab_pages_blocks_feature_tabs_tabs_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "lab_pages" ADD CONSTRAINT "lab_pages_hero_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("hero_shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__lab_pages_v_full_media_v" ADD CONSTRAINT "__lab_pages_v_full_media_v_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__lab_pages_v_media_split_v" ADD CONSTRAINT "__lab_pages_v_media_split_v_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__lab_pages_v_split_narrow_v" ADD CONSTRAINT "__lab_pages_v_split_narrow_v_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_lab_pages_v_blocks_feature_tabs_tabs" ADD CONSTRAINT "_lab_pages_v_blocks_feature_tabs_tabs_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_lab_pages_v" ADD CONSTRAINT "_lab_pages_v_version_hero_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("version_hero_shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "expertise_pages_full_media" ADD CONSTRAINT "expertise_pages_full_media_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "expertise_pages_media_split" ADD CONSTRAINT "expertise_pages_media_split_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "expertise_pages_split_narrow" ADD CONSTRAINT "expertise_pages_split_narrow_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "expertise_pages_blocks_feature_tabs_tabs" ADD CONSTRAINT "expertise_pages_blocks_feature_tabs_tabs_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "expertise_pages_aud_tabs_tabs" ADD CONSTRAINT "expertise_pages_aud_tabs_tabs_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "expertise_pages" ADD CONSTRAINT "expertise_pages_hero_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("hero_shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "expertise_pages" ADD CONSTRAINT "expertise_pages_menu_preview_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("menu_preview_shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__expertise_pages_v_full_media_v" ADD CONSTRAINT "__expertise_pages_v_full_media_v_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__expertise_pages_v_media_split_v" ADD CONSTRAINT "__expertise_pages_v_media_split_v_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__expertise_pages_v_split_narrow_v" ADD CONSTRAINT "__expertise_pages_v_split_narrow_v_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_expertise_pages_v_blocks_feature_tabs_tabs" ADD CONSTRAINT "_expertise_pages_v_blocks_feature_tabs_tabs_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__expertise_pages_v_aud_tabs_v_tabs" ADD CONSTRAINT "__expertise_pages_v_aud_tabs_v_tabs_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_expertise_pages_v" ADD CONSTRAINT "_expertise_pages_v_version_hero_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("version_hero_shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_expertise_pages_v" ADD CONSTRAINT "_expertise_pages_v_version_menu_preview_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("version_menu_preview_shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "audience_pages_full_media" ADD CONSTRAINT "audience_pages_full_media_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "audience_pages_media_split" ADD CONSTRAINT "audience_pages_media_split_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "audience_pages_split_narrow" ADD CONSTRAINT "audience_pages_split_narrow_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "audience_pages_blocks_feature_tabs_tabs" ADD CONSTRAINT "audience_pages_blocks_feature_tabs_tabs_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "audience_pages_aud_tabs_tabs" ADD CONSTRAINT "audience_pages_aud_tabs_tabs_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "audience_pages" ADD CONSTRAINT "audience_pages_hero_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("hero_shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "audience_pages" ADD CONSTRAINT "audience_pages_menu_preview_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("menu_preview_shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__audience_pages_v_full_media_v" ADD CONSTRAINT "__audience_pages_v_full_media_v_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__audience_pages_v_media_split_v" ADD CONSTRAINT "__audience_pages_v_media_split_v_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__audience_pages_v_split_narrow_v" ADD CONSTRAINT "__audience_pages_v_split_narrow_v_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_audience_pages_v_blocks_feature_tabs_tabs" ADD CONSTRAINT "_audience_pages_v_blocks_feature_tabs_tabs_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__audience_pages_v_aud_tabs_v_tabs" ADD CONSTRAINT "__audience_pages_v_aud_tabs_v_tabs_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_audience_pages_v" ADD CONSTRAINT "_audience_pages_v_version_hero_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("version_hero_shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_audience_pages_v" ADD CONSTRAINT "_audience_pages_v_version_menu_preview_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("version_menu_preview_shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "contact_pages" ADD CONSTRAINT "contact_pages_menu_preview_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("menu_preview_shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_contact_pages_v" ADD CONSTRAINT "_contact_pages_v_version_menu_preview_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("version_menu_preview_shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "streak_looks" ADD CONSTRAINT "streak_looks_light_poster_id_media_id_fk" FOREIGN KEY ("light_poster_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_streak_looks_v" ADD CONSTRAINT "_streak_looks_v_version_light_poster_id_media_id_fk" FOREIGN KEY ("version_light_poster_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_full_media" ADD CONSTRAINT "home_full_media_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_media_split" ADD CONSTRAINT "home_media_split_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_split_narrow" ADD CONSTRAINT "home_split_narrow_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_blocks_feature_tabs_tabs" ADD CONSTRAINT "home_blocks_feature_tabs_tabs_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_aud_tabs_tabs" ADD CONSTRAINT "home_aud_tabs_tabs_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home" ADD CONSTRAINT "home_hero_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("hero_shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__home_v_full_media_v" ADD CONSTRAINT "__home_v_full_media_v_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__home_v_media_split_v" ADD CONSTRAINT "__home_v_media_split_v_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__home_v_split_narrow_v" ADD CONSTRAINT "__home_v_split_narrow_v_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_home_v_blocks_feature_tabs_tabs" ADD CONSTRAINT "_home_v_blocks_feature_tabs_tabs_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__home_v_aud_tabs_v_tabs" ADD CONSTRAINT "__home_v_aud_tabs_v_tabs_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_home_v" ADD CONSTRAINT "_home_v_version_hero_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("version_hero_shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "insights_index" ADD CONSTRAINT "insights_index_hero_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("hero_shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "insights_index" ADD CONSTRAINT "insights_index_menu_preview_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("menu_preview_shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_insights_index_v" ADD CONSTRAINT "_insights_index_v_version_hero_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("version_hero_shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_insights_index_v" ADD CONSTRAINT "_insights_index_v_version_menu_preview_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("version_menu_preview_shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "works_index" ADD CONSTRAINT "works_index_hero_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("hero_shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "works_index" ADD CONSTRAINT "works_index_menu_preview_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("menu_preview_shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_works_index_v" ADD CONSTRAINT "_works_index_v_version_hero_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("version_hero_shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_works_index_v" ADD CONSTRAINT "_works_index_v_version_menu_preview_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("version_menu_preview_shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "pages_full_media_shader_shader_studio_idx" ON "pages_full_media" USING btree ("shader_studio_id");
  CREATE INDEX "pages_media_split_shader_shader_studio_idx" ON "pages_media_split" USING btree ("shader_studio_id");
  CREATE INDEX "pages_split_narrow_shader_shader_studio_idx" ON "pages_split_narrow" USING btree ("shader_studio_id");
  CREATE INDEX "pages_blocks_feature_tabs_tabs_shader_shader_studio_idx" ON "pages_blocks_feature_tabs_tabs" USING btree ("shader_studio_id");
  CREATE INDEX "pages_aud_tabs_tabs_shader_shader_studio_idx" ON "pages_aud_tabs_tabs" USING btree ("shader_studio_id");
  CREATE INDEX "pages_hero_shader_hero_shader_studio_idx" ON "pages" USING btree ("hero_shader_studio_id");
  CREATE INDEX "pages_menu_preview_shader_menu_preview_shader_studio_idx" ON "pages" USING btree ("menu_preview_shader_studio_id");
  CREATE INDEX "__pages_v_full_media_v_shader_shader_studio_idx" ON "__pages_v_full_media_v" USING btree ("shader_studio_id");
  CREATE INDEX "__pages_v_media_split_v_shader_shader_studio_idx" ON "__pages_v_media_split_v" USING btree ("shader_studio_id");
  CREATE INDEX "__pages_v_split_narrow_v_shader_shader_studio_idx" ON "__pages_v_split_narrow_v" USING btree ("shader_studio_id");
  CREATE INDEX "_pages_v_blocks_feature_tabs_tabs_shader_shader_studio_idx" ON "_pages_v_blocks_feature_tabs_tabs" USING btree ("shader_studio_id");
  CREATE INDEX "__pages_v_aud_tabs_v_tabs_shader_shader_studio_idx" ON "__pages_v_aud_tabs_v_tabs" USING btree ("shader_studio_id");
  CREATE INDEX "_pages_v_version_hero_shader_version_hero_shader_studio_idx" ON "_pages_v" USING btree ("version_hero_shader_studio_id");
  CREATE INDEX "_pages_v_version_menu_preview_shader_version_menu_prev_2_idx" ON "_pages_v" USING btree ("version_menu_preview_shader_poster_media_id");
  CREATE INDEX "posts_full_media_shader_shader_studio_idx" ON "posts_full_media" USING btree ("shader_studio_id");
  CREATE INDEX "posts_media_split_shader_shader_studio_idx" ON "posts_media_split" USING btree ("shader_studio_id");
  CREATE INDEX "posts_split_narrow_shader_shader_studio_idx" ON "posts_split_narrow" USING btree ("shader_studio_id");
  CREATE INDEX "posts_blocks_feature_tabs_tabs_shader_shader_studio_idx" ON "posts_blocks_feature_tabs_tabs" USING btree ("shader_studio_id");
  CREATE INDEX "posts_shader_shader_studio_idx" ON "posts" USING btree ("shader_studio_id");
  CREATE INDEX "__posts_v_full_media_v_shader_shader_studio_idx" ON "__posts_v_full_media_v" USING btree ("shader_studio_id");
  CREATE INDEX "__posts_v_media_split_v_shader_shader_studio_idx" ON "__posts_v_media_split_v" USING btree ("shader_studio_id");
  CREATE INDEX "__posts_v_split_narrow_v_shader_shader_studio_idx" ON "__posts_v_split_narrow_v" USING btree ("shader_studio_id");
  CREATE INDEX "_posts_v_blocks_feature_tabs_tabs_shader_shader_studio_idx" ON "_posts_v_blocks_feature_tabs_tabs" USING btree ("shader_studio_id");
  CREATE INDEX "_posts_v_version_shader_version_shader_studio_idx" ON "_posts_v" USING btree ("version_shader_studio_id");
  CREATE INDEX "work_pages_full_media_shader_shader_studio_idx" ON "work_pages_full_media" USING btree ("shader_studio_id");
  CREATE INDEX "work_pages_media_split_shader_shader_studio_idx" ON "work_pages_media_split" USING btree ("shader_studio_id");
  CREATE INDEX "work_pages_split_narrow_shader_shader_studio_idx" ON "work_pages_split_narrow" USING btree ("shader_studio_id");
  CREATE INDEX "work_pages_blocks_feature_tabs_tabs_shader_shader_studio_idx" ON "work_pages_blocks_feature_tabs_tabs" USING btree ("shader_studio_id");
  CREATE INDEX "work_pages_aud_tabs_tabs_shader_shader_studio_idx" ON "work_pages_aud_tabs_tabs" USING btree ("shader_studio_id");
  CREATE INDEX "work_pages_hero_shader_hero_shader_studio_idx" ON "work_pages" USING btree ("hero_shader_studio_id");
  CREATE INDEX "work_pages_menu_preview_shader_menu_preview_shader_studi_idx" ON "work_pages" USING btree ("menu_preview_shader_studio_id");
  CREATE INDEX "__work_pages_v_full_media_v_shader_shader_studio_idx" ON "__work_pages_v_full_media_v" USING btree ("shader_studio_id");
  CREATE INDEX "__work_pages_v_media_split_v_shader_shader_studio_idx" ON "__work_pages_v_media_split_v" USING btree ("shader_studio_id");
  CREATE INDEX "__work_pages_v_split_narrow_v_shader_shader_studio_idx" ON "__work_pages_v_split_narrow_v" USING btree ("shader_studio_id");
  CREATE INDEX "_work_pages_v_blocks_feature_tabs_tabs_shader_shader_stu_idx" ON "_work_pages_v_blocks_feature_tabs_tabs" USING btree ("shader_studio_id");
  CREATE INDEX "__work_pages_v_aud_tabs_v_tabs_shader_shader_studio_idx" ON "__work_pages_v_aud_tabs_v_tabs" USING btree ("shader_studio_id");
  CREATE INDEX "_work_pages_v_version_hero_shader_version_hero_shader_st_idx" ON "_work_pages_v" USING btree ("version_hero_shader_studio_id");
  CREATE INDEX "_work_pages_v_version_menu_preview_shader_version_menu_2_idx" ON "_work_pages_v" USING btree ("version_menu_preview_shader_poster_media_id");
  CREATE INDEX "lab_pages_full_media_shader_shader_studio_idx" ON "lab_pages_full_media" USING btree ("shader_studio_id");
  CREATE INDEX "lab_pages_media_split_shader_shader_studio_idx" ON "lab_pages_media_split" USING btree ("shader_studio_id");
  CREATE INDEX "lab_pages_split_narrow_shader_shader_studio_idx" ON "lab_pages_split_narrow" USING btree ("shader_studio_id");
  CREATE INDEX "lab_pages_blocks_feature_tabs_tabs_shader_shader_studio_idx" ON "lab_pages_blocks_feature_tabs_tabs" USING btree ("shader_studio_id");
  CREATE INDEX "lab_pages_hero_shader_hero_shader_studio_idx" ON "lab_pages" USING btree ("hero_shader_studio_id");
  CREATE INDEX "__lab_pages_v_full_media_v_shader_shader_studio_idx" ON "__lab_pages_v_full_media_v" USING btree ("shader_studio_id");
  CREATE INDEX "__lab_pages_v_media_split_v_shader_shader_studio_idx" ON "__lab_pages_v_media_split_v" USING btree ("shader_studio_id");
  CREATE INDEX "__lab_pages_v_split_narrow_v_shader_shader_studio_idx" ON "__lab_pages_v_split_narrow_v" USING btree ("shader_studio_id");
  CREATE INDEX "_lab_pages_v_blocks_feature_tabs_tabs_shader_shader_stud_idx" ON "_lab_pages_v_blocks_feature_tabs_tabs" USING btree ("shader_studio_id");
  CREATE INDEX "_lab_pages_v_version_hero_shader_version_hero_shader_stu_idx" ON "_lab_pages_v" USING btree ("version_hero_shader_studio_id");
  CREATE INDEX "expertise_pages_full_media_shader_shader_studio_idx" ON "expertise_pages_full_media" USING btree ("shader_studio_id");
  CREATE INDEX "expertise_pages_media_split_shader_shader_studio_idx" ON "expertise_pages_media_split" USING btree ("shader_studio_id");
  CREATE INDEX "expertise_pages_split_narrow_shader_shader_studio_idx" ON "expertise_pages_split_narrow" USING btree ("shader_studio_id");
  CREATE INDEX "expertise_pages_blocks_feature_tabs_tabs_shader_shader_s_idx" ON "expertise_pages_blocks_feature_tabs_tabs" USING btree ("shader_studio_id");
  CREATE INDEX "expertise_pages_aud_tabs_tabs_shader_shader_studio_idx" ON "expertise_pages_aud_tabs_tabs" USING btree ("shader_studio_id");
  CREATE INDEX "expertise_pages_hero_shader_hero_shader_studio_idx" ON "expertise_pages" USING btree ("hero_shader_studio_id");
  CREATE INDEX "expertise_pages_menu_preview_shader_menu_preview_shade_2_idx" ON "expertise_pages" USING btree ("menu_preview_shader_poster_media_id");
  CREATE INDEX "__expertise_pages_v_full_media_v_shader_shader_studio_idx" ON "__expertise_pages_v_full_media_v" USING btree ("shader_studio_id");
  CREATE INDEX "__expertise_pages_v_media_split_v_shader_shader_studio_idx" ON "__expertise_pages_v_media_split_v" USING btree ("shader_studio_id");
  CREATE INDEX "__expertise_pages_v_split_narrow_v_shader_shader_studio_idx" ON "__expertise_pages_v_split_narrow_v" USING btree ("shader_studio_id");
  CREATE INDEX "_expertise_pages_v_blocks_feature_tabs_tabs_shader_sha_2_idx" ON "_expertise_pages_v_blocks_feature_tabs_tabs" USING btree ("shader_poster_media_id");
  CREATE INDEX "__expertise_pages_v_aud_tabs_v_tabs_shader_shader_studio_idx" ON "__expertise_pages_v_aud_tabs_v_tabs" USING btree ("shader_studio_id");
  CREATE INDEX "_expertise_pages_v_version_hero_shader_version_hero_sh_2_idx" ON "_expertise_pages_v" USING btree ("version_hero_shader_poster_media_id");
  CREATE INDEX "_expertise_pages_v_version_menu_preview_shader_version_2_idx" ON "_expertise_pages_v" USING btree ("version_menu_preview_shader_poster_media_id");
  CREATE INDEX "audience_pages_full_media_shader_shader_studio_idx" ON "audience_pages_full_media" USING btree ("shader_studio_id");
  CREATE INDEX "audience_pages_media_split_shader_shader_studio_idx" ON "audience_pages_media_split" USING btree ("shader_studio_id");
  CREATE INDEX "audience_pages_split_narrow_shader_shader_studio_idx" ON "audience_pages_split_narrow" USING btree ("shader_studio_id");
  CREATE INDEX "audience_pages_blocks_feature_tabs_tabs_shader_shader_st_idx" ON "audience_pages_blocks_feature_tabs_tabs" USING btree ("shader_studio_id");
  CREATE INDEX "audience_pages_aud_tabs_tabs_shader_shader_studio_idx" ON "audience_pages_aud_tabs_tabs" USING btree ("shader_studio_id");
  CREATE INDEX "audience_pages_hero_shader_hero_shader_studio_idx" ON "audience_pages" USING btree ("hero_shader_studio_id");
  CREATE INDEX "audience_pages_menu_preview_shader_menu_preview_shader_s_idx" ON "audience_pages" USING btree ("menu_preview_shader_studio_id");
  CREATE INDEX "__audience_pages_v_full_media_v_shader_shader_studio_idx" ON "__audience_pages_v_full_media_v" USING btree ("shader_studio_id");
  CREATE INDEX "__audience_pages_v_media_split_v_shader_shader_studio_idx" ON "__audience_pages_v_media_split_v" USING btree ("shader_studio_id");
  CREATE INDEX "__audience_pages_v_split_narrow_v_shader_shader_studio_idx" ON "__audience_pages_v_split_narrow_v" USING btree ("shader_studio_id");
  CREATE INDEX "_audience_pages_v_blocks_feature_tabs_tabs_shader_shad_2_idx" ON "_audience_pages_v_blocks_feature_tabs_tabs" USING btree ("shader_poster_media_id");
  CREATE INDEX "__audience_pages_v_aud_tabs_v_tabs_shader_shader_studio_idx" ON "__audience_pages_v_aud_tabs_v_tabs" USING btree ("shader_studio_id");
  CREATE INDEX "_audience_pages_v_version_hero_shader_version_hero_sha_2_idx" ON "_audience_pages_v" USING btree ("version_hero_shader_poster_media_id");
  CREATE INDEX "_audience_pages_v_version_menu_preview_shader_version__2_idx" ON "_audience_pages_v" USING btree ("version_menu_preview_shader_poster_media_id");
  CREATE INDEX "contact_pages_menu_preview_shader_menu_preview_shader_st_idx" ON "contact_pages" USING btree ("menu_preview_shader_studio_id");
  CREATE INDEX "_contact_pages_v_version_menu_preview_shader_version_m_2_idx" ON "_contact_pages_v" USING btree ("version_menu_preview_shader_poster_media_id");
  CREATE INDEX "streak_looks_light_poster_idx" ON "streak_looks" USING btree ("light_poster_id");
  CREATE INDEX "_streak_looks_v_version_version_light_poster_idx" ON "_streak_looks_v" USING btree ("version_light_poster_id");
  CREATE INDEX "home_full_media_shader_shader_studio_idx" ON "home_full_media" USING btree ("shader_studio_id");
  CREATE INDEX "home_media_split_shader_shader_studio_idx" ON "home_media_split" USING btree ("shader_studio_id");
  CREATE INDEX "home_split_narrow_shader_shader_studio_idx" ON "home_split_narrow" USING btree ("shader_studio_id");
  CREATE INDEX "home_blocks_feature_tabs_tabs_shader_shader_studio_idx" ON "home_blocks_feature_tabs_tabs" USING btree ("shader_studio_id");
  CREATE INDEX "home_aud_tabs_tabs_shader_shader_studio_idx" ON "home_aud_tabs_tabs" USING btree ("shader_studio_id");
  CREATE INDEX "home_hero_shader_hero_shader_studio_idx" ON "home" USING btree ("hero_shader_studio_id");
  CREATE INDEX "__home_v_full_media_v_shader_shader_studio_idx" ON "__home_v_full_media_v" USING btree ("shader_studio_id");
  CREATE INDEX "__home_v_media_split_v_shader_shader_studio_idx" ON "__home_v_media_split_v" USING btree ("shader_studio_id");
  CREATE INDEX "__home_v_split_narrow_v_shader_shader_studio_idx" ON "__home_v_split_narrow_v" USING btree ("shader_studio_id");
  CREATE INDEX "_home_v_blocks_feature_tabs_tabs_shader_shader_studio_idx" ON "_home_v_blocks_feature_tabs_tabs" USING btree ("shader_studio_id");
  CREATE INDEX "__home_v_aud_tabs_v_tabs_shader_shader_studio_idx" ON "__home_v_aud_tabs_v_tabs" USING btree ("shader_studio_id");
  CREATE INDEX "_home_v_version_hero_shader_version_hero_shader_studio_idx" ON "_home_v" USING btree ("version_hero_shader_studio_id");
  CREATE INDEX "insights_index_hero_shader_hero_shader_studio_idx" ON "insights_index" USING btree ("hero_shader_studio_id");
  CREATE INDEX "insights_index_menu_preview_shader_menu_preview_shader_s_idx" ON "insights_index" USING btree ("menu_preview_shader_studio_id");
  CREATE INDEX "_insights_index_v_version_hero_shader_version_hero_sha_2_idx" ON "_insights_index_v" USING btree ("version_hero_shader_poster_media_id");
  CREATE INDEX "_insights_index_v_version_menu_preview_shader_version__2_idx" ON "_insights_index_v" USING btree ("version_menu_preview_shader_poster_media_id");
  CREATE INDEX "works_index_hero_shader_hero_shader_studio_idx" ON "works_index" USING btree ("hero_shader_studio_id");
  CREATE INDEX "works_index_menu_preview_shader_menu_preview_shader_stud_idx" ON "works_index" USING btree ("menu_preview_shader_studio_id");
  CREATE INDEX "_works_index_v_version_hero_shader_version_hero_shader_s_idx" ON "_works_index_v" USING btree ("version_hero_shader_studio_id");
  CREATE INDEX "_works_index_v_version_menu_preview_shader_version_men_2_idx" ON "_works_index_v" USING btree ("version_menu_preview_shader_poster_media_id");
  CREATE INDEX "_pages_v_version_menu_preview_shader_version_menu_previe_idx" ON "_pages_v" USING btree ("version_menu_preview_shader_studio_id");
  CREATE INDEX "_pages_v_version_menu_preview_shader_version_menu_prev_1_idx" ON "_pages_v" USING btree ("version_menu_preview_shader_release_id");
  CREATE INDEX "_work_pages_v_version_menu_preview_shader_version_menu_p_idx" ON "_work_pages_v" USING btree ("version_menu_preview_shader_studio_id");
  CREATE INDEX "_work_pages_v_version_menu_preview_shader_version_menu_1_idx" ON "_work_pages_v" USING btree ("version_menu_preview_shader_release_id");
  CREATE INDEX "expertise_pages_menu_preview_shader_menu_preview_shader__idx" ON "expertise_pages" USING btree ("menu_preview_shader_studio_id");
  CREATE INDEX "expertise_pages_menu_preview_shader_menu_preview_shade_1_idx" ON "expertise_pages" USING btree ("menu_preview_shader_release_id");
  CREATE INDEX "_expertise_pages_v_blocks_feature_tabs_tabs_shader_shade_idx" ON "_expertise_pages_v_blocks_feature_tabs_tabs" USING btree ("shader_studio_id");
  CREATE INDEX "_expertise_pages_v_blocks_feature_tabs_tabs_shader_sha_1_idx" ON "_expertise_pages_v_blocks_feature_tabs_tabs" USING btree ("shader_release_id");
  CREATE INDEX "_expertise_pages_v_version_hero_shader_version_hero_shad_idx" ON "_expertise_pages_v" USING btree ("version_hero_shader_studio_id");
  CREATE INDEX "_expertise_pages_v_version_hero_shader_version_hero_sh_1_idx" ON "_expertise_pages_v" USING btree ("version_hero_shader_release_id");
  CREATE INDEX "_expertise_pages_v_version_menu_preview_shader_version_m_idx" ON "_expertise_pages_v" USING btree ("version_menu_preview_shader_studio_id");
  CREATE INDEX "_expertise_pages_v_version_menu_preview_shader_version_1_idx" ON "_expertise_pages_v" USING btree ("version_menu_preview_shader_release_id");
  CREATE INDEX "_audience_pages_v_blocks_feature_tabs_tabs_shader_shader_idx" ON "_audience_pages_v_blocks_feature_tabs_tabs" USING btree ("shader_studio_id");
  CREATE INDEX "_audience_pages_v_blocks_feature_tabs_tabs_shader_shad_1_idx" ON "_audience_pages_v_blocks_feature_tabs_tabs" USING btree ("shader_release_id");
  CREATE INDEX "_audience_pages_v_version_hero_shader_version_hero_shade_idx" ON "_audience_pages_v" USING btree ("version_hero_shader_studio_id");
  CREATE INDEX "_audience_pages_v_version_hero_shader_version_hero_sha_1_idx" ON "_audience_pages_v" USING btree ("version_hero_shader_release_id");
  CREATE INDEX "_audience_pages_v_version_menu_preview_shader_version_me_idx" ON "_audience_pages_v" USING btree ("version_menu_preview_shader_studio_id");
  CREATE INDEX "_audience_pages_v_version_menu_preview_shader_version__1_idx" ON "_audience_pages_v" USING btree ("version_menu_preview_shader_release_id");
  CREATE INDEX "_contact_pages_v_version_menu_preview_shader_version_men_idx" ON "_contact_pages_v" USING btree ("version_menu_preview_shader_studio_id");
  CREATE INDEX "_contact_pages_v_version_menu_preview_shader_version_m_1_idx" ON "_contact_pages_v" USING btree ("version_menu_preview_shader_release_id");
  CREATE INDEX "_insights_index_v_version_hero_shader_version_hero_shade_idx" ON "_insights_index_v" USING btree ("version_hero_shader_studio_id");
  CREATE INDEX "_insights_index_v_version_hero_shader_version_hero_sha_1_idx" ON "_insights_index_v" USING btree ("version_hero_shader_release_id");
  CREATE INDEX "_insights_index_v_version_menu_preview_shader_version_me_idx" ON "_insights_index_v" USING btree ("version_menu_preview_shader_studio_id");
  CREATE INDEX "_insights_index_v_version_menu_preview_shader_version__1_idx" ON "_insights_index_v" USING btree ("version_menu_preview_shader_release_id");
  CREATE INDEX "_works_index_v_version_menu_preview_shader_version_menu__idx" ON "_works_index_v" USING btree ("version_menu_preview_shader_studio_id");
  CREATE INDEX "_works_index_v_version_menu_preview_shader_version_men_1_idx" ON "_works_index_v" USING btree ("version_menu_preview_shader_release_id");`)

  // Hand-written from here. A page slot no longer pins a release: it holds the
  // Streak Field itself and shows what is published, the way it holds a media
  // file. Every slot (and retained version) that pinned a release takes that
  // release's look, and each look takes what its newest release carried, so
  // the site renders the same pixels from the look from the first request on.
  await db.execute(sql`
  DO $$
  DECLARE slot record;
  BEGIN
    FOR slot IN
      SELECT c.table_name,
             c.column_name AS release_column,
             regexp_replace(c.column_name, 'release_id$', 'studio_id') AS studio_column
      FROM information_schema.columns c
      WHERE c.table_schema = 'public'
        AND c.column_name LIKE '%shader_release_id'
        AND EXISTS (
          SELECT 1 FROM information_schema.columns s
          WHERE s.table_schema = 'public'
            AND s.table_name = c.table_name
            AND s.column_name = regexp_replace(c.column_name, 'release_id$', 'studio_id')
        )
    LOOP
      EXECUTE format(
        'UPDATE %I AS t SET %I = r.look_id FROM streak_releases r WHERE t.%I = r.id AND t.%I IS NULL',
        slot.table_name, slot.studio_column, slot.release_column, slot.studio_column
      );
    END LOOP;
  END $$;

  UPDATE streak_looks AS l SET
    snapshot = r.snapshot,
    posters = r.posters,
    source_hash = r.source_hash,
    thumbnail_id = r.dark_poster_id,
    light_poster_id = r.light_poster_id
  FROM (
    SELECT DISTINCT ON (look_id) * FROM streak_releases ORDER BY look_id, created_at DESC
  ) AS r
  WHERE r.look_id = l.id AND l.snapshot IS NULL;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_full_media" DROP CONSTRAINT "pages_full_media_shader_studio_id_streak_looks_id_fk";
  
  ALTER TABLE "pages_media_split" DROP CONSTRAINT "pages_media_split_shader_studio_id_streak_looks_id_fk";
  
  ALTER TABLE "pages_split_narrow" DROP CONSTRAINT "pages_split_narrow_shader_studio_id_streak_looks_id_fk";
  
  ALTER TABLE "pages_blocks_feature_tabs_tabs" DROP CONSTRAINT "pages_blocks_feature_tabs_tabs_shader_studio_id_streak_looks_id_fk";
  
  ALTER TABLE "pages_aud_tabs_tabs" DROP CONSTRAINT "pages_aud_tabs_tabs_shader_studio_id_streak_looks_id_fk";
  
  ALTER TABLE "pages" DROP CONSTRAINT "pages_hero_shader_studio_id_streak_looks_id_fk";
  
  ALTER TABLE "pages" DROP CONSTRAINT "pages_menu_preview_shader_studio_id_streak_looks_id_fk";
  
  ALTER TABLE "__pages_v_full_media_v" DROP CONSTRAINT "__pages_v_full_media_v_shader_studio_id_streak_looks_id_fk";
  
  ALTER TABLE "__pages_v_media_split_v" DROP CONSTRAINT "__pages_v_media_split_v_shader_studio_id_streak_looks_id_fk";
  
  ALTER TABLE "__pages_v_split_narrow_v" DROP CONSTRAINT "__pages_v_split_narrow_v_shader_studio_id_streak_looks_id_fk";
  
  ALTER TABLE "_pages_v_blocks_feature_tabs_tabs" DROP CONSTRAINT "_pages_v_blocks_feature_tabs_tabs_shader_studio_id_streak_looks_id_fk";
  
  ALTER TABLE "__pages_v_aud_tabs_v_tabs" DROP CONSTRAINT "__pages_v_aud_tabs_v_tabs_shader_studio_id_streak_looks_id_fk";
  
  ALTER TABLE "_pages_v" DROP CONSTRAINT "_pages_v_version_hero_shader_studio_id_streak_looks_id_fk";
  
  ALTER TABLE "_pages_v" DROP CONSTRAINT "_pages_v_version_menu_preview_shader_studio_id_streak_looks_id_fk";
  
  ALTER TABLE "posts_full_media" DROP CONSTRAINT "posts_full_media_shader_studio_id_streak_looks_id_fk";
  
  ALTER TABLE "posts_media_split" DROP CONSTRAINT "posts_media_split_shader_studio_id_streak_looks_id_fk";
  
  ALTER TABLE "posts_split_narrow" DROP CONSTRAINT "posts_split_narrow_shader_studio_id_streak_looks_id_fk";
  
  ALTER TABLE "posts_blocks_feature_tabs_tabs" DROP CONSTRAINT "posts_blocks_feature_tabs_tabs_shader_studio_id_streak_looks_id_fk";
  
  ALTER TABLE "posts" DROP CONSTRAINT "posts_shader_studio_id_streak_looks_id_fk";
  
  ALTER TABLE "__posts_v_full_media_v" DROP CONSTRAINT "__posts_v_full_media_v_shader_studio_id_streak_looks_id_fk";
  
  ALTER TABLE "__posts_v_media_split_v" DROP CONSTRAINT "__posts_v_media_split_v_shader_studio_id_streak_looks_id_fk";
  
  ALTER TABLE "__posts_v_split_narrow_v" DROP CONSTRAINT "__posts_v_split_narrow_v_shader_studio_id_streak_looks_id_fk";
  
  ALTER TABLE "_posts_v_blocks_feature_tabs_tabs" DROP CONSTRAINT "_posts_v_blocks_feature_tabs_tabs_shader_studio_id_streak_looks_id_fk";
  
  ALTER TABLE "_posts_v" DROP CONSTRAINT "_posts_v_version_shader_studio_id_streak_looks_id_fk";
  
  ALTER TABLE "work_pages_full_media" DROP CONSTRAINT "work_pages_full_media_shader_studio_id_streak_looks_id_fk";
  
  ALTER TABLE "work_pages_media_split" DROP CONSTRAINT "work_pages_media_split_shader_studio_id_streak_looks_id_fk";
  
  ALTER TABLE "work_pages_split_narrow" DROP CONSTRAINT "work_pages_split_narrow_shader_studio_id_streak_looks_id_fk";
  
  ALTER TABLE "work_pages_blocks_feature_tabs_tabs" DROP CONSTRAINT "work_pages_blocks_feature_tabs_tabs_shader_studio_id_streak_looks_id_fk";
  
  ALTER TABLE "work_pages_aud_tabs_tabs" DROP CONSTRAINT "work_pages_aud_tabs_tabs_shader_studio_id_streak_looks_id_fk";
  
  ALTER TABLE "work_pages" DROP CONSTRAINT "work_pages_hero_shader_studio_id_streak_looks_id_fk";
  
  ALTER TABLE "work_pages" DROP CONSTRAINT "work_pages_menu_preview_shader_studio_id_streak_looks_id_fk";
  
  ALTER TABLE "__work_pages_v_full_media_v" DROP CONSTRAINT "__work_pages_v_full_media_v_shader_studio_id_streak_looks_id_fk";
  
  ALTER TABLE "__work_pages_v_media_split_v" DROP CONSTRAINT "__work_pages_v_media_split_v_shader_studio_id_streak_looks_id_fk";
  
  ALTER TABLE "__work_pages_v_split_narrow_v" DROP CONSTRAINT "__work_pages_v_split_narrow_v_shader_studio_id_streak_looks_id_fk";
  
  ALTER TABLE "_work_pages_v_blocks_feature_tabs_tabs" DROP CONSTRAINT "_work_pages_v_blocks_feature_tabs_tabs_shader_studio_id_streak_looks_id_fk";
  
  ALTER TABLE "__work_pages_v_aud_tabs_v_tabs" DROP CONSTRAINT "__work_pages_v_aud_tabs_v_tabs_shader_studio_id_streak_looks_id_fk";
  
  ALTER TABLE "_work_pages_v" DROP CONSTRAINT "_work_pages_v_version_hero_shader_studio_id_streak_looks_id_fk";
  
  ALTER TABLE "_work_pages_v" DROP CONSTRAINT "_work_pages_v_version_menu_preview_shader_studio_id_streak_looks_id_fk";
  
  ALTER TABLE "lab_pages_full_media" DROP CONSTRAINT "lab_pages_full_media_shader_studio_id_streak_looks_id_fk";
  
  ALTER TABLE "lab_pages_media_split" DROP CONSTRAINT "lab_pages_media_split_shader_studio_id_streak_looks_id_fk";
  
  ALTER TABLE "lab_pages_split_narrow" DROP CONSTRAINT "lab_pages_split_narrow_shader_studio_id_streak_looks_id_fk";
  
  ALTER TABLE "lab_pages_blocks_feature_tabs_tabs" DROP CONSTRAINT "lab_pages_blocks_feature_tabs_tabs_shader_studio_id_streak_looks_id_fk";
  
  ALTER TABLE "lab_pages" DROP CONSTRAINT "lab_pages_hero_shader_studio_id_streak_looks_id_fk";
  
  ALTER TABLE "__lab_pages_v_full_media_v" DROP CONSTRAINT "__lab_pages_v_full_media_v_shader_studio_id_streak_looks_id_fk";
  
  ALTER TABLE "__lab_pages_v_media_split_v" DROP CONSTRAINT "__lab_pages_v_media_split_v_shader_studio_id_streak_looks_id_fk";
  
  ALTER TABLE "__lab_pages_v_split_narrow_v" DROP CONSTRAINT "__lab_pages_v_split_narrow_v_shader_studio_id_streak_looks_id_fk";
  
  ALTER TABLE "_lab_pages_v_blocks_feature_tabs_tabs" DROP CONSTRAINT "_lab_pages_v_blocks_feature_tabs_tabs_shader_studio_id_streak_looks_id_fk";
  
  ALTER TABLE "_lab_pages_v" DROP CONSTRAINT "_lab_pages_v_version_hero_shader_studio_id_streak_looks_id_fk";
  
  ALTER TABLE "expertise_pages_full_media" DROP CONSTRAINT "expertise_pages_full_media_shader_studio_id_streak_looks_id_fk";
  
  ALTER TABLE "expertise_pages_media_split" DROP CONSTRAINT "expertise_pages_media_split_shader_studio_id_streak_looks_id_fk";
  
  ALTER TABLE "expertise_pages_split_narrow" DROP CONSTRAINT "expertise_pages_split_narrow_shader_studio_id_streak_looks_id_fk";
  
  ALTER TABLE "expertise_pages_blocks_feature_tabs_tabs" DROP CONSTRAINT "expertise_pages_blocks_feature_tabs_tabs_shader_studio_id_streak_looks_id_fk";
  
  ALTER TABLE "expertise_pages_aud_tabs_tabs" DROP CONSTRAINT "expertise_pages_aud_tabs_tabs_shader_studio_id_streak_looks_id_fk";
  
  ALTER TABLE "expertise_pages" DROP CONSTRAINT "expertise_pages_hero_shader_studio_id_streak_looks_id_fk";
  
  ALTER TABLE "expertise_pages" DROP CONSTRAINT "expertise_pages_menu_preview_shader_studio_id_streak_looks_id_fk";
  
  ALTER TABLE "__expertise_pages_v_full_media_v" DROP CONSTRAINT "__expertise_pages_v_full_media_v_shader_studio_id_streak_looks_id_fk";
  
  ALTER TABLE "__expertise_pages_v_media_split_v" DROP CONSTRAINT "__expertise_pages_v_media_split_v_shader_studio_id_streak_looks_id_fk";
  
  ALTER TABLE "__expertise_pages_v_split_narrow_v" DROP CONSTRAINT "__expertise_pages_v_split_narrow_v_shader_studio_id_streak_looks_id_fk";
  
  ALTER TABLE "_expertise_pages_v_blocks_feature_tabs_tabs" DROP CONSTRAINT "_expertise_pages_v_blocks_feature_tabs_tabs_shader_studio_id_streak_looks_id_fk";
  
  ALTER TABLE "__expertise_pages_v_aud_tabs_v_tabs" DROP CONSTRAINT "__expertise_pages_v_aud_tabs_v_tabs_shader_studio_id_streak_looks_id_fk";
  
  ALTER TABLE "_expertise_pages_v" DROP CONSTRAINT "_expertise_pages_v_version_hero_shader_studio_id_streak_looks_id_fk";
  
  ALTER TABLE "_expertise_pages_v" DROP CONSTRAINT "_expertise_pages_v_version_menu_preview_shader_studio_id_streak_looks_id_fk";
  
  ALTER TABLE "audience_pages_full_media" DROP CONSTRAINT "audience_pages_full_media_shader_studio_id_streak_looks_id_fk";
  
  ALTER TABLE "audience_pages_media_split" DROP CONSTRAINT "audience_pages_media_split_shader_studio_id_streak_looks_id_fk";
  
  ALTER TABLE "audience_pages_split_narrow" DROP CONSTRAINT "audience_pages_split_narrow_shader_studio_id_streak_looks_id_fk";
  
  ALTER TABLE "audience_pages_blocks_feature_tabs_tabs" DROP CONSTRAINT "audience_pages_blocks_feature_tabs_tabs_shader_studio_id_streak_looks_id_fk";
  
  ALTER TABLE "audience_pages_aud_tabs_tabs" DROP CONSTRAINT "audience_pages_aud_tabs_tabs_shader_studio_id_streak_looks_id_fk";
  
  ALTER TABLE "audience_pages" DROP CONSTRAINT "audience_pages_hero_shader_studio_id_streak_looks_id_fk";
  
  ALTER TABLE "audience_pages" DROP CONSTRAINT "audience_pages_menu_preview_shader_studio_id_streak_looks_id_fk";
  
  ALTER TABLE "__audience_pages_v_full_media_v" DROP CONSTRAINT "__audience_pages_v_full_media_v_shader_studio_id_streak_looks_id_fk";
  
  ALTER TABLE "__audience_pages_v_media_split_v" DROP CONSTRAINT "__audience_pages_v_media_split_v_shader_studio_id_streak_looks_id_fk";
  
  ALTER TABLE "__audience_pages_v_split_narrow_v" DROP CONSTRAINT "__audience_pages_v_split_narrow_v_shader_studio_id_streak_looks_id_fk";
  
  ALTER TABLE "_audience_pages_v_blocks_feature_tabs_tabs" DROP CONSTRAINT "_audience_pages_v_blocks_feature_tabs_tabs_shader_studio_id_streak_looks_id_fk";
  
  ALTER TABLE "__audience_pages_v_aud_tabs_v_tabs" DROP CONSTRAINT "__audience_pages_v_aud_tabs_v_tabs_shader_studio_id_streak_looks_id_fk";
  
  ALTER TABLE "_audience_pages_v" DROP CONSTRAINT "_audience_pages_v_version_hero_shader_studio_id_streak_looks_id_fk";
  
  ALTER TABLE "_audience_pages_v" DROP CONSTRAINT "_audience_pages_v_version_menu_preview_shader_studio_id_streak_looks_id_fk";
  
  ALTER TABLE "contact_pages" DROP CONSTRAINT "contact_pages_menu_preview_shader_studio_id_streak_looks_id_fk";
  
  ALTER TABLE "_contact_pages_v" DROP CONSTRAINT "_contact_pages_v_version_menu_preview_shader_studio_id_streak_looks_id_fk";
  
  ALTER TABLE "streak_looks" DROP CONSTRAINT "streak_looks_light_poster_id_media_id_fk";
  
  ALTER TABLE "_streak_looks_v" DROP CONSTRAINT "_streak_looks_v_version_light_poster_id_media_id_fk";
  
  ALTER TABLE "home_full_media" DROP CONSTRAINT "home_full_media_shader_studio_id_streak_looks_id_fk";
  
  ALTER TABLE "home_media_split" DROP CONSTRAINT "home_media_split_shader_studio_id_streak_looks_id_fk";
  
  ALTER TABLE "home_split_narrow" DROP CONSTRAINT "home_split_narrow_shader_studio_id_streak_looks_id_fk";
  
  ALTER TABLE "home_blocks_feature_tabs_tabs" DROP CONSTRAINT "home_blocks_feature_tabs_tabs_shader_studio_id_streak_looks_id_fk";
  
  ALTER TABLE "home_aud_tabs_tabs" DROP CONSTRAINT "home_aud_tabs_tabs_shader_studio_id_streak_looks_id_fk";
  
  ALTER TABLE "home" DROP CONSTRAINT "home_hero_shader_studio_id_streak_looks_id_fk";
  
  ALTER TABLE "__home_v_full_media_v" DROP CONSTRAINT "__home_v_full_media_v_shader_studio_id_streak_looks_id_fk";
  
  ALTER TABLE "__home_v_media_split_v" DROP CONSTRAINT "__home_v_media_split_v_shader_studio_id_streak_looks_id_fk";
  
  ALTER TABLE "__home_v_split_narrow_v" DROP CONSTRAINT "__home_v_split_narrow_v_shader_studio_id_streak_looks_id_fk";
  
  ALTER TABLE "_home_v_blocks_feature_tabs_tabs" DROP CONSTRAINT "_home_v_blocks_feature_tabs_tabs_shader_studio_id_streak_looks_id_fk";
  
  ALTER TABLE "__home_v_aud_tabs_v_tabs" DROP CONSTRAINT "__home_v_aud_tabs_v_tabs_shader_studio_id_streak_looks_id_fk";
  
  ALTER TABLE "_home_v" DROP CONSTRAINT "_home_v_version_hero_shader_studio_id_streak_looks_id_fk";
  
  ALTER TABLE "insights_index" DROP CONSTRAINT "insights_index_hero_shader_studio_id_streak_looks_id_fk";
  
  ALTER TABLE "insights_index" DROP CONSTRAINT "insights_index_menu_preview_shader_studio_id_streak_looks_id_fk";
  
  ALTER TABLE "_insights_index_v" DROP CONSTRAINT "_insights_index_v_version_hero_shader_studio_id_streak_looks_id_fk";
  
  ALTER TABLE "_insights_index_v" DROP CONSTRAINT "_insights_index_v_version_menu_preview_shader_studio_id_streak_looks_id_fk";
  
  ALTER TABLE "works_index" DROP CONSTRAINT "works_index_hero_shader_studio_id_streak_looks_id_fk";
  
  ALTER TABLE "works_index" DROP CONSTRAINT "works_index_menu_preview_shader_studio_id_streak_looks_id_fk";
  
  ALTER TABLE "_works_index_v" DROP CONSTRAINT "_works_index_v_version_hero_shader_studio_id_streak_looks_id_fk";
  
  ALTER TABLE "_works_index_v" DROP CONSTRAINT "_works_index_v_version_menu_preview_shader_studio_id_streak_looks_id_fk";
  
  DROP INDEX "pages_full_media_shader_shader_studio_idx";
  DROP INDEX "pages_media_split_shader_shader_studio_idx";
  DROP INDEX "pages_split_narrow_shader_shader_studio_idx";
  DROP INDEX "pages_blocks_feature_tabs_tabs_shader_shader_studio_idx";
  DROP INDEX "pages_aud_tabs_tabs_shader_shader_studio_idx";
  DROP INDEX "pages_hero_shader_hero_shader_studio_idx";
  DROP INDEX "pages_menu_preview_shader_menu_preview_shader_studio_idx";
  DROP INDEX "__pages_v_full_media_v_shader_shader_studio_idx";
  DROP INDEX "__pages_v_media_split_v_shader_shader_studio_idx";
  DROP INDEX "__pages_v_split_narrow_v_shader_shader_studio_idx";
  DROP INDEX "_pages_v_blocks_feature_tabs_tabs_shader_shader_studio_idx";
  DROP INDEX "__pages_v_aud_tabs_v_tabs_shader_shader_studio_idx";
  DROP INDEX "_pages_v_version_hero_shader_version_hero_shader_studio_idx";
  DROP INDEX "_pages_v_version_menu_preview_shader_version_menu_prev_2_idx";
  DROP INDEX "posts_full_media_shader_shader_studio_idx";
  DROP INDEX "posts_media_split_shader_shader_studio_idx";
  DROP INDEX "posts_split_narrow_shader_shader_studio_idx";
  DROP INDEX "posts_blocks_feature_tabs_tabs_shader_shader_studio_idx";
  DROP INDEX "posts_shader_shader_studio_idx";
  DROP INDEX "__posts_v_full_media_v_shader_shader_studio_idx";
  DROP INDEX "__posts_v_media_split_v_shader_shader_studio_idx";
  DROP INDEX "__posts_v_split_narrow_v_shader_shader_studio_idx";
  DROP INDEX "_posts_v_blocks_feature_tabs_tabs_shader_shader_studio_idx";
  DROP INDEX "_posts_v_version_shader_version_shader_studio_idx";
  DROP INDEX "work_pages_full_media_shader_shader_studio_idx";
  DROP INDEX "work_pages_media_split_shader_shader_studio_idx";
  DROP INDEX "work_pages_split_narrow_shader_shader_studio_idx";
  DROP INDEX "work_pages_blocks_feature_tabs_tabs_shader_shader_studio_idx";
  DROP INDEX "work_pages_aud_tabs_tabs_shader_shader_studio_idx";
  DROP INDEX "work_pages_hero_shader_hero_shader_studio_idx";
  DROP INDEX "work_pages_menu_preview_shader_menu_preview_shader_studi_idx";
  DROP INDEX "__work_pages_v_full_media_v_shader_shader_studio_idx";
  DROP INDEX "__work_pages_v_media_split_v_shader_shader_studio_idx";
  DROP INDEX "__work_pages_v_split_narrow_v_shader_shader_studio_idx";
  DROP INDEX "_work_pages_v_blocks_feature_tabs_tabs_shader_shader_stu_idx";
  DROP INDEX "__work_pages_v_aud_tabs_v_tabs_shader_shader_studio_idx";
  DROP INDEX "_work_pages_v_version_hero_shader_version_hero_shader_st_idx";
  DROP INDEX "_work_pages_v_version_menu_preview_shader_version_menu_2_idx";
  DROP INDEX "lab_pages_full_media_shader_shader_studio_idx";
  DROP INDEX "lab_pages_media_split_shader_shader_studio_idx";
  DROP INDEX "lab_pages_split_narrow_shader_shader_studio_idx";
  DROP INDEX "lab_pages_blocks_feature_tabs_tabs_shader_shader_studio_idx";
  DROP INDEX "lab_pages_hero_shader_hero_shader_studio_idx";
  DROP INDEX "__lab_pages_v_full_media_v_shader_shader_studio_idx";
  DROP INDEX "__lab_pages_v_media_split_v_shader_shader_studio_idx";
  DROP INDEX "__lab_pages_v_split_narrow_v_shader_shader_studio_idx";
  DROP INDEX "_lab_pages_v_blocks_feature_tabs_tabs_shader_shader_stud_idx";
  DROP INDEX "_lab_pages_v_version_hero_shader_version_hero_shader_stu_idx";
  DROP INDEX "expertise_pages_full_media_shader_shader_studio_idx";
  DROP INDEX "expertise_pages_media_split_shader_shader_studio_idx";
  DROP INDEX "expertise_pages_split_narrow_shader_shader_studio_idx";
  DROP INDEX "expertise_pages_blocks_feature_tabs_tabs_shader_shader_s_idx";
  DROP INDEX "expertise_pages_aud_tabs_tabs_shader_shader_studio_idx";
  DROP INDEX "expertise_pages_hero_shader_hero_shader_studio_idx";
  DROP INDEX "expertise_pages_menu_preview_shader_menu_preview_shade_2_idx";
  DROP INDEX "__expertise_pages_v_full_media_v_shader_shader_studio_idx";
  DROP INDEX "__expertise_pages_v_media_split_v_shader_shader_studio_idx";
  DROP INDEX "__expertise_pages_v_split_narrow_v_shader_shader_studio_idx";
  DROP INDEX "_expertise_pages_v_blocks_feature_tabs_tabs_shader_sha_2_idx";
  DROP INDEX "__expertise_pages_v_aud_tabs_v_tabs_shader_shader_studio_idx";
  DROP INDEX "_expertise_pages_v_version_hero_shader_version_hero_sh_2_idx";
  DROP INDEX "_expertise_pages_v_version_menu_preview_shader_version_2_idx";
  DROP INDEX "audience_pages_full_media_shader_shader_studio_idx";
  DROP INDEX "audience_pages_media_split_shader_shader_studio_idx";
  DROP INDEX "audience_pages_split_narrow_shader_shader_studio_idx";
  DROP INDEX "audience_pages_blocks_feature_tabs_tabs_shader_shader_st_idx";
  DROP INDEX "audience_pages_aud_tabs_tabs_shader_shader_studio_idx";
  DROP INDEX "audience_pages_hero_shader_hero_shader_studio_idx";
  DROP INDEX "audience_pages_menu_preview_shader_menu_preview_shader_s_idx";
  DROP INDEX "__audience_pages_v_full_media_v_shader_shader_studio_idx";
  DROP INDEX "__audience_pages_v_media_split_v_shader_shader_studio_idx";
  DROP INDEX "__audience_pages_v_split_narrow_v_shader_shader_studio_idx";
  DROP INDEX "_audience_pages_v_blocks_feature_tabs_tabs_shader_shad_2_idx";
  DROP INDEX "__audience_pages_v_aud_tabs_v_tabs_shader_shader_studio_idx";
  DROP INDEX "_audience_pages_v_version_hero_shader_version_hero_sha_2_idx";
  DROP INDEX "_audience_pages_v_version_menu_preview_shader_version__2_idx";
  DROP INDEX "contact_pages_menu_preview_shader_menu_preview_shader_st_idx";
  DROP INDEX "_contact_pages_v_version_menu_preview_shader_version_m_2_idx";
  DROP INDEX "streak_looks_light_poster_idx";
  DROP INDEX "_streak_looks_v_version_version_light_poster_idx";
  DROP INDEX "home_full_media_shader_shader_studio_idx";
  DROP INDEX "home_media_split_shader_shader_studio_idx";
  DROP INDEX "home_split_narrow_shader_shader_studio_idx";
  DROP INDEX "home_blocks_feature_tabs_tabs_shader_shader_studio_idx";
  DROP INDEX "home_aud_tabs_tabs_shader_shader_studio_idx";
  DROP INDEX "home_hero_shader_hero_shader_studio_idx";
  DROP INDEX "__home_v_full_media_v_shader_shader_studio_idx";
  DROP INDEX "__home_v_media_split_v_shader_shader_studio_idx";
  DROP INDEX "__home_v_split_narrow_v_shader_shader_studio_idx";
  DROP INDEX "_home_v_blocks_feature_tabs_tabs_shader_shader_studio_idx";
  DROP INDEX "__home_v_aud_tabs_v_tabs_shader_shader_studio_idx";
  DROP INDEX "_home_v_version_hero_shader_version_hero_shader_studio_idx";
  DROP INDEX "insights_index_hero_shader_hero_shader_studio_idx";
  DROP INDEX "insights_index_menu_preview_shader_menu_preview_shader_s_idx";
  DROP INDEX "_insights_index_v_version_hero_shader_version_hero_sha_2_idx";
  DROP INDEX "_insights_index_v_version_menu_preview_shader_version__2_idx";
  DROP INDEX "works_index_hero_shader_hero_shader_studio_idx";
  DROP INDEX "works_index_menu_preview_shader_menu_preview_shader_stud_idx";
  DROP INDEX "_works_index_v_version_hero_shader_version_hero_shader_s_idx";
  DROP INDEX "_works_index_v_version_menu_preview_shader_version_men_2_idx";
  DROP INDEX "_pages_v_version_menu_preview_shader_version_menu_previe_idx";
  DROP INDEX "_pages_v_version_menu_preview_shader_version_menu_prev_1_idx";
  DROP INDEX "_work_pages_v_version_menu_preview_shader_version_menu_p_idx";
  DROP INDEX "_work_pages_v_version_menu_preview_shader_version_menu_1_idx";
  DROP INDEX "expertise_pages_menu_preview_shader_menu_preview_shader__idx";
  DROP INDEX "expertise_pages_menu_preview_shader_menu_preview_shade_1_idx";
  DROP INDEX "_expertise_pages_v_blocks_feature_tabs_tabs_shader_shade_idx";
  DROP INDEX "_expertise_pages_v_blocks_feature_tabs_tabs_shader_sha_1_idx";
  DROP INDEX "_expertise_pages_v_version_hero_shader_version_hero_shad_idx";
  DROP INDEX "_expertise_pages_v_version_hero_shader_version_hero_sh_1_idx";
  DROP INDEX "_expertise_pages_v_version_menu_preview_shader_version_m_idx";
  DROP INDEX "_expertise_pages_v_version_menu_preview_shader_version_1_idx";
  DROP INDEX "_audience_pages_v_blocks_feature_tabs_tabs_shader_shader_idx";
  DROP INDEX "_audience_pages_v_blocks_feature_tabs_tabs_shader_shad_1_idx";
  DROP INDEX "_audience_pages_v_version_hero_shader_version_hero_shade_idx";
  DROP INDEX "_audience_pages_v_version_hero_shader_version_hero_sha_1_idx";
  DROP INDEX "_audience_pages_v_version_menu_preview_shader_version_me_idx";
  DROP INDEX "_audience_pages_v_version_menu_preview_shader_version__1_idx";
  DROP INDEX "_contact_pages_v_version_menu_preview_shader_version_men_idx";
  DROP INDEX "_contact_pages_v_version_menu_preview_shader_version_m_1_idx";
  DROP INDEX "_insights_index_v_version_hero_shader_version_hero_shade_idx";
  DROP INDEX "_insights_index_v_version_hero_shader_version_hero_sha_1_idx";
  DROP INDEX "_insights_index_v_version_menu_preview_shader_version_me_idx";
  DROP INDEX "_insights_index_v_version_menu_preview_shader_version__1_idx";
  DROP INDEX "_works_index_v_version_menu_preview_shader_version_menu__idx";
  DROP INDEX "_works_index_v_version_menu_preview_shader_version_men_1_idx";
  CREATE INDEX "_pages_v_version_menu_preview_shader_version_menu_previe_idx" ON "_pages_v" USING btree ("version_menu_preview_shader_release_id");
  CREATE INDEX "_pages_v_version_menu_preview_shader_version_menu_prev_1_idx" ON "_pages_v" USING btree ("version_menu_preview_shader_poster_media_id");
  CREATE INDEX "_work_pages_v_version_menu_preview_shader_version_menu_p_idx" ON "_work_pages_v" USING btree ("version_menu_preview_shader_release_id");
  CREATE INDEX "_work_pages_v_version_menu_preview_shader_version_menu_1_idx" ON "_work_pages_v" USING btree ("version_menu_preview_shader_poster_media_id");
  CREATE INDEX "expertise_pages_menu_preview_shader_menu_preview_shader__idx" ON "expertise_pages" USING btree ("menu_preview_shader_release_id");
  CREATE INDEX "expertise_pages_menu_preview_shader_menu_preview_shade_1_idx" ON "expertise_pages" USING btree ("menu_preview_shader_poster_media_id");
  CREATE INDEX "_expertise_pages_v_blocks_feature_tabs_tabs_shader_shade_idx" ON "_expertise_pages_v_blocks_feature_tabs_tabs" USING btree ("shader_release_id");
  CREATE INDEX "_expertise_pages_v_blocks_feature_tabs_tabs_shader_sha_1_idx" ON "_expertise_pages_v_blocks_feature_tabs_tabs" USING btree ("shader_poster_media_id");
  CREATE INDEX "_expertise_pages_v_version_hero_shader_version_hero_shad_idx" ON "_expertise_pages_v" USING btree ("version_hero_shader_release_id");
  CREATE INDEX "_expertise_pages_v_version_hero_shader_version_hero_sh_1_idx" ON "_expertise_pages_v" USING btree ("version_hero_shader_poster_media_id");
  CREATE INDEX "_expertise_pages_v_version_menu_preview_shader_version_m_idx" ON "_expertise_pages_v" USING btree ("version_menu_preview_shader_release_id");
  CREATE INDEX "_expertise_pages_v_version_menu_preview_shader_version_1_idx" ON "_expertise_pages_v" USING btree ("version_menu_preview_shader_poster_media_id");
  CREATE INDEX "_audience_pages_v_blocks_feature_tabs_tabs_shader_shader_idx" ON "_audience_pages_v_blocks_feature_tabs_tabs" USING btree ("shader_release_id");
  CREATE INDEX "_audience_pages_v_blocks_feature_tabs_tabs_shader_shad_1_idx" ON "_audience_pages_v_blocks_feature_tabs_tabs" USING btree ("shader_poster_media_id");
  CREATE INDEX "_audience_pages_v_version_hero_shader_version_hero_shade_idx" ON "_audience_pages_v" USING btree ("version_hero_shader_release_id");
  CREATE INDEX "_audience_pages_v_version_hero_shader_version_hero_sha_1_idx" ON "_audience_pages_v" USING btree ("version_hero_shader_poster_media_id");
  CREATE INDEX "_audience_pages_v_version_menu_preview_shader_version_me_idx" ON "_audience_pages_v" USING btree ("version_menu_preview_shader_release_id");
  CREATE INDEX "_audience_pages_v_version_menu_preview_shader_version__1_idx" ON "_audience_pages_v" USING btree ("version_menu_preview_shader_poster_media_id");
  CREATE INDEX "_contact_pages_v_version_menu_preview_shader_version_men_idx" ON "_contact_pages_v" USING btree ("version_menu_preview_shader_release_id");
  CREATE INDEX "_contact_pages_v_version_menu_preview_shader_version_m_1_idx" ON "_contact_pages_v" USING btree ("version_menu_preview_shader_poster_media_id");
  CREATE INDEX "_insights_index_v_version_hero_shader_version_hero_shade_idx" ON "_insights_index_v" USING btree ("version_hero_shader_release_id");
  CREATE INDEX "_insights_index_v_version_hero_shader_version_hero_sha_1_idx" ON "_insights_index_v" USING btree ("version_hero_shader_poster_media_id");
  CREATE INDEX "_insights_index_v_version_menu_preview_shader_version_me_idx" ON "_insights_index_v" USING btree ("version_menu_preview_shader_release_id");
  CREATE INDEX "_insights_index_v_version_menu_preview_shader_version__1_idx" ON "_insights_index_v" USING btree ("version_menu_preview_shader_poster_media_id");
  CREATE INDEX "_works_index_v_version_menu_preview_shader_version_menu__idx" ON "_works_index_v" USING btree ("version_menu_preview_shader_release_id");
  CREATE INDEX "_works_index_v_version_menu_preview_shader_version_men_1_idx" ON "_works_index_v" USING btree ("version_menu_preview_shader_poster_media_id");
  ALTER TABLE "pages_full_media" DROP COLUMN "shader_studio_id";
  ALTER TABLE "pages_media_split" DROP COLUMN "shader_studio_id";
  ALTER TABLE "pages_split_narrow" DROP COLUMN "shader_studio_id";
  ALTER TABLE "pages_blocks_feature_tabs_tabs" DROP COLUMN "shader_studio_id";
  ALTER TABLE "pages_aud_tabs_tabs" DROP COLUMN "shader_studio_id";
  ALTER TABLE "pages" DROP COLUMN "hero_shader_studio_id";
  ALTER TABLE "pages" DROP COLUMN "menu_preview_shader_studio_id";
  ALTER TABLE "__pages_v_full_media_v" DROP COLUMN "shader_studio_id";
  ALTER TABLE "__pages_v_media_split_v" DROP COLUMN "shader_studio_id";
  ALTER TABLE "__pages_v_split_narrow_v" DROP COLUMN "shader_studio_id";
  ALTER TABLE "_pages_v_blocks_feature_tabs_tabs" DROP COLUMN "shader_studio_id";
  ALTER TABLE "__pages_v_aud_tabs_v_tabs" DROP COLUMN "shader_studio_id";
  ALTER TABLE "_pages_v" DROP COLUMN "version_hero_shader_studio_id";
  ALTER TABLE "_pages_v" DROP COLUMN "version_menu_preview_shader_studio_id";
  ALTER TABLE "posts_full_media" DROP COLUMN "shader_studio_id";
  ALTER TABLE "posts_media_split" DROP COLUMN "shader_studio_id";
  ALTER TABLE "posts_split_narrow" DROP COLUMN "shader_studio_id";
  ALTER TABLE "posts_blocks_feature_tabs_tabs" DROP COLUMN "shader_studio_id";
  ALTER TABLE "posts" DROP COLUMN "shader_studio_id";
  ALTER TABLE "__posts_v_full_media_v" DROP COLUMN "shader_studio_id";
  ALTER TABLE "__posts_v_media_split_v" DROP COLUMN "shader_studio_id";
  ALTER TABLE "__posts_v_split_narrow_v" DROP COLUMN "shader_studio_id";
  ALTER TABLE "_posts_v_blocks_feature_tabs_tabs" DROP COLUMN "shader_studio_id";
  ALTER TABLE "_posts_v" DROP COLUMN "version_shader_studio_id";
  ALTER TABLE "work_pages_full_media" DROP COLUMN "shader_studio_id";
  ALTER TABLE "work_pages_media_split" DROP COLUMN "shader_studio_id";
  ALTER TABLE "work_pages_split_narrow" DROP COLUMN "shader_studio_id";
  ALTER TABLE "work_pages_blocks_feature_tabs_tabs" DROP COLUMN "shader_studio_id";
  ALTER TABLE "work_pages_aud_tabs_tabs" DROP COLUMN "shader_studio_id";
  ALTER TABLE "work_pages" DROP COLUMN "hero_shader_studio_id";
  ALTER TABLE "work_pages" DROP COLUMN "menu_preview_shader_studio_id";
  ALTER TABLE "__work_pages_v_full_media_v" DROP COLUMN "shader_studio_id";
  ALTER TABLE "__work_pages_v_media_split_v" DROP COLUMN "shader_studio_id";
  ALTER TABLE "__work_pages_v_split_narrow_v" DROP COLUMN "shader_studio_id";
  ALTER TABLE "_work_pages_v_blocks_feature_tabs_tabs" DROP COLUMN "shader_studio_id";
  ALTER TABLE "__work_pages_v_aud_tabs_v_tabs" DROP COLUMN "shader_studio_id";
  ALTER TABLE "_work_pages_v" DROP COLUMN "version_hero_shader_studio_id";
  ALTER TABLE "_work_pages_v" DROP COLUMN "version_menu_preview_shader_studio_id";
  ALTER TABLE "lab_pages_full_media" DROP COLUMN "shader_studio_id";
  ALTER TABLE "lab_pages_media_split" DROP COLUMN "shader_studio_id";
  ALTER TABLE "lab_pages_split_narrow" DROP COLUMN "shader_studio_id";
  ALTER TABLE "lab_pages_blocks_feature_tabs_tabs" DROP COLUMN "shader_studio_id";
  ALTER TABLE "lab_pages" DROP COLUMN "hero_shader_studio_id";
  ALTER TABLE "__lab_pages_v_full_media_v" DROP COLUMN "shader_studio_id";
  ALTER TABLE "__lab_pages_v_media_split_v" DROP COLUMN "shader_studio_id";
  ALTER TABLE "__lab_pages_v_split_narrow_v" DROP COLUMN "shader_studio_id";
  ALTER TABLE "_lab_pages_v_blocks_feature_tabs_tabs" DROP COLUMN "shader_studio_id";
  ALTER TABLE "_lab_pages_v" DROP COLUMN "version_hero_shader_studio_id";
  ALTER TABLE "expertise_pages_full_media" DROP COLUMN "shader_studio_id";
  ALTER TABLE "expertise_pages_media_split" DROP COLUMN "shader_studio_id";
  ALTER TABLE "expertise_pages_split_narrow" DROP COLUMN "shader_studio_id";
  ALTER TABLE "expertise_pages_blocks_feature_tabs_tabs" DROP COLUMN "shader_studio_id";
  ALTER TABLE "expertise_pages_aud_tabs_tabs" DROP COLUMN "shader_studio_id";
  ALTER TABLE "expertise_pages" DROP COLUMN "hero_shader_studio_id";
  ALTER TABLE "expertise_pages" DROP COLUMN "menu_preview_shader_studio_id";
  ALTER TABLE "__expertise_pages_v_full_media_v" DROP COLUMN "shader_studio_id";
  ALTER TABLE "__expertise_pages_v_media_split_v" DROP COLUMN "shader_studio_id";
  ALTER TABLE "__expertise_pages_v_split_narrow_v" DROP COLUMN "shader_studio_id";
  ALTER TABLE "_expertise_pages_v_blocks_feature_tabs_tabs" DROP COLUMN "shader_studio_id";
  ALTER TABLE "__expertise_pages_v_aud_tabs_v_tabs" DROP COLUMN "shader_studio_id";
  ALTER TABLE "_expertise_pages_v" DROP COLUMN "version_hero_shader_studio_id";
  ALTER TABLE "_expertise_pages_v" DROP COLUMN "version_menu_preview_shader_studio_id";
  ALTER TABLE "audience_pages_full_media" DROP COLUMN "shader_studio_id";
  ALTER TABLE "audience_pages_media_split" DROP COLUMN "shader_studio_id";
  ALTER TABLE "audience_pages_split_narrow" DROP COLUMN "shader_studio_id";
  ALTER TABLE "audience_pages_blocks_feature_tabs_tabs" DROP COLUMN "shader_studio_id";
  ALTER TABLE "audience_pages_aud_tabs_tabs" DROP COLUMN "shader_studio_id";
  ALTER TABLE "audience_pages" DROP COLUMN "hero_shader_studio_id";
  ALTER TABLE "audience_pages" DROP COLUMN "menu_preview_shader_studio_id";
  ALTER TABLE "__audience_pages_v_full_media_v" DROP COLUMN "shader_studio_id";
  ALTER TABLE "__audience_pages_v_media_split_v" DROP COLUMN "shader_studio_id";
  ALTER TABLE "__audience_pages_v_split_narrow_v" DROP COLUMN "shader_studio_id";
  ALTER TABLE "_audience_pages_v_blocks_feature_tabs_tabs" DROP COLUMN "shader_studio_id";
  ALTER TABLE "__audience_pages_v_aud_tabs_v_tabs" DROP COLUMN "shader_studio_id";
  ALTER TABLE "_audience_pages_v" DROP COLUMN "version_hero_shader_studio_id";
  ALTER TABLE "_audience_pages_v" DROP COLUMN "version_menu_preview_shader_studio_id";
  ALTER TABLE "contact_pages" DROP COLUMN "menu_preview_shader_studio_id";
  ALTER TABLE "_contact_pages_v" DROP COLUMN "version_menu_preview_shader_studio_id";
  ALTER TABLE "streak_looks" DROP COLUMN "light_poster_id";
  ALTER TABLE "streak_looks" DROP COLUMN "snapshot";
  ALTER TABLE "streak_looks" DROP COLUMN "posters";
  ALTER TABLE "streak_looks" DROP COLUMN "source_hash";
  ALTER TABLE "_streak_looks_v" DROP COLUMN "version_light_poster_id";
  ALTER TABLE "_streak_looks_v" DROP COLUMN "version_snapshot";
  ALTER TABLE "_streak_looks_v" DROP COLUMN "version_posters";
  ALTER TABLE "_streak_looks_v" DROP COLUMN "version_source_hash";
  ALTER TABLE "home_full_media" DROP COLUMN "shader_studio_id";
  ALTER TABLE "home_media_split" DROP COLUMN "shader_studio_id";
  ALTER TABLE "home_split_narrow" DROP COLUMN "shader_studio_id";
  ALTER TABLE "home_blocks_feature_tabs_tabs" DROP COLUMN "shader_studio_id";
  ALTER TABLE "home_aud_tabs_tabs" DROP COLUMN "shader_studio_id";
  ALTER TABLE "home" DROP COLUMN "hero_shader_studio_id";
  ALTER TABLE "__home_v_full_media_v" DROP COLUMN "shader_studio_id";
  ALTER TABLE "__home_v_media_split_v" DROP COLUMN "shader_studio_id";
  ALTER TABLE "__home_v_split_narrow_v" DROP COLUMN "shader_studio_id";
  ALTER TABLE "_home_v_blocks_feature_tabs_tabs" DROP COLUMN "shader_studio_id";
  ALTER TABLE "__home_v_aud_tabs_v_tabs" DROP COLUMN "shader_studio_id";
  ALTER TABLE "_home_v" DROP COLUMN "version_hero_shader_studio_id";
  ALTER TABLE "insights_index" DROP COLUMN "hero_shader_studio_id";
  ALTER TABLE "insights_index" DROP COLUMN "menu_preview_shader_studio_id";
  ALTER TABLE "_insights_index_v" DROP COLUMN "version_hero_shader_studio_id";
  ALTER TABLE "_insights_index_v" DROP COLUMN "version_menu_preview_shader_studio_id";
  ALTER TABLE "works_index" DROP COLUMN "hero_shader_studio_id";
  ALTER TABLE "works_index" DROP COLUMN "menu_preview_shader_studio_id";
  ALTER TABLE "_works_index_v" DROP COLUMN "version_hero_shader_studio_id";
  ALTER TABLE "_works_index_v" DROP COLUMN "version_menu_preview_shader_studio_id";`)
}
