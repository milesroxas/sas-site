import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import {
  IconAlertTriangle,
  IconCircleCheck,
  IconExclamationCircle,
  IconInfoCircle,
} from '@tabler/icons-react'
import { Alert, AlertDescription, AlertTitle } from './alert'

const meta = {
  title: 'UI/Alert',
  component: Alert,
  subcomponents: { AlertDescription, AlertTitle },
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive', 'info', 'success', 'warning', 'error'],
    },
  },
} satisfies Meta<typeof Alert>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <Alert {...args}>
      <IconInfoCircle />
      <AlertTitle>Heads up</AlertTitle>
      <AlertDescription>You can add components to your app using the CLI.</AlertDescription>
    </Alert>
  ),
}

export const Destructive: Story = {
  args: { variant: 'destructive' },
  render: (args) => (
    <Alert {...args}>
      <IconExclamationCircle />
      <AlertTitle>Something went wrong</AlertTitle>
      <AlertDescription>Your session has expired. Please log in again.</AlertDescription>
    </Alert>
  ),
}

export const Success: Story = {
  args: { variant: 'success' },
  render: (args) => (
    <Alert {...args}>
      <IconCircleCheck />
      <AlertTitle>Saved</AlertTitle>
      <AlertDescription>Your changes have been saved.</AlertDescription>
    </Alert>
  ),
}

export const Warning: Story = {
  args: { variant: 'warning' },
  render: (args) => (
    <Alert {...args}>
      <IconAlertTriangle />
      <AlertTitle>Careful</AlertTitle>
      <AlertDescription>This action affects all team members.</AlertDescription>
    </Alert>
  ),
}

export const ErrorVariant: Story = {
  name: 'Error',
  args: { variant: 'error' },
  render: (args) => (
    <Alert {...args}>
      <IconExclamationCircle />
      <AlertTitle>Upload failed</AlertTitle>
      <AlertDescription>The file could not be uploaded. Try again.</AlertDescription>
    </Alert>
  ),
}

export const WithoutTitle: Story = {
  render: (args) => (
    <Alert {...args}>
      <IconInfoCircle />
      <AlertDescription>A short informational message without a title.</AlertDescription>
    </Alert>
  ),
}
