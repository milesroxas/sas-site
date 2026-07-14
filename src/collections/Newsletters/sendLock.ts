import type { Where } from 'payload'

/**
 * A send stuck in "sending" with no batch progress for this long is considered dead. The send
 * job heartbeats `updatedAt` on every batch write, so an actively working send never looks stale.
 */
export const STALE_SEND_MS = 15 * 60 * 1000

/**
 * The delivery-state lock, shared by the collection's update/delete access control and the send
 * endpoint's claim query so the two can never drift: a newsletter is mutable (and claimable)
 * unless it was sent, or is actively sending — where "actively" excludes stale/crashed sends,
 * so a dead job never bricks a document.
 */
export function sendUnlockedWhere(now: number = Date.now()): Where {
  return {
    or: [
      { deliveryStatus: { not_in: ['sending', 'sent'] } },
      {
        and: [
          { deliveryStatus: { equals: 'sending' } },
          { updatedAt: { less_than: new Date(now - STALE_SEND_MS).toISOString() } },
        ],
      },
    ],
  }
}
