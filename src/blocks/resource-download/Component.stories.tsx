import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { resourceFixture } from '@/blocks/fixtures'
import { ResourceDownload } from './Component'
import { ResourceDownloadSection } from './Section'

const meta = {
  title: 'Blocks/Download',
  component: ResourceDownload,
  parameters: {
    layout: 'padded',
  },
  args: {
    resource: resourceFixture,
  },
} satisfies Meta<typeof ResourceDownload>

export default meta

type Story = StoryObj<typeof meta>

/** The post body's measure: below 32rem the button stacks under the copy. */
export const InArticle: Story = {
  decorators: [
    (Story) => (
      <div className="max-w-md">
        <Story />
      </div>
    ),
  ],
}

/** From a 32rem container the copy and the button share a row. */
export const Wide: Story = {
  decorators: [
    (Story) => (
      <div className="max-w-2xl">
        <Story />
      </div>
    ),
  ],
}

/** Block copy overrides the resource's own title, description and label. */
export const WithOverrides: Story = {
  ...Wide,
  args: {
    buttonLabel: 'Get the workbook',
    description: 'The exercises from this article, laid out to print and fill in by hand.',
    heading: 'Work through it on paper',
  },
}

/** A file with no description: the card closes on the title. */
export const NoDescription: Story = {
  ...Wide,
  args: {
    resource: {
      ...resourceFixture,
      description: null,
      filename: 'carbon-signal-tokens.zip',
      filesize: 38_400_000,
      mimeType: 'application/zip',
      title: 'Carbon Signal token files',
      url: 'https://media.suits-sandals.com/resources/carbon-signal-tokens.zip',
    },
  },
}

/** Lab composition: the card on the grid's reading column, columns 3-6. */
export const OnTheGrid: Story = {
  parameters: { layout: 'fullscreen' },
  render: (args) => <ResourceDownloadSection {...args} />,
}
