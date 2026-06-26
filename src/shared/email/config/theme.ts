import type { TailwindConfig } from 'react-email'

/**
 * Shared email design tokens (FSD: **shared**).
 *
 * Ported from React Email's `01-Barebone` theme. Reusable by every email template.
 * Implemented with native Tailwind `fontSize` tuples instead of a `tailwindcss/plugin` so it
 * stays decoupled from the app's Tailwind v4 toolchain. Sizes are in `px` because email clients
 * don't support `rem`.
 */

export const emailColors = {
  bg: '#FFFFFF',
  'bg-2': '#F3F4F6',
  fg: '#14171E',
  'fg-2': '#43454B',
  'fg-3': '#7B7D81',
  'fg-inverted': '#FFFFFF',
  stroke: '#F0F0F0',
  'stroke-strong': '#E4E4E7',
  brand: '#614500',
}

type FontToken = [string, { lineHeight: string; letterSpacing?: string; fontWeight: string }]

/**
 * Typographic scale as Tailwind `fontSize` tuples — each token carries its own weight + tracking.
 * Consume as `text-11`, `text-13`, `text-16`, `text-28`, …
 */
const fontSize: Record<string, FontToken> = {
  11: ['11px', { lineHeight: '1.5', letterSpacing: '-0.033px', fontWeight: '420' }],
  13: ['13px', { lineHeight: '1.5', letterSpacing: '-0.039px', fontWeight: '420' }],
  14: ['14px', { lineHeight: '1.5', fontWeight: '450' }],
  16: ['16px', { lineHeight: '1.5', letterSpacing: '-0.048px', fontWeight: '420' }],
  24: ['24px', { lineHeight: '1', letterSpacing: '-0.084px', fontWeight: '600' }],
  28: ['28px', { lineHeight: '1.3', letterSpacing: '-0.084px', fontWeight: '600' }],
  32: ['32px', { lineHeight: '1.25', letterSpacing: '-0.64px', fontWeight: '600' }],
  40: ['40px', { lineHeight: '1.1', letterSpacing: '-0.8px', fontWeight: '600' }],
}

export const emailTailwindConfig: TailwindConfig = {
  theme: {
    extend: {
      colors: emailColors,
      fontSize,
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Arial', 'sans-serif'],
      },
    },
  },
}
