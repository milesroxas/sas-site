import type { Access, CollectionConfig } from 'payload'
import { AUTOSAVE_INTERVAL_MS } from '@/collections/drafts'
import { newsletterTemplateOptions } from '@/shared/email/newsletter/registry'
import { authenticated } from '../../access/authenticated'
import { newsletterBlocks } from './blocks'
import { newsletterEndpoints } from './endpoints'
import { sendUnlockedWhere } from './sendLock'

/**
 * Sent newsletters are immutable records; actively sending ones are hands-off too, except that a
 * stale (crashed) send unlocks so it can be fixed or retried. Shared by update + delete.
 */
const unlessSendingOrSent: Access = ({ req: { user } }) => (user ? sendUnlockedWhere() : false)

/**
 * Newsletter documents. Workflow: draft (autosaves feed the live preview) → publish → send.
 * Sending always uses the published version; delivery state lives in the sidebar and is written
 * by the send endpoint + job, never by editors. Once sent, the document is locked (see `access`)
 * so it stays a faithful record of what went out.
 */
export const Newsletters: CollectionConfig<'newsletters'> = {
  slug: 'newsletters',
  access: {
    create: authenticated,
    read: authenticated,
    update: unlessSendingOrSent,
    delete: unlessSendingOrSent,
  },
  admin: {
    group: 'Newsletter',
    useAsTitle: 'title',
    defaultColumns: ['title', 'subject', 'deliveryStatus', 'sentAt', 'updatedAt'],
    livePreview: {
      url: ({ data }) => (data?.id ? `/newsletter/preview/${data.id}` : null),
    },
    preview: (data) => (data?.id ? `/newsletter/preview/${data.id}` : null),
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: { description: 'Internal name — recipients never see this.' },
    },
    {
      name: 'subject',
      type: 'text',
      required: true,
      admin: { description: 'The email subject line.' },
    },
    {
      name: 'previewText',
      type: 'text',
      admin: {
        description: 'Inbox preview line shown after the subject. Falls back to the subject.',
      },
    },
    {
      name: 'heading',
      type: 'text',
      admin: { description: 'Optional headline at the top of the email body.' },
    },
    {
      name: 'template',
      type: 'select',
      required: true,
      defaultValue: 'letter',
      options: newsletterTemplateOptions,
      admin: { description: 'Layout for the email. Check both in the live preview.' },
    },
    {
      name: 'content',
      type: 'blocks',
      required: true,
      minRows: 1,
      blocks: newsletterBlocks,
    },
    {
      name: 'audiences',
      type: 'relationship',
      relationTo: 'audiences',
      hasMany: true,
      required: true,
      access: {
        // The resume cursor indexes into the audience-derived recipient set; retargeting a doc
        // that already attempted a send would silently skip recipients on retry. Duplicate the
        // newsletter to change targeting.
        update: ({ doc }) => !doc || doc.deliveryStatus === 'unsent' || !doc.deliveryStatus,
      },
      admin: {
        position: 'sidebar',
        description:
          'Who receives this. Subscribers in several selected audiences get exactly one copy. Locked after the first send attempt.',
      },
    },
    {
      name: 'sendPanel',
      type: 'ui',
      admin: {
        position: 'sidebar',
        components: { Field: '@/collections/Newsletters/components/SendPanel#SendPanel' },
      },
    },
    {
      name: 'deliveryStatus',
      type: 'select',
      required: true,
      defaultValue: 'unsent',
      index: true,
      options: [
        { label: 'Not sent', value: 'unsent' },
        { label: 'Sending', value: 'sending' },
        { label: 'Sent', value: 'sent' },
        { label: 'Failed', value: 'failed' },
      ],
      admin: { position: 'sidebar', readOnly: true },
      // "Duplicate" in the admin must yield a fresh, sendable draft — not a copy of the send
      // record. Same for the other delivery fields below.
      hooks: { beforeDuplicate: [() => 'unsent'] },
    },
    {
      name: 'sentAt',
      type: 'date',
      admin: { position: 'sidebar', readOnly: true, date: { pickerAppearance: 'dayAndTime' } },
      hooks: { beforeDuplicate: [() => null] },
    },
    {
      name: 'recipientCount',
      type: 'number',
      admin: { position: 'sidebar', readOnly: true },
      hooks: { beforeDuplicate: [() => null] },
    },
    {
      name: 'sendError',
      type: 'textarea',
      admin: {
        position: 'sidebar',
        readOnly: true,
        condition: (data) => data?.deliveryStatus === 'failed',
      },
      hooks: { beforeDuplicate: [() => null] },
    },
    {
      // Recipients delivered so far — becomes recipientCount when the send completes.
      name: 'sendProgress',
      type: 'number',
      defaultValue: 0,
      admin: { hidden: true },
      hooks: { beforeDuplicate: [() => 0] },
    },
    {
      // Highest subscriber id already delivered to. A resumed send continues with
      // `id > sendCursor`, so subscribers joining/leaving mid-send can never shift who
      // receives the email (a numeric offset into a recomputed list could).
      name: 'sendCursor',
      type: 'number',
      defaultValue: 0,
      admin: { hidden: true },
      hooks: { beforeDuplicate: [() => 0] },
    },
  ],
  endpoints: newsletterEndpoints,
  versions: {
    drafts: {
      autosave: {
        interval: AUTOSAVE_INTERVAL_MS,
      },
    },
    maxPerDoc: 50,
  },
}
