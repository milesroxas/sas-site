import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_footer_closing_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_footer_closing_links_link_appearance" AS ENUM('default', 'outline');
  CREATE TABLE "footer_closing_links" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "link_type" "enum_footer_closing_links_link_type" DEFAULT 'reference',
    "link_new_tab" boolean,
    "link_url" varchar,
    "link_label" varchar NOT NULL,
    "link_appearance" "enum_footer_closing_links_link_appearance" DEFAULT 'default'
  );

  ALTER TABLE "footer" ADD COLUMN "closing_eyebrow" varchar;
  ALTER TABLE "footer" ADD COLUMN "closing_heading" varchar;
  ALTER TABLE "footer" ADD COLUMN "closing_ask_title" varchar;
  ALTER TABLE "footer" ADD COLUMN "closing_ask_body" varchar;
  ALTER TABLE "footer" ADD COLUMN "closing_media_id" integer;
  ALTER TABLE "footer_closing_links" ADD CONSTRAINT "footer_closing_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "footer_closing_links_order_idx" ON "footer_closing_links" USING btree ("_order");
  CREATE INDEX "footer_closing_links_parent_id_idx" ON "footer_closing_links" USING btree ("_parent_id");
  ALTER TABLE "footer" ADD CONSTRAINT "footer_closing_media_id_media_id_fk" FOREIGN KEY ("closing_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "footer_closing_closing_media_idx" ON "footer" USING btree ("closing_media_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "footer_closing_links" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "footer_closing_links" CASCADE;
  ALTER TABLE "footer" DROP CONSTRAINT "footer_closing_media_id_media_id_fk";

  DROP INDEX "footer_closing_closing_media_idx";
  ALTER TABLE "footer" DROP COLUMN "closing_eyebrow";
  ALTER TABLE "footer" DROP COLUMN "closing_heading";
  ALTER TABLE "footer" DROP COLUMN "closing_ask_title";
  ALTER TABLE "footer" DROP COLUMN "closing_ask_body";
  ALTER TABLE "footer" DROP COLUMN "closing_media_id";
  DROP TYPE "public"."enum_footer_closing_links_link_type";
  DROP TYPE "public"."enum_footer_closing_links_link_appearance";`)
}
