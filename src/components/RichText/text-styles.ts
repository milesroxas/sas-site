import type { CSSProperties } from 'react'
import { eyebrowClassName } from '@/blocks/shared/typography'

/**
 * Text styles the content-column editor (`fields/contentLexical.ts`) offers
 * from its format dropdown (`fields/lexical/textStyle`). The chosen style is
 * stored on the text node as Lexical node state under one key, so the styles
 * are mutually exclusive and the body JSON carries a name, never CSS.
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
      fontFamily: 'var(--font-mono, monospace)',
      fontSize: '0.75rem',
      fontWeight: 500,
    },
  },
  small: {
    label: 'Small',
    className: 'text-sm',
    adminCss: { fontSize: '0.875em' },
  },
} as const satisfies Record<string, { adminCss: CSSProperties; className: string; label: string }>

export type TextStyle = keyof typeof TEXT_STYLES

export const isTextStyle = (value: unknown): value is TextStyle =>
  typeof value === 'string' && Object.hasOwn(TEXT_STYLES, value)
