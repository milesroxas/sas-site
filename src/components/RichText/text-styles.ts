import type { TextStateFeature } from '@payloadcms/richtext-lexical'
import { eyebrowClassName } from '@/blocks/shared/typography'

type AdminCss = NonNullable<Parameters<typeof TextStateFeature>[0]>['state'][string][string]['css']

/**
 * Text styles the content-column editor (`fields/contentLexical.ts`) offers
 * from its toolbar. Lexical's TextStateFeature stores the chosen style on the
 * text node under one state key, so the styles are mutually exclusive and the
 * body JSON carries a name, never CSS.
 *
 * Stated once: the label the editor sees, the classes the site renders
 * (`RichText`'s text and paragraph converters), and the approximation the
 * admin paints while editing (the admin has none of the site's tokens, so
 * that preview is only a hint of the treatment).
 *
 * A paragraph whose text all carries one style renders as that style at the
 * paragraph level, so its line-height and the flow rhythm around it track
 * the style; a mixed run falls back to inline spans.
 */
export const TEXT_STYLE_STATE_KEY = 'style'

export const TEXT_STYLES = {
  eyebrow: {
    label: 'Eyebrow',
    className: eyebrowClassName,
    adminCss: {
      'font-family': 'var(--font-mono, monospace)',
      'font-size': '0.75rem',
      'font-weight': '500',
    },
  },
  small: {
    label: 'Small',
    className: 'text-sm',
    adminCss: { 'font-size': '0.875em' },
  },
} as const satisfies Record<string, { adminCss: AdminCss; className: string; label: string }>

export type TextStyle = keyof typeof TEXT_STYLES

export const isTextStyle = (value: unknown): value is TextStyle =>
  typeof value === 'string' && Object.hasOwn(TEXT_STYLES, value)

/** The TextStateFeature `state` entry for these styles, keyed by `TEXT_STYLE_STATE_KEY`. */
export const textStyleState = () =>
  Object.fromEntries(
    Object.entries(TEXT_STYLES).map(([key, { adminCss, label }]) => [
      key,
      { css: adminCss, label },
    ]),
  )
