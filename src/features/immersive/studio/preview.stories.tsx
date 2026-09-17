import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { StreakStudioPreview } from './preview'
import { emptyRecipe } from './recipe'

const meta = {
  title: 'Immersive/Streak Studio preview',
  component: StreakStudioPreview,
  args: { recipe: emptyRecipe(), placement: 'hero', surface: 'dark', paused: true, generation: 0 },
  decorators: [
    (Story) => (
      <div style={{ height: 500 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof StreakStudioPreview>
export default meta
type Story = StoryObj<typeof meta>
export const Dark: Story = {}
export const Light: Story = { args: { surface: 'light' } }
