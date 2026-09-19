import {
  APIError,
  type CollectionAfterReadHook,
  type CollectionBeforeChangeHook,
  type CollectionBeforeDeleteHook,
  type PayloadRequest,
  type Plugin,
} from 'payload'
import { StreakLooks, StreakReleases, StreakRenders } from './collections'
import { LOOKS_SLUG } from './components/paths'

/**
 * A visual slot stores the id of the Streak Field it uses. Walk once at the
 * document boundary, batch every nested slot, and hand each one what the site
 * renders from: the published look's snapshot, posters and hash. A field that
 * was never published keeps its bare id, and the slot falls back to its
 * built-in look.
 */
const hydrateStudioFields = async ({
  doc,
  req,
}: {
  doc: Record<string, unknown>
  req: PayloadRequest
}) => {
  const slots: Record<string, unknown>[] = []
  const walk = (value: unknown) => {
    if (!value || typeof value !== 'object') return
    if (Array.isArray(value)) {
      for (const item of value) walk(item)
      return
    }
    const object = value as Record<string, unknown>
    for (const [key, child] of Object.entries(object)) {
      if (
        (key === 'shader' || key === 'menuPreviewShader') &&
        child &&
        typeof child === 'object' &&
        'studio' in child &&
        typeof child.studio === 'number'
      )
        slots.push(child as Record<string, unknown>)
      else walk(child)
    }
  }
  walk(doc)
  const ids = [...new Set(slots.map((slot) => Number(slot.studio)))]
  if (!ids.length) return doc
  req.context.streakFields ??= new Map()
  const cache = req.context.streakFields as Map<number, unknown>
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
    for (const look of result.docs) if (look.snapshot) cache.set(look.id, look)
  }
  for (const slot of slots) slot.studio = cache.get(Number(slot.studio)) ?? slot.studio
  return doc
}

export type StreakStudioPluginConfig = {
  /**
   * `false` keeps the collections (so the schema and the generated types do
   * not change) but leaves every hook and endpoint out, the way Payload's
   * own plugins disable.
   */
  enabled?: boolean
}

/**
 * Streak Field Studio: the looks collection, the hydration of every visual
 * slot that uses one, and the guard on the posters a published look owns.
 * Payload's plugin shape: options in, a function of the config out, every
 * existing hook kept.
 */
export const streakStudioPlugin =
  (options: StreakStudioPluginConfig = {}): Plugin =>
  (config) => {
    if (options.enabled === false)
      return {
        ...config,
        collections: [...(config.collections ?? []), StreakLooks, StreakReleases, StreakRenders],
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
        afterRead: [...(collection.hooks?.afterRead ?? []), hydrateStudioFields],
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
      afterRead: [...(global.hooks?.afterRead ?? []), hydrateStudioFields],
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
      'This is the poster of a published Streak Field. Publish the field again to replace it.',
      400,
    )
}
