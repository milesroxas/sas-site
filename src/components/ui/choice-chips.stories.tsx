import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ChoiceChip, ChoiceChips } from './choice-chips'

const meta = {
  title: 'UI/ChoiceChips',
  component: ChoiceChips,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Pill answer set for questions whose options are worth reading at once. Native radio / checkbox inputs underneath, so keyboard and screen-reader behaviour is the platform’s.',
      },
    },
  },
  args: {
    name: 'budget',
    type: 'radio',
  },
  decorators: [
    (Story) => (
      <div className="w-140">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ChoiceChips>

export default meta

type Story = StoryObj<typeof meta>

/** Pick one. */
export const Single: Story = {
  args: {
    children: (
      <>
        <ChoiceChip value="under-25k">Under 25K</ChoiceChip>
        <ChoiceChip defaultChecked value="25-50k">
          25–50K
        </ChoiceChip>
        <ChoiceChip value="50-100k">50–100K</ChoiceChip>
        <ChoiceChip value="100k-plus">100K +</ChoiceChip>
        <ChoiceChip value="guidance">Need guidance</ChoiceChip>
      </>
    ),
  },
}

/** Pick any. */
export const Multiple: Story = {
  args: {
    name: 'capabilities',
    type: 'checkbox',
    children: (
      <>
        <ChoiceChip defaultChecked value="brand-expansion">
          Brand Expansion
        </ChoiceChip>
        <ChoiceChip defaultChecked value="web-design">
          Web Design
        </ChoiceChip>
        <ChoiceChip value="web-strategy">Web Strategy</ChoiceChip>
        <ChoiceChip value="website-production">Website Production</ChoiceChip>
        <ChoiceChip value="brand-communications">Brand Communications</ChoiceChip>
        <ChoiceChip value="unsure">Not sure yet</ChoiceChip>
      </>
    ),
  },
}

export const Disabled: Story = {
  args: {
    children: (
      <>
        <ChoiceChip defaultChecked disabled value="asap">
          As soon as possible
        </ChoiceChip>
        <ChoiceChip disabled value="exploring">
          Just exploring
        </ChoiceChip>
      </>
    ),
  },
}
