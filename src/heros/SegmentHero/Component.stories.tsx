import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { heroImageFixture, videoFixture } from '@/blocks/fixtures'
import { FooterBar } from '@/Footer/FooterBar'
import { HeaderClient } from '@/Header/Component.client'
import type { Header } from '@/payload-types'
import { ChromeThemeProvider } from '@/providers/ChromeTheme'
import { SegmentHero } from './index'

const headerData: Header = {
  id: 1,
  navItems: [],
  cta: { label: 'Get in touch', link: { type: 'custom', url: '/contact', newTab: false } },
}
const menuContent = { expertise: [], audiences: [], works: [], pageMedia: {} }

const meta = {
  title: 'Heroes/Segment',
  component: SegmentHero,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    eyebrow: 'Who We Help',
    title: 'B2B branding for technical and expert-led companies',
    lead: 'Make your expertise easier to understand. And easier to choose.',
    description:
      'We help technical companies and expert-led firms turn complex offerings into clear positioning, distinctive brands, and digital experiences built for confident decisions.',
    media: heroImageFixture,
    links: [
      { link: { type: 'custom', url: '/contact', label: 'Primary Action' } },
      { link: { type: 'custom', url: '/works', label: 'Secondary Action' } },
    ],
  },
} satisfies Meta<typeof SegmentHero>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Video: Story = {
  args: { media: videoFixture },
}

export const NoActions: Story = {
  args: { links: [] },
}

export const NoLead: Story = {
  args: { lead: null },
}

/**
 * The hero inside the site chrome, as the page renders it: the band pulls
 * under the fixed header and runs under the fixed footer, both bars pinned
 * to its palette with their plates lifted. Scroll past the band to watch the
 * footer, then the header, settle back onto the site theme.
 */
export const WithSiteChrome: Story = {
  render: (args) => (
    <ChromeThemeProvider>
      <HeaderClient data={headerData} menuContent={menuContent} />
      <div
        data-page-frame
        className="flex min-h-svh flex-col bg-background pt-(--header-height) pb-(--footer-height)"
      >
        <SegmentHero {...args} />
        <section className="container py-24">
          <p className="max-w-prose text-lead text-muted-foreground">
            Page content below the band. The bars are back on the site theme once the band has
            scrolled out from under them.
          </p>
        </section>
      </div>
      <FooterBar>
        <div className="container flex h-full items-center justify-center">
          <span className="text-sm font-black tracking-[0.58em] uppercase">Get In Touch</span>
        </div>
      </FooterBar>
    </ChromeThemeProvider>
  ),
}
