import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { VisualMotionToggle } from './motion-toggle'

/**
 * Pause and resume for sustained automatic motion. One switch for the
 * document, kept for the session; every live Streak Field parks while it is
 * on. Hidden under `prefers-reduced-motion`.
 */
const meta = {
  title: 'Immersive/VisualMotionToggle',
  component: VisualMotionToggle,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof VisualMotionToggle>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
