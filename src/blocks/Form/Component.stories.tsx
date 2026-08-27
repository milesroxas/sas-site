import type { Form as FormType } from '@payloadcms/plugin-form-builder/types'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { heading, paragraph, richText, text } from '../fixtures'
import { FormBlock } from './Component'

/**
 * Matches the shape the form-builder plugin returns at runtime; the plugin's
 * published types lag the generated field configs, hence the cast.
 */
const contactForm = {
  id: '1',
  title: 'Contact form',
  fields: [
    {
      id: 'field-name',
      blockType: 'text',
      name: 'fullName',
      label: 'Full name',
      required: true,
      width: 50,
    },
    {
      id: 'field-email',
      blockType: 'email',
      name: 'email',
      label: 'Email',
      required: true,
      width: 50,
    },
    {
      id: 'field-message',
      blockType: 'textarea',
      name: 'message',
      label: 'Message',
      required: false,
      width: 100,
    },
  ],
  submitButtonLabel: 'Send message',
  confirmationType: 'message',
  confirmationMessage: richText(paragraph(text('Thanks — we will be in touch shortly.'))),
} as unknown as FormType

const meta = {
  title: 'Blocks/Form',
  component: FormBlock,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Renders a form-builder form. Submitting posts to `/api/form-submissions`, which is not available in Storybook — validation and layout are what these stories exercise.',
      },
    },
  },
  args: {
    enableIntro: true,
    form: contactForm,
    introContent: richText(
      heading('h3', text('Get in touch')),
      paragraph(text('Fields, widths, and validation all come from the form-builder plugin.')),
    ),
  },
} satisfies Meta<typeof FormBlock>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithoutIntro: Story = {
  args: {
    enableIntro: false,
  },
}

export const Dark: Story = {
  args: { theme: 'dark' },
}

export const Brand: Story = {
  args: { theme: 'brand' },
}
