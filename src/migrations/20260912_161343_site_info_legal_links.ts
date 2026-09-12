import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_site_info_legal_links_link_type" AS ENUM('reference', 'site', 'custom');
  CREATE TYPE "public"."enum_site_info_legal_links_link_site_page" AS ENUM('home', 'works-index', 'insights-index');
  CREATE TABLE "site_info_legal_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_site_info_legal_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_site_page" "enum_site_info_legal_links_link_site_page",
  	"link_url" varchar,
  	"link_label" varchar NOT NULL
  );
  
  CREATE TABLE "site_info_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"posts_id" integer,
  	"contact_pages_id" integer
  );
  
  ALTER TABLE "site_info" ADD COLUMN "cookie_settings_label" varchar DEFAULT 'Cookie Settings';
  ALTER TABLE "site_info_legal_links" ADD CONSTRAINT "site_info_legal_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_info"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_info_rels" ADD CONSTRAINT "site_info_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."site_info"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_info_rels" ADD CONSTRAINT "site_info_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_info_rels" ADD CONSTRAINT "site_info_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_info_rels" ADD CONSTRAINT "site_info_rels_contact_pages_fk" FOREIGN KEY ("contact_pages_id") REFERENCES "public"."contact_pages"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "site_info_legal_links_order_idx" ON "site_info_legal_links" USING btree ("_order");
  CREATE INDEX "site_info_legal_links_parent_id_idx" ON "site_info_legal_links" USING btree ("_parent_id");
  CREATE INDEX "site_info_rels_order_idx" ON "site_info_rels" USING btree ("order");
  CREATE INDEX "site_info_rels_parent_idx" ON "site_info_rels" USING btree ("parent_id");
  CREATE INDEX "site_info_rels_path_idx" ON "site_info_rels" USING btree ("path");
  CREATE INDEX "site_info_rels_pages_id_idx" ON "site_info_rels" USING btree ("pages_id");
  CREATE INDEX "site_info_rels_posts_id_idx" ON "site_info_rels" USING btree ("posts_id");
  CREATE INDEX "site_info_rels_contact_pages_id_idx" ON "site_info_rels" USING btree ("contact_pages_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "site_info_legal_links" CASCADE;
  DROP TABLE "site_info_rels" CASCADE;
  ALTER TABLE "site_info" DROP COLUMN "cookie_settings_label";
  DROP TYPE "public"."enum_site_info_legal_links_link_type";
  DROP TYPE "public"."enum_site_info_legal_links_link_site_page";`)
}
