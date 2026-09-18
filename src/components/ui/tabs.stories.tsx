import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs'

const meta = {
  title: 'UI/Tabs',
  component: Tabs,
  subcomponents: { TabsList, TabsTrigger, TabsContent },
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Tabs>

export default meta

type Story = StoryObj<typeof meta>

const panels = (
  <>
    <TabsContent value="look" className="text-xs text-muted-foreground">
      Composition, motion, flow, relief, color and life.
    </TabsContent>
    <TabsContent value="pointer" className="text-xs text-muted-foreground">
      What the field does under the cursor.
    </TabsContent>
    <TabsContent value="export" className="text-xs text-muted-foreground">
      Size, scale, ground and format for a still.
    </TabsContent>
  </>
)

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="look">
      <TabsList>
        <TabsTrigger value="look">Look</TabsTrigger>
        <TabsTrigger value="pointer">Pointer</TabsTrigger>
        <TabsTrigger value="export">Export</TabsTrigger>
      </TabsList>
      {panels}
    </Tabs>
  ),
}

/** The admin tab bar: text on a hairline, the active tab underlined. */
export const Line: Story = {
  render: () => (
    <Tabs defaultValue="look">
      <TabsList variant="line">
        <TabsTrigger value="look">Look</TabsTrigger>
        <TabsTrigger value="pointer">Pointer</TabsTrigger>
        <TabsTrigger value="export">Export</TabsTrigger>
      </TabsList>
      {panels}
    </Tabs>
  ),
}
