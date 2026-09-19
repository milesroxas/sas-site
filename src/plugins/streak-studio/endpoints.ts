import { randomUUID } from 'node:crypto'
import { APIError, type Endpoint, type PayloadRequest } from 'payload'
import sharp from 'sharp'
import { authenticated } from '@/access/authenticated'
import { STUDIO_GROUND, SURFACES } from '@/features/immersive/studio/effect'
import { effectOf } from '@/features/immersive/studio/effects'
import {
  type CaptureOptions,
  POSTER_CAPTURE,
  snapshotRecipe,
  validateCapture,
} from '@/features/immersive/studio/recipe'
import type { Media, StreakLook } from '@/payload-types'
import { LOOKS_SLUG } from './components/paths'
import { recipeHash, studioInput } from './hash'
import { inTransaction, lockLook, PUBLISH } from './transaction'
import { lookUsage } from './usage'

function team(req: PayloadRequest) {
  if (!authenticated({ req }) || !req.user) throw new APIError('Team sign-in required.', 401)
  return req.user
}
const body = async (req: PayloadRequest) => (req.json ? await req.json() : {})

/**
 * The saved draft, read as the editor. The pixels in the request were rendered
 * from the recipe the editor was looking at, so it has to be the recipe that
 * was saved: anything else and the poster would not match the field.
 */
async function savedDraft(req: PayloadRequest, recipe: unknown): Promise<StreakLook> {
  const look = await req.payload.findByID({
    collection: LOOKS_SLUG,
    id: String(req.routeParams?.id),
    draft: true,
    depth: 0,
    req,
    user: req.user,
    overrideAccess: false,
  })
  if (recipeHash(look.effect, recipe) !== recipeHash(look.effect, look.recipe))
    throw new APIError('The draft changed while the stills rendered. Try again.', 409)
  return look
}

export const lookEndpoints: Endpoint[] = [
  {
    path: '/:id/publish',
    method: 'post',
    handler: async (req) => {
      team(req)
      const data = await body(req)
      return inTransaction(req, async () => {
        await lockLook(req, Number(req.routeParams?.id))
        const look = await savedDraft(req, data.recipe)
        if (look.archived) throw new APIError('Unarchive this look before publishing.', 400)
        // One at a time: each is a storage write inside the look's row lock.
        const stills = {} as Record<(typeof SURFACES)[number], Media>
        for (const surface of SURFACES)
          stills[surface] = await upload(
            req,
            data[surface],
            { ...POSTER_CAPTURE, surface },
            `${look.title} ${surface} poster`,
          )
        // Payload merges an operation's context into the request and leaves it
        // there, so the pass is handed over for this one write and taken back.
        try {
          const doc = await req.payload.update({
            collection: LOOKS_SLUG,
            id: look.id,
            data: {
              ...look,
              snapshot: snapshotRecipe(effectOf(look.effect), look.recipe),
              posters: { dark: poster(stills.dark), light: poster(stills.light) },
              sourceHash: recipeHash(look.effect, look.recipe),
              thumbnail: stills.dark.id,
              lightPoster: stills.light.id,
              _status: 'published',
            },
            context: { [PUBLISH]: true },
            depth: 0,
            req,
          })
          return Response.json({ doc })
        } finally {
          delete req.context[PUBLISH]
        }
      })
    },
  },
  {
    path: '/:id/export',
    method: 'post',
    handler: async (req) => {
      team(req)
      const data = await body(req)
      const capture = studioInput(() => validateCapture(data.capture))
      const look = await savedDraft(req, data.recipe)
      const output = await upload(req, data.image, capture, `${look.title} artwork`)
      return Response.json({ doc: output })
    },
  },
  {
    path: '/:id/usage',
    method: 'get',
    handler: async (req) => {
      team(req)
      const id = Number(req.routeParams?.id)
      if (!Number.isInteger(id)) throw new APIError('Invalid look.', 400)
      return Response.json({ usages: await lookUsage(req, id) })
    },
  },
]

/** The Media folder every rendered still is filed in. The name predates the second effect and is kept: it is the folder that exists. */
const MEDIA_FOLDER = 'Streak Field Studio'

/** The browser sends PNG at the capture's exact size; anything else is refused before it is stored. */
async function upload(
  req: PayloadRequest,
  encoded: unknown,
  capture: CaptureOptions,
  title: string,
): Promise<Media> {
  if (typeof encoded !== 'string' || encoded.length > 20000000)
    throw new APIError('Invalid image payload.', 400)
  const buffer = Buffer.from(encoded, 'base64')
  const metadata = await sharp(buffer, { limitInputPixels: 8294400 })
    .metadata()
    .catch(() => null)
  if (
    !metadata ||
    metadata.width !== capture.width * capture.scale ||
    metadata.height !== capture.height * capture.scale ||
    metadata.format !== 'png'
  )
    throw new APIError('Render dimensions or encoding do not match the capture.', 400)
  let pipeline = sharp(buffer)
  if (!capture.transparent)
    pipeline = pipeline.flatten({ background: STUDIO_GROUND[capture.surface] })
  const output = await pipeline.toFormat(capture.format, { quality: 90 }).toBuffer()
  const folders = await req.payload.find({
    collection: 'payload-folders',
    where: {
      and: [{ name: { equals: MEDIA_FOLDER } }, { folderType: { contains: 'media' } }],
    },
    limit: 1,
    depth: 0,
    req,
  })
  const folder =
    folders.docs[0] ??
    (await req.payload.create({
      collection: 'payload-folders',
      data: { name: MEDIA_FOLDER, folderType: ['media'] },
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
      description: 'Rendered by the Studio from the look it is named after.',
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
