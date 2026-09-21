import { readFile } from 'node:fs/promises'
import { basename, extname } from 'node:path'
import { cmsTarget } from './cms-target'

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
 *   pnpm cms:upload <file> --alt "<text>" --library <id> [--caption "<text>"] [--local]
 *
 * `--library` is the Asset Library the image is filed under (every media
 * document is filed). Find its id with the MCP `asset-libraries` find tool.
 *
 * Env and the site it uploads to: `cms-target.ts`. A local site needs
 * `--local`, because a media id only means something in the database the MCP
 * client is drafting in. Prints the new media id on stdout and nothing else,
 * so it can be captured; the site it went to is on stderr.
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

if (!file || file.startsWith('--'))
  fail('usage: pnpm cms:upload <file> --alt "<text>" --library <id> [--caption "<text>"] [--local]')
if (!alt) fail('--alt is required: say what the image shows, for someone who cannot see it.')
if (!library || !/^\d+$/.test(library))
  fail(
    '--library <id> is required: the Asset Library to file this under (asset-libraries find tool).',
  )
const target = cmsTarget({ local: rest.includes('--local') })
if (typeof target === 'string') fail(target)
const { key, server } = target

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

console.error(`cms:upload: to ${server}`)
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
