import { randomUUID, timingSafeEqual } from 'node:crypto'
import { sql } from '@payloadcms/db-vercel-postgres'
import { APIError, type Endpoint, type PayloadRequest } from 'payload'
import sharp from 'sharp'
import { authenticated } from '@/access/authenticated'
import {
  type CaptureOptions,
  POSTER_CAPTURE,
  type StreakSnapshot,
  snapshotRecipe,
  validateCapture,
} from '@/features/immersive/studio/recipe'
import type { Media, StreakRender } from '@/payload-types'
import { recipeHash, studioInput } from './hash'
import { kickStudioWorker } from './kick'
import { idOf, promoteRelease, releaseOf } from './releases'
import { inTransaction, transactionDB } from './transaction'

function team(req: PayloadRequest) {
  if (!authenticated({ req }) || !req.user) throw new APIError('Team sign-in required.', 401)
  return req.user
}
function worker(req: PayloadRequest) {
  const expected = process.env.STREAK_WORKER_SECRET || process.env.CRON_SECRET
  const actual = req.headers.get('authorization')?.replace(/^Bearer /, '')
  if (
    !expected ||
    !actual ||
    Buffer.byteLength(expected) !== Buffer.byteLength(actual) ||
    !timingSafeEqual(Buffer.from(expected), Buffer.from(actual))
  )
    throw new APIError('Unauthorized worker.', 401)
}
const body = async (req: PayloadRequest) => (req.json ? await req.json() : {})

export const lookEndpoints: Endpoint[] = [
  {
    path: '/:id/publish-release',
    method: 'post',
    handler: async (req) => queue(req, 'publish'),
  },
  {
    path: '/:id/export',
    method: 'post',
    handler: async (req) => queue(req, 'export'),
  },
]

async function queue(req: PayloadRequest, kind: 'publish' | 'export') {
  const user = team(req)
  const data = await body(req)
  const look = await req.payload.findByID({
    collection: 'streak-looks',
    id: String(req.routeParams?.id),
    draft: true,
    depth: 0,
    req,
    user: req.user,
    overrideAccess: false,
  })
  if (look.archived) throw new APIError('Unarchive this look before publishing or exporting.', 400)
  // The saved revision, not a client-supplied recipe, is the publication source.
  const sourceHash = recipeHash(look.recipe)
  if (
    (data.recipe && recipeHash(data.recipe) !== sourceHash) ||
    (data.sourceHash && data.sourceHash !== sourceHash)
  )
    throw new APIError('The draft changed. Reload it before publishing.', 409)
  const snapshot = snapshotRecipe(look.recipe)
  const capture =
    kind === 'publish' ? POSTER_CAPTURE : studioInput(() => validateCapture(data.capture))
  if (kind === 'publish') {
    // The same output as an existing release renders nothing new: the look points at that release.
    const release = await releaseOf(req, look.id, sourceHash)
    if (release) {
      await inTransaction(req, () => promoteRelease(req, release))
      return Response.json({ state: 'complete', release: release.id, title: release.title })
    }
    const rendering = await req.payload.find({
      collection: 'streak-renders',
      where: {
        and: [
          { look: { equals: look.id } },
          { sourceHash: { equals: sourceHash } },
          { kind: { equals: kind } },
          { state: { in: ['queued', 'rendering'] } },
        ],
      },
      limit: 1,
      depth: 0,
      req,
    })
    if (rendering.docs[0]) {
      await kickStudioWorker(req)
      return Response.json(rendering.docs[0])
    }
  }
  const pending = await req.payload.count({
    collection: 'streak-renders',
    where: {
      and: [{ requestedBy: { equals: user.id } }, { state: { in: ['queued', 'rendering'] } }],
    },
    req,
  })
  if (pending.totalDocs >= 5)
    throw new APIError('Wait for your queued renders to finish before adding more.', 429)
  const job = await req.payload.create({
    collection: 'streak-renders',
    data: {
      title: look.title,
      look: look.id,
      state: 'queued',
      kind,
      sourceHash,
      snapshot,
      capture,
      requestedBy: user.id,
    },
    req,
  })
  await kickStudioWorker(req)
  return Response.json(job, { status: 202 })
}

export const renderEndpoints: Endpoint[] = [
  {
    path: '/:id/retry',
    method: 'post',
    handler: async (req) => {
      team(req)
      const result = await req.payload.update({
        collection: 'streak-renders',
        where: { and: [{ id: { equals: req.routeParams?.id } }, { state: { equals: 'failed' } }] },
        data: { state: 'queued', attempts: 0, error: null, lease: null },
        req,
      })
      await kickStudioWorker(req)
      return Response.json(result)
    },
  },
  {
    path: '/:id/cancel',
    method: 'post',
    handler: async (req) => {
      team(req)
      const result = await req.payload.update({
        collection: 'streak-renders',
        where: {
          and: [
            { id: { equals: req.routeParams?.id } },
            { state: { in: ['queued', 'rendering', 'failed'] } },
          ],
        },
        data: { state: 'cancelled', lease: null },
        req,
      })
      return Response.json(result)
    },
  },
]

async function upload(
  req: PayloadRequest,
  encoded: unknown,
  capture: CaptureOptions,
  title: string,
): Promise<Media> {
  if (typeof encoded !== 'string' || encoded.length > 20000000)
    throw new APIError('Invalid image payload.', 400)
  const buffer = Buffer.from(encoded, 'base64')
  const metadata = await sharp(buffer, { limitInputPixels: 8294400 }).metadata()
  if (
    metadata.width !== capture.width * capture.scale ||
    metadata.height !== capture.height * capture.scale ||
    metadata.format !== 'png'
  )
    throw new APIError('Render dimensions or encoding do not match the capture.', 400)
  let pipeline = sharp(buffer)
  if (!capture.transparent)
    pipeline = pipeline.flatten({ background: capture.surface === 'dark' ? '#090b10' : '#f6f7fa' })
  const output = await pipeline.toFormat(capture.format, { quality: 90 }).toBuffer()
  const folders = await req.payload.find({
    collection: 'payload-folders',
    where: {
      and: [{ name: { equals: 'Streak Field Studio' } }, { folderType: { contains: 'media' } }],
    },
    limit: 1,
    depth: 0,
    req,
  })
  const folder =
    folders.docs[0] ??
    (await req.payload.create({
      collection: 'payload-folders',
      data: { name: 'Streak Field Studio', folderType: ['media'] },
      req,
    }))
  return req.payload.create({
    collection: 'media',
    data: {
      title,
      folder: folder.id,
      alt: title,
      usageStatus: 'public-approved',
      approvedChannels: ['website', 'social', 'pitch-deck', 'proposal'],
      description:
        'Generated by Streak Field Studio. The render job preserves the source and capture settings.',
    },
    file: {
      data: output,
      name: `streak-${randomUUID()}.${capture.format}`,
      mimetype: `image/${capture.format}`,
      size: output.length,
    },
    req,
  })
}

const poster = (media: Media) => ({
  filename: media.filename,
  url: media.url,
  updatedAt: media.updatedAt,
  width: media.width,
  height: media.height,
  mimeType: media.mimeType,
})

export const workerEndpoints: Endpoint[] = [
  {
    path: '/streak-worker/claim',
    method: 'post',
    handler: async (req) => {
      worker(req)
      const lease = randomUUID()
      // Serialize claims, then enforce one render across all worker processes.
      const result = await req.payload.db.drizzle.transaction(async (db) => {
        await db.execute(sql`SELECT pg_advisory_xact_lock(734921)`)
        return db.execute(sql`
      UPDATE streak_renders SET state = 'rendering', lease = ${lease}, lease_expires = NOW() + INTERVAL '10 minutes', attempts = COALESCE(attempts, 0) + 1
      WHERE NOT EXISTS (SELECT 1 FROM streak_renders WHERE state = 'rendering' AND lease_expires > NOW()) AND id = (SELECT id FROM streak_renders WHERE (state = 'queued' OR (state = 'rendering' AND lease_expires < NOW())) AND COALESCE(attempts, 0) < 3 ORDER BY created_at FOR UPDATE SKIP LOCKED LIMIT 1)
      RETURNING id`)
      })
      await req.payload.db.drizzle.execute(
        sql`UPDATE streak_renders SET state = 'failed', error = 'Worker lease expired after three attempts. Retry from Studio.' WHERE state = 'rendering' AND lease_expires < NOW() AND attempts >= 3`,
      )
      const id = result.rows[0]?.id
      if (!id) return Response.json(null)
      const job = await req.payload.findByID({
        collection: 'streak-renders',
        id: Number(id),
        depth: 0,
        req,
      })
      return Response.json({ ...job, lease })
    },
  },
  {
    path: '/streak-worker/finish',
    method: 'post',
    handler: async (req) => {
      worker(req)
      const data = await body(req)
      await inTransaction(req, async () => {
        const db = await transactionDB(req)
        const locked = await db.execute(
          sql`SELECT id FROM streak_renders WHERE id = ${Number(data.id)} AND state = 'rendering' AND lease = ${String(data.lease)} AND lease_expires > NOW() FOR UPDATE`,
        )
        if (!locked.rows.length) throw new APIError('The render lease is no longer current.', 409)
        const job = await req.payload.findByID({
          collection: 'streak-renders',
          id: Number(data.id),
          depth: 0,
          req,
        })
        if (data.error) {
          await req.payload.update({
            collection: 'streak-renders',
            id: job.id,
            data: {
              state: (job.attempts ?? 0) < 3 ? 'queued' : 'failed',
              error: String(data.error).slice(0, 1000),
              lease: null,
            },
            req,
          })
        } else {
          await complete(req, job, data)
        }
      })
      return Response.json({ ok: true })
    },
  },
]

async function complete(req: PayloadRequest, job: StreakRender, data: Record<string, unknown>) {
  const capture = validateCapture(job.capture)
  if (job.kind === 'export') {
    const output = await upload(req, data.image, capture, `${job.title} artwork`)
    await req.payload.update({
      collection: 'streak-renders',
      id: job.id,
      data: { state: 'complete', output: output.id, lease: null, error: null },
      req,
    })
    return
  }
  const lookId = idOf(job.look)
  let release = await releaseOf(req, lookId, job.sourceHash)
  if (!release) {
    const versions = await req.payload.count({
      collection: 'streak-releases',
      where: { look: { equals: lookId } },
      req,
    })
    const dark = await upload(
      req,
      data.dark,
      { ...capture, surface: 'dark' },
      `${job.title} dark poster`,
    )
    const light = await upload(
      req,
      data.light,
      { ...capture, surface: 'light' },
      `${job.title} light poster`,
    )
    release = await req.payload.create({
      collection: 'streak-releases',
      data: {
        title: `${job.title} · v${versions.totalDocs + 1}`,
        look: lookId,
        sourceHash: job.sourceHash,
        releaseKey: `${lookId}:${job.sourceHash}`,
        snapshot: job.snapshot as unknown as StreakSnapshot,
        posters: { dark: poster(dark), light: poster(light) },
        darkPoster: dark.id,
        lightPoster: light.id,
        publishedBy: idOf(job.requestedBy),
        captureBuild: String(data.build).slice(0, 300),
      },
      req,
    })
  }
  await req.payload.update({
    collection: 'streak-renders',
    id: job.id,
    data: { state: 'complete', release: release.id, lease: null, error: null },
    req,
  })
  await promoteRelease(req, release)
}
