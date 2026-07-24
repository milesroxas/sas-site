import type { ReactNode } from 'react'
import { cn } from '@/utilities/ui'

/**
 * Block surface themes. Values are semantic tokens that follow the visitor's
 * site theme (html[data-theme]) — they never force an absolute light/dark mode.
 *
 * - light: default page surface
 * - dark: contrasted band within the active theme (tertiary; always low-luminance)
 * - neutral: secondary/muted surface
 * - brand: brand accent surface
 *
 * `dark` surfaces are low-luminance in both site themes, so rich text needs
 * `prose-invert` even when the site itself is in light mode (site-level
 * `dark:prose-invert` only applies under html[data-theme=dark]).
 */
export const themeClasses = {
  light: 'bg-background text-foreground',
  dark: [
    'bg-tertiary text-tertiary-foreground',
    '[--background:var(--tertiary)] [--foreground:var(--tertiary-foreground)]',
    '[&_.payload-richtext]:prose-invert',
  ].join(' '),
  neutral: 'bg-secondary text-secondary-foreground',
  brand: 'bg-brand text-brand-foreground',
} as const

export type SectionTheme = keyof typeof themeClasses

/** Shared vertical-rhythm + theme wrapper used across block families. */
export const Section = ({
  children,
  theme = 'light',
  className,
}: {
  children: ReactNode
  theme?: SectionTheme | null
  className?: string
}) => (
  <section className={cn('py-16 md:py-24', themeClasses[theme || 'light'], className)}>
    {children}
  </section>
)
