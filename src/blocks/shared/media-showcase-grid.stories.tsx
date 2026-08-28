import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { mediaFixture, paragraph, richText, text, videoFixture } from '@/blocks/fixtures'
import { Section, type SectionTheme } from '@/blocks/shared/section'
import type { Media as MediaDoc } from '@/payload-types'
import { MediaShowcaseGrid } from './media-showcase-grid'

const caption = (copy: string) => richText(paragraph(text(copy)))

const media: MediaDoc[] = [
  {
    ...mediaFixture,
    id: 1,
    credit: 'Studio still',
    caption: caption('Opening frame from the brand film.'),
  },
  {
    ...videoFixture,
    id: 2,
    credit: 'Motion study',
  },
  {
    ...mediaFixture,
    id: 3,
    credit: 'Photography — Jordan Avery',
    caption: caption('Detail of the interface in context.'),
  },
  {
    ...mediaFixture,
    id: 4,
    credit: 'Studio still',
    caption: caption('Wide lockup across the product surface.'),
  },
]

/**
 * Mirrors the case-study / lab renderer chrome (Section + heading + grid).
 * Theme lives on the band, not on the grid.
 */
const MediaShowcasePreview = ({
  layout = 'grid',
  media,
  showCaptions = true,
  showCredits = true,
  theme = 'light',
}: {
  layout?: string | null
  media: MediaDoc[]
  showCaptions?: boolean | null
  showCredits?: boolean | null
  theme?: SectionTheme | null
}) => (
  <Section spacing="loose" theme={theme}>
    <div className="container mx-auto">
      <h2 className="mb-6 text-heading-2">Selected frames</h2>
      <MediaShowcaseGrid
        layout={layout}
        media={media}
        showCaptions={showCaptions}
        showCredits={showCredits}
      />
    </div>
  </Section>
)

const meta = {
  title: 'Blocks/MediaShowcase',
  component: MediaShowcasePreview,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    layout: {
      control: 'select',
      options: ['single', 'grid', 'horizontal', 'stacked', 'full-bleed', 'comparison'],
    },
  },
  args: {
    layout: 'grid',
    media,
    showCaptions: true,
    showCredits: true,
    theme: 'light',
  },
} satisfies Meta<typeof MediaShowcasePreview>

export default meta

type Story = StoryObj<typeof meta>

export const Grid: Story = {}

export const Horizontal: Story = {
  args: { layout: 'horizontal' },
}

/**
 * `single`, `stacked`, `full-bleed`, and `comparison` are CMS options; only
 * `grid` and `horizontal` currently change the grid classes.
 */
export const Single: Story = {
  args: { layout: 'single' },
}

export const Stacked: Story = {
  args: { layout: 'stacked' },
}

export const FullBleed: Story = {
  args: { layout: 'full-bleed' },
}

export const Comparison: Story = {
  args: { layout: 'comparison' },
}

export const WithoutCaptions: Story = {
  args: { showCaptions: false },
}

export const WithoutCredits: Story = {
  args: { showCredits: false },
}

export const Dark: Story = {
  args: { theme: 'dark' },
}

export const Brand: Story = {
  args: { theme: 'brand' },
}
