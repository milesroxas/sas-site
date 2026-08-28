import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { mediaFixture, videoFixture } from '@/blocks/fixtures'
import { Section } from '@/blocks/shared/section'
import { ScrollGalleryClient, type ScrollGalleryEntry } from './Component.client'

const entry = (
  id: number,
  mood: ScrollGalleryEntry['mood'],
  media = mediaFixture,
): ScrollGalleryEntry => ({
  id: String(id),
  media: { ...media, id },
  mood,
})

const entries: ScrollGalleryEntry[] = [
  entry(1, { background: '#fbe8cd', blob1: '#ffd56d', blob2: '#5d816a' }),
  entry(2, { background: '#101418', blob1: '#2f5d8a', blob2: '#8a2f5d' }, videoFixture),
  entry(3, { background: '#1c1a17', blob1: '#c47a3a', blob2: '#3a5cc4' }),
  entry(4, {}),
]

/**
 * The gallery's pinned shell: scroll the frame to dolly through the planes.
 * The canvas gates on GPU + motion preference like production; in a headless
 * Chromatic capture it renders the DOM fallback.
 */
const meta = {
  title: 'Blocks/ScrollGallery',
  component: ScrollGalleryClient,
  parameters: {
    layout: 'fullscreen',
  },
  // Mirror the server block's frame: dark section band, no vertical padding
  // (the pinned client shell owns viewport sizing), scroll room after the pin.
  decorators: [
    (Story) => (
      <div className="bg-background">
        <div className="h-[40svh]" />
        <Section spacing="none" theme="dark">
          <Story />
        </Section>
        <div className="h-svh" />
      </div>
    ),
  ],
  args: {
    eyebrow: 'Gallery',
    heading: 'Scroll through the work in depth.',
    entries,
  },
} satisfies Meta<typeof ScrollGalleryClient>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithoutCopy: Story = {
  args: { eyebrow: null, heading: null },
}

export const TwoItems: Story = {
  args: { entries: entries.slice(0, 2) },
}
