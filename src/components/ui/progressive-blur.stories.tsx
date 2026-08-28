import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { mediaFixture } from '@/blocks/fixtures'
import { Media } from '@/components/Media'
import { ProgressiveBlur } from './progressive-blur'

const meta = {
  title: 'UI/ProgressiveBlur',
  component: ProgressiveBlur,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof ProgressiveBlur>

export default meta

type Story = StoryObj<typeof meta>

const Frame = ({ children }: { children: React.ReactNode }) => (
  <div className="relative aspect-3/2 w-[36rem] max-w-full overflow-hidden rounded-lg">
    <Media fill imgClassName="object-cover" resource={mediaFixture} size="36rem" />
    {children}
  </div>
)

export const BottomEdge: Story = {
  render: (args) => (
    <Frame>
      <ProgressiveBlur {...args} className="absolute inset-x-0 bottom-0 h-1/2" />
    </Frame>
  ),
}

export const WithScrimAndText: Story = {
  render: (args) => (
    <Frame>
      <div className="absolute inset-x-0 bottom-0 px-4 pb-4">
        <div className="relative">
          <ProgressiveBlur {...args} className="absolute inset-x-0 -top-8 bottom-0" />
          <div
            aria-hidden
            className="absolute inset-x-0 -top-8 bottom-0 bg-linear-to-t from-card/85 via-card/40 to-transparent"
          />
          <p className="relative text-xl/snug text-card-foreground">
            Legible title over a progressively blurred backdrop
          </p>
        </div>
      </div>
    </Frame>
  ),
}

export const TopEdge: Story = {
  args: { side: 'top' },
  render: (args) => (
    <Frame>
      <ProgressiveBlur {...args} className="absolute inset-x-0 top-0 h-1/2" />
    </Frame>
  ),
}
