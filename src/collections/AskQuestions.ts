import type { CollectionConfig, Field } from 'payload'
import { authenticated } from '@/access/authenticated'
import { ASK_HANDOFF_REASONS } from '@/features/ask/handoff'
import { ASK_QUESTION_RETENTION_DAYS } from '@/features/ask/retention'
import {
  ASK_HANDOFF_SIGNALS,
  ASK_OUTCOMES,
  ASK_RATING_REASONS,
  ASK_RATINGS,
  ASK_RETRIEVAL_PATHS,
  ASK_TRIAGE_STATUSES,
} from '@/features/ask/vocabulary'

const nobody = () => false

/** What the visitor and the system wrote: shown, never edited. */
const readOnly = <T extends Field>(field: T): T =>
  ({ ...field, access: { update: nobody }, admin: { ...field.admin, readOnly: true } }) as T

/**
 * One row per Ask turn, written by /api/ask after the response: the question,
 * what was retrieved, what the model said, what it cost, and what the visitor
 * then did (rated it, went to a person). The team triages here: status,
 * topic, a note, and the content that closes a gap.
 *
 * Text is redacted before it lands, rows carry no IP or analytics id, and the
 * `askQuestionRetention` job deletes them after the retention window.
 * Team-only, and deliberately outside the RAG corpus (`CONTENT_SURFACES`)
 * and every public surface. Only the triage fields are writable.
 */
export const AskQuestions: CollectionConfig<'ask-questions'> = {
  slug: 'ask-questions',
  labels: { singular: 'Ask question', plural: 'Ask questions' },
  defaultSort: '-createdAt',
  access: {
    create: nobody,
    read: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  admin: {
    group: 'Inbox',
    useAsTitle: 'question',
    defaultColumns: ['question', 'outcome', 'status', 'rating', 'pagePath', 'createdAt'],
    listSearchableFields: ['question', 'pagePath'],
    description: `Every question asked in Ask, with emails, phone numbers and keys removed, and the answer the visitor got. "No sources" is the content-gap list. Rows delete themselves after ${ASK_QUESTION_RETENTION_DAYS} days.`,
    components: {
      beforeListTable: ['@/collections/AskQuestions/components/AskFilters#AskFilters'],
    },
  },
  fields: [
    readOnly({ name: 'question', type: 'textarea', required: true }),
    readOnly({
      name: 'answer',
      type: 'textarea',
      admin: {
        description: 'What the model said, redacted. Empty when the reply was only a handoff.',
      },
    }),
    readOnly({
      name: 'sources',
      type: 'array',
      labels: { singular: 'Source', plural: 'Sources' },
      admin: {
        description:
          'The pages the answer drew on, best match first, with the cosine similarity of their best chunk.',
        initCollapsed: true,
      },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'title', type: 'text', required: true, admin: { readOnly: true } },
            { name: 'url', type: 'text', required: true, admin: { readOnly: true } },
            {
              name: 'similarity',
              type: 'number',
              admin: { readOnly: true, step: 0.01, width: '8rem' },
            },
          ],
        },
      ],
    }),
    {
      name: 'thread',
      type: 'ui',
      admin: {
        components: {
          Field: '@/collections/AskQuestions/components/AskConversation#AskConversation',
        },
      },
    },
    {
      type: 'collapsible',
      label: 'Triage',
      admin: {
        initCollapsed: false,
        description: 'Internal only. What to do about this question.',
      },
      fields: [
        {
          name: 'note',
          type: 'textarea',
          admin: { description: 'Why it was triaged the way it was.' },
        },
        {
          name: 'plannedContent',
          type: 'relationship',
          relationTo: ['posts', 'pages'],
          hasMany: true,
          admin: { description: 'The draft that closes the gap.' },
        },
      ],
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'new',
      index: true,
      options: [...ASK_TRIAGE_STATUSES],
      admin: { position: 'sidebar' },
    },
    {
      name: 'topic',
      type: 'relationship',
      relationTo: 'categories',
      admin: { position: 'sidebar', description: 'The site taxonomy, so gaps group by subject.' },
    },
    readOnly({
      name: 'outcome',
      type: 'select',
      index: true,
      options: [...ASK_OUTCOMES],
      admin: {
        position: 'sidebar',
        description:
          'What the visitor got. Partial: an answer that ended in a handoff. No sources: nothing relevant was published. Chat only: a follow-up with no new facts.',
      },
    }),
    readOnly({
      name: 'rating',
      type: 'select',
      index: true,
      options: [...ASK_RATINGS],
      admin: { position: 'sidebar' },
    }),
    readOnly({
      name: 'ratingReason',
      type: 'select',
      label: 'Rating reason',
      options: [...ASK_RATING_REASONS],
      admin: { position: 'sidebar', condition: (data) => Boolean(data?.ratingReason) },
    }),
    readOnly({
      name: 'handoff',
      type: 'select',
      index: true,
      options: [...ASK_HANDOFF_SIGNALS],
      admin: { position: 'sidebar', description: 'How far the visitor went toward a person.' },
    }),
    readOnly({
      name: 'handoffReason',
      type: 'select',
      label: 'Handoff offered',
      options: ASK_HANDOFF_REASONS.map((reason) => ({ label: reason, value: reason })),
      admin: { position: 'sidebar', description: 'Why the reply offered a person, if it did.' },
    }),
    readOnly({
      name: 'pagePath',
      type: 'text',
      label: 'Asked on',
      index: true,
      admin: { position: 'sidebar', description: 'The page the visitor was on.' },
    }),
    readOnly({
      name: 'followUp',
      type: 'checkbox',
      label: 'Follow-up',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Asked after an earlier question in the same chat.',
      },
    }),
    readOnly({
      name: 'retrieval',
      type: 'select',
      options: [...ASK_RETRIEVAL_PATHS],
      admin: { position: 'sidebar', description: 'Which search found the sources.' },
    }),
    readOnly({
      name: 'latencyMs',
      type: 'number',
      label: 'Latency (ms)',
      admin: { position: 'sidebar' },
    }),
    readOnly({
      name: 'inputTokens',
      type: 'number',
      label: 'Input tokens',
      admin: { position: 'sidebar' },
    }),
    readOnly({
      name: 'outputTokens',
      type: 'number',
      label: 'Output tokens',
      admin: { position: 'sidebar' },
    }),
    readOnly({
      name: 'conversation',
      type: 'text',
      label: 'Chat',
      index: true,
      admin: {
        position: 'sidebar',
        description: 'Shared by every question from one open Ask box.',
      },
    }),
    readOnly({
      name: 'turn',
      type: 'text',
      index: true,
      admin: { hidden: true },
    }),
  ],
}
