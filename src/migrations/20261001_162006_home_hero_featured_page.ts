import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "home" DROP CONSTRAINT "home_hero_featured_post_id_posts_id_fk";
  
  ALTER TABLE "_home_v" DROP CONSTRAINT "_home_v_version_hero_featured_post_id_posts_id_fk";
  
  DROP INDEX "home_hero_hero_featured_post_idx";
  DROP INDEX "_home_v_version_hero_version_hero_featured_post_idx";
  ALTER TABLE "home" ALTER COLUMN "hero_featured_label" DROP DEFAULT;
  ALTER TABLE "_home_v" ALTER COLUMN "version_hero_featured_label" DROP DEFAULT;
  ALTER TABLE "home_rels" ADD COLUMN "work_pages_id" integer;
  ALTER TABLE "home_rels" ADD COLUMN "lab_pages_id" integer;
  ALTER TABLE "_home_v_rels" ADD COLUMN "work_pages_id" integer;
  ALTER TABLE "_home_v_rels" ADD COLUMN "lab_pages_id" integer;
  ALTER TABLE "home_rels" ADD CONSTRAINT "home_rels_work_pages_fk" FOREIGN KEY ("work_pages_id") REFERENCES "public"."work_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_rels" ADD CONSTRAINT "home_rels_lab_pages_fk" FOREIGN KEY ("lab_pages_id") REFERENCES "public"."lab_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_rels" ADD CONSTRAINT "_home_v_rels_work_pages_fk" FOREIGN KEY ("work_pages_id") REFERENCES "public"."work_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_rels" ADD CONSTRAINT "_home_v_rels_lab_pages_fk" FOREIGN KEY ("lab_pages_id") REFERENCES "public"."lab_pages"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "home_rels_work_pages_id_idx" ON "home_rels" USING btree ("work_pages_id");
  CREATE INDEX "home_rels_lab_pages_id_idx" ON "home_rels" USING btree ("lab_pages_id");
  CREATE INDEX "_home_v_rels_work_pages_id_idx" ON "_home_v_rels" USING btree ("work_pages_id");
  CREATE INDEX "_home_v_rels_lab_pages_id_idx" ON "_home_v_rels" USING btree ("lab_pages_id");
  -- hero.featuredPost (posts only) became the polymorphic hero.featuredPage,
  -- stored in the rels tables. Carry the picked post across for the live
  -- document and every version (the admin opens the latest draft) before
  -- the old column goes. A single relation stores no order.
  INSERT INTO "home_rels" ("order", "parent_id", "path", "posts_id")
    SELECT NULL, "id", 'hero.featuredPage', "hero_featured_post_id"
    FROM "home" WHERE "hero_featured_post_id" IS NOT NULL;
  INSERT INTO "_home_v_rels" ("order", "parent_id", "path", "posts_id")
    SELECT NULL, "id", 'version.hero.featuredPage', "version_hero_featured_post_id"
    FROM "_home_v" WHERE "version_hero_featured_post_id" IS NOT NULL;
  -- An empty label now falls back to the section name, which is Insights for
  -- a post. Clear stored copies of the old default so a card switched to a
  -- work or lab page does not keep saying Insights.
  UPDATE "home" SET "hero_featured_label" = NULL WHERE "hero_featured_label" = 'Insights';
  UPDATE "_home_v" SET "version_hero_featured_label" = NULL WHERE "version_hero_featured_label" = 'Insights';
  ALTER TABLE "home" DROP COLUMN "hero_featured_post_id";
  ALTER TABLE "_home_v" DROP COLUMN "version_hero_featured_post_id";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "home_rels" DROP CONSTRAINT "home_rels_work_pages_fk";
  
  ALTER TABLE "home_rels" DROP CONSTRAINT "home_rels_lab_pages_fk";
  
  ALTER TABLE "_home_v_rels" DROP CONSTRAINT "_home_v_rels_work_pages_fk";
  
  ALTER TABLE "_home_v_rels" DROP CONSTRAINT "_home_v_rels_lab_pages_fk";
  
  DROP INDEX "home_rels_work_pages_id_idx";
  DROP INDEX "home_rels_lab_pages_id_idx";
  DROP INDEX "_home_v_rels_work_pages_id_idx";
  DROP INDEX "_home_v_rels_lab_pages_id_idx";
  ALTER TABLE "home" ALTER COLUMN "hero_featured_label" SET DEFAULT 'Insights';
  ALTER TABLE "_home_v" ALTER COLUMN "version_hero_featured_label" SET DEFAULT 'Insights';
  ALTER TABLE "home" ADD COLUMN "hero_featured_post_id" integer;
  ALTER TABLE "_home_v" ADD COLUMN "version_hero_featured_post_id" integer;
  ALTER TABLE "home" ADD CONSTRAINT "home_hero_featured_post_id_posts_id_fk" FOREIGN KEY ("hero_featured_post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_home_v" ADD CONSTRAINT "_home_v_version_hero_featured_post_id_posts_id_fk" FOREIGN KEY ("version_hero_featured_post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "home_hero_hero_featured_post_idx" ON "home" USING btree ("hero_featured_post_id");
  CREATE INDEX "_home_v_version_hero_version_hero_featured_post_idx" ON "_home_v" USING btree ("version_hero_featured_post_id");
  -- Only a post fits the old column; a featured work or lab page is dropped.
  UPDATE "home" SET "hero_featured_post_id" = r."posts_id"
    FROM "home_rels" r
    WHERE r."parent_id" = "home"."id" AND r."path" = 'hero.featuredPage' AND r."posts_id" IS NOT NULL;
  UPDATE "_home_v" SET "version_hero_featured_post_id" = r."posts_id"
    FROM "_home_v_rels" r
    WHERE r."parent_id" = "_home_v"."id" AND r."path" = 'version.hero.featuredPage' AND r."posts_id" IS NOT NULL;
  DELETE FROM "home_rels" WHERE "path" = 'hero.featuredPage';
  DELETE FROM "_home_v_rels" WHERE "path" = 'version.hero.featuredPage';
  -- The old card printed a stored label as is, so restore the default it had.
  UPDATE "home" SET "hero_featured_label" = 'Insights'
    WHERE "hero_featured_label" IS NULL AND "hero_featured_post_id" IS NOT NULL;
  UPDATE "_home_v" SET "version_hero_featured_label" = 'Insights'
    WHERE "version_hero_featured_label" IS NULL AND "version_hero_featured_post_id" IS NOT NULL;
  ALTER TABLE "home_rels" DROP COLUMN "work_pages_id";
  ALTER TABLE "home_rels" DROP COLUMN "lab_pages_id";
  ALTER TABLE "_home_v_rels" DROP COLUMN "work_pages_id";
  ALTER TABLE "_home_v_rels" DROP COLUMN "lab_pages_id";`)
}
