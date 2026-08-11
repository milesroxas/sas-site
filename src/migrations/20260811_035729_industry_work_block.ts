import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_ind_work_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___pages_v_ind_work_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_work_pages_ind_work_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___work_pages_v_ind_work_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_home_ind_work_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___home_v_ind_work_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TABLE "pages_ind_work_industries" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"industry_id" integer,
  	"subheading" varchar,
  	"work_id" integer
  );
  
  CREATE TABLE "pages_ind_work" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar DEFAULT 'Our work in',
  	"theme" "enum_pages_ind_work_theme" DEFAULT 'dark',
  	"block_name" varchar
  );
  
  CREATE TABLE "__pages_v_ind_work_v_industries" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"industry_id" integer,
  	"subheading" varchar,
  	"work_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "__pages_v_ind_work_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar DEFAULT 'Our work in',
  	"theme" "enum___pages_v_ind_work_v_theme" DEFAULT 'dark',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "work_pages_ind_work_industries" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"industry_id" integer,
  	"subheading" varchar,
  	"work_id" integer
  );
  
  CREATE TABLE "work_pages_ind_work" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar DEFAULT 'Our work in',
  	"theme" "enum_work_pages_ind_work_theme" DEFAULT 'dark',
  	"block_name" varchar
  );
  
  CREATE TABLE "__work_pages_v_ind_work_v_industries" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"industry_id" integer,
  	"subheading" varchar,
  	"work_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "__work_pages_v_ind_work_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar DEFAULT 'Our work in',
  	"theme" "enum___work_pages_v_ind_work_v_theme" DEFAULT 'dark',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "home_ind_work_industries" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"industry_id" integer,
  	"subheading" varchar,
  	"work_id" integer
  );
  
  CREATE TABLE "home_ind_work" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar DEFAULT 'Our work in',
  	"theme" "enum_home_ind_work_theme" DEFAULT 'dark',
  	"block_name" varchar
  );
  
  CREATE TABLE "__home_v_ind_work_v_industries" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"industry_id" integer,
  	"subheading" varchar,
  	"work_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "__home_v_ind_work_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar DEFAULT 'Our work in',
  	"theme" "enum___home_v_ind_work_v_theme" DEFAULT 'dark',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "pages_ind_work_industries" ADD CONSTRAINT "pages_ind_work_industries_industry_id_industries_id_fk" FOREIGN KEY ("industry_id") REFERENCES "public"."industries"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_ind_work_industries" ADD CONSTRAINT "pages_ind_work_industries_work_id_work_pages_id_fk" FOREIGN KEY ("work_id") REFERENCES "public"."work_pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_ind_work_industries" ADD CONSTRAINT "pages_ind_work_industries_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_ind_work"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_ind_work" ADD CONSTRAINT "pages_ind_work_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__pages_v_ind_work_v_industries" ADD CONSTRAINT "__pages_v_ind_work_v_industries_industry_id_industries_id_fk" FOREIGN KEY ("industry_id") REFERENCES "public"."industries"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__pages_v_ind_work_v_industries" ADD CONSTRAINT "__pages_v_ind_work_v_industries_work_id_work_pages_id_fk" FOREIGN KEY ("work_id") REFERENCES "public"."work_pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__pages_v_ind_work_v_industries" ADD CONSTRAINT "__pages_v_ind_work_v_industries_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."__pages_v_ind_work_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__pages_v_ind_work_v" ADD CONSTRAINT "__pages_v_ind_work_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "work_pages_ind_work_industries" ADD CONSTRAINT "work_pages_ind_work_industries_industry_id_industries_id_fk" FOREIGN KEY ("industry_id") REFERENCES "public"."industries"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "work_pages_ind_work_industries" ADD CONSTRAINT "work_pages_ind_work_industries_work_id_work_pages_id_fk" FOREIGN KEY ("work_id") REFERENCES "public"."work_pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "work_pages_ind_work_industries" ADD CONSTRAINT "work_pages_ind_work_industries_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."work_pages_ind_work"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "work_pages_ind_work" ADD CONSTRAINT "work_pages_ind_work_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."work_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__work_pages_v_ind_work_v_industries" ADD CONSTRAINT "__work_pages_v_ind_work_v_industries_industry_id_industries_id_fk" FOREIGN KEY ("industry_id") REFERENCES "public"."industries"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__work_pages_v_ind_work_v_industries" ADD CONSTRAINT "__work_pages_v_ind_work_v_industries_work_id_work_pages_id_fk" FOREIGN KEY ("work_id") REFERENCES "public"."work_pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__work_pages_v_ind_work_v_industries" ADD CONSTRAINT "__work_pages_v_ind_work_v_industries_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."__work_pages_v_ind_work_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__work_pages_v_ind_work_v" ADD CONSTRAINT "__work_pages_v_ind_work_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_work_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_ind_work_industries" ADD CONSTRAINT "home_ind_work_industries_industry_id_industries_id_fk" FOREIGN KEY ("industry_id") REFERENCES "public"."industries"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_ind_work_industries" ADD CONSTRAINT "home_ind_work_industries_work_id_work_pages_id_fk" FOREIGN KEY ("work_id") REFERENCES "public"."work_pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_ind_work_industries" ADD CONSTRAINT "home_ind_work_industries_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_ind_work"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_ind_work" ADD CONSTRAINT "home_ind_work_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__home_v_ind_work_v_industries" ADD CONSTRAINT "__home_v_ind_work_v_industries_industry_id_industries_id_fk" FOREIGN KEY ("industry_id") REFERENCES "public"."industries"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__home_v_ind_work_v_industries" ADD CONSTRAINT "__home_v_ind_work_v_industries_work_id_work_pages_id_fk" FOREIGN KEY ("work_id") REFERENCES "public"."work_pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__home_v_ind_work_v_industries" ADD CONSTRAINT "__home_v_ind_work_v_industries_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."__home_v_ind_work_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__home_v_ind_work_v" ADD CONSTRAINT "__home_v_ind_work_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_ind_work_industries_order_idx" ON "pages_ind_work_industries" USING btree ("_order");
  CREATE INDEX "pages_ind_work_industries_parent_id_idx" ON "pages_ind_work_industries" USING btree ("_parent_id");
  CREATE INDEX "pages_ind_work_industries_industry_idx" ON "pages_ind_work_industries" USING btree ("industry_id");
  CREATE INDEX "pages_ind_work_industries_work_idx" ON "pages_ind_work_industries" USING btree ("work_id");
  CREATE INDEX "pages_ind_work_order_idx" ON "pages_ind_work" USING btree ("_order");
  CREATE INDEX "pages_ind_work_parent_id_idx" ON "pages_ind_work" USING btree ("_parent_id");
  CREATE INDEX "pages_ind_work_path_idx" ON "pages_ind_work" USING btree ("_path");
  CREATE INDEX "__pages_v_ind_work_v_industries_order_idx" ON "__pages_v_ind_work_v_industries" USING btree ("_order");
  CREATE INDEX "__pages_v_ind_work_v_industries_parent_id_idx" ON "__pages_v_ind_work_v_industries" USING btree ("_parent_id");
  CREATE INDEX "__pages_v_ind_work_v_industries_industry_idx" ON "__pages_v_ind_work_v_industries" USING btree ("industry_id");
  CREATE INDEX "__pages_v_ind_work_v_industries_work_idx" ON "__pages_v_ind_work_v_industries" USING btree ("work_id");
  CREATE INDEX "__pages_v_ind_work_v_order_idx" ON "__pages_v_ind_work_v" USING btree ("_order");
  CREATE INDEX "__pages_v_ind_work_v_parent_id_idx" ON "__pages_v_ind_work_v" USING btree ("_parent_id");
  CREATE INDEX "__pages_v_ind_work_v_path_idx" ON "__pages_v_ind_work_v" USING btree ("_path");
  CREATE INDEX "work_pages_ind_work_industries_order_idx" ON "work_pages_ind_work_industries" USING btree ("_order");
  CREATE INDEX "work_pages_ind_work_industries_parent_id_idx" ON "work_pages_ind_work_industries" USING btree ("_parent_id");
  CREATE INDEX "work_pages_ind_work_industries_industry_idx" ON "work_pages_ind_work_industries" USING btree ("industry_id");
  CREATE INDEX "work_pages_ind_work_industries_work_idx" ON "work_pages_ind_work_industries" USING btree ("work_id");
  CREATE INDEX "work_pages_ind_work_order_idx" ON "work_pages_ind_work" USING btree ("_order");
  CREATE INDEX "work_pages_ind_work_parent_id_idx" ON "work_pages_ind_work" USING btree ("_parent_id");
  CREATE INDEX "work_pages_ind_work_path_idx" ON "work_pages_ind_work" USING btree ("_path");
  CREATE INDEX "__work_pages_v_ind_work_v_industries_order_idx" ON "__work_pages_v_ind_work_v_industries" USING btree ("_order");
  CREATE INDEX "__work_pages_v_ind_work_v_industries_parent_id_idx" ON "__work_pages_v_ind_work_v_industries" USING btree ("_parent_id");
  CREATE INDEX "__work_pages_v_ind_work_v_industries_industry_idx" ON "__work_pages_v_ind_work_v_industries" USING btree ("industry_id");
  CREATE INDEX "__work_pages_v_ind_work_v_industries_work_idx" ON "__work_pages_v_ind_work_v_industries" USING btree ("work_id");
  CREATE INDEX "__work_pages_v_ind_work_v_order_idx" ON "__work_pages_v_ind_work_v" USING btree ("_order");
  CREATE INDEX "__work_pages_v_ind_work_v_parent_id_idx" ON "__work_pages_v_ind_work_v" USING btree ("_parent_id");
  CREATE INDEX "__work_pages_v_ind_work_v_path_idx" ON "__work_pages_v_ind_work_v" USING btree ("_path");
  CREATE INDEX "home_ind_work_industries_order_idx" ON "home_ind_work_industries" USING btree ("_order");
  CREATE INDEX "home_ind_work_industries_parent_id_idx" ON "home_ind_work_industries" USING btree ("_parent_id");
  CREATE INDEX "home_ind_work_industries_industry_idx" ON "home_ind_work_industries" USING btree ("industry_id");
  CREATE INDEX "home_ind_work_industries_work_idx" ON "home_ind_work_industries" USING btree ("work_id");
  CREATE INDEX "home_ind_work_order_idx" ON "home_ind_work" USING btree ("_order");
  CREATE INDEX "home_ind_work_parent_id_idx" ON "home_ind_work" USING btree ("_parent_id");
  CREATE INDEX "home_ind_work_path_idx" ON "home_ind_work" USING btree ("_path");
  CREATE INDEX "__home_v_ind_work_v_industries_order_idx" ON "__home_v_ind_work_v_industries" USING btree ("_order");
  CREATE INDEX "__home_v_ind_work_v_industries_parent_id_idx" ON "__home_v_ind_work_v_industries" USING btree ("_parent_id");
  CREATE INDEX "__home_v_ind_work_v_industries_industry_idx" ON "__home_v_ind_work_v_industries" USING btree ("industry_id");
  CREATE INDEX "__home_v_ind_work_v_industries_work_idx" ON "__home_v_ind_work_v_industries" USING btree ("work_id");
  CREATE INDEX "__home_v_ind_work_v_order_idx" ON "__home_v_ind_work_v" USING btree ("_order");
  CREATE INDEX "__home_v_ind_work_v_parent_id_idx" ON "__home_v_ind_work_v" USING btree ("_parent_id");
  CREATE INDEX "__home_v_ind_work_v_path_idx" ON "__home_v_ind_work_v" USING btree ("_path");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_ind_work_industries" CASCADE;
  DROP TABLE "pages_ind_work" CASCADE;
  DROP TABLE "__pages_v_ind_work_v_industries" CASCADE;
  DROP TABLE "__pages_v_ind_work_v" CASCADE;
  DROP TABLE "work_pages_ind_work_industries" CASCADE;
  DROP TABLE "work_pages_ind_work" CASCADE;
  DROP TABLE "__work_pages_v_ind_work_v_industries" CASCADE;
  DROP TABLE "__work_pages_v_ind_work_v" CASCADE;
  DROP TABLE "home_ind_work_industries" CASCADE;
  DROP TABLE "home_ind_work" CASCADE;
  DROP TABLE "__home_v_ind_work_v_industries" CASCADE;
  DROP TABLE "__home_v_ind_work_v" CASCADE;
  DROP TYPE "public"."enum_pages_ind_work_theme";
  DROP TYPE "public"."enum___pages_v_ind_work_v_theme";
  DROP TYPE "public"."enum_work_pages_ind_work_theme";
  DROP TYPE "public"."enum___work_pages_v_ind_work_v_theme";
  DROP TYPE "public"."enum_home_ind_work_theme";
  DROP TYPE "public"."enum___home_v_ind_work_v_theme";`)
}
