import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useRef, useState } from 'react'
import type { Header as HeaderType } from '@/payload-types'
import { createChat } from '@/shared/testing/shadcn-helpers/ai-sdk'
import type { MenuContent } from '../getMenuContent'
import { TakeoverMenu } from './index'

/**
 * The full takeover: click MENU to watch the page dock into the preview
 * window while the columns cascade in; submit the Ask pill to watch the
 * media→transcript swap (in-frame GSAP clip-path wipe + message
 * entrances). GSAP runs for real against the fake page frame below — no
 * Payload, and the chat runs on a scripted transport, so no /api/ask and no
 * OpenAI usage.
 */
const headerData: HeaderType = {
  id: 1,
  navItems: [
    { id: 'n1', link: { type: 'custom', label: 'Case Studies', url: '/works', newTab: false } },
    { id: 'n2', link: { type: 'custom', label: 'Immersive Lab', url: '/lab', newTab: false } },
    { id: 'n3', link: { type: 'custom', label: 'Insights', url: '/insights', newTab: false } },
    { id: 'n4', link: { type: 'custom', label: 'About Us', url: '/about', newTab: false } },
  ],
}

/** Fixture hero gradients (not UI): distinct colors make the hover dissolve legible. */
const fixtureHero = (from: string, to: string, accent: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs><rect width="1600" height="900" fill="url(#g)"/><circle cx="1180" cy="280" r="190" fill="${accent}" opacity="0.85"/></svg>`,
  )}`

const heroMediaSrc = fixtureHero('#1e3a5f', '#7c3aed', '#f59e0b')
const hoverMedia = (src: string) => ({ url: src, mime: 'image/svg+xml' })

const menuContent: MenuContent = {
  expertise: [
    {
      title: 'Clarifying Complex Stories',
      href: '/expertise/clarifying-complex-stories',
      media: hoverMedia(fixtureHero('#14532d', '#0ea5e9', '#f43f5e')),
    },
    {
      title: 'Website Strategy, UX & Development',
      href: '/expertise/website-strategy',
      media: hoverMedia(fixtureHero('#7f1d1d', '#f59e0b', '#22d3ee')),
    },
    { title: 'Product UX/UI & Design Systems', href: '/expertise/product-ux', media: null },
    {
      title: 'Sales, Marketing & Investor Communications',
      href: '/expertise/sales-marketing',
      media: hoverMedia(fixtureHero('#312e81', '#db2777', '#a3e635')),
    },
    {
      title: 'Embedded Creative & Digital Services',
      href: '/expertise/embedded-creative',
      media: null,
    },
  ],
  audiences: [
    {
      title: 'Technical B2B & Expert-Led Companies',
      href: '/who-we-help/technical-b2b',
      media: hoverMedia(fixtureHero('#0c4a6e', '#65a30d', '#fb923c')),
    },
    { title: 'Healthtech & Life Sciences', href: '/who-we-help/healthtech', media: null },
    { title: 'Platforms & Digital Products', href: '/who-we-help/platforms', media: null },
    { title: 'Growth & Repositioning Brands', href: '/who-we-help/growth', media: null },
  ],
  works: [
    {
      title: 'Trialbee Hive',
      href: '/works/trialbee-hive',
      eyebrow: 'Healthcare',
      media: hoverMedia(fixtureHero('#3b0764', '#0d9488', '#fde047')),
    },
    {
      title: 'Adacore',
      href: '/works/adacore',
      eyebrow: 'Enterprise Software',
      media: hoverMedia(fixtureHero('#450a0a', '#1d4ed8', '#4ade80')),
    },
    {
      title: 'Vault Workforce Screening',
      href: '/works/vault',
      eyebrow: 'Industrial Manufacturing',
      media: null,
    },
  ],
  pageMedia: {
    '/works': hoverMedia(fixtureHero('#052e16', '#9333ea', '#fbbf24')),
    '/about': hoverMedia(fixtureHero('#78350f', '#0891b2', '#e879f9')),
  },
}

/**
 * Multi-turn scripted answers so repeated submits keep exercising the swap,
 * the Thinking shimmer, and the per-message entrances.
 */
const scriptedAsk = createChat()
  .assistant(({ writer }) => {
    writer
      .sourceUrl({
        sourceId: '/posts/beyond-the-logo',
        title: 'Beyond the logo: brand systems that scale',
        url: '/posts/beyond-the-logo',
      })
      .text(
        'Suits & Sandals focuses on brand strategy, identity systems, and web design for growing companies — "Beyond the logo" walks through how the identity work scales past launch.',
      )
  })
  .assistant(({ writer }) => {
    writer.text(
      'Close the menu and reopen it to watch the transcript hand the window back to the page preview — the exit is a faster sink than the enter.',
    )
  })

function TakeoverMenuDemo() {
  const [open, setOpen] = useState(false)
  const menuButtonRef = useRef<HTMLButtonElement>(null)

  return (
    <>
      {/* Stand-in for the (frontend)/layout.tsx page frame the menu docks. */}
      <div data-page-frame className="relative min-h-svh bg-background text-foreground">
        {/* Marked like a real hero — the menu clones this into its dissolve layer. */}
        <div data-hero-media className="absolute inset-x-0 top-0 h-svh overflow-hidden">
          {/* biome-ignore lint/performance/noImgElement: the menu clones the raw img/video inside data-hero-media (HERO_MEDIA_SELECTOR); a next/image wrapper isn't what production heros render in Storybook */}
          <img src={heroMediaSrc} alt="" className="size-full object-cover opacity-30" />
        </div>
        <div className="container relative flex min-h-svh flex-col justify-center gap-6 py-24">
          <p className="font-mono text-xs text-muted-foreground">Fake page frame</p>
          <h1 className="max-w-2xl font-heading text-5xl font-medium tracking-tight">
            This whole page docks into the menu&rsquo;s preview window.
          </h1>
          <p className="max-w-xl text-muted-foreground">
            Open the menu to watch the frame scale and clip onto the center slot, then submit the
            Ask pill to swap the window for the transcript.
          </p>
        </div>
      </div>
      <div
        data-site-footer
        className="fixed inset-x-0 bottom-0 flex h-14 items-center justify-center bg-background"
      >
        <span className="text-sm font-black tracking-[0.58em] uppercase">Get In Touch</span>
      </div>

      <button
        ref={menuButtonRef}
        type="button"
        aria-expanded={open}
        aria-controls="site-menu"
        onClick={() => setOpen((v) => !v)}
        className="fixed top-4 right-4 z-50 text-sm font-black tracking-[0.58em]"
      >
        {open ? 'CLOSE' : 'MENU'}
      </button>

      <TakeoverMenu
        data={headerData}
        menuContent={menuContent}
        open={open}
        onClose={() => setOpen(false)}
        menuButtonRef={menuButtonRef}
        askTransport={scriptedAsk.transport({
          fallback: 'End of the scripted demo — reload the story to start over.',
        })}
      />
    </>
  )
}

const meta = {
  title: 'Features/TakeoverMenu',
  component: TakeoverMenu,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof TakeoverMenu>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  // Args satisfy the meta type; the demo wrapper owns the real state.
  args: {
    data: headerData,
    menuContent,
    open: false,
    onClose: () => {},
    menuButtonRef: { current: null },
  },
  render: () => <TakeoverMenuDemo />,
}
