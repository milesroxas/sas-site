import type { Block, Field } from 'payload'
import { themeField } from '@/blocks/shared/fields'
import { BLOCK_GROUPS } from '@/blocks/shared/groups'
import {
  INQUIRY_BUDGETS,
  INQUIRY_MESSAGE_MAX_LENGTH,
  INQUIRY_TIMELINES,
} from '@/shared/content/inquiry'

/** The scoping questions only exist on a project inquiry. */
const isProject = (_: unknown, siblingData: { variant?: string } | undefined) =>
  siblingData?.variant === 'project'

/**
 * A chip list: which canonical values to offer, in which order, under whatever
 * words the studio uses today. Values stay closed (they are stored as an enum
 * and reported on); only labels and ordering are editorial.
 */
const chipOptions = (
  name: string,
  options: readonly { label: string; value: string }[],
  description: string,
): Field => ({
  name,
  type: 'array',
  // `budgetOptions` / `timelineOptions` are the longest suffixes on the
  // longest parent; the enum for the inner select is what would overflow.
  dbName: name.replace(/Options$/, '').toLowerCase(),
  labels: { singular: 'Option', plural: 'Options' },
  defaultValue: options.map((option) => ({ value: option.value, label: option.label })),
  admin: { description, initCollapsed: true, condition: isProject },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'value',
          type: 'select',
          required: true,
          options: [...options],
          admin: { width: '50%', description: 'What gets recorded. Fixed list.' },
        },
        {
          name: 'label',
          type: 'text',
          required: true,
          admin: { width: '50%', description: 'What the visitor reads.' },
        },
      ],
    },
  ],
})

/**
 * The contact template: an editorial column that says what happens next, and
 * the form itself. One block covers both conversations the studio has — a
 * scoped project inquiry and a plain message — because they share a page, a
 * layout, and an inbox; `variant` decides which questions get asked, and every
 * project-only group hides itself when it is not one.
 */
export const ContactBlock: Block = {
  slug: 'contactBlock',
  interfaceName: 'ContactBlock',
  // Per-parent table name (four parents plus their version tables), kept short
  // on purpose: `expertise_pages` + the `_v_` version prefix + an array field
  // name + Postgres's `enum_…_value` decoration runs past the 63-character
  // identifier limit at the block's full slug. A static dbName would instead
  // collapse every parent into one table.
  dbName: ({ tableName }) => `${tableName}_contact`,
  admin: { group: BLOCK_GROUPS.forms },
  labels: { singular: 'Contact form', plural: 'Contact forms' },
  fields: [
    {
      name: 'variant',
      type: 'select',
      required: true,
      defaultValue: 'project',
      options: [
        { label: 'Project inquiry — scope, budget, timeline', value: 'project' },
        { label: 'General message — name, email, note', value: 'general' },
      ],
      admin: {
        description:
          'Which questions the form asks. The scoping groups below appear only for a project inquiry.',
      },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Intro',
          description: 'The column beside the form: what this is, and what happens after sending.',
          fields: [
            { name: 'eyebrow', type: 'text', defaultValue: 'Project inquiry' },
            {
              name: 'heading',
              type: 'text',
              required: true,
              defaultValue: 'Got a project in mind?',
            },
            {
              name: 'lead',
              type: 'textarea',
              defaultValue: "Send some details over and we'll let you know how we can help.",
            },
            {
              name: 'details',
              type: 'array',
              labels: { singular: 'Detail', plural: 'Details' },
              defaultValue: [
                { term: 'Response', value: 'Within 2 business days' },
                { term: 'Direct', value: 'hello@suitsandsandals.com' },
                { term: 'Studios', value: 'Brooklyn, NY / Philadelphia, PA' },
              ],
              admin: {
                description: 'Facts worth knowing before writing: how fast, where else, who.',
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'term', type: 'text', required: true, admin: { width: '35%' } },
                    { name: 'value', type: 'text', required: true, admin: { width: '65%' } },
                  ],
                },
              ],
            },
            {
              name: 'nextStepsTitle',
              type: 'text',
              label: 'Next steps title',
              defaultValue: 'What happens next',
            },
            {
              name: 'nextSteps',
              type: 'array',
              labels: { singular: 'Step', plural: 'Steps' },
              defaultValue: [
                { text: 'A partner reads your brief, not a form queue.' },
                { text: 'You get a straight answer on fit, scope, and rough range.' },
                { text: "If it's a fit, we book 30 minutes and go deeper." },
              ],
              admin: { description: 'The first line is set in full contrast; the rest are quiet.' },
              fields: [{ name: 'text', type: 'text', required: true }],
            },
            {
              name: 'altCta',
              type: 'group',
              label: 'Alternative to the form',
              admin: { description: 'For visitors who would rather talk. Hidden if turned off.' },
              fields: [
                { name: 'enabled', type: 'checkbox', label: 'Show this', defaultValue: true },
                {
                  name: 'body',
                  type: 'text',
                  defaultValue: 'Rather talk it through first?',
                  admin: { condition: (_, siblingData) => Boolean(siblingData?.enabled) },
                },
                {
                  name: 'label',
                  type: 'text',
                  defaultValue: 'Schedule a call',
                  admin: { condition: (_, siblingData) => Boolean(siblingData?.enabled) },
                },
                {
                  name: 'url',
                  type: 'text',
                  admin: {
                    condition: (_, siblingData) => Boolean(siblingData?.enabled),
                    description: 'Leave empty to use the booking link from Site Info → Inquiries.',
                  },
                },
              ],
            },
          ],
        },
        {
          label: 'Form',
          description: 'What the form asks. Labels are yours; the values behind them are fixed.',
          fields: [
            {
              type: 'collapsible',
              label: 'Field labels',
              admin: { initCollapsed: true },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'nameLabel', type: 'text', defaultValue: 'Name', required: true },
                    { name: 'emailLabel', type: 'text', defaultValue: 'Email', required: true },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    { name: 'companyLabel', type: 'text', defaultValue: 'Company' },
                    {
                      name: 'websiteLabel',
                      type: 'text',
                      defaultValue: 'Current site (optional)',
                    },
                  ],
                },
              ],
            },
            {
              name: 'capabilities',
              type: 'group',
              label: 'What you need',
              admin: { condition: isProject },
              fields: [
                { name: 'label', type: 'text', defaultValue: 'What you need', required: true },
                { name: 'hint', type: 'text', defaultValue: 'Select any' },
                {
                  name: 'options',
                  type: 'relationship',
                  relationTo: 'capabilities',
                  hasMany: true,
                  admin: {
                    description:
                      'Offered as chips, in this order. Leave empty to offer every capability.',
                  },
                },
                {
                  name: 'unsureLabel',
                  type: 'text',
                  defaultValue: 'Not sure yet',
                  admin: {
                    description: 'Escape hatch chip. Clear it to drop the option entirely.',
                  },
                },
              ],
            },
            {
              name: 'budgetLabel',
              type: 'text',
              defaultValue: 'Budget range',
              admin: { condition: isProject },
            },
            {
              name: 'budgetHint',
              type: 'text',
              defaultValue: 'USD',
              admin: { condition: isProject },
            },
            chipOptions('budgetOptions', INQUIRY_BUDGETS, 'The bands offered, in order.'),
            {
              name: 'timelineLabel',
              type: 'text',
              defaultValue: 'Timeline',
              admin: { condition: isProject },
            },
            chipOptions('timelineOptions', INQUIRY_TIMELINES, 'The timings offered, in order.'),
            {
              name: 'message',
              type: 'group',
              label: 'The brief',
              fields: [
                { name: 'label', type: 'text', defaultValue: 'The brief', required: true },
                {
                  name: 'placeholder',
                  type: 'textarea',
                  defaultValue:
                    'What are you trying to move? A launch, a rebrand, a site that stopped keeping up. A paragraph is plenty.',
                },
                {
                  name: 'helper',
                  type: 'text',
                  admin: {
                    description: `Quiet line under the writing area. The counter runs to ${INQUIRY_MESSAGE_MAX_LENGTH} characters.`,
                  },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'submitLabel',
                  type: 'text',
                  required: true,
                  defaultValue: 'Send inquiry',
                  admin: { width: '40%' },
                },
                {
                  name: 'submitNote',
                  type: 'text',
                  defaultValue: 'We read every one. No sales sequence, no newsletter.',
                  admin: { width: '60%' },
                },
              ],
            },
          ],
        },
        {
          label: 'After sending',
          description:
            'The receipt. `{name}` and `{responseTime}` are replaced with the sender and the promise from Site Info.',
          fields: [
            { name: 'sentEyebrow', type: 'text', defaultValue: 'Inquiry received' },
            {
              name: 'sentHeading',
              type: 'text',
              required: true,
              defaultValue: "Thanks, it's in.",
            },
            {
              name: 'sentBody',
              type: 'textarea',
              defaultValue:
                "{name}, a partner is reading your brief. You'll hear back {responseTime}.",
            },
            {
              type: 'row',
              fields: [
                { name: 'sentReferenceLabel', type: 'text', defaultValue: 'Reference' },
                { name: 'sentSentLabel', type: 'text', defaultValue: 'Sent' },
                { name: 'sentCopyLabel', type: 'text', defaultValue: 'Copy to' },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'sentSummaryTitle', type: 'text', defaultValue: 'What you sent' },
                { name: 'sentEditLabel', type: 'text', defaultValue: 'Edit and resend' },
              ],
            },
            {
              type: 'collapsible',
              label: 'Summary row labels',
              admin: {
                initCollapsed: true,
                description:
                  'The receipt column is narrower than the form, so these can be shorter. Leave one empty to reuse the form label.',
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'sentScopeLabel', type: 'text', defaultValue: 'Scope' },
                    { name: 'sentBudgetLabel', type: 'text', defaultValue: 'Budget' },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    { name: 'sentTimelineLabel', type: 'text', defaultValue: 'Timeline' },
                    { name: 'sentBriefLabel', type: 'text', defaultValue: 'Brief' },
                  ],
                },
              ],
            },
            {
              name: 'sentAltBody',
              type: 'text',
              defaultValue: 'Want to skip ahead? Put 30 minutes on the calendar.',
              admin: { description: 'Uses the same booking link as the intro column.' },
            },
          ],
        },
      ],
    },
    themeField(),
  ],
}
