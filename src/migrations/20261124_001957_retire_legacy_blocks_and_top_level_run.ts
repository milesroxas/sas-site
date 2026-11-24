import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'


/**
 * Every table this migration drops. Production audit (2026-11-23,
 * docs/blocks-reorg-roadmap.md section 0): none holds a live row or a row of
 * any document's latest version, the current draft included. Older version
 * history does hold some of them (Statement grid on audience page 4, Statement
 * links on Home, Metrics on vault), and goes with them, as decided: a version
 * from many publishes ago may lose a retired block, a current draft may not.
 */
export const DROPPED_TABLES = [
  '__audience_pages_v_aud_tabs_v',
  '__audience_pages_v_aud_tabs_v_tabs',
  '__audience_pages_v_aud_tabs_v_tabs_items',
  '__audience_pages_v_feat_work_v',
  '__audience_pages_v_stmt_grid_v',
  '__audience_pages_v_stmt_grid_v_cards',
  '__expertise_pages_v_aud_tabs_v',
  '__expertise_pages_v_aud_tabs_v_tabs',
  '__expertise_pages_v_aud_tabs_v_tabs_items',
  '__expertise_pages_v_feat_work_v',
  '__expertise_pages_v_stmt_grid_v',
  '__expertise_pages_v_stmt_grid_v_cards',
  '__home_v_stmt_grid_v',
  '__home_v_stmt_grid_v_cards',
  '__home_v_stmt_links_v',
  '__home_v_stmt_links_v_links',
  '__lab_pages_v_stmt_grid_v',
  '__lab_pages_v_stmt_grid_v_cards',
  '__pages_v_aud_tabs_v',
  '__pages_v_aud_tabs_v_tabs',
  '__pages_v_aud_tabs_v_tabs_items',
  '__pages_v_feat_work_v',
  '__pages_v_ind_work_v',
  '__pages_v_ind_work_v_industries',
  '__pages_v_stmt_grid_v',
  '__pages_v_stmt_grid_v_cards',
  '__pages_v_stmt_links_v',
  '__pages_v_stmt_links_v_links',
  '__posts_v_feat_work_v',
  '__work_pages_v_aud_tabs_v',
  '__work_pages_v_aud_tabs_v_tabs',
  '__work_pages_v_aud_tabs_v_tabs_items',
  '__work_pages_v_ind_work_v',
  '__work_pages_v_ind_work_v_industries',
  '__work_pages_v_stmt_grid_v',
  '__work_pages_v_stmt_grid_v_cards',
  '__work_pages_v_stmt_links_v',
  '__work_pages_v_stmt_links_v_links',
  '_audience_pages_v_blocks_form_block',
  '_expertise_pages_v_blocks_form_block',
  '_home_v_blocks_archive',
  '_home_v_blocks_content',
  '_home_v_blocks_content_columns',
  '_home_v_blocks_cta',
  '_home_v_blocks_cta_links',
  '_home_v_blocks_form_block',
  '_home_v_blocks_newsletter_signup',
  '_pages_v_blocks_form_block',
  '_pages_v_blocks_newsletter_signup',
  '_pages_v_blocks_testimonials_marquee',
  '_pages_v_blocks_testimonials_marquee_links',
  '_wp_metrics_v',
  'audience_pages_aud_tabs',
  'audience_pages_aud_tabs_tabs',
  'audience_pages_aud_tabs_tabs_items',
  'audience_pages_blocks_form_block',
  'audience_pages_feat_work',
  'audience_pages_stmt_grid',
  'audience_pages_stmt_grid_cards',
  'expertise_pages_aud_tabs',
  'expertise_pages_aud_tabs_tabs',
  'expertise_pages_aud_tabs_tabs_items',
  'expertise_pages_blocks_form_block',
  'expertise_pages_feat_work',
  'expertise_pages_stmt_grid',
  'expertise_pages_stmt_grid_cards',
  'home_blocks_archive',
  'home_blocks_content',
  'home_blocks_content_columns',
  'home_blocks_cta',
  'home_blocks_cta_links',
  'home_blocks_form_block',
  'home_blocks_newsletter_signup',
  'home_stmt_grid',
  'home_stmt_grid_cards',
  'home_stmt_links',
  'home_stmt_links_links',
  'lab_pages_stmt_grid',
  'lab_pages_stmt_grid_cards',
  'pages_aud_tabs',
  'pages_aud_tabs_tabs',
  'pages_aud_tabs_tabs_items',
  'pages_blocks_form_block',
  'pages_blocks_newsletter_signup',
  'pages_blocks_testimonials_marquee',
  'pages_blocks_testimonials_marquee_links',
  'pages_feat_work',
  'pages_ind_work',
  'pages_ind_work_industries',
  'pages_stmt_grid',
  'pages_stmt_grid_cards',
  'pages_stmt_links',
  'pages_stmt_links_links',
  'posts_feat_work',
  'work_pages_aud_tabs',
  'work_pages_aud_tabs_tabs',
  'work_pages_aud_tabs_tabs_items',
  'work_pages_ind_work',
  'work_pages_ind_work_industries',
  'work_pages_stmt_grid',
  'work_pages_stmt_grid_cards',
  'work_pages_stmt_links',
  'work_pages_stmt_links_links',
  'wp_metrics',
] as const

/** Rels columns this migration drops, beside their tables. */
const DROPPED_RELS_COLUMNS = [
  ['home_rels', 'categories_id'],
  ['_home_v_rels', 'categories_id'],
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
  for (const [table, column] of DROPPED_RELS_COLUMNS) {
    const current = table.startsWith('_')
      ? `JOIN "${table.replace(/_rels$/, '')}" v ON v.id = r.parent_id WHERE v.latest = true AND`
      : 'WHERE'
    const { rows } = await db.execute(
      sql.raw(`SELECT count(*)::int AS n FROM "${table}" r ${current} r."${column}" IS NOT NULL`),
    )
    const n = (rows[0] as { n: number }).n
    if (n > 0) problems.push(`${table}.${column} (${n} rows)`)
  }
  if (problems.length) {
    throw new Error(
      `retire_legacy_blocks_and_top_level_run: live or current content would be lost, nothing was dropped: ${problems.join(', ')}`,
    )
  }
}

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await assertNoLiveOrCurrentRows(db)
  await db.execute(sql`
   ALTER TABLE "pages_aud_tabs_tabs_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_aud_tabs_tabs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_aud_tabs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_ind_work_industries" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_ind_work" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_testimonials_marquee_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_testimonials_marquee" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_stmt_grid_cards" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_stmt_grid" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_stmt_links_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_stmt_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_feat_work" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_form_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_newsletter_signup" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__pages_v_aud_tabs_v_tabs_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__pages_v_aud_tabs_v_tabs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__pages_v_aud_tabs_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__pages_v_ind_work_v_industries" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__pages_v_ind_work_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_testimonials_marquee_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_testimonials_marquee" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__pages_v_stmt_grid_v_cards" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__pages_v_stmt_grid_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__pages_v_stmt_links_v_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__pages_v_stmt_links_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__pages_v_feat_work_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_form_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_newsletter_signup" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "posts_feat_work" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__posts_v_feat_work_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "work_pages_aud_tabs_tabs_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "work_pages_aud_tabs_tabs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "work_pages_aud_tabs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "work_pages_ind_work_industries" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "work_pages_ind_work" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "work_pages_stmt_grid_cards" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "work_pages_stmt_grid" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "work_pages_stmt_links_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "work_pages_stmt_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "wp_metrics" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__work_pages_v_aud_tabs_v_tabs_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__work_pages_v_aud_tabs_v_tabs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__work_pages_v_aud_tabs_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__work_pages_v_ind_work_v_industries" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__work_pages_v_ind_work_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__work_pages_v_stmt_grid_v_cards" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__work_pages_v_stmt_grid_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__work_pages_v_stmt_links_v_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__work_pages_v_stmt_links_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_wp_metrics_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "lab_pages_stmt_grid_cards" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "lab_pages_stmt_grid" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__lab_pages_v_stmt_grid_v_cards" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__lab_pages_v_stmt_grid_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "expertise_pages_aud_tabs_tabs_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "expertise_pages_aud_tabs_tabs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "expertise_pages_aud_tabs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "expertise_pages_stmt_grid_cards" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "expertise_pages_stmt_grid" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "expertise_pages_feat_work" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "expertise_pages_blocks_form_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__expertise_pages_v_aud_tabs_v_tabs_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__expertise_pages_v_aud_tabs_v_tabs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__expertise_pages_v_aud_tabs_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__expertise_pages_v_stmt_grid_v_cards" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__expertise_pages_v_stmt_grid_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__expertise_pages_v_feat_work_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_expertise_pages_v_blocks_form_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "audience_pages_aud_tabs_tabs_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "audience_pages_aud_tabs_tabs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "audience_pages_aud_tabs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "audience_pages_stmt_grid_cards" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "audience_pages_stmt_grid" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "audience_pages_feat_work" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "audience_pages_blocks_form_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__audience_pages_v_aud_tabs_v_tabs_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__audience_pages_v_aud_tabs_v_tabs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__audience_pages_v_aud_tabs_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__audience_pages_v_stmt_grid_v_cards" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__audience_pages_v_stmt_grid_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__audience_pages_v_feat_work_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_audience_pages_v_blocks_form_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_stmt_grid_cards" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_stmt_grid" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_stmt_links_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_stmt_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_blocks_archive" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_blocks_cta_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_blocks_cta" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_blocks_form_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_blocks_newsletter_signup" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_blocks_content_columns" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "home_blocks_content" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__home_v_stmt_grid_v_cards" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__home_v_stmt_grid_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__home_v_stmt_links_v_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "__home_v_stmt_links_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_home_v_blocks_archive" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_home_v_blocks_cta_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_home_v_blocks_cta" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_home_v_blocks_form_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_home_v_blocks_newsletter_signup" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_home_v_blocks_content_columns" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_home_v_blocks_content" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "pages_aud_tabs_tabs_items" CASCADE;
  DROP TABLE "pages_aud_tabs_tabs" CASCADE;
  DROP TABLE "pages_aud_tabs" CASCADE;
  DROP TABLE "pages_ind_work_industries" CASCADE;
  DROP TABLE "pages_ind_work" CASCADE;
  DROP TABLE "pages_blocks_testimonials_marquee_links" CASCADE;
  DROP TABLE "pages_blocks_testimonials_marquee" CASCADE;
  DROP TABLE "pages_stmt_grid_cards" CASCADE;
  DROP TABLE "pages_stmt_grid" CASCADE;
  DROP TABLE "pages_stmt_links_links" CASCADE;
  DROP TABLE "pages_stmt_links" CASCADE;
  DROP TABLE "pages_feat_work" CASCADE;
  DROP TABLE "pages_blocks_form_block" CASCADE;
  DROP TABLE "pages_blocks_newsletter_signup" CASCADE;
  DROP TABLE "__pages_v_aud_tabs_v_tabs_items" CASCADE;
  DROP TABLE "__pages_v_aud_tabs_v_tabs" CASCADE;
  DROP TABLE "__pages_v_aud_tabs_v" CASCADE;
  DROP TABLE "__pages_v_ind_work_v_industries" CASCADE;
  DROP TABLE "__pages_v_ind_work_v" CASCADE;
  DROP TABLE "_pages_v_blocks_testimonials_marquee_links" CASCADE;
  DROP TABLE "_pages_v_blocks_testimonials_marquee" CASCADE;
  DROP TABLE "__pages_v_stmt_grid_v_cards" CASCADE;
  DROP TABLE "__pages_v_stmt_grid_v" CASCADE;
  DROP TABLE "__pages_v_stmt_links_v_links" CASCADE;
  DROP TABLE "__pages_v_stmt_links_v" CASCADE;
  DROP TABLE "__pages_v_feat_work_v" CASCADE;
  DROP TABLE "_pages_v_blocks_form_block" CASCADE;
  DROP TABLE "_pages_v_blocks_newsletter_signup" CASCADE;
  DROP TABLE "posts_feat_work" CASCADE;
  DROP TABLE "__posts_v_feat_work_v" CASCADE;
  DROP TABLE "work_pages_aud_tabs_tabs_items" CASCADE;
  DROP TABLE "work_pages_aud_tabs_tabs" CASCADE;
  DROP TABLE "work_pages_aud_tabs" CASCADE;
  DROP TABLE "work_pages_ind_work_industries" CASCADE;
  DROP TABLE "work_pages_ind_work" CASCADE;
  DROP TABLE "work_pages_stmt_grid_cards" CASCADE;
  DROP TABLE "work_pages_stmt_grid" CASCADE;
  DROP TABLE "work_pages_stmt_links_links" CASCADE;
  DROP TABLE "work_pages_stmt_links" CASCADE;
  DROP TABLE "wp_metrics" CASCADE;
  DROP TABLE "__work_pages_v_aud_tabs_v_tabs_items" CASCADE;
  DROP TABLE "__work_pages_v_aud_tabs_v_tabs" CASCADE;
  DROP TABLE "__work_pages_v_aud_tabs_v" CASCADE;
  DROP TABLE "__work_pages_v_ind_work_v_industries" CASCADE;
  DROP TABLE "__work_pages_v_ind_work_v" CASCADE;
  DROP TABLE "__work_pages_v_stmt_grid_v_cards" CASCADE;
  DROP TABLE "__work_pages_v_stmt_grid_v" CASCADE;
  DROP TABLE "__work_pages_v_stmt_links_v_links" CASCADE;
  DROP TABLE "__work_pages_v_stmt_links_v" CASCADE;
  DROP TABLE "_wp_metrics_v" CASCADE;
  DROP TABLE "lab_pages_stmt_grid_cards" CASCADE;
  DROP TABLE "lab_pages_stmt_grid" CASCADE;
  DROP TABLE "__lab_pages_v_stmt_grid_v_cards" CASCADE;
  DROP TABLE "__lab_pages_v_stmt_grid_v" CASCADE;
  DROP TABLE "expertise_pages_aud_tabs_tabs_items" CASCADE;
  DROP TABLE "expertise_pages_aud_tabs_tabs" CASCADE;
  DROP TABLE "expertise_pages_aud_tabs" CASCADE;
  DROP TABLE "expertise_pages_stmt_grid_cards" CASCADE;
  DROP TABLE "expertise_pages_stmt_grid" CASCADE;
  DROP TABLE "expertise_pages_feat_work" CASCADE;
  DROP TABLE "expertise_pages_blocks_form_block" CASCADE;
  DROP TABLE "__expertise_pages_v_aud_tabs_v_tabs_items" CASCADE;
  DROP TABLE "__expertise_pages_v_aud_tabs_v_tabs" CASCADE;
  DROP TABLE "__expertise_pages_v_aud_tabs_v" CASCADE;
  DROP TABLE "__expertise_pages_v_stmt_grid_v_cards" CASCADE;
  DROP TABLE "__expertise_pages_v_stmt_grid_v" CASCADE;
  DROP TABLE "__expertise_pages_v_feat_work_v" CASCADE;
  DROP TABLE "_expertise_pages_v_blocks_form_block" CASCADE;
  DROP TABLE "audience_pages_aud_tabs_tabs_items" CASCADE;
  DROP TABLE "audience_pages_aud_tabs_tabs" CASCADE;
  DROP TABLE "audience_pages_aud_tabs" CASCADE;
  DROP TABLE "audience_pages_stmt_grid_cards" CASCADE;
  DROP TABLE "audience_pages_stmt_grid" CASCADE;
  DROP TABLE "audience_pages_feat_work" CASCADE;
  DROP TABLE "audience_pages_blocks_form_block" CASCADE;
  DROP TABLE "__audience_pages_v_aud_tabs_v_tabs_items" CASCADE;
  DROP TABLE "__audience_pages_v_aud_tabs_v_tabs" CASCADE;
  DROP TABLE "__audience_pages_v_aud_tabs_v" CASCADE;
  DROP TABLE "__audience_pages_v_stmt_grid_v_cards" CASCADE;
  DROP TABLE "__audience_pages_v_stmt_grid_v" CASCADE;
  DROP TABLE "__audience_pages_v_feat_work_v" CASCADE;
  DROP TABLE "_audience_pages_v_blocks_form_block" CASCADE;
  DROP TABLE "home_stmt_grid_cards" CASCADE;
  DROP TABLE "home_stmt_grid" CASCADE;
  DROP TABLE "home_stmt_links_links" CASCADE;
  DROP TABLE "home_stmt_links" CASCADE;
  DROP TABLE "home_blocks_archive" CASCADE;
  DROP TABLE "home_blocks_cta_links" CASCADE;
  DROP TABLE "home_blocks_cta" CASCADE;
  DROP TABLE "home_blocks_form_block" CASCADE;
  DROP TABLE "home_blocks_newsletter_signup" CASCADE;
  DROP TABLE "home_blocks_content_columns" CASCADE;
  DROP TABLE "home_blocks_content" CASCADE;
  DROP TABLE "__home_v_stmt_grid_v_cards" CASCADE;
  DROP TABLE "__home_v_stmt_grid_v" CASCADE;
  DROP TABLE "__home_v_stmt_links_v_links" CASCADE;
  DROP TABLE "__home_v_stmt_links_v" CASCADE;
  DROP TABLE "_home_v_blocks_archive" CASCADE;
  DROP TABLE "_home_v_blocks_cta_links" CASCADE;
  DROP TABLE "_home_v_blocks_cta" CASCADE;
  DROP TABLE "_home_v_blocks_form_block" CASCADE;
  DROP TABLE "_home_v_blocks_newsletter_signup" CASCADE;
  DROP TABLE "_home_v_blocks_content_columns" CASCADE;
  DROP TABLE "_home_v_blocks_content" CASCADE;
  ALTER TABLE "home_rels" DROP CONSTRAINT "home_rels_categories_fk";
  
  ALTER TABLE "_home_v_rels" DROP CONSTRAINT "_home_v_rels_categories_fk";
  
  DROP INDEX "home_rels_categories_id_idx";
  DROP INDEX "_home_v_rels_categories_id_idx";
  ALTER TABLE "home_rels" DROP COLUMN "categories_id";
  ALTER TABLE "_home_v_rels" DROP COLUMN "categories_id";
  DROP TYPE "public"."enum_pages_aud_tabs_tabs_visual_type";
  DROP TYPE "public"."enum_pages_aud_tabs_theme";
  DROP TYPE "public"."enum_pages_ind_work_theme";
  DROP TYPE "public"."enum_pages_blocks_testimonials_marquee_links_link_type";
  DROP TYPE "public"."enum_pages_blocks_testimonials_marquee_links_link_site_page";
  DROP TYPE "public"."enum_pages_blocks_testimonials_marquee_links_link_appearance";
  DROP TYPE "public"."enum_pages_blocks_testimonials_marquee_theme";
  DROP TYPE "public"."enum_pages_stmt_grid_source";
  DROP TYPE "public"."enum_pages_stmt_grid_theme";
  DROP TYPE "public"."enum_pages_stmt_links_links_link_type";
  DROP TYPE "public"."enum_pages_stmt_links_links_link_site_page";
  DROP TYPE "public"."enum_pages_stmt_links_theme";
  DROP TYPE "public"."enum_pages_feat_work_theme";
  DROP TYPE "public"."enum_pages_blocks_form_block_theme";
  DROP TYPE "public"."enum_pages_blocks_newsletter_signup_theme";
  DROP TYPE "public"."enum___pages_v_aud_tabs_v_tabs_visual_type";
  DROP TYPE "public"."enum___pages_v_aud_tabs_v_theme";
  DROP TYPE "public"."enum___pages_v_ind_work_v_theme";
  DROP TYPE "public"."enum__pages_v_blocks_testimonials_marquee_links_link_type";
  DROP TYPE "public"."enum__pages_v_blocks_testimonials_marquee_links_link_site_page";
  DROP TYPE "public"."enum__pages_v_blocks_testimonials_marquee_links_link_appearance";
  DROP TYPE "public"."enum__pages_v_blocks_testimonials_marquee_theme";
  DROP TYPE "public"."enum___pages_v_stmt_grid_v_source";
  DROP TYPE "public"."enum___pages_v_stmt_grid_v_theme";
  DROP TYPE "public"."enum___pages_v_stmt_links_v_links_link_type";
  DROP TYPE "public"."enum___pages_v_stmt_links_v_links_link_site_page";
  DROP TYPE "public"."enum___pages_v_stmt_links_v_theme";
  DROP TYPE "public"."enum___pages_v_feat_work_v_theme";
  DROP TYPE "public"."enum__pages_v_blocks_form_block_theme";
  DROP TYPE "public"."enum__pages_v_blocks_newsletter_signup_theme";
  DROP TYPE "public"."enum_posts_feat_work_theme";
  DROP TYPE "public"."enum___posts_v_feat_work_v_theme";
  DROP TYPE "public"."enum_work_pages_aud_tabs_tabs_visual_type";
  DROP TYPE "public"."enum_work_pages_aud_tabs_theme";
  DROP TYPE "public"."enum_work_pages_ind_work_theme";
  DROP TYPE "public"."enum_work_pages_stmt_grid_source";
  DROP TYPE "public"."enum_work_pages_stmt_grid_story_scope";
  DROP TYPE "public"."enum_work_pages_stmt_grid_theme";
  DROP TYPE "public"."enum_work_pages_stmt_links_links_link_type";
  DROP TYPE "public"."enum_work_pages_stmt_links_links_link_site_page";
  DROP TYPE "public"."enum_work_pages_stmt_links_theme";
  DROP TYPE "public"."enum_wp_metrics_source";
  DROP TYPE "public"."enum_wp_metrics_layout";
  DROP TYPE "public"."enum_wp_metrics_theme";
  DROP TYPE "public"."enum___work_pages_v_aud_tabs_v_tabs_visual_type";
  DROP TYPE "public"."enum___work_pages_v_aud_tabs_v_theme";
  DROP TYPE "public"."enum___work_pages_v_ind_work_v_theme";
  DROP TYPE "public"."enum___work_pages_v_stmt_grid_v_source";
  DROP TYPE "public"."enum___work_pages_v_stmt_grid_v_story_scope";
  DROP TYPE "public"."enum___work_pages_v_stmt_grid_v_theme";
  DROP TYPE "public"."enum___work_pages_v_stmt_links_v_links_link_type";
  DROP TYPE "public"."enum___work_pages_v_stmt_links_v_links_link_site_page";
  DROP TYPE "public"."enum___work_pages_v_stmt_links_v_theme";
  DROP TYPE "public"."enum__wp_metrics_v_source";
  DROP TYPE "public"."enum__wp_metrics_v_layout";
  DROP TYPE "public"."enum__wp_metrics_v_theme";
  DROP TYPE "public"."enum_lab_pages_stmt_grid_source";
  DROP TYPE "public"."enum_lab_pages_stmt_grid_story_scope";
  DROP TYPE "public"."enum_lab_pages_stmt_grid_theme";
  DROP TYPE "public"."enum___lab_pages_v_stmt_grid_v_source";
  DROP TYPE "public"."enum___lab_pages_v_stmt_grid_v_story_scope";
  DROP TYPE "public"."enum___lab_pages_v_stmt_grid_v_theme";
  DROP TYPE "public"."enum_expertise_pages_aud_tabs_tabs_visual_type";
  DROP TYPE "public"."enum_expertise_pages_aud_tabs_theme";
  DROP TYPE "public"."enum_expertise_pages_stmt_grid_source";
  DROP TYPE "public"."enum_expertise_pages_stmt_grid_theme";
  DROP TYPE "public"."enum_expertise_pages_feat_work_theme";
  DROP TYPE "public"."enum_expertise_pages_blocks_form_block_theme";
  DROP TYPE "public"."enum___expertise_pages_v_aud_tabs_v_tabs_visual_type";
  DROP TYPE "public"."enum___expertise_pages_v_aud_tabs_v_theme";
  DROP TYPE "public"."enum___expertise_pages_v_stmt_grid_v_source";
  DROP TYPE "public"."enum___expertise_pages_v_stmt_grid_v_theme";
  DROP TYPE "public"."enum___expertise_pages_v_feat_work_v_theme";
  DROP TYPE "public"."enum__expertise_pages_v_blocks_form_block_theme";
  DROP TYPE "public"."enum_audience_pages_aud_tabs_tabs_visual_type";
  DROP TYPE "public"."enum_audience_pages_aud_tabs_theme";
  DROP TYPE "public"."enum_audience_pages_stmt_grid_source";
  DROP TYPE "public"."enum_audience_pages_stmt_grid_theme";
  DROP TYPE "public"."enum_audience_pages_feat_work_theme";
  DROP TYPE "public"."enum_audience_pages_blocks_form_block_theme";
  DROP TYPE "public"."enum___audience_pages_v_aud_tabs_v_tabs_visual_type";
  DROP TYPE "public"."enum___audience_pages_v_aud_tabs_v_theme";
  DROP TYPE "public"."enum___audience_pages_v_stmt_grid_v_source";
  DROP TYPE "public"."enum___audience_pages_v_stmt_grid_v_theme";
  DROP TYPE "public"."enum___audience_pages_v_feat_work_v_theme";
  DROP TYPE "public"."enum__audience_pages_v_blocks_form_block_theme";
  DROP TYPE "public"."enum_home_stmt_grid_source";
  DROP TYPE "public"."enum_home_stmt_grid_theme";
  DROP TYPE "public"."enum_home_stmt_links_links_link_type";
  DROP TYPE "public"."enum_home_stmt_links_links_link_site_page";
  DROP TYPE "public"."enum_home_stmt_links_theme";
  DROP TYPE "public"."enum_home_blocks_archive_populate_by";
  DROP TYPE "public"."enum_home_blocks_archive_relation_to";
  DROP TYPE "public"."enum_home_blocks_archive_card_variant";
  DROP TYPE "public"."enum_home_blocks_archive_theme";
  DROP TYPE "public"."enum_home_blocks_cta_links_link_type";
  DROP TYPE "public"."enum_home_blocks_cta_links_link_site_page";
  DROP TYPE "public"."enum_home_blocks_cta_links_link_appearance";
  DROP TYPE "public"."enum_home_blocks_cta_theme";
  DROP TYPE "public"."enum_home_blocks_form_block_theme";
  DROP TYPE "public"."enum_home_blocks_newsletter_signup_theme";
  DROP TYPE "public"."enum_home_blocks_content_columns_size";
  DROP TYPE "public"."enum_home_blocks_content_columns_link_type";
  DROP TYPE "public"."enum_home_blocks_content_columns_link_site_page";
  DROP TYPE "public"."enum_home_blocks_content_columns_link_appearance";
  DROP TYPE "public"."enum_home_blocks_content_theme";
  DROP TYPE "public"."enum___home_v_stmt_grid_v_source";
  DROP TYPE "public"."enum___home_v_stmt_grid_v_theme";
  DROP TYPE "public"."enum___home_v_stmt_links_v_links_link_type";
  DROP TYPE "public"."enum___home_v_stmt_links_v_links_link_site_page";
  DROP TYPE "public"."enum___home_v_stmt_links_v_theme";
  DROP TYPE "public"."enum__home_v_blocks_archive_populate_by";
  DROP TYPE "public"."enum__home_v_blocks_archive_relation_to";
  DROP TYPE "public"."enum__home_v_blocks_archive_card_variant";
  DROP TYPE "public"."enum__home_v_blocks_archive_theme";
  DROP TYPE "public"."enum__home_v_blocks_cta_links_link_type";
  DROP TYPE "public"."enum__home_v_blocks_cta_links_link_site_page";
  DROP TYPE "public"."enum__home_v_blocks_cta_links_link_appearance";
  DROP TYPE "public"."enum__home_v_blocks_cta_theme";
  DROP TYPE "public"."enum__home_v_blocks_form_block_theme";
  DROP TYPE "public"."enum__home_v_blocks_newsletter_signup_theme";
  DROP TYPE "public"."enum__home_v_blocks_content_columns_size";
  DROP TYPE "public"."enum__home_v_blocks_content_columns_link_type";
  DROP TYPE "public"."enum__home_v_blocks_content_columns_link_site_page";
  DROP TYPE "public"."enum__home_v_blocks_content_columns_link_appearance";
  DROP TYPE "public"."enum__home_v_blocks_content_theme";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_aud_tabs_tabs_visual_type" AS ENUM('media', 'streakField');
  CREATE TYPE "public"."enum_pages_aud_tabs_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum_pages_ind_work_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum_pages_blocks_testimonials_marquee_links_link_type" AS ENUM('reference', 'site', 'custom');
  CREATE TYPE "public"."enum_pages_blocks_testimonials_marquee_links_link_site_page" AS ENUM('home', 'works-index', 'insights-index', 'lab-index');
  CREATE TYPE "public"."enum_pages_blocks_testimonials_marquee_links_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum_pages_blocks_testimonials_marquee_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum_pages_stmt_grid_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum_pages_stmt_grid_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum_pages_stmt_links_links_link_type" AS ENUM('reference', 'site', 'custom');
  CREATE TYPE "public"."enum_pages_stmt_links_links_link_site_page" AS ENUM('home', 'works-index', 'insights-index', 'lab-index');
  CREATE TYPE "public"."enum_pages_stmt_links_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum_pages_feat_work_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum_pages_blocks_form_block_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum_pages_blocks_newsletter_signup_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum___pages_v_aud_tabs_v_tabs_visual_type" AS ENUM('media', 'streakField');
  CREATE TYPE "public"."enum___pages_v_aud_tabs_v_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum___pages_v_ind_work_v_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum__pages_v_blocks_testimonials_marquee_links_link_type" AS ENUM('reference', 'site', 'custom');
  CREATE TYPE "public"."enum__pages_v_blocks_testimonials_marquee_links_link_site_page" AS ENUM('home', 'works-index', 'insights-index', 'lab-index');
  CREATE TYPE "public"."enum__pages_v_blocks_testimonials_marquee_links_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum__pages_v_blocks_testimonials_marquee_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum___pages_v_stmt_grid_v_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum___pages_v_stmt_grid_v_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum___pages_v_stmt_links_v_links_link_type" AS ENUM('reference', 'site', 'custom');
  CREATE TYPE "public"."enum___pages_v_stmt_links_v_links_link_site_page" AS ENUM('home', 'works-index', 'insights-index', 'lab-index');
  CREATE TYPE "public"."enum___pages_v_stmt_links_v_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum___pages_v_feat_work_v_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum__pages_v_blocks_form_block_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum__pages_v_blocks_newsletter_signup_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum_posts_feat_work_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum___posts_v_feat_work_v_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum_work_pages_aud_tabs_tabs_visual_type" AS ENUM('media', 'streakField');
  CREATE TYPE "public"."enum_work_pages_aud_tabs_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum_work_pages_ind_work_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum_work_pages_stmt_grid_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum_work_pages_stmt_grid_story_scope" AS ENUM('overview', 'section', 'beat');
  CREATE TYPE "public"."enum_work_pages_stmt_grid_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum_work_pages_stmt_links_links_link_type" AS ENUM('reference', 'site', 'custom');
  CREATE TYPE "public"."enum_work_pages_stmt_links_links_link_site_page" AS ENUM('home', 'works-index', 'insights-index', 'lab-index');
  CREATE TYPE "public"."enum_work_pages_stmt_links_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum_wp_metrics_source" AS ENUM('featured-public', 'all-public');
  CREATE TYPE "public"."enum_wp_metrics_layout" AS ENUM('grid', 'row', 'statement', 'editorial');
  CREATE TYPE "public"."enum_wp_metrics_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum___work_pages_v_aud_tabs_v_tabs_visual_type" AS ENUM('media', 'streakField');
  CREATE TYPE "public"."enum___work_pages_v_aud_tabs_v_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum___work_pages_v_ind_work_v_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum___work_pages_v_stmt_grid_v_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum___work_pages_v_stmt_grid_v_story_scope" AS ENUM('overview', 'section', 'beat');
  CREATE TYPE "public"."enum___work_pages_v_stmt_grid_v_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum___work_pages_v_stmt_links_v_links_link_type" AS ENUM('reference', 'site', 'custom');
  CREATE TYPE "public"."enum___work_pages_v_stmt_links_v_links_link_site_page" AS ENUM('home', 'works-index', 'insights-index', 'lab-index');
  CREATE TYPE "public"."enum___work_pages_v_stmt_links_v_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum__wp_metrics_v_source" AS ENUM('featured-public', 'all-public');
  CREATE TYPE "public"."enum__wp_metrics_v_layout" AS ENUM('grid', 'row', 'statement', 'editorial');
  CREATE TYPE "public"."enum__wp_metrics_v_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum_lab_pages_stmt_grid_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum_lab_pages_stmt_grid_story_scope" AS ENUM('overview', 'section', 'beat');
  CREATE TYPE "public"."enum_lab_pages_stmt_grid_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum___lab_pages_v_stmt_grid_v_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum___lab_pages_v_stmt_grid_v_story_scope" AS ENUM('overview', 'section', 'beat');
  CREATE TYPE "public"."enum___lab_pages_v_stmt_grid_v_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum_expertise_pages_aud_tabs_tabs_visual_type" AS ENUM('media', 'streakField');
  CREATE TYPE "public"."enum_expertise_pages_aud_tabs_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum_expertise_pages_stmt_grid_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum_expertise_pages_stmt_grid_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum_expertise_pages_feat_work_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum_expertise_pages_blocks_form_block_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum___expertise_pages_v_aud_tabs_v_tabs_visual_type" AS ENUM('media', 'streakField');
  CREATE TYPE "public"."enum___expertise_pages_v_aud_tabs_v_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum___expertise_pages_v_stmt_grid_v_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum___expertise_pages_v_stmt_grid_v_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum___expertise_pages_v_feat_work_v_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum__expertise_pages_v_blocks_form_block_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum_audience_pages_aud_tabs_tabs_visual_type" AS ENUM('media', 'streakField');
  CREATE TYPE "public"."enum_audience_pages_aud_tabs_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum_audience_pages_stmt_grid_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum_audience_pages_stmt_grid_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum_audience_pages_feat_work_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum_audience_pages_blocks_form_block_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum___audience_pages_v_aud_tabs_v_tabs_visual_type" AS ENUM('media', 'streakField');
  CREATE TYPE "public"."enum___audience_pages_v_aud_tabs_v_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum___audience_pages_v_stmt_grid_v_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum___audience_pages_v_stmt_grid_v_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum___audience_pages_v_feat_work_v_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum__audience_pages_v_blocks_form_block_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum_home_stmt_grid_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum_home_stmt_grid_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum_home_stmt_links_links_link_type" AS ENUM('reference', 'site', 'custom');
  CREATE TYPE "public"."enum_home_stmt_links_links_link_site_page" AS ENUM('home', 'works-index', 'insights-index', 'lab-index');
  CREATE TYPE "public"."enum_home_stmt_links_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum_home_blocks_archive_populate_by" AS ENUM('collection', 'selection');
  CREATE TYPE "public"."enum_home_blocks_archive_relation_to" AS ENUM('posts');
  CREATE TYPE "public"."enum_home_blocks_archive_card_variant" AS ENUM('contained', 'open', 'overlay', 'split', 'backdrop');
  CREATE TYPE "public"."enum_home_blocks_archive_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum_home_blocks_cta_links_link_type" AS ENUM('reference', 'site', 'custom');
  CREATE TYPE "public"."enum_home_blocks_cta_links_link_site_page" AS ENUM('home', 'works-index', 'insights-index', 'lab-index');
  CREATE TYPE "public"."enum_home_blocks_cta_links_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum_home_blocks_cta_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum_home_blocks_form_block_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum_home_blocks_newsletter_signup_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum_home_blocks_content_columns_size" AS ENUM('oneThird', 'half', 'twoThirds', 'full');
  CREATE TYPE "public"."enum_home_blocks_content_columns_link_type" AS ENUM('reference', 'site', 'custom');
  CREATE TYPE "public"."enum_home_blocks_content_columns_link_site_page" AS ENUM('home', 'works-index', 'insights-index', 'lab-index');
  CREATE TYPE "public"."enum_home_blocks_content_columns_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum_home_blocks_content_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum___home_v_stmt_grid_v_source" AS ENUM('custom', 'context', 'challenge', 'strategy', 'approach', 'outcome-summary', 'learnings');
  CREATE TYPE "public"."enum___home_v_stmt_grid_v_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum___home_v_stmt_links_v_links_link_type" AS ENUM('reference', 'site', 'custom');
  CREATE TYPE "public"."enum___home_v_stmt_links_v_links_link_site_page" AS ENUM('home', 'works-index', 'insights-index', 'lab-index');
  CREATE TYPE "public"."enum___home_v_stmt_links_v_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum__home_v_blocks_archive_populate_by" AS ENUM('collection', 'selection');
  CREATE TYPE "public"."enum__home_v_blocks_archive_relation_to" AS ENUM('posts');
  CREATE TYPE "public"."enum__home_v_blocks_archive_card_variant" AS ENUM('contained', 'open', 'overlay', 'split', 'backdrop');
  CREATE TYPE "public"."enum__home_v_blocks_archive_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum__home_v_blocks_cta_links_link_type" AS ENUM('reference', 'site', 'custom');
  CREATE TYPE "public"."enum__home_v_blocks_cta_links_link_site_page" AS ENUM('home', 'works-index', 'insights-index', 'lab-index');
  CREATE TYPE "public"."enum__home_v_blocks_cta_links_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum__home_v_blocks_cta_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum__home_v_blocks_form_block_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum__home_v_blocks_newsletter_signup_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TYPE "public"."enum__home_v_blocks_content_columns_size" AS ENUM('oneThird', 'half', 'twoThirds', 'full');
  CREATE TYPE "public"."enum__home_v_blocks_content_columns_link_type" AS ENUM('reference', 'site', 'custom');
  CREATE TYPE "public"."enum__home_v_blocks_content_columns_link_site_page" AS ENUM('home', 'works-index', 'insights-index', 'lab-index');
  CREATE TYPE "public"."enum__home_v_blocks_content_columns_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum__home_v_blocks_content_theme" AS ENUM('default', 'inverted', 'neutral', 'brand');
  CREATE TABLE "pages_aud_tabs_tabs_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "pages_aud_tabs_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"intro" varchar,
  	"description" varchar,
  	"media_id" integer,
  	"visual_type" "enum_pages_aud_tabs_tabs_visual_type",
  	"shader_studio_id" integer,
  	"shader_preset" varchar,
  	"shader_seed" numeric,
  	"shader_speed" numeric,
  	"shader_intensity" numeric,
  	"shader_release_id" integer,
  	"shader_surface" "enum_visual_surface" DEFAULT 'auto',
  	"shader_pointer_interaction" boolean DEFAULT false,
  	"shader_poster_media_id" integer
  );
  
  CREATE TABLE "pages_aud_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar DEFAULT 'Different roles see different parts of the problem. We help bring the whole picture into focus.',
  	"theme" "enum_pages_aud_tabs_theme" DEFAULT 'inverted',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_ind_work_industries" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"industry_id" integer,
  	"subheading" varchar,
  	"second_line" varchar,
  	"work_id" integer
  );
  
  CREATE TABLE "pages_ind_work" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar DEFAULT 'Our work in',
  	"theme" "enum_pages_ind_work_theme" DEFAULT 'inverted',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_testimonials_marquee_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_pages_blocks_testimonials_marquee_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_site_page" "enum_pages_blocks_testimonials_marquee_links_link_site_page",
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum_pages_blocks_testimonials_marquee_links_link_appearance" DEFAULT 'default'
  );
  
  CREATE TABLE "pages_blocks_testimonials_marquee" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"rich_text" jsonb,
  	"theme" "enum_pages_blocks_testimonials_marquee_theme" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_stmt_grid_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"title" varchar,
  	"description" varchar
  );
  
  CREATE TABLE "pages_stmt_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"source" "enum_pages_stmt_grid_source" DEFAULT 'custom',
  	"statement" jsonb,
  	"footnote" varchar,
  	"theme" "enum_pages_stmt_grid_theme" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_stmt_links_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_pages_stmt_links_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_site_page" "enum_pages_stmt_links_links_link_site_page",
  	"link_url" varchar,
  	"link_label" varchar
  );
  
  CREATE TABLE "pages_stmt_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"statement" jsonb,
  	"theme" "enum_pages_stmt_links_theme" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_feat_work" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar DEFAULT 'Featured Work',
  	"theme" "enum_pages_feat_work_theme" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_form_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"form_id" integer,
  	"enable_intro" boolean,
  	"intro_content" jsonb,
  	"theme" "enum_pages_blocks_form_block_theme" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_newsletter_signup" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar DEFAULT 'Newsletter',
  	"heading" varchar DEFAULT 'Notes on clarity, trust, and momentum',
  	"body" varchar DEFAULT 'Occasional letters from the studio on making complex organizations make sense. No noise — unsubscribe anytime.',
  	"button_label" varchar DEFAULT 'Subscribe',
  	"audience_id" integer,
  	"theme" "enum_pages_blocks_newsletter_signup_theme" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "__pages_v_aud_tabs_v_tabs_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "__pages_v_aud_tabs_v_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"intro" varchar,
  	"description" varchar,
  	"media_id" integer,
  	"visual_type" "enum___pages_v_aud_tabs_v_tabs_visual_type",
  	"shader_studio_id" integer,
  	"shader_preset" varchar,
  	"shader_seed" numeric,
  	"shader_speed" numeric,
  	"shader_intensity" numeric,
  	"shader_release_id" integer,
  	"shader_surface" "enum_visual_surface" DEFAULT 'auto',
  	"shader_pointer_interaction" boolean DEFAULT false,
  	"shader_poster_media_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "__pages_v_aud_tabs_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar DEFAULT 'Different roles see different parts of the problem. We help bring the whole picture into focus.',
  	"theme" "enum___pages_v_aud_tabs_v_theme" DEFAULT 'inverted',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "__pages_v_ind_work_v_industries" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"industry_id" integer,
  	"subheading" varchar,
  	"second_line" varchar,
  	"work_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "__pages_v_ind_work_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar DEFAULT 'Our work in',
  	"theme" "enum___pages_v_ind_work_v_theme" DEFAULT 'inverted',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_testimonials_marquee_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_type" "enum__pages_v_blocks_testimonials_marquee_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_site_page" "enum__pages_v_blocks_testimonials_marquee_links_link_site_page",
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum__pages_v_blocks_testimonials_marquee_links_link_appearance" DEFAULT 'default',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_testimonials_marquee" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"rich_text" jsonb,
  	"theme" "enum__pages_v_blocks_testimonials_marquee_theme" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "__pages_v_stmt_grid_v_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"title" varchar,
  	"description" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "__pages_v_stmt_grid_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"source" "enum___pages_v_stmt_grid_v_source" DEFAULT 'custom',
  	"statement" jsonb,
  	"footnote" varchar,
  	"theme" "enum___pages_v_stmt_grid_v_theme" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "__pages_v_stmt_links_v_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_type" "enum___pages_v_stmt_links_v_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_site_page" "enum___pages_v_stmt_links_v_links_link_site_page",
  	"link_url" varchar,
  	"link_label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "__pages_v_stmt_links_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"statement" jsonb,
  	"theme" "enum___pages_v_stmt_links_v_theme" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "__pages_v_feat_work_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar DEFAULT 'Featured Work',
  	"theme" "enum___pages_v_feat_work_v_theme" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_form_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"form_id" integer,
  	"enable_intro" boolean,
  	"intro_content" jsonb,
  	"theme" "enum__pages_v_blocks_form_block_theme" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_newsletter_signup" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar DEFAULT 'Newsletter',
  	"heading" varchar DEFAULT 'Notes on clarity, trust, and momentum',
  	"body" varchar DEFAULT 'Occasional letters from the studio on making complex organizations make sense. No noise — unsubscribe anytime.',
  	"button_label" varchar DEFAULT 'Subscribe',
  	"audience_id" integer,
  	"theme" "enum__pages_v_blocks_newsletter_signup_theme" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "posts_feat_work" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar DEFAULT 'Featured Work',
  	"theme" "enum_posts_feat_work_theme" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "__posts_v_feat_work_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar DEFAULT 'Featured Work',
  	"theme" "enum___posts_v_feat_work_v_theme" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "work_pages_aud_tabs_tabs_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "work_pages_aud_tabs_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"intro" varchar,
  	"description" varchar,
  	"media_id" integer,
  	"visual_type" "enum_work_pages_aud_tabs_tabs_visual_type",
  	"shader_studio_id" integer,
  	"shader_preset" varchar,
  	"shader_seed" numeric,
  	"shader_speed" numeric,
  	"shader_intensity" numeric,
  	"shader_release_id" integer,
  	"shader_surface" "enum_visual_surface" DEFAULT 'auto',
  	"shader_pointer_interaction" boolean DEFAULT false,
  	"shader_poster_media_id" integer
  );
  
  CREATE TABLE "work_pages_aud_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar DEFAULT 'Different roles see different parts of the problem. We help bring the whole picture into focus.',
  	"browse_all_media" boolean DEFAULT false,
  	"theme" "enum_work_pages_aud_tabs_theme" DEFAULT 'inverted',
  	"block_name" varchar
  );
  
  CREATE TABLE "work_pages_ind_work_industries" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"industry_id" integer,
  	"subheading" varchar,
  	"second_line" varchar,
  	"work_id" integer
  );
  
  CREATE TABLE "work_pages_ind_work" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar DEFAULT 'Our work in',
  	"theme" "enum_work_pages_ind_work_theme" DEFAULT 'inverted',
  	"block_name" varchar
  );
  
  CREATE TABLE "work_pages_stmt_grid_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"title" varchar,
  	"description" varchar
  );
  
  CREATE TABLE "work_pages_stmt_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"source" "enum_work_pages_stmt_grid_source" DEFAULT 'custom',
  	"story_scope" "enum_work_pages_stmt_grid_story_scope" DEFAULT 'overview',
  	"story_beat_key" varchar,
  	"show_overrides" boolean DEFAULT false,
  	"statement" jsonb,
  	"footnote" varchar,
  	"browse_all_media" boolean DEFAULT false,
  	"theme" "enum_work_pages_stmt_grid_theme" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "work_pages_stmt_links_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_work_pages_stmt_links_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_site_page" "enum_work_pages_stmt_links_links_link_site_page",
  	"link_url" varchar,
  	"link_label" varchar
  );
  
  CREATE TABLE "work_pages_stmt_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"statement" jsonb,
  	"theme" "enum_work_pages_stmt_links_theme" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "wp_metrics" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"introduction" jsonb,
  	"source" "enum_wp_metrics_source" DEFAULT 'featured-public',
  	"layout" "enum_wp_metrics_layout" DEFAULT 'grid',
  	"theme" "enum_wp_metrics_theme" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "__work_pages_v_aud_tabs_v_tabs_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "__work_pages_v_aud_tabs_v_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"intro" varchar,
  	"description" varchar,
  	"media_id" integer,
  	"visual_type" "enum___work_pages_v_aud_tabs_v_tabs_visual_type",
  	"shader_studio_id" integer,
  	"shader_preset" varchar,
  	"shader_seed" numeric,
  	"shader_speed" numeric,
  	"shader_intensity" numeric,
  	"shader_release_id" integer,
  	"shader_surface" "enum_visual_surface" DEFAULT 'auto',
  	"shader_pointer_interaction" boolean DEFAULT false,
  	"shader_poster_media_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "__work_pages_v_aud_tabs_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar DEFAULT 'Different roles see different parts of the problem. We help bring the whole picture into focus.',
  	"browse_all_media" boolean DEFAULT false,
  	"theme" "enum___work_pages_v_aud_tabs_v_theme" DEFAULT 'inverted',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "__work_pages_v_ind_work_v_industries" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"industry_id" integer,
  	"subheading" varchar,
  	"second_line" varchar,
  	"work_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "__work_pages_v_ind_work_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar DEFAULT 'Our work in',
  	"theme" "enum___work_pages_v_ind_work_v_theme" DEFAULT 'inverted',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "__work_pages_v_stmt_grid_v_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"title" varchar,
  	"description" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "__work_pages_v_stmt_grid_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"source" "enum___work_pages_v_stmt_grid_v_source" DEFAULT 'custom',
  	"story_scope" "enum___work_pages_v_stmt_grid_v_story_scope" DEFAULT 'overview',
  	"story_beat_key" varchar,
  	"show_overrides" boolean DEFAULT false,
  	"statement" jsonb,
  	"footnote" varchar,
  	"browse_all_media" boolean DEFAULT false,
  	"theme" "enum___work_pages_v_stmt_grid_v_theme" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "__work_pages_v_stmt_links_v_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_type" "enum___work_pages_v_stmt_links_v_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_site_page" "enum___work_pages_v_stmt_links_v_links_link_site_page",
  	"link_url" varchar,
  	"link_label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "__work_pages_v_stmt_links_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"statement" jsonb,
  	"theme" "enum___work_pages_v_stmt_links_v_theme" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_wp_metrics_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"introduction" jsonb,
  	"source" "enum__wp_metrics_v_source" DEFAULT 'featured-public',
  	"layout" "enum__wp_metrics_v_layout" DEFAULT 'grid',
  	"theme" "enum__wp_metrics_v_theme" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "lab_pages_stmt_grid_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"title" varchar,
  	"description" varchar
  );
  
  CREATE TABLE "lab_pages_stmt_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"source" "enum_lab_pages_stmt_grid_source" DEFAULT 'custom',
  	"story_scope" "enum_lab_pages_stmt_grid_story_scope" DEFAULT 'overview',
  	"story_beat_key" varchar,
  	"show_overrides" boolean DEFAULT false,
  	"statement" jsonb,
  	"footnote" varchar,
  	"theme" "enum_lab_pages_stmt_grid_theme" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "__lab_pages_v_stmt_grid_v_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"title" varchar,
  	"description" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "__lab_pages_v_stmt_grid_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"source" "enum___lab_pages_v_stmt_grid_v_source" DEFAULT 'custom',
  	"story_scope" "enum___lab_pages_v_stmt_grid_v_story_scope" DEFAULT 'overview',
  	"story_beat_key" varchar,
  	"show_overrides" boolean DEFAULT false,
  	"statement" jsonb,
  	"footnote" varchar,
  	"theme" "enum___lab_pages_v_stmt_grid_v_theme" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "expertise_pages_aud_tabs_tabs_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "expertise_pages_aud_tabs_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"intro" varchar,
  	"description" varchar,
  	"media_id" integer,
  	"visual_type" "enum_expertise_pages_aud_tabs_tabs_visual_type",
  	"shader_studio_id" integer,
  	"shader_preset" varchar,
  	"shader_seed" numeric,
  	"shader_speed" numeric,
  	"shader_intensity" numeric,
  	"shader_release_id" integer,
  	"shader_surface" "enum_visual_surface" DEFAULT 'auto',
  	"shader_pointer_interaction" boolean DEFAULT false,
  	"shader_poster_media_id" integer
  );
  
  CREATE TABLE "expertise_pages_aud_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar DEFAULT 'Different roles see different parts of the problem. We help bring the whole picture into focus.',
  	"theme" "enum_expertise_pages_aud_tabs_theme" DEFAULT 'inverted',
  	"block_name" varchar
  );
  
  CREATE TABLE "expertise_pages_stmt_grid_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"title" varchar,
  	"description" varchar
  );
  
  CREATE TABLE "expertise_pages_stmt_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"source" "enum_expertise_pages_stmt_grid_source" DEFAULT 'custom',
  	"statement" jsonb,
  	"footnote" varchar,
  	"theme" "enum_expertise_pages_stmt_grid_theme" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "expertise_pages_feat_work" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar DEFAULT 'Featured Work',
  	"theme" "enum_expertise_pages_feat_work_theme" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "expertise_pages_blocks_form_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"form_id" integer,
  	"enable_intro" boolean,
  	"intro_content" jsonb,
  	"theme" "enum_expertise_pages_blocks_form_block_theme" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "__expertise_pages_v_aud_tabs_v_tabs_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "__expertise_pages_v_aud_tabs_v_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"intro" varchar,
  	"description" varchar,
  	"media_id" integer,
  	"visual_type" "enum___expertise_pages_v_aud_tabs_v_tabs_visual_type",
  	"shader_studio_id" integer,
  	"shader_preset" varchar,
  	"shader_seed" numeric,
  	"shader_speed" numeric,
  	"shader_intensity" numeric,
  	"shader_release_id" integer,
  	"shader_surface" "enum_visual_surface" DEFAULT 'auto',
  	"shader_pointer_interaction" boolean DEFAULT false,
  	"shader_poster_media_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "__expertise_pages_v_aud_tabs_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar DEFAULT 'Different roles see different parts of the problem. We help bring the whole picture into focus.',
  	"theme" "enum___expertise_pages_v_aud_tabs_v_theme" DEFAULT 'inverted',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "__expertise_pages_v_stmt_grid_v_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"title" varchar,
  	"description" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "__expertise_pages_v_stmt_grid_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"source" "enum___expertise_pages_v_stmt_grid_v_source" DEFAULT 'custom',
  	"statement" jsonb,
  	"footnote" varchar,
  	"theme" "enum___expertise_pages_v_stmt_grid_v_theme" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "__expertise_pages_v_feat_work_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar DEFAULT 'Featured Work',
  	"theme" "enum___expertise_pages_v_feat_work_v_theme" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_expertise_pages_v_blocks_form_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"form_id" integer,
  	"enable_intro" boolean,
  	"intro_content" jsonb,
  	"theme" "enum__expertise_pages_v_blocks_form_block_theme" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "audience_pages_aud_tabs_tabs_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "audience_pages_aud_tabs_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"intro" varchar,
  	"description" varchar,
  	"media_id" integer,
  	"visual_type" "enum_audience_pages_aud_tabs_tabs_visual_type",
  	"shader_studio_id" integer,
  	"shader_preset" varchar,
  	"shader_seed" numeric,
  	"shader_speed" numeric,
  	"shader_intensity" numeric,
  	"shader_release_id" integer,
  	"shader_surface" "enum_visual_surface" DEFAULT 'auto',
  	"shader_pointer_interaction" boolean DEFAULT false,
  	"shader_poster_media_id" integer
  );
  
  CREATE TABLE "audience_pages_aud_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar DEFAULT 'Different roles see different parts of the problem. We help bring the whole picture into focus.',
  	"theme" "enum_audience_pages_aud_tabs_theme" DEFAULT 'inverted',
  	"block_name" varchar
  );
  
  CREATE TABLE "audience_pages_stmt_grid_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"title" varchar,
  	"description" varchar
  );
  
  CREATE TABLE "audience_pages_stmt_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"source" "enum_audience_pages_stmt_grid_source" DEFAULT 'custom',
  	"statement" jsonb,
  	"footnote" varchar,
  	"theme" "enum_audience_pages_stmt_grid_theme" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "audience_pages_feat_work" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar DEFAULT 'Featured Work',
  	"theme" "enum_audience_pages_feat_work_theme" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "audience_pages_blocks_form_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"form_id" integer,
  	"enable_intro" boolean,
  	"intro_content" jsonb,
  	"theme" "enum_audience_pages_blocks_form_block_theme" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "__audience_pages_v_aud_tabs_v_tabs_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "__audience_pages_v_aud_tabs_v_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"intro" varchar,
  	"description" varchar,
  	"media_id" integer,
  	"visual_type" "enum___audience_pages_v_aud_tabs_v_tabs_visual_type",
  	"shader_studio_id" integer,
  	"shader_preset" varchar,
  	"shader_seed" numeric,
  	"shader_speed" numeric,
  	"shader_intensity" numeric,
  	"shader_release_id" integer,
  	"shader_surface" "enum_visual_surface" DEFAULT 'auto',
  	"shader_pointer_interaction" boolean DEFAULT false,
  	"shader_poster_media_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "__audience_pages_v_aud_tabs_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar DEFAULT 'Different roles see different parts of the problem. We help bring the whole picture into focus.',
  	"theme" "enum___audience_pages_v_aud_tabs_v_theme" DEFAULT 'inverted',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "__audience_pages_v_stmt_grid_v_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"title" varchar,
  	"description" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "__audience_pages_v_stmt_grid_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"source" "enum___audience_pages_v_stmt_grid_v_source" DEFAULT 'custom',
  	"statement" jsonb,
  	"footnote" varchar,
  	"theme" "enum___audience_pages_v_stmt_grid_v_theme" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "__audience_pages_v_feat_work_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar DEFAULT 'Featured Work',
  	"theme" "enum___audience_pages_v_feat_work_v_theme" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_audience_pages_v_blocks_form_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"form_id" integer,
  	"enable_intro" boolean,
  	"intro_content" jsonb,
  	"theme" "enum__audience_pages_v_blocks_form_block_theme" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "home_stmt_grid_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"title" varchar,
  	"description" varchar
  );
  
  CREATE TABLE "home_stmt_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"source" "enum_home_stmt_grid_source" DEFAULT 'custom',
  	"statement" jsonb,
  	"footnote" varchar,
  	"theme" "enum_home_stmt_grid_theme" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "home_stmt_links_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_home_stmt_links_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_site_page" "enum_home_stmt_links_links_link_site_page",
  	"link_url" varchar,
  	"link_label" varchar
  );
  
  CREATE TABLE "home_stmt_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"statement" jsonb,
  	"theme" "enum_home_stmt_links_theme" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "home_blocks_archive" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"intro_content" jsonb,
  	"populate_by" "enum_home_blocks_archive_populate_by" DEFAULT 'collection',
  	"relation_to" "enum_home_blocks_archive_relation_to" DEFAULT 'posts',
  	"limit" numeric DEFAULT 10,
  	"card_variant" "enum_home_blocks_archive_card_variant" DEFAULT 'split',
  	"theme" "enum_home_blocks_archive_theme" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "home_blocks_cta_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_home_blocks_cta_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_site_page" "enum_home_blocks_cta_links_link_site_page",
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum_home_blocks_cta_links_link_appearance" DEFAULT 'default'
  );
  
  CREATE TABLE "home_blocks_cta" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"rich_text" jsonb,
  	"theme" "enum_home_blocks_cta_theme" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "home_blocks_form_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"form_id" integer,
  	"enable_intro" boolean,
  	"intro_content" jsonb,
  	"theme" "enum_home_blocks_form_block_theme" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "home_blocks_newsletter_signup" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar DEFAULT 'Newsletter',
  	"heading" varchar DEFAULT 'Notes on clarity, trust, and momentum',
  	"body" varchar DEFAULT 'Occasional letters from the studio on making complex organizations make sense. No noise — unsubscribe anytime.',
  	"button_label" varchar DEFAULT 'Subscribe',
  	"audience_id" integer,
  	"theme" "enum_home_blocks_newsletter_signup_theme" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "home_blocks_content_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"size" "enum_home_blocks_content_columns_size" DEFAULT 'oneThird',
  	"rich_text" jsonb,
  	"enable_link" boolean,
  	"link_type" "enum_home_blocks_content_columns_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_site_page" "enum_home_blocks_content_columns_link_site_page",
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum_home_blocks_content_columns_link_appearance" DEFAULT 'default'
  );
  
  CREATE TABLE "home_blocks_content" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"theme" "enum_home_blocks_content_theme" DEFAULT 'default',
  	"block_name" varchar
  );
  
  CREATE TABLE "__home_v_stmt_grid_v_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"title" varchar,
  	"description" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "__home_v_stmt_grid_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"source" "enum___home_v_stmt_grid_v_source" DEFAULT 'custom',
  	"statement" jsonb,
  	"footnote" varchar,
  	"theme" "enum___home_v_stmt_grid_v_theme" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "__home_v_stmt_links_v_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_type" "enum___home_v_stmt_links_v_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_site_page" "enum___home_v_stmt_links_v_links_link_site_page",
  	"link_url" varchar,
  	"link_label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "__home_v_stmt_links_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"statement" jsonb,
  	"theme" "enum___home_v_stmt_links_v_theme" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_home_v_blocks_archive" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"intro_content" jsonb,
  	"populate_by" "enum__home_v_blocks_archive_populate_by" DEFAULT 'collection',
  	"relation_to" "enum__home_v_blocks_archive_relation_to" DEFAULT 'posts',
  	"limit" numeric DEFAULT 10,
  	"card_variant" "enum__home_v_blocks_archive_card_variant" DEFAULT 'split',
  	"theme" "enum__home_v_blocks_archive_theme" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_home_v_blocks_cta_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_type" "enum__home_v_blocks_cta_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_site_page" "enum__home_v_blocks_cta_links_link_site_page",
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum__home_v_blocks_cta_links_link_appearance" DEFAULT 'default',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_home_v_blocks_cta" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"rich_text" jsonb,
  	"theme" "enum__home_v_blocks_cta_theme" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_home_v_blocks_form_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"form_id" integer,
  	"enable_intro" boolean,
  	"intro_content" jsonb,
  	"theme" "enum__home_v_blocks_form_block_theme" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_home_v_blocks_newsletter_signup" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar DEFAULT 'Newsletter',
  	"heading" varchar DEFAULT 'Notes on clarity, trust, and momentum',
  	"body" varchar DEFAULT 'Occasional letters from the studio on making complex organizations make sense. No noise — unsubscribe anytime.',
  	"button_label" varchar DEFAULT 'Subscribe',
  	"audience_id" integer,
  	"theme" "enum__home_v_blocks_newsletter_signup_theme" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_home_v_blocks_content_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"size" "enum__home_v_blocks_content_columns_size" DEFAULT 'oneThird',
  	"rich_text" jsonb,
  	"enable_link" boolean,
  	"link_type" "enum__home_v_blocks_content_columns_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_site_page" "enum__home_v_blocks_content_columns_link_site_page",
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum__home_v_blocks_content_columns_link_appearance" DEFAULT 'default',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_home_v_blocks_content" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"theme" "enum__home_v_blocks_content_theme" DEFAULT 'default',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "home_rels" ADD COLUMN "categories_id" integer;
  ALTER TABLE "_home_v_rels" ADD COLUMN "categories_id" integer;
  ALTER TABLE "pages_aud_tabs_tabs_items" ADD CONSTRAINT "pages_aud_tabs_tabs_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_aud_tabs_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_aud_tabs_tabs" ADD CONSTRAINT "pages_aud_tabs_tabs_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_aud_tabs_tabs" ADD CONSTRAINT "pages_aud_tabs_tabs_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_aud_tabs_tabs" ADD CONSTRAINT "pages_aud_tabs_tabs_shader_release_id_streak_releases_id_fk" FOREIGN KEY ("shader_release_id") REFERENCES "public"."streak_releases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_aud_tabs_tabs" ADD CONSTRAINT "pages_aud_tabs_tabs_shader_poster_media_id_media_id_fk" FOREIGN KEY ("shader_poster_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_aud_tabs_tabs" ADD CONSTRAINT "pages_aud_tabs_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_aud_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_aud_tabs" ADD CONSTRAINT "pages_aud_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_ind_work_industries" ADD CONSTRAINT "pages_ind_work_industries_industry_id_industries_id_fk" FOREIGN KEY ("industry_id") REFERENCES "public"."industries"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_ind_work_industries" ADD CONSTRAINT "pages_ind_work_industries_work_id_work_pages_id_fk" FOREIGN KEY ("work_id") REFERENCES "public"."work_pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_ind_work_industries" ADD CONSTRAINT "pages_ind_work_industries_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_ind_work"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_ind_work" ADD CONSTRAINT "pages_ind_work_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_testimonials_marquee_links" ADD CONSTRAINT "pages_blocks_testimonials_marquee_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_testimonials_marquee"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_testimonials_marquee" ADD CONSTRAINT "pages_blocks_testimonials_marquee_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_stmt_grid_cards" ADD CONSTRAINT "pages_stmt_grid_cards_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_stmt_grid_cards" ADD CONSTRAINT "pages_stmt_grid_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_stmt_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_stmt_grid" ADD CONSTRAINT "pages_stmt_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_stmt_links_links" ADD CONSTRAINT "pages_stmt_links_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_stmt_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_stmt_links" ADD CONSTRAINT "pages_stmt_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_feat_work" ADD CONSTRAINT "pages_feat_work_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_form_block" ADD CONSTRAINT "pages_blocks_form_block_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_form_block" ADD CONSTRAINT "pages_blocks_form_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_newsletter_signup" ADD CONSTRAINT "pages_blocks_newsletter_signup_audience_id_audiences_id_fk" FOREIGN KEY ("audience_id") REFERENCES "public"."audiences"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_newsletter_signup" ADD CONSTRAINT "pages_blocks_newsletter_signup_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__pages_v_aud_tabs_v_tabs_items" ADD CONSTRAINT "__pages_v_aud_tabs_v_tabs_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."__pages_v_aud_tabs_v_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__pages_v_aud_tabs_v_tabs" ADD CONSTRAINT "__pages_v_aud_tabs_v_tabs_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__pages_v_aud_tabs_v_tabs" ADD CONSTRAINT "__pages_v_aud_tabs_v_tabs_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__pages_v_aud_tabs_v_tabs" ADD CONSTRAINT "__pages_v_aud_tabs_v_tabs_shader_release_id_streak_releases_id_fk" FOREIGN KEY ("shader_release_id") REFERENCES "public"."streak_releases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__pages_v_aud_tabs_v_tabs" ADD CONSTRAINT "__pages_v_aud_tabs_v_tabs_shader_poster_media_id_media_id_fk" FOREIGN KEY ("shader_poster_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__pages_v_aud_tabs_v_tabs" ADD CONSTRAINT "__pages_v_aud_tabs_v_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."__pages_v_aud_tabs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__pages_v_aud_tabs_v" ADD CONSTRAINT "__pages_v_aud_tabs_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__pages_v_ind_work_v_industries" ADD CONSTRAINT "__pages_v_ind_work_v_industries_industry_id_industries_id_fk" FOREIGN KEY ("industry_id") REFERENCES "public"."industries"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__pages_v_ind_work_v_industries" ADD CONSTRAINT "__pages_v_ind_work_v_industries_work_id_work_pages_id_fk" FOREIGN KEY ("work_id") REFERENCES "public"."work_pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__pages_v_ind_work_v_industries" ADD CONSTRAINT "__pages_v_ind_work_v_industries_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."__pages_v_ind_work_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__pages_v_ind_work_v" ADD CONSTRAINT "__pages_v_ind_work_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_testimonials_marquee_links" ADD CONSTRAINT "_pages_v_blocks_testimonials_marquee_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_testimonials_marquee"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_testimonials_marquee" ADD CONSTRAINT "_pages_v_blocks_testimonials_marquee_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__pages_v_stmt_grid_v_cards" ADD CONSTRAINT "__pages_v_stmt_grid_v_cards_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__pages_v_stmt_grid_v_cards" ADD CONSTRAINT "__pages_v_stmt_grid_v_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."__pages_v_stmt_grid_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__pages_v_stmt_grid_v" ADD CONSTRAINT "__pages_v_stmt_grid_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__pages_v_stmt_links_v_links" ADD CONSTRAINT "__pages_v_stmt_links_v_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."__pages_v_stmt_links_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__pages_v_stmt_links_v" ADD CONSTRAINT "__pages_v_stmt_links_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__pages_v_feat_work_v" ADD CONSTRAINT "__pages_v_feat_work_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_form_block" ADD CONSTRAINT "_pages_v_blocks_form_block_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_form_block" ADD CONSTRAINT "_pages_v_blocks_form_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_newsletter_signup" ADD CONSTRAINT "_pages_v_blocks_newsletter_signup_audience_id_audiences_id_fk" FOREIGN KEY ("audience_id") REFERENCES "public"."audiences"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_newsletter_signup" ADD CONSTRAINT "_pages_v_blocks_newsletter_signup_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_feat_work" ADD CONSTRAINT "posts_feat_work_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__posts_v_feat_work_v" ADD CONSTRAINT "__posts_v_feat_work_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "work_pages_aud_tabs_tabs_items" ADD CONSTRAINT "work_pages_aud_tabs_tabs_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."work_pages_aud_tabs_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "work_pages_aud_tabs_tabs" ADD CONSTRAINT "work_pages_aud_tabs_tabs_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "work_pages_aud_tabs_tabs" ADD CONSTRAINT "work_pages_aud_tabs_tabs_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "work_pages_aud_tabs_tabs" ADD CONSTRAINT "work_pages_aud_tabs_tabs_shader_release_id_streak_releases_id_fk" FOREIGN KEY ("shader_release_id") REFERENCES "public"."streak_releases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "work_pages_aud_tabs_tabs" ADD CONSTRAINT "work_pages_aud_tabs_tabs_shader_poster_media_id_media_id_fk" FOREIGN KEY ("shader_poster_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "work_pages_aud_tabs_tabs" ADD CONSTRAINT "work_pages_aud_tabs_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."work_pages_aud_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "work_pages_aud_tabs" ADD CONSTRAINT "work_pages_aud_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."work_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "work_pages_ind_work_industries" ADD CONSTRAINT "work_pages_ind_work_industries_industry_id_industries_id_fk" FOREIGN KEY ("industry_id") REFERENCES "public"."industries"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "work_pages_ind_work_industries" ADD CONSTRAINT "work_pages_ind_work_industries_work_id_work_pages_id_fk" FOREIGN KEY ("work_id") REFERENCES "public"."work_pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "work_pages_ind_work_industries" ADD CONSTRAINT "work_pages_ind_work_industries_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."work_pages_ind_work"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "work_pages_ind_work" ADD CONSTRAINT "work_pages_ind_work_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."work_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "work_pages_stmt_grid_cards" ADD CONSTRAINT "work_pages_stmt_grid_cards_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "work_pages_stmt_grid_cards" ADD CONSTRAINT "work_pages_stmt_grid_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."work_pages_stmt_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "work_pages_stmt_grid" ADD CONSTRAINT "work_pages_stmt_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."work_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "work_pages_stmt_links_links" ADD CONSTRAINT "work_pages_stmt_links_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."work_pages_stmt_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "work_pages_stmt_links" ADD CONSTRAINT "work_pages_stmt_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."work_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "wp_metrics" ADD CONSTRAINT "wp_metrics_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."work_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__work_pages_v_aud_tabs_v_tabs_items" ADD CONSTRAINT "__work_pages_v_aud_tabs_v_tabs_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."__work_pages_v_aud_tabs_v_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__work_pages_v_aud_tabs_v_tabs" ADD CONSTRAINT "__work_pages_v_aud_tabs_v_tabs_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__work_pages_v_aud_tabs_v_tabs" ADD CONSTRAINT "__work_pages_v_aud_tabs_v_tabs_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__work_pages_v_aud_tabs_v_tabs" ADD CONSTRAINT "__work_pages_v_aud_tabs_v_tabs_shader_release_id_streak_releases_id_fk" FOREIGN KEY ("shader_release_id") REFERENCES "public"."streak_releases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__work_pages_v_aud_tabs_v_tabs" ADD CONSTRAINT "__work_pages_v_aud_tabs_v_tabs_shader_poster_media_id_media_id_fk" FOREIGN KEY ("shader_poster_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__work_pages_v_aud_tabs_v_tabs" ADD CONSTRAINT "__work_pages_v_aud_tabs_v_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."__work_pages_v_aud_tabs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__work_pages_v_aud_tabs_v" ADD CONSTRAINT "__work_pages_v_aud_tabs_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_work_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__work_pages_v_ind_work_v_industries" ADD CONSTRAINT "__work_pages_v_ind_work_v_industries_industry_id_industries_id_fk" FOREIGN KEY ("industry_id") REFERENCES "public"."industries"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__work_pages_v_ind_work_v_industries" ADD CONSTRAINT "__work_pages_v_ind_work_v_industries_work_id_work_pages_id_fk" FOREIGN KEY ("work_id") REFERENCES "public"."work_pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__work_pages_v_ind_work_v_industries" ADD CONSTRAINT "__work_pages_v_ind_work_v_industries_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."__work_pages_v_ind_work_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__work_pages_v_ind_work_v" ADD CONSTRAINT "__work_pages_v_ind_work_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_work_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__work_pages_v_stmt_grid_v_cards" ADD CONSTRAINT "__work_pages_v_stmt_grid_v_cards_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__work_pages_v_stmt_grid_v_cards" ADD CONSTRAINT "__work_pages_v_stmt_grid_v_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."__work_pages_v_stmt_grid_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__work_pages_v_stmt_grid_v" ADD CONSTRAINT "__work_pages_v_stmt_grid_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_work_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__work_pages_v_stmt_links_v_links" ADD CONSTRAINT "__work_pages_v_stmt_links_v_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."__work_pages_v_stmt_links_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__work_pages_v_stmt_links_v" ADD CONSTRAINT "__work_pages_v_stmt_links_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_work_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_wp_metrics_v" ADD CONSTRAINT "_wp_metrics_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_work_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lab_pages_stmt_grid_cards" ADD CONSTRAINT "lab_pages_stmt_grid_cards_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "lab_pages_stmt_grid_cards" ADD CONSTRAINT "lab_pages_stmt_grid_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lab_pages_stmt_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lab_pages_stmt_grid" ADD CONSTRAINT "lab_pages_stmt_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lab_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__lab_pages_v_stmt_grid_v_cards" ADD CONSTRAINT "__lab_pages_v_stmt_grid_v_cards_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__lab_pages_v_stmt_grid_v_cards" ADD CONSTRAINT "__lab_pages_v_stmt_grid_v_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."__lab_pages_v_stmt_grid_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__lab_pages_v_stmt_grid_v" ADD CONSTRAINT "__lab_pages_v_stmt_grid_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_lab_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "expertise_pages_aud_tabs_tabs_items" ADD CONSTRAINT "expertise_pages_aud_tabs_tabs_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."expertise_pages_aud_tabs_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "expertise_pages_aud_tabs_tabs" ADD CONSTRAINT "expertise_pages_aud_tabs_tabs_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "expertise_pages_aud_tabs_tabs" ADD CONSTRAINT "expertise_pages_aud_tabs_tabs_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "expertise_pages_aud_tabs_tabs" ADD CONSTRAINT "expertise_pages_aud_tabs_tabs_shader_release_id_streak_releases_id_fk" FOREIGN KEY ("shader_release_id") REFERENCES "public"."streak_releases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "expertise_pages_aud_tabs_tabs" ADD CONSTRAINT "expertise_pages_aud_tabs_tabs_shader_poster_media_id_media_id_fk" FOREIGN KEY ("shader_poster_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "expertise_pages_aud_tabs_tabs" ADD CONSTRAINT "expertise_pages_aud_tabs_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."expertise_pages_aud_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "expertise_pages_aud_tabs" ADD CONSTRAINT "expertise_pages_aud_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."expertise_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "expertise_pages_stmt_grid_cards" ADD CONSTRAINT "expertise_pages_stmt_grid_cards_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "expertise_pages_stmt_grid_cards" ADD CONSTRAINT "expertise_pages_stmt_grid_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."expertise_pages_stmt_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "expertise_pages_stmt_grid" ADD CONSTRAINT "expertise_pages_stmt_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."expertise_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "expertise_pages_feat_work" ADD CONSTRAINT "expertise_pages_feat_work_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."expertise_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "expertise_pages_blocks_form_block" ADD CONSTRAINT "expertise_pages_blocks_form_block_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "expertise_pages_blocks_form_block" ADD CONSTRAINT "expertise_pages_blocks_form_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."expertise_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__expertise_pages_v_aud_tabs_v_tabs_items" ADD CONSTRAINT "__expertise_pages_v_aud_tabs_v_tabs_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."__expertise_pages_v_aud_tabs_v_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__expertise_pages_v_aud_tabs_v_tabs" ADD CONSTRAINT "__expertise_pages_v_aud_tabs_v_tabs_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__expertise_pages_v_aud_tabs_v_tabs" ADD CONSTRAINT "__expertise_pages_v_aud_tabs_v_tabs_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__expertise_pages_v_aud_tabs_v_tabs" ADD CONSTRAINT "__expertise_pages_v_aud_tabs_v_tabs_shader_release_id_streak_releases_id_fk" FOREIGN KEY ("shader_release_id") REFERENCES "public"."streak_releases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__expertise_pages_v_aud_tabs_v_tabs" ADD CONSTRAINT "__expertise_pages_v_aud_tabs_v_tabs_shader_poster_media_id_media_id_fk" FOREIGN KEY ("shader_poster_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__expertise_pages_v_aud_tabs_v_tabs" ADD CONSTRAINT "__expertise_pages_v_aud_tabs_v_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."__expertise_pages_v_aud_tabs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__expertise_pages_v_aud_tabs_v" ADD CONSTRAINT "__expertise_pages_v_aud_tabs_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_expertise_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__expertise_pages_v_stmt_grid_v_cards" ADD CONSTRAINT "__expertise_pages_v_stmt_grid_v_cards_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__expertise_pages_v_stmt_grid_v_cards" ADD CONSTRAINT "__expertise_pages_v_stmt_grid_v_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."__expertise_pages_v_stmt_grid_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__expertise_pages_v_stmt_grid_v" ADD CONSTRAINT "__expertise_pages_v_stmt_grid_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_expertise_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__expertise_pages_v_feat_work_v" ADD CONSTRAINT "__expertise_pages_v_feat_work_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_expertise_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_expertise_pages_v_blocks_form_block" ADD CONSTRAINT "_expertise_pages_v_blocks_form_block_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_expertise_pages_v_blocks_form_block" ADD CONSTRAINT "_expertise_pages_v_blocks_form_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_expertise_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "audience_pages_aud_tabs_tabs_items" ADD CONSTRAINT "audience_pages_aud_tabs_tabs_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."audience_pages_aud_tabs_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "audience_pages_aud_tabs_tabs" ADD CONSTRAINT "audience_pages_aud_tabs_tabs_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "audience_pages_aud_tabs_tabs" ADD CONSTRAINT "audience_pages_aud_tabs_tabs_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "audience_pages_aud_tabs_tabs" ADD CONSTRAINT "audience_pages_aud_tabs_tabs_shader_release_id_streak_releases_id_fk" FOREIGN KEY ("shader_release_id") REFERENCES "public"."streak_releases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "audience_pages_aud_tabs_tabs" ADD CONSTRAINT "audience_pages_aud_tabs_tabs_shader_poster_media_id_media_id_fk" FOREIGN KEY ("shader_poster_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "audience_pages_aud_tabs_tabs" ADD CONSTRAINT "audience_pages_aud_tabs_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."audience_pages_aud_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "audience_pages_aud_tabs" ADD CONSTRAINT "audience_pages_aud_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."audience_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "audience_pages_stmt_grid_cards" ADD CONSTRAINT "audience_pages_stmt_grid_cards_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "audience_pages_stmt_grid_cards" ADD CONSTRAINT "audience_pages_stmt_grid_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."audience_pages_stmt_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "audience_pages_stmt_grid" ADD CONSTRAINT "audience_pages_stmt_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."audience_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "audience_pages_feat_work" ADD CONSTRAINT "audience_pages_feat_work_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."audience_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "audience_pages_blocks_form_block" ADD CONSTRAINT "audience_pages_blocks_form_block_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "audience_pages_blocks_form_block" ADD CONSTRAINT "audience_pages_blocks_form_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."audience_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__audience_pages_v_aud_tabs_v_tabs_items" ADD CONSTRAINT "__audience_pages_v_aud_tabs_v_tabs_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."__audience_pages_v_aud_tabs_v_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__audience_pages_v_aud_tabs_v_tabs" ADD CONSTRAINT "__audience_pages_v_aud_tabs_v_tabs_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__audience_pages_v_aud_tabs_v_tabs" ADD CONSTRAINT "__audience_pages_v_aud_tabs_v_tabs_shader_studio_id_streak_looks_id_fk" FOREIGN KEY ("shader_studio_id") REFERENCES "public"."streak_looks"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__audience_pages_v_aud_tabs_v_tabs" ADD CONSTRAINT "__audience_pages_v_aud_tabs_v_tabs_shader_release_id_streak_releases_id_fk" FOREIGN KEY ("shader_release_id") REFERENCES "public"."streak_releases"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__audience_pages_v_aud_tabs_v_tabs" ADD CONSTRAINT "__audience_pages_v_aud_tabs_v_tabs_shader_poster_media_id_media_id_fk" FOREIGN KEY ("shader_poster_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__audience_pages_v_aud_tabs_v_tabs" ADD CONSTRAINT "__audience_pages_v_aud_tabs_v_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."__audience_pages_v_aud_tabs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__audience_pages_v_aud_tabs_v" ADD CONSTRAINT "__audience_pages_v_aud_tabs_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_audience_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__audience_pages_v_stmt_grid_v_cards" ADD CONSTRAINT "__audience_pages_v_stmt_grid_v_cards_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__audience_pages_v_stmt_grid_v_cards" ADD CONSTRAINT "__audience_pages_v_stmt_grid_v_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."__audience_pages_v_stmt_grid_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__audience_pages_v_stmt_grid_v" ADD CONSTRAINT "__audience_pages_v_stmt_grid_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_audience_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__audience_pages_v_feat_work_v" ADD CONSTRAINT "__audience_pages_v_feat_work_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_audience_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_audience_pages_v_blocks_form_block" ADD CONSTRAINT "_audience_pages_v_blocks_form_block_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_audience_pages_v_blocks_form_block" ADD CONSTRAINT "_audience_pages_v_blocks_form_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_audience_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_stmt_grid_cards" ADD CONSTRAINT "home_stmt_grid_cards_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_stmt_grid_cards" ADD CONSTRAINT "home_stmt_grid_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_stmt_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_stmt_grid" ADD CONSTRAINT "home_stmt_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_stmt_links_links" ADD CONSTRAINT "home_stmt_links_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_stmt_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_stmt_links" ADD CONSTRAINT "home_stmt_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_blocks_archive" ADD CONSTRAINT "home_blocks_archive_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_blocks_cta_links" ADD CONSTRAINT "home_blocks_cta_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_blocks_cta"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_blocks_cta" ADD CONSTRAINT "home_blocks_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_blocks_form_block" ADD CONSTRAINT "home_blocks_form_block_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_blocks_form_block" ADD CONSTRAINT "home_blocks_form_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_blocks_newsletter_signup" ADD CONSTRAINT "home_blocks_newsletter_signup_audience_id_audiences_id_fk" FOREIGN KEY ("audience_id") REFERENCES "public"."audiences"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_blocks_newsletter_signup" ADD CONSTRAINT "home_blocks_newsletter_signup_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_blocks_content_columns" ADD CONSTRAINT "home_blocks_content_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_blocks_content"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_blocks_content" ADD CONSTRAINT "home_blocks_content_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__home_v_stmt_grid_v_cards" ADD CONSTRAINT "__home_v_stmt_grid_v_cards_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "__home_v_stmt_grid_v_cards" ADD CONSTRAINT "__home_v_stmt_grid_v_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."__home_v_stmt_grid_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__home_v_stmt_grid_v" ADD CONSTRAINT "__home_v_stmt_grid_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__home_v_stmt_links_v_links" ADD CONSTRAINT "__home_v_stmt_links_v_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."__home_v_stmt_links_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "__home_v_stmt_links_v" ADD CONSTRAINT "__home_v_stmt_links_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_blocks_archive" ADD CONSTRAINT "_home_v_blocks_archive_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_blocks_cta_links" ADD CONSTRAINT "_home_v_blocks_cta_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v_blocks_cta"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_blocks_cta" ADD CONSTRAINT "_home_v_blocks_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_blocks_form_block" ADD CONSTRAINT "_home_v_blocks_form_block_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_home_v_blocks_form_block" ADD CONSTRAINT "_home_v_blocks_form_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_blocks_newsletter_signup" ADD CONSTRAINT "_home_v_blocks_newsletter_signup_audience_id_audiences_id_fk" FOREIGN KEY ("audience_id") REFERENCES "public"."audiences"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_home_v_blocks_newsletter_signup" ADD CONSTRAINT "_home_v_blocks_newsletter_signup_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_blocks_content_columns" ADD CONSTRAINT "_home_v_blocks_content_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v_blocks_content"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_blocks_content" ADD CONSTRAINT "_home_v_blocks_content_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_home_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_aud_tabs_tabs_items_order_idx" ON "pages_aud_tabs_tabs_items" USING btree ("_order");
  CREATE INDEX "pages_aud_tabs_tabs_items_parent_id_idx" ON "pages_aud_tabs_tabs_items" USING btree ("_parent_id");
  CREATE INDEX "pages_aud_tabs_tabs_order_idx" ON "pages_aud_tabs_tabs" USING btree ("_order");
  CREATE INDEX "pages_aud_tabs_tabs_parent_id_idx" ON "pages_aud_tabs_tabs" USING btree ("_parent_id");
  CREATE INDEX "pages_aud_tabs_tabs_media_idx" ON "pages_aud_tabs_tabs" USING btree ("media_id");
  CREATE INDEX "pages_aud_tabs_tabs_shader_shader_studio_idx" ON "pages_aud_tabs_tabs" USING btree ("shader_studio_id");
  CREATE INDEX "pages_aud_tabs_tabs_shader_shader_release_idx" ON "pages_aud_tabs_tabs" USING btree ("shader_release_id");
  CREATE INDEX "pages_aud_tabs_tabs_shader_shader_poster_media_idx" ON "pages_aud_tabs_tabs" USING btree ("shader_poster_media_id");
  CREATE INDEX "pages_aud_tabs_order_idx" ON "pages_aud_tabs" USING btree ("_order");
  CREATE INDEX "pages_aud_tabs_parent_id_idx" ON "pages_aud_tabs" USING btree ("_parent_id");
  CREATE INDEX "pages_aud_tabs_path_idx" ON "pages_aud_tabs" USING btree ("_path");
  CREATE INDEX "pages_ind_work_industries_order_idx" ON "pages_ind_work_industries" USING btree ("_order");
  CREATE INDEX "pages_ind_work_industries_parent_id_idx" ON "pages_ind_work_industries" USING btree ("_parent_id");
  CREATE INDEX "pages_ind_work_industries_industry_idx" ON "pages_ind_work_industries" USING btree ("industry_id");
  CREATE INDEX "pages_ind_work_industries_work_idx" ON "pages_ind_work_industries" USING btree ("work_id");
  CREATE INDEX "pages_ind_work_order_idx" ON "pages_ind_work" USING btree ("_order");
  CREATE INDEX "pages_ind_work_parent_id_idx" ON "pages_ind_work" USING btree ("_parent_id");
  CREATE INDEX "pages_ind_work_path_idx" ON "pages_ind_work" USING btree ("_path");
  CREATE INDEX "pages_blocks_testimonials_marquee_links_order_idx" ON "pages_blocks_testimonials_marquee_links" USING btree ("_order");
  CREATE INDEX "pages_blocks_testimonials_marquee_links_parent_id_idx" ON "pages_blocks_testimonials_marquee_links" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_testimonials_marquee_order_idx" ON "pages_blocks_testimonials_marquee" USING btree ("_order");
  CREATE INDEX "pages_blocks_testimonials_marquee_parent_id_idx" ON "pages_blocks_testimonials_marquee" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_testimonials_marquee_path_idx" ON "pages_blocks_testimonials_marquee" USING btree ("_path");
  CREATE INDEX "pages_stmt_grid_cards_order_idx" ON "pages_stmt_grid_cards" USING btree ("_order");
  CREATE INDEX "pages_stmt_grid_cards_parent_id_idx" ON "pages_stmt_grid_cards" USING btree ("_parent_id");
  CREATE INDEX "pages_stmt_grid_cards_media_idx" ON "pages_stmt_grid_cards" USING btree ("media_id");
  CREATE INDEX "pages_stmt_grid_order_idx" ON "pages_stmt_grid" USING btree ("_order");
  CREATE INDEX "pages_stmt_grid_parent_id_idx" ON "pages_stmt_grid" USING btree ("_parent_id");
  CREATE INDEX "pages_stmt_grid_path_idx" ON "pages_stmt_grid" USING btree ("_path");
  CREATE INDEX "pages_stmt_links_links_order_idx" ON "pages_stmt_links_links" USING btree ("_order");
  CREATE INDEX "pages_stmt_links_links_parent_id_idx" ON "pages_stmt_links_links" USING btree ("_parent_id");
  CREATE INDEX "pages_stmt_links_order_idx" ON "pages_stmt_links" USING btree ("_order");
  CREATE INDEX "pages_stmt_links_parent_id_idx" ON "pages_stmt_links" USING btree ("_parent_id");
  CREATE INDEX "pages_stmt_links_path_idx" ON "pages_stmt_links" USING btree ("_path");
  CREATE INDEX "pages_feat_work_order_idx" ON "pages_feat_work" USING btree ("_order");
  CREATE INDEX "pages_feat_work_parent_id_idx" ON "pages_feat_work" USING btree ("_parent_id");
  CREATE INDEX "pages_feat_work_path_idx" ON "pages_feat_work" USING btree ("_path");
  CREATE INDEX "pages_blocks_form_block_order_idx" ON "pages_blocks_form_block" USING btree ("_order");
  CREATE INDEX "pages_blocks_form_block_parent_id_idx" ON "pages_blocks_form_block" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_form_block_path_idx" ON "pages_blocks_form_block" USING btree ("_path");
  CREATE INDEX "pages_blocks_form_block_form_idx" ON "pages_blocks_form_block" USING btree ("form_id");
  CREATE INDEX "pages_blocks_newsletter_signup_order_idx" ON "pages_blocks_newsletter_signup" USING btree ("_order");
  CREATE INDEX "pages_blocks_newsletter_signup_parent_id_idx" ON "pages_blocks_newsletter_signup" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_newsletter_signup_path_idx" ON "pages_blocks_newsletter_signup" USING btree ("_path");
  CREATE INDEX "pages_blocks_newsletter_signup_audience_idx" ON "pages_blocks_newsletter_signup" USING btree ("audience_id");
  CREATE INDEX "__pages_v_aud_tabs_v_tabs_items_order_idx" ON "__pages_v_aud_tabs_v_tabs_items" USING btree ("_order");
  CREATE INDEX "__pages_v_aud_tabs_v_tabs_items_parent_id_idx" ON "__pages_v_aud_tabs_v_tabs_items" USING btree ("_parent_id");
  CREATE INDEX "__pages_v_aud_tabs_v_tabs_order_idx" ON "__pages_v_aud_tabs_v_tabs" USING btree ("_order");
  CREATE INDEX "__pages_v_aud_tabs_v_tabs_parent_id_idx" ON "__pages_v_aud_tabs_v_tabs" USING btree ("_parent_id");
  CREATE INDEX "__pages_v_aud_tabs_v_tabs_media_idx" ON "__pages_v_aud_tabs_v_tabs" USING btree ("media_id");
  CREATE INDEX "__pages_v_aud_tabs_v_tabs_shader_shader_studio_idx" ON "__pages_v_aud_tabs_v_tabs" USING btree ("shader_studio_id");
  CREATE INDEX "__pages_v_aud_tabs_v_tabs_shader_shader_release_idx" ON "__pages_v_aud_tabs_v_tabs" USING btree ("shader_release_id");
  CREATE INDEX "__pages_v_aud_tabs_v_tabs_shader_shader_poster_media_idx" ON "__pages_v_aud_tabs_v_tabs" USING btree ("shader_poster_media_id");
  CREATE INDEX "__pages_v_aud_tabs_v_order_idx" ON "__pages_v_aud_tabs_v" USING btree ("_order");
  CREATE INDEX "__pages_v_aud_tabs_v_parent_id_idx" ON "__pages_v_aud_tabs_v" USING btree ("_parent_id");
  CREATE INDEX "__pages_v_aud_tabs_v_path_idx" ON "__pages_v_aud_tabs_v" USING btree ("_path");
  CREATE INDEX "__pages_v_ind_work_v_industries_order_idx" ON "__pages_v_ind_work_v_industries" USING btree ("_order");
  CREATE INDEX "__pages_v_ind_work_v_industries_parent_id_idx" ON "__pages_v_ind_work_v_industries" USING btree ("_parent_id");
  CREATE INDEX "__pages_v_ind_work_v_industries_industry_idx" ON "__pages_v_ind_work_v_industries" USING btree ("industry_id");
  CREATE INDEX "__pages_v_ind_work_v_industries_work_idx" ON "__pages_v_ind_work_v_industries" USING btree ("work_id");
  CREATE INDEX "__pages_v_ind_work_v_order_idx" ON "__pages_v_ind_work_v" USING btree ("_order");
  CREATE INDEX "__pages_v_ind_work_v_parent_id_idx" ON "__pages_v_ind_work_v" USING btree ("_parent_id");
  CREATE INDEX "__pages_v_ind_work_v_path_idx" ON "__pages_v_ind_work_v" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_testimonials_marquee_links_order_idx" ON "_pages_v_blocks_testimonials_marquee_links" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_testimonials_marquee_links_parent_id_idx" ON "_pages_v_blocks_testimonials_marquee_links" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_testimonials_marquee_order_idx" ON "_pages_v_blocks_testimonials_marquee" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_testimonials_marquee_parent_id_idx" ON "_pages_v_blocks_testimonials_marquee" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_testimonials_marquee_path_idx" ON "_pages_v_blocks_testimonials_marquee" USING btree ("_path");
  CREATE INDEX "__pages_v_stmt_grid_v_cards_order_idx" ON "__pages_v_stmt_grid_v_cards" USING btree ("_order");
  CREATE INDEX "__pages_v_stmt_grid_v_cards_parent_id_idx" ON "__pages_v_stmt_grid_v_cards" USING btree ("_parent_id");
  CREATE INDEX "__pages_v_stmt_grid_v_cards_media_idx" ON "__pages_v_stmt_grid_v_cards" USING btree ("media_id");
  CREATE INDEX "__pages_v_stmt_grid_v_order_idx" ON "__pages_v_stmt_grid_v" USING btree ("_order");
  CREATE INDEX "__pages_v_stmt_grid_v_parent_id_idx" ON "__pages_v_stmt_grid_v" USING btree ("_parent_id");
  CREATE INDEX "__pages_v_stmt_grid_v_path_idx" ON "__pages_v_stmt_grid_v" USING btree ("_path");
  CREATE INDEX "__pages_v_stmt_links_v_links_order_idx" ON "__pages_v_stmt_links_v_links" USING btree ("_order");
  CREATE INDEX "__pages_v_stmt_links_v_links_parent_id_idx" ON "__pages_v_stmt_links_v_links" USING btree ("_parent_id");
  CREATE INDEX "__pages_v_stmt_links_v_order_idx" ON "__pages_v_stmt_links_v" USING btree ("_order");
  CREATE INDEX "__pages_v_stmt_links_v_parent_id_idx" ON "__pages_v_stmt_links_v" USING btree ("_parent_id");
  CREATE INDEX "__pages_v_stmt_links_v_path_idx" ON "__pages_v_stmt_links_v" USING btree ("_path");
  CREATE INDEX "__pages_v_feat_work_v_order_idx" ON "__pages_v_feat_work_v" USING btree ("_order");
  CREATE INDEX "__pages_v_feat_work_v_parent_id_idx" ON "__pages_v_feat_work_v" USING btree ("_parent_id");
  CREATE INDEX "__pages_v_feat_work_v_path_idx" ON "__pages_v_feat_work_v" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_form_block_order_idx" ON "_pages_v_blocks_form_block" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_form_block_parent_id_idx" ON "_pages_v_blocks_form_block" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_form_block_path_idx" ON "_pages_v_blocks_form_block" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_form_block_form_idx" ON "_pages_v_blocks_form_block" USING btree ("form_id");
  CREATE INDEX "_pages_v_blocks_newsletter_signup_order_idx" ON "_pages_v_blocks_newsletter_signup" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_newsletter_signup_parent_id_idx" ON "_pages_v_blocks_newsletter_signup" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_newsletter_signup_path_idx" ON "_pages_v_blocks_newsletter_signup" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_newsletter_signup_audience_idx" ON "_pages_v_blocks_newsletter_signup" USING btree ("audience_id");
  CREATE INDEX "posts_feat_work_order_idx" ON "posts_feat_work" USING btree ("_order");
  CREATE INDEX "posts_feat_work_parent_id_idx" ON "posts_feat_work" USING btree ("_parent_id");
  CREATE INDEX "posts_feat_work_path_idx" ON "posts_feat_work" USING btree ("_path");
  CREATE INDEX "__posts_v_feat_work_v_order_idx" ON "__posts_v_feat_work_v" USING btree ("_order");
  CREATE INDEX "__posts_v_feat_work_v_parent_id_idx" ON "__posts_v_feat_work_v" USING btree ("_parent_id");
  CREATE INDEX "__posts_v_feat_work_v_path_idx" ON "__posts_v_feat_work_v" USING btree ("_path");
  CREATE INDEX "work_pages_aud_tabs_tabs_items_order_idx" ON "work_pages_aud_tabs_tabs_items" USING btree ("_order");
  CREATE INDEX "work_pages_aud_tabs_tabs_items_parent_id_idx" ON "work_pages_aud_tabs_tabs_items" USING btree ("_parent_id");
  CREATE INDEX "work_pages_aud_tabs_tabs_order_idx" ON "work_pages_aud_tabs_tabs" USING btree ("_order");
  CREATE INDEX "work_pages_aud_tabs_tabs_parent_id_idx" ON "work_pages_aud_tabs_tabs" USING btree ("_parent_id");
  CREATE INDEX "work_pages_aud_tabs_tabs_media_idx" ON "work_pages_aud_tabs_tabs" USING btree ("media_id");
  CREATE INDEX "work_pages_aud_tabs_tabs_shader_shader_studio_idx" ON "work_pages_aud_tabs_tabs" USING btree ("shader_studio_id");
  CREATE INDEX "work_pages_aud_tabs_tabs_shader_shader_release_idx" ON "work_pages_aud_tabs_tabs" USING btree ("shader_release_id");
  CREATE INDEX "work_pages_aud_tabs_tabs_shader_shader_poster_media_idx" ON "work_pages_aud_tabs_tabs" USING btree ("shader_poster_media_id");
  CREATE INDEX "work_pages_aud_tabs_order_idx" ON "work_pages_aud_tabs" USING btree ("_order");
  CREATE INDEX "work_pages_aud_tabs_parent_id_idx" ON "work_pages_aud_tabs" USING btree ("_parent_id");
  CREATE INDEX "work_pages_aud_tabs_path_idx" ON "work_pages_aud_tabs" USING btree ("_path");
  CREATE INDEX "work_pages_ind_work_industries_order_idx" ON "work_pages_ind_work_industries" USING btree ("_order");
  CREATE INDEX "work_pages_ind_work_industries_parent_id_idx" ON "work_pages_ind_work_industries" USING btree ("_parent_id");
  CREATE INDEX "work_pages_ind_work_industries_industry_idx" ON "work_pages_ind_work_industries" USING btree ("industry_id");
  CREATE INDEX "work_pages_ind_work_industries_work_idx" ON "work_pages_ind_work_industries" USING btree ("work_id");
  CREATE INDEX "work_pages_ind_work_order_idx" ON "work_pages_ind_work" USING btree ("_order");
  CREATE INDEX "work_pages_ind_work_parent_id_idx" ON "work_pages_ind_work" USING btree ("_parent_id");
  CREATE INDEX "work_pages_ind_work_path_idx" ON "work_pages_ind_work" USING btree ("_path");
  CREATE INDEX "work_pages_stmt_grid_cards_order_idx" ON "work_pages_stmt_grid_cards" USING btree ("_order");
  CREATE INDEX "work_pages_stmt_grid_cards_parent_id_idx" ON "work_pages_stmt_grid_cards" USING btree ("_parent_id");
  CREATE INDEX "work_pages_stmt_grid_cards_media_idx" ON "work_pages_stmt_grid_cards" USING btree ("media_id");
  CREATE INDEX "work_pages_stmt_grid_order_idx" ON "work_pages_stmt_grid" USING btree ("_order");
  CREATE INDEX "work_pages_stmt_grid_parent_id_idx" ON "work_pages_stmt_grid" USING btree ("_parent_id");
  CREATE INDEX "work_pages_stmt_grid_path_idx" ON "work_pages_stmt_grid" USING btree ("_path");
  CREATE INDEX "work_pages_stmt_links_links_order_idx" ON "work_pages_stmt_links_links" USING btree ("_order");
  CREATE INDEX "work_pages_stmt_links_links_parent_id_idx" ON "work_pages_stmt_links_links" USING btree ("_parent_id");
  CREATE INDEX "work_pages_stmt_links_order_idx" ON "work_pages_stmt_links" USING btree ("_order");
  CREATE INDEX "work_pages_stmt_links_parent_id_idx" ON "work_pages_stmt_links" USING btree ("_parent_id");
  CREATE INDEX "work_pages_stmt_links_path_idx" ON "work_pages_stmt_links" USING btree ("_path");
  CREATE INDEX "wp_metrics_order_idx" ON "wp_metrics" USING btree ("_order");
  CREATE INDEX "wp_metrics_parent_id_idx" ON "wp_metrics" USING btree ("_parent_id");
  CREATE INDEX "wp_metrics_path_idx" ON "wp_metrics" USING btree ("_path");
  CREATE INDEX "__work_pages_v_aud_tabs_v_tabs_items_order_idx" ON "__work_pages_v_aud_tabs_v_tabs_items" USING btree ("_order");
  CREATE INDEX "__work_pages_v_aud_tabs_v_tabs_items_parent_id_idx" ON "__work_pages_v_aud_tabs_v_tabs_items" USING btree ("_parent_id");
  CREATE INDEX "__work_pages_v_aud_tabs_v_tabs_order_idx" ON "__work_pages_v_aud_tabs_v_tabs" USING btree ("_order");
  CREATE INDEX "__work_pages_v_aud_tabs_v_tabs_parent_id_idx" ON "__work_pages_v_aud_tabs_v_tabs" USING btree ("_parent_id");
  CREATE INDEX "__work_pages_v_aud_tabs_v_tabs_media_idx" ON "__work_pages_v_aud_tabs_v_tabs" USING btree ("media_id");
  CREATE INDEX "__work_pages_v_aud_tabs_v_tabs_shader_shader_studio_idx" ON "__work_pages_v_aud_tabs_v_tabs" USING btree ("shader_studio_id");
  CREATE INDEX "__work_pages_v_aud_tabs_v_tabs_shader_shader_release_idx" ON "__work_pages_v_aud_tabs_v_tabs" USING btree ("shader_release_id");
  CREATE INDEX "__work_pages_v_aud_tabs_v_tabs_shader_shader_poster_medi_idx" ON "__work_pages_v_aud_tabs_v_tabs" USING btree ("shader_poster_media_id");
  CREATE INDEX "__work_pages_v_aud_tabs_v_order_idx" ON "__work_pages_v_aud_tabs_v" USING btree ("_order");
  CREATE INDEX "__work_pages_v_aud_tabs_v_parent_id_idx" ON "__work_pages_v_aud_tabs_v" USING btree ("_parent_id");
  CREATE INDEX "__work_pages_v_aud_tabs_v_path_idx" ON "__work_pages_v_aud_tabs_v" USING btree ("_path");
  CREATE INDEX "__work_pages_v_ind_work_v_industries_order_idx" ON "__work_pages_v_ind_work_v_industries" USING btree ("_order");
  CREATE INDEX "__work_pages_v_ind_work_v_industries_parent_id_idx" ON "__work_pages_v_ind_work_v_industries" USING btree ("_parent_id");
  CREATE INDEX "__work_pages_v_ind_work_v_industries_industry_idx" ON "__work_pages_v_ind_work_v_industries" USING btree ("industry_id");
  CREATE INDEX "__work_pages_v_ind_work_v_industries_work_idx" ON "__work_pages_v_ind_work_v_industries" USING btree ("work_id");
  CREATE INDEX "__work_pages_v_ind_work_v_order_idx" ON "__work_pages_v_ind_work_v" USING btree ("_order");
  CREATE INDEX "__work_pages_v_ind_work_v_parent_id_idx" ON "__work_pages_v_ind_work_v" USING btree ("_parent_id");
  CREATE INDEX "__work_pages_v_ind_work_v_path_idx" ON "__work_pages_v_ind_work_v" USING btree ("_path");
  CREATE INDEX "__work_pages_v_stmt_grid_v_cards_order_idx" ON "__work_pages_v_stmt_grid_v_cards" USING btree ("_order");
  CREATE INDEX "__work_pages_v_stmt_grid_v_cards_parent_id_idx" ON "__work_pages_v_stmt_grid_v_cards" USING btree ("_parent_id");
  CREATE INDEX "__work_pages_v_stmt_grid_v_cards_media_idx" ON "__work_pages_v_stmt_grid_v_cards" USING btree ("media_id");
  CREATE INDEX "__work_pages_v_stmt_grid_v_order_idx" ON "__work_pages_v_stmt_grid_v" USING btree ("_order");
  CREATE INDEX "__work_pages_v_stmt_grid_v_parent_id_idx" ON "__work_pages_v_stmt_grid_v" USING btree ("_parent_id");
  CREATE INDEX "__work_pages_v_stmt_grid_v_path_idx" ON "__work_pages_v_stmt_grid_v" USING btree ("_path");
  CREATE INDEX "__work_pages_v_stmt_links_v_links_order_idx" ON "__work_pages_v_stmt_links_v_links" USING btree ("_order");
  CREATE INDEX "__work_pages_v_stmt_links_v_links_parent_id_idx" ON "__work_pages_v_stmt_links_v_links" USING btree ("_parent_id");
  CREATE INDEX "__work_pages_v_stmt_links_v_order_idx" ON "__work_pages_v_stmt_links_v" USING btree ("_order");
  CREATE INDEX "__work_pages_v_stmt_links_v_parent_id_idx" ON "__work_pages_v_stmt_links_v" USING btree ("_parent_id");
  CREATE INDEX "__work_pages_v_stmt_links_v_path_idx" ON "__work_pages_v_stmt_links_v" USING btree ("_path");
  CREATE INDEX "_wp_metrics_v_order_idx" ON "_wp_metrics_v" USING btree ("_order");
  CREATE INDEX "_wp_metrics_v_parent_id_idx" ON "_wp_metrics_v" USING btree ("_parent_id");
  CREATE INDEX "_wp_metrics_v_path_idx" ON "_wp_metrics_v" USING btree ("_path");
  CREATE INDEX "lab_pages_stmt_grid_cards_order_idx" ON "lab_pages_stmt_grid_cards" USING btree ("_order");
  CREATE INDEX "lab_pages_stmt_grid_cards_parent_id_idx" ON "lab_pages_stmt_grid_cards" USING btree ("_parent_id");
  CREATE INDEX "lab_pages_stmt_grid_cards_media_idx" ON "lab_pages_stmt_grid_cards" USING btree ("media_id");
  CREATE INDEX "lab_pages_stmt_grid_order_idx" ON "lab_pages_stmt_grid" USING btree ("_order");
  CREATE INDEX "lab_pages_stmt_grid_parent_id_idx" ON "lab_pages_stmt_grid" USING btree ("_parent_id");
  CREATE INDEX "lab_pages_stmt_grid_path_idx" ON "lab_pages_stmt_grid" USING btree ("_path");
  CREATE INDEX "__lab_pages_v_stmt_grid_v_cards_order_idx" ON "__lab_pages_v_stmt_grid_v_cards" USING btree ("_order");
  CREATE INDEX "__lab_pages_v_stmt_grid_v_cards_parent_id_idx" ON "__lab_pages_v_stmt_grid_v_cards" USING btree ("_parent_id");
  CREATE INDEX "__lab_pages_v_stmt_grid_v_cards_media_idx" ON "__lab_pages_v_stmt_grid_v_cards" USING btree ("media_id");
  CREATE INDEX "__lab_pages_v_stmt_grid_v_order_idx" ON "__lab_pages_v_stmt_grid_v" USING btree ("_order");
  CREATE INDEX "__lab_pages_v_stmt_grid_v_parent_id_idx" ON "__lab_pages_v_stmt_grid_v" USING btree ("_parent_id");
  CREATE INDEX "__lab_pages_v_stmt_grid_v_path_idx" ON "__lab_pages_v_stmt_grid_v" USING btree ("_path");
  CREATE INDEX "expertise_pages_aud_tabs_tabs_items_order_idx" ON "expertise_pages_aud_tabs_tabs_items" USING btree ("_order");
  CREATE INDEX "expertise_pages_aud_tabs_tabs_items_parent_id_idx" ON "expertise_pages_aud_tabs_tabs_items" USING btree ("_parent_id");
  CREATE INDEX "expertise_pages_aud_tabs_tabs_order_idx" ON "expertise_pages_aud_tabs_tabs" USING btree ("_order");
  CREATE INDEX "expertise_pages_aud_tabs_tabs_parent_id_idx" ON "expertise_pages_aud_tabs_tabs" USING btree ("_parent_id");
  CREATE INDEX "expertise_pages_aud_tabs_tabs_media_idx" ON "expertise_pages_aud_tabs_tabs" USING btree ("media_id");
  CREATE INDEX "expertise_pages_aud_tabs_tabs_shader_shader_studio_idx" ON "expertise_pages_aud_tabs_tabs" USING btree ("shader_studio_id");
  CREATE INDEX "expertise_pages_aud_tabs_tabs_shader_shader_release_idx" ON "expertise_pages_aud_tabs_tabs" USING btree ("shader_release_id");
  CREATE INDEX "expertise_pages_aud_tabs_tabs_shader_shader_poster_media_idx" ON "expertise_pages_aud_tabs_tabs" USING btree ("shader_poster_media_id");
  CREATE INDEX "expertise_pages_aud_tabs_order_idx" ON "expertise_pages_aud_tabs" USING btree ("_order");
  CREATE INDEX "expertise_pages_aud_tabs_parent_id_idx" ON "expertise_pages_aud_tabs" USING btree ("_parent_id");
  CREATE INDEX "expertise_pages_aud_tabs_path_idx" ON "expertise_pages_aud_tabs" USING btree ("_path");
  CREATE INDEX "expertise_pages_stmt_grid_cards_order_idx" ON "expertise_pages_stmt_grid_cards" USING btree ("_order");
  CREATE INDEX "expertise_pages_stmt_grid_cards_parent_id_idx" ON "expertise_pages_stmt_grid_cards" USING btree ("_parent_id");
  CREATE INDEX "expertise_pages_stmt_grid_cards_media_idx" ON "expertise_pages_stmt_grid_cards" USING btree ("media_id");
  CREATE INDEX "expertise_pages_stmt_grid_order_idx" ON "expertise_pages_stmt_grid" USING btree ("_order");
  CREATE INDEX "expertise_pages_stmt_grid_parent_id_idx" ON "expertise_pages_stmt_grid" USING btree ("_parent_id");
  CREATE INDEX "expertise_pages_stmt_grid_path_idx" ON "expertise_pages_stmt_grid" USING btree ("_path");
  CREATE INDEX "expertise_pages_feat_work_order_idx" ON "expertise_pages_feat_work" USING btree ("_order");
  CREATE INDEX "expertise_pages_feat_work_parent_id_idx" ON "expertise_pages_feat_work" USING btree ("_parent_id");
  CREATE INDEX "expertise_pages_feat_work_path_idx" ON "expertise_pages_feat_work" USING btree ("_path");
  CREATE INDEX "expertise_pages_blocks_form_block_order_idx" ON "expertise_pages_blocks_form_block" USING btree ("_order");
  CREATE INDEX "expertise_pages_blocks_form_block_parent_id_idx" ON "expertise_pages_blocks_form_block" USING btree ("_parent_id");
  CREATE INDEX "expertise_pages_blocks_form_block_path_idx" ON "expertise_pages_blocks_form_block" USING btree ("_path");
  CREATE INDEX "expertise_pages_blocks_form_block_form_idx" ON "expertise_pages_blocks_form_block" USING btree ("form_id");
  CREATE INDEX "__expertise_pages_v_aud_tabs_v_tabs_items_order_idx" ON "__expertise_pages_v_aud_tabs_v_tabs_items" USING btree ("_order");
  CREATE INDEX "__expertise_pages_v_aud_tabs_v_tabs_items_parent_id_idx" ON "__expertise_pages_v_aud_tabs_v_tabs_items" USING btree ("_parent_id");
  CREATE INDEX "__expertise_pages_v_aud_tabs_v_tabs_order_idx" ON "__expertise_pages_v_aud_tabs_v_tabs" USING btree ("_order");
  CREATE INDEX "__expertise_pages_v_aud_tabs_v_tabs_parent_id_idx" ON "__expertise_pages_v_aud_tabs_v_tabs" USING btree ("_parent_id");
  CREATE INDEX "__expertise_pages_v_aud_tabs_v_tabs_media_idx" ON "__expertise_pages_v_aud_tabs_v_tabs" USING btree ("media_id");
  CREATE INDEX "__expertise_pages_v_aud_tabs_v_tabs_shader_shader_studio_idx" ON "__expertise_pages_v_aud_tabs_v_tabs" USING btree ("shader_studio_id");
  CREATE INDEX "__expertise_pages_v_aud_tabs_v_tabs_shader_shader_releas_idx" ON "__expertise_pages_v_aud_tabs_v_tabs" USING btree ("shader_release_id");
  CREATE INDEX "__expertise_pages_v_aud_tabs_v_tabs_shader_shader_poster_idx" ON "__expertise_pages_v_aud_tabs_v_tabs" USING btree ("shader_poster_media_id");
  CREATE INDEX "__expertise_pages_v_aud_tabs_v_order_idx" ON "__expertise_pages_v_aud_tabs_v" USING btree ("_order");
  CREATE INDEX "__expertise_pages_v_aud_tabs_v_parent_id_idx" ON "__expertise_pages_v_aud_tabs_v" USING btree ("_parent_id");
  CREATE INDEX "__expertise_pages_v_aud_tabs_v_path_idx" ON "__expertise_pages_v_aud_tabs_v" USING btree ("_path");
  CREATE INDEX "__expertise_pages_v_stmt_grid_v_cards_order_idx" ON "__expertise_pages_v_stmt_grid_v_cards" USING btree ("_order");
  CREATE INDEX "__expertise_pages_v_stmt_grid_v_cards_parent_id_idx" ON "__expertise_pages_v_stmt_grid_v_cards" USING btree ("_parent_id");
  CREATE INDEX "__expertise_pages_v_stmt_grid_v_cards_media_idx" ON "__expertise_pages_v_stmt_grid_v_cards" USING btree ("media_id");
  CREATE INDEX "__expertise_pages_v_stmt_grid_v_order_idx" ON "__expertise_pages_v_stmt_grid_v" USING btree ("_order");
  CREATE INDEX "__expertise_pages_v_stmt_grid_v_parent_id_idx" ON "__expertise_pages_v_stmt_grid_v" USING btree ("_parent_id");
  CREATE INDEX "__expertise_pages_v_stmt_grid_v_path_idx" ON "__expertise_pages_v_stmt_grid_v" USING btree ("_path");
  CREATE INDEX "__expertise_pages_v_feat_work_v_order_idx" ON "__expertise_pages_v_feat_work_v" USING btree ("_order");
  CREATE INDEX "__expertise_pages_v_feat_work_v_parent_id_idx" ON "__expertise_pages_v_feat_work_v" USING btree ("_parent_id");
  CREATE INDEX "__expertise_pages_v_feat_work_v_path_idx" ON "__expertise_pages_v_feat_work_v" USING btree ("_path");
  CREATE INDEX "_expertise_pages_v_blocks_form_block_order_idx" ON "_expertise_pages_v_blocks_form_block" USING btree ("_order");
  CREATE INDEX "_expertise_pages_v_blocks_form_block_parent_id_idx" ON "_expertise_pages_v_blocks_form_block" USING btree ("_parent_id");
  CREATE INDEX "_expertise_pages_v_blocks_form_block_path_idx" ON "_expertise_pages_v_blocks_form_block" USING btree ("_path");
  CREATE INDEX "_expertise_pages_v_blocks_form_block_form_idx" ON "_expertise_pages_v_blocks_form_block" USING btree ("form_id");
  CREATE INDEX "audience_pages_aud_tabs_tabs_items_order_idx" ON "audience_pages_aud_tabs_tabs_items" USING btree ("_order");
  CREATE INDEX "audience_pages_aud_tabs_tabs_items_parent_id_idx" ON "audience_pages_aud_tabs_tabs_items" USING btree ("_parent_id");
  CREATE INDEX "audience_pages_aud_tabs_tabs_order_idx" ON "audience_pages_aud_tabs_tabs" USING btree ("_order");
  CREATE INDEX "audience_pages_aud_tabs_tabs_parent_id_idx" ON "audience_pages_aud_tabs_tabs" USING btree ("_parent_id");
  CREATE INDEX "audience_pages_aud_tabs_tabs_media_idx" ON "audience_pages_aud_tabs_tabs" USING btree ("media_id");
  CREATE INDEX "audience_pages_aud_tabs_tabs_shader_shader_studio_idx" ON "audience_pages_aud_tabs_tabs" USING btree ("shader_studio_id");
  CREATE INDEX "audience_pages_aud_tabs_tabs_shader_shader_release_idx" ON "audience_pages_aud_tabs_tabs" USING btree ("shader_release_id");
  CREATE INDEX "audience_pages_aud_tabs_tabs_shader_shader_poster_media_idx" ON "audience_pages_aud_tabs_tabs" USING btree ("shader_poster_media_id");
  CREATE INDEX "audience_pages_aud_tabs_order_idx" ON "audience_pages_aud_tabs" USING btree ("_order");
  CREATE INDEX "audience_pages_aud_tabs_parent_id_idx" ON "audience_pages_aud_tabs" USING btree ("_parent_id");
  CREATE INDEX "audience_pages_aud_tabs_path_idx" ON "audience_pages_aud_tabs" USING btree ("_path");
  CREATE INDEX "audience_pages_stmt_grid_cards_order_idx" ON "audience_pages_stmt_grid_cards" USING btree ("_order");
  CREATE INDEX "audience_pages_stmt_grid_cards_parent_id_idx" ON "audience_pages_stmt_grid_cards" USING btree ("_parent_id");
  CREATE INDEX "audience_pages_stmt_grid_cards_media_idx" ON "audience_pages_stmt_grid_cards" USING btree ("media_id");
  CREATE INDEX "audience_pages_stmt_grid_order_idx" ON "audience_pages_stmt_grid" USING btree ("_order");
  CREATE INDEX "audience_pages_stmt_grid_parent_id_idx" ON "audience_pages_stmt_grid" USING btree ("_parent_id");
  CREATE INDEX "audience_pages_stmt_grid_path_idx" ON "audience_pages_stmt_grid" USING btree ("_path");
  CREATE INDEX "audience_pages_feat_work_order_idx" ON "audience_pages_feat_work" USING btree ("_order");
  CREATE INDEX "audience_pages_feat_work_parent_id_idx" ON "audience_pages_feat_work" USING btree ("_parent_id");
  CREATE INDEX "audience_pages_feat_work_path_idx" ON "audience_pages_feat_work" USING btree ("_path");
  CREATE INDEX "audience_pages_blocks_form_block_order_idx" ON "audience_pages_blocks_form_block" USING btree ("_order");
  CREATE INDEX "audience_pages_blocks_form_block_parent_id_idx" ON "audience_pages_blocks_form_block" USING btree ("_parent_id");
  CREATE INDEX "audience_pages_blocks_form_block_path_idx" ON "audience_pages_blocks_form_block" USING btree ("_path");
  CREATE INDEX "audience_pages_blocks_form_block_form_idx" ON "audience_pages_blocks_form_block" USING btree ("form_id");
  CREATE INDEX "__audience_pages_v_aud_tabs_v_tabs_items_order_idx" ON "__audience_pages_v_aud_tabs_v_tabs_items" USING btree ("_order");
  CREATE INDEX "__audience_pages_v_aud_tabs_v_tabs_items_parent_id_idx" ON "__audience_pages_v_aud_tabs_v_tabs_items" USING btree ("_parent_id");
  CREATE INDEX "__audience_pages_v_aud_tabs_v_tabs_order_idx" ON "__audience_pages_v_aud_tabs_v_tabs" USING btree ("_order");
  CREATE INDEX "__audience_pages_v_aud_tabs_v_tabs_parent_id_idx" ON "__audience_pages_v_aud_tabs_v_tabs" USING btree ("_parent_id");
  CREATE INDEX "__audience_pages_v_aud_tabs_v_tabs_media_idx" ON "__audience_pages_v_aud_tabs_v_tabs" USING btree ("media_id");
  CREATE INDEX "__audience_pages_v_aud_tabs_v_tabs_shader_shader_studio_idx" ON "__audience_pages_v_aud_tabs_v_tabs" USING btree ("shader_studio_id");
  CREATE INDEX "__audience_pages_v_aud_tabs_v_tabs_shader_shader_release_idx" ON "__audience_pages_v_aud_tabs_v_tabs" USING btree ("shader_release_id");
  CREATE INDEX "__audience_pages_v_aud_tabs_v_tabs_shader_shader_poster__idx" ON "__audience_pages_v_aud_tabs_v_tabs" USING btree ("shader_poster_media_id");
  CREATE INDEX "__audience_pages_v_aud_tabs_v_order_idx" ON "__audience_pages_v_aud_tabs_v" USING btree ("_order");
  CREATE INDEX "__audience_pages_v_aud_tabs_v_parent_id_idx" ON "__audience_pages_v_aud_tabs_v" USING btree ("_parent_id");
  CREATE INDEX "__audience_pages_v_aud_tabs_v_path_idx" ON "__audience_pages_v_aud_tabs_v" USING btree ("_path");
  CREATE INDEX "__audience_pages_v_stmt_grid_v_cards_order_idx" ON "__audience_pages_v_stmt_grid_v_cards" USING btree ("_order");
  CREATE INDEX "__audience_pages_v_stmt_grid_v_cards_parent_id_idx" ON "__audience_pages_v_stmt_grid_v_cards" USING btree ("_parent_id");
  CREATE INDEX "__audience_pages_v_stmt_grid_v_cards_media_idx" ON "__audience_pages_v_stmt_grid_v_cards" USING btree ("media_id");
  CREATE INDEX "__audience_pages_v_stmt_grid_v_order_idx" ON "__audience_pages_v_stmt_grid_v" USING btree ("_order");
  CREATE INDEX "__audience_pages_v_stmt_grid_v_parent_id_idx" ON "__audience_pages_v_stmt_grid_v" USING btree ("_parent_id");
  CREATE INDEX "__audience_pages_v_stmt_grid_v_path_idx" ON "__audience_pages_v_stmt_grid_v" USING btree ("_path");
  CREATE INDEX "__audience_pages_v_feat_work_v_order_idx" ON "__audience_pages_v_feat_work_v" USING btree ("_order");
  CREATE INDEX "__audience_pages_v_feat_work_v_parent_id_idx" ON "__audience_pages_v_feat_work_v" USING btree ("_parent_id");
  CREATE INDEX "__audience_pages_v_feat_work_v_path_idx" ON "__audience_pages_v_feat_work_v" USING btree ("_path");
  CREATE INDEX "_audience_pages_v_blocks_form_block_order_idx" ON "_audience_pages_v_blocks_form_block" USING btree ("_order");
  CREATE INDEX "_audience_pages_v_blocks_form_block_parent_id_idx" ON "_audience_pages_v_blocks_form_block" USING btree ("_parent_id");
  CREATE INDEX "_audience_pages_v_blocks_form_block_path_idx" ON "_audience_pages_v_blocks_form_block" USING btree ("_path");
  CREATE INDEX "_audience_pages_v_blocks_form_block_form_idx" ON "_audience_pages_v_blocks_form_block" USING btree ("form_id");
  CREATE INDEX "home_stmt_grid_cards_order_idx" ON "home_stmt_grid_cards" USING btree ("_order");
  CREATE INDEX "home_stmt_grid_cards_parent_id_idx" ON "home_stmt_grid_cards" USING btree ("_parent_id");
  CREATE INDEX "home_stmt_grid_cards_media_idx" ON "home_stmt_grid_cards" USING btree ("media_id");
  CREATE INDEX "home_stmt_grid_order_idx" ON "home_stmt_grid" USING btree ("_order");
  CREATE INDEX "home_stmt_grid_parent_id_idx" ON "home_stmt_grid" USING btree ("_parent_id");
  CREATE INDEX "home_stmt_grid_path_idx" ON "home_stmt_grid" USING btree ("_path");
  CREATE INDEX "home_stmt_links_links_order_idx" ON "home_stmt_links_links" USING btree ("_order");
  CREATE INDEX "home_stmt_links_links_parent_id_idx" ON "home_stmt_links_links" USING btree ("_parent_id");
  CREATE INDEX "home_stmt_links_order_idx" ON "home_stmt_links" USING btree ("_order");
  CREATE INDEX "home_stmt_links_parent_id_idx" ON "home_stmt_links" USING btree ("_parent_id");
  CREATE INDEX "home_stmt_links_path_idx" ON "home_stmt_links" USING btree ("_path");
  CREATE INDEX "home_blocks_archive_order_idx" ON "home_blocks_archive" USING btree ("_order");
  CREATE INDEX "home_blocks_archive_parent_id_idx" ON "home_blocks_archive" USING btree ("_parent_id");
  CREATE INDEX "home_blocks_archive_path_idx" ON "home_blocks_archive" USING btree ("_path");
  CREATE INDEX "home_blocks_cta_links_order_idx" ON "home_blocks_cta_links" USING btree ("_order");
  CREATE INDEX "home_blocks_cta_links_parent_id_idx" ON "home_blocks_cta_links" USING btree ("_parent_id");
  CREATE INDEX "home_blocks_cta_order_idx" ON "home_blocks_cta" USING btree ("_order");
  CREATE INDEX "home_blocks_cta_parent_id_idx" ON "home_blocks_cta" USING btree ("_parent_id");
  CREATE INDEX "home_blocks_cta_path_idx" ON "home_blocks_cta" USING btree ("_path");
  CREATE INDEX "home_blocks_form_block_order_idx" ON "home_blocks_form_block" USING btree ("_order");
  CREATE INDEX "home_blocks_form_block_parent_id_idx" ON "home_blocks_form_block" USING btree ("_parent_id");
  CREATE INDEX "home_blocks_form_block_path_idx" ON "home_blocks_form_block" USING btree ("_path");
  CREATE INDEX "home_blocks_form_block_form_idx" ON "home_blocks_form_block" USING btree ("form_id");
  CREATE INDEX "home_blocks_newsletter_signup_order_idx" ON "home_blocks_newsletter_signup" USING btree ("_order");
  CREATE INDEX "home_blocks_newsletter_signup_parent_id_idx" ON "home_blocks_newsletter_signup" USING btree ("_parent_id");
  CREATE INDEX "home_blocks_newsletter_signup_path_idx" ON "home_blocks_newsletter_signup" USING btree ("_path");
  CREATE INDEX "home_blocks_newsletter_signup_audience_idx" ON "home_blocks_newsletter_signup" USING btree ("audience_id");
  CREATE INDEX "home_blocks_content_columns_order_idx" ON "home_blocks_content_columns" USING btree ("_order");
  CREATE INDEX "home_blocks_content_columns_parent_id_idx" ON "home_blocks_content_columns" USING btree ("_parent_id");
  CREATE INDEX "home_blocks_content_order_idx" ON "home_blocks_content" USING btree ("_order");
  CREATE INDEX "home_blocks_content_parent_id_idx" ON "home_blocks_content" USING btree ("_parent_id");
  CREATE INDEX "home_blocks_content_path_idx" ON "home_blocks_content" USING btree ("_path");
  CREATE INDEX "__home_v_stmt_grid_v_cards_order_idx" ON "__home_v_stmt_grid_v_cards" USING btree ("_order");
  CREATE INDEX "__home_v_stmt_grid_v_cards_parent_id_idx" ON "__home_v_stmt_grid_v_cards" USING btree ("_parent_id");
  CREATE INDEX "__home_v_stmt_grid_v_cards_media_idx" ON "__home_v_stmt_grid_v_cards" USING btree ("media_id");
  CREATE INDEX "__home_v_stmt_grid_v_order_idx" ON "__home_v_stmt_grid_v" USING btree ("_order");
  CREATE INDEX "__home_v_stmt_grid_v_parent_id_idx" ON "__home_v_stmt_grid_v" USING btree ("_parent_id");
  CREATE INDEX "__home_v_stmt_grid_v_path_idx" ON "__home_v_stmt_grid_v" USING btree ("_path");
  CREATE INDEX "__home_v_stmt_links_v_links_order_idx" ON "__home_v_stmt_links_v_links" USING btree ("_order");
  CREATE INDEX "__home_v_stmt_links_v_links_parent_id_idx" ON "__home_v_stmt_links_v_links" USING btree ("_parent_id");
  CREATE INDEX "__home_v_stmt_links_v_order_idx" ON "__home_v_stmt_links_v" USING btree ("_order");
  CREATE INDEX "__home_v_stmt_links_v_parent_id_idx" ON "__home_v_stmt_links_v" USING btree ("_parent_id");
  CREATE INDEX "__home_v_stmt_links_v_path_idx" ON "__home_v_stmt_links_v" USING btree ("_path");
  CREATE INDEX "_home_v_blocks_archive_order_idx" ON "_home_v_blocks_archive" USING btree ("_order");
  CREATE INDEX "_home_v_blocks_archive_parent_id_idx" ON "_home_v_blocks_archive" USING btree ("_parent_id");
  CREATE INDEX "_home_v_blocks_archive_path_idx" ON "_home_v_blocks_archive" USING btree ("_path");
  CREATE INDEX "_home_v_blocks_cta_links_order_idx" ON "_home_v_blocks_cta_links" USING btree ("_order");
  CREATE INDEX "_home_v_blocks_cta_links_parent_id_idx" ON "_home_v_blocks_cta_links" USING btree ("_parent_id");
  CREATE INDEX "_home_v_blocks_cta_order_idx" ON "_home_v_blocks_cta" USING btree ("_order");
  CREATE INDEX "_home_v_blocks_cta_parent_id_idx" ON "_home_v_blocks_cta" USING btree ("_parent_id");
  CREATE INDEX "_home_v_blocks_cta_path_idx" ON "_home_v_blocks_cta" USING btree ("_path");
  CREATE INDEX "_home_v_blocks_form_block_order_idx" ON "_home_v_blocks_form_block" USING btree ("_order");
  CREATE INDEX "_home_v_blocks_form_block_parent_id_idx" ON "_home_v_blocks_form_block" USING btree ("_parent_id");
  CREATE INDEX "_home_v_blocks_form_block_path_idx" ON "_home_v_blocks_form_block" USING btree ("_path");
  CREATE INDEX "_home_v_blocks_form_block_form_idx" ON "_home_v_blocks_form_block" USING btree ("form_id");
  CREATE INDEX "_home_v_blocks_newsletter_signup_order_idx" ON "_home_v_blocks_newsletter_signup" USING btree ("_order");
  CREATE INDEX "_home_v_blocks_newsletter_signup_parent_id_idx" ON "_home_v_blocks_newsletter_signup" USING btree ("_parent_id");
  CREATE INDEX "_home_v_blocks_newsletter_signup_path_idx" ON "_home_v_blocks_newsletter_signup" USING btree ("_path");
  CREATE INDEX "_home_v_blocks_newsletter_signup_audience_idx" ON "_home_v_blocks_newsletter_signup" USING btree ("audience_id");
  CREATE INDEX "_home_v_blocks_content_columns_order_idx" ON "_home_v_blocks_content_columns" USING btree ("_order");
  CREATE INDEX "_home_v_blocks_content_columns_parent_id_idx" ON "_home_v_blocks_content_columns" USING btree ("_parent_id");
  CREATE INDEX "_home_v_blocks_content_order_idx" ON "_home_v_blocks_content" USING btree ("_order");
  CREATE INDEX "_home_v_blocks_content_parent_id_idx" ON "_home_v_blocks_content" USING btree ("_parent_id");
  CREATE INDEX "_home_v_blocks_content_path_idx" ON "_home_v_blocks_content" USING btree ("_path");
  ALTER TABLE "home_rels" ADD CONSTRAINT "home_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_home_v_rels" ADD CONSTRAINT "_home_v_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "home_rels_categories_id_idx" ON "home_rels" USING btree ("categories_id");
  CREATE INDEX "_home_v_rels_categories_id_idx" ON "_home_v_rels" USING btree ("categories_id");`)
}
