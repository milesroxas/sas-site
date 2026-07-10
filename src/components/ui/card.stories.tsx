import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Button } from './button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './card'
import { Field, FieldLabel } from './field'
import { Input } from './input'

const meta = {
  title: 'UI/Card',
  component: Card,
  subcomponents: { CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle },
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['default', 'sm'],
    },
  },
} satisfies Meta<typeof Card>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <Card className="w-96" {...args}>
      <CardHeader>
        <CardTitle>Create project</CardTitle>
        <CardDescription>Deploy your new project in one click.</CardDescription>
      </CardHeader>
      <CardContent>
        <Field>
          <FieldLabel htmlFor="card-project-name">Name</FieldLabel>
          <Input id="card-project-name" placeholder="Name of your project" />
        </Field>
      </CardContent>
      <CardFooter className="justify-end gap-2">
        <Button variant="ghost">Cancel</Button>
        <Button>Deploy</Button>
      </CardFooter>
    </Card>
  ),
}

export const WithAction: Story = {
  render: (args) => (
    <Card className="w-96" {...args}>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>Manage how you receive updates.</CardDescription>
        <CardAction>
          <Button size="sm" variant="outline">
            Edit
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <p>Email and SMS notifications are enabled.</p>
      </CardContent>
    </Card>
  ),
}

export const Small: Story = {
  args: { size: 'sm' },
  render: (args) => (
    <Card className="w-96" {...args}>
      <CardHeader>
        <CardTitle>Compact card</CardTitle>
        <CardDescription>Uses the tighter sm spacing scale.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Body content.</p>
      </CardContent>
    </Card>
  ),
}

export const ContentOnly: Story = {
  render: (args) => (
    <Card className="w-96" {...args}>
      <CardContent>
        <p>A bare card with content only — no header or footer sections.</p>
      </CardContent>
    </Card>
  ),
}
