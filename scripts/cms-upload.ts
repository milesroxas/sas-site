import { readFile } from 'node:fs/promises'
import { basename, extname } from 'node:path'
import { cmsTarget } from './cms-target'

/**
 * Uploads one file to the CMS. MCP cannot carry a binary, so this is the one
 * way an agent adds a file. Two kinds:
 *
 *   pnpm cms:upload <image> --alt "<text>" --library <id> [--caption "<text>"] [--local]
 *   pnpm cms:upload <file> --resource --title "<text>" [--description "<text>"] [--local]
 *
 * An image goes to the media library, for an agent's screenshots and figures
 * (docs/figures.md). `--library` is the Asset Library it is filed under
 * (every media document is filed): find its id with the MCP
 * `asset-libraries` find tool.
 *
 * `--resource` sends any file to Resources, for a Download block or a post's
 * primary resource to offer.
 *
 * Either way it sends the MCP API key the agent already has to the matching
 * endpoint (`src/endpoints/agentMedia.ts`, `src/endpoints/agentResources.ts`),
 * which decides everything about the stored file and needs the key's "Upload
 * media" or "Upload resources" capability ticked (System, API Keys). This
 * script only reads the flags and the file.
 *
 * Env and the site it uploads to: `cms-target.ts`. A local site needs
 * `--local`, because an id only means something in the database the MCP
 * client is drafting in. Prints the new media or resource id on stdout and nothing else,
 * so it can be captured; the site it went to is on stderr.
 */

/** Only to label the multipart part. The server decides the type from the bytes. */
const IMAGE_TYPES: Record<string, string> = {
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
}

/**
 * A resource keeps the type it is sent with (Payload only sniffs images), and
 * the media domain serves it with that `Content-Type`. Common download types;
 * anything else goes as a generic binary, which still downloads.
 */
const RESOURCE_TYPES: Record<string, string> = {
  ...IMAGE_TYPES,
  '.csv': 'text/csv',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.epub': 'application/epub+zip',
  '.gif': 'image/gif',
  '.json': 'application/json',
  '.key': 'application/vnd.apple.keynote',
  '.md': 'text/markdown',
  '.mp3': 'audio/mpeg',
  '.mp4': 'video/mp4',
  '.pdf': 'application/pdf',
  '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.zip': 'application/zip',
}

const USAGE = [
  'usage: pnpm cms:upload <image> --alt "<text>" --library <id> [--caption "<text>"] [--local]',
  '       pnpm cms:upload <file> --resource --title "<text>" [--description "<text>"] [--local]',
].join('\n')

// A declaration, not an arrow: TypeScript only narrows after a `never` call it can resolve by name.
function fail(message: string): never {
  console.error(`cms:upload: ${message}`)
  process.exit(1)
}

const [file, ...rest] = process.argv.slice(2)
const flag = (name: string): string | undefined => {
  const index = rest.indexOf(`--${name}`)
  return index === -1 ? undefined : rest[index + 1]
}

if (!file || file.startsWith('--')) fail(USAGE)
const resource = rest.includes('--resource')

/** The endpoint, the file's type and the fields for the kind being uploaded. */
const upload = (): { endpoint: string; fields: Record<string, unknown>; type: string } => {
  const extension = extname(file).toLowerCase()
  if (resource) {
    const title = flag('title')?.trim()
    const description = flag('description')?.trim()
    if (!title) fail('--title is required: what the reader gets, e.g. "Layered design workbook".')
    return {
      endpoint: 'resources',
      fields: { title, ...(description ? { description } : {}) },
      type: RESOURCE_TYPES[extension] ?? 'application/octet-stream',
    }
  }
  const alt = flag('alt')?.trim()
  const caption = flag('caption')?.trim()
  const library = flag('library')
  if (!alt) fail('--alt is required: say what the image shows, for someone who cannot see it.')
  if (!library || !/^\d+$/.test(library))
    fail(
      '--library <id> is required: the Asset Library to file this under (asset-libraries find tool).',
    )
  const type = IMAGE_TYPES[extension]
  if (!type)
    fail(
      `unsupported image type. Use one of: ${Object.keys(IMAGE_TYPES).join(', ')}, or --resource for any file`,
    )
  return {
    endpoint: 'media',
    fields: { alt, assetLibrary: Number(library), ...(caption ? { caption } : {}) },
    type,
  }
}

const { endpoint, fields, type } = upload()
const target = cmsTarget({ local: rest.includes('--local') })
if (typeof target === 'string') fail(target)
const { key, server } = target

const bytes = await readFile(file).catch(() => fail(`cannot read ${file}`))

const form = new FormData()
form.set('file', new Blob([new Uint8Array(bytes)], { type }), basename(file))
form.set('_payload', JSON.stringify(fields))

console.error(`cms:upload: to ${server}`)
const response = await fetch(`${server}/api/agent/${endpoint}`, {
  body: form,
  headers: { Authorization: `Bearer ${key}` },
  method: 'POST',
}).catch((error: Error) => fail(`cannot reach ${server}: ${error.message}`))

const body = (await response.json().catch(() => null)) as {
  errors?: { message: string }[]
  id?: number
} | null

if (!response.ok)
  fail(
    body?.errors?.map((error) => error.message).join('; ') ||
      `${response.status} ${response.statusText}`,
  )
if (!body?.id) fail(`the server accepted the upload but answered without a ${endpoint} id.`)

console.log(body.id)
