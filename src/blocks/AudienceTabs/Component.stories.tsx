import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import type { Media } from '@/payload-types'
import { AudienceTabsBlock } from './Component'

// Live homepage media (production CMS media doc 24), served from the R2 CDN
// so the story plays the same asset as the deployed audienceTabs block.
const windowLandscapeVideo: Media = {
  id: 24,
  usageStatus: 'public-approved',
  alt: 'Window Landscape Mountains',
  url: 'https://media.suits-sandals.com/window-landscape-mountains.mp4',
  filename: 'window-landscape-mountains.mp4',
  mimeType: 'video/mp4',
  filesize: 606952,
  poster: {
    id: 23,
    usageStatus: 'public-approved',
    alt: 'Window Landscape Mountains poster',
    url: 'https://media.suits-sandals.com/window-landscape-mountains-poster.jpg',
    filename: 'window-landscape-mountains-poster.jpg',
    mimeType: 'image/jpeg',
    createdAt: '2026-08-05T20:24:55.097Z',
    updatedAt: '2026-08-05T20:24:55.097Z',
  },
  createdAt: '2026-08-05T20:25:41.560Z',
  updatedAt: '2026-08-05T20:25:42.146Z',
}

const meta = {
  title: 'Blocks/AudienceTabs',
  component: AudienceTabsBlock,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    blockType: 'audienceTabs',
    heading: 'Creative support for complex brands and the teams behind them.',
    tabs: [
      {
        id: 'executives',
        title: 'Executives & Founders',
        intro: 'Build a brand for the business you’re becoming.',
        description:
          'Strategic clarity first, then the identity and communications to carry it forward.',
        items: [
          {
            id: 'i1',
            text: 'For founders, CEOs, and leadership teams, brand problems are often business-direction problems in disguise. We help clarify where the company is going, what it should be known for, and how the brand, website, and communications need to evolve to support that next stage.',
          },
          { id: 'i2', text: "Define the company's position" },
          { id: 'i3', text: 'Align leadership around a shared story' },
          { id: 'i4', text: 'Reframe the brand for new audiences or markets' },
          { id: 'i5', text: 'Modernize the identity, website, and communications' },
          { id: 'i6', text: 'Build a clearer foundation for growth' },
        ],
        media: windowLandscapeVideo,
      },
      {
        id: 'marketing',
        title: 'Marketing & Communications',
        intro: 'Keep the brand clear across every channel.',
        items: [
          {
            id: 'i1',
            text: 'We help marketing and communications teams translate strategy into the materials, templates, campaigns, and content systems that keep a brand consistent across real-world execution.',
          },
          { id: 'i2', text: 'Turn complex ideas into clear audience-facing messages' },
          { id: 'i3', text: 'Create collateral for sales, marketing, events, and campaigns' },
          { id: 'i4', text: 'Develop reusable templates and communication systems' },
          { id: 'i5', text: 'Keep websites, decks, reports, and content aligned' },
          { id: 'i6', text: 'Add ongoing creative support when internal capacity is stretched' },
        ],
        media: windowLandscapeVideo,
      },
      {
        id: 'product',
        title: 'Product & Digital Teams',
        intro: 'Make complex digital experiences easier to use.',
        description: 'UX, design systems, and platforms that live up to the brand promise.',
        items: [
          {
            id: 'i1',
            text: 'We help product and digital teams make sure the experience people use actually reflects the value the brand promises. From product UX/UI to design systems and digital platforms, we create clearer, more coherent experiences for complex organizations.',
          },
          { id: 'i2', text: 'Translate product value into clearer user experiences' },
          { id: 'i3', text: 'Improve navigation, workflows, and interface structure' },
          { id: 'i4', text: 'Build reusable components and product design systems' },
          { id: 'i5', text: 'Bring greater consistency across websites, portals, and platforms' },
          { id: 'i6', text: 'Collaborate with internal product, marketing, and engineering teams' },
        ],
        media: windowLandscapeVideo,
      },
      {
        id: 'sales',
        title: 'Sales & Investor Communications',
        intro: 'Create clearer tools for high-stakes conversations.',
        items: [
          {
            id: 'i1',
            text: 'We help sales and growth teams turn complex offerings into clear, persuasive materials for prospects, partners, investors, and internal decision-makers.',
          },
          { id: 'i2', text: 'Create sales decks, capability decks, and pitch materials' },
          { id: 'i3', text: 'Clarify product, service, and opportunity narratives' },
          { id: 'i4', text: 'Design case studies, fact sheets, and leave-behind materials' },
          { id: 'i5', text: 'Support partnership, fundraising, and executive presentations' },
          { id: 'i6', text: 'Give teams reusable tools for future conversations' },
        ],
        media: windowLandscapeVideo,
      },
    ],
    theme: 'light',
  },
} satisfies Meta<typeof AudienceTabsBlock>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const DarkTheme: Story = {
  args: { theme: 'dark' },
}

export const TwoTabs: Story = {
  args: { tabs: meta.args.tabs.slice(0, 2) },
}
