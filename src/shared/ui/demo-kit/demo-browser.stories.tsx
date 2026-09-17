import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Theme } from '@/providers/Theme/types'
import { DemoBrowserFrame } from './demo-browser'

/**
 * The browser-window mockup the demo playgrounds render their effects in.
 * The frame is the window's theme scope, so the stories are also the check
 * that a window previewing one polarity inside a document set to the other
 * really repaints: flip Storybook's own theme and the window must hold.
 */
const meta = {
  title: 'Shared/DemoBrowserFrame',
  component: DemoBrowserFrame,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    theme: { control: 'inline-radio', options: ['light', 'dark'] },
    onThemeChange: { table: { disable: true } },
  },
  args: {
    path: '/lab/streak-field',
    children: <MockPage />,
  },
} satisfies Meta<typeof DemoBrowserFrame>

export default meta

type Story = StoryObj<typeof meta>

/** Page inside the window: semantic tokens only, so it follows the frame. */
function MockPage() {
  return (
    <div className="space-y-4 bg-background p-8 text-foreground">
      <Badge variant="secondary">Mock content</Badge>
      <h2 className="text-heading-3">Signal, seen from the side.</h2>
      <p className="max-w-prose text-sm/relaxed text-muted-foreground">
        Chrome, border, address bar and this page all resolve from the frame&rsquo;s{' '}
        <code className="font-mono">data-theme</code>, so the window can preview a polarity the
        surrounding document is not in.
      </p>
      <Button size="sm">Primary</Button>
    </div>
  )
}

/** Follows the document: no `theme`, so the window is whatever the site is. */
export const Default: Story = {}

/**
 * Pinned light. Under Storybook's dark theme this is the regression the frame
 * exists to prevent — the whole window, chrome included, must read light.
 */
export const Light: Story = {
  args: { theme: 'light' },
}

/** Pinned dark, the mirror case under Storybook's light theme. */
export const Dark: Story = {
  args: { theme: 'dark' },
}

/** With the window's own toggle, as the playgrounds mount it. */
export const Themeable: Story = {
  render: (args) => {
    const [theme, setTheme] = useState<Theme>('dark')
    return (
      <DemoBrowserFrame
        {...args}
        theme={theme}
        onThemeChange={setTheme}
        themeHint="Also loads the look that ships over that ground."
      />
    )
  },
}
