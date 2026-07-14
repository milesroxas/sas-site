import { type CollectionBeforeChangeHook, ValidationError } from 'payload'

import type { Post } from '../../../payload-types'

type MediaId = number | string

/**
 * Media read access filters anonymous requests to `usageStatus:
 * public-approved` (see Media.ts), so a published post referencing an
 * `internal` asset silently loses that image for public visitors. This hook
 * blocks publish until every referenced asset is public-approved.
 */

const refToId = (ref: unknown): MediaId | null => {
  if (typeof ref === 'number' || typeof ref === 'string') return ref
  if (ref && typeof ref === 'object' && 'id' in ref) {
    const id = (ref as { id: unknown }).id
    if (typeof id === 'number' || typeof id === 'string') return id
  }
  return null
}

const addRef = (ref: unknown, path: string, sources: Map<MediaId, Set<string>>): void => {
  const id = refToId(ref)
  if (id === null) return
  const paths = sources.get(id) ?? new Set()
  paths.add(path)
  sources.set(id, paths)
}

// Deep walk over serialized data (lexical states included, however nested):
// collects media referenced by upload nodes and mediaBlock instances.
const collectMediaRefs = (
  value: unknown,
  path: string,
  sources: Map<MediaId, Set<string>>,
): void => {
  if (!value || typeof value !== 'object') return
  if (Array.isArray(value)) {
    for (const item of value) collectMediaRefs(item, path, sources)
    return
  }
  const node = value as Record<string, unknown>
  if (node.type === 'upload' && node.relationTo === 'media') addRef(node.value, path, sources)
  if (node.blockType === 'mediaBlock') addRef(node.media, path, sources)
  for (const child of Object.values(node)) collectMediaRefs(child, path, sources)
}

export const validatePublicMedia: CollectionBeforeChangeHook<Post> = async ({ data, req }) => {
  if (data._status !== 'published') return data

  const sources = new Map<MediaId, Set<string>>()
  addRef(data.heroImage, 'heroImage', sources)
  addRef(data.meta?.image, 'meta.image', sources)
  collectMediaRefs(data.content, 'content', sources)

  if (sources.size === 0) return data

  const { docs } = await req.payload.find({
    collection: 'media',
    where: {
      and: [
        { id: { in: Array.from(sources.keys()) } },
        { usageStatus: { not_equals: 'public-approved' } },
      ],
    },
    select: { title: true, filename: true, usageStatus: true },
    depth: 0,
    limit: sources.size,
    req,
  })

  if (docs.length > 0) {
    throw new ValidationError({
      collection: 'posts',
      errors: docs.flatMap((media) => {
        const name = media.title || media.filename || `media ${media.id}`
        const message = `"${name}" is ${media.usageStatus}; set its Usage Status to public-approved before publishing.`
        return Array.from(sources.get(media.id) ?? ['content']).map((path) => ({ message, path }))
      }),
    })
  }

  return data
}
