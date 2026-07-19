import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-vercel-postgres'
import { generateNKeysBetween } from 'payload/shared'

/**
 * Tables gaining orderable `_order`, with the column that defines the initial order.
 * Capabilities and industries previously used a manual numeric `order` field, so their
 * existing ordering is preserved; everything else starts in creation order.
 */
const ORDERABLE_TABLES: { table: string; orderBy: string }[] = [
  { table: 'work_pages', orderBy: 'created_at' },
  { table: 'organizations', orderBy: 'created_at' },
  { table: 'projects', orderBy: 'created_at' },
  { table: 'case_studies', orderBy: 'created_at' },
  { table: 'lab_projects', orderBy: 'created_at' },
  { table: 'testimonials', orderBy: 'created_at' },
  { table: 'asset_libraries', orderBy: 'created_at' },
  { table: 'capabilities', orderBy: '"order", created_at' },
  { table: 'industries', orderBy: '"order", created_at' },
  { table: 'categories', orderBy: 'created_at' },
  { table: 'audiences', orderBy: 'created_at' },
]

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "pages_blocks_feature_heading_offset" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_feature_tabs_tabs_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "pages_blocks_feature_tabs_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"heading" varchar,
  	"description" varchar,
  	"subheading" varchar DEFAULT 'Included',
  	"media_id" integer,
  	"caption" varchar
  );
  
  CREATE TABLE "pages_blocks_feature_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_feature_image_caption" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"caption" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_feature_heading_offset" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_feature_tabs_tabs_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_feature_tabs_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"heading" varchar,
  	"description" varchar,
  	"subheading" varchar DEFAULT 'Included',
  	"media_id" integer,
  	"caption" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_feature_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
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
  
  CREATE TABLE "expertise_pages_blocks_feature_statement_grid_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"title" varchar,
  	"description" varchar
  );
  
  CREATE TABLE "expertise_pages_blocks_feature_statement_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"statement" varchar,
  	"footnote" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "expertise_pages_blocks_feature_heading_offset" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "expertise_pages_blocks_feature_tabs_tabs_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "expertise_pages_blocks_feature_tabs_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"heading" varchar,
  	"description" varchar,
  	"subheading" varchar DEFAULT 'Included',
  	"media_id" integer,
  	"caption" varchar
  );
  
  CREATE TABLE "expertise_pages_blocks_feature_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
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
  
  CREATE TABLE "_expertise_pages_v_blocks_feature_statement_grid_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"title" varchar,
  	"description" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_expertise_pages_v_blocks_feature_statement_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"statement" varchar,
  	"footnote" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_expertise_pages_v_blocks_feature_heading_offset" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_expertise_pages_v_blocks_feature_tabs_tabs_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_expertise_pages_v_blocks_feature_tabs_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"heading" varchar,
  	"description" varchar,
  	"subheading" varchar DEFAULT 'Included',
  	"media_id" integer,
  	"caption" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_expertise_pages_v_blocks_feature_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
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
  
  CREATE TABLE "audience_pages_blocks_feature_statement_grid_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"title" varchar,
  	"description" varchar
  );
  
  CREATE TABLE "audience_pages_blocks_feature_statement_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"statement" varchar,
  	"footnote" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "audience_pages_blocks_feature_heading_offset" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "audience_pages_blocks_feature_tabs_tabs_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "audience_pages_blocks_feature_tabs_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"heading" varchar,
  	"description" varchar,
  	"subheading" varchar DEFAULT 'Included',
  	"media_id" integer,
  	"caption" varchar
  );
  
  CREATE TABLE "audience_pages_blocks_feature_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
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
  
  CREATE TABLE "_audience_pages_v_blocks_feature_statement_grid_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"title" varchar,
  	"description" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_audience_pages_v_blocks_feature_statement_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"statement" varchar,
  	"footnote" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_audience_pages_v_blocks_feature_heading_offset" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"body" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_audience_pages_v_blocks_feature_tabs_tabs_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_audience_pages_v_blocks_feature_tabs_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"heading" varchar,
  	"description" varchar,
  	"subheading" varchar DEFAULT 'Included',
  	"media_id" integer,
  	"caption" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_audience_pages_v_blocks_feature_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
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
  
  ALTER TABLE "work_pages" ADD COLUMN "_order" varchar;
  ALTER TABLE "_work_pages_v" ADD COLUMN "version__order" varchar;
  ALTER TABLE "organizations" ADD COLUMN "_order" varchar;
  ALTER TABLE "_organizations_v" ADD COLUMN "version__order" varchar;
  ALTER TABLE "projects" ADD COLUMN "_order" varchar;
  ALTER TABLE "_projects_v" ADD COLUMN "version__order" varchar;
  ALTER TABLE "case_studies" ADD COLUMN "_order" varchar;
  ALTER TABLE "_case_studies_v" ADD COLUMN "version__order" varchar;
  ALTER TABLE "lab_projects" ADD COLUMN "_order" varchar;
  ALTER TABLE "_lab_projects_v" ADD COLUMN "version__order" varchar;
  ALTER TABLE "testimonials" ADD COLUMN "_order" varchar;
  ALTER TABLE "_testimonials_v" ADD COLUMN "version__order" varchar;
  ALTER TABLE "asset_libraries" ADD COLUMN "_order" varchar;
  ALTER TABLE "capabilities" ADD COLUMN "_order" varchar;
  ALTER TABLE "industries" ADD COLUMN "_order" varchar;
  ALTER TABLE "categories" ADD COLUMN "_order" varchar;
  ALTER TABLE "audiences" ADD COLUMN "_order" varchar;
  ALTER TABLE "pages_blocks_feature_heading_offset" ADD CONSTRAINT "pages_blocks_feature_heading_offset_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_feature_tabs_tabs_items" ADD CONSTRAINT "pages_blocks_feature_tabs_tabs_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_feature_tabs_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_feature_tabs_tabs" ADD CONSTRAINT "pages_blocks_feature_tabs_tabs_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_feature_tabs_tabs" ADD CONSTRAINT "pages_blocks_feature_tabs_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_feature_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_feature_tabs" ADD CONSTRAINT "pages_blocks_feature_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_feature_image_caption" ADD CONSTRAINT "pages_blocks_feature_image_caption_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_feature_image_caption" ADD CONSTRAINT "pages_blocks_feature_image_caption_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_feature_heading_offset" ADD CONSTRAINT "_pages_v_blocks_feature_heading_offset_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_feature_tabs_tabs_items" ADD CONSTRAINT "_pages_v_blocks_feature_tabs_tabs_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_feature_tabs_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_feature_tabs_tabs" ADD CONSTRAINT "_pages_v_blocks_feature_tabs_tabs_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_feature_tabs_tabs" ADD CONSTRAINT "_pages_v_blocks_feature_tabs_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_feature_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_feature_tabs" ADD CONSTRAINT "_pages_v_blocks_feature_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_feature_image_caption" ADD CONSTRAINT "_pages_v_blocks_feature_image_caption_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_feature_image_caption" ADD CONSTRAINT "_pages_v_blocks_feature_image_caption_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "expertise_pages_blocks_feature_statement_grid_cards" ADD CONSTRAINT "expertise_pages_blocks_feature_statement_grid_cards_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "expertise_pages_blocks_feature_statement_grid_cards" ADD CONSTRAINT "expertise_pages_blocks_feature_statement_grid_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."expertise_pages_blocks_feature_statement_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "expertise_pages_blocks_feature_statement_grid" ADD CONSTRAINT "expertise_pages_blocks_feature_statement_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."expertise_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "expertise_pages_blocks_feature_heading_offset" ADD CONSTRAINT "expertise_pages_blocks_feature_heading_offset_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."expertise_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "expertise_pages_blocks_feature_tabs_tabs_items" ADD CONSTRAINT "expertise_pages_blocks_feature_tabs_tabs_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."expertise_pages_blocks_feature_tabs_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "expertise_pages_blocks_feature_tabs_tabs" ADD CONSTRAINT "expertise_pages_blocks_feature_tabs_tabs_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "expertise_pages_blocks_feature_tabs_tabs" ADD CONSTRAINT "expertise_pages_blocks_feature_tabs_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."expertise_pages_blocks_feature_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "expertise_pages_blocks_feature_tabs" ADD CONSTRAINT "expertise_pages_blocks_feature_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."expertise_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "expertise_pages_blocks_feature_image_caption" ADD CONSTRAINT "expertise_pages_blocks_feature_image_caption_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "expertise_pages_blocks_feature_image_caption" ADD CONSTRAINT "expertise_pages_blocks_feature_image_caption_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."expertise_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_expertise_pages_v_blocks_feature_statement_grid_cards" ADD CONSTRAINT "_expertise_pages_v_blocks_feature_statement_grid_cards_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_expertise_pages_v_blocks_feature_statement_grid_cards" ADD CONSTRAINT "_expertise_pages_v_blocks_feature_statement_grid_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_expertise_pages_v_blocks_feature_statement_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_expertise_pages_v_blocks_feature_statement_grid" ADD CONSTRAINT "_expertise_pages_v_blocks_feature_statement_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_expertise_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_expertise_pages_v_blocks_feature_heading_offset" ADD CONSTRAINT "_expertise_pages_v_blocks_feature_heading_offset_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_expertise_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_expertise_pages_v_blocks_feature_tabs_tabs_items" ADD CONSTRAINT "_expertise_pages_v_blocks_feature_tabs_tabs_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_expertise_pages_v_blocks_feature_tabs_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_expertise_pages_v_blocks_feature_tabs_tabs" ADD CONSTRAINT "_expertise_pages_v_blocks_feature_tabs_tabs_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_expertise_pages_v_blocks_feature_tabs_tabs" ADD CONSTRAINT "_expertise_pages_v_blocks_feature_tabs_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_expertise_pages_v_blocks_feature_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_expertise_pages_v_blocks_feature_tabs" ADD CONSTRAINT "_expertise_pages_v_blocks_feature_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_expertise_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_expertise_pages_v_blocks_feature_image_caption" ADD CONSTRAINT "_expertise_pages_v_blocks_feature_image_caption_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_expertise_pages_v_blocks_feature_image_caption" ADD CONSTRAINT "_expertise_pages_v_blocks_feature_image_caption_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_expertise_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "audience_pages_blocks_feature_statement_grid_cards" ADD CONSTRAINT "audience_pages_blocks_feature_statement_grid_cards_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "audience_pages_blocks_feature_statement_grid_cards" ADD CONSTRAINT "audience_pages_blocks_feature_statement_grid_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."audience_pages_blocks_feature_statement_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "audience_pages_blocks_feature_statement_grid" ADD CONSTRAINT "audience_pages_blocks_feature_statement_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."audience_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "audience_pages_blocks_feature_heading_offset" ADD CONSTRAINT "audience_pages_blocks_feature_heading_offset_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."audience_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "audience_pages_blocks_feature_tabs_tabs_items" ADD CONSTRAINT "audience_pages_blocks_feature_tabs_tabs_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."audience_pages_blocks_feature_tabs_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "audience_pages_blocks_feature_tabs_tabs" ADD CONSTRAINT "audience_pages_blocks_feature_tabs_tabs_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "audience_pages_blocks_feature_tabs_tabs" ADD CONSTRAINT "audience_pages_blocks_feature_tabs_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."audience_pages_blocks_feature_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "audience_pages_blocks_feature_tabs" ADD CONSTRAINT "audience_pages_blocks_feature_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."audience_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "audience_pages_blocks_feature_image_caption" ADD CONSTRAINT "audience_pages_blocks_feature_image_caption_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "audience_pages_blocks_feature_image_caption" ADD CONSTRAINT "audience_pages_blocks_feature_image_caption_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."audience_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_audience_pages_v_blocks_feature_statement_grid_cards" ADD CONSTRAINT "_audience_pages_v_blocks_feature_statement_grid_cards_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_audience_pages_v_blocks_feature_statement_grid_cards" ADD CONSTRAINT "_audience_pages_v_blocks_feature_statement_grid_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_audience_pages_v_blocks_feature_statement_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_audience_pages_v_blocks_feature_statement_grid" ADD CONSTRAINT "_audience_pages_v_blocks_feature_statement_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_audience_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_audience_pages_v_blocks_feature_heading_offset" ADD CONSTRAINT "_audience_pages_v_blocks_feature_heading_offset_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_audience_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_audience_pages_v_blocks_feature_tabs_tabs_items" ADD CONSTRAINT "_audience_pages_v_blocks_feature_tabs_tabs_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_audience_pages_v_blocks_feature_tabs_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_audience_pages_v_blocks_feature_tabs_tabs" ADD CONSTRAINT "_audience_pages_v_blocks_feature_tabs_tabs_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_audience_pages_v_blocks_feature_tabs_tabs" ADD CONSTRAINT "_audience_pages_v_blocks_feature_tabs_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_audience_pages_v_blocks_feature_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_audience_pages_v_blocks_feature_tabs" ADD CONSTRAINT "_audience_pages_v_blocks_feature_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_audience_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_audience_pages_v_blocks_feature_image_caption" ADD CONSTRAINT "_audience_pages_v_blocks_feature_image_caption_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_audience_pages_v_blocks_feature_image_caption" ADD CONSTRAINT "_audience_pages_v_blocks_feature_image_caption_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_audience_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_feature_heading_offset_order_idx" ON "pages_blocks_feature_heading_offset" USING btree ("_order");
  CREATE INDEX "pages_blocks_feature_heading_offset_parent_id_idx" ON "pages_blocks_feature_heading_offset" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_feature_heading_offset_path_idx" ON "pages_blocks_feature_heading_offset" USING btree ("_path");
  CREATE INDEX "pages_blocks_feature_tabs_tabs_items_order_idx" ON "pages_blocks_feature_tabs_tabs_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_feature_tabs_tabs_items_parent_id_idx" ON "pages_blocks_feature_tabs_tabs_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_feature_tabs_tabs_order_idx" ON "pages_blocks_feature_tabs_tabs" USING btree ("_order");
  CREATE INDEX "pages_blocks_feature_tabs_tabs_parent_id_idx" ON "pages_blocks_feature_tabs_tabs" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_feature_tabs_tabs_media_idx" ON "pages_blocks_feature_tabs_tabs" USING btree ("media_id");
  CREATE INDEX "pages_blocks_feature_tabs_order_idx" ON "pages_blocks_feature_tabs" USING btree ("_order");
  CREATE INDEX "pages_blocks_feature_tabs_parent_id_idx" ON "pages_blocks_feature_tabs" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_feature_tabs_path_idx" ON "pages_blocks_feature_tabs" USING btree ("_path");
  CREATE INDEX "pages_blocks_feature_image_caption_order_idx" ON "pages_blocks_feature_image_caption" USING btree ("_order");
  CREATE INDEX "pages_blocks_feature_image_caption_parent_id_idx" ON "pages_blocks_feature_image_caption" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_feature_image_caption_path_idx" ON "pages_blocks_feature_image_caption" USING btree ("_path");
  CREATE INDEX "pages_blocks_feature_image_caption_media_idx" ON "pages_blocks_feature_image_caption" USING btree ("media_id");
  CREATE INDEX "_pages_v_blocks_feature_heading_offset_order_idx" ON "_pages_v_blocks_feature_heading_offset" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_feature_heading_offset_parent_id_idx" ON "_pages_v_blocks_feature_heading_offset" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_feature_heading_offset_path_idx" ON "_pages_v_blocks_feature_heading_offset" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_feature_tabs_tabs_items_order_idx" ON "_pages_v_blocks_feature_tabs_tabs_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_feature_tabs_tabs_items_parent_id_idx" ON "_pages_v_blocks_feature_tabs_tabs_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_feature_tabs_tabs_order_idx" ON "_pages_v_blocks_feature_tabs_tabs" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_feature_tabs_tabs_parent_id_idx" ON "_pages_v_blocks_feature_tabs_tabs" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_feature_tabs_tabs_media_idx" ON "_pages_v_blocks_feature_tabs_tabs" USING btree ("media_id");
  CREATE INDEX "_pages_v_blocks_feature_tabs_order_idx" ON "_pages_v_blocks_feature_tabs" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_feature_tabs_parent_id_idx" ON "_pages_v_blocks_feature_tabs" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_feature_tabs_path_idx" ON "_pages_v_blocks_feature_tabs" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_feature_image_caption_order_idx" ON "_pages_v_blocks_feature_image_caption" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_feature_image_caption_parent_id_idx" ON "_pages_v_blocks_feature_image_caption" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_feature_image_caption_path_idx" ON "_pages_v_blocks_feature_image_caption" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_feature_image_caption_media_idx" ON "_pages_v_blocks_feature_image_caption" USING btree ("media_id");
  CREATE INDEX "expertise_pages_blocks_feature_statement_grid_cards_order_idx" ON "expertise_pages_blocks_feature_statement_grid_cards" USING btree ("_order");
  CREATE INDEX "expertise_pages_blocks_feature_statement_grid_cards_parent_id_idx" ON "expertise_pages_blocks_feature_statement_grid_cards" USING btree ("_parent_id");
  CREATE INDEX "expertise_pages_blocks_feature_statement_grid_cards_medi_idx" ON "expertise_pages_blocks_feature_statement_grid_cards" USING btree ("media_id");
  CREATE INDEX "expertise_pages_blocks_feature_statement_grid_order_idx" ON "expertise_pages_blocks_feature_statement_grid" USING btree ("_order");
  CREATE INDEX "expertise_pages_blocks_feature_statement_grid_parent_id_idx" ON "expertise_pages_blocks_feature_statement_grid" USING btree ("_parent_id");
  CREATE INDEX "expertise_pages_blocks_feature_statement_grid_path_idx" ON "expertise_pages_blocks_feature_statement_grid" USING btree ("_path");
  CREATE INDEX "expertise_pages_blocks_feature_heading_offset_order_idx" ON "expertise_pages_blocks_feature_heading_offset" USING btree ("_order");
  CREATE INDEX "expertise_pages_blocks_feature_heading_offset_parent_id_idx" ON "expertise_pages_blocks_feature_heading_offset" USING btree ("_parent_id");
  CREATE INDEX "expertise_pages_blocks_feature_heading_offset_path_idx" ON "expertise_pages_blocks_feature_heading_offset" USING btree ("_path");
  CREATE INDEX "expertise_pages_blocks_feature_tabs_tabs_items_order_idx" ON "expertise_pages_blocks_feature_tabs_tabs_items" USING btree ("_order");
  CREATE INDEX "expertise_pages_blocks_feature_tabs_tabs_items_parent_id_idx" ON "expertise_pages_blocks_feature_tabs_tabs_items" USING btree ("_parent_id");
  CREATE INDEX "expertise_pages_blocks_feature_tabs_tabs_order_idx" ON "expertise_pages_blocks_feature_tabs_tabs" USING btree ("_order");
  CREATE INDEX "expertise_pages_blocks_feature_tabs_tabs_parent_id_idx" ON "expertise_pages_blocks_feature_tabs_tabs" USING btree ("_parent_id");
  CREATE INDEX "expertise_pages_blocks_feature_tabs_tabs_media_idx" ON "expertise_pages_blocks_feature_tabs_tabs" USING btree ("media_id");
  CREATE INDEX "expertise_pages_blocks_feature_tabs_order_idx" ON "expertise_pages_blocks_feature_tabs" USING btree ("_order");
  CREATE INDEX "expertise_pages_blocks_feature_tabs_parent_id_idx" ON "expertise_pages_blocks_feature_tabs" USING btree ("_parent_id");
  CREATE INDEX "expertise_pages_blocks_feature_tabs_path_idx" ON "expertise_pages_blocks_feature_tabs" USING btree ("_path");
  CREATE INDEX "expertise_pages_blocks_feature_image_caption_order_idx" ON "expertise_pages_blocks_feature_image_caption" USING btree ("_order");
  CREATE INDEX "expertise_pages_blocks_feature_image_caption_parent_id_idx" ON "expertise_pages_blocks_feature_image_caption" USING btree ("_parent_id");
  CREATE INDEX "expertise_pages_blocks_feature_image_caption_path_idx" ON "expertise_pages_blocks_feature_image_caption" USING btree ("_path");
  CREATE INDEX "expertise_pages_blocks_feature_image_caption_media_idx" ON "expertise_pages_blocks_feature_image_caption" USING btree ("media_id");
  CREATE INDEX "_expertise_pages_v_blocks_feature_statement_grid_cards_order_idx" ON "_expertise_pages_v_blocks_feature_statement_grid_cards" USING btree ("_order");
  CREATE INDEX "_expertise_pages_v_blocks_feature_statement_grid_cards_parent_id_idx" ON "_expertise_pages_v_blocks_feature_statement_grid_cards" USING btree ("_parent_id");
  CREATE INDEX "_expertise_pages_v_blocks_feature_statement_grid_cards_m_idx" ON "_expertise_pages_v_blocks_feature_statement_grid_cards" USING btree ("media_id");
  CREATE INDEX "_expertise_pages_v_blocks_feature_statement_grid_order_idx" ON "_expertise_pages_v_blocks_feature_statement_grid" USING btree ("_order");
  CREATE INDEX "_expertise_pages_v_blocks_feature_statement_grid_parent_id_idx" ON "_expertise_pages_v_blocks_feature_statement_grid" USING btree ("_parent_id");
  CREATE INDEX "_expertise_pages_v_blocks_feature_statement_grid_path_idx" ON "_expertise_pages_v_blocks_feature_statement_grid" USING btree ("_path");
  CREATE INDEX "_expertise_pages_v_blocks_feature_heading_offset_order_idx" ON "_expertise_pages_v_blocks_feature_heading_offset" USING btree ("_order");
  CREATE INDEX "_expertise_pages_v_blocks_feature_heading_offset_parent_id_idx" ON "_expertise_pages_v_blocks_feature_heading_offset" USING btree ("_parent_id");
  CREATE INDEX "_expertise_pages_v_blocks_feature_heading_offset_path_idx" ON "_expertise_pages_v_blocks_feature_heading_offset" USING btree ("_path");
  CREATE INDEX "_expertise_pages_v_blocks_feature_tabs_tabs_items_order_idx" ON "_expertise_pages_v_blocks_feature_tabs_tabs_items" USING btree ("_order");
  CREATE INDEX "_expertise_pages_v_blocks_feature_tabs_tabs_items_parent_id_idx" ON "_expertise_pages_v_blocks_feature_tabs_tabs_items" USING btree ("_parent_id");
  CREATE INDEX "_expertise_pages_v_blocks_feature_tabs_tabs_order_idx" ON "_expertise_pages_v_blocks_feature_tabs_tabs" USING btree ("_order");
  CREATE INDEX "_expertise_pages_v_blocks_feature_tabs_tabs_parent_id_idx" ON "_expertise_pages_v_blocks_feature_tabs_tabs" USING btree ("_parent_id");
  CREATE INDEX "_expertise_pages_v_blocks_feature_tabs_tabs_media_idx" ON "_expertise_pages_v_blocks_feature_tabs_tabs" USING btree ("media_id");
  CREATE INDEX "_expertise_pages_v_blocks_feature_tabs_order_idx" ON "_expertise_pages_v_blocks_feature_tabs" USING btree ("_order");
  CREATE INDEX "_expertise_pages_v_blocks_feature_tabs_parent_id_idx" ON "_expertise_pages_v_blocks_feature_tabs" USING btree ("_parent_id");
  CREATE INDEX "_expertise_pages_v_blocks_feature_tabs_path_idx" ON "_expertise_pages_v_blocks_feature_tabs" USING btree ("_path");
  CREATE INDEX "_expertise_pages_v_blocks_feature_image_caption_order_idx" ON "_expertise_pages_v_blocks_feature_image_caption" USING btree ("_order");
  CREATE INDEX "_expertise_pages_v_blocks_feature_image_caption_parent_id_idx" ON "_expertise_pages_v_blocks_feature_image_caption" USING btree ("_parent_id");
  CREATE INDEX "_expertise_pages_v_blocks_feature_image_caption_path_idx" ON "_expertise_pages_v_blocks_feature_image_caption" USING btree ("_path");
  CREATE INDEX "_expertise_pages_v_blocks_feature_image_caption_media_idx" ON "_expertise_pages_v_blocks_feature_image_caption" USING btree ("media_id");
  CREATE INDEX "audience_pages_blocks_feature_statement_grid_cards_order_idx" ON "audience_pages_blocks_feature_statement_grid_cards" USING btree ("_order");
  CREATE INDEX "audience_pages_blocks_feature_statement_grid_cards_parent_id_idx" ON "audience_pages_blocks_feature_statement_grid_cards" USING btree ("_parent_id");
  CREATE INDEX "audience_pages_blocks_feature_statement_grid_cards_media_idx" ON "audience_pages_blocks_feature_statement_grid_cards" USING btree ("media_id");
  CREATE INDEX "audience_pages_blocks_feature_statement_grid_order_idx" ON "audience_pages_blocks_feature_statement_grid" USING btree ("_order");
  CREATE INDEX "audience_pages_blocks_feature_statement_grid_parent_id_idx" ON "audience_pages_blocks_feature_statement_grid" USING btree ("_parent_id");
  CREATE INDEX "audience_pages_blocks_feature_statement_grid_path_idx" ON "audience_pages_blocks_feature_statement_grid" USING btree ("_path");
  CREATE INDEX "audience_pages_blocks_feature_heading_offset_order_idx" ON "audience_pages_blocks_feature_heading_offset" USING btree ("_order");
  CREATE INDEX "audience_pages_blocks_feature_heading_offset_parent_id_idx" ON "audience_pages_blocks_feature_heading_offset" USING btree ("_parent_id");
  CREATE INDEX "audience_pages_blocks_feature_heading_offset_path_idx" ON "audience_pages_blocks_feature_heading_offset" USING btree ("_path");
  CREATE INDEX "audience_pages_blocks_feature_tabs_tabs_items_order_idx" ON "audience_pages_blocks_feature_tabs_tabs_items" USING btree ("_order");
  CREATE INDEX "audience_pages_blocks_feature_tabs_tabs_items_parent_id_idx" ON "audience_pages_blocks_feature_tabs_tabs_items" USING btree ("_parent_id");
  CREATE INDEX "audience_pages_blocks_feature_tabs_tabs_order_idx" ON "audience_pages_blocks_feature_tabs_tabs" USING btree ("_order");
  CREATE INDEX "audience_pages_blocks_feature_tabs_tabs_parent_id_idx" ON "audience_pages_blocks_feature_tabs_tabs" USING btree ("_parent_id");
  CREATE INDEX "audience_pages_blocks_feature_tabs_tabs_media_idx" ON "audience_pages_blocks_feature_tabs_tabs" USING btree ("media_id");
  CREATE INDEX "audience_pages_blocks_feature_tabs_order_idx" ON "audience_pages_blocks_feature_tabs" USING btree ("_order");
  CREATE INDEX "audience_pages_blocks_feature_tabs_parent_id_idx" ON "audience_pages_blocks_feature_tabs" USING btree ("_parent_id");
  CREATE INDEX "audience_pages_blocks_feature_tabs_path_idx" ON "audience_pages_blocks_feature_tabs" USING btree ("_path");
  CREATE INDEX "audience_pages_blocks_feature_image_caption_order_idx" ON "audience_pages_blocks_feature_image_caption" USING btree ("_order");
  CREATE INDEX "audience_pages_blocks_feature_image_caption_parent_id_idx" ON "audience_pages_blocks_feature_image_caption" USING btree ("_parent_id");
  CREATE INDEX "audience_pages_blocks_feature_image_caption_path_idx" ON "audience_pages_blocks_feature_image_caption" USING btree ("_path");
  CREATE INDEX "audience_pages_blocks_feature_image_caption_media_idx" ON "audience_pages_blocks_feature_image_caption" USING btree ("media_id");
  CREATE INDEX "_audience_pages_v_blocks_feature_statement_grid_cards_order_idx" ON "_audience_pages_v_blocks_feature_statement_grid_cards" USING btree ("_order");
  CREATE INDEX "_audience_pages_v_blocks_feature_statement_grid_cards_parent_id_idx" ON "_audience_pages_v_blocks_feature_statement_grid_cards" USING btree ("_parent_id");
  CREATE INDEX "_audience_pages_v_blocks_feature_statement_grid_cards_me_idx" ON "_audience_pages_v_blocks_feature_statement_grid_cards" USING btree ("media_id");
  CREATE INDEX "_audience_pages_v_blocks_feature_statement_grid_order_idx" ON "_audience_pages_v_blocks_feature_statement_grid" USING btree ("_order");
  CREATE INDEX "_audience_pages_v_blocks_feature_statement_grid_parent_id_idx" ON "_audience_pages_v_blocks_feature_statement_grid" USING btree ("_parent_id");
  CREATE INDEX "_audience_pages_v_blocks_feature_statement_grid_path_idx" ON "_audience_pages_v_blocks_feature_statement_grid" USING btree ("_path");
  CREATE INDEX "_audience_pages_v_blocks_feature_heading_offset_order_idx" ON "_audience_pages_v_blocks_feature_heading_offset" USING btree ("_order");
  CREATE INDEX "_audience_pages_v_blocks_feature_heading_offset_parent_id_idx" ON "_audience_pages_v_blocks_feature_heading_offset" USING btree ("_parent_id");
  CREATE INDEX "_audience_pages_v_blocks_feature_heading_offset_path_idx" ON "_audience_pages_v_blocks_feature_heading_offset" USING btree ("_path");
  CREATE INDEX "_audience_pages_v_blocks_feature_tabs_tabs_items_order_idx" ON "_audience_pages_v_blocks_feature_tabs_tabs_items" USING btree ("_order");
  CREATE INDEX "_audience_pages_v_blocks_feature_tabs_tabs_items_parent_id_idx" ON "_audience_pages_v_blocks_feature_tabs_tabs_items" USING btree ("_parent_id");
  CREATE INDEX "_audience_pages_v_blocks_feature_tabs_tabs_order_idx" ON "_audience_pages_v_blocks_feature_tabs_tabs" USING btree ("_order");
  CREATE INDEX "_audience_pages_v_blocks_feature_tabs_tabs_parent_id_idx" ON "_audience_pages_v_blocks_feature_tabs_tabs" USING btree ("_parent_id");
  CREATE INDEX "_audience_pages_v_blocks_feature_tabs_tabs_media_idx" ON "_audience_pages_v_blocks_feature_tabs_tabs" USING btree ("media_id");
  CREATE INDEX "_audience_pages_v_blocks_feature_tabs_order_idx" ON "_audience_pages_v_blocks_feature_tabs" USING btree ("_order");
  CREATE INDEX "_audience_pages_v_blocks_feature_tabs_parent_id_idx" ON "_audience_pages_v_blocks_feature_tabs" USING btree ("_parent_id");
  CREATE INDEX "_audience_pages_v_blocks_feature_tabs_path_idx" ON "_audience_pages_v_blocks_feature_tabs" USING btree ("_path");
  CREATE INDEX "_audience_pages_v_blocks_feature_image_caption_order_idx" ON "_audience_pages_v_blocks_feature_image_caption" USING btree ("_order");
  CREATE INDEX "_audience_pages_v_blocks_feature_image_caption_parent_id_idx" ON "_audience_pages_v_blocks_feature_image_caption" USING btree ("_parent_id");
  CREATE INDEX "_audience_pages_v_blocks_feature_image_caption_path_idx" ON "_audience_pages_v_blocks_feature_image_caption" USING btree ("_path");
  CREATE INDEX "_audience_pages_v_blocks_feature_image_caption_media_idx" ON "_audience_pages_v_blocks_feature_image_caption" USING btree ("media_id");
  CREATE INDEX "work_pages__order_idx" ON "work_pages" USING btree ("_order");
  CREATE INDEX "_work_pages_v_version_version__order_idx" ON "_work_pages_v" USING btree ("version__order");
  CREATE INDEX "organizations__order_idx" ON "organizations" USING btree ("_order");
  CREATE INDEX "_organizations_v_version_version__order_idx" ON "_organizations_v" USING btree ("version__order");
  CREATE INDEX "projects__order_idx" ON "projects" USING btree ("_order");
  CREATE INDEX "_projects_v_version_version__order_idx" ON "_projects_v" USING btree ("version__order");
  CREATE INDEX "case_studies__order_idx" ON "case_studies" USING btree ("_order");
  CREATE INDEX "_case_studies_v_version_version__order_idx" ON "_case_studies_v" USING btree ("version__order");
  CREATE INDEX "lab_projects__order_idx" ON "lab_projects" USING btree ("_order");
  CREATE INDEX "_lab_projects_v_version_version__order_idx" ON "_lab_projects_v" USING btree ("version__order");
  CREATE INDEX "testimonials__order_idx" ON "testimonials" USING btree ("_order");
  CREATE INDEX "_testimonials_v_version_version__order_idx" ON "_testimonials_v" USING btree ("version__order");
  CREATE INDEX "asset_libraries__order_idx" ON "asset_libraries" USING btree ("_order");
  CREATE INDEX "capabilities__order_idx" ON "capabilities" USING btree ("_order");
  CREATE INDEX "industries__order_idx" ON "industries" USING btree ("_order");
  CREATE INDEX "categories__order_idx" ON "categories" USING btree ("_order");
  CREATE INDEX "audiences__order_idx" ON "audiences" USING btree ("_order");`)

  for (const { table, orderBy } of ORDERABLE_TABLES) {
    const result = await db.execute(sql.raw(`SELECT id FROM "${table}" ORDER BY ${orderBy} ASC`))
    const rows = result.rows as { id: number | string }[]
    if (rows.length === 0) continue
    const keys = generateNKeysBetween(null, null, rows.length)
    for (let i = 0; i < rows.length; i++) {
      await db.execute(
        sql.raw(`UPDATE "${table}" SET "_order" = '${keys[i]}' WHERE id = ${Number(rows[i].id)}`),
      )
    }
  }
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_feature_heading_offset" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_feature_tabs_tabs_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_feature_tabs_tabs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_feature_tabs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_feature_image_caption" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_feature_heading_offset" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_feature_tabs_tabs_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_feature_tabs_tabs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_feature_tabs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_feature_image_caption" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "expertise_pages_blocks_feature_statement_grid_cards" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "expertise_pages_blocks_feature_statement_grid" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "expertise_pages_blocks_feature_heading_offset" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "expertise_pages_blocks_feature_tabs_tabs_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "expertise_pages_blocks_feature_tabs_tabs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "expertise_pages_blocks_feature_tabs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "expertise_pages_blocks_feature_image_caption" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_expertise_pages_v_blocks_feature_statement_grid_cards" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_expertise_pages_v_blocks_feature_statement_grid" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_expertise_pages_v_blocks_feature_heading_offset" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_expertise_pages_v_blocks_feature_tabs_tabs_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_expertise_pages_v_blocks_feature_tabs_tabs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_expertise_pages_v_blocks_feature_tabs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_expertise_pages_v_blocks_feature_image_caption" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "audience_pages_blocks_feature_statement_grid_cards" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "audience_pages_blocks_feature_statement_grid" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "audience_pages_blocks_feature_heading_offset" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "audience_pages_blocks_feature_tabs_tabs_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "audience_pages_blocks_feature_tabs_tabs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "audience_pages_blocks_feature_tabs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "audience_pages_blocks_feature_image_caption" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_audience_pages_v_blocks_feature_statement_grid_cards" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_audience_pages_v_blocks_feature_statement_grid" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_audience_pages_v_blocks_feature_heading_offset" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_audience_pages_v_blocks_feature_tabs_tabs_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_audience_pages_v_blocks_feature_tabs_tabs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_audience_pages_v_blocks_feature_tabs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_audience_pages_v_blocks_feature_image_caption" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "pages_blocks_feature_heading_offset" CASCADE;
  DROP TABLE "pages_blocks_feature_tabs_tabs_items" CASCADE;
  DROP TABLE "pages_blocks_feature_tabs_tabs" CASCADE;
  DROP TABLE "pages_blocks_feature_tabs" CASCADE;
  DROP TABLE "pages_blocks_feature_image_caption" CASCADE;
  DROP TABLE "_pages_v_blocks_feature_heading_offset" CASCADE;
  DROP TABLE "_pages_v_blocks_feature_tabs_tabs_items" CASCADE;
  DROP TABLE "_pages_v_blocks_feature_tabs_tabs" CASCADE;
  DROP TABLE "_pages_v_blocks_feature_tabs" CASCADE;
  DROP TABLE "_pages_v_blocks_feature_image_caption" CASCADE;
  DROP TABLE "expertise_pages_blocks_feature_statement_grid_cards" CASCADE;
  DROP TABLE "expertise_pages_blocks_feature_statement_grid" CASCADE;
  DROP TABLE "expertise_pages_blocks_feature_heading_offset" CASCADE;
  DROP TABLE "expertise_pages_blocks_feature_tabs_tabs_items" CASCADE;
  DROP TABLE "expertise_pages_blocks_feature_tabs_tabs" CASCADE;
  DROP TABLE "expertise_pages_blocks_feature_tabs" CASCADE;
  DROP TABLE "expertise_pages_blocks_feature_image_caption" CASCADE;
  DROP TABLE "_expertise_pages_v_blocks_feature_statement_grid_cards" CASCADE;
  DROP TABLE "_expertise_pages_v_blocks_feature_statement_grid" CASCADE;
  DROP TABLE "_expertise_pages_v_blocks_feature_heading_offset" CASCADE;
  DROP TABLE "_expertise_pages_v_blocks_feature_tabs_tabs_items" CASCADE;
  DROP TABLE "_expertise_pages_v_blocks_feature_tabs_tabs" CASCADE;
  DROP TABLE "_expertise_pages_v_blocks_feature_tabs" CASCADE;
  DROP TABLE "_expertise_pages_v_blocks_feature_image_caption" CASCADE;
  DROP TABLE "audience_pages_blocks_feature_statement_grid_cards" CASCADE;
  DROP TABLE "audience_pages_blocks_feature_statement_grid" CASCADE;
  DROP TABLE "audience_pages_blocks_feature_heading_offset" CASCADE;
  DROP TABLE "audience_pages_blocks_feature_tabs_tabs_items" CASCADE;
  DROP TABLE "audience_pages_blocks_feature_tabs_tabs" CASCADE;
  DROP TABLE "audience_pages_blocks_feature_tabs" CASCADE;
  DROP TABLE "audience_pages_blocks_feature_image_caption" CASCADE;
  DROP TABLE "_audience_pages_v_blocks_feature_statement_grid_cards" CASCADE;
  DROP TABLE "_audience_pages_v_blocks_feature_statement_grid" CASCADE;
  DROP TABLE "_audience_pages_v_blocks_feature_heading_offset" CASCADE;
  DROP TABLE "_audience_pages_v_blocks_feature_tabs_tabs_items" CASCADE;
  DROP TABLE "_audience_pages_v_blocks_feature_tabs_tabs" CASCADE;
  DROP TABLE "_audience_pages_v_blocks_feature_tabs" CASCADE;
  DROP TABLE "_audience_pages_v_blocks_feature_image_caption" CASCADE;
  DROP INDEX "work_pages__order_idx";
  DROP INDEX "_work_pages_v_version_version__order_idx";
  DROP INDEX "organizations__order_idx";
  DROP INDEX "_organizations_v_version_version__order_idx";
  DROP INDEX "projects__order_idx";
  DROP INDEX "_projects_v_version_version__order_idx";
  DROP INDEX "case_studies__order_idx";
  DROP INDEX "_case_studies_v_version_version__order_idx";
  DROP INDEX "lab_projects__order_idx";
  DROP INDEX "_lab_projects_v_version_version__order_idx";
  DROP INDEX "testimonials__order_idx";
  DROP INDEX "_testimonials_v_version_version__order_idx";
  DROP INDEX "asset_libraries__order_idx";
  DROP INDEX "capabilities__order_idx";
  DROP INDEX "industries__order_idx";
  DROP INDEX "categories__order_idx";
  DROP INDEX "audiences__order_idx";
  ALTER TABLE "work_pages" DROP COLUMN "_order";
  ALTER TABLE "_work_pages_v" DROP COLUMN "version__order";
  ALTER TABLE "organizations" DROP COLUMN "_order";
  ALTER TABLE "_organizations_v" DROP COLUMN "version__order";
  ALTER TABLE "projects" DROP COLUMN "_order";
  ALTER TABLE "_projects_v" DROP COLUMN "version__order";
  ALTER TABLE "case_studies" DROP COLUMN "_order";
  ALTER TABLE "_case_studies_v" DROP COLUMN "version__order";
  ALTER TABLE "lab_projects" DROP COLUMN "_order";
  ALTER TABLE "_lab_projects_v" DROP COLUMN "version__order";
  ALTER TABLE "testimonials" DROP COLUMN "_order";
  ALTER TABLE "_testimonials_v" DROP COLUMN "version__order";
  ALTER TABLE "asset_libraries" DROP COLUMN "_order";
  ALTER TABLE "capabilities" DROP COLUMN "_order";
  ALTER TABLE "industries" DROP COLUMN "_order";
  ALTER TABLE "categories" DROP COLUMN "_order";
  ALTER TABLE "audiences" DROP COLUMN "_order";`)
}
