import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis } from 'recharts'
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from './chart'

/**
 * The shadcn chart primitive: a themed Recharts container plus tooltip and
 * legend content. Site figures do not compose this by hand; they go through
 * the one code-owned renderer (`features/figures/ui/chart`), which is where
 * the mark rules live. These stories cover the primitive on its own.
 */
const data = [
  { month: 'Jun', desktop: 186, mobile: 80 },
  { month: 'Jul', desktop: 305, mobile: 200 },
  { month: 'Aug', desktop: 237, mobile: 120 },
  { month: 'Sep', desktop: 273, mobile: 190 },
]

const config = {
  desktop: { label: 'Desktop', color: 'var(--figure-1)' },
  mobile: { label: 'Mobile', color: 'var(--figure-2)' },
} satisfies ChartConfig

const meta = {
  title: 'UI/Chart',
  component: ChartContainer,
  parameters: { layout: 'centered' },
  args: { config, children: <BarChart /> },
  decorators: [
    (Story) => (
      <div className="w-lg">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ChartContainer>

export default meta

type Story = StoryObj<typeof meta>

export const Bars: Story = {
  render: (args) => (
    <ChartContainer {...args}>
      <BarChart accessibilityLayer data={data}>
        <CartesianGrid vertical={false} />
        <XAxis axisLine={false} dataKey="month" tickLine={false} tickMargin={8} />
        <ChartTooltip content={<ChartTooltipContent />} isAnimationActive={false} />
        <Bar dataKey="desktop" fill="var(--color-desktop)" radius={[4, 4, 0, 0]} />
        <Bar dataKey="mobile" fill="var(--color-mobile)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartContainer>
  ),
}

/** `valueFormatter` prints the tooltip's numbers: a percent, a unit, a compact figure. */
export const LinesWithFormattedTooltip: Story = {
  render: (args) => (
    <ChartContainer {...args}>
      <LineChart accessibilityLayer data={data}>
        <CartesianGrid vertical={false} />
        <XAxis axisLine={false} dataKey="month" tickLine={false} tickMargin={8} />
        <ChartTooltip
          content={
            <ChartTooltipContent indicator="line" valueFormatter={(value) => `${value} visits`} />
          }
          isAnimationActive={false}
        />
        <Line dataKey="desktop" dot={false} stroke="var(--color-desktop)" strokeWidth={2} />
        <Line dataKey="mobile" dot={false} stroke="var(--color-mobile)" strokeWidth={2} />
      </LineChart>
    </ChartContainer>
  ),
}
