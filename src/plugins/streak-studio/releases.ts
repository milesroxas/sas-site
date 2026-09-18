import type { PayloadRequest } from 'payload'
import { recipeFromSnapshot, type StreakSnapshot } from '@/features/immersive/studio/recipe'
import type { StreakRelease } from '@/payload-types'
import { LOOKS_SLUG, RELEASES_SLUG } from './components/paths'
import { storedRecipeHash } from './hash'
import { lockLook } from './transaction'

export const idOf = (value: unknown): number =>
  Number(typeof value === 'object' && value && 'id' in value ? value.id : value)

/** Set on the one write that publishes a look from a release in hand, so the publish guard lets it through. */
export const PROMOTION = 'streakPromotion'

/** The look's release of exactly this output, if it has one. */
export async function releaseOf(
  req: PayloadRequest,
  lookId: number,
  sourceHash: string,
): Promise<StreakRelease | null> {
  const found = await req.payload.find({
    collection: RELEASES_SLUG,
    where: { releaseKey: { equals: `${lookId}:${sourceHash}` } },
    limit: 1,
    depth: 0,
    req,
  })
  return found.docs[0] ?? null
}

/**
 * Publishing a look points it at a release: the published document carries
 * the release's recipe and poster, which is what the library thumbnail and
 * Payload's Revert to published read. If the draft moved on while the posters
 * rendered, that newer draft goes back on top of the published version, so
 * the author keeps their work and the document reads Changed.
 *
 * Call inside a transaction: the two writes and the row lock belong together.
 */
export async function promoteRelease(req: PayloadRequest, release: StreakRelease) {
  const lookId = idOf(release.look)
  await lockLook(req, lookId)
  const draft = await req.payload.findByID({
    collection: LOOKS_SLUG,
    id: lookId,
    draft: true,
    depth: 0,
    req,
  })
  if (draft.archived) return
  const thumbnail = idOf(release.darkPoster)
  const draftHash = storedRecipeHash(draft.recipe)
  const current = draftHash === release.sourceHash
  // Payload merges an operation's context into the request and leaves it
  // there, so the pass is handed over for this one write and taken back.
  try {
    await req.payload.update({
      collection: LOOKS_SLUG,
      id: lookId,
      data: {
        ...draft,
        recipe: current ? draft.recipe : recipeFromSnapshot(release.snapshot as StreakSnapshot),
        thumbnail,
        _status: 'published',
      },
      context: { [PROMOTION]: true },
      req,
    })
  } finally {
    delete req.context[PROMOTION]
  }
  // A draft today's validation rejects cannot be saved again; it stays in the
  // version history under the published release.
  if (current || draftHash === null) return
  await req.payload.update({
    collection: LOOKS_SLUG,
    id: lookId,
    draft: true,
    data: { ...draft, thumbnail, _status: 'draft' },
    req,
  })
}
