import crypto from 'node:crypto'
import { APIError, addDataAndFileToRequest, type Endpoint, type PayloadRequest } from 'payload'
import sharp from 'sharp'
import type { User } from '@/payload-types'

/**
 * POST /api/agent/media: the one way an agent adds media (docs/figures.md).
 * MCP tools cannot carry a binary, and an MCP key fails every team-only REST
 * rule by design (`access/authenticated.ts`), so plain `POST /api/media` is
 * closed to it. This endpoint is the narrow door instead of a wider rule.
 *
 * It authenticates the way `/api/mcp` does: `Authorization: Bearer <key>`,
 * looked up by its HMAC index, then acts as the team member the key is linked
 * to with access control on. It also needs its own capability on the key,
 * `uploadMedia`, off by default like every other capability: a key that can
 * read media cannot add it until a team member says so.
 *
 * Everything that matters is enforced here, not in the client: alt text and
 * an Asset Library to file it under are required, the bytes must decode as an allowed image type whatever the
 * request claims, the image is re-encoded (which drops EXIF, GPS and every
 * other metadata block), and the document is created `usageStatus: internal`
 * with no way to ask for anything else. Nothing uploaded here renders on the
 * site until a person approves it in the admin.
 */

/** The key collection the MCP plugin creates (`plugins/mcp.ts`). */
const API_KEYS = 'payload-mcp-api-keys'

/** Screenshots and figures. Anything heavier is a video or a mistake, and belongs in the admin. */
const MAX_BYTES = 8 * 1024 * 1024
const MAX_ALT = 300
const MAX_CAPTION = 300

/** What the bytes may decode as, and the mimetype each is stored under. */
const FORMATS = { jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp' } as const
type Format = keyof typeof FORMATS

const isFormat = (value: unknown): value is Format =>
  typeof value === 'string' && Object.hasOwn(FORMATS, value)

/**
 * The team member a key acts as, if the key exists and may upload. Same lookup
 * as the MCP plugin's own (`resolveAccessSettings`): the key is never stored
 * in the clear, only its HMAC under the Payload secret.
 */
async function uploaderFor(req: PayloadRequest): Promise<User> {
  const header = req.headers.get('Authorization')
  const key = header?.startsWith('Bearer ') ? header.slice('Bearer '.length).trim() : ''
  if (!key) throw new APIError('Send the MCP API key as "Authorization: Bearer <key>".', 401)

  const apiKeyIndex = crypto.createHmac('sha256', req.payload.secret).update(key).digest('hex')
  const { docs } = await req.payload.find({
    collection: API_KEYS,
    depth: 1,
    limit: 1,
    pagination: false,
    where: { apiKeyIndex: { equals: apiKeyIndex } },
  })
  const [apiKey] = docs
  const user = apiKey?.user
  if (!apiKey || !user || typeof user !== 'object') throw new APIError('Unknown API key.', 401)
  if (apiKey.uploadMedia !== true)
    throw new APIError(
      'This key may not upload media. A team member can allow it on the key: System, API Keys, "Upload media".',
      403,
    )
  return { ...user, collection: 'users' }
}

/** A short plain-text input, trimmed; empty when absent or not a string. */
const text = (value: unknown, max: number, name: string): string => {
  const trimmed = typeof value === 'string' ? value.trim() : ''
  if (trimmed.length > max) throw new APIError(`${name} is limited to ${max} characters.`, 400)
  return trimmed
}

/** Media captions are rich text; an uploaded caption is one plain paragraph of it. */
const paragraph = (value: string) => ({
  root: {
    children: [
      {
        children: [
          {
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
            text: value,
            type: 'text',
            version: 1,
          },
        ],
        direction: 'ltr' as const,
        format: '' as const,
        indent: 0,
        type: 'paragraph',
        version: 1,
      },
    ],
    direction: 'ltr' as const,
    format: '' as const,
    indent: 0,
    type: 'root',
    version: 1,
  },
})

/**
 * The upload as clean bytes. The format comes from decoding the image, never
 * from the filename or the declared mimetype, and re-encoding in that format
 * is what strips the metadata: sharp writes none unless asked to keep it.
 */
async function cleanImage(data: Buffer): Promise<{ data: Buffer; mimetype: string }> {
  if (data.length > MAX_BYTES)
    throw new APIError(`The file is ${data.length} bytes; the ceiling is ${MAX_BYTES}.`, 413)
  const { format } = await sharp(data)
    .metadata()
    .catch(() => ({ format: undefined }))
  if (!isFormat(format))
    throw new APIError(`Upload a ${Object.keys(FORMATS).join(', ')} image.`, 415)
  // `rotate()` bakes the EXIF orientation in before the tag is dropped.
  return { data: await sharp(data).rotate().toFormat(format).toBuffer(), mimetype: FORMATS[format] }
}

export const agentMediaEndpoint: Endpoint = {
  path: '/agent/media',
  method: 'post',
  handler: async (req) => {
    const uploader = await uploaderFor(req)
    await addDataAndFileToRequest(req)

    const { alt, assetLibrary, caption } = (req.data ?? {}) as Record<string, unknown>
    const altText = text(alt, MAX_ALT, 'alt')
    if (!altText)
      throw new APIError(
        'alt is required: say what the image shows, for someone who cannot see it.',
        400,
      )
    const captionText = text(caption, MAX_CAPTION, 'caption')
    // Every media document is filed (`hooks/assetLibraryFolders.ts`). Asked for
    // here, by name, rather than left to fail later as a folder error.
    if (!Number.isInteger(assetLibrary) || Number(assetLibrary) <= 0)
      throw new APIError(
        'assetLibrary is required: the id of the Asset Library to file this under. Find it with the asset-libraries find tool.',
        400,
      )
    if (!req.file) throw new APIError('Send the image as the multipart field "file".', 400)

    const clean = await cleanImage(req.file.data)
    // From here on the request is the linked team member's, as it is at
    // `/api/mcp`: access control, the folder hooks and validation all apply.
    req.user = uploader
    const library = await req.payload.findByID({
      collection: 'asset-libraries',
      depth: 0,
      disableErrors: true,
      id: Number(assetLibrary),
      overrideAccess: false,
      req,
    })
    if (!library) throw new APIError(`No Asset Library with id ${assetLibrary}.`, 400)
    const media = await req.payload.create({
      collection: 'media',
      data: {
        alt: altText,
        // Only the fields named here are ever read from the request.
        assetLibrary: library.id,
        ...(captionText ? { caption: paragraph(captionText) } : {}),
        usageStatus: 'internal',
      },
      file: { ...req.file, ...clean, size: clean.data.length },
      overrideAccess: false,
      req,
    })
    return Response.json({ id: media.id, usageStatus: media.usageStatus }, { status: 201 })
  },
}
