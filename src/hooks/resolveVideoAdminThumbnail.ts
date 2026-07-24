import type { CollectionAfterReadHook } from 'payload'
import type { Media } from '@/payload-types'

type PosterDoc = Pick<Media, 'url' | 'sizes'>

const posterThumbnailURL = (poster: PosterDoc | null | undefined): string | null => {
  if (!poster) return null
  return poster.sizes?.thumbnail?.url || poster.url || null
}

/**
 * Videos have no Sharp-derived `sizes.thumbnail`. Admin list/edit cells read
 * `thumbnailURL` (from `upload.adminThumbnail`) and, for non-images, ignore
 * `url`. When `poster` is only an id (depth 0), resolve it so the admin
 * thumbnail still renders.
 */
export const resolveVideoAdminThumbnail: CollectionAfterReadHook<Media> = async ({ doc, req }) => {
  if (!doc?.mimeType?.startsWith('video')) return doc
  if (doc.thumbnailURL) return doc

  const posterRef = doc.poster
  if (!posterRef) return doc

  if (typeof posterRef === 'object') {
    doc.thumbnailURL = posterThumbnailURL(posterRef)
    return doc
  }

  try {
    const poster = await req.payload.findByID({
      collection: 'media',
      depth: 0,
      disableErrors: true,
      id: posterRef,
      req,
      select: {
        sizes: true,
        url: true,
      },
    })

    doc.thumbnailURL = posterThumbnailURL(poster)
  } catch (error) {
    req.payload.logger.error({
      err: error,
      msg: 'Failed to resolve video admin thumbnail from poster',
      mediaId: doc.id,
    })
  }

  return doc
}
