import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_home_feat_work_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum__home_feat_work_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TABLE "home_feat_work" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar DEFAULT 'Featured Work',
  	"theme" "enum_home_feat_work_theme" DEFAULT 'dark',
  	"block_name" varchar
  );
  
  CREATE TABLE "_home_feat_work_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar DEFAULT 'Featured Work',
  	"theme" "enum__home_feat_work_v_theme" DEFAULT 'dark',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "home_rels" ADD COLUMN "work_pages_id" integer;
  ALTER TABLE "_home_v_rels" ADD COLUMN "work_pages_id" integer;
  ALTER TABLE "home_feat_work" ADD CONSTRAINT "home_feat_work_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_feat_work_v" ADD CONSTRAINT "_home_feat_work_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "home_feat_work_order_idx" ON "home_feat_work" USING btree ("_order");
  CREATE INDEX "home_feat_work_parent_id_idx" ON "home_feat_work" USING btree ("_parent_id");
  CREATE INDEX "home_feat_work_path_idx" ON "home_feat_work" USING btree ("_path");
  CREATE INDEX "_home_feat_work_v_order_idx" ON "_home_feat_work_v" USING btree ("_order");
  CREATE INDEX "_home_feat_work_v_parent_id_idx" ON "_home_feat_work_v" USING btree ("_parent_id");
  CREATE INDEX "_home_feat_work_v_path_idx" ON "_home_feat_work_v" USING btree ("_path");
  ALTER TABLE "home_rels" ADD CONSTRAINT "home_rels_work_pages_fk" FOREIGN KEY ("work_pages_id") REFERENCES "public"."work_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_rels" ADD CONSTRAINT "_home_v_rels_work_pages_fk" FOREIGN KEY ("work_pages_id") REFERENCES "public"."work_pages"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "home_rels_work_pages_id_idx" ON "home_rels" USING btree ("work_pages_id");
  CREATE INDEX "_home_v_rels_work_pages_id_idx" ON "_home_v_rels" USING btree ("work_pages_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "home_feat_work" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_home_feat_work_v" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "home_feat_work" CASCADE;
  DROP TABLE "_home_feat_work_v" CASCADE;
  ALTER TABLE "home_rels" DROP CONSTRAINT "home_rels_work_pages_fk";
  
  ALTER TABLE "_home_v_rels" DROP CONSTRAINT "_home_v_rels_work_pages_fk";
  
  DROP INDEX "home_rels_work_pages_id_idx";
  DROP INDEX "_home_v_rels_work_pages_id_idx";
  ALTER TABLE "home_rels" DROP COLUMN "work_pages_id";
  ALTER TABLE "_home_v_rels" DROP COLUMN "work_pages_id";
  DROP TYPE "public"."enum_home_feat_work_theme";
  DROP TYPE "public"."enum__home_feat_work_v_theme";`)
}
