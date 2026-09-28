import type { PayloadRequest } from 'payload'
import type { BlockedSender } from '@/payload-types'
import { afterResponse } from '@/utilities/afterResponse'
import { blockKeysFor } from './match'

/**
 * The live entry that stops this sender, if any: one on their mailbox, their
 * domain or a parent domain, and not past its expiry.
 *
 * Read as the system. The public intake has no user, and nothing about the
 * entry leaves the server: the sender only ever sees the usual thank-you.
 */
export async function findSenderBlock(
  req: PayloadRequest,
  email: string,
): Promise<BlockedSender | undefined> {
  const { docs } = await req.payload.find({
    collection: 'blocked-senders',
    where: {
      and: [
        { matchKey: { in: blockKeysFor(email) } },
        {
          or: [
            { expiresAt: { exists: false } },
            { expiresAt: { greater_than: new Date().toISOString() } },
          ],
        },
      ],
    },
    limit: 1,
    depth: 0,
    req,
  })
  return docs[0]
}

/**
 * Count a discarded inquiry on the entry that stopped it, once the response
 * has gone. The count is how the team tells a block still doing its job from
 * one that can go. Read then written, so two discards in the same instant can
 * land as one: it is a signal, not a ledger.
 */
export function countDiscardedInquiry(req: PayloadRequest, entry: BlockedSender): void {
  afterResponse(() =>
    req.payload
      .update({
        collection: 'blocked-senders',
        id: entry.id,
        data: { hits: (entry.hits ?? 0) + 1, lastHitAt: new Date().toISOString() },
        depth: 0,
      })
      .then(() => undefined)
      .catch((err) =>
        req.payload.logger.error({ msg: 'Failed to count a discarded inquiry', err }),
      ),
  )
}
