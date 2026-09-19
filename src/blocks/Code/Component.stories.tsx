import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { CodeBlock } from './Component'
import { CODE_LANGUAGES } from './config'

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

const glslSample = `// Curl of an fbm potential: a divergence-free swirl along the contours.
vec2 curl(vec2 p) {
  float e = 0.01;
  float dx = fbm(p + vec2(e, 0.0)) - fbm(p - vec2(e, 0.0));
  float dy = fbm(p + vec2(0.0, e)) - fbm(p - vec2(0.0, e));
  return vec2(dy, -dx) / (2.0 * e);
}`

const shellSample = `pnpm cms:upload ./shots/studio-inspector.png \\
  --alt "The Studio inspector with the relief group open"`

const meta = {
  title: 'Blocks/Code',
  component: CodeBlock,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    language: {
      control: 'select',
      options: CODE_LANGUAGES.map((language) => language.value),
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

/** `glsl` and `bash` are registered on top of the highlighter's bundled grammars (`prism-languages.ts`). */
export const GLSL: Story = {
  args: {
    language: 'glsl',
    code: glslSample,
  },
}

export const Shell: Story = {
  args: {
    language: 'bash',
    code: shellSample,
  },
}
