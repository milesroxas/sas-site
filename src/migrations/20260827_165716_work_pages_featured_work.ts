import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "home_feat_work" DROP CONSTRAINT "home_feat_work_parent_id_fk";
  
  ALTER TABLE "home_rels" DROP CONSTRAINT "home_rels_work_pages_fk";
  
  ALTER TABLE "_home_feat_work_v" DROP CONSTRAINT "_home_feat_work_v_parent_id_fk";
  
  ALTER TABLE "_home_v_rels" DROP CONSTRAINT "_home_v_rels_work_pages_fk";
  
  DROP INDEX "home_rels_work_pages_id_idx";
  DROP INDEX "_home_v_rels_work_pages_id_idx";
  ALTER TABLE "home_feat_work" ADD CONSTRAINT "home_feat_work_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."work_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_feat_work_v" ADD CONSTRAINT "_home_feat_work_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_work_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_rels" DROP COLUMN "work_pages_id";
  ALTER TABLE "_home_v_rels" DROP COLUMN "work_pages_id";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "home_feat_work" DROP CONSTRAINT "home_feat_work_parent_id_fk";
  
  ALTER TABLE "_home_feat_work_v" DROP CONSTRAINT "_home_feat_work_v_parent_id_fk";
  
  ALTER TABLE "home_rels" ADD COLUMN "work_pages_id" integer;
  ALTER TABLE "_home_v_rels" ADD COLUMN "work_pages_id" integer;
  ALTER TABLE "home_feat_work" ADD CONSTRAINT "home_feat_work_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_feat_work_v" ADD CONSTRAINT "_home_feat_work_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_rels" ADD CONSTRAINT "home_rels_work_pages_fk" FOREIGN KEY ("work_pages_id") REFERENCES "public"."work_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_rels" ADD CONSTRAINT "_home_v_rels_work_pages_fk" FOREIGN KEY ("work_pages_id") REFERENCES "public"."work_pages"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "home_rels_work_pages_id_idx" ON "home_rels" USING btree ("work_pages_id");
  CREATE INDEX "_home_v_rels_work_pages_id_idx" ON "_home_v_rels" USING btree ("work_pages_id");`)
}
