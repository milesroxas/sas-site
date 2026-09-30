import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { caseStudyKeyDecisionsFixture, paragraph, richText, text } from '../fixtures'
import { KeyDecisions } from './KeyDecisions'

const meta = {
  title: 'Blocks/CaseStudy/KeyDecisions',
  component: KeyDecisions,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    block: {
      blockType: 'caseStudyKeyDecisions',
      layout: 'cards',
      source: 'all',
      theme: 'default',
    },
    decisions: caseStudyKeyDecisionsFixture,
  },
} satisfies Meta<typeof KeyDecisions>

export default meta

type Story = StoryObj<typeof meta>

export const Cards: Story = {}

/** Any layout other than `cards` renders one column. */
export const List: Story = {
  args: {
    block: {
      blockType: 'caseStudyKeyDecisions',
      layout: 'list',
      source: 'all',
      theme: 'default',
    },
  },
}

export const WithIntroduction: Story = {
  args: {
    block: {
      blockType: 'caseStudyKeyDecisions',
      heading: 'What we decided',
      introduction: richText(
        paragraph(
          text(
            'Three calls shaped the engagement. Each one closed off a path we could have taken.',
          ),
        ),
      ),
      layout: 'cards',
      source: 'all',
      theme: 'default',
    },
  },
}

/** The renderer narrows to `featured` decisions before the block ever sees them. */
export const FeaturedOnly: Story = {
  args: {
    decisions: caseStudyKeyDecisionsFixture.filter((decision) => decision.featured),
  },
}

export const Inverted: Story = {
  args: {
    block: {
      blockType: 'caseStudyKeyDecisions',
      layout: 'cards',
      source: 'all',
      theme: 'inverted',
    },
  },
}

export const Empty: Story = {
  args: { decisions: [] },
}
