import { randomBytes } from 'node:crypto'
import type {
  CollectionBeforeChangeHook,
  CollectionBeforeValidateHook,
  CollectionConfig,
} from 'payload'
import type { Subscriber } from '@/payload-types'
import { authenticated } from '../../access/authenticated'

/** Lowercase + trim so the unique index also acts as a case-insensitive dedupe. */
const normalizeEmail: CollectionBeforeValidateHook<Subscriber> = ({ data }) => {
  if (typeof data?.email === 'string') {
    data.email = data.email.trim().toLowerCase()
  }
  return data
}

/**
 * System bookkeeping: mint the opaque link token on create, and stamp status transition dates so
 * they stay consistent no matter whether a transition comes from an endpoint, a webhook or a
 * manual admin edit.
 */
const applySystemFields: CollectionBeforeChangeHook<Subscriber> = ({
  data,
  originalDoc,
  operation,
}) => {
  if (operation === 'create' && !data.token) {
    data.token = randomBytes(24).toString('base64url')
  }

  const now = new Date().toISOString()
  if (data.status && data.status !== originalDoc?.status) {
    if (data.status === 'subscribed') {
      data.subscribedAt = data.subscribedAt ?? now
      data.confirmedAt = data.confirmedAt ?? now
    }
    if (data.status === 'unsubscribed') {
      data.unsubscribedAt = now
    }
  }
  return data
}

/**
 * Newsletter recipients. This collection — not Resend — is the source of truth for who receives
 * what: audience membership, double-opt-in state and suppression (bounce/complaint) all live here.
 *
 * Contains PII: every operation requires an authenticated admin. The public signup, confirm and
 * unsubscribe endpoints go through the Local API server-side.
 */
export const Subscribers: CollectionConfig<'subscribers'> = {
  slug: 'subscribers',
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticated,
    update: authenticated,
  },
  admin: {
    group: 'Newsletter',
    useAsTitle: 'email',
    defaultColumns: ['email', 'name', 'status', 'audiences', 'source', 'updatedAt'],
    listSearchableFields: ['email', 'name'],
  },
  fields: [
    { name: 'email', type: 'email', required: true, unique: true, index: true },
    { name: 'name', type: 'text' },
    {
      name: 'audiences',
      type: 'relationship',
      relationTo: 'audiences',
      hasMany: true,
      index: true,
      admin: { description: 'Which segments this subscriber belongs to.' },
    },
    {
      name: 'organization',
      type: 'relationship',
      relationTo: 'organizations',
      admin: { description: 'Optional link to a client organization from the Content Hub.' },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      index: true,
      options: [
        { label: 'Pending confirmation', value: 'pending' },
        { label: 'Subscribed', value: 'subscribed' },
        { label: 'Unsubscribed', value: 'unsubscribed' },
        { label: 'Bounced', value: 'bounced' },
        { label: 'Complained (spam report)', value: 'complained' },
      ],
      admin: {
        position: 'sidebar',
        description:
          'Only "Subscribed" receives newsletters. Bounced and complained are suppressed automatically by the Resend webhook — do not flip them back without a good reason.',
      },
    },
    {
      name: 'source',
      type: 'select',
      required: true,
      defaultValue: 'manual',
      options: [
        { label: 'Site signup form', value: 'site' },
        { label: 'Import', value: 'import' },
        { label: 'Added manually', value: 'manual' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Where this subscriber came from (consent trail).',
      },
    },
    {
      // Opaque credential embedded in confirm/unsubscribe links; never rendered in the admin UI.
      name: 'token',
      type: 'text',
      unique: true,
      index: true,
      admin: { hidden: true },
    },
    {
      // Throttle clock for confirm-email re-sends (deliberately not `updatedAt`, which any
      // unrelated write would bump).
      name: 'confirmSentAt',
      type: 'date',
      admin: { hidden: true },
    },
    {
      name: 'subscribedAt',
      type: 'date',
      admin: { position: 'sidebar', readOnly: true },
    },
    {
      name: 'confirmedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'When double opt-in was completed. Empty for manually added subscribers.',
      },
    },
    {
      name: 'unsubscribedAt',
      type: 'date',
      admin: { position: 'sidebar', readOnly: true },
    },
  ],
  hooks: {
    beforeValidate: [normalizeEmail],
    beforeChange: [applySystemFields],
  },
  timestamps: true,
}
