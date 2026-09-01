import type { Condition, Field, GroupField, Tab } from 'payload'
import { linkGroup } from '@/fields/linkGroup'
import { showOverridesField } from '@/fields/overrides'

/**
 * Footer global is the canonical closing band. Pages inherit it, can hide it,
 * and can override individual fields — content is never copied between records.
 */

const FOOTER_FALLBACK = ' Leave empty to use the Footer global.'

/** True unless the editor has hidden the band. Unset (existing docs) counts as shown. */
export const closingVisible: Condition = (_, siblingData) => siblingData?.hidden !== true

/** Override fields: band is shown and the editor has revealed the override group. */
export const closingOverridesVisible: Condition = (_, siblingData) =>
  siblingData?.hidden !== true && Boolean(siblingData?.showOverrides)

type ClosingContentOptions = {
  asOverride?: boolean
  condition?: Condition
}

/**
 * Copy, links, ask panel, and media for the closing band. Footer stores these
 * as the default; page-level Closing tabs reuse them as `*Override` fields.
 */
export const closingContentFields = ({
  asOverride = false,
  condition,
}: ClosingContentOptions = {}): Field[] => {
  const name = (base: string) => (asOverride ? `${base}Override` : base)
  const note = asOverride ? FOOTER_FALLBACK : ''
  const admin = (description: string) => ({
    description: `${description}${note}`,
    ...(condition ? { condition } : {}),
  })

  return [
    {
      name: name('eyebrow'),
      type: 'text',
      label: 'Eyebrow',
      admin: admin('Short kicker above the heading, e.g. “Ready to start?”'),
    },
    {
      name: name('heading'),
      type: 'text',
      label: 'Heading',
      admin: admin('Closing statement over the background media.'),
    },
    linkGroup({
      overrides: {
        name: name('links'),
        label: 'Links',
        maxRows: 2,
        // Versioned expertise/audience tables overflow Postgres's 63-char
        // identifier limit: enum names are `enum_` + table + `_link_site_page`
        // (and `_link_appearance`). `_cl_links` still overruns; `_cl` fits.
        ...(asOverride ? { dbName: ({ tableName }) => `${tableName}_cl` } : {}),
        admin: {
          description: `Call-to-action buttons under the heading, up to two.${note}`,
          initCollapsed: true,
          ...(condition ? { condition } : {}),
        },
      },
    }),
    {
      name: name('ask'),
      type: 'group',
      label: 'Ask panel',
      admin: {
        description: `Intro copy above the “Ask anything” composer in the right-hand panel.${note}`,
        ...(condition ? { condition } : {}),
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          admin: {
            description: `Panel lead-in, e.g. “A homepage can only tell you so much…”${note}`,
          },
        },
        {
          name: 'body',
          type: 'textarea',
          admin: {
            description: `Supporting copy between the lead-in and the composer.${note}`,
          },
        },
      ],
    },
    {
      name: name('media'),
      type: 'upload',
      label: 'Media',
      relationTo: 'media',
      admin: admin(
        'Background image or video. Optional — without one the band renders on the plain dark surface.',
      ),
    },
  ]
}

/** Page-level closing: shown by default, inheriting Footer, with optional overrides. */
export const pageClosingField = (): GroupField => ({
  name: 'closing',
  type: 'group',
  interfaceName: 'PageClosing',
  label: false,
  fields: [
    {
      name: 'hidden',
      type: 'checkbox',
      defaultValue: false,
      label: 'Hide closing section',
      admin: {
        description:
          'Turn on to omit the closing band on this page. The Footer global is unchanged; saved overrides are kept.',
      },
    },
    {
      ...showOverridesField(),
      admin: {
        description:
          'Reveal fields to override the Footer global on this page only. Saved overrides still apply while hidden.',
        condition: closingVisible,
      },
    },
    ...closingContentFields({ asOverride: true, condition: closingOverridesVisible }),
  ],
})

/** Unnamed tab — label can change without a schema rename. Place before SEO. */
export const closingTab = (): Tab => ({
  label: 'Closing',
  description:
    'The full-screen band above the footer bar. Uses the Footer global unless you hide or override it here.',
  fields: [pageClosingField()],
})
