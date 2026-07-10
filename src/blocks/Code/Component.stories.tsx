import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { CodeBlock } from './Component'

const tsSample = `type Block = {
  blockType: string
  id?: string
}

export const renderBlock = (block: Block) => {
  switch (block.blockType) {
    case 'banner':
      return 'BannerBlock'
    default:
      return null
  }
}`

const cssSample = `.container {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: 1rem;
}`

const meta = {
  title: 'Blocks/Code',
  component: CodeBlock,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    language: {
      control: 'select',
      options: ['typescript', 'javascript', 'css'],
    },
  },
  args: {
    blockType: 'code',
    language: 'typescript',
    code: tsSample,
  },
} satisfies Meta<typeof CodeBlock>

export default meta

type Story = StoryObj<typeof meta>

export const TypeScript: Story = {}

export const CSS: Story = {
  args: {
    language: 'css',
    code: cssSample,
  },
}
