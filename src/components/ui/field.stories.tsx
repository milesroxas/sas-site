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

/**
 * Apple's inset grouped form: one raised block, rows split by hairlines from
 * the label lane, focus and invalid drawn inside the row. Pair with
 * `Input variant="bare"`.
 */
export const InsetGroup: Story = {
  render: () => (
    <FieldGroup className="w-96" variant="inset">
      <Field orientation="horizontal">
        <FieldLabel htmlFor="inset-name">Name</FieldLabel>
        <Input autoComplete="name" id="inset-name" placeholder="Your name" variant="bare" />
      </Field>
      <Field orientation="horizontal">
        <FieldLabel htmlFor="inset-email">Email</FieldLabel>
        <Input
          autoComplete="email"
          defaultValue="jordan@northwind.co"
          id="inset-email"
          type="email"
          variant="bare"
        />
        <FieldDescription>From your message</FieldDescription>
      </Field>
    </FieldGroup>
  ),
}

export const InsetGroupInvalid: Story = {
  render: () => (
    <FieldGroup className="w-96" variant="inset">
      <Field orientation="horizontal">
        <FieldLabel htmlFor="inset-invalid-name">Name</FieldLabel>
        <Input defaultValue="Jordan Lee" id="inset-invalid-name" variant="bare" />
      </Field>
      <Field orientation="horizontal">
        <FieldLabel htmlFor="inset-invalid-email">Email</FieldLabel>
        <Input
          aria-invalid
          defaultValue="jordan@northwind"
          id="inset-invalid-email"
          type="email"
          variant="bare"
        />
      </Field>
    </FieldGroup>
  ),
}
