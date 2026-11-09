import { CopyObjectCommand, S3Client } from '@aws-sdk/client-s3'
import type { CollectionAfterChangeHook, Plugin } from 'payload'
import type { Resource } from '@/payload-types'
import { R2_BUCKET, r2ClientConfig } from '@/utilities/r2'

/**
 * `Content-Disposition` for a download: `attachment`, with the filename twice,
 * an ASCII fallback for old clients and the exact UTF-8 name (RFC 6266).
 */
export const attachmentDisposition = (filename: string): string => {
  const ascii = filename.replace(/[^\x20-\x7e]|["\\]/g, '_')
  const encoded = encodeURIComponent(filename).replace(
    /['()*!]/g,
    (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`,
  )
  return `attachment; filename="${ascii}"; filename*=UTF-8''${encoded}`
}

const FILE_KEYS = ['filename', 'filesize', 'mimeType', 'prefix', '_objectKey'] as const

let client: S3Client | undefined

/**
 * Marks a resource's R2 object as a download. The public custom domain serves
 * the metadata stored on the object, so with `attachment` stored there every
 * file type saves instead of rendering: the reader gets the PDF they clicked
 * for, and no uploaded file (an XML document, a PDF with script) ever runs in
 * a browser tab on the media domain. The storage adapter cannot set it on
 * upload, so the object is copied onto itself with the header replaced.
 *
 * Runs only when the file changed. A failure is logged, never thrown: the
 * upload stands and the file still downloads, just inline for types a browser
 * can display.
 */
const markAsDownload: CollectionAfterChangeHook<Resource> = async ({
  doc,
  operation,
  previousDoc,
  req,
}) => {
  const fileChanged =
    operation === 'create' || FILE_KEYS.some((key) => doc[key] !== previousDoc?.[key])
  if (!fileChanged || !doc.filename || !R2_BUCKET) return doc

  const key = [doc.prefix, doc._objectKey, doc.filename].filter(Boolean).join('/')
  try {
    client ??= new S3Client(r2ClientConfig)
    await client.send(
      new CopyObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
        CopySource: `${R2_BUCKET}/${key.split('/').map(encodeURIComponent).join('/')}`,
        MetadataDirective: 'REPLACE',
        ContentDisposition: attachmentDisposition(doc.filename),
        ContentType: doc.mimeType ?? undefined,
      }),
    )
  } catch (error) {
    req.payload.logger.error({ err: error, msg: `resources: could not mark ${key} as a download` })
  }
  return doc
}

/**
 * Appends `markAsDownload` to Resources after the storage plugin's own
 * afterChange hook, which is where the file is uploaded: as a plain collection
 * hook it would run first and copy an object that does not exist yet. So this
 * plugin must come after `s3Storage` in `payload.config.ts`.
 */
export const resourceDownloadHeaders: Plugin = (config) => ({
  ...config,
  collections: config.collections?.map((collection) =>
    collection.slug === 'resources'
      ? {
          ...collection,
          hooks: {
            ...collection.hooks,
            afterChange: [
              ...(collection.hooks?.afterChange ?? []),
              markAsDownload as CollectionAfterChangeHook,
            ],
          },
        }
      : collection,
  ),
})
