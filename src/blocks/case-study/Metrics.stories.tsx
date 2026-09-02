import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { caseStudyMetricsFixture, paragraph, richText, text } from '../fixtures'
import { Metrics } from './Metrics'

/**
 * Public approval is enforced in `RenderCaseStudyBlocks`, so every metric a
 * story passes is already cleared to appear.
 */
const publicMetrics = caseStudyMetricsFixture.filter((metric) => metric.approvedForPublic)

const meta = {
  title: 'Blocks/CaseStudy/Metrics',
  component: Metrics,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    block: {
      blockType: 'caseStudyMetrics',
      layout: 'grid',
      source: 'all-public',
      theme: 'light',
    },
    metrics: publicMetrics,
  },
} satisfies Meta<typeof Metrics>

export default meta

type Story = StoryObj<typeof meta>

export const Grid: Story = {}

/** Any layout other than `grid` stacks into one column. */
export const Row: Story = {
  args: {
    block: {
      blockType: 'caseStudyMetrics',
      layout: 'row',
      source: 'all-public',
      theme: 'light',
    },
  },
}

export const WithIntroduction: Story = {
  args: {
    block: {
      blockType: 'caseStudyMetrics',
      heading: 'What changed',
      introduction: richText(
        paragraph(text('Measured against the six months before launch, on the same traffic mix.')),
      ),
      layout: 'grid',
      source: 'all-public',
      theme: 'light',
    },
  },
}

/** The renderer narrows to `featured` metrics before the block ever sees them. */
export const FeaturedOnly: Story = {
  args: {
    metrics: publicMetrics.filter((metric) => metric.featured),
  },
}

export const Dark: Story = {
  args: {
    block: {
      blockType: 'caseStudyMetrics',
      layout: 'grid',
      source: 'all-public',
      theme: 'dark',
    },
  },
}

export const Empty: Story = {
  args: { metrics: [] },
}
