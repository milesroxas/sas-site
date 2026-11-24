import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { mediaFixture, videoFixture } from '@/blocks/fixtures'
import type { PosterItem } from './item'
import { PosterListSection } from './PosterList.client'

const poster = (
  id: number,
  title: string,
  description: string,
  extra: Partial<PosterItem> = {},
): PosterItem => ({
  id: `p${id}`,
  title,
  facts: ['eClinical Solutions', 'Life sciences'],
  description,
  visual: { kind: 'media', media: mediaFixture },
  href: `/works/${title.toLowerCase().replace(/\s+/g, '-')}`,
  ...extra,
})

/** Worst content on purpose: a long two-line title, a missing picture, a video poster. */
const posters: PosterItem[] = [
  poster(
    1,
    'Making high-integrity software easier to understand',
    'The platform had grown harder to navigate and maintain. We reorganized the website around solutions, giving engineers technical depth while helping decision makers see where to begin.',
    { facts: ['AdaCore', 'Enterprise software'] },
  ),
  poster(
    2,
    'Unifying a clinical technology brand across every channel',
    'An evolving mix of digital, editorial, event and marketing work, held together by one set of patterns.',
    { visual: { kind: 'media', media: videoFixture } },
  ),
  poster(
    3,
    'Making the movement of money visible',
    'Custom illustration and motion around one clear idea.',
    {
      facts: ['Interchecks', 'Fintech'],
    },
  ),
  poster(
    4,
    'Giving dog owners more reason to trust the product',
    'A flexible, SEO-friendly site.',
    {
      facts: ['GentleBeast', 'Consumer tech'],
      visual: null,
    },
  ),
  poster(
    5,
    'Redefining a health brand for a new market',
    'A distinct identity centered on the people in safety-critical roles.',
    {
      facts: ['Vault Workforce Screening', 'HR tech'],
    },
  ),
]

const meta = {
  title: 'Blocks/Lists/PosterList',
  component: PosterListSection,
  parameters: { layout: 'fullscreen' },
  args: {
    eyebrow: 'Why Suits & Sandals',
    heading: 'Hard-to-explain businesses are our specialty.',
    paragraphs: [
      'As companies grow, their story inevitably changes. Companies often outgrow their messaging because the business has become more sophisticated, their focus has pivoted, or they’ve expanded to new markets.',
      'Technical products, specialized services and niche positioning are where we do our best work.',
    ],
    layout: 'stacked',
    items: posters,
  },
} satisfies Meta<typeof PosterListSection>

export default meta
type Story = StoryObj<typeof meta>

/** Copy above the rail. Hover a poster: its description frosts in. */
export const TwoRows: Story = {}

/** Copy in the narrow column, the rail beside it bleeding off the right edge. */
export const SingleRow: Story = { args: { layout: 'row' } }

/** Items an editor wrote, unlinked: no meta line and no action on the veil. */
export const WrittenItems: Story = {
  args: {
    items: posters.slice(0, 4).map((item) => ({ ...item, facts: [], href: null })),
  },
}

export const DarkBand: Story = { args: { layout: 'row', theme: 'inverted' } }
