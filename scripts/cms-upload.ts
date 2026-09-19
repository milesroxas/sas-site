import { readFile, stat } from 'node:fs/promises'
import { basename, extname } from 'node:path'
import sharp from 'sharp'

/**
 * Uploads one image to the CMS media library as INTERNAL, for an agent's
 * screenshots and figures (docs/figures.md). MCP cannot carry a binary, so this
 * is the one way an agent adds media.
 *
 * It goes through REST as a named team member, never the Local API: access
 * control, the alt-text rule and the folder hooks all apply exactly as they do
 * to a person in the admin. Every upload lands `usageStatus: internal`, set
 * here explicitly because the collection's own default is public. Nothing this
 * script uploads renders on the site until a person opens it in the admin and
 * approves it. That gate is the point; do not add a flag around it.
 *
 * The image is re-encoded through sharp, which drops EXIF, GPS and every other
 * metadata block. A screenshot of the admin can still show an email address or
 * a key in its pixels: look at the image before uploading it.
 *
 *   pnpm cms:upload <file> --alt "<text>" [--caption "<text>"] [--library <id>]
 *
 * Env: CMS_UPLOAD_EMAIL and CMS_UPLOAD_PASSWORD (a team member's login), and
 * NEXT_PUBLIC_SERVER_URL for the target (the workspace dev server by default).
 * Prints the new media id on stdout and nothing else, so it can be captured.
 */

/** Screenshots and figures. Anything heavier is a video or a mistake, and belongs in the admin. */
const MAX_BYTES = 8 * 1024 * 1024

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
const { CMS_UPLOAD_EMAIL: email, CMS_UPLOAD_PASSWORD: password } = process.env
const server = process.env.NEXT_PUBLIC_SERVER_URL?.replace(/\/$/, '')

if (!file)
  fail('usage: pnpm cms:upload <file> --alt "<text>" [--caption "<text>"] [--library <id>]')
if (!alt) fail('--alt is required: say what the image shows, for someone who cannot see it.')
if (library && !/^\d+$/.test(library)) fail('--library takes a numeric asset library id.')
if (!email || !password) fail('set CMS_UPLOAD_EMAIL and CMS_UPLOAD_PASSWORD (a team member login).')
if (!server) fail('set NEXT_PUBLIC_SERVER_URL to the site to upload to.')

const type = TYPES[extname(file).toLowerCase()]
if (!type) fail(`unsupported file type. Use one of: ${Object.keys(TYPES).join(', ')}`)
const { size } = await stat(file).catch(() => fail(`cannot read ${file}`))
if (size > MAX_BYTES) fail(`${file} is ${size} bytes; the ceiling is ${MAX_BYTES}.`)

// Re-encoding in the same format is what strips the metadata: sharp writes
// none unless asked to keep it.
const clean = await sharp(await readFile(file))
  .rotate() // bake the EXIF orientation in before it is dropped
  .toFormat(type === 'image/jpeg' ? 'jpeg' : type === 'image/png' ? 'png' : 'webp')
  .toBuffer()

/** Payload's error envelope, reduced to the messages a person can act on. */
const errorsOf = async (response: Response): Promise<string> => {
  const body = (await response.json().catch(() => null)) as {
    errors?: { data?: { errors?: { message: string; path: string }[] }; message: string }[]
  } | null
  const messages = body?.errors?.flatMap((error) => [
    error.message,
    ...(error.data?.errors?.map((field) => `${field.path}: ${field.message}`) ?? []),
  ])
  return messages?.join('; ') || `${response.status} ${response.statusText}`
}

const login = await fetch(`${server}/api/users/login`, {
  body: JSON.stringify({ email, password }),
  headers: { 'Content-Type': 'application/json' },
  method: 'POST',
})
if (!login.ok) fail(`login failed: ${await errorsOf(login)}`)
const { token } = (await login.json()) as { token?: string }
if (!token) fail('login returned no token.')

/** Media captions are rich text; a script caption is one plain paragraph of it. */
const paragraph = (text: string) => ({
  root: {
    children: [
      {
        children: [
          { detail: 0, format: 0, mode: 'normal', style: '', text, type: 'text', version: 1 },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        type: 'paragraph',
        version: 1,
      },
    ],
    direction: 'ltr',
    format: '',
    indent: 0,
    type: 'root',
    version: 1,
  },
})

const form = new FormData()
form.set('file', new Blob([new Uint8Array(clean)], { type }), basename(file))
form.set(
  '_payload',
  JSON.stringify({
    alt,
    usageStatus: 'internal',
    ...(caption ? { caption: paragraph(caption) } : {}),
    ...(library ? { assetLibrary: Number(library) } : {}),
  }),
)

const upload = await fetch(`${server}/api/media`, {
  body: form,
  headers: { Authorization: `JWT ${token}` },
  method: 'POST',
})
if (!upload.ok) fail(`upload failed: ${await errorsOf(upload)}`)

const { doc } = (await upload.json()) as { doc?: { id: number; usageStatus?: string } }
// Belt and braces on the one property that matters: refuse to report success
// for anything that did not land internal.
if (doc?.usageStatus !== 'internal')
  fail(`uploaded media ${doc?.id ?? '(unknown)'} is not internal. Fix it in the admin now.`)

console.log(doc.id)
