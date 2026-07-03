import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Button } from './button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card'
import { Input } from './input'
import { Label } from './label'

const meta = {
  title: 'UI/Card',
  component: Card,
  subcomponents: { CardContent, CardDescription, CardFooter, CardHeader, CardTitle },
  parameters: {
    layout: 'centered',
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
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="card-project-name">Name</Label>
          <Input id="card-project-name" placeholder="Name of your project" />
        </div>
      </CardContent>
      <CardFooter className="justify-end gap-2">
        <Button variant="ghost">Cancel</Button>
        <Button>Deploy</Button>
      </CardFooter>
    </Card>
  ),
}

export const ContentOnly: Story = {
  render: (args) => (
    <Card className="w-96" {...args}>
      <CardContent className="pt-6">
        <p className="text-sm">A bare card with content only — no header or footer sections.</p>
      </CardContent>
    </Card>
  ),
}
