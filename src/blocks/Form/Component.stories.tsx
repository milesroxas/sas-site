import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import type { ResolvedFormField } from '@/blocks/shared/form/types'
import { paragraph, richText, text } from '../fixtures'
import { FormRenderer } from './Component.client'

/**
 * The block itself is a server component — it resolves capability chips
 * against the taxonomy before rendering — so these stories exercise the client
 * piece with fields already resolved, which is the half with the visuals.
 */
const contactFields: ResolvedFormField[] = [
  { blockType: 'text', name: 'fullName', label: 'Name', required: true, width: 50 },
  { blockType: 'email', name: 'email', label: 'Email', required: true, width: 50 },
  { blockType: 'text', name: 'company', label: 'Company', width: 50 },
  { blockType: 'text', name: 'website', label: 'Current site (optional)', width: 50 },
  { blockType: 'textarea', name: 'message', label: 'Your message', required: true },
]

const inquiryFields: ResolvedFormField[] = [
  { blockType: 'text', name: 'name', label: 'Name', required: true, width: 50, mapsTo: 'name' },
  { blockType: 'email', name: 'email', label: 'Email', required: true, width: 50, mapsTo: 'email' },
  {
    blockType: 'capabilities',
    name: 'capabilities',
    label: 'What you need',
    hint: 'Select any',
    unsureLabel: 'Not sure yet',
    mapsTo: 'capabilities',
    options: [
      { label: 'Brand Expansion', value: '1' },
      { label: 'Web Design', value: '2' },
      { label: 'Web Strategy', value: '3' },
      { label: 'Website Production', value: '4' },
      { label: 'Brand Communications', value: '5' },
    ],
  },
  {
    blockType: 'select',
    name: 'budget',
    label: 'Budget range',
    mapsTo: 'budget',
    options: [
      { label: 'Under 25K', value: 'under-25k' },
      { label: '25–50K', value: '25-50k' },
      { label: '50–100K', value: '50-100k' },
      { label: '100K +', value: '100k-plus' },
      { label: 'Need guidance', value: 'guidance' },
    ],
  },
  {
    blockType: 'textarea',
    name: 'brief',
    label: 'The brief',
    required: true,
    mapsTo: 'message',
  },
]

const meta = {
  title: 'Blocks/Form',
  component: FormRenderer,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A form-builder form in the site form language. Submitting posts to the API, which is not available in Storybook — validation and layout are what these stories exercise.',
      },
    },
  },
  args: {
    confirmationType: 'message',
    confirmationMessage: richText(paragraph(text('Thanks — we will be in touch shortly.'))),
    delivery: 'submissions',
    fields: contactFields,
    formId: 1,
    submitLabel: 'Send message',
  },
} satisfies Meta<typeof FormRenderer>

export default meta

type Story = StoryObj<typeof meta>

/** A plain form: answers land in Form Submissions. */
export const Default: Story = {}

/** A form wired to the inbox, with capability chips and a mapped budget. */
export const InquiryDelivery: Story = {
  args: {
    delivery: 'inquiries',
    fields: inquiryFields,
    submitLabel: 'Send inquiry',
  },
}
