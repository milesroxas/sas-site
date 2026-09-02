import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { labProjectLinksFixture, labTechnologiesFixture } from '../fixtures'
import { Facts } from './Facts'

/**
 * Each column arrives already filtered by `RenderLabBlocks`: a hidden status is
 * `null`, and hidden or internal-only lists arrive empty.
 */
const meta = {
  title: 'Blocks/Lab/Facts',
  component: Facts,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    block: {
      blockType: 'labFacts',
      heading: 'About this project',
      showLinks: true,
      showStatus: true,
      showTechnologies: true,
      theme: 'light',
    },
    links: labProjectLinksFixture,
    status: 'active',
    technologies: labTechnologiesFixture,
  },
} satisfies Meta<typeof Facts>

export default meta

type Story = StoryObj<typeof meta>

export const AllColumns: Story = {}

export const StatusOnly: Story = {
  args: { links: [], technologies: [] },
}

export const TechnologiesOnly: Story = {
  args: { links: [], status: null },
}

export const WithoutHeading: Story = {
  args: {
    block: {
      blockType: 'labFacts',
      showLinks: true,
      showStatus: true,
      showTechnologies: true,
      theme: 'light',
    },
  },
}

export const Dark: Story = {
  args: {
    block: {
      blockType: 'labFacts',
      heading: 'About this project',
      showLinks: true,
      showStatus: true,
      showTechnologies: true,
      theme: 'dark',
    },
  },
}

/** Every column off leaves nothing to render, so the band drops out. */
export const Empty: Story = {
  args: { links: [], status: null, technologies: [] },
}
