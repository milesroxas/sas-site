import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { FullMediaBlock } from '@/blocks/full-media/Component'
import { RichTransition } from '@/blocks/rich-transition/RichTransition'
import { SplitContentNarrowBlock } from '@/blocks/split-content/Component'
import { StoryBeatsBlock } from '@/blocks/story-beats/Component'
import { mediaFixture, paragraph, richText, text } from '../fixtures'
import { SectionBand } from './SectionBand'

const body = richText(
  paragraph(
    text(
      'Suits & Sandals is a B2B branding agency for technical companies, specialized service providers, and expert-led firms with complex offerings.',
    ),
  ),
)

/**
 * Children of a Section always render `bare`: the band (surface + vertical
 * rhythm) is painted once by `SectionBand`, and the internal stack owns the
 * gap between blocks, exactly how the renderers compose nested blocks.
 */
const children = (
  <>
    <FullMediaBlock
      bare
      blockType="fullMedia"
      source="custom"
      eyebrow="Approach"
      heading="One band, many blocks"
      body={body}
      media={mediaFixture}
      width="contained"
      aspectRatio="16-9"
      contentPosition="left"
    />
    <SplitContentNarrowBlock
      bare
      blockType="splitContentNarrow"
      source="custom"
      eyebrow="About"
      heading="Nested beneath the same surface"
      body={body}
      media={mediaFixture}
      imagePosition="right"
    />
  </>
)

/**
 * The one exception to the stack: a Standard heading in the Prose layout
 * opens the passage under it, so the Section binds the two at two body lines
 * instead of a full stack step (`stack-binds-opener`, globals.css).
 */
const opensWithProseHeading = (
  <>
    <RichTransition
      bare
      stacked
      body={body}
      eyebrow="Approach"
      heading="One band, many blocks"
      layout="prose"
    />
    <StoryBeatsBlock bare blockType="storyBeats" body={body} variant="default" />
    <SplitContentNarrowBlock
      bare
      blockType="splitContentNarrow"
      source="custom"
      eyebrow="About"
      heading="Nested beneath the same surface"
      body={body}
      media={mediaFixture}
      imagePosition="right"
    />
  </>
)

const meta = {
  title: 'Blocks/Section',
  component: SectionBand,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    children,
  },
} satisfies Meta<typeof SectionBand>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Secondary: Story = {
  args: { customize: true, theme: 'secondary' },
}

export const Accent: Story = {
  args: { customize: true, theme: 'accent' },
}

export const Inverted: Story = {
  args: { customize: true, theme: 'inverted' },
}

export const TightSpacing: Story = {
  args: { customize: true, spacing: 'tight' },
}

export const LooseSpacing: Story = {
  args: { customize: true, spacing: 'loose' },
}

export const TightStack: Story = {
  args: { customize: true, stack: 'tight' },
}

export const LooseStack: Story = {
  args: { customize: true, stack: 'loose' },
}

export const OpensWithProseHeading: Story = {
  args: { children: opensWithProseHeading },
}

/** Unchecking Customize must ignore whatever the hidden fields still store. */
export const CustomizeOffIgnoresStoredValues: Story = {
  args: { customize: false, theme: 'inverted', spacing: 'none', stack: 'none' },
}
