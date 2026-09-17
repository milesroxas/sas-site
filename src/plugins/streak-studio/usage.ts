import { sql } from '@payloadcms/db-vercel-postgres'
import { APIError, type Endpoint } from 'payload'
import { authenticated } from '@/access/authenticated'

/** Follow indexed release references through block parents, including retained versions. */
export const releaseUsage: Endpoint = {
  path: '/:id/usage',
  method: 'get',
  handler: async (req) => {
    if (!authenticated({ req })) throw new APIError('Team sign-in required.', 401)
    const id = Number(req.routeParams?.id)
    if (!Number.isInteger(id)) throw new APIError('Invalid release.', 400)
    const edges = await req.payload.db.drizzle.execute(sql`
      SELECT c.conrelid::regclass::text AS source, c.confrelid::regclass::text AS target, a.attname AS field
      FROM pg_constraint c JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = ANY(c.conkey)
      WHERE c.contype = 'f' AND (c.confrelid = 'streak_releases'::regclass OR a.attname IN ('_parent_id', 'parent_id'))`)
    const roots = new Map<string, { label: string; url: string; global: boolean }>()
    for (const collection of req.payload.config.collections) {
      const key =
        req.payload.db.tableNameMap.get(collection.slug.replaceAll('-', '_')) ??
        collection.slug.replaceAll('-', '_')
      roots.set(key, {
        label:
          typeof collection.labels.plural === 'string' ? collection.labels.plural : collection.slug,
        url: `/admin/collections/${collection.slug}`,
        global: false,
      })
    }
    for (const global of req.payload.config.globals) {
      const key =
        req.payload.db.tableNameMap.get(global.slug.replaceAll('-', '_')) ??
        global.slug.replaceAll('-', '_')
      roots.set(key, {
        label: typeof global.label === 'string' ? global.label : global.slug,
        url: `/admin/globals/${global.slug}`,
        global: true,
      })
    }
    const queries = []
    for (const reference of edges.rows.filter(
      (row) =>
        row.target === 'streak_releases' &&
        !['streak_renders', 'payload_locked_documents_rels'].includes(String(row.source)),
    )) {
      const joins = []
      let table = String(reference.source)
      let alias = 'r0'
      let depth = 0
      while (!roots.has(table) && depth < 8) {
        const parent = edges.rows.find(
          (row) => row.source === table && ['_parent_id', 'parent_id'].includes(String(row.field)),
        )
        if (!parent) break
        const next = `r${++depth}`
        joins.push(
          sql`JOIN ${sql.identifier(String(parent.target))} AS ${sql.identifier(next)} ON ${sql.identifier(next)}.id::text = ${sql.identifier(alias)}.${sql.identifier(String(parent.field))}::text`,
        )
        table = String(parent.target)
        alias = next
      }
      const root = roots.get(table)
      if (!root) continue
      const title = req.payload.db.tables[table]?.title
        ? sql`${sql.identifier(alias)}.title`
        : sql`${root.label}`
      queries.push(
        sql`SELECT ${root.label} AS content, ${title} AS title, ${root.url} AS base_url, ${root.global} AS is_global, ${String(reference.source).startsWith('_')} AS historical, ${sql.identifier(alias)}.id::text AS document_id FROM ${sql.identifier(String(reference.source))} AS r0 ${sql.join(joins, sql` `)} WHERE r0.${sql.identifier(String(reference.field))} = ${id}`,
      )
    }
    if (!queries.length) return Response.json({ usages: [] })
    const result = await req.payload.db.drizzle.execute(
      sql`SELECT DISTINCT * FROM (${sql.join(queries, sql` UNION ALL `)}) AS usages LIMIT 200`,
    )
    return Response.json({
      usages: result.rows.map((row) => ({
        content: row.content,
        title: row.title,
        historical: row.historical,
        url: row.is_global ? row.base_url : `${row.base_url}/${row.document_id}`,
      })),
    })
  },
}
