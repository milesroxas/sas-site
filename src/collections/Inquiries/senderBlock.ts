import type { CollectionAfterChangeHook, PayloadRequest } from 'payload'
import { parseBlockEntry } from '@/collections/BlockedSenders/match'
import type { Inquiry } from '@/payload-types'

/**
 * Spam and the block list move together. Marking an inquiry spam blocks its
 * sender's address, so the next thing they send is discarded at the door;
 * marking it not spam lifts the block that mark created. A block someone
 * added by hand, or one another inquiry created, is left alone: an automatic
 * step only ever undoes itself.
 *
 * Runs on every path to the status (the sidebar buttons, the select, a bulk
 * edit from the list) and inside the inquiry's own transaction, so a status
 * and its block land or fail together. The entry is written as the system on
 * the back of an update the collection has already authorized.
 */
export const syncSenderBlock: CollectionAfterChangeHook<Inquiry> = async ({
  doc,
  operation,
  previousDoc,
  req,
}) => {
  const wasSpam = operation === 'update' && previousDoc?.status === 'spam'
  const isSpam = doc.status === 'spam'
  if (isSpam && !wasSpam) await blockSender(req, doc)
  if (wasSpam && !isSpam) await releaseSender(req, doc)
  return doc
}

async function blockSender(req: PayloadRequest, inquiry: Inquiry) {
  const entry = parseBlockEntry(inquiry.email)
  // An address the intake would have refused; there is no mailbox to key a block on.
  if ('error' in entry) return

  const note = `Marked spam on inquiry ${inquiry.reference ?? inquiry.id}.`
  const { docs } = await req.payload.find({
    collection: 'blocked-senders',
    where: { matchKey: { equals: entry.matchKey } },
    limit: 1,
    depth: 0,
    req,
  })
  const existing = docs[0]

  if (!existing) {
    await req.payload.create({
      collection: 'blocked-senders',
      data: { value: entry.value, inquiry: inquiry.id, note },
      depth: 0,
      req,
    })
    return
  }

  // Already blocked and still live: whoever owns that entry decides its fate.
  if (!existing.expiresAt || new Date(existing.expiresAt) > new Date()) return

  // A lapsed block comes back with no end date, now owned by this mark.
  await req.payload.update({
    collection: 'blocked-senders',
    id: existing.id,
    data: {
      expiresAt: null,
      inquiry: inquiry.id,
      note: [existing.note, note].filter(Boolean).join('\n'),
    },
    depth: 0,
    req,
  })
}

async function releaseSender(req: PayloadRequest, inquiry: Inquiry) {
  const { docs } = await req.payload.find({
    collection: 'blocked-senders',
    where: { inquiry: { equals: inquiry.id } },
    limit: 1,
    depth: 0,
    req,
  })
  const entry = docs[0]
  if (!entry) return

  // Another spam inquiry from the same address still stands behind the block:
  // hand the entry over rather than lift it.
  const { docs: others } = await req.payload.find({
    collection: 'inquiries',
    where: {
      and: [
        { email: { equals: inquiry.email } },
        { status: { equals: 'spam' } },
        { id: { not_equals: inquiry.id } },
      ],
    },
    limit: 1,
    depth: 0,
    select: {},
    req,
  })
  const heir = others[0]

  if (heir) {
    await req.payload.update({
      collection: 'blocked-senders',
      id: entry.id,
      data: { inquiry: heir.id },
      depth: 0,
      req,
    })
    return
  }

  await req.payload.delete({ collection: 'blocked-senders', id: entry.id, req })
}
