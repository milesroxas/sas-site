import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from './pagination'

const meta = {
  title: 'UI/Pagination',
  component: Pagination,
  subcomponents: {
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
  },
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Pagination>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <Pagination {...args}>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious type="button" />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink type="button">1</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink isActive type="button">
            2
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink type="button">3</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>
        <PaginationItem>
          <PaginationNext type="button" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  ),
}

export const FirstPage: Story = {
  render: (args) => (
    <Pagination {...args}>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious disabled type="button" />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink isActive type="button">
            1
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink type="button">2</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationNext type="button" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  ),
}
