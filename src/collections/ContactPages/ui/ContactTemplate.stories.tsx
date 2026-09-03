import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import type { ResolvedFormField } from '@/blocks/shared/form/types'
import { PROJECT_INQUIRY_FIELDS, PROJECT_INQUIRY_STEPS } from '../inquiryForm'
import { ContactTemplate, type ContactTemplateContent } from './ContactTemplate.client'

const content: ContactTemplateContent = {
  eyebrow: 'Project inquiry',
  heading: 'Got a project in mind?',
  lead: "Send some details over and we'll let you know how we can help.",
  details: [
    { term: 'Response', value: 'Within 2 business days' },
    { term: 'Direct', value: 'hello@suitsandsandals.com' },
    { term: 'Studios', value: 'Brooklyn, NY / Philadelphia, PA' },
  ],
  nextStepsTitle: 'What happens next',
  nextSteps: [
    'A partner reads your brief, not a form queue.',
    'You get a straight answer on fit, scope, and rough range.',
    "If it's a fit, we book 30 minutes and go deeper.",
  ],
  altCta: {
    body: 'Rather talk it through first?',
    label: 'Schedule a call',
    url: 'https://example.com/schedule',
  },
  submitNote: 'We read every one. No sales sequence, no newsletter.',
  sentEyebrow: 'Inquiry received',
  sentHeading: "Thanks, it's in.",
  sentBody: "{name}, a partner is reading your brief. You'll hear back {responseTime}.",
  sentReferenceLabel: 'Reference',
  sentSentLabel: 'Sent',
  sentCopyLabel: 'Copy to',
  sentSummaryTitle: 'What you sent',
  sentEditLabel: 'Edit and resend',
  sentAltBody: 'Want to skip ahead? Put 30 minutes on the calendar.',
  responseTime: 'within 2 business days',
}

/** Capability chips as `resolveFormFields` names them from the taxonomy. */
const capabilityOptions = [
  { label: 'Brand Expansion', value: '1' },
  { label: 'Web Design', value: '2' },
  { label: 'Web Strategy', value: '3' },
  { label: 'Website Production', value: '4' },
  { label: 'Brand Communications', value: '5' },
]

/** The shipped inquiry form, with its capability chips already resolved. */
const inquiryFields: ResolvedFormField[] = PROJECT_INQUIRY_FIELDS.map((field) =>
  field.blockType === 'capabilities' ? { ...field, options: capabilityOptions } : field,
)

const generalFields: ResolvedFormField[] = [
  { blockType: 'text', name: 'name', label: 'Name', required: true, width: 50, mapsTo: 'name' },
  { blockType: 'email', name: 'email', label: 'Email', required: true, width: 50, mapsTo: 'email' },
  {
    blockType: 'textarea',
    name: 'message',
    label: 'Your message',
    required: true,
    mapsTo: 'message',
  },
]

/**
 * `/api/inquiries/submit` is not running in Storybook, so the submit path is
 * stubbed. Submitting therefore plays the real swap into the real receipt,
 * which is the half of this template worth reviewing visually.
 */
const stubSubmit: NonNullable<Meta['decorators']> = (Story) => {
  globalThis.fetch = (async () =>
    Response.json({ reference: 'SS-K4T9', submittedAt: new Date().toISOString() })) as typeof fetch
  return <Story />
}

const meta = {
  title: 'Collections/ContactPage',
  component: ContactTemplate,
  parameters: { layout: 'fullscreen' },
  decorators: [stubSubmit],
  args: {
    content,
    delivery: 'inquiries',
    fields: inquiryFields,
    formId: 1,
    steps: PROJECT_INQUIRY_STEPS,
    submitLabel: 'Send inquiry',
  },
} satisfies Meta<typeof ContactTemplate>

export default meta

type Story = StoryObj<typeof meta>

/** The scoped inquiry, asked in three steps: who you are, the work, the brief. */
export const ProjectInquiry: Story = {}

/** The same template pointed at a shorter form with no dividers, asked all at once. */
export const GeneralMessage: Story = {
  args: {
    content: {
      ...content,
      eyebrow: 'Say hello',
      heading: 'Anything else on your mind?',
      lead: 'Questions, introductions, speaking, press. It all lands in the same inbox.',
      nextSteps: ['A person reads it, and answers.'],
      sentEyebrow: 'Message received',
      sentBody: "{name}, thanks for writing. You'll hear back {responseTime}.",
    },
    fields: generalFields,
    submitLabel: 'Send message',
  },
}
