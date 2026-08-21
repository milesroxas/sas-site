import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { CustomCursorProvider } from './CustomCursorProvider'
import { cursorTarget } from './variants'

/**
 * Move the pointer toward a card: the rings materialize with proximity,
 * lock on hover, and the mono label appears under the outer ring. The
 * effect renders only for fine pointers with no reduced-motion preference.
 */
const meta = {
  title: 'Features/CustomCursor',
  component: CustomCursorProvider,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof CustomCursorProvider>

export default meta

type Story = StoryObj<typeof meta>

// Targets style their own proximity response from `var(--cursor-proximity, 0)`
// — the provider only publishes the value (contract in ./variants.ts).
const cardClassName =
  'grid w-64 gap-3 rounded-md bg-[rgb(255_255_255/calc(8%_+_4%_*_var(--cursor-proximity,0)))] p-4 shadow-[inset_0_0_0_0.5px_rgb(255_255_255/calc(16%_+_8%_*_var(--cursor-proximity,0)))] backdrop-blur-md scale-[calc(1_+_0.02_*_var(--cursor-proximity,0))]'

export const Emphasize: Story = {
  args: { children: null },
  render: () => (
    <CustomCursorProvider>
      <div
        className="flex min-h-svh flex-col items-center justify-center gap-16 bg-neutral-950 p-12 text-white"
        data-theme="dark"
      >
        <div
          {...cursorTarget({ variant: 'emphasize', label: 'Read post' })}
          className={cardClassName}
        >
          <span className="font-mono text-xs text-white/70">Insights</span>
          <p className="text-sm leading-relaxed">
            Beyond the logo: brand systems that scale with the work.
          </p>
        </div>
        <div
          {...cursorTarget({ variant: 'emphasize', label: 'View work' })}
          className={cardClassName}
        >
          <span className="font-mono text-xs text-white/70">Case study</span>
          <p className="text-sm leading-relaxed">A second target — rings hand off between them.</p>
        </div>
        <p className="max-w-sm text-center text-xs text-white/50">
          Elements without <code>cursorTarget</code> props leave the cursor alone.
        </p>
      </div>
    </CustomCursorProvider>
  ),
}

export const RingsOnly: Story = {
  args: { children: null },
  render: () => (
    <CustomCursorProvider>
      <div className="flex min-h-svh items-center justify-center bg-neutral-100 p-12">
        <div
          {...cursorTarget({ variant: 'emphasize' })}
          className="rounded-md border border-neutral-300 bg-white p-8 text-sm text-neutral-900 scale-[calc(1_+_0.02_*_var(--cursor-proximity,0))]"
        >
          No label passed — rings only, on a light surface (mix-blend-difference).
        </div>
      </div>
    </CustomCursorProvider>
  ),
}
