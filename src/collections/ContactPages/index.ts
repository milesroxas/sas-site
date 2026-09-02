import type { CollectionConfig } from 'payload'
import { slugField } from '@/fields/slug'
import { authenticated } from '@/access/authenticated'
import { authenticatedOrPublished } from '@/access/authenticatedOrPublished'
import { seoMetaTab } from '@/fields/seoMetaTabFields'
import { populatePublishedAt } from '@/hooks/populatePublishedAt'
import { collectionPreview } from '@/utilities/generatePreviewPath'
import { revalidateContactPage, revalidateContactPageDelete } from './hooks/revalidateContactPage'

/**
 * A page where someone starts a conversation with the studio.
 *
 * Its own collection rather than a Pages composition because the layout is
 * fixed and unlike anything else on the site: a column of editorial copy
 * standing beside a form, which the same page replaces in situ with a receipt
 * once the form is sent. That is a template, not an arrangement of blocks, and
 * the fields below are the slots in it.
 *
 * The questions are not here. They live on a form in Forms, so one set of
 * questions can serve several of these pages and be composed onto an ordinary
 * page too. This collection owns the words around the form.
 */
export const ContactPages: CollectionConfig<'contact-pages'> = {
  slug: 'contact-pages',
  labels: { singular: 'Contact Page', plural: 'Contact Pages' },
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  admin: {
    group: 'Website',
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'form', '_status', 'updatedAt'],
    description:
      'Published at /contact/[slug], or at /contact for the page slugged "contact". The questions live on the linked form.',
    ...collectionPreview('contact-pages'),
  },
  defaultPopulate: { title: true, slug: true },
  fields: [
    { name: 'title', type: 'text', required: true },
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
          fields: [
            {
              name: 'form',
              type: 'relationship',
              relationTo: 'forms',
              required: true,
              admin: {
                description:
                  'The questions this page asks. Set the form\'s Delivery to "Inquiries inbox" so answers arrive with a reference and an owner.',
              },
            },
            {
              name: 'submitNote',
              type: 'text',
              defaultValue: 'We read every one. No sales sequence, no newsletter.',
              admin: { description: 'Quiet line beside the submit button.' },
            },
          ],
        },
        {
          label: 'After sending',
          description:
            'The receipt that replaces the form in place. `{name}` and `{responseTime}` are filled from the sender and Site Info.',
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
              name: 'sentAltBody',
              type: 'text',
              defaultValue: 'Want to skip ahead? Put 30 minutes on the calendar.',
              admin: { description: 'Uses the same booking link as the intro column.' },
            },
          ],
        },
        seoMetaTab(),
      ],
    },
    { name: 'publishedAt', type: 'date', admin: { position: 'sidebar' } },
    slugField({ useAsSlug: 'title' }),
  ],
  hooks: {
    beforeChange: [populatePublishedAt],
    afterChange: [revalidateContactPage],
    afterDelete: [revalidateContactPageDelete],
  },
  versions: { drafts: { autosave: { interval: 100 }, schedulePublish: true }, maxPerDoc: 50 },
}
