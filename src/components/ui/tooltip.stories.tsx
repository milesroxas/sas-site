import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Button } from './button'
import { Kbd, KbdGroup } from './kbd'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip'

const meta = {
  title: 'UI/Tooltip',
  component: Tooltip,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <TooltipProvider>
        <Story />
      </TooltipProvider>
    ),
  ],
} satisfies Meta<typeof Tooltip>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline">Hover me</Button>
      </TooltipTrigger>
      <TooltipContent>Keyboard shortcut: ⌘B</TooltipContent>
    </Tooltip>
  ),
}

export const Sides: Story = {
  render: () => (
    <div className="flex gap-4">
      {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
        <Tooltip key={side}>
          <TooltipTrigger asChild>
            <Button variant="outline" size="sm">
              {side}
            </Button>
          </TooltipTrigger>
          <TooltipContent side={side}>Tooltip on {side}</TooltipContent>
        </Tooltip>
      ))}
    </div>
  ),
}

/**
 * The `panel` surface: a titled paragraph with a range line and a shortcut
 * row, the inspector's parameter tooltip. It materializes from its anchor
 * edge (blur and scale together) instead of fading.
 */
export const Panel: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline">Thickness</Button>
      </TooltipTrigger>
      <TooltipContent variant="panel" side="left" sideOffset={8}>
        <div className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between gap-3">
            <span className="font-medium text-foreground">Thickness</span>
            <span className="font-mono text-[11px] text-muted-foreground">thickness</span>
          </div>
          <p>Streak height in CSS px. Over a light ground the paper treatment adds to it.</p>
          <p className="font-mono text-[11px] text-muted-foreground">
            0.2 to 4 · step 0.1 · default 2.8
          </p>
          <KbdGroup>
            <Kbd>↑↓</Kbd>
            <span className="text-[10px] text-muted-foreground">step</span>
            <Kbd>⇧</Kbd>
            <span className="text-[10px] text-muted-foreground">×10</span>
            <Kbd>⌥</Kbd>
            <span className="text-[10px] text-muted-foreground">reset</span>
          </KbdGroup>
        </div>
      </TooltipContent>
    </Tooltip>
  ),
}
