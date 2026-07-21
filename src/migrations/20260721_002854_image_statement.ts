import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_archive_card_variant" AS ENUM('contained', 'open', 'overlay');
  CREATE TYPE "public"."enum_image_statement_text_position" AS ENUM('right', 'left');
  CREATE TYPE "public"."enum_image_statement_text_size" AS ENUM('default', 'small');
  CREATE TYPE "public"."enum_image_statement_image_width" AS ENUM('contained', 'full');
  CREATE TYPE "public"."enum__pages_v_blocks_archive_card_variant" AS ENUM('contained', 'open', 'overlay');
  CREATE TYPE "public"."enum__image_statement_v_text_position" AS ENUM('right', 'left');
  CREATE TYPE "public"."enum__image_statement_v_text_size" AS ENUM('default', 'small');
  CREATE TYPE "public"."enum__image_statement_v_image_width" AS ENUM('contained', 'full');
  CREATE TYPE "public"."enum_expertise_pages_blocks_archive_card_variant" AS ENUM('contained', 'open', 'overlay');
  CREATE TYPE "public"."enum__expertise_pages_v_blocks_archive_card_variant" AS ENUM('contained', 'open', 'overlay');
  CREATE TYPE "public"."enum_audience_pages_blocks_archive_card_variant" AS ENUM('contained', 'open', 'overlay');
  CREATE TYPE "public"."enum__audience_pages_v_blocks_archive_card_variant" AS ENUM('contained', 'open', 'overlay');
  CREATE TYPE "public"."enum_footer_get_in_touch_type" AS ENUM('reference', 'custom');
  CREATE TABLE "image_statement" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"caption" varchar,
  	"text_position" "enum_image_statement_text_position" DEFAULT 'right',
  	"text_size" "enum_image_statement_text_size" DEFAULT 'default',
  	"image_width" "enum_image_statement_image_width" DEFAULT 'contained',
  	"block_name" varchar
  );
  
  CREATE TABLE "_image_statement_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"caption" varchar,
  	"text_position" "enum__image_statement_v_text_position" DEFAULT 'right',
  	"text_size" "enum__image_statement_v_text_size" DEFAULT 'default',
  	"image_width" "enum__image_statement_v_image_width" DEFAULT 'contained',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  DROP TABLE "pages_blocks_feature_image_caption" CASCADE;
  DROP TABLE "_pages_v_blocks_feature_image_caption" CASCADE;
  DROP TABLE "expertise_pages_blocks_feature_image_caption" CASCADE;
  DROP TABLE "_expertise_pages_v_blocks_feature_image_caption" CASCADE;
  DROP TABLE "audience_pages_blocks_feature_image_caption" CASCADE;
  DROP TABLE "_audience_pages_v_blocks_feature_image_caption" CASCADE;
  DROP TABLE "footer_nav_items" CASCADE;
  ALTER TABLE "pages_blocks_archive" ADD COLUMN "card_variant" "enum_pages_blocks_archive_card_variant" DEFAULT 'contained';
  ALTER TABLE "_pages_v_blocks_archive" ADD COLUMN "card_variant" "enum__pages_v_blocks_archive_card_variant" DEFAULT 'contained';
  ALTER TABLE "wp_story" ADD COLUMN "browse_all_media" boolean DEFAULT false;
  ALTER TABLE "wp_media" ADD COLUMN "browse_all_media" boolean DEFAULT false;
  ALTER TABLE "work_pages" ADD COLUMN "hero_browse_all_media" boolean DEFAULT false;
  ALTER TABLE "work_pages" ADD COLUMN "browse_all_media" boolean DEFAULT false;
  ALTER TABLE "_wp_story_v" ADD COLUMN "browse_all_media" boolean DEFAULT false;
  ALTER TABLE "_wp_media_v" ADD COLUMN "browse_all_media" boolean DEFAULT false;
  ALTER TABLE "_work_pages_v" ADD COLUMN "version_hero_browse_all_media" boolean DEFAULT false;
  ALTER TABLE "_work_pages_v" ADD COLUMN "version_browse_all_media" boolean DEFAULT false;
  ALTER TABLE "expertise_pages_blocks_archive" ADD COLUMN "card_variant" "enum_expertise_pages_blocks_archive_card_variant" DEFAULT 'contained';
  ALTER TABLE "_expertise_pages_v_blocks_archive" ADD COLUMN "card_variant" "enum__expertise_pages_v_blocks_archive_card_variant" DEFAULT 'contained';
  ALTER TABLE "audience_pages_blocks_archive" ADD COLUMN "card_variant" "enum_audience_pages_blocks_archive_card_variant" DEFAULT 'contained';
  ALTER TABLE "_audience_pages_v_blocks_archive" ADD COLUMN "card_variant" "enum__audience_pages_v_blocks_archive_card_variant" DEFAULT 'contained';
  ALTER TABLE "footer" ADD COLUMN "location" varchar DEFAULT 'Brooklyn, NY / Philadelphia, PA' NOT NULL;
  ALTER TABLE "footer" ADD COLUMN "get_in_touch_type" "enum_footer_get_in_touch_type" DEFAULT 'reference';
  ALTER TABLE "footer" ADD COLUMN "get_in_touch_new_tab" boolean;
  ALTER TABLE "footer" ADD COLUMN "get_in_touch_url" varchar;
  ALTER TABLE "footer" ADD COLUMN "get_in_touch_label" varchar;
  UPDATE "footer" SET "get_in_touch_label" = 'Get in touch' WHERE "get_in_touch_label" IS NULL;
  ALTER TABLE "footer" ALTER COLUMN "get_in_touch_label" SET NOT NULL;
  ALTER TABLE "image_statement" ADD CONSTRAINT "image_statement_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "image_statement" ADD CONSTRAINT "image_statement_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_image_statement_v" ADD CONSTRAINT "_image_statement_v_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_image_statement_v" ADD CONSTRAINT "_image_statement_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "image_statement_order_idx" ON "image_statement" USING btree ("_order");
  CREATE INDEX "image_statement_parent_id_idx" ON "image_statement" USING btree ("_parent_id");
  CREATE INDEX "image_statement_path_idx" ON "image_statement" USING btree ("_path");
  CREATE INDEX "image_statement_media_idx" ON "image_statement" USING btree ("media_id");
  CREATE INDEX "_image_statement_v_order_idx" ON "_image_statement_v" USING btree ("_order");
  CREATE INDEX "_image_statement_v_parent_id_idx" ON "_image_statement_v" USING btree ("_parent_id");
  CREATE INDEX "_image_statement_v_path_idx" ON "_image_statement_v" USING btree ("_path");
  CREATE INDEX "_image_statement_v_media_idx" ON "_image_statement_v" USING btree ("media_id");
  DROP TYPE "public"."enum_footer_nav_items_link_type";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_footer_nav_items_link_type" AS ENUM('reference', 'custom');
  CREATE TABLE "pages_blocks_feature_image_caption" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"caption" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_feature_image_caption" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"caption" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "expertise_pages_blocks_feature_image_caption" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"caption" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_expertise_pages_v_blocks_feature_image_caption" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"caption" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "audience_pages_blocks_feature_image_caption" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"caption" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_audience_pages_v_blocks_feature_image_caption" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"caption" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "footer_nav_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_footer_nav_items_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar NOT NULL
  );
  
  DROP TABLE "image_statement" CASCADE;
  DROP TABLE "_image_statement_v" CASCADE;
  ALTER TABLE "pages_blocks_feature_image_caption" ADD CONSTRAINT "pages_blocks_feature_image_caption_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_feature_image_caption" ADD CONSTRAINT "pages_blocks_feature_image_caption_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_feature_image_caption" ADD CONSTRAINT "_pages_v_blocks_feature_image_caption_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_feature_image_caption" ADD CONSTRAINT "_pages_v_blocks_feature_image_caption_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "expertise_pages_blocks_feature_image_caption" ADD CONSTRAINT "expertise_pages_blocks_feature_image_caption_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "expertise_pages_blocks_feature_image_caption" ADD CONSTRAINT "expertise_pages_blocks_feature_image_caption_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."expertise_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_expertise_pages_v_blocks_feature_image_caption" ADD CONSTRAINT "_expertise_pages_v_blocks_feature_image_caption_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_expertise_pages_v_blocks_feature_image_caption" ADD CONSTRAINT "_expertise_pages_v_blocks_feature_image_caption_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_expertise_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "audience_pages_blocks_feature_image_caption" ADD CONSTRAINT "audience_pages_blocks_feature_image_caption_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "audience_pages_blocks_feature_image_caption" ADD CONSTRAINT "audience_pages_blocks_feature_image_caption_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."audience_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_audience_pages_v_blocks_feature_image_caption" ADD CONSTRAINT "_audience_pages_v_blocks_feature_image_caption_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_audience_pages_v_blocks_feature_image_caption" ADD CONSTRAINT "_audience_pages_v_blocks_feature_image_caption_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_audience_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_nav_items" ADD CONSTRAINT "footer_nav_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_feature_image_caption_order_idx" ON "pages_blocks_feature_image_caption" USING btree ("_order");
  CREATE INDEX "pages_blocks_feature_image_caption_parent_id_idx" ON "pages_blocks_feature_image_caption" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_feature_image_caption_path_idx" ON "pages_blocks_feature_image_caption" USING btree ("_path");
  CREATE INDEX "pages_blocks_feature_image_caption_media_idx" ON "pages_blocks_feature_image_caption" USING btree ("media_id");
  CREATE INDEX "_pages_v_blocks_feature_image_caption_order_idx" ON "_pages_v_blocks_feature_image_caption" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_feature_image_caption_parent_id_idx" ON "_pages_v_blocks_feature_image_caption" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_feature_image_caption_path_idx" ON "_pages_v_blocks_feature_image_caption" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_feature_image_caption_media_idx" ON "_pages_v_blocks_feature_image_caption" USING btree ("media_id");
  CREATE INDEX "expertise_pages_blocks_feature_image_caption_order_idx" ON "expertise_pages_blocks_feature_image_caption" USING btree ("_order");
  CREATE INDEX "expertise_pages_blocks_feature_image_caption_parent_id_idx" ON "expertise_pages_blocks_feature_image_caption" USING btree ("_parent_id");
  CREATE INDEX "expertise_pages_blocks_feature_image_caption_path_idx" ON "expertise_pages_blocks_feature_image_caption" USING btree ("_path");
  CREATE INDEX "expertise_pages_blocks_feature_image_caption_media_idx" ON "expertise_pages_blocks_feature_image_caption" USING btree ("media_id");
  CREATE INDEX "_expertise_pages_v_blocks_feature_image_caption_order_idx" ON "_expertise_pages_v_blocks_feature_image_caption" USING btree ("_order");
  CREATE INDEX "_expertise_pages_v_blocks_feature_image_caption_parent_id_idx" ON "_expertise_pages_v_blocks_feature_image_caption" USING btree ("_parent_id");
  CREATE INDEX "_expertise_pages_v_blocks_feature_image_caption_path_idx" ON "_expertise_pages_v_blocks_feature_image_caption" USING btree ("_path");
  CREATE INDEX "_expertise_pages_v_blocks_feature_image_caption_media_idx" ON "_expertise_pages_v_blocks_feature_image_caption" USING btree ("media_id");
  CREATE INDEX "audience_pages_blocks_feature_image_caption_order_idx" ON "audience_pages_blocks_feature_image_caption" USING btree ("_order");
  CREATE INDEX "audience_pages_blocks_feature_image_caption_parent_id_idx" ON "audience_pages_blocks_feature_image_caption" USING btree ("_parent_id");
  CREATE INDEX "audience_pages_blocks_feature_image_caption_path_idx" ON "audience_pages_blocks_feature_image_caption" USING btree ("_path");
  CREATE INDEX "audience_pages_blocks_feature_image_caption_media_idx" ON "audience_pages_blocks_feature_image_caption" USING btree ("media_id");
  CREATE INDEX "_audience_pages_v_blocks_feature_image_caption_order_idx" ON "_audience_pages_v_blocks_feature_image_caption" USING btree ("_order");
  CREATE INDEX "_audience_pages_v_blocks_feature_image_caption_parent_id_idx" ON "_audience_pages_v_blocks_feature_image_caption" USING btree ("_parent_id");
  CREATE INDEX "_audience_pages_v_blocks_feature_image_caption_path_idx" ON "_audience_pages_v_blocks_feature_image_caption" USING btree ("_path");
  CREATE INDEX "_audience_pages_v_blocks_feature_image_caption_media_idx" ON "_audience_pages_v_blocks_feature_image_caption" USING btree ("media_id");
  CREATE INDEX "footer_nav_items_order_idx" ON "footer_nav_items" USING btree ("_order");
  CREATE INDEX "footer_nav_items_parent_id_idx" ON "footer_nav_items" USING btree ("_parent_id");
  ALTER TABLE "pages_blocks_archive" DROP COLUMN "card_variant";
  ALTER TABLE "_pages_v_blocks_archive" DROP COLUMN "card_variant";
  ALTER TABLE "wp_story" DROP COLUMN "browse_all_media";
  ALTER TABLE "wp_media" DROP COLUMN "browse_all_media";
  ALTER TABLE "work_pages" DROP COLUMN "hero_browse_all_media";
  ALTER TABLE "work_pages" DROP COLUMN "browse_all_media";
  ALTER TABLE "_wp_story_v" DROP COLUMN "browse_all_media";
  ALTER TABLE "_wp_media_v" DROP COLUMN "browse_all_media";
  ALTER TABLE "_work_pages_v" DROP COLUMN "version_hero_browse_all_media";
  ALTER TABLE "_work_pages_v" DROP COLUMN "version_browse_all_media";
  ALTER TABLE "expertise_pages_blocks_archive" DROP COLUMN "card_variant";
  ALTER TABLE "_expertise_pages_v_blocks_archive" DROP COLUMN "card_variant";
  ALTER TABLE "audience_pages_blocks_archive" DROP COLUMN "card_variant";
  ALTER TABLE "_audience_pages_v_blocks_archive" DROP COLUMN "card_variant";
  ALTER TABLE "footer" DROP COLUMN "location";
  ALTER TABLE "footer" DROP COLUMN "get_in_touch_type";
  ALTER TABLE "footer" DROP COLUMN "get_in_touch_new_tab";
  ALTER TABLE "footer" DROP COLUMN "get_in_touch_url";
  ALTER TABLE "footer" DROP COLUMN "get_in_touch_label";
  DROP TYPE "public"."enum_pages_blocks_archive_card_variant";
  DROP TYPE "public"."enum_image_statement_text_position";
  DROP TYPE "public"."enum_image_statement_text_size";
  DROP TYPE "public"."enum_image_statement_image_width";
  DROP TYPE "public"."enum__pages_v_blocks_archive_card_variant";
  DROP TYPE "public"."enum__image_statement_v_text_position";
  DROP TYPE "public"."enum__image_statement_v_text_size";
  DROP TYPE "public"."enum__image_statement_v_image_width";
  DROP TYPE "public"."enum_expertise_pages_blocks_archive_card_variant";
  DROP TYPE "public"."enum__expertise_pages_v_blocks_archive_card_variant";
  DROP TYPE "public"."enum_audience_pages_blocks_archive_card_variant";
  DROP TYPE "public"."enum__audience_pages_v_blocks_archive_card_variant";
  DROP TYPE "public"."enum_footer_get_in_touch_type";`)
}
