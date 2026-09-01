import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "posts" ADD COLUMN "standfirst" varchar;
  ALTER TABLE "posts" ADD COLUMN "hide_related_posts" boolean DEFAULT false;
  ALTER TABLE "posts" ADD COLUMN "editorial_notes" varchar;
  ALTER TABLE "_posts_v" ADD COLUMN "version_standfirst" varchar;
  ALTER TABLE "_posts_v" ADD COLUMN "version_hide_related_posts" boolean DEFAULT false;
  ALTER TABLE "_posts_v" ADD COLUMN "version_editorial_notes" varchar;
  ALTER TABLE "posts" DROP COLUMN "hero_style";
  ALTER TABLE "_posts_v" DROP COLUMN "version_hero_style";
  DROP TYPE "public"."enum_posts_hero_style";
  DROP TYPE "public"."enum__posts_v_version_hero_style";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_posts_hero_style" AS ENUM('immersive', 'banner');
  CREATE TYPE "public"."enum__posts_v_version_hero_style" AS ENUM('immersive', 'banner');
  ALTER TABLE "posts" ADD COLUMN "hero_style" "enum_posts_hero_style" DEFAULT 'immersive';
  ALTER TABLE "_posts_v" ADD COLUMN "version_hero_style" "enum__posts_v_version_hero_style" DEFAULT 'immersive';
  ALTER TABLE "posts" DROP COLUMN "standfirst";
  ALTER TABLE "posts" DROP COLUMN "hide_related_posts";
  ALTER TABLE "posts" DROP COLUMN "editorial_notes";
  ALTER TABLE "_posts_v" DROP COLUMN "version_standfirst";
  ALTER TABLE "_posts_v" DROP COLUMN "version_hide_related_posts";
  ALTER TABLE "_posts_v" DROP COLUMN "version_editorial_notes";`)
}
