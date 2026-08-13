import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { richTextFixture } from '@/shared/testing/richTextFixture'
import { WorkIntro } from './index'

const summary =
  'We connected solutions to the relevant products, services, languages, and industries.\n\nVisitors gained a clearer path through the platform while retaining access to the technical depth they needed.'

const meta = {
  title: 'Components/WorkIntro',
  component: WorkIntro,
  parameters: {
    layout: 'fullscreen',
    // GSAP drives the entrance; snapshot the reduced-motion (final) state.
    chromatic: { prefersReducedMotion: 'reduce' },
  },
  args: {
    eyebrow: 'Introduction',
    title: 'Technical depth was never the problem',
    summary,
  },
} satisfies Meta<typeof WorkIntro>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithOverrideBody: Story = {
  args: {
    body: richTextFixture(summary),
    summary: null,
  },
}

export const WithoutEyebrow: Story = {
  args: { eyebrow: null },
}

export const TitleOnly: Story = {
  args: { summary: null },
}
