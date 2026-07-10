import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Checkbox } from './checkbox'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from './field'
import { Input } from './input'
import { Textarea } from './textarea'

const meta = {
  title: 'UI/Field',
  component: Field,
  subcomponents: {
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
    FieldLegend,
    FieldSet,
  },
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    orientation: {
      control: 'select',
      options: ['vertical', 'horizontal', 'responsive'],
    },
  },
} satisfies Meta<typeof Field>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <Field className="w-80" {...args}>
      <FieldLabel htmlFor="field-email">Email</FieldLabel>
      <Input id="field-email" placeholder="you@example.com" type="email" />
      <FieldDescription>We never share your email.</FieldDescription>
    </Field>
  ),
}

export const Invalid: Story = {
  render: (args) => (
    <Field className="w-80" data-invalid {...args}>
      <FieldLabel htmlFor="field-email-invalid">Email</FieldLabel>
      <Input aria-invalid defaultValue="not-an-email" id="field-email-invalid" type="email" />
      <FieldError>Enter a valid email address.</FieldError>
    </Field>
  ),
}

export const Horizontal: Story = {
  args: { orientation: 'horizontal' },
  render: (args) => (
    <Field className="w-80" {...args}>
      <Checkbox id="field-terms" />
      <FieldLabel htmlFor="field-terms">Accept terms and conditions</FieldLabel>
    </Field>
  ),
}

export const Group: Story = {
  render: () => (
    <FieldGroup className="w-96">
      <Field>
        <FieldLabel htmlFor="group-name">Name</FieldLabel>
        <Input id="group-name" placeholder="Ada Lovelace" />
      </Field>
      <Field>
        <FieldLabel htmlFor="group-message">Message</FieldLabel>
        <Textarea id="group-message" placeholder="Say hello…" />
        <FieldDescription>Markdown is supported.</FieldDescription>
      </Field>
    </FieldGroup>
  ),
}

export const Fieldset: Story = {
  render: () => (
    <FieldSet className="w-80">
      <FieldLegend>Notifications</FieldLegend>
      <Field orientation="horizontal">
        <Checkbox defaultChecked id="fieldset-email" />
        <FieldLabel htmlFor="fieldset-email">Email</FieldLabel>
      </Field>
      <Field orientation="horizontal">
        <Checkbox id="fieldset-sms" />
        <FieldLabel htmlFor="fieldset-sms">SMS</FieldLabel>
      </Field>
    </FieldSet>
  ),
}
