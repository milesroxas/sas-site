import {
  APIError,
  type CollectionAfterReadHook,
  type CollectionBeforeChangeHook,
  type CollectionBeforeDeleteHook,
  type CollectionConfig,
  type Field,
  type PayloadRequest,
  type Plugin,
} from 'payload'
import { StreakLooks, StreakReleases, StreakRenders } from './collections'
import { LOOKS_SLUG } from './components/paths'

/** The relationship a visual slot's shader group stores its Studio look in. */
const SLOT_FIELD = 'studio'

/**
 * The names of the groups that hold a Studio look anywhere in a schema
 * (`shader`, `menuPreviewShader`). Read once, when the config is built: a
 * collection with none is never hydrated, and the walk matches a slot by the
 * group's name, never by the shape of a value.
 */
function slotGroups(fields: Field[], names = new Set<string>()): Set<string> {
  for (const field of fields) {
    if (field.type === 'tabs') for (const tab of field.tabs) slotGroups(tab.fields, names)
    else if (field.type === 'blocks')
      for (const block of field.blocks) slotGroups(block.fields, names)
    else if ('fields' in field) {
      const holdsLook = field.fields.some(
        (child) =>
          child.type === 'relationship' &&
          child.name === SLOT_FIELD &&
          child.relationTo === LOOKS_SLUG,
      )
      if (holdsLook && field.type === 'group' && 'name' in field) names.add(field.name)
      slotGroups(field.fields, names)
    }
  }
  return names
}

/**
 * A visual slot stores the id of the Studio look it uses. Walk once at the
 * document boundary, batch every nested slot, and hand each one what the site
 * renders from: the published look's snapshot, posters and hash. A look that
 * was never published keeps its bare id, and the slot falls back to its
 * shipped look.
 */
const hydrateStudioFields =
  (groups: Set<string>) =>
  async ({ doc, req }: { doc: Record<string, unknown>; req: PayloadRequest }) => {
    const slots: Record<string, unknown>[] = []
    const walk = (value: unknown) => {
      if (!value || typeof value !== 'object') return
      if (Array.isArray(value)) {
        for (const item of value) walk(item)
        return
      }
      for (const [key, child] of Object.entries(value)) {
        if (
          groups.has(key) &&
          child &&
          typeof child === 'object' &&
          typeof (child as Record<string, unknown>)[SLOT_FIELD] === 'number'
        )
          slots.push(child as Record<string, unknown>)
        else walk(child)
      }
    }
    walk(doc)
    const ids = [...new Set(slots.map((slot) => Number(slot[SLOT_FIELD])))]
    if (!ids.length) return doc
    // Per request, and it remembers a miss: a list of documents that share an
    // unpublished look asks for it once.
    req.context.studioLooks ??= new Map()
    const cache = req.context.studioLooks as Map<number, unknown>
    const missing = ids.filter((id) => !cache.has(id))
    if (missing.length) {
      const result = await req.payload.find({
        collection: LOOKS_SLUG,
        where: { id: { in: missing } },
        limit: missing.length,
        depth: 0,
        // The published document, and of it only what `parseRelease` reads: this
        // lands in public page responses.
        draft: false,
        select: { sourceHash: true, snapshot: true, posters: true },
        req,
      })
      for (const id of missing) cache.set(id, null)
      for (const look of result.docs) if (look.snapshot) cache.set(look.id, look)
    }
    for (const slot of slots)
      slot[SLOT_FIELD] = cache.get(Number(slot[SLOT_FIELD])) ?? slot[SLOT_FIELD]
    return doc
  }

/** The hydration hook for a schema, or none when it holds no slot. */
const hydration = (fields: Field[]) => {
  const groups = slotGroups(fields)
  return groups.size ? [hydrateStudioFields(groups)] : []
}

export type StreakStudioPluginConfig = {
  /**
   * `false` keeps the collections (so the schema and the generated types do
   * not change) but leaves every hook and endpoint out, the look collection's
   * own included, the way Payload's own plugins disable.
   */
  enabled?: boolean
}

const schemaOnly = ({ hooks: _hooks, endpoints: _endpoints, ...collection }: CollectionConfig) =>
  collection

/**
 * The Studio: the looks collection, the hydration of every visual slot that
 * uses one, and the guard on the posters a published look owns. Payload's
 * plugin shape: options in, a function of the config out, every existing hook
 * kept.
 */
export const streakStudioPlugin =
  (options: StreakStudioPluginConfig = {}): Plugin =>
  (config) => {
    if (options.enabled === false)
      return {
        ...config,
        collections: [
          ...(config.collections ?? []),
          schemaOnly(StreakLooks),
          StreakReleases,
          StreakRenders,
        ],
      }
    return withStudio(config)
  }

const withStudio: Plugin = (config) => ({
  ...config,
  collections: [
    ...(config.collections ?? []).map((collection) => ({
      ...collection,
      hooks: {
        ...collection.hooks,
        afterRead: [...(collection.hooks?.afterRead ?? []), ...hydration(collection.fields)],
        ...(collection.slug === 'media'
          ? {
              beforeChange: [
                ...(collection.hooks?.beforeChange ?? []),
                async (args: Parameters<CollectionBeforeChangeHook>[0]) => {
                  if (args.operation === 'update')
                    await protectPoster(args.originalDoc.id, args.req)
                  return args.data
                },
              ],
              beforeDelete: [
                ...(collection.hooks?.beforeDelete ?? []),
                async ({ id, req }: Parameters<CollectionBeforeDeleteHook>[0]) =>
                  protectPoster(id, req),
              ],
            }
          : {}),
      },
    })),
    StreakLooks,
    StreakReleases,
    StreakRenders,
  ],
  globals: (config.globals ?? []).map((global) => ({
    ...global,
    hooks: {
      ...global.hooks,
      afterRead: [...(global.hooks?.afterRead ?? []), ...hydration(global.fields)],
    },
  })),
})

async function protectPoster(
  id: string | number,
  req: Parameters<CollectionAfterReadHook>[0]['req'],
) {
  const used = await req.payload.count({
    collection: LOOKS_SLUG,
    where: { or: [{ thumbnail: { equals: id } }, { lightPoster: { equals: id } }] },
    req,
  })
  if (used.totalDocs)
    throw new APIError(
      'This is the poster of a published Studio look. Publish the look again to replace it.',
      400,
    )
}
