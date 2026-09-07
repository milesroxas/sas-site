import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "work_pages" ADD COLUMN "menu_preview_id" integer;
  ALTER TABLE "_work_pages_v" ADD COLUMN "version_menu_preview_id" integer;
  ALTER TABLE "contact_pages" ADD COLUMN "menu_preview_id" integer;
  ALTER TABLE "_contact_pages_v" ADD COLUMN "version_menu_preview_id" integer;
  ALTER TABLE "insights_index" ADD COLUMN "menu_preview_id" integer;
  ALTER TABLE "_insights_index_v" ADD COLUMN "version_menu_preview_id" integer;
  ALTER TABLE "works_index" ADD COLUMN "menu_preview_id" integer;
  ALTER TABLE "_works_index_v" ADD COLUMN "version_menu_preview_id" integer;
  ALTER TABLE "header" ADD COLUMN "menu_fallback_media_id" integer;
  ALTER TABLE "work_pages" ADD CONSTRAINT "work_pages_menu_preview_id_media_id_fk" FOREIGN KEY ("menu_preview_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_work_pages_v" ADD CONSTRAINT "_work_pages_v_version_menu_preview_id_media_id_fk" FOREIGN KEY ("version_menu_preview_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "contact_pages" ADD CONSTRAINT "contact_pages_menu_preview_id_media_id_fk" FOREIGN KEY ("menu_preview_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_contact_pages_v" ADD CONSTRAINT "_contact_pages_v_version_menu_preview_id_media_id_fk" FOREIGN KEY ("version_menu_preview_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "insights_index" ADD CONSTRAINT "insights_index_menu_preview_id_media_id_fk" FOREIGN KEY ("menu_preview_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_insights_index_v" ADD CONSTRAINT "_insights_index_v_version_menu_preview_id_media_id_fk" FOREIGN KEY ("version_menu_preview_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "works_index" ADD CONSTRAINT "works_index_menu_preview_id_media_id_fk" FOREIGN KEY ("menu_preview_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_works_index_v" ADD CONSTRAINT "_works_index_v_version_menu_preview_id_media_id_fk" FOREIGN KEY ("version_menu_preview_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "header" ADD CONSTRAINT "header_menu_fallback_media_id_media_id_fk" FOREIGN KEY ("menu_fallback_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "work_pages_menu_preview_idx" ON "work_pages" USING btree ("menu_preview_id");
  CREATE INDEX "_work_pages_v_version_version_menu_preview_idx" ON "_work_pages_v" USING btree ("version_menu_preview_id");
  CREATE INDEX "contact_pages_menu_preview_idx" ON "contact_pages" USING btree ("menu_preview_id");
  CREATE INDEX "_contact_pages_v_version_version_menu_preview_idx" ON "_contact_pages_v" USING btree ("version_menu_preview_id");
  CREATE INDEX "insights_index_menu_preview_idx" ON "insights_index" USING btree ("menu_preview_id");
  CREATE INDEX "_insights_index_v_version_version_menu_preview_idx" ON "_insights_index_v" USING btree ("version_menu_preview_id");
  CREATE INDEX "works_index_menu_preview_idx" ON "works_index" USING btree ("menu_preview_id");
  CREATE INDEX "_works_index_v_version_version_menu_preview_idx" ON "_works_index_v" USING btree ("version_menu_preview_id");
  CREATE INDEX "header_menu_fallback_media_idx" ON "header" USING btree ("menu_fallback_media_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "work_pages" DROP CONSTRAINT "work_pages_menu_preview_id_media_id_fk";
  
  ALTER TABLE "_work_pages_v" DROP CONSTRAINT "_work_pages_v_version_menu_preview_id_media_id_fk";
  
  ALTER TABLE "contact_pages" DROP CONSTRAINT "contact_pages_menu_preview_id_media_id_fk";
  
  ALTER TABLE "_contact_pages_v" DROP CONSTRAINT "_contact_pages_v_version_menu_preview_id_media_id_fk";
  
  ALTER TABLE "insights_index" DROP CONSTRAINT "insights_index_menu_preview_id_media_id_fk";
  
  ALTER TABLE "_insights_index_v" DROP CONSTRAINT "_insights_index_v_version_menu_preview_id_media_id_fk";
  
  ALTER TABLE "works_index" DROP CONSTRAINT "works_index_menu_preview_id_media_id_fk";
  
  ALTER TABLE "_works_index_v" DROP CONSTRAINT "_works_index_v_version_menu_preview_id_media_id_fk";
  
  ALTER TABLE "header" DROP CONSTRAINT "header_menu_fallback_media_id_media_id_fk";
  
  DROP INDEX "work_pages_menu_preview_idx";
  DROP INDEX "_work_pages_v_version_version_menu_preview_idx";
  DROP INDEX "contact_pages_menu_preview_idx";
  DROP INDEX "_contact_pages_v_version_version_menu_preview_idx";
  DROP INDEX "insights_index_menu_preview_idx";
  DROP INDEX "_insights_index_v_version_version_menu_preview_idx";
  DROP INDEX "works_index_menu_preview_idx";
  DROP INDEX "_works_index_v_version_version_menu_preview_idx";
  DROP INDEX "header_menu_fallback_media_idx";
  ALTER TABLE "work_pages" DROP COLUMN "menu_preview_id";
  ALTER TABLE "_work_pages_v" DROP COLUMN "version_menu_preview_id";
  ALTER TABLE "contact_pages" DROP COLUMN "menu_preview_id";
  ALTER TABLE "_contact_pages_v" DROP COLUMN "version_menu_preview_id";
  ALTER TABLE "insights_index" DROP COLUMN "menu_preview_id";
  ALTER TABLE "_insights_index_v" DROP COLUMN "version_menu_preview_id";
  ALTER TABLE "works_index" DROP COLUMN "menu_preview_id";
  ALTER TABLE "_works_index_v" DROP COLUMN "version_menu_preview_id";
  ALTER TABLE "header" DROP COLUMN "menu_fallback_media_id";`)
}
