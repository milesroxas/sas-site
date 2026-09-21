import crypto from 'node:crypto'
import { parse } from 'node:path'
import { APIError, addDataAndFileToRequest, type Endpoint, type PayloadRequest } from 'payload'
import sharp from 'sharp'
import type { Media, User } from '@/payload-types'

/**
 * POST /api/agent/media: the one way an agent adds media, and the one place
 * that decides what an agent upload becomes. The docs, the skill and the MCP
 * descriptions point here instead of restating it (docs/figures.md).
 *
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
 * Everything that matters is decided here, not in the client: alt text and
 * an Asset Library to file it under are required, the bytes must decode as an
 * allowed image type whatever the request claims, the image is stored as WebP
 * (which compresses it and drops EXIF, GPS and every other metadata block),
 * and it lands as `AGENT_UPLOAD_STATUS`.
 */

/** The key collection the MCP plugin creates (`plugins/mcp.ts`). */
const API_KEYS = 'payload-mcp-api-keys'

/** Screenshots and figures. Anything heavier is a video or a mistake, and belongs in the admin. */
const MAX_BYTES = 8 * 1024 * 1024
const MAX_ALT = 300
const MAX_CAPTION = 300

/**
 * What every agent upload lands as. Public on arrival, like any approved
 * asset: the agent's look at the pixels before uploading is the only check.
 */
export const AGENT_UPLOAD_STATUS = 'public-approved' satisfies Media['usageStatus']

/** What the bytes may decode as. Every one is stored as WebP. */
const ACCEPTED = ['jpeg', 'png', 'webp'] as const

/**
 * Measured on the Lab screenshots (2026-09-21): 86% smaller than the PNG and
 * JPEG sources, and small grey UI text still matches the source at 2x zoom.
 * `smartSubsample` keeps coloured text and hairlines sharp.
 */
const WEBP = { quality: 85, smartSubsample: true } as const

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
 * The upload as clean WebP. Whether it is an image at all comes from decoding
 * the bytes, never from the filename or the declared mimetype. Re-encoding is
 * what compresses it and what strips the metadata: sharp writes none unless
 * asked to keep it.
 */
async function cleanImage(file: {
  data: Buffer
  name: string
}): Promise<{ data: Buffer; mimetype: string; name: string }> {
  if (file.data.length > MAX_BYTES)
    throw new APIError(`The file is ${file.data.length} bytes; the ceiling is ${MAX_BYTES}.`, 413)
  const { format } = await sharp(file.data)
    .metadata()
    .catch(() => ({ format: undefined }))
  if (!ACCEPTED.some((accepted) => accepted === format))
    throw new APIError(`Upload a ${ACCEPTED.join(', ')} image.`, 415)
  // `rotate()` bakes the EXIF orientation in before the tag is dropped.
  const data = await sharp(file.data).rotate().webp(WEBP).toBuffer()
  return { data, mimetype: 'image/webp', name: `${parse(file.name).name || 'upload'}.webp` }
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

    const clean = await cleanImage(req.file)
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
        usageStatus: AGENT_UPLOAD_STATUS,
      },
      // Built from the clean bytes alone: a spread `tempFilePath` would make
      // Payload read the original upload from disk instead.
      file: { ...clean, size: clean.data.length },
      overrideAccess: false,
      req,
    })
    return Response.json({ id: media.id, usageStatus: media.usageStatus }, { status: 201 })
  },
}
