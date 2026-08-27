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

/**
 * Vertical padding of a composition band. Adjacent shells add, so the
 * space between two blocks' content is 2× this.
 *
 * Text-only bands keep the default. Media-forward blocks use the looser
 * rhythm so neighboring images don't crowd — never restate these at a call
 * site.
 */
export const sectionYClassName = 'py-16 md:py-24'
export const mediaSectionYClassName = 'py-36 md:py-52'

/**
 * Full-viewport band used by composition blocks that center one section of
 * content. Owned here so GSAP `ScrollReveal` shells and plain sections share
 * the same height/padding — never restate these classes at a call site.
 */
export const fullViewportSectionClassName =
  'flex min-h-[calc(100svh-var(--footer-height))] flex-col justify-center overflow-clip py-16 md:py-24'

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
  <section className={cn(sectionYClassName, themeClasses[theme || 'light'], className)}>
    {children}
  </section>
)
