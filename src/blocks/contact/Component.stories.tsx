import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ContactFormClient, type ContactFormContent } from './Component.client'

const projectContent: ContactFormContent = {
  variant: 'project',
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
  nameLabel: 'Name',
  emailLabel: 'Email',
  companyLabel: 'Company',
  websiteLabel: 'Current site (optional)',
  capabilities: {
    label: 'What you need',
    hint: 'Select any',
    unsureLabel: 'Not sure yet',
    options: [
      { label: 'Brand Expansion', value: '1' },
      { label: 'Web Design', value: '2' },
      { label: 'Web Strategy', value: '3' },
      { label: 'Website Production', value: '4' },
      { label: 'Brand Communications', value: '5' },
    ],
  },
  budgetLabel: 'Budget range',
  budgetHint: 'USD',
  budgetOptions: [
    { label: 'Under 25K', value: 'under-25k' },
    { label: '25–50K', value: '25-50k' },
    { label: '50–100K', value: '50-100k' },
    { label: '100K +', value: '100k-plus' },
    { label: 'Need guidance', value: 'guidance' },
  ],
  timelineLabel: 'Timeline',
  timelineOptions: [
    { label: 'As soon as possible', value: 'asap' },
    { label: '1–3 months', value: '1-3-months' },
    { label: '3–6 months', value: '3-6-months' },
    { label: 'Just exploring', value: 'exploring' },
  ],
  messageLabel: 'The brief',
  messagePlaceholder:
    'What are you trying to move? A launch, a rebrand, a site that stopped keeping up. A paragraph is plenty.',
  messageHelper: 'A paragraph is plenty',
  submitLabel: 'Send inquiry',
  submitNote: 'We read every one. No sales sequence, no newsletter.',
  sentEyebrow: 'Inquiry received',
  sentHeading: "Thanks, it's in.",
  sentBody: "{name}, a partner is reading your brief. You'll hear back {responseTime}.",
  sentReferenceLabel: 'Reference',
  sentSentLabel: 'Sent',
  sentCopyLabel: 'Copy to',
  sentSummaryTitle: 'What you sent',
  sentEditLabel: 'Edit and resend',
  sentScopeLabel: 'Scope',
  sentBudgetLabel: 'Budget',
  sentTimelineLabel: 'Timeline',
  sentBriefLabel: 'Brief',
  sentAltBody: 'Want to skip ahead? Put 30 minutes on the calendar.',
  responseTime: 'within 2 business days',
}

const generalContent: ContactFormContent = {
  ...projectContent,
  variant: 'general',
  eyebrow: 'Say hello',
  heading: 'Anything else on your mind?',
  lead: 'Questions, introductions, speaking, press. It all lands in the same inbox.',
  nextSteps: ['A person reads it, and answers.'],
  capabilities: null,
  messageLabel: 'Your message',
  messagePlaceholder: 'What can we help with?',
  messageHelper: null,
  submitLabel: 'Send message',
  sentEyebrow: 'Message received',
  sentBody: "{name}, thanks for writing. You'll hear back {responseTime}.",
}

/**
 * `/api/inquiries/submit` is not running in Storybook, so the submit path is
 * stubbed. Submitting a story therefore plays the real swap into the real
 * receipt — which is the half of this block worth reviewing visually.
 */
const stubSubmit: NonNullable<Meta['decorators']> = (Story) => {
  globalThis.fetch = (async () =>
    Response.json({
      reference: 'SS-K4T9',
      submittedAt: new Date().toISOString(),
    })) as typeof fetch

  return <Story />
}

const meta = {
  title: 'Blocks/Contact',
  component: ContactFormClient,
  parameters: { layout: 'fullscreen' },
  decorators: [stubSubmit],
} satisfies Meta<typeof ContactFormClient>

export default meta

type Story = StoryObj<typeof meta>

/** The scoped inquiry: capabilities, budget, timeline, brief. */
export const ProjectInquiry: Story = {
  args: { content: projectContent },
}

/** The same template with the scoping questions dropped. */
export const GeneralMessage: Story = {
  args: { content: generalContent },
}
