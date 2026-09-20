import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_lab_index_banner_link_type" AS ENUM('reference', 'site', 'custom');
  CREATE TYPE "public"."enum_lab_index_banner_link_site_page" AS ENUM('home', 'works-index', 'insights-index', 'lab-index');
  CREATE TYPE "public"."enum_lab_index_banner_visual_type" AS ENUM('media', 'streakField');
  CREATE TYPE "public"."enum__lab_index_v_version_banner_link_type" AS ENUM('reference', 'site', 'custom');
  CREATE TYPE "public"."enum__lab_index_v_version_banner_link_site_page" AS ENUM('home', 'works-index', 'insights-index', 'lab-index');
  CREATE TYPE "public"."enum__lab_index_v_version_banner_visual_type" AS ENUM('media', 'streakField');
  ALTER TABLE "lab_index" ADD COLUMN "banner_show" boolean DEFAULT false;
  ALTER TABLE "lab_index" ADD COLUMN "banner_heading" varchar;
  ALTER TABLE "lab_index" ADD COLUMN "banner_body" varchar;
  ALTER TABLE "lab_index" ADD COLUMN "banner_link_type" "enum_lab_index_banner_link_type" DEFAULT 'reference';
  ALTER TABLE "lab_index" ADD COLUMN "banner_link_new_tab" boolean;
  ALTER TABLE "lab_index" ADD COLUMN "banner_link_site_page" "enum_lab_index_banner_link_site_page";
  ALTER TABLE "lab_index" ADD COLUMN "banner_link_url" varchar;
  ALTER TABLE "lab_index" ADD COLUMN "banner_link_label" varchar;
  ALTER TABLE "lab_index" ADD COLUMN "banner_media_id" integer;
  ALTER TABLE "lab_index" ADD COLUMN "banner_visual_type" "enum_lab_index_banner_visual_type";
  ALTER TABLE "lab_index" ADD COLUMN "banner_shader_studio_id" integer;
  ALTER TABLE "lab_index" ADD COLUMN "banner_shader_preset" varchar;
  ALTER TABLE "lab_index" ADD COLUMN "banner_shader_seed" numeric;
  ALTER TABLE "lab_index" ADD COLUMN "banner_shader_speed" numeric;
  ALTER TABLE "lab_index" ADD COLUMN "banner_shader_intensity" numeric;
  ALTER TABLE "lab_index" ADD COLUMN "banner_shader_release_id" integer;
  ALTER TABLE "lab_index" ADD COLUMN "banner_shader_surface" "enum_visual_surface" DEFAULT 'auto';
  ALTER TABLE "lab_index" ADD COLUMN "banner_shader_pointer_interaction" boolean DEFAULT false;
  ALTER TABLE "lab_index" ADD COLUMN "banner_shader_poster_media_id" integer;
  ALTER TABLE "_lab_index_v" ADD COLUMN "version_banner_show" boolean DEFAULT false;
  ALTER TABLE "_lab_index_v" ADD COLUMN "version_banner_heading" varchar;
  ALTER TABLE "_lab_index_v" ADD COLUMN "version_banner_body" varchar;
  ALTER TABLE "_lab_index_v" ADD COLUMN "version_banner_link_type" "enum__lab_index_v_version_banner_link_type" DEFAULT 'reference';
  ALTER TABLE "_lab_index_v" ADD COLUMN "version_banner_link_new_tab" boolean;
  ALTER TABLE "_lab_index_v" ADD COLUMN "version_banner_link_site_page" "enum__lab_index_v_version_banner_link_site_page";
  ALTER TABLE "_lab_index_v" ADD COLUMN "version_banner_link_url" varchar;
  ALTER TABLE "_lab_index_v" ADD COLUMN "version_banner_link_label" varchar;
  ALTER TABLE "_lab_index_v" ADD COLUMN "version_banner_media_id" integer;
  ALTER TABLE "_lab_index_v" ADD COLUMN "version_banner_visual_type" "enum__lab_index_v_version_banner_visual_type";
  ALTER TABLE "_lab_index_v" ADD COLUMN "version_banner_shader_studio_id" integer;
  ALTER TABLE "_lab_index_v" ADD COLUMN "version_banner_shader_preset" varchar;
  ALTER TABLE "_lab_index_v" ADD COLUMN "version_banner_shader_seed" numeric;
  ALTER TABLE "_lab_index_v" ADD COLUMN "version_banner_shader_speed" numeric;
  ALTER TABLE "_lab_index_v" ADD COLUMN "version_banner_shader_intensity" numeric;
  ALTER TABLE "_lab_index_v" ADD COLUMN "version_banner_shader_release_id" integer;
  ALTER TABLE "_lab_index_v" ADD COLUMN "version_banner_shader_surface" "enum_visual_surface" DEFAULT 'auto';
  ALTER TABLE "_lab_index_v" ADD COLUMN "version_banner_shader_pointer_interaction" boolean DEFAULT false;
  ALTER TABLE "_lab_index_v" ADD COLUMN "version_banner_shader_poster_media_id" integer;
  ALTER TABLE "lab_index" ADD CONSTRAINT "lab_index_banner_media_id_media_id_fk" FOREIGN KEY ("banner_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "lab_index" ADD CONSTRAINT "lab_index_banner_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("banner_shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "lab_index" ADD CONSTRAINT "lab_index_banner_shader_release_id_streak_releases_id_fk" FOREIGN KEY ("banner_shader_release_id") REFERENCES "public"."streak_releases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "lab_index" ADD CONSTRAINT "lab_index_banner_shader_poster_media_id_media_id_fk" FOREIGN KEY ("banner_shader_poster_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_lab_index_v" ADD CONSTRAINT "_lab_index_v_version_banner_media_id_media_id_fk" FOREIGN KEY ("version_banner_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_lab_index_v" ADD CONSTRAINT "_lab_index_v_version_banner_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("version_banner_shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_lab_index_v" ADD CONSTRAINT "_lab_index_v_version_banner_shader_release_id_streak_releases_id_fk" FOREIGN KEY ("version_banner_shader_release_id") REFERENCES "public"."streak_releases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_lab_index_v" ADD CONSTRAINT "_lab_index_v_version_banner_shader_poster_media_id_media_id_fk" FOREIGN KEY ("version_banner_shader_poster_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "lab_index_banner_banner_media_idx" ON "lab_index" USING btree ("banner_media_id");
  CREATE INDEX "lab_index_banner_shader_banner_shader_studio_idx" ON "lab_index" USING btree ("banner_shader_studio_id");
  CREATE INDEX "lab_index_banner_shader_banner_shader_release_idx" ON "lab_index" USING btree ("banner_shader_release_id");
  CREATE INDEX "lab_index_banner_shader_banner_shader_poster_media_idx" ON "lab_index" USING btree ("banner_shader_poster_media_id");
  CREATE INDEX "_lab_index_v_version_banner_version_banner_media_idx" ON "_lab_index_v" USING btree ("version_banner_media_id");
  CREATE INDEX "_lab_index_v_version_banner_shader_version_banner_shader_idx" ON "_lab_index_v" USING btree ("version_banner_shader_studio_id");
  CREATE INDEX "_lab_index_v_version_banner_shader_version_banner_shad_1_idx" ON "_lab_index_v" USING btree ("version_banner_shader_release_id");
  CREATE INDEX "_lab_index_v_version_banner_shader_version_banner_shad_2_idx" ON "_lab_index_v" USING btree ("version_banner_shader_poster_media_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "lab_index" DROP CONSTRAINT "lab_index_banner_media_id_media_id_fk";
  
  ALTER TABLE "lab_index" DROP CONSTRAINT "lab_index_banner_shader_studio_id_streak_looks_id_fk";
  
  ALTER TABLE "lab_index" DROP CONSTRAINT "lab_index_banner_shader_release_id_streak_releases_id_fk";
  
  ALTER TABLE "lab_index" DROP CONSTRAINT "lab_index_banner_shader_poster_media_id_media_id_fk";
  
  ALTER TABLE "_lab_index_v" DROP CONSTRAINT "_lab_index_v_version_banner_media_id_media_id_fk";
  
  ALTER TABLE "_lab_index_v" DROP CONSTRAINT "_lab_index_v_version_banner_shader_studio_id_streak_looks_id_fk";
  
  ALTER TABLE "_lab_index_v" DROP CONSTRAINT "_lab_index_v_version_banner_shader_release_id_streak_releases_id_fk";
  
  ALTER TABLE "_lab_index_v" DROP CONSTRAINT "_lab_index_v_version_banner_shader_poster_media_id_media_id_fk";
  
  DROP INDEX "lab_index_banner_banner_media_idx";
  DROP INDEX "lab_index_banner_shader_banner_shader_studio_idx";
  DROP INDEX "lab_index_banner_shader_banner_shader_release_idx";
  DROP INDEX "lab_index_banner_shader_banner_shader_poster_media_idx";
  DROP INDEX "_lab_index_v_version_banner_version_banner_media_idx";
  DROP INDEX "_lab_index_v_version_banner_shader_version_banner_shader_idx";
  DROP INDEX "_lab_index_v_version_banner_shader_version_banner_shad_1_idx";
  DROP INDEX "_lab_index_v_version_banner_shader_version_banner_shad_2_idx";
  ALTER TABLE "lab_index" DROP COLUMN "banner_show";
  ALTER TABLE "lab_index" DROP COLUMN "banner_heading";
  ALTER TABLE "lab_index" DROP COLUMN "banner_body";
  ALTER TABLE "lab_index" DROP COLUMN "banner_link_type";
  ALTER TABLE "lab_index" DROP COLUMN "banner_link_new_tab";
  ALTER TABLE "lab_index" DROP COLUMN "banner_link_site_page";
  ALTER TABLE "lab_index" DROP COLUMN "banner_link_url";
  ALTER TABLE "lab_index" DROP COLUMN "banner_link_label";
  ALTER TABLE "lab_index" DROP COLUMN "banner_media_id";
  ALTER TABLE "lab_index" DROP COLUMN "banner_visual_type";
  ALTER TABLE "lab_index" DROP COLUMN "banner_shader_studio_id";
  ALTER TABLE "lab_index" DROP COLUMN "banner_shader_preset";
  ALTER TABLE "lab_index" DROP COLUMN "banner_shader_seed";
  ALTER TABLE "lab_index" DROP COLUMN "banner_shader_speed";
  ALTER TABLE "lab_index" DROP COLUMN "banner_shader_intensity";
  ALTER TABLE "lab_index" DROP COLUMN "banner_shader_release_id";
  ALTER TABLE "lab_index" DROP COLUMN "banner_shader_surface";
  ALTER TABLE "lab_index" DROP COLUMN "banner_shader_pointer_interaction";
  ALTER TABLE "lab_index" DROP COLUMN "banner_shader_poster_media_id";
  ALTER TABLE "_lab_index_v" DROP COLUMN "version_banner_show";
  ALTER TABLE "_lab_index_v" DROP COLUMN "version_banner_heading";
  ALTER TABLE "_lab_index_v" DROP COLUMN "version_banner_body";
  ALTER TABLE "_lab_index_v" DROP COLUMN "version_banner_link_type";
  ALTER TABLE "_lab_index_v" DROP COLUMN "version_banner_link_new_tab";
  ALTER TABLE "_lab_index_v" DROP COLUMN "version_banner_link_site_page";
  ALTER TABLE "_lab_index_v" DROP COLUMN "version_banner_link_url";
  ALTER TABLE "_lab_index_v" DROP COLUMN "version_banner_link_label";
  ALTER TABLE "_lab_index_v" DROP COLUMN "version_banner_media_id";
  ALTER TABLE "_lab_index_v" DROP COLUMN "version_banner_visual_type";
  ALTER TABLE "_lab_index_v" DROP COLUMN "version_banner_shader_studio_id";
  ALTER TABLE "_lab_index_v" DROP COLUMN "version_banner_shader_preset";
  ALTER TABLE "_lab_index_v" DROP COLUMN "version_banner_shader_seed";
  ALTER TABLE "_lab_index_v" DROP COLUMN "version_banner_shader_speed";
  ALTER TABLE "_lab_index_v" DROP COLUMN "version_banner_shader_intensity";
  ALTER TABLE "_lab_index_v" DROP COLUMN "version_banner_shader_release_id";
  ALTER TABLE "_lab_index_v" DROP COLUMN "version_banner_shader_surface";
  ALTER TABLE "_lab_index_v" DROP COLUMN "version_banner_shader_pointer_interaction";
  ALTER TABLE "_lab_index_v" DROP COLUMN "version_banner_shader_poster_media_id";
  DROP TYPE "public"."enum_lab_index_banner_link_type";
  DROP TYPE "public"."enum_lab_index_banner_link_site_page";
  DROP TYPE "public"."enum_lab_index_banner_visual_type";
  DROP TYPE "public"."enum__lab_index_v_version_banner_link_type";
  DROP TYPE "public"."enum__lab_index_v_version_banner_link_site_page";
  DROP TYPE "public"."enum__lab_index_v_version_banner_visual_type";`)
}
