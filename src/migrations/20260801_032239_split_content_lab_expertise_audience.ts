import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_lab_pages_split_narrow_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum_lab_pages_split_narrow_image_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum_lab_pages_split_narrow_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___lab_pages_v_split_narrow_v_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum___lab_pages_v_split_narrow_v_image_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum___lab_pages_v_split_narrow_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_expertise_pages_split_narrow_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum_expertise_pages_split_narrow_image_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum_expertise_pages_split_narrow_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___expertise_pages_v_split_narrow_v_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum___expertise_pages_v_split_narrow_v_image_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum___expertise_pages_v_split_narrow_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum_audience_pages_split_narrow_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum_audience_pages_split_narrow_image_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum_audience_pages_split_narrow_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TYPE "public"."enum___audience_pages_v_split_narrow_v_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum___audience_pages_v_split_narrow_v_image_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum___audience_pages_v_split_narrow_v_theme" AS ENUM('light', 'dark', 'neutral', 'brand');
  CREATE TABLE "lab_pages_split_narrow" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"source" "enum_lab_pages_split_narrow_source" DEFAULT 'custom',
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" jsonb,
  	"media_id" integer,
  	"browse_all_media" boolean DEFAULT false,
  	"image_position" "enum_lab_pages_split_narrow_image_position" DEFAULT 'right',
  	"theme" "enum_lab_pages_split_narrow_theme" DEFAULT 'light',
  	"block_name" varchar
  );
  
  CREATE TABLE "__lab_pages_v_split_narrow_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"source" "enum___lab_pages_v_split_narrow_v_source" DEFAULT 'custom',
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" jsonb,
  	"media_id" integer,
  	"browse_all_media" boolean DEFAULT false,
  	"image_position" "enum___lab_pages_v_split_narrow_v_image_position" DEFAULT 'right',
  	"theme" "enum___lab_pages_v_split_narrow_v_theme" DEFAULT 'light',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "expertise_pages_split_narrow" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"source" "enum_expertise_pages_split_narrow_source" DEFAULT 'custom',
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" jsonb,
  	"media_id" integer,
  	"browse_all_media" boolean DEFAULT false,
  	"image_position" "enum_expertise_pages_split_narrow_image_position" DEFAULT 'right',
  	"theme" "enum_expertise_pages_split_narrow_theme" DEFAULT 'light',
  	"block_name" varchar
  );
  
  CREATE TABLE "__expertise_pages_v_split_narrow_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"source" "enum___expertise_pages_v_split_narrow_v_source" DEFAULT 'custom',
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" jsonb,
  	"media_id" integer,
  	"browse_all_media" boolean DEFAULT false,
  	"image_position" "enum___expertise_pages_v_split_narrow_v_image_position" DEFAULT 'right',
  	"theme" "enum___expertise_pages_v_split_narrow_v_theme" DEFAULT 'light',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "audience_pages_split_narrow" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"source" "enum_audience_pages_split_narrow_source" DEFAULT 'custom',
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" jsonb,
  	"media_id" integer,
  	"browse_all_media" boolean DEFAULT false,
  	"image_position" "enum_audience_pages_split_narrow_image_position" DEFAULT 'right',
  	"theme" "enum_audience_pages_split_narrow_theme" DEFAULT 'light',
  	"block_name" varchar
  );
  
  CREATE TABLE "__audience_pages_v_split_narrow_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"source" "enum___audience_pages_v_split_narrow_v_source" DEFAULT 'custom',
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" jsonb,
  	"media_id" integer,
  	"browse_all_media" boolean DEFAULT false,
  	"image_position" "enum___audience_pages_v_split_narrow_v_image_position" DEFAULT 'right',
  	"theme" "enum___audience_pages_v_split_narrow_v_theme" DEFAULT 'light',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "lab_pages_split_narrow" ADD CONSTRAINT "lab_pages_split_narrow_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "lab_pages_split_narrow" ADD CONSTRAINT "lab_pages_split_narrow_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lab_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__lab_pages_v_split_narrow_v" ADD CONSTRAINT "__lab_pages_v_split_narrow_v_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__lab_pages_v_split_narrow_v" ADD CONSTRAINT "__lab_pages_v_split_narrow_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_lab_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "expertise_pages_split_narrow" ADD CONSTRAINT "expertise_pages_split_narrow_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "expertise_pages_split_narrow" ADD CONSTRAINT "expertise_pages_split_narrow_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."expertise_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__expertise_pages_v_split_narrow_v" ADD CONSTRAINT "__expertise_pages_v_split_narrow_v_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__expertise_pages_v_split_narrow_v" ADD CONSTRAINT "__expertise_pages_v_split_narrow_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_expertise_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "audience_pages_split_narrow" ADD CONSTRAINT "audience_pages_split_narrow_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "audience_pages_split_narrow" ADD CONSTRAINT "audience_pages_split_narrow_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."audience_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__audience_pages_v_split_narrow_v" ADD CONSTRAINT "__audience_pages_v_split_narrow_v_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__audience_pages_v_split_narrow_v" ADD CONSTRAINT "__audience_pages_v_split_narrow_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_audience_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "lab_pages_split_narrow_order_idx" ON "lab_pages_split_narrow" USING btree ("_order");
  CREATE INDEX "lab_pages_split_narrow_parent_id_idx" ON "lab_pages_split_narrow" USING btree ("_parent_id");
  CREATE INDEX "lab_pages_split_narrow_path_idx" ON "lab_pages_split_narrow" USING btree ("_path");
  CREATE INDEX "lab_pages_split_narrow_media_idx" ON "lab_pages_split_narrow" USING btree ("media_id");
  CREATE INDEX "__lab_pages_v_split_narrow_v_order_idx" ON "__lab_pages_v_split_narrow_v" USING btree ("_order");
  CREATE INDEX "__lab_pages_v_split_narrow_v_parent_id_idx" ON "__lab_pages_v_split_narrow_v" USING btree ("_parent_id");
  CREATE INDEX "__lab_pages_v_split_narrow_v_path_idx" ON "__lab_pages_v_split_narrow_v" USING btree ("_path");
  CREATE INDEX "__lab_pages_v_split_narrow_v_media_idx" ON "__lab_pages_v_split_narrow_v" USING btree ("media_id");
  CREATE INDEX "expertise_pages_split_narrow_order_idx" ON "expertise_pages_split_narrow" USING btree ("_order");
  CREATE INDEX "expertise_pages_split_narrow_parent_id_idx" ON "expertise_pages_split_narrow" USING btree ("_parent_id");
  CREATE INDEX "expertise_pages_split_narrow_path_idx" ON "expertise_pages_split_narrow" USING btree ("_path");
  CREATE INDEX "expertise_pages_split_narrow_media_idx" ON "expertise_pages_split_narrow" USING btree ("media_id");
  CREATE INDEX "__expertise_pages_v_split_narrow_v_order_idx" ON "__expertise_pages_v_split_narrow_v" USING btree ("_order");
  CREATE INDEX "__expertise_pages_v_split_narrow_v_parent_id_idx" ON "__expertise_pages_v_split_narrow_v" USING btree ("_parent_id");
  CREATE INDEX "__expertise_pages_v_split_narrow_v_path_idx" ON "__expertise_pages_v_split_narrow_v" USING btree ("_path");
  CREATE INDEX "__expertise_pages_v_split_narrow_v_media_idx" ON "__expertise_pages_v_split_narrow_v" USING btree ("media_id");
  CREATE INDEX "audience_pages_split_narrow_order_idx" ON "audience_pages_split_narrow" USING btree ("_order");
  CREATE INDEX "audience_pages_split_narrow_parent_id_idx" ON "audience_pages_split_narrow" USING btree ("_parent_id");
  CREATE INDEX "audience_pages_split_narrow_path_idx" ON "audience_pages_split_narrow" USING btree ("_path");
  CREATE INDEX "audience_pages_split_narrow_media_idx" ON "audience_pages_split_narrow" USING btree ("media_id");
  CREATE INDEX "__audience_pages_v_split_narrow_v_order_idx" ON "__audience_pages_v_split_narrow_v" USING btree ("_order");
  CREATE INDEX "__audience_pages_v_split_narrow_v_parent_id_idx" ON "__audience_pages_v_split_narrow_v" USING btree ("_parent_id");
  CREATE INDEX "__audience_pages_v_split_narrow_v_path_idx" ON "__audience_pages_v_split_narrow_v" USING btree ("_path");
  CREATE INDEX "__audience_pages_v_split_narrow_v_media_idx" ON "__audience_pages_v_split_narrow_v" USING btree ("media_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "lab_pages_split_narrow" CASCADE;
  DROP TABLE "__lab_pages_v_split_narrow_v" CASCADE;
  DROP TABLE "expertise_pages_split_narrow" CASCADE;
  DROP TABLE "__expertise_pages_v_split_narrow_v" CASCADE;
  DROP TABLE "audience_pages_split_narrow" CASCADE;
  DROP TABLE "__audience_pages_v_split_narrow_v" CASCADE;
  DROP TYPE "public"."enum_lab_pages_split_narrow_source";
  DROP TYPE "public"."enum_lab_pages_split_narrow_image_position";
  DROP TYPE "public"."enum_lab_pages_split_narrow_theme";
  DROP TYPE "public"."enum___lab_pages_v_split_narrow_v_source";
  DROP TYPE "public"."enum___lab_pages_v_split_narrow_v_image_position";
  DROP TYPE "public"."enum___lab_pages_v_split_narrow_v_theme";
  DROP TYPE "public"."enum_expertise_pages_split_narrow_source";
  DROP TYPE "public"."enum_expertise_pages_split_narrow_image_position";
  DROP TYPE "public"."enum_expertise_pages_split_narrow_theme";
  DROP TYPE "public"."enum___expertise_pages_v_split_narrow_v_source";
  DROP TYPE "public"."enum___expertise_pages_v_split_narrow_v_image_position";
  DROP TYPE "public"."enum___expertise_pages_v_split_narrow_v_theme";
  DROP TYPE "public"."enum_audience_pages_split_narrow_source";
  DROP TYPE "public"."enum_audience_pages_split_narrow_image_position";
  DROP TYPE "public"."enum_audience_pages_split_narrow_theme";
  DROP TYPE "public"."enum___audience_pages_v_split_narrow_v_source";
  DROP TYPE "public"."enum___audience_pages_v_split_narrow_v_image_position";
  DROP TYPE "public"."enum___audience_pages_v_split_narrow_v_theme";`)
}
