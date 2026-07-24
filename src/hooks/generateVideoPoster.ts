import path from 'node:path'
import type { CollectionBeforeChangeHook, PayloadRequest } from 'payload'
import type { Media } from '@/payload-types'
import { extractVideoFrame } from '@/utilities/extractVideoFrame'

type UploadRequestFile = {
  data?: Buffer
  mimetype: string
  name: string
  size?: number
  tempFilePath?: string
}

type CloudStorageContext = {
  file?: UploadRequestFile
  uploadSizes?: PayloadRequest['payloadUploadSizes']
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
 * Nested `payload.create({ file, req })` reuses the parent request and sets
 * `req.file` to the poster. `@payloadcms/plugin-cloud-storage` then prefers
 * `req.file` over its stashed original, so the JPEG can be written to the
 * video object key. Stash the video before the nested create and restore
 * after so afterChange uploads the real video bytes.
 */
const preserveParentUpload = (req: PayloadRequest, file: UploadRequestFile) => {
  const previousFile = req.file
  const previousUploadSizes = req.payloadUploadSizes
  const previousCloudStorage = (req.context?._payloadCloudStorage ?? undefined) as
    | CloudStorageContext
    | undefined

  req.context = req.context || {}
  // Ensure cloud-storage's preserve hook (runs after ours) and getIncomingFiles
  // keep the parent video even if nested create mutates req.file.
  if (!req.context._payloadCloudStorage) {
    req.context._payloadCloudStorage = {
      file,
      uploadSizes: req.payloadUploadSizes,
    }
  }

  return () => {
    req.file = previousFile
    req.payloadUploadSizes = previousUploadSizes
    if (previousCloudStorage) {
      req.context._payloadCloudStorage = previousCloudStorage
    } else {
      req.context._payloadCloudStorage = {
        file,
        uploadSizes: previousUploadSizes,
      }
    }
    // Nested create merges `{ skipAutoPoster: true }` into the shared context.
    delete req.context.skipAutoPoster
  }
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

  const restoreParentUpload = preserveParentUpload(req, file)

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
        usageStatus: data?.usageStatus ?? originalDoc?.usageStatus ?? 'public-approved',
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
  } finally {
    restoreParentUpload()
  }

  return data
}
