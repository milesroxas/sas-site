import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_contact_pages_alt_cta_link_type" AS ENUM('reference', 'site', 'custom');
  CREATE TYPE "public"."enum_contact_pages_alt_cta_link_site_page" AS ENUM('home', 'works-index', 'insights-index');
  CREATE TYPE "public"."enum__contact_pages_v_version_alt_cta_link_type" AS ENUM('reference', 'site', 'custom');
  CREATE TYPE "public"."enum__contact_pages_v_version_alt_cta_link_site_page" AS ENUM('home', 'works-index', 'insights-index');
  CREATE TABLE "contact_pages_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"posts_id" integer,
  	"contact_pages_id" integer
  );
  
  CREATE TABLE "_contact_pages_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"posts_id" integer,
  	"contact_pages_id" integer
  );
  
  ALTER TABLE "contact_pages" ADD COLUMN "alt_cta_use_site_link" boolean DEFAULT true;
  ALTER TABLE "contact_pages" ADD COLUMN "alt_cta_link_type" "enum_contact_pages_alt_cta_link_type" DEFAULT 'reference';
  ALTER TABLE "contact_pages" ADD COLUMN "alt_cta_link_new_tab" boolean;
  ALTER TABLE "contact_pages" ADD COLUMN "alt_cta_link_site_page" "enum_contact_pages_alt_cta_link_site_page";
  ALTER TABLE "contact_pages" ADD COLUMN "alt_cta_link_url" varchar;
  ALTER TABLE "_contact_pages_v" ADD COLUMN "version_alt_cta_use_site_link" boolean DEFAULT true;
  ALTER TABLE "_contact_pages_v" ADD COLUMN "version_alt_cta_link_type" "enum__contact_pages_v_version_alt_cta_link_type" DEFAULT 'reference';
  ALTER TABLE "_contact_pages_v" ADD COLUMN "version_alt_cta_link_new_tab" boolean;
  ALTER TABLE "_contact_pages_v" ADD COLUMN "version_alt_cta_link_site_page" "enum__contact_pages_v_version_alt_cta_link_site_page";
  ALTER TABLE "_contact_pages_v" ADD COLUMN "version_alt_cta_link_url" varchar;
  ALTER TABLE "contact_pages_rels" ADD CONSTRAINT "contact_pages_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."contact_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "contact_pages_rels" ADD CONSTRAINT "contact_pages_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "contact_pages_rels" ADD CONSTRAINT "contact_pages_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "contact_pages_rels" ADD CONSTRAINT "contact_pages_rels_contact_pages_fk" FOREIGN KEY ("contact_pages_id") REFERENCES "public"."contact_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_contact_pages_v_rels" ADD CONSTRAINT "_contact_pages_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_contact_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_contact_pages_v_rels" ADD CONSTRAINT "_contact_pages_v_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_contact_pages_v_rels" ADD CONSTRAINT "_contact_pages_v_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_contact_pages_v_rels" ADD CONSTRAINT "_contact_pages_v_rels_contact_pages_fk" FOREIGN KEY ("contact_pages_id") REFERENCES "public"."contact_pages"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "contact_pages_rels_order_idx" ON "contact_pages_rels" USING btree ("order");
  CREATE INDEX "contact_pages_rels_parent_idx" ON "contact_pages_rels" USING btree ("parent_id");
  CREATE INDEX "contact_pages_rels_path_idx" ON "contact_pages_rels" USING btree ("path");
  CREATE INDEX "contact_pages_rels_pages_id_idx" ON "contact_pages_rels" USING btree ("pages_id");
  CREATE INDEX "contact_pages_rels_posts_id_idx" ON "contact_pages_rels" USING btree ("posts_id");
  CREATE INDEX "contact_pages_rels_contact_pages_id_idx" ON "contact_pages_rels" USING btree ("contact_pages_id");
  CREATE INDEX "_contact_pages_v_rels_order_idx" ON "_contact_pages_v_rels" USING btree ("order");
  CREATE INDEX "_contact_pages_v_rels_parent_idx" ON "_contact_pages_v_rels" USING btree ("parent_id");
  CREATE INDEX "_contact_pages_v_rels_path_idx" ON "_contact_pages_v_rels" USING btree ("path");
  CREATE INDEX "_contact_pages_v_rels_pages_id_idx" ON "_contact_pages_v_rels" USING btree ("pages_id");
  CREATE INDEX "_contact_pages_v_rels_posts_id_idx" ON "_contact_pages_v_rels" USING btree ("posts_id");
  CREATE INDEX "_contact_pages_v_rels_contact_pages_id_idx" ON "_contact_pages_v_rels" USING btree ("contact_pages_id");
  ALTER TABLE "contact_pages" DROP COLUMN "alt_cta_url";
  ALTER TABLE "_contact_pages_v" DROP COLUMN "version_alt_cta_url";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "contact_pages_rels" CASCADE;
  DROP TABLE "_contact_pages_v_rels" CASCADE;
  ALTER TABLE "contact_pages" ADD COLUMN "alt_cta_url" varchar;
  ALTER TABLE "_contact_pages_v" ADD COLUMN "version_alt_cta_url" varchar;
  ALTER TABLE "contact_pages" DROP COLUMN "alt_cta_use_site_link";
  ALTER TABLE "contact_pages" DROP COLUMN "alt_cta_link_type";
  ALTER TABLE "contact_pages" DROP COLUMN "alt_cta_link_new_tab";
  ALTER TABLE "contact_pages" DROP COLUMN "alt_cta_link_site_page";
  ALTER TABLE "contact_pages" DROP COLUMN "alt_cta_link_url";
  ALTER TABLE "_contact_pages_v" DROP COLUMN "version_alt_cta_use_site_link";
  ALTER TABLE "_contact_pages_v" DROP COLUMN "version_alt_cta_link_type";
  ALTER TABLE "_contact_pages_v" DROP COLUMN "version_alt_cta_link_new_tab";
  ALTER TABLE "_contact_pages_v" DROP COLUMN "version_alt_cta_link_site_page";
  ALTER TABLE "_contact_pages_v" DROP COLUMN "version_alt_cta_link_url";
  DROP TYPE "public"."enum_contact_pages_alt_cta_link_type";
  DROP TYPE "public"."enum_contact_pages_alt_cta_link_site_page";
  DROP TYPE "public"."enum__contact_pages_v_version_alt_cta_link_type";
  DROP TYPE "public"."enum__contact_pages_v_version_alt_cta_link_site_page";`)
}
