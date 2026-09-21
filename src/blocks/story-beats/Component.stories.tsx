import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { paragraph, richText, text } from '../fixtures'
import { StoryBeatsBlock } from './Component'

/** One resolved Story Beat: a self-contained passage, no heading of its own. */
const beat = richText(
  paragraph(
    text(
      'The engineering team had already solved the hard part. What the market saw was a feature list, and a feature list reads as a commodity no matter how good the engineering underneath it is.',
    ),
  ),
  paragraph(
    text(
      'So the first move was not visual. It was deciding which single idea the company would lead with, and what everything else had to earn its place against.',
    ),
  ),
)

/** A whole section: the overview followed by every beat, composed in order. */
const section = richText(
  paragraph(
    text(
      'The positioning work ran ahead of the identity, because the identity had nothing to carry until the argument was settled.',
    ),
  ),
  ...beat.root.children,
)

const meta = {
  title: 'Blocks/Text/StoryBeats',
  component: StoryBeatsBlock,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    blockType: 'storyBeats',
    body: beat,
    theme: 'light',
    variant: 'default',
  },
} satisfies Meta<typeof StoryBeatsBlock>

export default meta

type Story = StoryObj<typeof meta>

/** Article body copy: the size a post renders its main text at. */
export const Default: Story = {}

/** One step down, for an aside or a footnote beside the main run. */
export const Small: Story = {
  args: { variant: 'small' },
}

/** The standfirst size, for a beat that opens a section. */
export const Lead: Story = {
  args: { variant: 'lead' },
}

/** An editor heading at the default level, on the Prose Standard heading scale. */
export const WithHeading: Story = {
  args: { heading: 'Leading with one idea', headingLevel: 'h3' },
}

/** The smallest heading level: a step above the body, carried by weight. */
export const WithHeadingFour: Story = {
  args: { heading: 'Leading with one idea', headingLevel: 'h4' },
}

/** Entire section scope: the overview and its beats in one column. */
export const EntireSection: Story = {
  args: { body: section },
}

export const Dark: Story = {
  args: { theme: 'dark' },
}
