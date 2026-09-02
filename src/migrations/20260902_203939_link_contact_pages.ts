import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_rels" ADD COLUMN "contact_pages_id" integer;
  ALTER TABLE "_pages_v_rels" ADD COLUMN "contact_pages_id" integer;
  ALTER TABLE "posts_rels" ADD COLUMN "contact_pages_id" integer;
  ALTER TABLE "_posts_v_rels" ADD COLUMN "contact_pages_id" integer;
  ALTER TABLE "work_pages_rels" ADD COLUMN "contact_pages_id" integer;
  ALTER TABLE "_work_pages_v_rels" ADD COLUMN "contact_pages_id" integer;
  ALTER TABLE "expertise_pages_rels" ADD COLUMN "contact_pages_id" integer;
  ALTER TABLE "_expertise_pages_v_rels" ADD COLUMN "contact_pages_id" integer;
  ALTER TABLE "audience_pages_rels" ADD COLUMN "contact_pages_id" integer;
  ALTER TABLE "_audience_pages_v_rels" ADD COLUMN "contact_pages_id" integer;
  ALTER TABLE "home_rels" ADD COLUMN "contact_pages_id" integer;
  ALTER TABLE "_home_v_rels" ADD COLUMN "contact_pages_id" integer;
  ALTER TABLE "insights_index_rels" ADD COLUMN "contact_pages_id" integer;
  ALTER TABLE "_insights_index_v_rels" ADD COLUMN "contact_pages_id" integer;
  ALTER TABLE "works_index_rels" ADD COLUMN "contact_pages_id" integer;
  ALTER TABLE "_works_index_v_rels" ADD COLUMN "contact_pages_id" integer;
  ALTER TABLE "header_rels" ADD COLUMN "contact_pages_id" integer;
  ALTER TABLE "footer_rels" ADD COLUMN "contact_pages_id" integer;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_contact_pages_fk" FOREIGN KEY ("contact_pages_id") REFERENCES "public"."contact_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_contact_pages_fk" FOREIGN KEY ("contact_pages_id") REFERENCES "public"."contact_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_contact_pages_fk" FOREIGN KEY ("contact_pages_id") REFERENCES "public"."contact_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_rels" ADD CONSTRAINT "_posts_v_rels_contact_pages_fk" FOREIGN KEY ("contact_pages_id") REFERENCES "public"."contact_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "work_pages_rels" ADD CONSTRAINT "work_pages_rels_contact_pages_fk" FOREIGN KEY ("contact_pages_id") REFERENCES "public"."contact_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_work_pages_v_rels" ADD CONSTRAINT "_work_pages_v_rels_contact_pages_fk" FOREIGN KEY ("contact_pages_id") REFERENCES "public"."contact_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "expertise_pages_rels" ADD CONSTRAINT "expertise_pages_rels_contact_pages_fk" FOREIGN KEY ("contact_pages_id") REFERENCES "public"."contact_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_expertise_pages_v_rels" ADD CONSTRAINT "_expertise_pages_v_rels_contact_pages_fk" FOREIGN KEY ("contact_pages_id") REFERENCES "public"."contact_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "audience_pages_rels" ADD CONSTRAINT "audience_pages_rels_contact_pages_fk" FOREIGN KEY ("contact_pages_id") REFERENCES "public"."contact_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_audience_pages_v_rels" ADD CONSTRAINT "_audience_pages_v_rels_contact_pages_fk" FOREIGN KEY ("contact_pages_id") REFERENCES "public"."contact_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_rels" ADD CONSTRAINT "home_rels_contact_pages_fk" FOREIGN KEY ("contact_pages_id") REFERENCES "public"."contact_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_rels" ADD CONSTRAINT "_home_v_rels_contact_pages_fk" FOREIGN KEY ("contact_pages_id") REFERENCES "public"."contact_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "insights_index_rels" ADD CONSTRAINT "insights_index_rels_contact_pages_fk" FOREIGN KEY ("contact_pages_id") REFERENCES "public"."contact_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_insights_index_v_rels" ADD CONSTRAINT "_insights_index_v_rels_contact_pages_fk" FOREIGN KEY ("contact_pages_id") REFERENCES "public"."contact_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "works_index_rels" ADD CONSTRAINT "works_index_rels_contact_pages_fk" FOREIGN KEY ("contact_pages_id") REFERENCES "public"."contact_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_works_index_v_rels" ADD CONSTRAINT "_works_index_v_rels_contact_pages_fk" FOREIGN KEY ("contact_pages_id") REFERENCES "public"."contact_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_rels" ADD CONSTRAINT "header_rels_contact_pages_fk" FOREIGN KEY ("contact_pages_id") REFERENCES "public"."contact_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_rels" ADD CONSTRAINT "footer_rels_contact_pages_fk" FOREIGN KEY ("contact_pages_id") REFERENCES "public"."contact_pages"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_rels_contact_pages_id_idx" ON "pages_rels" USING btree ("contact_pages_id");
  CREATE INDEX "_pages_v_rels_contact_pages_id_idx" ON "_pages_v_rels" USING btree ("contact_pages_id");
  CREATE INDEX "posts_rels_contact_pages_id_idx" ON "posts_rels" USING btree ("contact_pages_id");
  CREATE INDEX "_posts_v_rels_contact_pages_id_idx" ON "_posts_v_rels" USING btree ("contact_pages_id");
  CREATE INDEX "work_pages_rels_contact_pages_id_idx" ON "work_pages_rels" USING btree ("contact_pages_id");
  CREATE INDEX "_work_pages_v_rels_contact_pages_id_idx" ON "_work_pages_v_rels" USING btree ("contact_pages_id");
  CREATE INDEX "expertise_pages_rels_contact_pages_id_idx" ON "expertise_pages_rels" USING btree ("contact_pages_id");
  CREATE INDEX "_expertise_pages_v_rels_contact_pages_id_idx" ON "_expertise_pages_v_rels" USING btree ("contact_pages_id");
  CREATE INDEX "audience_pages_rels_contact_pages_id_idx" ON "audience_pages_rels" USING btree ("contact_pages_id");
  CREATE INDEX "_audience_pages_v_rels_contact_pages_id_idx" ON "_audience_pages_v_rels" USING btree ("contact_pages_id");
  CREATE INDEX "home_rels_contact_pages_id_idx" ON "home_rels" USING btree ("contact_pages_id");
  CREATE INDEX "_home_v_rels_contact_pages_id_idx" ON "_home_v_rels" USING btree ("contact_pages_id");
  CREATE INDEX "insights_index_rels_contact_pages_id_idx" ON "insights_index_rels" USING btree ("contact_pages_id");
  CREATE INDEX "_insights_index_v_rels_contact_pages_id_idx" ON "_insights_index_v_rels" USING btree ("contact_pages_id");
  CREATE INDEX "works_index_rels_contact_pages_id_idx" ON "works_index_rels" USING btree ("contact_pages_id");
  CREATE INDEX "_works_index_v_rels_contact_pages_id_idx" ON "_works_index_v_rels" USING btree ("contact_pages_id");
  CREATE INDEX "header_rels_contact_pages_id_idx" ON "header_rels" USING btree ("contact_pages_id");
  CREATE INDEX "footer_rels_contact_pages_id_idx" ON "footer_rels" USING btree ("contact_pages_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_rels" DROP CONSTRAINT "pages_rels_contact_pages_fk";
  
  ALTER TABLE "_pages_v_rels" DROP CONSTRAINT "_pages_v_rels_contact_pages_fk";
  
  ALTER TABLE "posts_rels" DROP CONSTRAINT "posts_rels_contact_pages_fk";
  
  ALTER TABLE "_posts_v_rels" DROP CONSTRAINT "_posts_v_rels_contact_pages_fk";
  
  ALTER TABLE "work_pages_rels" DROP CONSTRAINT "work_pages_rels_contact_pages_fk";
  
  ALTER TABLE "_work_pages_v_rels" DROP CONSTRAINT "_work_pages_v_rels_contact_pages_fk";
  
  ALTER TABLE "expertise_pages_rels" DROP CONSTRAINT "expertise_pages_rels_contact_pages_fk";
  
  ALTER TABLE "_expertise_pages_v_rels" DROP CONSTRAINT "_expertise_pages_v_rels_contact_pages_fk";
  
  ALTER TABLE "audience_pages_rels" DROP CONSTRAINT "audience_pages_rels_contact_pages_fk";
  
  ALTER TABLE "_audience_pages_v_rels" DROP CONSTRAINT "_audience_pages_v_rels_contact_pages_fk";
  
  ALTER TABLE "home_rels" DROP CONSTRAINT "home_rels_contact_pages_fk";
  
  ALTER TABLE "_home_v_rels" DROP CONSTRAINT "_home_v_rels_contact_pages_fk";
  
  ALTER TABLE "insights_index_rels" DROP CONSTRAINT "insights_index_rels_contact_pages_fk";
  
  ALTER TABLE "_insights_index_v_rels" DROP CONSTRAINT "_insights_index_v_rels_contact_pages_fk";
  
  ALTER TABLE "works_index_rels" DROP CONSTRAINT "works_index_rels_contact_pages_fk";
  
  ALTER TABLE "_works_index_v_rels" DROP CONSTRAINT "_works_index_v_rels_contact_pages_fk";
  
  ALTER TABLE "header_rels" DROP CONSTRAINT "header_rels_contact_pages_fk";
  
  ALTER TABLE "footer_rels" DROP CONSTRAINT "footer_rels_contact_pages_fk";
  
  DROP INDEX "pages_rels_contact_pages_id_idx";
  DROP INDEX "_pages_v_rels_contact_pages_id_idx";
  DROP INDEX "posts_rels_contact_pages_id_idx";
  DROP INDEX "_posts_v_rels_contact_pages_id_idx";
  DROP INDEX "work_pages_rels_contact_pages_id_idx";
  DROP INDEX "_work_pages_v_rels_contact_pages_id_idx";
  DROP INDEX "expertise_pages_rels_contact_pages_id_idx";
  DROP INDEX "_expertise_pages_v_rels_contact_pages_id_idx";
  DROP INDEX "audience_pages_rels_contact_pages_id_idx";
  DROP INDEX "_audience_pages_v_rels_contact_pages_id_idx";
  DROP INDEX "home_rels_contact_pages_id_idx";
  DROP INDEX "_home_v_rels_contact_pages_id_idx";
  DROP INDEX "insights_index_rels_contact_pages_id_idx";
  DROP INDEX "_insights_index_v_rels_contact_pages_id_idx";
  DROP INDEX "works_index_rels_contact_pages_id_idx";
  DROP INDEX "_works_index_v_rels_contact_pages_id_idx";
  DROP INDEX "header_rels_contact_pages_id_idx";
  DROP INDEX "footer_rels_contact_pages_id_idx";
  ALTER TABLE "pages_rels" DROP COLUMN "contact_pages_id";
  ALTER TABLE "_pages_v_rels" DROP COLUMN "contact_pages_id";
  ALTER TABLE "posts_rels" DROP COLUMN "contact_pages_id";
  ALTER TABLE "_posts_v_rels" DROP COLUMN "contact_pages_id";
  ALTER TABLE "work_pages_rels" DROP COLUMN "contact_pages_id";
  ALTER TABLE "_work_pages_v_rels" DROP COLUMN "contact_pages_id";
  ALTER TABLE "expertise_pages_rels" DROP COLUMN "contact_pages_id";
  ALTER TABLE "_expertise_pages_v_rels" DROP COLUMN "contact_pages_id";
  ALTER TABLE "audience_pages_rels" DROP COLUMN "contact_pages_id";
  ALTER TABLE "_audience_pages_v_rels" DROP COLUMN "contact_pages_id";
  ALTER TABLE "home_rels" DROP COLUMN "contact_pages_id";
  ALTER TABLE "_home_v_rels" DROP COLUMN "contact_pages_id";
  ALTER TABLE "insights_index_rels" DROP COLUMN "contact_pages_id";
  ALTER TABLE "_insights_index_v_rels" DROP COLUMN "contact_pages_id";
  ALTER TABLE "works_index_rels" DROP COLUMN "contact_pages_id";
  ALTER TABLE "_works_index_v_rels" DROP COLUMN "contact_pages_id";
  ALTER TABLE "header_rels" DROP COLUMN "contact_pages_id";
  ALTER TABLE "footer_rels" DROP COLUMN "contact_pages_id";`)
}
