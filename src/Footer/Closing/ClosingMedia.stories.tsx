import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { mediaFixture, videoFixture } from '@/blocks/fixtures'
import { Container } from '@/components/Container'
import { ClosingMedia } from './ClosingMedia'

/**
 * The closing band's background layer on its own, so the scroll-scrubbed
 * parallax can be read without the rest of the band on top of it. ClosingMedia
 * scrubs against its nearest `<section>` ancestor, so the decorator supplies
 * that section plus a screen of runway either side — scroll the canvas to drive
 * the travel. In context it ships inside `Features/FooterClosing`.
 */
const meta = {
  title: 'Features/ClosingMedia',
  component: ClosingMedia,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    media: mediaFixture,
  },
  decorators: [
    (Story) => (
      <div className="bg-background text-foreground" data-theme="dark">
        <div className="h-screen" />
        {/* Mirrors the band's own frame: the isolated stacking context the
            `-z-10` layer sits behind, and copy to read the vignette against. */}
        <section className="relative isolate flex h-screen items-end bg-background py-16 md:py-24">
          <Story />
          <Container>
            <h2 className="max-w-3xl text-balance text-heading-2">Let’s make it make sense.</h2>
          </Container>
        </section>
        <div className="h-screen" />
      </div>
    ),
  ],
} satisfies Meta<typeof ClosingMedia>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** The background upload can also be a video — same parallax, moving source. */
export const Video: Story = {
  args: { media: videoFixture },
}
