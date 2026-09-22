import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { INITIAL_VIEWPORTS } from 'storybook/viewport'
import { Section, type SectionTheme } from '@/blocks/shared/section'
import { FOOTER_CLOSING_ARTICLE_CLASS } from '@/Footer/Closing/curtain'
import { ContentsButton } from './ContentsButton'

const LAB_SECTIONS = [
  'Introduction',
  'Why',
  'Three tries',
  'How it works',
  'Posters and fallbacks',
  'Results',
]

const LONG_SECTIONS = Array.from(
  { length: 24 },
  (_, index) => `Chapter ${index + 1}: a heading long enough to meet the edge of the card`,
)

/**
 * The button reads the page, so the story is a page: a hero it stays hidden
 * over, an article of `h2` sections (the third on a dark band, to show the
 * surface follow it), and the closing band it leaves for. Scroll to drive it.
 * `--footer-height` stands in for the site chrome the story does not mount.
 */
const Page = ({ sections }: { sections: string[] }) => (
  <div className="[--footer-height:3.5rem] [--header-height:4rem]">
    <article className={FOOTER_CLOSING_ARTICLE_CLASS}>
      <Section className="flex min-h-svh items-end" theme="dark">
        <div className="container">
          <h1 className="text-display">Payload CMS Shader Plugin</h1>
        </div>
      </Section>
      {sections.map((title, index) => {
        const theme: SectionTheme = index === 2 ? 'dark' : 'light'
        return (
          <Section key={title} theme={theme}>
            <div className="container flex min-h-[70svh] flex-col gap-6">
              <h2 className="max-w-xl text-heading-2 text-balance">{title}</h2>
              <p className="max-w-xl text-lead text-muted-foreground">
                Our content-rich pages needed more life than a wall of text, so we built the Streak
                Field, a GPU particle shader designed with performance at the forefront.
              </p>
            </div>
          </Section>
        )
      })}
      <ContentsButton />
    </article>
    <div className="flex min-h-svh items-center justify-center bg-tertiary text-tertiary-foreground">
      <p className="text-heading-3">Closing band</p>
    </div>
  </div>
)

const meta = {
  title: 'Features/ContentsButton',
  component: Page,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    sections: LAB_SECTIONS,
  },
} satisfies Meta<typeof Page>

export default meta

type Story = StoryObj<typeof meta>

/** Desktop: the card grows out of the button. */
export const Default: Story = {}

/** Below `md`: the same index as a floating sheet, dragged down by its handle. */
export const Phone: Story = {
  parameters: {
    viewport: { options: INITIAL_VIEWPORTS },
  },
  globals: {
    viewport: { value: 'iphone12', isRotated: false },
  },
}

/** More sections than the card can hold: the list scrolls inside the scroll area. */
export const LongIndex: Story = {
  args: { sections: LONG_SECTIONS },
}

/** Fewer than three section headings: the button never renders. */
export const TooShort: Story = {
  args: { sections: LAB_SECTIONS.slice(0, 2) },
}
