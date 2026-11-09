import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { resourceFixture } from '@/blocks/fixtures'
import { ResourceDownload, ResourceDownloadTitleBlock } from './Component'
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

/**
 * The post's side rail as the page sets it (`posts/[slug]/page.tsx`): the
 * post title under its full-ink rule, then the post's Primary resource a step
 * below. The rail column is about 280px at a 1280px viewport.
 */
export const InTheRail: Story = {
  render: (args) => (
    <aside className="w-70 border-t border-foreground py-3">
      <p className="font-mono text-xs leading-normal">Designing in layers: the token stack</p>
      <ResourceDownloadTitleBlock className="mt-12" location="download_rail" {...args} />
    </aside>
  ),
}

/** A primary resource with no description: the rail closes on the title. */
export const InTheRailNoDescription: Story = {
  ...InTheRail,
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

/** An editor's own button label: it truncates before the type and size do. */
export const InTheRailCustomLabel: Story = {
  ...InTheRail,
  args: {
    buttonLabel: 'Get the printable workbook and worksheets',
  },
}

/**
 * Below `lg` the post page has no rail: the same title block closes the
 * article (`posts/[slug]/page.tsx`), full width on a phone, a block's width
 * from `sm`, and the description unclamped.
 */
export const EndOfArticle: Story = {
  parameters: { layout: 'fullscreen' },
  render: (args) => (
    <div className="px-4 py-12">
      <div className="border-t border-foreground py-3">
        <p className="text-base/relaxed">
          The last paragraph of the article sits here, and the post&apos;s primary resource follows
          it.
        </p>
        <ResourceDownloadTitleBlock
          className="mt-12 sm:max-w-sm lg:hidden"
          location="download"
          {...args}
        />
      </div>
    </div>
  ),
}
