import path from 'node:path'
import type { CollectionBeforeChangeHook } from 'payload'
import type { Media } from '@/payload-types'
import { extractVideoFrame } from '@/utilities/extractVideoFrame'

type UploadRequestFile = {
  data?: Buffer
  mimetype: string
  name: string
  size?: number
  tempFilePath?: string
}

const relationId = (value: unknown): number | undefined => {
  if (typeof value === 'number') return value
  if (typeof value === 'object' && value !== null && 'id' in value) {
    const id = (value as { id: unknown }).id
    return typeof id === 'number' ? id : undefined
  }
  return undefined
}

/**
 * When a video file is uploaded without a poster, extract the first frame and
 * create a sibling Media image in the same transaction, then attach it as
 * `poster`. Collection `beforeChange` runs after `generateFileData` (mimeType
 * is set) and before field validation, so public-approve rules still see the
 * poster on the same save.
 *
 * Skips when:
 * - `context.skipAutoPoster` (creating the poster image itself)
 * - the upload is not a video
 * - a poster is already set on the incoming data or original doc
 */
export const generateVideoPoster: CollectionBeforeChangeHook<Media> = async ({
  context,
  data,
  originalDoc,
  req,
}) => {
  if (context.skipAutoPoster) return data

  const file = req.file as UploadRequestFile | undefined
  if (!file?.mimetype?.startsWith('video/')) return data

  const resolvedPoster = data?.poster !== undefined ? data.poster : originalDoc?.poster
  if (relationId(resolvedPoster) != null) return data

  try {
    const frame = await extractVideoFrame({
      data: file.data,
      filename: file.name,
      tempFilePath: file.tempFilePath,
    })

    const titleBase =
      (typeof data?.title === 'string' && data.title.trim()) ||
      path.parse(file.name).name ||
      'Video'

    const poster = await req.payload.create({
      collection: 'media',
      context: { skipAutoPoster: true },
      data: {
        alt: `Poster frame for ${titleBase}`,
        assetLibrary: data?.assetLibrary ?? originalDoc?.assetLibrary,
        folder: data?.folder ?? originalDoc?.folder,
        organization: data?.organization ?? originalDoc?.organization,
        project: data?.project ?? originalDoc?.project,
        purpose: 'motion',
        title: `${titleBase} poster`,
        usageStatus: data?.usageStatus ?? originalDoc?.usageStatus ?? 'internal',
      },
      file: {
        data: frame.buffer,
        mimetype: frame.mimeType,
        name: frame.filename,
        size: frame.buffer.byteLength,
      },
      req,
    })

    if (data) {
      data.poster = poster.id
    }
  } catch (error) {
    req.payload.logger.error({
      err: error,
      msg: 'Failed to auto-generate video poster',
      filename: file.name,
    })
  }

  return data
}
