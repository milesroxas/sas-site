import type { CollapsibleField, Field, SelectField } from 'payload'
import { overridesVisible, showOverridesField } from './overrides'

/**
 * Hero fields shared by the website pages that render a Content Hub record
 * (work pages over case studies, lab pages over lab projects). Both present the
 * canonical record with optional website-only overrides on top, so the copy and
 * presentation controls are identical; only the media filter and the layout
 * variants differ per collection.
 */

/** Eyebrow plus the website-only title/summary overrides, behind the reveal toggle. */
export const heroContentCollapsible = (): CollapsibleField => ({
  type: 'collapsible',
  label: 'Content',
  fields: [
    { name: 'eyebrow', type: 'text' },
    showOverridesField(),
    {
      name: 'titleOverride',
      type: 'text',
      admin: {
        description: 'Website-only. Leave empty to use the canonical title.',
        condition: overridesVisible,
      },
    },
    {
      name: 'summaryOverride',
      type: 'textarea',
      admin: {
        description: 'Website-only. Leave empty to use the canonical summary.',
        condition: overridesVisible,
      },
    },
  ],
})

/** Section surface for a hero band. Independent of the visitor's light/dark choice. */
export const heroThemeField = (): SelectField => ({
  name: 'theme',
  type: 'select',
  defaultValue: 'light',
  options: ['light', 'dark', 'neutral', 'brand'],
  admin: {
    description:
      'Section surface within the visitor\'s site theme. Does not force light/dark mode — "dark" is a contrasted band in whichever theme the visitor chose.',
  },
})

/** How the hero media sits in its band. */
export const heroMediaTreatmentField = (): SelectField => ({
  name: 'mediaTreatment',
  type: 'select',
  defaultValue: 'contained',
  options: ['contained', 'full-bleed', 'floating', 'background'],
})

/** The presentation pair that closes a hero's "Media & layout" collapsible. */
export const heroPresentationFields = (): Field[] => [heroThemeField(), heroMediaTreatmentField()]
