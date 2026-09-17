import {
  APIError,
  type CollectionAfterReadHook,
  type CollectionBeforeChangeHook,
  type CollectionBeforeDeleteHook,
  type PayloadRequest,
  type Plugin,
} from 'payload'
import { StreakLooks, StreakReleases, StreakRenders } from './collections'
import { workerEndpoints } from './endpoints'

/** Walk once at the document boundary and batch every nested visual reference. */
const hydrateReleases = async ({
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
        'release' in child &&
        typeof child.release === 'number'
      )
        slots.push(child as Record<string, unknown>)
      else walk(child)
    }
  }
  walk(doc)
  const ids = [...new Set(slots.map((slot) => Number(slot.release)))]
  if (!ids.length) return doc
  req.context.streakReleases ??= new Map()
  const cache = req.context.streakReleases as Map<number, unknown>
  const missing = ids.filter((id) => !cache.has(id))
  if (missing.length) {
    const result = await req.payload.find({
      collection: 'streak-releases',
      where: { id: { in: missing } },
      limit: missing.length,
      depth: 0,
      req,
    })
    for (const release of result.docs) cache.set(release.id, release)
  }
  for (const slot of slots) slot.release = cache.get(Number(slot.release)) ?? slot.release
  return doc
}

export const streakStudioPlugin: Plugin = (config) => ({
  ...config,
  endpoints: [...(config.endpoints ?? []), ...workerEndpoints],
  collections: [
    ...(config.collections ?? []).map((collection) => ({
      ...collection,
      hooks: {
        ...collection.hooks,
        afterRead: [...(collection.hooks?.afterRead ?? []), hydrateReleases],
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
    hooks: { ...global.hooks, afterRead: [...(global.hooks?.afterRead ?? []), hydrateReleases] },
  })),
})

async function protectPoster(
  id: string | number,
  req: Parameters<CollectionAfterReadHook>[0]['req'],
) {
  const used = await req.payload.count({
    collection: 'streak-releases',
    where: { or: [{ darkPoster: { equals: id } }, { lightPoster: { equals: id } }] },
    req,
  })
  if (used.totalDocs)
    throw new APIError(
      'This is an immutable Streak Field release poster. Duplicate it to edit.',
      400,
    )
}
