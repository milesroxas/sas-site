import { readFile } from 'node:fs/promises'
import { basename, extname } from 'node:path'

/**
 * Uploads one image to the CMS media library, for an agent's screenshots and
 * figures (docs/figures.md). MCP cannot carry a binary, so this is the one way
 * an agent adds media.
 *
 * It sends the MCP API key the agent already has to `POST /api/agent/media`
 * (`src/endpoints/agentMedia.ts`), which decides everything about the stored
 * file and needs the key's "Upload media" capability ticked (System, API
 * Keys). This script only reads the flags and the file.
 *
 *   pnpm cms:upload <file> --alt "<text>" --library <id> [--caption "<text>"]
 *
 * `--library` is the Asset Library the image is filed under (every media
 * document is filed). Find its id with the MCP `asset-libraries` find tool.
 *
 * Env: CMS_MCP_API_KEY (the same key the MCP client uses), and the site to
 * upload to: CMS_UPLOAD_SERVER, else NEXT_PUBLIC_SERVER_URL (the workspace dev
 * server). Prints the new media id on stdout and nothing else, so it can be
 * captured.
 */

/** Only to label the multipart part. The server decides the type from the bytes. */
const TYPES: Record<string, string> = {
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
}

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

const alt = flag('alt')?.trim()
const caption = flag('caption')?.trim()
const library = flag('library')
const key = process.env.CMS_MCP_API_KEY
const server = (process.env.CMS_UPLOAD_SERVER ?? process.env.NEXT_PUBLIC_SERVER_URL)?.replace(
  /\/$/,
  '',
)

if (!file) fail('usage: pnpm cms:upload <file> --alt "<text>" --library <id> [--caption "<text>"]')
if (!alt) fail('--alt is required: say what the image shows, for someone who cannot see it.')
if (!library || !/^\d+$/.test(library))
  fail(
    '--library <id> is required: the Asset Library to file this under (asset-libraries find tool).',
  )
if (!key) fail('set CMS_MCP_API_KEY to the MCP API key (the one the MCP client uses).')
if (!server) fail('set CMS_UPLOAD_SERVER (or NEXT_PUBLIC_SERVER_URL) to the site to upload to.')

const type = TYPES[extname(file).toLowerCase()]
if (!type) fail(`unsupported file type. Use one of: ${Object.keys(TYPES).join(', ')}`)
const bytes = await readFile(file).catch(() => fail(`cannot read ${file}`))

const form = new FormData()
form.set('file', new Blob([new Uint8Array(bytes)], { type }), basename(file))
form.set(
  '_payload',
  JSON.stringify({
    alt,
    assetLibrary: Number(library),
    ...(caption ? { caption } : {}),
  }),
)

const response = await fetch(`${server}/api/agent/media`, {
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
if (!body?.id) fail('the server accepted the upload but answered without a media id.')

console.log(body.id)
