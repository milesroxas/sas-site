import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { BESPOKE_FIGURES } from '@/features/figures'
import { BespokeFigureBlock } from './Component'

const meta = {
  title: 'Blocks/Figures/BespokeFigure',
  component: BespokeFigureBlock,
  parameters: { layout: 'fullscreen' },
  args: {
    blockType: 'bespokeFigure',
    id: 'story-bespoke',
    figure: 'streak-dash-anatomy-v1',
    title: 'Anatomy of one streak',
    textAlternative: BESPOKE_FIGURES['streak-dash-anatomy-v1'].textAlternative,
    width: 'wide',
  },
  argTypes: {
    figure: { control: 'select', options: Object.keys(BESPOKE_FIGURES) },
    theme: { control: 'select', options: ['light', 'dark', 'neutral', 'brand'] },
  },
} satisfies Meta<typeof BespokeFigureBlock>

export default meta

type Story = StoryObj<typeof meta>

export const DashAnatomy: Story = {}

/** Stored props set the starting values; anything the figure's schema rejects falls back to its defaults. */
export const DashAnatomyWithProps: Story = {
  args: { props: { length: 140, tail: 0.85, thickness: 18 } },
}

export const CurlVersusGradient: Story = {
  args: {
    figure: 'streak-curl-vs-gradient-v1',
    title: 'Same noise, two direction rules',
    textAlternative: BESPOKE_FIGURES['streak-curl-vs-gradient-v1'].textAlternative,
  },
}

export const OnDarkBand: Story = { args: { ...CurlVersusGradient.args, theme: 'dark' } }
