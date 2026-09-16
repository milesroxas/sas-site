import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'
import { INITIAL_VIEWPORTS } from 'storybook/viewport'
import { cn } from '@/utilities/ui'
import { industryWorkPanelsFixture as panels } from '../fixtures'
import { HeadingDropdown } from './heading-dropdown'
import { type SectionTheme, themeClasses } from './section'

/**
 * The block's sentence on its own: the chip, the menu it opens (Paper:
 * "Industry work - C Spotlight ledger" menu), and the continuation scramble.
 * Stateful so picking a row swaps the sentence the way the block does.
 */
const Sentence = ({ lowercase, theme }: { lowercase?: boolean; theme: SectionTheme }) => {
  const [active, setActive] = useState(0)
  const panel = panels[active] ?? panels[0]
  if (!panel) return null
  return (
    <div className={cn(themeClasses[theme], 'px-gutter py-16')}>
      <HeadingDropdown
        activeIndex={active}
        continuationFor={(index) => panels[index] ?? panel}
        heading="Our work in"
        lowercase={lowercase}
        onSelect={setActive}
        options={panels.map((row) => row.industry)}
        secondLine={panel.secondLine}
        subheading={panel.subheading}
      />
    </div>
  )
}

const meta = {
  title: 'Blocks/Shared/HeadingDropdown',
  component: Sentence,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    lowercase: true,
    theme: 'dark',
  },
} satisfies Meta<typeof Sentence>

export default meta

type Story = StoryObj<typeof meta>

/** Pointer layout: the chip anchors a dropdown of option rows. */
export const Default: Story = {}

export const LightBand: Story = {
  args: { theme: 'light' },
}

/**
 * Phone: the chip opens a bottom sheet instead of a popover, the same rows at
 * full tap height. The sheet is portalled out of the story canvas.
 */
export const MobileSheet: Story = {
  globals: { viewport: { value: 'iphone12', isRotated: false } },
  parameters: {
    viewport: { options: INITIAL_VIEWPORTS },
    chromatic: { viewports: [390] },
  },
}
