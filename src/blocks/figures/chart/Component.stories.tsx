import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { CHART_CORPUS } from '@/features/figures/corpus'
import { ChartBlock } from './Component'

/**
 * The eight corpus charts (docs/figures.md): every kind, both orientations,
 * every x type, a reference series, annotations. The chart loads when it nears
 * the viewport, so a story shows the reserved box for a beat first, exactly
 * as a page does.
 */
const figure = (name: keyof typeof CHART_CORPUS) => {
  const { spec, textAlternative, title } = CHART_CORPUS[name] ?? {}
  return { spec, textAlternative, title }
}

const meta = {
  title: 'Blocks/Figures/Chart',
  component: ChartBlock,
  parameters: { layout: 'fullscreen' },
  args: {
    blockType: 'chart',
    id: 'story-chart',
    width: 'wide',
    caption: 'Illustrative numbers from the acceptance corpus.',
    ...figure('frameTimeByCount'),
  },
  argTypes: {
    theme: { control: 'select', options: ['light', 'dark', 'neutral', 'brand'] },
    width: { control: 'select', options: ['text', 'wide', 'full'] },
  },
} satisfies Meta<typeof ChartBlock>

export default meta

type Story = StoryObj<typeof meta>

/** Two series and a neutral reference line; line ends labelled because they sit apart. */
export const Line: Story = {}

export const LineOverTime: Story = { args: figure('lcpByFace') }

/** One series and few rows, so the tips carry their values. */
export const BarHorizontal: Story = { args: figure('noiseCost') }

export const BarGrouped: Story = { args: figure('posterWeight') }

/** Time under bars draws as dated bands. */
export const BarOverTime: Story = { args: figure('studioPublishes') }

export const Area: Story = { args: figure('octavesVsDetail') }

export const Scatter: Story = { args: figure('countVsFps') }

/** The data end is rounded whichever way a bar points; the baseline stays square. */
export const DivergingBar: Story = { args: figure('deltaFromDefault') }

/** The dark steps are selected for the dark ground, not flipped from the light ones. */
export const OnDarkBand: Story = { args: { theme: 'dark' } }

export const OnNeutralBand: Story = { args: { ...figure('posterWeight'), theme: 'neutral' } }

export const TextWidth: Story = {
  args: {
    width: 'text',
    dataSource: { label: 'Chrome DevTools trace', href: 'https://example.com' },
  },
}

/** A spec today's schema rejects keeps its words and says the drawing is missing. */
export const Unavailable: Story = {
  args: { spec: { specVersion: 1, kind: 'pie' } as never },
}
