import type { ResolvedFormField } from '@/blocks/shared/form/types'
import {
  INQUIRY_BUDGETS,
  INQUIRY_MESSAGE_MAX_LENGTH,
  INQUIRY_TIMELINES,
  type InquiryOption,
} from '@/shared/content/inquiry'

/**
 * The "Project inquiry" form as the studio ships it, asked in three steps.
 *
 * The seed writes it to Forms and the template story renders it with the
 * capability chips named, so it is stated once and the two can never drift.
 * Once seeded it is content: an editor's changes in Forms win, and re-running
 * the seed puts this back.
 */
export const PROJECT_INQUIRY_FORM_TITLE = 'Project inquiry'

/** Copy for the step walk-through; Continue, Edit and the note keep the group's defaults. */
export const PROJECT_INQUIRY_STEPS = { estimatedTime: 'About two minutes' }

const options = (list: readonly InquiryOption[]) =>
  list.map((entry) => ({ label: entry.label, value: entry.value }))

export const PROJECT_INQUIRY_FIELDS: ResolvedFormField[] = [
  { blockType: 'step', title: 'About you' },
  {
    blockType: 'text',
    name: 'name',
    label: 'Name',
    placeholder: 'Your full name',
    required: true,
    width: 50,
    mapsTo: 'name',
  },
  {
    blockType: 'email',
    name: 'email',
    label: 'Email',
    placeholder: 'you@company.com',
    required: true,
    width: 50,
    mapsTo: 'email',
  },
  {
    blockType: 'text',
    name: 'company',
    label: 'Company (optional)',
    placeholder: 'Where you work',
    width: 50,
    mapsTo: 'company',
  },
  {
    blockType: 'text',
    name: 'website',
    label: 'Current site (optional)',
    placeholder: 'https://',
    width: 50,
    mapsTo: 'website',
  },
  { blockType: 'step', title: 'The work' },
  {
    blockType: 'capabilities',
    name: 'capabilities',
    label: 'What you need',
    hint: 'Select any that apply',
    unsureLabel: 'Not sure yet',
    mapsTo: 'capabilities',
  },
  {
    blockType: 'select',
    name: 'budget',
    label: 'Budget range',
    hint: 'Pick one · USD',
    options: options(INQUIRY_BUDGETS),
    mapsTo: 'budget',
  },
  {
    blockType: 'select',
    name: 'timeline',
    label: 'Timeline',
    hint: 'Pick one',
    options: options(INQUIRY_TIMELINES),
    mapsTo: 'timeline',
  },
  { blockType: 'step', title: 'The brief' },
  {
    blockType: 'textarea',
    name: 'brief',
    label: 'What are you trying to move?',
    placeholder: 'A launch, a rebrand, a site that stopped keeping up. A paragraph is plenty.',
    required: true,
    maxLength: INQUIRY_MESSAGE_MAX_LENGTH,
    mapsTo: 'message',
  },
]
