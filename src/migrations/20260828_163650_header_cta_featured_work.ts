import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_header_cta_link_type" AS ENUM('reference', 'site', 'custom');
  CREATE TYPE "public"."enum_header_cta_link_site_page" AS ENUM('home', 'works-index', 'insights-index');
  ALTER TABLE "header" ADD COLUMN "cta_label" varchar DEFAULT 'Get in touch' NOT NULL;
  ALTER TABLE "header" ADD COLUMN "cta_link_type" "enum_header_cta_link_type" DEFAULT 'reference';
  ALTER TABLE "header" ADD COLUMN "cta_link_new_tab" boolean;
  ALTER TABLE "header" ADD COLUMN "cta_link_site_page" "enum_header_cta_link_site_page";
  ALTER TABLE "header" ADD COLUMN "cta_link_url" varchar;
  ALTER TABLE "header_rels" ADD COLUMN "work_pages_id" integer;
  ALTER TABLE "header_rels" ADD CONSTRAINT "header_rels_work_pages_fk" FOREIGN KEY ("work_pages_id") REFERENCES "public"."work_pages"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "header_rels_work_pages_id_idx" ON "header_rels" USING btree ("work_pages_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "header_rels" DROP CONSTRAINT "header_rels_work_pages_fk";
  
  DROP INDEX "header_rels_work_pages_id_idx";
  ALTER TABLE "header" DROP COLUMN "cta_label";
  ALTER TABLE "header" DROP COLUMN "cta_link_type";
  ALTER TABLE "header" DROP COLUMN "cta_link_new_tab";
  ALTER TABLE "header" DROP COLUMN "cta_link_site_page";
  ALTER TABLE "header" DROP COLUMN "cta_link_url";
  ALTER TABLE "header_rels" DROP COLUMN "work_pages_id";
  DROP TYPE "public"."enum_header_cta_link_type";
  DROP TYPE "public"."enum_header_cta_link_site_page";`)
}
