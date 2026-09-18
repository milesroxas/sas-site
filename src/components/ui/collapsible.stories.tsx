import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './collapsible'

const meta = {
  title: 'UI/Collapsible',
  component: Collapsible,
  subcomponents: { CollapsibleTrigger, CollapsibleContent },
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
} satisfies Meta<typeof Collapsible>

export default meta

type Story = StoryObj<typeof meta>

/** An inspector section: the whole header row toggles, the summary sits at the far edge. */
export const Default: Story = {
  render: () => (
    <Collapsible defaultOpen>
      <CollapsibleTrigger>
        Composition
        <span className="ml-auto font-mono text-[11px] font-normal text-muted-foreground">
          rows · dash
        </span>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <p className="pb-3 text-xs text-muted-foreground">
          Layout, shape, pitch, jitter, thickness, length and bias.
        </p>
      </CollapsibleContent>
    </Collapsible>
  ),
}

export const Closed: Story = {
  render: () => (
    <Collapsible>
      <CollapsibleTrigger>
        Relief
        <span className="ml-auto font-mono text-[11px] font-normal text-muted-foreground">
          0.73 · floor 0.42
        </span>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <p className="pb-3 text-xs text-muted-foreground">Relief, floor, contrast, length.</p>
      </CollapsibleContent>
    </Collapsible>
  ),
}
