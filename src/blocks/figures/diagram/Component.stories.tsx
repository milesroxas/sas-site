import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { type DiagramSpec, layoutDiagram } from '@/features/figures'
import { DIAGRAM_CORPUS } from '@/features/figures/corpus'
import { DiagramFigure } from '@/features/figures/ui/diagram/diagram-figure'
import { RevealSection } from '@/shared/ui/reveal-section'
import { FigureShell } from '../Shell'

/**
 * The eight corpus diagrams (docs/figures.md). The block itself is an async
 * server component, so stories draw its client-safe piece, `DiagramFigure`,
 * inside the block's own shell. A loader runs the save-time layout the way the
 * plugin does on save; nothing is laid out during render here either.
 */
const figure = (name: keyof typeof DIAGRAM_CORPUS) => {
  const { spec, textAlternative = '', title } = DIAGRAM_CORPUS[name] ?? {}
  return { spec: spec as DiagramSpec, textAlternative, title }
}

const meta = {
  title: 'Blocks/Figures/Diagram',
  component: DiagramFigure,
  parameters: { layout: 'fullscreen' },
  args: { blockId: 'story-diagram', layout: null, width: 'wide', ...figure('visualResolves') },
  argTypes: { width: { control: 'select', options: ['text', 'wide', 'full'] } },
  loaders: [async ({ args }) => ({ layout: await layoutDiagram(args.spec) })],
  render: (args, { loaded }) => (
    <FigureShell>
      <DiagramFigure {...args} layout={loaded.layout} />
    </FigureShell>
  ),
} satisfies Meta<typeof DiagramFigure>

export default meta

type Story = StoryObj<typeof meta>

/** Decisions, an emphasised node, a dashed edge and a live (marching) one. */
export const Flow: Story = {}

/** Groups frame the CPU and GPU halves; top down, so it has no narrow twin. */
export const FlowWithGroups: Story = { args: figure('renderPipeline') }

export const FlowTopDown: Story = { args: figure('admission') }

/** A state may return to itself. */
export const State: Story = { args: figure('lifecycle') }

export const StateTopDown: Story = { args: figure('recipeStates') }

/** Replies draw dashed and a person's header is a pill, so neither needs color. */
export const Sequence: Story = { args: figure('publishSequence') }

export const SequenceWithReplies: Story = { args: figure('authoringPath') }

/** Below the width its wide form reads at, a sequence keeps its lifelines on a phone's pitch and runs each label across the canvas. */
export const SequenceNarrowFrame: Story = { args: { ...figure('publishSequence'), width: 'text' } }

export const Timeline: Story = { args: figure('studioTimeline') }

/** At the reading column's width a left-to-right flow swaps to its top-down twin. */
export const NarrowFrame: Story = { args: { width: 'text' } }

export const OnDarkBand: Story = {
  render: (args, { loaded }) => (
    <FigureShell theme="dark">
      <DiagramFigure {...args} layout={loaded.layout} />
    </FigureShell>
  ),
}

/** Inside the block reveal, as on a page: nodes surface in reading order and edges draw from their source. */
export const Entrance: Story = {
  render: (args, { loaded }) => (
    <RevealSection>
      <FigureShell>
        <DiagramFigure {...args} layout={loaded.layout} />
      </FigureShell>
    </RevealSection>
  ),
}

/** Between an autosave and the next full save a draft has no layout for its new spec. */
export const LayoutPending: Story = { loaders: [async () => ({ layout: null })] }
