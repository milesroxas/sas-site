/**
 * One-shot migration: copy every object from Vercel Blob into Cloudflare R2,
 * preserving the exact key/filename so Payload media docs keep resolving.
 *
 *   Dry run (default, no writes):  pnpm tsx scripts/migrate-blob-to-r2.ts
 *   Commit:                        pnpm tsx scripts/migrate-blob-to-r2.ts --commit
 *
 * Idempotent: an object already present in R2 with a matching size is skipped,
 * so re-running after a partial failure only copies what's missing. Reads from
 * Blob and writes to R2 — never deletes from Blob. Keep BLOB_READ_WRITE_TOKEN
 * set until the swap is verified in production.
 */
import { HeadObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { list } from '@vercel/blob'
import 'dotenv/config'

const COMMIT = process.argv.includes('--commit')

const {
  BLOB_READ_WRITE_TOKEN,
  R2_ACCOUNT_ID,
  R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY,
  R2_BUCKET,
} = process.env

for (const [k, v] of Object.entries({
  BLOB_READ_WRITE_TOKEN,
  R2_ACCOUNT_ID,
  R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY,
  R2_BUCKET,
})) {
  if (!v) {
    console.error(`Missing env var: ${k}`)
    process.exit(1)
  }
}

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID as string,
    secretAccessKey: R2_SECRET_ACCESS_KEY as string,
  },
})

// The Blob key is the object pathname (e.g. "media/hero.mp4"). Payload's S3
// adapter stores under the bare filename, so strip a leading "media/" segment
// to match what the frontend requests from the R2 custom domain.
const toR2Key = (pathname: string): string => pathname.replace(/^media\//, '')

// Blob's list() does not return contentType, so derive it from the extension.
// A wrong MIME is not cosmetic: <source type> matching fails and the browser
// refuses to play the video.
const CONTENT_TYPES: Record<string, string> = {
  avif: 'image/avif',
  gif: 'image/gif',
  jpeg: 'image/jpeg',
  jpg: 'image/jpeg',
  mp4: 'video/mp4',
  png: 'image/png',
  svg: 'image/svg+xml',
  webm: 'video/webm',
  webp: 'image/webp',
}

const contentTypeFor = (key: string): string => {
  const ext = key.split('.').pop()?.toLowerCase() ?? ''
  const type = CONTENT_TYPES[ext]
  if (!type) throw new Error(`Unknown extension ".${ext}" — add it to CONTENT_TYPES`)
  return type
}

// Matches only when both size and content type agree, so objects uploaded with
// a wrong MIME are re-put rather than skipped.
const existsInR2 = async (key: string, size: number, contentType: string): Promise<boolean> => {
  try {
    const head = await s3.send(new HeadObjectCommand({ Bucket: R2_BUCKET, Key: key }))
    return head.ContentLength === size && head.ContentType === contentType
  } catch {
    return false
  }
}

async function main() {
  console.log(COMMIT ? '=== COMMIT: writing to R2 ===' : '=== DRY RUN: no writes ===\n')

  let cursor: string | undefined
  let total = 0
  let copied = 0
  let skipped = 0
  const failures: Array<{ key: string; error: string }> = []

  do {
    const page = await list({ token: BLOB_READ_WRITE_TOKEN, cursor, limit: 1000 })
    for (const blob of page.blobs) {
      total++
      const key = toR2Key(blob.pathname)
      const contentType = contentTypeFor(key)

      if (await existsInR2(key, blob.size, contentType)) {
        skipped++
        console.log(`skip   ${key} (already in R2, ${blob.size}B)`)
        continue
      }

      if (!COMMIT) {
        console.log(`would  ${key}  (${blob.size}B, ${contentType})`)
        continue
      }

      try {
        const res = await fetch(blob.url)
        if (!res.ok) throw new Error(`fetch ${res.status}`)
        const body = Buffer.from(await res.arrayBuffer())
        await s3.send(
          new PutObjectCommand({
            Bucket: R2_BUCKET,
            Key: key,
            Body: body,
            ContentType: contentType,
            CacheControl: 'public, max-age=31536000, immutable',
          }),
        )
        copied++
        console.log(`copy   ${key}  (${blob.size}B)`)
      } catch (err) {
        const error = err instanceof Error ? err.message : String(err)
        failures.push({ key, error })
        console.error(`FAIL   ${key}: ${error}`)
      }
    }
    cursor = page.hasMore ? page.cursor : undefined
  } while (cursor)

  console.log(
    `\n${COMMIT ? 'Copied' : 'Would copy'}: ${COMMIT ? copied : total - skipped} | Skipped: ${skipped} | Total: ${total}`,
  )
  if (failures.length) {
    console.error(`\n${failures.length} FAILURES:`)
    for (const f of failures) console.error(`  ${f.key}: ${f.error}`)
    process.exit(1)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
