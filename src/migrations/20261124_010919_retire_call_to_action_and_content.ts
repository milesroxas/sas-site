import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'


/**
 * Every table this migration drops: Call to Action and Content. In production
 * only about-us (Content) and audience page 4 (Call to Action) held them, and
 * both moved into Sections as drafts on 2026-11-23 (Rich text, CTA band).
 * Publish both drafts before deploying this: until then the guard below finds
 * their live rows and refuses, rolling back, so nothing is dropped. Older
 * version history goes with the tables, as decided.
 */
export const DROPPED_TABLES = [
  '_audience_pages_v_blocks_content',
  '_audience_pages_v_blocks_content_columns',
  '_audience_pages_v_blocks_cta',
  '_audience_pages_v_blocks_cta_links',
  '_expertise_pages_v_blocks_content',
  '_expertise_pages_v_blocks_content_columns',
  '_expertise_pages_v_blocks_cta',
  '_expertise_pages_v_blocks_cta_links',
  '_lab_pages_v_blocks_content',
  '_lab_pages_v_blocks_content_columns',
  '_pages_v_blocks_content',
  '_pages_v_blocks_content_columns',
  '_pages_v_blocks_cta',
  '_pages_v_blocks_cta_links',
  '_posts_v_blocks_content',
  '_posts_v_blocks_content_columns',
  '_work_pages_v_blocks_content',
  '_work_pages_v_blocks_content_columns',
  'audience_pages_blocks_content',
  'audience_pages_blocks_content_columns',
  'audience_pages_blocks_cta',
  'audience_pages_blocks_cta_links',
  'expertise_pages_blocks_content',
  'expertise_pages_blocks_content_columns',
  'expertise_pages_blocks_cta',
  'expertise_pages_blocks_cta_links',
  'lab_pages_blocks_content',
  'lab_pages_blocks_content_columns',
  'pages_blocks_content',
  'pages_blocks_content_columns',
  'pages_blocks_cta',
  'pages_blocks_cta_links',
  'posts_blocks_content',
  'posts_blocks_content_columns',
  'work_pages_blocks_content',
  'work_pages_blocks_content_columns',
] as const

const unquote = (name: string) => name.replace(/"/g, '')

/**
 * Raises, rolling the whole migration back, when a dropped table still holds
 * content that matters: any row of a live table, or any row under a version
 * row marked `latest` (a document's current draft or published version). A
 * block row reaches its document through `_parent_id`; the chain is read from
 * the schema's own foreign keys, so nested block and array tables are checked
 * through their parents.
 */
async function assertNoLiveOrCurrentRows(db: MigrateUpArgs['db']) {
  const fks = (await db.execute(sql`
    SELECT c.conrelid::regclass::text AS child, c.confrelid::regclass::text AS parent
    FROM pg_constraint c
    JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = ANY (c.conkey)
    WHERE c.contype = 'f' AND a.attname = '_parent_id'
  `)).rows as Array<{ child: string; parent: string }>
  const parentOf = new Map(fks.map((fk) => [unquote(fk.child), unquote(fk.parent)]))
  const problems: string[] = []
  for (const table of DROPPED_TABLES) {
    const exists = (await db.execute(sql`SELECT to_regclass(${`public."${table}"`}) AS t`)).rows[0] as { t: string | null }
    if (!exists.t) continue
    const chain: string[] = [table]
    for (let next = parentOf.get(table); next; next = parentOf.get(next)) chain.push(next)
    const root = chain[chain.length - 1] as string
    const joins = chain
      .slice(1)
      .map((parent, i) => `JOIN "${parent}" t${i + 1} ON t${i + 1}.id = t${i}._parent_id`)
      .join(' ')
    const current = root.startsWith('_') && root.endsWith('_v') ? `WHERE t${chain.length - 1}.latest = true` : ''
    const { rows } = await db.execute(sql.raw(`SELECT count(*)::int AS n FROM "${table}" t0 ${joins} ${current}`))
    const n = (rows[0] as { n: number }).n
    if (n > 0) problems.push(`${table} (${n} ${current ? 'current-version' : 'live'} rows)`)
  }
  if (problems.length) {
    throw new Error(
      `retire_call_to_action_and_content: live or current content would be lost, nothing was dropped: ${problems.join(', ')}`,
    )
  }
}

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await assertNoLiveOrCurrentRows(db)
  await db.execute(sql`
   DROP TABLE "pages_blocks_content_columns" CASCADE;
  DROP TABLE "pages_blocks_content" CASCADE;
  DROP TABLE "pages_blocks_cta_links" CASCADE;
  DROP TABLE "pages_blocks_cta" CASCADE;
  DROP TABLE "_pages_v_blocks_content_columns" CASCADE;
  DROP TABLE "_pages_v_blocks_content" CASCADE;
  DROP TABLE "_pages_v_blocks_cta_links" CASCADE;
  DROP TABLE "_pages_v_blocks_cta" CASCADE;
  DROP TABLE "posts_blocks_content_columns" CASCADE;
  DROP TABLE "posts_blocks_content" CASCADE;
  DROP TABLE "_posts_v_blocks_content_columns" CASCADE;
  DROP TABLE "_posts_v_blocks_content" CASCADE;
  DROP TABLE "work_pages_blocks_content_columns" CASCADE;
  DROP TABLE "work_pages_blocks_content" CASCADE;
  DROP TABLE "_work_pages_v_blocks_content_columns" CASCADE;
  DROP TABLE "_work_pages_v_blocks_content" CASCADE;
  DROP TABLE "lab_pages_blocks_content_columns" CASCADE;
  DROP TABLE "lab_pages_blocks_content" CASCADE;
  DROP TABLE "_lab_pages_v_blocks_content_columns" CASCADE;
  DROP TABLE "_lab_pages_v_blocks_content" CASCADE;
  DROP TABLE "expertise_pages_blocks_content_columns" CASCADE;
  DROP TABLE "expertise_pages_blocks_content" CASCADE;
  DROP TABLE "expertise_pages_blocks_cta_links" CASCADE;
  DROP TABLE "expertise_pages_blocks_cta" CASCADE;
  DROP TABLE "_expertise_pages_v_blocks_content_columns" CASCADE;
  DROP TABLE "_expertise_pages_v_blocks_content" CASCADE;
  DROP TABLE "_expertise_pages_v_blocks_cta_links" CASCADE;
  DROP TABLE "_expertise_pages_v_blocks_cta" CASCADE;
  DROP TABLE "audience_pages_blocks_content_columns" CASCADE;
  DROP TABLE "audience_pages_blocks_content" CASCADE;
  DROP TABLE "audience_pages_blocks_cta_links" CASCADE;
  DROP TABLE "audience_pages_blocks_cta" CASCADE;
  DROP TABLE "_audience_pages_v_blocks_content_columns" CASCADE;
  DROP TABLE "_audience_pages_v_blocks_content" CASCADE;
  DROP TABLE "_audience_pages_v_blocks_cta_links" CASCADE;
  DROP TABLE "_audience_pages_v_blocks_cta" CASCADE;
  DROP TYPE "public"."enum_pages_blocks_content_columns_size";
  DROP TYPE "public"."enum_pages_blocks_content_columns_link_type";
  DROP TYPE "public"."enum_pages_blocks_content_columns_link_site_page";
  DROP TYPE "public"."enum_pages_blocks_content_columns_link_appearance";
  DROP TYPE "public"."enum_pages_blocks_content_theme";
  DROP TYPE "public"."enum_pages_blocks_cta_links_link_type";
  DROP TYPE "public"."enum_pages_blocks_cta_links_link_site_page";
  DROP TYPE "public"."enum_pages_blocks_cta_links_link_appearance";
  DROP TYPE "public"."enum_pages_blocks_cta_theme";
  DROP TYPE "public"."enum__pages_v_blocks_content_columns_size";
  DROP TYPE "public"."enum__pages_v_blocks_content_columns_link_type";
  DROP TYPE "public"."enum__pages_v_blocks_content_columns_link_site_page";
  DROP TYPE "public"."enum__pages_v_blocks_content_columns_link_appearance";
  DROP TYPE "public"."enum__pages_v_blocks_content_theme";
  DROP TYPE "public"."enum__pages_v_blocks_cta_links_link_type";
  DROP TYPE "public"."enum__pages_v_blocks_cta_links_link_site_page";
  DROP TYPE "public"."enum__pages_v_blocks_cta_links_link_appearance";
  DROP TYPE "public"."enum__pages_v_blocks_cta_theme";
  DROP TYPE "public"."enum_posts_blocks_content_columns_size";
  DROP TYPE "public"."enum_posts_blocks_content_columns_link_type";
  DROP TYPE "public"."enum_posts_blocks_content_columns_link_site_page";
  DROP TYPE "public"."enum_posts_blocks_content_columns_link_appearance";
  DROP TYPE "public"."enum_posts_blocks_content_theme";
  DROP TYPE "public"."enum__posts_v_blocks_content_columns_size";
  DROP TYPE "public"."enum__posts_v_blocks_content_columns_link_type";
  DROP TYPE "public"."enum__posts_v_blocks_content_columns_link_site_page";
  DROP TYPE "public"."enum__posts_v_blocks_content_columns_link_appearance";
  DROP TYPE "public"."enum__posts_v_blocks_content_theme";
  DROP TYPE "public"."enum_work_pages_blocks_content_columns_size";
  DROP TYPE "public"."enum_work_pages_blocks_content_columns_link_type";
  DROP TYPE "public"."enum_work_pages_blocks_content_columns_link_site_page";
  DROP TYPE "public"."enum_work_pages_blocks_content_columns_link_appearance";
  DROP TYPE "public"."enum_work_pages_blocks_content_theme";
  DROP TYPE "public"."enum__work_pages_v_blocks_content_columns_size";
  DROP TYPE "public"."enum__work_pages_v_blocks_content_columns_link_type";
  DROP TYPE "public"."enum__work_pages_v_blocks_content_columns_link_site_page";
  DROP TYPE "public"."enum__work_pages_v_blocks_content_columns_link_appearance";
  DROP TYPE "public"."enum__work_pages_v_blocks_content_theme";
  DROP TYPE "public"."enum_lab_pages_blocks_content_columns_size";
  DROP TYPE "public"."enum_lab_pages_blocks_content_columns_link_type";
  DROP TYPE "public"."enum_lab_pages_blocks_content_columns_link_site_page";
  DROP TYPE "public"."enum_lab_pages_blocks_content_columns_link_appearance";
  DROP TYPE "public"."enum_lab_pages_blocks_content_theme";
  DROP TYPE "public"."enum__lab_pages_v_blocks_content_columns_size";
  DROP TYPE "public"."enum__lab_pages_v_blocks_content_columns_link_type";
  DROP TYPE "public"."enum__lab_pages_v_blocks_content_columns_link_site_page";
  DROP TYPE "public"."enum__lab_pages_v_blocks_content_columns_link_appearance";
  DROP TYPE "public"."enum__lab_pages_v_blocks_content_theme";
  DROP TYPE "public"."enum_expertise_pages_blocks_content_columns_size";
  DROP TYPE "public"."enum_expertise_pages_blocks_content_columns_link_type";
  DROP TYPE "public"."enum_expertise_pages_blocks_content_columns_link_site_page";
  DROP TYPE "public"."enum_expertise_pages_blocks_content_columns_link_appearance";
  DROP TYPE "public"."enum_expertise_pages_blocks_content_theme";
  DROP TYPE "public"."enum_expertise_pages_blocks_cta_links_link_type";
  DROP TYPE "public"."enum_expertise_pages_blocks_cta_links_link_site_page";
  DROP TYPE "public"."enum_expertise_pages_blocks_cta_links_link_appearance";
  DROP TYPE "public"."enum_expertise_pages_blocks_cta_theme";
  DROP TYPE "public"."enum__expertise_pages_v_blocks_content_columns_size";
  DROP TYPE "public"."enum__expertise_pages_v_blocks_content_columns_link_type";
  DROP TYPE "public"."enum__expertise_pages_v_blocks_content_columns_link_site_page";
  DROP TYPE "public"."enum__expertise_pages_v_blocks_content_columns_link_appearance";
  DROP TYPE "public"."enum__expertise_pages_v_blocks_content_theme";
  DROP TYPE "public"."enum__expertise_pages_v_blocks_cta_links_link_type";
  DROP TYPE "public"."enum__expertise_pages_v_blocks_cta_links_link_site_page";
  DROP TYPE "public"."enum__expertise_pages_v_blocks_cta_links_link_appearance";
  DROP TYPE "public"."enum__expertise_pages_v_blocks_cta_theme";
  DROP TYPE "public"."enum_audience_pages_blocks_content_columns_size";
  DROP TYPE "public"."enum_audience_pages_blocks_content_columns_link_type";
  DROP TYPE "public"."enum_audience_pages_blocks_content_columns_link_site_page";
  DROP TYPE "public"."enum_audience_pages_blocks_content_columns_link_appearance";
  DROP TYPE "public"."enum_audience_pages_blocks_content_theme";
  DROP TYPE "public"."enum_audience_pages_blocks_cta_links_link_type";
  DROP TYPE "public"."enum_audience_pages_blocks_cta_links_link_site_page";
  DROP TYPE "public"."enum_audience_pages_blocks_cta_links_link_appearance";
  DROP TYPE "public"."enum_audience_pages_blocks_cta_theme";
  DROP TYPE "public"."enum__audience_pages_v_blocks_content_columns_size";
  DROP TYPE "public"."enum__audience_pages_v_blocks_content_columns_link_type";
  DROP TYPE "public"."enum__audience_pages_v_blocks_content_columns_link_site_page";
  DROP TYPE "public"."enum__audience_pages_v_blocks_content_columns_link_appearance";
  DROP TYPE "public"."enum__audience_pages_v_blocks_content_theme";
  DROP TYPE "public"."enum__audience_pages_v_blocks_cta_links_link_type";
  DROP TYPE "public"."enum__audience_pages_v_blocks_cta_links_link_site_page";
  DROP TYPE "public"."enum__audience_pages_v_blocks_cta_links_link_appearance";
  DROP TYPE "public"."enum__audience_pages_v_blocks_cta_theme";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_content_columns_size" AS ENUM('oneThird', 'half', 'twoThirds', 'full');
  CREATE TYPE "public"."enum_pages_blocks_content_columns_link_type" AS ENUM('reference', 'site', 'custom');
  CREATE TYPE "public"."enum_pages_blocks_content_columns_link_site_page" AS ENUM('home', 'works-index', 'insights-index', 'lab-index');
  CREATE TYPE "public"."enum_pages_blocks_content_columns_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum_pages_blocks_content_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum_pages_blocks_cta_links_link_type" AS ENUM('reference', 'site', 'custom');
  CREATE TYPE "public"."enum_pages_blocks_cta_links_link_site_page" AS ENUM('home', 'works-index', 'insights-index', 'lab-index');
  CREATE TYPE "public"."enum_pages_blocks_cta_links_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum_pages_blocks_cta_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum__pages_v_blocks_content_columns_size" AS ENUM('oneThird', 'half', 'twoThirds', 'full');
  CREATE TYPE "public"."enum__pages_v_blocks_content_columns_link_type" AS ENUM('reference', 'site', 'custom');
  CREATE TYPE "public"."enum__pages_v_blocks_content_columns_link_site_page" AS ENUM('home', 'works-index', 'insights-index', 'lab-index');
  CREATE TYPE "public"."enum__pages_v_blocks_content_columns_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum__pages_v_blocks_content_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum__pages_v_blocks_cta_links_link_type" AS ENUM('reference', 'site', 'custom');
  CREATE TYPE "public"."enum__pages_v_blocks_cta_links_link_site_page" AS ENUM('home', 'works-index', 'insights-index', 'lab-index');
  CREATE TYPE "public"."enum__pages_v_blocks_cta_links_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum__pages_v_blocks_cta_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum_posts_blocks_content_columns_size" AS ENUM('oneThird', 'half', 'twoThirds', 'full');
  CREATE TYPE "public"."enum_posts_blocks_content_columns_link_type" AS ENUM('reference', 'site', 'custom');
  CREATE TYPE "public"."enum_posts_blocks_content_columns_link_site_page" AS ENUM('home', 'works-index', 'insights-index', 'lab-index');
  CREATE TYPE "public"."enum_posts_blocks_content_columns_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum_posts_blocks_content_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum__posts_v_blocks_content_columns_size" AS ENUM('oneThird', 'half', 'twoThirds', 'full');
  CREATE TYPE "public"."enum__posts_v_blocks_content_columns_link_type" AS ENUM('reference', 'site', 'custom');
  CREATE TYPE "public"."enum__posts_v_blocks_content_columns_link_site_page" AS ENUM('home', 'works-index', 'insights-index', 'lab-index');
  CREATE TYPE "public"."enum__posts_v_blocks_content_columns_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum__posts_v_blocks_content_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum_work_pages_blocks_content_columns_size" AS ENUM('oneThird', 'half', 'twoThirds', 'full');
  CREATE TYPE "public"."enum_work_pages_blocks_content_columns_link_type" AS ENUM('reference', 'site', 'custom');
  CREATE TYPE "public"."enum_work_pages_blocks_content_columns_link_site_page" AS ENUM('home', 'works-index', 'insights-index', 'lab-index');
  CREATE TYPE "public"."enum_work_pages_blocks_content_columns_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum_work_pages_blocks_content_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum__work_pages_v_blocks_content_columns_size" AS ENUM('oneThird', 'half', 'twoThirds', 'full');
  CREATE TYPE "public"."enum__work_pages_v_blocks_content_columns_link_type" AS ENUM('reference', 'site', 'custom');
  CREATE TYPE "public"."enum__work_pages_v_blocks_content_columns_link_site_page" AS ENUM('home', 'works-index', 'insights-index', 'lab-index');
  CREATE TYPE "public"."enum__work_pages_v_blocks_content_columns_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum__work_pages_v_blocks_content_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum_lab_pages_blocks_content_columns_size" AS ENUM('oneThird', 'half', 'twoThirds', 'full');
  CREATE TYPE "public"."enum_lab_pages_blocks_content_columns_link_type" AS ENUM('reference', 'site', 'custom');
  CREATE TYPE "public"."enum_lab_pages_blocks_content_columns_link_site_page" AS ENUM('home', 'works-index', 'insights-index', 'lab-index');
  CREATE TYPE "public"."enum_lab_pages_blocks_content_columns_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum_lab_pages_blocks_content_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum__lab_pages_v_blocks_content_columns_size" AS ENUM('oneThird', 'half', 'twoThirds', 'full');
  CREATE TYPE "public"."enum__lab_pages_v_blocks_content_columns_link_type" AS ENUM('reference', 'site', 'custom');
  CREATE TYPE "public"."enum__lab_pages_v_blocks_content_columns_link_site_page" AS ENUM('home', 'works-index', 'insights-index', 'lab-index');
  CREATE TYPE "public"."enum__lab_pages_v_blocks_content_columns_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum__lab_pages_v_blocks_content_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum_expertise_pages_blocks_content_columns_size" AS ENUM('oneThird', 'half', 'twoThirds', 'full');
  CREATE TYPE "public"."enum_expertise_pages_blocks_content_columns_link_type" AS ENUM('reference', 'site', 'custom');
  CREATE TYPE "public"."enum_expertise_pages_blocks_content_columns_link_site_page" AS ENUM('home', 'works-index', 'insights-index', 'lab-index');
  CREATE TYPE "public"."enum_expertise_pages_blocks_content_columns_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum_expertise_pages_blocks_content_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum_expertise_pages_blocks_cta_links_link_type" AS ENUM('reference', 'site', 'custom');
  CREATE TYPE "public"."enum_expertise_pages_blocks_cta_links_link_site_page" AS ENUM('home', 'works-index', 'insights-index', 'lab-index');
  CREATE TYPE "public"."enum_expertise_pages_blocks_cta_links_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum_expertise_pages_blocks_cta_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum__expertise_pages_v_blocks_content_columns_size" AS ENUM('oneThird', 'half', 'twoThirds', 'full');
  CREATE TYPE "public"."enum__expertise_pages_v_blocks_content_columns_link_type" AS ENUM('reference', 'site', 'custom');
  CREATE TYPE "public"."enum__expertise_pages_v_blocks_content_columns_link_site_page" AS ENUM('home', 'works-index', 'insights-index', 'lab-index');
  CREATE TYPE "public"."enum__expertise_pages_v_blocks_content_columns_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum__expertise_pages_v_blocks_content_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum__expertise_pages_v_blocks_cta_links_link_type" AS ENUM('reference', 'site', 'custom');
  CREATE TYPE "public"."enum__expertise_pages_v_blocks_cta_links_link_site_page" AS ENUM('home', 'works-index', 'insights-index', 'lab-index');
  CREATE TYPE "public"."enum__expertise_pages_v_blocks_cta_links_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum__expertise_pages_v_blocks_cta_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum_audience_pages_blocks_content_columns_size" AS ENUM('oneThird', 'half', 'twoThirds', 'full');
  CREATE TYPE "public"."enum_audience_pages_blocks_content_columns_link_type" AS ENUM('reference', 'site', 'custom');
  CREATE TYPE "public"."enum_audience_pages_blocks_content_columns_link_site_page" AS ENUM('home', 'works-index', 'insights-index', 'lab-index');
  CREATE TYPE "public"."enum_audience_pages_blocks_content_columns_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum_audience_pages_blocks_content_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum_audience_pages_blocks_cta_links_link_type" AS ENUM('reference', 'site', 'custom');
  CREATE TYPE "public"."enum_audience_pages_blocks_cta_links_link_site_page" AS ENUM('home', 'works-index', 'insights-index', 'lab-index');
  CREATE TYPE "public"."enum_audience_pages_blocks_cta_links_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum_audience_pages_blocks_cta_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum__audience_pages_v_blocks_content_columns_size" AS ENUM('oneThird', 'half', 'twoThirds', 'full');
  CREATE TYPE "public"."enum__audience_pages_v_blocks_content_columns_link_type" AS ENUM('reference', 'site', 'custom');
  CREATE TYPE "public"."enum__audience_pages_v_blocks_content_columns_link_site_page" AS ENUM('home', 'works-index', 'insights-index', 'lab-index');
  CREATE TYPE "public"."enum__audience_pages_v_blocks_content_columns_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum__audience_pages_v_blocks_content_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum__audience_pages_v_blocks_cta_links_link_type" AS ENUM('reference', 'site', 'custom');
  CREATE TYPE "public"."enum__audience_pages_v_blocks_cta_links_link_site_page" AS ENUM('home', 'works-index', 'insights-index', 'lab-index');
  CREATE TYPE "public"."enum__audience_pages_v_blocks_cta_links_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum__audience_pages_v_blocks_cta_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TABLE "pages_blocks_content_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"size" "enum_pages_blocks_content_columns_size" DEFAULT 'oneThird',
  	"rich_text" jsonb,
  	"enable_link" boolean,
  	"link_type" "enum_pages_blocks_content_columns_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_site_page" "enum_pages_blocks_content_columns_link_site_page",
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum_pages_blocks_content_columns_link_appearance" DEFAULT 'default'
  );
  
  CREATE TABLE "pages_blocks_content" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"theme" "enum_pages_blocks_content_theme" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_cta_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_pages_blocks_cta_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_site_page" "enum_pages_blocks_cta_links_link_site_page",
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum_pages_blocks_cta_links_link_appearance" DEFAULT 'default'
  );
  
  CREATE TABLE "pages_blocks_cta" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"rich_text" jsonb,
  	"theme" "enum_pages_blocks_cta_theme" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_content_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"size" "enum__pages_v_blocks_content_columns_size" DEFAULT 'oneThird',
  	"rich_text" jsonb,
  	"enable_link" boolean,
  	"link_type" "enum__pages_v_blocks_content_columns_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_site_page" "enum__pages_v_blocks_content_columns_link_site_page",
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum__pages_v_blocks_content_columns_link_appearance" DEFAULT 'default',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_content" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"theme" "enum__pages_v_blocks_content_theme" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_cta_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_type" "enum__pages_v_blocks_cta_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_site_page" "enum__pages_v_blocks_cta_links_link_site_page",
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum__pages_v_blocks_cta_links_link_appearance" DEFAULT 'default',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_cta" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"rich_text" jsonb,
  	"theme" "enum__pages_v_blocks_cta_theme" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "posts_blocks_content_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"size" "enum_posts_blocks_content_columns_size" DEFAULT 'oneThird',
  	"rich_text" jsonb,
  	"enable_link" boolean,
  	"link_type" "enum_posts_blocks_content_columns_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_site_page" "enum_posts_blocks_content_columns_link_site_page",
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum_posts_blocks_content_columns_link_appearance" DEFAULT 'default'
  );
  
  CREATE TABLE "posts_blocks_content" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"theme" "enum_posts_blocks_content_theme" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "_posts_v_blocks_content_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"size" "enum__posts_v_blocks_content_columns_size" DEFAULT 'oneThird',
  	"rich_text" jsonb,
  	"enable_link" boolean,
  	"link_type" "enum__posts_v_blocks_content_columns_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_site_page" "enum__posts_v_blocks_content_columns_link_site_page",
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum__posts_v_blocks_content_columns_link_appearance" DEFAULT 'default',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_posts_v_blocks_content" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"theme" "enum__posts_v_blocks_content_theme" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "work_pages_blocks_content_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"size" "enum_work_pages_blocks_content_columns_size" DEFAULT 'oneThird',
  	"rich_text" jsonb,
  	"enable_link" boolean,
  	"link_type" "enum_work_pages_blocks_content_columns_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_site_page" "enum_work_pages_blocks_content_columns_link_site_page",
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum_work_pages_blocks_content_columns_link_appearance" DEFAULT 'default'
  );
  
  CREATE TABLE "work_pages_blocks_content" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"theme" "enum_work_pages_blocks_content_theme" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "_work_pages_v_blocks_content_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"size" "enum__work_pages_v_blocks_content_columns_size" DEFAULT 'oneThird',
  	"rich_text" jsonb,
  	"enable_link" boolean,
  	"link_type" "enum__work_pages_v_blocks_content_columns_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_site_page" "enum__work_pages_v_blocks_content_columns_link_site_page",
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum__work_pages_v_blocks_content_columns_link_appearance" DEFAULT 'default',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_work_pages_v_blocks_content" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"theme" "enum__work_pages_v_blocks_content_theme" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "lab_pages_blocks_content_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"size" "enum_lab_pages_blocks_content_columns_size" DEFAULT 'oneThird',
  	"rich_text" jsonb,
  	"enable_link" boolean,
  	"link_type" "enum_lab_pages_blocks_content_columns_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_site_page" "enum_lab_pages_blocks_content_columns_link_site_page",
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum_lab_pages_blocks_content_columns_link_appearance" DEFAULT 'default'
  );
  
  CREATE TABLE "lab_pages_blocks_content" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"theme" "enum_lab_pages_blocks_content_theme" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "_lab_pages_v_blocks_content_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"size" "enum__lab_pages_v_blocks_content_columns_size" DEFAULT 'oneThird',
  	"rich_text" jsonb,
  	"enable_link" boolean,
  	"link_type" "enum__lab_pages_v_blocks_content_columns_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_site_page" "enum__lab_pages_v_blocks_content_columns_link_site_page",
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum__lab_pages_v_blocks_content_columns_link_appearance" DEFAULT 'default',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_lab_pages_v_blocks_content" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"theme" "enum__lab_pages_v_blocks_content_theme" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "expertise_pages_blocks_content_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"size" "enum_expertise_pages_blocks_content_columns_size" DEFAULT 'oneThird',
  	"rich_text" jsonb,
  	"enable_link" boolean,
  	"link_type" "enum_expertise_pages_blocks_content_columns_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_site_page" "enum_expertise_pages_blocks_content_columns_link_site_page",
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum_expertise_pages_blocks_content_columns_link_appearance" DEFAULT 'default'
  );
  
  CREATE TABLE "expertise_pages_blocks_content" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"theme" "enum_expertise_pages_blocks_content_theme" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "expertise_pages_blocks_cta_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_expertise_pages_blocks_cta_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_site_page" "enum_expertise_pages_blocks_cta_links_link_site_page",
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum_expertise_pages_blocks_cta_links_link_appearance" DEFAULT 'default'
  );
  
  CREATE TABLE "expertise_pages_blocks_cta" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"rich_text" jsonb,
  	"theme" "enum_expertise_pages_blocks_cta_theme" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "_expertise_pages_v_blocks_content_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"size" "enum__expertise_pages_v_blocks_content_columns_size" DEFAULT 'oneThird',
  	"rich_text" jsonb,
  	"enable_link" boolean,
  	"link_type" "enum__expertise_pages_v_blocks_content_columns_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_site_page" "enum__expertise_pages_v_blocks_content_columns_link_site_page",
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum__expertise_pages_v_blocks_content_columns_link_appearance" DEFAULT 'default',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_expertise_pages_v_blocks_content" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"theme" "enum__expertise_pages_v_blocks_content_theme" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_expertise_pages_v_blocks_cta_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_type" "enum__expertise_pages_v_blocks_cta_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_site_page" "enum__expertise_pages_v_blocks_cta_links_link_site_page",
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum__expertise_pages_v_blocks_cta_links_link_appearance" DEFAULT 'default',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_expertise_pages_v_blocks_cta" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"rich_text" jsonb,
  	"theme" "enum__expertise_pages_v_blocks_cta_theme" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "audience_pages_blocks_content_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"size" "enum_audience_pages_blocks_content_columns_size" DEFAULT 'oneThird',
  	"rich_text" jsonb,
  	"enable_link" boolean,
  	"link_type" "enum_audience_pages_blocks_content_columns_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_site_page" "enum_audience_pages_blocks_content_columns_link_site_page",
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum_audience_pages_blocks_content_columns_link_appearance" DEFAULT 'default'
  );
  
  CREATE TABLE "audience_pages_blocks_content" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"theme" "enum_audience_pages_blocks_content_theme" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "audience_pages_blocks_cta_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_audience_pages_blocks_cta_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_site_page" "enum_audience_pages_blocks_cta_links_link_site_page",
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum_audience_pages_blocks_cta_links_link_appearance" DEFAULT 'default'
  );
  
  CREATE TABLE "audience_pages_blocks_cta" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"rich_text" jsonb,
  	"theme" "enum_audience_pages_blocks_cta_theme" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "_audience_pages_v_blocks_content_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"size" "enum__audience_pages_v_blocks_content_columns_size" DEFAULT 'oneThird',
  	"rich_text" jsonb,
  	"enable_link" boolean,
  	"link_type" "enum__audience_pages_v_blocks_content_columns_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_site_page" "enum__audience_pages_v_blocks_content_columns_link_site_page",
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum__audience_pages_v_blocks_content_columns_link_appearance" DEFAULT 'default',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_audience_pages_v_blocks_content" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"theme" "enum__audience_pages_v_blocks_content_theme" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_audience_pages_v_blocks_cta_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_type" "enum__audience_pages_v_blocks_cta_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_site_page" "enum__audience_pages_v_blocks_cta_links_link_site_page",
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum__audience_pages_v_blocks_cta_links_link_appearance" DEFAULT 'default',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_audience_pages_v_blocks_cta" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"rich_text" jsonb,
  	"theme" "enum__audience_pages_v_blocks_cta_theme" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "pages_blocks_content_columns" ADD CONSTRAINT "pages_blocks_content_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_content"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_content" ADD CONSTRAINT "pages_blocks_content_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_cta_links" ADD CONSTRAINT "pages_blocks_cta_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_cta"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_cta" ADD CONSTRAINT "pages_blocks_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_content_columns" ADD CONSTRAINT "_pages_v_blocks_content_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_content"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_content" ADD CONSTRAINT "_pages_v_blocks_content_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_cta_links" ADD CONSTRAINT "_pages_v_blocks_cta_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_cta"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_cta" ADD CONSTRAINT "_pages_v_blocks_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_content_columns" ADD CONSTRAINT "posts_blocks_content_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts_blocks_content"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_blocks_content" ADD CONSTRAINT "posts_blocks_content_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_content_columns" ADD CONSTRAINT "_posts_v_blocks_content_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v_blocks_content"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_blocks_content" ADD CONSTRAINT "_posts_v_blocks_content_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "work_pages_blocks_content_columns" ADD CONSTRAINT "work_pages_blocks_content_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."work_pages_blocks_content"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "work_pages_blocks_content" ADD CONSTRAINT "work_pages_blocks_content_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."work_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_work_pages_v_blocks_content_columns" ADD CONSTRAINT "_work_pages_v_blocks_content_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_work_pages_v_blocks_content"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_work_pages_v_blocks_content" ADD CONSTRAINT "_work_pages_v_blocks_content_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_work_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lab_pages_blocks_content_columns" ADD CONSTRAINT "lab_pages_blocks_content_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lab_pages_blocks_content"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lab_pages_blocks_content" ADD CONSTRAINT "lab_pages_blocks_content_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lab_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_lab_pages_v_blocks_content_columns" ADD CONSTRAINT "_lab_pages_v_blocks_content_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_lab_pages_v_blocks_content"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_lab_pages_v_blocks_content" ADD CONSTRAINT "_lab_pages_v_blocks_content_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_lab_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "expertise_pages_blocks_content_columns" ADD CONSTRAINT "expertise_pages_blocks_content_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."expertise_pages_blocks_content"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "expertise_pages_blocks_content" ADD CONSTRAINT "expertise_pages_blocks_content_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."expertise_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "expertise_pages_blocks_cta_links" ADD CONSTRAINT "expertise_pages_blocks_cta_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."expertise_pages_blocks_cta"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "expertise_pages_blocks_cta" ADD CONSTRAINT "expertise_pages_blocks_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."expertise_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_expertise_pages_v_blocks_content_columns" ADD CONSTRAINT "_expertise_pages_v_blocks_content_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_expertise_pages_v_blocks_content"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_expertise_pages_v_blocks_content" ADD CONSTRAINT "_expertise_pages_v_blocks_content_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_expertise_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_expertise_pages_v_blocks_cta_links" ADD CONSTRAINT "_expertise_pages_v_blocks_cta_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_expertise_pages_v_blocks_cta"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_expertise_pages_v_blocks_cta" ADD CONSTRAINT "_expertise_pages_v_blocks_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_expertise_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "audience_pages_blocks_content_columns" ADD CONSTRAINT "audience_pages_blocks_content_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."audience_pages_blocks_content"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "audience_pages_blocks_content" ADD CONSTRAINT "audience_pages_blocks_content_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."audience_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "audience_pages_blocks_cta_links" ADD CONSTRAINT "audience_pages_blocks_cta_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."audience_pages_blocks_cta"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "audience_pages_blocks_cta" ADD CONSTRAINT "audience_pages_blocks_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."audience_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_audience_pages_v_blocks_content_columns" ADD CONSTRAINT "_audience_pages_v_blocks_content_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_audience_pages_v_blocks_content"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_audience_pages_v_blocks_content" ADD CONSTRAINT "_audience_pages_v_blocks_content_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_audience_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_audience_pages_v_blocks_cta_links" ADD CONSTRAINT "_audience_pages_v_blocks_cta_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_audience_pages_v_blocks_cta"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_audience_pages_v_blocks_cta" ADD CONSTRAINT "_audience_pages_v_blocks_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_audience_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_content_columns_order_idx" ON "pages_blocks_content_columns" USING btree ("_order");
  CREATE INDEX "pages_blocks_content_columns_parent_id_idx" ON "pages_blocks_content_columns" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_content_order_idx" ON "pages_blocks_content" USING btree ("_order");
  CREATE INDEX "pages_blocks_content_parent_id_idx" ON "pages_blocks_content" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_content_path_idx" ON "pages_blocks_content" USING btree ("_path");
  CREATE INDEX "pages_blocks_cta_links_order_idx" ON "pages_blocks_cta_links" USING btree ("_order");
  CREATE INDEX "pages_blocks_cta_links_parent_id_idx" ON "pages_blocks_cta_links" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_cta_order_idx" ON "pages_blocks_cta" USING btree ("_order");
  CREATE INDEX "pages_blocks_cta_parent_id_idx" ON "pages_blocks_cta" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_cta_path_idx" ON "pages_blocks_cta" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_content_columns_order_idx" ON "_pages_v_blocks_content_columns" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_content_columns_parent_id_idx" ON "_pages_v_blocks_content_columns" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_content_order_idx" ON "_pages_v_blocks_content" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_content_parent_id_idx" ON "_pages_v_blocks_content" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_content_path_idx" ON "_pages_v_blocks_content" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_cta_links_order_idx" ON "_pages_v_blocks_cta_links" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_cta_links_parent_id_idx" ON "_pages_v_blocks_cta_links" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_cta_order_idx" ON "_pages_v_blocks_cta" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_cta_parent_id_idx" ON "_pages_v_blocks_cta" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_cta_path_idx" ON "_pages_v_blocks_cta" USING btree ("_path");
  CREATE INDEX "posts_blocks_content_columns_order_idx" ON "posts_blocks_content_columns" USING btree ("_order");
  CREATE INDEX "posts_blocks_content_columns_parent_id_idx" ON "posts_blocks_content_columns" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_content_order_idx" ON "posts_blocks_content" USING btree ("_order");
  CREATE INDEX "posts_blocks_content_parent_id_idx" ON "posts_blocks_content" USING btree ("_parent_id");
  CREATE INDEX "posts_blocks_content_path_idx" ON "posts_blocks_content" USING btree ("_path");
  CREATE INDEX "_posts_v_blocks_content_columns_order_idx" ON "_posts_v_blocks_content_columns" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_content_columns_parent_id_idx" ON "_posts_v_blocks_content_columns" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_content_order_idx" ON "_posts_v_blocks_content" USING btree ("_order");
  CREATE INDEX "_posts_v_blocks_content_parent_id_idx" ON "_posts_v_blocks_content" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_blocks_content_path_idx" ON "_posts_v_blocks_content" USING btree ("_path");
  CREATE INDEX "work_pages_blocks_content_columns_order_idx" ON "work_pages_blocks_content_columns" USING btree ("_order");
  CREATE INDEX "work_pages_blocks_content_columns_parent_id_idx" ON "work_pages_blocks_content_columns" USING btree ("_parent_id");
  CREATE INDEX "work_pages_blocks_content_order_idx" ON "work_pages_blocks_content" USING btree ("_order");
  CREATE INDEX "work_pages_blocks_content_parent_id_idx" ON "work_pages_blocks_content" USING btree ("_parent_id");
  CREATE INDEX "work_pages_blocks_content_path_idx" ON "work_pages_blocks_content" USING btree ("_path");
  CREATE INDEX "_work_pages_v_blocks_content_columns_order_idx" ON "_work_pages_v_blocks_content_columns" USING btree ("_order");
  CREATE INDEX "_work_pages_v_blocks_content_columns_parent_id_idx" ON "_work_pages_v_blocks_content_columns" USING btree ("_parent_id");
  CREATE INDEX "_work_pages_v_blocks_content_order_idx" ON "_work_pages_v_blocks_content" USING btree ("_order");
  CREATE INDEX "_work_pages_v_blocks_content_parent_id_idx" ON "_work_pages_v_blocks_content" USING btree ("_parent_id");
  CREATE INDEX "_work_pages_v_blocks_content_path_idx" ON "_work_pages_v_blocks_content" USING btree ("_path");
  CREATE INDEX "lab_pages_blocks_content_columns_order_idx" ON "lab_pages_blocks_content_columns" USING btree ("_order");
  CREATE INDEX "lab_pages_blocks_content_columns_parent_id_idx" ON "lab_pages_blocks_content_columns" USING btree ("_parent_id");
  CREATE INDEX "lab_pages_blocks_content_order_idx" ON "lab_pages_blocks_content" USING btree ("_order");
  CREATE INDEX "lab_pages_blocks_content_parent_id_idx" ON "lab_pages_blocks_content" USING btree ("_parent_id");
  CREATE INDEX "lab_pages_blocks_content_path_idx" ON "lab_pages_blocks_content" USING btree ("_path");
  CREATE INDEX "_lab_pages_v_blocks_content_columns_order_idx" ON "_lab_pages_v_blocks_content_columns" USING btree ("_order");
  CREATE INDEX "_lab_pages_v_blocks_content_columns_parent_id_idx" ON "_lab_pages_v_blocks_content_columns" USING btree ("_parent_id");
  CREATE INDEX "_lab_pages_v_blocks_content_order_idx" ON "_lab_pages_v_blocks_content" USING btree ("_order");
  CREATE INDEX "_lab_pages_v_blocks_content_parent_id_idx" ON "_lab_pages_v_blocks_content" USING btree ("_parent_id");
  CREATE INDEX "_lab_pages_v_blocks_content_path_idx" ON "_lab_pages_v_blocks_content" USING btree ("_path");
  CREATE INDEX "expertise_pages_blocks_content_columns_order_idx" ON "expertise_pages_blocks_content_columns" USING btree ("_order");
  CREATE INDEX "expertise_pages_blocks_content_columns_parent_id_idx" ON "expertise_pages_blocks_content_columns" USING btree ("_parent_id");
  CREATE INDEX "expertise_pages_blocks_content_order_idx" ON "expertise_pages_blocks_content" USING btree ("_order");
  CREATE INDEX "expertise_pages_blocks_content_parent_id_idx" ON "expertise_pages_blocks_content" USING btree ("_parent_id");
  CREATE INDEX "expertise_pages_blocks_content_path_idx" ON "expertise_pages_blocks_content" USING btree ("_path");
  CREATE INDEX "expertise_pages_blocks_cta_links_order_idx" ON "expertise_pages_blocks_cta_links" USING btree ("_order");
  CREATE INDEX "expertise_pages_blocks_cta_links_parent_id_idx" ON "expertise_pages_blocks_cta_links" USING btree ("_parent_id");
  CREATE INDEX "expertise_pages_blocks_cta_order_idx" ON "expertise_pages_blocks_cta" USING btree ("_order");
  CREATE INDEX "expertise_pages_blocks_cta_parent_id_idx" ON "expertise_pages_blocks_cta" USING btree ("_parent_id");
  CREATE INDEX "expertise_pages_blocks_cta_path_idx" ON "expertise_pages_blocks_cta" USING btree ("_path");
  CREATE INDEX "_expertise_pages_v_blocks_content_columns_order_idx" ON "_expertise_pages_v_blocks_content_columns" USING btree ("_order");
  CREATE INDEX "_expertise_pages_v_blocks_content_columns_parent_id_idx" ON "_expertise_pages_v_blocks_content_columns" USING btree ("_parent_id");
  CREATE INDEX "_expertise_pages_v_blocks_content_order_idx" ON "_expertise_pages_v_blocks_content" USING btree ("_order");
  CREATE INDEX "_expertise_pages_v_blocks_content_parent_id_idx" ON "_expertise_pages_v_blocks_content" USING btree ("_parent_id");
  CREATE INDEX "_expertise_pages_v_blocks_content_path_idx" ON "_expertise_pages_v_blocks_content" USING btree ("_path");
  CREATE INDEX "_expertise_pages_v_blocks_cta_links_order_idx" ON "_expertise_pages_v_blocks_cta_links" USING btree ("_order");
  CREATE INDEX "_expertise_pages_v_blocks_cta_links_parent_id_idx" ON "_expertise_pages_v_blocks_cta_links" USING btree ("_parent_id");
  CREATE INDEX "_expertise_pages_v_blocks_cta_order_idx" ON "_expertise_pages_v_blocks_cta" USING btree ("_order");
  CREATE INDEX "_expertise_pages_v_blocks_cta_parent_id_idx" ON "_expertise_pages_v_blocks_cta" USING btree ("_parent_id");
  CREATE INDEX "_expertise_pages_v_blocks_cta_path_idx" ON "_expertise_pages_v_blocks_cta" USING btree ("_path");
  CREATE INDEX "audience_pages_blocks_content_columns_order_idx" ON "audience_pages_blocks_content_columns" USING btree ("_order");
  CREATE INDEX "audience_pages_blocks_content_columns_parent_id_idx" ON "audience_pages_blocks_content_columns" USING btree ("_parent_id");
  CREATE INDEX "audience_pages_blocks_content_order_idx" ON "audience_pages_blocks_content" USING btree ("_order");
  CREATE INDEX "audience_pages_blocks_content_parent_id_idx" ON "audience_pages_blocks_content" USING btree ("_parent_id");
  CREATE INDEX "audience_pages_blocks_content_path_idx" ON "audience_pages_blocks_content" USING btree ("_path");
  CREATE INDEX "audience_pages_blocks_cta_links_order_idx" ON "audience_pages_blocks_cta_links" USING btree ("_order");
  CREATE INDEX "audience_pages_blocks_cta_links_parent_id_idx" ON "audience_pages_blocks_cta_links" USING btree ("_parent_id");
  CREATE INDEX "audience_pages_blocks_cta_order_idx" ON "audience_pages_blocks_cta" USING btree ("_order");
  CREATE INDEX "audience_pages_blocks_cta_parent_id_idx" ON "audience_pages_blocks_cta" USING btree ("_parent_id");
  CREATE INDEX "audience_pages_blocks_cta_path_idx" ON "audience_pages_blocks_cta" USING btree ("_path");
  CREATE INDEX "_audience_pages_v_blocks_content_columns_order_idx" ON "_audience_pages_v_blocks_content_columns" USING btree ("_order");
  CREATE INDEX "_audience_pages_v_blocks_content_columns_parent_id_idx" ON "_audience_pages_v_blocks_content_columns" USING btree ("_parent_id");
  CREATE INDEX "_audience_pages_v_blocks_content_order_idx" ON "_audience_pages_v_blocks_content" USING btree ("_order");
  CREATE INDEX "_audience_pages_v_blocks_content_parent_id_idx" ON "_audience_pages_v_blocks_content" USING btree ("_parent_id");
  CREATE INDEX "_audience_pages_v_blocks_content_path_idx" ON "_audience_pages_v_blocks_content" USING btree ("_path");
  CREATE INDEX "_audience_pages_v_blocks_cta_links_order_idx" ON "_audience_pages_v_blocks_cta_links" USING btree ("_order");
  CREATE INDEX "_audience_pages_v_blocks_cta_links_parent_id_idx" ON "_audience_pages_v_blocks_cta_links" USING btree ("_parent_id");
  CREATE INDEX "_audience_pages_v_blocks_cta_order_idx" ON "_audience_pages_v_blocks_cta" USING btree ("_order");
  CREATE INDEX "_audience_pages_v_blocks_cta_parent_id_idx" ON "_audience_pages_v_blocks_cta" USING btree ("_parent_id");
  CREATE INDEX "_audience_pages_v_blocks_cta_path_idx" ON "_audience_pages_v_blocks_cta" USING btree ("_path");`)
}
