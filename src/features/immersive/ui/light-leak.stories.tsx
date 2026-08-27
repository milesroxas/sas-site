import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { LIGHT_LEAK_PAPER } from '../presets'
import { LightLeak } from './light-leak'
import { leakExcite } from './light-leak-excite'

/**
 * A film light leak composited over the surface beneath it. Scroll the frame
 * to agitate the emulsion — velocity drives brightness, spectral split and a
 * domain-warp morph — and hover a card (they spread `leakExcite()`) to
 * gather light under the pointer.
 *
 * Every story forces the canvas on: in production the effect renders nothing
 * without a GPU or under `prefers-reduced-motion`.
 */
const meta = {
  title: 'Immersive/LightLeak',
  component: LightLeak,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    force: true,
  },
} satisfies Meta<typeof LightLeak>

export default meta

type Story = StoryObj<typeof meta>

const CARDS = ['Half-open blinds', 'Stained glass, nave', 'Prism on the desk', 'Doorframe, winter']

/**
 * Sample content, in semantic tokens rather than fixed neutrals: the same
 * markup has to read on both grounds, since the point of these stories is what
 * the leak does over each of them.
 */
function Page() {
  return (
    <div className="space-y-8 px-10 py-16">
      <h2 className="max-w-xl text-balance text-heading-2">
        Every leak is the camera failing beautifully.
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {CARDS.map((title) => (
          <div
            key={title}
            {...leakExcite()}
            className="rounded-md border border-border bg-card/60 p-6"
          >
            <p className="text-sm text-card-foreground">{title}</p>
            <div className="mt-4 h-24 rounded-sm bg-linear-to-br from-muted to-accent" />
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * The shipped placement for a page: the leak is fixed over the whole viewport
 * and reads the page scroll, so no `scrollSource` is needed.
 */
export const OverAPage: Story = {
  render: (args) => (
    // isolate: the blend must reach this surface and stop there.
    <div data-theme="dark" className="relative isolate min-h-svh bg-background text-foreground">
      <Page />
      <LightLeak {...args} />
    </div>
  ),
}

/**
 * Section-scoped: the same component confined to one band of the page. It
 * fills its positioned ancestor and stops rendering entirely once that section
 * scrolls out of view.
 */
export const OverASection: Story = {
  render: (args) => (
    <div data-theme="dark" className="min-h-svh bg-background text-foreground">
      <div className="px-10 py-24 text-sm text-muted-foreground">Plain section — no leak here.</div>
      <section className="relative isolate border-y border-border">
        <Page />
        <LightLeak {...args} />
      </section>
      <div className="px-10 py-24 text-sm text-muted-foreground">Plain section — no leak here.</div>
    </div>
  ),
}

/** A cheaper tier: half the dispersion samples, for secondary or small-area usage. */
export const LowerSampleTier: Story = {
  args: {
    samples: 3,
  },
  render: (args) => (
    <div data-theme="dark" className="relative isolate min-h-svh bg-background text-foreground">
      <Page />
      <LightLeak {...args} />
    </div>
  ),
}

/**
 * The light theme's cut of the same effect (`LIGHT_LEAK_PAPER`). A screen-like
 * blend has nothing to add to a white page, so this one multiplies: the leak
 * stops being light striking the film and becomes shade falling across the
 * sheet — one warm grey cast with soft rays in it, tan where the core is,
 * cool nowhere. The slat fan reads as the shadow of the blinds rather than the
 * light through them.
 *
 * This is what the closing band renders whenever the visitor is in light mode.
 */
export const OverPaper: Story = {
  args: LIGHT_LEAK_PAPER,
  render: (args) => (
    <div data-theme="light" className="relative isolate min-h-svh bg-background text-foreground">
      <Page />
      <LightLeak {...args} />
    </div>
  ),
}
