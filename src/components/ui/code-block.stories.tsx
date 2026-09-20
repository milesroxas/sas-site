import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { CodeBlock } from './code-block'

const shortSample = `export const BlockGrid = ({ className, subgrid = false, ...props }: Props) => (
  <div className={cn('grid grid-cols-1 gap-grid', subgrid && 'md:grid-cols-subgrid')} {...props} />
)`

const longLineSample = `// src/features/immersive/presets.ts
export const STREAK_FIELD_TECHNICAL_B2B = {
  count: 1500,
  segments: 8,
  layout: 'grid',
  motion: 'flow',
  // deltas only, never a restated default
}

// src/features/immersive/visual/looks.ts
'technical-b2b-v1': look({
  id: 'technical-b2b-v1',
  label: 'Technical B2B',
  description: 'A sparse grid of bent dashes streaming along one axis, slow enough to read as weather rather than motion.',
  tuning: STREAK_FIELD_TECHNICAL_B2B,
}),`

const cssSample = `@utility scroll-fade-x {
  --scroll-fade-inline: linear-gradient(to right, transparent 0, #000 var(--scroll-fade-s, 0px));
  mask-image: var(--scroll-fade-mask, var(--scroll-fade-inline));
}`

const meta = {
  title: 'UI/CodeBlock',
  component: CodeBlock,
  parameters: {
    layout: 'padded',
  },
  args: {
    code: shortSample,
    language: 'typescript',
  },
} satisfies Meta<typeof CodeBlock>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** Lines past the panel edge: the scroll bar is the site's, and the edge softens. */
export const Overflowing: Story = {
  args: { code: longLineSample },
  render: (args) => (
    <div className="max-w-2xl">
      <CodeBlock {...args} />
    </div>
  ),
}

export const Css: Story = {
  args: { code: cssSample, language: 'css' },
}

export const WithoutLineNumbers: Story = {
  args: { lineNumbers: false },
}

/** On a dark band the panel takes the band's deeper plate, not a lighter card. */
export const OnDarkBand: Story = {
  render: (args) => (
    <div className="bg-background p-12" data-band="dark">
      <CodeBlock {...args} />
    </div>
  ),
}
