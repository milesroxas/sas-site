import type { CollectionConfig } from 'payload'
import { authenticated } from '@/access/authenticated'
import { ASK_QUESTION_RETENTION_DAYS } from '@/features/ask/retention'

const nobody = () => false

/**
 * What visitors typed into Ask, kept so the team can learn from it: which
 * questions the site cannot answer (the content-gap list), and what prospects
 * want to know before they get in touch.
 *
 * Written only by /api/ask (`recordAskQuestion`), after the response. Text is
 * redacted before it lands, rows carry no IP or analytics id, and the
 * `askQuestionRetention` job deletes them after the retention window. Team-only,
 * and deliberately outside the RAG corpus (`CONTENT_SURFACES`) and every public
 * surface.
 */
export const AskQuestions: CollectionConfig<'ask-questions'> = {
  slug: 'ask-questions',
  labels: { singular: 'Ask question', plural: 'Ask questions' },
  defaultSort: '-createdAt',
  access: {
    create: nobody,
    read: authenticated,
    update: nobody,
    delete: authenticated,
  },
  admin: {
    group: 'Inbox',
    useAsTitle: 'question',
    defaultColumns: ['question', 'answered', 'pagePath', 'createdAt'],
    listSearchableFields: ['question', 'pagePath'],
    description: `What visitors asked Ask, with emails, phone numbers and keys removed. Filter Answered to "No" for the questions the site could not answer: that is the content-gap list. Rows delete themselves after ${ASK_QUESTION_RETENTION_DAYS} days.`,
  },
  fields: [
    {
      name: 'question',
      type: 'textarea',
      required: true,
      admin: { readOnly: true },
    },
    {
      name: 'answered',
      type: 'checkbox',
      defaultValue: false,
      index: true,
      admin: {
        readOnly: true,
        description:
          'Site content matched the question. Unchecked means Ask had nothing to ground an answer on.',
      },
    },
    {
      name: 'pagePath',
      type: 'text',
      label: 'Asked on',
      index: true,
      admin: { readOnly: true, description: 'The page the visitor was on.' },
    },
    {
      name: 'followUp',
      type: 'checkbox',
      label: 'Follow-up',
      defaultValue: false,
      admin: {
        readOnly: true,
        position: 'sidebar',
        description: 'Asked after an earlier question in the same chat.',
      },
    },
    {
      name: 'sourceCount',
      type: 'number',
      label: 'Sources matched',
      admin: { readOnly: true, position: 'sidebar' },
    },
    {
      name: 'conversation',
      type: 'text',
      label: 'Chat',
      index: true,
      admin: {
        readOnly: true,
        position: 'sidebar',
        description:
          'Shared by every question from one open Ask box. Filter by it to read a conversation in order.',
      },
    },
  ],
}
