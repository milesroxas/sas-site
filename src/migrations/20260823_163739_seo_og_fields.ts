import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages" ADD COLUMN "meta_og_title" varchar;
  ALTER TABLE "pages" ADD COLUMN "meta_og_description" varchar;
  ALTER TABLE "pages" ADD COLUMN "meta_og_image_id" integer;
  ALTER TABLE "_pages_v" ADD COLUMN "version_meta_og_title" varchar;
  ALTER TABLE "_pages_v" ADD COLUMN "version_meta_og_description" varchar;
  ALTER TABLE "_pages_v" ADD COLUMN "version_meta_og_image_id" integer;
  ALTER TABLE "posts" ADD COLUMN "meta_og_title" varchar;
  ALTER TABLE "posts" ADD COLUMN "meta_og_description" varchar;
  ALTER TABLE "posts" ADD COLUMN "meta_og_image_id" integer;
  ALTER TABLE "_posts_v" ADD COLUMN "version_meta_og_title" varchar;
  ALTER TABLE "_posts_v" ADD COLUMN "version_meta_og_description" varchar;
  ALTER TABLE "_posts_v" ADD COLUMN "version_meta_og_image_id" integer;
  ALTER TABLE "work_pages" ADD COLUMN "meta_og_title" varchar;
  ALTER TABLE "work_pages" ADD COLUMN "meta_og_description" varchar;
  ALTER TABLE "work_pages" ADD COLUMN "meta_og_image_id" integer;
  ALTER TABLE "_work_pages_v" ADD COLUMN "version_meta_og_title" varchar;
  ALTER TABLE "_work_pages_v" ADD COLUMN "version_meta_og_description" varchar;
  ALTER TABLE "_work_pages_v" ADD COLUMN "version_meta_og_image_id" integer;
  ALTER TABLE "lab_pages" ADD COLUMN "meta_og_title" varchar;
  ALTER TABLE "lab_pages" ADD COLUMN "meta_og_description" varchar;
  ALTER TABLE "lab_pages" ADD COLUMN "meta_og_image_id" integer;
  ALTER TABLE "_lab_pages_v" ADD COLUMN "version_meta_og_title" varchar;
  ALTER TABLE "_lab_pages_v" ADD COLUMN "version_meta_og_description" varchar;
  ALTER TABLE "_lab_pages_v" ADD COLUMN "version_meta_og_image_id" integer;
  ALTER TABLE "expertise_pages" ADD COLUMN "meta_og_title" varchar;
  ALTER TABLE "expertise_pages" ADD COLUMN "meta_og_description" varchar;
  ALTER TABLE "expertise_pages" ADD COLUMN "meta_og_image_id" integer;
  ALTER TABLE "_expertise_pages_v" ADD COLUMN "version_meta_og_title" varchar;
  ALTER TABLE "_expertise_pages_v" ADD COLUMN "version_meta_og_description" varchar;
  ALTER TABLE "_expertise_pages_v" ADD COLUMN "version_meta_og_image_id" integer;
  ALTER TABLE "audience_pages" ADD COLUMN "meta_og_title" varchar;
  ALTER TABLE "audience_pages" ADD COLUMN "meta_og_description" varchar;
  ALTER TABLE "audience_pages" ADD COLUMN "meta_og_image_id" integer;
  ALTER TABLE "_audience_pages_v" ADD COLUMN "version_meta_og_title" varchar;
  ALTER TABLE "_audience_pages_v" ADD COLUMN "version_meta_og_description" varchar;
  ALTER TABLE "_audience_pages_v" ADD COLUMN "version_meta_og_image_id" integer;
  ALTER TABLE "home" ADD COLUMN "meta_og_title" varchar;
  ALTER TABLE "home" ADD COLUMN "meta_og_description" varchar;
  ALTER TABLE "home" ADD COLUMN "meta_og_image_id" integer;
  ALTER TABLE "_home_v" ADD COLUMN "version_meta_og_title" varchar;
  ALTER TABLE "_home_v" ADD COLUMN "version_meta_og_description" varchar;
  ALTER TABLE "_home_v" ADD COLUMN "version_meta_og_image_id" integer;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_meta_og_image_id_media_id_fk" FOREIGN KEY ("meta_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_meta_og_image_id_media_id_fk" FOREIGN KEY ("version_meta_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_meta_og_image_id_media_id_fk" FOREIGN KEY ("meta_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_meta_og_image_id_media_id_fk" FOREIGN KEY ("version_meta_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "work_pages" ADD CONSTRAINT "work_pages_meta_og_image_id_media_id_fk" FOREIGN KEY ("meta_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_work_pages_v" ADD CONSTRAINT "_work_pages_v_version_meta_og_image_id_media_id_fk" FOREIGN KEY ("version_meta_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "lab_pages" ADD CONSTRAINT "lab_pages_meta_og_image_id_media_id_fk" FOREIGN KEY ("meta_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_lab_pages_v" ADD CONSTRAINT "_lab_pages_v_version_meta_og_image_id_media_id_fk" FOREIGN KEY ("version_meta_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "expertise_pages" ADD CONSTRAINT "expertise_pages_meta_og_image_id_media_id_fk" FOREIGN KEY ("meta_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_expertise_pages_v" ADD CONSTRAINT "_expertise_pages_v_version_meta_og_image_id_media_id_fk" FOREIGN KEY ("version_meta_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "audience_pages" ADD CONSTRAINT "audience_pages_meta_og_image_id_media_id_fk" FOREIGN KEY ("meta_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_audience_pages_v" ADD CONSTRAINT "_audience_pages_v_version_meta_og_image_id_media_id_fk" FOREIGN KEY ("version_meta_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home" ADD CONSTRAINT "home_meta_og_image_id_media_id_fk" FOREIGN KEY ("meta_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_home_v" ADD CONSTRAINT "_home_v_version_meta_og_image_id_media_id_fk" FOREIGN KEY ("version_meta_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "pages_meta_og_meta_og_image_idx" ON "pages" USING btree ("meta_og_image_id");
  CREATE INDEX "_pages_v_version_meta_og_version_meta_og_image_idx" ON "_pages_v" USING btree ("version_meta_og_image_id");
  CREATE INDEX "posts_meta_og_meta_og_image_idx" ON "posts" USING btree ("meta_og_image_id");
  CREATE INDEX "_posts_v_version_meta_og_version_meta_og_image_idx" ON "_posts_v" USING btree ("version_meta_og_image_id");
  CREATE INDEX "work_pages_meta_og_meta_og_image_idx" ON "work_pages" USING btree ("meta_og_image_id");
  CREATE INDEX "_work_pages_v_version_meta_og_version_meta_og_image_idx" ON "_work_pages_v" USING btree ("version_meta_og_image_id");
  CREATE INDEX "lab_pages_meta_og_meta_og_image_idx" ON "lab_pages" USING btree ("meta_og_image_id");
  CREATE INDEX "_lab_pages_v_version_meta_og_version_meta_og_image_idx" ON "_lab_pages_v" USING btree ("version_meta_og_image_id");
  CREATE INDEX "expertise_pages_meta_og_meta_og_image_idx" ON "expertise_pages" USING btree ("meta_og_image_id");
  CREATE INDEX "_expertise_pages_v_version_meta_og_version_meta_og_image_idx" ON "_expertise_pages_v" USING btree ("version_meta_og_image_id");
  CREATE INDEX "audience_pages_meta_og_meta_og_image_idx" ON "audience_pages" USING btree ("meta_og_image_id");
  CREATE INDEX "_audience_pages_v_version_meta_og_version_meta_og_image_idx" ON "_audience_pages_v" USING btree ("version_meta_og_image_id");
  CREATE INDEX "home_meta_og_meta_og_image_idx" ON "home" USING btree ("meta_og_image_id");
  CREATE INDEX "_home_v_version_meta_og_version_meta_og_image_idx" ON "_home_v" USING btree ("version_meta_og_image_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages" DROP CONSTRAINT "pages_meta_og_image_id_media_id_fk";
  
  ALTER TABLE "_pages_v" DROP CONSTRAINT "_pages_v_version_meta_og_image_id_media_id_fk";
  
  ALTER TABLE "posts" DROP CONSTRAINT "posts_meta_og_image_id_media_id_fk";
  
  ALTER TABLE "_posts_v" DROP CONSTRAINT "_posts_v_version_meta_og_image_id_media_id_fk";
  
  ALTER TABLE "work_pages" DROP CONSTRAINT "work_pages_meta_og_image_id_media_id_fk";
  
  ALTER TABLE "_work_pages_v" DROP CONSTRAINT "_work_pages_v_version_meta_og_image_id_media_id_fk";
  
  ALTER TABLE "lab_pages" DROP CONSTRAINT "lab_pages_meta_og_image_id_media_id_fk";
  
  ALTER TABLE "_lab_pages_v" DROP CONSTRAINT "_lab_pages_v_version_meta_og_image_id_media_id_fk";
  
  ALTER TABLE "expertise_pages" DROP CONSTRAINT "expertise_pages_meta_og_image_id_media_id_fk";
  
  ALTER TABLE "_expertise_pages_v" DROP CONSTRAINT "_expertise_pages_v_version_meta_og_image_id_media_id_fk";
  
  ALTER TABLE "audience_pages" DROP CONSTRAINT "audience_pages_meta_og_image_id_media_id_fk";
  
  ALTER TABLE "_audience_pages_v" DROP CONSTRAINT "_audience_pages_v_version_meta_og_image_id_media_id_fk";
  
  ALTER TABLE "home" DROP CONSTRAINT "home_meta_og_image_id_media_id_fk";
  
  ALTER TABLE "_home_v" DROP CONSTRAINT "_home_v_version_meta_og_image_id_media_id_fk";
  
  DROP INDEX "pages_meta_og_meta_og_image_idx";
  DROP INDEX "_pages_v_version_meta_og_version_meta_og_image_idx";
  DROP INDEX "posts_meta_og_meta_og_image_idx";
  DROP INDEX "_posts_v_version_meta_og_version_meta_og_image_idx";
  DROP INDEX "work_pages_meta_og_meta_og_image_idx";
  DROP INDEX "_work_pages_v_version_meta_og_version_meta_og_image_idx";
  DROP INDEX "lab_pages_meta_og_meta_og_image_idx";
  DROP INDEX "_lab_pages_v_version_meta_og_version_meta_og_image_idx";
  DROP INDEX "expertise_pages_meta_og_meta_og_image_idx";
  DROP INDEX "_expertise_pages_v_version_meta_og_version_meta_og_image_idx";
  DROP INDEX "audience_pages_meta_og_meta_og_image_idx";
  DROP INDEX "_audience_pages_v_version_meta_og_version_meta_og_image_idx";
  DROP INDEX "home_meta_og_meta_og_image_idx";
  DROP INDEX "_home_v_version_meta_og_version_meta_og_image_idx";
  ALTER TABLE "pages" DROP COLUMN "meta_og_title";
  ALTER TABLE "pages" DROP COLUMN "meta_og_description";
  ALTER TABLE "pages" DROP COLUMN "meta_og_image_id";
  ALTER TABLE "_pages_v" DROP COLUMN "version_meta_og_title";
  ALTER TABLE "_pages_v" DROP COLUMN "version_meta_og_description";
  ALTER TABLE "_pages_v" DROP COLUMN "version_meta_og_image_id";
  ALTER TABLE "posts" DROP COLUMN "meta_og_title";
  ALTER TABLE "posts" DROP COLUMN "meta_og_description";
  ALTER TABLE "posts" DROP COLUMN "meta_og_image_id";
  ALTER TABLE "_posts_v" DROP COLUMN "version_meta_og_title";
  ALTER TABLE "_posts_v" DROP COLUMN "version_meta_og_description";
  ALTER TABLE "_posts_v" DROP COLUMN "version_meta_og_image_id";
  ALTER TABLE "work_pages" DROP COLUMN "meta_og_title";
  ALTER TABLE "work_pages" DROP COLUMN "meta_og_description";
  ALTER TABLE "work_pages" DROP COLUMN "meta_og_image_id";
  ALTER TABLE "_work_pages_v" DROP COLUMN "version_meta_og_title";
  ALTER TABLE "_work_pages_v" DROP COLUMN "version_meta_og_description";
  ALTER TABLE "_work_pages_v" DROP COLUMN "version_meta_og_image_id";
  ALTER TABLE "lab_pages" DROP COLUMN "meta_og_title";
  ALTER TABLE "lab_pages" DROP COLUMN "meta_og_description";
  ALTER TABLE "lab_pages" DROP COLUMN "meta_og_image_id";
  ALTER TABLE "_lab_pages_v" DROP COLUMN "version_meta_og_title";
  ALTER TABLE "_lab_pages_v" DROP COLUMN "version_meta_og_description";
  ALTER TABLE "_lab_pages_v" DROP COLUMN "version_meta_og_image_id";
  ALTER TABLE "expertise_pages" DROP COLUMN "meta_og_title";
  ALTER TABLE "expertise_pages" DROP COLUMN "meta_og_description";
  ALTER TABLE "expertise_pages" DROP COLUMN "meta_og_image_id";
  ALTER TABLE "_expertise_pages_v" DROP COLUMN "version_meta_og_title";
  ALTER TABLE "_expertise_pages_v" DROP COLUMN "version_meta_og_description";
  ALTER TABLE "_expertise_pages_v" DROP COLUMN "version_meta_og_image_id";
  ALTER TABLE "audience_pages" DROP COLUMN "meta_og_title";
  ALTER TABLE "audience_pages" DROP COLUMN "meta_og_description";
  ALTER TABLE "audience_pages" DROP COLUMN "meta_og_image_id";
  ALTER TABLE "_audience_pages_v" DROP COLUMN "version_meta_og_title";
  ALTER TABLE "_audience_pages_v" DROP COLUMN "version_meta_og_description";
  ALTER TABLE "_audience_pages_v" DROP COLUMN "version_meta_og_image_id";
  ALTER TABLE "home" DROP COLUMN "meta_og_title";
  ALTER TABLE "home" DROP COLUMN "meta_og_description";
  ALTER TABLE "home" DROP COLUMN "meta_og_image_id";
  ALTER TABLE "_home_v" DROP COLUMN "version_meta_og_title";
  ALTER TABLE "_home_v" DROP COLUMN "version_meta_og_description";
  ALTER TABLE "_home_v" DROP COLUMN "version_meta_og_image_id";`)
}
