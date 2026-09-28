import {
  APIError,
  type CollectionBeforeChangeHook,
  type CollectionBeforeValidateHook,
  type CollectionConfig,
  type Endpoint,
  type TextFieldSingleValidation,
} from 'payload'
import { authenticated } from '@/access/authenticated'
import type { BlockedSender } from '@/payload-types'
import { isValidEmailAddress, normalizeEmailAddress } from '@/utilities/emailAddress'
import { findSenderBlock } from './lookup'
import { BLOCK_KINDS, parseBlockEntry } from './match'

/** Store what was typed in its normalized spelling, and derive what it covers. */
const deriveEntry: CollectionBeforeValidateHook<BlockedSender> = ({ data }) => {
  if (typeof data?.value !== 'string') return data
  const parsed = parseBlockEntry(data.value)
  // An unreadable value is left as typed; the field's validation names the problem.
  return 'error' in parsed ? data : { ...data, ...parsed }
}

/**
 * One entry per sender: a second entry on the same mailbox or domain would
 * split its expiry and its discard count across two rows. Checked here rather
 * than left to the unique index so the refusal names the entry to edit.
 */
const validateValue: TextFieldSingleValidation = async (value, { id, req }) => {
  if (typeof value !== 'string') return 'Enter an email address or a domain.'
  const parsed = parseBlockEntry(value)
  if ('error' in parsed) return parsed.error

  const { docs } = await req.payload.find({
    collection: 'blocked-senders',
    where: {
      matchKey: { equals: parsed.matchKey },
      ...(id !== undefined ? { id: { not_equals: id } } : {}),
    },
    limit: 1,
    depth: 0,
    req,
  })
  const existing = docs[0]
  return existing ? `${existing.value} is already on the list. Edit that entry instead.` : true
}

const stampAddedBy: CollectionBeforeChangeHook<BlockedSender> = ({ data, operation, req }) => {
  if (operation === 'create' && req.user?.collection === 'users') data.addedBy ??= req.user.id
  return data
}

/**
 * Is this address blocked? Asked by an inquiry's sidebar, so the answer comes
 * from the same lookup the intake runs.
 */
const matchEndpoint: Endpoint = {
  path: '/match',
  method: 'get',
  handler: async (req) => {
    if (!authenticated({ req })) throw new APIError('Team sign-in required.', 401)
    const email = typeof req.query?.email === 'string' ? normalizeEmailAddress(req.query.email) : ''
    const entry = isValidEmailAddress(email) ? await findSenderBlock(req, email) : undefined
    return Response.json({
      entry: entry ? { id: entry.id, kind: entry.kind, value: entry.value } : null,
    })
  },
}

/**
 * Senders whose inquiries are discarded.
 *
 * Marking an inquiry spam adds its sender here and marking it not spam takes
 * the sender off again (`src/collections/Inquiries/senderBlock.ts`); anything
 * else is added, edited, set to expire or deleted by hand. The intake
 * (`/api/inquiries/submit`) checks every sender against this list and answers
 * a blocked one exactly as it answers anyone else, so a spammer learns nothing
 * and moves on rather than rotating addresses.
 *
 * Holds visitor addresses, so every operation is team-only, and it is not
 * exposed over MCP.
 */
export const BlockedSenders: CollectionConfig<'blocked-senders'> = {
  slug: 'blocked-senders',
  labels: { singular: 'Blocked sender', plural: 'Blocked senders' },
  defaultSort: '-createdAt',
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticated,
    update: authenticated,
  },
  admin: {
    group: 'Inbox',
    useAsTitle: 'value',
    defaultColumns: ['value', 'kind', 'hits', 'lastHitAt', 'expiresAt', 'createdAt'],
    listSearchableFields: ['value', 'note'],
    description:
      'Inquiries from these senders are discarded: they see the usual thank-you, nothing is filed and nobody is emailed. Marking an inquiry spam adds its sender; marking it not spam takes them off.',
  },
  endpoints: [matchEndpoint],
  hooks: {
    beforeValidate: [deriveEntry],
    beforeChange: [stampAddedBy],
  },
  fields: [
    {
      name: 'value',
      type: 'text',
      label: 'Address or domain',
      required: true,
      validate: validateValue,
      admin: {
        description:
          'A full address (name@example.com) or a whole domain (example.com, which covers its subdomains too). Spellings of one mailbox count as the same sender: a +tag, or dots in a Gmail name.',
      },
    },
    {
      name: 'matchKey',
      type: 'text',
      unique: true,
      index: true,
      admin: { hidden: true },
    },
    {
      name: 'note',
      type: 'textarea',
      admin: { description: 'Why this sender is blocked, for whoever reviews the list next.' },
    },
    {
      // Derived on save, so not `required`: the admin validates the form before any hook runs.
      name: 'kind',
      type: 'select',
      options: [...BLOCK_KINDS],
      admin: {
        position: 'sidebar',
        readOnly: true,
        condition: (data) => Boolean(data?.kind),
        description: 'Read from the value.',
      },
    },
    {
      name: 'expiresAt',
      type: 'date',
      label: 'Blocked until',
      index: true,
      admin: {
        position: 'sidebar',
        date: { pickerAppearance: 'dayOnly' },
        description: 'Leave empty to block until someone deletes this entry.',
      },
    },
    {
      name: 'inquiry',
      type: 'relationship',
      relationTo: 'inquiries',
      label: 'From inquiry',
      admin: {
        position: 'sidebar',
        readOnly: true,
        condition: (data) => Boolean(data?.inquiry),
        description: 'Marked spam there. Marking it not spam lifts this block.',
      },
    },
    {
      name: 'addedBy',
      type: 'relationship',
      relationTo: 'users',
      admin: { position: 'sidebar', readOnly: true, condition: (data) => Boolean(data?.addedBy) },
    },
    {
      name: 'hits',
      type: 'number',
      label: 'Inquiries discarded',
      defaultValue: 0,
      admin: { position: 'sidebar', readOnly: true, condition: (data) => Boolean(data?.createdAt) },
    },
    {
      name: 'lastHitAt',
      type: 'date',
      label: 'Last discarded',
      admin: {
        position: 'sidebar',
        readOnly: true,
        date: { pickerAppearance: 'dayAndTime' },
        condition: (data) => Boolean(data?.lastHitAt),
      },
    },
  ],
  timestamps: true,
}
