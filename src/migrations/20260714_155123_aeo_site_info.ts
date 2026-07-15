import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "site_info_social_profiles" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "site_info" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar DEFAULT 'Suits & Sandals' NOT NULL,
  	"legal_name" varchar,
  	"tagline" varchar DEFAULT 'We help complex organizations make sense to the people who matter. Bringing clarity, trust, and momentum to nuanced ideas.',
  	"description" varchar,
  	"founding_year" numeric,
  	"contact_email" varchar,
  	"logo_id" integer,
  	"address_street_address" varchar DEFAULT '240 Kent Ave',
  	"address_city" varchar DEFAULT 'Brooklyn',
  	"address_state" varchar DEFAULT 'NY',
  	"address_postal_code" varchar DEFAULT '11249',
  	"address_country" varchar DEFAULT 'US',
  	"llms_notes" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "site_info_social_profiles" ADD CONSTRAINT "site_info_social_profiles_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_info"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_info" ADD CONSTRAINT "site_info_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "site_info_social_profiles_order_idx" ON "site_info_social_profiles" USING btree ("_order");
  CREATE INDEX "site_info_social_profiles_parent_id_idx" ON "site_info_social_profiles" USING btree ("_parent_id");
  CREATE INDEX "site_info_logo_idx" ON "site_info" USING btree ("logo_id");`)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "site_info_social_profiles" CASCADE;
  DROP TABLE "site_info" CASCADE;`)
}
