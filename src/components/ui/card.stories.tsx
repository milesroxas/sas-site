import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { IconArrowUpRight, IconCheck, IconMessageCheck } from '@tabler/icons-react'
import { Button } from './button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardIcon,
  CardTitle,
} from './card'
import { Field, FieldLabel } from './field'
import { Input } from './input'

const meta = {
  title: 'UI/Card',
  component: Card,
  subcomponents: {
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardIcon,
    CardTitle,
  },
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['default', 'sm'],
    },
    variant: {
      control: 'select',
      options: ['default', 'inset'],
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

/** In a conversation (Ask's handoff card): muted ground, chat-sized copy, a ruled caption footer. */
export const Inset: Story = {
  args: { variant: 'inset' },
  render: (args) => (
    <Card className="w-96" {...args}>
      <CardHeader>
        <CardTitle>Priced and scheduled per project</CardTitle>
        <CardDescription>A partner will reply by email within 3 business days.</CardDescription>
      </CardHeader>
      <CardContent>
        <Button size="chat">Send to the team</Button>
      </CardContent>
      <CardFooter>
        <IconMessageCheck aria-hidden />
        <span>Sends your question: “What does a website cost, and when can you start?”</span>
      </CardFooter>
    </Card>
  ),
}

/** A status mark leading the header: the sent receipt. */
export const InsetReceipt: Story = {
  args: { variant: 'inset' },
  render: (args) => (
    <Card className="w-96" {...args}>
      <CardHeader>
        <CardIcon>
          <IconCheck />
        </CardIcon>
        <CardTitle>Sent to the team</CardTitle>
        <CardDescription>
          A partner will reply to jordan@northwind.co within 3 business days. We&apos;ve emailed you
          a confirmation. Reference SS-7K2Q.
        </CardDescription>
      </CardHeader>
      <CardFooter>
        <span>Rather talk it through?</span>
        <Button asChild size="clear" variant="link">
          <a href="https://calendar.app.google/example" rel="noopener noreferrer" target="_blank">
            Book a call
            <IconArrowUpRight data-icon="inline-end" />
          </a>
        </Button>
      </CardFooter>
    </Card>
  ),
}
