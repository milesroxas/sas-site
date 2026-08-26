import type { Meta, StoryObj } from '@storybook/nextjs-vite'
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
            className="rounded-md border border-neutral-800 bg-neutral-900/60 p-6"
          >
            <p className="text-sm text-neutral-300">{title}</p>
            <div className="mt-4 h-24 rounded-sm bg-linear-to-br from-neutral-800 to-neutral-950" />
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
    <div data-theme="dark" className="relative isolate min-h-svh bg-neutral-950 text-neutral-100">
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
    <div data-theme="dark" className="min-h-svh bg-neutral-950 text-neutral-100">
      <div className="px-10 py-24 text-sm text-neutral-500">Plain section — no leak here.</div>
      <section className="relative isolate border-y border-neutral-800">
        <Page />
        <LightLeak {...args} />
      </section>
      <div className="px-10 py-24 text-sm text-neutral-500">Plain section — no leak here.</div>
    </div>
  ),
}

/** A cheaper tier: half the dispersion samples, for secondary or small-area usage. */
export const LowerSampleTier: Story = {
  args: {
    samples: 3,
  },
  render: (args) => (
    <div data-theme="dark" className="relative isolate min-h-svh bg-neutral-950 text-neutral-100">
      <Page />
      <LightLeak {...args} />
    </div>
  ),
}
