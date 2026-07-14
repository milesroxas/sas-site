import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_media_block_size" AS ENUM('full', 'inset', 'small');
  CREATE TYPE "public"."enum__pages_v_blocks_media_block_size" AS ENUM('full', 'inset', 'small');
  CREATE TYPE "public"."enum_expertise_pages_blocks_media_block_size" AS ENUM('full', 'inset', 'small');
  CREATE TYPE "public"."enum__expertise_pages_v_blocks_media_block_size" AS ENUM('full', 'inset', 'small');
  CREATE TYPE "public"."enum_audience_pages_blocks_media_block_size" AS ENUM('full', 'inset', 'small');
  CREATE TYPE "public"."enum__audience_pages_v_blocks_media_block_size" AS ENUM('full', 'inset', 'small');
  ALTER TABLE "pages_blocks_media_block" ADD COLUMN "size" "enum_pages_blocks_media_block_size" DEFAULT 'full';
  ALTER TABLE "pages_blocks_media_block" ADD COLUMN "caption_override" jsonb;
  ALTER TABLE "_pages_v_blocks_media_block" ADD COLUMN "size" "enum__pages_v_blocks_media_block_size" DEFAULT 'full';
  ALTER TABLE "_pages_v_blocks_media_block" ADD COLUMN "caption_override" jsonb;
  ALTER TABLE "expertise_pages_blocks_media_block" ADD COLUMN "size" "enum_expertise_pages_blocks_media_block_size" DEFAULT 'full';
  ALTER TABLE "expertise_pages_blocks_media_block" ADD COLUMN "caption_override" jsonb;
  ALTER TABLE "_expertise_pages_v_blocks_media_block" ADD COLUMN "size" "enum__expertise_pages_v_blocks_media_block_size" DEFAULT 'full';
  ALTER TABLE "_expertise_pages_v_blocks_media_block" ADD COLUMN "caption_override" jsonb;
  ALTER TABLE "audience_pages_blocks_media_block" ADD COLUMN "size" "enum_audience_pages_blocks_media_block_size" DEFAULT 'full';
  ALTER TABLE "audience_pages_blocks_media_block" ADD COLUMN "caption_override" jsonb;
  ALTER TABLE "_audience_pages_v_blocks_media_block" ADD COLUMN "size" "enum__audience_pages_v_blocks_media_block_size" DEFAULT 'full';
  ALTER TABLE "_audience_pages_v_blocks_media_block" ADD COLUMN "caption_override" jsonb;
  ALTER TABLE "search_rels" ADD COLUMN "pages_id" integer;
  ALTER TABLE "search_rels" ADD COLUMN "expertise_pages_id" integer;
  ALTER TABLE "search_rels" ADD COLUMN "audience_pages_id" integer;
  ALTER TABLE "search_rels" ADD COLUMN "work_pages_id" integer;
  ALTER TABLE "search_rels" ADD COLUMN "lab_pages_id" integer;
  ALTER TABLE "search_rels" ADD CONSTRAINT "search_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "search_rels" ADD CONSTRAINT "search_rels_expertise_pages_fk" FOREIGN KEY ("expertise_pages_id") REFERENCES "public"."expertise_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "search_rels" ADD CONSTRAINT "search_rels_audience_pages_fk" FOREIGN KEY ("audience_pages_id") REFERENCES "public"."audience_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "search_rels" ADD CONSTRAINT "search_rels_work_pages_fk" FOREIGN KEY ("work_pages_id") REFERENCES "public"."work_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "search_rels" ADD CONSTRAINT "search_rels_lab_pages_fk" FOREIGN KEY ("lab_pages_id") REFERENCES "public"."lab_pages"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "search_rels_pages_id_idx" ON "search_rels" USING btree ("pages_id");
  CREATE INDEX "search_rels_expertise_pages_id_idx" ON "search_rels" USING btree ("expertise_pages_id");
  CREATE INDEX "search_rels_audience_pages_id_idx" ON "search_rels" USING btree ("audience_pages_id");
  CREATE INDEX "search_rels_work_pages_id_idx" ON "search_rels" USING btree ("work_pages_id");
  CREATE INDEX "search_rels_lab_pages_id_idx" ON "search_rels" USING btree ("lab_pages_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "search_rels" DROP CONSTRAINT "search_rels_pages_fk";
  
  ALTER TABLE "search_rels" DROP CONSTRAINT "search_rels_expertise_pages_fk";
  
  ALTER TABLE "search_rels" DROP CONSTRAINT "search_rels_audience_pages_fk";
  
  ALTER TABLE "search_rels" DROP CONSTRAINT "search_rels_work_pages_fk";
  
  ALTER TABLE "search_rels" DROP CONSTRAINT "search_rels_lab_pages_fk";
  
  DROP INDEX "search_rels_pages_id_idx";
  DROP INDEX "search_rels_expertise_pages_id_idx";
  DROP INDEX "search_rels_audience_pages_id_idx";
  DROP INDEX "search_rels_work_pages_id_idx";
  DROP INDEX "search_rels_lab_pages_id_idx";
  ALTER TABLE "pages_blocks_media_block" DROP COLUMN "size";
  ALTER TABLE "pages_blocks_media_block" DROP COLUMN "caption_override";
  ALTER TABLE "_pages_v_blocks_media_block" DROP COLUMN "size";
  ALTER TABLE "_pages_v_blocks_media_block" DROP COLUMN "caption_override";
  ALTER TABLE "expertise_pages_blocks_media_block" DROP COLUMN "size";
  ALTER TABLE "expertise_pages_blocks_media_block" DROP COLUMN "caption_override";
  ALTER TABLE "_expertise_pages_v_blocks_media_block" DROP COLUMN "size";
  ALTER TABLE "_expertise_pages_v_blocks_media_block" DROP COLUMN "caption_override";
  ALTER TABLE "audience_pages_blocks_media_block" DROP COLUMN "size";
  ALTER TABLE "audience_pages_blocks_media_block" DROP COLUMN "caption_override";
  ALTER TABLE "_audience_pages_v_blocks_media_block" DROP COLUMN "size";
  ALTER TABLE "_audience_pages_v_blocks_media_block" DROP COLUMN "caption_override";
  ALTER TABLE "search_rels" DROP COLUMN "pages_id";
  ALTER TABLE "search_rels" DROP COLUMN "expertise_pages_id";
  ALTER TABLE "search_rels" DROP COLUMN "audience_pages_id";
  ALTER TABLE "search_rels" DROP COLUMN "work_pages_id";
  ALTER TABLE "search_rels" DROP COLUMN "lab_pages_id";
  DROP TYPE "public"."enum_pages_blocks_media_block_size";
  DROP TYPE "public"."enum__pages_v_blocks_media_block_size";
  DROP TYPE "public"."enum_expertise_pages_blocks_media_block_size";
  DROP TYPE "public"."enum__expertise_pages_v_blocks_media_block_size";
  DROP TYPE "public"."enum_audience_pages_blocks_media_block_size";
  DROP TYPE "public"."enum__audience_pages_v_blocks_media_block_size";`)
}
