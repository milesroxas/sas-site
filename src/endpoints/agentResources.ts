import { APIError, addDataAndFileToRequest, type Endpoint } from 'payload'
import { AGENT_UPLOAD_STATUS, agentText, agentUploaderFor } from './agentUpload'

/**
 * POST /api/agent/resources: the one way an agent adds a downloadable file,
 * and the one place that decides what an agent upload becomes. The script,
 * the docs and the MCP description of `resources` point here.
 *
 * It authenticates the way `/api/mcp` does, then acts as the team member the
 * key is linked to with access control on, and needs the key's
 * `uploadResources` capability (`agentUpload.ts`).
 *
 * Any file type, like the collection: Payload's own upload checks still run,
 * so executables, HTML and scripts are refused by extension and by their
 * bytes, and SVGs are scanned. The bytes are stored as sent (a PDF or a zip
 * cannot be re-encoded the way an image is), so the file's own metadata, a
 * PDF's author for one, goes up with it: the agent checks the file first.
 *
 * The request carries only `title` and `description`. The file lands as
 * `AGENT_UPLOAD_STATUS`, and its title and description pass the house style
 * gate like any agent write.
 */

/**
 * Vercel refuses a function request body over 4.5 MB, multipart framing
 * included, so production could never accept more. The same ceiling applies
 * locally, so a size that works in development works in production.
 */
const MAX_BYTES = 4 * 1024 * 1024
const MAX_TITLE = 120
const MAX_DESCRIPTION = 500

/** A declared MIME type, or the generic one when the client sent none or nonsense. */
const mimeType = (declared: string | undefined): string =>
  declared && /^[\w.+-]+\/[\w.+-]+$/.test(declared) ? declared : 'application/octet-stream'

export const agentResourcesEndpoint: Endpoint = {
  path: '/agent/resources',
  method: 'post',
  handler: async (req) => {
    const uploader = await agentUploaderFor(req, 'uploadResources')
    await addDataAndFileToRequest(req)

    const { description, title } = (req.data ?? {}) as Record<string, unknown>
    const titleText = agentText(title, MAX_TITLE, 'title')
    if (!titleText)
      throw new APIError(
        'title is required: what the reader gets, e.g. "Layered design workbook".',
        400,
      )
    const descriptionText = agentText(description, MAX_DESCRIPTION, 'description')
    if (!req.file) throw new APIError('Send the file as the multipart field "file".', 400)
    if (req.file.data.length > MAX_BYTES)
      throw new APIError(
        `The file is ${req.file.data.length} bytes; the ceiling is ${MAX_BYTES} (Vercel's request limit).`,
        413,
      )

    // From here on the request is the linked team member's, as it is at
    // `/api/mcp`: access control, Payload's file checks and validation apply.
    req.user = uploader
    const resource = await req.payload.create({
      collection: 'resources',
      data: {
        // Only the fields named here are ever read from the request.
        title: titleText,
        ...(descriptionText ? { description: descriptionText } : {}),
        usageStatus: AGENT_UPLOAD_STATUS,
      },
      // Built from the bytes alone: a spread `tempFilePath` would make Payload
      // read the upload from disk instead.
      file: {
        data: req.file.data,
        mimetype: mimeType(req.file.mimetype),
        name: req.file.name,
        size: req.file.data.length,
      },
      overrideAccess: false,
      req,
    })
    return Response.json(
      { filename: resource.filename, id: resource.id, usageStatus: resource.usageStatus },
      { status: 201 },
    )
  },
}
