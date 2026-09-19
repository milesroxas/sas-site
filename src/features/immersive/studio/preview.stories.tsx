import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { LIGHT_LEAK_EFFECT, STREAK_FIELD_EFFECT } from './effects'
import { StudioPreview } from './preview'
import { emptyRecipe, starterRecipe } from './recipe'

const meta = {
  title: 'Immersive/Studio preview',
  component: StudioPreview,
  args: {
    effect: 'streakField',
    recipe: emptyRecipe(STREAK_FIELD_EFFECT),
    placement: 'hero',
    surface: 'dark',
    paused: true,
    generation: 0,
  },
  decorators: [
    (Story) => (
      <div style={{ height: 500 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof StudioPreview>
export default meta
type Story = StoryObj<typeof meta>
export const Dark: Story = {}
export const Light: Story = { args: { surface: 'light' } }

const leak = { effect: 'lightLeak', paused: false } as const
/** The leak washes over the stage's copy, the way it washes over a page. */
export const LeakDark: Story = { args: { ...leak, recipe: emptyRecipe(LIGHT_LEAK_EFFECT) } }
/** The paper face is derived: an untouched leak is the shipped light-theme look. */
export const LeakLight: Story = { args: { ...LeakDark.args, surface: 'light' } }
export const LeakAmber: Story = {
  args: { ...leak, recipe: starterRecipe(LIGHT_LEAK_EFFECT, 'amber-v1') },
}
