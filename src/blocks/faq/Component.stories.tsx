import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { paragraph, richText, text } from '../fixtures'
import { FaqBlock } from './Component'

const answer = (copy: string) => richText(paragraph(text(copy)))

/** The six questions on the Paper frame, in reading order. */
const items = [
  {
    id: 'start',
    question: 'How does an engagement usually start?',
    answer: answer(
      'With a conversation, not a proposal. On the first call we work out what you are trying to change and whether we are the right studio for it. Within a few days you get a short note back with the approach, the team, and the cost.',
    ),
  },
  {
    id: 'cost',
    question: 'What does a typical project cost?',
    answer: answer(
      'Most engagements land between a focused positioning sprint and a full brand and website program. The note after the first call carries a number, not a range.',
    ),
  },
  {
    id: 'team',
    question: 'Who will we actually be working with?',
    answer: answer(
      'The people on the call are the people on the work. We do not hand projects down to a second team once the contract is signed.',
    ),
  },
  {
    id: 'in-house',
    question: 'Can you work alongside our in-house team?',
    answer: answer(
      'Yes. Most of our clients have marketing, product, or engineering teams of their own, and the work is shaped so it can be carried forward without us.',
    ),
  },
  {
    id: 'remote',
    question: 'Do you work with teams outside the US?',
    answer: answer(
      'We do. Working sessions are scheduled across time zones and every deliverable is built to be reviewed asynchronously.',
    ),
  },
  {
    id: 'launch',
    question: 'What happens after launch?',
    answer: answer(
      'A short handover period covers training, documentation, and the first round of fixes. After that you can keep us on a retainer or take it from here.',
    ),
  },
]

const meta = {
  title: 'Blocks/Interactive/FAQ',
  component: FaqBlock,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    blockType: 'faq',
    eyebrow: 'Questions',
    heading: 'Things people ask before they hire us',
    items,
    enableLink: true,
    prompt: 'Did not find your answer?',
    link: { type: 'custom', url: '/contact', label: 'Ask us directly' },
    theme: 'light',
  },
} satisfies Meta<typeof FaqBlock>

export default meta

type Story = StoryObj<typeof meta>

/** The Paper frame: six questions, three per column, the first one open. */
export const Default: Story = {}

/** Contact link off: the heading cluster keeps the row to itself. */
export const WithoutContact: Story = {
  args: { enableLink: false },
}

/** An odd count splits three and two; numbering keeps running down the second column. */
export const FiveQuestions: Story = {
  args: { items: items.slice(0, 5) },
}

/** One question fills the first column only. */
export const SingleQuestion: Story = {
  args: { items: items.slice(0, 1) },
}

export const Dark: Story = {
  args: { theme: 'dark' },
}
